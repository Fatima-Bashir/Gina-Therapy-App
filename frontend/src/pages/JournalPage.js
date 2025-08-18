// @author: fatima bashir
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

const JournalPage = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) { navigate('/auth', { replace: true }); return; }
    (async () => {
      try {
        const r = await fetch('/journals?limit=100', { headers: { Authorization: `Bearer ${token}` } });
        if (r.ok) {
          const data = await r.json();
          setEntries(data.journals || []);
        }
      } catch {}
    })();
  }, [token, navigate]);

  const runSearch = async () => {
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('q', search.trim());
      if (tagFilter.trim()) params.set('tag', tagFilter.trim());
      if (dateFrom) params.set('from', dateFrom);
      if (dateTo) params.set('to', dateTo);
      const r = await fetch(`/journals/search?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) {
        const d = await r.json();
        setEntries(d.journals || []);
      }
    } catch {}
  };

  const addEntry = async () => {
    if (!content.trim()) return;
    try {
      const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
      const r = await fetch('/journals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: content.trim(), tags: tagList })
      });
      if (r.ok) {
        const d = await r.json();
        setEntries([d.journal, ...entries]);
        setContent(''); setTags('');
      }
    } catch {}
  };

  const deleteEntry = async (id) => {
    try {
      const r = await fetch(`/journals/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) {
        setEntries(entries.filter(e => e.id !== id));
      }
    } catch {}
  };

  const allTags = useMemo(() => {
    const set = new Set();
    entries.forEach(e => (Array.isArray(e.tags) ? e.tags : []).forEach(t => set.add(t)));
    return Array.from(set).slice(0, 12);
  }, [entries]);

  const filtered = useMemo(() => {
    const tf = tagFilter.trim().toLowerCase();
    if (!tf) return entries;
    return entries.filter(e => (Array.isArray(e.tags) ? e.tags : []).some(t => t.toLowerCase().includes(tf)));
  }, [entries, tagFilter]);

  // Format dates consistently in Pacific Time (date only, no time)
  const formatPST = (value) => {
    try {
      const d = value ? new Date(value) : null;
      if (!d || isNaN(d.getTime())) return '';
      return d.toLocaleDateString('en-US', {
        timeZone: 'America/Los_Angeles',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
      });
    } catch {
      return '';
    }
  };

  const selectedEntry = useMemo(() => {
    return filtered.find(e => e.id === selectedId) || null;
  }, [filtered, selectedId]);

  const currentIndex = useMemo(() => {
    return filtered.findIndex(e => e.id === selectedId);
  }, [filtered, selectedId]);

  const openEntry = (id) => setSelectedId(id);
  const closeEntry = () => setSelectedId(null);
  const prevEntry = () => {
    if (currentIndex > 0) setSelectedId(filtered[currentIndex - 1].id);
  };
  const nextEntry = () => {
    if (currentIndex >= 0 && currentIndex + 1 < filtered.length) setSelectedId(filtered[currentIndex + 1].id);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="sticky top-0 z-50 backdrop-blur-lg bg-white/10 border-b border-white/20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-white/10 rounded-full" title="Back" style={{ color: 'var(--text-secondary)' }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Journal</div>
          <ThemeToggle />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 grid lg:grid-cols-3 gap-6">
        {/* Composer */}
        <div className="lg:col-span-2 journal-wrapper">
          <div className="journal-paper">
            <div className="journal-toolbar px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20l9-5-9-5-9 5 9 5z"/></svg>
                </div>
                <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {selectedEntry ? (
                    <span>Entry • {formatPST(selectedEntry.created_at)}</span>
                  ) : (
                    'New entry'
                  )}
                </div>
              </div>
              {selectedEntry ? (
                <div className="flex items-center gap-2">
                  <button onClick={prevEntry} disabled={currentIndex <= 0} className="px-3 py-2 rounded-xl border disabled:opacity-50" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)', background: 'transparent' }}>Prev</button>
                  <button onClick={nextEntry} disabled={currentIndex < 0 || currentIndex + 1 >= filtered.length} className="px-3 py-2 rounded-xl border disabled:opacity-50" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)', background: 'transparent' }}>Next</button>
                  <button onClick={closeEntry} className="px-4 py-2 rounded-xl text-white" style={{ background: 'var(--gradient-primary)' }}>Close</button>
                </div>
              ) : (
                <button onClick={addEntry} className="px-5 py-2.5 rounded-xl text-white shadow-md hover:shadow-lg transition-all" style={{ background: 'var(--gradient-primary)' }}>Add entry</button>
              )}
            </div>
            <div className="journal-lines">
              {selectedEntry ? (
                <div className="journal-readonly" style={{ whiteSpace: 'pre-wrap' }}>{selectedEntry.content}</div>
              ) : (
                <textarea className="journal-textarea" placeholder="What’s on your mind?" value={content} onChange={(e) => setContent(e.target.value)} />
              )}
            </div>
          </div>
          {!selectedEntry && (
          <div className="mt-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input className="input-field w-full" placeholder="Tags (comma separated)" value={tags} onChange={(e) => setTags(e.target.value)} />
              <div className="flex items-center gap-2 flex-wrap">
                {allTags.map(t => (
                  <button key={t} type="button" className="px-2 py-0.5 text-xs rounded-full hover:opacity-90" style={{ background: 'var(--surface-variant)', color: 'var(--text-secondary)' }} onClick={() => setTags(v => (v ? v + ', ' + t : t))}>#{t}</button>
                ))}
              </div>
            </div>
          </div>
          )}
        </div>

        {/* List */}
        <div className="space-y-4 lg:col-span-1">
          <div className="wellness-card p-4 space-y-3">
            <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Find entries</div>
            <div className="grid grid-cols-2 gap-2">
              <input className="input-field" placeholder="Search text" value={search} onChange={(e) => setSearch(e.target.value)} />
              <input className="input-field" placeholder="Filter by tag" value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} />
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>From date</label>
                <input type="date" className="input-field" aria-label="From date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>To date</label>
                <input type="date" className="input-field" aria-label="To date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button onClick={runSearch} className="px-3 py-2 rounded-xl text-white" style={{ background: 'var(--gradient-primary)' }}>Search</button>
              <button onClick={() => { setSearch(''); setTagFilter(''); setDateFrom(''); setDateTo(''); }} className="px-3 py-2 rounded-xl border" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)', background: 'transparent' }}>Clear</button>
            </div>
          </div>
          {filtered.length === 0 ? (
            <div className="wellness-card p-8 text-center" style={{ color: 'var(--text-secondary)' }}>
              No entries yet. Write your first reflection on the left!
            </div>
          ) : (
            filtered.map(j => (
              <div key={j.id} className="p-5 rounded-2xl relative overflow-hidden cursor-pointer hover:opacity-95" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }} onClick={() => openEntry(j.id)}>
                <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ background: 'radial-gradient(600px 200px at 10% -10%, var(--accent-primary) 0, transparent 60%)' }} />
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{formatPST(j.created_at)}</div>
                  <button className="p-1 rounded hover:bg-white/10" title="Delete" onClick={(e) => { e.stopPropagation(); deleteEntry(j.id); }} style={{ color: 'var(--text-secondary)' }}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 7h12M9 7l1 12m4-12l-1 12M4 7l1 14a2 2 0 002 2h10a2 2 0 002-2l1-14M10 7V5a2 2 0 012-2h0a2 2 0 012 2v2"/></svg>
                  </button>
                </div>
                <div className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{j.content}</div>
                {Array.isArray(j.tags) && j.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {j.tags.map((t,i) => (
                      <span key={i} className="px-2 py-0.5 text-xs rounded-full" style={{ background: 'var(--surface-variant)', color: 'var(--text-secondary)' }}>#{t}</span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default JournalPage;


