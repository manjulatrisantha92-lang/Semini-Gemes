import React from 'react';
import { Printer, CheckCircle2, Building, User, Calendar, Receipt } from 'lucide-react';
import { EmployeePayment, WorkshopEmployee, AppSettings } from '../../types';
import { StorageService } from '../../services/storage';
import { Modal } from '../common/Modal';

interface WorkmanPaymentVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: EmployeePayment | null;
  settings: AppSettings;
  workmen: WorkshopEmployee[];
}

export const WorkmanPaymentVoucherModal: React.FC<WorkmanPaymentVoucherModalProps> = ({
  isOpen,
  onClose,
  payment,
  settings,
  workmen,
}) => {
  if (!payment) return null;

  const employee = workmen.find((w) => w.id === payment.employeeId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Workman Payment Invoice Voucher — ${payment.voucherNumber || payment.id}`}
      subtitle="Official artisan wage disbursement voucher with legal bench acknowledgment"
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Controls Bar */}
        <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-2 shadow"
          >
            <Printer className="w-4 h-4" />
            Print Payment Voucher (A4 / 80mm)
          </button>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Payment Status:</span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              DISBURSED & PAID
            </span>
          </div>
        </div>

        {/* Printable Voucher Paper */}
        <div
          id="printable-workman-voucher"
          className="bg-white text-slate-900 rounded-lg p-6 sm:p-8 shadow-2xl border border-slate-300 font-sans mx-auto max-w-xl"
        >
          {/* Header */}
          <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
            <h1 className="text-lg font-black uppercase text-slate-900 font-serif">
              {settings.companyName}
            </h1>
            <p className="text-[11px] text-slate-600">{settings.companyAddress || (settings as any).address}</p>
            <p className="text-[11px] text-slate-600">Hotline: {settings.telephone}</p>
            <div className="inline-block mt-2 px-3 py-1 bg-slate-900 text-amber-400 text-xs font-bold uppercase tracking-wider rounded font-mono">
              WORKMAN PAYMENT INVOICE & WAGE VOUCHER
            </div>
          </div>

          {/* Meta Info */}
          <div className="grid grid-cols-2 text-xs mb-4 pb-3 border-b border-slate-200">
            <div>
              <div className="text-slate-500 text-[10px] uppercase font-bold">Voucher No:</div>
              <div className="font-mono font-bold text-slate-900 text-sm">
                {payment.voucherNumber || payment.id}
              </div>
              <div className="text-slate-500 text-[10px] uppercase font-bold mt-1.5">Payment Type:</div>
              <div className="font-bold text-amber-800 uppercase">
                {payment.paymentType} {payment.orderNumber ? `(Job #${payment.orderNumber})` : ''}
              </div>
            </div>
            <div className="text-right">
              <div className="text-slate-500 text-[10px] uppercase font-bold">Date:</div>
              <div className="font-mono text-slate-900 font-bold">{payment.paymentDate}</div>
              <div className="text-slate-500 text-[10px] uppercase font-bold mt-1.5">Disbursed By:</div>
              <div className="font-medium text-slate-900">{payment.recordedBy}</div>
            </div>
          </div>

          {/* Workman Card */}
          <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs mb-4 grid grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Artisan Name:</span>
              <div className="font-black text-slate-900 text-sm">{payment.employeeName}</div>
              <div className="text-slate-600 text-[11px] mt-0.5">NIC: {employee?.nic || 'Registered Craftsman'}</div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Workshop Guild:</span>
              <div className="font-bold text-slate-900">{payment.workshopName}</div>
              <div className="text-slate-600 text-[11px] mt-0.5">Role: {employee?.role || 'Master Bench Artisan'}</div>
            </div>
          </div>

          {/* Breakdown Table */}
          <table className="w-full text-left text-xs mb-4 border border-slate-200">
            <thead className="bg-slate-100 text-[10px] uppercase font-mono border-b border-slate-200">
              <tr>
                <th className="py-2 px-3">Description / Wage Item</th>
                <th className="py-2 px-3 text-right">Amount (LKR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-2.5 px-3 font-medium">
                  {payment.paymentType} Disbursement ({payment.notes || 'Bench craft labor'})
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                  {StorageService.formatLKR(payment.grossAmountLKR || payment.amountLKR)}
                </td>
              </tr>
              {(payment.deductionsLKR || 0) > 0 && (
                <tr className="text-rose-700 bg-rose-50/50">
                  <td className="py-2 px-3">Less: Material / Advance Deductions</td>
                  <td className="py-2 px-3 text-right font-mono font-bold">
                    - {StorageService.formatLKR(payment.deductionsLKR || 0)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Total */}
          <div className="bg-slate-50 p-3 rounded-lg border-2 border-slate-900 mb-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-black text-slate-600 block">
                Net Disbursed Amount ({payment.paymentMethod || 'Cash'}):
              </span>
              <span className="text-xs text-slate-500 italic">
                Paid in full from showroom accounts
              </span>
            </div>
            <div className="text-right">
              <span className="font-mono text-xl font-black text-slate-950">
                {StorageService.formatLKR(payment.amountLKR)}
              </span>
            </div>
          </div>

          {payment.notes && (
            <div className="mb-4 text-[11px] text-slate-600 italic bg-slate-50/70 p-2 rounded border border-slate-200">
              Memo: {payment.notes}
            </div>
          )}

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t-2 border-dashed border-slate-300 text-center text-[10px] text-slate-600">
            <div>
              <div className="border-b border-slate-400 pb-8 mb-1"></div>
              <span className="font-bold uppercase text-slate-800">Workman Acknowledged</span>
              <span className="block text-[9px] text-slate-500">Signature of Artisan</span>
            </div>
            <div>
              <div className="border-b border-slate-400 pb-8 mb-1"></div>
              <span className="font-bold uppercase text-slate-800">Guild Master / Authorized</span>
              <span className="block text-[9px] text-slate-500">Workshop Manager</span>
            </div>
            <div>
              <div className="border-b border-slate-400 pb-8 mb-1"></div>
              <span className="font-bold uppercase text-slate-800">Disbursed Cashier</span>
              <span className="block text-[9px] text-slate-500">{payment.recordedBy}</span>
            </div>
          </div>

          <div className="mt-6 text-center text-[9px] text-slate-400 border-t border-slate-200 pt-2">
            Official Internal Accounting Document — Retain for Showroom & Guild Audit
          </div>
        </div>
      </div>
    </Modal>
  );
};
