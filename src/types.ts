export type UserRole = 'admin' | 'cashier';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  active: boolean;
  pin?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  barcode: string;
  mrp: number;
  sellingPrice: number;
  gstPercent: number; // e.g. 5, 12, 18, 28
  status: 'active' | 'inactive';
  stockQuantity: number; // custom number of generated barcodes / available stock
  lowStockThreshold: number; // threshold for low barcode stock alert / reminder
  createdAt: string;
  updatedAt?: string;
}

export interface Salesman {
  id: string;
  name: string;
  code: string;
  phone: string;
  active: boolean;
  commissionPercent: number;
  createdAt: string;
}

export interface StoreConfig {
  storeName: string;
  tagline: string;
  addressLine1: string;
  addressLine2: string;
  cityStatePincode: string;
  gstin: string;
  phone: string;
  email: string;
  upiId: string;
  invoiceFooterNote: string;
  termsAndConditions: string;
  currencySymbol: string;
  receiptFormat: 'thermal_80mm' | 'a4_full';
}

export interface BillItem {
  productId: string;
  name: string;
  barcode: string;
  mrp: number;
  sellingPrice: number;
  quantity: number;
  gstPercent: number;
  taxableValue: number;
  cgstAmount: number;
  sgstAmount: number;
  totalGstAmount: number;
  totalAmount: number;
}

export type PaymentMethod = 'cash' | 'upi' | 'credit_card' | 'debit_card' | 'mixed';

export interface MixedPaymentBreakdown {
  cashAmount: number;
  upiAmount: number;
  cardAmount: number;
}

export interface Bill {
  id: string;
  billNumber: string; // e.g., INV-2026-001
  date: string; // ISO string
  cashierId: string;
  cashierName: string;
  salesmanId: string;
  salesmanName: string;
  customerName?: string;
  customerPhone?: string;
  items: BillItem[];
  subtotal: number;
  discountType: 'fixed' | 'percentage';
  discountValue: number;
  discountAmount: number;
  totalTaxableValue: number;
  totalCgstAmount: number;
  totalSgstAmount: number;
  totalGstAmount: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  paymentDetails?: {
    cashReceived?: number;
    changeReturned?: number;
    transactionRef?: string;
    mixedBreakdown?: MixedPaymentBreakdown;
  };
  notes?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
}

export interface DashboardStats {
  todaySales: number;
  todayBillCount: number;
  todayGstCollected: number;
  topSalesman: string;
  recentBills: Bill[];
  paymentModeStats: { method: string; total: number; count: number }[];
  hourlySales: { hour: string; sales: number }[];
  weeklySales: { day: string; sales: number; bills: number }[];
}
