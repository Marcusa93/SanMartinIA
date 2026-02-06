'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { createClient } from '../../lib/supabase/client';
import { MessageSquare, Plus, Trash2, Send, Sparkles, Loader2 } from 'lucide-react';

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

// ─── Suggestions by category ─────────────────────────────────
const SUGGESTION_CATEGORIES = [
  {
    label: 'Carga GPS',
    icon: '📡',
    questions: [
      '¿Cómo viene la carga del plantel esta semana?',
      '¿Quién tuvo mayor distancia recorrida?',
      '¿Cuál fue la velocidad máxima alcanzada?',
    ],
  },
  {
    label: 'Saltos CMJ',
    icon: '🦘',
    questions: [
      '¿Algún jugador con caída de CMJ?',
      'Resumen de saltos del plantel',
      '¿Quién tiene mejor potencia de salto?',
    ],
  },
  {
    label: 'Fuerza',
    icon: '💪',
    questions: [
      'Resumen de fuerza del equipo',
      '¿Cómo viene el squat del plantel?',
      'Comparativa de 1RM estimado',
    ],
  },
  {
    label: 'Plantel',
    icon: '👥',
    questions: [
      'Estado general del plantel',
      '¿Quién está lesionado?',
      'Resumen de la semana',
    ],
  },
];

// ─── Markdown renderer with table support ────────────────────
function renderMarkdown(text: string): string {
  let html = text
    // Headers
    .replace(/^### (.+)$/gm, '<h4 class="font-semibold text-foreground mt-3 mb-1">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 class="font-bold text-foreground mt-4 mb-2">$1</h3>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground">$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Code
    .replace(/`(.+?)`/g, '<code class="bg-secondary px-1.5 py-0.5 rounded text-xs font-mono">$1</code>')
    // Bullet lists
    .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
    // Numbered lists
    .replace(/^\d+\) (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
    // Line breaks
    .replace(/\n\n/g, '</p><p class="mb-2">')
    .replace(/\n/g, '<br/>');

  // Wrap lists
  html = html.replace(/(<li[^>]*>.*?<\/li>)+/g, '<ul class="list-disc mb-2">$&</ul>');

  // Alerts
  html = html.replace(/⚠️ ALERTA:/g, '<span class="inline-flex items-center gap-1 text-amber-500 font-semibold">⚠️ ALERTA:</span>');
  html = html.replace(/⚠️ ATENCIÓN:/g, '<span class="inline-flex items-center gap-1 text-amber-400 font-medium">⚠️ ATENCIÓN:</span>');

  return `<p class="mb-2">${html}</p>`;
}

// ─── Component ───────────────────────────────────────────────
export function AssistantClient() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ─── Load threads on mount ─────────────────────────────────
  useEffect(() => {
    loadThreads();
  }, []);

  // ─── Auto-scroll to bottom ─────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ─── Hide suggestions after first message ──────────────────
  useEffect(() => {
    if (messages.length > 0) setShowSuggestions(false);
  }, [messages.length]);

  const loadThreads = async () => {
    setLoadingThreads(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('chat_threads')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(20);
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
    setMessages(msgs);
    setCurrentThreadId(threadId);
    setShowSuggestions(msgs.length === 0);
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
    setMessages([]);
    setShowSuggestions(true);
    inputRef.current?.focus();
  };

  const deleteThread = async (threadId: string) => {
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
    const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '');
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
        // Update title with first message
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
    <div className="flex flex-1 gap-4 overflow-hidden">
      {/* ─── Sidebar: Thread list ─── */}
      <div className="w-64 shrink-0 flex flex-col bg-surface border border-border rounded-xl overflow-hidden">
        <div className="p-3 border-b border-border">
          <Button
            onClick={startNewChat}
            className="w-full justify-start gap-2"
            variant="outline"
            size="sm"
          >
            <Plus size={16} />
            Nueva conversación
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingThreads ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : threads.length === 0 ? (
            <div className="text-center py-8 px-4">
              <MessageSquare className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-xs text-muted-foreground">No hay conversaciones</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {threads.map(thread => (
                <div
                  key={thread.id}
                  className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    currentThreadId === thread.id
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-secondary text-foreground'
                  }`}
                  onClick={() => loadMessages(thread.id)}
                >
                  <MessageSquare size={14} className="shrink-0 opacity-60" />
                  <span className="flex-1 text-xs truncate">{thread.title}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteThread(thread.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/20 rounded transition-all"
                  >
                    <Trash2 size={12} className="text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Main chat area ─── */}
      <div className="flex-1 flex flex-col bg-surface border border-border rounded-xl overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {messages.length === 0 && showSuggestions && (
            <div className="flex-1 flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-1">¿En qué puedo ayudarte?</h2>
              <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
                Respondo usando datos reales del sistema. Preguntame sobre carga GPS, saltos, fuerza o estado del plantel.
              </p>

              {/* Suggestion categories */}
              <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                {SUGGESTION_CATEGORIES.map(cat => (
                  <div key={cat.label} className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </div>
                    <div className="space-y-1.5">
                      {cat.questions.slice(0, 2).map(q => (
                        <button
                          key={q}
                          onClick={() => send(q)}
                          className="w-full text-left text-xs bg-secondary/50 hover:bg-secondary border border-border hover:border-primary/30 text-foreground px-3 py-2 rounded-lg transition-all"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary border border-border text-foreground'
              }`}>
                <div
                  className="chat-content text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                />
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-border/40">
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <span className="opacity-70">📎</span>
                      <span>Fuentes: {msg.citations.join(' • ')}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-secondary border border-border rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs text-muted-foreground">Analizando datos...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick suggestions when chatting */}
        {messages.length > 0 && messages.length <= 4 && !loading && (
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {SUGGESTION_CATEGORIES.flatMap(c => c.questions).slice(0, 3).map(s => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-xs bg-secondary/50 border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 px-3 py-1.5 rounded-full transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="border-t border-border p-4">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send(input)}
              placeholder="Preguntá sobre el plantel..."
              className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <Button
              onClick={() => send(input)}
              disabled={loading || !input.trim()}
              className="shrink-0 rounded-xl px-4"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
