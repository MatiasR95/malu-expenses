# 📱 Mati & Belu · Live Couple Finance App
### Official Handover & Technical Architecture Documentation
*Engineered under the **MALU · AI Solutions** Visual System (`Where your time matters`)*

---

## 🎯 1. Executive Summary & Purpose

This application is a live, real-time couple finance tracker designed specifically for **Matias (Mati)** and **Belen (Belu)**. It tracks household cash flow as a unified team, eliminates receipt-logging friction, and is crafted following **Apple-tier / Linear-grade** dark-mode UI standards on a clean, solid OLED black canvas.

- **Primary Users**:
  - ⚡ **Mati**: Force Gym owner & Tech Lead.
  - ✨ **Belu**: Admin & Household Lead.
- **Language**: 100% US English.
- **Background**: Solid pitch-black OLED (`#07080B`) for a distraction-free, pure modern look.
- **Currency**: Argentine Pesos (`$ ARS`) formatted with US commas and compact abbreviations (e.g. `$ 45,000`, `$ 380k`, `$ 1.5M`).
- **Live Travel Benchmark**: Real-time Dólar Blue currency converter (`1 USD = $ 1,350 ARS`).

---

## 💰 2. Income & Business Structure

The household operates on a unified team balance with two primary income drivers:

1. **Force Gym HQ**:
   - **Monthly Membership Dues**: Starting at **$45,000 ARS** (mostly paid between the 1st and 10th of each month).
   - **Regular Members Roster**: *Lucas Fernandez, Camila Rodriguez, Gonzalo Rossi, Julian Castro, Agustin Navarro, Federico Perez, Sofia Romero, Mariano Benitez*.
   - **Supplement Store**: Protein Bars ($2,600), Creatine Monohydrate ($29,000), Whey Protein ($42,000), Explosive Pre-Workout ($25,000), Electrolyte Drinks ($1,800).
   - **Payment Platforms**: Mercado Pago (primary), Cuenta DNI (BAPRO), Lemon Cash, and Banco Galicia.
2. **Corporate Base Salary**:
   - Assurant corporate base salary deposited directly into Banco Galicia.

---

## 📅 3. Key Recurring Commitments & Deadlines

The app features an automated **Upcoming Deadlines Radar** tracking key fixed dates:

| Due Day | Obligation | Category | Typical Amount | Description |
| :--- | :--- | :--- | :--- | :--- |
| **7th** | **Fer Giveback** | `gym_operacion` | `$ 250,000` | Profit share / giveback to business partner Fer |
| **10th** | **Apartment Rent & Garage** | `alquiler` | `$ 380,000` | Monthly apartment rent and garage lease |
| **15th** | **Building HOA Maintenance** | `expensas` | `$ 65,000` | Monthly building administration expenses |
| **18th** | **Fiber Internet & Subscriptions** | `subscripciones` | `$ 32,000` | High-speed fiber internet + Spotify / iCloud |
| **Month-End (30/31st)** | **Force Gym Staff Payroll** | `gym_operacion` | `$ 450,000` | Monthly trainer & gym employee salaries |

---

## 🎨 4. Design System & Brand Identity (MALU Standards)

### Official Palette
- **Background**: Pure `#07080B` (*Negro Profundo*)
- **Primary Text**: `#E9EBEE` (*Papel Apagado*)
- **Primary Accent**: `#155EEF` (*Azul Señal*) & `#8FB0FA` (*Azul Aclarado*)
- **Micro-Jewel Node**: `#C9A227` (*Oro Joya* - 6px glowing golden dot `●` on titles)
- **Secondary Surfaces**: Solid matte dark `#0d0f14` with subtle border `rgba(255, 255, 255, 0.08)`

### Typography Hierarchy
- **Display & Headings**: `Plus Jakarta Sans` (800 weight) / `Outfit` (`letter-spacing: -0.035em`, `line-height: 1.15`).
- **Body & Captions**: `Plus Jakarta Sans` / `Inter` (500 / 600 weight, `line-height: 1.55`).
- **Numbers**: Tabular digits (`font-variant-numeric: tabular-nums`) across all metrics. Zero monospace fonts.

### Component Architecture
- **Double-Bezel Hardware Enclosure (Doppelrand)**: Outer card (`rounded-[28px]`, `p-1`) + inner core (`rounded-[25px]`, `p-5 sm:p-6`) creating a physical machined titanium look.
- **Tactile Touch Targets**: Minimum 44px with spring-loaded physical press feedback (`active:scale-[0.97]`).
- **Responsive Top Header**: Left user switch + Center month stepper + Right tool buttons with zero overflow on small mobile screens.

---

## 🚀 5. Core Feature Specifications

### A. Credit Card Smart Statement & Multi-Category Splitter
- **Problem**: Credit cards are paid in a single lump sum, obscuring granular category analysis.
- **Solution**: Paste raw statement text (e.g. *"Coto $120.000, YPF $55.000, Sushi $38.000, Netflix $22.000"*). The heuristic parser automatically splits the bill into individual category expense records (`supermercado`, `combustible`, `salidas`, `subscripciones`) with 1-click batch import.

### B. 1-Tap Force Gym Member Dues Speed Dial
- Instant check-in bar on the Force Gym tab. Tap any regular member name (*Lucas, Camila, Gonzalo...*) to instantly log their **$45,000** monthly dues with celebratory confetti and haptics.

### C. Zero-Touch Bank Transfer Sync & Webhook Bridge
- Simulated daemon and webhook endpoint (`https://api.couplefinance.live/v1/webhook/...`) for receiving automated iOS Shortcuts / Android notification webhooks from Mercado Pago, Cuenta DNI, Lemon Cash, and Galicia.

### D. TVA Sacred Timeline & Stability Index
- Visual pacing bar calculating real-time budget burn rate vs days elapsed, generating a **Timeline Stability Score** (`98.4% Stable`).
- Animated **Miss Minutes (Loki TVA)** mascot providing witty, southern TVA voice lines and upcoming due date reminders.

### E. Live Dólar Blue Travel Converter
- Live USD/ARS rate calculator ($1,350) with preset trip quick-buttons.
- Ambient travel destinations connecting directly to savings goals for Chicago and Orlando Universal/Disney.

---

## 📂 6. Directory Structure & File Map

```
c:\Users\Matia\Documents\antigravity\
├── public/
│   ├── characters/
│   │   └── miss-minutes.svg         # Official vector mascot for Miss Minutes TVA
│   └── fonts/                       # Local font fallbacks
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── CategoryIcon.tsx     # Dynamic Lucide icon renderer for categories
│   │   │   ├── Interactive3DCard.tsx # Framer-motion 3D perspective tilt
│   │   │   ├── MissMinutesWidget.tsx # Authentic Miss Minutes TVA guide
│   │   │   └── RollingNumber.tsx    # Animated tabular rolling odometer counter
│   │   ├── dashboard/
│   │   │   ├── CurrencyConverterWidget.tsx # Live Dolar Blue travel converter
│   │   │   ├── GastosFijosDrawer.tsx # Fixed recurring checklist
│   │   │   ├── GymCapacityGauge.tsx # Force Gym revenue & member milestone gauge
│   │   │   ├── HomeWelcomeBanner.tsx # Dynamic greeting, Celsius weather & deadline alert
│   │   │   ├── SacredTimelineBar.tsx # TVA stability score & spending orbit
│   │   │   └── SpendingVelocityMeter.tsx # Budget consumption vs time elapsed
│   │   ├── expenses/
│   │   │   └── ExpenseList.tsx      # Filterable category pills & search ledger
│   │   ├── layout/
│   │   │   ├── BottomTabBar.tsx     # Floating Apple dock with elevated '+' button
│   │   │   ├── DynamicIslandPill.tsx # Apple Dynamic Island live event banner
│   │   │   ├── Header.tsx           # Responsive user switcher (Mati/Belu) & Month navigator
│   │   │   └── TravelBackgroundSlideshow.tsx # Pure black OLED background
│   │   ├── modals/
│   │   │   ├── AutomatedBankSyncModal.tsx # Zero-touch webhook & platform simulator
│   │   │   ├── CreditCardSplitterModal.tsx # Multi-category credit card parser
│   │   │   ├── CustomCategoryModal.tsx # Custom category builder with icon/color picker
│   │   │   ├── EditExpenseModal.tsx # CRUD transaction editor & delete modal
│   │   │   ├── iOSShortcutGuideModal.tsx # iOS Shortcuts & PWA installation guide
│   │   │   ├── ManageCategoriesModal.tsx # Monthly budget targets manager
│   │   │   ├── QuickAddModal.tsx    # Dual-mode quick add sheet (Expense vs Gym Income)
│   │   │   └── SmartTransferModal.tsx # Inbound transfer parser & tester
│   │   └── screens/
│   │       ├── HomeScreen.tsx       # Master dashboard & live activity stream
│   │       ├── IncomeDashboardScreen.tsx # Force Gym command center & store
│   │       ├── ExpenseAnalyticsScreen.tsx # Category distribution & budgets
│   │       └── GoalsScreen.tsx      # Couple savings jars & dream travel vault
│   ├── context/
│   │   └── FinanceContext.tsx       # State management, CRUD actions & sync
│   ├── data/
│   │   └── initialData.ts           # Categories, supplements, goals & recurring rules
│   ├── types/
│   │   └── finance.ts               # Domain TypeScript interfaces
│   ├── utils/
│   │   ├── currency.ts              # ARS formatting, month parsing & compact numbers
│   │   └── transferParser.ts        # Smart transfer regex parser
│   ├── App.tsx                      # Root component orchestrating screens & modals
│   ├── main.tsx                     # React DOM entry point
│   └── index.css                    # Tailwind CSS imports, fonts & animations
├── index.html                       # PWA meta tags & Google Web Fonts
├── package.json                     # Dependencies & build scripts
├── vite.config.ts                   # Vite configuration
└── PROJECT_OVERVIEW.md              # Documentation file
```

---

## 🛠️ 7. Development & Build Commands

```bash
# Start local development server (with network access for iPhone)
npm run dev -- --host

# Run TypeScript check & production build
npm run build

# Preview production build locally
npm run preview
```

---

## 🔒 8. State Persistence & Multi-Device Live Sync

- **Storage**: Persisted locally via `localStorage` under `couple_finance_*_v4`.
- **Live Sync**: Uses `BroadcastChannel('couple_finance_sync_v2')` to sync updates immediately across open browser tabs, mobile PWA instances, and desktop windows.
