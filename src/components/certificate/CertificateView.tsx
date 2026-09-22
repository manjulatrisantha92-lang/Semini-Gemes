import React, { useState, useEffect } from 'react';
import {
  FileText,
  Printer,
  Sparkles,
  Gem,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  CheckCircle,
  Eye,
  Award,
  Edit3,
  Save,
  AlertTriangle,
  X,
} from 'lucide-react';
import { Certificate, Invoice, Product, AppSettings, User } from '../../types';
import { StorageService } from '../../services/storage';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';
import { isGemSalesInvoice, getGemItemsFromInvoice } from '../../utils/gemstones';

interface CertificateViewProps {
  certificates: Certificate[];
  invoices: Invoice[];
  products: Product[];
  settings: AppSettings;
  currentUser: User;
  onRefresh: () => void;
  preselectedInvoice?: Invoice | null;
}

export const CertificateView: React.FC<CertificateViewProps> = ({
  certificates,
  invoices,
  products,
  settings,
  currentUser,
  onRefresh,
  preselectedInvoice,
}) => {
  const { showToast } = useToast();

  // Gemstone Sales Invoices only
  const gemSalesInvoices = invoices.filter((inv) => isGemSalesInvoice(inv, products));

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [printableCertificate, setPrintableCertificate] = useState<Certificate | null>(null);

  // Form Fields
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>(
    preselectedInvoice?.id || gemSalesInvoices[0]?.id || ''
  );
  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(0);
  const [customerName, setCustomerName] = useState(preselectedInvoice?.customerName || '');
  const [jewelryName, setJewelryName] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [barcode, setBarcode] = useState('');
  const [gemstoneType, setGemstoneType] = useState<any>('Blue Sapphire (Ceylon)');
  const [gemstoneCarats, setGemstoneCarats] = useState<number>(3.2);
  const [gemstoneCut, setGemstoneCut] = useState('Cushion Mixed Cut');
  const [gemstoneColor, setGemstoneColor] = useState('Royal Vivid Blue');
  const [gemstoneClarity, setGemstoneClarity] = useState('VVS1');
  const [gemstoneOrigin, setGemstoneOrigin] = useState('Ratnapura, Sri Lanka');
  const [goldPurity, setGoldPurity] = useState('18K White Gold');
  const [grossWeight, setGrossWeight] = useState<number>(6.8);
  const [netGoldWeight, setNetGoldWeight] = useState<number>(6.16);
  const [appraisedValue, setAppraisedValue] = useState<number>(550000);
  const [labNumber, setLabNumber] = useState('NGJA-LK-2026-9041');
  const [remarks, setRemarks] = useState(
    'Tested via Raman spectrometer and optical microscopy. No indications of thermal or chemical enhancement (Natural Unheated).'
  );

  // Optional Gemstone Image insertion state
  const [includeProductImage, setIncludeProductImage] = useState<boolean>(true);
  const [productImageUrl, setProductImageUrl] = useState<string>(
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&auto=format&fit=crop&q=80'
  );

  // Authorized Certified Gemologist Optional State (Form)
  const [gemologistSignatureName, setGemologistSignatureName] = useState<string>(
    settings.gemologistName || 'F.G.A. S. Wickramasinghe'
  );
  const [gemologistTitle, setGemologistTitle] = useState<string>(
    settings.gemologistTitle || 'Fellow Gemmological Association (FGA)'
  );
  const [includeGemologistSignature, setIncludeGemologistSignature] = useState<boolean>(true);

  // Live state for A4 Preview Modal (allows real-time in-line preview & direct saving to certificate)
  const [previewGemologistName, setPreviewGemologistName] = useState<string>('');
  const [previewGemologistTitle, setPreviewGemologistTitle] = useState<string>('');
  const [previewIncludeGemologist, setPreviewIncludeGemologist] = useState<boolean>(true);
  const [isCustomizeSignatureOpen, setIsCustomizeSignatureOpen] = useState<boolean>(false);

  // Optional image state for A4 Preview Modal
  const [previewIncludeProductImage, setPreviewIncludeProductImage] = useState<boolean>(true);
  const [previewProductImageUrl, setPreviewProductImageUrl] = useState<string>('');
  const [isCustomizeImageOpen, setIsCustomizeImageOpen] = useState<boolean>(false);

  // Quick populate when selecting a gem sales invoice or gem item
  const handleSelectInvoice = (invId: string, itemIdx: number = 0) => {
    setSelectedInvoiceId(invId);
    setSelectedItemIndex(itemIdx);
    const inv = invoices.find((i) => i.id === invId);
    if (inv) {
      setCustomerName(inv.customerName);
      const gemItems = getGemItemsFromInvoice(inv, products);
      const chosenItem = gemItems[itemIdx] || inv.items[itemIdx] || inv.items[0];
      if (chosenItem) {
        setJewelryName(chosenItem.name);
        setItemCode(chosenItem.itemCode);
        const prod = products.find(
          (p) => p.id === chosenItem.productId || p.itemCode === chosenItem.itemCode
        );
        if (prod) {
          setBarcode(prod.barcode || StorageService.generateNextBarcode());
          setGemstoneType(
            prod.gemstoneType && prod.gemstoneType !== 'None'
              ? prod.gemstoneType
              : chosenItem.gemstoneType || 'Blue Sapphire (Ceylon)'
          );
          setGemstoneCarats(
            prod.gemWeightCarats || prod.gemstoneDetails?.carats || 0
          );
          setGemstoneCut(prod.gemstoneDetails?.cut || 'Mixed Cut');
          setGemstoneColor(prod.gemstoneDetails?.color || 'Ceylon Blue');
          setGemstoneClarity(prod.gemstoneDetails?.clarity || 'Eye Clean');
          setGemstoneOrigin(prod.gemstoneDetails?.origin || 'Ratnapura, Sri Lanka');
          setGoldPurity(
            prod.goldPurity && prod.goldPurity !== 'None'
              ? `${prod.goldPurity} Gold`
              : '18K White Gold'
          );
          setGrossWeight(prod.grossWeightGrams || chosenItem.weightGrams || 0);
          setNetGoldWeight(
            prod.netGoldWeightGrams || prod.grossWeightGrams || chosenItem.weightGrams || 0
          );
          setAppraisedValue(chosenItem.unitPriceLKR || prod.sellingPriceLKR || 0);
          if (prod.imageUrl) {
            setProductImageUrl(prod.imageUrl);
            setIncludeProductImage(true);
          } else {
            setProductImageUrl('');
            setIncludeProductImage(false);
          }
        } else {
          setBarcode(StorageService.generateNextBarcode());
          setGemstoneType(chosenItem.gemstoneType || 'Blue Sapphire (Ceylon)');
          setGrossWeight(chosenItem.weightGrams || 0);
          setAppraisedValue(chosenItem.unitPriceLKR || 0);
          setProductImageUrl('');
          setIncludeProductImage(false);
        }
      }
    }
  };

  // Image File Upload for Create Form
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image file is larger than 5MB. Please choose a smaller photo.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setProductImageUrl(result);
          setIncludeProductImage(true);
          showToast('Gemstone photo loaded successfully!', 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Image File Upload for Preview Modal
  const handlePreviewImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image file is larger than 5MB. Please choose a smaller photo.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setPreviewProductImageUrl(result);
          setPreviewIncludeProductImage(true);
          showToast('Gemstone photo loaded for preview!', 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Preselected invoice listener
  useEffect(() => {
    if (preselectedInvoice) {
      handleSelectInvoice(preselectedInvoice.id, 0);
      setGemologistSignatureName(settings.gemologistName || 'F.G.A. S. Wickramasinghe');
      setGemologistTitle(settings.gemologistTitle || 'Fellow Gemmological Association (FGA)');
      setIncludeGemologistSignature(true);
      setIsCreateModalOpen(true);
    }
  }, [preselectedInvoice]);

  // Open Create Certificate Modal
  const handleOpenCreateModal = () => {
    if (gemSalesInvoices.length > 0) {
      handleSelectInvoice(gemSalesInvoices[0].id, 0);
    }
    setGemologistSignatureName(settings.gemologistName || 'F.G.A. S. Wickramasinghe');
    setGemologistTitle(settings.gemologistTitle || 'Fellow Gemmological Association (FGA)');
    setIncludeGemologistSignature(true);
    setIsCreateModalOpen(true);
  };

  // Open Print Preview Modal with synchronized live states
  const handleOpenPrintPreview = (cert: Certificate) => {
    setPrintableCertificate(cert);
    setPreviewGemologistName(
      cert.gemologistSignatureName !== undefined
        ? cert.gemologistSignatureName
        : settings.gemologistName || 'F.G.A. S. Wickramasinghe'
    );
    setPreviewGemologistTitle(
      cert.gemologistTitle !== undefined
        ? cert.gemologistTitle
        : settings.gemologistTitle || 'Fellow Gemmological Association (FGA)'
    );
    setPreviewIncludeGemologist(cert.includeGemologistSignature !== false);
    setPreviewIncludeProductImage(
      cert.includeProductImage !== false && !!cert.productImageUrl
    );
    setPreviewProductImageUrl(cert.productImageUrl || '');
    setIsCustomizeSignatureOpen(false);
    setIsCustomizeImageOpen(false);
  };

  // Save live in-line gemologist changes directly back to certificate
  const handleSaveInlineSignature = () => {
    if (!printableCertificate) return;
    const updatedCert: Certificate = {
      ...printableCertificate,
      gemologistSignatureName: previewGemologistName.trim(),
      gemologistTitle: previewGemologistTitle.trim(),
      includeGemologistSignature: previewIncludeGemologist,
    };
    StorageService.updateCertificate(updatedCert);
    setPrintableCertificate(updatedCert);
    onRefresh();
    showToast('Gemologist details updated in certificate in line!', 'success');
  };

  // Save live in-line gemstone image changes directly back to certificate
  const handleSaveInlineImage = () => {
    if (!printableCertificate) return;
    const updatedCert: Certificate = {
      ...printableCertificate,
      includeProductImage: previewIncludeProductImage,
      productImageUrl: previewIncludeProductImage ? previewProductImageUrl.trim() : '',
    };
    StorageService.updateCertificate(updatedCert);
    setPrintableCertificate(updatedCert);
    onRefresh();
    showToast('Gemstone photo settings saved to certificate!', 'success');
  };

  // Save Certificate
  const handleSaveCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceId) {
      showToast('Please select a valid gemstone sales invoice.', 'error');
      return;
    }

    const certNumber = StorageService.generateNextCertificateNumber();
    const inv = invoices.find((i) => i.id === selectedInvoiceId);

    const effectiveImageUrl = includeProductImage ? productImageUrl.trim() : '';

    const newCert: Certificate = {
      id: `cert-${Date.now()}`,
      certificateNumber: certNumber,
      invoiceNumber: inv?.invoiceNumber || 'INV-DIRECT',
      invoiceId: selectedInvoiceId,
      date: new Date().toISOString().split('T')[0],
      customerName,
      customerPhone: inv?.customerPhone,
      itemCode: itemCode || 'JWL-001',
      barcode: barcode || StorageService.generateNextBarcode(),
      jewelryName,
      category: 'Loose Gemstones',
      gemstoneType,
      gemstoneCaratWeight: Number(gemstoneCarats),
      gemstoneCut,
      gemstoneColor,
      gemstoneClarity,
      gemstoneOrigin,
      goldPurity,
      grossWeightGrams: Number(grossWeight),
      netGoldWeightGrams: Number(netGoldWeight),
      appraisedValueLKR: Number(appraisedValue),
      laboratoryVerificationNo: labNumber,
      gemologistSignatureName: gemologistSignatureName.trim(),
      gemologistTitle: gemologistTitle.trim(),
      includeGemologistSignature,
      remarks,
      includeProductImage: includeProductImage && !!effectiveImageUrl,
      productImageUrl: effectiveImageUrl,
    };

    StorageService.addCertificate(newCert);
    showToast(`Gem Certificate ${certNumber} generated!`, 'success');
    setIsCreateModalOpen(false);
    onRefresh();
    handleOpenPrintPreview(newCert);
  };

  // Delete Certificate
  const handleDeleteCert = (id: string, certNo: string) => {
    if (window.confirm(`Delete certificate ${certNo}?`)) {
      StorageService.deleteCertificate(id);
      showToast(`Certificate ${certNo} deleted.`, 'info');
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100 font-serif flex items-center gap-2">
            <FileText className="w-6 h-6 text-amber-400" />
            Jewelry & Gemstone Authenticity Certificates
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Issue official Sri Lankan gemological certificates with optional JPG template background overlay
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-xs shadow-md shadow-amber-900/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Issue New Certificate</span>
          </button>
        </div>
      </div>

      {/* Certificate Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {certificates.length === 0 ? (
          <div className="col-span-full bg-slate-900/80 border border-slate-800 rounded-xl p-12 text-center text-slate-500">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-40 text-amber-400" />
            <p className="text-sm font-semibold text-slate-300">No certificates generated yet</p>
            <p className="text-xs text-slate-500 mt-1">
              Select an invoice or item to issue a Ceylon gemstone authenticity certificate
            </p>
          </div>
        ) : (
          certificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-slate-900/90 border border-amber-500/30 hover:border-amber-500/60 rounded-xl p-5 shadow-lg flex flex-col justify-between space-y-4 group transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                    {cert.certificateNumber}
                  </span>
                  <span className="text-[11px] text-slate-400">{cert.date}</span>
                </div>

                <div className="flex gap-3">
                  {cert.includeProductImage !== false && cert.productImageUrl ? (
                    <img
                      src={cert.productImageUrl}
                      alt={cert.jewelryName}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-lg object-cover border border-amber-500/40 bg-slate-950 shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-amber-500/10 border border-amber-500/30 flex flex-col items-center justify-center shrink-0 text-amber-400">
                      <Gem className="w-6 h-6 mb-0.5" />
                      <span className="text-[9px] font-bold">GEM CERT</span>
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-slate-100 text-xs sm:text-sm line-clamp-2">
                      {cert.jewelryName}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Client: <strong className="text-slate-200">{cert.customerName}</strong>
                    </p>
                    <span className="inline-flex items-center gap-1 text-[10px] text-amber-300/80 mt-1 font-mono">
                      <Gem className="w-3 h-3 text-amber-400" />
                      {cert.includeProductImage !== false && cert.productImageUrl
                        ? 'Photo Attached'
                        : 'No Photo (Optional)'}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-lg text-xs space-y-1.5 border border-slate-800 font-mono">
                  <div className="flex justify-between text-slate-300">
                    <span>Variety:</span>
                    <span className="text-amber-300 font-semibold">{cert.gemstoneType}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Weight & Cut:</span>
                    <span>{cert.gemstoneCaratWeight} ct • {cert.gemstoneCut}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Gold Purity:</span>
                    <span>{cert.goldPurity} ({cert.grossWeightGrams}g)</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Origin:</span>
                    <span>{cert.gemstoneOrigin}</span>
                  </div>
                  {cert.includeGemologistSignature !== false && cert.gemologistSignatureName && (
                    <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800/80">
                      <span>Gemologist:</span>
                      <span className="text-amber-300 font-serif italic truncate max-w-[170px]">
                        {cert.gemologistSignatureName}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Actions */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">
                  Ref: {cert.invoiceNumber}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenPrintPreview(cert)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-xs transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print & Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCert(cert.id, cert.certificateNumber)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded transition-colors"
                    title="Delete certificate"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Certificate Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Issue Jewelry & Gemstone Certificate"
        subtitle="Produce verified gemological authenticity card for Ceylon sapphires, rubies & fine gold"
        maxWidth="4xl"
      >
        <form onSubmit={handleSaveCertificate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300 uppercase">
                  Link to Gemstone Sales Invoice *
                </label>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-950/70 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                  <Gem className="w-3 h-3" /> Gem Invoices Only
                </span>
              </div>
              {gemSalesInvoices.length === 0 ? (
                <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-lg text-amber-200 text-xs">
                  No gemstone sales invoices recorded yet. Certificates are restricted exclusively to gem sales.
                </div>
              ) : (
                <select
                  value={selectedInvoiceId}
                  onChange={(e) => handleSelectInvoice(e.target.value, 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono"
                >
                  {gemSalesInvoices.map((inv) => {
                    const gemItems = getGemItemsFromInvoice(inv, products);
                    const gemNames = gemItems.map((g) => g.name).slice(0, 2).join(', ');
                    return (
                      <option key={inv.id} value={inv.id}>
                        {inv.invoiceNumber} — {inv.customerName} ({inv.date}) [💎 {gemItems.length} Gem(s): {gemNames}]
                      </option>
                    );
                  })}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
              />
            </div>
          </div>

          {/* If the chosen invoice has multiple gem items, let user pick the exact gem item to certify */}
          {(() => {
            const currentInv = invoices.find((i) => i.id === selectedInvoiceId);
            const gemItems = currentInv ? getGemItemsFromInvoice(currentInv, products) : [];
            if (gemItems.length > 1) {
              return (
                <div className="p-2.5 bg-amber-950/30 border border-amber-500/30 rounded-lg">
                  <label className="block text-[11px] font-bold text-amber-300 uppercase mb-1">
                    Select Gemstone Item from this Invoice to Certificate:
                  </label>
                  <select
                    value={selectedItemIndex}
                    onChange={(e) => handleSelectInvoice(selectedInvoiceId, Number(e.target.value))}
                    className="w-full bg-slate-900 border border-amber-500/40 rounded px-2.5 py-1.5 text-xs text-slate-100 font-mono"
                  >
                    {gemItems.map((item, idx) => (
                      <option key={idx} value={idx}>
                        Item {idx + 1}: {item.name} ({item.itemCode}) — Rs. {StorageService.formatLKR(item.unitPriceLKR)}
                      </option>
                    ))}
                  </select>
                </div>
              );
            }
            return null;
          })()}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Jewelry Item Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ceylon Natural Royal Blue Sapphire Solitaire Ring"
                value={jewelryName}
                onChange={(e) => setJewelryName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Item Code / Barcode
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Code"
                  value={itemCode}
                  onChange={(e) => setItemCode(e.target.value)}
                  className="w-1/2 bg-slate-950 border border-slate-700 rounded px-2.5 py-2 text-xs text-slate-100 font-mono"
                />
                <input
                  type="text"
                  placeholder="Barcode"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="w-1/2 bg-slate-950 border border-slate-700 rounded px-2.5 py-2 text-xs text-slate-100 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Gemstone specs */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <Gem className="w-3.5 h-3.5" /> Gemological Identification
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Gemstone Variety</label>
                <input
                  type="text"
                  value={gemstoneType}
                  onChange={(e) => setGemstoneType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Carat Weight (ct)</label>
                <input
                  type="number"
                  step="0.01"
                  value={gemstoneCarats}
                  onChange={(e) => setGemstoneCarats(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Cut & Shape</label>
                <input
                  type="text"
                  value={gemstoneCut}
                  onChange={(e) => setGemstoneCut(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Color Grade</label>
                <input
                  type="text"
                  value={gemstoneColor}
                  onChange={(e) => setGemstoneColor(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Clarity</label>
                <input
                  type="text"
                  value={gemstoneClarity}
                  onChange={(e) => setGemstoneClarity(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Origin</label>
                <input
                  type="text"
                  value={gemstoneOrigin}
                  onChange={(e) => setGemstoneOrigin(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Gold Purity</label>
                <input
                  type="text"
                  value={goldPurity}
                  onChange={(e) => setGoldPurity(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Gross Wt (g)</label>
                <input
                  type="number"
                  step="0.01"
                  value={grossWeight}
                  onChange={(e) => setGrossWeight(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Lab / Verification Reference #
              </label>
              <input
                type="text"
                value={labNumber}
                onChange={(e) => setLabNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Appraised / Insured Value (LKR)
              </label>
              <input
                type="number"
                value={appraisedValue}
                onChange={(e) => setAppraisedValue(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono"
              />
            </div>
          </div>

          {/* Optional Gemstone Image Insert Section */}
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label
                htmlFor="include-image-toggle"
                className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2 cursor-pointer select-none"
              >
                <input
                  id="include-image-toggle"
                  type="checkbox"
                  checked={includeProductImage}
                  onChange={(e) => setIncludeProductImage(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 bg-slate-900 border-slate-700 focus:ring-amber-500 cursor-pointer"
                />
                <ImageIcon className="w-4 h-4 text-amber-400" />
                Gemstone Image Insertion (Optional)
              </label>
              <span className="text-[11px] text-slate-400">
                {includeProductImage
                  ? 'Photo will be inserted into certificate layout'
                  : 'Omitted — Full-width clean typographic certificate'}
              </span>
            </div>

            {includeProductImage && (
              <div className="pt-2 border-t border-slate-800/80 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-4 flex items-center gap-2.5">
                    <div className="w-16 h-16 rounded-lg bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                      {productImageUrl ? (
                        <img
                          src={productImageUrl}
                          alt="Gemstone preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-slate-600" />
                      )}
                    </div>
                    <div>
                      <label className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-600/30 hover:bg-amber-600/40 text-amber-300 border border-amber-500/40 rounded text-xs font-semibold cursor-pointer transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileUpload}
                          className="hidden"
                        />
                      </label>
                      {productImageUrl && (
                        <button
                          type="button"
                          onClick={() => setProductImageUrl('')}
                          className="text-[10px] text-rose-400 hover:text-rose-300 block mt-1"
                        >
                          Clear photo
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-8">
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Or Gemstone Image URL (Web link or pasted image)
                    </label>
                    <input
                      type="text"
                      placeholder="https://... or upload local photo on left"
                      value={productImageUrl}
                      onChange={(e) => setProductImageUrl(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Adding a gemstone photo is optional. If omitted, certificate generates with full-width specs.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Gemologist Technical Remarks
            </label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100"
            />
          </div>

          {/* Authorized Certified Gemologist Section (Optional) */}
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label
                htmlFor="include-gemologist-toggle"
                className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2 cursor-pointer select-none"
              >
                <input
                  id="include-gemologist-toggle"
                  type="checkbox"
                  checked={includeGemologistSignature}
                  onChange={(e) => setIncludeGemologistSignature(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 bg-slate-900 border-slate-700 focus:ring-amber-500 cursor-pointer"
                />
                <Award className="w-4 h-4 text-amber-400" />
                Authorized Certified Gemologist (Optional)
              </label>
              <span className="text-[11px] text-slate-400">
                {includeGemologistSignature
                  ? 'Details will be printed in line on certificate'
                  : 'Omitted — Blank space for manual signing'}
              </span>
            </div>

            {includeGemologistSignature && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-800/80">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Authorized Certified Gemologist Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. F.G.A. S. Wickramasinghe"
                    value={gemologistSignatureName}
                    onChange={(e) => setGemologistSignatureName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-serif"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Printed in elegant signature script above the signature line
                  </span>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Gemologist Title / Designation (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Fellow Gemmological Association (FGA)"
                    value={gemologistTitle}
                    onChange={(e) => setGemologistTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Printed in line directly below Authorized Certified Gemologist
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-xs shadow-md shadow-amber-900/30"
            >
              Generate Certificate
            </button>
          </div>
        </form>
      </Modal>

      {/* A4 High-Fidelity Printable Certificate Modal */}
      {printableCertificate && (
        <Modal
          isOpen={true}
          onClose={() => setPrintableCertificate(null)}
          title={`A4 Certificate Preview — ${printableCertificate.certificateNumber}`}
          subtitle="Ready for A4 paper print with optional JPG background template overlay"
          maxWidth="4xl"
        >
          <div className="space-y-4">
            {/* Top Toolbar & Quick Signature Customizer */}
            <div className="space-y-3 bg-slate-950 p-3.5 rounded-lg border border-slate-800 no-print">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-2 shadow transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    Print Certificate (A4)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomizeImageOpen(!isCustomizeImageOpen);
                      setIsCustomizeSignatureOpen(false);
                    }}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                      isCustomizeImageOpen
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border-slate-700'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                    {isCustomizeImageOpen
                      ? 'Hide Photo Settings'
                      : 'Insert / Edit Gem Photo (Optional)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomizeSignatureOpen(!isCustomizeSignatureOpen);
                      setIsCustomizeImageOpen(false);
                    }}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                      isCustomizeSignatureOpen
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border-slate-700'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    {isCustomizeSignatureOpen
                      ? 'Hide Signature Settings'
                      : 'Edit Gemologist & Title (In Line)'}
                  </button>
                </div>

                <div className="text-xs text-slate-400">
                  Overlay mode:{' '}
                  <span className="font-semibold text-amber-400">
                    {settings.isCertificateBgEnabled && settings.certificateBackgroundJpgUrl
                      ? 'JPG Template Overlay Active'
                      : 'Standard Luxury Royal Border'}
                  </span>
                </div>
              </div>

              {/* In-Line Customization Drawer (Details send to certificate in line) */}
              {isCustomizeSignatureOpen && (
                <div className="pt-3 border-t border-slate-800 space-y-3 bg-slate-900/80 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs font-semibold text-amber-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={previewIncludeGemologist}
                        onChange={(e) => setPreviewIncludeGemologist(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-600 bg-slate-950 border-slate-700 focus:ring-amber-500 cursor-pointer"
                      />
                      Include Authorized Certified Gemologist Block
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Changes update the certificate below in real time
                    </span>
                  </div>

                  {previewIncludeGemologist && (
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                      <div className="sm:col-span-5">
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Gemologist Name (Optional)
                        </label>
                        <input
                          type="text"
                          value={previewGemologistName}
                          onChange={(e) => setPreviewGemologistName(e.target.value)}
                          placeholder="e.g. F.G.A. S. Wickramasinghe"
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-serif"
                        />
                      </div>
                      <div className="sm:col-span-5">
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Gemologist Title / Designation (Optional)
                        </label>
                        <input
                          type="text"
                          value={previewGemologistTitle}
                          onChange={(e) => setPreviewGemologistTitle(e.target.value)}
                          placeholder="e.g. Fellow Gemmological Association (FGA)"
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <button
                          type="button"
                          onClick={handleSaveInlineSignature}
                          className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg flex items-center justify-center gap-1 shadow transition-colors"
                        >
                          <Save className="w-3.5 h-3.5" />
                          Save Details
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {/* In-Line Customization Drawer (Gemstone Photo) */}
              {isCustomizeImageOpen && (
                <div className="pt-3 border-t border-slate-800 space-y-3 bg-slate-900/80 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs font-semibold text-amber-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={previewIncludeProductImage}
                        onChange={(e) => setPreviewIncludeProductImage(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-600 bg-slate-950 border-slate-700 focus:ring-amber-500 cursor-pointer"
                      />
                      Include Gemstone Photo on Certificate (Optional)
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Toggle photo display or upload a new macro photo below
                    </span>
                  </div>

                  {previewIncludeProductImage && (
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center pt-1">
                      <div className="sm:col-span-4 flex items-center gap-2.5">
                        <div className="w-14 h-14 rounded-lg bg-slate-950 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                          {previewProductImageUrl ? (
                            <img
                              src={previewProductImageUrl}
                              alt="Gemstone preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-slate-600" />
                          )}
                        </div>
                        <div>
                          <label className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-600/30 hover:bg-amber-600/40 text-amber-300 border border-amber-500/40 rounded text-xs font-semibold cursor-pointer transition-colors">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePreviewImageFileUpload}
                              className="hidden"
                            />
                          </label>
                          {previewProductImageUrl && (
                            <button
                              type="button"
                              onClick={() => setPreviewProductImageUrl('')}
                              className="text-[10px] text-rose-400 hover:text-rose-300 block mt-1"
                            >
                              Clear photo
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="sm:col-span-5">
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Or Web Image URL
                        </label>
                        <input
                          type="text"
                          value={previewProductImageUrl}
                          onChange={(e) => setPreviewProductImageUrl(e.target.value)}
                          placeholder="https://... or upload local file on left"
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <button
                          type="button"
                          onClick={handleSaveInlineImage}
                          className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg flex items-center justify-center gap-1 shadow transition-colors"
                        >
                          <Save className="w-3.5 h-3.5" />
                          Save Photo
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Certificate Paper Container */}
            <div
              id="printable-a4-certificate"
              className="relative bg-amber-50/20 text-slate-900 rounded-lg p-10 shadow-2xl border-4 border-double border-amber-600/60 font-serif mx-auto max-w-2xl overflow-hidden"
              style={{
                backgroundColor: '#fffdfa',
                backgroundImage:
                  settings.isCertificateBgEnabled && settings.certificateBackgroundJpgUrl
                    ? `url("${settings.certificateBackgroundJpgUrl}")`
                    : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* Luxury Certificate Watermark / Header */}
              <div className="text-center border-b-2 border-amber-600 pb-5 mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 mb-2 shadow">
                  <Gem className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-wider uppercase">
                  {settings.companyName}
                </h1>
                <p className="text-xs text-amber-900 font-semibold tracking-widest uppercase mt-0.5">
                  Certificate of Gemological Authenticity
                </p>
                <p className="text-[11px] text-slate-600 font-sans mt-1">
                  National Gem & Jewellery Authority Regulated Showroom • Colombo & Ratnapura, Sri Lanka
                </p>
                <div className="mt-3 inline-block px-4 py-1 bg-amber-100 text-amber-950 border border-amber-400 rounded text-xs font-mono font-bold tracking-widest">
                  NO: {printableCertificate.certificateNumber}
                </div>
              </div>

              {/* Photo & Item Description Layout (Adaptive for optional photo) */}
              {previewIncludeProductImage && previewProductImageUrl ? (
                <div className="grid grid-cols-3 gap-6 mb-6 font-sans">
                  <div className="text-center">
                    <img
                      src={previewProductImageUrl}
                      alt="Certified Gemstone"
                      referrerPolicy="no-referrer"
                      className="w-full h-36 object-cover rounded-lg border-2 border-amber-600 shadow-md bg-white p-1"
                    />
                    <div className="font-mono text-[10px] text-slate-600 mt-2">
                      Barcode: {printableCertificate.barcode}
                    </div>
                  </div>

                  <div className="col-span-2 space-y-2 text-xs">
                    <div className="border-b border-amber-200 pb-1">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Item Description:</span>
                      <div className="text-sm font-bold text-slate-950 font-serif">
                        {printableCertificate.jewelryName}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                      <div>
                        <span className="text-slate-500">Issued To:</span>{' '}
                        <strong>{printableCertificate.customerName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500">Date:</span>{' '}
                        <strong>{printableCertificate.date}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500">Invoice Ref:</span>{' '}
                        <span className="font-mono">{printableCertificate.invoiceNumber}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Lab Ref:</span>{' '}
                        <span className="font-mono">{printableCertificate.laboratoryVerificationNo}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-6 font-sans space-y-3 bg-amber-50/60 p-4 rounded-lg border border-amber-200/80">
                  <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Item Description:</span>
                      <div className="text-base font-bold text-slate-950 font-serif">
                        {printableCertificate.jewelryName}
                      </div>
                    </div>
                    <div className="font-mono text-[10px] text-slate-600 bg-white/80 px-2 py-1 rounded border border-amber-300">
                      Barcode: {printableCertificate.barcode}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] pt-1">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold">Issued To</span>
                      <strong className="text-slate-900">{printableCertificate.customerName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold">Date</span>
                      <strong className="text-slate-900">{printableCertificate.date}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold">Invoice Ref</span>
                      <span className="font-mono font-bold text-slate-900">{printableCertificate.invoiceNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold">Lab Verification</span>
                      <span className="font-mono font-bold text-slate-900">{printableCertificate.laboratoryVerificationNo}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Detailed Physical Specifications Table */}
              <div className="border border-amber-300 rounded-lg overflow-hidden mb-6 font-sans text-xs bg-amber-50/40">
                <table className="w-full text-left">
                  <tbody className="divide-y divide-amber-200">
                    <tr>
                      <td className="py-2 px-3 font-semibold text-slate-700 bg-amber-100/50 w-1/3">
                        Gemstone Species / Variety
                      </td>
                      <td className="py-2 px-3 font-bold text-slate-900">
                        {printableCertificate.gemstoneType}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-slate-700 bg-amber-100/50">
                        Carat Weight
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-slate-900">
                        {printableCertificate.gemstoneCaratWeight} ct
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-slate-700 bg-amber-100/50">
                        Cut & Shape
                      </td>
                      <td className="py-2 px-3 text-slate-900">
                        {printableCertificate.gemstoneCut}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-slate-700 bg-amber-100/50">
                        Color & Clarity
                      </td>
                      <td className="py-2 px-3 text-slate-900">
                        {printableCertificate.gemstoneColor} ({printableCertificate.gemstoneClarity})
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-slate-700 bg-amber-100/50">
                        Precious Metal & Purity
                      </td>
                      <td className="py-2 px-3 text-slate-900">
                        {printableCertificate.goldPurity} • Gross: {printableCertificate.grossWeightGrams}g
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-slate-700 bg-amber-100/50">
                        Geographical Origin
                      </td>
                      <td className="py-2 px-3 font-bold text-slate-900">
                        {printableCertificate.gemstoneOrigin} (Ceylon)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Gemologist Remarks & Signatures */}
              <div className="font-sans text-[11px] text-slate-700 mb-6 bg-slate-50/90 p-3.5 rounded-lg border border-slate-200 leading-relaxed shadow-sm">
                <strong className="text-slate-900 font-bold">GEMOLOGICAL COMMENTS:</strong>{' '}
                {printableCertificate.remarks ||
                  'Tested via Raman spectrometer and optical microscopy. No indications of thermal or chemical enhancement (Natural Unheated).'}
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-4 border-t-2 border-amber-600 font-sans text-xs">
                {/* Left: Official Showroom Seal */}
                <div className="text-center flex flex-col justify-end">
                  <div className="h-10 flex items-center justify-center">
                    {/* Space for Showroom Seal Stamp */}
                  </div>
                  <div className="border-t border-slate-500 pt-1 font-bold text-slate-900 tracking-wide text-xs">
                    Official Showroom Seal
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium">
                    {settings.companyName || 'WCS Gems & Fine Jewelry'}
                  </div>
                </div>

                {/* Right: Authorized Certified Gemologist */}
                <div className="text-center flex flex-col justify-end">
                  {/* Gemologist Name in line above the signature line */}
                  <div className="h-10 flex items-end justify-center pb-0.5">
                    {previewIncludeGemologist && previewGemologistName ? (
                      <span className="font-serif italic font-bold text-amber-950 text-base tracking-wide">
                        {previewGemologistName}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic font-sans">
                        {/* Space for physical signature */}
                      </span>
                    )}
                  </div>
                  {/* Signature line */}
                  <div className="border-t border-slate-500 pt-1 font-bold text-slate-900 tracking-wide text-xs">
                    Authorized Certified Gemologist
                  </div>
                  {/* Gemologist Title in line directly below Authorized Certified Gemologist */}
                  {previewIncludeGemologist && previewGemologistTitle && (
                    <div className="text-[11px] text-slate-600 font-medium">
                      {previewGemologistTitle}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
