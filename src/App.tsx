import React, { useState, useEffect } from 'react';
import { api } from './lib/api';
import { StoreConfig, Product, Salesman, User, Bill, AuditLog } from './types';
import { Navbar } from './components/Navbar';
import { Sidebar, ViewTab } from './components/Sidebar';
import { BillingView } from './components/views/BillingView';
import { DashboardView } from './components/views/DashboardView';
import { ProductsView } from './components/views/ProductsView';
import { BarcodeStudioView } from './components/views/BarcodeStudioView';
import { BillHistoryView } from './components/views/BillHistoryView';
import { ReportsView } from './components/views/ReportsView';
import { SalesmenView } from './components/views/SalesmenView';
import { StoreSettingsView } from './components/views/StoreSettingsView';
import { UserManagementView } from './components/views/UserManagementView';
import { AuditLogView } from './components/views/AuditLogView';
import { LoginModal } from './components/LoginModal';
import { ShortcutsGuideModal } from './components/ShortcutsGuideModal';
import {
  initialStoreConfig,
  initialProducts,
  initialSalesmen,
  initialUsers,
  generateInitialBills,
} from './data/initialData';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<ViewTab>('billing');

  // Application Data States
  const [storeConfig, setStoreConfig] = useState<StoreConfig>(initialStoreConfig);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [salesmen, setSalesmen] = useState<Salesman[]>(initialSalesmen);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [bills, setBills] = useState<Bill[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Current User Session
  const [currentUser, setCurrentUser] = useState<User | null>(initialUsers[0]);
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);

  // Shortcuts Modal
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);

  // Loading indicator
  const [loading, setLoading] = useState<boolean>(true);

  // Load backend database on mount
  const refreshData = async () => {
    try {
      const [cfg, prds, sls, usrs, bls, lgs] = await Promise.all([
        api.getStoreConfig(),
        api.getProducts(),
        api.getSalesmen(),
        api.getUsers(),
        api.getBills(),
        api.getAuditLogs(),
      ]);

      setStoreConfig(cfg);
      setProducts(prds);
      setSalesmen(sls);
      setUsers(usrs);
      setBills(bls);
      setAuditLogs(lgs);

      // Ensure active user is still valid
      if (usrs.length > 0 && !usrs.some((u) => u.id === currentUser?.id)) {
        setCurrentUser(usrs[0]);
      }
    } catch (err) {
      console.warn('API load fallback to initial seed data:', err);
      if (bills.length === 0) {
        setBills(generateInitialBills());
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Handlers
  const handleBillCreated = async (newBill: Bill) => {
    try {
      const savedBill = await api.createBill(newBill);
      setBills((prev) => [savedBill, ...prev]);
    } catch (err) {
      console.error('Failed to save bill to server:', err);
      // Fallback local update
      setBills((prev) => [newBill, ...prev]);
    }
  };

  const handleSaveProduct = async (productData: Partial<Product>) => {
    if (productData.id) {
      const updated = await api.updateProduct(productData.id, productData);
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } else {
      const created = await api.createProduct(productData as Omit<Product, 'id' | 'createdAt'>);
      setProducts((prev) => [created, ...prev]);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    await api.deleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSaveSalesman = async (salesmanData: Partial<Salesman>) => {
    if (salesmanData.id) {
      const updated = await api.updateSalesman(salesmanData.id, salesmanData);
      setSalesmen((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    } else {
      const created = await api.createSalesman(salesmanData as Omit<Salesman, 'id' | 'createdAt'>);
      setSalesmen((prev) => [...prev, created]);
    }
  };

  const handleSaveUser = async (userData: Partial<User>) => {
    if (userData.id) {
      const updated = await api.updateUser(userData.id, userData);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } else {
      const created = await api.createUser(userData as Omit<User, 'id' | 'createdAt'>);
      setUsers((prev) => [...prev, created]);
    }
  };

  const handleUpdateStoreConfig = async (newConfig: StoreConfig) => {
    const updated = await api.updateStoreConfig({
      ...newConfig,
      updatedByUserId: currentUser?.id,
      updatedByUserName: currentUser?.name,
    });
    setStoreConfig(updated);
  };

  if (!currentUser || isLoginOpen) {
    return <LoginModal users={users} onLogin={(user) => { setCurrentUser(user); setIsLoginOpen(false); }} />;
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-900 font-sans antialiased text-slate-800 select-none">
      {/* Top Navbar */}
      <Navbar
        user={currentUser}
        storeConfig={storeConfig}
        onLogout={() => setIsLoginOpen(true)}
        onOpenShortcutsModal={() => setIsShortcutsOpen(true)}
      />

      {/* Main Body Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          role={currentUser.role}
        />

        {/* Dynamic Main View */}
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-100">
          {activeTab === 'billing' && (
            <BillingView
              products={products}
              salesmen={salesmen}
              storeConfig={storeConfig}
              currentUser={currentUser}
              onBillCreated={handleBillCreated}
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardView
              bills={bills}
              salesmen={salesmen}
              storeConfig={storeConfig}
              onNavigateToBilling={() => setActiveTab('billing')}
              onNavigateToBillHistory={() => setActiveTab('bills')}
            />
          )}

          {activeTab === 'products' && (
            <ProductsView
              products={products}
              storeConfig={storeConfig}
              onSaveProduct={handleSaveProduct}
              onDeleteProduct={handleDeleteProduct}
            />
          )}

          {activeTab === 'barcode_studio' && (
            <BarcodeStudioView
              products={products}
              storeConfig={storeConfig}
              onSaveProduct={handleSaveProduct}
            />
          )}

          {activeTab === 'bills' && (
            <BillHistoryView bills={bills} salesmen={salesmen} storeConfig={storeConfig} />
          )}

          {activeTab === 'reports' && (
            <ReportsView bills={bills} salesmen={salesmen} storeConfig={storeConfig} />
          )}

          {activeTab === 'salesmen' && (
            <SalesmenView salesmen={salesmen} onSaveSalesman={handleSaveSalesman} />
          )}

          {activeTab === 'store_settings' && (
            <StoreSettingsView
              storeConfig={storeConfig}
              onUpdateStoreConfig={handleUpdateStoreConfig}
            />
          )}

          {activeTab === 'users' && (
            <UserManagementView users={users} onSaveUser={handleSaveUser} />
          )}

          {activeTab === 'audit' && (
            <AuditLogView logs={auditLogs} onDatabaseRestoredOrReset={refreshData} />
          )}
        </main>
      </div>

      {/* Shortcuts Guide Modal */}
      <ShortcutsGuideModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}
