import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  Printer,
  Share2,
  Send,
  Copy,
  ExternalLink,
  HelpCircle,
  Download,
  Tag,
  X,
  FileText,
  Receipt,
  Sparkles,
  Sliders,
} from 'lucide-react';
import { AppSettings, Invoice, Customer } from '../../types';
import { StorageService } from '../../services/storage';
import { BarcodeGenerator } from './BarcodeGenerator';
import { PrinterGuideModal } from './PrinterGuideModal';
import { useToast } from './Toast';
import { safeOpenExternal, formatWhatsAppNumber } from '../../utils/navigation';

export interface ReportPrintData {
  reportId: string;
  title: string;
  categoryLabel: string;
  generatedBy: string;
  storeName?: string;
  dateStr: string;
  filterLabel?: string;
  columns: string[];
  rows: (string | number)[][];
  totals?: { label: string; value: string }[];
  auditCode?: string;
}

export interface BillPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  mode?: 'invoice' | 'report';
  invoice?: Invoice | null;
  report?: ReportPrintData | null;
}

export const BillPrintModal: React.FC<BillPrintModalProps> = ({
  isOpen,
  onClose,
  settings,
  mode = 'invoice',
  invoice,
  report,
}) => {
  const { showToast } = useToast();

  // Printout Options
  const [paperMode, setPaperMode] = useState<'a4' | 'thermal'>('a4');
  const [printBarcode, setPrintBarcode] = useState<boolean>(true);
  const [printLetterhead, setPrintLetterhead] = useState<boolean>(true);
  const [printCompanyLogo, setPrintCompanyLogo] = useState<boolean>(true);
  const invoiceBg = settings.invoiceBackgroundJpgUrl || (settings as any).invoiceBgJpgUrl || '';
  const [showItemThumbnails, setShowItemThumbnails] = useState<boolean>(false);
  const [printBackgroundTemplate, setPrintBackgroundTemplate] = useState<boolean>(
    Boolean(settings.isInvoiceBgEnabled && invoiceBg)
  );
  const [printBilingualCustomer, setPrintBilingualCustomer] = useState<boolean>(true);
  const [printDuplicateCopy, setPrintDuplicateCopy] = useState<boolean>(false);
  const [reportViewType, setReportViewType] = useState<'detailed' | 'summary'>('detailed');
  const [showOptionsDropdown, setShowOptionsDropdown] = useState<boolean>(false);

  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [showItemBarcodesModal, setShowItemBarcodesModal] = useState<boolean>(false);

  // System Print Dialog View State matching Screenshot & Video Step 2
  const [isSystemPrintPreviewOpen, setIsSystemPrintPreviewOpen] = useState<boolean>(false);
  const [selectedPrinter, setSelectedPrinter] = useState<string>('Send To OneNote 2013');
  const [copies, setCopies] = useState<number>(1);
  const [layout, setLayout] = useState<'portrait' | 'landscape'>('portrait');
  const [pageSelection, setPageSelection] = useState<'all' | 'custom'>('all');
  const [customPageRange, setCustomPageRange] = useState<string>('');
  const [colorMode, setColorMode] = useState<'color' | 'monochrome'>('color');

  useEffect(() => {
    if (isOpen) {
      setIsSystemPrintPreviewOpen(false);
    }
  }, [isOpen]);

  // Keyboard shortcut listener: F8 to print/trigger preview, Escape to cancel/close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isSystemPrintPreviewOpen) {
          e.preventDefault();
          setIsSystemPrintPreviewOpen(false);
        } else if (showItemBarcodesModal) {
          e.preventDefault();
          setShowItemBarcodesModal(false);
        } else if (isGuideOpen) {
          e.preventDefault();
          setIsGuideOpen(false);
        } else {
          onClose();
        }
      } else if (e.key === 'F8') {
        e.preventDefault();
        if (isSystemPrintPreviewOpen) {
          handleExecuteNativePrint();
        } else {
          handleTriggerPrint();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSystemPrintPreviewOpen, showItemBarcodesModal, isGuideOpen, onClose]);

  if (!isOpen) return null;

  // Safe fallback company details matching the user's reference screenshot
  const companyName = settings.companyName || 'WCS GEMS & JEWELRY (PVT) LTD';
  const companyAddress =
    settings.companyAddress ||
    'No. 148, Galle Road, Colombo 03 / Gem Arcade, Main Street, Ratnapura';
  const telephone = settings.telephone || '+94 11 257 8899 / +94 45 222 4110';
  const vatNumber = (settings as any).vatTaxNumber || (settings as any).vatNumber || 'VAT-10928374-7000';

  // Compute identifiers
  const documentId =
    mode === 'invoice'
      ? invoice?.invoiceNumber || 'INV-2026-0022'
      : report?.auditCode || `WCS-REP-${new Date().getFullYear()}-${report?.reportId || 'AUDIT'}`;

  // Formatted date & time (e.g. 15/09/2026, 15:41 03:42:00 PM)
  const now = new Date();
  const formattedDateTime =
    mode === 'invoice' && invoice?.date
      ? `${invoice.date} ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}`
      : report?.dateStr ||
        `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}`;

  const cashierName =
    mode === 'invoice'
      ? invoice?.cashierName || 'Dilshan Senaratne (Proprietor)'
      : report?.generatedBy || 'Dilshan Senaratne (Proprietor)';

  const customerDisplay =
    mode === 'invoice'
      ? `${invoice?.customerName || 'Dr. Rohan De Silva'}${
          invoice?.customerName && invoice.customerName.includes('(')
            ? ''
            : ' (සාමාන්‍ය පාරිභෝගිකයා)'
        }`
      : `Internal Audit & Governance (${report?.categoryLabel || 'Executive'})`;

  const customerPhone =
    mode === 'invoice'
      ? invoice?.customerPhone || '+94 77 912 3456'
      : undefined;

  // Calculated totals for invoice
  const subtotalLKR =
    typeof invoice?.subtotalLKR === 'number'
      ? invoice.subtotalLKR
      : (invoice?.items || []).reduce(
          (acc, i) =>
            acc +
            (Number((i as any).totalLKR ?? (i as any).totalPriceLKR) ||
              Number(i.unitPriceLKR || 0) * Number(i.quantity || 1)),
          0
        ) || 0;
  const grandTotalLKR = typeof invoice?.grandTotalLKR === 'number' ? invoice.grandTotalLKR : subtotalLKR;
  const tenderedLKR = typeof invoice?.paidAmountLKR === 'number' ? invoice.paidAmountLKR : grandTotalLKR;
  const changeGivenLKR =
    typeof invoice?.balanceLKR === 'number' && invoice.balanceLKR < 0 ? Math.abs(invoice.balanceLKR) : 0;
  const paymentMethod = invoice?.paymentMethod || 'CASH';

  // Calculated report metrics to match invoice totals presentation
  const reportPrimarySubtotal = (() => {
    if (!report?.totals || report.totals.length === 0) return `${report?.rows?.length || 0} Records`;
    return report.totals[0].value;
  })();

  const reportGrandTotal = (() => {
    if (!report?.totals || report.totals.length === 0) return 'VERIFIED';
    const candidate = report.totals.find(
      (t) =>
        t.label.toLowerCase().includes('grand total') ||
        t.label.toLowerCase().includes('net billed') ||
        t.label.toLowerCase().includes('total stock retail') ||
        t.label.toLowerCase().includes('total retail valuation') ||
        t.label.toLowerCase().includes('net operating profit') ||
        t.label.toLowerCase().includes('total making charges') ||
        t.label.toLowerCase().includes('total payroll commitment') ||
        t.label.toLowerCase().includes('total value refunded') ||
        (t.label.toLowerCase().includes('total') && (t.value.includes('Rs.') || !isNaN(Number(t.value))))
    );
    return candidate ? candidate.value : report.totals[report.totals.length - 1].value;
  })();

  // Dynamic page style injector for paper sizing
  const applyDynamicPageStyle = (modeType: 'a4' | 'thermal') => {
    let styleEl = document.getElementById('print-page-style');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'print-page-style';
      document.head.appendChild(styleEl);
    }
    if (modeType === 'thermal') {
      styleEl.innerHTML = `@page { size: 80mm auto; margin: 0; }`;
    } else {
      styleEl.innerHTML = `@page { size: A4 portrait; margin: 6mm 8mm; }`;
    }
    document.body.setAttribute('data-print-mode', modeType);
  };

  // Build clean, standalone printable HTML document for popup window and PDF download
  const buildStandaloneBillHtml = (innerHtml: string, title: string, pMode: 'a4' | 'thermal') => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <style>
          @page {
            size: ${pMode === 'thermal' ? '80mm auto' : 'A4 portrait'};
            margin: ${pMode === 'thermal' ? '1mm' : '6mm 8mm'};
          }
          * { box-sizing: border-box; }
          html, body {
            margin: 0;
            padding: 0;
            background: #ffffff !important;
            color: #000000 !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #064e3b;
            color: #ffffff;
            padding: 10px 18px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 99999;
            font-family: sans-serif;
          }
          .no-print button {
            cursor: pointer;
            padding: 7px 16px;
            border-radius: 8px;
            font-weight: bold;
            font-size: 13px;
            border: none;
          }
          .print-wrapper {
            width: 100%;
            max-width: ${pMode === 'thermal' ? '76mm' : '195mm'};
            margin: 0 auto;
            padding: ${pMode === 'thermal' ? '4px 2px' : '20px 12px'};
            background: #ffffff;
          }
          table { width: 100%; border-collapse: collapse; }
          .text-right { text-align: right; }
          .text-left { text-align: left; }
          .text-center { text-align: center; }
          .font-bold { font-weight: bold; }
          .font-black { font-weight: 900; }
          .font-mono { font-family: monospace; }
          .border-b { border-bottom: 1px solid #000; }
          .border-t { border-top: 1px solid #000; }
          .border-b-2 { border-bottom: 2px solid #000; }
          .border-t-2 { border-top: 2px solid #000; }
          .divide-y > * + * { border-top: 1px solid #e2e8f0; }
          .flex { display: flex; }
          .justify-between { justify-content: space-between; }
          .items-center { align-items: center; }
          .grid { display: grid; }
          .grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }
          .col-span-2 { grid-column: span 2 / span 2; }
          .col-span-6 { grid-column: span 6 / span 6; }
          .relative { position: relative; }
          .absolute { position: absolute; }
          .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
          .z-0 { z-index: 0; }
          .z-10 { z-index: 10; }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @media print {
            .no-print { display: none !important; }
            .print-wrapper { padding: 0 !important; margin: 0 auto !important; }
            body { padding-top: 0 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          }
        </style>
      </head>
      <body style="padding-top: 55px;">
        <div class="no-print">
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="font-weight:900;font-size:14px;letter-spacing:0.5px;">📄 ${title}</span>
            <span style="background:rgba(255,255,255,0.2);padding:2px 8px;border-radius:4px;font-size:11px;">
              ${pMode === 'a4' ? 'A4 Paper' : '80mm Thermal'}
            </span>
          </div>
          <div style="display:flex;gap:10px;">
            <button onclick="window.print()" style="background:#10b981;color:#000;">
              🖨️ Print Now
            </button>
            <button onclick="window.close()" style="background:rgba(255,255,255,0.2);color:#fff;">
              Close
            </button>
          </div>
        </div>
        <div class="print-wrapper">
          ${innerHtml}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              try {
                window.focus();
                window.print();
              } catch(e) {
                console.log(e);
              }
            }, 350);
          };
        </script>
      </body>
    </html>
  `;

  // Open System Print Preview Dialog matching Screenshot 3
  const handleTriggerPrint = () => {
    setIsSystemPrintPreviewOpen(true);
  };

  // Direct portal print trigger: clones into a clean top-level body element to avoid modal overflow clipping
  const handleTriggerPrintDirect = () => {
    applyDynamicPageStyle(paperMode);

    const target =
      document.getElementById('printable-bill-target-system') ||
      document.getElementById('printable-bill-target');
    if (!target) {
      window.print();
      return;
    }

    let portal = document.getElementById('print-portal-root');
    if (!portal) {
      portal = document.createElement('div');
      portal.id = 'print-portal-root';
      document.body.appendChild(portal);
    }
    portal.innerHTML = target.outerHTML;
    document.body.classList.add('is-printing-direct');
    document.body.setAttribute('data-print-mode', paperMode);

    try {
      window.print();
    } catch (e) {
      console.warn('Direct print blocked by sandbox, opening fallback print window', e);
      handleOpenPrintWindow();
    } finally {
      const cleanup = () => {
        document.body.classList.remove('is-printing-direct');
        if (portal && document.body.contains(portal)) {
          portal.innerHTML = '';
        }
        window.removeEventListener('afterprint', cleanup);
      };
      window.addEventListener('afterprint', cleanup);
      setTimeout(cleanup, 2500);
    }
  };

  // Physical print execution from the System Print Preview Dialog
  const handleExecuteNativePrint = () => {
    applyDynamicPageStyle(paperMode);
    showToast(`Sending 1 sheet to printer "${selectedPrinter}"...`, 'info');
    handleTriggerPrintDirect();
  };

  // Open clean dedicated print window (Blob URL bypasses iframe security blocks)
  const handleOpenPrintWindow = () => {
    applyDynamicPageStyle(paperMode);
    const target =
      document.getElementById('printable-bill-target-system') ||
      document.getElementById('printable-bill-target');
    if (!target) {
      window.print();
      return;
    }

    try {
      const fullHtml = buildStandaloneBillHtml(target.outerHTML, documentId, paperMode);
      const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);
      const printWin = window.open(blobUrl, '_blank');
      if (!printWin) {
        showToast('Browser blocked popup window. Downloading printable file instead...', 'info');
        handleDownloadPDF();
      } else {
        showToast(`Opening ${paperMode === 'a4' ? 'A4' : '80mm'} print preview in new window...`, 'success');
      }
    } catch (e) {
      handleDownloadPDF();
    }
  };

  // Download printable HTML document / PDF template
  const handleDownloadPDF = () => {
    const target =
      document.getElementById('printable-bill-target-system') ||
      document.getElementById('printable-bill-target');
    if (!target) return;

    const fullHtml = buildStandaloneBillHtml(target.outerHTML, documentId, paperMode);
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentId}_${paperMode.toUpperCase()}_DOCUMENT.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`Downloaded printable ${documentId}. Open file to save as PDF or print.`, 'success');
  };

  // Generate plain text summary for copying or sharing
  const generateTextSummary = (): string => {
    if (mode === 'invoice' && invoice) {
      const itemsList = (invoice.items || [])
        .map((item, idx) => {
          const itemName = (item as any).name || (item as any).productName || 'Jewelry Item';
          const itemTotal = Number(
            (item as any).totalLKR ??
              (item as any).totalPriceLKR ??
              Number(item.unitPriceLKR || 0) * Number(item.quantity || 1)
          );
          return `${idx + 1}. ${itemName} x${item.quantity || 1} = Rs. ${itemTotal.toLocaleString()}`;
        })
        .join('\n');

      return `*${companyName}*\n${companyAddress}\nTel: ${telephone}\nVAT: ${vatNumber}\n\n*SALES RECEIPT: ${invoice.invoiceNumber || documentId}*\nDate: ${formattedDateTime}\nCashier: ${cashierName}\nCustomer: ${invoice.customerName || 'Customer'}\n\n*Items:*\n${itemsList}\n\n*Subtotal:* Rs. ${Number(subtotalLKR || 0).toLocaleString()}\n*RECEIPT TOTAL:* Rs. ${Number(grandTotalLKR || 0).toLocaleString()}\n*Payment:* ${paymentMethod}\n\nCome Again!\n${documentId}`;
    } else if (report) {
      const rowStrings = (report.rows || [])
        .slice(0, 15)
        .map((r) => r.join(' | '))
        .join('\n');

      return `*${companyName}*\n*OFFICIAL AUDIT REPORT: ${report.title || 'Report'}*\nDate: ${formattedDateTime}\nAuditor: ${cashierName}\n\n*Summary Records:*\n${rowStrings}\n\n*Total Records:* ${(report.rows || []).length}\nAudit Code: ${documentId}`;
    }
    return '';
  };

  // WhatsApp Share Handler
  const handleWhatsAppShare = () => {
    const text = generateTextSummary();
    const phone =
      mode === 'invoice' && invoice?.customerPhone
        ? formatWhatsAppNumber(invoice.customerPhone)
        : '';
    const url = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    safeOpenExternal(url);
    showToast('Opening WhatsApp share...', 'info');
  };

  // Copy Text Handler
  const handleCopyText = () => {
    const text = generateTextSummary();
    navigator.clipboard.writeText(text);
    showToast('Document text copied to clipboard successfully!', 'success');
  };

  // Print Item Barcode Labels
  const handlePrintBarcodeLabels = () => {
    const printWin = window.open('', '_blank', 'width=600,height=700');
    if (!printWin) {
      showToast('Popup blocked. Please allow popups to print barcode labels.', 'error');
      return;
    }

    const itemsToPrint =
      mode === 'invoice' && invoice?.items && invoice.items.length > 0
        ? invoice.items
        : [
            {
              productId: documentId,
              name: mode === 'invoice' ? 'Jewelry Item' : report?.title || 'Report Seal',
              unitPriceLKR: grandTotalLKR,
              quantity: 1,
            },
          ];

    const labelsHtml = itemsToPrint
      .map((it, idx) => {
        const itName = (it as any).name || (it as any).productName || 'Jewelry Item';
        const rawCode = it.productId || (it as any).itemCode || `ITEM-${idx + 1}`;
        const barCode = String(rawCode).replace(/[^a-zA-Z0-9]/g, '').substring(0, 14) || 'PROD01';
        const price = Number(it.unitPriceLKR || 0);
        return `
        <div class="label-box">
          <div class="store">${companyName}</div>
          <div class="name">${itName}</div>
          <div class="barcode">*${barCode}*</div>
          <div class="code">${barCode}</div>
          <div class="price">Rs. ${price.toLocaleString()}</div>
        </div>
      `;
      })
      .join('');

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Barcode Labels - ${documentId}</title>
          <style>
            @page { size: 50mm 25mm; margin: 1mm; }
            body { margin: 0; padding: 4px; font-family: monospace; }
            .label-box {
              width: 48mm;
              height: 23mm;
              border: 1px dashed #bbb;
              padding: 2px 4px;
              text-align: center;
              page-break-after: always;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }
            .store { font-size: 8px; font-weight: bold; }
            .name { font-size: 9px; font-weight: bold; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
            .barcode { font-family: 'Libre Barcode 39', monospace; font-size: 22px; line-height: 1; letter-spacing: 2px; }
            .code { font-size: 8px; }
            .price { font-size: 10px; font-weight: bold; }
          </style>
        </head>
        <body>
          ${labelsHtml}
          <script>window.onload = function() { window.print(); };</script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  // Render pristine printable bill content matching Screenshot 2 and 3
  const renderPrintableBillContent = (targetId: string = 'printable-bill-target') => (
    <div
      id={targetId}
      className={`relative bg-white text-black shadow-2xl transition-all overflow-hidden ${
        paperMode === 'a4'
          ? 'w-full max-w-2xl p-6 sm:p-8 rounded-none font-sans min-h-[920px]'
          : 'w-full max-w-[360px] p-4 font-mono text-[11px] rounded-none'
      }`}
      style={{
        boxSizing: 'border-box',
      }}
    >
      {/* Background Template Watermark/Underlay */}
      {printBackgroundTemplate && invoiceBg && paperMode === 'a4' ? (
        <div
          className="absolute inset-0 pointer-events-none z-0 bg-no-repeat bg-cover bg-center"
          style={{
            backgroundImage: `url(${invoiceBg})`,
            opacity: 0.18,
          }}
        />
      ) : null}

      <div className="relative z-10">
      {/* Document Header matching screenshot */}
      <div className="flex flex-col items-center text-center pb-1">
        {printLetterhead && printCompanyLogo && settings.logoJpgUrl ? (
          <div className="mb-2 flex justify-center">
            <img
              src={settings.logoJpgUrl}
              alt={companyName}
              referrerPolicy="no-referrer"
              className="max-h-14 max-w-[200px] object-contain mx-auto"
            />
          </div>
        ) : null}
        <h1 className="text-sm sm:text-base font-black tracking-wider text-black font-sans uppercase">
          {companyName}
        </h1>
        <p className="text-[12px] text-slate-800 font-sans leading-relaxed">{companyAddress}</p>
        <p className="text-[11.5px] text-slate-800 font-sans">Tel: {telephone}</p>
        <p className="text-[11.5px] text-slate-900 font-sans tracking-wide">
          <span className="font-bold">VAT Reg:</span> {vatNumber}
        </p>
      </div>

      {/* Dividing Line */}
      <div className="border-t border-black my-2"></div>

      {/* Receipt / Report Subhead */}
      <div className="space-y-0.5 text-xs text-black">
        <div className="text-[11px] text-black font-normal">{formattedDateTime}</div>
        <div className="flex items-center justify-between font-bold text-black text-xs sm:text-sm">
          <span>
            {mode === 'invoice'
              ? `Sales Receipt ${documentId}`
              : `System Report ${documentId}`}
          </span>
          <span>Store: 1</span>
        </div>
        {mode === 'report' && report?.title ? (
          <div className="text-[11px] font-bold text-black uppercase tracking-wide pt-0.5">
            {report.title}
          </div>
        ) : null}
      </div>

      {/* Dividing Line */}
      <div className="border-t border-black my-2"></div>

      {/* Personnel / Customer Meta */}
      <div className="space-y-0.5 text-xs text-black">
        <div>
          <span className="font-bold">{mode === 'invoice' ? 'Cashier:' : 'Cashier / Auditor:'}</span> {cashierName}
        </div>
        <div>
          <span className="font-bold">{mode === 'invoice' ? 'Customer:' : 'Report Category:'}</span> {customerDisplay}
        </div>
        {mode === 'invoice' && customerPhone ? (
          <div>
            <span className="font-bold">Tel:</span> {customerPhone}
          </div>
        ) : null}
        {mode === 'report' && report?.filterLabel ? (
          <div>
            <span className="font-bold">Filter:</span> {report.filterLabel}
          </div>
        ) : null}
      </div>

      {/* Dividing Line */}
      <div className="border-t border-black my-2"></div>

      {/* Table of Items / Report Rows */}
      {mode === 'invoice' ? (
        <div>
          {/* Table Header matching screenshot */}
          <div className="grid grid-cols-12 font-bold text-xs pb-1 border-b border-black text-black">
            <div className="col-span-1 text-center">Qty</div>
            <div className="col-span-7 text-left pl-2">Item Name</div>
            <div className="col-span-2 text-right">U/Price</div>
            <div className="col-span-2 text-right">Total</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-slate-100 py-0.5 text-xs">
            {(invoice?.items && invoice.items.length > 0
              ? invoice.items
              : [
                  {
                    productId: 'demo-1',
                    name: "Chrysoberyl Cat's Eye (Rare Honey Color)",
                    quantity: 1,
                    unitPriceLKR: 850000,
                    totalLKR: 850000,
                    metalType: '18K White Gold',
                    purity: '18K',
                    grossWeightGrams: 5.2,
                  },
                ]
            ).map((item, idx) => {
              const itemName = (item as any).name || (item as any).productName || 'Jewelry Item';
              const itemImage =
                (item as any).imageUrl ||
                StorageService.getProducts().find(
                  (p) => p.id === item.productId || p.itemCode === (item as any).itemCode
                )?.imageUrl;
              const unitPrice = Number(item.unitPriceLKR || 0);
              const itemTotal = Number(
                (item as any).totalLKR ??
                  (item as any).totalPriceLKR ??
                  unitPrice * Number(item.quantity || 1)
              );
              return (
                <div
                  key={idx}
                  className="grid grid-cols-12 py-1.5 items-start text-black text-xs leading-snug"
                >
                  <div className="col-span-1 text-center font-normal">{item.quantity || 1}</div>
                  <div className="col-span-7 font-bold pl-2 text-left flex items-center gap-1.5">
                    {showItemThumbnails && itemImage ? (
                      <img
                        src={itemImage}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-4 h-4 rounded object-cover shrink-0 border border-slate-300 inline-block"
                      />
                    ) : null}
                    <span>{itemName}</span>
                  </div>
                  <div className="col-span-2 text-right font-mono font-normal">
                    {unitPrice.toFixed(2)}
                  </div>
                  <div className="col-span-2 text-right font-mono font-bold">
                    {itemTotal.toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Old Gold Trade-In Allowance If Applicable */}
          {invoice?.exchangeAllowanceLKR && invoice.exchangeAllowanceLKR > 0 ? (
            <div className="flex justify-between py-1 text-xs font-semibold text-emerald-800 border-t border-slate-200">
              <span>Old Gold Trade-in Credit:</span>
              <span className="font-mono">
                - {Number(invoice.exchangeAllowanceLKR).toFixed(2)}
              </span>
            </div>
          ) : null}

          {/* Dividing Line */}
          <div className="border-t border-black my-2"></div>

          {/* Totals Section matching Screenshot 3 */}
          <div className="space-y-1 text-xs text-black">
            <div className="flex justify-between font-bold py-1 border-b border-black">
              <span>Subtotal:</span>
              <span className="font-mono font-normal">{Number(subtotalLKR || 0).toFixed(2)}</span>
            </div>

            {invoice?.discountLKR && invoice.discountLKR > 0 ? (
              <div className="flex justify-between py-0.5 text-xs text-black">
                <span>Discount:</span>
                <span className="font-mono">- {Number(invoice.discountLKR).toFixed(2)}</span>
              </div>
            ) : null}

            {invoice?.taxLKR && invoice.taxLKR > 0 ? (
              <div className="flex justify-between py-0.5 text-xs text-black">
                <span>Tax:</span>
                <span className="font-mono">+ {Number(invoice.taxLKR).toFixed(2)}</span>
              </div>
            ) : null}

            <div className="flex justify-between font-black text-sm text-black py-1.5 border-b border-black">
              <span>RECEIPT TOTAL:</span>
              <span className="font-mono">{Number(grandTotalLKR || 0).toFixed(2)}</span>
            </div>

            <div className="space-y-1 pt-1 text-xs">
              <div className="flex justify-between">
                <span className="font-bold">Amount Tendered:</span>
                <span className="font-mono">{Number(tenderedLKR || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">Change Given:</span>
                <span className="font-mono">{Number(changeGivenLKR || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Payment:</span>
                <span className="uppercase">{paymentMethod}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Report View Data Table matching invoice format */
        <div>
          {paperMode === 'a4' ? (
            <div className="overflow-x-auto py-0.5">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-black font-bold text-black">
                    {(report?.columns || []).map((col, idx) => (
                      <th
                        key={idx}
                        className={`pb-1 ${
                          idx === 0
                            ? 'text-left pl-0'
                            : idx >= (report?.columns.length || 1) - 2
                            ? 'text-right pr-1'
                            : 'text-left px-1.5'
                        }`}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 py-0.5">
                  {(report?.rows || []).slice(0, 35).map((row, rIdx) => (
                    <tr key={rIdx} className="text-black text-xs py-1.5 leading-snug">
                      {row.map((val, cIdx) => (
                        <td
                          key={cIdx}
                          className={`py-1.5 ${
                            cIdx === 0
                              ? 'text-left pl-0 font-normal'
                              : cIdx >= row.length - 2
                              ? 'text-right font-mono font-bold pr-1'
                              : 'text-left px-1.5'
                          }`}
                        >
                          {typeof val === 'number'
                            ? val.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })
                            : String(val).replace(/^"|"$/g, '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* 80mm Thermal Compact Report List */
            <div>
              <div className="grid grid-cols-12 font-bold text-xs pb-1 border-b border-black text-black">
                <div className="col-span-2 text-left">Ref</div>
                <div className="col-span-7 text-left pl-1">Description</div>
                <div className="col-span-3 text-right">Amount</div>
              </div>
              <div className="divide-y divide-slate-100 py-0.5 text-xs">
                {(report?.rows || []).slice(0, 25).map((row, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-12 py-1.5 items-start text-black text-xs leading-snug"
                  >
                    <div className="col-span-2 text-left font-normal truncate">
                      {String(row[0]).replace(/^"|"$/g, '')}
                    </div>
                    <div className="col-span-7 font-bold pl-1 text-left">
                      <div>{String(row[1]).replace(/^"|"$/g, '')}</div>
                      {row[2] && (
                        <div className="text-[10px] text-slate-600 font-normal">
                          {String(row[2]).replace(/^"|"$/g, '')}
                          {row[3] ? ` • ${String(row[3]).replace(/^"|"$/g, '')}` : ''}
                        </div>
                      )}
                    </div>
                    <div className="col-span-3 text-right font-mono font-bold">
                      {typeof row[row.length - 1] === 'number'
                        ? (row[row.length - 1] as number).toFixed(2)
                        : String(row[row.length - 1]).replace(/^"|"$/g, '')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dividing Line */}
          <div className="border-t border-black my-2"></div>

          {/* Totals Section matching Screenshot 2 & 3 */}
          <div className="space-y-1 text-xs text-black">
            <div className="flex justify-between font-bold py-1 border-b border-black">
              <span>Subtotal:</span>
              <span className="font-mono font-normal">{reportPrimarySubtotal}</span>
            </div>

            <div className="flex justify-between font-black text-sm text-black py-1.5 border-b border-black">
              <span>REPORT TOTAL:</span>
              <span className="font-mono">{reportGrandTotal}</span>
            </div>

            <div className="space-y-1 pt-1 text-xs">
              {(report?.totals || []).slice(1).map((t, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="font-bold">{t.label}:</span>
                  <span className="font-mono">{t.value}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold">
                <span>Audit Status:</span>
                <span className="uppercase font-mono">VERIFIED BY ERP</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Barcode Section matching Screenshot 3 & Video */}
      {printBarcode && (
        <div className="mt-8 pt-2 flex flex-col items-center justify-center text-center">
          <BarcodeGenerator
            value={documentId}
            width={paperMode === 'a4' ? 220 : 180}
            height={48}
            showText={true}
          />
        </div>
      )}

      {/* Thank you and System by WCS POS footer matching Video clip */}
      <div className="mt-3 text-center space-y-0.5 text-xs text-black">
        <div className="font-bold text-xs">Thank You For Your Business!</div>
        <div className="text-[11px] text-slate-700">Come Again</div>
        <div className="text-[10px] text-slate-500 font-mono pt-0.5">System by WCS POS</div>
      </div>

      {/* Optional Thermal Duplicate Store Copy */}
      {paperMode === 'thermal' && printDuplicateCopy && (
        <div className="mt-6 pt-6 border-t-2 border-dashed border-black">
          <div className="text-center font-bold text-xs uppercase mb-2">
            *** MERCHANT / STORE AUDIT COPY ***
          </div>
          <div className="flex justify-between text-[11px]">
            <span>{documentId}</span>
            <span>{formattedDateTime}</span>
          </div>
          <div className="flex justify-between font-bold text-xs mt-2">
            <span>RECEIPT TOTAL:</span>
            <span>Rs. {grandTotalLKR.toFixed(2)}</span>
          </div>
          <div className="text-[10px] text-center mt-3 text-slate-600">
            Retain for jewelry vault ledger audit
          </div>
        </div>
      )}
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150">
        <div className="relative w-full max-w-4xl bg-[#0d121d] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[96vh]">
          {/* 1. Header Bar matching Screenshot 1 */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-[#090d16]">
            {/* Left: Checkmark and Title */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border border-emerald-500/50 bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-100 uppercase tracking-tight flex items-center gap-2">
                  <span>
                    {mode === 'invoice' ? 'SALES BILL' : 'AUDIT REPORT'} – {documentId}
                  </span>
                </h2>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">{formattedDateTime}</p>
              </div>
            </div>

            {/* Right: A4 Paper vs 80mm Thermal Switcher + Close Button */}
            <div className="flex items-center gap-2">
              <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPaperMode('a4')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    paperMode === 'a4'
                      ? 'bg-[#10b981] text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>A4 Paper</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaperMode('thermal')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    paperMode === 'thermal'
                      ? 'bg-[#10b981] text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>80mm Thermal</span>
                </button>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Close Window"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 2. Checkbox & Item Barcodes Subheader matching screenshot */}
          <div className="px-4 sm:px-6 py-2.5 bg-[#0b0f19] border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-200">
                <input
                  type="checkbox"
                  checked={printBarcode}
                  onChange={(e) => setPrintBarcode(e.target.checked)}
                  className="w-4 h-4 text-emerald-500 bg-slate-900 border-slate-700 rounded focus:ring-emerald-500 focus:ring-offset-slate-900 accent-emerald-500"
                />
                <span className="font-mono text-emerald-400 font-bold tracking-wider">||||</span>
                <span>
                  Print Barcode on {mode === 'invoice' ? 'Bill' : 'Report'}
                </span>
              </label>

              {settings.logoJpgUrl ? (
                <label className="flex items-center gap-1.5 cursor-pointer select-none text-xs font-semibold text-slate-300 hover:text-white">
                  <input
                    type="checkbox"
                    checked={printCompanyLogo}
                    onChange={(e) => setPrintCompanyLogo(e.target.checked)}
                    className="w-4 h-4 text-amber-500 bg-slate-900 border-slate-700 rounded accent-amber-500"
                  />
                  <span>Company Logo</span>
                </label>
              ) : null}

              <label className="flex items-center gap-1.5 cursor-pointer select-none text-xs font-semibold text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={showItemThumbnails}
                  onChange={(e) => setShowItemThumbnails(e.target.checked)}
                  className="w-4 h-4 text-cyan-500 bg-slate-900 border-slate-700 rounded accent-cyan-500"
                />
                <span>Micro Item Thumbnails</span>
              </label>

              {invoiceBg ? (
                <label className="flex items-center gap-1.5 cursor-pointer select-none text-xs font-semibold text-slate-300 hover:text-white">
                  <input
                    type="checkbox"
                    checked={printBackgroundTemplate}
                    onChange={(e) => setPrintBackgroundTemplate(e.target.checked)}
                    className="w-4 h-4 text-purple-500 bg-slate-900 border-slate-700 rounded accent-purple-500"
                  />
                  <span>Invoice Background Template</span>
                </label>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => setShowItemBarcodesModal(true)}
              className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-600/40 rounded-lg text-xs font-medium transition-all cursor-pointer"
            >
              <Tag className="w-3.5 h-3.5 text-emerald-400" />
              <span>{mode === 'invoice' ? 'Item Barcodes' : 'Report Summary'}</span>
            </button>
          </div>

          {/* 3. Golden Yellow Alert/Tip Banner matching screenshot */}
          <div className="px-4 sm:px-6 py-2 bg-[#1c1608] border-b border-amber-500/20 flex items-center justify-start gap-2 text-xs text-amber-300">
            <span className="shrink-0 text-sm">💡</span>
            <span>
              <strong className="text-amber-200 font-bold">
                {paperMode === 'a4' ? 'A4 Printout Mode:' : '80mm Thermal Mode:'}
              </strong>{' '}
              Click{' '}
              <button
                type="button"
                onClick={handleTriggerPrint}
                className="underline hover:text-amber-100 font-bold cursor-pointer"
              >
                Print Page
              </button>{' '}
              or{' '}
              <button
                type="button"
                onClick={handleTriggerPrint}
                className="underline hover:text-amber-100 font-bold cursor-pointer"
              >
                Print Bill
              </button>{' '}
              to print clean {paperMode === 'a4' ? 'A4 paper' : '80mm receipt roll'} format
              without unnecessary sub-details.
            </span>
          </div>

          {/* 4. Center Document Preview Container matching Screenshot 1 & 2 */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#070a11] flex justify-center items-start">
            {renderPrintableBillContent('printable-bill-target')}
          </div>

          {/* 5. Bottom Action Buttons matching Screenshot 1 */}
          <div className="p-4 sm:p-5 bg-[#090d16] border-t border-slate-800 space-y-3">
            {/* Action Row 1: 4 Pill Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Share WhatsApp */}
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 rotate-[-10deg]" />
                <span>Share WhatsApp</span>
              </button>

              {/* Copy Text */}
              <button
                type="button"
                onClick={handleCopyText}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Text</span>
              </button>

              {/* Print Page */}
              <button
                type="button"
                onClick={handleTriggerPrint}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Print Page</span>
              </button>

              {/* Printer Guide */}
              <button
                type="button"
                onClick={() => setIsGuideOpen(true)}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Printer Guide</span>
              </button>
            </div>

            {/* Action Row 2: Download PDF matching Screenshot 1 */}
            <div className="flex items-center">
              <button
                type="button"
                onClick={handleDownloadPDF}
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Download PDF</span>
              </button>
            </div>

            {/* Action Row 3: Primary Dual Action Buttons matching Screenshot 1 */}
            <div className="flex flex-col sm:flex-row items-stretch gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#0c2a20] hover:bg-[#12382b] text-emerald-400 border border-emerald-500/50 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all shadow-md active:scale-98 cursor-pointer sm:w-auto"
              >
                <Share2 className="w-4 h-4 text-emerald-400" />
                <span>WHATSAPP {mode === 'invoice' ? 'BILL' : 'REPORT'}</span>
              </button>

              <button
                type="button"
                onClick={handleTriggerPrint}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-[#10b981] hover:bg-[#059669] active:bg-[#047857] text-slate-950 font-black rounded-xl text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-emerald-950/40 transition-all active:scale-98 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                <span>
                  PRINT {paperMode === 'a4' ? 'A4 PAPER' : '80MM THERMAL'}{' '}
                  {mode === 'invoice' ? 'BILL' : 'REPORT'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Printer Guide Modal */}
      <PrinterGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        mode={paperMode}
      />

      {/* Item Barcodes Popup Modal With Dedicated Print Labels Action */}
      {showItemBarcodesModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0f1422] border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Tag className="w-4 h-4" />
                <span>Item Barcodes & Jewelry Tags</span>
              </div>
              <button
                onClick={() => setShowItemBarcodesModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {mode === 'invoice' && invoice?.items ? (
                invoice.items.map((it, idx) => {
                  const itName = (it as any).name || (it as any).productName || 'Jewelry Item';
                  const rawCode = it.productId || (it as any).itemCode || `ITEM-${idx + 1}`;
                  const barCode = String(rawCode).substring(0, 12);
                  return (
                    <div
                      key={idx}
                      className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2"
                    >
                      <div className="flex justify-between items-start text-xs">
                        <span className="font-bold text-slate-200">{itName}</span>
                        <span className="font-mono text-amber-400">Qty: {it.quantity || 1}</span>
                      </div>
                      <div className="flex justify-center bg-white p-2 rounded">
                        <BarcodeGenerator
                          value={barCode}
                          width={180}
                          height={32}
                          showText={true}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                  <div className="text-xs text-slate-300 font-semibold">Report Audit Seal:</div>
                  <div className="flex justify-center bg-white p-2 rounded">
                    <BarcodeGenerator value={documentId} width={200} height={36} showText={true} />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handlePrintBarcodeLabels}
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Barcode Labels (50x25mm)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowItemBarcodesModal(false)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* System Print Preview Dialog matching Screenshot 3 */}
      {isSystemPrintPreviewOpen && (
        <div className="fixed inset-0 z-[100] flex bg-[#202124] select-none animate-in fade-in duration-100 overflow-hidden font-sans">
          {/* Left Column: Chrome / Windows Print Settings Sidebar */}
          <div className="w-72 sm:w-80 shrink-0 h-full bg-[#202124] border-r border-[#3c4043] flex flex-col justify-between p-5 sm:p-6 overflow-y-auto text-slate-200">
            <div>
              {/* Title and Help Icon */}
              <div className="flex items-center justify-between mb-0.5">
                <h2 className="text-white text-base font-medium tracking-normal">Print</h2>
                <button
                  type="button"
                  onClick={() => setIsGuideOpen(true)}
                  className="w-5 h-5 rounded-full border border-slate-500 text-slate-400 hover:text-white hover:border-slate-300 flex items-center justify-center text-[11px] font-bold cursor-pointer transition-colors"
                  title="Printer Help"
                >
                  ?
                </button>
              </div>
              <p className="text-slate-400 text-xs mb-6">Total: 1 sheet of paper</p>

              {/* Printer Selection */}
              <div className="space-y-1.5 mb-5">
                <label className="block text-xs text-slate-300 font-medium">Printer</label>
                <div className="relative">
                  <select
                    value={selectedPrinter}
                    onChange={(e) => setSelectedPrinter(e.target.value)}
                    className="w-full bg-[#202124] hover:bg-[#2b2d31] text-white text-xs border border-[#3c4043] rounded px-3 py-2 pr-8 appearance-none focus:outline-none focus:border-blue-400 cursor-pointer"
                  >
                    <option value="Send To OneNote 2013">Send To OneNote 2013</option>
                    <option value="Microsoft Print to PDF">Microsoft Print to PDF</option>
                    <option value="Save as PDF">Save as PDF</option>
                    <option value="POS-80 Thermal Roll (USB/Network)">POS-80 Thermal Roll (USB/Network)</option>
                    <option value="Default System Printer">Default System Printer</option>
                  </select>
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Copies */}
              <div className="space-y-1.5 mb-5">
                <label className="block text-xs text-slate-300 font-medium">Copies</label>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={copies}
                  onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 bg-[#202124] border border-[#3c4043] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-400"
                />
              </div>

              {/* Layout */}
              <div className="space-y-2 mb-5">
                <label className="block text-xs text-slate-300 font-medium">Layout</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 text-xs text-slate-200 cursor-pointer">
                    <input
                      type="radio"
                      name="print-layout"
                      checked={layout === 'portrait'}
                      onChange={() => setLayout('portrait')}
                      className="w-4 h-4 accent-blue-500 cursor-pointer"
                    />
                    <span>Portrait</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-slate-200 cursor-pointer">
                    <input
                      type="radio"
                      name="print-layout"
                      checked={layout === 'landscape'}
                      onChange={() => setLayout('landscape')}
                      className="w-4 h-4 accent-blue-500 cursor-pointer"
                    />
                    <span>Landscape</span>
                  </label>
                </div>
              </div>

              {/* Pages */}
              <div className="space-y-2 mb-5">
                <label className="block text-xs text-slate-300 font-medium">Pages</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 text-xs text-slate-200 cursor-pointer">
                    <input
                      type="radio"
                      name="print-pages"
                      checked={pageSelection === 'all'}
                      onChange={() => setPageSelection('all')}
                      className="w-4 h-4 accent-blue-500 cursor-pointer"
                    />
                    <span>All</span>
                  </label>
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="print-pages"
                      checked={pageSelection === 'custom'}
                      onChange={() => setPageSelection('custom')}
                      className="w-4 h-4 accent-blue-500 cursor-pointer"
                    />
                    <input
                      type="text"
                      placeholder="e.g. 1-5, 8, 11-13"
                      value={customPageRange}
                      onChange={(e) => {
                        setCustomPageRange(e.target.value);
                        setPageSelection('custom');
                      }}
                      className="w-36 bg-[#202124] border border-[#3c4043] rounded px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                    />
                  </div>
                </div>
              </div>

              {/* Color */}
              <div className="space-y-1.5 mb-5">
                <label className="block text-xs text-slate-300 font-medium">Color</label>
                <div className="relative">
                  <select
                    value={colorMode}
                    onChange={(e) => setColorMode(e.target.value as any)}
                    className="w-full bg-[#202124] hover:bg-[#2b2d31] text-white text-xs border border-[#3c4043] rounded px-3 py-2 pr-8 appearance-none focus:outline-none focus:border-blue-400 cursor-pointer"
                  >
                    <option value="color">Color</option>
                    <option value="monochrome">Black and white</option>
                  </select>
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Options: Company Logo & Item Images */}
              <div className="space-y-2 mb-5">
                <label className="block text-xs text-slate-300 font-medium">Header &amp; Items</label>
                <div className="space-y-2">
                  {settings.logoJpgUrl ? (
                    <label className="flex items-center gap-2.5 text-xs text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={printCompanyLogo}
                        onChange={(e) => setPrintCompanyLogo(e.target.checked)}
                        className="w-4 h-4 accent-blue-500 cursor-pointer"
                      />
                      <span>Company Logo Header</span>
                    </label>
                  ) : null}
                  <label className="flex items-center gap-2.5 text-xs text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showItemThumbnails}
                      onChange={(e) => setShowItemThumbnails(e.target.checked)}
                      className="w-4 h-4 accent-blue-500 cursor-pointer"
                    />
                    <span>Item Micro Images (JPG)</span>
                  </label>
                  {invoiceBg ? (
                    <label className="flex items-center gap-2.5 text-xs text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={printBackgroundTemplate}
                        onChange={(e) => setPrintBackgroundTemplate(e.target.checked)}
                        className="w-4 h-4 accent-blue-500 cursor-pointer"
                      />
                      <span>Background Watermark Template</span>
                    </label>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Action Buttons at Bottom of Left Sidebar */}
            <div className="pt-4 border-t border-[#3c4043] flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleExecuteNativePrint}
                className="px-6 py-2 bg-white hover:bg-slate-200 active:bg-slate-300 text-black font-semibold text-xs rounded-md shadow-sm transition-colors cursor-pointer"
              >
                Print
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSystemPrintPreviewOpen(false);
                }}
                className="px-5 py-2 bg-[#3c4043] hover:bg-[#4d5258] text-white font-semibold text-xs rounded-md transition-colors cursor-pointer"
                title="Return to bill options modal [Esc]"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Right Column: Canvas with Dark Charcoal Grey (#31343b) Background & Centered White Page */}
          <div className="flex-1 overflow-y-auto bg-[#31343b] p-6 sm:p-10 flex items-start justify-center">
            <div
              className={`bg-white text-black shadow-2xl transition-all ${
                layout === 'landscape' ? 'w-full max-w-[840px] p-8' : 'w-full max-w-[620px] p-8 sm:p-10'
              }`}
              style={{
                boxSizing: 'border-box',
                minHeight: layout === 'landscape' ? '460px' : '720px',
                filter: colorMode === 'monochrome' ? 'grayscale(100%)' : 'none',
              }}
            >
              {renderPrintableBillContent('printable-bill-target-system')}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
