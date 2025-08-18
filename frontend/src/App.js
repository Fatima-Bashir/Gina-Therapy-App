// @author: fatima bashir
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { ThemeProvider } from './contexts/ThemeContext';
import { MentalMetricsProvider } from './contexts/MentalMetricsContext';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import SessionPage from './pages/SessionPage';
import AuthPage from './pages/AuthPage';
import SettingsPage from './pages/SettingsPage';
import IntakePage from './pages/IntakePage';
import JournalPage from './pages/JournalPage';
import BreathingPage from './pages/BreathingPage';
import MindfulnessPage from './pages/MindfulnessPage';
import WellbeingPage from './pages/WellbeingPage';
import StressLevelPage from './pages/StressLevelPage';
import MoodPage from './pages/MoodPage';

function App() {
  return (
    <ThemeProvider>
      <MentalMetricsProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/chat" element={<SessionPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/intake" element={<IntakePage />} />
              <Route path="/journal" element={<JournalPage />} />
              <Route path="/breathing" element={<BreathingPage />} />
              <Route path="/mindfulness" element={<MindfulnessPage />} />
              <Route path="/wellbeing" element={<WellbeingPage />} />
              <Route path="/stress-level" element={<StressLevelPage />} />
              <Route path="/mood" element={<MoodPage />} />
            </Routes>
          </div>
        </Router>
      </MentalMetricsProvider>
    </ThemeProvider>
  );
}

export default App; 