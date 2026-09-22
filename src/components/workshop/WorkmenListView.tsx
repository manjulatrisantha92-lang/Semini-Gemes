import React, { useState } from 'react';
import { UserPlus, Receipt, Search, Building, Phone, CreditCard, Award, DollarSign, Users } from 'lucide-react';
import { WorkshopEmployee, Workshop } from '../../types';
import { StorageService } from '../../services/storage';

interface WorkmenListViewProps {
  workmen: WorkshopEmployee[];
  workshops: Workshop[];
  onAddWorkman: () => void;
  onPayWorkman: (workmanId: string) => void;
}

export const WorkmenListView: React.FC<WorkmenListViewProps> = ({
  workmen,
  workshops,
  onAddWorkman,
  onPayWorkman,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterWorkshop, setFilterWorkshop] = useState('All');

  const filteredWorkmen = workmen.filter((w) => {
    const matchSearch =
      searchTerm === '' ||
      w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.workshopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.nic && w.nic.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (w.phone && w.phone.includes(searchTerm));

    const matchWorkshop = filterWorkshop === 'All' || w.workshopId === filterWorkshop;

    return matchSearch && matchWorkshop;
  });

  const totalDisbursed = workmen.reduce((acc, w) => acc + (w.totalPaidLKR || 0), 0);

  return (
    <div className="space-y-4">
      {/* Top Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-semibold uppercase">Total Bench Artisans</span>
            <div className="text-xl font-bold font-mono text-amber-400 mt-0.5">{workmen.length} Craftsmen</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-semibold uppercase">Active Guild Workshops</span>
            <div className="text-xl font-bold font-mono text-indigo-400 mt-0.5">{workshops.length} Studios</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Building className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-semibold uppercase">Total Wages Disbursed</span>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
              Rs. {totalDisbursed.toLocaleString()}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search workmen by name, role, NIC, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={filterWorkshop}
            onChange={(e) => setFilterWorkshop(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="All">All Workshops</option>
            {workshops.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={onAddWorkman}
          className="w-full sm:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow transition-all shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Workman</span>
        </button>
      </div>

      {/* Workmen Cards Grid */}
      {filteredWorkmen.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-12 text-center">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-300">No craftsmen found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Get started by registering a master goldsmith or artisan.
          </p>
          <button
            onClick={onAddWorkman}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-xs inline-flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            Add Workman Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkmen.map((workman) => (
            <div
              key={workman.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-xl p-4 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm">{workman.name}</h4>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      {workman.role}
                    </span>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs shrink-0">
                    {workman.name.slice(0, 2).toUpperCase()}
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate text-slate-300">{workman.workshopName}</span>
                  </div>
                  {workman.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="font-mono text-slate-300">{workman.phone}</span>
                    </div>
                  )}
                  {workman.nic && (
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="font-mono text-slate-400">NIC: {workman.nic}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Base Salary / Rate</span>
                    <span className="font-mono font-bold text-slate-200">
                      Rs. {workman.dailyRateOrSalaryLKR.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase block">Total Disbursed</span>
                    <span className="font-mono font-bold text-emerald-400">
                      Rs. {workman.totalPaidLKR.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-800/80">
                <button
                  onClick={() => onPayWorkman(workman.id)}
                  className="w-full py-2 bg-blue-600/20 hover:bg-blue-600 border border-blue-500/40 text-blue-300 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Add to Payment Invoice</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
