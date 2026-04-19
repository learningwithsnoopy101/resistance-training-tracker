import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setMessage('Account created! You can now sign in.');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-page flex items-center justify-center p-4">
      <div className="bg-cream rounded-card shadow-card border-[0.5px] border-taupe p-8 w-full max-w-sm">
        <h1 className="text-h1-warm text-ink mb-2">Resistance Tracker</h1>
        <p className="text-xs-warm text-ink-muted mb-6">{isSignUp ? 'Create your account' : 'Sign in to your account'}</p>

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
          </div>

          {error && <p className="text-xs-warm text-warn-ink">{error}</p>}
          {message && <p className="text-xs-warm text-lower-body-ink">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink hover:opacity-90 disabled:opacity-50 text-cream font-medium py-2 px-4 rounded-input transition focus:outline-none focus:ring-2 focus:ring-lower-body"
          >
            {loading ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <button
          onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage(''); }}
          className="mt-4 w-full text-xs-warm text-ink-muted hover:text-ink transition"
        >
          {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  );
}
