import React, { useState, useRef } from 'react';
import {
  DollarSign,
  Plus,
  Search,
  Calendar,
  Filter,
  Trash2,
  Eye,
  Upload,
  Receipt,
  CheckCircle2,
  TrendingDown,
  Building2,
  Zap,
  Coffee,
  Shield,
  Tag,
  FileText,
  CreditCard,
  ChevronDown,
} from 'lucide-react';
import { Expense, ExpenseCategory, PaymentMethod, AppSettings, User } from '../../types';
import { StorageService } from '../../services/storage';
import { useToast } from '../common/Toast';
import { Modal } from '../common/Modal';

interface ExpensesManagerProps {
  settings: AppSettings;
  currentUser?: User | null;
}

const EXPENSE_CATEGORIES: { id: ExpenseCategory; label: string; icon: any }[] = [
  { id: 'Showroom Utilities', label: 'Showroom Utilities (CEB / Water)', icon: Zap },
  { id: 'Goldsmith Labor & Casting', label: 'Goldsmith Labor & Casting', icon: Building2 },
  { id: 'Staff Tea & Welfare', label: 'Staff Tea, Meals & Welfare', icon: Coffee },
  { id: 'NGJA Gem Assay & Testing', label: 'NGJA Gem Assay & Testing Fees', icon: Shield },
  { id: 'Gem Cutting & Polishing', label: 'Gem Cutting & Lapidary Polishing', icon: Tag },
  { id: 'Rent & Premises', label: 'Showroom Rent & Premises', icon: Building2 },
  { id: 'Security & Insurance', label: 'Security & Vault Insurance', icon: Shield },
  { id: 'Advertising & Printing', label: 'Advertising, Printing & Flyers', icon: FileText },
  { id: 'Tools & Consumables', label: 'Tools, Chemicals & Consumables', icon: Tag },
  { id: 'Transport & Courier', label: 'Transport, Delivery & Courier', icon: Tag },
  { id: 'Other', label: 'Other Operating Expenses', icon: DollarSign },
];

export const ExpensesManager: React.FC<ExpensesManagerProps> = ({ settings, currentUser }) => {
  const { showToast } = useToast();

  const [expenses, setExpenses] = useState<Expense[]>(() => StorageService.getExpenses());
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewReceiptUrl, setViewReceiptUrl] = useState<string | null>(null);

  // New expense form
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Showroom Utilities');
  const [amountLKR, setAmountLKR] = useState<number>(0);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [payee, setPayee] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [receiptImageUrl, setReceiptImageUrl] = useState('');
  const [notes, setNotes] = useState('');

  const receiptInputRef = useRef<HTMLInputElement>(null);

  // Handle receipt image upload
  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('image/')) {
      showToast('Please upload a valid JPG or PNG image.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setReceiptImageUrl(reader.result as string);
      showToast(`Receipt photo "${file.name}" attached.`, 'success');
    };
    reader.readAsDataURL(file);
  };

  // Submit new expense
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Please provide an expense title.', 'error');
      return;
    }
    if (amountLKR <= 0) {
      showToast('Amount must be greater than zero.', 'error');
      return;
    }

    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      expenseNumber: `EXP-${Date.now().toString().slice(-6)}`,
      title,
      category,
      amountLKR,
      date,
      payeeName: payee.trim() || 'General Payee',
      payee: payee.trim() || undefined,
      paymentMethod,
      receiptImageUrl: receiptImageUrl || undefined,
      notes: notes.trim() || undefined,
      recordedBy: currentUser?.name || 'Administrator',
      createdAt: new Date().toISOString(),
    };

    StorageService.addExpense(newExpense);
    setExpenses(StorageService.getExpenses());
    showToast(`Expense of ${settings.currencySymbol} ${amountLKR.toLocaleString()} recorded.`, 'success');

    // Reset Form
    setTitle('');
    setAmountLKR(0);
    setPayee('');
    setReceiptImageUrl('');
    setNotes('');
    setIsAddModalOpen(false);
  };

  // Delete expense
  const handleDeleteExpense = (id: string, expTitle: string) => {
    if (window.confirm(`Are you sure you want to delete expense "${expTitle}"?`)) {
      StorageService.deleteExpense(id);
      setExpenses(StorageService.getExpenses());
      showToast('Expense record removed.', 'info');
    }
  };

  // Filtered expenses
  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch =
      searchQuery === '' ||
      exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (exp.payee && exp.payee.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (exp.notes && exp.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = categoryFilter === 'all' || exp.category === categoryFilter;
    const matchesPayment = paymentFilter === 'all' || exp.paymentMethod === paymentFilter;

    return matchesSearch && matchesCategory && matchesPayment;
  });

  // Financial aggregates
  const totalExpenseLKR = expenses.reduce((sum, e) => sum + e.amountLKR, 0);
  const currentMonthPrefix = new Date().toISOString().slice(0, 7);
  const thisMonthExpenseLKR = expenses
    .filter((e) => e.date.startsWith(currentMonthPrefix))
    .reduce((sum, e) => sum + e.amountLKR, 0);

  const utilitySpendLKR = expenses
    .filter((e) => e.category === 'Showroom Utilities')
    .reduce((sum, e) => sum + e.amountLKR, 0);

  const laborSpendLKR = expenses
    .filter((e) => e.category === 'Goldsmith Labor & Casting')
    .reduce((sum, e) => sum + e.amountLKR, 0);

  return (
    <div className="space-y-5">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white font-serif flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-amber-400" />
            Showroom Operating Expenses
          </h2>
          <p className="text-xs text-slate-400">
            Track day-to-day showroom utility bills, goldsmith casting costs, assay fees, and welfare.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Record New Expense</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-mono">
            <span>Total Recorded Spend</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold text-rose-400 mt-2 font-mono">
            {settings.currencySymbol} {totalExpenseLKR.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{expenses.length} entries total</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-mono">
            <span>This Month's Spend</span>
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-400 mt-2 font-mono">
            {settings.currencySymbol} {thisMonthExpenseLKR.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Current month outflow</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-mono">
            <span>Utilities & Premises</span>
            <Zap className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-bold text-sky-400 mt-2 font-mono">
            {settings.currencySymbol} {utilitySpendLKR.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Electricity, water, maintenance</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-mono">
            <span>Goldsmith Labor & Casting</span>
            <Building2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 mt-2 font-mono">
            {settings.currencySymbol} {laborSpendLKR.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Making charges & lapidary</div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search title, payee, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 px-3 py-1.5 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Categories</option>
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 px-3 py-1.5 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Payment Methods</option>
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Cheque">Cheque</option>
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#090d15] text-[11px] text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Date & Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Payee / Vendor</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4 text-right">Amount (LKR)</th>
                <th className="py-3 px-4 text-center">Receipt</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No expense records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{exp.title}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {exp.date} • By {exp.recordedBy}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-slate-800 text-amber-300 border border-slate-700 rounded text-[11px] font-medium">
                        {exp.category}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-slate-300 font-medium">
                        {exp.payee || 'Direct Vendor'}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-[11px] text-slate-400 font-mono">
                        {exp.paymentMethod}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <span className="font-mono font-bold text-rose-400 text-sm">
                        {settings.currencySymbol} {exp.amountLKR.toLocaleString()}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      {exp.receiptImageUrl ? (
                        <button
                          onClick={() => setViewReceiptUrl(exp.receiptImageUrl!)}
                          className="px-2 py-1 bg-sky-950/80 hover:bg-sky-900 border border-sky-600/40 text-sky-300 rounded text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-600 italic">No bill</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteExpense(exp.id, exp.title)}
                        className="p-1.5 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded-lg cursor-pointer transition-colors"
                        title="Delete expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record New Expense Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsAddModalOpen(false)}
          title="Record Showroom Expense"
          subtitle="Add operating expenses, bills, goldsmith casting costs, or welfare payments"
          maxWidth="xl"
        >
          <form onSubmit={handleAddExpense} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Expense Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Showroom Electricity Bill (CEB) / Goldsmith Labor Charge"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Amount (LKR) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amountLKR || ''}
                  onChange={(e) => setAmountLKR(Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Expense Date *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Payee / Vendor
                </label>
                <input
                  type="text"
                  value={payee}
                  onChange={(e) => setPayee(e.target.value)}
                  placeholder="e.g. CEB / Nimal Lapidary"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Payment Method *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
            </div>

            {/* Receipt Image Upload */}
            <div className="border border-slate-800 rounded-xl p-3 bg-slate-950/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-amber-400" />
                  Attach Bill / Receipt Photo (Optional)
                </span>
                {receiptImageUrl && (
                  <button
                    type="button"
                    onClick={() => setReceiptImageUrl('')}
                    className="text-[10px] text-rose-400 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>

              {receiptImageUrl ? (
                <div className="relative rounded-lg overflow-hidden border border-slate-700 h-28 bg-slate-900 flex items-center justify-center">
                  <img
                    src={receiptImageUrl}
                    alt="Receipt preview"
                    className="h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div
                  onClick={() => receiptInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-amber-400/60 rounded-lg p-3 text-center cursor-pointer transition-colors"
                >
                  <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                  <span className="text-xs text-slate-300 font-medium">Click to upload bill photo (JPG/PNG)</span>
                </div>
              )}
              <input
                ref={receiptInputRef}
                type="file"
                accept="image/*"
                onChange={handleReceiptUpload}
                className="hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Additional Notes / Reference
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes or invoice voucher reference..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg shadow cursor-pointer"
              >
                Save Expense
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Receipt Photo Viewer Modal */}
      {viewReceiptUrl && (
        <Modal
          isOpen={true}
          onClose={() => setViewReceiptUrl(null)}
          title="Expense Voucher / Receipt Document"
          subtitle="Verified payment receipt snapshot"
          maxWidth="lg"
        >
          <div className="space-y-3">
            <div className="rounded-xl overflow-hidden border border-slate-700 bg-black flex items-center justify-center max-h-[70vh]">
              <img
                src={viewReceiptUrl}
                alt="Receipt Full"
                className="max-h-[68vh] object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setViewReceiptUrl(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
