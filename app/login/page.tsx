'use client';

import { useState, type FormEvent } from 'react';
import { createClient } from '../../lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError('Email o contraseña incorrecta.');
      setLoading(false);
      return;
    }
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-surface flex items-center justify-center shadow-lg shadow-black/30 mb-4 border border-border">
            <img src="/logo-casm.png" alt="C.A.S.M." className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Performance Lab</h1>
          <p className="text-muted-foreground text-sm mt-1">San Martín de Tucumán</p>
        </div>

        {/* Real login form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-surface p-6 rounded-2xl border border-border shadow-xl">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="admin@sanmartin.edu.ar"
              className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          {error && <p className="text-xs text-destructive -mt-2">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-lg bg-primary text-primary-foreground text-sm font-semibold py-2.5 hover:bg-primary/90 active:bg-primary/80 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Iniciando...' : 'Ingresar'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">o</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Demo mode button */}
        <a
          href="/api/mock-login"
          className="block w-full rounded-lg border border-primary/40 bg-primary/10 text-primary text-sm font-semibold py-2.5 text-center hover:bg-primary/20 hover:border-primary/60 transition-colors"
        >
          ▶ Modo Demo
        </a>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Sistema interno — uso exclusivo del plantel profesional
        </p>
      </div>
    </div>
  );
}
