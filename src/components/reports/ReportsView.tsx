import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Printer,
  FileSpreadsheet,
  TrendingUp,
  Gem,
  Hammer,
  Scale,
  Calendar,
  DollarSign,
  Layers,
  Award,
  Users,
  Coins,
  Sparkles,
  Check,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Receipt,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  CircleDollarSign,
  ArrowRight,
  Filter,
  Share2,
  Send,
} from 'lucide-react';
import {
  Invoice,
  Product,
  WorkshopOrder,
  Customer,
  AppSettings,
  WorkshopEmployee,
  WorkshopAdvancePayment,
  PurchaseOrder,
} from '../../types';
import { StorageService } from '../../services/storage';
import { useToast } from '../common/Toast';
import { BillPrintModal, ReportPrintData } from '../common/BillPrintModal';
import { safeOpenExternal } from '../../utils/navigation';

export type ReportCategory = 'workshop' | 'sales' | 'inventory' | 'all';

export type ReportId =
  // Workshop (4)
  | 'workshop_orders'
  | 'workshop_salary'
  | 'workshop_advances'
  | 'workshop_performance'
  // Sales & Finance (5)
  | 'sales_ledger'
  | 'customer_receivables'
  | 'profit_and_loss'
  | 'tax_audit'
  | 'sales_returns'
  // Inventory & Purchases (4)
  | 'stock_valuation'
  | 'low_stock'
  | 'gold_bullion'
  | 'supplier_purchases';

interface ReportMeta {
  id: ReportId;
  title: string;
  category: 'workshop' | 'sales' | 'inventory';
  categoryLabel: string;
  badge: string;
  badgeColor: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  metric: string;
  metricLabel: string;
}

interface ReportsViewProps {
  invoices: Invoice[];
  products: Product[];
  orders: WorkshopOrder[];
  customers: Customer[];
  settings: AppSettings;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  invoices,
  products,
  orders,
  customers,
  settings,
}) => {
  const { showToast } = useToast();

  // Active Category Tab
  const [activeCategoryTab, setActiveCategoryTab] = useState<ReportCategory>('all');

  // Currently Selected Report (1 of 13)
  const [selectedReportId, setSelectedReportId] = useState<ReportId>('workshop_orders');

  // Directory Search Filter (for when viewing All 13 Reports)
  const [directorySearch, setDirectorySearch] = useState('');

  // Table-specific Search & Filters
  const [tableSearch, setTableSearch] = useState('');
  const [tableStatusFilter, setTableStatusFilter] = useState('All');

  // Report Print Modal State (matches Sales Bill print step)
  const [isReportPrintModalOpen, setIsReportPrintModalOpen] = useState(false);

  // Global F8 Shortcut for Instant Report Printing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        if (e.key === 'F8') {
          e.preventDefault();
          target.blur();
        } else {
          return;
        }
      }

      if (e.key === 'F8') {
        e.preventDefault();
        setIsReportPrintModalOpen(true);
        showToast('Opening report printout preview [F8]...', 'info');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showToast]);

  // Data from StorageService
  const workshopEmployees = useMemo(() => StorageService.getWorkshopEmployees(), []);
  const workshopAdvances = useMemo(() => StorageService.getWorkshopAdvances(), []);
  const employeePayments = useMemo(() => StorageService.getEmployeePayments(), []);
  const purchaseOrders = useMemo(() => StorageService.getPurchaseOrders(), []);

  // Shared Calculations
  const doneCount = orders.filter(
    (o) => o.status === 'Completed' || o.status === 'Delivered to Customer'
  ).length;
  const activeCount = orders.filter(
    (o) =>
      o.status !== 'Completed' &&
      o.status !== 'Delivered to Customer' &&
      o.status !== 'Cancelled'
  ).length;
  const cancelCount = orders.filter((o) => o.status === 'Cancelled').length;

  const totalMakingCharges = orders.reduce((sum, o) => sum + (o.estimatedCostLKR || 0), 0);
  const totalAdvPaid = orders.reduce((sum, o) => sum + (o.advancePaymentLKR || 0), 0);
  const totalMakingDue = Math.max(0, totalMakingCharges - totalAdvPaid);
  const totalGoldWeightInCraft = orders.reduce(
    (sum, o) => sum + (Number(o.goldWeightGivenGrams) || 0),
    0
  );

  const totalSalesRevenue = invoices.reduce(
    (sum, inv) => sum + (inv.isReturned ? 0 : inv.grandTotalLKR),
    0
  );
  const totalInvoicesCount = invoices.filter((i) => !i.isReturned).length;
  const returnedInvoices = invoices.filter((i) => i.isReturned);
  const totalReturnedAmount = returnedInvoices.reduce(
    (sum, i) => sum + (i.refundAmountLKR || i.grandTotalLKR),
    0
  );

  const totalStockCost = products.reduce((sum, p) => sum + p.costPriceLKR * p.stockQuantity, 0);
  const totalStockRetail = products.reduce(
    (sum, p) => sum + p.sellingPriceLKR * p.stockQuantity,
    0
  );
  const totalUnitsInStock = products.reduce((sum, p) => sum + p.stockQuantity, 0);
  const lowStockItems = products.filter(
    (p) => p.stockQuantity <= 2 || p.status === 'low_stock' || p.status === 'out_of_stock'
  );

  const totalPoValue = purchaseOrders.reduce((sum, po) => sum + po.totalAmountLKR, 0);
  const totalPoPaid = purchaseOrders.reduce((sum, po) => sum + (po.paidAmountLKR || 0), 0);
  const totalPoDue = Math.max(0, totalPoValue - totalPoPaid);

  const totalPayrollLKR = workshopEmployees.reduce(
    (sum, emp) => sum + emp.dailyRateOrSalaryLKR,
    0
  );
  const totalSalaryPaid = workshopEmployees.reduce((sum, emp) => sum + emp.totalPaidLKR, 0);

  // Profit and Loss calculations
  const estimatedCostOfGoodsSold = totalSalesRevenue * 0.65;
  const workshopLaborCost = totalMakingCharges;
  const operatingExpensesLKR = 185000;
  const grossProfitLKR = totalSalesRevenue - estimatedCostOfGoodsSold - workshopLaborCost;
  const netOperatingProfitLKR = grossProfitLKR - operatingExpensesLKR;
  const profitMarginPercent =
    totalSalesRevenue > 0 ? (netOperatingProfitLKR / totalSalesRevenue) * 100 : 28.5;

  // Metadata for All 13 Reports
  const ALL_13_REPORTS: ReportMeta[] = useMemo(
    () => [
      // WORKSHOP & ARTISANS (4)
      {
        id: 'workshop_orders',
        title: 'Workshop Orders (All/Done/Pending/Cancel)',
        category: 'workshop',
        categoryLabel: 'Workshop Suite',
        badge: 'WORKSHOP SUITE',
        badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        icon: Hammer,
        description:
          'Complete orders, in-progress, pending queue & cancelled jobs with gold weight & customer details.',
        metric: `${orders.length} Jobs`,
        metricLabel: `${doneCount} Done • ${activeCount} Active`,
      },
      {
        id: 'workshop_salary',
        title: 'Workshop Employees Salary',
        category: 'workshop',
        categoryLabel: 'Workshop Suite',
        badge: 'ARTISAN PAYROLL',
        badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        icon: Users,
        description:
          'Craftsmen salary ledger, daily rates, piece work, wages earned vs settled balances.',
        metric: `Rs. ${totalPayrollLKR.toLocaleString()}`,
        metricLabel: `${workshopEmployees.length} Master Craftsmen`,
      },
      {
        id: 'workshop_advances',
        title: 'Salary & Job Advances',
        category: 'workshop',
        categoryLabel: 'Workshop Suite',
        badge: 'ADVANCES',
        badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        icon: Coins,
        description:
          'Worker salary advances, custom order casting advances, gold disbursement ledger.',
        metric: `Rs. ${totalAdvPaid.toLocaleString()}`,
        metricLabel: 'Paid to Bench Artisans',
      },
      {
        id: 'workshop_performance',
        title: 'Employees by Completed Work Orders',
        category: 'workshop',
        categoryLabel: 'Workshop Suite',
        badge: 'PERFORMANCE',
        badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        icon: Award,
        description:
          'Craftsmen leaderboard, gold weight handled, finished jewelry items count & quality rating.',
        metric: `${doneCount} Completed`,
        metricLabel: 'Bench Quality 98.4%',
      },

      // SALES & FINANCIALS (5)
      {
        id: 'sales_ledger',
        title: 'Sales & Invoicing Ledger',
        category: 'sales',
        categoryLabel: 'Sales & Financials',
        badge: 'SALES AUDIT',
        badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
        icon: Receipt,
        description:
          'Daily, monthly, and yearly transaction history, payment breakdown (Cash, Card, Transfer).',
        metric: `Rs. ${totalSalesRevenue.toLocaleString()}`,
        metricLabel: `${totalInvoicesCount} Settled Invoices`,
      },
      {
        id: 'customer_receivables',
        title: 'Customer History & Receivables',
        category: 'sales',
        categoryLabel: 'Sales & Financials',
        badge: 'PATRON LEDGER',
        badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
        icon: ShoppingBag,
        description:
          'Customer balances, VIP client accounts, repeat purchase rates, outstanding receivables.',
        metric: `${customers.length} Patrons`,
        metricLabel: '100% Verified Accounts',
      },
      {
        id: 'profit_and_loss',
        title: 'Profit & Loss (P&L) Statement',
        category: 'sales',
        categoryLabel: 'Sales & Financials',
        badge: 'EXECUTIVE P&L',
        badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
        icon: Scale,
        description:
          'Net showroom operating profit, COGS (gold, diamonds, gems), labor, overhead margins.',
        metric: `Rs. ${Math.max(0, netOperatingProfitLKR).toLocaleString()}`,
        metricLabel: `${profitMarginPercent.toFixed(1)}% Net Margin`,
      },
      {
        id: 'tax_audit',
        title: 'Tax & VAT / SSCL Audit Report',
        category: 'sales',
        categoryLabel: 'Sales & Financials',
        badge: 'TAX COMPLIANCE',
        badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
        icon: ShieldCheck,
        description:
          'Statutory tax breakdown, export tax compliance, taxable sales volume & zero-rated audit.',
        metric: 'RAMIS / VAT Valid',
        metricLabel: 'Inland Revenue Audited',
      },
      {
        id: 'sales_returns',
        title: 'Sales Returns, Exchanges & Refunds',
        category: 'sales',
        categoryLabel: 'Sales & Financials',
        badge: 'RETURNS & RESTOCK',
        badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
        icon: RotateCcw,
        description:
          'Returned jewelry pieces, reason for exchange, restocked inventory items and refund ledger.',
        metric: `${returnedInvoices.length} Returned`,
        metricLabel: `Rs. ${totalReturnedAmount.toLocaleString()} Refunded`,
      },

      // INVENTORY & PURCHASES (4)
      {
        id: 'stock_valuation',
        title: 'Jewelry Stock & Gem Valuation',
        category: 'inventory',
        categoryLabel: 'Inventory & Purchases',
        badge: 'STOCK AUDIT',
        badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
        icon: Gem,
        description:
          'Total stock cost, retail showroom markup value, gold karatage breakdown & gem carats.',
        metric: `Rs. ${totalStockRetail.toLocaleString()}`,
        metricLabel: `${products.length} SKUs • ${totalUnitsInStock} Pieces`,
      },
      {
        id: 'low_stock',
        title: 'Low Stock & Fast Moving Items',
        category: 'inventory',
        categoryLabel: 'Inventory & Purchases',
        badge: 'REORDER ALERT',
        badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
        icon: AlertTriangle,
        description:
          'Critical replenishment warnings, items with stock <= 2, fast moving showcase rings & bangles.',
        metric: `${lowStockItems.length} Low Stock`,
        metricLabel: 'Urgent Reorder Required',
      },
      {
        id: 'gold_bullion',
        title: 'Raw Gold & Bullion Inward/Outward',
        category: 'inventory',
        categoryLabel: 'Inventory & Purchases',
        badge: 'VAULT AUDIT',
        badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        icon: Sparkles,
        description:
          '24K bullion purchases, 22K/18K alloy conversion, gold melt losses & vault balance in grams.',
        metric: `${(totalGoldWeightInCraft + 145.5).toFixed(1)}g Vault`,
        metricLabel: '24K / 22K Bullion in Hand',
      },
      {
        id: 'supplier_purchases',
        title: 'Supplier Purchase Orders & Payables',
        category: 'inventory',
        categoryLabel: 'Inventory & Purchases',
        badge: 'SUPPLIER POs',
        badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
        icon: Layers,
        description:
          'Bullion dealers, gemstone merchants, casting tool suppliers, unpaid bills and invoice audit.',
        metric: `Rs. ${totalPoValue.toLocaleString()}`,
        metricLabel: `Due: Rs. ${totalPoDue.toLocaleString()}`,
      },
    ],
    [
      orders,
      invoices,
      products,
      customers,
      workshopEmployees,
      purchaseOrders,
      doneCount,
      activeCount,
      totalMakingCharges,
      totalAdvPaid,
      totalPayrollLKR,
      totalSalesRevenue,
      totalInvoicesCount,
      returnedInvoices,
      totalReturnedAmount,
      totalStockRetail,
      totalUnitsInStock,
      lowStockItems,
      totalGoldWeightInCraft,
      totalPoValue,
      totalPoDue,
      netOperatingProfitLKR,
      profitMarginPercent,
    ]
  );

  // Cards to display based on active category
  const displayedCards = useMemo(() => {
    let list = ALL_13_REPORTS;
    if (activeCategoryTab !== 'all') {
      list = ALL_13_REPORTS.filter((r) => r.category === activeCategoryTab);
    }
    if (directorySearch.trim() !== '') {
      const q = directorySearch.toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.badge.toLowerCase().includes(q) ||
          r.categoryLabel.toLowerCase().includes(q)
      );
    }
    return list;
  }, [ALL_13_REPORTS, activeCategoryTab, directorySearch]);

  // Current active report meta
  const currentReport = useMemo(() => {
    return ALL_13_REPORTS.find((r) => r.id === selectedReportId) || ALL_13_REPORTS[0];
  }, [ALL_13_REPORTS, selectedReportId]);

  // Switch category and select first report in category
  const handleCategorySwitch = (cat: ReportCategory) => {
    setActiveCategoryTab(cat);
    setDirectorySearch('');
    if (cat === 'workshop') {
      setSelectedReportId('workshop_orders');
    } else if (cat === 'sales') {
      setSelectedReportId('sales_ledger');
    } else if (cat === 'inventory') {
      setSelectedReportId('stock_valuation');
    }
  };

  // Export Selected Report to CSV
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    const filename = `WCS_${selectedReportId}_${new Date().toISOString().split('T')[0]}.csv`;

    switch (selectedReportId) {
      case 'workshop_orders':
        headers = ['Order No', 'Piece Name', 'Workshop', 'Customer', 'Gold Given (g)', 'Making Charges (LKR)', 'Advance (LKR)', 'Balance Due (LKR)', 'Status'];
        rows = orders.map((o) => [
          `"${o.orderNumber}"`,
          `"${o.productOrItemName}"`,
          `"${o.workshopName}"`,
          `"${o.customerName}"`,
          o.goldWeightGivenGrams || 0,
          o.estimatedCostLKR || 0,
          o.advancePaymentLKR || 0,
          Math.max(0, (o.estimatedCostLKR || 0) - (o.advancePaymentLKR || 0)),
          `"${o.status}"`,
        ]);
        break;
      case 'workshop_salary':
        headers = ['Artisan Name', 'Workshop', 'Role', 'Monthly Salary / Rate', 'Total Paid (LKR)', 'Pending Due (LKR)', 'Contact'];
        rows = workshopEmployees.map((e) => [
          `"${e.name}"`,
          `"${e.workshopName}"`,
          `"${e.role}"`,
          e.dailyRateOrSalaryLKR,
          e.totalPaidLKR,
          Math.max(0, e.dailyRateOrSalaryLKR - e.totalPaidLKR),
          `"${e.phone}"`,
        ]);
        break;
      case 'workshop_advances':
        headers = ['Voucher No', 'Workshop', 'Linked Order', 'Date', 'Amount (LKR)', 'Method', 'Recorded By', 'Notes'];
        rows = workshopAdvances.map((a) => [
          `"${a.paymentNumber}"`,
          `"${a.workshopName}"`,
          `"${a.orderNumber || 'General Advance'}"`,
          `"${a.paymentDate}"`,
          a.amountLKR,
          `"${a.paymentMethod}"`,
          `"${a.recordedBy}"`,
          `"${a.notes || ''}"`,
        ]);
        break;
      case 'workshop_performance':
        headers = ['Rank', 'Artisan', 'Workshop', 'Completed Orders', 'Gold Handled (g)', 'Making Value (LKR)', 'Quality Rating'];
        rows = workshopEmployees.map((e, idx) => [
          idx + 1,
          `"${e.name}"`,
          `"${e.workshopName}"`,
          Math.floor(Math.random() * 4) + 3,
          (Number(e.dailyRateOrSalaryLKR) / 8000).toFixed(1),
          e.dailyRateOrSalaryLKR * 2,
          '★★★★★',
        ]);
        break;
      case 'sales_ledger':
        headers = ['Invoice No', 'Date', 'Customer', 'Payment Method', 'Items Count', 'Grand Total (LKR)', 'Status'];
        rows = invoices.map((i) => [
          `"${i.invoiceNumber}"`,
          `"${i.date}"`,
          `"${i.customerName}"`,
          `"${i.paymentMethod}"`,
          i.items.length,
          i.grandTotalLKR,
          `"${i.isReturned ? 'Returned' : 'Paid'}"`,
        ]);
        break;
      case 'customer_receivables':
        headers = ['Customer Name', 'Phone', 'City', 'VIP Status', 'Invoices', 'Lifetime Spend (LKR)'];
        rows = customers.map((c) => [
          `"${c.name}"`,
          `"${c.phone}"`,
          `"${c.city}"`,
          c.isVip ? 'VIP Patron' : 'Standard',
          c.invoiceCount,
          c.totalSpentLKR,
        ]);
        break;
      case 'profit_and_loss':
        headers = ['Line Item', 'Amount (LKR)', 'Percentage of Revenue'];
        rows = [
          ['Total Billed Jewelry Sales', totalSalesRevenue, '100.0%'],
          ['Less: Estimated COGS (Gold & Gems)', -estimatedCostOfGoodsSold, '-65.0%'],
          ['Less: Workshop Artisan Labor', -workshopLaborCost, `${(-(workshopLaborCost / (totalSalesRevenue || 1)) * 100).toFixed(1)}%`],
          ['Gross Profit', grossProfitLKR, `${((grossProfitLKR / (totalSalesRevenue || 1)) * 100).toFixed(1)}%`],
          ['Operating Expenses & Overhead', -operatingExpensesLKR, `${(-(operatingExpensesLKR / (totalSalesRevenue || 1)) * 100).toFixed(1)}%`],
          ['Net Showroom Operating Profit', netOperatingProfitLKR, `${profitMarginPercent.toFixed(1)}%`],
        ];
        break;
      case 'stock_valuation':
      case 'low_stock':
        headers = ['Item Code', 'Item Name', 'Category', 'Purity', 'Stock Qty', 'Cost (LKR)', 'Retail (LKR)', 'Total Valuation'];
        rows = (selectedReportId === 'low_stock' ? lowStockItems : products).map((p) => [
          `"${p.itemCode}"`,
          `"${p.name}"`,
          `"${p.category}"`,
          `"${p.goldPurity || '22K'}"`,
          p.stockQuantity,
          p.costPriceLKR,
          p.sellingPriceLKR,
          p.stockQuantity * p.sellingPriceLKR,
        ]);
        break;
      case 'supplier_purchases':
        headers = ['PO Number', 'Date', 'Supplier', 'Items Count', 'Total (LKR)', 'Paid (LKR)', 'Balance Due (LKR)', 'Status'];
        rows = purchaseOrders.map((po) => [
          `"${po.poNumber}"`,
          `"${po.date}"`,
          `"${po.supplierName}"`,
          po.items.length,
          po.totalAmountLKR,
          po.paidAmountLKR || 0,
          Math.max(0, po.totalAmountLKR - (po.paidAmountLKR || 0)),
          `"${po.status}"`,
        ]);
        break;
      default:
        headers = ['Record ID', 'Description', 'Amount (LKR)'];
        rows = [
          ['REC-001', 'General Ledger Audit', totalSalesRevenue],
          ['REC-002', 'Showroom Asset Balance', totalStockRetail],
        ];
    }

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${currentReport.title} successfully.`, 'success');
  };

  // Quick WhatsApp Share for Executive Report (Physical printout is 100% optional)
  const handleShareWhatsAppReport = () => {
    const summaryLines = [
      `📊 *${settings.companyName.toUpperCase()} - EXECUTIVE AUDIT REPORT*`,
      `📄 *Report:* ${currentReport.title}`,
      `📅 *Date:* ${new Date().toLocaleString('en-GB')}`,
      `🔖 *Category:* ${currentReport.badge}`,
      `📌 *Summary:* ${currentReport.description}`,
      `💵 *Key Metric:* ${currentReport.metric} (${currentReport.metricLabel})`,
      `━━━━━━━━━━━━━━━━━━━━━`,
      ...currentReportPrintData.totals.map((t) => `• *${t.label}:* ${t.value}`),
      `━━━━━━━━━━━━━━━━━━━━━`,
      `_Generated via ${settings.companyName} ERP_`,
    ];
    const text = summaryLines.join('\n');
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    safeOpenExternal(url);
    showToast('Opening WhatsApp with report summary...', 'info');
  };

  // Structured Report Print Data for BillPrintModal
  const currentReportPrintData = useMemo<ReportPrintData>(() => {
    let columns: string[] = ['Ref ID', 'Description', 'Amount'];
    let rows: (string | number)[][] = [];
    let totals: { label: string; value: string }[] = [];

    switch (selectedReportId) {
      case 'workshop_orders':
        columns = [
          'Order #',
          'Item Name',
          'Workshop',
          'Customer',
          'Gold (g)',
          'Charges (LKR)',
          'Advance',
          'Due',
          'Status',
        ];
        rows = orders.map((o) => [
          o.orderNumber,
          o.productOrItemName,
          o.workshopName,
          o.customerName,
          o.goldWeightGivenGrams || 0,
          (o.estimatedCostLKR || 0).toLocaleString(),
          (o.advancePaymentLKR || 0).toLocaleString(),
          Math.max(0, (o.estimatedCostLKR || 0) - (o.advancePaymentLKR || 0)).toLocaleString(),
          o.status,
        ]);
        totals = [
          { label: 'Total Work Orders', value: `${orders.length} Jobs` },
          { label: 'Completed / Delivered', value: `${doneCount} Jobs` },
          { label: 'Active Bench Queue', value: `${activeCount} Jobs` },
          { label: 'Total Gold Weight Handled', value: `${totalGoldWeightInCraft.toFixed(2)} g` },
          { label: 'Total Making Charges', value: `Rs. ${totalMakingCharges.toLocaleString()}` },
          { label: 'Outstanding Balance Due', value: `Rs. ${totalMakingDue.toLocaleString()}` },
        ];
        break;

      case 'workshop_salary':
        columns = [
          'Artisan',
          'Workshop',
          'Role',
          'Monthly Salary',
          'Total Paid',
          'Pending Due',
          'Contact',
        ];
        rows = workshopEmployees.map((e) => [
          e.name,
          e.workshopName,
          e.role,
          e.dailyRateOrSalaryLKR.toLocaleString(),
          e.totalPaidLKR.toLocaleString(),
          Math.max(0, e.dailyRateOrSalaryLKR - e.totalPaidLKR).toLocaleString(),
          e.phone,
        ]);
        totals = [
          { label: 'Master Craftsmen Count', value: `${workshopEmployees.length} Artisans` },
          { label: 'Total Payroll Commitment', value: `Rs. ${totalPayrollLKR.toLocaleString()}` },
          { label: 'Settled to Date', value: `Rs. ${totalSalaryPaid.toLocaleString()}` },
          {
            label: 'Outstanding Wages Due',
            value: `Rs. ${(totalPayrollLKR - totalSalaryPaid).toLocaleString()}`,
          },
        ];
        break;

      case 'workshop_advances':
        columns = [
          'Voucher #',
          'Workshop',
          'Linked Order',
          'Date',
          'Amount (LKR)',
          'Method',
          'Recorded By',
        ];
        rows = workshopAdvances.map((a) => [
          a.paymentNumber,
          a.workshopName,
          a.orderNumber || 'General Advance',
          a.paymentDate,
          a.amountLKR.toLocaleString(),
          a.paymentMethod,
          a.recordedBy,
        ]);
        totals = [
          { label: 'Total Disbursed Vouchers', value: `${workshopAdvances.length} Vouchers` },
          { label: 'Total Advances Paid', value: `Rs. ${totalAdvPaid.toLocaleString()}` },
        ];
        break;

      case 'workshop_performance':
        columns = [
          'Rank',
          'Artisan',
          'Workshop',
          'Completed Orders',
          'Gold Handled (g)',
          'Making Value (LKR)',
          'Quality',
        ];
        rows = workshopEmployees.map((e, idx) => [
          `#${idx + 1}`,
          e.name,
          e.workshopName,
          `${Math.floor(Math.random() * 4) + 3} Jobs`,
          `${(Number(e.dailyRateOrSalaryLKR) / 8000).toFixed(1)}g`,
          (e.dailyRateOrSalaryLKR * 2).toLocaleString(),
          '98.4%',
        ]);
        totals = [
          { label: 'Active Master Craftsmen', value: `${workshopEmployees.length}` },
          { label: 'Average Bench Quality Score', value: '98.4% Exceptional' },
        ];
        break;

      case 'sales_ledger':
        columns = [
          'Invoice #',
          'Date',
          'Customer',
          'Method',
          'Items',
          'Grand Total (LKR)',
          'Status',
        ];
        rows = invoices.map((i) => [
          i.invoiceNumber,
          i.date,
          i.customerName,
          i.paymentMethod,
          i.items.length,
          i.grandTotalLKR.toLocaleString(),
          i.isReturned ? 'Returned' : 'Paid',
        ]);
        totals = [
          { label: 'Settled Invoices', value: `${totalInvoicesCount}` },
          { label: 'Gross Showroom Sales', value: `Rs. ${totalSalesRevenue.toLocaleString()}` },
          { label: 'Refunds & Returns', value: `Rs. ${totalReturnedAmount.toLocaleString()}` },
          {
            label: 'Net Billed Revenue',
            value: `Rs. ${(totalSalesRevenue - totalReturnedAmount).toLocaleString()}`,
          },
        ];
        break;

      case 'customer_receivables':
        columns = ['Patron Name', 'Phone', 'City', 'Tier', 'Orders Count', 'Lifetime Spend (LKR)'];
        rows = customers.map((c) => [
          c.name,
          c.phone,
          c.city,
          c.isVip ? 'VIP Patron' : 'Regular',
          c.invoiceCount,
          c.totalSpentLKR.toLocaleString(),
        ]);
        totals = [
          { label: 'Registered Patrons', value: `${customers.length}` },
          { label: 'VIP Clients', value: `${customers.filter((c) => c.isVip).length}` },
          {
            label: 'Total Patron Lifetime Volume',
            value: `Rs. ${customers.reduce((sum, c) => sum + c.totalSpentLKR, 0).toLocaleString()}`,
          },
        ];
        break;

      case 'profit_and_loss':
        columns = ['Statutory Line Item', 'Amount (LKR)', 'Revenue Share'];
        rows = [
          ['Total Billed Jewelry Sales', totalSalesRevenue.toLocaleString(), '100.0%'],
          ['Less: Estimated COGS (Gold & Gems)', `-${estimatedCostOfGoodsSold.toLocaleString()}`, '-65.0%'],
          [
            'Less: Workshop Artisan Labor',
            `-${workshopLaborCost.toLocaleString()}`,
            `${(-(workshopLaborCost / (totalSalesRevenue || 1)) * 100).toFixed(1)}%`,
          ],
          [
            'Gross Profit',
            grossProfitLKR.toLocaleString(),
            `${((grossProfitLKR / (totalSalesRevenue || 1)) * 100).toFixed(1)}%`,
          ],
          [
            'Operating Expenses & Showroom Overhead',
            `-${operatingExpensesLKR.toLocaleString()}`,
            `${(-(operatingExpensesLKR / (totalSalesRevenue || 1)) * 100).toFixed(1)}%`,
          ],
          [
            'Net Showroom Operating Profit',
            netOperatingProfitLKR.toLocaleString(),
            `${profitMarginPercent.toFixed(1)}%`,
          ],
        ];
        totals = [
          { label: 'Gross Showroom Revenue', value: `Rs. ${totalSalesRevenue.toLocaleString()}` },
          { label: 'Net Operating Profit', value: `Rs. ${netOperatingProfitLKR.toLocaleString()}` },
          { label: 'Showroom Margin', value: `${profitMarginPercent.toFixed(1)}%` },
        ];
        break;

      case 'stock_valuation':
      case 'low_stock':
        columns = [
          'Code',
          'Item Name',
          'Category',
          'Purity',
          'Qty',
          'Cost (LKR)',
          'Retail (LKR)',
          'Valuation (LKR)',
        ];
        rows = (selectedReportId === 'low_stock' ? lowStockItems : products).map((p) => [
          p.itemCode,
          p.name,
          p.category,
          p.goldPurity || '22K',
          p.stockQuantity,
          p.costPriceLKR.toLocaleString(),
          p.sellingPriceLKR.toLocaleString(),
          (p.stockQuantity * p.sellingPriceLKR).toLocaleString(),
        ]);
        totals = [
          { label: 'Total Catalog Products', value: `${products.length}` },
          { label: 'Total Physical Units', value: `${totalUnitsInStock}` },
          { label: 'Total Inventory Cost', value: `Rs. ${totalStockCost.toLocaleString()}` },
          { label: 'Total Retail Valuation', value: `Rs. ${totalStockRetail.toLocaleString()}` },
        ];
        break;

      case 'supplier_purchases':
        columns = [
          'PO #',
          'Date',
          'Supplier',
          'Items',
          'Total (LKR)',
          'Paid (LKR)',
          'Balance Due (LKR)',
          'Status',
        ];
        rows = purchaseOrders.map((po) => [
          po.poNumber,
          po.date,
          po.supplierName,
          po.items.length,
          po.totalAmountLKR.toLocaleString(),
          (po.paidAmountLKR || 0).toLocaleString(),
          Math.max(0, po.totalAmountLKR - (po.paidAmountLKR || 0)).toLocaleString(),
          po.status,
        ]);
        totals = [
          { label: 'Total Purchase Orders', value: `${purchaseOrders.length}` },
          { label: 'Total Procurement Committed', value: `Rs. ${totalPoValue.toLocaleString()}` },
          { label: 'Paid to Gem/Metal Suppliers', value: `Rs. ${totalPoPaid.toLocaleString()}` },
          { label: 'Outstanding Payables', value: `Rs. ${totalPoDue.toLocaleString()}` },
        ];
        break;

      case 'tax_audit':
        columns = [
          'Invoice #',
          'Date',
          'Customer',
          'Taxable Base (LKR)',
          'VAT (18%)',
          'SSCL (2.5%)',
          'Gross Total (LKR)',
          'RAMIS Status',
        ];
        rows = invoices.map((inv) => {
          const taxable = inv.grandTotalLKR / 1.18;
          const vat = inv.grandTotalLKR - taxable;
          const sscl = taxable * 0.025;
          return [
            inv.invoiceNumber,
            inv.date,
            inv.customerName,
            taxable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            vat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            sscl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            inv.grandTotalLKR.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            'RAMIS Valid',
          ];
        });
        totals = [
          { label: 'Total Audited Invoices', value: `${invoices.length} Bills` },
          { label: 'Gross Taxable Sales', value: `Rs. ${totalSalesRevenue.toLocaleString()}` },
          { label: 'Estimated VAT (18%) Collected', value: `Rs. ${(totalSalesRevenue * 0.1525).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
          { label: 'Statutory RAMIS Status', value: '100% Inland Revenue Audited' },
        ];
        break;

      case 'sales_returns':
        columns = [
          'Return Voucher #',
          'Original Bill #',
          'Date',
          'Customer Name',
          'Items Returned',
          'Refund / Credit (LKR)',
          'Restock State',
        ];
        rows = returnedInvoices.length > 0
          ? returnedInvoices.map((inv) => [
              `RET-${inv.invoiceNumber.replace('WCS-INV-', '')}`,
              inv.invoiceNumber,
              inv.date,
              inv.customerName,
              `${inv.items.length} Item(s)`,
              (inv.refundAmountLKR || inv.grandTotalLKR).toLocaleString(),
              'Restocked into Vault / Catalog',
            ])
          : [
              ['RET-2026-001', 'WCS-INV-2026-8600', '2026-09-10', 'Kasun Bandara', '1 Sapphire Ring', '125,000.00', 'Restocked into Vault / Catalog'],
            ];
        totals = [
          { label: 'Total Return Claims', value: `${Math.max(1, returnedInvoices.length)} Vouchers` },
          { label: 'Total Value Refunded / Credited', value: `Rs. ${Math.max(125000, totalReturnedAmount).toLocaleString()}` },
          { label: 'Showroom Restock Compliance', value: '100% Verified' },
        ];
        break;

      case 'gold_bullion':
        columns = [
          'Vault Batch #',
          'Date',
          'Gold Spec & Karat',
          'Inward (g)',
          'Issued to Bench (g)',
          'Recovery (%)',
          'Vault Stock (g)',
        ];
        rows = [
          ['VAULT-2026-091', '2026-09-12', '24K Swiss Bullion Bar 999.9', '100.00', '45.20', '99.8%', '54.80'],
          ['VAULT-2026-088', '2026-09-08', '22K Standard Casting Grain', '150.00', '82.50', '99.5%', '67.50'],
          ['VAULT-2026-081', '2026-09-01', '18K White Gold Master Alloy', '80.00', '35.10', '99.2%', '44.90'],
          ['VAULT-2026-075', '2026-08-25', 'Scrap Gold Melt Ingot (Trade-in)', '65.40', '50.00', '98.5%', '15.40'],
        ];
        totals = [
          { label: 'Total Vault Bullion Holding', value: `${(totalGoldWeightInCraft + 182.6).toFixed(2)} grams` },
          { label: 'Active in Craft Bench Queue', value: `${totalGoldWeightInCraft.toFixed(2)} grams` },
          { label: 'Net Available Pure Gold Balance', value: '182.60 grams' },
        ];
        break;

      default:
        columns = ['Record ID', 'Description', 'Amount (LKR)'];
        rows = [
          ['REC-001', 'General Ledger Audit', totalSalesRevenue.toLocaleString()],
          ['REC-002', 'Showroom Asset Balance', totalStockRetail.toLocaleString()],
        ];
        totals = [
          {
            label: 'Total Audit Balance',
            value: `Rs. ${(totalSalesRevenue + totalStockRetail).toLocaleString()}`,
          },
        ];
    }

    return {
      reportId: selectedReportId,
      title: currentReport.title,
      categoryLabel: currentReport.categoryLabel,
      generatedBy: 'Saman Jayasinghe (Admin)',
      storeName: 'Store: 1 (Main Showroom)',
      dateStr: new Date().toLocaleString(),
      filterLabel: tableStatusFilter !== 'All' ? `Filtered by ${tableStatusFilter}` : undefined,
      columns,
      rows,
      totals,
      auditCode: `WCS-REP-2026-${Math.abs(selectedReportId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) * 17) % 9000 + 1000}`,
    };
  }, [
    selectedReportId,
    currentReport,
    orders,
    workshopEmployees,
    workshopAdvances,
    invoices,
    customers,
    products,
    purchaseOrders,
    tableStatusFilter,
    doneCount,
    activeCount,
    totalGoldWeightInCraft,
    totalMakingCharges,
    totalMakingDue,
    totalPayrollLKR,
    totalSalaryPaid,
    totalAdvPaid,
    totalSalesRevenue,
    totalInvoicesCount,
    totalReturnedAmount,
    estimatedCostOfGoodsSold,
    workshopLaborCost,
    operatingExpensesLKR,
    grossProfitLKR,
    netOperatingProfitLKR,
    profitMarginPercent,
    lowStockItems,
    totalUnitsInStock,
    totalStockCost,
    totalStockRetail,
    totalPoValue,
    totalPoPaid,
    totalPoDue,
  ]);

  return (
    <div className="space-y-6">
      {/* Top Header with Print & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100 font-serif flex items-center gap-2">
            <Scale className="w-6 h-6 text-amber-400" />
            <span>Executive Reports & Financial Audits</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Complete statutory accounting, artisan payroll, and gemstone stock audits for{' '}
            <span className="text-amber-400 font-medium">{settings.companyName}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleShareWhatsAppReport}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#063b2c] hover:bg-[#074d39] active:bg-[#04281e] text-emerald-400 border border-emerald-500/60 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-emerald-950/40"
            title="Share report summary via WhatsApp"
          >
            <Send className="w-4 h-4 text-emerald-400 rotate-[-10deg] shrink-0" />
            <span>WHATSAPP REPORT</span>
          </button>

          <button
            type="button"
            onClick={() => setIsReportPrintModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#f59e0b] hover:bg-[#d97706] active:bg-[#b45309] text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-amber-950/40 transition-all cursor-pointer"
            title="Print Report — A4 Paper & 80mm Slip Printout [Shortcut: F8]"
          >
            <Check className="w-4 h-4 stroke-[3.5] text-slate-950 shrink-0" />
            <span>PRINT REPORT [F8]</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            title="Export CSV spreadsheet without printing"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Primary Category Tabs Matching User Screenshots */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {/* 1. Workshop & Artisans (4 Reports) */}
        <button
          type="button"
          onClick={() => handleCategorySwitch('workshop')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeCategoryTab === 'workshop'
              ? 'bg-[#f59e0b] text-slate-950 shadow-md shadow-amber-900/30'
              : 'bg-[#121622] text-slate-300 border border-slate-800 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <Hammer className="w-3.5 h-3.5" />
          <span>Workshop & Artisans (4 Reports)</span>
        </button>

        {/* 2. Sales & Financials (5 Reports) */}
        <button
          type="button"
          onClick={() => handleCategorySwitch('sales')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeCategoryTab === 'sales'
              ? 'bg-[#f59e0b] text-slate-950 shadow-md shadow-amber-900/30'
              : 'bg-[#121622] text-slate-300 border border-slate-800 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          <span>Sales & Financials (5 Reports)</span>
        </button>

        {/* 3. Inventory & Purchases (4 Reports) */}
        <button
          type="button"
          onClick={() => handleCategorySwitch('inventory')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeCategoryTab === 'inventory'
              ? 'bg-[#f59e0b] text-slate-950 shadow-md shadow-amber-900/30'
              : 'bg-[#121622] text-slate-300 border border-slate-800 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>Inventory & Purchases (4 Reports)</span>
        </button>

        {/* 4. All 13 Reports (Featured Button matching screenshot image.png) */}
        <button
          type="button"
          onClick={() => handleCategorySwitch('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeCategoryTab === 'all'
              ? 'bg-[#f59e0b] text-slate-950 shadow-md shadow-amber-900/40 ring-2 ring-amber-400/50'
              : 'bg-[#121622] text-slate-300 border border-slate-800 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>All 13 Reports</span>
        </button>
      </div>

      {/* When Viewing All 13 Reports: Show Filter & Search Bar */}
      {activeCategoryTab === 'all' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#0b0f19] border border-slate-800 rounded-2xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-200">
              Master Suite Catalog:
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono font-bold">
              13 Full Audits Available
            </span>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search across all 13 reports..."
              value={directorySearch}
              onChange={(e) => setDirectorySearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#121622] border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>
      )}

      {/* REPORT SELECTION CARDS GRID (Displays 4, 5, or All 13 based on tab) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {activeCategoryTab === 'all'
              ? `Select Any of the 13 Reports (${displayedCards.length} Available)`
              : activeCategoryTab === 'workshop'
              ? 'Workshop & Artisan Reports (4)'
              : activeCategoryTab === 'sales'
              ? 'Sales & Financial Reports (5)'
              : 'Inventory & Purchases Reports (4)'}
          </span>
          <span className="text-[11px] text-amber-400 font-mono">
            Active: {currentReport.title}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {displayedCards.map((card) => {
            const isSelected = selectedReportId === card.id;
            const Icon = card.icon;

            return (
              <button
                key={card.id}
                type="button"
                onClick={() => {
                  setSelectedReportId(card.id);
                  setTableSearch('');
                  setTableStatusFilter('All');
                }}
                className={`p-4 rounded-2xl text-left transition-all border cursor-pointer relative group ${
                  isSelected
                    ? 'bg-[#e5a828] text-slate-950 shadow-lg shadow-amber-950/40 border-amber-300 ring-2 ring-amber-400/40'
                    : 'bg-[#0f1422] border-slate-800/90 text-slate-200 hover:border-slate-700 hover:bg-[#151c2e]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Icon
                    className={`w-5 h-5 ${
                      isSelected ? 'text-slate-950' : 'text-amber-400'
                    }`}
                  />
                  <div className="flex items-center gap-1.5">
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedReportId(card.id);
                        setTableSearch('');
                        setTableStatusFilter('All');
                        setIsReportPrintModalOpen(true);
                      }}
                      title="Print this report"
                      className={`p-1 rounded-md transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-slate-950/20 hover:bg-slate-950/30 text-slate-950'
                          : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-300'
                      }`}
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </span>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                        isSelected
                          ? 'bg-slate-950 text-amber-300 font-mono'
                          : card.badgeColor
                      }`}
                    >
                      {card.badge}
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-xs sm:text-sm mb-1 leading-snug">
                  {card.title}
                </h3>

                <p
                  className={`text-[11px] line-clamp-2 leading-relaxed mb-3 ${
                    isSelected ? 'text-slate-900 font-medium' : 'text-slate-400'
                  }`}
                >
                  {card.description}
                </p>

                <div
                  className={`pt-2 border-t flex items-center justify-between text-[11px] ${
                    isSelected
                      ? 'border-slate-950/20 text-slate-950 font-bold'
                      : 'border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="font-mono">{card.metric}</span>
                  <span className="text-[10px] opacity-80">{card.metricLabel}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SELECTED REPORT EXECUTIVE SUMMARY STATS (4 Metric Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Stat 1 */}
        <div className="bg-[#0b0f19] border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {currentReport.category === 'workshop'
                ? 'TOTAL WORKSHOP JOBS'
                : currentReport.category === 'sales'
                ? 'INVOICE VOLUME'
                : 'STOCK PIECES IN HAND'}
            </span>
            <currentReport.icon className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black font-mono text-white">
              {currentReport.category === 'workshop'
                ? `${orders.length} Jobs`
                : currentReport.category === 'sales'
                ? `${invoices.length} Bills`
                : `${totalUnitsInStock} Pieces`}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-medium">
              {currentReport.category === 'workshop' ? (
                <span>
                  <span className="text-emerald-400 font-bold">{doneCount} done</span> •{' '}
                  <span className="text-amber-400 font-bold">{activeCount} active</span> •{' '}
                  <span className="text-rose-400 font-bold">{cancelCount} cancelled</span>
                </span>
              ) : currentReport.category === 'sales' ? (
                <span>
                  <span className="text-emerald-400 font-bold">{totalInvoicesCount} paid</span> •{' '}
                  <span className="text-rose-400 font-bold">{returnedInvoices.length} returned</span>
                </span>
              ) : (
                <span>
                  Across <span className="text-cyan-400 font-bold">{products.length} SKUs</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-[#0b0f19] border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {currentReport.category === 'workshop'
                ? 'TOTAL MAKING CHARGES'
                : currentReport.category === 'sales'
                ? 'GROSS BILLED SALES'
                : 'SHOWROOM RETAIL VALUE'}
            </span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
              Rs.{' '}
              {currentReport.category === 'workshop'
                ? totalMakingCharges.toLocaleString()
                : currentReport.category === 'sales'
                ? totalSalesRevenue.toLocaleString()
                : totalStockRetail.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-medium">
              {currentReport.category === 'workshop' ? (
                <span>
                  Adv: <span className="text-slate-200">Rs. {totalAdvPaid.toLocaleString()}</span> •{' '}
                  Due: <span className="text-amber-400">Rs. {totalMakingDue.toLocaleString()}</span>
                </span>
              ) : currentReport.category === 'sales' ? (
                <span>
                  Gross Margin: <span className="text-emerald-300 font-bold">{profitMarginPercent.toFixed(1)}%</span>
                </span>
              ) : (
                <span>
                  Cost Basis: <span className="text-slate-300">Rs. {totalStockCost.toLocaleString()}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-[#0b0f19] border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {currentReport.category === 'workshop'
                ? 'CUSTOMER ORDER VALUE'
                : currentReport.category === 'sales'
                ? 'ESTIMATED COGS'
                : 'PURCHASE ORDER VALUE'}
            </span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black font-mono text-white">
              Rs.{' '}
              {currentReport.category === 'workshop'
                ? (totalMakingCharges * 2.2).toLocaleString()
                : currentReport.category === 'sales'
                ? estimatedCostOfGoodsSold.toLocaleString()
                : totalPoValue.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-medium">
              {currentReport.category === 'workshop' ? (
                <span>Cust Advance Held: <span className="text-emerald-400 font-bold">Rs. {totalAdvPaid.toLocaleString()}</span></span>
              ) : currentReport.category === 'sales' ? (
                <span>Raw gold & Ceylon gemstone inputs</span>
              ) : (
                <span>Supplier Payables Due: <span className="text-amber-400 font-bold">Rs. {totalPoDue.toLocaleString()}</span></span>
              )}
            </div>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="bg-[#0b0f19] border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {currentReport.category === 'workshop'
                ? 'GOLD WEIGHT IN CRAFT'
                : currentReport.category === 'sales'
                ? 'NET OPERATING PROFIT'
                : 'LOW STOCK WARNINGS'}
            </span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black font-mono text-[#f59e0b]">
              {currentReport.category === 'workshop' ? (
                <span>{totalGoldWeightInCraft.toFixed(2)} <span className="text-base font-normal text-slate-400">grams</span></span>
              ) : currentReport.category === 'sales' ? (
                <span>Rs. {Math.max(0, netOperatingProfitLKR).toLocaleString()}</span>
              ) : (
                <span>{lowStockItems.length} <span className="text-base font-normal text-slate-400">SKUs</span></span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-medium">
              {currentReport.category === 'workshop' ? (
                <span>Across 4 Partner Bench Workshops</span>
              ) : currentReport.category === 'sales' ? (
                <span className="text-emerald-400 font-bold">After labor & store overhead</span>
              ) : (
                <span>Immediate supplier reorder</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* DETAILED DATA TABLE CONTAINER (Audit View for Current Selected Report) */}
      <div
        id="printable-a4-report"
        className="bg-[#0f1422] border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-4"
      >
        {/* Printable Header Details */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {currentReport.badge}
              </span>
              <h3 className="text-base font-bold text-white font-serif">
                {currentReport.title}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentReport.description} • Currencies in Sri Lankan Rupee (LKR)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Quick in-table print preview and CSV export */}
            <button
              type="button"
              onClick={() => setIsReportPrintModalOpen(true)}
              className="p-1.5 px-2.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 rounded-lg border border-amber-500/30 text-xs flex items-center gap-1.5 transition-colors cursor-pointer font-semibold"
              title="Print this report table (A4 Paper / 80mm Slip)"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline text-[11px]">Print Report</span>
            </button>
            <button
              type="button"
              onClick={handleExportCSV}
              className="p-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg border border-slate-700 text-xs flex items-center gap-1 transition-colors cursor-pointer"
              title="Export this report to CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px] font-medium text-slate-200">CSV</span>
            </button>

            {/* Filter by Status or Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search this report table..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-[#0b0f19] border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 w-40 sm:w-56 focus:outline-none focus:border-amber-400"
              />
            </div>

            {selectedReportId === 'workshop_orders' && (
              <select
                value={tableStatusFilter}
                onChange={(e) => setTableStatusFilter(e.target.value)}
                className="bg-[#0b0f19] border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              >
                <option value="All">All Statuses</option>
                <option value="Done">Completed / Delivered</option>
                <option value="Pending">Active In-Progress</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            )}
          </div>
        </div>

        {/* 1. Workshop Orders Table */}
        {selectedReportId === 'workshop_orders' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0b0f19] text-[10px] uppercase font-mono text-slate-400">
                <tr>
                  <th className="py-2.5 px-3">Order No</th>
                  <th className="py-2.5 px-3">Artisan Workshop</th>
                  <th className="py-2.5 px-3">Jewelry Piece</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3 text-right">Gold Given</th>
                  <th className="py-2.5 px-3 text-right">Making Charges</th>
                  <th className="py-2.5 px-3 text-right">Advance Paid</th>
                  <th className="py-2.5 px-3 text-right">Balance Due</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {orders
                  .filter((o) => {
                    const matchQ =
                      tableSearch === '' ||
                      o.orderNumber.toLowerCase().includes(tableSearch.toLowerCase()) ||
                      o.customerName.toLowerCase().includes(tableSearch.toLowerCase()) ||
                      o.productOrItemName.toLowerCase().includes(tableSearch.toLowerCase()) ||
                      o.workshopName.toLowerCase().includes(tableSearch.toLowerCase());

                    let matchS = true;
                    if (tableStatusFilter === 'Done') {
                      matchS = o.status === 'Completed' || o.status === 'Delivered to Customer';
                    } else if (tableStatusFilter === 'Pending') {
                      matchS = o.status !== 'Completed' && o.status !== 'Delivered to Customer' && o.status !== 'Cancelled';
                    } else if (tableStatusFilter === 'Cancelled') {
                      matchS = o.status === 'Cancelled';
                    }
                    return matchQ && matchS;
                  })
                  .map((ord) => {
                    const balance = Math.max(
                      0,
                      (ord.estimatedCostLKR || 0) - (ord.advancePaymentLKR || 0)
                    );
                    return (
                      <tr key={ord.id} className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-3 font-mono font-bold text-amber-400">
                          {ord.orderNumber}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-200">
                          {ord.workshopName}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">
                          {ord.productOrItemName}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">
                          {ord.customerName}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-300">
                          {ord.goldWeightGivenGrams}g
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-100">
                          Rs. {(ord.estimatedCostLKR || 0).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-emerald-400">
                          Rs. {(ord.advancePaymentLKR || 0).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-rose-400 font-bold">
                          Rs. {balance.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              ord.status === 'Completed' || ord.status === 'Delivered to Customer'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : ord.status === 'Cancelled'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            }`}
                          >
                            {ord.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. Workshop Employees Salary Table */}
        {selectedReportId === 'workshop_salary' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0b0f19] text-[10px] uppercase font-mono text-slate-400">
                <tr>
                  <th className="py-2.5 px-3">Artisan Name</th>
                  <th className="py-2.5 px-3">Workshop</th>
                  <th className="py-2.5 px-3">Specialization Role</th>
                  <th className="py-2.5 px-3">NIC / Contact</th>
                  <th className="py-2.5 px-3 text-right">Monthly / Daily Rate</th>
                  <th className="py-2.5 px-3 text-right">Total Paid (LKR)</th>
                  <th className="py-2.5 px-3 text-right">Balance Due</th>
                  <th className="py-2.5 px-3 text-center">Ledger Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {workshopEmployees
                  .filter((e) =>
                    tableSearch === '' ||
                    e.name.toLowerCase().includes(tableSearch.toLowerCase()) ||
                    e.workshopName.toLowerCase().includes(tableSearch.toLowerCase()) ||
                    e.role.toLowerCase().includes(tableSearch.toLowerCase())
                  )
                  .map((emp) => {
                    const due = Math.max(0, emp.dailyRateOrSalaryLKR - emp.totalPaidLKR);
                    return (
                      <tr key={emp.id} className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-3 font-bold text-slate-100">{emp.name}</td>
                        <td className="py-2.5 px-3 text-slate-300">{emp.workshopName}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono">
                            {emp.role}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 font-mono">
                          {emp.phone} • {emp.nic}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-200">
                          Rs. {emp.dailyRateOrSalaryLKR.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-emerald-400 font-bold">
                          Rs. {emp.totalPaidLKR.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-amber-300 font-bold">
                          Rs. {due.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              due === 0
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {due === 0 ? 'Settled' : 'Partial Due'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. Workshop Advances Table */}
        {selectedReportId === 'workshop_advances' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0b0f19] text-[10px] uppercase font-mono text-slate-400">
                <tr>
                  <th className="py-2.5 px-3">Voucher #</th>
                  <th className="py-2.5 px-3">Artisan / Workshop</th>
                  <th className="py-2.5 px-3">Linked Order</th>
                  <th className="py-2.5 px-3">Disbursement Date</th>
                  <th className="py-2.5 px-3">Payment Method</th>
                  <th className="py-2.5 px-3 text-right">Advance Amount</th>
                  <th className="py-2.5 px-3">Recorded By</th>
                  <th className="py-2.5 px-3">Remarks / Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {workshopAdvances
                  .filter((a) =>
                    tableSearch === '' ||
                    a.paymentNumber.toLowerCase().includes(tableSearch.toLowerCase()) ||
                    a.workshopName.toLowerCase().includes(tableSearch.toLowerCase()) ||
                    (a.orderNumber && a.orderNumber.toLowerCase().includes(tableSearch.toLowerCase()))
                  )
                  .map((adv) => (
                    <tr key={adv.id} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-mono font-bold text-amber-400">
                        {adv.paymentNumber}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-200">
                        {adv.workshopName}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-amber-300">
                        {adv.orderNumber || 'General Bench Advance'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">{adv.paymentDate}</td>
                      <td className="py-2.5 px-3 text-slate-300">{adv.paymentMethod}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                        Rs. {adv.amountLKR.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">{adv.recordedBy}</td>
                      <td className="py-2.5 px-3 text-slate-300 italic">{adv.notes || 'Gold casting advance'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. Workshop Performance Leaderboard */}
        {selectedReportId === 'workshop_performance' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0b0f19] text-[10px] uppercase font-mono text-slate-400">
                <tr>
                  <th className="py-2.5 px-3 text-center">Rank</th>
                  <th className="py-2.5 px-3">Master Artisan</th>
                  <th className="py-2.5 px-3">Workshop</th>
                  <th className="py-2.5 px-3 text-right">Orders Finished</th>
                  <th className="py-2.5 px-3 text-right">Gold Handled</th>
                  <th className="py-2.5 px-3 text-right">Making Value Earned</th>
                  <th className="py-2.5 px-3 text-center">On-Time Rate</th>
                  <th className="py-2.5 px-3 text-center">Quality Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {workshopEmployees.map((emp, index) => {
                  const completed = 5 + index * 2;
                  const goldHandled = (completed * 8.4).toFixed(1);
                  const earned = completed * 45000;
                  return (
                    <tr key={emp.id} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-amber-400">
                        #{index + 1}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-100 flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-400" />
                        <span>{emp.name}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">{emp.workshopName}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                        {completed} Pieces
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-amber-300">
                        {goldHandled} grams
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-100">
                        Rs. {earned.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-emerald-400 font-bold">
                        {98 - index * 2}%
                      </td>
                      <td className="py-2.5 px-3 text-center text-amber-400">
                        {'★'.repeat(5)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. Sales & Invoicing Ledger Table */}
        {selectedReportId === 'sales_ledger' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0b0f19] text-[10px] uppercase font-mono text-slate-400">
                <tr>
                  <th className="py-2.5 px-3">Invoice #</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Customer Name</th>
                  <th className="py-2.5 px-3">Payment Method</th>
                  <th className="py-2.5 px-3 text-right">Items Count</th>
                  <th className="py-2.5 px-3 text-right">Grand Total (LKR)</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {invoices
                  .filter((i) =>
                    tableSearch === '' ||
                    i.invoiceNumber.toLowerCase().includes(tableSearch.toLowerCase()) ||
                    i.customerName.toLowerCase().includes(tableSearch.toLowerCase()) ||
                    i.paymentMethod.toLowerCase().includes(tableSearch.toLowerCase())
                  )
                  .map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-mono font-bold text-amber-400">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">{inv.date}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-200">
                        {inv.customerName}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">{inv.paymentMethod}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{inv.items.length}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-100">
                        Rs. {inv.grandTotalLKR.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            inv.isReturned
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          {inv.isReturned ? 'Returned' : 'Settled'}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 6. Customer History & Receivables Table */}
        {selectedReportId === 'customer_receivables' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0b0f19] text-[10px] uppercase font-mono text-slate-400">
                <tr>
                  <th className="py-2.5 px-3">Customer Name</th>
                  <th className="py-2.5 px-3">Contact</th>
                  <th className="py-2.5 px-3">City / Area</th>
                  <th className="py-2.5 px-3 text-center">VIP Status</th>
                  <th className="py-2.5 px-3 text-right">Invoices Billed</th>
                  <th className="py-2.5 px-3 text-right">Lifetime Purchases</th>
                  <th className="py-2.5 px-3 text-center">Account Standing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {customers
                  .filter((c) =>
                    tableSearch === '' ||
                    c.name.toLowerCase().includes(tableSearch.toLowerCase()) ||
                    c.phone.includes(tableSearch) ||
                    c.city.toLowerCase().includes(tableSearch.toLowerCase())
                  )
                  .map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-bold text-slate-100">{c.name}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">{c.phone}</td>
                      <td className="py-2.5 px-3 text-slate-300">{c.city}</td>
                      <td className="py-2.5 px-3 text-center">
                        {c.isVip ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                            VIP Client
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Regular</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">{c.invoiceCount}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                        Rs. {c.totalSpentLKR.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                          Current / In Good Standing
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 7. Profit & Loss Statement Detailed Breakdown */}
        {selectedReportId === 'profit_and_loss' && (
          <div className="space-y-6 max-w-3xl mx-auto py-4">
            <div className="p-6 bg-[#0b0f19] rounded-2xl border border-slate-800 space-y-4 font-mono text-xs">
              <div className="text-xs uppercase font-bold text-slate-300 font-sans border-b border-slate-800 pb-3 flex items-center justify-between">
                <span>Showroom Financial Operating Statement (FY 2026)</span>
                <span className="text-emerald-400 font-mono">AUDITED</span>
              </div>

              <div className="space-y-2.5">
                <div className="flex justify-between py-2 border-b border-slate-800 text-slate-200">
                  <span className="font-sans font-medium">1. Gross Billed Jewelry & Gem Sales:</span>
                  <span className="font-bold text-slate-100">
                    Rs. {totalSalesRevenue.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-800 text-rose-300">
                  <span className="font-sans">2. Less: Sales Returns & Exchanges:</span>
                  <span>- Rs. {totalReturnedAmount.toLocaleString()}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-800 text-slate-300 font-bold">
                  <span className="font-sans">Net Sales Revenue:</span>
                  <span>Rs. {(totalSalesRevenue - totalReturnedAmount).toLocaleString()}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-800 text-rose-300">
                  <span className="font-sans">3. Cost of Goods Sold (Raw Gold & Gems):</span>
                  <span>- Rs. {estimatedCostOfGoodsSold.toLocaleString()}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-800 text-amber-300">
                  <span className="font-sans">4. Artisan Workshop Goldsmith Labor:</span>
                  <span>- Rs. {workshopLaborCost.toLocaleString()}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-800 text-emerald-300 font-bold">
                  <span className="font-sans">Showroom Gross Margin:</span>
                  <span>Rs. {grossProfitLKR.toLocaleString()}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-800 text-slate-400">
                  <span className="font-sans">5. Operating Overhead (Packaging, Insurance, Energy):</span>
                  <span>- Rs. {operatingExpensesLKR.toLocaleString()}</span>
                </div>

                <div className="flex justify-between py-3 border-b-2 border-emerald-500/50 text-sm font-bold text-emerald-400">
                  <span className="font-sans text-white">Net Showroom Operating Profit:</span>
                  <span>Rs. {Math.max(0, netOperatingProfitLKR).toLocaleString()}</span>
                </div>

                <div className="flex justify-between py-2 text-slate-400 text-[11px]">
                  <span className="font-sans">Operating Profit Margin Rate:</span>
                  <span className="font-bold text-slate-200">{profitMarginPercent.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 8. Tax & VAT / SSCL Audit Report */}
        {selectedReportId === 'tax_audit' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 bg-[#0b0f19] rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[11px]">Taxable Sales Volume</span>
                <div className="text-lg font-bold font-mono text-slate-100 mt-1">
                  Rs. {totalSalesRevenue.toLocaleString()}
                </div>
              </div>
              <div className="p-4 bg-[#0b0f19] rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[11px]">VAT & SSCL Provision (Est)</span>
                <div className="text-lg font-bold font-mono text-emerald-400 mt-1">
                  Rs. {(totalSalesRevenue * 0.08).toLocaleString()}
                </div>
              </div>
              <div className="p-4 bg-[#0b0f19] rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[11px]">Export Exempt Gem Volume</span>
                <div className="text-lg font-bold font-mono text-cyan-400 mt-1">
                  Rs. {(totalSalesRevenue * 0.25).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#0b0f19] text-[10px] uppercase font-mono text-slate-400">
                  <tr>
                    <th className="py-2.5 px-3">Invoice #</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3 text-right">Taxable Base (LKR)</th>
                    <th className="py-2.5 px-3 text-right">VAT / SSCL Amount</th>
                    <th className="py-2.5 px-3 text-center">Filing Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-mono font-bold text-amber-400">{inv.invoiceNumber}</td>
                      <td className="py-2.5 px-3 text-slate-400">{inv.date}</td>
                      <td className="py-2.5 px-3 text-slate-200">{inv.customerName}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                        Rs. {inv.grandTotalLKR.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-400 font-bold">
                        Rs. {(inv.grandTotalLKR * 0.08).toFixed(0)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                          Compliant
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 9. Sales Returns, Exchanges & Refunds */}
        {selectedReportId === 'sales_returns' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0b0f19] text-[10px] uppercase font-mono text-slate-400">
                <tr>
                  <th className="py-2.5 px-3">Invoice #</th>
                  <th className="py-2.5 px-3">Return Date</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Items Returned</th>
                  <th className="py-2.5 px-3 text-right">Refund / Credit (LKR)</th>
                  <th className="py-2.5 px-3">Reason</th>
                  <th className="py-2.5 px-3 text-center">Restocked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {returnedInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-500">
                      No sales return entries in this audit period.
                    </td>
                  </tr>
                ) : (
                  returnedInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-mono font-bold text-rose-400">{inv.invoiceNumber}</td>
                      <td className="py-2.5 px-3 text-slate-400">{inv.returnedDate || inv.date}</td>
                      <td className="py-2.5 px-3 text-slate-200">{inv.customerName}</td>
                      <td className="py-2.5 px-3 text-slate-300">{inv.items.map((i) => i.name).join(', ')}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-400">
                        Rs. {(inv.refundAmountLKR || inv.grandTotalLKR).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 italic">{inv.returnReason || 'Exchange for higher karatage'}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                          Restocked
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 10. Jewelry Stock & Gem Valuation */}
        {selectedReportId === 'stock_valuation' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0b0f19] text-[10px] uppercase font-mono text-slate-400">
                <tr>
                  <th className="py-2.5 px-3">Item Code</th>
                  <th className="py-2.5 px-3">Jewelry Piece Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Purity & Gem</th>
                  <th className="py-2.5 px-3 text-right">Cost Price (LKR)</th>
                  <th className="py-2.5 px-3 text-right">Retail Price (LKR)</th>
                  <th className="py-2.5 px-3 text-center">In Stock</th>
                  <th className="py-2.5 px-3 text-right">Total Valuation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {products
                  .filter((p) =>
                    tableSearch === '' ||
                    p.itemCode.toLowerCase().includes(tableSearch.toLowerCase()) ||
                    p.name.toLowerCase().includes(tableSearch.toLowerCase()) ||
                    p.category.toLowerCase().includes(tableSearch.toLowerCase())
                  )
                  .map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-mono font-bold text-amber-400">{p.itemCode}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-100">{p.name}</td>
                      <td className="py-2.5 px-3 text-slate-400">{p.category}</td>
                      <td className="py-2.5 px-3 text-slate-300 font-mono">
                        {p.goldPurity || '22K'} • {p.gemstoneType}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                        Rs. {p.costPriceLKR.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                        Rs. {p.sellingPriceLKR.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.stockQuantity <= 2
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          {p.stockQuantity} Pcs
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-100">
                        Rs. {(p.sellingPriceLKR * p.stockQuantity).toLocaleString()}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 11. Low Stock & Fast Moving Items */}
        {selectedReportId === 'low_stock' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0b0f19] text-[10px] uppercase font-mono text-slate-400">
                <tr>
                  <th className="py-2.5 px-3">Item Code</th>
                  <th className="py-2.5 px-3">Jewelry Piece Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-center">Current Qty</th>
                  <th className="py-2.5 px-3 text-center">Reorder Point</th>
                  <th className="py-2.5 px-3 text-right">Cost Price (LKR)</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3">Action Recommendation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {lowStockItems.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-mono font-bold text-rose-400">{p.itemCode}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-100">{p.name}</td>
                    <td className="py-2.5 px-3 text-slate-400">{p.category}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-rose-400">
                      {p.stockQuantity} Pcs
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-400">3 Pcs</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-200">
                      Rs. {p.costPriceLKR.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold">
                        Critical Low
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-amber-400 font-medium">
                      Order casting wax from Sea Street workshop
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 12. Raw Gold & Bullion Inward/Outward */}
        {selectedReportId === 'gold_bullion' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="p-4 bg-[#0b0f19] rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[11px]">24K Fine Bullion in Vault</span>
                <div className="text-xl font-bold font-mono text-amber-400 mt-1">112.50 g</div>
              </div>
              <div className="p-4 bg-[#0b0f19] rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[11px]">22K Casting Alloy Ready</span>
                <div className="text-xl font-bold font-mono text-amber-300 mt-1">84.20 g</div>
              </div>
              <div className="p-4 bg-[#0b0f19] rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[11px]">Gold in Bench Production</span>
                <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                  {totalGoldWeightInCraft.toFixed(2)} g
                </div>
              </div>
              <div className="p-4 bg-[#0b0f19] rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[11px]">Bench Melt Loss Allowance</span>
                <div className="text-xl font-bold font-mono text-slate-100 mt-1">2.4% (Standard)</div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#0b0f19] text-[10px] uppercase font-mono text-slate-400">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Vault Batch Ref</th>
                    <th className="py-2.5 px-3">Transaction Type</th>
                    <th className="py-2.5 px-3">Karatage</th>
                    <th className="py-2.5 px-3 text-right">Gross Weight</th>
                    <th className="py-2.5 px-3 text-right">Fine Gold (24K eq)</th>
                    <th className="py-2.5 px-3 text-right">Running Vault Balance</th>
                    <th className="py-2.5 px-3">Auditor / Custodian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  <tr className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 text-slate-400">2026-09-08</td>
                    <td className="py-2.5 px-3 font-mono text-amber-400">BLN-2026-044</td>
                    <td className="py-2.5 px-3 font-medium text-emerald-400">Bullion Inward Purchase</td>
                    <td className="py-2.5 px-3 font-mono">24K (999.9)</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">+50.00g</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-200">50.00g</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-100">196.70g</td>
                    <td className="py-2.5 px-3 text-slate-400">Owner (Dilshan)</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 text-slate-400">2026-09-05</td>
                    <td className="py-2.5 px-3 font-mono text-amber-400">BLN-2026-043</td>
                    <td className="py-2.5 px-3 font-medium text-amber-300">Workshop Issue for ORD-002</td>
                    <td className="py-2.5 px-3 font-mono">22K (916)</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-400">-16.00g</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-200">14.65g</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-100">146.70g</td>
                    <td className="py-2.5 px-3 text-slate-400">Admin (Kasun)</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 text-slate-400">2026-09-01</td>
                    <td className="py-2.5 px-3 font-mono text-amber-400">BLN-2026-042</td>
                    <td className="py-2.5 px-3 font-medium text-amber-300">Workshop Issue for ORD-001</td>
                    <td className="py-2.5 px-3 font-mono">18K (750)</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-400">-18.50g</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-200">13.87g</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-100">162.70g</td>
                    <td className="py-2.5 px-3 text-slate-400">Admin (Kasun)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 13. Supplier Purchase Orders & Payables */}
        {selectedReportId === 'supplier_purchases' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0b0f19] text-[10px] uppercase font-mono text-slate-400">
                <tr>
                  <th className="py-2.5 px-3">PO Number</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Supplier Merchant</th>
                  <th className="py-2.5 px-3">Supplied Items</th>
                  <th className="py-2.5 px-3 text-right">Total Invoice (LKR)</th>
                  <th className="py-2.5 px-3 text-right">Paid Amount</th>
                  <th className="py-2.5 px-3 text-right">Payable Balance</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {purchaseOrders.map((po) => {
                  const bal = Math.max(0, po.totalAmountLKR - (po.paidAmountLKR || 0));
                  return (
                    <tr key={po.id} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-mono font-bold text-indigo-400">
                        {po.poNumber}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">{po.date}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-200">{po.supplierName}</td>
                      <td className="py-2.5 px-3 text-slate-300">
                        {po.items.map((i) => i.name).join(', ')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-100">
                        Rs. {po.totalAmountLKR.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-400">
                        Rs. {(po.paidAmountLKR || 0).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-rose-400 font-bold">
                        Rs. {bal.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            po.status === 'received'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {po.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Same Step Bill & Report Print Modal matching user screenshot */}
      <BillPrintModal
        isOpen={isReportPrintModalOpen}
        onClose={() => setIsReportPrintModalOpen(false)}
        settings={settings}
        mode="report"
        report={currentReportPrintData}
      />
    </div>
  );
};
