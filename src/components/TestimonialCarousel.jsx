import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const TestimonialCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { isDarkMode } = useTheme();

  // Sample testimonial data - 6 tiles (shortened for better fit)
  const testimonials = [
    {
      id: 1,
      name: "Matthew Cohen",
      role: "VP of Credit",
      company: "Atlantic Pacific Credit Partners",
      content: "Pearadox has become my go-to source for staying ahead in AI research. The simplified explanations save me time.",
      rating: 5,
      avatar: "MC"
    },
    {
        id: 2,
        name: "Brandon Parizo",
        role: "Technical Product Manager",
        company: "Verizon",
        content: "Staying on top of AI developments is crucial for product strategy. Pearadox makes it easy.",
        rating: 5,
        avatar: "BP"
      },
    {
      id: 3,
      name: "Zoe Zimmerman",
      role: "Stenographer",
      company: "U.S. Legal Support",
      content: "I'm not a tech person, but Pearadox makes something as hard as AI a lot easier to understand.",
      rating: 5,
      avatar: "ZZ"
    },
    {
        id: 4,
        name: "Jon Mohr",
        role: "Field Service Engineer",
        company: "Boston Scientific",
        content:  "Pearadox is an incredible resource for cutting through the noise in AI research.",
        rating: 5,
        avatar: "JM"
      },
  ];

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? testimonials.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === testimonials.length - 1 ? 0 : currentIndex + 1);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div className={`rounded-3xl shadow-xl border p-5 sm:p-6 h-full flex flex-col justify-between relative overflow-hidden group hover:shadow-2xl transition-all duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-800 via-gray-800 to-gray-800/90 border-gray-700' 
        : 'bg-gradient-to-br from-white via-blue-50/30 to-white border-gray-200'
    }`}>
      {/* Decorative Elements */}
      <div className={`absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${
        isDarkMode ? 'bg-blue-900/20' : ''
      }`} style={!isDarkMode ? { background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.03) 100%)' } : {}}></div>
      <div className={`absolute -bottom-10 -left-10 w-32 h-32 rounded-full blur-2xl ${
        isDarkMode ? 'bg-blue-900/10' : ''
      }`} style={!isDarkMode ? { background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, rgba(37, 99, 235, 0.02) 100%)' } : {}}></div>
      
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <div className="mb-4">
          <h3 className={`text-lg sm:text-xl font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            What Our Readers Say
          </h3>
          <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Trusted by professionals worldwide
          </p>
        </div>

        {/* Main Content with Side Navigation */}
        <div className="flex items-center flex-1">
          {/* Left Arrow */}
          <button
            onClick={goToPrevious}
            className={`hidden sm:flex items-center justify-center w-8 h-8 rounded-full shadow-sm border transition-all mr-3 flex-shrink-0 ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-gray-400 hover:text-green-400 hover:border-green-600' 
                : 'bg-white border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-200'
            }`}
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Testimonial Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start space-x-3">
              {/* Avatar */}
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                {testimonials[currentIndex].avatar}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Quote */}
                <blockquote className={`text-sm leading-relaxed mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  "{testimonials[currentIndex].content}"
                </blockquote>
                
                {/* Author & Rating */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className={`font-semibold text-xs ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {testimonials[currentIndex].name}
                    </div>
                    <div className={`text-[10px] ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {testimonials[currentIndex].role} • {testimonials[currentIndex].company}
                    </div>
                  </div>
                  
                  {/* Rating */}
                  <div className="flex items-center flex-shrink-0">
                    {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Arrow */}
          <button
            onClick={goToNext}
            className={`hidden sm:flex items-center justify-center w-8 h-8 rounded-full shadow-sm border transition-all ml-3 flex-shrink-0 ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-gray-400 hover:text-green-400 hover:border-green-600' 
                : 'bg-white border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-200'
            }`}
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={`flex sm:hidden items-center justify-between mt-3 pt-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <button
            onClick={goToPrevious}
            className={`flex items-center justify-center w-7 h-7 rounded-full shadow-sm border transition-colors ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-gray-400 hover:text-green-400' 
                : 'bg-white border-gray-200 text-gray-500 hover:text-blue-600'
            }`}
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>

          {/* Dots Indicator */}
          <div className="flex items-center space-x-1">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? isDarkMode ? 'bg-green-500 scale-125' : 'bg-blue-600 scale-125'
                    : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={goToNext}
            className={`flex items-center justify-center w-7 h-7 rounded-full shadow-sm border transition-colors ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-gray-400 hover:text-green-400' 
                : 'bg-white border-gray-200 text-gray-500 hover:text-blue-600'
            }`}
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Desktop Dots Indicator */}
        <div className="hidden sm:flex items-center justify-center mt-4 space-x-1.5">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? isDarkMode ? 'bg-green-500 scale-125' : 'bg-blue-600 scale-125'
                  : isDarkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestimonialCarousel;
