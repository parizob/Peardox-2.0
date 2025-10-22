import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';

const TestimonialCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Sample testimonial data - 6 tiles (shortened for better fit)
  const testimonials = [
    {
      id: 1,
      name: "Matthew Cohen",
      role: "VP of Credit",
      company: "Atlantic Pacific Credit Partners",
      content: "Pearadox has become my go-to source for staying ahead in AI research. The simplified explanations save me time and help me quickly identify what to read next.",
      rating: 5,
      avatar: "MC"
    },
    {
        id: 2,
        name: "Brandon Parizo",
        role: "Technical Product Manager",
        company: "Verizon",
        content: "Staying on top of AI developments is crucial for product strategy. Pearadox makes it easy by breaking down papers into words I can actually understand.",
        rating: 5,
        avatar: "BP"
      },
    {
      id: 3,
      name: "Zoe Zimmerman",
      role: "Stenographer",
      company: "U.S. Legal Support",
      content: "As a stenographer, I like to stay on top of new tech. I'm not a tech person, but Pearadox makes something as hard as AI a lot easier to understand.",
      rating: 5,
      avatar: "ZZ"
    },
    {
        id: 4,
        name: "Jon Mohr",
        role: "Field Service Engineer",
        company: "Boston Scientific",
        content:  "Pearadox is an incredible resource for cutting through the noise in AI. It’s not only helping me at work but also inspiring me to explore ideas for my own business.",
        rating: 5,
        avatar: "JM"
      },
  ];

  // Auto-play functionality removed - manual navigation only

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? testimonials.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === testimonials.length - 1 ? 0 : currentIndex + 1);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // Auto-play resume functionality removed - manual navigation only

  return (
    <div className="bg-gradient-to-br from-white via-blue-50/30 to-white rounded-3xl shadow-2xl border border-gray-200 p-6 sm:p-8 h-full flex flex-col justify-between relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.03) 100%)' }}></div>
      <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full blur-2xl" style={{ background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, rgba(37, 99, 235, 0.02) 100%)' }}></div>
      
      <div className="relative z-10">
        {/* Header inside carousel */}
        <div className="mb-6">
          <div className="inline-flex items-center px-3 py-1 rounded-full mb-3" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#2563eb' }}>
              ✨ Testimonials
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 leading-tight">
            What Our Readers Say
          </h3>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            Trusted by researchers and professionals worldwide
          </p>
        </div>

        {/* Main Content with Side Navigation */}
        <div className="flex items-center mb-4">
          {/* Left Arrow - Outside content area */}
          <button
            onClick={goToPrevious}
            className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-200 hover:shadow-md transition-all duration-300 mr-4 flex-shrink-0"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Testimonial Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start space-x-4">
              {/* Avatar */}
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                {testimonials[currentIndex].avatar}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Quote */}
                <blockquote className="text-gray-700 text-sm sm:text-base leading-relaxed mb-3">
                  "{testimonials[currentIndex].content}"
                </blockquote>
                
                {/* Author & Rating */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">
                      {testimonials[currentIndex].name}
                    </div>
                    <div className="text-gray-600 text-xs">
                      {testimonials[currentIndex].role} • {testimonials[currentIndex].company}
                    </div>
                  </div>
                  
                  {/* Rating */}
                  <div className="flex items-center">
                    {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Arrow - Outside content area */}
          <button
            onClick={goToNext}
            className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-200 hover:shadow-md transition-all duration-300 ml-4 flex-shrink-0"
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className="flex sm:hidden items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={goToPrevious}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm border border-gray-200 text-gray-500 hover:text-blue-600 transition-colors"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Dots Indicator */}
          <div className="flex items-center space-x-1">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-blue-600 scale-125'
                    : 'bg-gray-300'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={goToNext}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm border border-gray-200 text-gray-500 hover:text-blue-600 transition-colors"
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Desktop Dots Indicator */}
        <div className="hidden sm:flex items-center justify-center mt-6 space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-blue-600 scale-125'
                  : 'bg-gray-300 hover:bg-gray-400'
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
