import React, { useState } from 'react';
import {
  Share2,
  MessageSquare,
  Facebook,
  Send,
  Sparkles,
  Copy,
  Check,
  Users,
  Tag,
  Gem,
  Megaphone,
} from 'lucide-react';
import { Customer, Product, AppSettings } from '../../types';
import { useToast } from '../common/Toast';
import { safeOpenExternal, formatWhatsAppNumber } from '../../utils/navigation';

interface PromotionsViewProps {
  customers: Customer[];
  products: Product[];
  settings: AppSettings;
}

export const PromotionsView: React.FC<PromotionsViewProps> = ({
  customers,
  products,
  settings,
}) => {
  const { showToast } = useToast();

  const [campaignTitle, setCampaignTitle] = useState('Exclusive Ceylon Royal Blue Sapphire Showcase');
  const [discountCode, setDiscountCode] = useState('CEYLON2026');
  const [discountPercent, setDiscountPercent] = useState('15% OFF');
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [selectedAudience, setSelectedAudience] = useState<'all' | 'vip'>('vip');
  const [customNotes, setCustomNotes] = useState(
    'Visit our showroom in Colombo or order with insured islandwide & worldwide courier delivery. Natural unheated Ceylon sapphires with authenticity certificates.'
  );

  const [copied, setCopied] = useState(false);

  const featuredProduct = products.find((p) => p.id === selectedProductId) || products[0];

  const targetCustomers =
    selectedAudience === 'vip' ? customers.filter((c) => c.isVip) : customers;

  // Generated WhatsApp Copy
  const generatedWhatsAppText = `💎 *${settings.companyName.toUpperCase()} — SPECIAL INVITATION* 💎\n\n✨ *${campaignTitle}*\n\nDear Valued Client,\nWe are delighted to present our newly curated collection of natural unheated Ceylon gemstones and bespoke fine jewelry pieces.\n\n🌟 *Featured Masterpiece:*\n• *${featuredProduct ? featuredProduct.name : 'Ceylon Fine Jewelry'}*\n• Code: ${featuredProduct ? featuredProduct.itemCode : 'JWL'}\n• Metal: ${featuredProduct ? featuredProduct.goldPurity : '18K Gold'}\n• Gemstone: ${featuredProduct ? featuredProduct.gemstoneType : 'Natural Ceylon Sapphire'}\n• Special Showcase Price: *Rs. ${featuredProduct ? featuredProduct.sellingPriceLKR.toLocaleString() : 'Inquire'}*\n\n🎁 *Exclusive Privilege Offer:* Enjoy *${discountPercent}* on bespoke orders using code *${discountCode}*.\n\n${customNotes}\n\n📍 *Showroom:* ${settings.companyAddress}\n📞 *Hotline / Inquiries:* ${settings.telephone}\n🌐 *Inquire via WhatsApp:* Reply directly to this message to reserve your private appointment.`;

  // Generated Facebook / Instagram Caption
  const generatedSocialCaption = `✨ Sparkle with Authenticity — Ceylon's Finest Gems ✨\n\n${campaignTitle}\n\nExperience the timeless elegance of unheated Ceylon Sapphires, handcrafted in ${featuredProduct?.goldPurity || '18K gold'} by Sri Lanka's master goldsmiths. Each piece is individually tested and issued an official certificate of authenticity.\n\n💎 Featured: ${featuredProduct?.name || 'Ceylon Gemstone Ring'}\n🏷️ Use Code: ${discountCode} for an exclusive ${discountPercent}\n\n📍 Showroom: ${settings.companyAddress}\n📞 Call/WhatsApp: ${settings.telephone}\n\n#CeylonSapphire #SriLankanGems #FineJewelry #HandmadeJewelry #ColomboJewelry #AuthenticGems #${settings.companyName.replace(/\s+/g, '')}`;

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast(`${label} copied to clipboard!`, 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToClient = (c: Customer) => {
    const fullPhone = formatWhatsAppNumber(c.whatsapp || c.phone || '');
    const url = `https://wa.me/${fullPhone}?text=${encodeURIComponent(generatedWhatsAppText)}`;
    safeOpenExternal(url);
    showToast(`Opening WhatsApp for ${c.name}...`, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-100 font-serif flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-amber-400" />
          WhatsApp & Social Promotion Studio
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Craft high-converting Sri Lankan gemstone promotional campaigns for WhatsApp broadcast and Facebook / Instagram ads
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Campaign Builder Controls (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Campaign Configuration
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Campaign Headline / Title
              </label>
              <input
                type="text"
                value={campaignTitle}
                onChange={(e) => setCampaignTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Promo / Discount Code
                </label>
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Offer / Discount Value
                </label>
                <input
                  type="text"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Featured Catalog Piece
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — Rs. {p.sellingPriceLKR.toLocaleString()} ({p.itemCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Target Audience
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedAudience('vip')}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all text-center ${
                    selectedAudience === 'vip'
                      ? 'bg-amber-600 text-slate-950 border-amber-500 font-bold'
                      : 'bg-slate-950 text-slate-400 border-slate-700'
                  }`}
                >
                  VIP Clients Only ({customers.filter((c) => c.isVip).length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAudience('all')}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all text-center ${
                    selectedAudience === 'all'
                      ? 'bg-amber-600 text-slate-950 border-amber-500 font-bold'
                      : 'bg-slate-950 text-slate-400 border-slate-700'
                  }`}
                >
                  All Registered ({customers.length})
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Custom Policy / Message Body
              </label>
              <textarea
                rows={3}
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Live Preview & Direct Dispatch (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* WhatsApp Preview Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4" />
                WhatsApp Formatted Preview
              </span>
              <button
                onClick={() => handleCopyText(generatedWhatsAppText, 'WhatsApp message')}
                className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-semibold"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                Copy Text
              </button>
            </div>

            <div className="p-3.5 bg-emerald-950/20 border border-emerald-800/50 rounded-xl text-xs text-slate-200 font-mono whitespace-pre-line leading-relaxed max-h-60 overflow-y-auto">
              {generatedWhatsAppText}
            </div>
          </div>

          {/* Social Ad Copy Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <Facebook className="w-4 h-4" />
                Facebook & Instagram Ad Copy
              </span>
              <button
                onClick={() => handleCopyText(generatedSocialCaption, 'Facebook ad caption')}
                className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-semibold"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy Caption
              </button>
            </div>

            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 whitespace-pre-line leading-relaxed max-h-40 overflow-y-auto">
              {generatedSocialCaption}
            </div>
          </div>

          {/* Audience Direct Blast Dispatch Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-400" />
                Audience Direct WhatsApp Sender ({targetCustomers.length})
              </span>
            </div>

            <div className="max-h-48 overflow-y-auto divide-y divide-slate-800 text-xs">
              {targetCustomers.map((c) => (
                <div key={c.id} className="py-2 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-200">{c.name}</span>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {c.phone} {c.isVip && '• [VIP]'}
                    </div>
                  </div>
                  <button
                    onClick={() => handleSendToClient(c)}
                    className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold"
                  >
                    <Send className="w-3 h-3" />
                    Send
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
