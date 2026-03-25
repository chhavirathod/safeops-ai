# CircleAI 
## File Structure

```
src/
  lib/
    supabaseClient.js     ← Supabase init (just works)
  pages/
    HomePage.jsx          ← Landing page
    LoginPage.jsx         ← Google OAuth login
    DashboardPage.jsx     ← Dashboard shell (customize per PS)
  App.jsx                 ← Routes: / → /login → /dashboard
```

## Per Problem Statement – What to Swap in DashboardPage.jsx

### ML PS 1 – Traceability Management
- NAV_ITEMS: Overview, Material Flow, Processing, Dispatch, Reports
- Main viz: Material lifecycle Sankey / flow chart
- Stats: Total kg processed, Batches today, Dispatch pending, Quality score
- Right panel: Recent material entries

### ML PS 2 – Restaurant Oracle
- NAV_ITEMS: Overview, Social Feed, SWOT, Competitors, Alerts
- Main viz: Sentiment timeline chart (recharts LineChart)
- Stats: Mentions today, Avg rating, Negative alerts, Confidence score
- Right panel: Live alert feed from model

### AI PS 1 – Plastic Identification
- NAV_ITEMS: Overview, Upload Image, Classifications, History, Reports
- Main viz: Image upload + classified result display
- Stats: Items scanned, Accuracy %, Misclassified, PET / HDPE breakdown
- Right panel: Classification confidence scores

### AI PS 2 – PPE Compliance
- NAV_ITEMS: Overview, Live Feed, Violations, Workers, Reports
- Main viz: Video feed with bounding boxes (img tag / canvas)
- Stats: Workers detected, Compliant, Violations, Compliance %
- Right panel: Violation alerts with timestamps

## Connecting Your ML Model

All model hooks are in `DashboardPage.jsx`. Look for comments like:
```
// ← Hook: Replace with live model status badge
// Plug in your AI/ML model output here
```

Use a simple fetch/axios call to your FastAPI/Flask backend:
```js
const res = await fetch('http://localhost:8000/predict', {
  method: 'POST',
  body: formData
})
const result = await res.json()
```
