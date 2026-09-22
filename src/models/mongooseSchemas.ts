/**
 * MongoDB Atlas & Mongoose Schemas for WCS Inventory Invoice
 * These schemas provide ready-to-use definitions for backend Node.js / Vercel Serverless deployment.
 */

export const MongooseSchemasCode = `
import mongoose, { Schema } from 'mongoose';

// 1. Users Schema
export const UserSchema = new Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'owner', 'user'], default: 'user' },
  email: { type: String },
  phone: { type: String },
  avatarUrl: { type: String },
  lastLogin: { type: Date }
}, { timestamps: true });

// 2. Roles Schema
export const RoleSchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  permissions: [{ type: String }]
}, { timestamps: true });

// 3. Products Schema
export const ProductSchema = new Schema({
  itemCode: { type: String, required: true, unique: true },
  barcode: { type: String, required: true, index: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  imageUrl: { type: String },
  gemstoneType: { type: String },
  gemstoneDetails: {
    carats: Number,
    cut: String,
    color: String,
    clarity: String,
    origin: String,
    treatment: String
  },
  goldPurity: { type: String },
  grossWeightGrams: { type: Number, required: true },
  netGoldWeightGrams: Number,
  gemWeightCarats: Number,
  costPriceLKR: { type: Number, required: true },
  sellingPriceLKR: { type: Number, required: true },
  stockQuantity: { type: Number, default: 0 },
  workshopStatus: { type: String, enum: ['in_store', 'in_workshop', 'finished_workshop', 'on_order'], default: 'in_store' },
  status: { type: String, enum: ['active', 'low_stock', 'out_of_stock', 'pending_workshop'], default: 'active' },
  notes: String
}, { timestamps: true });

// 4. Categories Schema
export const CategorySchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  icon: String
}, { timestamps: true });

// 5. Customers Schema
export const CustomerSchema = new Schema({
  name: { type: String, required: true },
  nicPassport: String,
  phone: { type: String, required: true, index: true },
  whatsapp: { type: String, required: true },
  email: String,
  address: String,
  city: String,
  totalSpentLKR: { type: Number, default: 0 },
  invoiceCount: { type: Number, default: 0 }
}, { timestamps: true });

// 6. Workshops Schema
export const WorkshopSchema = new Schema({
  name: { type: String, required: true },
  contactPerson: String,
  phone: { type: String, required: true },
  whatsapp: String,
  address: String,
  specialization: String,
  totalAdvancesPaidLKR: { type: Number, default: 0 }
}, { timestamps: true });

// 7. Workshop Employees Schema
export const WorkshopEmployeeSchema = new Schema({
  workshopId: { type: Schema.Types.ObjectId, ref: 'Workshop', required: true },
  workshopName: String,
  name: { type: String, required: true },
  role: String,
  phone: String,
  nic: String,
  dailyRateOrSalaryLKR: Number,
  totalPaidLKR: { type: Number, default: 0 },
  joinDate: Date
}, { timestamps: true });

// 8. Orders Schema
export const OrderSchema = new Schema({
  orderNumber: { type: String, required: true, unique: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
  customerName: String,
  customerPhone: String,
  productOrItemName: String,
  category: String,
  designDescription: String,
  designImageUrl: String,
  quantity: { type: Number, default: 1 },
  requiredDate: Date,
  workshopId: { type: Schema.Types.ObjectId, ref: 'Workshop' },
  workshopName: String,
  estimatedCostLKR: Number,
  advancePaymentLKR: { type: Number, default: 0 },
  balanceDueLKR: Number,
  status: { type: String, enum: ['Pending', 'Sent to Workshop', 'In Progress', 'Completed', 'Cancelled', 'Returned from Workshop'], default: 'Pending' },
  orderNotes: String
}, { timestamps: true });

// 9. Invoices Schema
export const InvoiceSchema = new Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  date: { type: Date, default: Date.now },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
  customerName: String,
  customerPhone: String,
  customerAddress: String,
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    itemCode: String,
    name: String,
    category: String,
    unitPriceLKR: Number,
    quantity: Number,
    discountLKR: Number,
    totalLKR: Number
  }],
  subtotalLKR: Number,
  discountLKR: Number,
  taxLKR: Number,
  grandTotalLKR: Number,
  paidAmountLKR: Number,
  balanceLKR: Number,
  paymentMethod: String,
  paymentStatus: String,
  cashierName: String,
  isReturned: { type: Boolean, default: false },
  returnReason: String
}, { timestamps: true });

// 10. Purchase Orders Schema
export const PurchaseOrderSchema = new Schema({
  poNumber: { type: String, required: true, unique: true },
  supplierName: { type: String, required: true },
  supplierPhone: String,
  items: [{
    name: String,
    category: String,
    quantity: Number,
    unitCostLKR: Number,
    totalLKR: Number
  }],
  totalAmountLKR: Number,
  status: { type: String, default: 'received' }
}, { timestamps: true });

// 11. Workshop Advances & Employee Payments
export const WorkshopAdvanceSchema = new Schema({
  paymentNumber: String,
  workshopId: { type: Schema.Types.ObjectId, ref: 'Workshop' },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
  paymentDate: Date,
  amountLKR: Number,
  paymentMethod: String,
  notes: String,
  recordedBy: String
}, { timestamps: true });

export const EmployeePaymentSchema = new Schema({
  employeeId: { type: Schema.Types.ObjectId, ref: 'WorkshopEmployee' },
  employeeName: String,
  workshopId: { type: Schema.Types.ObjectId, ref: 'Workshop' },
  paymentDate: Date,
  amountLKR: Number,
  paymentType: String,
  notes: String,
  recordedBy: String
}, { timestamps: true });

// 12. Settings Schema
export const SettingsSchema = new Schema({
  companyName: { type: String, default: 'WCS Gems & Fine Jewelry' },
  companyTagline: String,
  companyAddress: String,
  telephone: String,
  whatsappNumber: String,
  email: String,
  currencyCode: { type: String, default: 'LKR' },
  currencySymbol: { type: String, default: 'Rs.' },
  logoJpgUrl: String,
  invoiceBackgroundJpgUrl: String,
  isInvoiceBgEnabled: Boolean,
  certificateBackgroundJpgUrl: String,
  isCertificateBgEnabled: Boolean
}, { timestamps: true });
`;
