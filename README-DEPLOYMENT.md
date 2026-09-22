# WCS Inventory Invoice - Deployment & Architecture Guide

A modern, responsive Sri Lankan Jewelry, Gemstone & Workshop Business Management System built with **React**, **Tailwind CSS**, and prepared for **MongoDB Atlas**, **GitHub**, and **Vercel**.

---

## 1. Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion
- **Hosting**: Vercel (Single Page App + Serverless Functions)
- **Database**: MongoDB Atlas with Mongoose Schemas (see `src/models/mongooseSchemas.ts`)
- **Repository**: GitHub
- **Print Engine**: Responsive A4 High-Fidelity CSS Print Layouts with JPG Letterhead and Certificate Template Overlay Support

---

## 2. MongoDB Atlas Collections Prepared

1. `users` — User profiles & authentication credentials
2. `roles` — Role definitions (`admin`, `owner`, `user`)
3. `products` — Complete jewelry and gemstone inventory
4. `categories` — Product categories
5. `customers` — Customer CRM records with Sri Lankan NIC and WhatsApp
6. `workshops` — External and in-house jewelry manufacturing workshops
7. `workshop_employees` — Craftspeople, stone setters, wax carvers, filigree artists
8. `orders` & `order_items` — Custom jewelry creation orders with JPG graph/sketch designs
9. `completed_orders` — Archive of finished orders
10. `cancelled_orders` — Records of cancelled orders with reasons
11. `invoices` & `invoice_items` — Retail sales and POS invoices
12. `invoice_returns` — Credit notes and returned stock entries
13. `purchase_orders` & `purchase_items` — Inward supplier stock purchases
14. `purchase_returns` — Damaged/returned raw gemstones or gold bullion
15. `workshop_advances` — Advance material and wage payments to workshops
16. `employee_payments` — Artisan payroll and piece-rate vouchers
17. `promotions` — WhatsApp campaigns and Facebook promotion links
18. `settings` — Sri Lankan company branding, logo JPG, invoice background JPG, certificate JPG
19. `backup_logs` — System database backup and restore audit logs

---

## 3. Environment Variables

Create a `.env` or set in Vercel Environment Variables:

```bash
# MongoDB Atlas Connection
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/wcs_inventory?retryWrites=true&w=majority"

# Optional Remote API Switch
VITE_USE_REMOTE_API="false" # Set to "true" when connecting to Vercel Serverless Functions
```

---

## 4. Deploying to GitHub & Vercel

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit: WCS Inventory Invoice System"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/wcs-inventory-invoice.git
git push -u origin main
```

### Step 2: Deploy to Vercel
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** -> **Project** -> Import your GitHub repository.
3. Keep Framework Preset as **Vite**.
4. Add environment variables (e.g. `MONGODB_URI` if connecting to MongoDB Atlas).
5. Click **Deploy**.
