# IRIS – SOC Dashboard (React + Vite + Three.js)

Always opens in **light mode**; the toggle button in the header switches to dark (not saved between visits).

## Run locally
    npm install
    npm run dev        # http://localhost:5173

## Deploy to Netlify

**Option A – Git (recommended)**
1. Push this folder to GitHub.
2. Netlify → Add new site → Import from Git → pick the repo.
3. Build settings are read from `netlify.toml` (`npm run build`, publish `dist`). Click Deploy.

**Option B – Drag & drop**
1. Netlify → Add new site → Deploy manually.
2. Drag the prebuilt **`dist`** folder (not the project root) onto the page.

## Structure
- `src/App.jsx` – dashboard UI
- `src/useSim.js` – simulated live traffic feed (swap `tick()` for a real API / WebSocket)
- `src/scene.js`, `src/Hero3D.jsx` – Three.js iris visual
- `src/styles.css` – light/dark theme variables and styles
- `src/data.js` – attack types and MITRE mapping
