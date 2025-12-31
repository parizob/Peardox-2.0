import React, { useState } from 'react';
import { Mail, Heart, ExternalLink, Twitter, Instagram, Linkedin, Facebook } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import ContactModal from './ContactModal';

const Footer = ({ onContactClick }) => {
  const { isDarkMode } = useTheme();
  const [isContactOpen, setIsContactOpen] = useState(false);
  
  // Use internal state if no external handler is provided
  const handleContactClick = () => {
    if (onContactClick) {
      onContactClick();
    } else {
      setIsContactOpen(true);
    }
  };
  
  return (
    <>
      <footer className={`relative mt-16 overflow-hidden ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-gray-200' 
          : 'bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50 text-gray-800'
      }`}>
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl ${
            isDarkMode ? 'bg-gradient-to-br from-green-900/20 to-transparent' : 'bg-gradient-to-br from-green-200/20 to-transparent'
          }`}></div>
          <div className={`absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl ${
            isDarkMode ? 'bg-gradient-to-tl from-emerald-900/20 to-transparent' : 'bg-gradient-to-tl from-emerald-200/20 to-transparent'
          }`}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            
            {/* Brand Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#1db954' }}>
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Pearadox</h3>
              </div>
              <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Democratizing access to AI research. We break down complex insights into 
                digestible summaries for curious minds everywhere.
              </p>
              <div className={`flex items-center space-x-1 text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                <span>Made with</span>
                <Heart className="h-4 w-4 text-red-500 fill-current" />
                <span>for the research community</span>
              </div>
              <div className={`flex items-center space-x-1 text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                <span>As a small team, we are always looking for help. If you are interested in contributing to Pearadox, please contact us or donate at <b>Pearadox.eth</b></span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Quick Links</h4>
              <div className="space-y-2">
                <Link 
                  to="/aboutus" 
                  className={`block transition-colors text-sm ${
                    isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => {
                    // Scroll to top when navigating to about page
                    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                  }}
                >
                  About Pearadox
                </Link>
                <Link 
                  to="/blog"
                  className={`block transition-colors text-sm ${
                    isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => {
                    // Scroll to top when navigating to blog page
                    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                  }}
                >
                  Pearadox Blog
                </Link> 
                <a 
                  href="https://arxiv.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`flex items-center space-x-1 transition-colors text-sm ${
                    isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span>arXiv.org</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            {/* Contact & Social Section */}
            <div className="space-y-4">
              <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Get in Touch</h4>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Have feedback or suggestions? We'd love to hear from you!
              </p>
              <button
                onClick={handleContactClick}
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-white"
                style={{ 
                  backgroundColor: '#1db954',
                  ':hover': { backgroundColor: '#16a14a' }
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#16a14a'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#1db954'}
              >
                <Mail className="h-4 w-4" />
                <span>Contact Us</span>
              </button>
              
              {/* Social Media Links */}
              <div className="pt-4">
                <h5 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Follow Us</h5>
                <div className="flex space-x-4">
                  <a 
                    href="https://x.com/pearadoxapp" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-all duration-200 transform hover:scale-110 ${
                      isDarkMode 
                        ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600' 
                        : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900 hover:shadow-md'
                    }`}
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                  <a 
                    href="https://www.instagram.com/pearadox.app/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-all duration-200 transform hover:scale-110 ${
                      isDarkMode 
                        ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600' 
                        : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900 hover:shadow-md'
                    }`}
                  >
                    <Instagram className="h-4 w-4" />
                  </a>
                  <a 
                    href="https://www.linkedin.com/company/pearadoxapp" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-all duration-200 transform hover:scale-110 ${
                      isDarkMode 
                        ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600' 
                        : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900 hover:shadow-md'
                    }`}
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                  <a 
                    href="https://www.facebook.com/people/Pearadox/61570212954926/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-all duration-200 transform hover:scale-110 ${
                      isDarkMode 
                        ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600' 
                        : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900 hover:shadow-md'
                    }`}
                  >
                    <Facebook className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className={`mt-12 pt-8 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <div className="text-center sm:text-left">
                <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  © 2025 Pearadox. All rights reserved.
                </p>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className={`text-xs text-center sm:text-right ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  <p>Built for everybody, everywhere</p>
                  <p className={isDarkMode ? 'text-gray-600' : 'text-gray-400'}>Version 1.1-beta</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Contact Modal - rendered internally when no external handler */}
      {!onContactClick && (
        <ContactModal
          isOpen={isContactOpen}
          onClose={() => setIsContactOpen(false)}
        />
      )}
    </>
  );
};

export default Footer;
