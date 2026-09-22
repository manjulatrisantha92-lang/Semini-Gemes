import React, { useState } from 'react';
import {
  Smartphone,
  Laptop,
  Tablet,
  QrCode,
  Copy,
  Check,
  RefreshCw,
  Wifi,
  ShieldCheck,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { Modal } from './Modal';
import {
  getDeviceId,
  getDeviceName,
  setDeviceName,
  MultiDeviceSyncService,
} from '../../services/syncService';
import { StorageService } from '../../services/storage';
import { useToast } from './Toast';

interface MultiDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export const MultiDeviceModal: React.FC<MultiDeviceModalProps> = ({
  isOpen,
  onClose,
  onRefresh,
}) => {
  const { showToast } = useToast();
  const [deviceId] = useState<string>(getDeviceId());
  const [deviceName, setLocalDeviceName] = useState<string>(getDeviceName());
  const [isEditingName, setIsEditingName] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const currentUrl = window.location.origin;

  // Simple QR code generator using public API or SVG
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    currentUrl
  )}&bgcolor=ffffff&color=0f172a&margin=1`;

  const handleSaveDeviceName = () => {
    if (!deviceName.trim()) return;
    setDeviceName(deviceName.trim());
    setIsEditingName(false);
    showToast(`Device label updated to "${deviceName}"`, 'success');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      showToast('App link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast('Please copy the URL from your browser address bar', 'info');
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    await MultiDeviceSyncService.pushLocalToServer();
    await MultiDeviceSyncService.pullFromServer();
    onRefresh();
    setIsSyncing(false);
    showToast('Multi-device database synced successfully!', 'success');
  };

  const productsCount = StorageService.getProducts().length;
  const invoicesCount = StorageService.getInvoices().length;
  const ordersCount = StorageService.getWorkshopOrders().length;
  const categoriesCount = StorageService.getProductCategories().length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Multi-Device Cloud Sync"
      subtitle="Operate your jewelry POS simultaneously on phones, tablets, and counter PCs"
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Status Card */}
        <div className="p-4 bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Wifi className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-100">Live Multi-Device Network</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Active & Synced
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                All connected devices share the same live catalog, invoices & workshop orders.
              </p>
            </div>
          </div>

          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
          </button>
        </div>

        {/* Current Device Profile */}
        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            This Current Device
          </span>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-amber-400">
                <Laptop className="w-5 h-5" />
              </div>
              <div>
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={deviceName}
                      onChange={(e) => setLocalDeviceName(e.target.value)}
                      className="bg-slate-900 border border-amber-500 rounded px-2.5 py-1 text-xs text-slate-100 focus:outline-none"
                    />
                    <button
                      onClick={handleSaveDeviceName}
                      className="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold rounded"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-100">{deviceName}</span>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="text-[10px] text-amber-400 hover:underline"
                    >
                      (Rename)
                    </button>
                  </div>
                )}
                <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                  Device ID: <span className="text-slate-300 font-bold">{deviceId}</span>
                </div>
              </div>
            </div>

            {/* Current Sync Stats */}
            <div className="grid grid-cols-4 gap-2 text-center bg-slate-900/80 p-2 rounded-lg border border-slate-800/80">
              <div className="px-2">
                <div className="text-xs font-mono font-bold text-amber-400">{productsCount}</div>
                <div className="text-[9px] text-slate-400 uppercase">Products</div>
              </div>
              <div className="px-2">
                <div className="text-xs font-mono font-bold text-cyan-400">{categoriesCount}</div>
                <div className="text-[9px] text-slate-400 uppercase">Categories</div>
              </div>
              <div className="px-2">
                <div className="text-xs font-mono font-bold text-emerald-400">{invoicesCount}</div>
                <div className="text-[9px] text-slate-400 uppercase">Invoices</div>
              </div>
              <div className="px-2">
                <div className="text-xs font-mono font-bold text-amber-300">{ordersCount}</div>
                <div className="text-[9px] text-slate-400 uppercase">Orders</div>
              </div>
            </div>
          </div>
        </div>

        {/* Connect New Device / QR Code */}
        <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Scan QR Code to Open on Phone or Tablet
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* QR Code Container */}
            <div className="bg-white p-2.5 rounded-xl shadow-lg border border-slate-700 flex flex-col items-center">
              <img
                src={qrCodeUrl}
                alt="Scan to open on smartphone or tablet"
                className="w-36 h-36 object-contain rounded"
              />
              <span className="text-[10px] font-bold text-slate-700 mt-1">Scan with Phone Camera</span>
            </div>

            {/* Instructions and direct URL */}
            <div className="space-y-3 flex-1">
              <p className="text-xs text-slate-300 leading-relaxed">
                Scan this QR code with your iPhone, Android camera, or iPad to operate this POS
                system at the counter, showcase counter, or workshop bench.
              </p>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  System Connection URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={currentUrl}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-amber-300 select-all"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-md"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Supported Device Types */}
              <div className="flex items-center gap-4 pt-1 text-[11px] text-slate-400">
                <div className="flex items-center gap-1 text-slate-300">
                  <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Smartphones</span>
                </div>
                <div className="flex items-center gap-1 text-slate-300">
                  <Tablet className="w-3.5 h-3.5 text-cyan-400" />
                  <span>iPads & Tablets</span>
                </div>
                <div className="flex items-center gap-1 text-slate-300">
                  <Laptop className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Laptops & PCs</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Device Security & Roles info */}
        <div className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg flex items-start gap-2.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-200">Multi-User Role Protection:</span> Different
            staff members can sign into their respective accounts on separate devices (e.g., Goldsmith
            views Workshop on tablet; Cashier creates POS invoices on counter PC).
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
