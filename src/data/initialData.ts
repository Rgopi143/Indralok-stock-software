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
    name: 'Rajesh Kumar (Owner/Admin)',
    role: 'admin',
    active: true,
    pin: '1234',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr_cashier1',
    username: 'cashier',
    name: 'Priya Sharma (Counter 1)',
    role: 'cashier',
    active: true,
    pin: '1111',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr_cashier2',
    username: 'rahul',
    name: 'Rahul Verma (Counter 2)',
    role: 'cashier',
    active: true,
    pin: '2222',
    createdAt: new Date().toISOString(),
  },
];

export const initialSalesmen: Salesman[] = [
  {
    id: 'sls_1',
    name: 'Anil Reddy',
    code: 'SM-01',
    phone: '9848012345',
    active: true,
    commissionPercent: 2.0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sls_2',
    name: 'Suresh Patel',
    code: 'SM-02',
    phone: '9848054321',
    active: true,
    commissionPercent: 1.5,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sls_3',
    name: 'Kavita Rao',
    code: 'SM-03',
    phone: '9848099887',
    active: true,
    commissionPercent: 2.5,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sls_4',
    name: 'Direct Counter (No Salesman)',
    code: 'SM-00',
    phone: '0000000000',
    active: true,
    commissionPercent: 0,
    createdAt: new Date().toISOString(),
  },
];

export const initialProducts: Product[] = [
  {
    id: 'prd_1',
    name: 'Basmati Rice Premium 5kg',
    category: 'Groceries',
    barcode: '890100100001',
    mrp: 650,
    sellingPrice: 580,
    gstPercent: 5,
    status: 'active',
    stockQuantity: 24,
    lowStockThreshold: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prd_2',
    name: 'Refined Sunflower Oil 1L',
    category: 'Groceries',
    barcode: '890100100002',
    mrp: 185,
    sellingPrice: 160,
    gstPercent: 5,
    status: 'active',
    stockQuantity: 3,
    lowStockThreshold: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prd_3',
    name: 'Organic Whole Wheat Flour 10kg',
    category: 'Groceries',
    barcode: '890100100003',
    mrp: 480,
    sellingPrice: 420,
    gstPercent: 5,
    status: 'active',
    stockQuantity: 18,
    lowStockThreshold: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prd_4',
    name: 'Wireless Bluetooth Earbuds Pro',
    category: 'Electronics',
    barcode: '890100200001',
    mrp: 2999,
    sellingPrice: 1999,
    gstPercent: 18,
    status: 'active',
    stockQuantity: 2,
    lowStockThreshold: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prd_5',
    name: 'Fast Charging USB-C Power Bank 20000mAh',
    category: 'Electronics',
    barcode: '890100200002',
    mrp: 2499,
    sellingPrice: 1699,
    gstPercent: 18,
    status: 'active',
    stockQuantity: 12,
    lowStockThreshold: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prd_6',
    name: 'Men Cotton Formal Shirt L-Size',
    category: 'Apparel',
    barcode: '890100300001',
    mrp: 1499,
    sellingPrice: 999,
    gstPercent: 12,
    status: 'active',
    stockQuantity: 15,
    lowStockThreshold: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prd_7',
    name: 'Women Designer Silk Kurti M-Size',
    category: 'Apparel',
    barcode: '890100300002',
    mrp: 1899,
    sellingPrice: 1299,
    gstPercent: 12,
    status: 'active',
    stockQuantity: 4,
    lowStockThreshold: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prd_8',
    name: 'Herbal Body Wash Lavender 500ml',
    category: 'Personal Care',
    barcode: '890100400001',
    mrp: 350,
    sellingPrice: 299,
    gstPercent: 18,
    status: 'active',
    stockQuantity: 30,
    lowStockThreshold: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prd_9',
    name: 'Anti-Dandruff Shampoo 400ml',
    category: 'Personal Care',
    barcode: '890100400002',
    mrp: 290,
    sellingPrice: 240,
    gstPercent: 18,
    status: 'active',
    stockQuantity: 8,
    lowStockThreshold: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prd_10',
    name: 'Dark Chocolate Almond Bar 100g',
    category: 'Snacks & Beverages',
    barcode: '890100500001',
    mrp: 150,
    sellingPrice: 125,
    gstPercent: 18,
    status: 'active',
    stockQuantity: 1,
    lowStockThreshold: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prd_11',
    name: 'Green Tea Organic 100 Tea Bags',
    category: 'Snacks & Beverages',
    barcode: '890100500002',
    mrp: 450,
    sellingPrice: 380,
    gstPercent: 12,
    status: 'active',
    stockQuantity: 20,
    lowStockThreshold: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prd_12',
    name: 'Non-Stick Aluminium Frying Pan 24cm',
    category: 'Kitchenware',
    barcode: '890100600001',
    mrp: 1200,
    sellingPrice: 890,
    gstPercent: 18,
    status: 'active',
    stockQuantity: 10,
    lowStockThreshold: 5,
    createdAt: new Date().toISOString(),
  },
];

// Generate past 7 days of realistic bills
export function generateInitialBills(): Bill[] {
  const bills: Bill[] = [];
  const today = new Date();
  
  const paymentMethods: Bill['paymentMethod'][] = ['cash', 'upi', 'credit_card', 'debit_card'];
  
  let billCounter = 101;

  for (let i = 6; i >= 0; i--) {
    const billDate = new Date(today);
    billDate.setDate(today.getDate() - i);
    
    // 3 to 6 bills per day
    const numBills = 3 + Math.floor(Math.random() * 4);
    
    for (let b = 0; b < numBills; b++) {
      billDate.setHours(9 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60));
      
      const salesman = initialSalesmen[b % (initialSalesmen.length - 1)];
      const cashier = initialUsers[1];
      const method = paymentMethods[(i + b) % paymentMethods.length];

      // Pick 2 to 4 products randomly
      const itemsCount = 2 + Math.floor(Math.random() * 3);
      const items = [];
      let subtotal = 0;
      let totalTaxable = 0;
      let totalGst = 0;

      for (let k = 0; k < itemsCount; k++) {
        const prod = initialProducts[(k + b * 2) % initialProducts.length];
        const qty = 1 + Math.floor(Math.random() * 2);
        
        const price = prod.sellingPrice;
        const totalLineAmount = price * qty;
        
        // Back-calculate taxable value from inclusive or exclusive selling price
        // In Indian GST POS, selling price is consumer inclusive or tax calculated on selling price
        const taxable = Number((totalLineAmount / (1 + prod.gstPercent / 100)).toFixed(2));
        const gstAmt = Number((totalLineAmount - taxable).toFixed(2));
        const cgst = Number((gstAmt / 2).toFixed(2));
        const sgst = Number((gstAmt - cgst).toFixed(2));

        items.push({
          productId: prod.id,
          name: prod.name,
          barcode: prod.barcode,
          mrp: prod.mrp,
          sellingPrice: prod.sellingPrice,
          quantity: qty,
          gstPercent: prod.gstPercent,
          taxableValue: taxable,
          cgstAmount: cgst,
          sgstAmount: sgst,
          totalGstAmount: gstAmt,
          totalAmount: totalLineAmount,
        });

        subtotal += totalLineAmount;
        totalTaxable += taxable;
        totalGst += gstAmt;
      }

      const totalCgst = Number((totalGst / 2).toFixed(2));
      const totalSgst = Number((totalGst - totalCgst).toFixed(2));

      bills.push({
        id: `bill_${billCounter}`,
        billNumber: `INV-2026-${String(billCounter).padStart(4, '0')}`,
        date: billDate.toISOString(),
        cashierId: cashier.id,
        cashierName: cashier.name,
        salesmanId: salesman.id,
        salesmanName: salesman.name,
        customerName: `Customer ${billCounter}`,
        customerPhone: `98765${String(billCounter).padStart(5, '0')}`,
        items,
        subtotal,
        discountType: 'fixed',
        discountValue: 0,
        discountAmount: 0,
        totalTaxableValue: totalTaxable,
        totalCgstAmount: totalCgst,
        totalSgstAmount: totalSgst,
        totalGstAmount: totalGst,
        grandTotal: subtotal,
        paymentMethod: method,
        paymentDetails: method === 'cash' ? { cashReceived: subtotal + 50, changeReturned: 50 } : { transactionRef: `TXN${Date.now()}${b}` },
        createdAt: billDate.toISOString(),
      });

      billCounter++;
    }
  }

  return bills;
}
