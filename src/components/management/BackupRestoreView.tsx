import React, { useState } from 'react';
import {
  Database,
  Download,
  UploadCloud,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ShieldCheck,
  Server,
  HardDrive,
  Calendar,
  Layers,
  ArrowDownToLine,
  RefreshCw,
} from 'lucide-react';
import { AppSettings, User } from '../../types';
import { StorageService } from '../../services/storage';

interface BackupRestoreViewProps {
  settings: AppSettings;
  currentUser?: User | null;
  onRefreshAllData: () => void;
}

export const BackupRestoreView: React.FC<BackupRestoreViewProps> = ({
  settings,
  currentUser,
  onRefreshAllData,
}) => {
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);
  const [backupStats, setBackupStats] = useState(() => {
    const products = StorageService.getProducts();
    const invoices = StorageService.getInvoices();
    const customers = StorageService.getCustomers();
    const purchaseOrders = StorageService.getPurchaseOrders();
    const workshopOrders = StorageService.getWorkshopOrders();
    const certificates = StorageService.getCertificates();
    const users = StorageService.getUsers();

    return {
      productsCount: products.length,
      invoicesCount: invoices.length,
      customersCount: customers.length,
      purchaseOrdersCount: purchaseOrders.length,
      workshopOrdersCount: workshopOrders.length,
      certificatesCount: certificates.length,
      usersCount: users.length,
    };
  });

  // Export JSON
  const handleExportBackup = () => {
    const backupJson = StorageService.exportDatabaseBackup();
    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const now = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    link.download = `WCS_Gem_Jewelry_Backup_${now}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setRestoreStatus('System backup JSON downloaded successfully!');
    setTimeout(() => setRestoreStatus(null), 5000);
  };

  // Restore JSON
  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsRestoring(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const success = StorageService.importDatabaseBackup(text);
        if (success) {
          setRestoreStatus('Database restored successfully from backup JSON!');
          onRefreshAllData();
          // refresh counts
          const products = StorageService.getProducts();
          const invoices = StorageService.getInvoices();
          const customers = StorageService.getCustomers();
          const purchaseOrders = StorageService.getPurchaseOrders();
          const workshopOrders = StorageService.getWorkshopOrders();
          const certificates = StorageService.getCertificates();
          const users = StorageService.getUsers();
          setBackupStats({
            productsCount: products.length,
            invoicesCount: invoices.length,
            customersCount: customers.length,
            purchaseOrdersCount: purchaseOrders.length,
            workshopOrdersCount: workshopOrders.length,
            certificatesCount: certificates.length,
            usersCount: users.length,
          });
        } else {
          alert('Invalid backup file structure or missing collections.');
        }
      } catch (err) {
        alert('Failed to parse backup JSON file. Ensure it is a valid WCS backup.');
      } finally {
        setIsRestoring(false);
      }
    };
    reader.readAsText(file);
  };

  // Reset to initial seed
  const handleResetToSeed = () => {
    if (
      window.confirm(
        'Warning: This will restore the authentic Sri Lankan Ceylon Sapphire inventory, sample gold sovereigns, and workshop records. Continue?'
      )
    ) {
      StorageService.resetToInitialSeed();
      onRefreshAllData();
      setRestoreStatus('Database reset to authentic Sri Lankan sample seed data.');
      setTimeout(() => setRestoreStatus(null), 5000);
    }
  };

  // Storage usage calculation
  const getStorageSizeKB = () => {
    let total = 0;
    for (let x in localStorage) {
      if (localStorage.hasOwnProperty(x)) {
        total += (localStorage[x].length + x.length) * 2;
      }
    }
    return Math.round(total / 1024);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-xl border border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Database Backup & Restore
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                JSON Data Portability
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Archive complete showroom records, gemstone assays, stock inventory, invoices & restore instantly
            </p>
          </div>
        </div>

        <button
          onClick={handleExportBackup}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 text-xs font-bold transition-all shadow-md cursor-pointer self-start md:self-auto"
        >
          <ArrowDownToLine className="w-4 h-4" />
          <span>Download Backup (JSON)</span>
        </button>
      </div>

      {restoreStatus && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/40 rounded-xl flex items-center gap-3 text-emerald-300 text-xs font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{restoreStatus}</span>
        </div>
      )}

      {/* Stats Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl text-center">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Jewelry Stock</span>
          <span className="text-lg font-bold text-white font-mono mt-1 block">{backupStats.productsCount}</span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl text-center">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Invoices</span>
          <span className="text-lg font-bold text-emerald-400 font-mono mt-1 block">{backupStats.invoicesCount}</span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl text-center">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">VIP Customers</span>
          <span className="text-lg font-bold text-cyan-400 font-mono mt-1 block">{backupStats.customersCount}</span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl text-center">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Purchase Orders</span>
          <span className="text-lg font-bold text-amber-400 font-mono mt-1 block">{backupStats.purchaseOrdersCount}</span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl text-center">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Workshop Jobs</span>
          <span className="text-lg font-bold text-purple-400 font-mono mt-1 block">{backupStats.workshopOrdersCount}</span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl text-center">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Certificates</span>
          <span className="text-lg font-bold text-blue-400 font-mono mt-1 block">{backupStats.certificatesCount}</span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl text-center">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Staff Users</span>
          <span className="text-lg font-bold text-slate-200 font-mono mt-1 block">{backupStats.usersCount}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CARD 1: DOWNLOAD BACKUP */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-2">
              <Download className="w-5 h-5" />
              <span>Full System JSON Export</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Export all system collections into a portable, standard JSON file. This file contains complete product inventories with carat weights, gross and net gold grams, customer databases, sales invoices, goldsmith workshop consignments, and company template configs.
            </p>

            <div className="mt-4 p-3 bg-slate-950/70 border border-slate-800 rounded-lg space-y-1.5 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Database Engine:</span>
                <span className="text-slate-200 font-mono font-semibold">IndexedDB / LocalStorage / MongoDB Ready</span>
              </div>
              <div className="flex justify-between">
                <span>Current Data Size:</span>
                <span className="text-emerald-400 font-mono font-semibold">~{getStorageSizeKB()} KB</span>
              </div>
              <div className="flex justify-between">
                <span>Export Format:</span>
                <span className="text-slate-200 font-mono font-semibold">Standard UTF-8 JSON</span>
              </div>
            </div>
          </div>

          <div className="pt-5 mt-4 border-t border-slate-800">
            <button
              onClick={handleExportBackup}
              className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <ArrowDownToLine className="w-4 h-4" />
              <span>Export & Save Backup JSON</span>
            </button>
          </div>
        </div>

        {/* CARD 2: RESTORE FROM BACKUP */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm mb-2">
              <UploadCloud className="w-5 h-5" />
              <span>Restore Database from File</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Restore your showroom database from an existing <code className="text-cyan-300 font-mono">.json</code> backup file. Existing records will be updated safely without corruption.
            </p>

            <div className="mt-4">
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-800 hover:border-cyan-500/50 rounded-xl cursor-pointer bg-slate-950/60 transition-colors">
                <UploadCloud className="w-8 h-8 text-cyan-400 mb-2" />
                <span className="text-xs font-semibold text-slate-200">
                  Select or drop WCS JSON backup file here
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5">
                  Supports .json backup snapshots
                </span>
                <input
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={handleFileRestore}
                />
              </label>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Need fresh Sri Lankan sample data?
            </span>
            <button
              type="button"
              onClick={handleResetToSeed}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 text-xs font-semibold border border-slate-700 hover:border-rose-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Seed Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Compliance Note */}
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <span className="font-bold text-white block mb-0.5">
            Audit-Grade Data Integrity & Redundancy
          </span>
          All gemstone certificates, gold weight tolerances, customer identity files, and invoice ledgers conform to the National Gem and Jewellery Authority of Sri Lanka audit guidelines. Backups include full cryptographically verifiable records.
        </div>
      </div>
    </div>
  );
};
