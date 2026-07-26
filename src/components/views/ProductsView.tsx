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
  Shirt,
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

const APPAREL_CATEGORIES = [
  "Shirts & T-Shirts",
  "Jeans & Trousers",
  "Ethnic Wear & Sarees",
  "Dresses & Tops",
  "Kids & Baby Wear",
  "Innerwear & Nightwear",
  "Winter & Outerwear",
  "Accessories & Footwear",
];

const APPAREL_SIZES = ["S", "M", "L", "XL", "XXL", "3XL", "28", "30", "32", "34", "36", "38", "40", "42"];

const APPAREL_FABRICS = ["Cotton", "Denim", "Silk", "Linen", "Rayon", "Polyester"];

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
  const [formCategory, setFormCategory] = useState('Shirts & T-Shirts');
  const [formBarcode, setFormBarcode] = useState('');
  const [formMrp, setFormMrp] = useState<number>(999);
  const [formSellingPrice, setFormSellingPrice] = useState<number>(799);
  const [formGstPercent, setFormGstPercent] = useState<number>(5);
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');
  const [formStockQuantity, setFormStockQuantity] = useState<number>(20);
  const [formLowStockThreshold, setFormLowStockThreshold] = useState<number>(5);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const existingCategories = Array.from(new Set(products.map((p) => p.category)));
  const allCategoriesList = Array.from(new Set(['All', ...APPAREL_CATEGORIES, ...existingCategories]));

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory('Shirts & T-Shirts');
    const autoBarcode = `890${Math.floor(100000000 + Math.random() * 900000000)}`;
    setFormBarcode(autoBarcode);
    setFormMrp(999);
    setFormSellingPrice(799);
    setFormGstPercent(5);
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

  const appendToName = (text: string) => {
    setFormName((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return text;
      if (trimmed.includes(text)) return trimmed;
      return `${trimmed} ${text}`;
    });
  };

  const handleMrpChange = (newMrp: number) => {
    setFormMrp(newMrp);
    // Indian GST rule for readymade garments: MRP <= 1000 is 5%, MRP > 1000 is 12%
    if (newMrp > 0 && newMrp <= 1000) {
      setFormGstPercent(5);
    } else if (newMrp > 1000) {
      setFormGstPercent(12);
    }
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
            <Shirt className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-extrabold text-slate-900">Garment & Clothing Product Registration</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Register apparel inventory items, assign size tag barcode labels, and configure apparel GST rates (5% / 12%).
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-md shadow-indigo-600/20 text-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Garment / Item</span>
        </button>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by garment name, size, barcode, or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 text-slate-800 font-medium"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 shrink-0 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400 mr-1 shrink-0" />
            {allCategoriesList.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* PRODUCT TABLE */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Garment / Item Details</th>
                <th className="p-4">Category</th>
                <th className="p-4">Barcode</th>
                <th className="p-4 text-right">MRP</th>
                <th className="p-4 text-right">Selling Price</th>
                <th className="p-4 text-center">GST Rate</th>
                <th className="p-4 text-center">Barcode Stock</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    <Package className="w-12 h-12 mx-auto mb-2 text-slate-300 stroke-1" />
                    <p className="font-semibold text-slate-500">No clothing items registered yet</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Click "Register New Garment / Item" above to add your first clothing product.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => {
                  const isLowStock = (prod.stockQuantity ?? 20) <= (prod.lowStockThreshold ?? 5);

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900 text-sm">{prod.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">ID: {prod.id}</div>
                      </td>
                      <td className="p-4">
                        <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-md font-semibold text-[11px]">
                          {prod.category}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-mono text-slate-900 font-bold">{prod.barcode}</div>
                      </td>
                      <td className="p-4 text-right font-semibold text-slate-500 line-through">
                        {storeConfig.currencySymbol}
                        {prod.mrp.toFixed(2)}
                      </td>
                      <td className="p-4 text-right font-bold text-indigo-700 text-sm">
                        {storeConfig.currencySymbol}
                        {prod.sellingPrice.toFixed(2)}
                      </td>
                      <td className="p-4 text-center">
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                          {prod.gstPercent}% GST
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <span
                            className={`font-mono font-bold px-2 py-1 rounded-lg text-xs ${
                              isLowStock
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-slate-100 text-slate-800 border border-slate-200'
                            }`}
                          >
                            {prod.stockQuantity ?? 20} tags
                          </span>
                          {isLowStock && (
                            <span className="text-[10px] bg-amber-500 text-white font-bold px-1.5 py-0.5 rounded uppercase">
                              Low
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handlePrintBarcodeSticker(prod)}
                            className="p-1.5 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 rounded-lg transition-colors border border-amber-500/20"
                            title="Print Barcode Tag Stickers"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(prod)}
                            className="p-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200"
                            title="Edit Item"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onDeleteProduct(prod.id)}
                            className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200"
                            title="Delete Item"
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

      {/* REGISTER / EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 my-8">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shirt className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-lg">
                  {editingProduct ? 'Edit Garment / Clothing Item' : 'Register New Clothing Product'}
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

              {/* Product Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Product / Garment Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Men Cotton Formal Shirt (Size L) - Blue"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>

              {/* Size & Fabric Quick Chips */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 text-[11px]">Quick Add Sizes to Name:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {APPAREL_SIZES.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => appendToName(`(${sz})`)}
                      className="px-2 py-0.5 bg-white hover:bg-indigo-50 hover:text-indigo-600 border border-slate-300 rounded text-[10px] font-bold text-slate-700 transition-colors"
                    >
                      +{sz}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="font-bold text-slate-700 text-[11px]">Quick Add Fabrics:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {APPAREL_FABRICS.map((fb) => (
                    <button
                      key={fb}
                      type="button"
                      onClick={() => appendToName(fb)}
                      className="px-2 py-0.5 bg-white hover:bg-indigo-50 hover:text-indigo-600 border border-slate-300 rounded text-[10px] font-bold text-slate-700 transition-colors"
                    >
                      +{fb}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Category Dropdown + Input */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Apparel Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-semibold"
                  >
                    {APPAREL_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    {!APPAREL_CATEGORIES.includes(formCategory) && (
                      <option value={formCategory}>{formCategory}</option>
                    )}
                  </select>
                </div>

                {/* Barcode Value */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">Tag Barcode Value *</label>
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

                {/* MRP */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">MRP (₹) *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formMrp}
                    onChange={(e) => handleMrpChange(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold"
                  />
                </div>

                {/* Selling Price */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formSellingPrice}
                    onChange={(e) => setFormSellingPrice(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-900"
                  />
                </div>

                {/* GST Rate */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">GST Rate (%)</label>
                    <span className="text-[9px] text-indigo-600 font-bold">
                      {formMrp <= 1000 ? '5% (MRP ≤ ₹1k)' : '12% (MRP > ₹1k)'}
                    </span>
                  </div>
                  <select
                    value={formGstPercent}
                    onChange={(e) => setFormGstPercent(parseInt(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold"
                  >
                    <option value={5}>5% GST (Apparel ≤ ₹1000)</option>
                    <option value={12}>12% GST (Apparel &gt; ₹1000)</option>
                    <option value={0}>0% (Exempt)</option>
                    <option value={18}>18% GST</option>
                    <option value={28}>28% GST</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as 'active' | 'inactive')}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="active font-bold text-emerald-600">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {/* Stock Quantity */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Barcode Tags / Stock Qty *
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formStockQuantity}
                    onChange={(e) => setFormStockQuantity(parseInt(e.target.value) || 0)}
                    placeholder="e.g. 20"
                    className="w-full p-2.5 border border-indigo-200 bg-indigo-50/50 rounded-xl font-bold text-indigo-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Low Stock Threshold */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Low Stock Alert Limit
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

              {/* Live Barcode Preview */}
              {formBarcode && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                  <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase">
                    Garment Barcode Tag Preview
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
                  Save Garment Product
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
