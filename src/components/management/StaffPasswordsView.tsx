import React, { useState } from 'react';
import {
  Users,
  KeyRound,
  ShieldCheck,
  Plus,
  Search,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Edit2,
  X,
  Lock,
  Smartphone,
  Mail,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';
import { User, UserRole, AppSettings } from '../../types';
import { StorageService } from '../../services/storage';

interface StaffPasswordsViewProps {
  currentUser?: User | null;
  settings: AppSettings;
  onRefresh?: () => void;
}

export const StaffPasswordsView: React.FC<StaffPasswordsViewProps> = ({
  currentUser,
  settings,
  onRefresh,
}) => {
  const [staffList, setStaffList] = useState<User[]>(() => StorageService.getUsers());
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStaffForPassword, setSelectedStaffForPassword] = useState<User | null>(null);
  const [selectedStaffForPin, setSelectedStaffForPin] = useState<User | null>(null);
  const [editingStaff, setEditingStaff] = useState<User | null>(null);

  // New Staff Form State
  const [newStaff, setNewStaff] = useState<{
    name: string;
    username: string;
    role: UserRole;
    email: string;
    phone: string;
    password: string;
    pin: string;
  }>({
    name: '',
    username: '',
    role: 'user',
    email: '',
    phone: '',
    password: 'password123',
    pin: '1234',
  });

  // Password Change State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // PIN Change State
  const [newPin, setNewPin] = useState('');

  // Filtering
  const filteredStaff = staffList.filter((staff) => {
    const matchesSearch =
      staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.phone.includes(searchQuery);

    const matchesRole = roleFilter === 'all' || staff.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name.trim() || !newStaff.username.trim() || !newStaff.password.trim()) {
      alert('Please fill in Name, Username, and Password.');
      return;
    }

    // Check duplicate username
    if (staffList.some((s) => s.username.toLowerCase() === newStaff.username.trim().toLowerCase())) {
      alert('A staff member with this username already exists.');
      return;
    }

    const createdUser: User = {
      id: `usr-${Date.now()}`,
      name: newStaff.name.trim(),
      username: newStaff.username.trim().toLowerCase(),
      password: newStaff.password.trim(),
      role: newStaff.role,
      email: newStaff.email.trim() || `${newStaff.username}@${settings.companyName.toLowerCase().replace(/\s+/g, '')}.lk`,
      phone: newStaff.phone.trim() || '+94 77 000 0000',
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: 'Never logged in',
    };

    StorageService.addUser(createdUser);
    const updated = StorageService.getUsers();
    setStaffList(updated);
    setIsAddModalOpen(false);
    setNewStaff({
      name: '',
      username: '',
      role: 'user',
      email: '',
      phone: '',
      password: 'password123',
      pin: '1234',
    });

    if (onRefresh) onRefresh();
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffForPassword) return;

    if (!newPassword || newPassword.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    const updated = staffList.map((s) => {
      if (s.id === selectedStaffForPassword.id) {
        return { ...s, password: newPassword };
      }
      return s;
    });

    StorageService.saveUsers(updated);
    setStaffList(updated);
    setSelectedStaffForPassword(null);
    setNewPassword('');
    setConfirmPassword('');
    alert(`Password updated successfully for ${selectedStaffForPassword.name}.`);

    if (onRefresh) onRefresh();
  };

  const handleDeleteStaff = (staff: User) => {
    if (staff.id === currentUser?.id) {
      alert('You cannot delete your own active account.');
      return;
    }

    const admins = staffList.filter((s) => s.role === 'admin' || s.role === 'owner');
    if ((staff.role === 'admin' || staff.role === 'owner') && admins.length <= 1) {
      alert('Cannot delete the last administrator or owner account.');
      return;
    }

    if (window.confirm(`Are you sure you want to remove staff member "${staff.name}"?`)) {
      StorageService.deleteUser(staff.id);
      const updated = StorageService.getUsers();
      setStaffList(updated);
      if (onRefresh) onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-xl border border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Staff & Passwords Management
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                RBAC Security
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage showroom staff credentials, login passwords, 4-digit POS quick PINs, and role access
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Security Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-mono">
              Total Showroom Staff
            </span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-mono">
            {staffList.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Registered operators & goldsmiths
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-mono">
              Admins & Proprietors
            </span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-2 font-mono">
            {staffList.filter((s) => s.role === 'admin' || s.role === 'owner').length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Privileged system access
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-mono">
              Sales Reps & POS Cashiers
            </span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2 font-mono">
            {staffList.filter((s) => s.role === 'user').length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Counter invoice billing terminals
          </div>
        </div>
      </div>

      {/* Staff Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search staff by name, username, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 px-3 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Access Roles</option>
            <option value="owner">Proprietor / Owner</option>
            <option value="admin">Executive Admin</option>
            <option value="user">Showroom Staff / Cashier</option>
          </select>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#090d15] text-[11px] text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">Role & Access</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Password & Security</th>
                <th className="py-3 px-4">Last Login</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredStaff.map((staff) => (
                <tr key={staff.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-medium">
                    <div className="flex items-center gap-3">
                      <img
                        src={staff.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                        alt={staff.name}
                        className="w-8 h-8 rounded-full object-cover border border-cyan-500/40 bg-slate-950"
                      />
                      <div>
                        <div className="text-white font-semibold flex items-center gap-1.5">
                          {staff.name}
                          {staff.id === currentUser?.id && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          ID: {staff.id}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-semibold text-cyan-300">
                    @{staff.username}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        staff.role === 'owner'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : staff.role === 'admin'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}
                    >
                      {staff.role === 'owner'
                        ? 'Proprietor'
                        : staff.role === 'admin'
                        ? 'Administrator'
                        : 'Showroom Cashier'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="text-xs text-slate-200">{staff.phone}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{staff.email}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="font-mono text-slate-400 text-xs">
                        ••••••••••••
                      </div>
                      <button
                        onClick={() => setSelectedStaffForPassword(staff)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-semibold border border-slate-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
                        title="Change Password"
                      >
                        <KeyRound className="w-3 h-3" />
                        <span>Change</span>
                      </button>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {staff.lastLogin || 'Active session'}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDeleteStaff(staff)}
                      disabled={staff.id === currentUser?.id}
                      className={`p-1.5 rounded transition-colors ${
                        staff.id === currentUser?.id
                          ? 'text-slate-600 cursor-not-allowed'
                          : 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer'
                      }`}
                      title="Remove Staff Member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: ADD NEW STAFF MEMBER */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#090d15]">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Users className="w-4 h-4" />
                <span>Register New Staff Account</span>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kasun Madushanka"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. kasun"
                    value={newStaff.username}
                    onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    System Role *
                  </label>
                  <select
                    value={newStaff.role}
                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="user">Showroom Cashier / POS</option>
                    <option value="admin">Executive Administrator</option>
                    <option value="owner">Proprietor / Managing Director</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Mobile Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+94 77 ..."
                    value={newStaff.phone}
                    onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="name@wcsgems.lk"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Initial Password *
                </label>
                <input
                  type="text"
                  required
                  value={newStaff.password}
                  onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-slate-950 text-xs font-bold transition-all cursor-pointer"
                >
                  Save & Register Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CHANGE PASSWORD */}
      {selectedStaffForPassword && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-[#090d15]">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                <KeyRound className="w-4 h-4" />
                <span>Reset Staff Password</span>
              </div>
              <button
                onClick={() => setSelectedStaffForPassword(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdatePassword} className="p-5 space-y-4">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-xs text-white font-semibold">
                  {selectedStaffForPassword.name}
                </div>
                <div className="text-[11px] text-cyan-400 font-mono">
                  @{selectedStaffForPassword.username}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  New Password (min 6 chars)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-cyan-500 pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedStaffForPassword(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-slate-950 text-xs font-bold transition-all cursor-pointer"
                >
                  Save New Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
