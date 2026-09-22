import React, { useState, useEffect, useRef } from 'react';
import { Modal } from './Modal';
import { Barcode, Search, Volume2, Sparkles } from 'lucide-react';
import { Product } from '../../types';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products?: Product[];
  onScanSuccess?: (product: Product) => void;
  onScan?: (scannedCode: string) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  products = [],
  onScanSuccess,
  onScan,
}) => {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setBarcodeInput('');
      setError('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch {
      // AudioContext fallback
    }
  };

  const safeProducts = Array.isArray(products) ? products : [];

  const handleLookup = (code: string) => {
    const trimmed = code.trim().toLowerCase();
    if (!trimmed) return;

    const matched = safeProducts.find(
      (p) =>
        p.barcode?.toLowerCase() === trimmed ||
        p.itemCode?.toLowerCase() === trimmed
    );

    if (matched) {
      playBeep();
      if (onScanSuccess) onScanSuccess(matched);
      if (onScan) onScan(matched.barcode || code);
      onClose();
    } else {
      if (onScan) {
        onScan(code.trim());
        onClose();
      } else {
        setError(`No inventory item matches barcode/code "${code}". Please check or add product.`);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLookup(barcodeInput);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Barcode & Item Code Scanner"
      subtitle="Scan with USB/Bluetooth optical scanner or enter barcode / item code"
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Scanner Simulation Graphics */}
        <div className="relative bg-slate-950 border border-amber-500/30 rounded-xl p-6 text-center overflow-hidden">
          {/* Laser scanning beam animation */}
          <div className="absolute inset-x-0 h-0.5 bg-rose-500 shadow-[0_0_12px_#f43f5e] animate-bounce top-1/2 -translate-y-1/2 opacity-75" />

          <div className="relative z-10 flex flex-col items-center">
            <Barcode className="w-20 h-14 text-amber-300 opacity-90 mb-2" />
            <p className="text-sm font-medium text-slate-300">
              Hardware Scanner is Active & Ready
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Pull scanner trigger or input barcode below. Press Enter to process.
            </p>
          </div>
        </div>

        {/* Manual Barcode Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Barcode / Item Code Input
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                placeholder="Scan barcode or type e.g. 89010010001..."
                value={barcodeInput}
                onChange={(e) => {
                  setBarcodeInput(e.target.value);
                  setError('');
                }}
                onKeyDown={handleKeyDown}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
              />
              <Volume2 className="absolute right-3 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
            <button
              onClick={() => handleLookup(barcodeInput)}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 shadow-lg shadow-amber-900/20"
            >
              <Search className="w-4 h-4" />
              Scan Item
            </button>
          </div>
          {error && <p className="text-xs text-rose-400 mt-2">{error}</p>}
        </div>

        {/* Quick Test Barcode Pills */}
        <div className="pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Quick-Tap Sample Barcodes in Stock:
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            {safeProducts.slice(0, 6).map((product) => (
              <button
                key={product.id}
                onClick={() => {
                  setBarcodeInput(product.barcode);
                  handleLookup(product.barcode);
                }}
                className="text-left p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-amber-500/50 rounded-lg transition-all text-xs group"
              >
                <div className="font-semibold text-slate-200 group-hover:text-amber-300 truncate">
                  {product.name}
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
                  <span className="font-mono text-amber-400">{product.barcode}</span>
                  <span>Rs. {product.sellingPriceLKR.toLocaleString()}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
