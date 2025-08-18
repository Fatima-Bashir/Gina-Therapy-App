// @author: fatima bashir
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
const JWT_SECRET = process.env.JWT_SECRET || 'change-me';

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Known working voices for gpt-4o-mini-tts (trimmed to reliably previewable set)
// If OpenAI adds more, we can extend this list.
const SUPPORTED_TTS_VOICES = ['verse', 'ember', 'alloy', 'aria', 'coral', 'sage'];

// Middleware
app.use(cors());
app.use(express.json());

// Optional auth middleware: parses JWT if provided
function authOptional(req, _res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            const token = authHeader.slice(7);
            req.user = jwt.verify(token, JWT_SECRET);
        } catch (_) {
            // ignore invalid token
        }
    }
    next();
}

// Strict auth middleware: requires a valid user
function requireAuth(req, res, next) {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    next();
}

app.use(authOptional);

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ message: 'GinaAI Backend Server is running!' });
});

// Auth: register
app.post('/auth/register', (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const existing = db.getUserByEmail(String(email).toLowerCase());
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    const password_hash = bcrypt.hashSync(password, 10);
    const user = db.createUser(String(email).toLowerCase(), password_hash);
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: db.getUserById(user.id), token });
});

// Auth: login
app.post('/auth/login', (req, res) => {
    const { email, password } = req.body || {};
    const row = db.getUserByEmail(String(email || '').toLowerCase());
    if (!row) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = bcrypt.compareSync(password || '', row.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: row.id, email: row.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: { id: row.id, email: row.email }, token });
});

// Auth: current user
app.get('/auth/me', requireAuth, (req, res) => {
    const user = db.getUserById(req.user.id);
    res.json({ user });
});

// Settings: update username
app.put('/auth/username', requireAuth, (req, res) => {
    const { username } = req.body || {};
    if (typeof username !== 'string' || username.trim().length < 2) {
        return res.status(400).json({ error: 'Username must be at least 2 characters' });
    }
    db.updateUserUsername(req.user.id, username.trim());
    const user = db.getUserById(req.user.id);
    res.json({ user });
});

// Settings: change password
app.put('/auth/password', requireAuth, (req, res) => {
    const { currentPassword, newPassword } = req.body || {};
    if (!newPassword || String(newPassword).length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }
    const row = db.getUserWithPasswordById(req.user.id);
    const ok = bcrypt.compareSync(currentPassword || '', row.password_hash);
    if (!ok) return res.status(401).json({ error: 'Current password is incorrect' });
    const password_hash = bcrypt.hashSync(newPassword, 10);
    db.setUserPasswordHash(req.user.id, password_hash);
    res.json({ success: true });
});

// ------- Memory helpers -------
async function extractPersonalFactsFromMessage(message) {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: 'system', content: 'Extract only stable personal facts/preferences from the user message. Output strictly a JSON object with short snake_case keys. If none, return {}. Do NOT include explanations.' },
                { role: 'user', content: message }
            ],
            temperature: 0.1,
            max_tokens: 200
        });
        const text = completion.choices[0].message.content || '{}';
        try { return JSON.parse(text); } catch { return {}; }
    } catch (_) {
        return {};
    }
}

async function updateConversationSummary(userId, lastUser, lastAssistant) {
    try {
        const currentFacts = db.getMemoryByUserId(userId)?.facts || {};
        const prevSummary = currentFacts.summary || '';
        const prompt = `Update the running summary of this user's conversation.
Previous summary:\n${prevSummary}\n\nNew exchange:\nUser: ${lastUser}\nAssistant: ${lastAssistant}\n\nReturn ONLY the updated concise summary (2-4 sentences).`;
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [ { role: 'system', content: 'You are a concise conversation summarizer.' }, { role: 'user', content: prompt } ],
            temperature: 0.3,
            max_tokens: 200
        });
        const summary = completion.choices[0].message.content || prevSummary;
        const merged = { ...currentFacts, summary };
        db.upsertMemoryForUser(userId, merged);
    } catch (_) { /* ignore summarizer failure */ }
}

function buildUserContextString(userId) {
    const intake = db.getIntakeByUserId(userId);
    const factsRow = db.getMemoryByUserId(userId);
    const facts = factsRow?.facts || {};
    const parts = [];
    if (facts.preferredName) parts.push(`Preferred name: ${facts.preferredName}`);
    if (facts.pronouns) parts.push(`Pronouns: ${facts.pronouns}`);
    if (facts.age) parts.push(`Age: ${facts.age}`);
    if (facts.location) parts.push(`Location: ${facts.location}`);
    if (facts.hobbies) parts.push(`Hobbies: ${facts.hobbies}`);
    if (facts.support) parts.push(`Support network: ${facts.support}`);
    if (intake) {
        if (intake.full_name) parts.push(`Intake name: ${intake.full_name}`);
        if (intake.age) parts.push(`Intake age: ${intake.age}`);
        if (intake.pronouns) parts.push(`Intake pronouns: ${intake.pronouns}`);
        if (intake.location) parts.push(`Intake location: ${intake.location}`);
        if (intake.presenting_issues) parts.push(`Presenting issues: ${intake.presenting_issues}`);
        if (intake.goals) parts.push(`Therapy goals: ${intake.goals}`);
        if (intake.symptoms) parts.push(`Symptoms: ${intake.symptoms}`);
        if (intake.severity) parts.push(`Severity (1-5): ${intake.severity}`);
        if (intake.duration) parts.push(`Duration: ${intake.duration}`);
        if (intake.risk_factors) parts.push(`Risk factors: ${intake.risk_factors}`);
        if (intake.medications) parts.push(`Medications: ${intake.medications}`);
        if (intake.history_therapy) parts.push(`Past therapy history: ${intake.history_therapy}`);
        if (intake.preferences) parts.push(`Preferences: ${intake.preferences}`);
        if (intake.availability) parts.push(`Availability: ${intake.availability}`);
        if (intake.suggestion) parts.push(`Suggested therapy: ${intake.suggestion}`);
    }
    if (facts.summary) parts.push(`Conversation summary: ${facts.summary}`);

    // Include last known mental metrics if present in memories
    try {
        const mm = facts.lastMentalMetrics || {};
        const mmLines = [];
        if (mm.wellbeing && typeof mm.wellbeing.value !== 'undefined') {
            const wb = mm.wellbeing;
            mmLines.push(`Wellbeing: ${wb.value}%${typeof wb.trend !== 'undefined' ? ` (trend ${wb.trend >= 0 ? '+' : ''}${wb.trend})` : ''}${wb.notes ? ` — Notes: ${wb.notes}` : ''}`);
        }
        if (mm.stressLevel && (typeof mm.stressLevel.value !== 'undefined' || mm.stressLevel.label)) {
            const s = mm.stressLevel;
            const stressors = Array.isArray(s.stressors) && s.stressors.length ? ` — Stressors: ${s.stressors.join(', ')}` : '';
            const notes = s.notes ? ` — Notes: ${s.notes}` : '';
            mmLines.push(`Stress level: ${s.label || ''}${typeof s.value !== 'undefined' ? ` (${s.value})` : ''}${typeof s.trend !== 'undefined' ? ` (trend ${s.trend >= 0 ? '+' : ''}${s.trend})` : ''}${stressors}${notes}`);
        }
        if (mm.mood && (mm.mood.value || typeof mm.mood.intensity !== 'undefined')) {
            const m = mm.mood;
            const triggers = Array.isArray(m.triggers) && m.triggers.length ? ` — Triggers: ${m.triggers.join(', ')}` : '';
            const notes = m.notes ? ` — Notes: ${m.notes}` : '';
            mmLines.push(`Mood: ${m.value || ''}${typeof m.intensity !== 'undefined' ? ` (intensity ${m.intensity}/10)` : ''}${triggers}${notes}`);
        }
        if (mmLines.length) {
            parts.push('MENTAL METRICS:');
            mmLines.forEach(l => parts.push(l));
        }
    } catch (_) { /* ignore mm parse issues */ }
    if (parts.length === 0) return '';
    return `USER PROFILE CONTEXT (authoritative intake + known facts):\n- ${parts.join('\n- ')}`;
}

// Chat endpoint - placeholder for AI integration
app.post('/chat', async (req, res) => {
    try {
        let { message, conversationHistory = [], mentalMetrics = null } = req.body || {};

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // If no history passed in, load last saved conversation as fallback
        if (conversationHistory.length === 0 && req.user?.id) {
            const row = db.getConversationByUserId(req.user.id);
            if (row) {
                try { conversationHistory = JSON.parse(row.history) || []; } catch { conversationHistory = []; }
            }
        }

        // Build a memory preamble with intake + personal facts + summary
        let memoryPreamble = '';
        if (req.user && req.user.id) {
            const ctx = buildUserContextString(req.user.id);
            if (ctx) memoryPreamble = `Use the following context when helpful and accurate. If unclear, ask a short clarifying question.\n${ctx}`;
        }

        // If frontend provided mental metrics, append them to the memory preamble
        try {
            if (mentalMetrics && typeof mentalMetrics === 'object') {
                const mm = mentalMetrics;
                const mmLines = [];
                if (mm.wellbeing) mmLines.push(`Wellbeing: ${mm.wellbeing.value}%${typeof mm.wellbeing.trend !== 'undefined' ? ` (trend ${mm.wellbeing.trend >= 0 ? '+' : ''}${mm.wellbeing.trend})` : ''}${mm.wellbeing.notes ? ` — Notes: ${mm.wellbeing.notes}` : ''}`);
                if (mm.stressLevel) {
                    const s = mm.stressLevel;
                    const stressors = Array.isArray(s.stressors) && s.stressors.length ? ` — Stressors: ${s.stressors.join(', ')}` : '';
                    const notes = s.notes ? ` — Notes: ${s.notes}` : '';
                    mmLines.push(`Stress level: ${s.label} (${s.value})${typeof s.trend !== 'undefined' ? ` (trend ${s.trend >= 0 ? '+' : ''}${s.trend})` : ''}${stressors}${notes}`);
                }
                if (mm.mood) {
                    const m = mm.mood;
                    const triggers = Array.isArray(m.triggers) && m.triggers.length ? ` — Triggers: ${m.triggers.join(', ')}` : '';
                    const notes = m.notes ? ` — Notes: ${m.notes}` : '';
                    mmLines.push(`Mood: ${m.value} (intensity ${m.intensity}/10)${triggers}${notes}`);
                }
                if (mmLines.length) {
                    const mmText = `\nMENTAL METRICS (user-reported):\n- ${mmLines.join('\n- ')}`;
                    memoryPreamble = memoryPreamble ? `${memoryPreamble}\n${mmText}` : mmText;
                }
                // Persist metrics into memories on the backend for continuity
                if (req.user && req.user.id) {
                    try {
                        const current = db.getMemoryByUserId(req.user.id)?.facts || {};
                        db.upsertMemoryForUser(req.user.id, { ...current, lastMentalMetrics: mentalMetrics, lastMetricsUpdatedAt: new Date().toISOString() });
                    } catch (_) {}
                }
            }
        } catch (_) { /* ignore malformed metrics */ }

        // Get AI response from OpenAI GPT-4o, passing context as an additional system message
        const aiResponse = await getOpenAIResponse(message, conversationHistory, memoryPreamble);

        // Build new history
        const newHistory = Array.isArray(conversationHistory)
            ? [...conversationHistory, { type: 'user', content: message }, { type: 'assistant', content: aiResponse }]
            : [{ type: 'user', content: message }, { type: 'assistant', content: aiResponse }];

        // If authenticated, persist conversation and update memories
        if (req.user && req.user.id) {
            db.upsertConversation(req.user.id, JSON.stringify(newHistory));
            // Extract stable personal facts from the latest user message
            extractPersonalFactsFromMessage(message).then(facts => {
                if (facts && Object.keys(facts).length > 0) {
                    const current = db.getMemoryByUserId(req.user.id)?.facts || {};
                    db.upsertMemoryForUser(req.user.id, { ...current, ...facts });
                }
            }).catch(() => {});
            // Update running summary
            updateConversationSummary(req.user.id, message, aiResponse).catch(() => {});
        }

        res.json({
            response: aiResponse,
            timestamp: new Date().toISOString(),
            messageId: Date.now().toString(),
            saved: !!(req.user && req.user.id),
        });

    } catch (error) {
        console.error('Chat endpoint error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Fetch latest saved conversation for the authenticated user
app.get('/conversations/latest', requireAuth, (req, res) => {
    const row = db.getConversationByUserId(req.user.id);
    if (!row) return res.json({ history: [] });
    try {
        const history = JSON.parse(row.history);
        res.json({ history, updatedAt: row.updated_at });
    } catch (_) {
        res.json({ history: [] });
    }
});

// Clear conversation history for the authenticated user
app.delete('/conversations', requireAuth, (req, res) => {
    try {
        db.deleteConversationsByUserId(req.user.id);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Failed to clear conversations' });
    }
});

// Intake form: create or update, and return a therapy suggestion
app.post('/intake', requireAuth, (req, res) => {
    const input = req.body || {};
    // Simple heuristic suggestion (can be improved or replaced with model later)
    const issues = `${input.presenting_issues || ''} ${input.symptoms || ''}`.toLowerCase();
    let suggestion = 'Supportive Therapy';
    if (issues.match(/trauma|ptsd/)) suggestion = 'Trauma-focused CBT or EMDR';
    else if (issues.match(/anxiety|panic/)) suggestion = 'CBT (with exposure)';
    else if (issues.match(/depress|sad|low mood/)) suggestion = 'CBT or Behavioral Activation';
    else if (issues.match(/borderline|emotion regulation|self-harm/)) suggestion = 'DBT (Dialectical Behavior Therapy)';
    else if (issues.match(/ocd|compulsion|obsess/)) suggestion = 'ERP (Exposure and Response Prevention)';
    else if (issues.match(/relationship|couples/)) suggestion = 'Couples Therapy (Emotion-Focused or Gottman)';

    const record = db.upsertIntakeForUser(req.user.id, { ...input, suggestion });

    // Also fold key intake fields into persistent personal memories
    try {
        const currentFacts = db.getMemoryByUserId(req.user.id)?.facts || {};
        const mergedFacts = {
            ...currentFacts,
            preferredName: input.full_name || currentFacts.preferredName,
            pronouns: input.pronouns || currentFacts.pronouns,
            age: input.age ?? currentFacts.age,
            location: input.location || currentFacts.location,
            goals: input.goals || currentFacts.goals,
            presentingIssues: input.presenting_issues || currentFacts.presentingIssues,
            therapySuggestion: suggestion || currentFacts.therapySuggestion,
            intakeLastUpdated: new Date().toISOString(),
        };
        db.upsertMemoryForUser(req.user.id, mergedFacts);
    } catch (e) {
        console.warn('Failed to sync intake to memories:', e);
    }

    res.json({ intake: record });
});

// Get intake for current user
app.get('/intake', requireAuth, (req, res) => {
    const record = db.getIntakeByUserId(req.user.id);
    res.json({ intake: record || null });
});

// Intake summary for user consumption
app.get('/intake/summary', requireAuth, (req, res) => {
    const intake = db.getIntakeByUserId(req.user.id) || {};
    const facts = db.getMemoryByUserId(req.user.id)?.facts || {};
    const lines = [];
    if (intake.full_name) lines.push(`Name: ${intake.full_name}`);
    if (intake.age) lines.push(`Age: ${intake.age}`);
    if (intake.pronouns) lines.push(`Pronouns: ${intake.pronouns}`);
    if (intake.location) lines.push(`Location: ${intake.location}`);
    if (intake.presenting_issues) lines.push(`Presenting issues: ${intake.presenting_issues}`);
    if (intake.symptoms) lines.push(`Symptoms: ${intake.symptoms}`);
    if (intake.severity) lines.push(`Severity (1-5): ${intake.severity}`);
    if (intake.duration) lines.push(`Duration: ${intake.duration}`);
    if (intake.risk_factors) lines.push(`Risk factors: ${intake.risk_factors}`);
    if (intake.medications) lines.push(`Medications: ${intake.medications}`);
    if (intake.history_therapy) lines.push(`Past therapy: ${intake.history_therapy}`);
    if (intake.goals) lines.push(`Therapy goals: ${intake.goals}`);
    if (intake.preferences) lines.push(`Preferences: ${intake.preferences}`);
    if (intake.availability) lines.push(`Availability: ${intake.availability}`);
    if (intake.suggestion) lines.push(`Suggested therapy: ${intake.suggestion}`);
    if (facts.summary) lines.push(`Conversation summary: ${facts.summary}`);
    const summary = lines.length ? lines.join('\n') : 'No intake information saved yet.';
    res.json({ summary, intake, facts });
});

// Memories: retrieve merged memory (facts) for current user
app.get('/memories', requireAuth, (req, res) => {
    const row = db.getMemoryByUserId(req.user.id);
    res.json({ facts: row?.facts || {} });
});

// Memories: upsert/merge personal facts
app.post('/memories', requireAuth, (req, res) => {
    const incoming = req.body?.facts || {};
    const current = db.getMemoryByUserId(req.user.id)?.facts || {};
    const merged = { ...current, ...incoming };
    const saved = db.upsertMemoryForUser(req.user.id, merged);
    res.json({ facts: saved.facts });
});

// Journal endpoints
app.post('/journals', requireAuth, (req, res) => {
    const content = (req.body?.content || '').toString().trim();
    const tags = Array.isArray(req.body?.tags) ? req.body.tags : [];
    if (!content) return res.status(400).json({ error: 'content is required' });
    const row = db.createJournal(req.user.id, content, tags);
    res.json({ journal: row });
});

app.get('/journals', requireAuth, (req, res) => {
    const limit = Math.min(parseInt(req.query.limit || '50', 10) || 50, 200);
    const rows = db.listJournalsForUser(req.user.id, limit);
    res.json({ journals: rows });
});

app.delete('/journals/:id', requireAuth, (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: 'invalid id' });
    db.deleteJournal(req.user.id, id);
    res.json({ success: true });
});

// Journal: update + search
app.put('/journals/:id', requireAuth, (req, res) => {
    const id = parseInt(req.params.id, 10);
    const content = (req.body?.content || '').toString();
    const tags = Array.isArray(req.body?.tags) ? req.body.tags : undefined;
    if (!id) return res.status(400).json({ error: 'invalid id' });
    const row = db.updateJournal(req.user.id, id, content, tags ?? []);
    if (!row) return res.status(404).json({ error: 'not found' });
    res.json({ journal: row });
});

app.get('/journals/search', requireAuth, (req, res) => {
    const { q = '', tag = '', from = '', to = '', limit = '100' } = req.query || {};
    const results = db.searchJournals(req.user.id, {
        q: String(q || ''),
        tag: String(tag || ''),
        from: String(from || ''),
        to: String(to || ''),
        limit: Math.min(parseInt(limit, 10) || 100, 300)
    });
    res.json({ journals: results });
});

// Neural TTS endpoint: converts text to natural speech (MP3)
app.post('/tts', async (req, res) => {
    const text = (req.body && req.body.text || '').toString().trim();
    let requestedVoice = (req.body && req.body.voice) || 'alloy';
    const normalized = String(requestedVoice).toLowerCase();
    let voice = SUPPORTED_TTS_VOICES.includes(normalized) ? normalized : 'alloy';

    if (!text) return res.status(400).json({ error: 'text is required' });

    async function synthesize(v) {
        const result = await openai.audio.speech.create({
            model: 'gpt-4o-mini-tts',
            voice: v,
            input: text,
            format: 'mp3'
        });
        const arrayBuffer = await result.arrayBuffer();
        return Buffer.from(arrayBuffer);
    }

    try {
        let buffer = await synthesize(voice);
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Cache-Control', 'no-store');
        res.setHeader('X-TTS-Voice-Used', voice);
        res.setHeader('X-TTS-Fallback', '0');
        return res.send(buffer);
    } catch (primaryError) {
        console.warn('Primary TTS failed for voice', voice, primaryError?.message || primaryError);
        // Try a safe fallback voice
        const fallbackVoice = 'alloy';
        if (voice !== fallbackVoice) {
            try {
                const buffer = await synthesize(fallbackVoice);
                res.setHeader('Content-Type', 'audio/mpeg');
                res.setHeader('Cache-Control', 'no-store');
                res.setHeader('X-TTS-Voice-Used', fallbackVoice);
                res.setHeader('X-TTS-Fallback', '1');
                return res.send(buffer);
            } catch (fallbackError) {
                console.error('Fallback TTS also failed:', fallbackError);
            }
        }
        return res.status(500).json({ error: 'Failed to synthesize speech' });
    }
});

// Advertise supported voices to the frontend
app.get('/tts/voices', (_req, res) => {
    res.json({ voices: SUPPORTED_TTS_VOICES, default: 'alloy' });
});

// Emotion detection function
function detectEmotionalContext(message) {
    const sadnessKeywords = [
        'sad', 'depressed', 'down', 'upset', 'crying', 'tears', 'heartbroken', 'devastated',
        'feel awful', 'feel terrible', 'feel bad', 'feel lost', 'lost', 'lonely', 'empty',
        'hopeless', 'despair', 'grief', 'mourning', 'miss', 'hurt', 'pain', 'ache'
    ];
    
    const frustrationKeywords = [
        'frustrated', 'angry', 'mad', 'annoyed', 'irritated', 'furious', 'rage', 'pissed',
        'fed up', 'sick of', 'tired of', 'hate', 'can\'t stand', 'bothered', 'stressed',
        'overwhelmed', 'exhausted', 'burnt out', 'anxious', 'worried', 'nervous'
    ];
    
    const helplessKeywords = [
        'don\'t know what to do', 'need help', 'struggling', 'difficult time', 'hard time',
        'can\'t cope', 'falling apart', 'breaking down', 'giving up', 'want to quit',
        'feel stuck', 'trapped', 'confused', 'lost'
    ];
    
    const messageLower = message.toLowerCase();
    
    const hasSadness = sadnessKeywords.some(keyword => messageLower.includes(keyword));
    const hasFrustration = frustrationKeywords.some(keyword => messageLower.includes(keyword));
    const hasHelplessness = helplessKeywords.some(keyword => messageLower.includes(keyword));
    
    return {
        needsEmpathy: hasSadness || hasFrustration || hasHelplessness,
        sadness: hasSadness,
        frustration: hasFrustration,
        helplessness: hasHelplessness
    };
}

// Function to automatically format resource responses
function formatResourceResponse(response) {
    console.log('Original response:', response);
    
    // Check if this response contains resources
    const hasResources = (response.includes('•') || response.includes('*')) && 
                         (response.includes('Link:') || response.includes('http'));
    
    if (!hasResources) {
        return response; // Return unchanged if no resources detected
    }
    
    console.log('Detected resource response, applying formatting...');
    
    // Split the response to find the intro and resources section
    let parts = response.split(/Here are some[^:]*:/i);
    let intro = '';
    let resourceSection = response;
    
    if (parts.length > 1) {
        intro = parts[0] + 'Here are some helpful resources:';
        resourceSection = parts[1];
    }
    
    // Remove any closing text from the resource section first
    resourceSection = resourceSection.replace(/(If you need.*|Feel free.*|Remember.*|Take care.*|Let me know.*)$/gi, '');
    
    // Extract individual resources using bullet points as separators
    const resourceMatches = resourceSection.split(/•\s*/);
    let formattedResources = [];
    
    resourceMatches.forEach((match, index) => {
        if (index === 0) return; // Skip first empty part
        
        // Clean up the resource text
        let resourceText = match.trim();
        if (!resourceText) return;
        
        // Extract resource name (between ** or first part before colon)
        let name = '';
        let description = '';
        let link = '';
        
        // Try to extract name from **Name**:
        const nameMatch = resourceText.match(/\*\*([^*]+)\*\*/);
        if (nameMatch) {
            name = nameMatch[1].trim();
            description = resourceText.replace(/\*\*[^*]+\*\*:\s*/, '').trim();
        } else {
            // Fallback: use text before colon
            const colonParts = resourceText.split(':');
            if (colonParts.length > 1) {
                name = colonParts[0].trim();
                description = colonParts.slice(1).join(':').trim();
            } else {
                name = 'Resource';
                description = resourceText;
            }
        }
        
        // Extract link - handle both markdown links and plain URLs
        // First try to find Link: followed by URL
        let linkMatch = description.match(/Link:\s*(https?:\/\/[^\s\)]+)/);
        if (linkMatch) {
            link = linkMatch[1];
            description = description.replace(/Link:\s*https?:\/\/[^\s\)]+.*$/g, '').trim();
        } else {
            // Try to find markdown link format [text](url)
            linkMatch = description.match(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/);
            if (linkMatch) {
                link = linkMatch[2];
                description = description.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\).*$/g, '').trim();
            } else {
                // Try to find any plain URL
                linkMatch = description.match(/(https?:\/\/[^\s\)]+)/);
                if (linkMatch) {
                    link = linkMatch[1];
                    description = description.replace(/(https?:\/\/[^\s\)]+).*$/g, '').trim();
                }
            }
        }
        
        // Clean up description further
        description = description.replace(/\s+/g, ' ').trim();
        description = description.replace(/\.\s*$/, ''); // Remove trailing period
        description = description.replace(/Link:\s*\[.*?\]\(.*?\).*$/, '').trim(); // Remove any remaining markdown links
        
        if (name && description) {
            formattedResources.push({
                name: name,
                description: description,
                link: link
            });
        }
    });
    
    // Rebuild the response with proper formatting
    let formattedResponse = intro.trim();
    
    formattedResources.forEach((resource, index) => {
        formattedResponse += '\n\n• **' + resource.name + '**: ' + resource.description;
        if (resource.link) {
            formattedResponse += '\n  Link: ' + resource.link;
        }
    });
    
    // Add any closing text that might exist in the original response
    const closingMatch = response.match(/(If you need.*|Feel free.*|Remember.*|Take care.*|Let me know.*)$/i);
    if (closingMatch) {
        formattedResponse += '\n\n' + closingMatch[1].trim();
    }
    
    console.log('Formatted response:', formattedResponse);
    return formattedResponse.trim();
}

// OpenAI GPT-4o integration
async function getOpenAIResponse(userMessage, conversationHistory, extraSystemContext) {
    try {
        // Detect emotional context in the user's message
        const emotionalContext = detectEmotionalContext(userMessage);
        
        // Build conversation context from history
        let systemPrompt = `You are Gina, a helpful and intelligent AI assistant. You are designed to be conversational, friendly, and helpful. Keep your responses natural and engaging. You support both text and voice interactions, so keep responses clear and well-structured for speech synthesis.

Key personality traits:
- Friendly and approachable
- Helpful and informative
- Conversational and engaging
- Professional but warm
- Clear and concise communication
- Emotionally intelligent and empathetic

Always identify yourself as Gina when appropriate, and maintain a consistent, helpful personality throughout the conversation.

 MEMORY POLICY:
 - For authenticated users, you have persistent memory of personal facts and intake details.
 - You may be provided short context strings that include facts (e.g., suggested therapy, goals, preferences).
 - Use remembered facts naturally (e.g., "I recall you mentioned...").
 - Do not say you cannot remember; if a detail is unknown, ask a clarifying question instead.

RESOURCE KNOWLEDGE BASE - When users ask for resources, help, or support, you can provide relevant links from this knowledge base:

**CRISIS & EMERGENCY RESOURCES:**

• **National Suicide Prevention Lifeline**: 24/7 crisis support
  Phone: 988
  Link: https://suicidepreventionlifeline.org/


• **Crisis Text Line**: Free 24/7 text-based crisis support
  Text: HOME to 741741
  Link: https://www.crisistextline.org/


• **SAMHSA National Helpline**: Treatment referral and information service
  Phone: 1-800-662-4357
  Link: https://www.samhsa.gov/find-help/national-helpline


**MENTAL HEALTH RESOURCES:**

• **Psychology Today**: Comprehensive therapist directory with filters
  Link: https://www.psychologytoday.com/


• **BetterHelp**: Online therapy with licensed professionals
  Link: https://www.betterhelp.com/


• **NAMI (National Alliance on Mental Illness)**: Education and support
  Link: https://www.nami.org/


**ANXIETY & DEPRESSION SUPPORT:**

• **Anxiety and Depression Association of America**: Resources and support groups
  Link: https://www.adaa.org/


• **Headspace**: Guided meditation and mindfulness app
  Link: https://www.headspace.com/


• **7 Cups**: Free emotional support from trained listeners
  Link: https://www.7cups.com/

**SELF-HELP & COPING RESOURCES:**

• **Centre for Clinical Interventions**: Free self-help modules and worksheets
  Link: https://www.cci.health.wa.gov.au/Resources/Looking-After-Yourself


• **DBT Self-Help Resources**: Dialectical Behavior Therapy tools and skills
  Link: https://www.dbtselfhelp.com/


• **Mindfulness-Based Stress Reduction**: Stress reduction through mindfulness
  Link: https://www.mindfulnesscds.com/


**SUPPORT GROUPS & COMMUNITIES:**

• **Support Groups Central**: Directory of local and online support groups
  Link: https://www.supportgroupscentral.com/


• **NAMI Support Groups**: Peer support groups nationwide
  Link: https://www.nami.org/Support-Education/Support-Groups


• **Reddit Mental Health Communities**: Peer support forums
  Communities: r/mentalhealth, r/anxiety, r/depression


**EDUCATIONAL RESOURCES:**

• **TED Talks on Mental Health**: Inspiring talks from experts and advocates
  Link: https://www.ted.com/topics/mental+health


• **NIMH (National Institute of Mental Health)**: Research-based mental health information  
  Link: https://www.nimh.nih.gov/


• **Mental Health America**: Educational resources and screening tools
  Link: https://www.mhanational.org/

When providing resources, use this simple format:

• **Resource Name**: Brief description Link: https://example.com/
• **Resource Name**: Brief description Link: https://example.com/  
• **Resource Name**: Brief description Link: https://example.com/

The system will automatically format these properly for display.`;

        // Add empathy guidelines if emotional distress is detected
        if (emotionalContext.needsEmpathy) {
            systemPrompt += `

IMPORTANT EMOTIONAL CONTEXT DETECTED: The user appears to be experiencing emotional distress. Please respond with extra empathy and care:

- Acknowledge their feelings with compassion
- Use phrases like "I'm really sorry you're feeling that way" or "That sounds really difficult"
- Offer emotional support and validation
- Ask if they'd like to talk more about what's bothering them
- Suggest practical help or coping strategies when appropriate
- When offering resources, FOLLOW THE EXACT FORMAT ABOVE - Each resource on its own line with bullet points
- Keep your tone gentle, warm, and understanding
- Avoid being overly clinical or dismissive
- Show genuine concern for their wellbeing

When providing resources, just use bullet points with the resource name, description, and link. The system will automatically format them properly for the user.

Remember: Your response should feel like talking to a caring friend who truly understands and wants to help.`;
        }
        
        const messages = [
            {
                role: "system",
                content: systemPrompt
            }
        ];

        // If we have user-specific context (intake + memories), add as an additional system message
        if (extraSystemContext && String(extraSystemContext).trim().length > 0) {
            messages.push({ role: 'system', content: extraSystemContext });
        }

        // Add conversation history (last 10 messages for context)
        const recentHistory = conversationHistory.slice(-10);
        recentHistory.forEach(msg => {
            messages.push({
                role: msg.type === 'user' ? 'user' : 'assistant',
                content: msg.content
            });
        });

        // Add current user message with emotional context if needed
        let messageContent = userMessage;
        if (emotionalContext.needsEmpathy) {
            const emotionTypes = [];
            if (emotionalContext.sadness) emotionTypes.push('sadness');
            if (emotionalContext.frustration) emotionTypes.push('frustration/stress');
            if (emotionalContext.helplessness) emotionTypes.push('helplessness');
            
            messageContent = `[User appears to be experiencing: ${emotionTypes.join(', ')}] ${userMessage}`;
        }
        
        messages.push({
            role: 'user',
            content: messageContent
        });

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: messages,
            max_tokens: 500,
            temperature: 0.7,
            presence_penalty: 0.1,
            frequency_penalty: 0.1
        });

        let finalResponse = completion.choices[0].message.content;
        finalResponse = formatResourceResponse(finalResponse); // Apply post-processing

        return finalResponse;

    } catch (error) {
        console.error('OpenAI API error:', error);
        
        // Fallback response if OpenAI fails
        return `I apologize, but I'm having trouble accessing my AI capabilities right now. This might be due to an API issue or configuration problem. Please try again in a moment, or check that the OpenAI API key is properly configured. In the meantime, I'm still here to help as best I can!`;
    }
}

// Start server
app.listen(PORT, () => {
    console.log(`GinaAI Backend Server running on http://localhost:${PORT}`);
}); 