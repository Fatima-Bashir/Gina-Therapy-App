// @author: fatima bashir
const Database = require('better-sqlite3');

// Initialize or open the SQLite database file in the backend folder
const db = new Database('data.sqlite');

// Ensure foreign key constraints are enforced
db.pragma('foreign_keys = ON');

// Create tables if they do not exist
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    username TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    history TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS intakes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    full_name TEXT,
    age INTEGER,
    pronouns TEXT,
    location TEXT,
    presenting_issues TEXT,
    goals TEXT,
    symptoms TEXT,
    severity INTEGER,
    duration TEXT,
    risk_factors TEXT,
    medications TEXT,
    history_therapy TEXT,
    preferences TEXT,
    availability TEXT,
    suggestion TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS memories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    facts TEXT NOT NULL DEFAULT '{}',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS journals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    tags TEXT DEFAULT '[]',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS metrics_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL, -- wellbeing | stress | mood
    value_num REAL,
    label TEXT,
    intensity_num REAL,
    notes TEXT,
    extras TEXT DEFAULT '{}',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'active', -- active | done | paused
    streak_count INTEGER DEFAULT 0,
    last_done DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

// Lightweight migration: add username column if missing (older DBs)
try {
  const columns = db.prepare('PRAGMA table_info(users)').all();
  const hasUsername = columns.some((c) => c.name === 'username');
  if (!hasUsername) {
    db.exec('ALTER TABLE users ADD COLUMN username TEXT');
  }
} catch (_) {
  // ignore
}

function getUserByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
}

function createUser(email, password_hash) {
  const info = db
    .prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)')
    .run(email, password_hash);
  return { id: info.lastInsertRowid, email };
}

function getUserById(id) {
  return db
    .prepare('SELECT id, email, username, created_at FROM users WHERE id = ?')
    .get(id);
}

function getUserWithPasswordById(id) {
  return db
    .prepare('SELECT id, email, username, password_hash, created_at FROM users WHERE id = ?')
    .get(id);
}

function updateUserUsername(user_id, username) {
  db.prepare('UPDATE users SET username = ? WHERE id = ?').run(username, user_id);
}

function setUserPasswordHash(user_id, password_hash) {
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(password_hash, user_id);
}

function getConversationByUserId(user_id) {
  return db
    .prepare(
      'SELECT * FROM conversations WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1'
    )
    .get(user_id);
}

function upsertConversation(user_id, historyJson) {
  const existing = getConversationByUserId(user_id);
  if (existing) {
    db.prepare(
      'UPDATE conversations SET history = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(historyJson, existing.id);
    return existing.id;
  }
  const info = db
    .prepare('INSERT INTO conversations (user_id, history) VALUES (?, ?)')
    .run(user_id, historyJson);
  return info.lastInsertRowid;
}

function deleteConversationsByUserId(user_id) {
  db.prepare('DELETE FROM conversations WHERE user_id = ?').run(user_id);
}

function getIntakeByUserId(user_id) {
  return db.prepare('SELECT * FROM intakes WHERE user_id = ?').get(user_id);
}

function upsertIntakeForUser(user_id, payload) {
  const existing = getIntakeByUserId(user_id);
  if (existing) {
    const fields = [
      'full_name','age','pronouns','location','presenting_issues','goals','symptoms','severity','duration','risk_factors','medications','history_therapy','preferences','availability','suggestion'
    ];
    const values = fields.map(f => payload[f] ?? existing[f]);
    db.prepare(`UPDATE intakes SET full_name=?, age=?, pronouns=?, location=?, presenting_issues=?, goals=?, symptoms=?, severity=?, duration=?, risk_factors=?, medications=?, history_therapy=?, preferences=?, availability=?, suggestion=?, updated_at=CURRENT_TIMESTAMP WHERE user_id=?`)
      .run(...values, user_id);
    return getIntakeByUserId(user_id);
  }
  db.prepare(`INSERT INTO intakes (user_id, full_name, age, pronouns, location, presenting_issues, goals, symptoms, severity, duration, risk_factors, medications, history_therapy, preferences, availability, suggestion) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(
      user_id,
      payload.full_name || null,
      payload.age || null,
      payload.pronouns || null,
      payload.location || null,
      payload.presenting_issues || null,
      payload.goals || null,
      payload.symptoms || null,
      payload.severity || null,
      payload.duration || null,
      payload.risk_factors || null,
      payload.medications || null,
      payload.history_therapy || null,
      payload.preferences || null,
      payload.availability || null,
      payload.suggestion || null
    );
  return getIntakeByUserId(user_id);
}

function getMemoryByUserId(user_id) {
  const row = db.prepare('SELECT * FROM memories WHERE user_id = ?').get(user_id);
  if (!row) return null;
  try { row.facts = JSON.parse(row.facts || '{}'); } catch { row.facts = {}; }
  return row;
}

function upsertMemoryForUser(user_id, facts) {
  const existing = getMemoryByUserId(user_id);
  const json = JSON.stringify(facts || {});
  if (existing) {
    db.prepare('UPDATE memories SET facts = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?')
      .run(json, user_id);
  } else {
    db.prepare('INSERT INTO memories (user_id, facts) VALUES (?, ?)').run(user_id, json);
  }
  return getMemoryByUserId(user_id);
}

function createJournal(user_id, content, tagsArray) {
  const tagsJson = JSON.stringify(Array.isArray(tagsArray) ? tagsArray : []);
  const info = db.prepare('INSERT INTO journals (user_id, content, tags) VALUES (?, ?, ?)').run(user_id, content, tagsJson);
  // Return full row including created_at to avoid Invalid Date on frontend for freshly created entries
  const row = db.prepare('SELECT id, user_id, content, tags, created_at FROM journals WHERE id = ?').get(info.lastInsertRowid);
  return { ...row, tags: safeParseJson(row.tags, []) };
}

function listJournalsForUser(user_id, limit = 50) {
  const rows = db.prepare('SELECT id, user_id, content, tags, created_at FROM journals WHERE user_id = ? ORDER BY created_at DESC LIMIT ?').all(user_id, limit);
  return rows.map(r => ({ ...r, tags: safeParseJson(r.tags, []) }));
}

function deleteJournal(user_id, journal_id) {
  db.prepare('DELETE FROM journals WHERE id = ? AND user_id = ?').run(journal_id, user_id);
}

function updateJournal(user_id, journal_id, content, tagsArray) {
  const tagsJson = JSON.stringify(Array.isArray(tagsArray) ? tagsArray : []);
  db.prepare('UPDATE journals SET content = ?, tags = ? WHERE id = ? AND user_id = ?').run(content, tagsJson, journal_id, user_id);
  const row = db.prepare('SELECT id, user_id, content, tags, created_at FROM journals WHERE id = ? AND user_id = ?').get(journal_id, user_id);
  if (!row) return null;
  return { ...row, tags: safeParseJson(row.tags, []) };
}

function searchJournals(user_id, { q = '', tag = '', from = '', to = '', limit = 100 }) {
  const clauses = ['user_id = ?'];
  const params = [user_id];
  if (q) { clauses.push('content LIKE ?'); params.push(`%${q}%`); }
  if (tag) { clauses.push('tags LIKE ?'); params.push(`%"${tag}"%`); }
  if (from) { clauses.push('datetime(created_at) >= datetime(?)'); params.push(from); }
  if (to) { clauses.push('datetime(created_at) <= datetime(?)'); params.push(to); }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const stmt = db.prepare(`SELECT id, user_id, content, tags, created_at FROM journals ${where} ORDER BY datetime(created_at) DESC LIMIT ?`);
  const rows = stmt.all(...params, limit);
  return rows.map(r => ({ ...r, tags: safeParseJson(r.tags, []) }));
}

function logMetric(user_id, type, payload) {
  const extras = JSON.stringify(payload.extras || {});
  db.prepare('INSERT INTO metrics_log (user_id, type, value_num, label, intensity_num, notes, extras) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(user_id, type, payload.value_num ?? null, payload.label || null, payload.intensity_num ?? null, payload.notes || null, extras);
}

function listMetrics(user_id, { type = null, limit = 100, from = '', to = '' }) {
  const clauses = ['user_id = ?'];
  const params = [user_id];
  if (type) { clauses.push('type = ?'); params.push(type); }
  if (from) { clauses.push('datetime(created_at) >= datetime(?)'); params.push(from); }
  if (to) { clauses.push('datetime(created_at) <= datetime(?)'); params.push(to); }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const rows = db.prepare(`SELECT id, type, value_num, label, intensity_num, notes, extras, created_at FROM metrics_log ${where} ORDER BY datetime(created_at) DESC LIMIT ?`).all(...params, limit);
  return rows.map(r => ({ ...r, extras: safeParseJson(r.extras, {}) }));
}

function createGoal(user_id, title) {
  const info = db.prepare('INSERT INTO goals (user_id, title) VALUES (?, ?)').run(user_id, title);
  return db.prepare('SELECT * FROM goals WHERE id = ?').get(info.lastInsertRowid);
}

function listGoals(user_id) {
  return db.prepare('SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC').all(user_id);
}

function updateGoal(user_id, id, updates) {
  const existing = db.prepare('SELECT * FROM goals WHERE id = ? AND user_id = ?').get(id, user_id);
  if (!existing) return null;
  const title = updates.title ?? existing.title;
  const status = updates.status ?? existing.status;
  const streak = updates.streak_count ?? existing.streak_count;
  const lastDone = updates.last_done ?? existing.last_done;
  db.prepare('UPDATE goals SET title = ?, status = ?, streak_count = ?, last_done = ? WHERE id = ? AND user_id = ?')
    .run(title, status, streak, lastDone, id, user_id);
  return db.prepare('SELECT * FROM goals WHERE id = ?').get(id);
}

function deleteGoal(user_id, id) {
  db.prepare('DELETE FROM goals WHERE id = ? AND user_id = ?').run(id, user_id);
}


function safeParseJson(str, fallback) {
  try { return JSON.parse(str || ''); } catch { return fallback; }
}

module.exports = {
  getUserByEmail,
  createUser,
  getUserById,
  getConversationByUserId,
  upsertConversation,
  deleteConversationsByUserId,
  getIntakeByUserId,
  upsertIntakeForUser,
  getMemoryByUserId,
  upsertMemoryForUser,
  createJournal,
  listJournalsForUser,
  deleteJournal,
  getUserWithPasswordById,
  updateUserUsername,
  setUserPasswordHash,
};


