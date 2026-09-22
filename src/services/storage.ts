import {
  AppSettings,
  BackupLog,
  Certificate,
  Customer,
  CustomerGreeting,
  EmployeePayment,
  Expense,
  Invoice,
  Payout,
  Product,
  Promotion,
  PurchaseOrder,
  PurchaseReturn,
  User,
  Workshop,
  WorkshopAdvancePayment,
  WorkshopEmployee,
  WorkshopOrder,
  PaymentMethod,
  ProductCategory,
} from '../types';
import {
  initialCertificates,
  initialCustomers,
  initialCustomerGreetings,
  initialEmployeePayments,
  initialExpenses,
  initialInvoices,
  initialPayouts,
  initialProducts,
  initialPromotions,
  initialPurchaseOrders,
  initialPurchaseReturns,
  initialSettings,
  initialUsers,
  initialWorkshopAdvances,
  initialWorkshopEmployees,
  initialWorkshopOrders,
  initialWorkshops,
} from '../data/mockData';

const STORAGE_KEYS = {
  USERS: 'wcs_users',
  CURRENT_USER: 'wcs_current_user',
  PRODUCTS: 'wcs_products',
  CUSTOMERS: 'wcs_customers',
  INVOICES: 'wcs_invoices',
  CERTIFICATES: 'wcs_certificates',
  WORKSHOPS: 'wcs_workshops',
  WORKSHOP_EMPLOYEES: 'wcs_workshop_employees',
  WORKSHOP_ORDERS: 'wcs_workshop_orders',
  WORKSHOP_ADVANCES: 'wcs_workshop_advances',
  EMPLOYEE_PAYMENTS: 'wcs_employee_payments',
  PURCHASE_ORDERS: 'wcs_purchase_orders',
  PURCHASE_RETURNS: 'wcs_purchase_returns',
  EXPENSES: 'wcs_expenses',
  PAYOUTS: 'wcs_payouts',
  CUSTOMER_GREETINGS: 'wcs_customer_greetings',
  PROMOTIONS: 'wcs_promotions',
  SETTINGS: 'wcs_settings',
  BACKUP_LOGS: 'wcs_backup_logs',
  PRODUCT_CATEGORIES: 'wcs_product_categories',
};

export const DEFAULT_PRODUCT_CATEGORIES: string[] = [
  'Rings',
  'Necklaces',
  'Earrings',
  'Bracelets & Bangles',
  'Pendants',
  'Loose Gemstones',
  'Gold Sovereigns & Bullion',
  'Bridal Sets',
  "Men's Jewelry",
];

function getStored<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item || item === 'undefined' || item === 'null') {
      if (fallback !== null && fallback !== undefined) {
        localStorage.setItem(key, JSON.stringify(fallback));
      }
      return fallback;
    }
    const parsed = JSON.parse(item);
    if (parsed === null || parsed === undefined) {
      if (fallback !== null && fallback !== undefined) {
        localStorage.setItem(key, JSON.stringify(fallback));
      }
      return fallback;
    }
    if (Array.isArray(fallback) && !Array.isArray(parsed)) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return parsed as T;
  } catch (err) {
    console.error(`Error loading key ${key} from storage:`, err);
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving key ${key} to storage:`, err);
  }
}

export const StorageService = {
  // Users
  getUsers: (): User[] => getStored<User[]>(STORAGE_KEYS.USERS, initialUsers),
  saveUsers: (users: User[]): void => setStored(STORAGE_KEYS.USERS, users),
  addUser: (user: User): void => {
    const users = StorageService.getUsers();
    users.unshift(user);
    StorageService.saveUsers(users);
  },
  deleteUser: (userId: string): void => {
    const users = StorageService.getUsers().filter((u) => u.id !== userId);
    StorageService.saveUsers(users);
  },
  getCurrentUser: (): User => {
    const user = getStored<User | null>(STORAGE_KEYS.CURRENT_USER, null);
    if (user) return user;
    return initialUsers[0]; // default to Admin
  },
  setCurrentUser: (user: User): void => setStored(STORAGE_KEYS.CURRENT_USER, user),

  // Settings
  getSettings: (): AppSettings => getStored<AppSettings>(STORAGE_KEYS.SETTINGS, initialSettings),
  saveSettings: (settings: AppSettings): void => setStored(STORAGE_KEYS.SETTINGS, settings),
  updateSettings: (settings: AppSettings): void => StorageService.saveSettings(settings),

  // Products
  getProducts: (): Product[] => getStored<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts),
  saveProducts: (products: Product[]): void => setStored(STORAGE_KEYS.PRODUCTS, products),
  addProduct: (product: Product): void => {
    const products = StorageService.getProducts();
    products.unshift(product);
    StorageService.saveProducts(products);
  },
  updateProduct: (product: Product): void => {
    const products = StorageService.getProducts().map((p) => (p.id === product.id ? product : p));
    StorageService.saveProducts(products);
  },
  deleteProduct: (productId: string): void => {
    const products = StorageService.getProducts().filter((p) => p.id !== productId);
    StorageService.saveProducts(products);
  },
  updateStock: (productId: string, deltaQty: number): void => {
    const products = StorageService.getProducts();
    const product = products.find((p) => p.id === productId);
    if (product) {
      product.stockQuantity = Math.max(0, product.stockQuantity + deltaQty);
      if (product.stockQuantity === 0) product.status = 'out_of_stock';
      else if (product.stockQuantity <= 2) product.status = 'low_stock';
      else product.status = 'active';
      StorageService.saveProducts(products);
    }
  },

  // Product Categories
  getProductCategories: (): string[] =>
    getStored<string[]>(STORAGE_KEYS.PRODUCT_CATEGORIES, DEFAULT_PRODUCT_CATEGORIES),
  saveProductCategories: (categories: string[]): void =>
    setStored(STORAGE_KEYS.PRODUCT_CATEGORIES, categories),
  addProductCategory: (categoryName: string): string[] => {
    const trimmed = categoryName.trim();
    if (!trimmed) return StorageService.getProductCategories();
    const categories = StorageService.getProductCategories();
    if (!categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      categories.push(trimmed);
      StorageService.saveProductCategories(categories);
    }
    return categories;
  },
  updateProductCategory: (oldCategory: string, newCategory: string): string[] => {
    const trimmedNew = newCategory.trim();
    if (!trimmedNew || oldCategory === trimmedNew) return StorageService.getProductCategories();
    let categories = StorageService.getProductCategories();
    categories = categories.map((c) => (c === oldCategory ? trimmedNew : c));
    StorageService.saveProductCategories(categories);

    // Also update any existing products categorized under oldCategory
    const products = StorageService.getProducts().map((p) => {
      if (p.category === oldCategory) {
        return { ...p, category: trimmedNew };
      }
      return p;
    });
    StorageService.saveProducts(products);

    // Also update any workshop orders categorized under oldCategory
    const orders = StorageService.getWorkshopOrders().map((o) => {
      if (o.category === oldCategory) {
        return { ...o, category: trimmedNew };
      }
      return o;
    });
    StorageService.saveWorkshopOrders(orders);

    return categories;
  },
  deleteProductCategory: (category: string, fallbackCategory?: string): string[] => {
    let categories = StorageService.getProductCategories().filter((c) => c !== category);
    if (categories.length === 0) {
      categories = [DEFAULT_PRODUCT_CATEGORIES[0]];
    }
    StorageService.saveProductCategories(categories);

    const replacement = fallbackCategory || categories[0] || 'Rings';
    // Safely reassign affected products
    const products = StorageService.getProducts().map((p) => {
      if (p.category === category) {
        return { ...p, category: replacement };
      }
      return p;
    });
    StorageService.saveProducts(products);

    return categories;
  },

  // Customers
  getCustomers: (): Customer[] => getStored<Customer[]>(STORAGE_KEYS.CUSTOMERS, initialCustomers),
  saveCustomers: (customers: Customer[]): void => setStored(STORAGE_KEYS.CUSTOMERS, customers),
  addCustomer: (customer: Customer): void => {
    const customers = StorageService.getCustomers();
    customers.unshift(customer);
    StorageService.saveCustomers(customers);
  },
  updateCustomer: (customer: Customer): void => {
    const customers = StorageService.getCustomers().map((c) => (c.id === customer.id ? customer : c));
    StorageService.saveCustomers(customers);
  },
  deleteCustomer: (customerId: string): void => {
    const customers = StorageService.getCustomers().filter((c) => c.id !== customerId);
    StorageService.saveCustomers(customers);
  },

  // Invoices
  getInvoices: (): Invoice[] => getStored<Invoice[]>(STORAGE_KEYS.INVOICES, initialInvoices),
  saveInvoices: (invoices: Invoice[]): void => setStored(STORAGE_KEYS.INVOICES, invoices),
  addInvoice: (invoice: Invoice): void => {
    const invoices = StorageService.getInvoices();
    invoices.unshift(invoice);
    StorageService.saveInvoices(invoices);

    // Reduce stock for purchased items
    invoice.items.forEach((item) => {
      StorageService.updateStock(item.productId, -item.quantity);
    });

    // Update customer spend stats
    const customers = StorageService.getCustomers();
    const customer = customers.find((c) => c.id === invoice.customerId);
    if (customer) {
      customer.totalSpentLKR += invoice.grandTotalLKR;
      customer.invoiceCount += 1;
      StorageService.saveCustomers(customers);
    }
  },
  returnInvoice: (invoiceId: string, reason: string, refundAmount: number): void => {
    const invoices = StorageService.getInvoices();
    const invoice = invoices.find((i) => i.id === invoiceId);
    if (invoice && !invoice.isReturned) {
      invoice.isReturned = true;
      invoice.returnedDate = new Date().toISOString().split('T')[0];
      invoice.returnReason = reason;
      invoice.refundAmountLKR = refundAmount;
      StorageService.saveInvoices(invoices);

      // Return items back to stock
      invoice.items.forEach((item) => {
        StorageService.updateStock(item.productId, item.quantity);
      });
    }
  },

  // Certificates
  getCertificates: (): Certificate[] => getStored<Certificate[]>(STORAGE_KEYS.CERTIFICATES, initialCertificates),
  saveCertificates: (certificates: Certificate[]): void => setStored(STORAGE_KEYS.CERTIFICATES, certificates),
  addCertificate: (cert: Certificate): void => {
    const certs = StorageService.getCertificates();
    certs.unshift(cert);
    StorageService.saveCertificates(certs);
  },
  deleteCertificate: (certId: string): void => {
    const certs = StorageService.getCertificates().filter((c) => c.id !== certId);
    StorageService.saveCertificates(certs);
  },
  updateCertificate: (cert: Certificate): void => {
    const certs = StorageService.getCertificates().map((c) => (c.id === cert.id ? cert : c));
    StorageService.saveCertificates(certs);
  },

  // Workshops
  getWorkshops: (): Workshop[] => getStored<Workshop[]>(STORAGE_KEYS.WORKSHOPS, initialWorkshops),
  saveWorkshops: (workshops: Workshop[]): void => setStored(STORAGE_KEYS.WORKSHOPS, workshops),
  addWorkshop: (workshop: Workshop): void => {
    const ws = StorageService.getWorkshops();
    ws.unshift(workshop);
    StorageService.saveWorkshops(ws);
  },
  updateWorkshop: (workshop: Workshop): void => {
    const ws = StorageService.getWorkshops().map((w) => (w.id === workshop.id ? workshop : w));
    StorageService.saveWorkshops(ws);
  },
  deleteWorkshop: (workshopId: string): void => {
    const ws = StorageService.getWorkshops().filter((w) => w.id !== workshopId);
    StorageService.saveWorkshops(ws);
  },

  // Workshop Employees
  getWorkshopEmployees: (): WorkshopEmployee[] =>
    getStored<WorkshopEmployee[]>(STORAGE_KEYS.WORKSHOP_EMPLOYEES, initialWorkshopEmployees),
  saveWorkshopEmployees: (employees: WorkshopEmployee[]): void =>
    setStored(STORAGE_KEYS.WORKSHOP_EMPLOYEES, employees),
  addWorkshopEmployee: (employee: WorkshopEmployee): void => {
    const emps = StorageService.getWorkshopEmployees();
    emps.unshift(employee);
    StorageService.saveWorkshopEmployees(emps);
  },
  updateWorkshopEmployee: (employee: WorkshopEmployee): void => {
    const emps = StorageService.getWorkshopEmployees().map((e) => (e.id === employee.id ? employee : e));
    StorageService.saveWorkshopEmployees(emps);
  },
  deleteWorkshopEmployee: (employeeId: string): void => {
    const emps = StorageService.getWorkshopEmployees().filter((e) => e.id !== employeeId);
    StorageService.saveWorkshopEmployees(emps);
  },

  // Employee Payments
  getEmployeePayments: (): EmployeePayment[] =>
    getStored<EmployeePayment[]>(STORAGE_KEYS.EMPLOYEE_PAYMENTS, initialEmployeePayments),
  saveEmployeePayments: (payments: EmployeePayment[]): void =>
    setStored(STORAGE_KEYS.EMPLOYEE_PAYMENTS, payments),
  addEmployeePayment: (payment: EmployeePayment): void => {
    const payments = StorageService.getEmployeePayments();
    payments.unshift(payment);
    StorageService.saveEmployeePayments(payments);

    // Update employee total paid
    const employees = StorageService.getWorkshopEmployees();
    const emp = employees.find((e) => e.id === payment.employeeId);
    if (emp) {
      emp.totalPaidLKR += payment.amountLKR;
      StorageService.saveWorkshopEmployees(employees);
    }
  },

  // Workshop Orders
  getWorkshopOrders: (): WorkshopOrder[] =>
    getStored<WorkshopOrder[]>(STORAGE_KEYS.WORKSHOP_ORDERS, initialWorkshopOrders),
  saveWorkshopOrders: (orders: WorkshopOrder[]): void =>
    setStored(STORAGE_KEYS.WORKSHOP_ORDERS, orders),
  addWorkshopOrder: (order: WorkshopOrder): void => {
    const orders = StorageService.getWorkshopOrders();
    orders.unshift(order);
    StorageService.saveWorkshopOrders(orders);
  },
  updateWorkshopOrder: (order: WorkshopOrder): void => {
    const orders = StorageService.getWorkshopOrders().map((o) => (o.id === order.id ? order : o));
    StorageService.saveWorkshopOrders(orders);
  },
  updateWorkshopOrderStatus: (orderId: string, status: any, completedDate?: string): void => {
    const orders = StorageService.getWorkshopOrders().map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          status,
          completedDate: completedDate || o.completedDate,
        };
      }
      return o;
    });
    StorageService.saveWorkshopOrders(orders);
  },

  createWorkOrderInvoice: (
    order: WorkshopOrder,
    advanceAmount: number,
    paymentMethod: PaymentMethod = 'Cash',
    cashierName: string = 'WCS Staff'
  ): { invoice: Invoice; order: WorkshopOrder } => {
    const invoices = StorageService.getInvoices();
    const invoiceNumber = StorageService.generateNextInvoiceNumber();
    const totalAmount = order.estimatedCostLKR || 0;
    const advance = Math.min(totalAmount, Math.max(0, advanceAmount || 0));
    const balance = Math.max(0, totalAmount - advance);
    const today = new Date().toISOString().split('T')[0];

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      date: today,
      invoiceType: 'work_order',
      customerId: order.customerId || 'cust-walkin',
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      items: [
        {
          productId: `order-item-${order.id}`,
          itemCode: order.orderNumber,
          name: `${order.productOrItemName} (Custom Craft Job)`,
          category: order.category || 'Custom Order',
          unitPriceLKR: totalAmount,
          quantity: order.quantity || 1,
          discountLKR: 0,
          totalLKR: totalAmount,
        },
      ],
      subtotalLKR: totalAmount,
      discountLKR: 0,
      taxLKR: 0,
      grandTotalLKR: totalAmount,
      paidAmountLKR: advance,
      balanceLKR: balance,
      paymentMethod,
      paymentStatus: balance === 0 ? 'paid' : advance > 0 ? 'partial' : 'due',
      cashierName,
      cashierId: 'cashier-main',
      workOrderId: order.id,
      workOrderNumber: order.orderNumber,
      advancePaymentLKR: advance,
      notes: `Custom Job Order #${order.orderNumber} - Advance Payment: Rs. ${advance.toLocaleString()}`,
    };

    invoices.unshift(newInvoice);
    StorageService.saveInvoices(invoices);

    // Update the workshop order
    const updatedOrder: WorkshopOrder = {
      ...order,
      invoiceId: newInvoice.id,
      invoiceNumber: newInvoice.invoiceNumber,
      advancePaymentLKR: advance,
      advancePaymentMethod: paymentMethod,
      balanceDueLKR: balance,
    };

    const orders = StorageService.getWorkshopOrders().map((o) =>
      o.id === order.id ? updatedOrder : o
    );
    if (!orders.some((o) => o.id === order.id)) {
      orders.unshift(updatedOrder);
    }
    StorageService.saveWorkshopOrders(orders);

    return { invoice: newInvoice, order: updatedOrder };
  },

  settleWorkOrderBalance: (
    orderId: string,
    paymentAmount: number,
    paymentMethod: PaymentMethod = 'Cash',
    cashierName: string = 'WCS Staff'
  ): { invoice?: Invoice; order: WorkshopOrder } => {
    const orders = StorageService.getWorkshopOrders();
    const orderIndex = orders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) {
      throw new Error(`Order ${orderId} not found`);
    }

    const order = orders[orderIndex];
    const settleAmt = Math.min(order.balanceDueLKR, Math.max(0, paymentAmount));
    const newBalance = Math.max(0, order.balanceDueLKR - settleAmt);
    const today = new Date().toISOString().split('T')[0];

    const updatedOrder: WorkshopOrder = {
      ...order,
      balanceDueLKR: newBalance,
      balancePaymentLKR: (order.balancePaymentLKR || 0) + settleAmt,
      balancePaidDate: today,
      balancePaymentMethod: paymentMethod,
      status: 'Completed',
      completedDate: today,
    };
    orders[orderIndex] = updatedOrder;
    StorageService.saveWorkshopOrders(orders);

    // Find and update linked invoice
    const invoices = StorageService.getInvoices();
    let updatedInvoice: Invoice | undefined;
    const invIndex = invoices.findIndex(
      (inv) => inv.id === order.invoiceId || inv.workOrderId === order.id
    );

    if (invIndex !== -1) {
      const inv = invoices[invIndex];
      const newPaid = inv.paidAmountLKR + settleAmt;
      const newInvBalance = Math.max(0, inv.grandTotalLKR - newPaid);
      updatedInvoice = {
        ...inv,
        paidAmountLKR: newPaid,
        balanceLKR: newInvBalance,
        paymentStatus: newInvBalance === 0 ? 'paid' : 'partial',
        balanceSettledDate: today,
        balancePaymentMethod: paymentMethod,
        notes: `${inv.notes || ''} | Final Balance Rs. ${settleAmt.toLocaleString()} settled via ${paymentMethod} on ${today}`.trim(),
      };
      invoices[invIndex] = updatedInvoice;
      StorageService.saveInvoices(invoices);
    } else {
      const result = StorageService.createWorkOrderInvoice(
        updatedOrder,
        order.estimatedCostLKR,
        paymentMethod,
        cashierName
      );
      updatedInvoice = result.invoice;
    }

    return { invoice: updatedInvoice, order: updatedOrder };
  },

  // Workshop Advances
  getWorkshopAdvances: (): WorkshopAdvancePayment[] =>
    getStored<WorkshopAdvancePayment[]>(STORAGE_KEYS.WORKSHOP_ADVANCES, initialWorkshopAdvances),
  saveWorkshopAdvances: (advances: WorkshopAdvancePayment[]): void =>
    setStored(STORAGE_KEYS.WORKSHOP_ADVANCES, advances),
  addWorkshopAdvance: (advance: WorkshopAdvancePayment): void => {
    const advances = StorageService.getWorkshopAdvances();
    advances.unshift(advance);
    StorageService.saveWorkshopAdvances(advances);

    // Update workshop total advances
    const workshops = StorageService.getWorkshops();
    const ws = workshops.find((w) => w.id === advance.workshopId);
    if (ws) {
      ws.totalAdvancesPaidLKR += advance.amountLKR;
      StorageService.saveWorkshops(workshops);
    }

    // Update order advance if tied to an order
    if (advance.orderId) {
      const orders = StorageService.getWorkshopOrders();
      const ord = orders.find((o) => o.id === advance.orderId);
      if (ord) {
        ord.advancePaymentLKR += advance.amountLKR;
        ord.balanceDueLKR = Math.max(0, ord.estimatedCostLKR - ord.advancePaymentLKR);
        StorageService.saveWorkshopOrders(orders);
      }
    }
  },

  // Purchases & Returns
  getPurchaseOrders: (): PurchaseOrder[] =>
    getStored<PurchaseOrder[]>(STORAGE_KEYS.PURCHASE_ORDERS, initialPurchaseOrders),
  savePurchaseOrders: (orders: PurchaseOrder[]): void =>
    setStored(STORAGE_KEYS.PURCHASE_ORDERS, orders),
  addPurchaseOrder: (order: PurchaseOrder): void => {
    const orders = StorageService.getPurchaseOrders();
    orders.unshift(order);
    StorageService.savePurchaseOrders(orders);
  },
  updatePurchaseOrder: (order: PurchaseOrder): void => {
    const orders = StorageService.getPurchaseOrders().map((po) =>
      po.id === order.id ? order : po
    );
    StorageService.savePurchaseOrders(orders);
  },
  deletePurchaseOrder: (poId: string): void => {
    const orders = StorageService.getPurchaseOrders().filter((po) => po.id !== poId);
    StorageService.savePurchaseOrders(orders);
  },
  getPurchaseReturns: (): PurchaseReturn[] =>
    getStored<PurchaseReturn[]>(STORAGE_KEYS.PURCHASE_RETURNS, initialPurchaseReturns),
  savePurchaseReturns: (returns: PurchaseReturn[]): void =>
    setStored(STORAGE_KEYS.PURCHASE_RETURNS, returns),
  addPurchaseReturn: (ret: PurchaseReturn): void => {
    const returns = StorageService.getPurchaseReturns();
    returns.unshift(ret);
    StorageService.savePurchaseReturns(returns);
  },
  updatePurchaseReturn: (ret: PurchaseReturn): void => {
    const returns = StorageService.getPurchaseReturns().map((r) =>
      r.id === ret.id ? ret : r
    );
    StorageService.savePurchaseReturns(returns);
  },
  deletePurchaseReturn: (retId: string): void => {
    const returns = StorageService.getPurchaseReturns().filter((r) => r.id !== retId);
    StorageService.savePurchaseReturns(returns);
  },

  // Promotions
  getPromotions: (): Promotion[] => getStored<Promotion[]>(STORAGE_KEYS.PROMOTIONS, initialPromotions),
  savePromotions: (promotions: Promotion[]): void => setStored(STORAGE_KEYS.PROMOTIONS, promotions),
  addPromotion: (promo: Promotion): void => {
    const promos = StorageService.getPromotions();
    promos.unshift(promo);
    StorageService.savePromotions(promos);
  },
  deletePromotion: (promoId: string): void => {
    const promos = StorageService.getPromotions().filter((p) => p.id !== promoId);
    StorageService.savePromotions(promos);
  },

  // Expenses
  getExpenses: (): Expense[] => getStored<Expense[]>(STORAGE_KEYS.EXPENSES, initialExpenses),
  saveExpenses: (expenses: Expense[]): void => setStored(STORAGE_KEYS.EXPENSES, expenses),
  addExpense: (expense: Expense): void => {
    const expenses = StorageService.getExpenses();
    expenses.unshift(expense);
    StorageService.saveExpenses(expenses);
  },
  deleteExpense: (expenseId: string): void => {
    const expenses = StorageService.getExpenses().filter((e) => e.id !== expenseId);
    StorageService.saveExpenses(expenses);
  },

  // Payouts
  getPayouts: (): Payout[] => getStored<Payout[]>(STORAGE_KEYS.PAYOUTS, initialPayouts),
  savePayouts: (payouts: Payout[]): void => setStored(STORAGE_KEYS.PAYOUTS, payouts),
  addPayout: (payout: Payout): void => {
    const payouts = StorageService.getPayouts();
    payouts.unshift(payout);
    StorageService.savePayouts(payouts);
  },
  deletePayout: (payoutId: string): void => {
    const payouts = StorageService.getPayouts().filter((p) => p.id !== payoutId);
    StorageService.savePayouts(payouts);
  },

  // Customer Greetings & Festival Wishes
  getCustomerGreetings: (): CustomerGreeting[] =>
    getStored<CustomerGreeting[]>(STORAGE_KEYS.CUSTOMER_GREETINGS, initialCustomerGreetings),
  saveCustomerGreetings: (greetings: CustomerGreeting[]): void =>
    setStored(STORAGE_KEYS.CUSTOMER_GREETINGS, greetings),
  addCustomerGreeting: (greeting: CustomerGreeting): void => {
    const greetings = StorageService.getCustomerGreetings();
    greetings.unshift(greeting);
    StorageService.saveCustomerGreetings(greetings);
  },
  deleteCustomerGreeting: (greetingId: string): void => {
    const greetings = StorageService.getCustomerGreetings().filter((g) => g.id !== greetingId);
    StorageService.saveCustomerGreetings(greetings);
  },

  // Backup & Restore
  getBackupLogs: (): BackupLog[] =>
    getStored<BackupLog[]>(STORAGE_KEYS.BACKUP_LOGS, [
      {
        id: 'bk-init',
        date: '2026-09-08 10:00 AM',
        sizeBytes: 84200,
        recordCount: 42,
        performedBy: 'System Auto-Init',
        filename: 'wcs_inventory_backup_20260908.json',
        type: 'export',
      },
    ]),
  saveBackupLogs: (logs: BackupLog[]): void => setStored(STORAGE_KEYS.BACKUP_LOGS, logs),
  addBackupLog: (log: BackupLog): void => {
    const logs = StorageService.getBackupLogs();
    logs.unshift(log);
    StorageService.saveBackupLogs(logs);
  },
  exportFullDatabaseJSON: (): string => {
    const data = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      appName: 'WCS Inventory Invoice',
      collections: {
        users: StorageService.getUsers(),
        settings: StorageService.getSettings(),
        products: StorageService.getProducts(),
        customers: StorageService.getCustomers(),
        invoices: StorageService.getInvoices(),
        certificates: StorageService.getCertificates(),
        workshops: StorageService.getWorkshops(),
        workshop_employees: StorageService.getWorkshopEmployees(),
        employee_payments: StorageService.getEmployeePayments(),
        orders: StorageService.getWorkshopOrders(),
        workshop_advances: StorageService.getWorkshopAdvances(),
        purchase_orders: StorageService.getPurchaseOrders(),
        purchase_returns: StorageService.getPurchaseReturns(),
        expenses: StorageService.getExpenses(),
        payouts: StorageService.getPayouts(),
        customer_greetings: StorageService.getCustomerGreetings(),
        promotions: StorageService.getPromotions(),
      },
    };
    return JSON.stringify(data, null, 2);
  },
  importFullDatabaseJSON: (jsonString: string): { success: boolean; count: number; message: string } => {
    try {
      const data = JSON.parse(jsonString);
      if (!data.collections) {
        return { success: false, count: 0, message: 'Invalid backup file format: missing collections root.' };
      }
      const c = data.collections;
      if (c.users) StorageService.saveUsers(c.users);
      if (c.settings) StorageService.saveSettings(c.settings);
      if (c.products) StorageService.saveProducts(c.products);
      if (c.customers) StorageService.saveCustomers(c.customers);
      if (c.invoices) StorageService.saveInvoices(c.invoices);
      if (c.certificates) StorageService.saveCertificates(c.certificates);
      if (c.workshops) StorageService.saveWorkshops(c.workshops);
      if (c.workshop_employees) StorageService.saveWorkshopEmployees(c.workshop_employees);
      if (c.employee_payments) StorageService.saveEmployeePayments(c.employee_payments);
      if (c.orders) StorageService.saveWorkshopOrders(c.orders);
      if (c.workshop_advances) StorageService.saveWorkshopAdvances(c.workshop_advances);
      if (c.purchase_orders) StorageService.savePurchaseOrders(c.purchase_orders);
      if (c.purchase_returns) StorageService.savePurchaseReturns(c.purchase_returns);
      if (c.expenses) StorageService.saveExpenses(c.expenses);
      if (c.payouts) StorageService.savePayouts(c.payouts);
      if (c.customer_greetings) StorageService.saveCustomerGreetings(c.customer_greetings);
      if (c.promotions) StorageService.savePromotions(c.promotions);

      const totalRecords =
        (c.products?.length || 0) +
        (c.invoices?.length || 0) +
        (c.customers?.length || 0) +
        (c.orders?.length || 0);

      StorageService.addBackupLog({
        id: `bk-${Date.now()}`,
        date: new Date().toLocaleString(),
        sizeBytes: new Blob([jsonString]).size,
        recordCount: totalRecords,
        performedBy: StorageService.getCurrentUser().name,
        filename: 'restored_database.json',
        type: 'import',
      });

      return { success: true, count: totalRecords, message: `Successfully restored ${totalRecords} primary records!` };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      return { success: false, count: 0, message: `Failed to parse backup JSON: ${errorMsg}` };
    }
  },

  // Reset database back to default initial seed
  resetToDefaults: (): void => {
    localStorage.clear();
    setStored(STORAGE_KEYS.USERS, initialUsers);
    setStored(STORAGE_KEYS.SETTINGS, initialSettings);
    setStored(STORAGE_KEYS.PRODUCTS, initialProducts);
    setStored(STORAGE_KEYS.CUSTOMERS, initialCustomers);
    setStored(STORAGE_KEYS.INVOICES, initialInvoices);
    setStored(STORAGE_KEYS.CERTIFICATES, initialCertificates);
    setStored(STORAGE_KEYS.WORKSHOPS, initialWorkshops);
    setStored(STORAGE_KEYS.WORKSHOP_EMPLOYEES, initialWorkshopEmployees);
    setStored(STORAGE_KEYS.EMPLOYEE_PAYMENTS, initialEmployeePayments);
    setStored(STORAGE_KEYS.WORKSHOP_ORDERS, initialWorkshopOrders);
    setStored(STORAGE_KEYS.WORKSHOP_ADVANCES, initialWorkshopAdvances);
    setStored(STORAGE_KEYS.PURCHASE_ORDERS, initialPurchaseOrders);
    setStored(STORAGE_KEYS.PURCHASE_RETURNS, initialPurchaseReturns);
    setStored(STORAGE_KEYS.PROMOTIONS, initialPromotions);
  },
  exportDatabaseBackup: (): string => StorageService.exportFullDatabaseJSON(),
  importDatabaseBackup: (jsonString: string): boolean => StorageService.importFullDatabaseJSON(jsonString).success,
  resetToInitialSeed: (): void => StorageService.resetToDefaults(),

  // Helpers
  formatLKR: (amount: number): string => {
    return `Rs. ${Number(amount || 0).toLocaleString('en-LK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  },

  generateNextInvoiceNumber: (): string => {
    const invoices = StorageService.getInvoices();
    const currentYear = new Date().getFullYear();
    const count = invoices.length + 1;
    return `INV-${currentYear}-${String(count).padStart(4, '0')}`;
  },

  generateNextCertificateNumber: (): string => {
    const certs = StorageService.getCertificates();
    const count = certs.length + 1;
    return `CERT-LK-${String(count).padStart(4, '0')}`;
  },

  generateNextOrderNumber: (): string => {
    const orders = StorageService.getWorkshopOrders();
    const currentYear = new Date().getFullYear();
    const count = orders.length + 1;
    return `ORD-${currentYear}-${String(count).padStart(3, '0')}`;
  },

  generateNextBarcode: (): string => {
    return '890' + Math.floor(10000000 + Math.random() * 90000000).toString();
  },
};
