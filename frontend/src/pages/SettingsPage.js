// @author: fatima bashir
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { getToken, logoutAndRedirect } from '../utils/auth';

const SettingsPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [nameMsg, setNameMsg] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPw, setSavingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState('');
  const [facts, setFacts] = useState({});
  const [factsMsg, setFactsMsg] = useState('');
  const [ttsVoice, setTtsVoice] = useState(localStorage.getItem('ttsVoice') || 'verse');
  const [ttsRate, setTtsRate] = useState(localStorage.getItem('ttsRate') || '1.0');
  const [sampleText, setSampleText] = useState("Hi, I'm Gina. It's nice to chat with you today.");
  const [isPreviewing, setIsPreviewing] = useState(false);
  const previewAudioRef = useRef(null);
  const [availableVoices, setAvailableVoices] = useState(['verse','ember','alloy','aria','coral','sage']);
  const [journals, setJournals] = useState([]);
  const [newJournal, setNewJournal] = useState('');
  const [newTags, setNewTags] = useState('');
  const [voiceMsg, setVoiceMsg] = useState('');

  const token = getToken();

  useEffect(() => {
    if (!token) {
      navigate('/auth', { replace: true });
      return;
    }
    (async () => {
      try {
        const res = await fetch('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setUsername(data.user?.username || '');
        } else if (res.status === 401) {
          logoutAndRedirect('/auth');
        }
        const m = await fetch('/memories', { headers: { Authorization: `Bearer ${token}` } });
        if (m.ok) {
          const md = await m.json();
          setFacts(md.facts || {});
        }
        // Fetch supported TTS voices to prevent failing previews
        try {
          const v = await fetch('/tts/voices');
          if (v.ok) {
            const data = await v.json();
            if (Array.isArray(data.voices) && data.voices.length) setAvailableVoices(data.voices);
          }
        } catch {}
        // Load recent journals
        try {
          const j = await fetch('/journals?limit=50', { headers: { Authorization: `Bearer ${token}` } });
          if (j.ok) {
            const jd = await j.json();
            setJournals(jd.journals || []);
          }
        } catch {}
      } catch {
        // ignore
      }
    })();
  }, [token, navigate]);

  const saveUsername = async (e) => {
    e.preventDefault();
    if (!username || username.trim().length < 2) {
      setNameMsg('Username must be at least 2 characters.');
      return;
    }
    setSavingName(true);
    setNameMsg('');
    try {
      const res = await fetch('/auth/username', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ username: username.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update');
      setUser(data.user);
      setNameMsg('Saved');
      // Optional: small redirect signal for other pages that may cache name
      try { window.localStorage.setItem('lastUsername', username.trim()); } catch {}
    } catch (err) {
      setNameMsg(err.message);
    } finally {
      setSavingName(false);
    }
  };

  const saveFacts = async (e) => {
    e.preventDefault();
    setFactsMsg('');
    try {
      const res = await fetch('/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ facts })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      setFactsMsg('Personal info saved');
    } catch (err) {
      setFactsMsg(err.message);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPwMsg('New password must be at least 6 characters.');
      return;
    }
    setSavingPw(true);
    setPwMsg('');
    try {
      const res = await fetch('/auth/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update');
      setPwMsg('Password updated');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setPwMsg(err.message);
    } finally {
      setSavingPw(false);
    }
  };

  // Format birthday as DD-MM-YYYY with automatic hyphens while typing
  const formatBirthdayInput = (raw) => {
    const digits = String(raw || '').replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0,2)}-${digits.slice(2)}`;
    return `${digits.slice(0,2)}-${digits.slice(2,4)}-${digits.slice(4)}`;
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="sticky top-0 z-50 backdrop-blur-lg bg-white/10 border-b border-white/20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-white/10 rounded-full" title="Back" style={{ color: 'var(--text-secondary)' }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Settings</div>
          <ThemeToggle />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        <div className="wellness-card p-6">
          <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Profile</h2>
          <form onSubmit={saveUsername} className="space-y-3">
            <div>
              <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Username</label>
              <input className="input-field w-full" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Your display name" />
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" disabled={savingName} className="px-4 py-2 rounded-xl text-white" style={{ background: 'var(--gradient-primary)', opacity: savingName ? 0.7 : 1 }}>
                {savingName ? 'Saving…' : 'Save'}
              </button>
              {nameMsg && <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{nameMsg}</span>}
            </div>
          </form>
        </div>

        <div className="wellness-card p-6">
          <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Personal info (remembered)</h2>
          <form onSubmit={saveFacts} className="space-y-3">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Preferred name</label>
                <input className="input-field w-full" value={facts.preferredName || ''} onChange={(e) => setFacts(prev => ({ ...prev, preferredName: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Birthday (DD-MM-YYYY)</label>
                <input
                  className="input-field w-full"
                  placeholder="DD-MM-YYYY"
                  inputMode="numeric"
                  value={facts.birthday || ''}
                  onChange={(e) => setFacts(prev => ({ ...prev, birthday: formatBirthdayInput(e.target.value) }))}
                  maxLength={10}
                />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Hobbies / interests</label>
                <input className="input-field w-full" value={facts.hobbies || ''} onChange={(e) => setFacts(prev => ({ ...prev, hobbies: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Support network (trusted people)</label>
                <input className="input-field w-full" value={facts.support || ''} onChange={(e) => setFacts(prev => ({ ...prev, support: e.target.value }))} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" className="px-4 py-2 rounded-xl text-white" style={{ background: 'var(--gradient-primary)' }}>Save</button>
              {factsMsg && <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{factsMsg}</span>}
            </div>
          </form>
        </div>

        <div className="wellness-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Complete intake</h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Answer a few questions to personalize your experience.</p>
            </div>
            <button
              onClick={() => navigate('/intake')}
              className="px-4 py-2 rounded-xl text-white"
              style={{ background: 'var(--gradient-primary)' }}
            >
              Start intake
            </button>
          </div>
        </div>

        <div className="wellness-card p-6">
          <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Voice & speech</h2>
          <div className="grid md:grid-cols-3 gap-4 items-start">
            <div>
              <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Neural voice</label>
              <select className="input-field w-full" value={ttsVoice} onChange={(e) => setTtsVoice(e.target.value)}>
                {availableVoices.map(v => (
                  <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Speaking speed</label>
              <input type="number" step="0.05" min="0.8" max="1.2" className="input-field w-full" value={ttsRate} onChange={(e) => setTtsRate(e.target.value)} />
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>0.8–1.2 (default 1.0)</div>
            </div>
            <div className="mt-6">
                <button
                type="button"
                onClick={() => { localStorage.setItem('ttsVoice', ttsVoice); localStorage.setItem('ttsRate', ttsRate); setVoiceMsg(`Saved ${ttsVoice} at ${ttsRate}×`); setTimeout(() => setVoiceMsg(''), 1500); }}
                className="px-4 py-2 rounded-xl text-white"
                style={{ background: 'var(--gradient-primary)' }}
              >
                Save voice
              </button>
              {voiceMsg && (
                <div className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>{voiceMsg}</div>
              )}
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4 mt-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Preview text</label>
              <input className="input-field w-full" value={sampleText} onChange={(e) => setSampleText(e.target.value)} />
            </div>
            <div>
                <button
                type="button"
                onClick={async () => {
                  try {
                    // Stop previous
                    if (previewAudioRef.current) {
                      previewAudioRef.current.pause();
                      previewAudioRef.current.src = '';
                      previewAudioRef.current = null;
                    }
                    setIsPreviewing(true);
                    const resp = await fetch('/tts', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ text: sampleText, voice: ttsVoice })
                    });
                    if (!resp.ok) throw new Error('TTS preview failed');
                      // Expose headers so we can debug/fallback behavior
                      const used = resp.headers.get('X-TTS-Voice-Used');
                      const fb = resp.headers.get('X-TTS-Fallback');
                    const blob = await resp.blob();
                    const url = URL.createObjectURL(blob);
                    const audio = new Audio(url);
                    audio.playbackRate = Math.max(0.8, Math.min(1.2, parseFloat(ttsRate) || 1.0));
                    audio.onended = () => { setIsPreviewing(false); URL.revokeObjectURL(url); previewAudioRef.current = null; };
                    audio.onerror = () => { setIsPreviewing(false); URL.revokeObjectURL(url); previewAudioRef.current = null; };
                    previewAudioRef.current = audio;
                    audio.play();
                      if (fb === '1') {
                        setFactsMsg(`That voice is temporarily unavailable; previewed with ${used}.`);
                        setTimeout(() => setFactsMsg(''), 2000);
                      }
                  } catch (e) {
                    setIsPreviewing(false);
                      setFactsMsg('Unable to preview voice');
                    setTimeout(() => setFactsMsg(''), 1500);
                  }
                }}
                disabled={isPreviewing}
                className="px-4 py-2 rounded-xl text-white disabled:opacity-70"
                style={{ background: 'var(--gradient-primary)' }}
              >
                {isPreviewing ? 'Previewing…' : 'Preview voice'}
              </button>
            </div>
          </div>
        </div>

        {/* Journal moved to its own page under /journal */}

        <div className="wellness-card p-6">
          <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Change password</h2>
          <form onSubmit={changePassword} className="space-y-3">
            <div>
              <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Current password</label>
              <input type="password" className="input-field w-full" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>New password</label>
              <input type="password" className="input-field w-full" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" disabled={savingPw} className="px-4 py-2 rounded-xl text-white" style={{ background: 'var(--gradient-primary)', opacity: savingPw ? 0.7 : 1 }}>
                {savingPw ? 'Saving…' : 'Update password'}
              </button>
              {pwMsg && <span className="text-sm" style={{ color: pwMsg.includes('updated') ? '#10B981' : 'var(--text-secondary)' }}>{pwMsg}</span>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;


