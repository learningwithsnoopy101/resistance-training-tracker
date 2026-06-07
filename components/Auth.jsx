import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup' | 'forgot'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const switchMode = (next) => {
    setMode(next);
    setError('');
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setMessage('Account created! You can now sign in.');

    } else if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);

    } else if (mode === 'forgot') {
      const redirectTo = `${window.location.origin}${window.location.pathname}`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) setError(error.message);
      else setMessage('Reset link sent — check your email.');
    }

    setLoading(false);
  };

  const isForgot = mode === 'forgot';
  const isSignUp = mode === 'signup';

  return (
    <div className="min-h-screen bg-page flex items-center justify-center p-4">
      <div className="bg-cream rounded-card shadow-card border-[0.5px] border-taupe p-8 w-full max-w-sm">
        <h1 className="text-h1-warm text-ink mb-2">Resistance Tracker</h1>
        <p className="text-xs-warm text-ink-muted mb-6">
          {isForgot ? 'Reset your password' : isSignUp ? 'Create your account' : 'Sign in to your account'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs-warm font-medium text-ink mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full px-3 py-2 bg-cream border-[0.5px] border-taupe rounded-input text-sm-warm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-lower-body focus:border-lower-body"
            />
          </div>

          {!isForgot && (
            <div>
              <label className="block text-xs-warm font-medium text-ink mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={6}
                className="w-full px-3 py-2 bg-cream border-[0.5px] border-taupe rounded-input text-sm-warm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-lower-body focus:border-lower-body"
              />
              {mode === 'signin' && (
                <button
                  type="button"
                  onClick={() => switchMode('forgot')}
                  className="mt-1 text-xs-warm text-ink-muted hover:text-ink transition"
                >
                  Forgot password?
                </button>
              )}
            </div>
          )}

          {error && <p className="text-xs-warm text-warn-ink">{error}</p>}
          {message && <p className="text-xs-warm text-lower-body-ink">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink hover:opacity-90 disabled:opacity-50 text-cream font-medium py-2 px-4 rounded-input transition focus:outline-none focus:ring-2 focus:ring-lower-body"
          >
            {loading
              ? 'Please wait...'
              : isForgot
              ? 'Send reset link'
              : isSignUp
              ? 'Create account'
              : 'Sign in'}
          </button>
        </form>

        <div className="mt-4 flex flex-col gap-1">
          {isForgot ? (
            <button
              onClick={() => switchMode('signin')}
              className="w-full text-xs-warm text-ink-muted hover:text-ink transition"
            >
              Back to sign in
            </button>
          ) : (
            <button
              onClick={() => switchMode(isSignUp ? 'signin' : 'signup')}
              className="w-full text-xs-warm text-ink-muted hover:text-ink transition"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
