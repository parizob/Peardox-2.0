import React from 'react';
import { Sparkles, Target, ArrowRight } from 'lucide-react';

const FieldQuizButton = ({ onClick }) => {
  return (
    <div className="mb-8 sm:mb-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="relative bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-md overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          
          <div className="relative p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              {/* Left Content */}
              <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
                    Get Personalized Research
                  </h3>
                  <p className="text-blue-100 text-sm">
                    Find AI papers tailored to your field in 30 seconds
                  </p>
                </div>
              </div>

              {/* Right CTA */}
              <div className="flex-shrink-0">
                <button
                  onClick={onClick}
                  className="group bg-white text-blue-600 px-5 py-2.5 rounded-xl font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Take Quiz</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FieldQuizButton;
