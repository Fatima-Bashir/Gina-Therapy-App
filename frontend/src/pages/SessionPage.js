// @author: fatima bashir
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { logoutAndRedirect, getToken } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import ThemeToggle from '../components/ThemeToggle';
import { useMentalMetrics } from '../contexts/MentalMetricsContext';

const SessionPage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showCrisis, setShowCrisis] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { metrics } = useMentalMetrics();
  
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Function to ensure input stays focused
  const focusInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      // Set cursor to end of input
      const length = inputRef.current.value.length;
      inputRef.current.setSelectionRange(length, length);
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive and refocus input
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    // Focus input after messages update and DOM has settled
    const timeoutId = setTimeout(() => {
      focusInput();
    }, 50);
    return () => clearTimeout(timeoutId);
  }, [messages, focusInput]);

  // Update input when speech transcript changes and maintain focus
  useEffect(() => {
    if (transcript) {
      setInputValue(transcript);
      const timeoutId = setTimeout(() => {
        focusInput();
      }, 10);
      return () => clearTimeout(timeoutId);
    }
  }, [transcript, focusInput]);

  // Prefer a feminine English TTS voice for Gina
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;

    const pickPreferredVoice = () => {
      const voices = synth.getVoices();
      if (!voices || voices.length === 0) return;
      const preferredNames = [
        'Samantha', // iOS/macOS
        'Victoria',
        'Karen',
        'Tessa',
        'Zira',
        'Aria',
        'Google UK English Female',
        'Google US English',
        'Microsoft Zira',
        'Microsoft Aria',
      ];
      let v = null;
      for (const name of preferredNames) {
        v = voices.find(voice => voice.name.toLowerCase().includes(name.toLowerCase()));
        if (v) break;
      }
      if (!v) {
        v = voices.find(voice => (voice.lang || '').startsWith('en') && /female|woman|girl/i.test(voice.name))
          || voices.find(voice => (voice.lang || '').startsWith('en'))
          || voices[0];
      }
      setSelectedVoice(v || null);
    };

    // Some browsers load voices asynchronously
    pickPreferredVoice();
    synth.addEventListener?.('voiceschanged', pickPreferredVoice, { once: true });
    return () => synth.removeEventListener?.('voiceschanged', pickPreferredVoice);
  }, []);

  // Build a personalized greeting from metrics or memories
  const composePersonalizedGreeting = useCallback((mm) => {
    const safe = mm || {};
    const wb = safe.wellbeing || {};
    const st = safe.stressLevel || {};
    const md = safe.mood || {};

    const stressors = Array.isArray(st.stressors) ? st.stressors : [];
    const triggers = Array.isArray(md.triggers) ? md.triggers : [];
    const notes = [st.notes, md.notes, wb.notes].filter(Boolean).join(' ');
    const hasWorkStress =
      stressors.some(s => /work|job|deadline|boss|office/i.test(s)) ||
      /work|job|deadline|boss|office/i.test(st.notes || '');

    const lines = [];
    lines.push("Hi, I'm Gina.");

    if (st.label || st.value !== undefined || stressors.length || st.notes) {
      if ((st.label || '').toLowerCase().includes('high') || (st.value || 0) >= 60 || hasWorkStress) {
        const stressDetail = hasWorkStress ? 'especially around work' : (stressors.slice(0,2).join(', ') || 'lately');
        lines.push(`I noticed stress has been ${st.label || 'elevated'} ${stressDetail ? `— ${stressDetail}` : ''}.`);
        lines.push('Do you want to talk about it, or try a short de-stress exercise together?');
      } else if ((st.label || '').toLowerCase().includes('low') || (st.value || 0) <= 30) {
        lines.push('Nice to see your stress trending low.');
      }
    }

    if (md.value) {
      if (/happy|ecstatic|content/i.test(md.value)) {
        lines.push(`I see you're feeling ${md.value.toLowerCase()}${md.intensity ? ` (intensity ${md.intensity}/10)` : ''}. Want to share what’s going well?`);
      } else if (/sad|down|angry|anxious|overwhelmed/i.test(md.value)) {
        lines.push(`I hear your mood is ${md.value.toLowerCase()}${md.intensity ? ` (intensity ${md.intensity}/10)` : ''}. I'm here with you — would talking it through help?`);
      }
    }

    if (!st.label && !md.value) {
      // fallback to wellbeing
      if (typeof wb.value === 'number') {
        if (wb.value < 50) lines.push('I’m sensing things might feel a bit heavy today. We can take it one step at a time.');
        else lines.push('Great to see your overall wellbeing looking steady.');
      }
    }

    if (lines.length <= 1) {
      lines.push("How can I support you right now? We can chat, reflect, or try breathing together.");
    }

    return lines.join(' ');
  }, []);

  // Welcome message and auto-focus input (personalized)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('token');
        let mm = metrics;
        if (token) {
          // Prefer metrics saved in memories for cross-session continuity
          const res = await fetch('/memories', { headers: { Authorization: `Bearer ${token}` } });
          if (res.ok) {
            const data = await res.json();
            if (data && data.facts && data.facts.lastMentalMetrics) {
              mm = data.facts.lastMentalMetrics;
            }
          }
        }
        if (cancelled) return;
        setMessages((prev) => {
          if (prev && prev.length > 0) return prev;
          return [{
            id: 1,
            type: 'ai',
            content: composePersonalizedGreeting(mm),
            timestamp: new Date().toISOString()
          }];
        });
      } catch (_) {
        setMessages((prev) => {
          if (prev && prev.length > 0) return prev;
          return [{
            id: 1,
            type: 'ai',
            content: composePersonalizedGreeting(metrics),
            timestamp: new Date().toISOString()
          }];
        });
      }
    })();

    // Auto-focus the input field when component mounts
    const timeoutId = setTimeout(() => {
      focusInput();
    }, 200);
    return () => { cancelled = true; clearTimeout(timeoutId); };
  }, [composePersonalizedGreeting, focusInput, metrics]);

  // Load saved conversation on mount if logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return; // guest
    (async () => {
      try {
        const res = await fetch('/conversations/latest', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.history) && data.history.length > 0) {
            setMessages(data.history.map((m, idx) => ({ id: Date.now() + idx, ...m, timestamp: new Date().toISOString() })));
          }
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    resetTranscript();

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory: messages,
          mentalMetrics: metrics
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: data.response,
        timestamp: data.timestamp
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Automatically speak only when in speaking mode (listening)
      if (listening) {
        speakText(data.response);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const shapeTextForTTS = (raw) => {
    if (!raw) return '';
    let t = String(raw)
      .replace(/\s+/g, ' ')
      .replace(/•/g, '-');
    // Encourage pauses between sentences
    t = t.replace(/([.!?])\s+/g, '$1\n');
    // Add a small pause after colons for lists
    t = t.replace(/:\s+/g, ':\n');
    return t.trim();
  };

  const speakText = async (text) => {
    // Prefer neural TTS from backend for more natural speech; fallback to browser TTS
    try {
      const preferredVoice = localStorage.getItem('ttsVoice') || 'verse';
      const ttsRate = parseFloat(localStorage.getItem('ttsRate') || '1.0');
      const shaped = shapeTextForTTS(text);
      const resp = await fetch('/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: shaped, voice: preferredVoice })
      });
      if (resp.ok) {
        const blob = await resp.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        // Adjust playback speed slightly for more natural cadence if requested
        audio.playbackRate = isNaN(ttsRate) ? 1.0 : Math.max(0.8, Math.min(1.2, ttsRate));
        setIsSpeaking(true);
        audio.onended = () => { setIsSpeaking(false); URL.revokeObjectURL(url); };
        audio.onerror = () => { setIsSpeaking(false); URL.revokeObjectURL(url); };
        audio.play();
        return;
      }
    } catch (_) {}

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const preferredVoice = localStorage.getItem('ttsVoice') || '';
      const ttsRate = parseFloat(localStorage.getItem('ttsRate') || '1.0');
      const utterance = new SpeechSynthesisUtterance(shapeTextForTTS(text));
      utterance.rate = isNaN(ttsRate) ? 0.98 : Math.max(0.8, Math.min(1.2, ttsRate));
      utterance.pitch = 1.15;
      utterance.volume = 0.9;
      if (selectedVoice) utterance.voice = selectedVoice;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const toggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
      // Focus input field when stopping voice input
      setTimeout(() => {
        focusInput();
      }, 100);
    } else {
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  const handleLogout = () => logoutAndRedirect('/auth');

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = async () => {
    // Reset local chat
    setMessages([]);
    // Clear persisted conversation if logged in
    const token = getToken();
    if (token) {
      try {
        await fetch('/conversations', {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (_) {}
    }
    // Restore personalized welcome message
    setTimeout(async () => {
      try {
        const token = localStorage.getItem('token');
        let mm = metrics;
        if (token) {
          const res = await fetch('/memories', { headers: { Authorization: `Bearer ${token}` } });
          if (res.ok) {
            const data = await res.json();
            if (data && data.facts && data.facts.lastMentalMetrics) {
              mm = data.facts.lastMentalMetrics;
            }
          }
        }
        setMessages([{
          id: Date.now(),
          type: 'ai',
          content: composePersonalizedGreeting(mm),
          timestamp: new Date().toISOString()
        }]);
      } catch (_) {
        setMessages([{
          id: Date.now(),
          type: 'ai',
          content: composePersonalizedGreeting(metrics),
          timestamp: new Date().toISOString()
        }]);
      }
      focusInput();
    }, 50);
  };

  if (!browserSupportsSpeechRecognition) {
    console.warn('Browser does not support speech recognition');
  }

  // Lightweight Markdown rendering for AI messages: **bold**, URLs, and simple lists
  const renderMessageContent = (text) => {
    // Break into paragraphs by blank lines
    const blocks = text.split(/\n\s*\n/);

    const renderInline = (t, keyPrefix = 'i') => {
      const tokenRegex = /(https?:\/\/[^\s]+)|\*\*([^*]+)\*\*/g;
      const nodes = [];
      let last = 0; let m; let idx = 0;
      while ((m = tokenRegex.exec(t)) !== null) {
        const [whole, url, bold] = m;
        const start = m.index;
        if (start > last) nodes.push(t.slice(last, start));
        if (url) {
          // trim trailing punctuation commonly attached to URLs
          const cleaned = url.replace(/[),.;!?]+$/g, '');
          const trailing = url.slice(cleaned.length);
          nodes.push(<a key={`${keyPrefix}-a-${idx++}`} href={cleaned} target="_blank" rel="noopener noreferrer">{cleaned}</a>);
          if (trailing) nodes.push(trailing);
        } else if (bold) {
          nodes.push(<strong key={`${keyPrefix}-b-${idx++}`}>{bold}</strong>);
        }
        last = start + whole.length;
      }
      if (last < t.length) nodes.push(t.slice(last));
      return nodes;
    };

    const isBulletList = (s) => s.trim().split(/\n/).every(line => /^\s*[-•]\s+/.test(line));
    const isOrderedList = (s) => s.trim().split(/\n/).every(line => /^\s*\d+\.\s+/.test(line));

    return blocks.map((block, bi) => {
      if (isBulletList(block)) {
        const items = block.split(/\n/).map(l => l.replace(/^\s*[-•]\s+/, ''));
        return (
          <ul key={`ul-${bi}`}>
            {items.map((it, ii) => <li key={`uli-${bi}-${ii}`}>{renderInline(it, `ul-${bi}-${ii}`)}</li>)}
          </ul>
        );
      }
      if (isOrderedList(block)) {
        const items = block.split(/\n/).map(l => l.replace(/^\s*\d+\.\s+/, ''));
        return (
          <ol key={`ol-${bi}`}>
            {items.map((it, ii) => <li key={`oli-${bi}-${ii}`}>{renderInline(it, `ol-${bi}-${ii}`)}</li>)}
          </ol>
        );
      }
      // Normal paragraph
      return <p key={`p-${bi}`}>{renderInline(block, `p-${bi}`)}</p>;
    });
  };

  return (
    <div className="min-h-screen hero-gradient">
      {/* Header */}
      <div className="glass-header sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="mr-4 p-2 hover:bg-white/10 rounded-full transition-all duration-200"
              style={{color: 'var(--text-secondary)'}}
              title="Back to Dashboard"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="headline-small" style={{color: 'var(--text-primary)', fontSize: '1.25rem'}}>Chat with Gina</h1>
              <p className="body-small" style={{color: 'var(--text-secondary)'}}>AI Assistant • Online</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isSpeaking && (
              <div className="px-2 py-1 text-xs rounded-full" style={{ color: 'var(--text-secondary)' }}>
                Speaking…
              </div>
            )}
            {/* Settings removed from chat header per request */}
            <button
              onClick={() => setShowCrisis(true)}
              className="px-3 py-2 rounded-full border text-red-600 hover:bg-red-50 transition-all duration-200"
              style={{ borderColor: 'rgba(239, 68, 68, 0.4)'}}
              title="Crisis resources"
            >
              <span className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21C12 21 4 13.828 4 8.5C4 6.015 6.015 4 8.5 4C10.04 4 11.431 4.729 12 5.874C12.569 4.729 13.96 4 15.5 4C17.985 4 20 6.015 20 8.5C20 13.828 12 21 12 21Z" />
                </svg>
                <span className="hidden sm:inline">Crisis resources</span>
              </span>
            </button>
            {/* Info button removed per request */}
            {/* Log out removed from chat header per request */}
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="card-primary h-[calc(100vh-180px)] flex flex-col overflow-hidden">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} fade-in`}
              >
                <div className={`max-w-lg ${
                  message.type === 'user' 
                    ? 'chat-bubble-user' 
                    : 'chat-bubble-ai'
                }`}>
                  <div className={`body-regular ${message.type === 'user' ? 'whitespace-pre-wrap' : ''}`}>{renderMessageContent(message.content)}</div>
                  <div className="body-small mt-3 opacity-60 flex items-center justify-between">
                    <span>
                      {new Date(message.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                    {message.type === 'ai' && !listening && (
                      <button
                        onClick={() => speakText(message.content)}
                        className="ml-3 p-1 rounded-full hover:bg-white/10 transition-colors"
                        title="Play this message"
                        aria-label="Play this message"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start fade-in">
                <div className="chat-bubble-ai">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full bounce-gentle" style={{backgroundColor: 'var(--text-muted)'}}></div>
                      <div className="w-2 h-2 rounded-full bounce-gentle" style={{backgroundColor: 'var(--text-muted)', animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 rounded-full bounce-gentle" style={{backgroundColor: 'var(--text-muted)', animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="body-small" style={{color: 'var(--text-secondary)'}}>Gina is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t p-6" style={{borderColor: 'var(--border-color)', background: 'var(--bg-secondary)'}}>
            <div className="flex items-end space-x-4">
              <div className="flex-1">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onBlur={() => setTimeout(() => focusInput(), 10)}
                  onClick={focusInput}
                  placeholder="Type your message here..."
                  className="input-field resize-none min-h-[56px] max-h-32"
                  rows="2"
                  disabled={isLoading}
                  autoFocus
                />
                {listening && (
                  <div className="body-small text-red-500 mt-2 flex items-center font-medium">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
                    Listening...
                  </div>
                )}
              </div>
              
              {/* Voice Input Button */}
              {browserSupportsSpeechRecognition && (
                <button
                  onClick={toggleListening}
                  className={`p-4 rounded-2xl transition-all duration-300 border-2 ${
                    listening 
                      ? 'bg-red-500 text-white voice-animation shadow-lg border-red-300' 
                      : 'shadow-lg hover:shadow-xl border-white/30 hover:border-white/50'
                  }`}
                  style={{
                    backgroundColor: listening ? '#ef4444' : 'rgba(255, 255, 255, 0.9)',
                    color: listening ? 'white' : '#2D1B69',
                    boxShadow: listening 
                      ? '0 0 25px rgba(239, 68, 68, 0.5)' 
                      : '0 8px 32px rgba(255, 255, 255, 0.3)'
                  }}
                  title={listening ? 'Stop listening' : 'Start voice input'}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
              )}
              
              {/* Send Button */}
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="p-4 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl border-2 border-white/30 hover:border-white/50 shadow-lg hover:shadow-xl transition-all duration-200"
                style={{
                  background: 'var(--gradient-primary)',
                  color: 'white'
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="body-small" style={{color: 'var(--text-muted)'}}>
                Press Enter to send • Shift+Enter for new line
              </div>
              <button
                type="button"
                onClick={clearChat}
                className="text-sm underline underline-offset-2"
                style={{ color: 'var(--accent-primary)' }}
                title="Clear this chat"
              >
                Clear chat
              </button>
            </div>
          </div>
        </div>
        {/* Crisis Resources Modal */}
        {showCrisis && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
            onClick={() => setShowCrisis(false)}
          >
            <div className="wellness-card crisis-modal p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()} style={{maxHeight: '80vh', overflowY: 'auto'}}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold" style={{color: 'var(--text-primary)'}}>Crisis resources</h2>
                <button onClick={() => setShowCrisis(false)} className="p-2 rounded-full hover:bg-white/10" title="Close" style={{color: 'var(--text-secondary)'}}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4 text-base" style={{color: 'var(--text-primary)'}}>
                <p className="opacity-90">If you or someone else is in immediate danger, call your local emergency number.</p>
                <div>
                  <div className="font-semibold mb-1" style={{color: 'var(--text-primary)'}}>988 Suicide & Crisis Lifeline (U.S.)</div>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Call 988</li>
                    <li>Website: <a href="https://988lifeline.org/" target="_blank" rel="noopener noreferrer">https://988lifeline.org/</a></li>
                  </ul>
                </div>
                <div>
                  <div className="font-semibold mb-1" style={{color: 'var(--text-primary)'}}>Crisis Text Line (U.S.)</div>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Text HOME to 741741</li>
                    <li>Website: <a href="https://www.crisistextline.org/" target="_blank" rel="noopener noreferrer">https://www.crisistextline.org/</a></li>
                  </ul>
                </div>
                <div>
                  <div className="font-semibold mb-1" style={{color: 'var(--text-primary)'}}>SAMHSA National Helpline (U.S.)</div>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Call 1-800-662-HELP (4357)</li>
                    <li>Website: <a href="https://www.samhsa.gov/find-help/national-helpline" target="_blank" rel="noopener noreferrer">https://www.samhsa.gov/find-help/national-helpline</a></li>
                  </ul>
                </div>
                <div>
                  <div className="font-semibold mb-1" style={{color: 'var(--text-primary)'}}>Outside the U.S.</div>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Find international helplines: <a href="https://www.opencounseling.com/suicide-hotlines" target="_blank" rel="noopener noreferrer">https://www.opencounseling.com/suicide-hotlines</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionPage; 