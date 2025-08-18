// @author: fatima bashir
import React, { useState, useEffect } from 'react';
import { logoutAndRedirect, getToken } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import { useMentalMetrics } from '../contexts/MentalMetricsContext';
import ThemeToggle from '../components/ThemeToggle';
import BackButton from '../components/BackButton';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { metrics } = useMentalMetrics();
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [displayName, setDisplayName] = useState('there');

  const handleLogout = () => logoutAndRedirect('/auth');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Resolve display name from auth
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setDisplayName('there');
      return;
    }
    (async () => {
      try {
        const res = await fetch('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          const raw = (data?.user?.username && data.user.username.trim())
            || (data?.user?.email ? String(data.user.email).split('@')[0] : '')
            || 'there';
          const formatted = raw.charAt(0).toUpperCase() + raw.slice(1);
          setDisplayName(formatted);
        } else {
          setDisplayName('there');
        }
      } catch {
        setDisplayName('there');
      }
    })();
  }, []);

  const MetricCard = ({ title, value, icon, trend, color, onClick }) => (
    <div className="metric-card cursor-pointer hover:scale-105 transition-all duration-200" onClick={onClick}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm" style={{color: 'var(--text-muted)'}}>{title}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold mb-1" style={{color: 'var(--text-primary)'}}>{value}</div>
      {trend && (
        <div className="text-xs flex items-center" style={{color: trend > 0 ? '#10B981' : '#EF4444'}}>
          <span>{trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%</span>
        </div>
      )}
      <div className="text-xs mt-2 opacity-70" style={{color: 'var(--text-muted)'}}>
        Click to edit
      </div>
    </div>
  );

  const WellnessCard = ({ title, subtitle, icon, gradient, onClick }) => (
    <div className="wellness-card cursor-pointer group" onClick={onClick}>
      <div className={`p-6 ${gradient} rounded-[40px]`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-semibold text-lg mb-1">{title}</h3>
            <p className="text-white/80 text-sm">{subtitle}</p>
          </div>
          <div className="w-24 h-24 relative">
            <div className="gradient-orb w-full h-full"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                {icon}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center text-white/70 text-sm">
          <span>Start session</span>
          <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{background: 'var(--bg-primary)'}}>
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-lg bg-white/10 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <BackButton />
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/settings')}
                className="p-2 rounded-full hover:bg-white/10 transition-all duration-200"
                style={{ color: 'var(--text-secondary)' }}
                title="Settings"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M11.049 2.927c.3-1.14 1.603-1.14 1.902 0a1.724 1.724 0 002.573 1.066c1.003-.58 2.157.574 1.577 1.577a1.724 1.724 0 001.066 2.573c1.14.3 1.14 1.603 0 1.902a1.724 1.724 0 00-1.066 2.573c.58 1.003-.574 2.157-1.577 1.577a1.724 1.724 0 00-2.573 1.066c-.3 1.14-1.603 1.14-1.902 0a1.724 1.724 0 00-2.573-1.066c-1.003.58-2.157-.574-1.577-1.577a1.724 1.724 0 00-1.066-2.573c-1.14-.3-1.14-1.603 0-1.902a1.724 1.724 0 001.066-2.573c-.58-1.003.574-2.157 1.577-1.577.99.572 2.27.08 2.573-1.066z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              {getToken() && (
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-full border hover:bg-white/10 transition-all duration-200 text-sm"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)'}}
                  title="Log out"
                >
                  Log out
                </button>
              )}
              <ThemeToggle />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{color: 'var(--text-primary)'}}>
                {greeting}, {displayName}!
              </h1>
              <p className="text-sm" style={{color: 'var(--text-muted)'}}>
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Metrics & Tracking */}
          <div className="lg:col-span-1 space-y-6">
            {/* Mental Metrics */}
            <div className="wellness-card p-6">
              <h3 className="text-lg font-bold mb-4" style={{color: 'var(--text-primary)'}}>
                Mental Metrics
              </h3>
              <div className="space-y-4">
                <MetricCard
                  title="Wellbeing"
                  value={`${metrics.wellbeing.value}%`}
                  trend={metrics.wellbeing.trend}
                  color="bg-green-100"
                  onClick={() => navigate('/wellbeing')}
                  icon={
                    <svg className="w-5 h-5 text-green-600 metric-icon--pop" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
                    </svg>
                  }
                />
                <MetricCard
                  title="Stress Level"
                  value={metrics.stressLevel.label}
                  trend={metrics.stressLevel.trend}
                  color="bg-blue-100"
                  onClick={() => navigate('/stress-level')}
                  icon={
                    <svg className="w-5 h-5 text-blue-600 metric-icon--pop" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7C14.5 7 14 7.5 14 8S14.5 9 15 9H21ZM9 8C9 7.5 8.5 7 8 7H3V9H8C8.5 9 9 8.5 9 8ZM11 15.5V22H13V15.5C13 14.1 11.9 13 10.5 13S8 14.1 8 15.5V22H10V15.5C10 15.2 10.2 15 10.5 15S11 15.2 11 15.5Z"/>
                    </svg>
                  }
                />
                <MetricCard
                  title="Mood"
                  value={metrics.mood.value}
                  color="bg-yellow-100"
                  onClick={() => navigate('/mood')}
                  icon={
                    <svg className="w-5 h-5 text-yellow-600 metric-icon--pop" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 17.5C14.33 17.5 16.3 16.04 17.11 14H6.89C7.69 16.04 9.67 17.5 12 17.5ZM8.5 11C9.33 11 10 10.33 10 9.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11ZM15.5 11C16.33 11 17 10.33 17 9.5S16.33 8 15.5 8 14 8.67 14 9.5 14.67 11 15.5 11ZM12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20Z"/>
                    </svg>
                  }
                />
              </div>
            </div>

            {/* Activity Tracker and Quick Stats removed per user request */}
          </div>

          {/* Main Content - Actions */}
          <div className="lg:col-span-3 space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <WellnessCard
                title="Breathing Exercise"
                subtitle="Guided deep breathing"
                gradient="bg-gradient-to-br from-purple-400 to-pink-400"
                icon={<svg className="w-6 h-6 text-white wellness-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="m12 1 0 6m0 6 0 6"></path>
                  <path d="m1 12 6 0m6 0 6 0"></path>
                </svg>}
                onClick={() => navigate('/breathing')}
              />
              <WellnessCard
                title="Mindfulness"
                subtitle="Meditation & awareness"
                gradient="bg-gradient-to-br from-blue-400 to-purple-400"
                icon={<svg className="w-6 h-6 text-white wellness-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>}
                onClick={() => navigate('/mindfulness')}
              />
            </div>

            {/* Chat with Gina - beautified hero card */}
            <div className="wellness-card">
              <div className="p-10 text-center">
                <div className="w-28 h-28 mx-auto mb-6 relative">
                  <div className="gradient-orb w-full h-full rounded-full"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-18 h-18 bg-white/25 rounded-full flex items-center justify-center backdrop-blur-sm shadow-sm">
                      <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-2" style={{color: 'var(--text-primary)'}}>Talk to Gina</h3>
                <p className="text-sm md:text-base mb-6" style={{color: 'var(--text-secondary)'}}>Your AI wellness companion is here to help</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => navigate('/chat')}
                    className="px-6 py-3 rounded-full text-white font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                    style={{background: 'var(--gradient-primary)'}}
                  >
                    <span className="inline-flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                      Start conversation
                    </span>
                  </button>
                  <button
                    onClick={() => navigate('/journal')}
                    className="px-6 py-3 rounded-full font-medium border hover:-translate-y-0.5 transition-all"
                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'transparent' }}
                  >
                    <span className="inline-flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20l9-5-9-5-9 5 9 5z"/></svg>
                      Open journal
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;