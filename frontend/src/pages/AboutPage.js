// @author: fatima bashir
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen hero-gradient">
      {/* Header */}
      <div className="glass-header sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/home')}
              className="mr-4 p-2 hover:bg-white/10 rounded-full transition-all duration-200"
              style={{color: 'var(--text-secondary)'}}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="headline-small" style={{color: 'var(--text-primary)', fontSize: '1.25rem'}}>About GinaAI</h1>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="card-primary p-12 slide-up">
          {/* Logo Section */}
          <div className="text-center mb-16">
            <div className="w-36 h-36 mx-auto mb-8 avatar-icon rounded-3xl flex items-center justify-center shadow-lg">
              <svg className="w-18 h-18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h1 className="headline-large text-gradient mb-6">GinaAI</h1>
            <p className="body-large max-w-2xl mx-auto" style={{color: 'var(--text-secondary)'}}>Your intelligent conversational assistant powered by advanced AI</p>
          </div>

          {/* About Content */}
          <div className="space-y-12">
            <section className="fade-in" style={{animationDelay: '0.2s'}}>
              <h2 className="headline-medium mb-6" style={{color: 'var(--text-primary)'}}>What is GinaAI?</h2>
              <p className="body-large max-w-4xl" style={{color: 'var(--text-secondary)'}}>
                GinaAI is an advanced conversational AI assistant designed to provide intelligent, 
                helpful, and engaging interactions. Built with modern web technologies, Gina supports 
                both text and voice communications, making conversations more natural and accessible.
              </p>
            </section>

            <section className="fade-in" style={{animationDelay: '0.3s'}}>
              <h2 className="headline-medium mb-8" style={{color: 'var(--text-primary)'}}>Key Features</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="feature-icon w-12 h-12 mt-1">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="headline-small mb-2" style={{color: 'var(--text-primary)', fontSize: '1.125rem'}}>Intelligent Conversations</h3>
                      <p className="body-regular" style={{color: 'var(--text-secondary)'}}>Context-aware dialogue with natural language understanding and emotional intelligence</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="feature-icon w-12 h-12 mt-1">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="headline-small mb-2" style={{color: 'var(--text-primary)', fontSize: '1.125rem'}}>Voice Recognition</h3>
                      <p className="body-regular" style={{color: 'var(--text-secondary)'}}>Speak naturally using advanced speech recognition technology</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="feature-icon w-12 h-12 mt-1">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M9.464 15.536a5 5 0 01-7.072 0M6.636 6.636a9 9 0 00-12.728 0" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="headline-small mb-2" style={{color: 'var(--text-primary)', fontSize: '1.125rem'}}>Text-to-Speech</h3>
                      <p className="body-regular" style={{color: 'var(--text-secondary)'}}>Listen to responses with natural-sounding voice synthesis</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="feature-icon w-12 h-12 mt-1">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="headline-small mb-2" style={{color: 'var(--text-primary)', fontSize: '1.125rem'}}>Modern Interface</h3>
                      <p className="body-regular" style={{color: 'var(--text-secondary)'}}>Beautiful, responsive design with smooth animations</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="fade-in" style={{animationDelay: '0.4s'}}>
              <h2 className="headline-medium mb-8" style={{color: 'var(--text-primary)'}}>Technology Stack</h2>
              <div className="card-secondary p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="headline-small mb-4" style={{color: 'var(--text-primary)', fontSize: '1.25rem'}}>Frontend</h3>
                    <ul className="space-y-3 body-regular" style={{color: 'var(--text-secondary)'}}>
                      <li className="flex items-center">
                        <div className="w-2 h-2 rounded-full mr-3" style={{backgroundColor: 'var(--text-muted)'}}></div>
                        React 18 with modern hooks
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 rounded-full mr-3" style={{backgroundColor: 'var(--text-muted)'}}></div>
                        TailwindCSS for styling
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 rounded-full mr-3" style={{backgroundColor: 'var(--text-muted)'}}></div>
                        React Router for navigation
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 rounded-full mr-3" style={{backgroundColor: 'var(--text-muted)'}}></div>
                        Web Speech API integration
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 rounded-full mr-3" style={{backgroundColor: 'var(--text-muted)'}}></div>
                        React Speech Recognition
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="headline-small mb-4" style={{color: 'var(--text-primary)', fontSize: '1.25rem'}}>Backend</h3>
                    <ul className="space-y-3 body-regular" style={{color: 'var(--text-secondary)'}}>
                      <li className="flex items-center">
                        <div className="w-2 h-2 rounded-full mr-3" style={{backgroundColor: 'var(--text-muted)'}}></div>
                        Node.js with Express
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 rounded-full mr-3" style={{backgroundColor: 'var(--text-muted)'}}></div>
                        OpenAI GPT-4o integration
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 rounded-full mr-3" style={{backgroundColor: 'var(--text-muted)'}}></div>
                        RESTful API design
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 rounded-full mr-3" style={{backgroundColor: 'var(--text-muted)'}}></div>
                        CORS enabled
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 rounded-full mr-3" style={{backgroundColor: 'var(--text-muted)'}}></div>
                        Environment configuration
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section className="fade-in" style={{animationDelay: '0.5s'}}>
              <h2 className="headline-medium mb-8" style={{color: 'var(--text-primary)'}}>Development Status</h2>
              <div className="card-secondary success-card rounded-2xl p-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-white/50 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="headline-small mb-4" style={{color: 'var(--text-primary)', fontSize: '1.25rem'}}>Production Ready</h3>
                    <p className="body-regular">
                      GinaAI is now powered by OpenAI's GPT-4o model, providing intelligent, 
                      context-aware conversations with emotional intelligence. The system includes voice input/output, 
                      conversation memory, and a modern React interface. Future updates will include 
                      enhanced features like conversation persistence, user authentication, and 
                      additional AI model integrations.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Action buttons removed for clarity per request */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage; 