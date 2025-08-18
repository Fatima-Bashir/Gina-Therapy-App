// @author: fatima bashir
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

const HomePage = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Track mouse position for parallax effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const FloatingShape = ({ delay, duration, size, top, left }) => (
    <div
      className="absolute rounded-full opacity-20 animate-pulse"
      style={{
        background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
        width: size,
        height: size,
        top: top,
        left: left,
        animation: `float ${duration}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
        transition: 'transform 0.3s ease-out'
      }}
    />
  );

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)'
    }}>
      {/* Floating Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <FloatingShape delay={0} duration={8} size="120px" top="10%" left="85%" />
        <FloatingShape delay={2} duration={10} size="80px" top="70%" left="10%" />
        <FloatingShape delay={4} duration={12} size="100px" top="30%" left="5%" />
        <FloatingShape delay={1} duration={9} size="60px" top="80%" left="75%" />
        <FloatingShape delay={3} duration={11} size="90px" top="20%" left="25%" />
      </div>

      {/* Header */}
      <div className="glass-header sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)'
              }}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold" style={{color: 'var(--text-primary)'}}>GinaAI</h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Text Content */}
            <div className="space-y-8 slide-up">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium" style={{
                  background: 'linear-gradient(135deg, rgba(123, 175, 212, 0.1) 0%, rgba(168, 213, 186, 0.1) 100%)',
                  color: 'var(--accent-primary)',
                  border: '1px solid rgba(123, 175, 212, 0.2)'
                }}>
                  ✨ Powered by OpenAI GPT-4o
                </div>
                
                <h1 className="text-6xl lg:text-7xl font-bold leading-tight" style={{
                  background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--accent-primary) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Meet
                  <br />
                  <span style={{color: 'var(--accent-primary)'}}>GinaAI</span>
                </h1>
                
                <p className="text-xl leading-relaxed max-w-lg" style={{color: 'var(--text-secondary)'}}>
                  Your intelligent conversational companion with emotional intelligence, 
                  voice interaction, and personalized support.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/chat')}
                  className="group px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
                    color: 'white',
                    border: 'none'
                  }}
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>Start Conversation</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </button>
                
                <button
                  onClick={() => navigate('/about')}
                  className="px-8 py-4 rounded-2xl text-lg font-medium transition-all duration-300 hover:scale-105"
                  style={{
                    background: 'transparent',
                    color: 'var(--text-primary)',
                    border: '2px solid var(--accent-primary)'
                  }}
                >
                  Learn More
                </button>
              </div>

              {/* Stats */}
              <div className="flex space-x-8 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold" style={{color: 'var(--accent-primary)'}}>24/7</div>
                  <div className="text-sm" style={{color: 'var(--text-secondary)'}}>Available</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold" style={{color: 'var(--accent-primary)'}}>GPT-4o</div>
                  <div className="text-sm" style={{color: 'var(--text-secondary)'}}>AI Model</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold" style={{color: 'var(--accent-primary)'}}>Voice</div>
                  <div className="text-sm" style={{color: 'var(--text-secondary)'}}>Enabled</div>
                </div>
              </div>
            </div>

            {/* Right Column - Visual Elements */}
            <div className="relative flex items-center justify-center slide-up" style={{animationDelay: '0.2s'}}>
              <div className="relative">
                {/* Main Avatar */}
                <div className="w-80 h-80 rounded-full flex items-center justify-center shadow-2xl relative z-10" style={{
                  background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--surface-variant) 100%)',
                  border: '3px solid rgba(123, 175, 212, 0.2)'
                }}>
                  <svg className="w-32 h-32" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{color: 'var(--accent-primary)'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>

                {/* Orbiting Elements */}
                <div className="absolute inset-0 animate-spin" style={{animationDuration: '20s'}}>
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg" style={{
                    background: 'linear-gradient(135deg, var(--accent-secondary) 0%, var(--accent-primary) 100%)'
                  }}>
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                </div>

                <div className="absolute inset-0 animate-spin" style={{animationDuration: '25s', animationDirection: 'reverse'}}>
                  <div className="absolute bottom-4 right-8 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{
                    background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)'
                  }}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M9 12a3 3 0 106 0 3 3 0 00-6 0z" />
                    </svg>
                  </div>
                </div>

                <div className="absolute inset-0 animate-spin" style={{animationDuration: '30s'}}>
                  <div className="absolute top-1/2 left-4 transform -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center shadow-lg" style={{
                    background: 'linear-gradient(135deg, var(--accent-secondary) 0%, var(--accent-primary) 100%)'
                  }}>
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20" style={{background: 'var(--bg-secondary)'}}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6" style={{color: 'var(--text-primary)'}}>
              Why Choose GinaAI?
            </h2>
            <p className="text-xl max-w-3xl mx-auto" style={{color: 'var(--text-secondary)'}}>
              Experience the future of AI conversation with advanced features designed for natural interaction
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group relative p-8 rounded-3xl transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer fade-in" style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              animationDelay: '0.2s'
            }}>
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-r from-blue-500 to-purple-600">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>Voice Intelligence</h3>
                <p className="text-lg leading-relaxed" style={{color: 'var(--text-secondary)'}}>
                  Speak naturally and get instant responses with advanced speech recognition and synthesis.
                </p>
              </div>
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500" style={{
                background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)'
              }} />
            </div>

            <div className="group relative p-8 rounded-3xl transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer fade-in" style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              animationDelay: '0.4s'
            }}>
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-r from-pink-500 to-rose-600">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>Emotional AI</h3>
                <p className="text-lg leading-relaxed" style={{color: 'var(--text-secondary)'}}>
                  Gina understands your emotions and responds with empathy and appropriate support.
                </p>
              </div>
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500" style={{
                background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)'
              }} />
            </div>

            <div className="group relative p-8 rounded-3xl transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer fade-in" style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              animationDelay: '0.6s'
            }}>
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-r from-yellow-500 to-orange-600">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>Lightning Fast</h3>
                <p className="text-lg leading-relaxed" style={{color: 'var(--text-secondary)'}}>
                  Powered by GPT-4o for intelligent, contextual conversations in real-time.
                </p>
              </div>
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500" style={{
                background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)'
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="py-20 relative overflow-hidden">
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
          opacity: 0.05
        }} />
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl font-bold mb-8" style={{color: 'var(--text-primary)'}}>
            Ready to Experience GinaAI?
          </h2>
          
          <p className="text-xl mb-12 max-w-2xl mx-auto" style={{color: 'var(--text-secondary)'}}>
            Join thousands who are already enjoying intelligent conversations with emotional understanding
          </p>
          
          <button
            onClick={() => navigate('/chat')}
            className="group px-12 py-6 rounded-2xl text-xl font-bold transition-all duration-300 hover:scale-110 shadow-2xl hover:shadow-3xl"
            style={{
              background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
              color: 'white',
              border: 'none'
            }}
          >
            <span className="flex items-center justify-center space-x-3">
              <span>Start Your Conversation</span>
              <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </span>
          </button>
        </div>
      </div>

      {/* Add CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        .slide-up {
          animation: slideUp 0.8s ease-out forwards;
          opacity: 0;
          transform: translateY(30px);
        }
        
        .fade-in {
          animation: fadeIn 0.8s ease-out forwards;
          opacity: 0;
        }
        
        @keyframes slideUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;