/**
 * Safe external navigation helper for iframes & desktop browsers
 */
export const safeOpenExternal = (url: string): void => {
  try {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
    }, 150);
  } catch {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

/**
 * Format phone number to international WhatsApp standard
 */
export const formatWhatsAppNumber = (phoneStr: string): string => {
  const digits = (phoneStr || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('0')) {
    return '94' + digits.slice(1);
  }
  if (!digits.startsWith('94') && digits.length === 9) {
    return '94' + digits;
  }
  return digits;
};
