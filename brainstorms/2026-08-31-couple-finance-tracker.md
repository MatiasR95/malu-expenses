# Couple Real-Time Finance Tracker: Brainstorm / Discovery Notes
Date: 2026-08-31 · Goal: Design and build a live-synced, Apple-inspired personal finance & expense tracking app for Matias and Belu with rich animations and automated income transfer tracking.

## Summary / Key Decisions
- **Target Audience & Users**: **Mati** and **Belu** (team couple finance model).
- **Devices**: Both use **iPhones (iOS)** with live real-time sync.
- **Financial Model**: Single unified household account & cashflow (team approach).
  - All incomes & expenses pool into a shared total cashflow / balance.
  - Expenses record who logged them (Mati vs Belu) via sleek avatar tags.
- **Currency**: **Argentine Pesos ($ ARS)** with standard local formatting (`$ 1.250.000,00`).
- **Monthly Period**: Calendar month (1st of each month to end of month) with animated month selector and historical view.
- **Recurring Commitments (Gastos Fijos & Sueldo)**: Auto-recur engine for recurring monthly items (Alquiler, Expensas, Subscripciones, Assurant Salary) with status indicators (Pending / Paid).
- **Income Streams**:
  - *Assurant*: Fixed salary on Banco Galicia.
  - *Force Gym — Memberships*: Auto-classified by amount (\$45.000+), captures Amount, Date, and Payer Name.
  - *Force Gym — Supplements*: Auto-classified by amount (e.g. Protein Bar \$2.600, Creatine \$29.000), with product-level tagging.
  - Platforms: Mercado Pago (bulk), Cuenta DNI, Banco Galicia, Lemon.
- **Core Expense Categories**:
  1. 🥬 *Verdulería*
  2. 🍎 *Frutería*
  3. 🥩 *Carnicería*
  4. 🥚 *Huevos*
  5. 🛒 *Supermercado*
  6. 🏠 *Alquiler*
  7. 🏢 *Expensas*
  8. ⛽ *Combustible*
  9. 📱 *Subscripciones*
  10. 🥂 *Salidas*
  11. 💳 *Tarjetas*
  12. ➕ *Custom Category Creator* (custom names, SF icons, colors)
- **Look & Feel**: Apple-tier minimalist aesthetic, OLED deep black (`#000000`), frosted glass blur (`backdrop-blur-xl`), vibrant ambient card lighting.
- **Animations & Micro-interactions**:
  1. **Dynamic Island Live Sync Pill**: Morphing spring banner at the top whenever an expense/transfer is added or synced.
  2. **Apple Wallet Interactive Cards**: Tilt & spring physics for income sources and expense summaries.
  3. **Rolling Odometer Counters**: Numbers animate smoothly on balance changes.
  4. **Tactile Quick Add Sheet**: Bouncy numeric pad, category selector, haptic feedback, 2-second entry speed.
  5. **Premium SF Icons**: Meticulously designed icon set for categories, payment channels, and users.
- **Tech Stack**:
  - **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS + Framer Motion (spring physics) + Lucide / Apple SF Icons + Canvas Confetti.
  - **PWA**: Standalone iOS Home Screen support with offline-first caching.
  - **Live Real-time Sync**: Supabase Realtime / WebSocket channel sync + local-first reactive store (instant UI updates with background cloud sync).
  - **Automated Capture Engine**: Smart amount thresholds, receipt/clipboard OCR & text parser, iOS Shortcuts integration.

## Q&A Log

### Q1 — Mobile Platforms & Payment Ecosystem
- **Asked**: Phone OS for both users & platforms used for incoming transfers (Assurant & Force Gym).
- **Captured**:
  - Both users are on **iPhones (iOS)**.
  - Assurant salary arrives via **Banco Galicia**.
  - Force Gym income is spread across **Mercado Pago** (bulk), **Cuenta DNI**, **Banco Galicia**, and **Lemon**.
- **Implications & Architecture**:
  - Multi-channel capture for iOS (Shortcuts integration, screenshot OCR / text parser, email forwarding webhook).
- **Flags**: None.

### Q2 — Force Gym Income Mechanics & Categorization
- **Asked**: How gym fees vs supplements are differentiated, level of member tracking, and product tagging for supplements.
- **Captured**:
  - **Auto-categorization by amount**: Monthly fees start at \$45.000. Supplements have distinct price points (e.g. Protein Bar \$2.600, Creatine \$29.000). The app can use smart price bands/rules to auto-classify incoming transfers.
  - **Member logging**: App must capture **Amount, Date, and Name of who paid** (sender name extracted from the transfer receipt/notification).
  - **Product tagging**: Include product tags for supplements (e.g., Protein Bar, Creatine, Whey, etc.) with customizable product presets and prices.
- **Flags**: None.

### Q3 — Shared Expenses & Couple Dynamics
- **Asked**: Shared pool vs split tracking, logger attribution, and specific expense categories.
- **Captured**:
  - **Single Unified Account**: All money flows into a unified couple team cashflow.
  - **Logger Attribution**: Record who logged each expense (Mati / Belu) with quick 1-tap avatar selector.
  - **Categories**: Verdulería, Frutería, Carnicería, Huevos, Supermercado, Alquiler, Expensas, Combustible, Subscripciones, Salidas, Tarjetas, plus a Custom Category Creator.
- **Flags**: None.

### Q4 — Currency, Monthly Budgeting & Recurring Commitments
- **Asked**: Currency (ARS vs USD), recurring commitments handling, and monthly accounting period.
- **Captured**:
  - **Currency**: Purely **Argentine Pesos ($ ARS)**.
  - **Recurring Expenses / Income**: Auto-recur feature for fixed commitments (Alquiler, Expensas, Subscriptions, Salary).
  - **Monthly Period**: Standard calendar month starting on the **1st of every month**.
- **Flags**: None.

### Q5 — Apple Design, Animations & Micro-Interactions
- **Asked**: Aesthetic style (OLED vs Light), animation package, and icon preferences.
- **Captured**:
  - **OLED Dark Mode** as the primary signature aesthetic.
  - **All 4 animation systems + extra micro-animations**: Dynamic Island live sync pill, Apple Wallet interactive cards, rolling odometer numbers, and tactile Quick Add sheet.
  - **Icon quality**: High-priority SF-style iconography across all categories and channels.
- **Flags**: None.

### Q6 — Architecture, Tech Stack & User Profiles
- **Asked**: Tech stack selection, offline capabilities, and profile names.
- **Captured**:
  - User profiles: **Mati** and **Belu**.
  - Stack confirmed: React + TypeScript + Vite + Tailwind CSS + Framer Motion + Lucide + PWA + Supabase Realtime sync + Smart Transfer Ingestion.
- **Flags**: None.

## Open Flags (Pending Input)
- None. Ready for architecture implementation and scaffold.
