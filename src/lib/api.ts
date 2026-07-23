import { StoreConfig, Product, Salesman, User, Bill, AuditLog } from '../types';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Store Config
  getStoreConfig: () => fetchJson<StoreConfig>('/api/store'),
  updateStoreConfig: (config: Partial<StoreConfig> & { updatedByUserId?: string; updatedByUserName?: string }) =>
    fetchJson<StoreConfig>('/api/store', {
      method: 'PUT',
      body: JSON.stringify(config),
    }),

  // Products
  getProducts: () => fetchJson<Product[]>('/api/products'),
  createProduct: (product: Omit<Product, 'id' | 'createdAt'>) =>
    fetchJson<Product>('/api/products', {
      method: 'POST',
      body: JSON.stringify(product),
    }),
  updateProduct: (id: string, product: Partial<Product>) =>
    fetchJson<Product>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    }),
  deleteProduct: (id: string) =>
    fetchJson<{ success: boolean }>(`/api/products/${id}`, {
      method: 'DELETE',
    }),

  // Salesmen
  getSalesmen: () => fetchJson<Salesman[]>('/api/salesmen'),
  createSalesman: (salesman: Omit<Salesman, 'id' | 'createdAt'>) =>
    fetchJson<Salesman>('/api/salesmen', {
      method: 'POST',
      body: JSON.stringify(salesman),
    }),
  updateSalesman: (id: string, salesman: Partial<Salesman>) =>
    fetchJson<Salesman>(`/api/salesmen/${id}`, {
      method: 'PUT',
      body: JSON.stringify(salesman),
    }),

  // Users
  getUsers: () => fetchJson<User[]>('/api/users'),
  createUser: (user: Omit<User, 'id' | 'createdAt'>) =>
    fetchJson<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify(user),
    }),
  updateUser: (id: string, user: Partial<User>) =>
    fetchJson<User>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    }),

  // Bills
  getBills: (params?: { search?: string; startDate?: string; endDate?: string; salesmanId?: string; paymentMethod?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    if (params?.salesmanId) query.append('salesmanId', params.salesmanId);
    if (params?.paymentMethod) query.append('paymentMethod', params.paymentMethod);
    return fetchJson<Bill[]>(`/api/bills?${query.toString()}`);
  },
  getBillById: (id: string) => fetchJson<Bill>(`/api/bills/${id}`),
  createBill: (bill: Partial<Bill>) =>
    fetchJson<Bill>('/api/bills', {
      method: 'POST',
      body: JSON.stringify(bill),
    }),

  // Logs
  getAuditLogs: () => fetchJson<AuditLog[]>('/api/logs'),

  // Backup & Restore
  downloadBackupUrl: '/api/backup',
  restoreDatabase: (data: unknown) =>
    fetchJson<{ success: boolean; message: string }>('/api/restore', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  resetDatabase: () =>
    fetchJson<{ success: boolean; message: string }>('/api/reset', {
      method: 'POST',
    }),
};
