// @author: fatima bashir
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { clearAuth } from '../utils/auth';

const AuthPage = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const switchMode = () => {
    setMode((m) => (m === 'login' ? 'register' : 'login'));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const url = mode === 'login' ? '/auth/login' : '/auth/register';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="sticky top-0 z-50 backdrop-blur-lg bg-white/10 border-b border-white/20">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-full"
            title="Back"
            style={{ color: 'var(--text-secondary)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Account</div>
          <ThemeToggle />
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-12">
        <div className="wellness-card p-8">
          <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
            {mode === 'login' ? 'Log in' : 'Create an account'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Email</label>
              <input
                type="email"
                className="input-field w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <input
                type="password"
                className="input-field w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-medium shadow-lg hover:shadow-xl transition-all"
              style={{ background: 'var(--gradient-primary)', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Please wait…' : (mode === 'login' ? 'Log in' : 'Create account')}
            </button>
          </form>

          <div className="mt-6 space-y-3 text-center">
            <button
              onClick={switchMode}
              className="text-sm font-medium underline decoration-1 underline-offset-2"
              style={{ color: 'var(--accent-primary)' }}
            >
              {mode === 'login' ? "Don't have an account? Create one" : 'Have an account? Log in'}
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 border-t" style={{ borderColor: 'var(--border-color)' }} />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>or</span>
              <div className="flex-1 border-t" style={{ borderColor: 'var(--border-color)' }} />
            </div>

            <button
              onClick={() => { clearAuth(); navigate('/dashboard', { replace: true }); }}
              className="w-full py-3 rounded-xl font-medium border hover:shadow-sm transition-all"
              style={{
                background: 'transparent',
                color: 'var(--text-primary)',
                borderColor: 'var(--border-color)'
              }}
            >
              Continue as guest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;


