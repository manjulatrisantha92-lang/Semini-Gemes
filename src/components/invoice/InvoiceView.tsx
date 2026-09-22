import React, { useState, useRef, useEffect } from 'react';
import {
  Receipt,
  Search,
  Barcode,
  Plus,
  Minus,
  Trash2,
  Printer,
  Share2,
  UserPlus,
  RotateCcw,
  Check,
  CheckCircle2,
  AlertCircle,
  Gem,
  CreditCard,
  Banknote,
  Building,
  Coins,
  History,
  Send,
  X,
  Maximize,
  User,
  Users,
  Calendar,
  ArrowRight,
  Diamond,
} from 'lucide-react';
import {
  Invoice,
  InvoiceItem,
  Product,
  Customer,
  PaymentMethod,
  AppSettings,
  User as UserType,
  InvoiceType,
  GoldExchangeDetails,
  ReturnInvoiceDetails,
} from '../../types';
import { StorageService } from '../../services/storage';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';
import { BillPrintModal } from '../common/BillPrintModal';
import { safeOpenExternal, formatWhatsAppNumber } from '../../utils/navigation';

interface InvoiceViewProps {
  products: Product[];
  customers: Customer[];
  invoices: Invoice[];
  settings: AppSettings;
  currentUser: UserType;
  onRefresh: () => void;
  onOpenBarcodeScanner: () => void;
  onOpenCertificateForInvoice?: (invoice: Invoice) => void;
  initialPrintInvoice?: Invoice | null;
  onClearInitialPrint?: () => void;
  initialInvoiceType?: InvoiceType;
}

export const InvoiceView: React.FC<InvoiceViewProps> = ({
  products,
  customers,
  invoices,
  settings,
  currentUser,
  onRefresh,
  onOpenBarcodeScanner,
  onOpenCertificateForInvoice,
  initialPrintInvoice,
  onClearInitialPrint,
  initialInvoiceType = 'standard',
}) => {
  const { showToast } = useToast();

  // POS State
  const [invoiceType, setInvoiceType] = useState<InvoiceType>(initialInvoiceType || 'standard');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [invoiceDate, setInvoiceDate] = useState<string>('2026-09-10');
  const [cartItems, setCartItems] = useState<InvoiceItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [taxPercent, setTaxPercent] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [paymentRef, setPaymentRef] = useState<string>('');
  const [paidAmountLKR, setPaidAmountLKR] = useState<number>(0);
  const [notes, setNotes] = useState<string>('Thank you for purchasing authentic Ceylon gemstones and jewelry.');

  useEffect(() => {
    if (initialInvoiceType) {
      setInvoiceType(initialInvoiceType);
    }
  }, [initialInvoiceType]);

  // Gold Exchange State
  const [exchangeOldDesc, setExchangeOldDesc] = useState('Customer 22K Sovereign Old Jewelry Scrap');
  const [exchangePurity, setExchangePurity] = useState('22K');
  const [exchangeGrossWeight, setExchangeGrossWeight] = useState<number>(8.0);
  const [exchangeWastePercent, setExchangeWastePercent] = useState<number>(2.5);
  const [exchangeRatePerGram, setExchangeRatePerGram] = useState<number>(24500);
  const [exchangeNotes, setExchangeNotes] = useState('Assayed and weighed in customer presence at showroom');

  // Direct Return Invoice Mode State
  const [returnSelectedInvoiceId, setReturnSelectedInvoiceId] = useState<string>('');
  const [returnManualItemName, setReturnManualItemName] = useState('Customer Returned Jewelry Item');
  const [returnManualQty, setReturnManualQty] = useState(1);
  const [returnDirectRefundLKR, setReturnDirectRefundLKR] = useState<number>(0);
  const [returnRefundMethod, setReturnRefundMethod] = useState<PaymentMethod>('Cash');
  const [returnDirectReason, setReturnDirectReason] = useState('Size adjustment / Customer preference');
  const [returnRestockChecked, setReturnRestockChecked] = useState(true);

  // Barcode & Catalog Search State
  const [barcodeInputVal, setBarcodeInputVal] = useState('');
  const [catalogSearchQuery, setCatalogSearchQuery] = useState('');
  const [catalogFilterCategory, setCatalogFilterCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Modals
  const [isQuickAddCustomerOpen, setIsQuickAddCustomerOpen] = useState(false);
  const [isA4PrintModalOpen, setIsA4PrintModalOpen] = useState(false);
  const [printableInvoice, setPrintableInvoice] = useState<Invoice | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Return invoice modal
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnTargetInvoice, setReturnTargetInvoice] = useState<Invoice | null>(null);
  const [returnReason, setReturnReason] = useState('');
  const [refundAmount, setRefundAmount] = useState(0);

  // Optional Printout Controls
  const [autoOpenPrintAfterSave, setAutoOpenPrintAfterSave] = useState(false);
  const [lastSavedInvoice, setLastSavedInvoice] = useState<Invoice | null>(null);

  // Quick Add Customer Fields
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustWhatsapp, setNewCustWhatsapp] = useState('');
  const [newCustNIC, setNewCustNIC] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustCity, setNewCustCity] = useState('Colombo');

  // Handle auto-open print modal if passed via prop
  useEffect(() => {
    if (initialPrintInvoice) {
      setPrintableInvoice(initialPrintInvoice);
      setIsA4PrintModalOpen(true);
      if (onClearInitialPrint) onClearInitialPrint();
    }
  }, [initialPrintInvoice, onClearInitialPrint]);

  // Selected customer object
  const currentCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];

  // Financial Computations & Gold Exchange Allowance
  const exchangeNetWeight = Math.max(
    0,
    Number((exchangeGrossWeight * (1 - exchangeWastePercent / 100)).toFixed(2))
  );
  const exchangeAllowanceLKR =
    invoiceType === 'exchange' ? Math.round(exchangeNetWeight * exchangeRatePerGram) : 0;

  const subtotalLKR = cartItems.reduce((sum, item) => sum + item.totalLKR, 0);
  const discountLKR = Math.round((subtotalLKR * discountPercent) / 100);
  const taxLKR = Math.round(((subtotalLKR - discountLKR) * taxPercent) / 100);
  const rawSubtotalAfterTaxDiscount = Math.max(0, subtotalLKR - discountLKR + taxLKR);

  // Grand Total Net Payable after Exchange Credit
  const grandTotalLKR =
    invoiceType === 'exchange'
      ? Math.max(0, rawSubtotalAfterTaxDiscount - exchangeAllowanceLKR)
      : rawSubtotalAfterTaxDiscount;

  // Customer Cash/Credit Payout Due if trade-in gold exceeds purchased items
  const customerPayoutDueLKR =
    invoiceType === 'exchange' && exchangeAllowanceLKR > rawSubtotalAfterTaxDiscount
      ? exchangeAllowanceLKR - rawSubtotalAfterTaxDiscount
      : 0;

  const balanceLKR = Math.max(0, grandTotalLKR - paidAmountLKR);

  // Categories for Catalog
  const CATALOG_CATEGORIES = [
    'All',
    'Rings',
    'Necklaces & Pendants',
    'Earrings',
    'Bangles & Bracelets',
    'Chains',
    'Loose Gemstones',
    'Rough Gemstones',
    'Custom Jewelry',
    'Bridal Sets',
    "Men's Jewelry",
  ];

  const filteredCatalogProducts = products.filter((p) => {
    const matchesCat =
      catalogFilterCategory === 'All' ||
      (catalogFilterCategory === 'Rings' && p.category === 'Rings') ||
      (catalogFilterCategory === 'Necklaces & Pendants' &&
        (p.category === 'Necklaces' || p.category === 'Pendants')) ||
      (catalogFilterCategory === 'Earrings' && p.category === 'Earrings') ||
      (catalogFilterCategory === 'Bangles & Bracelets' && p.category === 'Bracelets & Bangles') ||
      (catalogFilterCategory === 'Loose Gemstones' && p.category === 'Loose Gemstones') ||
      (catalogFilterCategory === 'Bridal Sets' && p.category === 'Bridal Sets') ||
      (catalogFilterCategory === "Men's Jewelry" && p.category === "Men's Jewelry") ||
      p.category.toLowerCase().includes(catalogFilterCategory.toLowerCase());

    const q = catalogSearchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.itemCode.toLowerCase().includes(q) ||
      p.gemstoneType.toLowerCase().includes(q) ||
      (p.goldPurity && p.goldPurity.toLowerCase().includes(q));

    return matchesCat && matchesSearch;
  });

  // Toggle Fullscreen
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Barcode / Item Code Scanner Submit
  const handleScanBarcodeSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = barcodeInputVal.trim().toLowerCase();
    if (!query) return;

    const match = products.find(
      (p) =>
        p.barcode.toLowerCase() === query ||
        p.itemCode.toLowerCase() === query ||
        p.name.toLowerCase().includes(query)
    );

    if (match) {
      handleAddToCart(match);
      setBarcodeInputVal('');
    } else {
      showToast(`No product found for code "${barcodeInputVal}"`, 'error');
    }
  };

  // Update paid amount automatically to grand total unless user changed it
  useEffect(() => {
    setPaidAmountLKR(grandTotalLKR);
  }, [grandTotalLKR]);

  // Handle Search Input (Barcode or Name or Code)
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const q = query.trim().toLowerCase();
    const matches = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.itemCode.toLowerCase().includes(q) ||
        p.barcode.toLowerCase().includes(q) ||
        p.gemstoneType.toLowerCase().includes(q)
    );
    setSearchResults(matches);
  };

  // Add Product to Cart
  const handleAddToCart = (product: Product) => {
    if (product.stockQuantity <= 0) {
      showToast(`Warning: "${product.name}" has 0 stock in showroom.`, 'error');
    }

    setCartItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                totalLKR: (item.quantity + 1) * item.unitPriceLKR - item.discountLKR,
              }
            : item
        );
      }
      const newItem: InvoiceItem = {
        productId: product.id,
        itemCode: product.itemCode,
        name: product.name,
        category: product.category,
        imageUrl: product.imageUrl || undefined,
        gemstoneType: product.gemstoneType,
        weightGrams: product.grossWeightGrams,
        unitPriceLKR: product.sellingPriceLKR,
        quantity: 1,
        discountLKR: 0,
        totalLKR: product.sellingPriceLKR,
      };
      return [...prev, newItem];
    });

    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
    showToast(`Added "${product.name}" to invoice`, 'success');
  };

  // Stepper Qty
  const handleUpdateQty = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: newQty,
              totalLKR: newQty * item.unitPriceLKR - item.discountLKR,
            }
          : item
      )
    );
  };

  // Update Line Discount
  const handleUpdateLineDiscount = (productId: string, discount: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? {
              ...item,
              discountLKR: discount,
              totalLKR: Math.max(0, item.quantity * item.unitPriceLKR - discount),
            }
          : item
      )
    );
  };

  // Remove Item
  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  // Cancel / Clear Active Invoice
  const handleCancelInvoice = () => {
    setCartItems([]);
    setDiscountPercent(0);
    setSearchQuery('');
    setBarcodeInputVal('');
    setNotes('');
    setPaymentRef('');
    showToast('Invoice checkout cleared / cancelled.', 'info');
  };

  // Save / Process Invoice
  const handleSaveInvoice = (andPrint = false, andShareWhatsApp = false) => {
    if (cartItems.length === 0) {
      showToast('Cannot save empty invoice. Add items first.', 'error');
      return;
    }
    if (!currentCustomer) {
      showToast('Please select or add a customer.', 'error');
      return;
    }

    const autoInvoiceNo = StorageService.generateNextInvoiceNumber();
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: autoInvoiceNo,
      invoiceType,
      date: new Date().toLocaleString('en-GB', {
        dateStyle: 'short',
        timeStyle: 'short',
      }),
      customerId: currentCustomer.id,
      customerName: currentCustomer.name,
      customerPhone: currentCustomer.phone,
      customerAddress: `${currentCustomer.address}, ${currentCustomer.city}`,
      items: cartItems,
      subtotalLKR,
      discountLKR,
      taxLKR,
      grandTotalLKR,
      paidAmountLKR: invoiceType === 'exchange' ? Math.min(paidAmountLKR, grandTotalLKR) : paidAmountLKR,
      balanceLKR,
      paymentMethod,
      paymentStatus: balanceLKR === 0 ? 'paid' : paidAmountLKR > 0 ? 'partial' : 'due',
      cashierName: currentUser.name,
      cashierId: currentUser.id,
      notes:
        invoiceType === 'exchange'
          ? `${notes} | Old Gold Trade-In: ${exchangeGrossWeight}g (${exchangePurity}) credited @ Rs. ${exchangeRatePerGram}/g (-${StorageService.formatLKR(exchangeAllowanceLKR)})`
          : notes,
      exchangeAllowanceLKR: invoiceType === 'exchange' ? exchangeAllowanceLKR : undefined,
      exchangeDetails:
        invoiceType === 'exchange'
          ? {
              oldGoldDescription: exchangeOldDesc,
              goldPurity: exchangePurity,
              grossWeightGrams: exchangeGrossWeight,
              wasteDeductionPercent: exchangeWastePercent,
              netWeightGrams: exchangeNetWeight,
              goldMarketRatePerGramLKR: exchangeRatePerGram,
              totalExchangeAllowanceLKR: exchangeAllowanceLKR,
              notes: exchangeNotes,
            }
          : undefined,
    };

    StorageService.addInvoice(newInvoice);
    setLastSavedInvoice(newInvoice);
    showToast(
      `${invoiceType === 'exchange' ? 'Exchange Invoice' : 'Invoice'} ${autoInvoiceNo} saved successfully! ${andPrint ? 'Opening print preview...' : '(Paperless - No printout)'}`,
      'success'
    );
    onRefresh();

    // Open print modal if requested
    if (andPrint || andShareWhatsApp) {
      setPrintableInvoice(newInvoice);
      setIsA4PrintModalOpen(true);
    }

    if (andShareWhatsApp) {
      handleSendWhatsApp(newInvoice);
    }

    // Reset Cart
    setCartItems([]);
    setDiscountPercent(0);
  };

  // Direct Return Invoice Save & Process
  const handleSaveReturnInvoice = (andPrint = false, andShareWhatsApp = false) => {
    if (!currentCustomer) {
      showToast('Please select a customer for this return.', 'error');
      return;
    }

    const returnEffectiveTotal =
      returnDirectRefundLKR > 0
        ? returnDirectRefundLKR
        : cartItems.reduce((s, it) => s + it.totalLKR, 0);

    if (returnEffectiveTotal <= 0 && cartItems.length === 0) {
      showToast('Please enter a refund amount or add items to return.', 'error');
      return;
    }

    const returnInvoiceNo = `RET-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`;
    const returnInvoice: Invoice = {
      id: `inv-ret-${Date.now()}`,
      invoiceNumber: returnInvoiceNo,
      invoiceType: 'return',
      isReturned: true,
      returnReason: returnDirectReason,
      refundAmountLKR: returnEffectiveTotal,
      date: new Date().toLocaleString('en-GB', {
        dateStyle: 'short',
        timeStyle: 'short',
      }),
      customerId: currentCustomer.id,
      customerName: currentCustomer.name,
      customerPhone: currentCustomer.phone,
      customerAddress: `${currentCustomer.address}, ${currentCustomer.city}`,
      items:
        cartItems.length > 0
          ? cartItems
          : [
              {
                productId: 'ret-manual',
                itemCode: 'WCS-RET',
                name: returnManualItemName,
                category: 'General',
                quantity: returnManualQty,
                unitPriceLKR: returnEffectiveTotal,
                discountLKR: 0,
                totalLKR: returnEffectiveTotal,
              },
            ],
      subtotalLKR: returnEffectiveTotal,
      discountLKR: 0,
      taxLKR: 0,
      grandTotalLKR: -returnEffectiveTotal,
      paidAmountLKR: returnEffectiveTotal,
      balanceLKR: 0,
      paymentMethod: returnRefundMethod,
      paymentStatus: 'paid',
      cashierName: currentUser.name,
      cashierId: currentUser.id,
      notes: `Official Customer Return. Reason: ${returnDirectReason}. Refund via ${returnRefundMethod}.`,
      returnDetails: {
        originalInvoiceId: returnSelectedInvoiceId || undefined,
        originalInvoiceNumber:
          invoices.find((i) => i.id === returnSelectedInvoiceId)?.invoiceNumber || undefined,
        returnReason: returnDirectReason,
        refundMethod: returnRefundMethod as any,
        totalRefundLKR: returnEffectiveTotal,
        restocked: returnRestockChecked,
      },
    };

    // If restock checked and cart has product IDs, increment stock in storage
    if (returnRestockChecked && cartItems.length > 0) {
      cartItems.forEach((ci) => {
        const prod = products.find((p) => p.id === ci.productId);
        if (prod) {
          StorageService.updateStock(prod.id, ci.quantity);
        }
      });
    }

    StorageService.addInvoice(returnInvoice);
    setLastSavedInvoice(returnInvoice);
    showToast(
      `Return Invoice & Credit Note ${returnInvoiceNo} processed! ${andPrint ? 'Opening print preview...' : '(Paperless - No printout)'}`,
      'success'
    );
    onRefresh();

    // Open print modal if requested
    if (andPrint || andShareWhatsApp) {
      setPrintableInvoice(returnInvoice);
      setIsA4PrintModalOpen(true);
    }

    if (andShareWhatsApp) {
      handleSendWhatsApp(returnInvoice);
    }

    setCartItems([]);
    setReturnDirectRefundLKR(0);
  };

  // Global F8 Shortcut for Pay & Print Bill
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input or textarea
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
        if (cartItems.length > 0 || invoiceType === 'return') {
          if (invoiceType === 'return') {
            handleSaveReturnInvoice(true, false);
          } else {
            handleSaveInvoice(true, false);
          }
        } else {
          showToast('Cart is empty. Add products before printing bill.', 'error');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    cartItems,
    currentCustomer,
    invoiceType,
    subtotalLKR,
    discountLKR,
    taxLKR,
    grandTotalLKR,
    paidAmountLKR,
    balanceLKR,
    paymentMethod,
    paymentRef,
    notes,
    exchangeAllowanceLKR,
    returnDirectRefundLKR,
    returnDirectReason,
    returnRefundMethod,
    returnManualItemName,
    returnManualQty,
    returnRestockChecked,
    returnSelectedInvoiceId,
  ]);

  // Quick Add Customer Submit
  const handleQuickAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim() || !newCustPhone.trim()) return;

    const formattedWhatsapp = newCustWhatsapp.trim()
      ? newCustWhatsapp.replace(/\D/g, '')
      : newCustPhone.replace(/\D/g, '');

    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name: newCustName.trim(),
      phone: newCustPhone.trim(),
      whatsapp: formattedWhatsapp,
      nicPassport: newCustNIC.trim(),
      address: newCustAddress.trim(),
      city: newCustCity.trim(),
      totalSpentLKR: 0,
      invoiceCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };

    StorageService.addCustomer(newCust);
    setSelectedCustomerId(newCust.id);
    setIsQuickAddCustomerOpen(false);
    showToast(`Customer "${newCust.name}" registered!`, 'success');
    onRefresh();

    // Reset
    setNewCustName('');
    setNewCustPhone('');
    setNewCustWhatsapp('');
    setNewCustNIC('');
    setNewCustAddress('');
  };

  // Send WhatsApp Invoice Message
  const handleSendWhatsApp = (invoice: Invoice) => {
    const fullPhone = formatWhatsAppNumber(invoice.customerPhone || '');
    const itemsSummary = invoice.items
      .map(
        (it, idx) =>
          `${idx + 1}. *${it.name}* (Code: ${it.itemCode})\n   Qty: ${it.quantity} | Total: ${StorageService.formatLKR(it.totalLKR)}`
      )
      .join('\n');

    const message = `*${settings.companyName.toUpperCase()}*\n_Official Purchase Invoice & Guarantee_\n\n*Invoice No:* ${invoice.invoiceNumber}\n*Date:* ${invoice.date}\n*Customer:* ${invoice.customerName}\n\n*Purchased Items:*\n${itemsSummary}\n\n*Subtotal:* ${StorageService.formatLKR(invoice.subtotalLKR)}\n*Discount:* ${StorageService.formatLKR(invoice.discountLKR)}\n*Grand Total:* *${StorageService.formatLKR(invoice.grandTotalLKR)}*\n*Payment Method:* ${invoice.paymentMethod}\n*Payment Status:* ${invoice.paymentStatus.toUpperCase()}\n\n_Thank you for purchasing Ceylon natural gemstones and fine jewelry with us._\n*Hotline / WhatsApp:* ${settings.telephone}\n*Address:* ${settings.companyAddress}`;

    const url = `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
    safeOpenExternal(url);
    showToast(`Opening WhatsApp for ${invoice.customerName}...`, 'info');
  };

  // Process Return Invoice
  const handleProcessReturn = (e: React.FormEvent, andPrint = false) => {
    e.preventDefault();
    if (!returnTargetInvoice) return;

    StorageService.returnInvoice(returnTargetInvoice.id, returnReason, refundAmount);
    showToast(`Invoice ${returnTargetInvoice.invoiceNumber} returned & items restocked.`, 'info');
    setIsReturnModalOpen(false);

    if (andPrint || autoOpenPrintAfterSave) {
      const updatedInv = StorageService.getInvoices().find((i) => i.id === returnTargetInvoice.id) || returnTargetInvoice;
      setPrintableInvoice({ ...updatedInv, isReturned: true, refundAmountLKR: refundAmount, returnReason });
      setIsA4PrintModalOpen(true);
    }

    setReturnTargetInvoice(null);
    onRefresh();
  };

  return (
    <div className="space-y-4">
      {/* Optional Last Saved Invoice Floating Banner */}
      {lastSavedInvoice && (
        <div className="p-3 bg-emerald-950/50 border border-emerald-500/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-200 shadow-lg animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Invoice <strong className="font-mono text-white tracking-wide">{lastSavedInvoice.invoiceNumber}</strong> saved successfully! Customer: <strong className="text-white">{lastSavedInvoice.customerName}</strong> (Rs. {StorageService.formatLKR(lastSavedInvoice.grandTotalLKR)})
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setPrintableInvoice(lastSavedInvoice);
                setIsA4PrintModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Bill (Optional)</span>
            </button>
            <button
              type="button"
              onClick={() => handleSendWhatsApp(lastSavedInvoice)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/40 hover:bg-emerald-600/60 text-emerald-200 border border-emerald-500/40 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
            <button
              type="button"
              onClick={() => setLastSavedInvoice(null)}
              className="p-1 text-slate-400 hover:text-white rounded"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Top POS Action & Scanning Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center gap-3 shadow-md">
        {/* Yellow-tinted Barcode / Item Code Scanner Input */}
        <form
          onSubmit={handleScanBarcodeSubmit}
          className="flex-1 flex items-center bg-[#242111] border-2 border-amber-500/80 rounded-lg overflow-hidden focus-within:border-amber-400 shadow-inner"
        >
          <div className="pl-3 pr-2 text-amber-400 shrink-0">
            <Barcode className="w-5 h-5" />
          </div>
          <input
            ref={barcodeInputRef}
            type="text"
            placeholder="Scan barcode or enter item code (Press Enter)..."
            value={barcodeInputVal}
            onChange={(e) => setBarcodeInputVal(e.target.value)}
            className="w-full bg-transparent py-2.5 px-2 text-xs sm:text-sm text-amber-100 placeholder-amber-400/60 font-mono focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 font-bold text-xs shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Scan / Add</span>
          </button>
        </form>

        {/* Filter Catalog Items Input */}
        <div className="relative md:w-64 shrink-0">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Filter catalog items..."
            value={catalogSearchQuery}
            onChange={(e) => setCatalogSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Maximize className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Fullscreen</span>
          </button>
          <button
            type="button"
            onClick={() => setIsHistoryModalOpen(true)}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <History className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Reprint Invoices ({invoices.length})</span>
          </button>
        </div>
      </div>

      {/* POS Invoice Mode Selector Bar (Standard Sales, Gold Exchange Trade-In, Return Invoice) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2 flex flex-wrap items-center justify-between gap-2 shadow-md">
        <div className="flex items-center gap-1.5 flex-1 min-w-[320px]">
          <button
            type="button"
            onClick={() => setInvoiceType('standard')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              invoiceType === 'standard'
                ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Standard Sales Invoice</span>
          </button>

          <button
            type="button"
            onClick={() => setInvoiceType('exchange')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              invoiceType === 'exchange'
                ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <RotateCcw className="w-4 h-4 text-emerald-700" />
            <span>Old Gold Exchange (Trade-In)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/30 text-slate-950 font-mono font-bold">
              Trade-In
            </span>
          </button>

          <button
            type="button"
            onClick={() => setInvoiceType('return')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              invoiceType === 'return'
                ? 'bg-rose-600 text-white shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <RotateCcw className="w-4 h-4 text-rose-300" />
            <span>Return Invoice & Credit</span>
          </button>
        </div>

        <div className="px-3 py-1 bg-slate-950/80 border border-slate-800 rounded-lg text-[11px] font-mono text-slate-400 flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full animate-pulse ${
              invoiceType === 'return' ? 'bg-rose-400' : 'bg-emerald-400'
            }`}
          ></span>
          <span>
            Mode:{' '}
            <strong
              className={`uppercase ${
                invoiceType === 'return' ? 'text-rose-400' : 'text-amber-300'
              }`}
            >
              {invoiceType}
            </strong>
          </span>
        </div>
      </div>

      {/* Main 2-Column POS Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Customer & Invoice Details (5 Cols on Large Screen) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Customer & Invoice Date Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3.5 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
                <Users className="w-4 h-4 text-amber-400" />
                <span>CUSTOMER & INVOICE DETAILS</span>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickAddCustomerOpen(true)}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Customer</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Select Customer *
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-100 font-medium focus:border-amber-500 focus:outline-none"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone}) [VIP]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Invoice Date *
                </label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-100 font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Selected Customer Detail Box */}
            {currentCustomer && (
              <div className="bg-[#121724] border border-slate-800 rounded-lg p-3 flex items-start justify-between">
                <div className="space-y-0.5 text-xs">
                  <div className="font-bold text-slate-100">{currentCustomer.name}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{currentCustomer.phone}</div>
                  <div className="text-[11px] text-slate-400">
                    {currentCustomer.address}, {currentCustomer.city}
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase rounded">
                  VIP
                </span>
              </div>
            )}
          </div>

          {/* DEDICATED OLD GOLD EXCHANGE / TRADE-IN SECTION (Visible in Exchange mode) */}
          {invoiceType === 'exchange' && (
            <div className="bg-amber-950/20 border-2 border-amber-500/60 rounded-xl p-4 space-y-3 shadow-lg">
              <div className="flex items-center justify-between pb-2 border-b border-amber-500/30">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-400 text-slate-950 font-black">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-amber-300 uppercase tracking-wider">
                      Old Gold Exchange & Trade-In Calculator
                    </h3>
                    <p className="text-[10px] text-amber-200/70">
                      Assay customer scrap gold & credit against new purchase
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded">
                  Trade-In
                </span>
              </div>

              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Old Gold / Scrap Item Description *
                  </label>
                  <input
                    type="text"
                    value={exchangeOldDesc}
                    onChange={(e) => setExchangeOldDesc(e.target.value)}
                    placeholder="e.g. 22K Old Sovereign Necklace & Bangle Scrap"
                    className="w-full bg-slate-950 border border-amber-500/40 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Gold Purity / Karat *
                    </label>
                    <select
                      value={exchangePurity}
                      onChange={(e) => {
                        const p = e.target.value;
                        setExchangePurity(p);
                        if (p === '24K') setExchangeRatePerGram(26800);
                        else if (p === '22K') setExchangeRatePerGram(24500);
                        else if (p === '18K') setExchangeRatePerGram(20200);
                        else if (p === '14K') setExchangeRatePerGram(15500);
                        else if (p === '925 Silver') setExchangeRatePerGram(320);
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-bold focus:outline-none focus:border-amber-400"
                    >
                      <option value="24K">24K (Pure Gold - 99.9%)</option>
                      <option value="22K">22K (Sovereign Gold - 91.6%)</option>
                      <option value="18K">18K (Fine Gold - 75.0%)</option>
                      <option value="14K">14K (Standard - 58.5%)</option>
                      <option value="925 Silver">925 Sterling Silver</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Gross Weight (Grams) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={exchangeGrossWeight}
                      onChange={(e) => setExchangeGrossWeight(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-amber-200 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Melt / Wastage Loss (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="20"
                      value={exchangeWastePercent}
                      onChange={(e) => setExchangeWastePercent(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Buying Rate / Gram (LKR) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={exchangeRatePerGram}
                      onChange={(e) => setExchangeRatePerGram(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Net Assayed Weight & Total Allowance Credit Box */}
                <div className="p-3 bg-slate-950/90 border border-amber-500/40 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase">Net Assayed Gold Weight:</div>
                    <div className="text-sm font-bold font-mono text-slate-200">
                      {exchangeNetWeight.toFixed(2)} g
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-emerald-400 uppercase font-bold">
                      Trade-In Allowance Credit:
                    </div>
                    <div className="text-base font-black font-mono text-emerald-400">
                      - {StorageService.formatLKR(exchangeAllowanceLKR)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DEDICATED RETURN INVOICE & RESTOCK PROCESSING CARD (Visible in Return mode) */}
          {invoiceType === 'return' && (
            <div className="bg-rose-950/20 border-2 border-rose-500/60 rounded-xl p-4 space-y-3 shadow-lg">
              <div className="flex items-center justify-between pb-2 border-b border-rose-500/30">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-rose-600 text-white font-black">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-rose-300 uppercase tracking-wider">
                      Process Customer Return & Credit Note
                    </h3>
                    <p className="text-[10px] text-rose-200/70">
                      Accept customer returned jewelry, restock items & issue credit/refund
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 bg-rose-500/20 border border-rose-500/40 text-rose-300 rounded">
                  Return
                </span>
              </div>

              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Select Original Sales Invoice (Optional)
                  </label>
                  <select
                    value={returnSelectedInvoiceId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setReturnSelectedInvoiceId(id);
                      const inv = invoices.find((i) => i.id === id);
                      if (inv) {
                        setSelectedCustomerId(inv.customerId);
                        setReturnDirectRefundLKR(inv.grandTotalLKR);
                        if (inv.items.length > 0) {
                          setCartItems(inv.items);
                        }
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-rose-400"
                  >
                    <option value="">-- Manual Return / Walk-in Customer --</option>
                    {invoices.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.invoiceNumber} - {inv.customerName} ({StorageService.formatLKR(inv.grandTotalLKR)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Returned Item Description *
                  </label>
                  <input
                    type="text"
                    value={returnManualItemName}
                    onChange={(e) => setReturnManualItemName(e.target.value)}
                    placeholder="e.g. Ceylon Blue Sapphire 18K White Gold Ring"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-rose-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Refund Amount (LKR) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={returnDirectRefundLKR}
                      onChange={(e) => setReturnDirectRefundLKR(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-rose-400 focus:outline-none focus:border-rose-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Refund Method *
                    </label>
                    <select
                      value={returnRefundMethod}
                      onChange={(e) => setReturnRefundMethod(e.target.value as PaymentMethod)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-rose-400"
                    >
                      <option value="Cash">Cash Refund</option>
                      <option value="Bank Transfer">Bank Wire Transfer</option>
                      <option value="Credit Card">Card Reversal</option>
                      <option value="Cheque">Store Credit Voucher / Cheque</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Reason for Return *
                  </label>
                  <input
                    type="text"
                    value={returnDirectReason}
                    onChange={(e) => setReturnDirectReason(e.target.value)}
                    placeholder="e.g. Ring sizing adjustment, gem upgrade, customer exchange request"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-rose-400"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="returnRestockToggle"
                    checked={returnRestockChecked}
                    onChange={(e) => setReturnRestockChecked(e.target.checked)}
                    className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
                  />
                  <label htmlFor="returnRestockToggle" className="text-xs text-slate-300 cursor-pointer">
                    Automatically restock returned items into showroom inventory
                  </label>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => handleSaveReturnInvoice(true)}
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-bold rounded-lg text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Save & Print Return Note</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveReturnInvoice(false)}
                    className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-xs border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Save Only (No Print)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Invoice Line Items Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-md">
            <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                INVOICE LINE ITEMS ({cartItems.length})
              </span>
              {cartItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCartItems([])}
                  className="text-[11px] text-rose-400 hover:text-rose-300 font-medium"
                >
                  Clear All
                </button>
              )}
            </div>

            {cartItems.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center min-h-[160px]">
                <div className="w-12 h-12 rounded-full border border-slate-700/80 flex items-center justify-center text-slate-500 mb-3 bg-slate-950/40">
                  <Diamond className="w-6 h-6 stroke-[1.5] text-slate-500" />
                </div>
                <p className="text-xs font-semibold text-slate-300">Invoice is currently empty</p>
                <p className="text-[11px] text-slate-500 max-w-xs mt-1">
                  Scan a barcode above or click items from the inventory catalog on the right.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/40 text-[10px] uppercase font-mono text-slate-400 border-b border-slate-800 sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">Item</th>
                      <th className="py-2.5 px-2 text-right">Price</th>
                      <th className="py-2.5 px-2 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                      <th className="py-2.5 px-2 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {cartItems.map((item) => (
                      <tr key={item.productId} className="hover:bg-slate-850/40">
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                referrerPolicy="no-referrer"
                                className="w-6 h-6 rounded object-cover border border-slate-700/80 bg-slate-950 shrink-0"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 shrink-0">
                                <Gem className="w-3 h-3 text-slate-400" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-200 line-clamp-1">{item.name}</div>
                              <div className="text-[10px] text-amber-400 font-mono">{item.itemCode}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono text-slate-300">
                          {item.unitPriceLKR.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <div className="inline-flex items-center border border-slate-700 rounded bg-slate-950">
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(item.productId, item.quantity - 1)}
                              className="px-1.5 py-0.5 text-slate-400 hover:text-slate-100"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-1.5 text-xs font-mono font-bold text-slate-100">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(item.productId, item.quantity + 1)}
                              className="px-1.5 py-0.5 text-slate-400 hover:text-slate-100"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-300">
                          {item.totalLKR.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.productId)}
                            className="p-1 text-slate-500 hover:text-rose-400"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Payment & Financial Settlement Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3.5 shadow-md">
            <div className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-2">
              Payment & Settlement
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Payment Mode *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-100 font-medium focus:border-amber-500 focus:outline-none"
                >
                  <option value="Cash">Cash (LKR)</option>
                  <option value="Credit/Debit Card">Credit / Debit Card</option>
                  <option value="Bank Transfer">Bank Wire (BOC / Commercial Bank)</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Gold Exchange">Gold Exchange</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Payment Ref / Cheque No
                </label>
                <input
                  type="text"
                  placeholder="e.g. BOC-TXN-0029"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-100 font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2 text-xs pt-1 border-t border-slate-800/80">
              <div className="flex justify-between text-slate-300">
                <span>Items Subtotal:</span>
                <span className="font-mono font-semibold text-slate-200">
                  {StorageService.formatLKR(subtotalLKR)}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span>% Overall Discount (%):</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                  className="w-20 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-right font-mono text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span>Tax Rate (%):</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
                  className="w-20 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-right font-mono text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              {invoiceType === 'exchange' && (
                <div className="flex justify-between items-center py-1 border-y border-amber-500/30 bg-amber-950/20 px-2 rounded text-emerald-400 font-semibold">
                  <span className="flex items-center gap-1">
                    <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Less Old Gold Scrap Trade-In:</span>
                  </span>
                  <span className="font-mono font-bold">
                    - {StorageService.formatLKR(exchangeAllowanceLKR)}
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                <span className="text-sm font-bold text-slate-100">
                  {invoiceType === 'exchange' ? 'Net Balance Payable:' : 'Grand Total:'}
                </span>
                <span className="text-xl font-bold font-mono text-amber-400">
                  {StorageService.formatLKR(grandTotalLKR)}
                </span>
              </div>

              {customerPayoutDueLKR > 0 && (
                <div className="p-2 bg-sky-950/40 border border-sky-800/60 rounded text-sky-300 flex justify-between items-center text-xs">
                  <span className="font-semibold">Cash Payout / Store Credit to Customer:</span>
                  <span className="font-mono font-bold text-sky-200">
                    {StorageService.formatLKR(customerPayoutDueLKR)}
                  </span>
                </div>
              )}
            </div>

            {/* Checkout Action Bar Matching User Reference Screenshot 1:
                [ Cancel ] | [ ✈ PAY & WHATSAPP ] | [ ✓ PAY & PRINT BILL [F8] ] */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="flex items-stretch gap-2">
                {/* Cancel Button */}
                <button
                  type="button"
                  onClick={handleCancelInvoice}
                  className="px-4 py-3 bg-[#111722] hover:bg-[#1a2334] active:bg-[#0c1119] text-slate-300 hover:text-white rounded-xl text-xs sm:text-sm font-bold border border-slate-700/80 transition-all cursor-pointer shadow-sm shrink-0 flex items-center justify-center"
                  title="Cancel and clear invoice"
                >
                  Cancel
                </button>

                {/* PAY & WHATSAPP Button */}
                <button
                  type="button"
                  onClick={() =>
                    invoiceType === 'return'
                      ? handleSaveReturnInvoice(true, true)
                      : handleSaveInvoice(true, true)
                  }
                  disabled={cartItems.length === 0 && invoiceType !== 'return'}
                  className="flex-1 px-3 py-3 bg-[#063b2c] hover:bg-[#074d39] active:bg-[#04281e] text-emerald-400 border border-emerald-500/60 rounded-xl text-xs sm:text-sm font-black tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-950/40 disabled:opacity-50"
                  title="Complete payment and send invoice on WhatsApp"
                >
                  <Send className="w-4 h-4 text-emerald-400 rotate-[-10deg] shrink-0" />
                  <span className="text-center font-black">PAY & WHATSAPP</span>
                </button>

                {/* PAY & PRINT BILL [F8] Button */}
                <button
                  type="button"
                  onClick={() =>
                    invoiceType === 'return'
                      ? handleSaveReturnInvoice(true, false)
                      : handleSaveInvoice(true, false)
                  }
                  disabled={cartItems.length === 0 && invoiceType !== 'return'}
                  className="flex-1 px-4 py-3 bg-[#f59e0b] hover:bg-[#d97706] active:bg-[#b45309] text-slate-950 font-black rounded-xl text-xs sm:text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-950/50 active:scale-98 disabled:opacity-50"
                  title="Complete payment and print invoice bill (Shortcut: F8)"
                >
                  <Check className="w-4 h-4 stroke-[3.5] text-slate-950 shrink-0" />
                  <span className="text-center font-black">PAY & PRINT BILL [F8]</span>
                </button>
              </div>

              {/* Secondary Paperless Quick Option */}
              <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
                <button
                  type="button"
                  onClick={() =>
                    invoiceType === 'return'
                      ? handleSaveReturnInvoice(false, false)
                      : handleSaveInvoice(false, false)
                  }
                  disabled={cartItems.length === 0 && invoiceType !== 'return'}
                  className="hover:text-emerald-400 underline transition-colors cursor-pointer disabled:opacity-40"
                >
                  Save Sale Only (Paperless / No Printout)
                </button>
                <span className="text-[10px] text-slate-500 font-mono">F8 = Quick Print</span>
              </div>
            </div>

              {/* Fast Reprint Access Card for Paperless Checkouts */}
              {lastSavedInvoice && (
                <div className="mt-3 p-2.5 bg-slate-900/90 border border-emerald-500/30 rounded-xl space-y-1 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{lastSavedInvoice.invoiceNumber}</span>
                    </span>
                    <span className="text-[10px] text-emerald-400/90 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      Saved in DB
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-300 pt-0.5">
                    <span>Grand Total: {StorageService.formatLKR(lastSavedInvoice.grandTotalLKR)}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setPrintableInvoice(lastSavedInvoice);
                        setIsA4PrintModalOpen(true);
                      }}
                      className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                    >
                      <Printer className="w-3 h-3" />
                      <span>Print Bill Now</span>
                    </button>
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* Right Column: Jewelry & Gemstone Catalog (7 Cols on Large Screen) */}
        <div className="lg:col-span-7 space-y-3.5">
          {/* Catalog Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
              <Gem className="w-4 h-4 text-amber-400" />
              <span>JEWELRY & GEMSTONE CATALOG ({filteredCatalogProducts.length})</span>
            </div>
            {catalogSearchQuery && (
              <button
                type="button"
                onClick={() => setCatalogSearchQuery('')}
                className="text-[11px] text-amber-400 hover:text-amber-300"
              >
                Clear Search
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
            {CATALOG_CATEGORIES.map((cat) => {
              const isActive = catalogFilterCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCatalogFilterCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 font-bold border-amber-400 shadow-sm'
                      : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-slate-100'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Product Cards Grid (2 Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredCatalogProducts.map((p) => {
              const specPurity = p.goldPurity
                ? p.goldPurity === '18K'
                  ? '18K White Gold (750)'
                  : p.goldPurity === '22K'
                  ? '22K Sri Lankan Gold (916)'
                  : `${p.goldPurity} Gold`
                : 'Not Applicable (Loose Gem)';
              const specGem = `${p.gemstoneType} (${
                p.gemstoneDetails?.carats
                  ? `${p.gemstoneDetails.carats} Cts`
                  : `${p.grossWeightGrams}g`
              })`;

              return (
                <div
                  key={p.id}
                  className="bg-[#121722] border border-[#1e2738] hover:border-amber-500/50 rounded-xl p-3.5 flex flex-col justify-between transition-all duration-200 shadow-md group"
                >
                  <div>
                    {/* Top Row: Code Badge & Category/Stock */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[11px] font-bold">
                        {p.itemCode}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {p.category}
                      </span>
                    </div>

                    {/* Product Image */}
                    <div className="w-full h-36 rounded-lg overflow-hidden bg-slate-950 border border-slate-800/80 relative mb-2.5">
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-slate-900/60 p-3 text-center">
                          <Gem className="w-8 h-8 text-amber-400/50 mb-1" />
                          <span className="text-[11px] font-semibold text-slate-400">Non-Image Product</span>
                          <span className="text-[10px] text-slate-500">Text Only Catalog Item</span>
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-slate-100 text-xs sm:text-sm line-clamp-2 leading-snug">
                      {p.name}
                    </h3>

                    {/* Specs Line */}
                    <p className="text-[11px] text-slate-400 mt-1 truncate">
                      {specPurity} • {specGem}
                    </p>
                  </div>

                  {/* Bottom Bar: Price, Stock, and Add Button */}
                  <div className="pt-3 mt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-amber-400 font-mono text-sm sm:text-base">
                        Rs. {p.sellingPriceLKR.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Stock: {p.stockQuantity}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddToCart(p)}
                      className="w-8 h-8 rounded-lg bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 font-bold flex items-center justify-center transition-transform active:scale-90 shadow-md cursor-pointer"
                      title="Add to invoice"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Add Customer Modal */}
      <Modal
        isOpen={isQuickAddCustomerOpen}
        onClose={() => setIsQuickAddCustomerOpen(false)}
        title="Quick Register Customer"
        subtitle="Capture client name, NIC, address & WhatsApp for invoice delivery"
        maxWidth="md"
      >
        <form onSubmit={handleQuickAddCustomer} className="space-y-3">
          <div>
            <label className="block text-xs text-slate-300 uppercase font-semibold mb-1">
              Customer Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Priyantha Dissanayake"
              value={newCustName}
              onChange={(e) => setNewCustName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-300 uppercase font-semibold mb-1">
                Phone Number *
              </label>
              <input
                type="text"
                required
                placeholder="+94 77 123 4567"
                value={newCustPhone}
                onChange={(e) => setNewCustPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 uppercase font-semibold mb-1">
                WhatsApp Number
              </label>
              <input
                type="text"
                placeholder="0771234567"
                value={newCustWhatsapp}
                onChange={(e) => setNewCustWhatsapp(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-300 uppercase font-semibold mb-1">
                NIC / Passport No
              </label>
              <input
                type="text"
                placeholder="e.g. 841240891V"
                value={newCustNIC}
                onChange={(e) => setNewCustNIC(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 uppercase font-semibold mb-1">City</label>
              <input
                type="text"
                value={newCustCity}
                onChange={(e) => setNewCustCity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-300 uppercase font-semibold mb-1">Address</label>
            <input
              type="text"
              placeholder="e.g. No. 45, Temple Road"
              value={newCustAddress}
              onChange={(e) => setNewCustAddress(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsQuickAddCustomerOpen(false)}
              className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-xs"
            >
              Save Customer
            </button>
          </div>
        </form>
      </Modal>

      {/* Universal A4 / 80mm Printable Sales Bill Modal Matching Reference Screenshot */}
      <BillPrintModal
        isOpen={isA4PrintModalOpen && !!printableInvoice}
        onClose={() => setIsA4PrintModalOpen(false)}
        settings={settings}
        mode="invoice"
        invoice={printableInvoice}
      />

      {/* Invoice History & Reprint Modal */}
      {isHistoryModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsHistoryModalOpen(false)}
          title="Reprint Past Sales Invoices"
          subtitle="Search past customer orders, reprint A4, issue certificate or process return"
          maxWidth="4xl"
        >
          <div className="space-y-3">
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-[10px] uppercase font-mono text-slate-400 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Invoice No</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-2">Method</th>
                    <th className="py-2.5 px-3 text-right">Total (LKR)</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-800/40">
                      <td className="py-2 px-3">
                        <div className="font-mono font-bold text-amber-300">
                          {inv.invoiceNumber}
                        </div>
                        {inv.workOrderNumber && (
                          <div className="text-[10px] text-amber-400/90 font-mono font-semibold">
                            Job: {inv.workOrderNumber}
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-3 text-slate-400">{inv.date}</td>
                      <td className="py-2 px-3 font-medium text-slate-200">{inv.customerName}</td>
                      <td className="py-2 px-2 text-slate-400">{inv.paymentMethod}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-100">
                        <div>{StorageService.formatLKR(inv.grandTotalLKR)}</div>
                        {inv.balanceLKR !== undefined && inv.balanceLKR > 0 && (
                          <div className="text-[10px] text-rose-400 font-normal">
                            Bal: {StorageService.formatLKR(inv.balanceLKR)}
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-3 text-center">
                        {inv.isReturned ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                            Returned
                          </span>
                        ) : inv.paymentStatus === 'partial' || (inv.balanceLKR && inv.balanceLKR > 0) ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            Partial / Advance
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            Paid
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setPrintableInvoice(inv);
                              setIsA4PrintModalOpen(true);
                            }}
                            className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded"
                            title="Reprint A4"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleSendWhatsApp(inv)}
                            className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded"
                            title="Send WhatsApp"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                          {!inv.isReturned && (
                            <button
                              onClick={() => {
                                setReturnTargetInvoice(inv);
                                setRefundAmount(inv.grandTotalLKR);
                                setIsReturnModalOpen(true);
                              }}
                              className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded"
                              title="Return Invoice & Restock"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Modal>
      )}

      {/* Return Invoice Dialog */}
      {isReturnModalOpen && returnTargetInvoice && (
        <Modal
          isOpen={true}
          onClose={() => setIsReturnModalOpen(false)}
          title={`Process Return for ${returnTargetInvoice.invoiceNumber}`}
          subtitle="Return items into inventory stock and record refund amount"
          maxWidth="md"
        >
          <form onSubmit={handleProcessReturn} className="space-y-4">
            <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-lg text-xs space-y-1">
              <div className="font-bold text-rose-200">Return Notice:</div>
              <p className="text-slate-300">
                Processing this return will automatically restore {returnTargetInvoice.items.length}{' '}
                item(s) back into showroom inventory stock.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Reason for Return *
              </label>
              <textarea
                required
                rows={2}
                placeholder="e.g. Ring resizing exchange, stone upgrade, customer preference..."
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Refund / Credit Amount (LKR)
              </label>
              <input
                type="number"
                required
                value={refundAmount}
                onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono font-bold"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsReturnModalOpen(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={(e) => handleProcessReturn(e, false)}
                className="px-3.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-100 font-bold rounded text-xs transition-colors"
              >
                Confirm Return (No Printout)
              </button>
              <button
                type="submit"
                onClick={(e) => handleProcessReturn(e, true)}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Confirm & Print Receipt</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
