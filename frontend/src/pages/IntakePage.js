// @author: fatima bashir
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { getToken } from '../utils/auth';

const initialState = {
  full_name: '', age: '', pronouns: '', location: '',
  presenting_issues: '', goals: '', symptoms: '', severity: 3,
  duration: '', risk_factors: '', medications: '', history_therapy: '',
  preferences: '', availability: ''
};

export default function IntakePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const token = getToken();

  useEffect(() => {
    if (!token) { navigate('/auth', { replace: true }); return; }
    (async () => {
      try {
        const res = await fetch('/intake', { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          if (data.intake) {
            const { suggestion, updated_at, id, user_id, ...rest } = data.intake;
            setForm({ ...initialState, ...rest, severity: rest.severity ?? 3 });
            if (suggestion) setMessage(`Current suggestion: ${suggestion}`);
          }
        }
      } catch {}
    })();
  }, [token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setMessage('');
    try {
      const res = await fetch('/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          age: form.age ? Number(form.age) : null,
          severity: form.severity ? Number(form.severity) : null,
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      setMessage(`Saved. Suggested therapy: ${data.intake.suggestion}`);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="sticky top-0 z-50 backdrop-blur-lg bg-white/10 border-b border-white/20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-white/10 rounded-full" title="Back" style={{ color: 'var(--text-secondary)' }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Therapy Intake</div>
          <ThemeToggle />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section: Basic information */}
          <section className="wellness-card p-6">
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Basic information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Full name</label>
                <input name="full_name" className="input-field w-full" value={form.full_name} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Age</label>
                <input name="age" type="number" min="1" className="input-field w-full" value={form.age} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Pronouns</label>
                <select name="pronouns" className="input-field w-full" value={form.pronouns} onChange={handleChange}>
                  <option value="">Select…</option>
                  <option>she/her</option>
                  <option>he/him</option>
                  <option>they/them</option>
                  <option>prefer to self‑describe</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Location</label>
                <input name="location" className="input-field w-full" value={form.location} onChange={handleChange} />
              </div>
            </div>
          </section>

          {/* Section: Presenting concerns */}
          <section className="wellness-card p-6">
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Presenting concerns</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>What brings you here?</label>
                <textarea name="presenting_issues" className="input-field w-full" rows={3} value={form.presenting_issues} onChange={handleChange} />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Symptoms</label>
                  <textarea name="symptoms" className="input-field w-full" rows={3} value={form.symptoms} onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Goals for therapy</label>
                  <textarea name="goals" className="input-field w-full" rows={3} value={form.goals} onChange={handleChange} />
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4 items-center">
                <div>
                  <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Severity</label>
                  <input name="severity" type="range" min="1" max="5" step="1" className="w-full" value={form.severity} onChange={handleChange} />
                  <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Current: {form.severity}</div>
                </div>
                <div>
                  <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>How long has this been going on?</label>
                  <input name="duration" className="input-field w-full" placeholder="e.g., 3 months" value={form.duration} onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Risk factors (safety concerns)</label>
                  <textarea name="risk_factors" className="input-field w-full" rows={2} value={form.risk_factors} onChange={handleChange} />
                </div>
              </div>
            </div>
          </section>

          {/* Section: History */}
          <section className="wellness-card p-6">
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>History</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Current medications</label>
                <input name="medications" className="input-field w-full" value={form.medications} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Past therapy (what helped / didn’t help)</label>
                <textarea name="history_therapy" className="input-field w-full" rows={2} value={form.history_therapy} onChange={handleChange} />
              </div>
            </div>
          </section>

          {/* Preferences & logistics removed per request */}

          {message && (
            <div className="wellness-card p-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{message}</div>
          )}

          <div className="flex items-center gap-3">
            <button type="submit" disabled={loading} className="px-6 py-3 rounded-xl text-white" style={{ background: 'var(--gradient-primary)', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Saving…' : 'Save intake'}
            </button>
            <button type="button" onClick={() => navigate('/dashboard')} className="px-6 py-3 rounded-xl border" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
              Back to Dashboard
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


