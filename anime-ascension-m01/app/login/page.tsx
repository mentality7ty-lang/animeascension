'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const db = createClient();
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error')) {
      setMessage('Confirmation failed. Try again.');
    }
  }, []);

  async function submit() {
    if (!email || password.length < 6) {
      setMessage('Enter a valid email and a password of at least 6 characters.');
      return;
    }

    setBusy(true);
    setMessage('');

    if (mode === 'signup') {
      const { data, error } = await db.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${location.origin}/auth/confirm` },
      });

      if (error) setMessage(error.message);
      else if (data.session) router.replace('/');
      else setMessage('Account created. Check your email to confirm your account.');
    } else {
      const { error } = await db.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
      else router.replace('/');
    }

    setBusy(false);
  }

  return (
    <main className="auth-shell">
      <motion.section
        className="auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="eyebrow">ANIME ASCENSION // ACCOUNT</p>
        <h1>{mode === 'login' ? 'Return to your journey.' : 'Create your ascension.'}</h1>
        <p className="muted">Your character and progression are saved to your account.</p>

        <label>
          EMAIL
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>

        <label>
          PASSWORD
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>

        <button className="primary" disabled={busy} onClick={submit}>
          {busy ? 'CONNECTING...' : mode === 'login' ? 'LOG IN' : 'CREATE ACCOUNT'}
        </button>

        <button
          className="text-button"
          onClick={() => {
            setMode(mode === 'login' ? 'signup' : 'login');
            setMessage('');
          }}
        >
          {mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Log in'}
        </button>

        {message && <p className="auth-message">{message}</p>}
      </motion.section>
    </main>
  );
}
