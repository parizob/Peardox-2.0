import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const FieldQuizButton = ({ onClick }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className="max-w-4xl mx-auto px-4">
      <button 
        onClick={onClick}
        className={`w-full flex items-center justify-between px-4 py-3 border rounded-xl transition-all duration-200 group ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700 hover:border-green-600 hover:bg-gray-700/80' 
            : 'bg-white border-gray-200 hover:border-green-300 hover:bg-green-50/50'
        }`}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#1db954' }}
          >
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div className="text-left">
            <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Get Personalized Research
            </span>
            <span className={`hidden sm:inline text-sm ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              — Take a quick quiz to find papers for your field
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm font-medium flex-shrink-0" style={{ color: '#1db954' }}>
          <span className="hidden sm:inline">Start Quiz</span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </button>
    </div>
  );
};

export default FieldQuizButton;
