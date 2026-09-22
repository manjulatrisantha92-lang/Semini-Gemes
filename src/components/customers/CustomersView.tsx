import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  MessageSquare,
  MapPin,
  CreditCard,
  Crown,
  Edit2,
  Trash2,
  Receipt,
  Share2,
  Sparkles,
  Gift,
} from 'lucide-react';
import { Customer, Invoice, AppSettings } from '../../types';
import { StorageService } from '../../services/storage';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';
import { CustomerGreetingModal } from '../promotions/CustomerGreetingModal';
import { safeOpenExternal, formatWhatsAppNumber } from '../../utils/navigation';

interface CustomersViewProps {
  customers: Customer[];
  invoices: Invoice[];
  settings: AppSettings;
  onRefresh: () => void;
  onOpenInvoicePrint: (invoice: Invoice) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  invoices,
  settings,
  onRefresh,
  onOpenInvoicePrint,
}) => {
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Customer Festive Greetings Modal (Optional greeting cards & video clips via WhatsApp)
  const [isGreetingModalOpen, setIsGreetingModalOpen] = useState(false);
  const [greetingTargetCustomer, setGreetingTargetCustomer] = useState<Customer | null>(null);

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [nic, setNic] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Colombo');
  const [isVip, setIsVip] = useState(false);

  // Filtered
  const filteredCustomers = useMemo(() => {
    return customers.filter(
      (c) =>
        searchTerm === '' ||
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm) ||
        (c.nicPassport && c.nicPassport.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.city && c.city.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [customers, searchTerm]);

  // Open Edit
  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setName(c.name);
    setPhone(c.phone);
    setWhatsapp(c.whatsapp || '');
    setNic(c.nicPassport || '');
    setAddress(c.address || '');
    setCity(c.city || 'Colombo');
    setIsVip(!!c.isVip);
    setIsModalOpen(true);
  };

  // Open Create
  const handleOpenCreate = () => {
    setEditingCustomer(null);
    setName('');
    setPhone('+94 77 ');
    setWhatsapp('');
    setNic('');
    setAddress('');
    setCity('Colombo');
    setIsVip(false);
    setIsModalOpen(true);
  };

  // Save
  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const custData: Customer = {
      id: editingCustomer ? editingCustomer.id : `cust-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      whatsapp: whatsapp.trim() || phone.trim().replace(/\D/g, ''),
      nicPassport: nic.trim(),
      address: address.trim(),
      city: city.trim(),
      isVip,
      totalSpentLKR: editingCustomer ? editingCustomer.totalSpentLKR : 0,
      invoiceCount: editingCustomer ? editingCustomer.invoiceCount : 0,
      createdAt: editingCustomer ? editingCustomer.createdAt : new Date().toISOString().split('T')[0],
    };

    if (editingCustomer) {
      StorageService.updateCustomer(custData);
      showToast(`Customer "${custData.name}" updated`, 'success');
    } else {
      StorageService.addCustomer(custData);
      showToast(`Customer "${custData.name}" registered`, 'success');
    }

    setIsModalOpen(false);
    onRefresh();
  };

  // Delete
  const handleDelete = (id: string, custName: string) => {
    if (window.confirm(`Delete customer "${custName}"?`)) {
      StorageService.deleteCustomer(id);
      showToast(`Customer "${custName}" deleted.`, 'info');
      onRefresh();
    }
  };

  // Open WhatsApp directly
  const handleOpenWhatsAppChat = (c: Customer) => {
    const fullPhone = formatWhatsAppNumber(c.whatsapp || c.phone || '');
    const message = `Hello ${c.name},\nThank you for choosing ${settings.companyName}. We value your business and are pleased to assist you with any questions regarding your Ceylon gemstones and bespoke jewelry orders.`;
    safeOpenExternal(`https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`);
    showToast(`Opening WhatsApp chat for ${c.name}...`, 'info');
  };

  // Invoices for selected customer
  const customerInvoices = selectedCustomer
    ? invoices.filter((i) => i.customerId === selectedCustomer.id)
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100 font-serif flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-400" />
            Customer & VIP Client Directory
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Track client purchase histories, NICs, WhatsApp numbers & high-net-worth VIP buyers
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Share All Customers in WhatsApp Button */}
          <button
            type="button"
            onClick={() => {
              setGreetingTargetCustomer(null);
              setIsGreetingModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-lg text-xs shadow-md shadow-emerald-900/40 transition-all active:scale-95 cursor-pointer"
            title="Share greetings, promotion cards & video clips to all or VIP customers via WhatsApp"
          >
            <Share2 className="w-4 h-4 text-emerald-100" />
            <MessageSquare className="w-4 h-4 text-emerald-200" />
            <span>Share All in WhatsApp</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-emerald-950/60 text-emerald-200 border border-emerald-400/30 rounded font-mono font-semibold">
              Broadcast
            </span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-lg text-xs shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register Client</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, phone, NIC, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((c) => (
          <div
            key={c.id}
            className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-xl p-5 shadow space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-slate-100 text-sm">{c.name}</h4>
                    {c.isVip && (
                      <span className="p-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30" title="VIP Client">
                        <Crown className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  {c.nicPassport && (
                    <div className="text-[10px] text-slate-400 font-mono">NIC: {c.nicPassport}</div>
                  )}
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-xs text-amber-300">
                    {StorageService.formatLKR(c.totalSpentLKR)}
                  </div>
                  <div className="text-[10px] text-slate-400">{c.invoiceCount} invoices</div>
                </div>
              </div>

              <div className="text-xs text-slate-400 space-y-1 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-mono">{c.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span className="truncate">{c.address ? `${c.address}, ${c.city}` : c.city}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setSelectedCustomer(c)}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>View History</span>
              </button>

              <div className="flex items-center gap-1.5">
                {/* Share Customer in WhatsApp with Greetings, Image or Video */}
                <button
                  type="button"
                  onClick={() => {
                    setGreetingTargetCustomer(c);
                    setIsGreetingModalOpen(true);
                  }}
                  className="px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer shadow-sm hover:border-emerald-400 active:scale-95"
                  title="Share greeting cards, video clips, and promotions via WhatsApp"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Share in WhatsApp</span>
                </button>

                <button
                  onClick={() => handleOpenWhatsAppChat(c)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 rounded"
                  title="Direct WhatsApp Text Chat"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleOpenEdit(c)}
                  className="p-1.5 text-slate-400 hover:text-amber-300"
                  title="Edit Customer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(c.id, c.name)}
                  className="p-1.5 text-slate-400 hover:text-rose-400"
                  title="Delete Customer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Customer Invoices History Modal */}
      {selectedCustomer && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedCustomer(null)}
          title={`Purchase History: ${selectedCustomer.name}`}
          subtitle={`Total Lifetime Spend: ${StorageService.formatLKR(selectedCustomer.totalSpentLKR)}`}
          maxWidth="3xl"
        >
          <div className="space-y-3">
            {customerInvoices.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No past invoices recorded for this client.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-[10px] uppercase font-mono text-slate-400">
                    <tr>
                      <th className="py-2.5 px-3">Invoice No</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3 text-right">Items</th>
                      <th className="py-2.5 px-3 text-right">Grand Total (LKR)</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {customerInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-mono font-bold text-amber-300">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">{inv.date}</td>
                        <td className="py-2.5 px-3 text-right">{inv.items.length} items</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-100">
                          {StorageService.formatLKR(inv.grandTotalLKR)}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedCustomer(null);
                              onOpenInvoicePrint(inv);
                            }}
                            className="px-2.5 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded text-[11px]"
                          >
                            Print A4
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Quick Actions for Selected Customer */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setGreetingTargetCustomer(selectedCustomer);
                  setIsGreetingModalOpen(true);
                }}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-lg text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Gift className="w-4 h-4 text-amber-300" />
                <MessageSquare className="w-4 h-4 text-emerald-200" />
                <span>Greet {selectedCustomer.name} via WhatsApp (JPG / Video)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
              >
                Close History
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Customer Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? 'Edit Client Record' : 'Register New Client'}
        subtitle="Maintain telephone, WhatsApp, NIC and residency data"
        maxWidth="md"
      >
        <form onSubmit={handleSaveCustomer} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Customer Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Phone Number *
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                WhatsApp
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                NIC / Passport No
              </label>
              <input
                type="text"
                value={nic}
                onChange={(e) => setNic(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="vipCheck"
              checked={isVip}
              onChange={(e) => setIsVip(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-amber-500"
            />
            <label htmlFor="vipCheck" className="text-xs text-slate-300 font-semibold cursor-pointer">
              Tag as High-Net-Worth VIP Client
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded text-xs"
            >
              Save Client
            </button>
          </div>
        </form>
      </Modal>

      {/* Optional Customer Festive Greetings Modal (WhatsApp with JPG/PNG cards & video clips) */}
      <CustomerGreetingModal
        isOpen={isGreetingModalOpen}
        onClose={() => {
          setIsGreetingModalOpen(false);
          setGreetingTargetCustomer(null);
        }}
        customers={customers}
        targetCustomer={greetingTargetCustomer}
        settings={settings}
      />
    </div>
  );
};
