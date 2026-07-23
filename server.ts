import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import {
  initialStoreConfig,
  initialProducts,
  initialSalesmen,
  initialUsers,
  generateInitialBills,
} from './src/data/initialData';
import { StoreConfig, Product, Salesman, User, Bill, AuditLog } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json());

// Persistent Data File Path
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface LocalDatabase {
  storeConfig: StoreConfig;
  products: Product[];
  salesmen: Salesman[];
  users: User[];
  bills: Bill[];
  auditLogs: AuditLog[];
}

// Ensure DB exists or seed
function loadDatabase(): LocalDatabase {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading DB file, re-initializing...', err);
  }

  const seed: LocalDatabase = {
    storeConfig: initialStoreConfig,
    products: initialProducts,
    salesmen: initialSalesmen,
    users: initialUsers,
    bills: generateInitialBills(),
    auditLogs: [
      {
        id: 'log_1',
        timestamp: new Date().toISOString(),
        userId: 'usr_admin',
        userName: 'Rajesh Kumar (Owner/Admin)',
        action: 'SYSTEM_INITIALIZATION',
        details: 'Initial database seed successfully loaded.',
      },
    ],
  };

  saveDatabase(seed);
  return seed;
}

function saveDatabase(db: LocalDatabase) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving DB file:', err);
  }
}

let db = loadDatabase();

function addLog(userId: string, userName: string, action: string, details: string) {
  const log: AuditLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    userId,
    userName,
    action,
    details,
  };
  db.auditLogs.unshift(log);
  if (db.auditLogs.length > 500) {
    db.auditLogs = db.auditLogs.slice(0, 500);
  }
  saveDatabase(db);
}

// --- API ENDPOINTS ---

// Store Configuration
app.get('/api/store', (req, res) => {
  res.json(db.storeConfig);
});

app.put('/api/store', (req, res) => {
  db.storeConfig = { ...db.storeConfig, ...req.body };
  saveDatabase(db);
  addLog(req.body.updatedByUserId || 'admin', req.body.updatedByUserName || 'Admin', 'UPDATE_STORE_CONFIG', 'Updated store information and terms.');
  res.json(db.storeConfig);
});

// Products
app.get('/api/products', (req, res) => {
  res.json(db.products);
});

app.post('/api/products', (req, res) => {
  const newProduct: Product = {
    ...req.body,
    stockQuantity: req.body.stockQuantity !== undefined ? Number(req.body.stockQuantity) : 20,
    lowStockThreshold: req.body.lowStockThreshold !== undefined ? Number(req.body.lowStockThreshold) : 5,
    id: `prd_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  
  // Check barcode uniqueness
  const existing = db.products.find(p => p.barcode === newProduct.barcode);
  if (existing) {
    return res.status(400).json({ error: `Barcode '${newProduct.barcode}' is already assigned to product '${existing.name}'` });
  }

  db.products.unshift(newProduct);
  saveDatabase(db);
  addLog('usr_admin', 'Admin', 'CREATE_PRODUCT', `Registered product: ${newProduct.name} [Barcode: ${newProduct.barcode}] with ${newProduct.stockQuantity} barcodes.`);
  res.json(newProduct);
});

app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const index = db.products.findIndex(p => p.id === id);
  if (index === -1) return res.status(404).json({ error: 'Product not found' });

  // Barcode uniqueness check if changed
  if (req.body.barcode && req.body.barcode !== db.products[index].barcode) {
    const existing = db.products.find(p => p.barcode === req.body.barcode && p.id !== id);
    if (existing) {
      return res.status(400).json({ error: `Barcode '${req.body.barcode}' belongs to '${existing.name}'` });
    }
  }

  db.products[index] = {
    ...db.products[index],
    ...req.body,
    stockQuantity: req.body.stockQuantity !== undefined ? Number(req.body.stockQuantity) : db.products[index].stockQuantity ?? 20,
    lowStockThreshold: req.body.lowStockThreshold !== undefined ? Number(req.body.lowStockThreshold) : db.products[index].lowStockThreshold ?? 5,
    updatedAt: new Date().toISOString()
  };
  saveDatabase(db);
  addLog('usr_admin', 'Admin', 'UPDATE_PRODUCT', `Updated product: ${db.products[index].name} [Barcode stock: ${db.products[index].stockQuantity}]`);
  res.json(db.products[index]);
});

app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const prod = db.products.find(p => p.id === id);
  if (prod) {
    db.products = db.products.filter(p => p.id !== id);
    saveDatabase(db);
    addLog('usr_admin', 'Admin', 'DELETE_PRODUCT', `Deleted product: ${prod.name}`);
  }
  res.json({ success: true });
});

// Salesmen
app.get('/api/salesmen', (req, res) => {
  res.json(db.salesmen);
});

app.post('/api/salesmen', (req, res) => {
  const salesman: Salesman = {
    ...req.body,
    id: `sls_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  db.salesmen.push(salesman);
  saveDatabase(db);
  addLog('usr_admin', 'Admin', 'CREATE_SALESMAN', `Added salesman: ${salesman.name} (${salesman.code})`);
  res.json(salesman);
});

app.put('/api/salesmen/:id', (req, res) => {
  const { id } = req.params;
  const index = db.salesmen.findIndex(s => s.id === id);
  if (index === -1) return res.status(404).json({ error: 'Salesman not found' });

  db.salesmen[index] = { ...db.salesmen[index], ...req.body };
  saveDatabase(db);
  addLog('usr_admin', 'Admin', 'UPDATE_SALESMAN', `Updated salesman: ${db.salesmen[index].name}`);
  res.json(db.salesmen[index]);
});

// Users
app.get('/api/users', (req, res) => {
  res.json(db.users);
});

app.post('/api/users', (req, res) => {
  const newUser: User = {
    ...req.body,
    id: `usr_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  const existing = db.users.find(u => u.username.toLowerCase() === newUser.username.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'Username already exists' });
  }
  db.users.push(newUser);
  saveDatabase(db);
  addLog('usr_admin', 'Admin', 'CREATE_USER', `Created user account: ${newUser.username} (${newUser.role})`);
  res.json(newUser);
});

app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const index = db.users.findIndex(u => u.id === id);
  if (index === -1) return res.status(404).json({ error: 'User not found' });

  db.users[index] = { ...db.users[index], ...req.body };
  saveDatabase(db);
  addLog('usr_admin', 'Admin', 'UPDATE_USER', `Updated user: ${db.users[index].username}`);
  res.json(db.users[index]);
});

// Bills / Invoices
app.get('/api/bills', (req, res) => {
  const { search, startDate, endDate, salesmanId, paymentMethod } = req.query;
  let filtered = [...db.bills];

  if (search) {
    const q = String(search).toLowerCase();
    filtered = filtered.filter(
      b =>
        b.billNumber.toLowerCase().includes(q) ||
        (b.customerName && b.customerName.toLowerCase().includes(q)) ||
        (b.customerPhone && b.customerPhone.includes(q)) ||
        b.salesmanName.toLowerCase().includes(q)
    );
  }

  if (salesmanId) {
    filtered = filtered.filter(b => b.salesmanId === salesmanId);
  }

  if (paymentMethod) {
    filtered = filtered.filter(b => b.paymentMethod === paymentMethod);
  }

  if (startDate) {
    filtered = filtered.filter(b => new Date(b.date) >= new Date(String(startDate)));
  }

  if (endDate) {
    const end = new Date(String(endDate));
    end.setHours(23, 59, 59, 999);
    filtered = filtered.filter(b => new Date(b.date) <= end);
  }

  // Sort descending by date
  filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  res.json(filtered);
});

app.get('/api/bills/:id', (req, res) => {
  const bill = db.bills.find(b => b.id === req.params.id || b.billNumber === req.params.id);
  if (!bill) return res.status(404).json({ error: 'Bill not found' });
  res.json(bill);
});

app.post('/api/bills', (req, res) => {
  const count = db.bills.length + 101;
  const year = new Date().getFullYear();
  const billNumber = req.body.billNumber || `INV-${year}-${String(count).padStart(4, '0')}`;

  const newBill: Bill = {
    ...req.body,
    id: `bill_${Date.now()}`,
    billNumber,
    date: req.body.date || new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  // Deduct barcode stock quantity for each purchased item
  if (Array.isArray(newBill.items)) {
    newBill.items.forEach((item) => {
      const prodIndex = db.products.findIndex(
        (p) => p.id === item.productId || p.barcode === item.barcode
      );
      if (prodIndex !== -1) {
        const currentQty = db.products[prodIndex].stockQuantity ?? 20;
        const newQty = Math.max(0, currentQty - item.quantity);
        db.products[prodIndex].stockQuantity = newQty;
      }
    });
  }

  db.bills.unshift(newBill);
  saveDatabase(db);
  addLog(newBill.cashierId, newBill.cashierName, 'CREATE_BILL', `Generated Invoice ${newBill.billNumber} for ${db.storeConfig.currencySymbol}${newBill.grandTotal.toFixed(2)} via ${newBill.paymentMethod.toUpperCase()} (Deducted barcode stock for items)`);
  res.json(newBill);
});

// Audit Logs
app.get('/api/logs', (req, res) => {
  res.json(db.auditLogs);
});

// Backup & Restore
app.get('/api/backup', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename=pos_backup_${new Date().toISOString().slice(0, 10)}.json`);
  res.json(db);
});

app.post('/api/restore', (req, res) => {
  if (!req.body || !req.body.products || !req.body.storeConfig) {
    return res.status(400).json({ error: 'Invalid backup JSON file structure' });
  }
  db = req.body;
  saveDatabase(db);
  addLog('usr_admin', 'Admin', 'RESTORE_DATABASE', 'Restored system database from uploaded backup file.');
  res.json({ success: true, message: 'Database restored successfully' });
});

app.post('/api/reset', (req, res) => {
  db = {
    storeConfig: initialStoreConfig,
    products: initialProducts,
    salesmen: initialSalesmen,
    users: initialUsers,
    bills: generateInitialBills(),
    auditLogs: [
      {
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: 'usr_admin',
        userName: 'Admin',
        action: 'RESET_DATABASE',
        details: 'System database re-seeded to factory demo settings.',
      },
    ],
  };
  saveDatabase(db);
  res.json({ success: true, message: 'Database reset to demo state' });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`POS Express Billing Server running on http://localhost:${PORT}`);
  });
}

startServer();
