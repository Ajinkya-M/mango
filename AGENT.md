# AI Agent Guidelines & Project Context — Mango

Welcome! This document provides essential project context, architecture constraints, and coordination guidelines for all AI agents (Gemini/Antigravity, Claude, Cursor, ChatGPT, etc.) working on this repository.

---

## 🚀 Project Overview
Mango is a high-end, mobile-first e-commerce storefront for ordering premium mango varieties, paired with an integrated Admin Dashboard.

- **Storefront URL**: `/` (Public access, login required for cart checkout)
- **Admin Portal URL**: `/admin` (Secure CRUD panel for managing product catalogs)

---

## 🛠️ Technology Stack
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS & Vanilla CSS (defined in `app/globals.css`)
- **Language**: TypeScript (strict mode)
- **Package Manager**: `pnpm` (Mandatory - do not use npm/yarn for installs)
- **Database/State Layer**: Client-side storage (`localStorage` & `sessionStorage`) with cross-tab reactive syncing.

---

## 💾 State & Synchronization Architecture
This project runs entirely on the client side using browser APIs for database storage, ensuring instant performance and zero setup requirements.

1. **Product Registry (`localStorage`)**:
   - Stored under key: `mango_products`.
   - Datatype: Array of `MangoVariety` objects.
   - Synchronized across storefront `/` and admin panel `/admin` in real-time via `window.addEventListener("storage", ...)` handlers.
2. **Admin Authentication (`sessionStorage`)**:
   - Token stored under key: `admin_auth_token`.
   - Keeps admin logged in per browser tab session.
3. **Cart State**:
   - Managed in React state inside the storefront controller (`app/page.tsx`).
   - Checkout deducts quantity from `localStorage["mango_products"]` stock levels.

---

## 🏷️ Mango Variety Data Structure
All items in the catalog must conform to the `MangoVariety` TypeScript interface:

```typescript
export interface MangoVariety {
  id: string;          // Unique URL-friendly slug (e.g., "alphonso")
  name: string;        // Display name
  origin: string;      // Country/region of origin
  flag: string;        // Unicode flag emoji (e.g., "🇮🇳")
  sweetness: number;   // Rating from 1 to 5 (float allowed)
  price: string;       // Display price string (e.g., "£24.99 / box (6 pcs)")
  pricePerBox: number; // Numeric price for cart totals calculation
  season: 'In Season' | 'Pre-order' | 'Coming Soon';
  color: string;       // Fruit SVG HEX color
  leafColor: string;   // Leaf SVG HEX color
  desc: string;        // Product description paragraph
  quantity?: number;   // Stock quantity (boxes remaining)
}
```

---

## 👤 Storefront Flow (`/`)
1. **Browse**: User can view available mangoes, prices, and stock indicators.
2. **Pre-selection / Login**: Clicking "Order Now" adds the item to a temporary cart and redirects to phone verification.
3. **Mock OTP Auth**: 
   - Enter mobile number with country code picker.
   - Verify using the mock test OTP code: **`123456`**.
4. **Inventory View**: Once logged in, the user lands on the dynamic inventory screen to add/remove mangoes.
5. **Cart / Checkout**:
   - Manage quantities (bounded by available stock).
   - Input delivery address.
   - Click "Place Order" (deducts stock from database dynamically).

---

## 🔐 Admin Portal Flow (`/admin`)
- **Login Credentials**:
  - **Username**: `admin`
  - **Password**: `admin123`
- **Analytics Metrics**: Shows total varieties, total boxes in stock, out-of-stock count, and total inventory value.
- **Product Registry (CRUD)**:
  - **Add Variety**: Creates a new mango with auto-slugified ID.
  - **Edit Variety**: Updates all descriptors, pricing, stock, colors, and metadata.
  - **Delete Variety**: Removes item with prompt verification.

---

## 📋 Rules & Constraints for AI Agents

### 1. File Modification Constraints
- Both `app/page.tsx` and `app/admin/page.tsx` **MUST** include `"use client"` at the top as they extensively use browser-specific storage APIs, event listeners, and react hooks.
- Retain the clean, light "Slate-Amber" palette (slate background, slate-900 text, amber-600/700 buttons & highlights). Avoid introducing miscellaneous, highly saturated brand colors.

### 2. Package Installations (from `CLAUDE.md`)
- If installing third-party packages, you **MUST** install stable versions that are **at least 12 months (1 year) old**.
- Verify package release dates using: `npm view <package-name> time --json` before installation.

### 3. Key Files Reference
- [Root Layout](file:///d:/Ajinkya/workspace/node-projects/mango/app/layout.tsx): Root layout wrapper.
- [Storefront Page](file:///d:/Ajinkya/workspace/node-projects/mango/app/page.tsx): Main client application router & checkout.
- [Admin Page](file:///d:/Ajinkya/workspace/node-projects/mango/app/admin/page.tsx): Management panel.
- [Global Styles](file:///d:/Ajinkya/workspace/node-projects/mango/app/globals.css): Tailored utilities & default variables.
- [Walkthrough](file:///C:/Users/ajink/.gemini/antigravity-ide/brain/491edc61-2bbf-4a19-9634-ad5a5bd4ffe3/walkthrough.md): Log of recent feature deliveries.
