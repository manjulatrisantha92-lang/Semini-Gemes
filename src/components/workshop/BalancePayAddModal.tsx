import React, { useState, useEffect } from 'react';
import { DollarSign, CheckCircle2, User, Building, Receipt, CreditCard, Search } from 'lucide-react';
import { WorkshopOrder, PaymentMethod, User as SystemUser, Invoice } from '../../types';
import { StorageService } from '../../services/storage';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';

interface BalancePayAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: WorkshopOrder[];
  currentUser: SystemUser;
  preselectedOrderId?: string;
  onBalancePaid: (invoice?: Invoice) => void;
}

export const BalancePayAddModal: React.FC<BalancePayAddModalProps> = ({
  isOpen,
  onClose,
  orders,
  currentUser,
  preselectedOrderId,
  onBalancePaid,
}) => {
  const { showToast } = useToast();

  // Filter orders with positive balance due
  const ordersWithBalance = orders.filter(
    (o) => (o.balanceDueLKR !== undefined ? o.balanceDueLKR : o.balancePaymentLKR || 0) > 0
  );

  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    preselectedOrderId || ordersWithBalance[0]?.id || orders[0]?.id || ''
  );

  const selectedOrder =
    orders.find((o) => o.id === selectedOrderId) || ordersWithBalance[0] || orders[0];

  const initialBalance = selectedOrder
    ? selectedOrder.balanceDueLKR !== undefined
      ? selectedOrder.balanceDueLKR
      : selectedOrder.balancePaymentLKR || 0
    : 0;

  const [paymentAmount, setPaymentAmount] = useState<number>(initialBalance);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [notes, setNotes] = useState<string>('Final balance settled. Item inspected and delivered to client.');

  useEffect(() => {
    if (selectedOrder) {
      const bal =
        selectedOrder.balanceDueLKR !== undefined
          ? selectedOrder.balanceDueLKR
          : selectedOrder.balancePaymentLKR || 0;
      setPaymentAmount(bal);
    }
  }, [selectedOrderId]);

  useEffect(() => {
    if (preselectedOrderId) {
      setSelectedOrderId(preselectedOrderId);
    }
  }, [preselectedOrderId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedOrder) {
      showToast('Please select an order with balance due', 'error');
      return;
    }

    if (paymentAmount <= 0) {
      showToast('Payment amount must be greater than zero', 'error');
      return;
    }

    try {
      const result = StorageService.settleWorkOrderBalance(
        selectedOrder.id,
        paymentAmount,
        paymentMethod,
        currentUser.name
      );

      showToast(
        `Balance payment of Rs. ${paymentAmount.toLocaleString()} recorded for Order #${selectedOrder.orderNumber}!`,
        'success'
      );

      onBalancePaid(result.invoice);
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to settle balance', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Balance Pay Add (Order Settlement)"
      subtitle="Settle outstanding balance on completed or in-progress custom jewelry orders"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Order Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
            Select Order with Outstanding Balance *
          </label>
          {ordersWithBalance.length === 0 ? (
            <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-lg p-3 text-xs text-emerald-300">
              All workshop orders are currently settled in full! You may select any order below if extra balance applies:
            </div>
          ) : null}
          <select
            value={selectedOrderId}
            onChange={(e) => setSelectedOrderId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:border-emerald-400 mt-1"
          >
            {(ordersWithBalance.length > 0 ? ordersWithBalance : orders).map((o) => {
              const bal = o.balanceDueLKR !== undefined ? o.balanceDueLKR : o.balancePaymentLKR || 0;
              return (
                <option key={o.id} value={o.id}>
                  {o.orderNumber} — {o.customerName} ({o.productOrItemName}) [Bal Due: Rs. {bal.toLocaleString()}]
                </option>
              );
            })}
          </select>
        </div>

        {/* Selected Order Summary Card */}
        {selectedOrder && (
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <span className="font-mono font-bold text-amber-400 text-sm">{selectedOrder.orderNumber}</span>
                <span className="text-slate-400 ml-2">({selectedOrder.productOrItemName})</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                {selectedOrder.status}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Client:</span>
                <span className="font-bold text-slate-200 block truncate">{selectedOrder.customerName}</span>
                <span className="text-[10px] text-slate-400">{selectedOrder.customerPhone}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Workshop:</span>
                <span className="font-bold text-slate-200 block truncate">{selectedOrder.workshopName}</span>
                <span className="text-[10px] text-slate-400">Due: {selectedOrder.requiredDate}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Total Job Cost:</span>
                <span className="font-mono font-bold text-slate-100 block">
                  Rs. {selectedOrder.estimatedCostLKR.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800 mt-2">
              <div>
                <span className="text-[10px] text-slate-400 block">Advance Paid Earlier:</span>
                <span className="font-mono font-bold text-emerald-400">
                  Rs. {(selectedOrder.advancePaymentLKR || 0).toLocaleString()}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-semibold">Remaining Balance Due:</span>
                <span className="font-mono font-black text-rose-400 text-base">
                  Rs.{' '}
                  {(
                    selectedOrder.balanceDueLKR !== undefined
                      ? selectedOrder.balanceDueLKR
                      : selectedOrder.balancePaymentLKR || 0
                  ).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Payment Amount & Method */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Balance Payment to Settle (Rs.) *
            </label>
            <input
              type="number"
              required
              min={1}
              step={100}
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-emerald-500/50 rounded-lg px-3 py-2 text-base text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-400"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Defaults to full balance due. Partial settlement is also permitted.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Payment Method *
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-emerald-400"
            >
              <option value="Cash">Cash (Immediate Receipt)</option>
              <option value="Credit Card">Credit Card (POS Terminal)</option>
              <option value="Bank Transfer">Direct Bank Transfer</option>
              <option value="Cheque">Cheque</option>
              <option value="Online">Online Banking Transfer</option>
            </select>
          </div>
        </div>

        {/* Cashier & Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Received By / Cashier
            </label>
            <input
              type="text"
              disabled
              value={currentUser.name}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-400 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Settlement Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400"
              placeholder="e.g. Order delivered and certificate given"
            />
          </div>
        </div>

        {/* Action Buttons */}
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
            <CheckCircle2 className="w-4 h-4" />
            Confirm Payment & Settle Balance
          </button>
        </div>
      </form>
    </Modal>
  );
};
