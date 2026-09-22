import React, { useState } from 'react';
import { UserPlus, Building, Phone, CreditCard, Calendar, Award } from 'lucide-react';
import { Workshop, WorkshopEmployee } from '../../types';
import { StorageService } from '../../services/storage';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';

interface AddWorkmanModalProps {
  isOpen: boolean;
  onClose: () => void;
  workshops: Workshop[];
  onWorkmanAdded: (workman: WorkshopEmployee) => void;
}

const COMMON_ROLES = [
  'Master Goldsmith',
  'Head Stone Setter & Micro-Pavé Specialist',
  'Filigree Wire & Traditional Craft Artisan',
  'CAD Modeler & 3D Wax Injector',
  'Lapidary Gem Cutter & Polisher',
  'Precious Metal Casting Specialist',
  'Polisher & Surface Finisher',
  'Quality Control & Assay Inspector',
];

export const AddWorkmanModal: React.FC<AddWorkmanModalProps> = ({
  isOpen,
  onClose,
  workshops,
  onWorkmanAdded,
}) => {
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [workshopId, setWorkshopId] = useState(workshops[0]?.id || '');
  const [role, setRole] = useState(COMMON_ROLES[0]);
  const [customRole, setCustomRole] = useState('');
  const [phone, setPhone] = useState('+94 ');
  const [nic, setNic] = useState('');
  const [salaryRate, setSalaryRate] = useState<number>(85000);
  const [joinDate, setJoinDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('Please enter the workman name', 'error');
      return;
    }

    const selectedWs = workshops.find((w) => w.id === workshopId) || workshops[0];
    const finalRole = role === 'Other' ? (customRole.trim() || 'Artisan Goldsmith') : role;

    const newWorkman: WorkshopEmployee = {
      id: `wse-${Date.now()}`,
      workshopId: selectedWs ? selectedWs.id : 'ws-main',
      workshopName: selectedWs ? selectedWs.name : 'Main Workshop',
      name: name.trim(),
      role: finalRole,
      phone: phone.trim(),
      nic: nic.trim(),
      dailyRateOrSalaryLKR: Number(salaryRate) || 0,
      totalPaidLKR: 0,
      joinDate: joinDate || new Date().toISOString().split('T')[0],
    };

    StorageService.addWorkshopEmployee(newWorkman);
    showToast(`Workman ${newWorkman.name} added successfully!`, 'success');
    onWorkmanAdded(newWorkman);

    // Reset form
    setName('');
    setNic('');
    setPhone('+94 ');
    setCustomRole('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Workman / Bench Artisan"
      subtitle="Register a goldsmith, gem setter, or workshop bench craftsman"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Workman Name */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
            Workman / Artisan Full Name *
          </label>
          <div className="relative">
            <UserPlus className="w-4 h-4 text-amber-400 absolute left-3 top-2.5" />
            <input
              type="text"
              required
              placeholder="e.g. K. Balachandran or Sunil Shantha"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 font-medium focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Assigned Workshop & Role */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Assigned Workshop Guild *
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <select
                value={workshopId}
                onChange={(e) => setWorkshopId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:border-amber-500"
              >
                {workshops.map((ws) => (
                  <option key={ws.id} value={ws.id}>
                    {ws.name} ({ws.contactPerson})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Craft Role / Specialization *
            </label>
            <div className="relative">
              <Award className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:border-amber-500"
              >
                {COMMON_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
                <option value="Other">Other / Custom Specialty</option>
              </select>
            </div>
          </div>
        </div>

        {role === 'Other' && (
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Specify Custom Craft Role *
            </label>
            <input
              type="text"
              placeholder="e.g. Antique Reproduction Specialist"
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 font-medium focus:outline-none focus:border-amber-500"
            />
          </div>
        )}

        {/* Contact Phone & NIC */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Mobile Hotline / WhatsApp
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="+94 77 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              NIC / Registration Card #
            </label>
            <div className="relative">
              <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="e.g. 198512345678 or 811209381V"
                value={nic}
                onChange={(e) => setNic(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Base Rate / Salary & Join Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Monthly Base Salary / Retainer (LKR) *
            </label>
            <input
              type="number"
              min={0}
              step={1000}
              required
              value={salaryRate}
              onChange={(e) => setSalaryRate(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Used as base amount when generating workman payment invoices
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Guild Join Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="date"
                value={joinDate}
                onChange={(e) => setJoinDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Modal Buttons */}
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
            className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-md shadow-amber-900/30 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            Save & Add Workman
          </button>
        </div>
      </form>
    </Modal>
  );
};
