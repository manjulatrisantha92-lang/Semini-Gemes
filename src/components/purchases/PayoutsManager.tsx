import React, { useState, useRef } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Calendar,
  Filter,
  Trash2,
  Eye,
  Upload,
  Printer,
  FileCheck2,
  CheckCircle2,
  ArrowUpRight,
  Building,
  UserCheck,
  Briefcase,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Payout, PayoutRecipientType, PaymentMethod, AppSettings, User } from '../../types';
import { StorageService } from '../../services/storage';
import { useToast } from '../common/Toast';
import { Modal } from '../common/Modal';

interface PayoutsManagerProps {
  settings: AppSettings;
  currentUser?: User | null;
}

const RECIPIENT_TYPES: { id: PayoutRecipientType; label: string }[] = [
  { id: 'Supplier', label: 'Gem / Gold Bullion Supplier' },
  { id: 'Goldsmith / Workshop', label: 'Goldsmith / Casting Workshop' },
  { id: 'Staff', label: 'Showroom Staff (Advance / Incentive)' },
  { id: 'Owner Drawing', label: 'Owner Capital Drawing' },
  { id: 'Gem Dealer / Broker', label: 'Gem Dealer / Broker Commission' },
  { id: 'Other', label: 'Other Settlement' },
];

export const PayoutsManager: React.FC<PayoutsManagerProps> = ({ settings, currentUser }) => {
  const { showToast } = useToast();

  const [payouts, setPayouts] = useState<Payout[]>(() => StorageService.getPayouts());
  const [searchQuery, setSearchQuery] = useState('');
  const [recipientFilter, setRecipientFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [printablePayout, setPrintablePayout] = useState<Payout | null>(null);
  const [viewSlipUrl, setViewSlipUrl] = useState<string | null>(null);

  // Form State
  const [payoutNumber, setPayoutNumber] = useState(
    `PAY-${new Date().getFullYear()}-${String(payouts.length + 1).padStart(3, '0')}`
  );
  const [recipientType, setRecipientType] = useState<PayoutRecipientType>('Supplier');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [amountLKR, setAmountLKR] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [purpose, setPurpose] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [slipImageUrl, setSlipImageUrl] = useState('');

  const slipInputRef = useRef<HTMLInputElement>(null);

  // Upload handler
  const handleSlipUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('image/')) {
      showToast('Please upload a valid JPG or PNG image.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSlipImageUrl(reader.result as string);
      showToast(`Payout slip "${file.name}" attached.`, 'success');
    };
    reader.readAsDataURL(file);
  };

  // Submit new payout
  const handleAddPayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim()) {
      showToast('Please provide recipient name.', 'error');
      return;
    }
    if (amountLKR <= 0) {
      showToast('Amount must be greater than zero.', 'error');
      return;
    }
    if (!purpose.trim()) {
      showToast('Please specify the payout purpose.', 'error');
      return;
    }

    const newPayout: Payout = {
      id: `payout-${Date.now()}`,
      payoutNumber,
      recipientType,
      recipientName: recipientName.trim(),
      recipientPhone: recipientPhone.trim() || undefined,
      amountLKR,
      paymentMethod,
      referenceNumber: referenceNumber.trim() || undefined,
      purpose: purpose.trim(),
      date,
      slipImageUrl: slipImageUrl || undefined,
      authorizedBy: currentUser?.name || 'Managing Director',
      createdAt: new Date().toISOString(),
    };

    StorageService.addPayout(newPayout);
    setPayouts(StorageService.getPayouts());
    showToast(`Payout ${payoutNumber} of ${settings.currencySymbol} ${amountLKR.toLocaleString()} disbursed.`, 'success');

    // Reset Form
    setPayoutNumber(`PAY-${new Date().getFullYear()}-${String(payouts.length + 2).padStart(3, '0')}`);
    setRecipientName('');
    setRecipientPhone('');
    setAmountLKR(0);
    setReferenceNumber('');
    setPurpose('');
    setSlipImageUrl('');
    setIsAddModalOpen(false);
  };

  // Delete Payout
  const handleDeletePayout = (id: string, no: string) => {
    if (window.confirm(`Are you sure you want to cancel / delete payout voucher ${no}?`)) {
      StorageService.deletePayout(id);
      setPayouts(StorageService.getPayouts());
      showToast('Payout record deleted.', 'info');
    }
  };

  // Filtered payouts
  const filteredPayouts = payouts.filter((p) => {
    const matchesSearch =
      searchQuery === '' ||
      p.payoutNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.referenceNumber && p.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRecipient = recipientFilter === 'all' || p.recipientType === recipientFilter;
    const matchesPayment = paymentFilter === 'all' || p.paymentMethod === paymentFilter;

    return matchesSearch && matchesRecipient && matchesPayment;
  });

  // Aggregates
  const totalPayoutLKR = payouts.reduce((sum, p) => sum + p.amountLKR, 0);
  const supplierPayoutLKR = payouts
    .filter((p) => p.recipientType === 'Supplier')
    .reduce((sum, p) => sum + p.amountLKR, 0);
  const workshopPayoutLKR = payouts
    .filter((p) => p.recipientType === 'Goldsmith / Workshop')
    .reduce((sum, p) => sum + p.amountLKR, 0);
  const staffPayoutLKR = payouts
    .filter((p) => p.recipientType === 'Staff')
    .reduce((sum, p) => sum + p.amountLKR, 0);

  return (
    <div className="space-y-5">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white font-serif flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-400" />
            Cash & Supplier Disbursements (Payouts)
          </h2>
          <p className="text-xs text-slate-400">
            Issue authorized payout vouchers to gem suppliers, casting workshops, staff advances, and owners.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Issue Payout Voucher</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-mono">
            <span>Total Disbursed</span>
            <ArrowUpRight className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold text-rose-400 mt-2 font-mono">
            {settings.currencySymbol} {totalPayoutLKR.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{payouts.length} payout vouchers</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-mono">
            <span>Supplier Payments</span>
            <Building className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-400 mt-2 font-mono">
            {settings.currencySymbol} {supplierPayoutLKR.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Rough / cut gems settlements</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-mono">
            <span>Goldsmith Workshops</span>
            <Briefcase className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-bold text-sky-400 mt-2 font-mono">
            {settings.currencySymbol} {workshopPayoutLKR.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Making & setting charges</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-mono">
            <span>Staff & Advances</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 mt-2 font-mono">
            {settings.currencySymbol} {staffPayoutLKR.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Advances & incentives</div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search voucher #, recipient, purpose..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={recipientFilter}
            onChange={(e) => setRecipientFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 px-3 py-1.5 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Recipient Types</option>
            {RECIPIENT_TYPES.map((rec) => (
              <option key={rec.id} value={rec.id}>
                {rec.label}
              </option>
            ))}
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 px-3 py-1.5 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Payment Modes</option>
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Cheque">Cheque</option>
          </select>
        </div>
      </div>

      {/* Payouts Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#090d15] text-[11px] text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Voucher & Date</th>
                <th className="py-3 px-4">Recipient</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Purpose</th>
                <th className="py-3 px-4">Method & Ref</th>
                <th className="py-3 px-4 text-right">Amount (LKR)</th>
                <th className="py-3 px-4 text-center">Slip / Print</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPayouts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No disbursement records found.
                  </td>
                </tr>
              ) : (
                filteredPayouts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono">
                      <div className="font-bold text-amber-300">{p.payoutNumber}</div>
                      <div className="text-[10px] text-slate-500">{p.date}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{p.recipientName}</div>
                      {p.recipientPhone && (
                        <div className="text-[10px] text-slate-400 font-mono">
                          {p.recipientPhone}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 rounded text-[11px]">
                        {p.recipientType}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-slate-300 max-w-xs truncate">{p.purpose}</div>
                      <div className="text-[10px] text-slate-500">Auth: {p.authorizedBy}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-slate-300 font-medium">{p.paymentMethod}</div>
                      {p.referenceNumber && (
                        <div className="text-[10px] text-slate-500 font-mono">
                          Ref: {p.referenceNumber}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-400 text-sm">
                      {settings.currencySymbol} {p.amountLKR.toLocaleString()}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setPrintablePayout(p)}
                          className="px-2 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded text-[10px] flex items-center gap-1 cursor-pointer"
                          title="Print Payment Voucher"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Voucher</span>
                        </button>
                        {p.slipImageUrl && (
                          <button
                            onClick={() => setViewSlipUrl(p.slipImageUrl!)}
                            className="p-1 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded text-[10px]"
                            title="View Bank / Cash Slip"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeletePayout(p.id, p.payoutNumber)}
                        className="p-1.5 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded-lg cursor-pointer transition-colors"
                        title="Delete voucher"
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

      {/* Issue Payout Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsAddModalOpen(false)}
          title="Issue Showroom Disbursement / Payout Voucher"
          subtitle="Disburse funds to suppliers, goldsmith workshops, or staff"
          maxWidth="xl"
        >
          <form onSubmit={handleAddPayout} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Voucher Number
                </label>
                <input
                  type="text"
                  required
                  value={payoutNumber}
                  onChange={(e) => setPayoutNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono font-bold text-amber-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Disbursement Date *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Recipient Type *
                </label>
                <select
                  value={recipientType}
                  onChange={(e) => setRecipientType(e.target.value as PayoutRecipientType)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  {RECIPIENT_TYPES.map((rec) => (
                    <option key={rec.id} value={rec.id}>
                      {rec.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Recipient Name *
                </label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. Ratnapura Gem Miners Ltd"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Phone / Contact
                </label>
                <input
                  type="text"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="e.g. 077 123 4567"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono font-bold text-amber-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Payment Method *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Cheque / Bank Ref No.
                </label>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="e.g. CHQ-991204 / TRF-881"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Purpose / Remarks *
              </label>
              <textarea
                required
                rows={2}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Detail reason for payout, e.g. Settlement for 3x Uncut Blue Sapphires consignment..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
              />
            </div>

            {/* Slip Upload */}
            <div className="border border-slate-800 rounded-xl p-3 bg-slate-950/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  Attach Bank Deposit / Signed Voucher Slip
                </span>
                {slipImageUrl && (
                  <button
                    type="button"
                    onClick={() => setSlipImageUrl('')}
                    className="text-[10px] text-rose-400 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>

              {slipImageUrl ? (
                <div className="relative rounded-lg overflow-hidden border border-slate-700 h-24 bg-slate-900 flex items-center justify-center">
                  <img
                    src={slipImageUrl}
                    alt="Slip preview"
                    className="h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div
                  onClick={() => slipInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-amber-400/60 rounded-lg p-3 text-center cursor-pointer transition-colors"
                >
                  <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                  <span className="text-xs text-slate-300">Upload signed slip / bank receipt</span>
                </div>
              )}
              <input
                ref={slipInputRef}
                type="file"
                accept="image/*"
                onChange={handleSlipUpload}
                className="hidden"
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
                Disburse & Issue Voucher
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Printable Payout Voucher Modal */}
      {printablePayout && (
        <Modal
          isOpen={true}
          onClose={() => setPrintablePayout(null)}
          title={`Disbursement Voucher — ${printablePayout.payoutNumber}`}
          subtitle="Official cash / bank payment voucher"
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => window.print()}
                className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 shadow cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Paper Voucher</span>
              </button>
            </div>

            {/* Printable Voucher Paper Slip */}
            <div className="bg-white text-slate-900 rounded-lg p-6 border border-slate-300 shadow-md font-sans text-xs space-y-4">
              <div className="flex items-start justify-between border-b-2 border-amber-600 pb-3">
                <div>
                  <h1 className="text-lg font-black font-serif text-slate-950">
                    {settings.companyName}
                  </h1>
                  <p className="text-[10px] text-slate-600">
                    {settings.companyAddress} • Tel: {settings.telephone}
                  </p>
                </div>
                <div className="text-right">
                  <div className="inline-block px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px] uppercase rounded">
                    PAYMENT VOUCHER
                  </div>
                  <div className="font-mono font-bold text-sm text-slate-900 mt-1">
                    {printablePayout.payoutNumber}
                  </div>
                  <div className="text-[10px] text-slate-500">Date: {printablePayout.date}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">PAID TO:</span>
                  <div className="font-bold text-sm text-slate-900 mt-0.5">
                    {printablePayout.recipientName}
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Category: {printablePayout.recipientType}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    PAYMENT METHOD:
                  </span>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {printablePayout.paymentMethod}
                  </div>
                  {printablePayout.referenceNumber && (
                    <div className="text-[11px] text-slate-600 font-mono">
                      Ref: {printablePayout.referenceNumber}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">
                  PURPOSE / PARTICULARS:
                </span>
                <p className="text-xs text-slate-800 mt-1 p-2 bg-slate-50 rounded border border-slate-200 leading-relaxed font-medium">
                  {printablePayout.purpose}
                </p>
              </div>

              <div className="flex justify-between items-center p-3 bg-amber-50 rounded border border-amber-300 text-amber-950 font-mono font-bold text-base">
                <span>TOTAL AMOUNT PAID:</span>
                <span>
                  {settings.currencySymbol} {printablePayout.amountLKR.toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-8 text-center text-[10px] text-slate-600">
                <div>
                  <div className="border-t border-slate-400 pt-1 font-bold">
                    Prepared / Authorized By ({printablePayout.authorizedBy})
                  </div>
                </div>
                <div>
                  <div className="border-t border-slate-400 pt-1 font-bold">
                    Recipient Signature & Date
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Slip Viewer Modal */}
      {viewSlipUrl && (
        <Modal
          isOpen={true}
          onClose={() => setViewSlipUrl(null)}
          title="Disbursement Slip Document"
          subtitle="Bank receipt / Signed payment slip"
          maxWidth="lg"
        >
          <div className="space-y-3">
            <div className="rounded-xl overflow-hidden border border-slate-700 bg-black flex items-center justify-center max-h-[70vh]">
              <img
                src={viewSlipUrl}
                alt="Slip Full"
                className="max-h-[68vh] object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setViewSlipUrl(null)}
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
