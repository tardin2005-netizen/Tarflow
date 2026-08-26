// On GitHub Pages there is no backend at the same origin, so API calls need to be
// pointed at wherever server.ts is actually hosted (e.g. a Render web service).
// Set VITE_API_BASE_URL at build time (see .github/workflows/deploy-pages.yml) to
// the backend's URL. Locally (npm run dev) this stays empty and calls remain
// relative, hitting the same Express server that serves the frontend.
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}
