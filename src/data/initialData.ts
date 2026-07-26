import { StoreConfig, Product, Salesman, User, Bill } from '../types';

export const initialStoreConfig: StoreConfig = {
  storeName: 'SMART MART HYPERMARKET',
  tagline: 'Your One-Stop Premium Retail Superstore',
  addressLine1: 'Plot No. 42, Commercial Main Road, Tech City',
  addressLine2: 'Sector 5, Outer Ring Road',
  cityStatePincode: 'Hyderabad, Telangana - 500081',
  gstin: '36ABCDE1234F1Z5',
  phone: '+91 98765 43210',
  email: 'billing@smartmarthypen.com',
  upiId: 'smartmart@upi',
  invoiceFooterNote: 'Thank you for shopping with us! Visit again soon.',
  termsAndConditions: '1. Goods once sold can be exchanged within 7 days with original bill.\n2. No cash refund.\n3. Items under discount/offer cannot be returned.\n4. Disputes subject to local jurisdiction.',
  currencySymbol: '₹',
  receiptFormat: 'thermal_80mm',
};

export const initialUsers: User[] = [
  {
    id: 'usr_admin',
    username: 'admin',
    name: 'Owner / Admin',
    role: 'admin',
    active: true,
    pin: '1234',
    createdAt: new Date().toISOString(),
  },
];

export const initialSalesmen: Salesman[] = [];

export const initialProducts: Product[] = [];

export function generateInitialBills(): Bill[] {
  return [];
}
