export type UserRole = 'admin' | 'owner' | 'user';

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: UserRole;
  email: string;
  phone: string;
  avatarUrl?: string;
  createdAt: string;
  lastLogin?: string;
}

export type GemstoneType =
  | 'Blue Sapphire (Ceylon)'
  | 'Padparadscha Sapphire'
  | 'Yellow Sapphire'
  | 'Star Sapphire'
  | 'Ruby'
  | 'Emerald'
  | 'Diamond'
  | 'Alexandrite'
  | 'Cat\'s Eye'
  | 'Tourmaline'
  | 'Spinel'
  | 'Aquamarine'
  | 'Garnet'
  | 'Topaz'
  | 'Amethyst'
  | 'Moonstone (Meetiyagoda)'
  | 'Zircon'
  | 'None';

export type ProductCategory =
  | 'Rings'
  | 'Necklaces'
  | 'Earrings'
  | 'Bracelets & Bangles'
  | 'Pendants'
  | 'Loose Gemstones'
  | 'Gold Sovereigns & Bullion'
  | 'Bridal Sets'
  | 'Men\'s Jewelry'
  | string;

export type WorkshopStatus = 'in_store' | 'in_workshop' | 'finished_workshop' | 'on_order';

export interface Product {
  id: string;
  itemCode: string;
  barcode: string;
  name: string;
  category: ProductCategory;
  imageUrl: string;
  gemstoneType: GemstoneType;
  gemstoneDetails: {
    carats?: number;
    cut?: string;
    color?: string;
    clarity?: string;
    origin?: string;
    treatment?: string;
  };
  goldPurity?: '24K' | '22K' | '18K' | '14K' | '925 Silver' | 'Platinum' | 'None';
  grossWeightGrams: number;
  netGoldWeightGrams?: number;
  gemWeightCarats?: number;
  costPriceLKR: number;
  sellingPriceLKR: number;
  stockQuantity: number;
  workshopStatus: WorkshopStatus;
  status: 'active' | 'low_stock' | 'out_of_stock' | 'pending_workshop';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  nicPassport?: string;
  phone: string;
  whatsapp: string;
  email?: string;
  address: string;
  city: string;
  isVip?: boolean;
  totalSpentLKR: number;
  invoiceCount: number;
  createdAt: string;
}

export interface InvoiceItem {
  productId: string;
  itemCode: string;
  name: string;
  category: string;
  imageUrl?: string;
  gemstoneType?: string;
  weightGrams?: number;
  unitPriceLKR: number;
  quantity: number;
  discountLKR: number;
  totalLKR: number;
}

export type PaymentMethod = 'Cash' | 'Credit/Debit Card' | 'Bank Transfer' | 'Gold Exchange' | 'Cheque' | 'Installment';

export type InvoiceType = 'standard' | 'return' | 'exchange' | 'work_order';

export interface GoldExchangeDetails {
  oldGoldDescription: string;
  goldPurity: string;
  grossWeightGrams: number;
  wasteDeductionPercent: number;
  netWeightGrams: number;
  goldMarketRatePerGramLKR: number;
  totalExchangeAllowanceLKR: number;
  notes?: string;
}

export interface ReturnInvoiceDetails {
  originalInvoiceId?: string;
  originalInvoiceNumber?: string;
  returnReason: string;
  returnedItems?: {
    name: string;
    itemCode: string;
    quantity: number;
    returnAmountLKR: number;
  }[];
  totalRefundLKR: number;
  refundMethod: PaymentMethod;
  restocked?: boolean;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  invoiceType?: InvoiceType;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  items: InvoiceItem[];
  subtotalLKR: number;
  discountLKR: number;
  taxLKR: number;
  exchangeAllowanceLKR?: number;
  exchangeDetails?: GoldExchangeDetails;
  returnDetails?: ReturnInvoiceDetails;
  grandTotalLKR: number;
  paidAmountLKR: number;
  balanceLKR: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'paid' | 'partial' | 'due';
  cashierName: string;
  cashierId: string;
  notes?: string;
  isReturned?: boolean;
  returnedDate?: string;
  refundAmountLKR?: number;
  returnReason?: string;
  workOrderId?: string;
  workOrderNumber?: string;
  advancePaymentLKR?: number;
  balanceSettledDate?: string;
  balancePaymentMethod?: PaymentMethod;
}

export interface Certificate {
  id: string;
  certificateNumber: string;
  invoiceNumber: string;
  invoiceId?: string;
  date: string;
  customerName: string;
  customerPhone?: string;
  itemCode: string;
  barcode: string;
  jewelryName: string;
  category: ProductCategory;
  gemstoneType: GemstoneType;
  gemstoneCaratWeight: number;
  gemstoneCut: string;
  gemstoneColor: string;
  gemstoneClarity?: string;
  gemstoneOrigin: string;
  goldPurity: string;
  grossWeightGrams: number;
  netGoldWeightGrams: number;
  appraisedValueLKR: number;
  laboratoryVerificationNo?: string;
  gemologistSignatureName?: string;
  gemologistTitle?: string;
  includeGemologistSignature?: boolean;
  remarks?: string;
  includeProductImage?: boolean;
  productImageUrl?: string;
}

export interface Workshop {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  whatsapp?: string;
  address: string;
  specialization: string;
  specialty?: string;
  rating?: number;
  activeOrdersCount: number;
  totalAdvancesPaidLKR: number;
  createdAt: string;
}

export interface WorkshopEmployee {
  id: string;
  workshopId: string;
  workshopName: string;
  name: string;
  role: string;
  phone: string;
  nic: string;
  dailyRateOrSalaryLKR: number;
  totalPaidLKR: number;
  joinDate: string;
}

export interface EmployeePayment {
  id: string;
  voucherNumber?: string;
  employeeId: string;
  employeeName: string;
  workshopId: string;
  workshopName: string;
  paymentDate: string;
  grossAmountLKR?: number;
  deductionsLKR?: number;
  amountLKR: number;
  paymentType: 'Salary' | 'Overtime' | 'Commission' | 'Per-Piece' | 'Bonus' | 'Advance';
  paymentMethod?: PaymentMethod;
  orderNumber?: string;
  notes?: string;
  recordedBy: string;
}

export type OrderStatus =
  | 'Pending'
  | 'Sent to Workshop'
  | 'In Progress'
  | 'Ready for QC'
  | 'Completed'
  | 'Delivered to Customer'
  | 'Cancelled'
  | 'Returned from Workshop';

export interface WorkshopOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  productOrItemName: string;
  category: ProductCategory;
  gemstoneSpecs?: string;
  goldPurity?: string;
  goldPurityRequired?: string;
  goldWeightGivenGrams?: number;
  gemstonesGivenDetails?: string;
  targetWeightGrams?: number;
  designDescription: string;
  designImageUrl?: string; // JPG design/graph/reference upload
  quantity: number;
  orderDate: string;
  requiredDate: string;
  workshopId: string;
  workshopName: string;
  estimatedCostLKR: number;
  advancePaymentLKR: number;
  advancePaymentMethod?: PaymentMethod;
  balanceDueLKR: number;
  balancePaymentLKR?: number;
  specialInstructions?: string;
  status: OrderStatus;
  orderNotes?: string;
  completedDate?: string;
  cancellationReason?: string;
  returnNotes?: string;
  invoiceId?: string;
  invoiceNumber?: string;
  balancePaidDate?: string;
  balancePaymentMethod?: PaymentMethod;
}

export interface WorkshopAdvancePayment {
  id: string;
  paymentNumber: string;
  workshopId: string;
  workshopName: string;
  orderId?: string;
  orderNumber?: string;
  paymentDate: string;
  amountLKR: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  recordedBy: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierInvoiceNo?: string;
  supplierName: string;
  supplierPhone: string;
  date: string;
  items: {
    name: string;
    category: string;
    quantity: number;
    weightGrams?: number;
    carats?: number;
    unitCostLKR: number;
    totalLKR: number;
    goldPurity?: string;
  }[];
  totalAmountLKR: number;
  paidAmountLKR?: number;
  balanceDueLKR?: number;
  paymentMethod?: PaymentMethod;
  status: 'received' | 'pending' | 'returned';
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  invoiceImageUrl?: string; // Uploaded invoice / receipt screenshot
  notes?: string;
  autoAddedToInventory?: boolean;
}

export interface PurchaseReturn {
  id: string;
  returnNumber: string;
  purchaseOrderId: string;
  poNumber: string;
  supplierName: string;
  supplierCreditNoteNo?: string;
  date: string;
  items: {
    name: string;
    quantity: number;
    reason: string;
    refundAmountLKR: number;
  }[];
  totalRefundLKR: number;
  slipImageUrl?: string; // Uploaded credit note / return voucher screenshot
  status: 'completed' | 'pending';
  notes?: string;
}

export interface Promotion {
  id: string;
  title: string;
  productId: string;
  productName: string;
  category: string;
  imageUrl: string;
  originalPriceLKR: number;
  promotionPriceLKR: number;
  discountPercentage: number;
  description: string;
  validUntil: string;
  facebookPromotionUrl?: string;
  status: 'active' | 'expired';
}

export interface AppSettings {
  companyName: string;
  companyTagline: string;
  companyAddress: string;
  city: string;
  country: string;
  telephone: string;
  whatsappNumber: string;
  email: string;
  brNumber: string;
  vatTaxNumber?: string;
  currencySymbol: string;
  currencyCode: string;
  logoJpgUrl: string;
  invoiceBackgroundJpgUrl: string;
  isInvoiceBgEnabled: boolean;
  certificateBackgroundJpgUrl: string;
  isCertificateBgEnabled: boolean;
  invoicePrefix: string;
  certificatePrefix: string;
  orderPrefix: string;
  printMargins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  footerTerms: string;
  gemologistName: string;
  gemologistTitle?: string;
  printPreference?: 'no_print' | 'optional' | 'auto_print';
}

export interface BackupLog {
  id: string;
  date: string;
  sizeBytes: number;
  recordCount: number;
  performedBy: string;
  filename: string;
  type: 'export' | 'import';
}

export type ExpenseCategory =
  | 'Showroom Utilities'
  | 'Goldsmith Labor / Casting'
  | 'Goldsmith Labor & Casting'
  | 'Staff Tea & Welfare'
  | 'NGJA Gem Assay / Testing'
  | 'NGJA Gem Assay & Testing'
  | 'Gem Cutting & Polishing'
  | 'Rent & Premises'
  | 'Security & Insurance'
  | 'Advertising & Printing'
  | 'Transport & Courier'
  | 'Tools & Consumables'
  | 'Other Expenses'
  | 'Other';

export interface Expense {
  id: string;
  expenseNumber: string;
  date: string;
  category: ExpenseCategory;
  title: string;
  amountLKR: number;
  paymentMethod: PaymentMethod;
  payeeName: string;
  payee?: string;
  receiptImageUrl?: string;
  notes?: string;
  recordedBy: string;
  createdAt: string;
}

export type PayoutRecipientType =
  | 'Supplier'
  | 'Goldsmith / Workshop'
  | 'Staff'
  | 'Owner Drawing'
  | 'Gem Dealer / Broker'
  | 'Other';

export interface Payout {
  id: string;
  payoutNumber: string;
  date: string;
  recipientType: PayoutRecipientType;
  recipientName: string;
  recipientPhone?: string;
  amountLKR: number;
  paymentMethod: PaymentMethod;
  referenceNo?: string;
  referenceNumber?: string;
  purpose: string;
  slipImageUrl?: string;
  recordedBy?: string;
  authorizedBy?: string;
  notes?: string;
  createdAt: string;
}

export type GreetingOccasion =
  | 'Sinhala & Tamil New Year'
  | 'Christmas'
  | 'New Year'
  | 'Vesak Festival'
  | 'Deepavali'
  | 'Ramadan / Eid'
  | 'Custom Greeting';

export interface CustomerGreeting {
  id: string;
  occasion: GreetingOccasion;
  title: string;
  messageSinhala?: string;
  messageEnglish: string;
  messageTamil?: string;
  cardImageUrl?: string;
  videoClipUrl?: string;
  videoClipName?: string;
  videoClipSizeBytes?: number;
  discountOffer?: string;
  targetAudience: 'all' | 'vip' | 'regular';
  createdAt: string;
}
