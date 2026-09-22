import React, { useState, useEffect } from 'react';
import { Receipt, User, Calendar, CreditCard, DollarSign, Building, AlertCircle } from 'lucide-react';
import { WorkshopEmployee, WorkshopOrder, PaymentMethod, EmployeePayment, User as SystemUser } from '../../types';
import { StorageService } from '../../services/storage';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';

interface WorkmanPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  workmen: WorkshopEmployee[];
  orders: WorkshopOrder[];
  currentUser: SystemUser;
  preselectedWorkmanId?: string;
  onPaymentCreated: (payment: EmployeePayment) => void;
}

export const WorkmanPaymentModal: React.FC<WorkmanPaymentModalProps> = ({
  isOpen,
  onClose,
  workmen,
  orders,
  currentUser,
  preselectedWorkmanId,
  onPaymentCreated,
}) => {
  const { showToast } = useToast();

  const [selectedWorkmanId, setSelectedWorkmanId] = useState<string>(
    preselectedWorkmanId || workmen[0]?.id || ''
  );

  const selectedWorkman = workmen.find((w) => w.id === selectedWorkmanId) || workmen[0];

  const [voucherNo, setVoucherNo] = useState<string>(`WPV-${Date.now().toString().slice(-6)}`);
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [paymentType, setPaymentType] = useState<
    'Salary' | 'Overtime' | 'Commission' | 'Per-Piece' | 'Bonus' | 'Advance'
  >('Salary');
  const [linkedOrderId, setLinkedOrderId] = useState<string>('');
  const [grossAmount, setGrossAmount] = useState<number>(
    selectedWorkman?.dailyRateOrSalaryLKR || 75000
  );
  const [deductions, setDeductions] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [notes, setNotes] = useState<string>('');

  // Update defaults when selected workman changes
  useEffect(() => {
    if (selectedWorkman) {
      setGrossAmount(selectedWorkman.dailyRateOrSalaryLKR || 75000);
      setVoucherNo(`WPV-${Date.now().toString().slice(-6)}`);
    }
  }, [selectedWorkmanId]);

  useEffect(() => {
    if (preselectedWorkmanId) {
      setSelectedWorkmanId(preselectedWorkmanId);
    }
  }, [preselectedWorkmanId]);

  const netPayable = Math.max(0, (grossAmount || 0) - (deductions || 0));

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedWorkman) {
      showToast('Please select a workman first', 'error');
      return;
    }

    if (netPayable <= 0) {
      showToast('Net payment amount must be greater than zero', 'error');
      return;
    }

    const linkedOrder = orders.find((o) => o.id === linkedOrderId);

    const payment: EmployeePayment = {
      id: `ep-${Date.now()}`,
      voucherNumber: voucherNo,
      employeeId: selectedWorkman.id,
      employeeName: selectedWorkman.name,
      workshopId: selectedWorkman.workshopId,
      workshopName: selectedWorkman.workshopName,
      paymentDate,
      paymentType,
      grossAmountLKR: grossAmount,
      deductionsLKR: deductions,
      amountLKR: netPayable,
      paymentMethod,
      orderNumber: linkedOrder?.orderNumber,
      notes: notes.trim() || `${paymentType} disbursement voucher for ${selectedWorkman.name}`,
      recordedBy: currentUser.name,
    };

    StorageService.addEmployeePayment(payment);
    showToast(
      `Payment invoice voucher #${payment.voucherNumber} created for ${payment.employeeName} (Rs. ${payment.amountLKR.toLocaleString()})!`,
      'success'
    );

    onPaymentCreated(payment);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Workman to Payment Invoice"
      subtitle="Issue an official wage disbursement invoice and print cash payment voucher"
      maxWidth="xl"
    >
      <form onSubmit={handleFormSubmit} className="space-y-4">
        {/* Workman Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
            Select Workman / Craftsman *
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-amber-400 absolute left-3 top-2.5" />
            <select
              value={selectedWorkmanId}
              onChange={(e) => setSelectedWorkmanId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:border-amber-500"
            >
              {workmen.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} — {w.role} ({w.workshopName})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Workman Details Card */}
        {selectedWorkman && (
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Workshop:</span>
              <span className="font-bold text-slate-200 truncate block">{selectedWorkman.workshopName}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Craft Role:</span>
              <span className="font-bold text-amber-400 truncate block">{selectedWorkman.role}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Base Retainer:</span>
              <span className="font-bold font-mono text-slate-200 block">
                Rs. {selectedWorkman.dailyRateOrSalaryLKR.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Paid to Date:</span>
              <span className="font-bold font-mono text-emerald-400 block">
                Rs. {selectedWorkman.totalPaidLKR.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* Voucher # & Payment Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Payment Invoice / Voucher #
            </label>
            <div className="relative">
              <Receipt className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={voucherNo}
                onChange={(e) => setVoucherNo(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 font-mono font-bold focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Disbursement Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Payment Classification & Linked Work Order */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Payment Type / Classification *
            </label>
            <select
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:border-amber-500"
            >
              <option value="Salary">Monthly Base Salary / Retainer</option>
              <option value="Per-Piece">Per-Piece Job Making Charge</option>
              <option value="Commission">Craftsmanship Commission</option>
              <option value="Overtime">Overtime / Bench Rush Charge</option>
              <option value="Bonus">Festival / Performance Bonus</option>
              <option value="Advance">Artisan Salary Advance</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Linked Custom Order (Optional)
            </label>
            <select
              value={linkedOrderId}
              onChange={(e) => setLinkedOrderId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:border-amber-500"
            >
              <option value="">None / General Workshop Labor</option>
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.orderNumber} — {o.productOrItemName} ({o.customerName})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Monetary Calculations */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Gross Labor Amount (Rs.) *
            </label>
            <input
              type="number"
              min={1}
              step={500}
              required
              value={grossAmount}
              onChange={(e) => setGrossAmount(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono font-bold focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Deductions / Recovery (Rs.)
            </label>
            <input
              type="number"
              min={0}
              step={500}
              value={deductions}
              onChange={(e) => setDeductions(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-rose-400 font-mono font-bold focus:outline-none focus:border-amber-500"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Net Payable (Rs.)
            </label>
            <div className="w-full bg-emerald-950/40 border border-emerald-500/40 rounded-lg px-3 py-2 text-sm text-emerald-400 font-mono font-black flex items-center justify-between">
              <span>Rs.</span>
              <span>{netPayable.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Payment Method & Cashier */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Disbursement Method *
            </label>
            <div className="relative">
              <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-amber-500"
              >
                <option value="Cash">Cash from Cash Register / Safe</option>
                <option value="Bank Transfer">Direct Bank Transfer / Wire</option>
                <option value="Cheque">Company Cheque</option>
                <option value="Online">Online Banking Transfer</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Authorized Cashier / Disbursed By
            </label>
            <input
              type="text"
              disabled
              value={currentUser.name}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-400 font-medium"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
            Payment Notes / Memo
          </label>
          <input
            type="text"
            placeholder="e.g. Completed hand engraving and melee setting on diamond bridal band"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs flex items-center gap-2 shadow-md shadow-blue-900/30 transition-all"
          >
            <Receipt className="w-4 h-4" />
            Generate Payment Invoice & Issue Voucher
          </button>
        </div>
      </form>
    </Modal>
  );
};
