import React, { useState, useEffect, useRef } from 'react';
import {
  Scan,
  Plus,
  Trash2,
  Printer,
  QrCode,
  CreditCard,
  Banknote,
  Search,
  User,
  ShoppingBag,
  Sparkles,
  RotateCcw,
  Percent,
  Calculator,
  CheckCircle2,
  Camera,
  Layers,
  Phone,
} from 'lucide-react';
import { Product, Salesman, BillItem, PaymentMethod, Bill, StoreConfig, User as AppUser } from '../../types';
import { playScanBeep, playSuccessChime } from '../../lib/audio';
import { BarcodeScannerModal } from '../BarcodeScannerModal';
import { UPIQRCodeModal } from '../UPIQRCodeModal';
import { InvoicePrintModal } from '../InvoicePrintModal';
import { BarcodeStickerPrintModal } from '../BarcodeStickerPrintModal';

interface BillingViewProps {
  products: Product[];
  salesmen: Salesman[];
  storeConfig: StoreConfig;
  currentUser: AppUser;
  onBillCreated: (bill: Bill) => void;
}

export const BillingView: React.FC<BillingViewProps> = ({
  products,
  salesmen,
  storeConfig,
  currentUser,
  onBillCreated,
}) => {
  // Active Salesman
  const [selectedSalesmanId, setSelectedSalesmanId] = useState<string>(
    salesmen[0]?.id || ''
  );

  // Bill Customer
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');

  // Cart / Bill Items
  const [items, setItems] = useState<BillItem[]>([]);

  // Scan input & Message State
  const [barcodeInput, setBarcodeInput] = useState<string>('');
  const [scanMessage, setScanMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);
  const [lowStockAlertModal, setLowStockAlertModal] = useState<{ product: Product; remaining: number }[] | null>(null);
  const [printModalProduct, setPrintModalProduct] = useState<Product | null>(null);

  // Search & Quick Pick
  const [productSearch, setProductSearch] = useState<string>('');

  // Discount
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>('fixed');
  const [discountValue, setDiscountValue] = useState<number>(0);

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashReceived, setCashReceived] = useState<string>('');

  // Modals
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isUpiModalOpen, setIsUpiModalOpen] = useState<boolean>(false);
  const [lastGeneratedBill, setLastGeneratedBill] = useState<Bill | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState<boolean>(false);

  const barcodeInputRef = useRef<HTMLInputElement | null>(null);

  // USB Barcode Scanner rapid keyboard buffer detection
  useEffect(() => {
    let buffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in text inputs or textareas
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === 'input' || targetTag === 'textarea' || targetTag === 'select') {
        return;
      }

      // F2: Focus scanner input / Reset bill
      if (e.key === 'F2') {
        e.preventDefault();
        barcodeInputRef.current?.focus();
        return;
      }

      // F4: Camera scanner
      if (e.key === 'F4') {
        e.preventDefault();
        setIsScannerOpen(true);
        return;
      }

      const currentTime = Date.now();
      if (currentTime - lastKeyTime > 60) {
        buffer = ''; // Reset buffer if delay > 60ms
      }
      lastKeyTime = currentTime;

      if (e.key === 'Enter') {
        if (buffer.length >= 3) {
          handleProcessBarcode(buffer);
          buffer = '';
        }
      } else if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [products]);

  // Handle process barcode string
  const handleProcessBarcode = (code: string) => {
    const cleanCode = code.trim();
    if (!cleanCode) return;

    const prod = products.find(
      (p) => p.barcode === cleanCode || p.barcode.toLowerCase() === cleanCode.toLowerCase()
    );

    if (!prod) {
      setScanMessage({ type: 'error', text: `Product not found for Barcode: ${cleanCode}` });
      playScanBeep();
      setTimeout(() => setScanMessage(null), 2500);
      return;
    }

    if (prod.status === 'inactive') {
      setScanMessage({ type: 'error', text: `Product '${prod.name}' is marked INACTIVE.` });
      setTimeout(() => setScanMessage(null), 2500);
      return;
    }

    const currentStock = prod.stockQuantity ?? 20;
    const threshold = prod.lowStockThreshold ?? 5;

    // Check if item is already in cart to see total scanned quantity
    const existingInCart = items.find((item) => item.productId === prod.id);
    const scannedQtyInCart = (existingInCart ? existingInCart.quantity : 0) + 1;
    const remainingStockAfterThis = currentStock - scannedQtyInCart;

    // Add or increment in cart
    playScanBeep();
    setItems((prevItems) => {
      const existingIdx = prevItems.findIndex((item) => item.productId === prod.id);
      if (existingIdx !== -1) {
        const updated = [...prevItems];
        const newQty = updated[existingIdx].quantity + 1;
        updated[existingIdx] = calculateLineItem(prod, newQty);
        return updated;
      } else {
        return [...prevItems, calculateLineItem(prod, 1)];
      }
    });

    if (currentStock <= 0 || remainingStockAfterThis < 0) {
      setScanMessage({
        type: 'warning',
        text: `⚠️ Added ${prod.name} (0 barcodes remain in stock! Please prepare new barcodes)`,
      });
    } else if (remainingStockAfterThis <= threshold) {
      setScanMessage({
        type: 'warning',
        text: `⚡ Added ${prod.name} (Low Stock Alert: Only ${remainingStockAfterThis} barcodes remaining)`,
      });
    } else {
      setScanMessage({ type: 'success', text: `Added ${prod.name} [Stock: ${remainingStockAfterThis} left]` });
    }

    setBarcodeInput('');
    setTimeout(() => setScanMessage(null), 3000);
  };

  // Helper to compute line item GST & Taxable amounts
  const calculateLineItem = (prod: Product, qty: number): BillItem => {
    const lineTotal = prod.sellingPrice * qty;
    // In GST retail, selling price is consumer price; taxable value = Total / (1 + GST%)
    const taxableValue = Number((lineTotal / (1 + prod.gstPercent / 100)).toFixed(2));
    const totalGstAmount = Number((lineTotal - taxableValue).toFixed(2));
    const cgstAmount = Number((totalGstAmount / 2).toFixed(2));
    const sgstAmount = Number((totalGstAmount - cgstAmount).toFixed(2));

    return {
      productId: prod.id,
      name: prod.name,
      barcode: prod.barcode,
      mrp: prod.mrp,
      sellingPrice: prod.sellingPrice,
      quantity: qty,
      gstPercent: prod.gstPercent,
      taxableValue,
      cgstAmount,
      sgstAmount,
      totalGstAmount,
      totalAmount: lineTotal,
    };
  };

  const handleBarcodeFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleProcessBarcode(barcodeInput);
  };

  const updateQuantity = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      removeItem(productId);
      return;
    }
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    setItems((prev) =>
      prev.map((item) => (item.productId === productId ? calculateLineItem(prod, newQty) : item))
    );
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setItems([]);
    setDiscountValue(0);
    setCashReceived('');
    setCustomerName('');
    setCustomerPhone('');
  };

  // Calculate Subtotals & Totals
  const subtotal = items.reduce((sum, item) => sum + item.totalAmount, 0);
  const totalTaxable = items.reduce((sum, item) => sum + item.taxableValue, 0);
  const totalGst = items.reduce((sum, item) => sum + item.totalGstAmount, 0);
  const totalCgst = items.reduce((sum, item) => sum + item.cgstAmount, 0);
  const totalSgst = items.reduce((sum, item) => sum + item.sgstAmount, 0);

  let discountAmount = 0;
  if (discountType === 'percentage') {
    discountAmount = (subtotal * (discountValue || 0)) / 100;
  } else {
    discountAmount = discountValue || 0;
  }
  discountAmount = Math.min(discountAmount, subtotal);

  const grandTotal = Math.max(0, subtotal - discountAmount);

  const cashReceivedNum = parseFloat(cashReceived) || 0;
  const changeReturned = Math.max(0, cashReceivedNum - grandTotal);

  // Handle Checkout & Invoice Generation
  const handleCheckout = () => {
    if (items.length === 0) {
      alert('Please add at least one item to the bill before checkout.');
      return;
    }

    if (paymentMethod === 'cash' && cashReceivedNum < grandTotal) {
      alert(
        `Cash received (${storeConfig.currencySymbol}${cashReceivedNum}) is less than the Grand Total (${storeConfig.currencySymbol}${grandTotal.toFixed(
          2
        )}).`
      );
      return;
    }

    const salesman = salesmen.find((s) => s.id === selectedSalesmanId) || salesmen[0];

    const newBill: Partial<Bill> = {
      date: new Date().toISOString(),
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      salesmanId: salesman.id,
      salesmanName: salesman.name,
      customerName: customerName.trim() || undefined,
      customerPhone: customerPhone.trim() || undefined,
      items,
      subtotal,
      discountType,
      discountValue,
      discountAmount,
      totalTaxableValue: totalTaxable,
      totalCgstAmount: totalCgst,
      totalSgstAmount: totalSgst,
      totalGstAmount: totalGst,
      grandTotal,
      paymentMethod,
      paymentDetails:
        paymentMethod === 'cash'
          ? { cashReceived: cashReceivedNum, changeReturned }
          : { transactionRef: `TXN${Date.now()}` },
    };

    // Calculate post-checkout remaining stocks to trigger low stock alerts
    const lowStockItems: { product: Product; remaining: number }[] = [];
    items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId || p.barcode === item.barcode);
      if (prod) {
        const currentStock = prod.stockQuantity ?? 20;
        const threshold = prod.lowStockThreshold ?? 5;
        const remaining = Math.max(0, currentStock - item.quantity);
        if (remaining <= threshold) {
          lowStockItems.push({ product: prod, remaining });
        }
      }
    });

    playSuccessChime();
    onBillCreated(newBill as Bill);
    setLastGeneratedBill(newBill as Bill);
    setIsInvoiceModalOpen(true);
    clearCart();

    if (lowStockItems.length > 0) {
      setLowStockAlertModal(lowStockItems);
    }
  };

  // Quick product search filter
  const filteredProducts = products
    .filter((p) => p.status === 'active')
    .filter(
      (p) =>
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.barcode.includes(productSearch) ||
        p.category.toLowerCase().includes(productSearch.toLowerCase())
    )
    .slice(0, 8);

  return (
    <div className="flex-1 flex flex-col xl:flex-row h-full overflow-hidden bg-slate-100">
      {/* LEFT / TOP: POS CART & BILLING TABLE */}
      <div className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden space-y-4">
        {/* TOP CONTROLS: SALESMAN & SCANNER BAR */}
        <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-stretch">
          {/* Salesman Select */}
          <div className="flex items-center gap-2 min-w-[220px]">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                Assigned Salesman
              </label>
              <select
                value={selectedSalesmanId}
                onChange={(e) => setSelectedSalesmanId(e.target.value)}
                className="w-full text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                id="salesman-select"
              >
                {salesmen.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* BARCODE SCANNER INPUT */}
          <form
            onSubmit={handleBarcodeFormSubmit}
            className="flex-1 flex items-center gap-2 relative"
          >
            <div className="relative flex-1">
              <Scan className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-600 animate-pulse" />
              <input
                ref={barcodeInputRef}
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Scan Barcode or type product code & press Enter..."
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-2 border-indigo-200 focus:border-indigo-600 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none shadow-xs transition-all"
                autoFocus
                id="barcode-input"
              />
            </div>

            <button
              type="button"
              onClick={() => setIsScannerOpen(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors shrink-0"
            >
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">Camera Scan</span>
            </button>
          </form>
        </div>

        {/* SCAN MESSAGE BANNER */}
        {scanMessage && (
          <div
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              scanMessage.type === 'success'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'bg-rose-500 text-white shadow-xs'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            {scanMessage.text}
          </div>
        )}

        {/* ITEM BILLING TABLE */}
        <div className="flex-1 bg-white rounded-2xl shadow-xs border border-slate-200 flex flex-col overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
              <ShoppingBag className="w-4 h-4 text-indigo-600" />
              Invoice Cart ({items.length} Products)
            </div>
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear All
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <div className="p-4 bg-slate-100 rounded-full mb-3">
                  <Scan className="w-8 h-8 text-slate-400" />
                </div>
                <p className="font-bold text-slate-700 text-sm">No products added yet</p>
                <p className="text-xs text-slate-400 max-w-xs mt-1">
                  Scan barcode stickers using USB Scanner, Camera, or pick from the product list on the right.
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-100 text-slate-600 text-[11px] font-bold uppercase sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">#</th>
                    <th className="py-2.5 px-4">Product Name</th>
                    <th className="py-2.5 px-4 text-center">Qty</th>
                    <th className="py-2.5 px-4 text-right">Price</th>
                    <th className="py-2.5 px-4 text-right">GST%</th>
                    <th className="py-2.5 px-4 text-right">Taxable</th>
                    <th className="py-2.5 px-4 text-right">Total</th>
                    <th className="py-2.5 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {items.map((item, index) => (
                    <tr key={item.productId} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-400">{index + 1}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{item.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          BC: {item.barcode}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 w-24 mx-auto">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="w-6 h-6 bg-white hover:bg-slate-200 text-slate-800 font-bold rounded shadow-2xs flex items-center justify-center text-sm"
                          >
                            -
                          </button>
                          <span className="font-extrabold text-slate-900 w-8 text-center text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="w-6 h-6 bg-white hover:bg-slate-200 text-slate-800 font-bold rounded shadow-2xs flex items-center justify-center text-sm"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-800">
                        ₹{item.sellingPrice}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600 font-medium">
                        {item.gstPercent}%
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600">
                        ₹{item.taxableValue.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-indigo-900 font-mono text-sm">
                        ₹{item.totalAmount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* QUICK PRODUCT PICK GRID */}
        <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Layers className="w-4 h-4 text-indigo-600" /> Quick Product Touch Picker
            </div>
            <div className="relative w-48 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {filteredProducts.map((p) => (
              <button
                key={p.id}
                onClick={() => handleProcessBarcode(p.barcode)}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 text-left transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600">
                    {p.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">{p.barcode}</div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-indigo-900">
                    {storeConfig.currencySymbol}
                    {p.sellingPrice}
                  </span>
                  <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-semibold">
                    {p.gstPercent}% GST
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT / BOTTOM: CHECKOUT SUMMARY & PAYMENT PANEL */}
      <div className="w-full xl:w-96 bg-white border-l border-slate-200 p-4 md:p-6 flex flex-col justify-between space-y-4 overflow-y-auto shrink-0">
        <div className="space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-200 pb-3 flex items-center justify-between">
            <span>Billing Summary</span>
            <span className="text-xs font-normal text-slate-400">{currentUser.name.split(' ')[0]}</span>
          </h3>

          {/* CUSTOMER DETAILS (OPTIONAL) */}
          <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Customer Info (Optional)
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Name"
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <div className="relative">
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Phone"
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* DISCOUNT */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Apply Discount</span>
              <div className="flex bg-slate-200 p-0.5 rounded-lg text-[10px]">
                <button
                  type="button"
                  onClick={() => setDiscountType('fixed')}
                  className={`px-2 py-0.5 rounded font-bold ${
                    discountType === 'fixed' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  {storeConfig.currencySymbol} Fixed
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountType('percentage')}
                  className={`px-2 py-0.5 rounded font-bold ${
                    discountType === 'percentage' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  % Percentage
                </button>
              </div>
            </div>
            <input
              type="number"
              min={0}
              value={discountValue || ''}
              onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
              placeholder={discountType === 'fixed' ? 'Amount in ₹' : 'Percentage %'}
              className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-semibold"
            />
          </div>

          {/* TAX BREAKDOWN TABLE */}
          <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-200">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-900">
                {storeConfig.currencySymbol}
                {subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Taxable Value:</span>
              <span>
                {storeConfig.currencySymbol}
                {totalTaxable.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>CGST Total:</span>
              <span>
                {storeConfig.currencySymbol}
                {totalCgst.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>SGST Total:</span>
              <span>
                {storeConfig.currencySymbol}
                {totalSgst.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-indigo-700 font-semibold">
              <span>Total GST Included:</span>
              <span>
                {storeConfig.currencySymbol}
                {totalGst.toFixed(2)}
              </span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold border-t border-dashed pt-1">
                <span>Discount:</span>
                <span>
                  -{storeConfig.currencySymbol}
                  {discountAmount.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {/* GRAND TOTAL DISPLAY */}
          <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-md space-y-1">
            <span className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider">
              Payable Amount
            </span>
            <div className="text-3xl font-extrabold font-mono text-amber-400">
              {storeConfig.currencySymbol}
              {grandTotal.toFixed(2)}
            </div>
          </div>

          {/* PAYMENT METHOD SELECTOR */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select Payment Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'cash', label: 'Cash', icon: Banknote },
                { id: 'upi', label: 'UPI / QR', icon: QrCode },
                { id: 'credit_card', label: 'Credit Card', icon: CreditCard },
                { id: 'debit_card', label: 'Debit Card', icon: CreditCard },
              ].map((pm) => {
                const Icon = pm.icon;
                const isSelected = paymentMethod === pm.id;
                return (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id as PaymentMethod)}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {pm.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CASH CHANGE CALCULATOR */}
          {paymentMethod === 'cash' && (
            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2">
              <label className="block text-xs font-bold text-amber-900">
                Cash Tendered by Customer
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  placeholder={`Amount e.g. ${Math.ceil(grandTotal)}`}
                  className="w-full text-sm font-bold p-2 bg-white border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setCashReceived(String(Math.ceil(grandTotal)))}
                  className="px-3 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 text-xs font-bold rounded-lg shrink-0"
                >
                  Exact
                </button>
              </div>
              {cashReceivedNum > 0 && (
                <div className="flex justify-between items-center text-xs font-extrabold pt-1">
                  <span className="text-amber-800">Change to Return:</span>
                  <span className="text-sm font-mono text-emerald-700">
                    {storeConfig.currencySymbol}
                    {changeReturned.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* UPI MODAL TRIGGER */}
          {paymentMethod === 'upi' && (
            <button
              type="button"
              onClick={() => setIsUpiModalOpen(true)}
              className="w-full py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold rounded-xl text-xs hover:bg-indigo-100 flex items-center justify-center gap-2"
            >
              <QrCode className="w-4 h-4" /> Generate QR Code
            </button>
          )}
        </div>

        {/* PAY & PRINT ACTION BUTTON */}
        <div className="pt-2">
          <button
            onClick={handleCheckout}
            disabled={items.length === 0}
            className={`w-full py-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
              items.length === 0
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 active:scale-98'
            }`}
            id="checkout-pay-print-btn"
          >
            <Printer className="w-5 h-5" />
            <span>Complete Payment & Print Bill (F8)</span>
          </button>
        </div>
      </div>

      {/* MODALS */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleProcessBarcode}
        products={products}
      />

      <UPIQRCodeModal
        isOpen={isUpiModalOpen}
        onClose={() => setIsUpiModalOpen(false)}
        onPaymentConfirmed={() => {
          setIsUpiModalOpen(false);
          handleCheckout();
        }}
        amount={grandTotal}
        billNumber={`INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`}
        storeConfig={storeConfig}
      />

      <InvoicePrintModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        bill={lastGeneratedBill}
        storeConfig={storeConfig}
      />

      {/* LOW BARCODE STOCK / REMAINDER POPUP */}
      {lowStockAlertModal && lowStockAlertModal.length > 0 && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border-2 border-amber-400 space-y-4 animate-scale-up">
            <div className="flex items-center gap-3 text-amber-900 border-b border-amber-200 pb-3">
              <div className="p-2.5 bg-amber-500 text-white rounded-xl font-bold shadow-md shadow-amber-500/30">
                <Sparkles className="w-6 h-6 animate-spin" style={{ animationDuration: '4s' }} />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight">Barcode Stock Alert!</h3>
                <p className="text-xs text-amber-700 font-medium">
                  Products scanned during this checkout have low or zero barcodes remaining.
                </p>
              </div>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {lowStockAlertModal.map(({ product, remaining }) => (
                <div
                  key={product.id}
                  className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between"
                >
                  <div>
                    <div className="font-extrabold text-slate-900 text-sm">{product.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">Barcode: {product.barcode}</div>
                  </div>
                  <div className="text-right">
                    {remaining === 0 ? (
                      <span className="px-2 py-1 bg-rose-600 text-white font-extrabold text-xs rounded-lg shadow-xs">
                        0 Left (OUT OF STOCK)
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-amber-600 text-white font-bold text-xs rounded-lg shadow-xs">
                        {remaining} Barcodes Left
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setPrintModalProduct(product);
                      }}
                      className="block text-[10px] font-bold text-indigo-600 hover:underline mt-1 ml-auto"
                    >
                      Print Stickers →
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-600 font-medium">
              💡 <span className="font-bold">Remainder Notice:</span> Prepare new barcode stickers for these items to avoid billing delays.
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setLowStockAlertModal(null)}
                className="flex-1 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs"
              >
                Dismiss Alert
              </button>
              <button
                type="button"
                onClick={() => {
                  setPrintModalProduct(lowStockAlertModal[0]?.product || null);
                  setLowStockAlertModal(null);
                }}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs shadow-md shadow-amber-500/20"
              >
                Print Barcodes Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SINGLE PRODUCT STICKER PRINT MODAL */}
      <BarcodeStickerPrintModal
        isOpen={!!printModalProduct}
        onClose={() => setPrintModalProduct(null)}
        product={printModalProduct}
        allProducts={products}
        storeConfig={storeConfig}
      />
    </div>
  );
};
