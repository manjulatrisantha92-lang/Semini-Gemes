import { Invoice, InvoiceItem, Product } from '../types';

/**
 * Check if a single invoice item is a gemstone or jewelry containing gemstones
 */
export const isGemItem = (item: InvoiceItem, products: Product[]): boolean => {
  if (!item) return false;

  // 1. Direct item gemstoneType
  if (item.gemstoneType && item.gemstoneType.trim() !== '' && item.gemstoneType !== 'None') {
    return true;
  }

  // 2. Direct category check
  const cat = (item.category || '').toLowerCase();
  if (cat.includes('gem') || cat.includes('loose gemstone')) {
    return true;
  }

  // 3. Matched product specification
  const matchedProd = products.find(
    (p) => p.id === item.productId || (item.itemCode && p.itemCode === item.itemCode)
  );
  if (matchedProd) {
    if (
      matchedProd.gemstoneType &&
      matchedProd.gemstoneType.trim() !== '' &&
      matchedProd.gemstoneType !== 'None'
    ) {
      return true;
    }
    if ((matchedProd.gemWeightCarats && matchedProd.gemWeightCarats > 0) || (matchedProd.gemstoneDetails?.carats && matchedProd.gemstoneDetails.carats > 0)) {
      return true;
    }
    const pCat = (matchedProd.category || '').toLowerCase();
    if (pCat.includes('gem') || pCat.includes('loose gemstone')) {
      return true;
    }
  }

  // 4. Keyword detection in name
  const name = (item.name || '').toLowerCase();
  const gemKeywords = [
    'sapphire',
    'padparadscha',
    'ruby',
    'emerald',
    'diamond',
    'alexandrite',
    'cat\'s eye',
    'spinel',
    'tourmaline',
    'topaz',
    'amethyst',
    'aquamarine',
    'garnet',
    'moonstone',
    'zircon',
    'gemstone',
    'gem',
  ];

  return gemKeywords.some((keyword) => name.includes(keyword));
};

/**
 * Retrieve all gemstone items from a given invoice
 */
export const getGemItemsFromInvoice = (
  invoice: Invoice,
  products: Product[]
): InvoiceItem[] => {
  if (!invoice || !invoice.items) return [];
  return invoice.items.filter((item) => isGemItem(item, products));
};

/**
 * Check if an invoice is a gemstone sales invoice (contains at least one gemstone item)
 */
export const isGemSalesInvoice = (
  invoice: Invoice,
  products: Product[]
): boolean => {
  if (!invoice || !invoice.items || invoice.items.length === 0) return false;
  return getGemItemsFromInvoice(invoice, products).length > 0;
};
