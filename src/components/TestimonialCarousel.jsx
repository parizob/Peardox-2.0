import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

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
    content: "Pearadox is an incredible resource for cutting through the noise in AI research.",
    rating: 5,
    avatar: "JM"
  },
];

const companies = ['Google', 'Microsoft', 'Verizon', 'MIT', 'UCF', 'Cresta', 'J.P. Morgan', 'American Express'];

const TestimonialCard = ({ testimonial }) => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`flex-shrink-0 w-[320px] sm:w-[360px] h-[200px] rounded-2xl border p-5 sm:p-6 flex flex-col transition-colors ${
      isDarkMode
        ? 'bg-gray-800/80 border-gray-700/60'
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center gap-0.5 mb-3">
        {[...Array(testimonial.rating)].map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5 text-amber-400 fill-current" />
        ))}
      </div>

      <blockquote className={`text-sm leading-relaxed mb-4 flex-1 line-clamp-3 ${
        isDarkMode ? 'text-gray-300' : 'text-gray-700'
      }`}>
        &ldquo;{testimonial.content}&rdquo;
      </blockquote>

      <div className="flex items-center gap-3 mt-auto">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
          {testimonial.avatar}
        </div>
        <div className="min-w-0">
          <div className={`font-semibold text-sm leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {testimonial.name}
          </div>
          <div className={`text-xs leading-tight mt-0.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            {testimonial.role}, {testimonial.company}
          </div>
        </div>
      </div>
    </div>
  );
};

const FadeEdge = ({ side, isDarkMode }) => (
  <div
    className={`absolute ${side}-0 top-0 bottom-0 w-20 sm:w-36 z-10 pointer-events-none ${
      side === 'left'
        ? isDarkMode
          ? 'bg-gradient-to-r from-gray-950 via-gray-950/50 to-transparent'
          : 'bg-gradient-to-r from-gray-50 via-gray-50/50 to-transparent'
        : isDarkMode
          ? 'bg-gradient-to-l from-gray-950 via-gray-950/50 to-transparent'
          : 'bg-gradient-to-l from-gray-50 via-gray-50/50 to-transparent'
    }`}
  />
);

const TestimonialCarousel = () => {
  const { isDarkMode } = useTheme();
  const doubled = [...testimonials, ...testimonials];
  const [companyIndex, setCompanyIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCompanyIndex(prev => (prev + 1) % companies.length);
        setVisible(true);
      }, 350);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full overflow-hidden">
      {/* Heading */}
      <div className="text-center mb-6 sm:mb-8 px-4">
        <h3 className={`text-xl sm:text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          What Our Readers Say
        </h3>
        <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Trusted by professionals at{' '}
          <span
            className="font-semibold text-gradient-pear transition-all duration-300"
            style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(4px)', display: 'inline-block' }}
          >
            {companies[companyIndex]}
          </span>
        </p>
      </div>

      {/* Testimonial cards marquee */}
      <div className="relative">
        <FadeEdge side="left" isDarkMode={isDarkMode} />
        <FadeEdge side="right" isDarkMode={isDarkMode} />

        <div className="marquee-track gap-4 sm:gap-6">
          {doubled.map((t, i) => (
            <div key={`${t.id}-${i}`} className="flex-shrink-0 px-2">
              <TestimonialCard testimonial={t} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestimonialCarousel;
