'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, History, Plus, ChevronLeft, Trash2, MessageSquare } from 'lucide-react';
import { Button } from '../ui/button';
import { createClient } from '../../lib/supabase/client';

// ─── Types ───────────────────────────────────────────────────
interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: string[];
  created_at?: string;
}

interface Thread {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

// ─── Constants ───────────────────────────────────────────────
const WELCOME_MESSAGE: Message = {
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
  const [open, setOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load threads when history view opens
  useEffect(() => {
    if (showHistory && threads.length === 0) {
      loadThreads();
    }
  }, [showHistory]);

  // Auto-scroll to latest message when panel is open
  useEffect(() => {
    if (open && !showHistory) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open, showHistory]);

  // Clear unread indicator on first open
  useEffect(() => {
    if (open) setHasUnread(false);
  }, [open]);

  const loadThreads = async () => {
    setLoadingThreads(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('chat_threads')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(15);
    setThreads((data || []) as Thread[]);
    setLoadingThreads(false);
  };

  const loadMessages = async (threadId: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    const msgs: Message[] = (data || []).map((m: any) => ({
      id: m.id,
      role: m.role as 'user' | 'assistant',
      content: m.content,
      citations: m.citations_json?.sources || [],
      created_at: m.created_at,
    }));
    setMessages(msgs.length > 0 ? msgs : [WELCOME_MESSAGE]);
    setCurrentThreadId(threadId);
    setShowHistory(false);
  };

  const createNewThread = async (): Promise<string> => {
    const supabase = createClient();
    const { data } = await supabase
      .from('chat_threads')
      .insert({ title: 'Nueva conversación' })
      .select()
      .single();

    if (data) {
      setThreads(prev => [data as Thread, ...prev]);
      return data.id;
    }
    throw new Error('Failed to create thread');
  };

  const startNewChat = () => {
    setCurrentThreadId(null);
    setMessages([WELCOME_MESSAGE]);
    setShowHistory(false);
  };

  const deleteThread = async (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const supabase = createClient();
    await supabase.from('chat_threads').delete().eq('id', threadId);
    setThreads(prev => prev.filter(t => t.id !== threadId));
    if (currentThreadId === threadId) {
      startNewChat();
    }
  };

  const saveMessage = async (threadId: string, role: 'user' | 'assistant', content: string, citations?: string[]) => {
    const supabase = createClient();
    await supabase.from('chat_messages').insert({
      thread_id: threadId,
      role,
      content,
      citations_json: citations?.length ? { sources: citations } : null,
    });
  };

  const updateThreadTitle = async (threadId: string, firstMessage: string) => {
    const title = firstMessage.slice(0, 40) + (firstMessage.length > 40 ? '...' : '');
    const supabase = createClient();
    await supabase.from('chat_threads').update({ title }).eq('id', threadId);
    setThreads(prev => prev.map(t => t.id === threadId ? { ...t, title } : t));
  };

  const send = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;

    const userContent = text.trim();
    setInput('');
    setLoading(true);

    // Create thread if needed
    let threadId = currentThreadId;
    if (!threadId) {
      try {
        threadId = await createNewThread();
        setCurrentThreadId(threadId);
        updateThreadTitle(threadId, userContent);
      } catch {
        setLoading(false);
        return;
      }
    }

    // Add user message to UI
    const userMsg: Message = { role: 'user', content: userContent };
    setMessages(prev => [...prev, userMsg]);

    // Save user message
    await saveMessage(threadId, 'user', userContent);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userContent }),
      });
      const data = await res.json();

      const assistantMsg: Message = {
        role: 'assistant',
        content: data.content || 'No se pudo procesar la respuesta.',
        citations: data.citations,
      };
      setMessages(prev => [...prev, assistantMsg]);

      // Save assistant message
      await saveMessage(threadId, 'assistant', assistantMsg.content, assistantMsg.citations);

      // Update thread timestamp
      const supabase = createClient();
      await supabase.from('chat_threads').update({ updated_at: new Date().toISOString() }).eq('id', threadId);

    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Error de conexión. Intentá de nuevo.' }]);
    }

    setLoading(false);
  }, [currentThreadId, loading]);

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-3">

      {/* ── Expanded panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ transformOrigin: 'bottom right' }}
            className="w-[calc(100vw-2rem)] sm:w-[380px] h-[70vh] sm:h-[520px] max-h-[600px] bg-surface border border-border rounded-2xl shadow-2xl shadow-black/30 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 shrink-0">
              <div className="flex items-center gap-2.5">
                {showHistory ? (
                  <button
                    onClick={() => setShowHistory(false)}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-secondary"
                  >
                    <ChevronLeft size={18} />
                  </button>
                ) : (
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-white flex items-center justify-center shrink-0">
                    <img src="/logo-casm.png" alt="C.A.S.M." className="w-full h-full object-contain" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-bold text-foreground leading-tight">
                    {showHistory ? 'Historial' : 'Santito'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {showHistory ? 'Conversaciones anteriores' : 'Asistente de Performance Lab'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {!showHistory && (
                  <>
                    <button
                      onClick={startNewChat}
                      className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-secondary"
                      title="Nueva conversación"
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      onClick={() => { setShowHistory(true); loadThreads(); }}
                      className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-secondary"
                      title="Historial"
                    >
                      <History size={16} />
                    </button>
                  </>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-secondary"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* History View */}
            {showHistory ? (
              <div className="flex-1 overflow-y-auto">
                {loadingThreads ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                ) : threads.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4">
                    <MessageSquare className="w-10 h-10 text-muted-foreground/40 mb-3" />
                    <p className="text-sm text-muted-foreground text-center">No hay conversaciones guardadas</p>
                    <button
                      onClick={startNewChat}
                      className="mt-4 text-xs text-primary hover:underline"
                    >
                      Iniciar nueva conversación
                    </button>
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {threads.map(thread => (
                      <div
                        key={thread.id}
                        onClick={() => loadMessages(thread.id)}
                        className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                          currentThreadId === thread.id
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-secondary text-foreground'
                        }`}
                      >
                        <MessageSquare size={14} className="shrink-0 opacity-60" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{thread.title}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(thread.updated_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                        <button
                          onClick={(e) => deleteThread(thread.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/20 rounded transition-all"
                        >
                          <Trash2 size={12} className="text-destructive" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Messages scroll area */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-xl px-3.5 py-2.5 ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary border border-border/50 text-foreground'
                      }`}>
                        <div className="chat-content text-xs whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                        {msg.citations && msg.citations.length > 0 && (
                          <div className="mt-1.5 pt-1.5 border-t border-border/40">
                            <p className="text-xs text-muted-foreground">📎 Fuentes: {msg.citations.join(' | ')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Loading dots */}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-secondary border border-border/50 rounded-xl px-3.5 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* Suggestions (only when conversation is short) */}
                {messages.length <= 2 && (
                  <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                    {SUGGESTIONS.slice(0, 2).map(s => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="text-xs bg-secondary border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 px-2.5 py-1 rounded-full transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                {/* Input row */}
                <div className="border-t border-border/50 p-3 shrink-0">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send(input)}
                      placeholder="Preguntá algo…"
                      className="flex-1 rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <Button onClick={() => send(input)} isLoading={loading} size="sm" className="shrink-0">Enviar</Button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Trigger button with fire flames ── */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="chatbot-fire-button relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-surface border-2 border-primary/50 transition-all flex items-center justify-center"
      >
        {/* Fire ember particles */}
        <span className="fire-ember" style={{ top: '-6px', left: '8px', animationDelay: '0s' }} />
        <span className="fire-ember" style={{ top: '-10px', right: '10px', animationDelay: '0.5s' }} />
        <span className="fire-ember" style={{ top: '-4px', left: '50%', animationDelay: '1s' }} />

        {/* Logo container */}
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg overflow-hidden bg-white flex items-center justify-center relative z-10">
          <img src="/logo-casm.png" alt="Santito" className="w-full h-full object-contain" />
        </div>

        {/* Pulse / unread indicator */}
        {hasUnread && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-primary border-2 border-surface" />
          </span>
        )}
      </button>
    </div>
  );
}
