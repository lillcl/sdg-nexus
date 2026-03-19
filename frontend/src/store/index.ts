// src/store/index.ts
import { create } from 'zustand';
import type { User, CountryData } from '@/types';

// ── Branding store ────────────────────────────────────────────────────────────
export interface BrandingConfig {
  appName: string;
  tagline: string;
  subtagline: string;
  footerNote: string;
  stats: { countries: string; avgScore: string; indicators: string; targets: string };
  ctaExplore: string;
  ctaLearn: string;
}

const DEFAULT_BRANDING: BrandingConfig = {
  appName: 'SDG Nexus',
  tagline: 'A comprehensive platform for exploring, learning and advocating for the UN Sustainable Development Goals.',
  subtagline: 'Powered by SDSN Sustainable Development Report 2025 · 193 countries · 126 indicators',
  footerNote: 'AI for Global Language · AI for Science · AI for SDGs',
  stats: { countries: '193', avgScore: '68.1', indicators: '126', targets: '169' },
  ctaExplore: 'Explore the Map',
  ctaLearn: 'Learn the SDGs',
};

function loadBranding(): BrandingConfig {
  try { const r = localStorage.getItem('branding'); return r ? { ...DEFAULT_BRANDING, ...JSON.parse(r) } : DEFAULT_BRANDING; }
  catch { return DEFAULT_BRANDING; }
}

interface BrandingStore {
  branding: BrandingConfig;
  setBranding: (b: Partial<BrandingConfig>) => void;
  resetBranding: () => void;
}

// Fetch branding from backend (called once at app startup)
export async function syncBrandingFromServer() {
  try {
    const base = (import.meta as any).env?.VITE_API_URL || '/api';
    const r = await fetch(`${base}/settings/branding`);
    if (r.ok) {
      const data = await r.json();
      if (data && data.appName) {
        localStorage.setItem('branding', JSON.stringify(data));
        useBrandingStore.getState().setBranding(data);
      }
    }
  } catch { /* silent — use localStorage fallback */ }
}

export const useBrandingStore = create<BrandingStore>((set) => ({
  branding: loadBranding(),
  setBranding: (b) => set(s => {
    const next = { ...s.branding, ...b };
    localStorage.setItem('branding', JSON.stringify(next));
    return { branding: next };
  }),
  resetBranding: () => { localStorage.removeItem('branding'); set({ branding: DEFAULT_BRANDING }); },
}));

// Rehydrate user from localStorage
function loadUser(): User | null {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

interface AuthStore {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: loadUser(),
  token: localStorage.getItem('token'),
  setAuth: (user, token, refreshToken?: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  },
}));

interface MapStore {
  selectedGoal: number | null;
  selectedCountry: string | null;
  countryData: Record<string, CountryData>;
  tooltip: { visible: boolean; name: string; score: number | null; x: number; y: number };
  setSelectedGoal: (g: number | null) => void;
  setSelectedCountry: (iso3: string | null) => void;
  setCountryData: (data: Record<string, CountryData>) => void;
  setTooltip: (t: Partial<MapStore['tooltip']>) => void;
}

export const useMapStore = create<MapStore>((set) => ({
  selectedGoal: null,
  selectedCountry: null,
  countryData: {},
  tooltip: { visible: false, name: '', score: null, x: 0, y: 0 },
  setSelectedGoal: (selectedGoal) => set({ selectedGoal }),
  setSelectedCountry: (selectedCountry) => set({ selectedCountry }),
  setCountryData: (countryData) => set({ countryData }),
  setTooltip: (t) => set((s) => ({ tooltip: { ...s.tooltip, ...t } })),
}));
