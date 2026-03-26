# SafeOpsAI — Full Stack PPE Compliance Platform

A cinematic React homepage + full supervisor dashboard with Google OAuth via Supabase.

## 📁 Complete Folder Structure

```
safeops-ai/
├── index.html
├── package.json
├── vite.config.js
├── .env.example            ← Copy to .env and fill keys
├── .gitignore
└── src/
    ├── main.jsx
    ├── App.jsx               # Router: / → /login → /dashboard
    ├── ProtectedRoute.jsx    # Auth guard
    ├── index.css             # Global styles + CSS variables
    │
    ├── lib/
    │   ├── supabase.js       # Supabase client + auth helpers
    │   ├── AuthContext.jsx   # React context for session
    │   └── mockData.js       # Hardcoded ML output + API endpoint
    │
    ├── pages/
    │   └── LoginPage.jsx     # Cinematic login with Google OAuth
    │
    ├── dashboard/
    │   ├── DashboardPage.jsx # Main shell with tab routing
    │   ├── Sidebar.jsx       # Icon sidebar with nav
    │   ├── Header.jsx        # Status bar with live clock
    │   ├── OverviewTab.jsx   # KPIs, trend chart, donut, radar, alerts
    │   ├── LiveAndZoneTabs.jsx # Live feed canvas + heatmap
    │   └── WorkerTabs.jsx    # Violations, Workers, Analytics tabs
    │
    └── components/           # Homepage components (unchanged)
        ├── LoadingScreen.jsx
        ├── CustomCursor.jsx
        ├── Navbar.jsx
        ├── HeroSection.jsx
        ├── HeroCanvas.jsx
        ├── ProblemSection.jsx
        ├── SolutionSection.jsx
        ├── DigitalTwinSection.jsx
        └── Sections.jsx
```

## 🚀 Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure Supabase
1. Create a project at https://supabase.com
2. Enable Google OAuth in Authentication → Providers
3. Set redirect URL to `http://localhost:5173/dashboard`
4. Copy `.env.example` → `.env` and fill in your keys

### 3. Run
```bash
npm run dev
# Open http://localhost:5173
```

## 🔐 Auth Flow
```
/ (Homepage) → "Enter Dashboard" → /login → Google OAuth → /dashboard
```
- Sessions persist via Supabase cookies
- `/dashboard` is protected — unauthenticated users redirect to `/login`
- Sign out returns to `/login`

## 📊 Dashboard Tabs

| Tab | Contents |
|---|---|
| **Overview** | KPI cards, compliance trend chart, zone donut, PPE radar, violation feed |
| **Live Feed** | Animated canvas showing worker positions with bounding boxes |
| **Violations** | Active violation cards + full log table with filters |
| **Workers** | Per-worker PPE status cards with risk scores |
| **Analytics** | Year-over-year charts, combined compliance+violations |
| **Zone Map** | Risk heatmap overlay on floor plan |

## 🔌 ML Model Integration

The dashboard currently uses hardcoded data from `src/lib/mockData.js`.
When your ML model is ready:

1. Set `VITE_ML_API_URL` in `.env` to your endpoint
2. The `fetchDetections()` function will auto-switch to live data

**Expected JSON format from model:**
```json
{
  "timestamp": "2025-01-15T14:32:11Z",
  "frame_id": 4821,
  "fps": 28.4,
  "model_version": "YOLOv8-safety",
  "persons": [
    {
      "id": "P1",
      "x": 142, "y": 315,
      "bbox": { "x1": 120, "y1": 260, "x2": 185, "y2": 380 },
      "area": "Zone A",
      "confidence": 0.971,
      "violations": [],
      "ppe_status": { "helmet": true, "vest": true, "gloves": true },
      "time_detected": "2025-01-15T14:02:11Z",
      "risk_score": 2
    }
  ]
}
```

## 🎨 Design System

| Token | Value |
|---|---|
| Background | `#050505` (near black) |
| Orange accent | `#FF6B1A` |
| Violation red | `#FF2D55` |
| Safe green | `#00C48C` |
| Zone blue | `#1A56FF` |
| Display font | Bebas Neue |
| Serif accent | Instrument Serif (italic) |
| Heading | Oswald |
| Body | Barlow Condensed |
| Mono/HUD | JetBrains Mono |


A premium, immersive React homepage for an AI-powered industrial safety platform.

## ✨ Features

- **Cinematic loading screen** — Yellow construction sign, animated progress bar, hazard stripes
- **Full 3D hero canvas** — Hand-drawn 3D helmet (left), cement truck (right), workers scene (center), warning sign — all with parallax depth
- **Perspective grid floor** — Industrial site feel with cinematic lighting shafts
- **Scroll-parallax 3D elements** — Objects zoom and drift with scroll
- **Animated detection canvas** — Bounding boxes appear in real-time, red/green coded
- **Live digital twin** — Top-down map with moving workers, zone overlays, minimap
- **Cinematic typography mix** — Bebas Neue (display) + Instrument Serif (italic accent) + Oswald (headings) + Barlow Condensed (body) + JetBrains Mono (UI/HUD)
- **Custom cursor** — Orange dot + lagged ring
- **Film grain + scanlines** — Atmospheric texture overlay
- **Black background** — Industrial dark theme throughout

## 📁 Folder Structure

```
safeops-ai/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx              # Entry point
    ├── App.jsx               # Root with loading gate
    ├── index.css             # All global styles + CSS variables
    └── components/
        ├── LoadingScreen.jsx   # Construction sign + progress
        ├── CustomCursor.jsx    # Orange dot cursor with ring
        ├── Navbar.jsx          # Fixed nav with scroll effect
        ├── HeroSection.jsx     # Full-viewport hero
        ├── HeroCanvas.jsx      # 3D canvas: helmet, truck, workers, sign
        ├── ProblemSection.jsx  # Problem + unmonitored worker feed
        ├── SolutionSection.jsx # Detection canvas with bounding boxes
        ├── DigitalTwinSection.jsx # Full-width live map
        └── Sections.jsx        # Features, Analytics, CTA, Footer
```

## 🚀 Setup & Run

```bash
# 1. Install dependencies
npm install

# 2. Run dev server
npm run dev

# 3. Open http://localhost:5173
```

## 🔗 Dashboard Integration

The "Enter Dashboard" and "Go to Dashboard" buttons route to `/dashboard`.
Make sure your router has this route registered, or update the onClick handlers in:
- `src/components/Navbar.jsx`
- `src/components/HeroSection.jsx`
- `src/components/Sections.jsx` (CTASection)

## 🔌 Backend Integration Points

| Location | What to replace |
|---|---|
| `HeroCanvas.jsx` — workers array | WebSocket live worker positions |
| `SolutionSection.jsx` — workers array | Real-time detection API response |
| `DigitalTwinSection.jsx` — workers array | Live tracking data stream |
| `Sections.jsx` — complianceData | `GET /api/analytics/monthly` |
| `Sections.jsx` — violations array | `GET /api/violations/recent` |
| `Sections.jsx` — KPI values | `GET /api/stats/daily` |

## 🎨 Typography System

| Font | Use |
|---|---|
| Bebas Neue | Display / Hero titles |
| Instrument Serif (italic) | Accent words in headings |
| Oswald | Section headings / card titles |
| Barlow Condensed | Body text / descriptions |
| JetBrains Mono | HUD data / labels / UI chrome |

## 🎬 Design Philosophy

Black background. Cinematic depth via perspective grids and layered Z-ordering.
3D objects rendered purely in Canvas 2D with projection math — no Three.js dependency needed.
Typography is intentionally mixed: industrial rigidity (Bebas/Oswald) broken by italic humanity (Instrument Serif).