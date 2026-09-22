import React, { useState } from 'react';
import { Coins, User, Building, Receipt, CreditCard, DollarSign, Calendar, CheckCircle2 } from 'lucide-react';
import { WorkshopOrder, Workshop, WorkshopEmployee, PaymentMethod, User as SystemUser, Invoice } from '../../types';
import { StorageService } from '../../services/storage';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';

interface AdvancePaymentAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: WorkshopOrder[];
  workshops: Workshop[];
  workmen: WorkshopEmployee[];
  currentUser: SystemUser;
  onAdvanceRecorded: (invoice?: Invoice) => void;
}

export const AdvancePaymentAddModal: React.FC<AdvancePaymentAddModalProps> = ({
  isOpen,
  onClose,
  orders,
  workshops,
  workmen,
  currentUser,
  onAdvanceRecorded,
}) => {
  const { showToast } = useToast();

  const [advanceTarget, setAdvanceTarget] = useState<'order' | 'workshop'>('order');

  // Order Advance state
  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders[0]?.id || '');
  const selectedOrder = orders.find((o) => o.id === selectedOrderId) || orders[0];

  const [orderAdvanceAmount, setOrderAdvanceAmount] = useState<number>(25000);
  const [orderPaymentMethod, setOrderPaymentMethod] = useState<PaymentMethod>('Cash');
  const [orderAdvanceNotes, setOrderAdvanceNotes] = useState<string>('');

  // Workshop / Artisan Advance state
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string>(workshops[0]?.id || '');
  const [wsAdvanceAmount, setWsAdvanceAmount] = useState<number>(50000);
  const [wsPaymentMethod, setWsPaymentMethod] = useState<PaymentMethod>('Cash');
  const [wsAdvanceNotes, setWsAdvanceNotes] = useState<string>('Raw gold melt alloy advance / bench wages');

  const handleOrderAdvanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedOrder) {
      showToast('Please select a workshop order first', 'error');
      return;
    }

    if (orderAdvanceAmount <= 0) {
      showToast('Please enter a valid advance payment amount', 'error');
      return;
    }

    // Call storage service to generate/update work order invoice
    const result = StorageService.createWorkOrderInvoice(
      selectedOrder,
      (selectedOrder.advancePaymentLKR || 0) + orderAdvanceAmount,
      orderPaymentMethod,
      currentUser.name
    );

    showToast(
      `Advance payment of Rs. ${orderAdvanceAmount.toLocaleString()} recorded for Order #${selectedOrder.orderNumber}!`,
      'success'
    );

    onAdvanceRecorded(result.invoice);
    onClose();
  };

  const handleWorkshopAdvanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedWs = workshops.find((w) => w.id === selectedWorkshopId) || workshops[0];
    if (!selectedWs) {
      showToast('Please select a workshop studio', 'error');
      return;
    }

    if (wsAdvanceAmount <= 0) {
      showToast('Please enter a valid advance amount', 'error');
      return;
    }

    StorageService.addWorkshopAdvance({
      id: `wsa-${Date.now()}`,
      paymentNumber: `ADV-${Date.now().toString().slice(-6)}`,
      workshopId: selectedWs.id,
      workshopName: selectedWs.name,
      paymentDate: new Date().toISOString().split('T')[0],
      amountLKR: wsAdvanceAmount,
      paymentMethod: wsPaymentMethod,
      notes: wsAdvanceNotes.trim(),
      recordedBy: currentUser.name,
    });

    showToast(
      `Workshop advance of Rs. ${wsAdvanceAmount.toLocaleString()} disbursed to ${selectedWs.name}!`,
      'success'
    );

    onAdvanceRecorded();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Advance Payment Add"
      subtitle="Record customer job order deposit or disburse bench artisan gold/wage advance"
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Toggle Target Mode */}
        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => setAdvanceTarget('order')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              advanceTarget === 'order'
                ? 'bg-amber-600 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Customer Custom Order Advance</span>
          </button>
          <button
            type="button"
            onClick={() => setAdvanceTarget('workshop')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              advanceTarget === 'workshop'
                ? 'bg-amber-600 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Artisan / Workshop Guild Advance</span>
          </button>
        </div>

        {advanceTarget === 'order' ? (
          <form onSubmit={handleOrderAdvanceSubmit} className="space-y-4">
            {/* Select Order */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Select Custom Order *
              </label>
              <select
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:border-amber-500"
              >
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.orderNumber} — {o.customerName} ({o.productOrItemName}) [Total: Rs. {o.estimatedCostLKR.toLocaleString()} | Bal: Rs. {(o.balanceDueLKR || 0).toLocaleString()}]
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Order Summary Card */}
            {selectedOrder && (
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Customer:</span>
                  <span className="font-bold text-slate-200 block truncate">{selectedOrder.customerName}</span>
                  <span className="text-[10px] text-slate-500">{selectedOrder.customerPhone}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Cost:</span>
                  <span className="font-mono font-bold text-slate-100 block">
                    Rs. {selectedOrder.estimatedCostLKR.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Current Advance:</span>
                  <span className="font-mono font-bold text-emerald-400 block">
                    Rs. {(selectedOrder.advancePaymentLKR || 0).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Remaining Balance:</span>
                  <span className="font-mono font-bold text-rose-400 block">
                    Rs. {(selectedOrder.balanceDueLKR || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Advance Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Advance Payment Amount to Add (Rs.) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  step={500}
                  value={orderAdvanceAmount}
                  onChange={(e) => setOrderAdvanceAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-emerald-500/50 rounded-lg px-3 py-2 text-sm text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Payment Method *
                </label>
                <select
                  value={orderPaymentMethod}
                  onChange={(e) => setOrderPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-amber-500"
                >
                  <option value="Cash">Cash (Immediate Cash Drawer Receipt)</option>
                  <option value="Credit Card">Credit Card (POS Terminal)</option>
                  <option value="Bank Transfer">Bank Transfer / Direct Deposit</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Online">Online Transfer</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Advance Receipt Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Additional advance paid for custom 18K white gold alloy"
                value={orderAdvanceNotes}
                onChange={(e) => setOrderAdvanceNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-2 shadow"
              >
                <Receipt className="w-4 h-4" />
                Record Advance & Generate Invoice Receipt
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleWorkshopAdvanceSubmit} className="space-y-4">
            {/* Select Workshop */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Select Workshop Studio / Goldsmith Guild *
              </label>
              <select
                value={selectedWorkshopId}
                onChange={(e) => setSelectedWorkshopId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:border-amber-500"
              >
                {workshops.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.contactPerson} — {w.specialty})
                  </option>
                ))}
              </select>
            </div>

            {/* Advance Amount & Method */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Disbursement Advance Amount (Rs.) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  step={1000}
                  value={wsAdvanceAmount}
                  onChange={(e) => setWsAdvanceAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-amber-500/50 rounded-lg px-3 py-2 text-sm text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Disbursement Method *
                </label>
                <select
                  value={wsPaymentMethod}
                  onChange={(e) => setWsPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-amber-500"
                >
                  <option value="Cash">Cash from Safe / Showroom</option>
                  <option value="Bank Transfer">Direct Bank Transfer</option>
                  <option value="Cheque">Company Cheque</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Advance Purpose / Material Memo
              </label>
              <input
                type="text"
                placeholder="e.g. Raw gold casting advance for 5 rings"
                value={wsAdvanceNotes}
                onChange={(e) => setWsAdvanceNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-2 shadow"
              >
                <Coins className="w-4 h-4" />
                Disburse Workshop Advance
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
