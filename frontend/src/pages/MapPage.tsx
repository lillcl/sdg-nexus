// src/pages/MapPage.tsx
import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import api from '@/api/client';
import { useMapStore } from '@/store';
import WorldMap from '@/components/WorldMap/WorldMap';
import { MapControls } from '@/components/WorldMap/MapControls';
import { MapLegend } from '@/components/WorldMap/MapLegend';
import { MapTooltip } from '@/components/WorldMap/MapTooltip';
import CountryPanel from '@/components/WorldMap/CountryPanel';
import type { CountryData } from '@/types';
import { EMBEDDED_SDG_DATA } from '@/data/sdr2025';

export default function MapPage() {
  const { setCountryData, countryData, setSelectedCountry } = useMapStore();
  const [backendStatus, setBackendStatus] = useState<'pending'|'ok'|'offline'>('pending');
  const [ready, setReady] = useState(false);
  const [mapSearch, setMapSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (Object.keys(countryData).length === 0) {
      setCountryData(EMBEDDED_SDG_DATA as Record<string, CountryData>);
    }
    // Small delay to let layout settle before SVG measures itself
    const t = setTimeout(() => setReady(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    api.get('/map/countries')
      .then(r => {
        const map: Record<string, CountryData> = {};
        (r.data as CountryData[]).forEach(c => { map[c.iso3] = c; });
        setCountryData(map);
        setBackendStatus('ok');
      })
      .catch(() => setBackendStatus('offline'));
  }, []);

  const hasData = Object.keys(countryData).length > 0;

  const handleSearch = (q: string) => {
    setMapSearch(q);
    if (!q.trim()) { setSearchResults([]); return; }
    const lower = q.toLowerCase();
    const results = Object.values(countryData)
      .filter(c => c.name.toLowerCase().includes(lower) || c.iso3.toLowerCase().includes(lower))
      .slice(0, 8);
    setSearchResults(results);
  };


  return (
    <div
      ref={containerRef}
      style={{ position: 'absolute', inset: 0, background: '#080c14', overflow: 'hidden' }}
    >
      {backendStatus !== 'pending' && (
        <div className={`absolute top-3 left-1/2 -translate-x-1/2 z-40 text-[10px] font-mono px-3 py-1 rounded-full ${
          backendStatus === 'ok'
            ? 'bg-green-900/70 text-green-400 border border-green-700'
            : 'bg-slate-800/70 text-slate-500 border border-slate-700'
        }`}>
          {backendStatus === 'ok' ? '● Live data' : '● SDR 2025 — 193 countries'}
        </div>
      )}
      {/* Search box */}
      {hasData && (
        <div className="absolute top-14 right-4 z-40 w-64">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input value={mapSearch} onChange={e => handleSearch(e.target.value)}
              placeholder="Search country…"
              className="w-full bg-[#0a1525]/90 border border-slate-700 text-white text-xs rounded-xl pl-8 pr-8 py-2 focus:outline-none focus:border-blue-500 placeholder:text-slate-500 backdrop-blur"/>
            {mapSearch && (
              <button onClick={() => { setMapSearch(''); setSearchResults([]); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                <X size={12}/>
              </button>
            )}
          </div>
          {searchResults.length > 0 && (
            <div className="mt-1 bg-[#0a1525]/95 border border-slate-700 rounded-xl overflow-hidden shadow-2xl backdrop-blur">
              {searchResults.map(c => (
                <button key={c.iso3} onClick={() => { setSelectedCountry(c.iso3); setMapSearch(''); setSearchResults([]); }}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-800/60 transition-colors text-left border-b border-slate-800/50 last:border-0">
                  <span className="text-white text-xs font-medium">{c.name}</span>
                  <span className="text-slate-500 text-[10px] font-mono">{c.iso3}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {hasData && ready && (
        <>
          <WorldMap />
          <MapControls />
          <MapLegend />
          <CountryPanel />
          <MapTooltip />
        </>
      )}
    </div>
  );
}
