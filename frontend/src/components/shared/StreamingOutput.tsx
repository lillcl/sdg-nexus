// StreamingOutput.tsx — renders markdown AI output as HTML
import { Bot, Loader2, Copy, Check, Download } from 'lucide-react';
import { useState, useMemo } from 'react';

interface Props {
  text: string;
  loading: boolean;
  error: string;
  placeholder?: string;
  title?: string;
  onSave?: () => void;
}

// Lightweight markdown → HTML converter
function mdToHtml(md: string): string {
  let html = md
    // Headings
    .replace(/^#### (.+)$/gm, '<h4 class="text-white font-bold text-sm mt-4 mb-1.5">$1</h4>')
    .replace(/^### (.+)$/gm, '<h3 class="text-white font-bold text-base mt-5 mb-2 border-b border-slate-700 pb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-white font-bold text-lg mt-6 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-white font-bold text-xl mt-6 mb-3">$1</h1>')
    // Bold and italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong class="text-white font-bold italic">$1</strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="text-slate-300 italic">$1</em>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr class="border-slate-700 my-4"/>')
    // Tables — detect | patterns
    .replace(/(\|.+\|\n\|[-| :]+\|\n(?:\|.+\|\n?)+)/g, (tableMatch) => {
      const rows = tableMatch.trim().split('\n');
      const headers = rows[0].split('|').filter(c => c.trim());
      const body = rows.slice(2).map(row => row.split('|').filter(c => c.trim()));
      return `<div class="overflow-x-auto my-3"><table class="w-full text-xs border-collapse">
        <thead><tr>${headers.map(h => `<th class="px-3 py-2 text-left text-slate-300 font-semibold border-b border-slate-700 bg-slate-800/60">${h.trim()}</th>`).join('')}</tr></thead>
        <tbody>${body.map((row, i) => `<tr class="${i % 2 === 0 ? 'bg-slate-900/30' : ''}">${row.map(cell => `<td class="px-3 py-2 text-slate-400 border-b border-slate-800">${cell.trim()}</td>`).join('')}</tr>`).join('')}</tbody>
      </table></div>`;
    })
    // Block quotes
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-2 border-blue-600 pl-3 my-2 text-slate-400 italic text-xs">$1</blockquote>')
    // Code blocks
    .replace(/```[\w]*\n([\s\S]+?)```/g, '<pre class="bg-slate-800 rounded-lg p-3 my-2 overflow-x-auto text-xs font-mono text-green-300">$1</pre>')
    // Inline code
    .replace(/`(.+?)`/g, '<code class="bg-slate-800 text-green-300 px-1 py-0.5 rounded text-xs font-mono">$1</code>')
    // Unordered lists
    .replace(/^[\-\*] (.+)$/gm, '<li class="text-slate-300 text-sm ml-4 list-disc">$1</li>')
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li class="text-slate-300 text-sm ml-4 list-decimal">$1</li>')
    // Paragraphs (lines not already converted)
    .replace(/^([^<\n][^\n]+)$/gm, '<p class="text-slate-300 text-sm leading-relaxed">$1</p>')
    // Line breaks
    .replace(/\n\n/g, '<br/>')
    // Wrap consecutive li items
    .replace(/(<li[^>]*>[^<]+<\/li>\n?)+/g, m => `<ul class="space-y-1 my-2">${m}</ul>`);
  return html;
}

export default function StreamingOutput({ text, loading, error, placeholder, title, onSave }: Props) {
  const [copied, setCopied] = useState(false);

  const htmlContent = useMemo(() => text ? mdToHtml(text) : '', [text]);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'document'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (error) return (
    <div className="rounded-xl border border-red-800 bg-red-950/30 p-4 text-red-400 text-sm">{error}</div>
  );

  if (!text && !loading) return (
    <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-slate-500 text-sm">
      {placeholder ?? 'AI output will appear here'}
    </div>
  );

  return (
    <div className="relative rounded-xl border border-slate-700 bg-[#060c18] overflow-hidden">
      {/* Toolbar */}
      {text && !loading && (
        <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-800 bg-slate-900/50">
          {title && <span className="text-slate-500 text-xs flex-1 truncate">{title}</span>}
          <button onClick={copy} className="flex items-center gap-1 text-xs text-slate-500 hover:text-white transition-colors px-2 py-1 rounded hover:bg-slate-800">
            {copied ? <><Check size={10} className="text-green-400"/> Copied</> : <><Copy size={10}/> Copy</>}
          </button>
          <button onClick={download} className="flex items-center gap-1 text-xs text-slate-500 hover:text-white transition-colors px-2 py-1 rounded hover:bg-slate-800">
            <Download size={10}/> Download
          </button>
          {onSave && (
            <button onClick={onSave} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors px-2 py-1 rounded hover:bg-slate-800 border border-blue-800">
              💾 Save
            </button>
          )}
        </div>
      )}

      <div className="p-5">
        {loading && (
          <div className="flex items-center gap-2 text-blue-400 text-xs mb-3">
            <Loader2 size={12} className="animate-spin" />
            <span className="font-mono">Generating...</span>
          </div>
        )}
        {text ? (
          <div className="prose-sdg" dangerouslySetInnerHTML={{ __html: htmlContent }}/>
        ) : loading ? (
          <div className="flex items-center gap-2 text-slate-500">
            <Bot size={16} />
            <span className="text-sm">AI is thinking...</span>
            <span className="loading-dot w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
            <span className="loading-dot w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" style={{ animationDelay: '0.2s' }} />
            <span className="loading-dot w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" style={{ animationDelay: '0.4s' }} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
