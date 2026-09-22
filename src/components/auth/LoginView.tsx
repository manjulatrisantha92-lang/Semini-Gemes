import React, { useState } from 'react';
import {
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  UserCheck,
  ShieldCheck,
  Crown,
  UserPlus,
  Trash2,
  AlertCircle,
  Gem,
} from 'lucide-react';
import { User, UserRole, AppSettings } from '../../types';
import { Modal } from '../common/Modal';

interface LoginViewProps {
  users: User[];
  settings: AppSettings;
  onLogin: (user: User) => void;
  onAddUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  users = [],
  settings,
  onLogin,
  onAddUser,
  onDeleteUser,
}) => {
  const safeUsers = Array.isArray(users) ? users : [];
  const [selectedUserId, setSelectedUserId] = useState<string>(safeUsers[0]?.id || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  // Active step: 'select_account' (show prominent Admin / Owner / User cards) or 'enter_password' (password entry)
  const [loginStep, setLoginStep] = useState<'select_account' | 'enter_password'>('select_account');

  // New user form state
  const [newUserName, setNewUserName] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('user');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');

  const selectedUser = safeUsers.find((u) => u.id === selectedUserId) || safeUsers[0];

  // Initiate login for a specific user: sets the user, resets password, and opens the password prompt
  const handleInitiateUserLogin = (user: User) => {
    setSelectedUserId(user.id);
    setPassword(''); // Never auto-fill! User MUST type password
    setError('');
    setLoginStep('enter_password');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      setError('Please select an account to proceed');
      return;
    }

    if (!password.trim()) {
      setError(`Please type the password for ${selectedUser.name} (${selectedUser.role.toUpperCase()}) to log in.`);
      return;
    }

    // Validate typed password against stored user password
    if (selectedUser.password && password !== selectedUser.password) {
      setError(`Incorrect password for ${selectedUser.username}. Please check and type again.`);
      return;
    }

    setError('');
    onLogin(selectedUser);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserUsername.trim()) return;

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: newUserName.trim(),
      username: newUserUsername.trim().toLowerCase(),
      password: newUserPassword || 'password123',
      role: newUserRole,
      email: newUserEmail || `${newUserUsername}@wcsgems.lk`,
      phone: newUserPhone || '+94 77 000 0000',
      createdAt: new Date().toISOString().split('T')[0],
      avatarUrl: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 5000)}?w=150&auto=format&fit=crop&q=80`,
    };

    onAddUser(newUser);
    setIsAddUserModalOpen(false);
    setSelectedUserId(newUser.id);
    setPassword('');
    setLoginStep('enter_password');
    // Reset form
    setNewUserName('');
    setNewUserUsername('');
    setNewUserPassword('');
    setNewUserRole('user');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 p-4 sm:p-6 text-slate-100">
      {/* Brand card */}
      <div className="w-full max-w-lg bg-slate-900/90 backdrop-blur border border-amber-500/30 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header with Logo */}
        <div className="text-center space-y-2">
          {settings.logoJpgUrl ? (
            <img
              src={settings.logoJpgUrl}
              alt="Company Logo"
              className="w-16 h-16 object-contain rounded-2xl bg-white p-1 border border-amber-400/40 shadow-lg shadow-amber-900/40 mx-auto"
            />
          ) : (
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 text-slate-950 shadow-lg shadow-amber-900/40 mx-auto">
              <Gem className="w-8 h-8" />
            </div>
          )}
          <h2 className="text-2xl font-bold tracking-tight text-slate-100 font-serif">
            {settings.companyName}
          </h2>
          <p className="text-xs text-amber-300 font-medium tracking-wide uppercase font-mono">
            WCS Inventory, POS Billing & Management
          </p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Authorized Gemstone, Fine Jewelry & Workshop System
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-950/90 border border-rose-600/70 rounded-xl text-xs text-rose-200 flex items-center gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* STEP 1: Select User Account */}
        {loginStep === 'select_account' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                Select Account to Log In
              </span>
              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(true)}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add User</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {safeUsers.map((u) => {
                const isSelected = selectedUser?.id === u.id;
                const roleColor =
                  u.role === 'owner'
                    ? 'border-amber-500/50 bg-amber-950/20 text-amber-300'
                    : u.role === 'admin'
                    ? 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300'
                    : 'border-blue-500/50 bg-blue-950/20 text-blue-300';

                return (
                  <div
                    key={u.id}
                    className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-amber-400/80 bg-slate-800/90 shadow-md shadow-amber-950/30 ring-1 ring-amber-400/40'
                        : 'border-slate-800 bg-slate-950/60 hover:bg-slate-850 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                        {u.role === 'owner' ? (
                          <Crown className="w-5 h-5 text-amber-400" />
                        ) : u.role === 'admin' ? (
                          <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <UserCheck className="w-5 h-5 text-blue-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm text-slate-100 truncate">{u.name}</h3>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${roleColor}`}
                          >
                            {u.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                          {u.role === 'owner'
                            ? 'Full Owner Management & Financials'
                            : u.role === 'admin'
                            ? 'System Admin & Inventory Control'
                            : 'POS Invoicing & Certificate Access'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleInitiateUserLogin(u)}
                      className="shrink-0 px-3.5 py-2 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Log In</span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Quick Demo Credentials Info */}
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-[11px] text-slate-400 flex flex-col gap-1">
              <span className="font-semibold text-slate-300 uppercase tracking-wider text-[10px]">
                System Security & Passwords:
              </span>
              <p className="text-slate-400">
                Click <strong>Log In</strong> on any account above, then type the required password to sign in.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[10px] text-amber-400/90">
                <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                  Admin: password123
                </span>
                <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                  Owner: ownerpass
                </span>
                <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                  User: user123
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* STEP 2: Type Password */
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Selected Account Profile Bar */}
            <div className="p-3.5 bg-slate-950/80 border border-amber-500/30 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                  {selectedUser?.role === 'owner' ? (
                    <Crown className="w-5 h-5 text-amber-400" />
                  ) : selectedUser?.role === 'admin' ? (
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <UserCheck className="w-5 h-5 text-blue-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-100">{selectedUser?.name}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      {selectedUser?.role}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">@{selectedUser?.username}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setLoginStep('select_account');
                  setPassword('');
                  setError('');
                }}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium underline underline-offset-2"
              >
                Change User
              </button>
            </div>

            {/* Password Input (User MUST type password) */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-1.5">
                Type Password to Unlock
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoFocus
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Type password here..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-10 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Type password and press Enter or click <strong>Sign In</strong> below.
              </p>
            </div>

            {/* Submit & Back Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-amber-900/40 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Verify Password & Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setLoginStep('select_account');
                  setPassword('');
                  setError('');
                }}
                className="w-full py-2.5 px-4 bg-slate-950/60 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
              >
                Back to User Accounts
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Manual Add User Modal */}
      <Modal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        title="Add User Manually"
        subtitle="Create a new login user with tailored permission role"
        maxWidth="md"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Ruwan Samarasinghe"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Username</label>
              <input
                type="text"
                required
                placeholder="ruwan"
                value={newUserUsername}
                onChange={(e) => setNewUserUsername(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Role</label>
              <select
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
              >
                <option value="user">User (Invoice Only)</option>
                <option value="admin">Admin (Full Access)</option>
                <option value="owner">Owner (Full Access)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Password</label>
            <input
              type="text"
              placeholder="Set password (default: password123)"
              value={newUserPassword}
              onChange={(e) => setNewUserPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Phone</label>
              <input
                type="text"
                placeholder="+94 77 123 4567"
                value={newUserPhone}
                onChange={(e) => setNewUserPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Email</label>
              <input
                type="email"
                placeholder="ruwan@wcsgems.lk"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddUserModalOpen(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 rounded-lg text-xs font-bold"
            >
              Save User
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
