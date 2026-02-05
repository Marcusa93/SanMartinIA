'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '../ui/button';

// ─── Types ───────────────────────────────────────────────────
interface Message {
  role:      'user' | 'assistant';
  content:   string;
  citations?: string[];
}

// ─── Constants ───────────────────────────────────────────────
const INITIAL_MESSAGE: Message = {
  role: 'assistant',
  content: '👋 Hola, soy Santito. Puedo responder preguntas sobre GPS, saltos y fuerza del plantel…',
};

const SUGGESTIONS = [
  '¿Cómo viene la carga del plantel esta semana?',
  '¿Quién tuvo caída de CMJ?',
  'Comparame max speed de los últimos 14 días',
  'Resumen de fuerza del equipo',
];

// ─── Animation variants ──────────────────────────────────────
const panelVariants = {
  hidden: {
    opacity: 0,
    y: 24,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
  exit: {
    opacity: 0,
    y: 16,
    scale: 0.96,
    transition: { duration: 0.18, ease: [0.55, 0, 1, 1] as [number, number, number, number] },
  },
};

// ─── Markdown renderer (mirrors assistant-client.tsx) ────────
function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>')
    .replace(/- /g, '• ');
}

// ─── Component ───────────────────────────────────────────────
export function SantitoChatbot() {
  const [open, setOpen]           = useState(false);
  const [messages, setMessages]   = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [hasUnread, setHasUnread] = useState(true); // pulse until first open
  const bottomRef                 = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message when panel is open
  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  // Clear unread indicator on first open
  useEffect(() => {
    if (open) setHasUnread(false);
  }, [open]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text.trim() }),
      });
      const data = await res.json();
      const assistantMsg: Message = {
        role: 'assistant',
        content: data.content || 'No se pudo procesar la respuesta.',
        citations: data.citations,
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Error de conexión. Intentá de nuevo.' }]);
    }
    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">

      {/* ── Expanded panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ transformOrigin: 'bottom right' }}
            className="w-[380px] h-[520px] bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/40 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-white flex items-center justify-center shrink-0">
                  <img src="/logo-casm.png" alt="C.A.S.M." className="w-full h-full object-contain" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-100 leading-tight">Santito</p>
                  <p className="text-xs text-slate-500">Asistente de Performance Lab</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages scroll area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-xl px-3.5 py-2.5 ${
                    msg.role === 'user'
                      ? 'bg-red-700 text-white'
                      : 'bg-slate-800 border border-slate-700/50 text-slate-200'
                  }`}>
                    <div className="chat-content text-xs whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-1.5 pt-1.5 border-t border-slate-700/40">
                        <p className="text-xs text-slate-500">📎 Fuentes: {msg.citations.join(' | ')}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Loading dots */}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 border border-slate-700/50 rounded-xl px-3.5 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Suggestions (only when conversation is short) */}
            {messages.length <= 2 && (
              <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-xs bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 px-2.5 py-1 rounded-full transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input row */}
            <div className="border-t border-slate-700/50 p-3 shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send(input)}
                  placeholder="Preguntá algo…"
                  className="flex-1 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
                <Button onClick={() => send(input)} isLoading={loading} size="sm" className="shrink-0">Enviar</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Trigger button (always visible) ── */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="relative w-14 h-14 rounded-full bg-slate-900 border-2 border-slate-700 shadow-lg shadow-black/40 hover:border-red-600 hover:shadow-red-900/30 transition-all flex items-center justify-center"
      >
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-white flex items-center justify-center">
          <img src="/logo-casm.png" alt="Santito" className="w-full h-full object-contain" />
        </div>

        {/* Pulse / unread indicator */}
        {hasUnread && (
          <span className="absolute top-0.5 right-0.5 flex h-3.5 w-3.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-red-600 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600 border-2 border-slate-950" />
          </span>
        )}
      </button>
    </div>
  );
}
