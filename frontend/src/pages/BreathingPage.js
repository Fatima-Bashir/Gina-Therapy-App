// @author: fatima bashir
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

const BreathingPage = () => {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('inhale');
  const [timeLeft, setTimeLeft] = useState(4);
  const [selectedPattern, setSelectedPattern] = useState('box');
  const [progress, setProgress] = useState(0);
  const [cycles, setCycles] = useState(0);
  const intervalRef = useRef(null);
  const animationRef = useRef(null);
  const isDarkMode = typeof document !== 'undefined' && document.body.classList.contains('dark-mode');

  const patterns = {
    box: { inhale: 4, hold: 4, exhale: 4, rest: 4, name: "Box Breathing", description: "Equal breathing for balance" },
    triangle: { inhale: 4, hold: 0, exhale: 4, rest: 0, name: "Triangle Breathing", description: "Simple in-and-out pattern" },
    relaxing: { inhale: 4, hold: 7, exhale: 8, rest: 0, name: "4-7-8 Breathing", description: "Deeply relaxing pattern" },
    energizing: { inhale: 6, hold: 2, exhale: 4, rest: 0, name: "Energizing Breath", description: "Boost your energy" }
  };

  const getNextPhase = (current, pattern) => {
    const phases = ['inhale', 'hold', 'exhale', 'rest'];
    const currentIndex = phases.indexOf(current);
    
    let nextIndex = (currentIndex + 1) % phases.length;
    while (pattern[phases[nextIndex]] === 0 && nextIndex !== currentIndex) {
      nextIndex = (nextIndex + 1) % phases.length;
    }
    
    return phases[nextIndex];
  };

  // Real-time smooth progress animation for circle size (60fps)
  useEffect(() => {
    if (isActive) {
      const startTime = Date.now();
      const duration = patterns[selectedPattern][currentPhase] * 1000;
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min(elapsed / duration, 1);
        
        // Use easing function for more natural breathing motion
        let easedProgress = newProgress;
        if (currentPhase === 'inhale') {
          // Ease out for inhale (faster start, slower end)
          easedProgress = 1 - Math.pow(1 - newProgress, 2);
        } else if (currentPhase === 'exhale') {
          // Ease in for exhale (slower start, faster end)
          easedProgress = Math.pow(newProgress, 2);
        }
        
        setProgress(easedProgress);
        
        if (newProgress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };
      
      animationRef.current = requestAnimationFrame(animate);
    } else {
      setProgress(0);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentPhase, isActive, selectedPattern]);

  // Phase timer
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            const nextPhase = getNextPhase(currentPhase, patterns[selectedPattern]);
            setCurrentPhase(nextPhase);
            setProgress(0);
            if (nextPhase === 'inhale') setCycles(c => c + 1);
            return patterns[selectedPattern][nextPhase];
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive, currentPhase, selectedPattern]);

  const startBreathing = () => {
    setIsActive(true);
    setCurrentPhase('inhale');
    setTimeLeft(patterns[selectedPattern].inhale);
    setProgress(0);
    setCycles(0);
  };

  const stopBreathing = () => {
    setIsActive(false);
    setCurrentPhase('inhale');
    setTimeLeft(patterns[selectedPattern].inhale);
    setProgress(0);
  };

  // Dynamic circle sizing based on breathing phase with smooth real-time animation
  const getCircleSize = () => {
    const minSize = 180;
    const maxSize = 360;
    
    let targetScale = 0.5; // Default middle size
    
    switch (currentPhase) {
      case 'inhale':
        // Gradually grow from 0 to 1 as progress goes from 0 to 1
        targetScale = progress; // Smooth growth throughout inhale
        break;
      case 'hold':
        targetScale = 1; // Stay at max size during hold
        break;
      case 'exhale':
        // Gradually shrink from 1 to 0 as progress goes from 0 to 1
        targetScale = 1 - progress; // Smooth shrinking throughout exhale
        break;
      case 'rest':
        targetScale = 0; // Stay at min size during rest
        break;
    }
    
    // Ensure targetScale is between 0 and 1
    targetScale = Math.max(0, Math.min(1, targetScale));
    
    // Calculate smooth size transition
    const size = minSize + (maxSize - minSize) * targetScale;
    return size;
  };

  const getPhaseColors = () => {
    switch (currentPhase) {
      case 'inhale':
        return { 
          primary: '#87CEEB', 
          secondary: '#B0E0E6',
          glow: 'rgba(135, 206, 235, 0.4)',
          text: 'BREATHE IN'
        };
      case 'hold':
        return { 
          primary: '#DDA0DD', 
          secondary: '#E6E6FA',
          glow: 'rgba(221, 160, 221, 0.4)',
          text: 'HOLD'
        };
      case 'exhale':
        return { 
          primary: '#F5C2C7', 
          secondary: '#FADADD',
          glow: 'rgba(245, 194, 199, 0.4)',
          text: 'BREATHE OUT'
        };
      case 'rest':
        // Subtle, readable in light mode without heavy overlay
        if (!isDarkMode) {
          return {
            primary: '#CFC8EF', // soft ring
            secondary: '#EDEAF8',
            glow: 'rgba(176, 132, 204, 0.15)',
            text: 'REST',
            label: '#5B4B8A',
            countdown: '#2D1B69'
          };
        }
        return {
          primary: '#C4B5D3',
          secondary: '#9B7EC0',
          glow: 'rgba(196, 181, 211, 0.25)',
          text: 'REST',
          label: '#E0D4E7',
          countdown: '#F5F3FA'
        };
      default:
        return { 
          primary: '#E0E6FF', 
          secondary: '#F0F4FF',
          glow: 'rgba(224, 230, 255, 0.3)',
          text: 'READY'
        };
    }
  };

  const colors = getPhaseColors();
  const circleSize = getCircleSize();

  return (
    <div className="min-h-screen" style={{background: 'var(--bg-primary)'}}>
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/5 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="mr-4 p-3 rounded-full hover:bg-white/10 transition-all duration-300"
              style={{color: 'var(--text-primary)'}}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-light" style={{color: 'var(--text-primary)'}}>
                Breathing Exercise
              </h1>
              <p className="text-sm" style={{color: 'var(--text-muted)'}}>
                Find your center through mindful breathing
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Pattern Selection */}
          <div className="lg:col-span-1 space-y-6">
            <div>
              <h2 className="text-xl font-light mb-6" style={{color: 'var(--text-primary)'}}>
                Choose Your Pattern
              </h2>
              <div className="space-y-4">
                {Object.entries(patterns).map(([key, pattern]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedPattern(key)}
                    className={`w-full group p-4 text-left rounded-2xl border transition-all duration-300 hover:scale-102 ${
                      selectedPattern === key 
                        ? 'border-purple-400/50 bg-gradient-to-br from-purple-500/15 to-purple-600/10 shadow-lg' 
                        : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                    }`}
                    style={{
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <div className="flex items-center mb-3">
                      <div 
                        className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl mr-3 transition-all duration-300 border-2 ${
                          selectedPattern === key 
                            ? 'border-purple-400/70' 
                            : 'border-white/20 group-hover:border-white/40'
                        }`}
                        style={{
                          background: selectedPattern === key 
                            ? 'var(--accent-primary)' 
                            : 'rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        {key === 'box' && (
                          <div 
                            className="w-7 h-7 border-3 transition-all duration-300"
                            style={{
                              borderColor: selectedPattern === key 
                                ? 'var(--text-primary)' 
                                : 'var(--accent-primary)'
                            }}
                          ></div>
                        )}
                        {key === 'triangle' && (
                          <div 
                            className="transition-all duration-300"
                            style={{
                              width: 0,
                              height: 0,
                              borderLeft: '12px solid transparent',
                              borderRight: '12px solid transparent',
                              borderBottom: selectedPattern === key 
                                ? '18px solid var(--text-primary)' 
                                : '18px solid var(--accent-primary)'
                            }}
                          ></div>
                        )}
                        {key === 'relaxing' && '🌙'}
                        {key === 'energizing' && '⚡'}
                      </div>
                      <div>
                        <h3 className="font-medium text-sm" style={{color: 'var(--text-primary)'}}>
                          {pattern.name}
                        </h3>
                        <p className="text-xs" style={{color: 'var(--text-muted)'}}>
                          {pattern.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs flex justify-between" style={{color: 'var(--text-secondary)'}}>
                      <span>Inhale: {pattern.inhale}s</span>
                      {pattern.hold > 0 && <span>Hold: {pattern.hold}s</span>}
                      <span>Exhale: {pattern.exhale}s</span>
                      {pattern.rest > 0 && <span>Rest: {pattern.rest}s</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Breathing Interface */}
          <div className="lg:col-span-2 flex items-center justify-center min-h-[70vh]">
            <div className="text-center w-full">
              <div className="relative inline-block">
                {/* Outer glow rings */}
                <div 
                  className="absolute inset-0 rounded-full opacity-15 animate-pulse"
                  style={{
                    background: `radial-gradient(circle, ${colors.glow} 0%, transparent 60%)`,
                    width: `${circleSize + 100}px`,
                    height: `${circleSize + 100}px`,
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                ></div>
                <div 
                  className="absolute inset-0 rounded-full opacity-8"
                  style={{
                    background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
                    width: `${circleSize + 160}px`,
                    height: `${circleSize + 160}px`,
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                ></div>
                
                {/* Main breathing circle - now with smooth real-time animation */}
                <div
                  className="relative rounded-full flex items-center justify-center border-4"
                  style={{
                    width: `${circleSize}px`,
                    height: `${circleSize}px`,
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderColor: colors.primary,
                    boxShadow: `
                      0 0 40px ${colors.glow},
                      0 0 80px ${colors.glow},
                      inset 0 0 30px rgba(255, 255, 255, 0.1)
                    `,
                    backdropFilter: 'blur(10px)',
                    transition: isActive ? 'none' : 'all 0.5s ease-in-out', // No transition during active breathing for smooth real-time animation
                  }}
                >
                  {/* Animated border gradient */}
                  <div 
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `conic-gradient(from 0deg, ${colors.primary} 0%, ${colors.secondary} 50%, ${colors.primary} 100%)`,
                      padding: '4px',
                      borderRadius: '50%',
                    }}
                  >
                  <div 
                    className="w-full h-full rounded-full"
                    style={{
                      // Restore neutral inner fill; rely on text color for readability
                      background: 'var(--bg-primary)',
                    }}
                  ></div>
                  </div>
                  
                  {/* Progress indicator dots */}
                  <div className="absolute inset-0">
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-3 h-3 rounded-full transition-all duration-300"
                        style={{
                          background: progress > (i / 12) ? colors.primary : 'rgba(255, 255, 255, 0.2)',
                          top: '50%',
                          left: '50%',
                          transform: `
                            translate(-50%, -50%) 
                            rotate(${i * 30}deg) 
                            translateY(-${circleSize / 2 + 20}px)
                          `,
                        }}
                      ></div>
                    ))}
                  </div>
                  
                  {/* Content */}
                  <div className="text-center z-10 relative">
                    <div 
                      className="text-2xl font-light mb-3 tracking-widest transition-colors duration-300"
                      style={{color: colors.primary}}
                    >
                      {colors.text}
                    </div>
                    <div 
                      className="text-8xl font-thin mb-2 transition-colors duration-300"
                      style={{color: colors.primary}}
                    >
                      {timeLeft}
                    </div>
                    <div 
                      className="text-sm uppercase tracking-wider opacity-70"
                      style={{color: currentPhase === 'rest' && colors.label ? colors.label : 'var(--text-muted)'}}
                    >
                      {patterns[selectedPattern].name}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Breathing Guide */}
          <div className="lg:col-span-1 space-y-6">
            <div className="wellness-card p-6" style={{backdropFilter: 'blur(20px)'}}>
              <h3 className="text-xl font-light mb-6 text-center" style={{color: 'var(--text-primary)'}}>
                Breathing Guide
              </h3>
              
              <div className="space-y-6">
                <div className="text-left">
                  <h4 className="font-medium mb-3" style={{color: 'var(--text-primary)'}}>Getting Started</h4>
                  <ul className="space-y-2 text-sm" style={{color: 'var(--text-secondary)'}}>
                    <li>• Find a comfortable, quiet position</li>
                    <li>• Close your eyes or soften your gaze</li>
                    <li>• Allow your body to relax naturally</li>
                    <li>• Follow the circle's rhythm</li>
                  </ul>
                </div>
                
                <div className="text-left">
                  <h4 className="font-medium mb-3" style={{color: 'var(--text-primary)'}}>During Practice</h4>
                  <ul className="space-y-2 text-sm" style={{color: 'var(--text-secondary)'}}>
                    <li>• Breathe through your nose when possible</li>
                    <li>• Don't force the breath, let it flow</li>
                    <li>• If distracted, gently return focus</li>
                    <li>• Practice for 3-10 minutes daily</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Controls */}
        <div className="text-center mb-12">
          {!isActive ? (
            <button
              onClick={startBreathing}
              className="group px-12 py-4 rounded-full font-medium text-white text-lg transition-all duration-300 hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 8px 30px rgba(102, 126, 234, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
              }}
            >
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-3 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M12 5v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Start Breathing
              </span>
            </button>
          ) : (
            <button
              onClick={stopBreathing}
              className="group px-12 py-4 rounded-full font-medium text-white text-lg transition-all duration-300 hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
                boxShadow: '0 8px 30px rgba(255, 107, 107, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
              }}
            >
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9l6 6m0-6l-6 6" />
                </svg>
                Stop Session
              </span>
            </button>
          )}
        </div>

        {/* Cycle Counter */}
        {cycles > 0 && (
          <div className="text-center mb-12">
            <div className="inline-block wellness-card px-8 py-4">
              <div className="text-3xl font-light mb-1" style={{color: 'var(--text-primary)'}}>
                {cycles}
              </div>
              <div className="text-sm" style={{color: 'var(--text-muted)'}}>
                Breathing Cycles
              </div>
            </div>
          </div>
        )}


      </div>
    </div>
  );
};

export default BreathingPage;