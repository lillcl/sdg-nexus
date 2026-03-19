// ContactPage
import { useState } from 'react';
import { Mail, Send, MapPin, Globe, CheckCircle, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({ name:'', email:'', org:'', type:'general', message:'' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) return;
    setLoading(true);
    // Send via mailto as fallback (no backend email service yet)
    const subject = `[SDG Nexus] ${form.type === 'partnership' ? 'Partnership Inquiry' : form.type === 'school' ? 'School Registration' : 'General Inquiry'} from ${form.org || form.name}`;
    const body = `Name: ${form.name}\nEmail: ${form.email}\nOrganization: ${form.org}\nMessage:\n${form.message}`;
    window.open(`mailto:contact@sdgnexus.org?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    setTimeout(() => { setSent(true); setLoading(false); }, 800);
  };

  const TYPES = [
    { key:'general',     label:'General Inquiry',     icon:'💬' },
    { key:'school',      label:'School Registration',  icon:'🏫' },
    { key:'partnership', label:'Partnership Request',  icon:'🤝' },
    { key:'technical',   label:'Technical Support',    icon:'🔧' },
  ];

  if (sent) {
    return (
      <div className="min-h-screen bg-[#080c14] flex items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <CheckCircle size={60} className="text-green-400 mx-auto mb-4"/>
          <h2 className="text-2xl font-bold text-white mb-2">Message Sent!</h2>
          <p className="text-slate-400 mb-6">Thank you for reaching out. We'll respond within 2 business days.</p>
          <button onClick={() => { setSent(false); setForm({ name:'', email:'', org:'', type:'general', message:'' }); }}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm transition-colors">
            Send Another Message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080c14] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Mail size={22} className="text-blue-400"/>Contact Us</h1>
          <p className="text-slate-500 text-sm mt-1">Get in touch with the SDG Nexus team</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Contact info */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <Globe size={18} className="text-blue-400 mb-3"/>
              <h3 className="text-white font-semibold text-sm mb-1">Platform</h3>
              <p className="text-slate-500 text-xs">SDG Nexus is built for international SDG education and Model UN training.</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <Mail size={18} className="text-green-400 mb-3"/>
              <h3 className="text-white font-semibold text-sm mb-1">Email</h3>
              <a href="mailto:contact@sdgnexus.org" className="text-blue-400 text-xs hover:underline">contact@sdgnexus.org</a>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <MessageSquare size={18} className="text-purple-400 mb-3"/>
              <h3 className="text-white font-semibold text-sm mb-1">Response Time</h3>
              <p className="text-slate-500 text-xs">We aim to respond within 2 business days. For urgent technical issues, include "URGENT" in your subject.</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <MapPin size={18} className="text-red-400 mb-3"/>
              <h3 className="text-white font-semibold text-sm mb-1">Who We Work With</h3>
              <ul className="text-slate-400 text-xs space-y-1">
                <li>🏫 Schools & universities worldwide</li>
                <li>🌍 MUN conferences</li>
                <li>🎓 SDG youth programs</li>
                <li>🤝 UN-affiliated organizations</li>
              </ul>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-white font-bold mb-5">Send a Message</h2>

            {/* Type selector */}
            <div className="grid grid-cols-2 gap-2 mb-5">
              {TYPES.map(t => (
                <button key={t.key} onClick={() => setForm(f => ({...f, type: t.key}))}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                    form.type === t.key
                      ? 'border-blue-600 bg-blue-600/20 text-blue-300'
                      : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                  }`}>
                  <span>{t.icon}</span>{t.label}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-xs block mb-1">Full Name *</label>
                  <input value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} placeholder="Your name"
                    className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 placeholder:text-slate-600"/>
                </div>
                <div>
                  <label className="text-slate-400 text-xs block mb-1">Email *</label>
                  <input type="email" value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} placeholder="you@school.edu"
                    className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 placeholder:text-slate-600"/>
                </div>
              </div>
              <div>
                <label className="text-slate-400 text-xs block mb-1">Organization / School</label>
                <input value={form.org} onChange={e => setForm(f=>({...f,org:e.target.value}))} placeholder="School or organization name"
                  className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 placeholder:text-slate-600"/>
              </div>
              <div>
                <label className="text-slate-400 text-xs block mb-1">Message *</label>
                <textarea value={form.message} onChange={e => setForm(f=>({...f,message:e.target.value}))} rows={6}
                  placeholder={form.type === 'school' ? 'Tell us about your school: country, grade levels, number of students, and how you plan to use SDG Nexus…'
                    : form.type === 'partnership' ? 'Tell us about your organization and how you\'d like to partner…'
                    : 'How can we help?'}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 placeholder:text-slate-600 resize-none"/>
              </div>
              <button onClick={handleSubmit} disabled={loading || !form.name || !form.email || !form.message}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl font-bold text-sm transition-colors">
                <Send size={14}/>{loading ? 'Sending…' : 'Send Message'}
              </button>
              <p className="text-slate-600 text-xs text-center">
                Submitting opens your email client. No data is stored on submission.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
