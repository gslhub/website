'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';

import { GSLHubLogo } from '../brand/GSLHubLogo';

type SessionResponse = {
  user?: unknown;
};

const verifySession = async (): Promise<boolean> => {
  const response = await fetch(`/api/users/me?sessionCheck=${Date.now()}`, {
    cache: 'no-store',
    credentials: 'include',
  });

  if (!response.ok) return false;

  const data = (await response.json().catch(() => ({}))) as SessionResponse;
  return Boolean(data.user);
};

export default function SecureAdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    verifySession()
      .then((hasSession) => {
        if (!isActive) return;

        if (hasSession) {
          window.location.replace('/admin');
          return;
        }

        setIsCheckingSession(false);
      })
      .catch(() => {
        if (isActive) setIsCheckingSession(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        cache: 'no-store',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Demasiados intentos. Espera unos minutos antes de volver a probar.');
        }

        throw new Error('El correo electrónico o la contraseña no son correctos.');
      }

      const hasSession = await verifySession();

      if (!hasSession) {
        throw new Error('La autenticación fue aceptada, pero la sesión no pudo confirmarse.');
      }

      window.location.replace('/admin');
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : 'No se pudo iniciar sesión. Inténtalo nuevamente.',
      );
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 py-12 text-slate-950">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white p-7 shadow-2xl shadow-black/30 sm:p-9">
        <div className="mx-auto w-full max-w-[230px] text-slate-950">
          <GSLHubLogo />
        </div>

        <div className="mt-8 text-center">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            Research CMS
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Iniciar sesión</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Acceso privado para la administración científica de GSLHub.
          </p>
        </div>

        {isCheckingSession ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center text-sm text-slate-600">
            Comprobando la sesión…
          </div>
        ) : (
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold text-slate-800" htmlFor="admin-email">
                Correo electrónico
              </label>
              <input
                id="admin-email"
                name="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800" htmlFor="admin-password">
                Contraseña
              </label>
              <input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
              />
            </div>

            {error ? (
              <div
                role="alert"
                aria-live="polite"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800"
              >
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex min-h-12 w-full items-center justify-center rounded-xl bg-slate-950 px-5 font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-600/25 disabled:cursor-wait disabled:opacity-65"
            >
              {isSubmitting ? 'Verificando…' : 'Entrar al CMS'}
            </button>
          </form>
        )}

        <div className="mt-7 border-t border-slate-200 pt-5 text-center text-sm text-slate-500">
          <Link className="font-semibold text-slate-700 underline underline-offset-4" href="/">
            Volver a GSLHub
          </Link>
        </div>
      </section>
    </main>
  );
}
