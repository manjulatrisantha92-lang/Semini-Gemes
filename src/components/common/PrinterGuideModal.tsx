import React from 'react';
import { HelpCircle, Printer, CheckCircle2, FileText, Settings, X } from 'lucide-react';

interface PrinterGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'a4' | 'thermal';
}

export const PrinterGuideModal: React.FC<PrinterGuideModalProps> = ({
  isOpen,
  onClose,
  mode,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#0f1422] border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Jewelry POS Printer & Paper Setup Guide
              </h3>
              <p className="text-xs text-slate-400">
                Optimal settings for 1-Sheet A4 Paper & 80mm Thermal Rolls
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs text-slate-300">
          {mode === 'a4' ? (
            <div className="space-y-3">
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-300 text-sm">
                    Clean 1-Sheet A4 Print Guarantee
                  </h4>
                  <p className="text-slate-300 mt-1 leading-relaxed">
                    The document is engineered to fit within a single A4 page without header
                    spillover or trailing blank pages.
                  </p>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
                <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5 text-amber-400" />
                  Recommended Chrome / Edge Print Dialog Settings:
                </h5>
                <ul className="space-y-2 text-slate-300 list-disc list-inside pl-1">
                  <li>
                    <strong className="text-white">Destination:</strong> Any A4 Laser/Inkjet
                    Printer or <span className="text-amber-400">"Save as PDF"</span>.
                  </li>
                  <li>
                    <strong className="text-white">Layout:</strong> Portrait.
                  </li>
                  <li>
                    <strong className="text-white">Margins:</strong>{' '}
                    <span className="text-emerald-400 font-semibold">"Default"</span> or{' '}
                    <span className="text-emerald-400 font-semibold">"Minimum"</span>.
                  </li>
                  <li>
                    <strong className="text-white">Options:</strong> Turn on{' '}
                    <span className="text-amber-400">"Background graphics"</span> to preserve
                    company logo and contrast banners.
                  </li>
                  <li>
                    <strong className="text-white">Headers and footers:</strong> Turn{' '}
                    <span className="text-rose-400">OFF</span> (uncheck) so browser URLs and
                    dates do not print on your official bill.
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-xl flex items-start gap-2.5">
                <FileText className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-blue-300 text-sm">
                    80mm (3-Inch) Thermal Receipt Printing
                  </h4>
                  <p className="text-slate-300 mt-1 leading-relaxed">
                    Designed for high-speed POS thermal receipt printers (Epson TM-T88, Bixolon,
                    Xprinter, Rongta).
                  </p>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
                <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5 text-amber-400" />
                  Thermal Printer Setup Tips:
                </h5>
                <ul className="space-y-2 text-slate-300 list-disc list-inside pl-1">
                  <li>
                    <strong className="text-white">Paper Size:</strong> Select{' '}
                    <span className="text-blue-400">80mm × 297mm</span> or{' '}
                    <span className="text-blue-400">Roll Paper 80mm</span>.
                  </li>
                  <li>
                    <strong className="text-white">Margins:</strong> Set to{' '}
                    <span className="text-emerald-400 font-semibold">"None"</span>.
                  </li>
                  <li>
                    <strong className="text-white">Scale:</strong> Set to{' '}
                    <span className="text-emerald-400 font-semibold">100%</span> or "Fit to paper
                    width".
                  </li>
                  <li>
                    <strong className="text-white">Auto-Cutter:</strong> Supported by standard
                    receipt roll drivers at the end of the barcode.
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-900/90 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs transition-colors"
          >
            Got It, Ready to Print
          </button>
        </div>
      </div>
    </div>
  );
};
