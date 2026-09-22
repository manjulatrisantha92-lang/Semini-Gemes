import React, { useState, useEffect } from 'react';
import { StorageService } from './services/storage';
import {
  User,
  Product,
  Invoice,
  Certificate,
  Workshop,
  WorkshopOrder,
  Customer,
  AppSettings,
} from './types';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { ToastProvider, useToast } from './components/common/Toast';
import { BarcodeScannerModal } from './components/common/BarcodeScannerModal';

// Views
import { LoginView } from './components/auth/LoginView';
import { DashboardView } from './components/dashboard/DashboardView';
import { InventoryView } from './components/inventory/InventoryView';
import { InvoiceView } from './components/invoice/InvoiceView';
import { CertificateView } from './components/certificate/CertificateView';
import { WorkshopView } from './components/workshop/WorkshopView';
import { CustomersView } from './components/customers/CustomersView';
import { PurchasesFinanceView } from './components/purchases/PurchasesFinanceView';
import { ReportsView } from './components/reports/ReportsView';
import { PromotionsView } from './components/promotions/PromotionsView';
import { CustomerGreetingsStudio } from './components/promotions/CustomerGreetingsStudio';
import { SettingsView } from './components/settings/SettingsView';
import { StaffPasswordsView } from './components/management/StaffPasswordsView';
import { BackupRestoreView } from './components/management/BackupRestoreView';
import { MongoArchitectureView } from './components/management/MongoArchitectureView';
import { MultiDeviceModal } from './components/common/MultiDeviceModal';
import { MultiDeviceSyncService } from './services/syncService';

function AppContent() {
  const { showToast } = useToast();

  // Master State
  const [currentUser, setCurrentUser] = useState<User | null>(() => StorageService.getCurrentUser());
  const [users, setUsers] = useState<User[]>(() => StorageService.getUsers());
  const [products, setProducts] = useState<Product[]>(() => StorageService.getProducts());
  const [invoices, setInvoices] = useState<Invoice[]>(() => StorageService.getInvoices());
  const [certificates, setCertificates] = useState<Certificate[]>(() => StorageService.getCertificates());
  const [workshops, setWorkshops] = useState<Workshop[]>(() => StorageService.getWorkshops());
  const [orders, setOrders] = useState<WorkshopOrder[]>(() => StorageService.getWorkshopOrders());
  const [customers, setCustomers] = useState<Customer[]>(() => StorageService.getCustomers());
  const [settings, setSettings] = useState<AppSettings>(() => StorageService.getSettings());

  // Navigation State
  const [activePage, setActivePage] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );

  // Barcode Scanner Modal State
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);

  // Multi-Device Sync Modal State
  const [isMultiDeviceModalOpen, setIsMultiDeviceModalOpen] = useState(false);

  // Cross-page workflows
  const [invoiceToPrint, setInvoiceToPrint] = useState<Invoice | null>(null);
  const [certificateInvoiceRef, setCertificateInvoiceRef] = useState<Invoice | null>(null);

  // Background Multi-Device Synchronization & Realtime updates
  useEffect(() => {
    const stopSync = MultiDeviceSyncService.startAutoSync(6000);
    const unsubscribe = MultiDeviceSyncService.subscribe(() => {
      setProducts(StorageService.getProducts());
      setInvoices(StorageService.getInvoices());
      setCertificates(StorageService.getCertificates());
      setWorkshops(StorageService.getWorkshops());
      setOrders(StorageService.getWorkshopOrders());
      setCustomers(StorageService.getCustomers());
      setSettings(StorageService.getSettings());
      setUsers(StorageService.getUsers());
    });

    return () => {
      stopSync();
      unsubscribe();
    };
  }, []);

  // Refresh all data from storage
  const handleRefreshData = () => {
    setProducts(StorageService.getProducts());
    setInvoices(StorageService.getInvoices());
    setCertificates(StorageService.getCertificates());
    setWorkshops(StorageService.getWorkshops());
    setOrders(StorageService.getWorkshopOrders());
    setCustomers(StorageService.getCustomers());
    setSettings(StorageService.getSettings());
    setUsers(StorageService.getUsers());
    MultiDeviceSyncService.pushLocalToServer();
  };

  // Auth Handlers
  const handleLogin = (user: User) => {
    StorageService.setCurrentUser(user);
    setCurrentUser(user);
    // Role 'user' only has access to invoice section
    if (user.role === 'user') {
      setActivePage('invoice');
    } else {
      setActivePage('dashboard');
    }
    showToast(`Welcome back, ${user.name}! (${user.role.toUpperCase()})`, 'success');
  };

  const handleLogout = () => {
    StorageService.setCurrentUser(null);
    setCurrentUser(null);
    showToast('Securely logged out from WCS system.', 'info');
  };

  const handleAddUser = (newUser: User) => {
    StorageService.addUser(newUser);
    setUsers(StorageService.getUsers());
    showToast(`User ${newUser.name} created!`, 'success');
  };

  const handleDeleteUser = (userId: string) => {
    StorageService.deleteUser(userId);
    setUsers(StorageService.getUsers());
    showToast('User removed.', 'info');
  };

  // Barcode scanned match
  const handleBarcodeScanned = (scannedCode: string) => {
    setIsBarcodeScannerOpen(false);
    const foundProduct = products.find(
      (p) =>
        p.barcode.toLowerCase() === scannedCode.toLowerCase() ||
        p.itemCode.toLowerCase() === scannedCode.toLowerCase()
    );

    if (foundProduct) {
      showToast(`Scanned: ${foundProduct.name} (${foundProduct.itemCode})`, 'success');
      setActivePage('inventory');
    } else {
      showToast(`No item found matching barcode: ${scannedCode}`, 'error');
    }
  };

  // Handler to open print modal on invoice page from dashboard or client history
  const handleOpenInvoicePrint = (inv: Invoice) => {
    setInvoiceToPrint(inv);
    setActivePage('invoice');
  };

  // Handler to jump from invoice to certificate generation
  const handleOpenCertificateForInvoice = (inv: Invoice) => {
    setCertificateInvoiceRef(inv);
    setActivePage('certificate');
  };

  // If not logged in, render the login & user selection view
  if (!currentUser) {
    return (
      <LoginView
        users={users}
        settings={settings}
        onLogin={handleLogin}
        onAddUser={handleAddUser}
        onDeleteUser={handleDeleteUser}
      />
    );
  }

  // Safe navigation guard: 'user' role is allowed POS, returns, certificates, customers, festive greetings, promotions
  const userAllowedPages = [
    'dashboard',
    'invoice',
    'exchange_invoice',
    'return_invoice',
    'certificate',
    'customers',
    'customer_greetings',
    'promotions',
    'promotions_whatsapp',
    'facebook_promotions',
  ];
  const effectivePage =
    currentUser.role === 'user' && !userAllowedPages.includes(activePage)
      ? 'invoice'
      : activePage;

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        settings={settings}
        activePage={effectivePage}
        onNavigate={(page) => setActivePage(page)}
        onLogout={handleLogout}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isSidebarOpen={isSidebarOpen}
        onOpenBarcodeScanner={() => setIsBarcodeScannerOpen(true)}
        onOpenMultiDevice={() => setIsMultiDeviceModalOpen(true)}
        lowStockCount={products.filter((p) => p.stockQuantity <= ((p as any).minStockThreshold || 2)).length}
        pendingWorkshopCount={orders.filter((o) => o.status !== 'Completed' && o.status !== 'Delivered to Customer').length}
      />

      {/* Body Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Role-Gated Left Overview Sidebar */}
        <Sidebar
          currentUser={currentUser}
          activePage={effectivePage}
          onNavigate={(page) => setActivePage(page)}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Workspace Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-slate-950 via-slate-900/60 to-slate-950">
          <div className="max-w-7xl mx-auto space-y-6">
            {effectivePage === 'dashboard' && (
              <DashboardView
                invoices={invoices}
                products={products}
                orders={orders}
                customers={customers}
                settings={settings}
                currentUser={currentUser}
                onNavigate={(page) => setActivePage(page)}
                onOpenInvoicePrint={handleOpenInvoicePrint}
              />
            )}

            {(effectivePage === 'inventory' || effectivePage === 'products') && (
              <InventoryView
                products={products}
                settings={settings}
                onRefresh={handleRefreshData}
                onOpenBarcodeScanner={() => setIsBarcodeScannerOpen(true)}
              />
            )}

            {(effectivePage === 'invoice' || effectivePage === 'return_invoice') && (
              <InvoiceView
                products={products}
                customers={customers}
                invoices={invoices}
                settings={settings}
                currentUser={currentUser}
                onRefresh={handleRefreshData}
                onOpenBarcodeScanner={() => setIsBarcodeScannerOpen(true)}
                onOpenCertificateForInvoice={handleOpenCertificateForInvoice}
                initialPrintInvoice={invoiceToPrint}
                onClearInitialPrint={() => setInvoiceToPrint(null)}
              />
            )}

            {effectivePage === 'certificate' && (
              <CertificateView
                certificates={certificates}
                invoices={invoices}
                products={products}
                settings={settings}
                currentUser={currentUser}
                onRefresh={handleRefreshData}
                preselectedInvoice={certificateInvoiceRef}
              />
            )}

            {(effectivePage === 'workshop' ||
              effectivePage === 'workshops' ||
              effectivePage === 'workshop_employees' ||
              effectivePage === 'workshop_advances' ||
              effectivePage === 'create_order' ||
              effectivePage === 'pending_orders' ||
              effectivePage === 'completed_orders' ||
              effectivePage === 'cancelled_orders' ||
              effectivePage === 'add_workman' ||
              effectivePage === 'workman_payment_invoice' ||
              effectivePage === 'advance_payment_add' ||
              effectivePage === 'balance_pay_add') && (
              <WorkshopView
                workshops={workshops}
                orders={orders}
                customers={customers}
                settings={settings}
                currentUser={currentUser}
                onRefresh={handleRefreshData}
                initialAction={
                  effectivePage === 'add_workman'
                    ? 'add_workman'
                    : effectivePage === 'workman_payment_invoice'
                    ? 'workman_payment_invoice'
                    : effectivePage === 'advance_payment_add'
                    ? 'advance_payment_add'
                    : effectivePage === 'balance_pay_add'
                    ? 'balance_pay_add'
                    : undefined
                }
                initialTab={
                  effectivePage === 'create_order'
                    ? 'create_order'
                    : effectivePage === 'pending_orders'
                    ? 'pending_orders'
                    : effectivePage === 'completed_orders'
                    ? 'completed_orders'
                    : effectivePage === 'cancelled_orders'
                    ? 'cancelled_orders'
                    : effectivePage === 'workshop_advances' || effectivePage === 'advance_payment_add'
                    ? 'workshop_advances'
                    : effectivePage === 'workshops'
                    ? 'workshops'
                    : effectivePage === 'workshop_employees' || effectivePage === 'add_workman'
                    ? 'workmen'
                    : effectivePage === 'workman_payment_invoice'
                    ? 'workman_payments'
                    : 'orders'
                }
              />
            )}

            {effectivePage === 'customers' && (
              <CustomersView
                customers={customers}
                invoices={invoices}
                settings={settings}
                onRefresh={handleRefreshData}
                onOpenInvoicePrint={handleOpenInvoicePrint}
              />
            )}

            {(effectivePage === 'purchases' ||
              effectivePage === 'purchase_orders' ||
              effectivePage === 'purchase_returns') && (
              <PurchasesFinanceView
                products={products}
                settings={settings}
                currentUser={currentUser}
                initialTab={effectivePage === 'purchase_returns' ? 'returns' : 'orders'}
                onRefreshProducts={handleRefreshData}
              />
            )}

            {effectivePage === 'reports' && (
              <ReportsView
                invoices={invoices}
                products={products}
                orders={orders}
                customers={customers}
                settings={settings}
              />
            )}

            {(effectivePage === 'promotions' ||
              effectivePage === 'promotions_whatsapp' ||
              effectivePage === 'facebook_promotions') && (
              <PromotionsView
                customers={customers}
                products={products}
                settings={settings}
              />
            )}

            {effectivePage === 'customer_greetings' && (
              <CustomerGreetingsStudio
                customers={customers}
                settings={settings}
                currentUser={currentUser}
              />
            )}

            {(effectivePage === 'staff_passwords' || effectivePage === 'users') && (
              <StaffPasswordsView
                currentUser={currentUser}
                settings={settings}
                onRefresh={handleRefreshData}
              />
            )}

            {effectivePage === 'backup_restore' && (
              <BackupRestoreView
                settings={settings}
                currentUser={currentUser}
                onRefreshAllData={handleRefreshData}
              />
            )}

            {effectivePage === 'mongodb_architecture' && (
              <MongoArchitectureView
                settings={settings}
                currentUser={currentUser}
              />
            )}

            {effectivePage === 'settings' && (
              <SettingsView
                settings={settings}
                currentUser={currentUser}
                onUpdateSettings={(newSettings) => setSettings(newSettings)}
                onRefreshAllData={handleRefreshData}
              />
            )}
          </div>
        </main>
      </div>

      {/* Universal Barcode Scanner Gun Simulator */}
      <BarcodeScannerModal
        isOpen={isBarcodeScannerOpen}
        onClose={() => setIsBarcodeScannerOpen(false)}
        products={products}
        onScan={handleBarcodeScanned}
        onScanSuccess={(prod) => handleBarcodeScanned(prod.barcode || prod.itemCode)}
      />

      {/* Multi-Device Operation & Sync Modal */}
      <MultiDeviceModal
        isOpen={isMultiDeviceModalOpen}
        onClose={() => setIsMultiDeviceModalOpen(false)}
        onRefresh={handleRefreshData}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
