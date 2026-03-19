// src/api/client.ts — with token auto-refresh and graceful 401/403 handling
import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL
  : '/api';

export const api = axios.create({ baseURL: BASE });

// Always attach token from localStorage
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: any) => void; reject: (e: any) => void }> = [];

function processQueue(error: any, token: string | null = null) {
  failedQueue.forEach(p => error ? p.reject(error) : p.resolve(token));
  failedQueue = [];
}

api.interceptors.response.use(
  res => res,
  async err => {
    const status = err.response?.status;
    const originalRequest = err.config;

    // 401 = expired token → try Supabase refresh
    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh via Supabase REST
        const supabaseUrl = 'https://pmqvoluuqmurruedohic.supabase.co';
        const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtcXZvbHV1cW11cnJ1ZWRvaGljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMTUxNTEsImV4cCI6MjA4ODg5MTE1MX0.8TbCVz2JpHQliI1p0HyM3j53RzKlxaDff6jhdfWDFLA';
        const refreshToken = localStorage.getItem('refresh_token');

        if (refreshToken) {
          const r = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'apikey': anonKey },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });
          if (r.ok) {
            const data = await r.json();
            localStorage.setItem('token', data.access_token);
            if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token);
            // Update stored user role if returned
            api.defaults.headers.common.Authorization = `Bearer ${data.access_token}`;
            processQueue(null, data.access_token);
            originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
            isRefreshing = false;
            return api(originalRequest);
          }
        }
        throw new Error('Refresh failed');
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        isRefreshing = false;
        // Clear session and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      }
    }

    // 403 = bad_jwt or permissions — log clearly, don't loop
    if (status === 403) {
      const detail = err.response?.data?.detail || '';
      if (detail.includes('bad_jwt') || detail.includes('JWT') || detail.includes('expired')) {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(err);
  }
);

export default api;

// SSE streaming helper
export async function* streamSSE(url: string, body: object, token: string): AsyncGenerator<string> {
  const base = import.meta.env.VITE_API_URL || '/api';
  const resp = await fetch(base + url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  if (!resp.ok) throw new Error(`API error: ${resp.status}`);
  const reader = resp.body!.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop() ?? '';
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const payload = line.slice(6).trim();
        if (payload === '[DONE]') return;
        try { yield JSON.parse(payload).text ?? ''; } catch { /* skip */ }
      }
    }
  }
}
