import React, { useState } from 'react';
import { Receipt, Search, Printer, Calendar, DollarSign, User, Building, Plus } from 'lucide-react';
import { EmployeePayment, WorkshopEmployee } from '../../types';
import { StorageService } from '../../services/storage';

interface WorkmanPaymentsListViewProps {
  payments: EmployeePayment[];
  workmen: WorkshopEmployee[];
  onNewPaymentInvoice: () => void;
  onViewVoucher: (payment: EmployeePayment) => void;
}

export const WorkmanPaymentsListView: React.FC<WorkmanPaymentsListViewProps> = ({
  payments,
  workmen,
  onNewPaymentInvoice,
  onViewVoucher,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  const filteredPayments = payments.filter((p) => {
    const matchSearch =
      searchTerm === '' ||
      (p.voucherNumber && p.voucherNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      p.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.workshopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.orderNumber && p.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.notes && p.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchType = typeFilter === 'All' || p.paymentType === typeFilter;

    return matchSearch && matchType;
  });

  const totalDisbursed = filteredPayments.reduce((acc, p) => acc + (p.amountLKR || 0), 0);

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-semibold uppercase">Total Disbursed Wages</span>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
              Rs. {totalDisbursed.toLocaleString()}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-semibold uppercase">Payment Invoices Issued</span>
            <div className="text-xl font-bold font-mono text-blue-400 mt-0.5">
              {payments.length} Vouchers
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-semibold uppercase">Artisans on Payroll</span>
            <div className="text-xl font-bold font-mono text-amber-400 mt-0.5">
              {workmen.length} Craftsmen
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by voucher #, workman, or workshop..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Payment Types</option>
            <option value="Salary">Salary</option>
            <option value="Per-Piece">Per-Piece</option>
            <option value="Commission">Commission</option>
            <option value="Overtime">Overtime</option>
            <option value="Bonus">Bonus</option>
            <option value="Advance">Advance</option>
          </select>
        </div>

        <button
          onClick={onNewPaymentInvoice}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow transition-all shrink-0"
        >
          <Receipt className="w-4 h-4" />
          <span>Add Workman to Payment Invoice</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Voucher # / Date</th>
                <th className="py-3 px-4">Workman / Artisan</th>
                <th className="py-3 px-4">Workshop</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-right">Gross (Rs.)</th>
                <th className="py-3 px-4 text-right">Deductions</th>
                <th className="py-3 px-4 text-right">Net Paid (Rs.)</th>
                <th className="py-3 px-4">Method & Cashier</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <Receipt className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    No payment invoices found. Click "Add Workman to Payment Invoice" to generate one.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-blue-400">{p.voucherNumber || p.id}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{p.paymentDate}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-200">{p.employeeName}</div>
                      {p.orderNumber && (
                        <div className="text-[10px] text-amber-400 font-mono">Job #{p.orderNumber}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <div className="truncate max-w-[140px]">{p.workshopName}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-200 border border-slate-700">
                        {p.paymentType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-300">
                      {StorageService.formatLKR(p.grossAmountLKR || p.amountLKR)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-rose-400">
                      {(p.deductionsLKR || 0) > 0 ? `- ${StorageService.formatLKR(p.deductionsLKR || 0)}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400 text-sm">
                      {StorageService.formatLKR(p.amountLKR)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-200 font-medium">{p.paymentMethod || 'Cash'}</div>
                      <div className="text-[10px] text-slate-400">{p.recordedBy}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onViewVoucher(p)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded border border-slate-700 text-[11px] font-semibold transition-all inline-flex items-center gap-1"
                        title="View / Print Voucher"
                      >
                        <Printer className="w-3.5 h-3.5 text-amber-400" />
                        <span>Print</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
