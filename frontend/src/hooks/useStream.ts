// src/hooks/useStream.ts
import { useState, useCallback } from 'react';
import { streamSSE } from '@/api/client';
import { useAuthStore } from '@/store';

export function useStream() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const token = useAuthStore((s) => s.token) ?? '';

  const run = useCallback(async (url: string, body: object) => {
    setText('');
    setError('');
    setLoading(true);
    try {
      for await (const chunk of streamSSE(url, body, token)) {
        setText((prev) => prev + chunk);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Generation failed');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const reset = () => { setText(''); setError(''); };

  return { text, loading, error, run, reset };
}
