import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Gift,
  Share2,
  Image as ImageIcon,
  Video,
  Download,
  Copy,
  Check,
  Phone,
  MessageSquare,
  Users,
  Crown,
  ChevronDown,
  Upload,
  X,
  Play,
  Pause,
  Send,
  FastForward,
  RotateCcw,
  Square,
  Clock,
} from 'lucide-react';
import { Customer, AppSettings, GreetingOccasion } from '../../types';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';
import { safeOpenExternal, formatWhatsAppNumber } from '../../utils/navigation';

export interface CustomerGreetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  targetCustomer?: Customer | null;
  settings: AppSettings;
}

interface PresetOption {
  id: GreetingOccasion;
  label: string;
  badge: string;
  defaultTitle: string;
  sinhala: string;
  english: string;
  tamil: string;
  discountOffer: string;
  cardUrl: string;
  videoUrl?: string;
  videoName?: string;
}

const GREETING_PRESETS: PresetOption[] = [
  {
    id: 'Sinhala & Tamil New Year',
    label: 'Sinhala & Tamil New Year',
    badge: '🌸 Awurudu Festival',
    defaultTitle: 'සුබ අලුත් අවුරුද්දක් වේවා! / Subha Aluth Avuruddak Wewa!',
    sinhala:
      'ලබන්නාවූ සිංහල හා දෙමළ අලුත් අවුරුද්ද ඔබ සැමට සාමය, සතුට, සෞභාග්‍යය හා නිරෝගීභාවය පිරි සුබම සුබ අලුත් අවුරුද්දක් වේවායි හදපිරි සෙනෙහසින් ප්‍රාර්ථනා කරමු!\n\nඅවුරුදු සමයේ අපගේ සියලුම ස්වර්ණාභරණ සහ මැණික් මිලදී ගැනීම් සඳහා විශේෂ වට්ටම් ලබාගන්න.',
    english:
      'Wishing you and your family a joyous, peaceful, and prosperous Sinhala & Tamil New Year! May the radiant dawn of the new year bring good health, abundant fortune, and golden blessings.',
    tamil:
      'இனிய சிங்கள மற்றும் தமிழ் புத்தாண்டு நல்வாழ்த்துக்கள்! உங்கள் வாழ்வில் அமைதியும், மகிழ்ச்சியும், ஆரோக்கியமும், செல்வமும் பொங்க வாழ்த்துகிறோம்.',
    discountOffer: 'AWURUDU2026 (12% OFF)',
    cardUrl:
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
    videoUrl:
      'https://assets.mixkit.co/videos/preview/mixkit-bright-light-leaks-in-golden-particles-32868-large.mp4',
    videoName: 'Golden-Particles-Awurudu.mp4',
  },
  {
    id: 'Christmas',
    label: 'Christmas & Holiday Season (Crimax)',
    badge: '🎄 Christmas & Festive',
    defaultTitle: 'Merry Christmas & A Blessed Festive Season!',
    sinhala:
      'සාමයේ සහ ප්‍රීතියේ උතුම් නත්තලක් වේවා! සාමයේ කුමාරයාණන්ගේ උපත සමරන මේ උතුම් නත්තල් සමය ඔබගේ නිවසට ප්‍රීතිය සහ සතුට රැගෙන ඒමට ආශිර්වාද පතමු.',
    english:
      'Merry Christmas! May the timeless warmth and sparkling wonder of this holy season fill your home with radiant joy, peace, and love. Thank you for being our valued customer.',
    tamil:
      'இனிய நத்தார் தின நல்வாழ்த்துக்கள்! உங்கள் இல்லங்களில் அமைதியும் மகிழ்ச்சியும் நிலவட்டும்.',
    discountOffer: 'CRIMAX2026 (15% OFF)',
    cardUrl:
      'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800&auto=format&fit=crop&q=80',
    videoUrl:
      'https://assets.mixkit.co/videos/preview/mixkit-festive-sparks-of-holiday-lights-42994-large.mp4',
    videoName: 'Festive-Sparks-Crimax.mp4',
  },
  {
    id: 'New Year',
    label: 'Happy New Year (January 1)',
    badge: '🎆 Happy New Year',
    defaultTitle: 'Happy New Year! A Brilliant Dawn of Success & Prosperity',
    sinhala:
      'උදාවූ නව වසර ඔබගේ සියලු සිතුම් පැතුම් ඉටුවන, නිරෝගී, වාසනාවන්ත සුබම සුබ නව වසරක් වේවායි ප්‍රාර්ථනා කරමු!',
    english:
      'Happy New Year! As we step into a brilliant new dawn, we extend our heartfelt gratitude for being a valued part of our journey. May the year shimmer with triumph and happiness.',
    tamil:
      'இனிய புத்தாண்டு நல்வாழ்த்துக்கள்! இப்புதிய ஆண்டு உங்கள் வாழ்வில் வெற்றிகளையும் மகிழ்ச்சியையும் கொண்டுவரட்டும்.',
    discountOffer: 'NEWYEAR2027 (10% OFF)',
    cardUrl:
      'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=800&auto=format&fit=crop&q=80',
    videoUrl:
      'https://assets.mixkit.co/videos/preview/mixkit-golden-fireworks-bursting-in-the-night-sky-40450-large.mp4',
    videoName: 'Golden-Fireworks-NewYear.mp4',
  },
  {
    id: 'Vesak Festival',
    label: 'Vesak Full Moon Poya',
    badge: '☸️ Vesak Poya',
    defaultTitle: 'පින්බර වෙසක් මංගල්‍යයක් වේවා! Blessed Vesak Poya!',
    sinhala:
      'සම්බුදු තෙමඟුල සිහිපත් කෙරෙන උතුම් වෙසක් පුන් පොහෝ දිනයේ ඔබ සැමට නිදුක් නිරෝගී සුවය හා උතුම් ධර්ම ශාන්තිය සැලසේවා!',
    english:
      'May the profound teachings of the supreme Buddha guide your path towards peace, compassion, and enlightenment. Wishing you and your loved ones a serene and blessed Vesak.',
    tamil:
      'புனித வெசாக் தின நல்வாழ்த்துக்கள்! உங்கள் வாழ்வில் அமைதியும் சாந்தியும் பெருகட்டும்.',
    discountOffer: 'VESAKPEACE',
    cardUrl:
      'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'Deepavali',
    label: 'Deepavali Festival of Lights',
    badge: '🪔 Deepavali Lights',
    defaultTitle: 'Happy Deepavali! May the Light of Joy Radiate Forever',
    sinhala:
      'අඳුර දුරලා ආලෝකය උදාකරන ප්‍රීතිමත් දීපාවලී උත්සවයක් වේවායි ප්‍රාර්ථනා කරමු!',
    english:
      'Wishing you a luminous and blessed Deepavali! May the festival of lights illuminate your life with infinite joy, prosperity, and sparkling good health.',
    tamil:
      'இனிய தீபாவளி நல்வாழ்த்துக்கள்! ஒளிமயமான தீபங்கள் உங்கள் வாழ்வில் மகிழ்ச்சியையும் செழிப்பையும் கொண்டு சேர்க்கட்டும்.',
    discountOffer: 'DEEPAVALI2026',
    cardUrl:
      'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'Custom Greeting',
    label: 'Customer Appreciation & Anniversary',
    badge: '✨ Valued Client Wish',
    defaultTitle: 'Warm Greetings & Gratitude from WCS Gems & Jewelry',
    sinhala:
      'ඔබගේ විශේෂ අවස්ථාව වඩාත් අලංකාරවත් කර ගැනීමට අප සමඟ අත්වැල් බැඳගත් ඔබට අපගේ හෘදයාංගම ස්තූතිය!',
    english:
      'Dear Valued Client, wishing you life’s finest moments filled with sparkle, joy, and timeless memories. Thank you for your continued trust and patronage.',
    tamil: 'எங்கள் மனமார்ந்த நல்வாழ்த்துக்கள் மற்றும் நன்றிகள்!',
    discountOffer: 'VIPPRIVILEGE',
    cardUrl:
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80',
  },
];

export const CustomerGreetingModal: React.FC<CustomerGreetingModalProps> = ({
  isOpen,
  onClose,
  customers,
  targetCustomer,
  settings,
}) => {
  const { showToast } = useToast();

  // Target audience selection: 'all' | 'vip' | 'single'
  const [targetAudience, setTargetAudience] = useState<'all' | 'vip' | 'single'>(
    targetCustomer ? 'single' : 'all'
  );
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    targetCustomer ? targetCustomer.id : customers[0]?.id || ''
  );

  // Occasion & Languages
  const [selectedOccasion, setSelectedOccasion] = useState<GreetingOccasion>(
    'Sinhala & Tamil New Year'
  );
  const [activeLang, setActiveLang] = useState<'sinhala' | 'english' | 'tamil'>('sinhala');
  const [title, setTitle] = useState(GREETING_PRESETS[0].defaultTitle);
  const [messageSinhala, setMessageSinhala] = useState(GREETING_PRESETS[0].sinhala);
  const [messageEnglish, setMessageEnglish] = useState(GREETING_PRESETS[0].english);
  const [messageTamil, setMessageTamil] = useState(GREETING_PRESETS[0].tamil);
  const [discountOffer, setDiscountOffer] = useState(GREETING_PRESETS[0].discountOffer);

  // Media attachment: 'image' | 'video' | 'none'
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [cardImageUrl, setCardImageUrl] = useState(GREETING_PRESETS[0].cardUrl);
  const [videoClipUrl, setVideoClipUrl] = useState(GREETING_PRESETS[0].videoUrl || '');
  const [videoClipName, setVideoClipName] = useState(GREETING_PRESETS[0].videoName || '');
  const [videoClipSizeBytes, setVideoClipSizeBytes] = useState<number>(1450000);

  // Track progress when sending to multiple clients
  const [broadcastSentStatus, setBroadcastSentStatus] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  // Auto Broadcast state for "All Customer Share in WhatsApp"
  const [isAutoBroadcasting, setIsAutoBroadcasting] = useState(false);
  const [isAutoPaused, setIsAutoPaused] = useState(false);
  const [nextQueueCustId, setNextQueueCustId] = useState<string | null>(null);
  const [autoCountdown, setAutoCountdown] = useState<number>(3);

  // Update defaults when target customer changes
  useEffect(() => {
    if (targetCustomer) {
      setTargetAudience('single');
      setSelectedCustomerId(targetCustomer.id);
    }
  }, [targetCustomer]);

  // Handle preset change
  const handleSelectPreset = (preset: PresetOption) => {
    setSelectedOccasion(preset.id);
    setTitle(preset.defaultTitle);
    setMessageSinhala(preset.sinhala);
    setMessageEnglish(preset.english);
    setMessageTamil(preset.tamil);
    setDiscountOffer(preset.discountOffer);
    setCardImageUrl(preset.cardUrl);
    if (preset.videoUrl) {
      setVideoClipUrl(preset.videoUrl);
      setVideoClipName(preset.videoName || `${preset.id}.mp4`);
      setVideoClipSizeBytes(1450000);
    }
  };

  // Image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid JPG or PNG image file.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCardImageUrl(ev.target?.result as string);
      setMediaType('image');
      showToast(`Greeting card image "${file.name}" loaded!`, 'success');
    };
    reader.readAsDataURL(file);
  };

  // Video upload
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      showToast('Please select a valid MP4 or WebM video file.', 'error');
      return;
    }
    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > 16) {
      showToast('Video clip size exceeds 16MB limit for WhatsApp sharing.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setVideoClipUrl(ev.target?.result as string);
      setVideoClipName(file.name);
      setVideoClipSizeBytes(file.size);
      setMediaType('video');
      showToast(`Greeting video "${file.name}" (${sizeInMB.toFixed(1)} MB) loaded!`, 'success');
    };
    reader.readAsDataURL(file);
  };

  // Compute recipient list
  const recipientList: Customer[] =
    targetAudience === 'all'
      ? customers
      : targetAudience === 'vip'
      ? customers.filter((c) => c.isVip)
      : customers.filter((c) => c.id === selectedCustomerId);

  // Generate personalized WhatsApp greeting message
  const generateMessageForCustomer = (cust?: Customer) => {
    const custName = cust ? cust.name : 'Valued Patron';
    const mainWish =
      activeLang === 'sinhala'
        ? messageSinhala
        : activeLang === 'english'
        ? messageEnglish
        : messageTamil;

    let text = `✨ *${settings.companyName.toUpperCase()}* ✨\n`;
    text += `_${title}_\n\n`;
    text += `Dear *${custName}*,\n\n`;
    text += `${mainWish}\n\n`;

    if (discountOffer.trim()) {
      text += `🎁 *Special Festival Privilege:* Use code *${discountOffer}* on your next visit or bespoke order!\n\n`;
    }

    if (mediaType === 'image' && cardImageUrl) {
      text += `🖼️ _Festive Greeting Card (JPG/PNG) Attached_\n`;
    } else if (mediaType === 'video' && videoClipUrl) {
      text += `🎬 _Festive Video Clip Attached:_ ${videoClipName || 'Festival Greetings'} (${(
        videoClipSizeBytes /
        (1024 * 1024)
      ).toFixed(1)} MB)\n`;
    }

    text += `\n📍 *Showroom:* ${settings.companyAddress}\n`;
    text += `📞 *Hotline / WhatsApp:* ${settings.telephone}\n`;
    text += `💎 _WCS Gems & Jewelry - Authentic Ceylon Gemstones_`;

    return text;
  };

  // Send single WhatsApp
  const handleSendWhatsApp = (cust: Customer) => {
    const fullPhone = formatWhatsAppNumber(cust.whatsapp || cust.phone || '');
    const message = generateMessageForCustomer(cust);
    const url = `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
    safeOpenExternal(url);

    setBroadcastSentStatus((prev) => ({ ...prev, [cust.id]: true }));
  };

  // Auto Broadcast runner for sequential WhatsApp dispatch
  useEffect(() => {
    if (!isAutoBroadcasting || isAutoPaused || !nextQueueCustId || !isOpen) return;

    const timer = setInterval(() => {
      setAutoCountdown((prev) => {
        if (prev > 1) {
          return prev - 1;
        }

        const currentTarget = recipientList.find((c) => c.id === nextQueueCustId);
        if (currentTarget) {
          handleSendWhatsApp(currentTarget);
        }

        const currentIndex = recipientList.findIndex((c) => c.id === nextQueueCustId);
        const remaining = recipientList
          .slice(currentIndex + 1)
          .filter((c) => !broadcastSentStatus[c.id] && c.id !== nextQueueCustId);

        if (remaining.length > 0) {
          setNextQueueCustId(remaining[0].id);
          return 3;
        } else {
          setIsAutoBroadcasting(false);
          setNextQueueCustId(null);
          showToast('🎉 All customers have been shared via WhatsApp!', 'success');
          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAutoBroadcasting, isAutoPaused, nextQueueCustId, recipientList, broadcastSentStatus, isOpen]);

  // Start "All Customer Share in WhatsApp"
  const handleStartAllShare = () => {
    const unsent = recipientList.filter((c) => !broadcastSentStatus[c.id]);
    const toSend = unsent.length > 0 ? unsent : recipientList;

    if (toSend.length === 0) {
      showToast('No customers found in recipient list.', 'info');
      return;
    }

    if (unsent.length === 0) {
      setBroadcastSentStatus({});
    }

    const firstCust = toSend[0];
    handleSendWhatsApp(firstCust);

    if (toSend.length > 1) {
      setIsAutoBroadcasting(true);
      setIsAutoPaused(false);
      setNextQueueCustId(toSend[1].id);
      setAutoCountdown(3);
      showToast(
        `WhatsApp opened for ${firstCust.name}. Auto-sharing remaining ${toSend.length - 1} clients with 3s pacing...`,
        'success'
      );
    } else {
      setIsAutoBroadcasting(false);
      setNextQueueCustId(null);
      setAutoCountdown(0);
      showToast(`WhatsApp opened for ${firstCust.name}!`, 'success');
    }
  };

  // Skip wait and send the currently queued customer immediately
  const handleSendNextNow = () => {
    if (!nextQueueCustId) return;
    const currentTarget = recipientList.find((c) => c.id === nextQueueCustId);
    if (currentTarget) {
      handleSendWhatsApp(currentTarget);
    }
    const currentIndex = recipientList.findIndex((c) => c.id === nextQueueCustId);
    const remaining = recipientList
      .slice(currentIndex + 1)
      .filter((c) => !broadcastSentStatus[c.id] && c.id !== nextQueueCustId);

    if (remaining.length > 0) {
      setNextQueueCustId(remaining[0].id);
      setAutoCountdown(3);
    } else {
      setIsAutoBroadcasting(false);
      setNextQueueCustId(null);
      setAutoCountdown(0);
      showToast('🎉 All customers have been shared via WhatsApp!', 'success');
    }
  };

  const handlePauseResume = () => {
    setIsAutoPaused((prev) => !prev);
  };

  const handleStopAutoBroadcast = () => {
    setIsAutoBroadcasting(false);
    setIsAutoPaused(false);
    setNextQueueCustId(null);
    setAutoCountdown(0);
  };

  const handleResetBroadcast = () => {
    handleStopAutoBroadcast();
    setBroadcastSentStatus({});
    showToast('Sent status reset. You can share with all customers again.', 'info');
  };

  // Copy full message
  const handleCopyMessage = () => {
    const sampleText = generateMessageForCustomer(recipientList[0] || customers[0]);
    navigator.clipboard.writeText(sampleText);
    setCopied(true);
    showToast('Greeting text copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  // Download Card image
  const handleDownloadCard = () => {
    const link = document.createElement('a');
    link.href = cardImageUrl;
    link.download = `WCS-Festive-Greeting-${selectedOccasion.replace(/\s+/g, '-')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Greeting Card image downloaded. You can attach it in WhatsApp.', 'success');
  };

  // Download Video clip
  const handleDownloadVideo = () => {
    if (!videoClipUrl) return;
    const link = document.createElement('a');
    link.href = videoClipUrl;
    link.download = videoClipName || `WCS-Festive-Video-${selectedOccasion.replace(/\s+/g, '-')}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Greeting Video downloaded. You can attach it in WhatsApp.', 'success');
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Customer Festive Greetings & Media (WhatsApp)"
      subtitle="Send optional heartfelt greeting cards (JPG/PNG) or video clips to all clients or VIPs via WhatsApp"
      maxWidth="4xl"
    >
      <div className="space-y-5 text-slate-100 max-h-[80vh] overflow-y-auto pr-1">
        {/* Occasion Selection Carousel */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-amber-400 mb-2 font-mono">
            1. Select Festive Occasion:
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
            {GREETING_PRESETS.map((preset) => {
              const isSelected = selectedOccasion === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                      : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <span>{preset.badge}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Target Audience Bar */}
        <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              2. Target Audience:
            </span>
            <span className="text-[11px] text-slate-400">
              Selected recipients: <strong>{recipientList.length} customer(s)</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setTargetAudience('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                targetAudience === 'all'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Customers ({customers.length})
            </button>
            <button
              type="button"
              onClick={() => setTargetAudience('vip')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1 ${
                targetAudience === 'vip'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Crown className="w-3 h-3" />
              VIP Only ({customers.filter((c) => c.isVip).length})
            </button>
            <button
              type="button"
              onClick={() => setTargetAudience('single')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                targetAudience === 'single'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Single Client
            </button>
          </div>
        </div>

        {/* If Single Customer, choose customer */}
        {targetAudience === 'single' && (
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-3">
            <label className="text-xs font-medium text-slate-300 shrink-0">Client:</label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:border-amber-400"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone || c.whatsapp || 'No Phone'}) {c.isVip ? '⭐ VIP' : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Main Content Grid: Message Builder & Media Card/Video */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Greeting Text & Multi-Language (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Title & Language Tabs */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Greeting Headline
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Greeting Headline..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-amber-300 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Language Tabs */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase text-slate-300">
                    Wishes Message:
                  </label>
                  <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setActiveLang('sinhala')}
                      className={`px-2.5 py-1 rounded text-xs font-semibold ${
                        activeLang === 'sinhala'
                          ? 'bg-amber-400 text-slate-950'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      සිංහල (Sinhala)
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveLang('english')}
                      className={`px-2.5 py-1 rounded text-xs font-semibold ${
                        activeLang === 'english'
                          ? 'bg-amber-400 text-slate-950'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      English
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveLang('tamil')}
                      className={`px-2.5 py-1 rounded text-xs font-semibold ${
                        activeLang === 'tamil'
                          ? 'bg-amber-400 text-slate-950'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      தமிழ் (Tamil)
                    </button>
                  </div>
                </div>

                {activeLang === 'sinhala' && (
                  <textarea
                    rows={4}
                    value={messageSinhala}
                    onChange={(e) => setMessageSinhala(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-100 focus:outline-none focus:border-amber-400 leading-relaxed font-sans"
                    placeholder="සිංහල සුබපැතුම් පණිවිඩය..."
                  />
                )}
                {activeLang === 'english' && (
                  <textarea
                    rows={4}
                    value={messageEnglish}
                    onChange={(e) => setMessageEnglish(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-100 focus:outline-none focus:border-amber-400 leading-relaxed font-sans"
                    placeholder="English greeting message..."
                  />
                )}
                {activeLang === 'tamil' && (
                  <textarea
                    rows={4}
                    value={messageTamil}
                    onChange={(e) => setMessageTamil(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-100 focus:outline-none focus:border-amber-400 leading-relaxed font-sans"
                    placeholder="தமிழ் வாழ்த்துச் செய்தி..."
                  />
                )}
              </div>

              {/* Discount Offer */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                  Festive Privilege Code / Discount Offer
                </label>
                <div className="relative">
                  <Gift className="w-3.5 h-3.5 text-amber-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={discountOffer}
                    onChange={(e) => setDiscountOffer(e.target.value)}
                    placeholder="e.g. AWURUDU2026 (12% OFF)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Media Attachment (JPG/PNG Card or Video Clip) (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-300 flex items-center gap-1.5 font-mono">
                  {mediaType === 'image' ? (
                    <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <Video className="w-3.5 h-3.5 text-purple-400" />
                  )}
                  3. Media Import (JPG / Video)
                </span>

                {/* Switch Media Type Toggle */}
                <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setMediaType('image')}
                    className={`px-2.5 py-1 rounded font-semibold flex items-center gap-1 cursor-pointer transition-all ${
                      mediaType === 'image'
                        ? 'bg-amber-400 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <ImageIcon className="w-3 h-3" />
                    <span>JPG Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaType('video')}
                    className={`px-2.5 py-1 rounded font-semibold flex items-center gap-1 cursor-pointer transition-all ${
                      mediaType === 'video'
                        ? 'bg-purple-500 text-white font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Video className="w-3 h-3" />
                    <span>Video Clip</span>
                  </button>
                </div>
              </div>

              {/* Direct Quick Import Buttons: JPG Image & Video Clip */}
              <div className="grid grid-cols-2 gap-2">
                <label className="py-2 px-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm">
                  <Upload className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">Import JPG Image</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>

                <label className="py-2 px-2.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm">
                  <Upload className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span className="truncate">Import Video Clip</span>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* IMAGE MODE */}
              {mediaType === 'image' && (
                <div className="space-y-3">
                  {/* Card Preview */}
                  <div className="relative rounded-xl overflow-hidden border border-amber-500/30 bg-slate-950 aspect-[4/3] group">
                    <img
                      src={cardImageUrl}
                      alt="Festive Greeting Card"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex flex-col justify-end p-3">
                      <div className="text-[10px] font-bold text-amber-300 uppercase tracking-widest font-mono">
                        {settings.companyName}
                      </div>
                      <div className="text-xs font-bold text-white font-serif line-clamp-1">{title}</div>
                      {discountOffer && (
                        <div className="text-[10px] text-amber-400 font-mono mt-0.5">
                          Code: {discountOffer}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upload or Download Card */}
                  <div className="flex items-center gap-2">
                    <label className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>{cardImageUrl ? 'Change JPG Image' : 'Import JPG Image'}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={handleDownloadCard}
                      className="py-2 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Download JPG Card image to attach in WhatsApp"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download JPG</span>
                    </button>
                  </div>
                </div>
              )}

              {/* VIDEO MODE */}
              {mediaType === 'video' && (
                <div className="space-y-3">
                  {/* Video Player */}
                  {videoClipUrl ? (
                    <div className="relative rounded-xl overflow-hidden border border-purple-500/30 bg-slate-950 aspect-[16/9]">
                      <video
                        src={videoClipUrl}
                        controls
                        className="w-full h-full object-cover"
                        playsInline
                      />
                      <div className="absolute top-2 left-2 bg-slate-950/80 px-2 py-0.5 rounded text-[10px] font-mono text-purple-300 border border-slate-800">
                        🎬 Video Clip ({(videoClipSizeBytes / (1024 * 1024)).toFixed(1)} MB)
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 border border-dashed border-slate-800 rounded-xl text-center text-xs text-slate-500 space-y-2">
                      <Video className="w-8 h-8 text-purple-400 mx-auto opacity-60" />
                      <div>No video attached yet. Click <strong>Import Video Clip</strong> above to upload.</div>
                    </div>
                  )}

                  {/* Upload or Download Video */}
                  <div className="flex items-center gap-2">
                    <label className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5 text-purple-400" />
                      <span>{videoClipUrl ? 'Change Video Clip' : 'Import Video Clip'}</span>
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime"
                        onChange={handleVideoUpload}
                        className="hidden"
                      />
                    </label>

                    {videoClipUrl && (
                      <button
                        type="button"
                        onClick={handleDownloadVideo}
                        className="py-2 px-3 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Download Video to send via WhatsApp"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download MP4</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* WhatsApp Media Hint */}
              <div className="p-2.5 bg-slate-950 border border-slate-800/80 rounded-lg text-[11px] text-slate-400 leading-snug flex items-start gap-2">
                <span className="text-emerald-400 shrink-0 font-bold">📲 WhatsApp Share:</span>
                <span>
                  Click <strong>Share in WhatsApp</strong> to open chat with greeting text pre-filled. Download the {mediaType === 'image' ? 'JPG image' : 'video clip'} to attach directly into WhatsApp.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recipients Broadcast / Sender Action Section */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5" />
                4. Share in WhatsApp ({recipientList.length} Customer{recipientList.length > 1 ? 's' : ''})
              </span>
              <p className="text-[11px] text-slate-400">
                Click <strong>Share in WhatsApp</strong> next to each client to launch their direct personalized chat.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyMessage}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>
            </div>
          </div>

          {/* Quick 1-Click Share Banner for Single Customer */}
          {recipientList.length === 1 && recipientList[0] && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-300">
                    Direct WhatsApp Share to: {recipientList[0].name}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {recipientList[0].whatsapp || recipientList[0].phone || 'No phone recorded'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSendWhatsApp(recipientList[0])}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs shadow-md shadow-emerald-950/50 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <MessageSquare className="w-4 h-4 text-white" />
                <span>Share via WhatsApp</span>
              </button>
            </div>
          )}

          {/* Master "All Customer Share in WhatsApp" Banner for Multiple Customers */}
          {recipientList.length > 1 && (() => {
            const sentCount = recipientList.filter((c) => broadcastSentStatus[c.id]).length;
            const unsentCount = recipientList.length - sentCount;
            const nextCustName = recipientList.find((c) => c.id === nextQueueCustId)?.name || 'Next Client';

            return (
              <div className="p-3 bg-gradient-to-r from-emerald-950/60 via-slate-950 to-emerald-950/60 border border-emerald-500/40 rounded-xl space-y-2.5 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                        <Users className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-white uppercase font-mono tracking-wide">
                        All Customer WhatsApp Broadcast
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {sentCount}/{recipientList.length} Sent
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {isAutoBroadcasting
                        ? isAutoPaused
                          ? 'Broadcast paused. Click Resume or Send Next to continue.'
                          : `Auto-sending: Opening WhatsApp for ${nextCustName} in ${autoCountdown}s...`
                        : unsentCount === 0
                        ? 'All selected clients have received the WhatsApp greeting!'
                        : `Share greeting with all ${recipientList.length} customers in WhatsApp sequentially.`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!isAutoBroadcasting ? (
                      <>
                        {sentCount > 0 && (
                          <button
                            type="button"
                            onClick={handleResetBroadcast}
                            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-700 cursor-pointer"
                            title="Reset sent markers"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Reset</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={handleStartAllShare}
                          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-lg shadow-md shadow-emerald-950/50 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 border border-emerald-400/30"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>
                            {unsentCount === recipientList.length
                              ? `Share All (${recipientList.length}) in WhatsApp`
                              : unsentCount > 0
                              ? `Share Remaining (${unsentCount}) in WhatsApp`
                              : `Re-Share All (${recipientList.length}) in WhatsApp`}
                          </span>
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={handleSendNextNow}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow cursor-pointer active:scale-95"
                          title="Skip countdown and send immediately"
                        >
                          <FastForward className="w-3.5 h-3.5" />
                          <span>Send Next ({autoCountdown}s)</span>
                        </button>

                        <button
                          type="button"
                          onClick={handlePauseResume}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 cursor-pointer"
                          title={isAutoPaused ? 'Resume' : 'Pause'}
                        >
                          {isAutoPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
                        </button>

                        <button
                          type="button"
                          onClick={handleStopAutoBroadcast}
                          className="p-1.5 bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-400 rounded-lg border border-slate-700 cursor-pointer"
                          title="Stop sequence"
                        >
                          <Square className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {isAutoBroadcasting && (
                  <div className="space-y-1 pt-1.5 border-t border-slate-800">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="flex items-center gap-1 text-emerald-300 font-semibold">
                        <Clock className="w-3 h-3 animate-spin text-emerald-400" />
                        <span>{isAutoPaused ? 'Paused' : `Next: ${nextCustName} in ${autoCountdown}s`}</span>
                      </span>
                      <span className="font-mono text-emerald-400 font-bold">
                        {Math.round((sentCount / recipientList.length) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${(sentCount / recipientList.length) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* List of Recipients */}
          <div className="max-h-56 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
            {recipientList.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                No matching customers found for this selection.
              </p>
            ) : (
              recipientList.map((c) => {
                const isSent = broadcastSentStatus[c.id];
                const isNextInQueue = isAutoBroadcasting && nextQueueCustId === c.id;
                const phoneDisplay = c.whatsapp || c.phone || 'No phone recorded';

                return (
                  <div
                    key={c.id}
                    className={`p-2.5 rounded-lg border flex items-center justify-between gap-3 transition-all ${
                      isNextInQueue
                        ? 'bg-emerald-950/30 border-emerald-500/50 ring-1 ring-emerald-500/30'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-xs text-amber-400 shrink-0">
                        {c.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-slate-100 truncate">{c.name}</span>
                          {c.isVip && (
                            <span className="px-1 py-0.2 rounded text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              VIP
                            </span>
                          )}
                          {isNextInQueue && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                              ⏳ In {autoCountdown}s
                            </span>
                          )}
                          {isSent && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                              <Check className="w-3 h-3" /> Sent
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">{phoneDisplay}</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSendWhatsApp(c)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSent
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/40 active:scale-95'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{isSent ? 'Resend' : 'Share in WhatsApp'}</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Modal Footer */}
        {(() => {
          const sentCount = recipientList.filter((c) => broadcastSentStatus[c.id]).length;
          const unsentCount = recipientList.length - sentCount;

          return (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-3 border-t border-slate-800">
              <span className="text-xs text-slate-400">
                <strong className="text-slate-200">{sentCount}</strong> of {recipientList.length} sent via WhatsApp
              </span>

              <div className="flex items-center gap-2">
                {recipientList.length > 1 && (
                  <button
                    type="button"
                    onClick={handleStartAllShare}
                    disabled={isAutoBroadcasting}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-950/50 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {unsentCount > 0
                        ? `Share All (${recipientList.length}) in WhatsApp`
                        : `Re-Share All in WhatsApp`}
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    handleStopAutoBroadcast();
                    onClose();
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          );
        })()}
      </div>
    </Modal>
  );
};
