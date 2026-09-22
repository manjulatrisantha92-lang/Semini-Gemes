import React, { useState, useRef } from 'react';
import {
  Settings as SettingsIcon,
  Upload,
  Image as ImageIcon,
  Save,
  Database,
  Download,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Github,
  Server,
  Building,
  Gem,
  AlertTriangle,
  FileCheck,
  Trash2,
  X,
  Sparkles,
  UploadCloud,
} from 'lucide-react';
import { AppSettings, User } from '../../types';
import { StorageService } from '../../services/storage';
import { useToast } from '../common/Toast';

interface SettingsViewProps {
  settings: AppSettings;
  currentUser: User;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onRefreshAllData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  currentUser,
  onUpdateSettings,
  onRefreshAllData,
}) => {
  const { showToast } = useToast();

  const [companyName, setCompanyName] = useState(settings.companyName);
  const [companyTagline, setCompanyTagline] = useState(settings.companyTagline);
  const [companyAddress, setCompanyAddress] = useState(settings.companyAddress);
  const [telephone, setTelephone] = useState(settings.telephone);
  const [email, setEmail] = useState(settings.email);
  const [brNumber, setBrNumber] = useState(settings.brNumber);
  const [vatTaxNumber, setVatTaxNumber] = useState(settings.vatTaxNumber || '');
  const [gemologistName, setGemologistName] = useState(settings.gemologistName);
  const [gemologistTitle, setGemologistTitle] = useState(
    settings.gemologistTitle || 'Fellow Gemmological Association (FGA)'
  );
  const [footerTerms, setFooterTerms] = useState(settings.footerTerms);

  // JPG Upload States
  const [logoJpgUrl, setLogoJpgUrl] = useState(settings.logoJpgUrl);
  const [invoiceBgUrl, setInvoiceBgUrl] = useState(settings.invoiceBackgroundJpgUrl);
  const [isInvoiceBgEnabled, setIsInvoiceBgEnabled] = useState(settings.isInvoiceBgEnabled);
  const [certificateBgUrl, setCertificateBgUrl] = useState(settings.certificateBackgroundJpgUrl);
  const [isCertificateBgEnabled, setIsCertificateBgEnabled] = useState(
    settings.isCertificateBgEnabled
  );

  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const invoiceBgFileInputRef = useRef<HTMLInputElement>(null);
  const certBgFileInputRef = useRef<HTMLInputElement>(null);

  // File upload reader for Logo
  const handleLogoFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid JPG or PNG image file.', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Logo file size exceeds 5MB. Please choose a smaller image.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setLogoJpgUrl(dataUrl);
      showToast(`Company logo "${file.name}" uploaded successfully!`, 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleInvoiceBgFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid JPG/PNG image file.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setInvoiceBgUrl(e.target?.result as string);
      setIsInvoiceBgEnabled(true);
      showToast(`Invoice background template "${file.name}" uploaded!`, 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleCertBgFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid JPG/PNG image file.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setCertificateBgUrl(e.target?.result as string);
      setIsCertificateBgEnabled(true);
      showToast(`Certificate template "${file.name}" uploaded!`, 'success');
    };
    reader.readAsDataURL(file);
  };

  // Handle Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: AppSettings = {
      ...settings,
      companyName,
      companyTagline,
      companyAddress,
      telephone,
      email,
      brNumber,
      vatTaxNumber,
      gemologistName,
      gemologistTitle,
      footerTerms,
      logoJpgUrl,
      invoiceBackgroundJpgUrl: invoiceBgUrl,
      isInvoiceBgEnabled,
      certificateBackgroundJpgUrl: certificateBgUrl,
      isCertificateBgEnabled,
    };

    StorageService.updateSettings(updated);
    onUpdateSettings(updated);
    showToast('Company settings & template templates saved successfully!', 'success');
  };

  // Export Full Database Backup (JSON)
  const handleExportBackup = () => {
    const backupJson = StorageService.exportDatabaseBackup();
    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `WCS_Database_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Complete system backup downloaded as JSON!', 'success');
  };

  // Restore Database Backup
  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const success = StorageService.importDatabaseBackup(text);
        if (success) {
          showToast('Database restored successfully from backup!', 'success');
          onRefreshAllData();
        } else {
          showToast('Invalid backup file structure.', 'error');
        }
      } catch (err) {
        showToast('Failed to parse backup JSON file.', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Reset to Initial Seed Data
  const handleResetData = () => {
    if (
      window.confirm(
        'Warning: This will reload all default Sri Lankan gemstone inventory, mock orders and sample invoices. Continue?'
      )
    ) {
      StorageService.resetToInitialSeed();
      showToast('Database reset to authentic Sri Lankan sample data.', 'info');
      onRefreshAllData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-100 font-serif flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-amber-400" />
          System Settings & Template Customization
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Upload custom JPG logos, configure invoice & certificate paper overlays, and manage database backups
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* SECTION 1: Company Profile */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow space-y-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
            <Building className="w-4 h-4 text-amber-400" />
            Company & Showroom Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Company Name *
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Showroom Tagline
              </label>
              <input
                type="text"
                value={companyTagline}
                onChange={(e) => setCompanyTagline(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Business Reg (BR) Number
              </label>
              <input
                type="text"
                value={brNumber}
                onChange={(e) => setBrNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                VAT / Tax Registration
              </label>
              <input
                type="text"
                value={vatTaxNumber}
                onChange={(e) => setVatTaxNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Default Certified Gemologist Name
              </label>
              <input
                type="text"
                placeholder="e.g. F.G.A. S. Wickramasinghe"
                value={gemologistName}
                onChange={(e) => setGemologistName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-serif"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Default Gemologist Title / Designation (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Fellow Gemmological Association (FGA)"
                value={gemologistTitle}
                onChange={(e) => setGemologistTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Telephone Hotline
              </label>
              <input
                type="text"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Official Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Showroom Physical Address
            </label>
            <input
              type="text"
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Invoice Footer Guarantee & Terms
            </label>
            <textarea
              rows={2}
              value={footerTerms}
              onChange={(e) => setFooterTerms(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100"
            />
          </div>
        </div>

        {/* SECTION 2: JPG Logo & Template Uploads */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow space-y-5">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
            <ImageIcon className="w-4 h-4 text-amber-400" />
            JPG Branding & Paper Template Overlays
          </h3>

          {/* 1. Software Logo JPG */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                  <span>Company Header Logo (JPG / PNG)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    Used on Invoices &amp; Reports
                  </span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Printed prominently at the top of Sales Receipts (A4 &amp; 80mm) and Executive Audit Reports.
                </p>
              </div>

              {logoJpgUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setLogoJpgUrl('');
                    showToast('Company logo removed.', 'info');
                  }}
                  className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 transition-colors self-start sm:self-auto cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Logo</span>
                </button>
              )}
            </div>

            {/* Drag & Drop Upload Zone + Live Preview */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              {/* Logo Preview Box */}
              <div className="md:col-span-4 flex items-center gap-3 p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
                {logoJpgUrl ? (
                  <div className="relative group">
                    <img
                      src={logoJpgUrl}
                      alt="Company Logo Preview"
                      referrerPolicy="no-referrer"
                      className="h-14 max-w-[120px] rounded object-contain border border-amber-500/40 bg-white p-1 shrink-0"
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-slate-800 border border-dashed border-slate-600 flex flex-col items-center justify-center text-slate-500 shrink-0">
                    <ImageIcon className="w-5 h-5 text-slate-500" />
                    <span className="text-[9px] mt-0.5 text-slate-500">No Logo</span>
                  </div>
                )}
                <div className="text-left overflow-hidden">
                  <div className="text-xs font-semibold text-slate-200 truncate">
                    {logoJpgUrl ? 'Active Logo Loaded' : 'No Logo Uploaded'}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {logoJpgUrl ? 'Will appear on bill header' : 'Text-only header will be used'}
                  </div>
                </div>
              </div>

              {/* Upload Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingLogo(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDraggingLogo(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingLogo(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleLogoFileUpload(e.dataTransfer.files[0]);
                  }
                }}
                className={`md:col-span-8 p-3 border-2 border-dashed rounded-lg transition-all flex flex-col sm:flex-row items-center justify-between gap-3 ${
                  isDraggingLogo
                    ? 'border-amber-400 bg-amber-500/10'
                    : 'border-slate-700 hover:border-slate-600 bg-slate-900/60'
                }`}
              >
                <input
                  ref={logoFileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleLogoFileUpload(e.target.files[0]);
                    }
                  }}
                />

                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">
                      Drag &amp; drop JPG/PNG file here
                    </div>
                    <div className="text-[10px] text-slate-400">
                      High resolution rectangular or square brand mark (up to 5MB)
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => logoFileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Browse JPG File
                  </button>
                </div>
              </div>
            </div>

            {/* URL Input & Quick 1-Click Presets */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Or enter / paste direct JPG image URL (https://...)..."
                  value={logoJpgUrl}
                  onChange={(e) => setLogoJpgUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 truncate focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                <span className="flex items-center gap-1 text-slate-400 font-medium">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  1-Click Sample Jewelry Logos:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setLogoJpgUrl('https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&auto=format&fit=crop&q=80');
                    showToast('Ceylon Jewelry Crest logo applied!', 'info');
                  }}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 cursor-pointer"
                >
                  Ceylon Jewelry Crest
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLogoJpgUrl('https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&auto=format&fit=crop&q=80');
                    showToast('Royal Gold Emblem logo applied!', 'info');
                  }}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 cursor-pointer"
                >
                  Royal Gold Emblem
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLogoJpgUrl('https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&auto=format&fit=crop&q=80');
                    showToast('Ratnapura Gems Seal applied!', 'info');
                  }}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 cursor-pointer"
                >
                  Ratnapura Gems Seal
                </button>
              </div>
            </div>
          </div>

          {/* 2. Invoice Paper Background JPG */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-bold text-slate-200 text-xs">
                  Invoice Paper / Background JPG Template
                </h4>
                <p className="text-[11px] text-slate-400">
                  Overlay invoice texts directly over pre-printed A4 stationary letterhead
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isInvoiceBgEnabled}
                  onChange={(e) => setIsInvoiceBgEnabled(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-amber-500 w-4 h-4"
                />
                <span className="text-xs font-semibold text-amber-400">Enable Template Overlay</span>
              </label>
            </div>

            <input
              ref={invoiceBgFileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleInvoiceBgFileUpload(e.target.files[0]);
                }
              }}
            />

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="https://... (JPG paper background template)"
                value={invoiceBgUrl}
                onChange={(e) => setInvoiceBgUrl(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 truncate font-mono"
              />
              <button
                type="button"
                onClick={() => invoiceBgFileInputRef.current?.click()}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg font-medium whitespace-nowrap cursor-pointer shrink-0"
              >
                Browse JPG
              </button>
            </div>
          </div>

          {/* 3. Certificate Paper Template JPG */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-bold text-slate-200 text-xs">
                  Certificate Paper Template (JPG)
                </h4>
                <p className="text-[11px] text-slate-400">
                  Prints gemstone specifications directly inside your custom gold-foiled certificate paper
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isCertificateBgEnabled}
                  onChange={(e) => setIsCertificateBgEnabled(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-amber-500 w-4 h-4"
                />
                <span className="text-xs font-semibold text-amber-400">Enable Template Overlay</span>
              </label>
            </div>

            <input
              ref={certBgFileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleCertBgFileUpload(e.target.files[0]);
                }
              }}
            />

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="https://... (JPG certificate border / seal background)"
                value={certificateBgUrl}
                onChange={(e) => setCertificateBgUrl(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 truncate font-mono"
              />
              <button
                type="button"
                onClick={() => certBgFileInputRef.current?.click()}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg font-medium whitespace-nowrap cursor-pointer shrink-0"
              >
                Browse JPG
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-900/30 transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            Save Branding & Overlays
          </button>
        </div>
      </form>

      {/* SECTION 3: Database Backup & Restore */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow space-y-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
          <Database className="w-4 h-4 text-emerald-400" />
          Data Backup, Restore & Reset
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Backup */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <h4 className="font-bold text-xs text-slate-200">Export Full JSON Backup</h4>
            <p className="text-[11px] text-slate-400">
              Download complete snapshot of products, invoices, certificates, customers & orders.
            </p>
            <button
              type="button"
              onClick={handleExportBackup}
              className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              Download Backup
            </button>
          </div>

          {/* Restore */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <h4 className="font-bold text-xs text-slate-200">Restore from JSON</h4>
            <p className="text-[11px] text-slate-400">
              Upload a previously exported backup file to restore system records.
            </p>
            <label className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-sky-400" />
              Upload Backup File
              <input
                type="file"
                accept=".json"
                onChange={handleRestoreBackup}
                className="hidden"
              />
            </label>
          </div>

          {/* Reset */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <h4 className="font-bold text-xs text-slate-200">Reset Demo Data</h4>
            <p className="text-[11px] text-slate-400">
              Re-populate catalog with authentic Sri Lankan sapphires & sample workshop orders.
            </p>
            <button
              type="button"
              onClick={handleResetData}
              className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              Reset to Initial Seed
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 4: Architecture Badges (MongoDB, Vercel, GitHub) */}
      <div className="bg-slate-900/90 border border-amber-500/20 rounded-xl p-6 shadow space-y-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
          <Server className="w-4 h-4 text-amber-400" />
          Production Deployment & Cloud Integration
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* MongoDB */}
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400">MongoDB Atlas</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
                Ready
              </span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Full Mongoose schemas declared in <code className="text-amber-300">/src/models/mongooseSchemas.ts</code>. Set <code className="text-amber-300">MONGODB_URI</code> in environment when deploying remote API.
            </p>
          </div>

          {/* Vercel */}
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200">Vercel Hosting</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
                Configured
              </span>
            </div>
            <p className="text-slate-400 text-[11px]">
              SPA rewrite rules configured in <code className="text-amber-300">vercel.json</code>. Ready for 1-click Vercel git-push deployment with zero configuration.
            </p>
          </div>

          {/* GitHub */}
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200">GitHub Repository</span>
              <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded font-mono">
                Clean Tree
              </span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Clean directory structure with <code className="text-amber-300">README-DEPLOYMENT.md</code> and complete step-by-step instructions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
