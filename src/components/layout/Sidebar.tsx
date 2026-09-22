import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  FileText,
  RotateCcw,
  Gem,
  Package,
  Users,
  Hammer,
  UserCheck,
  UserPlus,
  Coins,
  PlusSquare,
  Clock,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  Undo2,
  BarChart3,
  Share2,
  Facebook,
  Shield,
  Settings,
  Database,
  Lock,
  ChevronRight,
  ChevronLeft,
  PanelLeft,
  Code2,
  RefreshCw,
  DollarSign,
  CreditCard,
  Sparkles,
} from 'lucide-react';
import { User, UserRole } from '../../types';

export type ActivePage =
  | 'dashboard'
  | 'invoice'
  | 'exchange_invoice'
  | 'certificate'
  | 'inventory'
  | 'products'
  | 'customers'
  | 'workshops'
  | 'workshop_employees'
  | 'workshop_advances'
  | 'create_order'
  | 'pending_orders'
  | 'completed_orders'
  | 'cancelled_orders'
  | 'add_workman'
  | 'workman_payment_invoice'
  | 'advance_payment_add'
  | 'balance_pay_add'
  | 'purchase_orders'
  | 'purchase_returns'
  | 'expenses'
  | 'payouts'
  | 'return_invoice'
  | 'reports'
  | 'promotions'
  | 'promotions_whatsapp'
  | 'facebook_promotions'
  | 'customer_greetings'
  | 'users'
  | 'staff_passwords'
  | 'settings'
  | 'backup_restore'
  | 'mongodb_architecture';

export interface SidebarProps {
  currentUser?: User | null;
  userRole?: UserRole;
  activePage: string;
  onNavigate?: (page: string) => void;
  onSelectPage?: (page: ActivePage) => void;
  isOpen: boolean;
  onClose?: () => void;
  onCloseMobile?: () => void;
}

interface NavItem {
  id: ActivePage;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles: UserRole[];
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  userRole,
  activePage,
  onNavigate,
  onSelectPage,
  isOpen,
  onClose,
  onCloseMobile,
}) => {
  const role: UserRole = currentUser?.role || userRole || 'admin';

  const handleClose = () => {
    if (onClose) onClose();
    if (onCloseMobile) onCloseMobile();
  };

  const handleSelect = (pageId: ActivePage) => {
    if (onNavigate) {
      onNavigate(pageId);
    } else if (onSelectPage) {
      onSelectPage(pageId);
    }
    // Only close drawer on mobile/tablet viewports so desktop users can keep Overview open
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      handleClose();
    }
  };

  const sections: NavSection[] = [
    {
      title: 'Overview',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard,
          allowedRoles: ['admin', 'owner', 'user'],
        },
      ],
    },
    {
      title: 'Sales & POS',
      items: [
        {
          id: 'invoice',
          label: 'Invoice / POS Billing',
          icon: Receipt,
          allowedRoles: ['admin', 'owner', 'user'],
          badge: 'POS',
        },
        {
          id: 'exchange_invoice',
          label: 'Exchange Invoice',
          icon: RefreshCw,
          allowedRoles: ['admin', 'owner', 'user'],
          badge: 'Trade-in',
        },
        {
          id: 'return_invoice',
          label: 'Return Invoice',
          icon: RotateCcw,
          allowedRoles: ['admin', 'owner', 'user'],
        },
        {
          id: 'certificate',
          label: 'Jewelry Certificate',
          icon: FileText,
          allowedRoles: ['admin', 'owner', 'user'],
        },
      ],
    },
    {
      title: 'Jewelry & Gem Inventory',
      items: [
        {
          id: 'inventory',
          label: 'Stock Inventory',
          icon: Gem,
          allowedRoles: ['admin', 'owner'],
        },
        {
          id: 'products',
          label: 'Product Catalog',
          icon: Package,
          allowedRoles: ['admin', 'owner'],
        },
      ],
    },
    {
      title: 'Workshop Guild & Orders',
      items: [
        {
          id: 'workshops',
          label: 'Workshops Directory',
          icon: Hammer,
          allowedRoles: ['admin', 'owner'],
        },
        {
          id: 'create_order',
          label: 'Create Custom Order',
          icon: PlusSquare,
          allowedRoles: ['admin', 'owner'],
        },
        {
          id: 'pending_orders',
          label: 'Pending & In-Progress',
          icon: Clock,
          allowedRoles: ['admin', 'owner'],
        },
        {
          id: 'completed_orders',
          label: 'Completed Orders',
          icon: CheckCircle2,
          allowedRoles: ['admin', 'owner'],
        },
        {
          id: 'add_workman',
          label: 'Add Workman',
          icon: UserPlus,
          allowedRoles: ['admin', 'owner'],
          badge: 'Option',
        },
        {
          id: 'workman_payment_invoice',
          label: 'Workman Payment Invoice',
          icon: Receipt,
          allowedRoles: ['admin', 'owner'],
          badge: 'Option',
        },
        {
          id: 'advance_payment_add',
          label: 'Advance Payment Add',
          icon: Coins,
          allowedRoles: ['admin', 'owner'],
          badge: 'Option',
        },
        {
          id: 'balance_pay_add',
          label: 'Balance Pay Add',
          icon: DollarSign,
          allowedRoles: ['admin', 'owner'],
          badge: 'Option',
        },
      ],
    },
    {
      title: 'Purchases & Finance',
      items: [
        {
          id: 'purchase_orders',
          label: 'Purchase Orders',
          icon: ShoppingBag,
          allowedRoles: ['admin', 'owner'],
        },
        {
          id: 'purchase_returns',
          label: 'Purchase Returns',
          icon: Undo2,
          allowedRoles: ['admin', 'owner'],
        },
        {
          id: 'expenses',
          label: 'Showroom Expenses',
          icon: DollarSign,
          allowedRoles: ['admin', 'owner'],
          badge: 'Optional',
        },
        {
          id: 'payouts',
          label: 'Cash & Payouts',
          icon: CreditCard,
          allowedRoles: ['admin', 'owner'],
          badge: 'Vouchers',
        },
        {
          id: 'reports',
          label: 'A4 Business Reports',
          icon: BarChart3,
          allowedRoles: ['admin', 'owner'],
        },
      ],
    },
    {
      title: 'Customers & CRM',
      items: [
        {
          id: 'customers',
          label: 'Customer Directory (VIP)',
          icon: Users,
          allowedRoles: ['admin', 'owner', 'user'],
        },
        {
          id: 'customer_greetings',
          label: 'Customer Greetings (WhatsApp)',
          icon: Sparkles,
          allowedRoles: ['admin', 'owner', 'user'],
          badge: 'JPG / Video',
        },
      ],
    },
    {
      title: 'Marketing & Promotions',
      items: [
        {
          id: 'customer_greetings',
          label: 'Customer Festive Greetings',
          icon: Sparkles,
          allowedRoles: ['admin', 'owner', 'user'],
          badge: 'Cards/Video',
        },
        {
          id: 'promotions_whatsapp',
          label: 'WhatsApp Promotions',
          icon: Share2,
          allowedRoles: ['admin', 'owner', 'user'],
        },
        {
          id: 'facebook_promotions',
          label: 'Facebook Promo Links',
          icon: Facebook,
          allowedRoles: ['admin', 'owner', 'user'],
        },
      ],
    },
    {
      title: 'Management & Administration',
      items: [
        {
          id: 'staff_passwords',
          label: 'Staff & Passwords',
          icon: Users,
          allowedRoles: ['admin', 'owner'],
        },
        {
          id: 'settings',
          label: 'Settings & Letterhead JPG',
          icon: Settings,
          allowedRoles: ['admin', 'owner'],
        },
        {
          id: 'backup_restore',
          label: 'Backup & Restore',
          icon: Database,
          allowedRoles: ['admin', 'owner'],
        },
        {
          id: 'mongodb_architecture',
          label: 'MongoDB Architecture',
          icon: Code2,
          allowedRoles: ['admin', 'owner'],
        },
      ],
    },
  ];

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Mobile Backdrop Overlay (only on mobile) */}
      <div
        className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
        onClick={handleClose}
      />

      {/* Sidebar Panel - Docked on Desktop, Drawer on Mobile */}
      <aside className="fixed lg:static top-16 bottom-0 left-0 z-50 lg:z-30 w-72 lg:w-64 shrink-0 bg-[#0c101a] border-r border-[#1f2637] shadow-2xl lg:shadow-none flex flex-col h-[calc(100vh-4rem)] transition-all duration-200">
        {/* Sidebar Header */}
        <div className="px-4 py-3 border-b border-[#1f2637] bg-[#090d15] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <PanelLeft className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              System Overview
            </span>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            title="Collapse Overview"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
          {sections.map((section) => (
            <div key={section.title}>
              <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 font-mono">
                {section.title}
              </div>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const isAllowed = item.allowedRoles.includes(role);
                  const isActive =
                    activePage === item.id ||
                    (item.id === 'inventory' && activePage === 'products') ||
                    (item.id === 'invoice' && activePage === 'return_invoice') ||
                    (item.id === 'purchase_orders' &&
                      (activePage === 'purchases' || activePage === 'purchase_orders')) ||
                    (item.id === 'workshops' &&
                      (activePage === 'workshop' || activePage === 'workshop_employees')) ||
                    (item.id === 'settings' && activePage === 'users') ||
                    (item.id === 'promotions_whatsapp' && activePage === 'promotions');
                  const Icon = item.icon;

                  return (
                    <li key={item.id}>
                      <button
                        disabled={!isAllowed}
                        onClick={() => {
                          if (isAllowed) {
                            handleSelect(item.id);
                          }
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all group cursor-pointer ${
                          isActive
                            ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 shadow-sm'
                            : isAllowed
                            ? 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                            : 'text-slate-600 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon
                            className={`w-4 h-4 shrink-0 transition-colors ${
                              isActive
                                ? 'text-amber-400'
                                : isAllowed
                                ? 'text-slate-400 group-hover:text-amber-400'
                                : 'text-slate-600'
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 ml-1">
                          {item.badge && (
                            <span className="px-1.5 py-0.2 text-[10px] font-bold rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              {item.badge}
                            </span>
                          )}
                          {!isAllowed && (
                            <span title="Role Restricted">
                              <Lock className="w-3 h-3 text-slate-600" />
                            </span>
                          )}
                          {isActive && isAllowed && (
                            <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="p-2.5 border-t border-[#1f2637] bg-[#090d15] shrink-0 text-center">
          <div className="text-[10px] text-slate-400 font-medium">
            WCS Gems & Jewelry POS
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Role: <span className="text-amber-400 uppercase font-semibold">{role}</span>
          </div>
        </div>
      </aside>
    </>
  );
};
