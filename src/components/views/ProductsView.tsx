import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Barcode,
  Edit2,
  Trash2,
  Printer,
  Sparkles,
  CheckCircle2,
  X,
  Filter,
  Tag,
} from 'lucide-react';
import { Product, StoreConfig } from '../../types';
import { BarcodeRenderer } from '../BarcodeRenderer';
import { BarcodeStickerPrintModal } from '../BarcodeStickerPrintModal';

interface ProductsViewProps {
  products: Product[];
  storeConfig: StoreConfig;
  onSaveProduct: (productData: Partial<Product>) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  storeConfig,
  onSaveProduct,
  onDeleteProduct,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Sticker Print Modal
  const [isStickerPrintOpen, setIsStickerPrintOpen] = useState(false);
  const [stickerProduct, setStickerProduct] = useState<Product | null>(null);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Groceries');
  const [formBarcode, setFormBarcode] = useState('');
  const [formMrp, setFormMrp] = useState<number>(100);
  const [formSellingPrice, setFormSellingPrice] = useState<number>(90);
  const [formGstPercent, setFormGstPercent] = useState<number>(18);
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');
  const [formStockQuantity, setFormStockQuantity] = useState<number>(20);
  const [formLowStockThreshold, setFormLowStockThreshold] = useState<number>(5);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory('Groceries');
    // Generate a unique 12-digit barcode automatically
    const autoBarcode = `890${Math.floor(100000000 + Math.random() * 900000000)}`;
    setFormBarcode(autoBarcode);
    setFormMrp(200);
    setFormSellingPrice(180);
    setFormGstPercent(18);
    setFormStatus('active');
    setFormStockQuantity(20);
    setFormLowStockThreshold(5);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormCategory(p.category);
    setFormBarcode(p.barcode);
    setFormMrp(p.mrp);
    setFormSellingPrice(p.sellingPrice);
    setFormGstPercent(p.gstPercent);
    setFormStatus(p.status);
    setFormStockQuantity(p.stockQuantity ?? 20);
    setFormLowStockThreshold(p.lowStockThreshold ?? 5);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formBarcode.trim()) {
      setErrorMsg('Product name and barcode are required.');
      return;
    }
    if (formSellingPrice > formMrp) {
      setErrorMsg('Selling price cannot exceed MRP.');
      return;
    }

    try {
      await onSaveProduct({
        ...(editingProduct ? { id: editingProduct.id } : {}),
        name: formName.trim(),
        category: formCategory.trim(),
        barcode: formBarcode.trim(),
        mrp: Number(formMrp),
        sellingPrice: Number(formSellingPrice),
        gstPercent: Number(formGstPercent),
        status: formStatus,
        stockQuantity: Number(formStockQuantity),
        lowStockThreshold: Number(formLowStockThreshold),
      });
      setIsModalOpen(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Failed to save product');
      }
    }
  };

  const handlePrintBarcodeSticker = (p: Product) => {
    setStickerProduct(p);
    setIsStickerPrintOpen(true);
  };

  const filtered = products.filter((p) => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.includes(search) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="flex-1 p-4 md:p-6 bg-slate-100 overflow-y-auto space-y-6">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-extrabold text-slate-900">Product Registration</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Register store inventory items, assign barcode labels, and configure GST tax slabs.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all"
          id="add-product-btn"
        >
          <Plus className="w-4 h-4" /> Register New Product
        </button>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-stretch">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name, barcode, or category..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 shrink-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 hidden sm:block" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* PRODUCTS TABLE */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-600 text-xs font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Product Details</th>
                <th className="py-3.5 px-4">Barcode Label</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-center">Barcode Stock</th>
                <th className="py-3.5 px-4 text-right">MRP</th>
                <th className="py-3.5 px-4 text-right">Selling Price</th>
                <th className="py-3.5 px-4 text-right">GST Rate</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No products found. Click "Register New Product" above to create one.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const stock = p.stockQuantity ?? 20;
                  const threshold = p.lowStockThreshold ?? 5;
                  const isLow = stock <= threshold && stock > 0;
                  const isOutOfStock = stock === 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-extrabold text-slate-900 text-sm">{p.name}</div>
                        <div className="text-[10px] text-slate-400">ID: {p.id}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col items-start gap-1">
                          <BarcodeRenderer value={p.barcode} height={24} width={1.1} fontSize={8} />
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">{p.category}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          {isOutOfStock ? (
                            <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full text-[10px] font-extrabold border border-rose-300 animate-pulse">
                              0 Barcodes (OUT OF STOCK)
                            </span>
                          ) : isLow ? (
                            <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full text-[10px] font-extrabold border border-amber-300">
                              ⚡ {stock} Barcodes Left (Low Stock)
                            </span>
                          ) : (
                            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-200">
                              {stock} Barcodes Available
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              const addAmtStr = prompt(`Add how many printed barcode stickers to stock for '${p.name}'?`, '20');
                              if (addAmtStr) {
                                const addAmt = parseInt(addAmtStr);
                                if (!isNaN(addAmt) && addAmt > 0) {
                                  onSaveProduct({ id: p.id, stockQuantity: stock + addAmt });
                                }
                              }
                            }}
                            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                          >
                            + Refill Stock
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-500 line-through">
                        ₹{p.mrp}
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-indigo-900 text-sm">
                        ₹{p.sellingPrice}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold">
                          {p.gstPercent}% GST
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            p.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handlePrintBarcodeSticker(p)}
                            className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Print Barcode Sticker & Replenish"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete product '${p.name}'?`)) {
                                onDeleteProduct(p.id);
                              }
                            }}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-lg">
                  {editingProduct ? 'Edit Product Record' : 'Register New Product'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl font-semibold border border-rose-200">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Basmati Rice Premium 5kg"
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="e.g. Groceries"
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">Barcode Value *</label>
                    <button
                      type="button"
                      onClick={() =>
                        setFormBarcode(`890${Math.floor(100000000 + Math.random() * 900000000)}`)
                      }
                      className="text-[10px] font-bold text-indigo-600 hover:underline"
                    >
                      Auto Generate
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={formBarcode}
                    onChange={(e) => setFormBarcode(e.target.value)}
                    placeholder="Barcode Number"
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">MRP (₹)</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formMrp}
                    onChange={(e) => setFormMrp(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formSellingPrice}
                    onChange={(e) => setFormSellingPrice(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">GST Tax Rate (%)</label>
                  <select
                    value={formGstPercent}
                    onChange={(e) => setFormGstPercent(parseInt(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold"
                  >
                    <option value={0}>0% (Exempt)</option>
                    <option value={5}>5% GST</option>
                    <option value={12}>12% GST</option>
                    <option value={18}>18% GST</option>
                    <option value={28}>28% GST</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as 'active' | 'inactive')}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Generated Barcodes / Stock Qty *
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formStockQuantity}
                    onChange={(e) => setFormStockQuantity(parseInt(e.target.value) || 0)}
                    placeholder="e.g. 50"
                    className="w-full p-2.5 border border-indigo-200 bg-indigo-50/50 rounded-xl font-bold text-indigo-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Low Stock Alert Threshold
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formLowStockThreshold}
                    onChange={(e) => setFormLowStockThreshold(parseInt(e.target.value) || 5)}
                    placeholder="e.g. 5"
                    className="w-full p-2.5 border border-amber-200 bg-amber-50/50 rounded-xl font-bold text-amber-900 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Live Barcode Preview in form */}
              {formBarcode && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                  <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase">
                    Barcode Preview
                  </div>
                  <BarcodeRenderer value={formBarcode} height={32} width={1.3} fontSize={10} />
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-600/20"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STICKER PRINT MODAL */}
      <BarcodeStickerPrintModal
        isOpen={isStickerPrintOpen}
        onClose={() => setIsStickerPrintOpen(false)}
        product={stickerProduct}
        allProducts={products}
        storeConfig={storeConfig}
      />
    </div>
  );
};
