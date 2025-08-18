// @author: fatima bashir
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

const MindfulnessPage = () => {
  const navigate = useNavigate();
  const [activeSession, setActiveSession] = useState(null);
  const [sessionTime, setSessionTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(5);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const [showMusic, setShowMusic] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.7);
  const [musicLoop, setMusicLoop] = useState(true);
  const [currentTrackId, setCurrentTrackId] = useState('ocean');
  const [musicMsg, setMusicMsg] = useState('');
  const synthNodesRef = useRef({ masterGain: null, nodes: [], type: null });
  const preferSynth = false; // use high-quality recorded tracks by default

  const musicTracks = [
    { id: 'echoofsadness', name: 'Echo of Sadness', sources: ['/audio/echoofsadness.mp3'] },
    { id: 'yesterday', name: 'Yesterday', sources: ['/audio/yesterday.mp3'] },
    { id: 'moonlightdrive', name: 'Moonlight Drive', sources: ['/audio/moonlightdrive.mp3'] },
    { id: 'longnight', name: 'Long Night', sources: ['/audio/longnight.mp3'] }
  ];

  const sessions = [
    {
      id: 'body-scan',
      name: 'Body Scan',
      description: 'Progressive relaxation through your entire body',
      duration: '10-30 min',
      icon: '●',
      color: 'from-slate-300 to-blue-400',
      instructions: [
        'Lie down comfortably and close your eyes',
        'Start with your toes and slowly move up',
        'Notice any tension or sensations',
        'Breathe into each part of your body',
        'Release any tension with each exhale'
      ]
    },
    {
      id: 'breathing',
      name: 'Breathing Focus',
      description: 'Simple awareness of your natural breath',
      duration: '5-20 min',
      icon: '○',
      color: 'from-green-300 to-emerald-400',
      instructions: [
        'Sit comfortably with eyes closed',
        'Focus on your natural breathing',
        'Notice the sensation of air flowing',
        'When mind wanders, gently return to breath',
        'No need to change your breathing'
      ]
    },
    {
      id: 'loving-kindness',
      name: 'Loving Kindness',
      description: 'Cultivate compassion for yourself and others',
      duration: '15-25 min',
      icon: '♡',
      color: 'from-pink-300 to-rose-400',
      instructions: [
        'Begin with sending love to yourself',
        'Repeat: "May I be happy, may I be peaceful"',
        'Extend these wishes to loved ones',
        'Include neutral people in your life',
        'Finally, send love to all beings'
      ]
    },
    {
      id: 'mindful-walking',
      name: 'Mindful Walking',
      description: 'Mindful movement and present-moment awareness',
      duration: '10-25 min',
      icon: '✧',
      color: 'from-violet-300 to-purple-400',
      instructions: [
        'Walk slowly and deliberately',
        'Focus on each step and movement',
        'Notice how your feet feel',
        'Coordinate with your breathing',
        'Stay present with the walking'
      ]
    },
    {
      id: 'gratitude',
      name: 'Gratitude Practice',
      description: 'Cultivate appreciation and thankfulness',
      duration: '5-15 min',
      icon: '✱',
      color: 'from-amber-300 to-yellow-400',
      instructions: [
        'Think of three things you\'re grateful for',
        'Feel the emotion of gratitude in your body',
        'Appreciate small everyday moments',
        'Extend gratitude to people in your life',
        'End with self-appreciation'
      ]
    },
    {
      id: 'nature-connection',
      name: 'Nature Connection',
      description: 'Connect with the natural world around you',
      duration: '15-30 min',
      icon: '→',
      color: 'from-teal-300 to-cyan-400',
      instructions: [
        'Go outside or imagine a natural setting',
        'Engage all your senses',
        'Notice sounds, smells, and textures',
        'Feel your connection to nature',
        'Appreciate the natural world'
      ]
    }
  ];

  const durations = [5, 10, 15, 20, 25, 30];

  useEffect(() => {
    if (isPlaying && activeSession) {
      intervalRef.current = setInterval(() => {
        setSessionTime(prev => {
          if (prev >= selectedDuration * 60) {
            setIsPlaying(false);
            return selectedDuration * 60;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, activeSession, selectedDuration]);

  const startSession = (session) => {
    setActiveSession(session);
    setSessionTime(0);
    setIsPlaying(true);
  };

  const pauseSession = () => {
    setIsPlaying(false);
  };

  const resumeSession = () => {
    setIsPlaying(true);
  };

  const endSession = () => {
    setIsPlaying(false);
    setActiveSession(null);
    setSessionTime(0);
    // Close music panel and stop any audio when exiting a session
    try {
      setShowMusic(false);
      const a = audioRef.current;
      if (a) { a.pause(); a.currentTime = 0; }
      stopSynth();
      setMusicPlaying(false);
    } catch {}
  };



  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    return (sessionTime / (selectedDuration * 60)) * 100;
  };

  // Initialize audio element
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const unlockAudio = async () => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx && !audioContextRef.current) {
        audioContextRef.current = new Ctx();
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'running') {
        await audioContextRef.current.resume();
        // Play a one-sample silent buffer to fully unlock on iOS
        const ctx = audioContextRef.current;
        const buffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
      }
    } catch {}
  };

  // Helper to load a track and optionally start it (multi-source with direct play attempts)
  const loadTrack = async (trackId, shouldPlay) => {
    if (preferSynth) return; // using synth, skip file loading
    const audio = audioRef.current;
    if (!audio) return;
    const track = musicTracks.find(t => t.id === trackId) || musicTracks[0];
    const sources = Array.isArray(track.sources) ? track.sources.slice() : [];
    const tryPlaySequential = async () => {
      for (let i = 0; i < sources.length; i++) {
        const src = sources[i];
        audio.loop = musicLoop;
        audio.volume = musicVolume;
        // @ts-ignore
        audio.playsInline = true;
        audio.preload = 'auto';
        audio.muted = false;
        audio.src = src;
        audio.load();
        if (shouldPlay) {
          try {
            await unlockAudio();
            await audio.play();
            setMusicMsg(`Playing: ${track.name}`);
            setTimeout(() => setMusicMsg(''), 1500);
            return true;
          } catch (e) {
            continue;
          }
        } else {
          return true;
        }
      }
      return false;
    };

    const ok = await tryPlaySequential();
    if (!ok) {
      await startSynth(trackId);
      setMusicMsg('Playing synth fallback');
      setTimeout(() => setMusicMsg(''), 1500);
    }
  };

  // Load new track or apply loop when dependencies change
  useEffect(() => {
    if (preferSynth) {
      if (musicPlaying) {
        // restart synth with new track
        stopSynth();
        startSynth(currentTrackId);
      }
    } else {
      loadTrack(currentTrackId, musicPlaying);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrackId, musicLoop]);

  // Volume changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = musicVolume;
  }, [musicVolume]);

  // Play/pause control
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (musicPlaying) {
      (async () => {
        try {
          await unlockAudio();
          await audio.play();
        } catch {
          // If play() fails (autoplay policy), retry after explicit user click via our handler
          setMusicPlaying(false);
          setMusicMsg('Press Play to start audio');
          setTimeout(() => setMusicMsg(''), 1500);
        }
      })();
    } else {
      audio.pause();
    }
  }, [musicPlaying]);

  // Synth engine
  const stopSynth = () => {
    try {
      const ctx = audioContextRef.current;
      const { nodes, masterGain } = synthNodesRef.current;
      nodes.forEach(n => { try { n.stop ? n.stop(0) : n.disconnect?.(); } catch {} });
      nodes.forEach(n => { try { n.disconnect?.(); } catch {} });
      if (masterGain) { try { masterGain.disconnect(); } catch {} }
      synthNodesRef.current = { masterGain: null, nodes: [], type: null };
    } catch {}
  };

  const startSynth = async (trackId) => {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) { setMusicMsg('Audio not supported'); return; }
    if (!audioContextRef.current) audioContextRef.current = new Ctx();
    const ctx = audioContextRef.current;
    await unlockAudio();
    const master = ctx.createGain();
    master.gain.value = musicVolume;
    master.connect(ctx.destination);
    const nodes = [];
    const type = trackId;
    if (trackId === 'ocean' || trackId === 'rain' || trackId === 'forest') {
      // Noise buffer
      const seconds = 2;
      const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < data.length; i++) {
        const white = Math.random() * 2 - 1;
        // Brown noise for ocean; white for rain/forest
        if (trackId === 'ocean' || trackId === 'forest') {
          lastOut = (lastOut + (0.02 * white)) / 1.02;
          data[i] = lastOut * 3.5; // brown
        } else {
          data[i] = white * 0.7; // white
        }
      }
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.loop = true;
      const filter = ctx.createBiquadFilter();
      if (trackId === 'ocean' || trackId === 'forest') {
        filter.type = 'lowpass';
        filter.frequency.value = trackId === 'ocean' ? 250 : 800;
      } else {
        filter.type = 'highpass';
        filter.frequency.value = 1000;
      }
      src.connect(filter);
      filter.connect(master);
      src.start();
      nodes.push(src, filter);
    } else if (trackId === 'piano') {
      const freqs = [261.63, 329.63, 392.0]; // C major
      freqs.forEach(f => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = f;
        g.gain.setValueAtTime(0, ctx.currentTime);
        g.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 1.5);
        osc.connect(g);
        g.connect(master);
        osc.start();
        nodes.push(osc, g);
      });
    }
    synthNodesRef.current = { masterGain: master, nodes, type };
    setMusicMsg(`Playing: ${trackId === 'piano' ? 'Soft Piano (synth)' : trackId.charAt(0).toUpperCase()+trackId.slice(1)+' (synth)'}`);
    setTimeout(() => setMusicMsg(''), 1500);
  };

  const handleToggleMusic = async () => {
    const audio = audioRef.current;
    if (!audio) {
      // Create the element on first interaction to satisfy autoplay policies
      audioRef.current = new Audio();
      // @ts-ignore
      audioRef.current.playsInline = true;
      audioRef.current.preload = 'auto';
    }
    const a = audioRef.current;
    if (!musicPlaying) {
      if (preferSynth) {
        await unlockAudio();
        await startSynth(currentTrackId);
        setMusicPlaying(true);
      } else {
        // Start synchronously with file approach
        const track = musicTracks.find(t => t.id === currentTrackId) || musicTracks[0];
        const sources = Array.isArray(track.sources) ? track.sources.slice() : [];
        const start = () => {
          a.loop = musicLoop;
          a.volume = musicVolume;
          a.autoplay = false;
          a.muted = false;
          a.oncanplay = null;
          a.onerror = null;
          a.crossOrigin = 'anonymous';
          // @ts-ignore
          a.playsInline = true;
          a.preload = 'auto';
          const trySequential = async () => {
            for (let i = 0; i < sources.length; i++) {
              a.src = sources[i];
              a.load();
              try {
                await unlockAudio();
                await a.play();
                setMusicPlaying(true);
                setMusicMsg(`Playing: ${track.name}`);
                setTimeout(() => setMusicMsg(''), 1500);
                return;
              } catch (e) {
                continue;
              }
            }
            // Final fallback to synth
            setMusicMsg('Using synth fallback');
            setTimeout(() => setMusicMsg(''), 1500);
            await startSynth(currentTrackId);
            setMusicPlaying(true);
          };
          trySequential();
        };
        start();
      }
    } else {
      a.pause();
      setMusicPlaying(false);
    }
  };

  if (activeSession) {
    return (
      <div className="min-h-screen" style={{background: 'var(--bg-primary)'}}>
        {/* Header */}
        <div className="sticky top-0 z-50 backdrop-blur-lg bg-white/10 border-b border-white/20">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between relative">
            <div className="flex items-center">
              <button
                onClick={() => { endSession(); }}
                className="mr-4 p-2 hover:bg-white/10 rounded-full transition-all duration-200"
                style={{color: 'var(--text-secondary)'}}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-bold" style={{color: 'var(--text-primary)'}}>
                {activeSession.name} Session
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMusic(s => !s)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                title="Soothing music"
                aria-label="Soothing music"
                style={{ color: 'var(--text-secondary)' }}
              >
                {/* Headphones icon */}
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3a9 9 0 00-9 9v6a3 3 0 003 3h1a2 2 0 002-2v-4a2 2 0 00-2-2H5v-1a7 7 0 0114 0v1h-2a2 2 0 00-2 2v4a2 2 0 002 2h1a3 3 0 003-3v-6a9 9 0 00-9-9z"/></svg>
              </button>
              <ThemeToggle />
            </div>
            {showMusic && (
              <div className="absolute right-4 top-14 z-50 wellness-card p-4 w-72">
                <div className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Soothing tracks</div>
                {musicMsg && <div className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>{musicMsg}</div>}
                <div className="space-y-2 mb-3">
                  {musicTracks.map(t => (
                    <button key={t.id} onClick={() => setCurrentTrackId(t.id)} className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${currentTrackId===t.id ? 'bg-white/20' : 'hover:bg-white/10'}`} style={{ color: 'var(--text-primary)' }}>
                      {currentTrackId===t.id ? '► ' : ''}{t.name}
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <button onClick={handleToggleMusic} className="px-3 py-1 rounded-lg text-white" style={{ background: 'var(--gradient-primary)' }}>
                      {musicPlaying ? 'Pause' : 'Play'}
                    </button>
                    <button onClick={() => { const a = audioRef.current; if (a) { a.pause(); a.currentTime = 0; } stopSynth(); setMusicPlaying(false); }} className="px-3 py-1 rounded-lg text-white" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)' }}>
                      Stop
                    </button>
                  </div>
                  <label className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <input type="checkbox" checked={musicLoop} onChange={(e) => setMusicLoop(e.target.checked)} /> Loop
                  </label>
                </div>
                <div>
                  <input type="range" min="0" max="1" step="0.05" value={musicVolume} onChange={(e) => setMusicVolume(parseFloat(e.target.value))} className="w-full" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Active Session */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="wellness-card p-8 text-center">
            {/* Session Icon */}
            <div 
              className="text-8xl mb-6 font-bold drop-shadow-lg" 
              style={{
                color: 'var(--text-primary)',
                textShadow: '0 2px 8px rgba(0,0,0,0.3), 0 0 20px rgba(255,255,255,0.2)',
                filter: 'brightness(1.1) contrast(1.2)'
              }}
            >
              {activeSession.icon}
            </div>

            
            {/* Progress Circle */}
            <div className="relative w-64 h-64 mx-auto mb-8">
              <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 256 256">
                <circle
                  cx="128"
                  cy="128"
                  r="112"
                  stroke="var(--glass-border)"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="128"
                  cy="128"
                  r="112"
                  stroke="var(--accent-primary)"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 112}`}
                  strokeDashoffset={`${2 * Math.PI * 112 * (1 - getProgress() / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-4xl font-light mb-2" style={{color: 'var(--text-primary)'}}>
                  {formatTime(sessionTime)}
                </div>
                <div className="text-sm" style={{color: 'var(--text-muted)'}}>
                  of {selectedDuration} minutes
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              {!isPlaying ? (
                <button
                  onClick={resumeSession}
                  className="px-8 py-4 bg-gradient-to-r from-green-400 to-blue-400 text-white rounded-full font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  {sessionTime === 0 ? 'Start' : 'Resume'}
                </button>
              ) : (
                <button
                  onClick={pauseSession}
                  className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Pause
                </button>
              )}
              <button
                onClick={endSession}
                className="px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-full font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                End Session
              </button>
            </div>

            {/* Current Instruction */}
            <div className="max-w-2xl mx-auto">
              <h3 className="text-lg font-medium mb-4" style={{color: 'var(--text-primary)'}}>
                Meditation Guide
              </h3>
              <div className="space-y-3">
                {activeSession.instructions.map((instruction, index) => (
                  <div
                    key={index}
                    className="p-4 bg-white/10 rounded-xl text-left"
                    style={{color: 'var(--text-secondary)'}}
                  >
                    <span className="text-sm font-medium mr-3" style={{color: 'var(--accent-primary)'}}>
                      {index + 1}.
                    </span>
                    {instruction}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{background: 'var(--bg-primary)'}}>
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-lg bg-white/10 border-b border-white/20">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between relative">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="mr-4 p-2 hover:bg-white/10 rounded-full transition-all duration-200"
              style={{color: 'var(--text-secondary)'}}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold" style={{color: 'var(--text-primary)'}}>
              Mindfulness & Meditation
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Duration Selection */}
        <div className="wellness-card p-6 mb-8">
          <h2 className="text-xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>
            Choose Session Duration
          </h2>
          <div className="flex flex-wrap gap-3">
            {durations.map(duration => (
              <button
                key={duration}
                onClick={() => setSelectedDuration(duration)}
                className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                  selectedDuration === duration
                    ? 'bg-white/30 shadow-md'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
                style={{color: 'var(--text-primary)'}}
              >
                {duration} min
              </button>
            ))}
          </div>
        </div>

        {/* Session Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map(session => (
            <div key={session.id} className="wellness-card group cursor-pointer" onClick={() => startSession(session)}>
              <div className={`p-6 bg-gradient-to-br ${session.color} rounded-t-3xl relative`}>
                <div className="absolute inset-0 bg-black/10 rounded-t-3xl"></div>
                <div className="text-4xl mb-4 relative z-10 text-white">{session.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2 relative z-10">
                  {session.name}
                </h3>
                <p className="text-white text-sm mb-4 relative z-10">
                  {session.description}
                </p>
                <div className="flex items-center justify-between relative z-10">
                  <span className="text-white text-sm font-bold">
                    {session.duration}
                  </span>
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h4 className="font-medium mb-2" style={{color: 'var(--text-primary)'}}>What you'll practice:</h4>
                <div className="space-y-1">
                  {session.instructions.slice(0, 3).map((instruction, index) => (
                    <div key={index} className="text-sm flex items-start" style={{color: 'var(--text-muted)'}}>
                      <span className="text-xs mr-2 mt-1">•</span>
                      {instruction}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="mt-12 wellness-card p-8">
          <h2 className="text-2xl font-bold mb-6 text-center" style={{color: 'var(--text-primary)'}}>
            Benefits of Regular Mindfulness Practice
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-3" style={{color: 'var(--text-primary)'}}>●</div>
              <h3 className="font-semibold mb-2" style={{color: 'var(--text-primary)'}}>Mental Clarity</h3>
              <p className="text-sm" style={{color: 'var(--text-muted)'}}>Improved focus and decision-making</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3" style={{color: 'var(--text-primary)'}}>◐</div>
              <h3 className="font-semibold mb-2" style={{color: 'var(--text-primary)'}}>Emotional Balance</h3>
              <p className="text-sm" style={{color: 'var(--text-muted)'}}>Better emotional regulation</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3" style={{color: 'var(--text-primary)'}}>◯</div>
              <h3 className="font-semibold mb-2" style={{color: 'var(--text-primary)'}}>Stress Reduction</h3>
              <p className="text-sm" style={{color: 'var(--text-muted)'}}>Lower anxiety and stress levels</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3" style={{color: 'var(--text-primary)'}}>◦</div>
              <h3 className="font-semibold mb-2" style={{color: 'var(--text-primary)'}}>Better Sleep</h3>
              <p className="text-sm" style={{color: 'var(--text-muted)'}}>Improved sleep quality</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MindfulnessPage;