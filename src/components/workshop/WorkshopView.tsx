import React, { useState, useMemo, useEffect } from 'react';
import {
  Hammer,
  Plus,
  Printer,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  Image as ImageIcon,
  Edit2,
  Trash2,
  Search,
  Filter,
  ArrowRight,
  Phone,
  Building,
  Receipt,
  CreditCard,
  DollarSign,
  CheckCircle,
  Check,
  Eye,
  UserPlus,
  Coins,
  Users,
} from 'lucide-react';
import {
  Workshop,
  WorkshopOrder,
  OrderStatus,
  Customer,
  AppSettings,
  User as SystemUser,
  Invoice,
  PaymentMethod,
  WorkshopEmployee,
  EmployeePayment,
} from '../../types';
import { StorageService } from '../../services/storage';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';
import { AddWorkmanModal } from './AddWorkmanModal';
import { WorkmanPaymentModal } from './WorkmanPaymentModal';
import { WorkmanPaymentVoucherModal } from './WorkmanPaymentVoucherModal';
import { AdvancePaymentAddModal } from './AdvancePaymentAddModal';
import { BalancePayAddModal } from './BalancePayAddModal';
import { WorkmenListView } from './WorkmenListView';
import { WorkmanPaymentsListView } from './WorkmanPaymentsListView';

export interface WorkshopViewProps {
  workshops: Workshop[];
  orders: WorkshopOrder[];
  customers: Customer[];
  settings: AppSettings;
  currentUser: SystemUser;
  onRefresh: () => void;
  initialTab?:
    | 'orders'
    | 'workshops'
    | 'create_order'
    | 'pending_orders'
    | 'completed_orders'
    | 'cancelled_orders'
    | 'workshop_advances'
    | 'workmen'
    | 'workman_payments';
  initialAction?: 'add_workman' | 'workman_payment_invoice' | 'advance_payment_add' | 'balance_pay_add';
}

const ORDER_STATUSES: OrderStatus[] = [
  'Pending',
  'Sent to Workshop',
  'In Progress',
  'Ready for QC',
  'Completed',
  'Delivered to Customer',
];

export const WorkshopView: React.FC<WorkshopViewProps> = ({
  workshops,
  orders,
  customers,
  settings,
  currentUser,
  onRefresh,
  initialTab = 'orders',
  initialAction,
}) => {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<
    | 'orders'
    | 'workshops'
    | 'create_order'
    | 'pending_orders'
    | 'completed_orders'
    | 'cancelled_orders'
    | 'workshop_advances'
    | 'workmen'
    | 'workman_payments'
  >(initialTab);

  // Workmen & Wage Payments State
  const [workmen, setWorkmen] = useState<WorkshopEmployee[]>(() => StorageService.getWorkshopEmployees());
  const [employeePayments, setEmployeePayments] = useState<EmployeePayment[]>(() =>
    StorageService.getEmployeePayments()
  );

  const refreshWorkmenData = () => {
    setWorkmen(StorageService.getWorkshopEmployees());
    setEmployeePayments(StorageService.getEmployeePayments());
  };

  // Modals for the requested 4 optional actions
  const [isAddWorkmanModalOpen, setIsAddWorkmanModalOpen] = useState(initialAction === 'add_workman');
  const [isWorkmanPaymentModalOpen, setIsWorkmanPaymentModalOpen] = useState(
    initialAction === 'workman_payment_invoice'
  );
  const [isAdvancePaymentModalOpen, setIsAdvancePaymentModalOpen] = useState(
    initialAction === 'advance_payment_add'
  );
  const [isBalancePayModalOpen, setIsBalancePayModalOpen] = useState(initialAction === 'balance_pay_add');

  const [preselectedWorkmanId, setPreselectedWorkmanId] = useState<string | undefined>();
  const [printablePayment, setPrintablePayment] = useState<EmployeePayment | null>(null);

  useEffect(() => {
    if (initialAction === 'add_workman') {
      setIsAddWorkmanModalOpen(true);
    } else if (initialAction === 'workman_payment_invoice') {
      setIsWorkmanPaymentModalOpen(true);
    } else if (initialAction === 'advance_payment_add') {
      setIsAdvancePaymentModalOpen(true);
    } else if (initialAction === 'balance_pay_add') {
      setIsBalancePayModalOpen(true);
    }
  }, [initialAction]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Filters for Orders
  const [searchTerm, setSearchTerm] = useState('');
  const [filterWorkshop, setFilterWorkshop] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Job sheet A4 Print modal
  const [printableOrder, setPrintableOrder] = useState<WorkshopOrder | null>(null);

  // Create / Edit Workshop Modal
  const [isWorkshopModalOpen, setIsWorkshopModalOpen] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null);
  const [wsName, setWsName] = useState('');
  const [wsContactPerson, setWsContactPerson] = useState('');
  const [wsPhone, setWsPhone] = useState('');
  const [wsAddress, setWsAddress] = useState('');
  const [wsSpecialty, setWsSpecialty] = useState('');

  // Create Order Form State
  const [orderCustomerId, setOrderCustomerId] = useState<string>(customers[0]?.id || '');
  const [orderCustomerName, setOrderCustomerName] = useState(customers[0]?.name || '');
  const [orderCustomerPhone, setOrderCustomerPhone] = useState(customers[0]?.phone || '');
  const [orderWorkshopId, setOrderWorkshopId] = useState<string>(workshops[0]?.id || '');
  const [orderItemName, setOrderItemName] = useState('');
  const [orderCategory, setOrderCategory] = useState<any>('Rings');
  const [orderGoldPurity, setOrderGoldPurity] = useState('18K Yellow Gold');
  const [orderGoldWeightGiven, setOrderGoldWeightGiven] = useState<number>(5.5);
  const [orderGemstonesGiven, setOrderGemstonesGiven] = useState(
    '1 pc Oval Ceylon Blue Sapphire 2.4ct, 14 pcs Diamond melee 0.25ctw'
  );
  const [orderEstCost, setOrderEstCost] = useState<number>(65000);
  const [orderAdvance, setOrderAdvance] = useState<number>(25000);
  const [orderRequiredDate, setOrderRequiredDate] = useState(
    new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0]
  );
  const [orderInstructions, setOrderInstructions] = useState(
    'Comfort fit shank with high polish finish. Flush micro-prong setting for melee stones.'
  );
  const [orderDesignImageUrl, setOrderDesignImageUrl] = useState(
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&auto=format&fit=crop&q=80'
  );
  const [createInvoiceForAdvance, setCreateInvoiceForAdvance] = useState(true);
  const [createOrderPaymentMethod, setCreateOrderPaymentMethod] = useState<PaymentMethod>('Cash');

  // Advance Invoice & Balance Settle Modals State
  const [orderForAdvanceInvoice, setOrderForAdvanceInvoice] = useState<WorkshopOrder | null>(null);
  const [advanceInvoiceAmount, setAdvanceInvoiceAmount] = useState<number>(0);
  const [advancePaymentMethod, setAdvancePaymentMethod] = useState<PaymentMethod>('Cash');

  const [orderForBalanceSettle, setOrderForBalanceSettle] = useState<WorkshopOrder | null>(null);
  const [balancePaymentAmount, setBalancePaymentAmount] = useState<number>(0);
  const [balancePaymentMethod, setBalancePaymentMethod] = useState<PaymentMethod>('Cash');
  const [balancePaymentNotes, setBalancePaymentNotes] = useState<string>('');

  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

  // Filtered Orders List
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      const matchSearch =
        searchTerm === '' ||
        ord.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ord.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ord.productOrItemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ord.workshopName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchWorkshop = filterWorkshop === 'All' || ord.workshopId === filterWorkshop;

      let matchStatus = true;
      if (activeTab === 'pending_orders') {
        matchStatus = ord.status !== 'Completed' && ord.status !== 'Delivered to Customer' && ord.status !== 'Cancelled';
      } else if (activeTab === 'completed_orders') {
        matchStatus = ord.status === 'Completed' || ord.status === 'Delivered to Customer';
      } else if (activeTab === 'cancelled_orders') {
        matchStatus = ord.status === 'Cancelled';
      } else if (activeTab === 'workshop_advances') {
        matchStatus = (ord.advancePaymentLKR || 0) > 0;
      } else if (filterStatus !== 'All') {
        matchStatus = ord.status === filterStatus;
      }

      return matchSearch && matchWorkshop && matchStatus;
    });
  }, [orders, searchTerm, filterWorkshop, filterStatus, activeTab]);

  // Handle Customer Select
  const handleSelectCustomer = (cId: string) => {
    setOrderCustomerId(cId);
    const c = customers.find((cust) => cust.id === cId);
    if (c) {
      setOrderCustomerName(c.name);
      setOrderCustomerPhone(c.phone);
    }
  };

  // Create Order Submit
  const handleCreateOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ws = workshops.find((w) => w.id === orderWorkshopId) || workshops[0];

    const orderNumber = StorageService.generateNextOrderNumber();
    const balance = Math.max(0, Number(orderEstCost) - Number(orderAdvance));

    const newOrder: WorkshopOrder = {
      id: `ord-${Date.now()}`,
      orderNumber,
      orderDate: new Date().toISOString().split('T')[0],
      requiredDate: orderRequiredDate,
      customerId: orderCustomerId,
      customerName: orderCustomerName,
      customerPhone: orderCustomerPhone,
      workshopId: ws ? ws.id : 'ws-1',
      workshopName: ws ? ws.name : 'Master Goldsmith Studio',
      productOrItemName: orderItemName,
      category: orderCategory,
      goldPurity: orderGoldPurity,
      goldWeightGivenGrams: Number(orderGoldWeightGiven),
      gemstonesGivenDetails: orderGemstonesGiven,
      estimatedCostLKR: Number(orderEstCost),
      advancePaymentLKR: Number(orderAdvance),
      advancePaymentMethod: createOrderPaymentMethod,
      balancePaymentLKR: balance,
      balanceDueLKR: balance,
      designDescription: orderInstructions || orderItemName,
      designImageUrl: orderDesignImageUrl,
      quantity: 1,
      status: 'Sent to Workshop',
      specialInstructions: orderInstructions,
    };

    if (createInvoiceForAdvance && Number(orderAdvance) > 0) {
      const res = StorageService.createWorkOrderInvoice(
        newOrder,
        Number(orderAdvance),
        createOrderPaymentMethod,
        currentUser.name
      );
      showToast(`Workshop Order registered and Advance Invoice #${res.invoice.invoiceNumber} created!`, 'success');
      onRefresh();
      setActiveTab('orders');
      setViewingInvoice(res.invoice);
    } else {
      StorageService.addWorkshopOrder(newOrder);
      showToast(`Workshop Order ${orderNumber} registered successfully!`, 'success');
      onRefresh();
      setActiveTab('orders');
      setPrintableOrder(newOrder);
    }
  };

  // Open Advance Invoice Modal for existing order
  const handleOpenAdvanceInvoiceModal = (ord: WorkshopOrder) => {
    setOrderForAdvanceInvoice(ord);
    setAdvanceInvoiceAmount(ord.advancePaymentLKR || 0);
    setAdvancePaymentMethod((ord.advancePaymentMethod as PaymentMethod) || 'Cash');
  };

  // Submit Advance Invoice
  const handleConfirmCreateAdvanceInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderForAdvanceInvoice) return;
    const res = StorageService.createWorkOrderInvoice(
      orderForAdvanceInvoice,
      advanceInvoiceAmount,
      advancePaymentMethod,
      currentUser.name
    );
    showToast(`Official Advance Invoice #${res.invoice.invoiceNumber} created!`, 'success');
    setOrderForAdvanceInvoice(null);
    onRefresh();
    setViewingInvoice(res.invoice);
  };

  // Open Balance Settle Modal
  const handleOpenBalanceSettleModal = (ord: WorkshopOrder) => {
    const due = ord.balanceDueLKR !== undefined ? ord.balanceDueLKR : ord.balancePaymentLKR || 0;
    setOrderForBalanceSettle(ord);
    setBalancePaymentAmount(due);
    setBalancePaymentMethod('Cash');
    setBalancePaymentNotes(`Final settlement for completed job order #${ord.orderNumber}`);
  };

  // Confirm Balance Settlement
  const handleConfirmSettleBalance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderForBalanceSettle) return;
    const res = StorageService.settleWorkOrderBalance(
      orderForBalanceSettle.id,
      balancePaymentAmount,
      balancePaymentMethod,
      currentUser.name
    );
    showToast(
      `Balance payment of Rs. ${balancePaymentAmount.toLocaleString()} recorded! Order #${orderForBalanceSettle.orderNumber} is marked Completed.`,
      'success'
    );
    setOrderForBalanceSettle(null);
    onRefresh();
    if (res.invoice) {
      setViewingInvoice(res.invoice);
    }
  };

  // View Invoice Receipt
  const handleViewOrderInvoice = (ord: WorkshopOrder) => {
    const invoices = StorageService.getInvoices();
    const inv = invoices.find(
      (i) => i.id === ord.invoiceId || i.workOrderId === ord.id || (ord.invoiceNumber && i.invoiceNumber === ord.invoiceNumber)
    );
    if (inv) {
      setViewingInvoice(inv);
    } else {
      handleOpenAdvanceInvoiceModal(ord);
    }
  };

  // Update Status
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    StorageService.updateWorkshopOrderStatus(orderId, newStatus);
    showToast(`Order status updated to: ${newStatus}`, 'info');
    onRefresh();
  };

  // Workshop Form Save
  const handleSaveWorkshop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wsName.trim()) return;

    const wsData: Workshop = {
      id: editingWorkshop ? editingWorkshop.id : `ws-${Date.now()}`,
      name: wsName.trim(),
      contactPerson: wsContactPerson.trim(),
      phone: wsPhone.trim(),
      address: wsAddress.trim(),
      specialization: wsSpecialty.trim(),
      specialty: wsSpecialty.trim(),
      activeOrdersCount: editingWorkshop ? editingWorkshop.activeOrdersCount : 0,
      totalAdvancesPaidLKR: editingWorkshop ? editingWorkshop.totalAdvancesPaidLKR : 0,
      createdAt: editingWorkshop ? editingWorkshop.createdAt : new Date().toISOString().split('T')[0],
    };

    if (editingWorkshop) {
      StorageService.updateWorkshop(wsData);
      showToast(`Workshop "${wsData.name}" updated`, 'success');
    } else {
      StorageService.addWorkshop(wsData);
      showToast(`Workshop "${wsData.name}" added`, 'success');
    }

    setIsWorkshopModalOpen(false);
    onRefresh();
  };

  const handleOpenEditWorkshop = (w: Workshop) => {
    setEditingWorkshop(w);
    setWsName(w.name);
    setWsContactPerson(w.contactPerson);
    setWsPhone(w.phone);
    setWsAddress(w.address);
    setWsSpecialty(w.specialty);
    setIsWorkshopModalOpen(true);
  };

  const handleOpenAddWorkshop = () => {
    setEditingWorkshop(null);
    setWsName('');
    setWsContactPerson('');
    setWsPhone('');
    setWsAddress('Sea Street, Colombo 11');
    setWsSpecialty('Traditional Handmade Gold Filigree & Hand Setting');
    setIsWorkshopModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100 font-serif flex items-center gap-2">
            <Hammer className="w-6 h-6 text-amber-400" />
            Workshop & Custom Order Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Gold weight distribution, gemstone handovers, artisan progress tracking & job sheets
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 1. Add Workman */}
          <button
            onClick={() => setIsAddWorkmanModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold transition-all active:scale-95 shadow-sm"
          >
            <UserPlus className="w-4 h-4 text-amber-400" />
            <span>Add Workman</span>
          </button>

          {/* 2. Add Workman to Payment Invoice */}
          <button
            onClick={() => {
              setPreselectedWorkmanId(undefined);
              setIsWorkmanPaymentModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-bold transition-all active:scale-95 shadow-sm"
          >
            <Receipt className="w-4 h-4 text-blue-400" />
            <span>Add Workman to Payment Invoice</span>
          </button>

          {/* 3. Advance Payment Add */}
          <button
            onClick={() => setIsAdvancePaymentModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold transition-all active:scale-95 shadow-sm"
          >
            <Coins className="w-4 h-4 text-emerald-400" />
            <span>Advance Payment Add</span>
          </button>

          {/* 4. Balance Pay Add */}
          <button
            onClick={() => setIsBalancePayModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded-lg text-xs font-bold transition-all active:scale-95 shadow-sm"
          >
            <DollarSign className="w-4 h-4 text-violet-400" />
            <span>Balance Pay Add</span>
          </button>

          {/* 5. New Workshop Order */}
          <button
            onClick={() => setActiveTab('create_order')}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-xs shadow-md shadow-amber-900/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Workshop Order</span>
          </button>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'orders'
              ? 'bg-amber-600 text-slate-950 font-bold'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          All Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('pending_orders')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'pending_orders'
              ? 'bg-amber-600 text-slate-950 font-bold'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          Pending at Artisans (
          {orders.filter((o) => o.status !== 'Completed' && o.status !== 'Delivered to Customer').length}
          )
        </button>
        <button
          onClick={() => setActiveTab('completed_orders')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'completed_orders'
              ? 'bg-amber-600 text-slate-950 font-bold'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          Completed / Delivered (
          {orders.filter((o) => o.status === 'Completed' || o.status === 'Delivered to Customer').length}
          )
        </button>
        <button
          onClick={() => setActiveTab('workshops')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'workshops'
              ? 'bg-amber-600 text-slate-950 font-bold'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          Artisan Workshops ({workshops.length})
        </button>
        <button
          onClick={() => setActiveTab('workmen')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'workmen'
              ? 'bg-amber-600 text-slate-950 font-bold'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Workmen & Artisans ({workmen.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('workman_payments')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'workman_payments'
              ? 'bg-blue-600 text-white font-bold'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Workman Payment Invoices ({employeePayments.length})</span>
        </button>
      </div>

      {/* TAB 1: ORDER CREATION */}
      {activeTab === 'create_order' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl max-w-4xl mx-auto space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-slate-100 font-serif flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-400" />
              Create Workshop Job Order
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Record gold weights, precious stones handed over, design sketches, and assign to goldsmith workshop
            </p>
          </div>

          <form onSubmit={handleCreateOrderSubmit} className="space-y-4">
            {/* Customer & Workshop Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Customer / Client *
                </label>
                <select
                  value={orderCustomerId}
                  onChange={(e) => handleSelectCustomer(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-medium"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Assign Workshop / Artisan *
                </label>
                <select
                  value={orderWorkshopId}
                  onChange={(e) => setOrderWorkshopId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-medium"
                >
                  {workshops.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} — {w.specialty}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Item Title & Required Date */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Jewelry Piece to Manufacture *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 18K Yellow Gold Peacock Pendant with Ceylon Blue Sapphire"
                  value={orderItemName}
                  onChange={(e) => setOrderItemName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Due / Required Date *
                </label>
                <input
                  type="date"
                  required
                  value={orderRequiredDate}
                  onChange={(e) => setOrderRequiredDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono"
                />
              </div>
            </div>

            {/* Materials Allocated to Workshop */}
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Hammer className="w-3.5 h-3.5" />
                Raw Materials Given to Goldsmith
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Gold Purity & Specs</label>
                  <input
                    type="text"
                    value={orderGoldPurity}
                    onChange={(e) => setOrderGoldPurity(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Gold Weight Given (Grams) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={orderGoldWeightGiven}
                    onChange={(e) => setOrderGoldWeightGiven(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Gemstones Given to Workshop (Counts & Carats)
                </label>
                <textarea
                  rows={2}
                  value={orderGemstonesGiven}
                  onChange={(e) => setOrderGemstonesGiven(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2.5 text-xs text-slate-100"
                />
              </div>
            </div>

            {/* Design Sketch & Financials */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Estimated Workshop Cost (Rs.)
                </label>
                <input
                  type="number"
                  required
                  value={orderEstCost}
                  onChange={(e) => setOrderEstCost(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Advance Paid to Workshop (Rs.)
                </label>
                <input
                  type="number"
                  value={orderAdvance}
                  onChange={(e) => setOrderAdvance(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Design JPG Image URL
                </label>
                <input
                  type="text"
                  value={orderDesignImageUrl}
                  onChange={(e) => setOrderDesignImageUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 truncate"
                />
              </div>
            </div>

            {/* Advance Payment & Invoice Generation Box */}
            <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createInvoiceForAdvance}
                    onChange={(e) => setCreateInvoiceForAdvance(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5 text-amber-400" />
                    Auto-Generate Official POS Sales Invoice for Advance Payment
                  </span>
                </label>
                <span className="text-xs font-mono font-bold text-slate-300">
                  Remaining Balance Due: <span className="text-rose-400">{StorageService.formatLKR(Math.max(0, Number(orderEstCost) - Number(orderAdvance)))}</span>
                </span>
              </div>

              {createInvoiceForAdvance && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-amber-500/20">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Advance Payment Method *
                    </label>
                    <select
                      value={createOrderPaymentMethod}
                      onChange={(e) => setCreateOrderPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full bg-slate-950 border border-amber-500/40 rounded-lg px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-amber-400"
                    >
                      <option value="Cash">Cash (Immediate Cash Drawer receipt)</option>
                      <option value="Credit Card">Credit Card (POS Terminal)</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Online">Online / QR Transfer</option>
                    </select>
                  </div>
                  <div className="flex items-center text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                    <p className="leading-relaxed">
                      Creates an official linked Sales Invoice (#INV-...) with advance payment recorded. When the job is completed, you can click <strong className="text-emerald-400">"Pay Balance"</strong> to collect the remaining balance.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Artisan Instructions & Setting Specifications
              </label>
              <textarea
                rows={2}
                value={orderInstructions}
                onChange={(e) => setOrderInstructions(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-xs shadow-md shadow-amber-900/30"
              >
                Create Job Sheet & Send to Workshop
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2 & 3: ORDERS LIST (ALL, PENDING, COMPLETED) */}
      {(activeTab === 'orders' || activeTab === 'pending_orders' || activeTab === 'completed_orders') && (
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search order #, customer, item, artisan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <select
                value={filterWorkshop}
                onChange={(e) => setFilterWorkshop(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              >
                <option value="All">All Workshops</option>
                {workshops.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            {activeTab === 'orders' && (
              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="All">All Statuses</option>
                  {ORDER_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Orders Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/70 text-[10px] uppercase font-mono text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-3">Order # / Design</th>
                    <th className="py-3 px-3">Item Details</th>
                    <th className="py-3 px-3">Client</th>
                    <th className="py-3 px-3">Workshop</th>
                    <th className="py-3 px-3 text-right">Gold Given</th>
                    <th className="py-3 px-3 text-right">Cost (LKR)</th>
                    <th className="py-3 px-3">Due Date</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-500">
                        <Hammer className="w-8 h-8 mx-auto mb-2 opacity-30 text-amber-400" />
                        <p className="text-xs font-semibold text-slate-400">No workshop orders found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-850/40">
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2.5">
                            {(ord.designImageUrl || (ord as any).designImageJpgUrl) ? (
                              <img
                                src={ord.designImageUrl || (ord as any).designImageJpgUrl}
                                alt="Design"
                                referrerPolicy="no-referrer"
                                className="w-10 h-10 rounded object-cover border border-slate-700 bg-slate-950 shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 shrink-0">
                                <ImageIcon className="w-4 h-4" />
                              </div>
                            )}
                            <div>
                              <div className="font-mono font-bold text-amber-300">
                                {ord.orderNumber}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {ord.orderDate}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-200 max-w-xs truncate">
                            {ord.productOrItemName}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-xs">
                            {ord.gemstonesGivenDetails}
                          </div>
                        </td>

                        <td className="py-2.5 px-3">
                          <div className="text-slate-200">{ord.customerName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {ord.customerPhone}
                          </div>
                        </td>

                        <td className="py-2.5 px-3">
                          <div className="text-slate-200 font-semibold">{ord.workshopName}</div>
                          <div className="text-[10px] text-amber-400/80">{ord.goldPurity}</div>
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-200">
                          {ord.goldWeightGivenGrams}g
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono">
                          <div className="font-bold text-slate-100">
                            {StorageService.formatLKR(ord.estimatedCostLKR)}
                          </div>
                          <div className="text-[10px] text-emerald-400">
                            Adv: {StorageService.formatLKR(ord.advancePaymentLKR)}
                          </div>
                          {ord.balanceDueLKR !== undefined && ord.balanceDueLKR > 0 ? (
                            <div className="text-[10px] text-rose-400 font-bold">
                              Bal: {StorageService.formatLKR(ord.balanceDueLKR)}
                            </div>
                          ) : (
                            <div className="text-[9px] text-emerald-400 font-bold flex items-center justify-end gap-0.5">
                              <Check className="w-2.5 h-2.5" />
                              <span>Paid in Full</span>
                            </div>
                          )}
                          {ord.invoiceNumber && (
                            <button
                              onClick={() => handleViewOrderInvoice(ord)}
                              className="text-[9px] text-amber-300 font-bold tracking-tight hover:underline flex items-center justify-end gap-0.5 ml-auto cursor-pointer"
                              title="Click to view official invoice receipt"
                            >
                              <Receipt className="w-2.5 h-2.5 text-amber-400" />
                              <span>{ord.invoiceNumber}</span>
                            </button>
                          )}
                        </td>

                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-300">
                          {ord.requiredDate}
                        </td>

                        <td className="py-2.5 px-3 text-center">
                          <select
                            value={ord.status}
                            onChange={(e) =>
                              handleUpdateOrderStatus(ord.id, e.target.value as OrderStatus)
                            }
                            className={`px-2 py-1 rounded text-[10px] font-bold border ${
                              ord.status === 'Completed'
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                                : ord.status === 'In Progress'
                                ? 'bg-amber-950 text-amber-300 border-amber-700'
                                : ord.status === 'Ready for QC'
                                ? 'bg-blue-950 text-blue-300 border-blue-700'
                                : 'bg-slate-950 text-slate-300 border-slate-700'
                            }`}
                          >
                            {ORDER_STATUSES.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {/* If balance due > 0: Pay Balance button */}
                            {(ord.balanceDueLKR !== undefined ? ord.balanceDueLKR : ord.balancePaymentLKR || 0) > 0 && (
                              <button
                                onClick={() => handleOpenBalanceSettleModal(ord)}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded text-xs font-bold flex items-center gap-1 shadow-sm transition-transform active:scale-95"
                                title="Settle remaining balance on finished order"
                              >
                                <DollarSign className="w-3 h-3 stroke-[3]" />
                                <span>Pay Bal</span>
                              </button>
                            )}

                            {/* View Invoice Receipt OR Create Advance Invoice */}
                            {ord.invoiceNumber ? (
                              <button
                                onClick={() => handleViewOrderInvoice(ord)}
                                className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded text-xs font-semibold flex items-center gap-1"
                                title="View / Print Official Invoice Receipt"
                              >
                                <Receipt className="w-3.5 h-3.5" />
                                <span className="hidden xl:inline">Receipt</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleOpenAdvanceInvoiceModal(ord)}
                                className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-xs font-semibold flex items-center gap-1"
                                title="Generate Official POS Invoice for Advance Payment"
                              >
                                <Receipt className="w-3.5 h-3.5" />
                                <span className="hidden xl:inline">+ Invoice</span>
                              </button>
                            )}

                            {/* Job Sheet Print */}
                            <button
                              onClick={() => setPrintableOrder(ord)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded text-xs font-semibold flex items-center gap-1"
                              title="Print A4 Goldsmith Job Sheet"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span className="hidden xl:inline">Sheet</span>
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
        </div>
      )}

      {/* TAB 4: ARTISAN WORKSHOPS DIRECTORY */}
      {activeTab === 'workshops' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Artisan & Goldsmith Directory ({workshops.length})
            </h3>
            <button
              onClick={handleOpenAddWorkshop}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-xs"
            >
              <Plus className="w-4 h-4" />
              Add Goldsmith Workshop
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workshops.map((ws) => (
              <div
                key={ws.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-xl p-5 shadow space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm">{ws.name}</h4>
                    <p className="text-xs text-amber-400 font-medium">{ws.specialty}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    {ws.activeOrdersCount} Active Jobs
                  </span>
                </div>

                <div className="text-xs text-slate-400 space-y-1 pt-1 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>Contact: {ws.contactPerson}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{ws.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate">{ws.address}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-end gap-2">
                  <button
                    onClick={() => handleOpenEditWorkshop(ws)}
                    className="p-1.5 text-slate-400 hover:text-amber-300"
                    title="Edit workshop"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: WORKMEN & BENCH ARTISANS */}
      {activeTab === 'workmen' && (
        <WorkmenListView
          workmen={workmen}
          workshops={workshops}
          onAddWorkman={() => setIsAddWorkmanModalOpen(true)}
          onPayWorkman={(id) => {
            setPreselectedWorkmanId(id);
            setIsWorkmanPaymentModalOpen(true);
          }}
        />
      )}

      {/* TAB 6: WORKMAN PAYMENT INVOICES */}
      {activeTab === 'workman_payments' && (
        <WorkmanPaymentsListView
          payments={employeePayments}
          workmen={workmen}
          onNewPaymentInvoice={() => {
            setPreselectedWorkmanId(undefined);
            setIsWorkmanPaymentModalOpen(true);
          }}
          onViewVoucher={(p) => setPrintablePayment(p)}
        />
      )}

      {/* Workshop Add / Edit Modal */}
      <Modal
        isOpen={isWorkshopModalOpen}
        onClose={() => setIsWorkshopModalOpen(false)}
        title={editingWorkshop ? 'Edit Goldsmith Workshop' : 'Add New Goldsmith Workshop'}
        subtitle="Maintain master contact information and jewel-crafting specialties"
        maxWidth="md"
      >
        <form onSubmit={handleSaveWorkshop} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Workshop / Studio Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Master Goldsmith Shantha Studio"
              value={wsName}
              onChange={(e) => setWsName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Contact Person
              </label>
              <input
                type="text"
                value={wsContactPerson}
                onChange={(e) => setWsContactPerson(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={wsPhone}
                onChange={(e) => setWsPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Address</label>
            <input
              type="text"
              value={wsAddress}
              onChange={(e) => setWsAddress(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Craft Specialty
            </label>
            <input
              type="text"
              placeholder="e.g. Traditional Sri Lankan 22K handmade filigree & micro-prong setting"
              value={wsSpecialty}
              onChange={(e) => setWsSpecialty(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsWorkshopModalOpen(false)}
              className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded text-xs"
            >
              Save Workshop
            </button>
          </div>
        </form>
      </Modal>

      {/* Workshop Job Sheet Printable A4 Modal */}
      {printableOrder && (
        <Modal
          isOpen={true}
          onClose={() => setPrintableOrder(null)}
          title={`Workshop Job Sheet — ${printableOrder.orderNumber}`}
          subtitle="Official A4 handover job sheet with goldsmith instructions and design JPG"
          maxWidth="3xl"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-2 shadow"
              >
                <Printer className="w-4 h-4" />
                Print Job Sheet (A4)
              </button>
              <div className="text-xs text-slate-400">
                Job Status: <strong className="text-amber-400">{printableOrder.status}</strong>
              </div>
            </div>

            {/* A4 Paper Printable Job Sheet */}
            <div
              id="printable-workshop-jobsheet"
              className="bg-white text-slate-900 rounded-lg p-8 shadow-2xl border border-slate-300 font-sans mx-auto max-w-2xl"
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4 mb-4">
                <div>
                  <h1 className="text-xl font-black uppercase text-slate-900 font-serif">
                    {settings.companyName}
                  </h1>
                  <p className="text-xs text-amber-800 font-bold uppercase tracking-wider">
                    Goldsmith Workshop Production Sheet
                  </p>
                  <p className="text-[10px] text-slate-600 mt-0.5">
                    Showroom Hotline: {settings.telephone}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded border border-slate-300 inline-block">
                    ORDER NO: {printableOrder.orderNumber}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1">Date: {printableOrder.orderDate}</div>
                  <div className="text-[11px] font-bold text-rose-700">
                    REQUIRED DUE: {printableOrder.requiredDate}
                  </div>
                </div>
              </div>

              {/* Assigned Workshop & Client Info */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded border border-slate-200 text-xs mb-4">
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-500">ASSIGNED ARTISAN:</div>
                  <div className="font-bold text-sm text-slate-900">{printableOrder.workshopName}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-500">CUSTOMER REFERENCE:</div>
                  <div className="font-bold text-slate-900">{printableOrder.customerName}</div>
                  <div className="text-slate-600">{printableOrder.customerPhone}</div>
                </div>
              </div>

              {/* Design Image & Item Spec */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                {(printableOrder.designImageUrl || (printableOrder as any).designImageJpgUrl) && (
                  <div className="text-center">
                    <img
                      src={printableOrder.designImageUrl || (printableOrder as any).designImageJpgUrl}
                      alt="Design sketch"
                      referrerPolicy="no-referrer"
                      className="w-full h-32 object-cover rounded border border-slate-300"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">Design Reference</span>
                  </div>
                )}
                <div className="col-span-2 space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-500">PIECE TO CREATE:</span>
                    <div className="font-bold text-slate-900 text-sm">
                      {printableOrder.productOrItemName}
                    </div>
                  </div>
                  <div className="text-slate-700">
                    Metal Specification: <strong>{printableOrder.goldPurity}</strong>
                  </div>
                </div>
              </div>

              {/* Handover Specifications Table */}
              <table className="w-full text-left text-xs mb-4 border border-slate-300">
                <thead className="bg-slate-100 text-[10px] uppercase font-mono border-b border-slate-300">
                  <tr>
                    <th className="py-2 px-3">Item / Material Given</th>
                    <th className="py-2 px-3 text-right">Quantity / Weight Given</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="py-2 px-3 font-semibold">Allocated Pure/Alloy Gold Weight</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                      {printableOrder.goldWeightGivenGrams} grams
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">Gemstones Handed Over to Goldsmith</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-800">
                      {printableOrder.gemstonesGivenDetails}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">Agreed Workshop Labor Cost</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-900">
                      Rs. {printableOrder.estimatedCostLKR.toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">Advance Payment Disbursed</td>
                    <td className="py-2 px-3 text-right font-mono text-emerald-700 font-bold">
                      Rs. {printableOrder.advancePaymentLKR.toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">Balance Due Upon Final QC</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                      Rs. {printableOrder.balancePaymentLKR.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Special Instructions */}
              <div className="bg-amber-50/60 border border-amber-200 rounded p-3 text-xs mb-6">
                <div className="font-bold text-amber-900 text-[11px] uppercase mb-1">
                  Bench Goldsmith Instructions:
                </div>
                <p className="text-slate-700 leading-relaxed">
                  {printableOrder.specialInstructions || 'Standard high quality polish and secure stone setting.'}
                </p>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-300 text-xs">
                <div className="text-center">
                  <div className="h-10"></div>
                  <div className="border-t border-slate-400 pt-1 font-bold text-slate-700">
                    Workshop Artisan Handover Signature
                  </div>
                </div>
                <div className="text-center">
                  <div className="h-10"></div>
                  <div className="border-t border-slate-400 pt-1 font-bold text-slate-700">
                    Showroom Workshop Manager Signature
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 1: Create Official Advance Invoice for Work Order */}
      {orderForAdvanceInvoice && (
        <Modal
          isOpen={true}
          onClose={() => setOrderForAdvanceInvoice(null)}
          title={`Generate Advance Payment Invoice — ${orderForAdvanceInvoice.orderNumber}`}
          subtitle={`Customer: ${orderForAdvanceInvoice.customerName} | Item: ${orderForAdvanceInvoice.productOrItemName}`}
          maxWidth="lg"
        >
          <form onSubmit={handleConfirmCreateAdvanceInvoice} className="space-y-4">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Agreed Job Cost:</span>
                <span className="font-mono font-bold text-slate-100">
                  {StorageService.formatLKR(orderForAdvanceInvoice.estimatedCostLKR)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Recorded Advance:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {StorageService.formatLKR(orderForAdvanceInvoice.advancePaymentLKR)}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-1.5">
                <span className="text-slate-400">Balance Due Upon Completion:</span>
                <span className="font-mono font-bold text-rose-400">
                  {StorageService.formatLKR(
                    Math.max(
                      0,
                      orderForAdvanceInvoice.estimatedCostLKR - advanceInvoiceAmount
                    )
                  )}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Advance Payment Amount to Invoice (Rs.) *
              </label>
              <input
                type="number"
                required
                min={1}
                max={orderForAdvanceInvoice.estimatedCostLKR}
                value={advanceInvoiceAmount}
                onChange={(e) => setAdvanceInvoiceAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Payment Method *
              </label>
              <select
                value={advancePaymentMethod}
                onChange={(e) => setAdvancePaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-amber-500"
              >
                <option value="Cash">Cash (Immediate POS Cash Drawer)</option>
                <option value="Credit Card">Credit Card (Swipe / Chip)</option>
                <option value="Bank Transfer">Bank Transfer / Direct Deposit</option>
                <option value="Cheque">Cheque</option>
                <option value="Online">Online Payment Gateway</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setOrderForAdvanceInvoice(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow"
              >
                <Receipt className="w-3.5 h-3.5" />
                Generate Advance Invoice & Receipt
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 2: Settle Work Order Final Balance */}
      {orderForBalanceSettle && (
        <Modal
          isOpen={true}
          onClose={() => setOrderForBalanceSettle(null)}
          title={`Settle Order Balance & Complete Job — ${orderForBalanceSettle.orderNumber}`}
          subtitle={`Customer: ${orderForBalanceSettle.customerName} | Item: ${orderForBalanceSettle.productOrItemName}`}
          maxWidth="lg"
        >
          <form onSubmit={handleConfirmSettleBalance} className="space-y-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Workshop Order Cost:</span>
                <span className="font-mono font-bold text-slate-100 text-sm">
                  {StorageService.formatLKR(orderForBalanceSettle.estimatedCostLKR)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Advance Paid Earlier:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {StorageService.formatLKR(orderForBalanceSettle.advancePaymentLKR)}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-2">
                <span className="text-slate-300 font-bold">Outstanding Balance Due:</span>
                <span className="font-mono font-black text-rose-400 text-base">
                  {StorageService.formatLKR(
                    orderForBalanceSettle.balanceDueLKR !== undefined
                      ? orderForBalanceSettle.balanceDueLKR
                      : orderForBalanceSettle.balancePaymentLKR || 0
                  )}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Settlement Payment Amount (Rs.) *
              </label>
              <input
                type="number"
                required
                min={1}
                max={
                  orderForBalanceSettle.balanceDueLKR !== undefined
                    ? orderForBalanceSettle.balanceDueLKR
                    : orderForBalanceSettle.balancePaymentLKR || 0
                }
                value={balancePaymentAmount}
                onChange={(e) => setBalancePaymentAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-emerald-500/50 rounded-lg px-3 py-2 text-base text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-400"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Defaults to full balance due. Receiving this payment completes the order and updates the invoice to Paid.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Payment Method *
                </label>
                <select
                  value={balancePaymentMethod}
                  onChange={(e) => setBalancePaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-emerald-400"
                >
                  <option value="Cash">Cash (Immediate Receipt)</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Online">Online Payment</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Cashier / Received By
                </label>
                <input
                  type="text"
                  disabled
                  value={currentUser.name}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-400 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Settlement Notes (Optional)
              </label>
              <input
                type="text"
                value={balancePaymentNotes}
                onChange={(e) => setBalancePaymentNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-400"
                placeholder="e.g. Order inspected and delivered to client"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setOrderForBalanceSettle(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow"
              >
                <CheckCircle className="w-4 h-4 stroke-[2.5]" />
                Confirm Payment & Complete Order
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 3: View & Print Official Work Order Invoice Receipt */}
      {viewingInvoice && (
        <Modal
          isOpen={true}
          onClose={() => setViewingInvoice(null)}
          title={`Official Invoice Receipt — ${viewingInvoice.invoiceNumber}`}
          subtitle="Linked POS receipt for custom craft workshop job"
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-2 shadow"
              >
                <Printer className="w-4 h-4" />
                Print Invoice Receipt
              </button>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    viewingInvoice.paymentStatus === 'paid'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : viewingInvoice.paymentStatus === 'partial'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {viewingInvoice.paymentStatus === 'paid'
                    ? 'PAID IN FULL'
                    : viewingInvoice.paymentStatus === 'partial'
                    ? 'PARTIAL / ADVANCE RECEIVED'
                    : 'PAYMENT DUE'}
                </span>
              </div>
            </div>

            {/* Printable Receipt Paper */}
            <div
              id="printable-workorder-invoice"
              className="bg-white text-slate-900 rounded-lg p-6 sm:p-8 shadow-2xl border border-slate-300 font-sans mx-auto max-w-lg"
            >
              {/* Header */}
              <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
                <h1 className="text-lg font-black uppercase text-slate-900 font-serif">
                  {settings.companyName}
                </h1>
                <p className="text-[11px] text-slate-600">{settings.companyAddress || (settings as any).address}</p>
                <p className="text-[11px] text-slate-600">Hotline: {settings.telephone}</p>
                <div className="inline-block mt-2 px-3 py-0.5 bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider rounded">
                  Official Custom Job Invoice
                </div>
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 text-xs mb-4 pb-3 border-b border-slate-200">
                <div>
                  <div className="text-slate-500 text-[10px] uppercase">Invoice No:</div>
                  <div className="font-mono font-bold text-slate-900">{viewingInvoice.invoiceNumber}</div>
                  <div className="text-slate-500 text-[10px] uppercase mt-1">Work Order Ref:</div>
                  <div className="font-mono font-bold text-amber-700">{viewingInvoice.workOrderNumber || 'N/A'}</div>
                </div>
                <div className="text-right">
                  <div className="text-slate-500 text-[10px] uppercase">Date:</div>
                  <div className="font-mono text-slate-900">{viewingInvoice.date}</div>
                  <div className="text-slate-500 text-[10px] uppercase mt-1">Cashier:</div>
                  <div className="font-medium text-slate-900">{viewingInvoice.cashierName || 'WCS Staff'}</div>
                </div>
              </div>

              {/* Customer */}
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-xs mb-4">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Customer:</span>
                <div className="font-bold text-slate-900">{viewingInvoice.customerName}</div>
                <div className="text-slate-600 text-[11px]">{viewingInvoice.customerPhone}</div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left text-xs mb-4 border border-slate-200">
                <thead className="bg-slate-100 text-[10px] uppercase font-mono border-b border-slate-200">
                  <tr>
                    <th className="py-1.5 px-2">Description</th>
                    <th className="py-1.5 px-2 text-right">Amount (LKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {viewingInvoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-2 font-medium">{item.name}</td>
                      <td className="py-2 px-2 text-right font-mono font-bold">
                        {item.totalLKR.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="space-y-1.5 text-xs border-t-2 border-slate-900 pt-3">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Grand Total Job Cost:</span>
                  <span className="font-mono">{viewingInvoice.grandTotalLKR.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-semibold text-emerald-700">
                  <span>Advance / Amount Paid:</span>
                  <span className="font-mono">
                    Rs. {viewingInvoice.paidAmountLKR.toLocaleString()} ({viewingInvoice.paymentMethod})
                  </span>
                </div>
                <div className="flex justify-between font-bold text-sm text-slate-900 border-t border-slate-200 pt-1.5">
                  <span>Remaining Balance Due:</span>
                  <span className={`font-mono ${viewingInvoice.balanceLKR > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                    Rs. {viewingInvoice.balanceLKR.toLocaleString()}
                  </span>
                </div>
              </div>

              {viewingInvoice.notes && (
                <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-600 italic">
                  Note: {viewingInvoice.notes}
                </div>
              )}

              <div className="mt-6 text-center text-[10px] text-slate-500 pt-3 border-t border-slate-200">
                Thank you for your valued custom! Keep this receipt for collection.
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* OPTIONAL MODAL 1: Add Workman */}
      <AddWorkmanModal
        isOpen={isAddWorkmanModalOpen}
        onClose={() => setIsAddWorkmanModalOpen(false)}
        workshops={workshops}
        onWorkmanAdded={() => {
          refreshWorkmenData();
          onRefresh();
        }}
      />

      {/* OPTIONAL MODAL 2: Add Workman to Payment Invoice */}
      <WorkmanPaymentModal
        isOpen={isWorkmanPaymentModalOpen}
        onClose={() => setIsWorkmanPaymentModalOpen(false)}
        workmen={workmen}
        orders={orders}
        currentUser={currentUser}
        preselectedWorkmanId={preselectedWorkmanId}
        onPaymentCreated={(payment) => {
          refreshWorkmenData();
          onRefresh();
          setPrintablePayment(payment);
        }}
      />

      {/* OPTIONAL MODAL 3: Printable Workman Payment Invoice Voucher */}
      <WorkmanPaymentVoucherModal
        isOpen={!!printablePayment}
        onClose={() => setPrintablePayment(null)}
        payment={printablePayment}
        settings={settings}
        workmen={workmen}
      />

      {/* OPTIONAL MODAL 4: Advance Payment Add */}
      <AdvancePaymentAddModal
        isOpen={isAdvancePaymentModalOpen}
        onClose={() => setIsAdvancePaymentModalOpen(false)}
        orders={orders}
        workshops={workshops}
        workmen={workmen}
        currentUser={currentUser}
        onAdvanceRecorded={(invoice) => {
          onRefresh();
          if (invoice) {
            setViewingInvoice(invoice);
          }
        }}
      />

      {/* OPTIONAL MODAL 5: Balance Pay Add */}
      <BalancePayAddModal
        isOpen={isBalancePayModalOpen}
        onClose={() => setIsBalancePayModalOpen(false)}
        orders={orders}
        currentUser={currentUser}
        onBalancePaid={(invoice) => {
          onRefresh();
          if (invoice) {
            setViewingInvoice(invoice);
          }
        }}
      />
    </div>
  );
};
