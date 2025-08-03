import React from 'react';
import { Mail, Heart, ExternalLink } from 'lucide-react';

const Footer = ({ onContactClick }) => {
  return (
    <footer className="relative mt-16 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 text-white overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-purple-400/10 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <h3 className="text-xl font-bold">Pearadox</h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Democratizing access to AI research. We break down complex scientific papers into 
              digestible insights for researchers, students, and curious minds everywhere.
            </p>
            <div className="flex items-center space-x-1 text-sm text-gray-400">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-400 fill-current" />
              <span>for the research community</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <div className="space-y-2">
              <a href="#" className="block text-gray-300 hover:text-white transition-colors text-sm">
                About Pearadox
              </a>
              <a href="#" className="block text-gray-300 hover:text-white transition-colors text-sm">
                How It Works
              </a>
              <a href="#" className="block text-gray-300 hover:text-white transition-colors text-sm">
                Privacy Policy
              </a>
              <a href="#" className="block text-gray-300 hover:text-white transition-colors text-sm">
                Terms of Service
              </a>
              <a 
                href="https://arxiv.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors text-sm"
              >
                <span>arXiv.org</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Contact Section */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Get in Touch</h4>
            <p className="text-gray-300 text-sm">
              Have feedback or suggestions? We'd love to hear from you!
            </p>
            <button
              onClick={onContactClick}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Mail className="h-4 w-4" />
              <span>Contact Us</span>
            </button>
            
            <div className="pt-2">
              <p className="text-xs text-gray-400">
                Email: <span className="text-gray-300">pearadoxapp@gmail.com</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="text-center sm:text-left">
              <p className="text-sm text-gray-400">
                © 2025 Pearadox. All rights reserved.
              </p>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-xs text-gray-400 text-center sm:text-right">
                <p>Built for everybody, everywhere</p>
                <p className="text-gray-500">Version 1.0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 