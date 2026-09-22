import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  Receipt,
  Gem,
  Hammer,
  ShoppingCart,
  BarChart3,
  Search,
  Maximize2,
  Minimize2,
  FolderTree,
  ChevronDown,
  ChevronUp,
  Code2,
  Menu,
  ShieldCheck,
  Crown,
  User as UserIcon,
  LogOut,
  UserCheck,
  FileText,
  Users,
  Settings,
  Database,
  RefreshCw,
  Plus,
  PanelLeft,
  ChevronLeft,
  ChevronRight,
  Smartphone,
  Wifi,
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Coins,
  UserPlus,
  DollarSign,
  Layers,
} from 'lucide-react';
import { User, AppSettings } from '../../types';

interface NavbarProps {
  currentUser: User;
  settings: AppSettings;
  activePage?: string;
  onNavigate?: (page: string) => void;
  onLogout: () => void;
  onOpenBarcodeScanner?: () => void;
  onNavigateToInvoice?: () => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  onOpenSwitchUserModal?: () => void;
  onOpenCategoriesModal?: () => void;
  onOpenMultiDevice?: () => void;
  lowStockCount?: number;
  pendingWorkshopCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  settings,
  activePage = 'dashboard',
  onNavigate,
  onLogout,
  onOpenBarcodeScanner,
  onNavigateToInvoice,
  onToggleSidebar,
  isSidebarOpen = false,
  onOpenSwitchUserModal,
  onOpenCategoriesModal,
  onOpenMultiDevice,
  lowStockCount = 5,
  pendingWorkshopCount = 2,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [workshopDropdownOpen, setWorkshopDropdownOpen] = useState(false);
  const [purchasesDropdownOpen, setPurchasesDropdownOpen] = useState(false);
  const [mgmtDropdownOpen, setMgmtDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isSublineOpen, setIsSublineOpen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('wcs_navbar_subline_open');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const toggleSubline = () => {
    setIsSublineOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('wcs_navbar_subline_open', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const workshopRef = useRef<HTMLDivElement>(null);
  const purchasesRef = useRef<HTMLDivElement>(null);
  const mgmtRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const handleNav = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    } else if (page === 'invoice' && onNavigateToInvoice) {
      onNavigateToInvoice();
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (workshopRef.current && !workshopRef.current.contains(e.target as Node)) {
        setWorkshopDropdownOpen(false);
      }
      if (purchasesRef.current && !purchasesRef.current.contains(e.target as Node)) {
        setPurchasesDropdownOpen(false);
      }
      if (mgmtRef.current && !mgmtRef.current.contains(e.target as Node)) {
        setMgmtDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full max-w-full bg-[#0d111a] border-b border-[#1f2635] shadow-lg">
      {/* Primary Top Bar (Line 1: Brand & Essential Actions) */}
      <div className="w-full px-3 sm:px-5 lg:px-6 h-15 flex items-center justify-between gap-3">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 min-w-0">
          {/* Overview / Sidebar Toggle Button (optional toggle on desktop & mobile) */}
          <button
            onClick={onToggleSidebar}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all shrink-0 ${
              isSidebarOpen
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-100 hover:bg-slate-800'
            }`}
            title={isSidebarOpen ? 'Hide Left Overview Menu' : 'Show Left Overview Menu'}
            aria-label="Toggle Overview"
          >
            <PanelLeft className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="hidden sm:inline font-medium">Overview</span>
            {isSidebarOpen ? (
              <ChevronLeft className="hidden md:inline w-3 h-3 text-amber-400/80" />
            ) : (
              <ChevronRight className="hidden md:inline w-3 h-3 text-slate-500" />
            )}
          </button>

          {/* Diamond Logo Icon or Custom Company Logo */}
          <div
            onClick={() => handleNav('dashboard')}
            className="cursor-pointer w-10 h-10 rounded-xl bg-gradient-to-br from-[#1c1810] to-[#121620] border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-md shadow-amber-950/40 hover:border-amber-400 transition-colors overflow-hidden shrink-0"
          >
            {settings.logoJpgUrl ? (
              <img
                src={settings.logoJpgUrl}
                alt="Logo"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain p-1 bg-white/10"
              />
            ) : (
              <Gem className="w-5 h-5 text-amber-400 fill-amber-400/20" />
            )}
          </div>

          {/* Company Name & Version */}
          <div className="cursor-pointer min-w-0" onClick={() => handleNav('dashboard')}>
            <div className="flex items-center gap-2">
              <h1 className="text-xs sm:text-sm md:text-[15px] font-extrabold text-amber-300 tracking-wide font-serif uppercase truncate">
                {settings.companyName || 'WCS GEMS & JEWELRY (PVT) LTD'}
              </h1>
              <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono tracking-wider">
                POS v4.2
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-slate-400 font-normal truncate max-w-xs md:max-w-md">
              {settings.companyTagline || 'Authentic Ceylon Gemstones & Masterpiece Fine Jewelry'}
            </p>
          </div>
        </div>

        {/* Right Actions: + POS Invoice, Search, Sub-Line (Optional) Toggle, User Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* + POS Invoice Button (Vibrant & Always Visible) */}
          <button
            onClick={() => handleNav('invoice')}
            className="px-3 py-1.5 rounded-lg bg-[#e5a828] hover:bg-[#f5b338] text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-950/30 transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span className="font-bold whitespace-nowrap">POS Invoice</span>
          </button>

          {/* Search Icon */}
          <button
            onClick={onOpenBarcodeScanner}
            className="p-2 rounded-lg bg-[#141824] hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-[#232a3b] transition-colors shrink-0"
            title="Search Products or Scan Barcode"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Sub-Line Toggle Button (Optional Navigation & Tools) */}
          <button
            onClick={toggleSubline}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all shrink-0 ${
              isSublineOpen
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-[#141824] hover:bg-slate-800 text-slate-300 border-[#232a3b]'
            }`}
            title={isSublineOpen ? 'Hide Sub-Menu & Optional Tools' : 'Show Sub-Menu & Optional Tools'}
          >
            <Layers className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="hidden sm:inline font-semibold">
              {isSublineOpen ? 'Sub-Line' : 'Sub-Line (Optional)'}
            </span>
            {isSublineOpen ? (
              <ChevronUp className="w-3 h-3 text-amber-400" />
            ) : (
              <ChevronDown className="w-3 h-3 text-slate-400" />
            )}
          </button>

          {/* User Profile Pill & Dropdown */}
          <div className="relative shrink-0" ref={userRef}>
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-xl bg-[#141824] border border-[#232a3b] hover:border-amber-500/40 transition-colors"
            >
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover border border-amber-500/50"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center">
                  {currentUser.name.charAt(0)}
                </div>
              )}
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-slate-100 leading-tight">
                  {currentUser.name.split(' ')[0]}
                </div>
                <div className="text-[10px] font-mono font-bold text-amber-400/90 uppercase leading-none">
                  {currentUser.role}
                </div>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-48 bg-[#121622] border border-[#232a3b] rounded-xl shadow-2xl p-2 space-y-1 z-50">
                <div className="px-2.5 py-1.5 border-b border-slate-800">
                  <div className="text-xs font-bold text-slate-200">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-400 capitalize">{currentUser.role} Role</div>
                </div>
                {onOpenSwitchUserModal && (
                  <button
                    onClick={() => {
                      onOpenSwitchUserModal();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg text-xs text-slate-300 hover:bg-slate-800 flex items-center gap-2"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Switch Operator</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    onLogout();
                    setUserDropdownOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Line ("after line in" - Line 2: Navigation & Optional Screenshot Tools) */}
      {isSublineOpen && (
        <div className="w-full border-t border-[#1f2635] bg-[#090d16]/95 backdrop-blur px-3 sm:px-5 lg:px-6 py-1.5 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
          {/* Main Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Dashboard */}
          <button
            onClick={() => handleNav('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activePage === 'dashboard'
                ? 'bg-[#e5a828] text-slate-950 shadow-md shadow-amber-900/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          {/* Sales & POS */}
          <button
            onClick={() => handleNav('invoice')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activePage === 'invoice'
                ? 'bg-[#e5a828] text-slate-950 font-bold shadow-md shadow-amber-900/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <Receipt className="w-3.5 h-3.5 text-amber-400" />
            <span>Sales & POS</span>
          </button>

          {/* Jewelry & Stock */}
          <button
            onClick={() => handleNav('inventory')}
            className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activePage === 'inventory'
                ? 'bg-[#e5a828] text-slate-950 font-bold shadow-md shadow-amber-900/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <Gem className="w-3.5 h-3.5 text-cyan-400" />
            <span>Jewelry & Stock</span>
            {lowStockCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white font-mono shadow-sm">
                {lowStockCount}
              </span>
            )}
          </button>

          {/* Workshop Guild Dropdown (Matching Screenshot 2) */}
          <div className="relative" ref={workshopRef}>
            <button
              onClick={() => {
                setWorkshopDropdownOpen(!workshopDropdownOpen);
                setPurchasesDropdownOpen(false);
                setMgmtDropdownOpen(false);
                setUserDropdownOpen(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activePage.includes('order') || activePage.includes('workshop')
                  ? 'bg-[#e5a828] text-slate-950 font-bold shadow-md shadow-amber-900/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <Hammer className="w-3.5 h-3.5 text-amber-400" />
              <span>Workshop Guild</span>
              {pendingWorkshopCount > 0 && (
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold bg-[#f59e0b] text-slate-950 font-mono shadow-sm">
                  {pendingWorkshopCount}
                </span>
              )}
              {workshopDropdownOpen ? (
                <ChevronUp className="w-3 h-3 text-slate-300" />
              ) : (
                <ChevronDown className="w-3 h-3 text-slate-400" />
              )}
            </button>

            {workshopDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-60 bg-[#0f1422] border border-[#1f283d] rounded-2xl shadow-2xl p-2 space-y-1 z-50">
                {/* 1. Create Custom Order */}
                <button
                  onClick={() => {
                    handleNav('create_order');
                    setWorkshopDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800/80 rounded-xl transition-colors text-left"
                >
                  <PlusCircle className="w-4 h-4 text-amber-400" />
                  <span>Create Custom Order</span>
                </button>

                {/* 2. Pending Orders */}
                <button
                  onClick={() => {
                    handleNav('pending_orders');
                    setWorkshopDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800/80 rounded-xl transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Pending Orders</span>
                  </div>
                  {pendingWorkshopCount > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 font-mono text-[11px] font-bold">
                      {pendingWorkshopCount}
                    </span>
                  )}
                </button>

                {/* 3. Completed Orders */}
                <button
                  onClick={() => {
                    handleNav('completed_orders');
                    setWorkshopDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800/80 rounded-xl transition-colors text-left"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Completed Orders</span>
                </button>

                {/* 4. Cancelled Orders */}
                <button
                  onClick={() => {
                    handleNav('cancelled_orders');
                    setWorkshopDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800/80 rounded-xl transition-colors text-left"
                >
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span>Cancelled Orders</span>
                </button>

                <div className="my-1 border-t border-slate-800/80" />

                {/* 5. Workshops Directory */}
                <button
                  onClick={() => {
                    handleNav('workshops');
                    setWorkshopDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800/80 rounded-xl transition-colors text-left"
                >
                  <Hammer className="w-4 h-4 text-amber-500" />
                  <span>Workshops Directory</span>
                </button>

                {/* 6. Craftsmen & Wages */}
                <button
                  onClick={() => {
                    handleNav('workshop_employees');
                    setWorkshopDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800/80 rounded-xl transition-colors text-left"
                >
                  <Users className="w-4 h-4 text-indigo-400" />
                  <span>Craftsmen & Wages</span>
                </button>

                {/* 7. Workshop Advances */}
                <button
                  onClick={() => {
                    handleNav('workshop_advances');
                    setWorkshopDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800/80 rounded-xl transition-colors text-left"
                >
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span>Workshop Advances</span>
                </button>

                <div className="my-1 border-t border-amber-500/20" />
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-400/80 font-mono">
                  Workshop Actions
                </div>

                {/* 8. Add Workman */}
                <button
                  onClick={() => {
                    handleNav('add_workman');
                    setWorkshopDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-amber-500/10 hover:text-amber-300 rounded-xl transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <UserPlus className="w-4 h-4 text-amber-400" />
                    <span>Add Workman</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono">
                    New
                  </span>
                </button>

                {/* 9. Add Workman to Payment Invoice */}
                <button
                  onClick={() => {
                    handleNav('workman_payment_invoice');
                    setWorkshopDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-blue-500/10 hover:text-blue-300 rounded-xl transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <Receipt className="w-4 h-4 text-blue-400" />
                    <span>Add Workman to Payment Invoice</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-mono">
                    Pay
                  </span>
                </button>

                {/* 10. Advance Payment Add */}
                <button
                  onClick={() => {
                    handleNav('advance_payment_add');
                    setWorkshopDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-300 rounded-xl transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <Coins className="w-4 h-4 text-emerald-400" />
                    <span>Advance Payment Add</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                    +Adv
                  </span>
                </button>

                {/* 11. Balance Pay Add */}
                <button
                  onClick={() => {
                    handleNav('balance_pay_add');
                    setWorkshopDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-violet-500/10 hover:text-violet-300 rounded-xl transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-4 h-4 text-violet-400" />
                    <span>Balance Pay Add</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 text-[10px] font-mono">
                    Settle
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Purchases & Finance Dropdown */}
          <div className="relative" ref={purchasesRef}>
            <button
              onClick={() => {
                setPurchasesDropdownOpen(!purchasesDropdownOpen);
                setMgmtDropdownOpen(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activePage === 'purchase_orders' || activePage === 'purchase_returns' || activePage === 'reports'
                  ? 'bg-slate-800 text-amber-300 font-bold border border-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5 text-emerald-400" />
              <span>Purchases & Finance</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {purchasesDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-52 bg-[#121622] border border-[#232a3b] rounded-xl shadow-2xl p-1.5 space-y-1 z-50">
                <button
                  onClick={() => {
                    handleNav('purchase_orders');
                    setPurchasesDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                >
                  <ShoppingCart className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Purchase Orders</span>
                </button>
                <button
                  onClick={() => {
                    handleNav('purchase_returns');
                    setPurchasesDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Purchase Returns</span>
                </button>
                <button
                  onClick={() => {
                    handleNav('reports');
                    setPurchasesDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Profit & Loss Reports</span>
                </button>
              </div>
            )}
          </div>

          {/* Management Dropdown */}
          <div className="relative" ref={mgmtRef}>
            <button
              onClick={() => {
                setMgmtDropdownOpen(!mgmtDropdownOpen);
                setPurchasesDropdownOpen(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activePage === 'reports' ||
                activePage === 'staff_passwords' ||
                activePage === 'users' ||
                activePage === 'settings' ||
                activePage === 'backup_restore' ||
                activePage === 'mongodb_architecture'
                  ? 'bg-slate-800 text-amber-300 font-bold border border-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
              <span>Management</span>
              {mgmtDropdownOpen ? (
                <ChevronUp className="w-3 h-3 text-amber-400" />
              ) : (
                <ChevronDown className="w-3 h-3 text-slate-400" />
              )}
            </button>

            {mgmtDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-60 bg-[#0c101d] border border-[#1e273d] rounded-2xl shadow-2xl p-2 space-y-1 z-50">
                <button
                  onClick={() => {
                    handleNav('reports');
                    setMgmtDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800/80 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <BarChart3 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>A4 Business Reports</span>
                </button>

                <button
                  onClick={() => {
                    handleNav('staff_passwords');
                    setMgmtDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800/80 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Users className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Staff & Passwords</span>
                </button>

                <button
                  onClick={() => {
                    handleNav('settings');
                    setMgmtDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800/80 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Settings & Letterhead JPG</span>
                </button>

                <button
                  onClick={() => {
                    handleNav('backup_restore');
                    setMgmtDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800/80 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Database className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Backup & Restore</span>
                </button>

                {onOpenMultiDevice && (
                  <button
                    onClick={() => {
                      onOpenMultiDevice();
                      setMgmtDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-amber-300 hover:text-amber-200 hover:bg-slate-800/80 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Multi-Device Sync & QR</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    handleNav('mongodb_architecture');
                    setMgmtDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800/80 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Code2 className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>MongoDB Architecture</span>
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Right: Screenshot Quick Tools (Multi-Device, Categories, Fullscreen) in Optional Sub-Line */}
        <div className="flex items-center gap-1.5 shrink-0 border-l border-slate-800/80 pl-3">
          <span className="hidden xl:inline text-[10px] uppercase font-bold tracking-wider text-slate-500">
            Optional:
          </span>

          {/* Multi-Device Button */}
          {onOpenMultiDevice && (
            <button
              onClick={onOpenMultiDevice}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#141824] hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 text-xs font-medium transition-colors shrink-0"
              title="Operate on multiple devices (Mobile, Tablet, Counter PC) with real-time sync"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-200 font-semibold text-[11px] whitespace-nowrap">Multi-Device</span>
            </button>
          )}

          {/* Categories Button */}
          <button
            onClick={() => {
              if (onOpenCategoriesModal) onOpenCategoriesModal();
              else handleNav('inventory');
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#141824] hover:bg-slate-800 text-slate-200 border border-[#232a3b] text-xs font-medium transition-colors shrink-0"
            title="Filter and browse categories"
          >
            <FolderTree className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] whitespace-nowrap">Categories</span>
          </button>

          {/* Fullscreen Icon */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-[#141824] hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-[#232a3b] transition-colors shrink-0"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
      )}
    </header>
  );
};
