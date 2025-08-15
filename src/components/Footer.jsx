import React from 'react';
import { Mail, Heart, ExternalLink, Twitter, Instagram, Linkedin, Facebook } from 'lucide-react';

const Footer = ({ onContactClick }) => {
  return (
    <footer className="relative mt-16 bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50 text-gray-800 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-green-200/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-emerald-200/20 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#1db954' }}>
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <h3 className="text-xl font-bold">Pearadox</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Democratizing access to AI research. We break down complex scientific papers into 
              digestible insights for researchers, students, and curious minds everywhere.
            </p>
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500 fill-current" />
              <span>for the research community</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <div className="space-y-2">
              <a href="#" className="block text-gray-600 hover:text-gray-900 transition-colors text-sm">
                About Pearadox
              </a>
              <a href="#" className="block text-gray-600 hover:text-gray-900 transition-colors text-sm">
                How It Works
              </a>
              <a href="#" className="block text-gray-600 hover:text-gray-900 transition-colors text-sm">
                Privacy Policy
              </a>
              <a href="#" className="block text-gray-600 hover:text-gray-900 transition-colors text-sm">
                Terms of Service
              </a>
              <a 
                href="https://arxiv.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors text-sm"
              >
                <span>arXiv.org</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Contact & Social Section */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Get in Touch</h4>
            <p className="text-gray-600 text-sm">
              Have feedback or suggestions? We'd love to hear from you!
            </p>
            <button
              onClick={onContactClick}
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
              <h5 className="text-sm font-semibold text-gray-700 mb-3">Follow Us</h5>
              <div className="flex space-x-4">
                <a 
                  href="https://x.com/pearadoxapp" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:shadow-md transition-all duration-200 transform hover:scale-110"
                >
                  <Twitter className="h-4 w-4" />
                </a>
                <a 
                  href="https://www.instagram.com/pearadox.app/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:shadow-md transition-all duration-200 transform hover:scale-110"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a 
                  href="https://www.linkedin.com/company/pearadoxapp" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:shadow-md transition-all duration-200 transform hover:scale-110"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
                <a 
                  href="https://www.facebook.com/people/Pearadox/61570212954926/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:shadow-md transition-all duration-200 transform hover:scale-110"
                >
                  <Facebook className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="text-center sm:text-left">
              <p className="text-sm text-gray-500">
                © 2025 Pearadox. All rights reserved.
              </p>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-xs text-gray-500 text-center sm:text-right">
                <p>Built for everybody, everywhere</p>
                <p className="text-gray-400">Version 1.0-beta</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 