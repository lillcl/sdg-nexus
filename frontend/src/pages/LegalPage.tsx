// LegalPage — Terms of Service and Privacy Policy (GDPR-aware)
import { useState } from 'react';
import { Shield, FileText, ChevronDown, ChevronUp } from 'lucide-react';

const LAST_UPDATED = '15 March 2026';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden mb-4">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-800/30 transition-colors">
        <span className="text-white font-semibold text-sm">{title}</span>
        {open ? <ChevronUp size={14} className="text-slate-500"/> : <ChevronDown size={14} className="text-slate-500"/>}
      </button>
      {open && <div className="px-5 pb-5 text-slate-400 text-xs leading-relaxed space-y-2">{children}</div>}
    </div>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p>{children}</p>;
}

export default function LegalPage() {
  const [tab, setTab] = useState<'tos'|'privacy'>('tos');

  return (
    <div className="min-h-screen bg-[#080c14] p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
            <Shield size={20} className="text-blue-400"/>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Legal</h1>
            <p className="text-slate-500 text-xs">Last updated: {LAST_UPDATED}</p>
          </div>
        </div>

        <div className="flex gap-1 bg-slate-900/50 rounded-xl p-1 w-fit mb-6">
          {[{key:'tos',label:'Terms of Service',icon:FileText},{key:'privacy',label:'Privacy Policy',icon:Shield}].map(t => {
            const Icon = t.icon;
            return (
              <button key={t.key} onClick={() => setTab(t.key as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${tab===t.key?'bg-blue-600 text-white':'text-slate-400 hover:text-white'}`}>
                <Icon size={12}/>{t.label}
              </button>
            );
          })}
        </div>

        {tab === 'tos' && (
          <div>
            <div className="bg-blue-900/20 border border-blue-800/30 rounded-xl px-4 py-3 mb-5 text-blue-300 text-xs">
              By using SDG Nexus you agree to these terms. This platform is designed for educational use in connection with the UN Sustainable Development Goals.
            </div>

            <Section title="1. Acceptance of Terms">
              <P>By accessing or using SDG Nexus ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Platform.</P>
              <P>These terms apply to all users, including visitors, students, administrators, and superadministrators.</P>
            </Section>

            <Section title="2. Use of the Platform">
              <P>SDG Nexus is an educational platform for learning about the UN Sustainable Development Goals, practising Model UN skills, and accessing SDG-related resources.</P>
              <P>You may not: (a) use the Platform for any unlawful purpose; (b) attempt to gain unauthorised access to any part of the Platform; (c) distribute harmful, offensive, or misleading content; (d) scrape or systematically download Platform data without prior written consent.</P>
            </Section>

            <Section title="3. User Accounts">
              <P>You are responsible for maintaining the confidentiality of your account credentials. You must notify us immediately of any unauthorised use of your account.</P>
              <P>Accounts are subject to role-based access control. Roles (visitor, student, admin, superadmin) are assigned by platform administrators.</P>
            </Section>

            <Section title="4. Content">
              <P>SDG data is sourced from the SDSN Sustainable Development Report 2025 and official UN databases. We do not guarantee real-time accuracy.</P>
              <P>AI-generated content (MUN papers, project topics) is for educational purposes only and should not be used as official policy or academic submissions without independent verification.</P>
            </Section>

            <Section title="5. Intellectual Property">
              <P>SDG Nexus and its original content are owned by the Platform operators. UN data and SDG materials remain the property of the United Nations and SDSN.</P>
              <P>Users retain ownership of content they create (e.g., task submissions, MUN papers).</P>
            </Section>

            <Section title="6. Disclaimer & Limitation of Liability">
              <P>The Platform is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the Platform.</P>
              <P>We are not responsible for the content of external links or third-party services.</P>
            </Section>

            <Section title="7. Changes to Terms">
              <P>We reserve the right to modify these terms at any time. Continued use of the Platform after changes constitutes acceptance of the new terms.</P>
            </Section>

            <Section title="8. Contact">
              <P>For questions about these terms, contact the platform administrators through the Events page or your institution's SDG coordinator.</P>
            </Section>
          </div>
        )}

        {tab === 'privacy' && (
          <div>
            <div className="bg-green-900/20 border border-green-800/30 rounded-xl px-4 py-3 mb-5 text-green-300 text-xs">
              🇪🇺 This privacy policy is designed to comply with GDPR and applicable data protection laws. If you are in the EU/EEA, you have specific rights described below.
            </div>

            <Section title="1. Data We Collect">
              <P><strong className="text-white">Account Data:</strong> Email address, username, full name (provided at registration). Stored in Supabase Auth (EU-based data centres available).</P>
              <P><strong className="text-white">Usage Data:</strong> Role assignments, course enrolments, task submissions, event registrations. Stored in Supabase PostgreSQL.</P>
              <P><strong className="text-white">Technical Data:</strong> IP address (used for rate limiting only, not logged long-term), browser type, approximate location via IP.</P>
              <P><strong className="text-white">We do NOT collect:</strong> Payment information, precise geolocation, biometric data, or data from minors under 13 without explicit parental consent.</P>
            </Section>

            <Section title="2. How We Use Your Data">
              <P>• Authentication and account management</P>
              <P>• Providing educational features (courses, events, MUN tools)</P>
              <P>• Role-based access control</P>
              <P>• Rate limiting to prevent abuse</P>
              <P>• Improving the Platform (aggregated, anonymised analytics only)</P>
              <P>We do NOT sell your data to third parties or use it for advertising.</P>
            </Section>

            <Section title="3. Data Storage & Security">
              <P>Data is stored in Supabase (PostgreSQL) with Row Level Security (RLS) policies ensuring users can only access their own data.</P>
              <P>Passwords are never stored in plaintext — authentication is handled by Supabase Auth with bcrypt hashing.</P>
              <P>All data in transit is encrypted via HTTPS/TLS.</P>
            </Section>

            <Section title="4. Your Rights (GDPR)">
              <P>If you are in the EU/EEA, you have the right to:</P>
              <P>• <strong className="text-white">Access</strong> your personal data</P>
              <P>• <strong className="text-white">Rectify</strong> inaccurate data</P>
              <P>• <strong className="text-white">Erase</strong> your data ("right to be forgotten")</P>
              <P>• <strong className="text-white">Restrict</strong> processing of your data</P>
              <P>• <strong className="text-white">Data portability</strong> — receive your data in a machine-readable format</P>
              <P>• <strong className="text-white">Object</strong> to processing</P>
              <P>To exercise these rights, contact your platform administrator. We will respond within 30 days.</P>
            </Section>

            <Section title="5. Cookies">
              <P>We use only essential functional storage (localStorage in your browser) for session tokens and user preferences. No tracking cookies, no analytics cookies, no third-party advertising cookies.</P>
            </Section>

            <Section title="6. Third-Party Services">
              <P>• <strong className="text-white">Supabase</strong> (database & auth) — <a href="https://supabase.com/privacy" className="text-blue-400 hover:underline" target="_blank" rel="noopener">Privacy Policy</a></P>
              <P>• <strong className="text-white">Render.com</strong> (backend hosting) — <a href="https://render.com/privacy" className="text-blue-400 hover:underline" target="_blank" rel="noopener">Privacy Policy</a></P>
              <P>• <strong className="text-white">Vercel</strong> (frontend hosting) — <a href="https://vercel.com/legal/privacy-policy" className="text-blue-400 hover:underline" target="_blank" rel="noopener">Privacy Policy</a></P>
              <P>• <strong className="text-white">AllOrigins</strong> (RSS proxy for news) — no personal data transmitted</P>
              <P>• <strong className="text-white">Ollama / OpenAI / DeepSeek / Gemini</strong> (AI features) — prompts may be sent to these services; no personally identifiable information is included in AI prompts</P>
            </Section>

            <Section title="7. Data Retention">
              <P>Account data is retained until you request deletion. Task submissions are retained for the duration of your course enrolment plus 1 year. Rate limit records are cleared after 24 hours.</P>
            </Section>

            <Section title="8. Children's Privacy">
              <P>The Platform is intended for users aged 13 and above. Users under 16 in the EU require parental consent. If you believe a child has provided personal data without consent, contact us immediately.</P>
            </Section>

            <Section title="9. Contact & DPO">
              <P>For privacy concerns or GDPR requests, contact the platform administrator through the Events page or your institution's data protection officer.</P>
            </Section>
          </div>
        )}
      </div>
    </div>
  );
}
