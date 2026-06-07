import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

export function ChangePassword({ onClose }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(onClose, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/30">
      <div className="bg-cream rounded-card border-[0.5px] border-taupe shadow-card w-full max-w-sm p-6">
        <h2 className="text-h2-warm text-ink mb-4">Change password</h2>

        {success ? (
          <p className="text-xs-warm text-lower-body-ink">Password updated successfully.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs-warm font-medium text-ink mb-1">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-cream border-[0.5px] border-taupe rounded-input text-sm-warm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-lower-body focus:border-lower-body"
              />
            </div>
            <div>
              <label className="block text-xs-warm font-medium text-ink mb-1">Confirm new password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-cream border-[0.5px] border-taupe rounded-input text-sm-warm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-lower-body focus:border-lower-body"
              />
            </div>

            {error && <p className="text-xs-warm text-warn-ink">{error}</p>}

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-ink hover:opacity-90 disabled:opacity-50 text-cream font-medium py-2 px-4 rounded-input text-xs-warm transition"
              >
                {loading ? 'Updating...' : 'Update password'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border-[0.5px] border-taupe text-ink-muted hover:text-ink text-xs-warm py-2 px-4 rounded-input transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
