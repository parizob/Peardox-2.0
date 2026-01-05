import React, { useState, useEffect } from 'react';
import { Stethoscope, DollarSign, GraduationCap, Cpu, Scale, CheckCircle, ChevronRight, X, Sparkles } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const FieldQuiz = ({ onFieldSelect, selectedField, user, onSaveToProfile, isOpen, onClose, onOpenAccount }) => {
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  
  // Get dark mode state
  const { isDarkMode } = useTheme();

  // Field options with icons
  const fields = [
    { id: 'medicine', name: 'Medicine', icon: Stethoscope },
    { id: 'finance', name: 'Finance', icon: DollarSign },
    { id: 'education', name: 'Education', icon: GraduationCap },
    { id: 'tech', name: 'Tech', icon: Cpu },
    { id: 'legal', name: 'Legal', icon: Scale }
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
      <div 
        className={`rounded-2xl max-w-2xl w-full max-h-[85vh] sm:max-h-[90vh] overflow-hidden shadow-2xl flex flex-col ${
          isDarkMode ? 'bg-gray-900' : 'bg-white'
        }`}
        style={{ boxShadow: isDarkMode ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
      >
        {/* Header */}
        <div className={`flex-shrink-0 px-6 sm:px-8 pt-6 pb-4 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-100'
        }`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#1db954' }}>
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#1db954' }}>
                  Personalized Discovery
                </span>
              </div>
              <h2 className={`text-xl sm:text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Find Your Research Match
              </h2>
              <p className={`text-sm mt-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Get AI-curated recommendations tailored to your field
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-full transition-colors flex-shrink-0 ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <X className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6">
          {/* Unauthenticated User Notice */}
          {!user && (
            <div className={`mb-6 p-4 rounded-xl border ${
              isDarkMode 
                ? 'bg-amber-900/30 border-amber-700/50' 
                : 'bg-amber-50 border-amber-200'
            }`}>
              <div className="flex items-start gap-3">
                <span className="text-xl">🔒</span>
                <div className="flex-1">
                  <h4 className={`font-semibold mb-1 ${
                    isDarkMode ? 'text-amber-300' : 'text-amber-900'
                  }`}>
                    Preview Mode
                  </h4>
                  <p className={`text-sm mb-3 ${
                    isDarkMode ? 'text-amber-400' : 'text-amber-800'
                  }`}>
                    Create a free account to save your preferences.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      if (onOpenAccount) onOpenAccount();
                    }}
                    className="inline-flex items-center px-4 py-2 text-white rounded-lg font-medium text-sm transition-all hover:opacity-90"
                    style={{ backgroundColor: '#1db954' }}
                  >
                    Create Free Account →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Field Selection */}
          <div className="mb-6">
            <h3 className={`text-lg font-semibold mb-2 text-center ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Select Your Field
            </h3>
            <p className={`text-sm text-center mb-4 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {user ? 
                "Choose your professional field to discover relevant AI research" :
                "Explore how AI research aligns with different fields"
              }
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {fields.map((field) => {
                const Icon = field.icon;
                const isSelected = selectedField === field.id;
                
                return (
                  <button
                    key={field.id}
                    onClick={() => handleFieldSelect(field.id)}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                      isSelected 
                        ? 'border-green-500 bg-green-500/10 shadow-md' 
                        : isDarkMode
                          ? 'border-gray-700 bg-gray-800 hover:border-gray-600'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className={`p-2.5 rounded-xl transition-colors ${
                        isSelected 
                          ? 'bg-green-500 text-white' 
                          : isDarkMode
                            ? 'bg-gray-700 text-gray-400'
                            : 'bg-gray-100 text-gray-600'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className={`font-medium text-sm ${
                        isSelected 
                          ? 'text-green-500' 
                          : isDarkMode
                            ? 'text-gray-300'
                            : 'text-gray-700'
                      }`}>
                        {field.name}
                      </span>
                    </div>
                    
                    {isSelected && (
                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recommendations Section */}
          {showRecommendations && selectedFieldData && (
            <div className={`border-t pt-6 ${
              isDarkMode ? 'border-gray-700' : 'border-gray-100'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#1db954' }}>
                  <selectedFieldData.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className={`font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Curated for {selectedFieldData.name}
                  </h4>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {selectedCategories.length} categories selected
                  </p>
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedCategories.map((category, index) => (
                  <div
                    key={index}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border ${
                      isDarkMode 
                        ? 'bg-gray-800 text-gray-300 border-gray-700'
                        : 'bg-gray-100 text-gray-700 border-gray-200'
                    }`}
                  >
                    {category}
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {user ? (
                  <button
                    onClick={handleSaveCategories}
                    disabled={isSaving}
                    className="flex-1 flex items-center justify-center px-5 py-3 text-white rounded-xl font-semibold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#1db954' }}
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Save to Profile
                      </>
                    )}
                  </button>
                ) : (
                  <div className={`flex-1 flex items-center justify-center px-5 py-3 rounded-xl font-medium text-sm border ${
                    isDarkMode 
                      ? 'bg-amber-900/30 text-amber-400 border-amber-700/50'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    <span className="mr-2">👁️</span>
                    Preview Mode - Create account to save
                  </div>
                )}
                
                <button
                  onClick={() => {
                    setShowRecommendations(false);
                    onFieldSelect(null);
                    setSelectedCategories([]);
                  }}
                  className={`flex items-center justify-center px-5 py-3 border rounded-xl font-medium transition-colors ${
                    isDarkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-800'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  ← Try Another
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!showRecommendations && (
            <div className={`text-center py-6 px-4 rounded-xl border border-dashed ${
              isDarkMode 
                ? 'bg-gray-800/50 border-gray-700'
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3" style={{ backgroundColor: '#1db954' }}>
                <ChevronRight className="h-6 w-6 text-white" />
              </div>
              <h4 className={`font-semibold mb-1 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Ready to Discover?</h4>
              <p className={`text-sm max-w-sm mx-auto ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Select your field above to unlock personalized recommendations
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FieldQuiz;
