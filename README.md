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

GitHub Pages only serves static files — it cannot run `server.ts`. That means the Gemini AI insights/chat and the Pluggy Open Finance sync will not work on the Pages deployment, since those go through the Express backend. To get those features live, deploy `server.ts` to a Node host (e.g. Render, Railway, Fly.io) with `GEMINI_API_KEY`, `PLUGGY_CLIENT_ID`, and `PLUGGY_CLIENT_SECRET` set as environment variables, then point the frontend at that API.
