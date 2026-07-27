import {
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import { StoreConfig, Product, Salesman, User, Bill, AuditLog } from '../types';
import {
  initialStoreConfig,
  initialProducts,
  initialSalesmen,
  initialUsers,
  generateInitialBills,
} from '../data/initialData';

// Firebase Firestore Collections
const COLS = {
  STORE: 'store_config',
  PRODUCTS: 'products',
  SALESMEN: 'salesmen',
  USERS: 'users',
  BILLS: 'bills',
  LOGS: 'audit_logs',
};

export const firestoreApi = {
  // Store Config
  getStoreConfig: async (): Promise<StoreConfig> => {
    const docRef = doc(db, COLS.STORE, 'main');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as StoreConfig;
    }
    await setDoc(docRef, initialStoreConfig);
    return initialStoreConfig;
  },

  updateStoreConfig: async (
    config: Partial<StoreConfig> & { updatedByUserId?: string; updatedByUserName?: string }
  ): Promise<StoreConfig> => {
    const current = await firestoreApi.getStoreConfig();
    const updated = { ...current, ...config };
    await setDoc(doc(db, COLS.STORE, 'main'), updated, { merge: true });
    return updated;
  },

  // Products
  getProducts: async (): Promise<Product[]> => {
    const snap = await getDocs(collection(db, COLS.PRODUCTS));
    if (snap.empty) {
      const list: Product[] = [];
      for (const p of initialProducts) {
        await setDoc(doc(db, COLS.PRODUCTS, p.id), p);
        list.push(p);
      }
      return list;
    }
    const products: Product[] = [];
    snap.forEach((d) => products.push(d.data() as Product));
    return products;
  },

  createProduct: async (product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> => {
    const existing = await getDocs(
      query(collection(db, COLS.PRODUCTS), where('barcode', '==', product.barcode))
    );
    if (!existing.empty) {
      const existingDoc = existing.docs[0].data() as Product;
      throw new Error(`Barcode '${product.barcode}' is already assigned to product '${existingDoc.name}'`);
    }

    const newId = `prd_${Date.now()}`;
    const newProduct: Product = {
      ...product,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, COLS.PRODUCTS, newId), newProduct);
    return newProduct;
  },

  updateProduct: async (id: string, product: Partial<Product>): Promise<Product> => {
    if (product.barcode) {
      const existing = await getDocs(
        query(collection(db, COLS.PRODUCTS), where('barcode', '==', product.barcode))
      );
      const other = existing.docs.find((d) => d.id !== id);
      if (other) {
        const existingDoc = other.data() as Product;
        throw new Error(`Barcode '${product.barcode}' belongs to '${existingDoc.name}'`);
      }
    }

    const docRef = doc(db, COLS.PRODUCTS, id);
    const snap = await getDoc(docRef);
    const updated = {
      ...(snap.data() || {}),
      ...product,
      updatedAt: new Date().toISOString(),
    } as Product;
    await setDoc(docRef, updated, { merge: true });
    return updated;
  },

  deleteProduct: async (id: string): Promise<{ success: boolean }> => {
    await deleteDoc(doc(db, COLS.PRODUCTS, id));
    return { success: true };
  },

  // Salesmen
  getSalesmen: async (): Promise<Salesman[]> => {
    const snap = await getDocs(collection(db, COLS.SALESMEN));
    if (snap.empty) {
      const list: Salesman[] = [];
      for (const s of initialSalesmen) {
        await setDoc(doc(db, COLS.SALESMEN, s.id), s);
        list.push(s);
      }
      return list;
    }
    const list: Salesman[] = [];
    snap.forEach((d) => list.push(d.data() as Salesman));
    return list;
  },

  createSalesman: async (salesman: Omit<Salesman, 'id' | 'createdAt'>): Promise<Salesman> => {
    const newId = `sls_${Date.now()}`;
    const newSalesman: Salesman = {
      ...salesman,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, COLS.SALESMEN, newId), newSalesman);
    return newSalesman;
  },

  updateSalesman: async (id: string, salesman: Partial<Salesman>): Promise<Salesman> => {
    const docRef = doc(db, COLS.SALESMEN, id);
    const snap = await getDoc(docRef);
    const updated = { ...(snap.data() || {}), ...salesman } as Salesman;
    await setDoc(docRef, updated, { merge: true });
    return updated;
  },

  // Users
  getUsers: async (): Promise<User[]> => {
    const snap = await getDocs(collection(db, COLS.USERS));
    if (snap.empty) {
      const list: User[] = [];
      for (const u of initialUsers) {
        await setDoc(doc(db, COLS.USERS, u.id), u);
        list.push(u);
      }
      return list;
    }
    const list: User[] = [];
    snap.forEach((d) => list.push(d.data() as User));
    return list;
  },

  createUser: async (user: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
    const snap = await getDocs(collection(db, COLS.USERS));
    let exists = false;
    snap.forEach((d) => {
      const u = d.data() as User;
      if (u.username.toLowerCase() === user.username.toLowerCase()) {
        exists = true;
      }
    });
    if (exists) {
      throw new Error('Username already exists');
    }

    const newId = `usr_${Date.now()}`;
    const newUser: User = {
      ...user,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, COLS.USERS, newId), newUser);
    return newUser;
  },

  updateUser: async (id: string, user: Partial<User>): Promise<User> => {
    const docRef = doc(db, COLS.USERS, id);
    const snap = await getDoc(docRef);
    const updated = { ...(snap.data() || {}), ...user } as User;
    await setDoc(docRef, updated, { merge: true });
    return updated;
  },

  // Bills
  getBills: async (): Promise<Bill[]> => {
    const snap = await getDocs(collection(db, COLS.BILLS));
    if (snap.empty) {
      const initBills = generateInitialBills();
      for (const b of initBills) {
        await setDoc(doc(db, COLS.BILLS, b.id), b);
      }
      return initBills;
    }
    const list: Bill[] = [];
    snap.forEach((d) => list.push(d.data() as Bill));
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  createBill: async (bill: Partial<Bill>): Promise<Bill> => {
    const count = (await firestoreApi.getBills()).length + 101;
    const year = new Date().getFullYear();
    const billNumber = bill.billNumber || `INV-${year}-${String(count).padStart(4, '0')}`;
    const newId = `bill_${Date.now()}`;

    const newBill: Bill = {
      ...bill,
      id: newId,
      billNumber,
      date: bill.date || new Date().toISOString(),
      createdAt: new Date().toISOString(),
    } as Bill;

    await setDoc(doc(db, COLS.BILLS, newId), newBill);

    if (Array.isArray(newBill.items)) {
      for (const item of newBill.items) {
        try {
          const prods = await firestoreApi.getProducts();
          const target = prods.find(p => p.id === item.productId || p.barcode === item.barcode);
          if (target) {
            const currentQty = target.stockQuantity ?? 20;
            const newQty = Math.max(0, currentQty - item.quantity);
            await firestoreApi.updateProduct(target.id, { stockQuantity: newQty });
          }
        } catch {
          // Ignore individual item stock update errors
        }
      }
    }

    return newBill;
  },

  // Audit Logs
  getAuditLogs: async (): Promise<AuditLog[]> => {
    const snap = await getDocs(collection(db, COLS.LOGS));
    const list: AuditLog[] = [];
    snap.forEach((d) => list.push(d.data() as AuditLog));
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },
};
