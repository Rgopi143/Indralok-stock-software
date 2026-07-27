import { StoreConfig, Product, Salesman, User, Bill, AuditLog } from '../types';
import {
  initialStoreConfig,
  initialProducts,
  initialSalesmen,
  initialUsers,
  generateInitialBills,
} from '../data/initialData';
import { firestoreApi } from './firestore';

function getLocalDb() {
  let db: any = {};
  const stored = localStorage.getItem('pos_db');
  if (stored) {
    try {
      db = JSON.parse(stored);
    } catch {
      db = {};
    }
  }
  return {
    store: db.store || initialStoreConfig,
    products: Array.isArray(db.products) ? db.products : initialProducts,
    salesmen: Array.isArray(db.salesmen) ? db.salesmen : initialSalesmen,
    users: Array.isArray(db.users) ? db.users : initialUsers,
    bills: Array.isArray(db.bills) ? db.bills : generateInitialBills(),
    auditLogs: Array.isArray(db.auditLogs) ? db.auditLogs : [],
  };
}

function saveLocalDb(db: any) {
  localStorage.setItem('pos_db', JSON.stringify(db));
}

async function fetchJson<T>(url: string, options?: RequestInit, fallbackHandler?: () => T): Promise<T> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });

    const text = await res.text();
    let data: any = null;
    if (text && text.trim().length > 0) {
      try {
        data = JSON.parse(text);
      } catch {
        // Body was non-JSON (e.g. HTML error page)
      }
    }

    if (!res.ok) {
      if (data && data.error) {
        const valErr = new Error(data.error);
        (valErr as any).isValidationError = true;
        throw valErr;
      }
      if (fallbackHandler) {
        return fallbackHandler();
      }
      throw new Error(`Request failed with status ${res.status}`);
    }

    if (data !== null) {
      return data as T;
    }

    if (fallbackHandler) {
      return fallbackHandler();
    }

    return {} as T;
  } catch (err: any) {
    if (err?.isValidationError) {
      throw err;
    }
    if (fallbackHandler) {
      return fallbackHandler();
    }
    throw err;
  }
}

export const api = {
  // Store Config
  getStoreConfig: async (): Promise<StoreConfig> => {
    try {
      return await firestoreApi.getStoreConfig();
    } catch {
      return fetchJson<StoreConfig>('/api/store', undefined, () => getLocalDb().store);
    }
  },

  updateStoreConfig: async (
    config: Partial<StoreConfig> & { updatedByUserId?: string; updatedByUserName?: string }
  ): Promise<StoreConfig> => {
    try {
      return await firestoreApi.updateStoreConfig(config);
    } catch {
      return fetchJson<StoreConfig>(
        '/api/store',
        { method: 'PUT', body: JSON.stringify(config) },
        () => {
          const db = getLocalDb();
          db.store = { ...db.store, ...config };
          saveLocalDb(db);
          return db.store;
        }
      );
    }
  },

  // Products
  getProducts: async (): Promise<Product[]> => {
    try {
      return await firestoreApi.getProducts();
    } catch {
      return fetchJson<Product[]>('/api/products', undefined, () => getLocalDb().products);
    }
  },

  createProduct: async (product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> => {
    try {
      return await firestoreApi.createProduct(product);
    } catch (err: any) {
      if (err?.message?.includes('already assigned')) {
        throw err;
      }
      return fetchJson<Product>(
        '/api/products',
        { method: 'POST', body: JSON.stringify(product) },
        () => {
          const db = getLocalDb();
          const newProd: Product = {
            ...product,
            id: `prod_${Date.now()}`,
            createdAt: new Date().toISOString(),
          };
          db.products.push(newProd);
          saveLocalDb(db);
          return newProd;
        }
      );
    }
  },

  updateProduct: async (id: string, product: Partial<Product>): Promise<Product> => {
    try {
      return await firestoreApi.updateProduct(id, product);
    } catch (err: any) {
      if (err?.message?.includes('belongs to')) {
        throw err;
      }
      return fetchJson<Product>(
        `/api/products/${id}`,
        { method: 'PUT', body: JSON.stringify(product) },
        () => {
          const db = getLocalDb();
          const idx = db.products.findIndex((p: Product) => p.id === id);
          if (idx !== -1) {
            db.products[idx] = { ...db.products[idx], ...product };
            saveLocalDb(db);
            return db.products[idx];
          }
          return product as Product;
        }
      );
    }
  },

  deleteProduct: async (id: string): Promise<{ success: boolean }> => {
    try {
      return await firestoreApi.deleteProduct(id);
    } catch {
      return fetchJson<{ success: boolean }>(
        `/api/products/${id}`,
        { method: 'DELETE' },
        () => {
          const db = getLocalDb();
          db.products = db.products.filter((p: Product) => p.id !== id);
          saveLocalDb(db);
          return { success: true };
        }
      );
    }
  },

  // Salesmen
  getSalesmen: async (): Promise<Salesman[]> => {
    try {
      return await firestoreApi.getSalesmen();
    } catch {
      return fetchJson<Salesman[]>('/api/salesmen', undefined, () => getLocalDb().salesmen);
    }
  },

  createSalesman: async (salesman: Omit<Salesman, 'id' | 'createdAt'>): Promise<Salesman> => {
    try {
      return await firestoreApi.createSalesman(salesman);
    } catch {
      return fetchJson<Salesman>(
        '/api/salesmen',
        { method: 'POST', body: JSON.stringify(salesman) },
        () => {
          const db = getLocalDb();
          const newSls: Salesman = {
            ...salesman,
            id: `sls_${Date.now()}`,
            createdAt: new Date().toISOString(),
          };
          db.salesmen.push(newSls);
          saveLocalDb(db);
          return newSls;
        }
      );
    }
  },

  updateSalesman: async (id: string, salesman: Partial<Salesman>): Promise<Salesman> => {
    try {
      return await firestoreApi.updateSalesman(id, salesman);
    } catch {
      return fetchJson<Salesman>(
        `/api/salesmen/${id}`,
        { method: 'PUT', body: JSON.stringify(salesman) },
        () => {
          const db = getLocalDb();
          const idx = db.salesmen.findIndex((s: Salesman) => s.id === id);
          if (idx !== -1) {
            db.salesmen[idx] = { ...db.salesmen[idx], ...salesman };
            saveLocalDb(db);
            return db.salesmen[idx];
          }
          return salesman as Salesman;
        }
      );
    }
  },

  // Users
  getUsers: async (): Promise<User[]> => {
    try {
      return await firestoreApi.getUsers();
    } catch {
      return fetchJson<User[]>('/api/users', undefined, () => getLocalDb().users);
    }
  },

  createUser: async (user: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
    try {
      return await firestoreApi.createUser(user);
    } catch (err: any) {
      if (err?.message?.includes('already exists')) {
        throw err;
      }
      return fetchJson<User>(
        '/api/users',
        { method: 'POST', body: JSON.stringify(user) },
        () => {
          const db = getLocalDb();
          const existing = db.users.find((u: User) => u.username.toLowerCase() === user.username.toLowerCase());
          if (existing) {
            throw new Error('Username already exists');
          }
          const newUser: User = {
            ...user,
            id: `usr_${Date.now()}`,
            createdAt: new Date().toISOString(),
          };
          db.users.push(newUser);
          saveLocalDb(db);
          return newUser;
        }
      );
    }
  },

  updateUser: async (id: string, user: Partial<User>): Promise<User> => {
    try {
      return await firestoreApi.updateUser(id, user);
    } catch {
      return fetchJson<User>(
        `/api/users/${id}`,
        { method: 'PUT', body: JSON.stringify(user) },
        () => {
          const db = getLocalDb();
          const idx = db.users.findIndex((u: User) => u.id === id);
          if (idx !== -1) {
            db.users[idx] = { ...db.users[idx], ...user };
            saveLocalDb(db);
            return db.users[idx];
          }
          return user as User;
        }
      );
    }
  },

  // Bills
  getBills: async (params?: { search?: string; startDate?: string; endDate?: string; salesmanId?: string; paymentMethod?: string }): Promise<Bill[]> => {
    try {
      let filtered = await firestoreApi.getBills();
      if (params?.search) {
        const q = String(params.search).toLowerCase();
        filtered = filtered.filter(
          b =>
            b.billNumber.toLowerCase().includes(q) ||
            (b.customerName && b.customerName.toLowerCase().includes(q)) ||
            (b.customerPhone && b.customerPhone.includes(q)) ||
            b.salesmanName.toLowerCase().includes(q)
        );
      }
      if (params?.salesmanId) {
        filtered = filtered.filter(b => b.salesmanId === params.salesmanId);
      }
      if (params?.paymentMethod) {
        filtered = filtered.filter(b => b.paymentMethod === params.paymentMethod);
      }
      return filtered;
    } catch {
      const query = new URLSearchParams();
      if (params?.search) query.append('search', params.search);
      if (params?.startDate) query.append('startDate', params.startDate);
      if (params?.endDate) query.append('endDate', params.endDate);
      if (params?.salesmanId) query.append('salesmanId', params.salesmanId);
      if (params?.paymentMethod) query.append('paymentMethod', params.paymentMethod);
      return fetchJson<Bill[]>(`/api/bills?${query.toString()}`, undefined, () => getLocalDb().bills);
    }
  },

  getBillById: async (id: string): Promise<Bill | undefined> => {
    try {
      const bills = await firestoreApi.getBills();
      return bills.find(b => b.id === id || b.billNumber === id);
    } catch {
      return fetchJson<Bill>(`/api/bills/${id}`, undefined, () => {
        const db = getLocalDb();
        return db.bills.find((b: Bill) => b.id === id);
      });
    }
  },

  createBill: async (bill: Partial<Bill>): Promise<Bill> => {
    try {
      return await firestoreApi.createBill(bill);
    } catch {
      return fetchJson<Bill>(
        '/api/bills',
        { method: 'POST', body: JSON.stringify(bill) },
        () => {
          const db = getLocalDb();
          const newBill: Bill = {
            ...bill,
            id: `bill_${Date.now()}`,
            billNumber: bill.billNumber || `INV-${String(db.bills.length + 1).padStart(4, '0')}`,
            date: bill.date || new Date().toISOString(),
          } as Bill;
          db.bills.unshift(newBill);
          saveLocalDb(db);
          return newBill;
        }
      );
    }
  },

  // Audit Logs
  getAuditLogs: async (): Promise<AuditLog[]> => {
    try {
      return await firestoreApi.getAuditLogs();
    } catch {
      return fetchJson<AuditLog[]>('/api/logs', undefined, () => getLocalDb().auditLogs);
    }
  },

  // Backup & Restore
  downloadBackupUrl: '/api/backup',
  restoreDatabase: (data: unknown) =>
    fetchJson<{ success: boolean; message: string }>(
      '/api/restore',
      { method: 'POST', body: JSON.stringify(data) },
      () => {
        saveLocalDb(data);
        return { success: true, message: 'Database restored successfully' };
      }
    ),

  resetDatabase: () =>
    fetchJson<{ success: boolean; message: string }>(
      '/api/reset',
      { method: 'POST' },
      () => {
        localStorage.removeItem('pos_db');
        return { success: true, message: 'Database reset to demo state' };
      }
    ),
};
