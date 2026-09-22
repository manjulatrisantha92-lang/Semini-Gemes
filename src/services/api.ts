/**
 * API Service for WCS Inventory Invoice
 * Bridges frontend UI with backend / Vercel Serverless Functions / MongoDB Atlas.
 * When deployed to Vercel with MongoDB Atlas, set VITE_USE_REMOTE_API="true" and MONGODB_URI.
 * In local preview mode, seamlessly fall back to client storage.
 */

import { StorageService } from './storage';
import { Product, Invoice, Customer, WorkshopOrder, Certificate } from '../types';

const USE_REMOTE_API = Boolean((import.meta as unknown as { env?: { VITE_USE_REMOTE_API?: string } })?.env?.VITE_USE_REMOTE_API === 'true');
const API_BASE = '/api';

export const ApiService = {
  // Products
  async getProducts(): Promise<Product[]> {
    if (USE_REMOTE_API) {
      const res = await fetch(`${API_BASE}/products`);
      return res.json();
    }
    return StorageService.getProducts();
  },

  async createProduct(product: Product): Promise<Product> {
    if (USE_REMOTE_API) {
      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      return res.json();
    }
    StorageService.addProduct(product);
    return product;
  },

  // Invoices
  async createInvoice(invoice: Invoice): Promise<Invoice> {
    if (USE_REMOTE_API) {
      const res = await fetch(`${API_BASE}/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoice),
      });
      return res.json();
    }
    StorageService.addInvoice(invoice);
    return invoice;
  },

  // Certificates
  async createCertificate(cert: Certificate): Promise<Certificate> {
    if (USE_REMOTE_API) {
      const res = await fetch(`${API_BASE}/certificates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cert),
      });
      return res.json();
    }
    StorageService.addCertificate(cert);
    return cert;
  },

  // Workshop Orders
  async createWorkshopOrder(order: WorkshopOrder): Promise<WorkshopOrder> {
    if (USE_REMOTE_API) {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
      return res.json();
    }
    StorageService.addWorkshopOrder(order);
    return order;
  },
};
