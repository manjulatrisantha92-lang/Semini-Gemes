import React from 'react';
import {
  TrendingUp,
  Receipt,
  Gem,
  Hammer,
  CheckCircle2,
  AlertTriangle,
  Users,
  ArrowUpRight,
  PlusCircle,
  FileText,
  Clock,
  Sparkles,
  ChevronRight,
  Printer,
  BarChart3,
  CloudCheck,
  ShieldCheck,
  Send,
  ExternalLink,
  DollarSign,
  Package,
} from 'lucide-react';
import {
  Invoice,
  Product,
  WorkshopOrder,
  Customer,
  AppSettings,
  User,
} from '../../types';
import { StorageService } from '../../services/storage';

interface DashboardViewProps {
  invoices: Invoice[];
  products: Product[];
  orders: WorkshopOrder[];
  customers: Customer[];
  settings: AppSettings;
  currentUser: User;
  onNavigate: (page: string) => void;
  onOpenInvoicePrint: (invoice: Invoice) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  invoices = [],
  products = [],
  orders = [],
  customers = [],
  settings,
  currentUser,
  onNavigate,
  onOpenInvoicePrint,
}) => {
  const safeInvoices = Array.isArray(invoices) ? invoices : [];
  const safeProducts = Array.isArray(products) ? products : [];
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeCustomers = Array.isArray(customers) ? customers : [];

  // Stock categories breakdown counts
  const categoryCounts = {
    Rings: safeProducts.filter((p) => p.category === 'Rings').reduce((sum, p) => sum + p.stockQuantity, 0) || 1,
    'Necklaces & Pendants': safeProducts.filter((p) => p.category === 'Necklaces & Pendants').reduce((sum, p) => sum + p.stockQuantity, 0) || 3,
    'Bangles & Bracelets': safeProducts.filter((p) => p.category === 'Bangles & Bracelets').reduce((sum, p) => sum + p.stockQuantity, 0) || 4,
    'Loose Gemstones': safeProducts.filter((p) => p.category === 'Loose Gemstones').reduce((sum, p) => sum + p.stockQuantity, 0) || 2,
    Earrings: safeProducts.filter((p) => p.category === 'Earrings').reduce((sum, p) => sum + p.stockQuantity, 0) || 1,
    'Custom Jewelry': safeProducts.filter((p) => p.category === 'Custom Jewelry').reduce((sum, p) => sum + p.stockQuantity, 0) || 0,
  };

  const totalStockUnits = Object.values(categoryCounts).reduce((a, b) => a + b, 0);

  // Weekly bar chart data matching the screenshot
  const weeklyData = [
    { day: 'Mon', value: 450, display: '450k', heightPct: 25 },
    { day: 'Tue', value: 800, display: '800k', heightPct: 44 },
    { day: 'Wed', value: 650, display: '650k', heightPct: 36 },
    { day: 'Thu', value: 1100, display: '1.1M', heightPct: 61 },
    { day: 'Fri', value: 950, display: '950k', heightPct: 52 },
    { day: 'Sat', value: 1800, display: '1.8M', heightPct: 100 },
    { day: 'Sun', value: 720, display: '720k', heightPct: 40 },
    { day: 'Today', value: 482.9, display: '483k', heightPct: 27 },
  ];

  return (
    <div className="space-y-5">
      {/* 1. Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#121622] via-[#161c2c] to-[#1e1710] border border-[#232a3d] p-5 sm:p-6 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
              <span>✦</span> SRI LANKAN GEM & FINE JEWELRY HUB
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-100 font-serif">
              Welcome back, {currentUser.name} ({currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)})
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              {settings.companyName || 'WCS Gems & Jewelry (Pvt) Ltd'} • Colombo & Ratnapura Workshop Pipeline
            </p>
          </div>

          {/* Banner Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate('invoice')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#e5a828] hover:bg-[#f5b338] text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-950/40 transition-all active:scale-95"
            >
              <Receipt className="w-4 h-4" />
              <span>+ New Invoice</span>
            </button>
            <button
              onClick={() => onNavigate('create_order')}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#141824] hover:bg-slate-800 text-slate-200 border border-[#232a3d] font-semibold text-xs transition-colors"
            >
              <Hammer className="w-4 h-4 text-amber-400" />
              <span>Custom Order</span>
            </button>
            <button
              onClick={() => onNavigate('certificate')}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#141824] hover:bg-slate-800 text-slate-200 border border-[#232a3d] font-semibold text-xs transition-colors"
            >
              <FileText className="w-4 h-4 text-blue-400" />
              <span>Certificates</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Row 1: 3 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Today's Revenue */}
        <div className="bg-[#121622] border border-[#22293a] rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                TODAY'S REVENUE
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                ↗ +14% vs yesterday
              </span>
            </div>

            <div className="mt-3 text-3xl sm:text-4xl font-black text-slate-100 font-mono tracking-tight">
              Rs. 482,900
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 pt-3 border-t border-[#1e2434]">
            <div className="bg-[#161c2c]/80 rounded-xl p-2.5 border border-[#242c3f]">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">GOLD SALES</div>
              <div className="text-sm font-bold text-amber-300 font-mono mt-0.5">Rs. 313,885</div>
            </div>
            <div className="bg-[#161c2c]/80 rounded-xl p-2.5 border border-[#242c3f]">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">GEM SALES</div>
              <div className="text-sm font-bold text-cyan-300 font-mono mt-0.5">Rs. 169,015</div>
            </div>
          </div>
        </div>

        {/* Card 2: Workshop Status */}
        <div className="bg-[#121622] border border-[#22293a] rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              WORKSHOP STATUS
            </span>
            <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              Active Pipeline
            </span>
          </div>

          <div className="space-y-3.5 my-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Pending Orders</span>
              <span className="font-mono font-bold text-amber-300 text-sm">2</span>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Progress Efficiency</span>
                <span className="font-mono font-bold text-amber-400">25%</span>
              </div>
              <div className="w-full bg-[#1c2232] h-2 rounded-full overflow-hidden">
                <div className="bg-[#e5a828] h-full rounded-full w-1/4 transition-all duration-500"></div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Active Guilds</span>
              <span className="font-mono font-bold text-slate-200">4 Studios</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('workshop')}
            className="w-full text-center py-2 bg-[#161c2c] hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-semibold border border-[#242c3f] transition-colors"
          >
            Manage Workshop Orders →
          </button>
        </div>

        {/* Card 3: Low Stock Alerts */}
        <div className="bg-[#121622] border border-[#22293a] rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              LOW STOCK ALERTS
            </span>
            <span className="text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
              Immediate Attention
            </span>
          </div>

          <div className="my-auto py-2">
            <div className="text-5xl font-black text-rose-500 font-mono tracking-tight">
              05
            </div>
            <div className="text-xs text-slate-400 mt-1">
              items below minimum threshold
            </div>
          </div>

          <button
            onClick={() => onNavigate('inventory')}
            className="w-full text-center py-2 bg-[#161c2c] hover:bg-slate-800 text-amber-400 hover:text-amber-300 rounded-xl text-xs font-semibold border border-[#242c3f] transition-colors"
          >
            View Products →
          </button>
        </div>
      </div>

      {/* 3. Row 2: Recent Invoices (Left) & Workshop Activity Bar Chart (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Col: Recent Invoices (7 Cols) */}
        <div className="lg:col-span-7 bg-[#121622] border border-[#22293a] rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  RECENT INVOICES
                </h3>
              </div>
              <button
                onClick={() => onNavigate('invoice')}
                className="text-xs font-bold text-amber-400 hover:text-amber-300"
              >
                View All
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[11px] uppercase font-mono text-slate-400 border-b border-[#22293a]">
                  <tr>
                    <th className="pb-2.5 font-semibold">INVOICE #</th>
                    <th className="pb-2.5 font-semibold">CUSTOMER</th>
                    <th className="pb-2.5 font-semibold text-right">AMOUNT</th>
                    <th className="pb-2.5 font-semibold text-center">STATUS</th>
                    <th className="pb-2.5 font-semibold text-center">PRINT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1b2131]">
                  {safeInvoices.slice(0, 3).map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 font-mono font-bold text-amber-400">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 text-slate-200 font-medium">
                        {inv.customerName}
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-slate-100">
                        Rs. {inv.grandTotalLKR.toLocaleString()}
                      </td>
                      <td className="py-3 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                          PAID
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <button
                          onClick={() => onOpenInvoicePrint(inv)}
                          className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-amber-400 transition-colors"
                          title="Print A4 Invoice"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Workshop Orders & Sales Activity Bar Chart (5 Cols) */}
        <div className="lg:col-span-5 bg-[#121622] border border-[#22293a] rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  WORKSHOP ORDERS & SALES ACTIVITY
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-[#191f2e] px-2 py-0.5 rounded border border-[#283248]">
                Weekly Run
              </span>
            </div>

            {/* SVG / CSS Bar Chart */}
            <div className="relative pt-4 pb-2">
              {/* Y Axis Grid Guidelines */}
              <div className="flex flex-col justify-between h-36 text-[9px] font-mono text-slate-500 pr-2 absolute left-0 top-4 bottom-8 pointer-events-none">
                <span>1800k</span>
                <span>1350k</span>
                <span>900k</span>
                <span>450k</span>
                <span>0k</span>
              </div>

              {/* Bars container */}
              <div className="ml-10 h-36 flex items-end justify-between gap-2 border-b border-[#232a3d] pb-1">
                {weeklyData.map((item) => (
                  <div key={item.day} className="flex-1 flex flex-col items-center gap-1 group">
                    <div
                      style={{ height: `${item.heightPct}%` }}
                      className={`w-full max-w-[24px] rounded-t-sm transition-all group-hover:brightness-110 ${
                        item.day === 'Sat'
                          ? 'bg-[#e5a828] shadow-md shadow-amber-900/40'
                          : item.day === 'Today'
                          ? 'bg-amber-400'
                          : 'bg-[#b88620]/80'
                      }`}
                      title={`${item.day}: Rs. ${item.display}`}
                    ></div>
                    <span className="text-[10px] text-slate-400 font-mono mt-1">
                      {item.day}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Metrics */}
          <div className="mt-3 pt-3 border-t border-[#1e2434] flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Peak Activity: <strong className="text-slate-200">Saturday (Rs. 1.8M)</strong>
            </span>
            <span className="text-slate-400">
              Workshop Turnaround: <strong className="text-amber-400">4.2 Days</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 4. Row 3: 3 Cards (Solid Gold Backup Card, WhatsApp Promotions, Total Stock Valuation) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: SOLID GOLD BACKUP CARD (as in screenshot) */}
        <div className="bg-[#e5a828] text-slate-950 rounded-2xl p-5 shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-900/80">
                BACKUP STATUS
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-950/15 text-slate-950 border border-slate-950/20">
                Live Cloud
              </span>
            </div>

            <div className="mt-3">
              <h4 className="text-xl font-black text-slate-950 tracking-tight">
                Cloud Sync Completed
              </h4>
              <p className="text-xs text-slate-900/90 font-medium mt-1">
                Automated Snapshot • 2:45 PM Today
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-5 pt-3 border-t border-slate-950/20 flex items-center justify-between text-xs font-bold text-slate-950">
            <span>RATNAPURA & COLOMBO SYNC</span>
            <button
              onClick={() => onNavigate('backup_restore')}
              className="px-2.5 py-1 rounded bg-slate-950 text-amber-400 hover:bg-slate-900 text-xs font-extrabold transition-colors"
            >
              Verify
            </button>
          </div>
        </div>

        {/* Card 2: WhatsApp Marketing Card */}
        <div className="bg-[#121622] border border-[#22293a] rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                PROMOTIONS
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                WhatsApp Active
              </span>
            </div>

            <div className="mt-3">
              <h4 className="text-lg font-bold text-slate-100">
                WhatsApp Marketing
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Send promotional catalog & offers to Sri Lankan & overseas VIP client base.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('promotions')}
            className="w-full mt-4 py-2 bg-[#161c2c] hover:bg-slate-800 text-emerald-400 rounded-xl text-xs font-bold border border-[#242c3f] transition-colors text-center"
          >
            LAUNCH HUB →
          </button>
        </div>

        {/* Card 3: Total Stock Valuation */}
        <div className="bg-[#121622] border border-[#22293a] rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                TOTAL STOCK VALUATION
              </span>
              <span className="text-right">
                <span className="text-[10px] text-slate-400 uppercase block">TOTAL GROSS PROFIT</span>
                <span className="text-xs font-bold text-emerald-400 font-mono">Rs. 668,100</span>
              </span>
            </div>

            <div className="mt-2 text-2xl sm:text-3xl font-black text-cyan-400 font-mono tracking-tight">
              Rs. 10,950,000
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1e2434] grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <div className="text-[10px] text-slate-400 uppercase">COST BASIS</div>
              <div className="font-mono font-bold text-slate-200 text-[11px] mt-0.5">Rs. 8,390,000</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase">ACTIVE CLIENTS</div>
              <div className="font-mono font-bold text-slate-200 text-[11px] mt-0.5">{safeCustomers.length} Accounts</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase">CATALOG ITEMS</div>
              <div className="font-mono font-bold text-slate-200 text-[11px] mt-0.5">{safeProducts.length} Products</div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Row 4: STOCK BREAKDOWN BY CATEGORY (Full width card with Donut Chart) */}
      <div className="bg-[#121622] border border-[#22293a] rounded-2xl p-5 sm:p-6 shadow-lg">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            STOCK BREAKDOWN BY CATEGORY
          </h3>
          <span className="text-xs text-slate-400">
            unit Distribution
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Donut Chart SVG (md:col-span-5) */}
          <div className="md:col-span-5 flex items-center justify-center">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {/* Rings: ~10% (amber) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#e5a828"
                  strokeWidth="14"
                  strokeDasharray="24 215"
                  strokeDashoffset="0"
                />
                {/* Necklaces: ~25% (cyan) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#06b6d4"
                  strokeWidth="14"
                  strokeDasharray="60 179"
                  strokeDashoffset="-24"
                />
                {/* Bangles: ~35% (emerald) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth="14"
                  strokeDasharray="84 155"
                  strokeDashoffset="-84"
                />
                {/* Loose Gemstones: ~18% (purple) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#a855f7"
                  strokeWidth="14"
                  strokeDasharray="43 196"
                  strokeDashoffset="-168"
                />
                {/* Earrings: ~10% (rose) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#f43f5e"
                  strokeWidth="14"
                  strokeDasharray="24 215"
                  strokeDashoffset="-211"
                />
              </svg>

              {/* Inner label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-xl font-mono font-black text-slate-100 leading-none">
                  {totalStockUnits}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400 mt-1">
                  Units
                </span>
              </div>
            </div>
          </div>

          {/* 2-Column Category List (md:col-span-7) */}
          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
            {/* Rings */}
            <div className="flex items-center justify-between py-2 border-b border-[#1e2434] text-xs">
              <span className="flex items-center gap-2 text-slate-300 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#e5a828]"></span>
                Rings
              </span>
              <span className="font-mono font-bold text-slate-200">
                {categoryCounts.Rings}
              </span>
            </div>

            {/* Loose Gemstones */}
            <div className="flex items-center justify-between py-2 border-b border-[#1e2434] text-xs">
              <span className="flex items-center gap-2 text-slate-300 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                Loose Gemstones
              </span>
              <span className="font-mono font-bold text-slate-200">
                {categoryCounts['Loose Gemstones']}
              </span>
            </div>

            {/* Necklaces & Pendants */}
            <div className="flex items-center justify-between py-2 border-b border-[#1e2434] text-xs">
              <span className="flex items-center gap-2 text-slate-300 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
                Necklaces & Pendants
              </span>
              <span className="font-mono font-bold text-slate-200">
                {categoryCounts['Necklaces & Pendants']}
              </span>
            </div>

            {/* Earrings */}
            <div className="flex items-center justify-between py-2 border-b border-[#1e2434] text-xs">
              <span className="flex items-center gap-2 text-slate-300 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                Earrings
              </span>
              <span className="font-mono font-bold text-slate-200">
                {categoryCounts.Earrings}
              </span>
            </div>

            {/* Bangles & Bracelets */}
            <div className="flex items-center justify-between py-2 border-b border-[#1e2434] text-xs">
              <span className="flex items-center gap-2 text-slate-300 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Bangles & Bracelets
              </span>
              <span className="font-mono font-bold text-slate-200">
                {categoryCounts['Bangles & Bracelets']}
              </span>
            </div>

            {/* Custom Jewelry */}
            <div className="flex items-center justify-between py-2 border-b border-[#1e2434] text-xs">
              <span className="flex items-center gap-2 text-slate-300 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
                Custom Jewelry
              </span>
              <span className="font-mono font-bold text-slate-200">
                {categoryCounts['Custom Jewelry']}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
