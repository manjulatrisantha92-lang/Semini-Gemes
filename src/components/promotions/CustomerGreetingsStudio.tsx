import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Upload,
  Video,
  Image as ImageIcon,
  Share2,
  Copy,
  Send,
  Check,
  Users,
  Gift,
  Calendar,
  Trash2,
  Play,
  Pause,
  AlertCircle,
  Clock,
  ShieldAlert,
  Info,
  ExternalLink,
  Download,
  RotateCcw,
  FastForward,
  Square,
} from 'lucide-react';
import { Customer, CustomerGreeting, GreetingOccasion, AppSettings, User } from '../../types';
import { StorageService } from '../../services/storage';
import { useToast } from '../common/Toast';
import { Modal } from '../common/Modal';
import { safeOpenExternal, formatWhatsAppNumber } from '../../utils/navigation';

interface CustomerGreetingsStudioProps {
  customers: Customer[];
  settings: AppSettings;
  currentUser?: User | null;
}

const OCCASION_PRESETS: {
  id: GreetingOccasion;
  label: string;
  badge: string;
  defaultTitle: string;
  sinhala: string;
  english: string;
  tamil: string;
  discountOffer: string;
  defaultCard: string;
  defaultVideo?: string;
}[] = [
  {
    id: 'Sinhala & Tamil New Year',
    label: 'Sinhala & Tamil New Year (සිංහල අලුත් අවුරුද්ද)',
    badge: '🌸 Awurudu Festival',
    defaultTitle: 'සුබ අලුත් අවුරුද්දක් වේවා! Subha Aluth Avuruddak Wewa!',
    sinhala:
      'ලබන්නාවූ සිංහල හා දෙමළ අලුත් අවුරුද්ද ඔබ සැමට සාමය, සතුට, සෞභාග්‍යය හා නිරෝගීභාවය පිරි සුබම සුබ අලුත් අවුරුද්දක් වේවායි WCS Gems & Jewelry වෙතින් හදපිරි සෙනෙහසින් ප්‍රාර්ථනා කරමු!\n\nඅවුරුදු සමයේ අපගේ සියලුම ස්වර්ණාභරණ සහ මැණික් මිලදී ගැනීම් සඳහා විශේෂ වට්ටම් ලබාගන්න.',
    english:
      'Wishing you and your family a joyous, peaceful, and prosperous Sinhala & Tamil New Year! May the radiant dawn of the new year bring good health, abundant fortune, and golden blessings.\n\nEnjoy an exclusive festive reduction on all certified Ceylon sapphires and handcrafted 22K gold jewelry.',
    tamil:
      'இனிய சிங்கள மற்றும் தமிழ் புத்தாண்டு நல்வாழ்த்துக்கள்! உங்கள் வாழ்வில் அமைதியும், மகிழ்ச்சியும், ஆரோக்கியமும், செல்வமும் பொங்க வாழ்த்துகிறோம்.',
    discountOffer: 'AWURUDU2026 (12% OFF)',
    defaultCard:
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
    defaultVideo:
      'https://assets.mixkit.co/videos/preview/mixkit-bright-light-leaks-in-golden-particles-32868-large.mp4',
  },
  {
    id: 'Christmas',
    label: 'Christmas & Holiday Season (Crimax / නත්තල)',
    badge: '🎄 Christmas & Festive',
    defaultTitle: 'Merry Christmas & A Blessed Festive Season!',
    sinhala:
      'සාමයේ සහ ප්‍රීතියේ උතුම් නත්තලක් වේවා! සාමයේ කුමාරයාණන්ගේ උපත සමරන මේ උතුම් නත්තල් සමය ඔබගේ නිවසට ප්‍රීතිය සහ සතුට රැගෙන ඒමට WCS Gems පවුලෙන් ආශිර්වාද පතමු.',
    english:
      'Merry Christmas! May the timeless warmth and sparkling wonder of this holy season fill your home with radiant joy, peace, and love. Celebrate cherished moments with our authentic Ceylon sapphire collection and bespoke diamond creations.',
    tamil:
      'இனிய நத்தார் தின நல்வாழ்த்துக்கள்! உங்கள் இல்லங்களில் அமைதியும் மகிழ்ச்சியும் நிலவட்டும்.',
    discountOffer: 'CRIMAX2026 (15% OFF)',
    defaultCard:
      'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800&auto=format&fit=crop&q=80',
    defaultVideo:
      'https://assets.mixkit.co/videos/preview/mixkit-festive-sparks-of-holiday-lights-42994-large.mp4',
  },
  {
    id: 'New Year',
    label: 'New Year Celebrations (ජනවාරි 1 නව වසර)',
    badge: '🎆 Happy New Year',
    defaultTitle: 'Happy New Year! A Brilliant Dawn of Success & Prosperity',
    sinhala:
      'උදාවූ නව වසර ඔබගේ සියලු සිතුම් පැතුම් ඉටුවන, නිරෝගී, වාසනාවන්ත සුබම සුබ නව වසරක් වේවායි ප්‍රාර්ථනා කරමු!',
    english:
      'Happy New Year! As we step into a brilliant new dawn, we extend our heartfelt gratitude for being a valued part of our journey. May the coming year shimmer with triumph, cherished moments, and eternal beauty.',
    tamil:
      'இனிய புத்தாண்டு நல்வாழ்த்துக்கள்! இப்புதிய ஆண்டு உங்கள் வாழ்வில் வெற்றிகளையும் மகிழ்ச்சியையும் கொண்டுவரட்டும்.',
    discountOffer: 'NEWYEAR2027 (10% OFF)',
    defaultCard:
      'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=800&auto=format&fit=crop&q=80',
    defaultVideo:
      'https://assets.mixkit.co/videos/preview/mixkit-golden-fireworks-bursting-in-the-night-sky-40450-large.mp4',
  },
  {
    id: 'Vesak Festival',
    label: 'Vesak Full Moon Poya (වෙසක් පුන් පොහෝ දිනය)',
    badge: '☸️ Vesak Poya',
    defaultTitle: 'පින්බර වෙසක් මංගල්‍යයක් වේවා! Blessed Vesak Poya!',
    sinhala:
      'සම්බුදු තෙමඟුල සිහිපත් කෙරෙන උතුම් වෙසක් පුන් පොහෝ දිනයේ ඔබ සැමට නිදුක් නිරෝගී සුවය හා උතුම් ධර්ම ශාන්තිය සැලසේවා!',
    english:
      'May the profound teachings of the supreme Buddha guide your path towards peace, compassion, and enlightenment. Wishing you and your loved ones a serene and blessed Vesak festival.',
    tamil:
      'புனித வெசாக் தின நல்வாழ்த்துக்கள்! உங்கள் வாழ்வில் அமைதியும் சாந்தியும் பெருகட்டும்.',
    discountOffer: 'VESAKPEACE (Blessings)',
    defaultCard:
      'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'Deepavali',
    label: 'Deepavali Festival of Lights (දීපාවලී)',
    badge: '🪔 Deepavali Lights',
    defaultTitle: 'Happy Deepavali! May the Light of Joy Radiate Forever',
    sinhala:
      'අඳුර දුරලා ආලෝකය උදාකරන ප්‍රීතිමත් දීපාවලී උත්සවයක් වේවායි ප්‍රාර්ථනා කරමු!',
    english:
      'Wishing you a luminous and blessed Deepavali! May the festival of lights illuminate your life with infinite joy, prosperity, and sparkling good health.',
    tamil:
      'இனிய தீபாவளி நல்வாழ்த்துக்கள்! ஒளிமயமான தீபங்கள் உங்கள் வாழ்வில் மகிழ்ச்சியையும் செழிப்பையும் கொண்டு சேர்க்கட்டும்.',
    discountOffer: 'DEEPAVALI2026 (Special Gold Rate)',
    defaultCard:
      'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'Custom Greeting',
    label: 'Custom Personalized Greeting / Anniversary',
    badge: '✨ Custom Wishes',
    defaultTitle: 'Warm Greetings from WCS Gems & Jewelry',
    sinhala:
      'ඔබගේ විශේෂ අවස්ථාව වඩාත් අලංකාරවත් කර ගැනීමට අප සමඟ අත්වැල් බැඳගත් ඔබට අපගේ හෘදයාංගම ස්තූතිය!',
    english:
      'Dear Valued Client, wishing you life’s finest moments filled with sparkle, joy, and timeless memories. Thank you for your continued patronage.',
    tamil: 'எங்கள் மனமார்ந்த நல்வாழ்த்துக்கள்!',
    discountOffer: 'PRIVILEGE2026',
    defaultCard:
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80',
  },
];

export const CustomerGreetingsStudio: React.FC<CustomerGreetingsStudioProps> = ({
  customers,
  settings,
}) => {
  const { showToast } = useToast();

  const [savedGreetings, setSavedGreetings] = useState<CustomerGreeting[]>(() =>
    StorageService.getCustomerGreetings()
  );

  // Active form state
  const [selectedOccasion, setSelectedOccasion] = useState<GreetingOccasion>(
    'Sinhala & Tamil New Year'
  );
  const [title, setTitle] = useState(OCCASION_PRESETS[0].defaultTitle);
  const [activeLangTab, setActiveLangTab] = useState<'sinhala' | 'english' | 'tamil'>('sinhala');
  const [messageSinhala, setMessageSinhala] = useState(OCCASION_PRESETS[0].sinhala);
  const [messageEnglish, setMessageEnglish] = useState(OCCASION_PRESETS[0].english);
  const [messageTamil, setMessageTamil] = useState(OCCASION_PRESETS[0].tamil);
  const [discountOffer, setDiscountOffer] = useState(OCCASION_PRESETS[0].discountOffer);

  // Uploaded media states
  const [cardImageUrl, setCardImageUrl] = useState<string>(OCCASION_PRESETS[0].defaultCard);
  const [videoClipUrl, setVideoClipUrl] = useState<string>(OCCASION_PRESETS[0].defaultVideo || '');
  const [videoClipName, setVideoClipName] = useState<string>('sinhala_avurudu_celebration_hd.mp4');
  const [videoClipSizeBytes, setVideoClipSizeBytes] = useState<number>(3840000);

  // Recipient selection
  const [targetAudience, setTargetAudience] = useState<'all' | 'vip' | 'single'>('all');
  const [selectedSingleCustomerId, setSelectedSingleCustomerId] = useState<string>(
    customers[0]?.id || ''
  );

  // Broadcast modal state
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastProgress, setBroadcastProgress] = useState<{ [custId: string]: boolean }>({});
  const [copied, setCopied] = useState(false);

  // Auto Broadcast state for "All Customer Share in WhatsApp"
  const [isAutoBroadcasting, setIsAutoBroadcasting] = useState(false);
  const [isAutoPaused, setIsAutoPaused] = useState(false);
  const [nextQueueCustId, setNextQueueCustId] = useState<string | null>(null);
  const [autoCountdown, setAutoCountdown] = useState<number>(3);

  // File input refs
  const cardInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Handle preset change
  const handleSelectOccasion = (occ: GreetingOccasion) => {
    setSelectedOccasion(occ);
    const preset = OCCASION_PRESETS.find((p) => p.id === occ) || OCCASION_PRESETS[0];
    setTitle(preset.defaultTitle);
    setMessageSinhala(preset.sinhala);
    setMessageEnglish(preset.english);
    setMessageTamil(preset.tamil);
    setDiscountOffer(preset.discountOffer);
    setCardImageUrl(preset.defaultCard);
    setVideoClipUrl(preset.defaultVideo || '');
    setVideoClipName(preset.defaultVideo ? `${occ.toLowerCase().replace(/[^a-z0-9]/g, '_')}.mp4` : '');
    setVideoClipSizeBytes(preset.defaultVideo ? 4100000 : 0);
  };

  // Card Image upload handler (JPG / PNG)
  const handleCardUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('image/')) {
      showToast('Please select a valid JPG or PNG image file.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCardImageUrl(reader.result as string);
      showToast(`Greeting card "${file.name}" uploaded successfully!`, 'success');
    };
    reader.readAsDataURL(file);
  };

  // Video Clip upload handler (Low capacity MP4 / WebM)
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('video/')) {
      showToast('Please select an MP4 or WebM video file.', 'error');
      return;
    }

    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > 25) {
      showToast(
        `Video size (${sizeInMB.toFixed(1)} MB) is high. For best WhatsApp/SMS delivery, low-capacity clips under 15 MB are recommended.`,
        'info'
      );
    }

    const reader = new FileReader();
    reader.onload = () => {
      setVideoClipUrl(reader.result as string);
      setVideoClipName(file.name);
      setVideoClipSizeBytes(file.size);
      showToast(
        `Greeting video "${file.name}" (${sizeInMB.toFixed(1)} MB) loaded!`,
        'success'
      );
    };
    reader.readAsDataURL(file);
  };

  // Compute recipient list
  const recipientList: Customer[] =
    targetAudience === 'all'
      ? customers
      : targetAudience === 'vip'
      ? customers.filter((c) => c.isVip)
      : customers.filter((c) => c.id === selectedSingleCustomerId);

  // Generate personalized greeting text for WhatsApp
  const generateCustomerText = (cust?: Customer) => {
    const custName = cust ? cust.name : 'Valued Patron';
    const mainWish =
      activeLangTab === 'sinhala'
        ? messageSinhala
        : activeLangTab === 'english'
        ? messageEnglish
        : messageTamil;

    let text = `✨ *${settings.companyName.toUpperCase()}* ✨\n_${title}_\n\n`;
    text += `Dear *${custName}*,\n\n`;
    text += `${mainWish}\n\n`;

    if (discountOffer.trim()) {
      text += `🎁 *Special Festival Privilege:* Use code *${discountOffer}* on your next visit or bespoke order!\n\n`;
    }

    if (cardImageUrl) {
      text += `🖼️ _Festive Greeting Card Attached_\n`;
    }
    if (videoClipUrl) {
      text += `🎬 _Festive Video Clip:_ ${videoClipName} (${(videoClipSizeBytes / (1024 * 1024)).toFixed(1)} MB)\n`;
    }

    text += `\n📍 *Showroom:* ${settings.companyAddress}\n`;
    text += `📞 *Hotline / WhatsApp:* ${settings.telephone}\n`;
    text += `🌐 _Subha Aluth Avuruddak / Merry Christmas / Happy New Year!_`;

    return text;
  };

  // Copy full message
  const handleCopyGreeting = () => {
    const text = generateCustomerText(recipientList[0]);
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Greeting message copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  // Download Greeting Card Image (JPG/PNG)
  const handleDownloadCard = () => {
    if (!cardImageUrl) return;
    const link = document.createElement('a');
    link.href = cardImageUrl;
    link.download = `WCS-Festive-Card-${selectedOccasion.replace(/\s+/g, '-')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Greeting Card image downloaded. You can attach it in WhatsApp.', 'success');
  };

  // Download Video Clip (MP4/WebM)
  const handleDownloadVideo = () => {
    if (!videoClipUrl) return;
    const link = document.createElement('a');
    link.href = videoClipUrl;
    link.download = videoClipName || `WCS-Festive-Video-${selectedOccasion.replace(/\s+/g, '-')}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Greeting Video clip downloaded. You can attach it in WhatsApp.', 'success');
  };

  // Send to Single Customer WhatsApp
  const handleSendSingleWhatsApp = (cust: Customer) => {
    const fullPhone = formatWhatsAppNumber(cust.whatsapp || cust.phone || '');
    const message = generateCustomerText(cust);
    const url = `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
    safeOpenExternal(url);
    setBroadcastProgress((prev) => ({ ...prev, [cust.id]: true }));
  };

  // Auto Broadcast runner for sequential WhatsApp dispatch
  useEffect(() => {
    if (!isAutoBroadcasting || isAutoPaused || !nextQueueCustId || !isBroadcastModalOpen) return;

    const timer = setInterval(() => {
      setAutoCountdown((prev) => {
        if (prev > 1) {
          return prev - 1;
        }

        // Timer expired (1 -> 0): dispatch WhatsApp for nextQueueCustId
        const currentTarget = recipientList.find((c) => c.id === nextQueueCustId);
        if (currentTarget) {
          handleSendSingleWhatsApp(currentTarget);
        }

        // Determine next unsent client
        const currentIndex = recipientList.findIndex((c) => c.id === nextQueueCustId);
        const remaining = recipientList
          .slice(currentIndex + 1)
          .filter((c) => !broadcastProgress[c.id] && c.id !== nextQueueCustId);

        if (remaining.length > 0) {
          setNextQueueCustId(remaining[0].id);
          return 3;
        } else {
          // All done!
          setIsAutoBroadcasting(false);
          setNextQueueCustId(null);
          showToast('🎉 All customers have been shared via WhatsApp!', 'success');
          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAutoBroadcasting, isAutoPaused, nextQueueCustId, recipientList, broadcastProgress, isBroadcastModalOpen]);

  // Start "All Customer Share in WhatsApp"
  const handleStartAllShare = () => {
    const unsent = recipientList.filter((c) => !broadcastProgress[c.id]);
    const toSend = unsent.length > 0 ? unsent : recipientList;

    if (toSend.length === 0) {
      showToast('No customers found in recipient list.', 'info');
      return;
    }

    if (unsent.length === 0) {
      // If all were sent, reset markers to re-share with all
      setBroadcastProgress({});
    }

    // Step 1: Immediately dispatch first customer on the click event (prevents popup blockers)
    const firstCust = toSend[0];
    handleSendSingleWhatsApp(firstCust);

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
      handleSendSingleWhatsApp(currentTarget);
    }
    const currentIndex = recipientList.findIndex((c) => c.id === nextQueueCustId);
    const remaining = recipientList
      .slice(currentIndex + 1)
      .filter((c) => !broadcastProgress[c.id] && c.id !== nextQueueCustId);

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

  // Pause / Resume auto broadcast
  const handlePauseResume = () => {
    setIsAutoPaused((prev) => !prev);
  };

  // Stop auto broadcast
  const handleStopAutoBroadcast = () => {
    setIsAutoBroadcasting(false);
    setIsAutoPaused(false);
    setNextQueueCustId(null);
    setAutoCountdown(0);
  };

  // Reset broadcast markers
  const handleResetBroadcast = () => {
    handleStopAutoBroadcast();
    setBroadcastProgress({});
    showToast('Sent markers reset. You can share with all customers again.', 'info');
  };

  // Save current greeting campaign
  const handleSaveCampaign = () => {
    const newGreeting: CustomerGreeting = {
      id: `greet-${Date.now()}`,
      occasion: selectedOccasion,
      title,
      messageSinhala,
      messageEnglish,
      messageTamil,
      cardImageUrl: cardImageUrl || undefined,
      videoClipUrl: videoClipUrl || undefined,
      videoClipName: videoClipName || undefined,
      videoClipSizeBytes: videoClipSizeBytes || undefined,
      discountOffer: discountOffer || undefined,
      targetAudience: targetAudience === 'single' ? 'regular' : targetAudience,
      createdAt: new Date().toISOString(),
    };

    StorageService.addCustomerGreeting(newGreeting);
    setSavedGreetings(StorageService.getCustomerGreetings());
    showToast(`"${title}" saved to greeting templates!`, 'success');
  };

  // Delete saved greeting
  const handleDeleteSaved = (id: string) => {
    StorageService.deleteCustomerGreeting(id);
    setSavedGreetings(StorageService.getCustomerGreetings());
    showToast('Greeting template removed.', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/40 border border-amber-500/30 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
              <Gift className="w-4 h-4 text-amber-400" />
              <span>Customer Festive Greetings & Wishes Studio</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white font-serif mt-1">
              Festive Greeting Cards & Low-Capacity Video Broadcast
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Send heartfelt wishes for <strong>Sinhala & Tamil Awurudu</strong>,{' '}
              <strong>Christmas (Crimax)</strong>, and <strong>New Year</strong> to all registered
              clients with custom JPG/PNG cards and lightweight video clips via WhatsApp.
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              onClick={() => setIsBroadcastModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>Broadcast to All ({recipientList.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Occasion Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {OCCASION_PRESETS.map((preset) => {
          const isSelected = selectedOccasion === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => handleSelectOccasion(preset.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 scale-102'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span>{preset.badge}</span>
            </button>
          );
        })}
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Greeting Content & Media Uploader (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Card 1: Title & Language Tabs */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase text-slate-200 tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Greeting Headline & Occasion
              </label>
              <span className="text-[11px] text-amber-400/80 font-mono font-medium">
                {selectedOccasion}
              </span>
            </div>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. සුබ අලුත් අවුරුද්දක් වේවා! / Merry Christmas!"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-amber-200 font-semibold focus:outline-none focus:border-amber-400"
            />

            {/* Language Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase">
                  Select Language Template:
                </span>
                <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setActiveLangTab('sinhala')}
                    className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                      activeLangTab === 'sinhala'
                        ? 'bg-amber-400 text-slate-950'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    සිංහල (Sinhala)
                  </button>
                  <button
                    onClick={() => setActiveLangTab('english')}
                    className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                      activeLangTab === 'english'
                        ? 'bg-amber-400 text-slate-950'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setActiveLangTab('tamil')}
                    className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                      activeLangTab === 'tamil'
                        ? 'bg-amber-400 text-slate-950'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    தமிழ் (Tamil)
                  </button>
                </div>
              </div>

              {activeLangTab === 'sinhala' && (
                <textarea
                  rows={4}
                  value={messageSinhala}
                  onChange={(e) => setMessageSinhala(e.target.value)}
                  placeholder="සිංහල සුබපැතුම් පණිවිඩය ඇතුළත් කරන්න..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-amber-400 leading-relaxed font-sans"
                />
              )}

              {activeLangTab === 'english' && (
                <textarea
                  rows={4}
                  value={messageEnglish}
                  onChange={(e) => setMessageEnglish(e.target.value)}
                  placeholder="Enter English greeting message..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-amber-400 leading-relaxed font-sans"
                />
              )}

              {activeLangTab === 'tamil' && (
                <textarea
                  rows={4}
                  value={messageTamil}
                  onChange={(e) => setMessageTamil(e.target.value)}
                  placeholder="தமிழ் வாழ்த்துச் செய்தி..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-amber-400 leading-relaxed font-sans"
                />
              )}
            </div>

            {/* Privilege Discount Offer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                  Festive Discount / Privilege Code
                </label>
                <div className="relative">
                  <Gift className="w-4 h-4 text-amber-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={discountOffer}
                    onChange={(e) => setDiscountOffer(e.target.value)}
                    placeholder="e.g. AWURUDU2026 (12% OFF)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                  Target Customer Group
                </label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-medium focus:outline-none focus:border-amber-400"
                >
                  <option value="all">All Registered Customers ({customers.length})</option>
                  <option value="vip">
                    VIP High-Net-Worth Clients ({customers.filter((c) => c.isVip).length})
                  </option>
                  <option value="single">Single Specific Customer</option>
                </select>
              </div>
            </div>

            {targetAudience === 'single' && (
              <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Select Specific Customer:
                </label>
                <select
                  value={selectedSingleCustomerId}
                  onChange={(e) => setSelectedSingleCustomerId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone}) {c.isVip ? '★ VIP' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Card 2: Media Uploaders (Greeting Card JPG/PNG & Low-Capacity Video) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase text-slate-200 tracking-wider flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-amber-400" />
              Upload Media (Greeting Card JPG/PNG & Low-Capacity Video)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card Upload Box */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-sky-400" />
                      Greeting Card (JPG/PNG)
                    </span>
                    {cardImageUrl && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded">
                        Ready
                      </span>
                    )}
                  </div>

                  {cardImageUrl ? (
                    <div className="relative rounded-lg overflow-hidden border border-slate-700 aspect-video bg-slate-900">
                      <img
                        src={cardImageUrl}
                        alt="Greeting card"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        onClick={() => setCardImageUrl('')}
                        className="absolute top-1.5 right-1.5 p-1 bg-slate-950/80 hover:bg-rose-900/80 text-white rounded-md text-xs cursor-pointer"
                        title="Remove image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => cardInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-700 hover:border-amber-400/70 rounded-lg p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
                    >
                      <ImageIcon className="w-8 h-8 text-slate-500 mb-1" />
                      <span className="text-xs font-semibold text-slate-300">
                        Upload Card Image
                      </span>
                      <span className="text-[10px] text-slate-500 mt-0.5">
                        JPG or PNG high resolution
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <input
                    ref={cardInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleCardUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => cardInputRef.current?.click()}
                    className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{cardImageUrl ? 'Change JPG Image' : 'Import JPG Image'}</span>
                  </button>

                  {cardImageUrl && (
                    <button
                      type="button"
                      onClick={handleDownloadCard}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                      title="Download card JPG to attach in WhatsApp"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Download JPG</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Video Upload Box */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-purple-400" />
                      Low-Capacity Video Clip
                    </span>
                    {videoClipUrl && (
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 font-bold px-1.5 py-0.5 rounded">
                        {(videoClipSizeBytes / (1024 * 1024)).toFixed(1)} MB
                      </span>
                    )}
                  </div>

                  {videoClipUrl ? (
                    <div className="relative rounded-lg overflow-hidden border border-slate-700 aspect-video bg-black">
                      <video
                        src={videoClipUrl}
                        controls
                        className="w-full h-full object-contain"
                      />
                      <button
                        onClick={() => {
                          setVideoClipUrl('');
                          setVideoClipName('');
                          setVideoClipSizeBytes(0);
                        }}
                        className="absolute top-1.5 right-1.5 p-1 bg-slate-950/80 hover:bg-rose-900/80 text-white rounded-md text-xs cursor-pointer"
                        title="Remove video"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => videoInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-700 hover:border-purple-400/70 rounded-lg p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
                    >
                      <Video className="w-8 h-8 text-slate-500 mb-1" />
                      <span className="text-xs font-semibold text-slate-300">
                        Upload Video Clip
                      </span>
                      <span className="text-[10px] text-slate-500 mt-0.5">
                        MP4 or WebM (under 15 MB recommended)
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/mp4, video/webm, video/ogg"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{videoClipUrl ? 'Change Video Clip' : 'Import Video Clip'}</span>
                  </button>

                  {videoClipUrl && (
                    <button
                      type="button"
                      onClick={handleDownloadVideo}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                      title="Download MP4 video to attach in WhatsApp"
                    >
                      <Download className="w-3.5 h-3.5 text-purple-400" />
                      <span>Download Video</span>
                    </button>
                  )}
                  <span className="text-[10px] text-slate-500">Fast WhatsApp delivery</span>
                </div>
              </div>
            </div>

            {/* Info Badge */}
            <div className="bg-amber-950/20 border border-amber-500/20 rounded-lg p-3 text-xs text-amber-200 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p>
                <strong>Low Capacity Video Optimization:</strong> WhatsApp and mobile messaging
                deliver videos seamlessly when kept under 15 MB. Your uploaded video is cached
                locally and previewed in real-time.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive WhatsApp Preview & Broadcast Actions (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Phone Frame Mockup with Live Greeting */}
          <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Live WhatsApp Message Preview
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {recipientList.length} Recipients
              </span>
            </div>

            {/* WhatsApp Chat Simulation Frame */}
            <div className="bg-[#0b141a] rounded-xl p-3 sm:p-4 border border-slate-800 space-y-3 font-sans shadow-inner">
              {/* Chat Header */}
              <div className="flex items-center gap-2.5 pb-2 border-b border-[#202c33]">
                <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center font-bold text-slate-950 text-xs">
                  {settings.companyName.charAt(0)}
                </div>
                <div>
                  <div className="text-xs font-bold text-white leading-none">
                    {settings.companyName}
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">Online • Business Verified</div>
                </div>
              </div>

              {/* Chat Bubble with Card / Video preview and text */}
              <div className="bg-[#005c4b] text-slate-100 rounded-lg p-3 max-w-sm space-y-2 text-xs shadow">
                {/* Media preview */}
                {cardImageUrl && (
                  <div className="rounded overflow-hidden border border-emerald-800/40">
                    <img
                      src={cardImageUrl}
                      alt="Card preview"
                      className="w-full h-36 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {videoClipUrl && (
                  <div className="rounded overflow-hidden border border-emerald-800/40 bg-black aspect-video flex items-center justify-center relative">
                    <video
                      src={videoClipUrl}
                      className="w-full h-full object-contain"
                      muted
                      autoPlay
                      loop
                    />
                    <div className="absolute bottom-1 right-1 bg-black/70 px-1.5 py-0.5 rounded text-[9px] text-white font-mono">
                      🎬 {(videoClipSizeBytes / (1024 * 1024)).toFixed(1)} MB
                    </div>
                  </div>
                )}

                {/* Text Body */}
                <div className="whitespace-pre-line text-[11px] leading-relaxed">
                  <div className="font-bold text-amber-200">✨ {title} ✨</div>
                  <div className="mt-1 font-semibold text-emerald-100">
                    Dear {recipientList[0]?.name || 'Valued Patron'},
                  </div>
                  <div className="mt-1 text-slate-100">
                    {activeLangTab === 'sinhala'
                      ? messageSinhala
                      : activeLangTab === 'english'
                      ? messageEnglish
                      : messageTamil}
                  </div>
                  {discountOffer && (
                    <div className="mt-2 p-1.5 bg-emerald-950/60 border border-emerald-700/50 rounded text-[10px] font-mono font-bold text-amber-300">
                      🎁 Code: {discountOffer}
                    </div>
                  )}
                  <div className="mt-2 text-[10px] text-slate-300/80">
                    📍 {settings.companyAddress} | 📞 {settings.telephone}
                  </div>
                </div>

                <div className="text-right text-[9px] text-emerald-200/60 font-mono">
                  Today 10:00 AM • ✓✓
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={() => setIsBroadcastModalOpen(true)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow cursor-pointer transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Launch WhatsApp Broadcast ({recipientList.length} Clients)</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleCopyGreeting}
                  className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-amber-400" />
                      <span>Copy Text</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleSaveCampaign}
                  className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Save Template</span>
                </button>
              </div>
            </div>
          </div>

          {/* Saved Greeting Templates */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3 shadow-sm">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
              <span>Saved Festival Cards ({savedGreetings.length})</span>
              <span className="text-[10px] text-slate-400 font-normal">One-click reload</span>
            </h3>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {savedGreetings.map((greet) => (
                <div
                  key={greet.id}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between gap-2 hover:border-amber-500/40 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-200 truncate">{greet.title}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5 font-mono">
                      <span className="text-amber-400">{greet.occasion}</span>
                      {greet.cardImageUrl && <span>• 🖼️ Card</span>}
                      {greet.videoClipUrl && <span>• 🎬 Video</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setSelectedOccasion(greet.occasion);
                        setTitle(greet.title);
                        if (greet.messageSinhala) setMessageSinhala(greet.messageSinhala);
                        if (greet.messageEnglish) setMessageEnglish(greet.messageEnglish);
                        if (greet.messageTamil) setMessageTamil(greet.messageTamil);
                        if (greet.discountOffer) setDiscountOffer(greet.discountOffer);
                        if (greet.cardImageUrl) setCardImageUrl(greet.cardImageUrl);
                        if (greet.videoClipUrl) {
                          setVideoClipUrl(greet.videoClipUrl);
                          setVideoClipName(greet.videoClipName || 'video.mp4');
                          setVideoClipSizeBytes(greet.videoClipSizeBytes || 4000000);
                        }
                        showToast(`Template "${greet.title}" loaded!`, 'info');
                      }}
                      className="px-2 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[10px] rounded cursor-pointer"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => handleDeleteSaved(greet.id)}
                      className="p-1 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 rounded cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Broadcast Modal: One-Click WhatsApp Send for Each Recipient */}
      {isBroadcastModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => {
            handleStopAutoBroadcast();
            setIsBroadcastModalOpen(false);
          }}
          title={`WhatsApp Festive Broadcast — ${selectedOccasion}`}
          subtitle={`Sending to ${recipientList.length} client${recipientList.length === 1 ? '' : 's'} with greeting card & video`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="bg-emerald-950/30 border border-emerald-500/30 p-3.5 rounded-xl text-xs text-emerald-200 flex items-start gap-2">
              <Share2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong>Direct WhatsApp Delivery:</strong> Click "Send WhatsApp" next to each client
                below, or use the <strong>"Share to All in WhatsApp"</strong> button to sequentially open
                chats with the personalized Sinhala/English greeting and festive discount code.
              </div>
            </div>

            {(cardImageUrl || videoClipUrl) && (
              <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-amber-400" />
                  <span>Attach media in WhatsApp chat:</span>
                </span>
                <div className="flex items-center gap-2">
                  {cardImageUrl && (
                    <button
                      onClick={handleDownloadCard}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer text-xs border border-slate-700"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-400" />
                      <span>Download Card (JPG)</span>
                    </button>
                  )}
                  {videoClipUrl && (
                    <button
                      onClick={handleDownloadVideo}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-purple-300 font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer text-xs border border-slate-700"
                    >
                      <Download className="w-3.5 h-3.5 text-purple-400" />
                      <span>Download Video (MP4)</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* MASTER ALL CUSTOMERS SHARE IN WHATSAPP ACTION PANEL */}
            {(() => {
              const sentCount = recipientList.filter((c) => broadcastProgress[c.id]).length;
              const unsentCount = recipientList.length - sentCount;
              const nextCustName = recipientList.find((c) => c.id === nextQueueCustId)?.name || 'Next Client';

              return (
                <div className="p-3.5 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-emerald-950/60 border border-emerald-500/40 rounded-xl space-y-3 shadow-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                          <Users className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-white tracking-wide uppercase font-mono">
                          All Customer Share in WhatsApp
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {sentCount} / {recipientList.length} Sent
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        {isAutoBroadcasting
                          ? isAutoPaused
                            ? 'Broadcast paused. Click Resume or Send Next to proceed.'
                            : `Pacing dispatch: Opening WhatsApp for ${nextCustName} in ${autoCountdown}s...`
                          : unsentCount === 0
                          ? 'All customers in this list have been opened in WhatsApp!'
                          : `Sequentially launch WhatsApp chat with greeting message for all ${recipientList.length} clients.`}
                      </p>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2 shrink-0">
                      {!isAutoBroadcasting ? (
                        <>
                          {sentCount > 0 && (
                            <button
                              type="button"
                              onClick={handleResetBroadcast}
                              className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-700 cursor-pointer transition-colors"
                              title="Reset sent markers to re-share from start"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Reset</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={handleStartAllShare}
                            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/50 flex items-center gap-2 cursor-pointer transition-all active:scale-95 border border-emerald-400/40"
                          >
                            <Send className="w-4 h-4 text-white" />
                            <span>
                              {unsentCount === recipientList.length
                                ? `Share to All (${recipientList.length}) Customers in WhatsApp`
                                : unsentCount > 0
                                ? `Share Remaining (${unsentCount}) in WhatsApp`
                                : `Re-share to All (${recipientList.length}) in WhatsApp`}
                            </span>
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleSendNextNow}
                            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer active:scale-95"
                            title="Skip countdown and open next WhatsApp chat immediately"
                          >
                            <FastForward className="w-3.5 h-3.5" />
                            <span>Send Next ({autoCountdown}s)</span>
                          </button>

                          <button
                            type="button"
                            onClick={handlePauseResume}
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 cursor-pointer transition-colors"
                            title={isAutoPaused ? 'Resume auto-share' : 'Pause auto-share'}
                          >
                            {isAutoPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
                          </button>

                          <button
                            type="button"
                            onClick={handleStopAutoBroadcast}
                            className="p-2 bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-400 rounded-lg border border-slate-700 cursor-pointer transition-colors"
                            title="Stop broadcast sequence"
                          >
                            <Square className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar & Live Queue Status */}
                  {isAutoBroadcasting && (
                    <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                          <Clock className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                          <span>
                            {isAutoPaused
                              ? 'Broadcasting Paused'
                              : `Next: ${nextCustName} • Opening in ${autoCountdown}s...`}
                          </span>
                        </span>
                        <span className="font-mono font-bold text-emerald-400">
                          {Math.round((sentCount / recipientList.length) * 100)}% ({sentCount}/{recipientList.length})
                        </span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-300"
                          style={{ width: `${(sentCount / recipientList.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Recipient Roster */}
            <div className="max-h-96 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-800">
              {recipientList.map((cust, idx) => {
                const isSent = broadcastProgress[cust.id];
                const isNextInQueue = isAutoBroadcasting && nextQueueCustId === cust.id;

                return (
                  <div
                    key={cust.id}
                    className={`pt-2 p-2 rounded-lg flex items-center justify-between gap-3 text-xs transition-all ${
                      isNextInQueue
                        ? 'bg-emerald-950/30 border border-emerald-500/40 ring-1 ring-emerald-500/30'
                        : ''
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-200 flex items-center gap-1.5">
                        <span>
                          {idx + 1}. {cust.name}
                        </span>
                        {cust.isVip && (
                          <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1 py-0.2 rounded font-mono font-bold">
                            VIP
                          </span>
                        )}
                        {isNextInQueue && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono font-semibold animate-pulse border border-emerald-500/40">
                            ⏳ Opening in {autoCountdown}s
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {cust.whatsapp || cust.phone} • {cust.city}
                      </div>
                    </div>

                    <button
                      onClick={() => handleSendSingleWhatsApp(cust)}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors ${
                        isSent
                          ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                      }`}
                    >
                      {isSent ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Sent / Re-share</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Share in WhatsApp</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Bottom Footer Actions */}
            {(() => {
              const sentCount = recipientList.filter((c) => broadcastProgress[c.id]).length;
              const unsentCount = recipientList.length - sentCount;

              return (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800">
                  <span className="text-xs text-slate-400">
                    <strong className="text-slate-200">{sentCount}</strong> of {recipientList.length} sent via WhatsApp
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleStartAllShare}
                      disabled={isAutoBroadcasting}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-950/50 active:scale-95 transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>
                        {unsentCount > 0
                          ? `Share All (${recipientList.length}) in WhatsApp`
                          : `Re-Share All in WhatsApp`}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        handleStopAutoBroadcast();
                        setIsBroadcastModalOpen(false);
                      }}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                    >
                      Close Broadcast Window
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </Modal>
      )}
    </div>
  );
};
