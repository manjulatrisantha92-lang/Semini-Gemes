import React, { useState, useMemo, useRef } from 'react';
import {
  Search,
  Plus,
  Filter,
  Download,
  Upload,
  Edit2,
  Trash2,
  Barcode,
  Gem,
  CheckCircle,
  AlertTriangle,
  FileSpreadsheet,
  X,
  ExternalLink,
  Printer,
  FolderTree,
  Image as ImageIcon,
  ImageOff,
  Camera,
  UploadCloud,
  Sparkles,
  Check,
} from 'lucide-react';
import {
  Product,
  ProductCategory,
  GemstoneType,
  WorkshopStatus,
  AppSettings,
} from '../../types';
import { StorageService } from '../../services/storage';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';
import { CategoryManagerModal } from './CategoryManagerModal';

interface InventoryViewProps {
  products: Product[];
  settings: AppSettings;
  onRefresh: () => void;
  onOpenBarcodeScanner: () => void;
}

const GEMSTONES: GemstoneType[] = [
  'Blue Sapphire (Ceylon)',
  'Padparadscha Sapphire',
  'Yellow Sapphire',
  'Star Sapphire',
  'Ruby',
  'Emerald',
  'Diamond',
  'Alexandrite',
  'Cat\'s Eye',
  'Tourmaline',
  'Spinel',
  'Aquamarine',
  'Garnet',
  'Topaz',
  'Amethyst',
  'Moonstone (Meetiyagoda)',
  'Zircon',
  'None',
];

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  settings,
  onRefresh,
  onOpenBarcodeScanner,
}) => {
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedWorkshopStatus, setSelectedWorkshopStatus] = useState<string>('All');
  const [selectedStockLevel, setSelectedStockLevel] = useState<string>('All');

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Dynamic Categories and Optional Item Details state
  const [categories, setCategories] = useState<string[]>(() =>
    StorageService.getProductCategories()
  );
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [includeGemstoneDetails, setIncludeGemstoneDetails] = useState(false);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<ProductCategory>('Rings');
  const [formItemCode, setFormItemCode] = useState('');
  const [formBarcode, setFormBarcode] = useState('');
  
  // Image vs Non-Image Option States
  const [imageOptionMode, setImageOptionMode] = useState<'image' | 'no_image'>('image');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formImageFileName, setFormImageFileName] = useState('');
  const [isDraggingProductImage, setIsDraggingProductImage] = useState(false);
  const productImageFileInputRef = useRef<HTMLInputElement>(null);

  // Filter for Media (All / With Image / Non-Image)
  const [selectedMediaFilter, setSelectedMediaFilter] = useState<'all' | 'with_image' | 'no_image'>('all');

  const [formGemstoneType, setFormGemstoneType] = useState<GemstoneType>('Blue Sapphire (Ceylon)');
  const [formGemCut, setFormGemCut] = useState('Cushion Mixed Cut');
  const [formGemColor, setFormGemColor] = useState('Royal Blue');
  const [formGemClarity, setFormGemClarity] = useState('VVS1');
  const [formGemOrigin, setFormGemOrigin] = useState('Ratnapura, Sri Lanka');
  const [formGemTreatment, setFormGemTreatment] = useState('Unheated / Natural');
  const [formGemCarats, setFormGemCarats] = useState<number>(0);
  const [formGoldPurity, setFormGoldPurity] = useState<'24K' | '22K' | '18K' | '14K' | '925 Silver' | 'Platinum' | 'None'>('18K');
  const [formGrossWeight, setFormGrossWeight] = useState<number>(0);
  const [formNetGoldWeight, setFormNetGoldWeight] = useState<number>(0);
  const [formCostPrice, setFormCostPrice] = useState<number>(0);
  const [formSellingPrice, setFormSellingPrice] = useState<number>(0);
  const [formStockQuantity, setFormStockQuantity] = useState<number>(1);
  const [formWorkshopStatus, setFormWorkshopStatus] = useState<WorkshopStatus>('in_store');
  const [formNotes, setFormNotes] = useState('');

  // Sample jewelry JPG presets for quick testing
  const SAMPLE_PRODUCT_IMAGES = [
    {
      label: 'Sapphire Ring',
      url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&auto=format&fit=crop&q=80',
    },
    {
      label: 'Diamond Band',
      url: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=500&auto=format&fit=crop&q=80',
    },
    {
      label: 'Emerald Pendant',
      url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&auto=format&fit=crop&q=80',
    },
    {
      label: 'Ruby Earrings',
      url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&auto=format&fit=crop&q=80',
    },
    {
      label: 'Gold Bangle',
      url: 'https://images.unsplash.com/photo-1611591475836-7c0a9e70d4bf?w=500&auto=format&fit=crop&q=80',
    },
  ];

  // Handle local JPG/PNG image upload via FileReader
  const handleProductImageFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid JPG or PNG image file.', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image file size exceeds 5MB. Please choose a smaller JPG.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setFormImageUrl(dataUrl);
      setFormImageFileName(file.name);
      setImageOptionMode('image');
      showToast(`Product image "${file.name}" attached successfully!`, 'success');
    };
    reader.readAsDataURL(file);
  };

  // Barcode Tag Print Modal state
  const [tagPrintProduct, setTagPrintProduct] = useState<Product | null>(null);

  // Refresh categories
  const handleCategoriesUpdated = () => {
    const updated = StorageService.getProductCategories();
    setCategories(updated);
    if (!updated.includes(formCategory) && updated.length > 0) {
      setFormCategory(updated[0]);
    }
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        searchTerm === '' ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.gemstoneType.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory = selectedCategory === 'All' || p.category === selectedCategory;

      const matchWorkshop =
        selectedWorkshopStatus === 'All' || p.workshopStatus === selectedWorkshopStatus;

      const matchStock =
        selectedStockLevel === 'All' ||
        (selectedStockLevel === 'low_stock' && p.stockQuantity <= 2 && p.stockQuantity > 0) ||
        (selectedStockLevel === 'out_of_stock' && p.stockQuantity === 0) ||
        (selectedStockLevel === 'in_stock' && p.stockQuantity > 2);

      const matchMedia =
        selectedMediaFilter === 'all' ||
        (selectedMediaFilter === 'with_image' && Boolean(p.imageUrl)) ||
        (selectedMediaFilter === 'no_image' && !p.imageUrl);

      return matchSearch && matchCategory && matchWorkshop && matchStock && matchMedia;
    });
  }, [products, searchTerm, selectedCategory, selectedWorkshopStatus, selectedStockLevel, selectedMediaFilter]);

  // Open Create Form
  const handleOpenCreate = () => {
    const currentCats = StorageService.getProductCategories();
    setCategories(currentCats);
    const defaultCat = currentCats[0] || 'Rings';
    setEditingProduct(null);
    setFormName('');
    setFormCategory(defaultCat);
    setFormItemCode(`JWL-RNG-${Math.floor(100 + Math.random() * 900)}`);
    setFormBarcode(StorageService.generateNextBarcode());
    setImageOptionMode('image');
    setFormImageUrl('');
    setFormImageFileName('');
    setIncludeGemstoneDetails(false);
    setFormGemstoneType('Blue Sapphire (Ceylon)');
    setFormGemCut('Oval Brilliant');
    setFormGemColor('Vivid Cornflower Blue');
    setFormGemClarity('VVS');
    setFormGemOrigin('Ratnapura, Sri Lanka');
    setFormGemTreatment('Natural Unheated');
    setFormGemCarats(2.5);
    setFormGoldPurity('18K');
    setFormGrossWeight(6.5);
    setFormNetGoldWeight(6.0);
    setFormCostPrice(250000);
    setFormSellingPrice(380000);
    setFormStockQuantity(2);
    setFormWorkshopStatus('in_store');
    setFormNotes('Certified genuine jewelry piece.');
    setIsModalOpen(true);
  };

  // Open Edit Form
  const handleOpenEdit = (p: Product) => {
    const currentCats = StorageService.getProductCategories();
    setCategories(currentCats);
    setEditingProduct(p);
    setFormName(p.name);
    setFormCategory(p.category);
    setFormItemCode(p.itemCode);
    setFormBarcode(p.barcode);
    if (p.imageUrl) {
      setImageOptionMode('image');
      setFormImageUrl(p.imageUrl);
    } else {
      setImageOptionMode('no_image');
      setFormImageUrl('');
    }
    setFormImageFileName('');
    const hasGem = (p.gemstoneType && p.gemstoneType !== 'None') || (p.gemstoneDetails?.carats || 0) > 0;
    setIncludeGemstoneDetails(Boolean(hasGem));
    setFormGemstoneType(p.gemstoneType);
    setFormGemCut(p.gemstoneDetails?.cut || '');
    setFormGemColor(p.gemstoneDetails?.color || '');
    setFormGemClarity(p.gemstoneDetails?.clarity || '');
    setFormGemOrigin(p.gemstoneDetails?.origin || '');
    setFormGemTreatment(p.gemstoneDetails?.treatment || '');
    setFormGemCarats(p.gemstoneDetails?.carats || 0);
    setFormGoldPurity(p.goldPurity || '18K');
    setFormGrossWeight(p.grossWeightGrams);
    setFormNetGoldWeight(p.netGoldWeightGrams || 0);
    setFormCostPrice(p.costPriceLKR);
    setFormSellingPrice(p.sellingPriceLKR);
    setFormStockQuantity(p.stockQuantity);
    setFormWorkshopStatus(p.workshopStatus);
    setFormNotes(p.notes || '');
    setIsModalOpen(true);
  };

  // Save Product (Supports Save & Close or Save & New)
  const handleSaveProduct = (e?: React.FormEvent, andClose: boolean = true) => {
    if (e) e.preventDefault();
    if (!formName.trim() || !formItemCode.trim()) {
      showToast('Please enter both Product Name and Item Code.', 'error');
      return;
    }

    const finalImageUrl = imageOptionMode === 'no_image' ? '' : formImageUrl.trim();

    const productData: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      name: formName.trim(),
      category: formCategory,
      itemCode: formItemCode.trim(),
      barcode: formBarcode.trim() || StorageService.generateNextBarcode(),
      imageUrl: finalImageUrl,
      gemstoneType: includeGemstoneDetails ? formGemstoneType : 'None',
      gemstoneDetails: includeGemstoneDetails
        ? {
            carats: Number(formGemCarats) || undefined,
            cut: formGemCut,
            color: formGemColor,
            clarity: formGemClarity,
            origin: formGemOrigin,
            treatment: formGemTreatment,
          }
        : {},
      goldPurity: formGoldPurity,
      grossWeightGrams: Number(formGrossWeight),
      netGoldWeightGrams: Number(formNetGoldWeight),
      gemWeightCarats: includeGemstoneDetails ? Number(formGemCarats) : 0,
      costPriceLKR: Number(formCostPrice),
      sellingPriceLKR: Number(formSellingPrice),
      stockQuantity: Number(formStockQuantity),
      workshopStatus: formWorkshopStatus,
      status: Number(formStockQuantity) === 0 ? 'out_of_stock' : Number(formStockQuantity) <= 2 ? 'low_stock' : 'active',
      notes: formNotes,
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    if (editingProduct) {
      StorageService.updateProduct(productData);
      showToast(`Product "${productData.name}" updated successfully!`, 'success');
      setIsModalOpen(false);
    } else {
      StorageService.addProduct(productData);
      if (andClose) {
        showToast(`New product "${productData.name}" added to inventory!`, 'success');
        setIsModalOpen(false);
      } else {
        showToast(`Product "${productData.name}" saved! Ready for next item.`, 'success');
        // Reset form for next item
        const nextNum = Math.floor(100 + Math.random() * 900);
        const catPrefix = formCategory.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase() || 'JWL';
        setFormName('');
        setFormItemCode(`JWL-${catPrefix}-${nextNum}`);
        setFormBarcode(StorageService.generateNextBarcode());
        setFormGrossWeight(0);
        setFormNetGoldWeight(0);
        setFormCostPrice(0);
        setFormSellingPrice(0);
        setFormStockQuantity(1);
        setFormNotes('');
        setIncludeGemstoneDetails(false);
      }
    }

    onRefresh();
  };

  // Delete Product
  const handleDeleteProduct = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete product "${name}"?`)) {
      StorageService.deleteProduct(id);
      showToast(`Product "${name}" deleted.`, 'info');
      onRefresh();
    }
  };

  // Export to Excel / CSV
  const handleExportCSV = () => {
    const headers = [
      'Item Code',
      'Barcode',
      'Name',
      'Category',
      'Gemstone',
      'Gem Carats',
      'Gold Purity',
      'Gross Wt (g)',
      'Cost (LKR)',
      'Selling (LKR)',
      'Stock Qty',
      'Workshop Status',
    ];

    const rows = products.map((p) => [
      `"${p.itemCode}"`,
      `"${p.barcode}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      `"${p.gemstoneType}"`,
      p.gemWeightCarats || 0,
      `"${p.goldPurity || ''}"`,
      p.grossWeightGrams,
      p.costPriceLKR,
      p.sellingPriceLKR,
      p.stockQuantity,
      `"${p.workshopStatus}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `WCS_Jewelry_Inventory_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Inventory exported to CSV/Excel format!', 'success');
  };

  // Import JSON / CSV handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            parsed.forEach((item: Product) => StorageService.addProduct(item));
            showToast(`Imported ${parsed.length} items successfully!`, 'success');
            onRefresh();
          }
        } else {
          showToast('JSON format currently parsed for advanced import.', 'info');
        }
      } catch (err) {
        showToast('Failed to import file. Please check file format.', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100 font-serif flex items-center gap-2">
            <Gem className="w-6 h-6 text-amber-400" />
            Jewelry & Gemstone Inventory
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time stock valuation, Ceylon gemstone specifications, and workshop status
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Barcode scanner trigger */}
          <button
            onClick={onOpenBarcodeScanner}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors"
          >
            <Barcode className="w-4 h-4 text-amber-400" />
            <span>Scan Code</span>
          </button>

          {/* Export to Excel */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors"
            title="Export products to CSV/Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export Excel</span>
          </button>

          {/* Import Products */}
          <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer">
            <Upload className="w-4 h-4 text-sky-400" />
            <span>Import</span>
            <input
              type="file"
              accept=".json,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Manage Categories Button */}
          <button
            onClick={() => setIsCategoriesModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-lg text-xs font-semibold transition-colors"
            title="Create, edit, or remove product categories"
          >
            <FolderTree className="w-4 h-4 text-amber-400" />
            <span>Categories</span>
          </button>

          {/* Add Product Button */}
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 font-bold rounded-lg text-xs shadow-md shadow-amber-950/30 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search barcode, name, code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            >
              <option value="All">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Workshop Status Filter */}
          <div>
            <select
              value={selectedWorkshopStatus}
              onChange={(e) => setSelectedWorkshopStatus(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            >
              <option value="All">All Workshop Statuses</option>
              <option value="in_store">In Showroom Store</option>
              <option value="in_workshop">In Workshop Setting</option>
              <option value="finished_workshop">Finished from Workshop</option>
              <option value="on_order">Custom On Order</option>
            </select>
          </div>

          {/* Stock Level Filter */}
          <div>
            <select
              value={selectedStockLevel}
              onChange={(e) => setSelectedStockLevel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            >
              <option value="All">All Stock Levels</option>
              <option value="in_stock">In Stock (&gt; 2)</option>
              <option value="low_stock">Low Stock (≤ 2)</option>
              <option value="out_of_stock">Out of Stock (0)</option>
            </select>
          </div>

          {/* Media / Photo Filter (Image vs Non-Image) */}
          <div>
            <select
              value={selectedMediaFilter}
              onChange={(e) => setSelectedMediaFilter(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Items (All Media)</option>
              <option value="with_image">With JPG Photo</option>
              <option value="no_image">Non-Image (Text Only)</option>
            </select>
          </div>
        </div>

        {/* Filter Summary Tags */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span>
            Displaying <strong className="text-slate-200">{filteredProducts.length}</strong> of{' '}
            {products.length} catalog items
          </span>
          {(searchTerm || selectedCategory !== 'All' || selectedWorkshopStatus !== 'All' || selectedStockLevel !== 'All' || selectedMediaFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
                setSelectedWorkshopStatus('All');
                setSelectedStockLevel('All');
                setSelectedMediaFilter('all');
              }}
              className="text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Inventory Products Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/70 text-[11px] uppercase font-mono text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Item</th>
                <th className="py-3 px-3">Code / Barcode</th>
                <th className="py-3 px-3">Gemstone & Specs</th>
                <th className="py-3 px-3 text-right">Gross / Net Wt</th>
                <th className="py-3 px-3 text-right">Cost (LKR)</th>
                <th className="py-3 px-3 text-right">Selling (LKR)</th>
                <th className="py-3 px-3 text-center">Stock</th>
                <th className="py-3 px-3 text-center">Workshop</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <Gem className="w-8 h-8 mx-auto mb-2 opacity-40 text-amber-400" />
                    <p className="text-sm font-semibold text-slate-400">No products found</p>
                    <p className="text-xs text-slate-500">Try adjusting your search criteria or add a new product</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-850/50 transition-colors">
                    {/* Item Image & Title (Very Small Size or Non-Image Badge) */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        {p.imageUrl ? (
                          <div className="relative group shrink-0">
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              referrerPolicy="no-referrer"
                              className="w-7 h-7 rounded-md object-cover border border-slate-700/80 bg-slate-950 shrink-0 shadow-sm transition-transform hover:scale-125"
                            />
                          </div>
                        ) : (
                          <div
                            className="w-7 h-7 rounded-md bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 shrink-0"
                            title="Non-image item (Text only)"
                          >
                            <Gem className="w-3.5 h-3.5 text-slate-400/80" />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-slate-100 max-w-xs">{p.name}</div>
                          <div className="text-[11px] text-amber-400/90 flex items-center gap-1.5 mt-0.5">
                            <span>{p.category}</span>
                            {p.goldPurity && <span>• {p.goldPurity}</span>}
                            {!p.imageUrl && (
                              <span className="text-[9.5px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700/50">
                                Non-Image
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Code & Barcode */}
                    <td className="py-3 px-3">
                      <div className="font-mono text-amber-300 font-semibold">{p.itemCode}</div>
                      <div className="font-mono text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Barcode className="w-3 h-3 text-slate-500" />
                        <span>{p.barcode}</span>
                      </div>
                    </td>

                    {/* Gemstone specs */}
                    <td className="py-3 px-3">
                      <div className="text-slate-200 font-medium truncate max-w-xs">
                        {p.gemstoneType !== 'None' ? p.gemstoneType : 'Plain Gold Jewelry'}
                      </div>
                      {p.gemWeightCarats && p.gemWeightCarats > 0 ? (
                        <div className="text-[11px] text-slate-400">
                          {p.gemWeightCarats} ct • {p.gemstoneDetails.cut || 'Custom Cut'}
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-500">Solid Precious Metal</div>
                      )}
                    </td>

                    {/* Weights */}
                    <td className="py-3 px-3 text-right">
                      <div className="font-mono text-slate-200">{p.grossWeightGrams}g gross</div>
                      {p.netGoldWeightGrams && (
                        <div className="text-[11px] text-slate-400 font-mono">
                          {p.netGoldWeightGrams}g net Au
                        </div>
                      )}
                    </td>

                    {/* Cost Price */}
                    <td className="py-3 px-3 text-right font-mono text-slate-400">
                      {StorageService.formatLKR(p.costPriceLKR)}
                    </td>

                    {/* Selling Price */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-amber-300">
                      {StorageService.formatLKR(p.sellingPriceLKR)}
                    </td>

                    {/* Stock Qty */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold font-mono ${
                          p.stockQuantity === 0
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : p.stockQuantity <= 2
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {p.stockQuantity} in stock
                      </span>
                    </td>

                    {/* Workshop Status */}
                    <td className="py-3 px-3 text-center">
                      <span className="text-[10px] px-2 py-0.5 rounded uppercase font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {p.workshopStatus.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setTagPrintProduct(p)}
                          className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded transition-colors"
                          title="Print Barcode Tag"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded transition-colors"
                          title="Edit product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Jewelry / Gem Item' : 'Add New Jewelry / Gem Item'}
        subtitle="Specify Ceylon gemstone properties, gold weights, barcode, and workshop tracking"
        maxWidth="4xl"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Jewelry Name */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Jewelry / Gemstone Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ceylon Royal Blue Sapphire Solitaire Ring"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-100 focus:border-amber-500"
              />
            </div>

            {/* Category */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300 uppercase">Category *</label>
                <button
                  type="button"
                  onClick={() => setIsCategoriesModalOpen(true)}
                  className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-0.5"
                  title="Manage categories"
                >
                  <FolderTree className="w-3 h-3" />
                  <span>Manage</span>
                </button>
              </div>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as ProductCategory)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Item Code */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Item Code *
              </label>
              <input
                type="text"
                required
                value={formItemCode}
                onChange={(e) => setFormItemCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono"
              />
            </div>

            {/* Barcode */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300 uppercase">Barcode *</label>
                <button
                  type="button"
                  onClick={() => setFormBarcode(StorageService.generateNextBarcode())}
                  className="text-[10px] text-amber-400 hover:text-amber-300 cursor-pointer"
                >
                  Generate
                </button>
              </div>
              <input
                type="text"
                required
                value={formBarcode}
                onChange={(e) => setFormBarcode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono"
              />
            </div>
          </div>

          {/* Product Image (JPG/PNG) vs Non-Image Option */}
          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Product Image Option (JPG / Non-Image)
                </span>
              </div>

              {/* Mode Toggle Pills: Image vs Non-Image */}
              <div className="flex items-center p-0.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setImageOptionMode('image')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    imageOptionMode === 'image'
                      ? 'bg-amber-500 text-black shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Attach JPG Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setImageOptionMode('no_image');
                    setFormImageUrl('');
                    setFormImageFileName('');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    imageOptionMode === 'no_image'
                      ? 'bg-slate-700 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ImageOff className="w-3.5 h-3.5" />
                  <span>Non-Image (No Photo)</span>
                </button>
              </div>
            </div>

            {imageOptionMode === 'image' ? (
              <div className="space-y-3">
                {/* File Upload Zone / Drag & Drop */}
                <input
                  ref={productImageFileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleProductImageFileUpload(file);
                  }}
                />

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingProductImage(true);
                  }}
                  onDragLeave={() => setIsDraggingProductImage(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingProductImage(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleProductImageFileUpload(file);
                  }}
                  onClick={() => productImageFileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-3.5 flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    isDraggingProductImage
                      ? 'border-amber-400 bg-amber-500/10'
                      : formImageUrl
                      ? 'border-emerald-500/40 bg-emerald-950/10 hover:border-emerald-500/70'
                      : 'border-slate-700 hover:border-amber-500/60 bg-slate-900/50 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {formImageUrl ? (
                      <div className="relative shrink-0">
                        <img
                          src={formImageUrl}
                          alt="Product preview"
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-lg object-cover border border-amber-500/50 bg-slate-950 shadow-md"
                        />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-slate-950 text-[10px] font-bold">
                          ✓
                        </div>
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center text-amber-400/80 shrink-0">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                    )}
                    <div className="text-left">
                      <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                        {formImageUrl ? 'JPG Image Attached' : 'Upload Product JPG File'}
                        {formImageFileName && (
                          <span className="text-[10px] text-amber-400 font-mono font-normal">
                            ({formImageFileName})
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {formImageUrl
                          ? 'Click or drag a new file here to replace this image'
                          : 'Drag & drop image here or click to browse (JPG, PNG max 5MB)'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {formImageUrl && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormImageUrl('');
                          setFormImageFileName('');
                        }}
                        className="px-2.5 py-1 bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        productImageFileInputRef.current?.click();
                      }}
                      className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      {formImageUrl ? 'Change' : 'Browse'}
                    </button>
                  </div>
                </div>

                {/* Direct Image URL & Preset Pickers */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase">
                      Or Paste Image URL directly:
                    </label>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <span>Quick Presets:</span>
                      {SAMPLE_PRODUCT_IMAGES.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            setFormImageUrl(preset.url);
                            setFormImageFileName('');
                            setImageOptionMode('image');
                          }}
                          className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 border border-slate-700 transition-colors cursor-pointer"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={formImageUrl}
                    onChange={(e) => {
                      setFormImageUrl(e.target.value);
                      setFormImageFileName('');
                      if (e.target.value.trim()) {
                        setImageOptionMode('image');
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-lg text-xs text-slate-400">
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                  <ImageOff className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-slate-300">Non-Image Product Selected</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    This item will be saved without a photo. Ideal for standard bullion, gold coins, raw gold weight, or fast catalog entry.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Gemstone Specifications Sub-Panel (Optional) */}
          <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Gem className="w-3.5 h-3.5" />
                <span>Gemstone &amp; Ceylon Lab Details (Optional)</span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={includeGemstoneDetails}
                  onChange={(e) => {
                    setIncludeGemstoneDetails(e.target.checked);
                    if (!e.target.checked) {
                      setFormGemstoneType('None');
                      setFormGemCarats(0);
                    } else if (formGemstoneType === 'None') {
                      setFormGemstoneType('Blue Sapphire (Ceylon)');
                    }
                  }}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-900 w-3.5 h-3.5"
                />
                <span>Include Gemstone Specs</span>
              </label>
            </div>

            {includeGemstoneDetails && (
              <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Gemstone Variety</label>
                  <select
                    value={formGemstoneType}
                    onChange={(e) => setFormGemstoneType(e.target.value as GemstoneType)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100"
                  >
                    {GEMSTONES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Carat Weight (ct)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formGemCarats}
                    onChange={(e) => setFormGemCarats(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Cut &amp; Shape</label>
                  <input
                    type="text"
                    placeholder="e.g. Cushion Mixed Cut"
                    value={formGemCut}
                    onChange={(e) => setFormGemCut(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Color / Tone</label>
                  <input
                    type="text"
                    placeholder="e.g. Vivid Royal Blue"
                    value={formGemColor}
                    onChange={(e) => setFormGemColor(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Clarity Grade</label>
                  <input
                    type="text"
                    placeholder="e.g. VVS1 (Eye Clean)"
                    value={formGemClarity}
                    onChange={(e) => setFormGemClarity(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Origin</label>
                  <input
                    type="text"
                    placeholder="Ratnapura / Elahera, Sri Lanka"
                    value={formGemOrigin}
                    onChange={(e) => setFormGemOrigin(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Treatment</label>
                  <input
                    type="text"
                    placeholder="Natural Unheated"
                    value={formGemTreatment}
                    onChange={(e) => setFormGemTreatment(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Gold Purity, Weight and Costing */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Gold Purity</label>
              <select
                value={formGoldPurity}
                onChange={(e) =>
                  setFormGoldPurity(
                    e.target.value as '24K' | '22K' | '18K' | '14K' | '925 Silver' | 'Platinum'
                  )
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
              >
                <option value="22K">22K Gold</option>
                <option value="18K">18K Gold</option>
                <option value="24K">24K Pure Gold</option>
                <option value="14K">14K Gold</option>
                <option value="925 Silver">925 Sterling Silver</option>
                <option value="Platinum">Platinum 950</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Gross Wt (g)</label>
              <input
                type="number"
                step="0.01"
                required
                value={formGrossWeight}
                onChange={(e) => setFormGrossWeight(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Net Au Wt (g)</label>
              <input
                type="number"
                step="0.01"
                value={formNetGoldWeight}
                onChange={(e) => setFormNetGoldWeight(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Cost (LKR) *</label>
              <input
                type="number"
                required
                value={formCostPrice}
                onChange={(e) => setFormCostPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Selling (LKR) *</label>
              <input
                type="number"
                required
                value={formSellingPrice}
                onChange={(e) => setFormSellingPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Stock Qty *</label>
              <input
                type="number"
                min="0"
                required
                value={formStockQuantity}
                onChange={(e) => setFormStockQuantity(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Workshop Setting Status
              </label>
              <select
                value={formWorkshopStatus}
                onChange={(e) => setFormWorkshopStatus(e.target.value as WorkshopStatus)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
              >
                <option value="in_store">In Showroom Store (Ready for sale)</option>
                <option value="in_workshop">In Workshop (Setting / Polishing)</option>
                <option value="finished_workshop">Finished from Workshop (QC Pending)</option>
                <option value="on_order">Custom Order</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Product Notes & Certification
              </label>
              <input
                type="text"
                placeholder="e.g. GIA/NGJA lab tested, laser engraved hallmark..."
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
              />
            </div>
          </div>

          {/* Modal Actions */}
          {editingProduct ? (
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={(e) => handleSaveProduct(e, true)}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-xs shadow-md shadow-amber-900/30 transition-all flex items-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Update Product</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {/* Save and New button */}
                <button
                  type="button"
                  onClick={(e) => handleSaveProduct(e, false)}
                  className="flex-1 sm:flex-none px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/50 hover:border-amber-400 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
                  title="Save this product and stay in form to add another item"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Save &amp; New</span>
                </button>

                {/* Save and Close button */}
                <button
                  type="button"
                  onClick={(e) => handleSaveProduct(e, true)}
                  className="flex-1 sm:flex-none px-5 py-2 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-slate-950 font-bold rounded-lg text-xs shadow-md shadow-amber-900/30 flex items-center justify-center gap-1.5 transition-all active:scale-95"
                  title="Save product and close dialog"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Save &amp; Close</span>
                </button>
              </div>
            </div>
          )}
        </form>
      </Modal>

      {/* Product Category Manager Modal */}
      <CategoryManagerModal
        isOpen={isCategoriesModalOpen}
        onClose={() => setIsCategoriesModalOpen(false)}
        products={products}
        onCategoriesUpdated={handleCategoriesUpdated}
      />

      {/* Barcode Tag Print Modal */}
      {tagPrintProduct && (
        <Modal
          isOpen={true}
          onClose={() => setTagPrintProduct(null)}
          title="Print Jewelry Tag & Barcode"
          subtitle="Jewelry boutique dual-sided dumbbell price tag"
          maxWidth="sm"
        >
          <div className="space-y-4 text-center">
            <div className="p-4 bg-white text-slate-900 rounded-xl border border-slate-300 shadow-inner inline-block mx-auto text-left w-64 font-sans">
              <div className="border-b border-dashed border-slate-400 pb-2 mb-2 text-center">
                <div className="font-bold text-xs uppercase tracking-wider">{settings.companyName}</div>
                <div className="text-[10px] text-slate-600">Colombo • Sri Lanka</div>
              </div>

              <div className="space-y-1 text-xs">
                <div className="font-bold text-slate-900 truncate">{tagPrintProduct.name}</div>
                <div className="flex justify-between text-[11px] text-slate-700">
                  <span>Code: <strong>{tagPrintProduct.itemCode}</strong></span>
                  <span>{tagPrintProduct.goldPurity}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-700">
                  <span>Gross: {tagPrintProduct.grossWeightGrams}g</span>
                  {tagPrintProduct.gemWeightCarats ? <span>Gem: {tagPrintProduct.gemWeightCarats}ct</span> : null}
                </div>
                <div className="pt-1 text-center font-mono font-bold text-sm text-slate-950 border-t border-slate-300 mt-1">
                  Rs. {tagPrintProduct.sellingPriceLKR.toLocaleString()}
                </div>
              </div>

              {/* Barcode representation */}
              <div className="mt-3 text-center">
                <div className="font-mono tracking-widest text-[9px] text-slate-700 mb-0.5">
                  ||| | |||| | || ||| || ||||
                </div>
                <div className="font-mono text-[10px] text-slate-800 tracking-wider">
                  {tagPrintProduct.barcode}
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-amber-600 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                Print Tag
              </button>
              <button
                onClick={() => setTagPrintProduct(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
