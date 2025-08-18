// @author: fatima bashir
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import Toast from '../components/Toast';
import BackButton from '../components/BackButton';
import { useMentalMetrics } from '../contexts/MentalMetricsContext';

const StressLevelPage = () => {
  const navigate = useNavigate();
  const { metrics, updateStressLevel } = useMentalMetrics();
  const [stressLevel, setStressLevel] = useState(metrics.stressLevel.label);
  const [stressValue, setStressValue] = useState(metrics.stressLevel.value);
  const [stressors, setStressors] = useState([]);
  const [notes, setNotes] = useState('');
  const [lastUpdated, setLastUpdated] = useState(metrics.stressLevel.lastUpdated);
  const [showToast, setShowToast] = useState(false);

  const stressLevels = [
    { label: 'Very Low', value: 10, color: 'bg-green-100 text-green-600', bgColor: 'from-green-400 to-green-600' },
    { label: 'Low', value: 25, color: 'bg-blue-100 text-blue-600', bgColor: 'from-blue-400 to-blue-600' },
    { label: 'Moderate', value: 50, color: 'bg-yellow-100 text-yellow-600', bgColor: 'from-yellow-400 to-yellow-600' },
    { label: 'High', value: 75, color: 'bg-orange-100 text-orange-600', bgColor: 'from-orange-400 to-orange-600' },
    { label: 'Very High', value: 90, color: 'bg-red-100 text-red-600', bgColor: 'from-red-400 to-red-600' }
  ];

  const commonStressors = [
    'Work deadlines', 'Financial concerns', 'Health issues', 'Relationship problems',
    'Academic pressure', 'Family responsibilities', 'Social situations', 'Life changes',
    'Technology overload', 'Sleep issues', 'Traffic/commuting', 'Decision making'
  ];

  const handleSave = () => {
    // Update the shared context and local storage
    updateStressLevel(stressValue, getCurrentLevel().label, stressors, notes);
    setLastUpdated(new Date().toLocaleDateString());
    setShowToast(true);
  };

  const handleCloseToast = () => {
    setShowToast(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  const getCurrentLevel = () => {
    // Choose the closest predefined level to the current slider value
    const closest = stressLevels.reduce((prev, curr) => {
      const prevDiff = Math.abs(prev.value - stressValue);
      const currDiff = Math.abs(curr.value - stressValue);
      return currDiff < prevDiff ? curr : prev;
    }, stressLevels[0]);
    return closest;
  };

  const handleStressorToggle = (stressor) => {
    setStressors(prev => 
      prev.includes(stressor) 
        ? prev.filter(s => s !== stressor)
        : [...prev, stressor]
    );
  };

  return (
    <div className="min-h-screen" style={{background: 'var(--bg-primary)'}}>
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-lg bg-white/10 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="mr-4">
              <BackButton to="/dashboard" label="Back to Dashboard" />
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7C14.5 7 14 7.5 14 8S14.5 9 15 9H21ZM9 8C9 7.5 8.5 7 8 7H3V9H8C8.5 9 9 8.5 9 8ZM11 15.5V22H13V15.5C13 14.1 11.9 13 10.5 13S8 14.1 8 15.5V22H10V15.5C10 15.2 10.2 15 10.5 15S11 15.2 11 15.5Z"/>
                </svg>
              </div>
              <h1 className="text-2xl font-bold" style={{color: 'var(--text-primary)'}}>Stress Level</h1>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Current Status Card */}
        <div className="wellness-card p-8 mb-8">
          <div className="text-center mb-8">
            <div className="text-5xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>
              {getCurrentLevel().label}
            </div>
            <div className="text-sm" style={{color: 'var(--text-muted)'}}>
              Last updated: {lastUpdated}
            </div>
          </div>

          {/* Stress Level Indicator */}
          <div className="relative w-full h-6 bg-gray-200 rounded-full mb-8">
            <div 
              className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getCurrentLevel().bgColor} rounded-full transition-all duration-500`}
              style={{width: `${stressValue}%`}}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center text-white font-semibold text-sm">
              {stressValue}%
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="wellness-card p-8">
          <h2 className="text-2xl font-bold mb-6" style={{color: 'var(--text-primary)'}}>
            Update Your Stress Level
          </h2>

          {/* Stress Level Selection */}
          <div className="mb-8">
            <label className="block text-lg font-semibold mb-4" style={{color: 'var(--text-primary)'}}>
              How stressed are you feeling today?
            </label>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {stressLevels.map((level) => (
                <button
                  key={level.label}
                  onClick={() => {
                    setStressValue(level.value);
                    setStressLevel(level.label);
                  }}
                  className={`p-4 rounded-xl font-semibold transition-all duration-200 hover:scale-105 ${level.color} ${stressValue === level.value ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                >
                  <div className="text-sm mb-1">{level.label}</div>
                  <div className="text-xs opacity-70">{level.value}%</div>
                </button>
              ))}
            </div>
          </div>

          {/* Stress Slider */}
          <div className="mb-8">
            <label className="block text-lg font-semibold mb-4" style={{color: 'var(--text-primary)'}}>
              Fine-tune your stress level: {stressValue}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={stressValue}
              onChange={(e) => {
                const v = parseInt(e.target.value);
                setStressValue(v);
                // Update display label live to reflect slider value
                const nearest = stressLevels.reduce((prev, curr) => {
                  const prevDiff = Math.abs(prev.value - v);
                  const currDiff = Math.abs(curr.value - v);
                  return currDiff < prevDiff ? curr : prev;
                }, stressLevels[0]);
                setStressLevel(nearest.label);
              }}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm mt-2" style={{color: 'var(--text-muted)'}}>
              <span>No Stress</span>
              <span>Mild</span>
              <span>Moderate</span>
              <span>High</span>
              <span>Severe</span>
            </div>
          </div>

          {/* Common Stressors */}
          <div className="mb-8">
            <label className="block text-lg font-semibold mb-4" style={{color: 'var(--text-primary)'}}>
              What's causing stress today? (Select all that apply)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {commonStressors.map((stressor) => (
                <button
                  key={stressor}
                  onClick={() => handleStressorToggle(stressor)}
                  className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 ${
                    stressors.includes(stressor) 
                      ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-300' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {stressor}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="mb-8">
            <label className="block text-lg font-semibold mb-4" style={{color: 'var(--text-primary)'}}>
              Additional Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe what's contributing to your stress level or any coping strategies you're using... (Press Enter to save)"
              className="w-full h-32 p-4 rounded-xl resize-none"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)'
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleSave}
              className="flex-1 px-8 py-4 rounded-xl text-lg font-semibold text-white transition-all duration-300 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)'
              }}
            >
              Save Changes
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 hover:scale-105"
              style={{
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '2px solid var(--border-color)'
              }}
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Stress Management Tips */}
        <div className="wellness-card p-8 mt-8">
          <h3 className="text-xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>
            🧘‍♀️ Stress Management Tips
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm" style={{color: 'var(--text-secondary)'}}>
            <div>• Practice deep breathing exercises</div>
            <div>• Take regular breaks from work</div>
            <div>• Try meditation or mindfulness</div>
            <div>• Exercise regularly</div>
            <div>• Maintain a healthy sleep schedule</div>
            <div>• Talk to someone you trust</div>
            <div>• Limit caffeine and alcohol</div>
            <div>• Practice time management</div>
          </div>
        </div>
      </div>

      {/* Beautiful Toast Notification */}
      <Toast 
        message="Stress level updated successfully!"
        type="success"
        isVisible={showToast}
        onClose={handleCloseToast}
        duration={4000}
      />
    </div>
  );
};

export default StressLevelPage;