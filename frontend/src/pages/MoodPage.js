// @author: fatima bashir
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import Toast from '../components/Toast';
import BackButton from '../components/BackButton';
import { useMentalMetrics } from '../contexts/MentalMetricsContext';

const MoodPage = () => {
  const navigate = useNavigate();
  const { metrics, updateMood } = useMentalMetrics();
  const [currentMood, setCurrentMood] = useState(metrics.mood.value);
  const [moodIntensity, setMoodIntensity] = useState(metrics.mood.intensity);
  const [moodTriggers, setMoodTriggers] = useState([]);
  const [notes, setNotes] = useState('');
  const [lastUpdated, setLastUpdated] = useState(metrics.mood.lastUpdated);
  const [showToast, setShowToast] = useState(false);

  const moods = [
    { 
      label: 'Ecstatic', 
      emoji: '🤩', 
      color: 'bg-purple-100 text-purple-600',
      description: 'Extremely joyful and excited'
    },
    { 
      label: 'Happy', 
      emoji: '😊', 
      color: 'bg-yellow-100 text-yellow-600',
      description: 'Feeling good and content'
    },
    { 
      label: 'Content', 
      emoji: '😌', 
      color: 'bg-green-100 text-green-600',
      description: 'Peaceful and satisfied'
    },
    { 
      label: 'Neutral', 
      emoji: '😐', 
      color: 'bg-gray-100 text-gray-600',
      description: 'Neither positive nor negative'
    },
    { 
      label: 'Anxious', 
      emoji: '😰', 
      color: 'bg-orange-100 text-orange-600',
      description: 'Worried or nervous'
    },
    { 
      label: 'Sad', 
      emoji: '😢', 
      color: 'bg-blue-100 text-blue-600',
      description: 'Feeling down or melancholy'
    },
    { 
      label: 'Angry', 
      emoji: '😠', 
      color: 'bg-red-100 text-red-600',
      description: 'Frustrated or irritated'
    },
    { 
      label: 'Overwhelmed', 
      emoji: '🤯', 
      color: 'bg-pink-100 text-pink-600',
      description: 'Feeling stressed or overloaded'
    }
  ];

  const moodTriggerOptions = [
    'Good weather', 'Accomplishment', 'Social interaction', 'Exercise',
    'Music', 'Food/treats', 'Rest/sleep', 'Nature/outdoors',
    'Work stress', 'Relationship issues', 'Health concerns', 'Financial worry',
    'Lack of sleep', 'Bad news', 'Social media', 'Physical discomfort'
  ];

  const handleSave = () => {
    // Update the shared context and local storage
    updateMood(currentMood, moodIntensity, moodTriggers, notes);
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

  const getCurrentMoodData = () => {
    return moods.find(mood => mood.label === currentMood) || moods[1];
  };

  const handleTriggerToggle = (trigger) => {
    setMoodTriggers(prev => 
      prev.includes(trigger) 
        ? prev.filter(t => t !== trigger)
        : [...prev, trigger]
    );
  };

  const getIntensityColor = (intensity) => {
    if (intensity <= 3) return 'from-blue-400 to-blue-600';
    if (intensity <= 6) return 'from-yellow-400 to-yellow-600';
    return 'from-green-400 to-green-600';
  };

  const getIntensityLabel = (intensity) => {
    if (intensity <= 2) return 'Very Low';
    if (intensity <= 4) return 'Low';
    if (intensity <= 6) return 'Moderate';
    if (intensity <= 8) return 'High';
    return 'Very High';
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
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 17.5C14.33 17.5 16.3 16.04 17.11 14H6.89C7.69 16.04 9.67 17.5 12 17.5ZM8.5 11C9.33 11 10 10.33 10 9.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11ZM15.5 11C16.33 11 17 10.33 17 9.5S16.33 8 15.5 8 14 8.67 14 9.5 14.67 11 15.5 11ZM12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20Z"/>
                </svg>
              </div>
              <h1 className="text-2xl font-bold" style={{color: 'var(--text-primary)'}}>Mood</h1>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Current Status Card */}
        <div className="wellness-card p-8 mb-8">
          <div className="text-center mb-8">
            <div className="text-8xl mb-4">
              {getCurrentMoodData().emoji}
            </div>
            <div className="text-4xl font-bold mb-2" style={{color: 'var(--text-primary)'}}>
              {currentMood}
            </div>
            <div className="text-lg mb-4" style={{color: 'var(--text-secondary)'}}>
              {getCurrentMoodData().description}
            </div>
            <div className="text-sm" style={{color: 'var(--text-muted)'}}>
              Last updated: {lastUpdated}
            </div>
          </div>

          {/* Mood Intensity */}
          <div className="mb-6">
            <div className="text-center mb-4">
              <span className="text-lg font-semibold" style={{color: 'var(--text-primary)'}}>
                Intensity: {getIntensityLabel(moodIntensity)} ({moodIntensity}/10)
              </span>
            </div>
            <div className="relative w-full h-4 bg-gray-200 rounded-full">
              <div 
                className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getIntensityColor(moodIntensity)} rounded-full transition-all duration-500`}
                style={{width: `${(moodIntensity / 10) * 100}%`}}
              ></div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="wellness-card p-8">
          <h2 className="text-2xl font-bold mb-6" style={{color: 'var(--text-primary)'}}>
            Update Your Mood
          </h2>

          {/* Mood Selection */}
          <div className="mb-8">
            <label className="block text-lg font-semibold mb-4" style={{color: 'var(--text-primary)'}}>
              How are you feeling right now?
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {moods.map((mood) => (
                <button
                  key={mood.label}
                  onClick={() => setCurrentMood(mood.label)}
                  className={`p-4 rounded-xl font-semibold transition-all duration-200 hover:scale-105 ${mood.color} ${currentMood === mood.label ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                >
                  <div className="text-3xl mb-2">{mood.emoji}</div>
                  <div className="text-sm">{mood.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Mood Intensity Slider */}
          <div className="mb-8">
            <label className="block text-lg font-semibold mb-4" style={{color: 'var(--text-primary)'}}>
              How intense is this feeling? ({moodIntensity}/10)
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={moodIntensity}
              onChange={(e) => setMoodIntensity(parseInt(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm mt-2" style={{color: 'var(--text-muted)'}}>
              <span>Barely noticeable</span>
              <span>Moderate</span>
              <span>Very intense</span>
            </div>
          </div>

          {/* Mood Triggers */}
          <div className="mb-8">
            <label className="block text-lg font-semibold mb-4" style={{color: 'var(--text-primary)'}}>
              What's influencing your mood today? (Select all that apply)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {moodTriggerOptions.map((trigger) => (
                <button
                  key={trigger}
                  onClick={() => handleTriggerToggle(trigger)}
                  className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 ${
                    moodTriggers.includes(trigger) 
                      ? 'bg-yellow-100 text-yellow-600 ring-2 ring-yellow-300' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {trigger}
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
              placeholder="Describe what's happening in your life, thoughts you're having, or anything else about your mood... (Press Enter to save)"
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

        {/* Mood Improvement Tips */}
        <div className="wellness-card p-8 mt-8">
          <h3 className="text-xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>
            😊 Mood Boosting Tips
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm" style={{color: 'var(--text-secondary)'}}>
            <div>• Practice gratitude journaling</div>
            <div>• Listen to uplifting music</div>
            <div>• Spend time in nature</div>
            <div>• Connect with friends or family</div>
            <div>• Do something creative</div>
            <div>• Practice mindfulness or meditation</div>
            <div>• Engage in physical activity</div>
            <div>• Help someone else</div>
          </div>
        </div>
      </div>

      {/* Beautiful Toast Notification */}
      <Toast 
        message="Mood updated successfully!"
        type="success"
        isVisible={showToast}
        onClose={handleCloseToast}
        duration={4000}
      />
    </div>
  );
};

export default MoodPage;