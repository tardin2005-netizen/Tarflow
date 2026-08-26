<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/c6026023-df56-4456-832b-3eab3315920c

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## GitHub Pages

This repo auto-deploys the static frontend to GitHub Pages on every push to `main` (see `.github/workflows/deploy-pages.yml`). Enable it once in **Settings → Pages → Source → GitHub Actions**.

GitHub Pages only serves static files — it cannot run `server.ts`. That means the Gemini AI insights/chat, the live market tickers, and the Pluggy Open Finance sync will not work on the Pages deployment, since those go through the Express backend. To get those features live:

1. Deploy `server.ts` to a Node host (Render, Railway, Fly.io...). On Render, a `render.yaml` blueprint is included — create a new Blueprint instance pointing at this repo, and it will set up the build (`npm run build`) and start (`npm run start`) commands automatically. You'll be prompted to paste in `GEMINI_API_KEY` (and `PLUGGY_CLIENT_ID`/`PLUGGY_CLIENT_SECRET` if you use Open Finance) as secrets — Render never stores these in the repo.
2. Once deployed, copy the backend's public URL (e.g. `https://tarflow-backend.onrender.com`).
3. In this repo's GitHub Settings → Secrets and variables → Actions → Variables, add a repository variable named `VITE_API_BASE_URL` set to that URL (no trailing slash).
4. Push to `main` (or re-run the "Deploy static frontend to GitHub Pages" workflow) — the Pages build will bake that URL in, and the static frontend will call the Render backend for AI/market/Pluggy features instead of a relative path that doesn't exist on Pages.

Note: Render's free tier spins the service down after ~15 minutes of inactivity, so the first request after a while can take 30-60s to respond while it wakes up.
