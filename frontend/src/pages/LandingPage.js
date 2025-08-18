// @author: fatima bashir
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{background: 'var(--bg-primary)'}}>
      {/* Header */}
      <div className="flex justify-between items-center p-6">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full mr-3" style={{background: 'var(--gradient-primary)'}}></div>
          <h1 className="text-2xl font-bold" style={{color: '#5B7F71'}}>GinaAI</h1>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="mb-6">
          <h1 className="text-5xl md:text-6xl font-light tracking-tight mb-5" style={{color: 'var(--text-primary)'}}>
            Your AI Wellness
            <br />
            <span className="font-semibold" style={{color: 'var(--accent-primary)'}}>Companion</span>
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-8" style={{color: 'var(--text-secondary)'}}>
            Meet Gina, your personal AI wellness companion. Get support, practice mindfulness, 
            and take care of your mental health with guided exercises and empathetic conversations.
          </p>
        </div>

        {/* Main CTA */}
        <div className="mb-12">
          <button
            onClick={() => navigate('/auth')}
            className="px-10 py-4 text-lg font-medium text-white rounded-full shadow-md hover:shadow-lg transition-all duration-200"
            style={{background: 'var(--gradient-primary)'}}
          >
            Sign in / Create account
          </button>
        </div>

        {/* Feature Overview (non-interactive) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div 
            className="wellness-card p-8 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{background: 'var(--gradient-primary)'}}>
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{color: 'var(--text-primary)'}}>
              Chat with Gina
            </h3>
            <p className="text-sm leading-relaxed" style={{color: 'var(--text-secondary)'}}>
              Have meaningful conversations with your AI wellness companion who understands and supports you.
            </p>
          </div>

          <div 
            className="wellness-card p-8 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{background: 'var(--gradient-primary)'}}>
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="m12 1 0 6m0 6 0 6"></path>
                <path d="m1 12 6 0m6 0 6 0"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{color: 'var(--text-primary)'}}>
              Breathing Exercises
            </h3>
            <p className="text-sm leading-relaxed" style={{color: 'var(--text-secondary)'}}>
              Practice guided breathing techniques to reduce stress and find your center.
            </p>
          </div>

          <div 
            className="wellness-card p-8 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{background: 'var(--gradient-primary)'}}>
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{color: 'var(--text-primary)'}}>
              Mindfulness
            </h3>
            <p className="text-sm leading-relaxed" style={{color: 'var(--text-secondary)'}}>
              Explore meditation and mindfulness practices to cultivate inner peace and awareness.
            </p>
          </div>
        </div>

      </div>

      {/* Subtle background orbs for depth */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.04]" style={{
        backgroundImage: 'radial-gradient(1200px 600px at 20% -20%, var(--accent-primary) 0, transparent 60%), radial-gradient(1200px 600px at 120% 120%, var(--accent-secondary) 0, transparent 60%)'
      }} />

      {/* Footer */}
      <div className="text-center py-8 border-t" style={{borderColor: 'var(--border-color)'}}>
        <p className="text-sm" style={{color: 'var(--text-muted)'}}>
          Built with care for your mental wellness • Private & secure conversations
        </p>
      </div>
    </div>
  );
};

export default LandingPage;