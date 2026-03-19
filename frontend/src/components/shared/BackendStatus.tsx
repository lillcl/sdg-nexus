// Renders a "backend waking up" banner when API is cold-starting
import { useState, useEffect } from 'react';
import api from '@/api/client';

interface Props {
  onReady?: () => void;
  children: React.ReactNode;
}

export function BackendGuard({ onReady, children }: Props) {
  const [status, setStatus] = useState<'checking'|'ready'|'waking'|'offline'>('checking');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let tries = 0;
    const maxTries = 12; // 12 × 5s = 60s max

    const check = async () => {
      try {
        await api.get('/health', { timeout: 6000 } as any);
        if (!cancelled) { setStatus('ready'); onReady?.(); }
      } catch {
        tries++;
        if (!cancelled) {
          if (tries === 1) setStatus('waking');
          else setAttempt(tries);
          if (tries < maxTries) setTimeout(check, 5000);
          else setStatus('offline');
        }
      }
    };
    check();
    return () => { cancelled = true; };
  }, []);

  if (status === 'ready') return <>{children}</>;

  return (
    <div className="min-h-[200px] flex flex-col items-center justify-center p-8 text-center">
      {status === 'offline' ? (
        <div className="space-y-3">
          <div className="text-3xl">⚠️</div>
          <p className="text-slate-400 text-sm">Backend is offline. Check Render.com deployment.</p>
          <button onClick={() => { setStatus('checking'); setAttempt(0); }}
            className="px-4 py-2 bg-blue-600 text-white text-xs rounded-xl hover:bg-blue-500">Retry</button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"/>
          <p className="text-slate-400 text-sm">
            {status === 'checking' ? 'Connecting to backend…' : 'Backend is waking up on Render (free tier)…'}
          </p>
          {attempt > 1 && <p className="text-slate-600 text-xs">Attempt {attempt}/12 — may take up to 60s on first load</p>}
          <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${Math.min(100, (attempt/12)*100)}%` }}/>
          </div>
        </div>
      )}
    </div>
  );
}
