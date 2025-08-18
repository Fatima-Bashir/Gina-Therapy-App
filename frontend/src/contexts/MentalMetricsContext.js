// @author: fatima bashir
import React, { createContext, useContext, useState, useEffect } from 'react';

const MentalMetricsContext = createContext();

export const useMentalMetrics = () => {
  const context = useContext(MentalMetricsContext);
  if (!context) {
    throw new Error('useMentalMetrics must be used within a MentalMetricsProvider');
  }
  return context;
};

export const MentalMetricsProvider = ({ children }) => {
  // Initialize with default values, but try to load from localStorage
  const [metrics, setMetrics] = useState(() => {
    const saved = localStorage.getItem('mentalMetrics');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      wellbeing: {
        value: 78,
        trend: 12,
        lastUpdated: new Date().toLocaleDateString()
      },
      stressLevel: {
        value: 25,
        label: 'Low',
        trend: -8,
        lastUpdated: new Date().toLocaleDateString()
      },
      mood: {
        value: 'Happy',
        intensity: 7,
        lastUpdated: new Date().toLocaleDateString()
      }
    };
  });

  // Save to localStorage whenever metrics change
  useEffect(() => {
    localStorage.setItem('mentalMetrics', JSON.stringify(metrics));
    try {
      // Also persist latest metrics into backend memories so Gina can recall across sessions
      const token = localStorage.getItem('token');
      if (token) {
        fetch('/memories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ facts: { lastMentalMetrics: metrics } })
        }).catch(() => {});
      }
    } catch (_) {}
  }, [metrics]);

  const updateWellbeing = (value, notes = '') => {
    setMetrics(prev => ({
      ...prev,
      wellbeing: {
        ...prev.wellbeing,
        value: value,
        trend: value - prev.wellbeing.value,
        lastUpdated: new Date().toLocaleDateString(),
        notes
      }
    }));
  };

  const updateStressLevel = (value, label, stressors = [], notes = '') => {
    setMetrics(prev => ({
      ...prev,
      stressLevel: {
        ...prev.stressLevel,
        value: value,
        label: label,
        trend: prev.stressLevel.value - value, // Negative trend is good for stress
        lastUpdated: new Date().toLocaleDateString(),
        stressors,
        notes
      }
    }));
  };

  const updateMood = (mood, intensity, triggers = [], notes = '') => {
    setMetrics(prev => ({
      ...prev,
      mood: {
        ...prev.mood,
        value: mood,
        intensity: intensity,
        lastUpdated: new Date().toLocaleDateString(),
        triggers,
        notes
      }
    }));
  };

  const value = {
    metrics,
    updateWellbeing,
    updateStressLevel,
    updateMood
  };

  return (
    <MentalMetricsContext.Provider value={value}>
      {children}
    </MentalMetricsContext.Provider>
  );
};

export default MentalMetricsContext;