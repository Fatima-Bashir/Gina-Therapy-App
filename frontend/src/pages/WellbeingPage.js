// @author: fatima bashir
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import Toast from '../components/Toast';
import BackButton from '../components/BackButton';
import { useMentalMetrics } from '../contexts/MentalMetricsContext';

const WellbeingPage = () => {
  const navigate = useNavigate();
  const { metrics, updateWellbeing } = useMentalMetrics();
  const [wellbeingValue, setWellbeingValue] = useState(metrics.wellbeing.value);
  const [notes, setNotes] = useState('');
  const [lastUpdated, setLastUpdated] = useState(metrics.wellbeing.lastUpdated);
  const [showToast, setShowToast] = useState(false);

  const handleSave = () => {
    // Update the shared context and local storage
    updateWellbeing(wellbeingValue, notes);
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

  const getWellbeingColor = (value) => {
    if (value >= 80) return 'text-green-600';
    if (value >= 60) return 'text-yellow-600';
    if (value >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getWellbeingStatus = (value) => {
    if (value >= 80) return 'Excellent';
    if (value >= 60) return 'Good';
    if (value >= 40) return 'Fair';
    return 'Needs Attention';
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
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
                </svg>
              </div>
              <h1 className="text-2xl font-bold" style={{color: 'var(--text-primary)'}}>Wellbeing</h1>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Current Status Card */}
        <div className="wellness-card p-8 mb-8">
          <div className="text-center mb-8">
            <div className="text-6xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>
              {wellbeingValue}%
            </div>
            <div className={`text-2xl font-semibold mb-2 ${getWellbeingColor(wellbeingValue)}`}>
              {getWellbeingStatus(wellbeingValue)}
            </div>
            <div className="text-sm" style={{color: 'var(--text-muted)'}}>
              Last updated: {lastUpdated}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative w-full h-4 bg-gray-200 rounded-full mb-8">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-500"
              style={{width: `${wellbeingValue}%`}}
            ></div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="wellness-card p-8">
          <h2 className="text-2xl font-bold mb-6" style={{color: 'var(--text-primary)'}}>
            Update Your Wellbeing
          </h2>

          {/* Slider */}
          <div className="mb-8">
            <label className="block text-lg font-semibold mb-4" style={{color: 'var(--text-primary)'}}>
              How are you feeling today? ({wellbeingValue}%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={wellbeingValue}
              onChange={(e) => setWellbeingValue(parseInt(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #10b981 0%, #10b981 ${wellbeingValue}%, #e5e7eb ${wellbeingValue}%, #e5e7eb 100%)`
              }}
            />
            <div className="flex justify-between text-sm mt-2" style={{color: 'var(--text-muted)'}}>
              <span>Poor</span>
              <span>Fair</span>
              <span>Good</span>
              <span>Excellent</span>
            </div>
          </div>

          {/* Quick Options */}
          <div className="mb-8">
            <label className="block text-lg font-semibold mb-4" style={{color: 'var(--text-primary)'}}>
              Quick Select
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Poor', value: 25, color: 'bg-red-100 text-red-600' },
                { label: 'Fair', value: 50, color: 'bg-orange-100 text-orange-600' },
                { label: 'Good', value: 75, color: 'bg-yellow-100 text-yellow-600' },
                { label: 'Excellent', value: 95, color: 'bg-green-100 text-green-600' }
              ].map((option) => (
                <button
                  key={option.label}
                  onClick={() => setWellbeingValue(option.value)}
                  className={`p-4 rounded-xl font-semibold transition-all duration-200 hover:scale-105 ${option.color} ${wellbeingValue === option.value ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                >
                  {option.label}
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
              placeholder="How are you feeling? What's contributing to your wellbeing today? (Press Enter to save)"
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

        {/* Tips Card */}
        <div className="wellness-card p-8 mt-8">
          <h3 className="text-xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>
            💡 Wellbeing Tips
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm" style={{color: 'var(--text-secondary)'}}>
            <div>• Practice gratitude daily</div>
            <div>• Get adequate sleep (7-9 hours)</div>
            <div>• Stay physically active</div>
            <div>• Connect with loved ones</div>
            <div>• Take breaks from technology</div>
            <div>• Engage in hobbies you enjoy</div>
          </div>
        </div>
      </div>

      {/* Beautiful Toast Notification */}
      <Toast 
        message="Wellbeing updated successfully!"
        type="success"
        isVisible={showToast}
        onClose={handleCloseToast}
        duration={4000}
      />
    </div>
  );
};

export default WellbeingPage;