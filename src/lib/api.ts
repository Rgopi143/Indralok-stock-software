import { StoreConfig, Product, Salesman, User, Bill, AuditLog } from '../types';
import {
  initialStoreConfig,
  initialProducts,
  initialSalesmen,
  initialUsers,
  generateInitialBills,
} from '../data/initialData';

function getLocalDb() {
  const stored = localStorage.getItem('pos_db');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore parse error
    }
  }
  return {
    store: initialStoreConfig,
    products: initialProducts,
    salesmen: initialSalesmen,
    users: initialUsers,
    bills: generateInitialBills(),
    auditLogs: [],
  };
}

function saveLocalDb(db: any) {
  localStorage.setItem('pos_db', JSON.stringify(db));
}

async function fetchJson<T>(url: string, options?: RequestInit, fallbackHandler?: () => T): Promise<T> {
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!res.ok) {
      if ((res.status === 404 || res.status === 502 || res.status === 500) && fallbackHandler) {
        return fallbackHandler();
      }
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Request failed with status ${res.status}`);
    }
    return await res.json();
  } catch (err: any) {
    if (fallbackHandler && (err.message?.includes('404') || err.name === 'TypeError' || err.message?.includes('Failed to fetch'))) {
      return fallbackHandler();
    }
    throw err;
  }
}

export const api = {
  // Store Config
  getStoreConfig: () =>
    fetchJson<StoreConfig>('/api/store', undefined, () => getLocalDb().store),

  updateStoreConfig: (config: Partial<StoreConfig> & { updatedByUserId?: string; updatedByUserName?: string }) =>
    fetchJson<StoreConfig>(
      '/api/store',
      {
        method: 'PUT',
        body: JSON.stringify(config),
      },
      () => {
        const db = getLocalDb();
        db.store = { ...db.store, ...config };
        saveLocalDb(db);
        return db.store;
      }
    ),

  // Products
  getProducts: () =>
    fetchJson<Product[]>('/api/products', undefined, () => getLocalDb().products),

  createProduct: (product: Omit<Product, 'id' | 'createdAt'>) =>
    fetchJson<Product>(
      '/api/products',
      {
        method: 'POST',
        body: JSON.stringify(product),
      },
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
    ),

  updateProduct: (id: string, product: Partial<Product>) =>
    fetchJson<Product>(
      `/api/products/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(product),
      },
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
    ),

  deleteProduct: (id: string) =>
    fetchJson<{ success: boolean }>(
      `/api/products/${id}`,
      {
        method: 'DELETE',
      },
      () => {
        const db = getLocalDb();
        db.products = db.products.filter((p: Product) => p.id !== id);
        saveLocalDb(db);
        return { success: true };
      }
    ),

  // Salesmen
  getSalesmen: () =>
    fetchJson<Salesman[]>('/api/salesmen', undefined, () => getLocalDb().salesmen),

  createSalesman: (salesman: Omit<Salesman, 'id' | 'createdAt'>) =>
    fetchJson<Salesman>(
      '/api/salesmen',
      {
        method: 'POST',
        body: JSON.stringify(salesman),
      },
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
    ),

  updateSalesman: (id: string, salesman: Partial<Salesman>) =>
    fetchJson<Salesman>(
      `/api/salesmen/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(salesman),
      },
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
    ),

  // Users
  getUsers: () =>
    fetchJson<User[]>('/api/users', undefined, () => getLocalDb().users),

  createUser: (user: Omit<User, 'id' | 'createdAt'>) =>
    fetchJson<User>(
      '/api/users',
      {
        method: 'POST',
        body: JSON.stringify(user),
      },
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
    ),

  updateUser: (id: string, user: Partial<User>) =>
    fetchJson<User>(
      `/api/users/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(user),
      },
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
    ),

  // Bills
  getBills: (params?: { search?: string; startDate?: string; endDate?: string; salesmanId?: string; paymentMethod?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    if (params?.salesmanId) query.append('salesmanId', params.salesmanId);
    if (params?.paymentMethod) query.append('paymentMethod', params.paymentMethod);
    return fetchJson<Bill[]>(`/api/bills?${query.toString()}`, undefined, () => getLocalDb().bills);
  },

  getBillById: (id: string) =>
    fetchJson<Bill>(`/api/bills/${id}`, undefined, () => {
      const db = getLocalDb();
      return db.bills.find((b: Bill) => b.id === id);
    }),

  createBill: (bill: Partial<Bill>) =>
    fetchJson<Bill>(
      '/api/bills',
      {
        method: 'POST',
        body: JSON.stringify(bill),
      },
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
    ),

  // Logs
  getAuditLogs: () =>
    fetchJson<AuditLog[]>('/api/logs', undefined, () => getLocalDb().auditLogs),

  // Backup & Restore
  downloadBackupUrl: '/api/backup',
  restoreDatabase: (data: unknown) =>
    fetchJson<{ success: boolean; message: string }>(
      '/api/restore',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      () => {
        saveLocalDb(data);
        return { success: true, message: 'Database restored successfully' };
      }
    ),

  resetDatabase: () =>
    fetchJson<{ success: boolean; message: string }>(
      '/api/reset',
      {
        method: 'POST',
      },
      () => {
        localStorage.removeItem('pos_db');
        return { success: true, message: 'Database reset to demo state' };
      }
    ),
};
