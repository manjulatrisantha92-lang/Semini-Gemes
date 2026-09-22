import React, { useState, useRef } from 'react';
import {
  ShoppingBag,
  Undo2,
  Plus,
  Search,
  Calendar,
  DollarSign,
  FileText,
  UploadCloud,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Trash2,
  Printer,
  X,
  ExternalLink,
  ShieldCheck,
  Building2,
  Package,
  Layers,
  ArrowUpRight,
  Maximize2,
  Check,
  CreditCard,
} from 'lucide-react';
import {
  AppSettings,
  PaymentMethod,
  Product,
  PurchaseOrder,
  PurchaseReturn,
  User,
} from '../../types';
import { StorageService } from '../../services/storage';
import { ExpensesManager } from './ExpensesManager';
import { PayoutsManager } from './PayoutsManager';

interface PurchasesFinanceViewProps {
  products: Product[];
  settings: AppSettings;
  currentUser?: User | null;
  initialTab?: 'orders' | 'returns' | 'expenses' | 'payouts' | 'ledger';
  onRefreshProducts?: () => void;
}

export const PurchasesFinanceView: React.FC<PurchasesFinanceViewProps> = ({
  products,
  settings,
  currentUser,
  initialTab = 'orders',
  onRefreshProducts,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'returns' | 'expenses' | 'payouts' | 'ledger'>(
    initialTab
  );
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() =>
    StorageService.getPurchaseOrders()
  );
  const [purchaseReturns, setPurchaseReturns] = useState<PurchaseReturn[]>(() =>
    StorageService.getPurchaseReturns()
  );

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  // Modals
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [isNewReturnModalOpen, setIsNewReturnModalOpen] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<PurchaseOrder | null>(null);
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);

  // New Order Form State
  const [newOrder, setNewOrder] = useState<{
    poNumber: string;
    supplierInvoiceNo: string;
    supplierName: string;
    supplierPhone: string;
    date: string;
    items: {
      name: string;
      category: string;
      quantity: number;
      weightGrams: number;
      carats: number;
      unitCostLKR: number;
      goldPurity: string;
    }[];
    paymentMethod: PaymentMethod;
    paymentStatus: 'paid' | 'partial' | 'unpaid';
    paidAmountLKR: number;
    invoiceImageUrl: string;
    notes: string;
    autoAddToInventory: boolean;
  }>({
    poNumber: `PO-${new Date().getFullYear()}-${String(purchaseOrders.length + 1).padStart(3, '0')}`,
    supplierInvoiceNo: '',
    supplierName: '',
    supplierPhone: '',
    date: new Date().toISOString().split('T')[0],
    items: [
      {
        name: '',
        category: 'Loose Gemstones',
        quantity: 1,
        weightGrams: 0,
        carats: 0,
        unitCostLKR: 0,
        goldPurity: 'None',
      },
    ],
    paymentMethod: 'Bank Transfer',
    paymentStatus: 'paid',
    paidAmountLKR: 0,
    invoiceImageUrl: '',
    notes: '',
    autoAddToInventory: true,
  });

  // New Return Form State
  const [newReturn, setNewReturn] = useState<{
    returnNumber: string;
    purchaseOrderId: string;
    poNumber: string;
    supplierName: string;
    supplierCreditNoteNo: string;
    date: string;
    items: {
      name: string;
      quantity: number;
      reason: string;
      refundAmountLKR: number;
    }[];
    slipImageUrl: string;
    notes: string;
  }>({
    returnNumber: `PR-${new Date().getFullYear()}-${String(purchaseReturns.length + 1).padStart(3, '0')}`,
    purchaseOrderId: '',
    poNumber: '',
    supplierName: '',
    supplierCreditNoteNo: '',
    date: new Date().toISOString().split('T')[0],
    items: [
      {
        name: '',
        quantity: 1,
        reason: 'Defective clarity / weight discrepancy',
        refundAmountLKR: 0,
      },
    ],
    slipImageUrl: '',
    notes: '',
  });

  // Image Upload handler helper (converts uploaded file to base64 data url)
  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    callback: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        callback(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Calculations for Order Form
  const orderSubtotal = newOrder.items.reduce(
    (sum, item) => sum + item.quantity * item.unitCostLKR,
    0
  );

  const handleAddItemToOrder = () => {
    setNewOrder((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          name: '',
          category: 'Loose Gemstones',
          quantity: 1,
          weightGrams: 0,
          carats: 0,
          unitCostLKR: 0,
          goldPurity: 'None',
        },
      ],
    }));
  };

  const handleRemoveItemFromOrder = (index: number) => {
    if (newOrder.items.length <= 1) return;
    setNewOrder((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleSavePurchaseOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrder.supplierName.trim()) {
      alert('Please enter Supplier Name');
      return;
    }
    if (newOrder.items.some((it) => !it.name.trim() || it.unitCostLKR <= 0)) {
      alert('Please ensure all items have a description and valid unit cost.');
      return;
    }

    const calculatedTotal = newOrder.items.reduce(
      (sum, item) => sum + item.quantity * item.unitCostLKR,
      0
    );

    const paid =
      newOrder.paymentStatus === 'paid'
        ? calculatedTotal
        : newOrder.paymentStatus === 'unpaid'
        ? 0
        : newOrder.paidAmountLKR;

    const orderToSave: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber: newOrder.poNumber,
      supplierInvoiceNo: newOrder.supplierInvoiceNo || undefined,
      supplierName: newOrder.supplierName,
      supplierPhone: newOrder.supplierPhone,
      date: newOrder.date,
      items: newOrder.items.map((it) => ({
        name: it.name,
        category: it.category,
        quantity: Number(it.quantity) || 1,
        weightGrams: Number(it.weightGrams) || undefined,
        carats: Number(it.carats) || undefined,
        unitCostLKR: Number(it.unitCostLKR) || 0,
        totalLKR: (Number(it.quantity) || 1) * (Number(it.unitCostLKR) || 0),
        goldPurity: it.goldPurity !== 'None' ? it.goldPurity : undefined,
      })),
      totalAmountLKR: calculatedTotal,
      paidAmountLKR: paid,
      balanceDueLKR: Math.max(0, calculatedTotal - paid),
      paymentMethod: newOrder.paymentMethod,
      status: 'received',
      paymentStatus: newOrder.paymentStatus,
      invoiceImageUrl: newOrder.invoiceImageUrl || undefined,
      notes: newOrder.notes || undefined,
      autoAddedToInventory: newOrder.autoAddToInventory,
    };

    // Save to storage
    StorageService.addPurchaseOrder(orderToSave);

    // Optionally auto add items to Product Stock
    if (newOrder.autoAddToInventory) {
      newOrder.items.forEach((item, idx) => {
        const prodId = `prod-po-${Date.now()}-${idx}`;
        const itemCode = `WCS-IN-${new Date().getFullYear().toString().slice(-2)}${Math.floor(
          1000 + Math.random() * 9000
        )}`;
        const barcode = `890${Date.now().toString().slice(-8)}`;

        const newProduct: Product = {
          id: prodId,
          itemCode,
          barcode,
          name: item.name,
          category: item.category as any,
          imageUrl:
            newOrder.invoiceImageUrl ||
            'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=500&auto=format&fit=crop&q=80',
          gemstoneType: item.category === 'Loose Gemstones' ? 'Blue Sapphire (Ceylon)' : 'None',
          gemstoneDetails: {
            carats: item.carats > 0 ? item.carats : undefined,
            origin: 'Ratnapura, Sri Lanka',
          },
          goldPurity: item.goldPurity as any,
          grossWeightGrams: item.weightGrams > 0 ? item.weightGrams : 0,
          netGoldWeightGrams: item.weightGrams > 0 ? item.weightGrams : 0,
          gemWeightCarats: item.carats > 0 ? item.carats : 0,
          costPriceLKR: item.unitCostLKR,
          sellingPriceLKR: Math.round(item.unitCostLKR * 1.3), // default 30% markup
          stockQuantity: item.quantity,
          workshopStatus: 'in_store',
          status: item.quantity > 0 ? 'active' : 'low_stock',
          notes: `Purchased via ${orderToSave.poNumber} from ${orderToSave.supplierName}`,
          createdAt: newOrder.date,
          updatedAt: newOrder.date,
        };

        StorageService.addProduct(newProduct);
      });

      if (onRefreshProducts) {
        onRefreshProducts();
      }
    }

    setPurchaseOrders(StorageService.getPurchaseOrders());
    setIsNewOrderModalOpen(false);

    // Reset Form
    setNewOrder({
      poNumber: `PO-${new Date().getFullYear()}-${String(purchaseOrders.length + 2).padStart(3, '0')}`,
      supplierInvoiceNo: '',
      supplierName: '',
      supplierPhone: '',
      date: new Date().toISOString().split('T')[0],
      items: [
        {
          name: '',
          category: 'Loose Gemstones',
          quantity: 1,
          weightGrams: 0,
          carats: 0,
          unitCostLKR: 0,
          goldPurity: 'None',
        },
      ],
      paymentMethod: 'Bank Transfer',
      paymentStatus: 'paid',
      paidAmountLKR: 0,
      invoiceImageUrl: '',
      notes: '',
      autoAddToInventory: true,
    });
  };

  const handleSavePurchaseReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReturn.supplierName.trim()) {
      alert('Please select or specify Supplier / Purchase Order');
      return;
    }

    const totalRefund = newReturn.items.reduce(
      (sum, it) => sum + (Number(it.refundAmountLKR) || 0),
      0
    );

    const returnToSave: PurchaseReturn = {
      id: `pr-${Date.now()}`,
      returnNumber: newReturn.returnNumber,
      purchaseOrderId: newReturn.purchaseOrderId || 'custom',
      poNumber: newReturn.poNumber || 'N/A',
      supplierName: newReturn.supplierName,
      supplierCreditNoteNo: newReturn.supplierCreditNoteNo || undefined,
      date: newReturn.date,
      items: newReturn.items.map((it) => ({
        name: it.name,
        quantity: Number(it.quantity) || 1,
        reason: it.reason,
        refundAmountLKR: Number(it.refundAmountLKR) || 0,
      })),
      totalRefundLKR: totalRefund,
      slipImageUrl: newReturn.slipImageUrl || undefined,
      status: 'completed',
      notes: newReturn.notes || undefined,
    };

    StorageService.addPurchaseReturn(returnToSave);
    setPurchaseReturns(StorageService.getPurchaseReturns());
    setIsNewReturnModalOpen(false);

    // Reset return form
    setNewReturn({
      returnNumber: `PR-${new Date().getFullYear()}-${String(purchaseReturns.length + 2).padStart(3, '0')}`,
      purchaseOrderId: '',
      poNumber: '',
      supplierName: '',
      supplierCreditNoteNo: '',
      date: new Date().toISOString().split('T')[0],
      items: [
        {
          name: '',
          quantity: 1,
          reason: 'Defective clarity / weight discrepancy',
          refundAmountLKR: 0,
        },
      ],
      slipImageUrl: '',
      notes: '',
    });
  };

  // Filtered Orders
  const filteredOrders = purchaseOrders.filter((po) => {
    const matchesSearch =
      po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (po.supplierInvoiceNo &&
        po.supplierInvoiceNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
      po.items.some((it) => it.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || po.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || po.paymentStatus === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Financial Ledger Stats
  const totalPurchaseValueLKR = purchaseOrders.reduce((sum, po) => sum + po.totalAmountLKR, 0);
  const totalPaidLKR = purchaseOrders.reduce((sum, po) => sum + (po.paidAmountLKR || 0), 0);
  const totalPayableLKR = Math.max(0, totalPurchaseValueLKR - totalPaidLKR);
  const totalRefundsReceivedLKR = purchaseReturns.reduce((sum, pr) => sum + pr.totalRefundLKR, 0);

  return (
    <div className="space-y-6">
      {/* Top Header & Overview Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-xl border border-slate-800 shadow-md">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Purchases & Finance
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                  Ceylon Bullion & Gems
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage raw bullion intake, gem parcel purchases, supplier bills, receipts & return credit slips
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsNewReturnModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all shadow-sm cursor-pointer"
          >
            <Undo2 className="w-4 h-4 text-rose-400" />
            <span>Purchase Return</span>
          </button>

          <button
            onClick={() => setIsNewOrderModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Purchase & Stock In</span>
          </button>
        </div>
      </div>

      {/* Metric Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-mono">
              Total Purchases
            </span>
            <Building2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-white mt-2 font-mono">
            {settings.currencySymbol} {totalPurchaseValueLKR.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {purchaseOrders.length} supplier orders intake
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-mono">
              Total Paid Out
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 mt-2 font-mono">
            {settings.currencySymbol} {totalPaidLKR.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Settled via bank & cash
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-mono">
              Accounts Payable
            </span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold text-rose-400 mt-2 font-mono">
            {settings.currencySymbol} {totalPayableLKR.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Outstanding supplier dues
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-mono">
              Returns & Refunds
            </span>
            <Undo2 className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-bold text-sky-400 mt-2 font-mono">
            {settings.currencySymbol} {totalRefundsReceivedLKR.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {purchaseReturns.length} supplier credit notes
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Purchase Orders & Stock In ({purchaseOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('returns')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'returns'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Undo2 className="w-4 h-4" />
          <span>Purchase Returns ({purchaseReturns.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('expenses')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'expenses'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <DollarSign className="w-4 h-4 text-rose-400" />
          <span>Showroom Expenses (Optional)</span>
        </button>

        <button
          onClick={() => setActiveTab('payouts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'payouts'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <CreditCard className="w-4 h-4 text-sky-400" />
          <span>Cash & Supplier Payouts (Optional)</span>
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'ledger'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Finance & Supplier Ledger</span>
        </button>
      </div>

      {/* TAB 1: PURCHASE ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search PO #, supplier, or items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 px-3 py-1.5 focus:outline-none focus:border-amber-500"
              >
                <option value="all">All Payments</option>
                <option value="paid">Paid in Full</option>
                <option value="partial">Partial</option>
                <option value="unpaid">Unpaid / Dues</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 px-3 py-1.5 focus:outline-none focus:border-amber-500"
              >
                <option value="all">All Intake Status</option>
                <option value="received">Received in Vault</option>
                <option value="pending">Pending Delivery</option>
                <option value="returned">Returned</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#090d15] text-[11px] text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">PO & Date</th>
                    <th className="py-3 px-4">Supplier & Bill #</th>
                    <th className="py-3 px-4">Intake Items</th>
                    <th className="py-3 px-4">Total Cost</th>
                    <th className="py-3 px-4">Bill Screenshot</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                        <p>No purchase orders found matching your search filters.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((po) => (
                      <tr
                        key={po.id}
                        className="hover:bg-slate-800/40 transition-colors group"
                      >
                        <td className="py-3.5 px-4 font-medium">
                          <div className="text-white font-mono font-semibold flex items-center gap-1.5">
                            {po.poNumber}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            {po.date}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="text-white font-semibold">{po.supplierName}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {po.supplierPhone}
                            {po.supplierInvoiceNo && (
                              <span className="ml-2 text-amber-400 font-mono">
                                Bill: {po.supplierInvoiceNo}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            {po.items.slice(0, 2).map((item, idx) => (
                              <div key={idx} className="text-xs text-slate-200">
                                • {item.name}{' '}
                                <span className="text-slate-400 font-mono">
                                  ({item.quantity}x
                                  {item.weightGrams ? ` • ${item.weightGrams}g` : ''}
                                  {item.carats ? ` • ${item.carats}ct` : ''})
                                </span>
                              </div>
                            ))}
                            {po.items.length > 2 && (
                              <div className="text-[11px] text-amber-400 font-medium">
                                + {po.items.length - 2} more items...
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-white">
                          <div>
                            {settings.currencySymbol} {po.totalAmountLKR.toLocaleString()}
                          </div>
                          {po.autoAddedToInventory && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-normal font-sans">
                              <Check className="w-2.5 h-2.5" /> Stocked In
                            </span>
                          )}
                        </td>

                        {/* Bill Screenshot Upload Preview */}
                        <td className="py-3.5 px-4">
                          {po.invoiceImageUrl ? (
                            <div className="flex items-center gap-2">
                              <div
                                onClick={() => setZoomImageUrl(po.invoiceImageUrl!)}
                                className="relative w-12 h-12 rounded-lg overflow-hidden border border-amber-500/30 group/img cursor-pointer bg-slate-950"
                              >
                                <img
                                  src={po.invoiceImageUrl}
                                  alt="Supplier Invoice Screenshot"
                                  className="w-full h-full object-cover group-hover/img:scale-110 transition-transform"
                                />
                                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                                  <Maximize2 className="w-3.5 h-3.5 text-white" />
                                </div>
                              </div>
                              <span className="text-[11px] text-amber-400 font-mono">
                                Slip Attached
                              </span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-500 italic">
                              No screenshot
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              po.paymentStatus === 'paid'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : po.paymentStatus === 'partial'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {po.paymentStatus}
                          </span>
                          {po.paymentMethod && (
                            <div className="text-[10px] text-slate-400 mt-1 font-mono">
                              {po.paymentMethod}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedOrderDetails(po)}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-amber-400" />
                            <span>Inspect</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PURCHASE RETURNS */}
      {activeTab === 'returns' && (
        <div className="space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Purchase Returns & Supplier Credit Vouchers</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Items returned to suppliers due to stone silk flaws, carat weight variance, or melt losses
                </p>
              </div>
              <button
                onClick={() => setIsNewReturnModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log New Return</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#090d15] text-[11px] text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Return # & Date</th>
                    <th className="py-3 px-4">Supplier & PO Ref</th>
                    <th className="py-3 px-4">Items Returned & Reason</th>
                    <th className="py-3 px-4">Refund Amount</th>
                    <th className="py-3 px-4">Credit Slip Screenshot</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {purchaseReturns.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        <Undo2 className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                        <p>No purchase returns recorded.</p>
                      </td>
                    </tr>
                  ) : (
                    purchaseReturns.map((pr) => (
                      <tr key={pr.id} className="hover:bg-slate-800/40">
                        <td className="py-3.5 px-4 font-medium">
                          <div className="text-white font-mono font-bold">{pr.returnNumber}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{pr.date}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="text-white font-semibold">{pr.supplierName}</div>
                          <div className="text-[11px] text-amber-400 font-mono mt-0.5">
                            PO: {pr.poNumber}
                            {pr.supplierCreditNoteNo && ` • CN: ${pr.supplierCreditNoteNo}`}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          {pr.items.map((it, idx) => (
                            <div key={idx} className="mb-1">
                              <span className="text-white font-medium">• {it.name}</span>{' '}
                              <span className="text-slate-400 font-mono">({it.quantity}x)</span>
                              <div className="text-[11px] text-rose-300/80 italic">
                                Reason: {it.reason}
                              </div>
                            </div>
                          ))}
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-400 text-sm">
                          {settings.currencySymbol} {pr.totalRefundLKR.toLocaleString()}
                        </td>

                        <td className="py-3.5 px-4">
                          {pr.slipImageUrl ? (
                            <div
                              onClick={() => setZoomImageUrl(pr.slipImageUrl!)}
                              className="relative w-12 h-12 rounded-lg overflow-hidden border border-amber-500/30 group/img cursor-pointer bg-slate-950"
                            >
                              <img
                                src={pr.slipImageUrl}
                                alt="Return Credit Slip"
                                className="w-full h-full object-cover group-hover/img:scale-110 transition-transform"
                              />
                              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                                <Maximize2 className="w-3.5 h-3.5 text-white" />
                              </div>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-500 italic">
                              No slip attached
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {pr.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FINANCE & SUPPLIER LEDGER */}
      {activeTab === 'ledger' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Supplier Purchases Breakdown */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                Consortium & Refinery Balances
              </h3>
              <div className="space-y-3">
                {Array.from(new Set(purchaseOrders.map((p) => p.supplierName))).map(
                  (supplierName) => {
                    const suppOrders = purchaseOrders.filter(
                      (p) => p.supplierName === supplierName
                    );
                    const totalBought = suppOrders.reduce((s, p) => s + p.totalAmountLKR, 0);
                    const totalSettled = suppOrders.reduce(
                      (s, p) => s + (p.paidAmountLKR || 0),
                      0
                    );
                    const due = Math.max(0, totalBought - totalSettled);

                    return (
                      <div
                        key={supplierName}
                        className="p-3 bg-slate-950/70 rounded-lg border border-slate-800/80 flex items-center justify-between"
                      >
                        <div>
                          <div className="text-xs font-bold text-white">{supplierName}</div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {suppOrders.length} consignments • Settled:{' '}
                            {settings.currencySymbol} {totalSettled.toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-mono font-bold text-white">
                            {settings.currencySymbol} {totalBought.toLocaleString()}
                          </div>
                          {due > 0 ? (
                            <div className="text-[11px] text-rose-400 font-mono font-semibold mt-0.5">
                              Due: {settings.currencySymbol} {due.toLocaleString()}
                            </div>
                          ) : (
                            <div className="text-[11px] text-emerald-400 font-mono font-semibold mt-0.5">
                              Cleared in Full
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            {/* Category Purchases Distribution */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                Raw Material Intake Categories
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">
                      Fine Gold Bullion & Alloys (24K / 22K)
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Grains & bars assayed for workshop casting
                    </div>
                  </div>
                  <div className="text-right font-mono font-bold text-amber-300 text-xs">
                    {settings.currencySymbol}{' '}
                    {purchaseOrders
                      .reduce((sum, po) => {
                        const goldItems = po.items.filter(
                          (it) => it.category === 'Gold Sovereigns & Bullion'
                        );
                        return (
                          sum +
                          goldItems.reduce((is, it) => is + it.quantity * it.unitCostLKR, 0)
                        );
                      }, 0)
                      .toLocaleString()}
                  </div>
                </div>

                <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">
                      Loose Ceylon Natural Gemstones
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Pelmadulla & Ratnapura sapphire rough parcels & cuts
                    </div>
                  </div>
                  <div className="text-right font-mono font-bold text-sky-400 text-xs">
                    {settings.currencySymbol}{' '}
                    {purchaseOrders
                      .reduce((sum, po) => {
                        const gemItems = po.items.filter(
                          (it) => it.category === 'Loose Gemstones'
                        );
                        return (
                          sum + gemItems.reduce((is, it) => is + it.quantity * it.unitCostLKR, 0)
                        );
                      }, 0)
                      .toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Notice Box */}
              <div className="mt-5 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300">
                  <span className="font-bold text-amber-300 block mb-0.5">
                    A4 Audit & NGJA Gemstone Verification
                  </span>
                  All uploaded supplier bills and refinery assay slips are archived in accordance with National Gem and Jewellery Authority of Sri Lanka compliance.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: EXPENSES (OPTIONAL) */}
      {activeTab === 'expenses' && (
        <ExpensesManager settings={settings} currentUser={currentUser} />
      )}

      {/* TAB 5: PAYOUTS (OPTIONAL) */}
      {activeTab === 'payouts' && (
        <PayoutsManager settings={settings} currentUser={currentUser} />
      )}

      {/* MODAL 1: NEW PURCHASE ORDER & STOCK IN (WITH BILL SCREENSHOT UPLOAD) */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#090d15]">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white">
                  New Purchase Order & Stock In
                </h2>
              </div>
              <button
                onClick={() => setIsNewOrderModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePurchaseOrder} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Top Row: PO Number, Date, Supplier Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    PO Number
                  </label>
                  <input
                    type="text"
                    required
                    value={newOrder.poNumber}
                    onChange={(e) => setNewOrder({ ...newOrder, poNumber: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Date of Intake
                  </label>
                  <input
                    type="date"
                    required
                    value={newOrder.date}
                    onChange={(e) => setNewOrder({ ...newOrder, date: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Supplier Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lanka Bullion Refineries"
                    value={newOrder.supplierName}
                    onChange={(e) => setNewOrder({ ...newOrder, supplierName: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Supplier Bill / Invoice #
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. INV-9982"
                    value={newOrder.supplierInvoiceNo}
                    onChange={(e) =>
                      setNewOrder({ ...newOrder, supplierInvoiceNo: e.target.value })
                    }
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* SCREENSHOT / BILL UPLOAD SECTION */}
              <div className="bg-slate-950/70 border border-dashed border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <UploadCloud className="w-4 h-4 text-amber-400" />
                    Supplier Bill / Invoice Slip Screenshot
                  </span>
                  <span className="text-[11px] text-slate-400">
                    PNG, JPG, WEBP receipt capture
                  </span>
                </div>

                {newOrder.invoiceImageUrl ? (
                  <div className="flex items-center gap-4 bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                    <img
                      src={newOrder.invoiceImageUrl}
                      alt="Uploaded Invoice Slip"
                      className="w-20 h-20 object-cover rounded-lg border border-amber-500/40"
                    />
                    <div className="flex-1">
                      <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Screenshot Loaded Successfully
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        This screenshot is saved with the consignment record and viewable anytime.
                      </p>
                      <button
                        type="button"
                        onClick={() => setNewOrder({ ...newOrder, invoiceImageUrl: '' })}
                        className="mt-2 text-xs text-rose-400 hover:text-rose-300 font-medium inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" /> Remove & replace screenshot
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-800 hover:border-amber-500/50 rounded-xl cursor-pointer bg-slate-900/40 transition-colors">
                      <ImageIcon className="w-8 h-8 text-amber-400/80 mb-2" />
                      <span className="text-xs font-semibold text-slate-200">
                        Click to upload screenshot / drag receipt file here
                      </span>
                      <span className="text-[11px] text-slate-500 mt-1">
                        Snap or select the supplier invoice photo
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleImageUpload(e, (url) =>
                            setNewOrder({ ...newOrder, invoiceImageUrl: url })
                          )
                        }
                      />
                    </label>

                    {/* Or URL input fallback */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 whitespace-nowrap">
                        Or enter image URL:
                      </span>
                      <input
                        type="text"
                        placeholder="https://..."
                        value={newOrder.invoiceImageUrl}
                        onChange={(e) =>
                          setNewOrder({ ...newOrder, invoiceImageUrl: e.target.value })
                        }
                        className="flex-1 px-3 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Items Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                    Intake Items ({newOrder.items.length})
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddItemToOrder}
                    className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Another Item
                  </button>
                </div>

                {newOrder.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-amber-400 font-bold">
                        Item #{idx + 1}
                      </span>
                      {newOrder.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItemFromOrder(idx)}
                          className="text-slate-500 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] text-slate-400 mb-1">
                          Description *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 24K Pure Gold Grains (Pellets) or Blue Sapphire Lot"
                          value={item.name}
                          onChange={(e) => {
                            const newItems = [...newOrder.items];
                            newItems[idx].name = e.target.value;
                            setNewOrder({ ...newOrder, items: newItems });
                          }}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Category</label>
                        <select
                          value={item.category}
                          onChange={(e) => {
                            const newItems = [...newOrder.items];
                            newItems[idx].category = e.target.value;
                            setNewOrder({ ...newOrder, items: newItems });
                          }}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                        >
                          <option value="Loose Gemstones">Loose Gemstones</option>
                          <option value="Gold Sovereigns & Bullion">
                            Gold Sovereigns & Bullion
                          </option>
                          <option value="Rings">Rings</option>
                          <option value="Necklaces">Necklaces</option>
                          <option value="Bracelets & Bangles">Bracelets & Bangles</option>
                          <option value="Pendants">Pendants</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.quantity}
                          onChange={(e) => {
                            const newItems = [...newOrder.items];
                            newItems[idx].quantity = Number(e.target.value);
                            setNewOrder({ ...newOrder, items: newItems });
                          }}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Weight (g)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.weightGrams || ''}
                          placeholder="0.00"
                          onChange={(e) => {
                            const newItems = [...newOrder.items];
                            newItems[idx].weightGrams = Number(e.target.value);
                            setNewOrder({ ...newOrder, items: newItems });
                          }}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Carats (cts)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.carats || ''}
                          placeholder="0.00"
                          onChange={(e) => {
                            const newItems = [...newOrder.items];
                            newItems[idx].carats = Number(e.target.value);
                            setNewOrder({ ...newOrder, items: newItems });
                          }}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">
                          Unit Cost ({settings.currencySymbol}) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          required
                          value={item.unitCostLKR || ''}
                          placeholder="0"
                          onChange={(e) => {
                            const newItems = [...newOrder.items];
                            newItems[idx].unitCostLKR = Number(e.target.value);
                            setNewOrder({ ...newOrder, items: newItems });
                          }}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-amber-500 font-bold"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Payment & Auto Add Option */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={newOrder.paymentMethod}
                    onChange={(e) =>
                      setNewOrder({ ...newOrder, paymentMethod: e.target.value as PaymentMethod })
                    }
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Credit/Debit Card">Credit/Debit Card</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Payment Status
                  </label>
                  <select
                    value={newOrder.paymentStatus}
                    onChange={(e) =>
                      setNewOrder({
                        ...newOrder,
                        paymentStatus: e.target.value as 'paid' | 'partial' | 'unpaid',
                      })
                    }
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="paid">Paid in Full</option>
                    <option value="partial">Partial Payment</option>
                    <option value="unpaid">Unpaid / Dues</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newOrder.autoAddToInventory}
                      onChange={(e) =>
                        setNewOrder({ ...newOrder, autoAddToInventory: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-950 border-slate-800"
                    />
                    <span className="text-xs font-semibold text-slate-200">
                      Auto-Add to Jewelry Stock
                    </span>
                  </label>
                </div>
              </div>

              {/* Total & Submit Button */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <div>
                  <div className="text-xs text-slate-400">Total Purchase Value</div>
                  <div className="text-xl font-bold font-mono text-amber-400">
                    {settings.currencySymbol} {orderSubtotal.toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsNewOrderModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-bold shadow-md cursor-pointer"
                  >
                    Confirm & Save Intake
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: LOG PURCHASE RETURN */}
      {isNewReturnModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#090d15]">
              <div className="flex items-center gap-2.5">
                <Undo2 className="w-5 h-5 text-rose-400" />
                <h2 className="text-base font-bold text-white">Log Purchase Return</h2>
              </div>
              <button
                onClick={() => setIsNewReturnModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePurchaseReturn} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Return Number
                  </label>
                  <input
                    type="text"
                    required
                    value={newReturn.returnNumber}
                    onChange={(e) =>
                      setNewReturn({ ...newReturn, returnNumber: e.target.value })
                    }
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Select Origin Purchase Order
                  </label>
                  <select
                    value={newReturn.purchaseOrderId}
                    onChange={(e) => {
                      const selectedPO = purchaseOrders.find((p) => p.id === e.target.value);
                      if (selectedPO) {
                        setNewReturn({
                          ...newReturn,
                          purchaseOrderId: selectedPO.id,
                          poNumber: selectedPO.poNumber,
                          supplierName: selectedPO.supplierName,
                        });
                      }
                    }}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- Choose Purchase Order --</option>
                    {purchaseOrders.map((po) => (
                      <option key={po.id} value={po.id}>
                        {po.poNumber} • {po.supplierName} ({settings.currencySymbol}{' '}
                        {po.totalAmountLKR.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Supplier Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newReturn.supplierName}
                    onChange={(e) =>
                      setNewReturn({ ...newReturn, supplierName: e.target.value })
                    }
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Supplier Credit Note / Voucher #
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CN-991"
                    value={newReturn.supplierCreditNoteNo}
                    onChange={(e) =>
                      setNewReturn({ ...newReturn, supplierCreditNoteNo: e.target.value })
                    }
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Items returned */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase font-mono">
                  Returned Item Details
                </h4>
                {newReturn.items.map((it, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3"
                  >
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        Item Returned Description *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Defective silk fissure sapphire lot"
                        value={it.name}
                        onChange={(e) => {
                          const items = [...newReturn.items];
                          items[idx].name = e.target.value;
                          setNewReturn({ ...newReturn, items });
                        }}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Reason</label>
                        <input
                          type="text"
                          required
                          value={it.reason}
                          onChange={(e) => {
                            const items = [...newReturn.items];
                            items[idx].reason = e.target.value;
                            setNewReturn({ ...newReturn, items });
                          }}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">
                          Refund / Credit LKR *
                        </label>
                        <input
                          type="number"
                          required
                          value={it.refundAmountLKR || ''}
                          placeholder="0"
                          onChange={(e) => {
                            const items = [...newReturn.items];
                            items[idx].refundAmountLKR = Number(e.target.value);
                            setNewReturn({ ...newReturn, items });
                          }}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Upload Credit Slip Screenshot */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Upload Supplier Credit Voucher Screenshot
                </label>
                <div className="flex items-center gap-3">
                  <label className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 cursor-pointer inline-flex items-center gap-1.5">
                    <UploadCloud className="w-4 h-4 text-amber-400" />
                    <span>Choose Screenshot</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleImageUpload(e, (url) =>
                          setNewReturn({ ...newReturn, slipImageUrl: url })
                        )
                      }
                    />
                  </label>
                  {newReturn.slipImageUrl && (
                    <span className="text-xs text-emerald-400 font-mono">
                      Slip image attached
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewReturnModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                >
                  Confirm Return
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: PURCHASE ORDER INSPECTION & BILL SCREENSHOT ZOOM */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#090d15]">
              <div>
                <h3 className="text-base font-bold text-white">
                  Purchase Order #{selectedOrderDetails.poNumber}
                </h3>
                <p className="text-xs text-slate-400">
                  Supplier: {selectedOrderDetails.supplierName} • {selectedOrderDetails.date}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Attached Screenshot */}
              {selectedOrderDetails.invoiceImageUrl && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-300 uppercase font-mono">
                    Supplier Bill Screenshot
                  </div>
                  <div
                    onClick={() => setZoomImageUrl(selectedOrderDetails.invoiceImageUrl!)}
                    className="relative max-h-64 rounded-xl overflow-hidden border border-amber-500/40 cursor-pointer group bg-slate-950"
                  >
                    <img
                      src={selectedOrderDetails.invoiceImageUrl}
                      alt="Supplier Invoice"
                      className="w-full h-auto object-contain max-h-64 mx-auto group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="px-3 py-1.5 rounded-lg bg-slate-900/90 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg border border-slate-700">
                        <Maximize2 className="w-3.5 h-3.5 text-amber-400" /> Click to expand
                        fullscreen
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Items list */}
              <div>
                <div className="text-xs font-bold text-slate-300 uppercase font-mono mb-2">
                  Items Received
                </div>
                <div className="space-y-2">
                  {selectedOrderDetails.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-white">{it.name}</div>
                        <div className="text-slate-400 text-[11px] font-mono mt-0.5">
                          Category: {it.category} • Qty: {it.quantity}
                          {it.weightGrams ? ` • ${it.weightGrams}g` : ''}
                          {it.carats ? ` • ${it.carats}ct` : ''}
                        </div>
                      </div>
                      <div className="text-right font-mono font-bold text-amber-400">
                        {settings.currencySymbol} {it.totalLKR.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Total */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">Total Settlement</span>
                  <div className="text-xs text-emerald-400 font-medium">
                    Status: {selectedOrderDetails.paymentStatus.toUpperCase()}
                  </div>
                </div>
                <div className="text-xl font-bold font-mono text-white">
                  {settings.currencySymbol}{' '}
                  {selectedOrderDetails.totalAmountLKR.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: FULLSCREEN IMAGE LIGHTBOX / ZOOM */}
      {zoomImageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setZoomImageUrl(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setZoomImageUrl(null)}
              className="absolute -top-10 right-0 p-1.5 rounded-full bg-slate-800 text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={zoomImageUrl}
              alt="Screenshot Preview"
              className="max-h-[85vh] max-w-full object-contain rounded-xl border border-amber-500/40 shadow-2xl"
            />
            <div className="text-xs text-slate-400 mt-2 font-mono">
              Click anywhere outside or press X to close
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
