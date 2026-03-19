// src/App.tsx — v24
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Header from '@/components/Layout/Header';
import { useBrandingStore } from '@/store';
import HomePage from '@/pages/HomePage';
import MapPage from '@/pages/MapPage';
import MUNPage from '@/pages/MUNPage';
import MUNCoordPage from '@/pages/MUNCoordPage';
import ClassroomPage from '@/pages/ClassroomPage';
import TournamentPage from '@/pages/TournamentPage';
import SDGTrendsPage from '@/pages/SDGTrendsPage';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import SDGPage from '@/pages/SDGPage';
import EventsPage from '@/pages/EventsPage';
import EventRegisterPage from '@/pages/EventRegisterPage';
import OrgNewsPage from '@/pages/OrgNewsPage';
import GamesPage from '@/pages/GamesPage';
import MUNLingoPage from '@/pages/MUNLingoPage';
import LeaderboardPage from '@/pages/LeaderboardPage';
import NewsPage from '@/pages/NewsPage';
import ResourcesPage from '@/pages/ResourcesPage';
import CalendarPage from '@/pages/CalendarPage';
import PartnershipsPage from '@/pages/PartnershipsPage';
import MoodlePage from '@/pages/MoodlePage';
import LegalPage from '@/pages/LegalPage';
import ContactPage from '@/pages/ContactPage';
import CanvasPage from '@/pages/CanvasPage';
import AssessmentPage from '@/pages/AssessmentPage';

const qc = new QueryClient();

function MapLayout() {
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden' }}>
      <Header />
      <div style={{ flex:1, position:'relative', overflow:'hidden', minHeight:0 }}><MapPage /></div>
    </div>
  );
}
function FullLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden' }}>
      <Header />
      <div style={{ flex:1, overflow:'hidden', minHeight:0 }}>{children}</div>
    </div>
  );
}
function ScrollLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh' }}>
      <Header />
      <div style={{ flex:1, overflowY:'auto' }}>{children}</div>
    </div>
  );
}
function StandardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#080c14]">
      <Header /><main className="flex-1">{children}</main><Footer />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Routes>
          <Route path="/login"      element={<LoginPage />} />
          <Route path="/dashboard"  element={<DashboardPage />} />
          <Route path="/map"        element={<MapLayout />} />
          <Route path="/canvas"     element={<FullLayout><CanvasPage /></FullLayout>} />
          <Route path="/sdg-trends" element={<ScrollLayout><SDGTrendsPage /></ScrollLayout>} />

          <Route path="/*" element={
            <StandardLayout>
              <Routes>
                <Route path="/"               element={<HomePage />} />
                <Route path="/sdgs"           element={<SDGPage />} />
                <Route path="/games"          element={<GamesPage />} />
                <Route path="/mun"            element={<MUNPage />} />
                <Route path="/mun/coordinate" element={<MUNCoordPage />} />
                <Route path="/munlingo"       element={<MUNLingoPage />} />
                <Route path="/topic-gen"      element={<ClassroomPage />} />
                <Route path="/classroom"      element={<ClassroomPage />} />
                <Route path="/tournament"     element={<TournamentPage />} />
                {/* Events & News tab — two sub-pages */}
                <Route path="/events"         element={<EventsPage />} />
                <Route path="/event-register" element={<EventRegisterPage />} />
                <Route path="/org-news"       element={<OrgNewsPage />} />
                <Route path="/leaderboard"    element={<LeaderboardPage />} />
                {/* Info tab */}
                <Route path="/sdg-news"       element={<NewsPage />} />
                <Route path="/news"           element={<NewsPage />} />
                <Route path="/resources"      element={<ResourcesPage />} />
                <Route path="/calendar"       element={<CalendarPage />} />
                <Route path="/contact"        element={<ContactPage />} />
                <Route path="/partnerships"   element={<PartnershipsPage />} />
                <Route path="/moodle"         element={<MoodlePage />} />
                <Route path="/legal"          element={<LegalPage />} />
                <Route path="/assessment"     element={<AssessmentPage />} />
                <Route path="/badges"         element={<DashboardPage />} />
              </Routes>
            </StandardLayout>
          } />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

function Footer() {
  const { branding: b } = useBrandingStore();
  return (
    <footer className="bg-slate-950 text-slate-400 py-6 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div><h3 className="text-sm font-semibold text-white mb-2">{b.appName}</h3><p className="text-xs">Interactive platform for SDG learning and UN Model education</p></div>
          <div><h3 className="text-sm font-semibold text-white mb-2">Data Sources</h3><ul className="text-xs space-y-1"><li>• SDSN SDR 2025</li><li>• UN 2030 Agenda</li><li>• Official UN SDG Database</li></ul></div>
          <div><h3 className="text-sm font-semibold text-white mb-2">Resources</h3><ul className="text-xs space-y-1"><li><a href="https://sdgs.un.org" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">UN SDGs Official Site</a></li><li><a href="https://dashboards.sdgindex.org" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">SDG Dashboards</a></li></ul></div>
        </div>
        <div className="border-t border-slate-800 mt-4 pt-4 text-center">
          <p className="text-xs">© {new Date().getFullYear()} {b.appName}. All rights reserved. · <a href="/legal" className="hover:text-white">Terms</a> · <a href="/legal" className="hover:text-white">Privacy</a> · <a href="/contact" className="hover:text-white">Contact</a></p>
        </div>
      </div>
    </footer>
  );
}
