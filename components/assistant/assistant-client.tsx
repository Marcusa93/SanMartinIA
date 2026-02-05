'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

interface Message {
  role:      'user' | 'assistant';
  content:   string;
  citations?: string[];
}

const SUGGESTIONS = [
  '¿Cómo viene la carga del plantel esta semana?',
  '¿Quién tuvo caída de CMJ?',
  'Comparame max speed de los últimos 14 días',
  'Resumen de fuerza del equipo',
  'Estado del plantel',
];

export function AssistantClient() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '👋 Hola. Soy el asistente contextual. Puedo responder preguntas sobre la carga externa (GPS), saltos y fuerza del plantel, usando solo los datos registrados en el sistema.\n\nEjemplos:\n- "¿Cómo viene la carga de García esta semana?"\n- "¿Quién tuvo caída de CMJ?"\n- "Top distancia del plantel"' },
  ]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    <div className="flex flex-col flex-1 overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-xl px-4 py-3 ${
              msg.role === 'user'
                ? 'bg-red-700 text-white'
                : 'bg-slate-800 border border-slate-700/50 text-slate-200'
            }`}>
              {/* Render markdown-ish content */}
              <div className="chat-content text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-700/40">
                  <p className="text-xs text-slate-500">📎 Fuentes: {msg.citations.join(' | ')}</p>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 border border-slate-700/50 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions (show when few messages) */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => send(s)}
              className="text-xs bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 px-3 py-1.5 rounded-full transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-slate-700/50 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send(input)}
            placeholder="Preguntá algo sobre el plantel…"
            className="flex-1 rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
          <Button onClick={() => send(input)} isLoading={loading} className="shrink-0">Enviar</Button>
        </div>
      </div>
    </div>
  );
}

// Simple markdown renderer for bold, emoji, lists
function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>')
    .replace(/- /g, '• ');
}
