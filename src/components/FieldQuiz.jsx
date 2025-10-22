import React, { useState, useEffect } from 'react';
import { Stethoscope, DollarSign, GraduationCap, Cpu, Scale, CheckCircle, ChevronRight, X } from 'lucide-react';

const FieldQuiz = ({ onFieldSelect, selectedField, user, onSaveToProfile, isOpen, onClose, onOpenAccount }) => {
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Field options with icons and colors
  const fields = [
    {
      id: 'medicine',
      name: 'Medicine',
      icon: Stethoscope,
      color: 'bg-red-50 hover:bg-red-100 border-red-200 text-red-700',
      selectedColor: 'bg-red-100 border-red-300 text-red-800'
    },
    {
      id: 'finance',
      name: 'Finance',
      icon: DollarSign,
      color: 'bg-green-50 hover:bg-green-100 border-green-200 text-green-700',
      selectedColor: 'bg-green-100 border-green-300 text-green-800'
    },
    {
      id: 'education',
      name: 'Education',
      icon: GraduationCap,
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700',
      selectedColor: 'bg-blue-100 border-blue-300 text-blue-800'
    },
    {
      id: 'tech',
      name: 'Tech',
      icon: Cpu,
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700',
      selectedColor: 'bg-purple-100 border-purple-300 text-purple-800'
    },
    {
      id: 'legal',
      name: 'Legal',
      icon: Scale,
      color: 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700',
      selectedColor: 'bg-amber-100 border-amber-300 text-amber-800'
    }
  ];

  // Tailored categories for each field
  const fieldCategories = {
    medicine: [
      'Computational Biology',
      'Medical Informatics',
      'Computer Vision and Pattern Recognition',
      'Machine Learning',
      'Computation and Language'
    ],
    finance: [
      'Machine Learning',
      'Data Mining',
      'Statistics',
      'Computation and Language',
      'Computational Economics'
    ],
    education: [
      'Human-Computer Interaction',
      'Computation and Language',
      'Machine Learning',
      'Educational Technology',
      'Cognitive Science'
    ],
    tech: [
      'Machine Learning',
      'Artificial Intelligence',
      'Computer Vision and Pattern Recognition',
      'Computation and Language',
      'Robotics'
    ],
    legal: [
      'Computation and Language',
      'Machine Learning',
      'Computers and Society',
      'Artificial Intelligence',
      'Information Retrieval'
    ]
  };

  const handleFieldSelect = (fieldId) => {
    onFieldSelect(fieldId);
    setShowRecommendations(true);
    setSelectedCategories(fieldCategories[fieldId] || []);
  };

  const handleSaveCategories = async () => {
    if (!user || selectedCategories.length === 0) return;
    
    setIsSaving(true);
    try {
      await onSaveToProfile(selectedCategories);
    } catch (error) {
      console.error('Failed to save categories:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const selectedFieldData = fields.find(field => field.id === selectedField);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn overflow-hidden">
      <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto overflow-x-hidden border border-gray-200/50 relative">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl -z-10" style={{ background: 'radial-gradient(circle, rgba(29, 185, 84, 0.1) 0%, rgba(22, 161, 74, 0.05) 100%)' }}></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl -z-10" style={{ background: 'radial-gradient(circle, rgba(29, 185, 84, 0.08) 0%, rgba(22, 161, 74, 0.03) 100%)' }}></div>
        
        {/* Modal Header */}
        <div className="relative p-4 sm:p-8 border-b border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-white/50 backdrop-blur-sm overflow-x-hidden">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-gray-200/50 rounded-full transition-all hover:rotate-90 duration-300"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
          <div className="max-w-2xl">
            <div className="inline-flex items-center px-3 sm:px-4 py-1.5 rounded-full mb-3 sm:mb-4" style={{ backgroundColor: 'rgba(29, 185, 84, 0.1)' }}>
              <span className="text-xs sm:text-sm font-semibold" style={{ color: '#1db954' }}>
              🔍 Personalized Discovery
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 leading-tight">
              Find Your Perfect Research Match
            </h2>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed">
              Get AI-curated research recommendations tailored specifically to your field and interests
            </p>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-8 overflow-x-hidden">
          {/* Unauthenticated User Message */}
          {!user && (
            <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-200 rounded-2xl shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-300/20 rounded-full blur-2xl"></div>
              <div className="relative flex items-start space-x-3 sm:space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-lg sm:text-xl">🔒</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-amber-900 mb-2 text-base sm:text-lg">
                    Unlock Personalized Research
                  </h4>
                  <p className="text-amber-800 text-xs sm:text-sm leading-relaxed mb-4">
                    Preview different field categories below, or create a free account to save your preferences and get personalized AI research recommendations.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      if (onOpenAccount) onOpenAccount();
                    }}
                    className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold text-sm transition-all hover:shadow-lg hover:scale-105 transform relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    <span className="relative z-10">Create Free Account →</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quiz Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
              Select Your Field
            </h3>
            <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto px-2">
              {user ? 
                "Choose your professional field to discover AI research that matters to you" :
                "Explore how AI research categories align with different professional fields"
              }
            </p>
          </div>

          {/* Field Selection */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {fields.map((field) => {
              const Icon = field.icon;
              const isSelected = selectedField === field.id;
              
              return (
                <button
                  key={field.id}
                  onClick={() => handleFieldSelect(field.id)}
                  className={`group relative p-4 sm:p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                    isSelected 
                      ? 'border-gray-300 bg-white shadow-xl scale-105' 
                      : 'border-gray-200 bg-white/50 hover:border-gray-300'
                  }`}
                >
                  {/* Animated Background Gradient */}
                  <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                    isSelected ? 'opacity-10' : ''
                  }`}>
                    <div className={`w-full h-full rounded-2xl ${
                      field.id === 'medicine' ? 'bg-gradient-to-br from-red-200/30 to-pink-200/30' :
                      field.id === 'finance' ? 'bg-gradient-to-br from-green-200/30 to-emerald-200/30' :
                      field.id === 'education' ? 'bg-gradient-to-br from-blue-200/30 to-cyan-200/30' :
                      field.id === 'tech' ? 'bg-gradient-to-br from-purple-200/30 to-indigo-200/30' :
                      'bg-gradient-to-br from-amber-200/30 to-yellow-200/30'
                    }`}></div>
                  </div>
                  
                  <div className="relative flex flex-col items-center space-y-2 sm:space-y-3">
                    {/* Icon Container */}
                    <div className={`p-2.5 sm:p-3 rounded-xl transition-all duration-300 shadow-md ${
                      isSelected 
                        ? 'bg-gradient-to-br scale-110 shadow-lg' + (
                          field.id === 'medicine' ? ' from-red-500 to-pink-500' :
                          field.id === 'finance' ? ' from-green-500 to-emerald-500' :
                          field.id === 'education' ? ' from-blue-500 to-cyan-500' :
                          field.id === 'tech' ? ' from-purple-500 to-indigo-500' :
                          ' from-amber-500 to-yellow-500'
                        )
                        : 'bg-gray-100 group-hover:bg-gradient-to-br' + (
                          field.id === 'medicine' ? ' group-hover:from-red-500 group-hover:to-pink-500' :
                          field.id === 'finance' ? ' group-hover:from-green-500 group-hover:to-emerald-500' :
                          field.id === 'education' ? ' group-hover:from-blue-500 group-hover:to-cyan-500' :
                          field.id === 'tech' ? ' group-hover:from-purple-500 group-hover:to-indigo-500' :
                          ' group-hover:from-amber-500 group-hover:to-yellow-500'
                        )
                    }`}>
                      <Icon className={`h-6 w-6 sm:h-7 sm:w-7 transition-colors ${
                        isSelected ? 'text-white' : 'text-gray-600 group-hover:text-white'
                      }`} />
                    </div>
                    
                    {/* Field Name */}
                    <span className={`font-bold text-xs sm:text-sm transition-colors leading-tight ${
                      isSelected ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'
                    }`}>
                      {field.name}
                    </span>
                    
                    {/* Selected Indicator */}
                    {isSelected && (
                      <div className="absolute -top-2 -right-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Recommendations Section */}
          {showRecommendations && selectedFieldData && (
            <div className="mt-8 p-4 sm:p-8 bg-gradient-to-br from-white to-gray-50 rounded-3xl border-2 border-gray-200 shadow-xl relative overflow-x-hidden animate-fadeIn">
              {/* Decorative gradient orbs */}
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(29, 185, 84, 0.15) 0%, rgba(22, 161, 74, 0.05) 100%)' }}></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(29, 185, 84, 0.12) 0%, rgba(22, 161, 74, 0.03) 100%)' }}></div>
              
              <div className="relative">
                {/* Header */}
                <div className="flex items-start space-x-3 sm:space-x-4 mb-4 sm:mb-6 overflow-x-hidden">
                  <div className={`flex-shrink-0 p-3 sm:p-4 rounded-2xl shadow-lg bg-gradient-to-br ${
                    selectedFieldData.id === 'medicine' ? 'from-red-500 to-pink-500' :
                    selectedFieldData.id === 'finance' ? 'from-green-500 to-emerald-500' :
                    selectedFieldData.id === 'education' ? 'from-blue-500 to-cyan-500' :
                    selectedFieldData.id === 'tech' ? 'from-purple-500 to-indigo-500' :
                    'from-amber-500 to-yellow-500'
                  }`}>
                    <selectedFieldData.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <h4 className="text-base sm:text-lg lg:text-2xl font-bold text-gray-900 mb-1.5 sm:mb-2 leading-tight break-words">
                      Curated for {selectedFieldData.name} Professionals
                    </h4>
                    <p className="text-xs sm:text-sm lg:text-base text-gray-600 leading-snug sm:leading-relaxed break-words">
                      AI research categories hand-picked to accelerate your work and expand your expertise
                    </p>
                  </div>
                </div>

                {/* Category Pills */}
                <div className="mb-6 overflow-visible">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="h-1 w-8 sm:w-12 rounded-full flex-shrink-0" style={{ background: 'linear-gradient(to right, #1db954, #16a14a)' }}></div>
                    <span className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">
                      Your Categories ({selectedCategories.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:gap-3 p-1">
                    {selectedCategories.map((category, index) => (
                      <div
                        key={index}
                        className="group px-3 sm:px-5 py-2 sm:py-3 bg-white rounded-xl text-xs sm:text-sm font-semibold border-2 border-gray-200 transition-all hover:shadow-lg hover:scale-105 transform relative overflow-hidden max-w-full"
                        style={{ animationDelay: `${index * 50}ms` }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#1db954'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = ''}
                      >
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(to right, rgba(29, 185, 84, 0.05), rgba(22, 161, 74, 0.05))' }}></div>
                        <span className="relative z-10 text-gray-700 group-hover:text-gray-900 flex items-start sm:items-center">
                          <span className="mr-1.5 sm:mr-2 flex-shrink-0">✨</span>
                          <span className="leading-tight break-words">{category}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200">
                  {user ? (
                    <button
                      onClick={handleSaveCategories}
                      disabled={isSaving}
                      className="flex-1 flex items-center justify-center px-4 sm:px-6 py-3 sm:py-4 text-white rounded-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-sm sm:text-base hover:scale-105 transform relative overflow-hidden group"
                      style={{ backgroundColor: '#1db954' }}
                      onMouseEnter={(e) => !isSaving && (e.currentTarget.style.backgroundColor = '#16a14a')}
                      onMouseLeave={(e) => !isSaving && (e.currentTarget.style.backgroundColor = '#1db954')}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                          <span className="relative z-10">Saving Your Preferences...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-5 w-5 mr-3 relative z-10" />
                          <span className="relative z-10">Save to My Profile</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 rounded-xl border-2 border-amber-300 font-semibold text-xs sm:text-sm">
                      <span className="mr-1.5 sm:mr-2 text-lg sm:text-xl">👁️</span>
                      <span className="whitespace-nowrap">Preview Mode - Create account to save</span>
                    </div>
                  )}
                  
                  <button
                    onClick={() => {
                      setShowRecommendations(false);
                      onFieldSelect(null);
                      setSelectedCategories([]);
                    }}
                    className="flex items-center justify-center px-4 sm:px-6 py-3 sm:py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-all font-semibold hover:border-gray-400 text-sm sm:text-base"
                  >
                    <span className="whitespace-nowrap">← Try Another Field</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Call to Action for Non-Selected State */}
          {!showRecommendations && (
            <div className="text-center mt-6 sm:mt-8 p-6 sm:p-8 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
              <div className="mb-3 sm:mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl mb-3 sm:mb-4 shadow-lg" style={{ backgroundColor: '#1db954' }}>
                  <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
              </div>
              <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Ready to Discover?</h4>
              <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto px-2">
                Select your professional field above to unlock personalized AI research recommendations
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FieldQuiz;
