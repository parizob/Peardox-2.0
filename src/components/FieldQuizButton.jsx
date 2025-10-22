import React from 'react';
import { Sparkles, Target, ArrowRight } from 'lucide-react';

const FieldQuizButton = ({ onClick }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div className="mb-8 sm:mb-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div 
          className="relative rounded-3xl shadow-2xl overflow-hidden cursor-pointer transform hover:scale-[1.02] transition-all duration-500 group"
          style={{ 
            background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 50%, #ffffff 100%)',
            border: '2px solid #e5e7eb'
          }}
          onClick={onClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: 'radial-gradient(circle, rgba(29, 185, 84, 0.15) 0%, rgba(22, 161, 74, 0.05) 100%)' }}></div>
          <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full blur-2xl" style={{ background: 'radial-gradient(circle, rgba(29, 185, 84, 0.1) 0%, rgba(22, 161, 74, 0.03) 100%)' }}></div>
          
          {/* Animated border gradient on hover */}
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ 
              background: 'linear-gradient(135deg, rgba(29, 185, 84, 0.2) 0%, rgba(22, 161, 74, 0.1) 100%)',
              borderRadius: '1.5rem',
            }}
          ></div>
          
          <div className="relative p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row items-center lg:justify-between text-center lg:text-left gap-4 sm:gap-6">
              {/* Left Content - centered on mobile, left-aligned on desktop */}
              <div className="flex flex-col lg:flex-row items-center lg:space-x-5 flex-1 gap-4 lg:gap-0">
                {/* Icon - centered on mobile */}
                <div className="flex-shrink-0 relative">
                  <div className="absolute inset-0 rounded-2xl blur-md opacity-50" style={{ backgroundColor: '#1db954' }}></div>
                  <div 
                    className="relative w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500"
                    style={{ backgroundColor: '#1db954' }}
                  >
                    <Target className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
                  </div>
                </div>
                
                {/* Text Content - centered on mobile, left on desktop */}
                <div className="flex-1 w-full">
                  <div className="flex items-center justify-center lg:justify-start mb-2">
                    <div className="inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full mb-1" style={{ backgroundColor: 'rgba(29, 185, 84, 0.1)' }}>
                      <Sparkles className="h-3 w-3 mr-1.5" style={{ color: '#1db954' }} />
                      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider" style={{ color: '#1db954' }}>
                        AI-Powered Match
                      </span>
                    </div>
                  </div>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 leading-tight px-2 lg:px-0">
                    Get Personalized Research
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm lg:text-base leading-relaxed px-2 lg:px-0">
                    Discover AI papers tailored to your field in just 30 seconds
                  </p>
                </div>
              </div>

              {/* CTA Button - full width on mobile, auto on desktop */}
              <div className="w-full lg:w-auto flex-shrink-0">
                <div
                  className="group/btn w-full lg:w-auto inline-flex items-center justify-center space-x-2 sm:space-x-3 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden text-white"
                  style={{ backgroundColor: isHovered ? '#16a14a' : '#1db954' }}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                  
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 relative z-10 animate-pulse" />
                  <span className="text-base sm:text-lg relative z-10">Take the Quiz</span>
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover/btn:translate-x-2 transition-transform duration-300 relative z-10" />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom accent line */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: 'linear-gradient(to right, #1db954, #16a14a)' }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default FieldQuizButton;
