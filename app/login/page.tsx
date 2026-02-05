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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white flex items-center justify-center shadow-lg shadow-black/30 mb-4">
            <img src="/logo-casm.png" alt="C.A.S.M." className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Performance Lab</h1>
          <p className="text-slate-500 text-sm mt-1">San Martín de Tucumán</p>
        </div>

        {/* Real login form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="admin@sanmartin.edu.ar"
              className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          {error && <p className="text-xs text-red-400 -mt-2">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-lg bg-red-700 text-white text-sm font-semibold py-2.5 hover:bg-red-800 active:bg-red-900 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Iniciando...' : 'Ingresar'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-slate-700" />
          <span className="text-xs text-slate-600">o</span>
          <div className="flex-1 h-px bg-slate-700" />
        </div>

        {/* Demo mode button */}
        <a
          href="/api/mock-login"
          className="block w-full rounded-lg border border-red-500/40 bg-red-700/10 text-red-400 text-sm font-semibold py-2.5 text-center hover:bg-red-700/20 hover:border-red-500/60 transition-colors"
        >
          ▶ Modo Demo
        </a>

        <p className="text-center text-xs text-slate-600 mt-6">
          Sistema interno — uso exclusivo del plantel profesional
        </p>
      </div>
    </div>
  );
}
