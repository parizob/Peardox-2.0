import React, { useState, useEffect } from 'react';
import { Stethoscope, DollarSign, GraduationCap, Cpu, CheckCircle, ChevronRight, X } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">Find Your Perfect Research Match</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* Unauthenticated User Message */}
          {!user && (
            <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">🔒</span>
                </div>
                <div>
                  <h4 className="font-semibold text-amber-900 mb-1">
                    Account Required for Personalization
                  </h4>
                  <p className="text-amber-800 text-sm leading-relaxed">
                    You can preview different field categories below, but you'll need to create a free account to access this feature and save your personalized research preferences.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      if (onOpenAccount) onOpenAccount();
                    }}
                    className="mt-3 inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 rounded-lg hover:from-blue-100 hover:to-blue-200 font-medium text-sm transition-all border border-blue-200 hover:border-blue-300 relative overflow-hidden group"
                  >
                    {/* Mini shimmer effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                    <span className="relative z-10">Create Free Account</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quiz Header */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              What's your field?
            </h3>
            <p className="text-gray-600 text-sm">
              {user ? 
                "Get personalized AI research recommendations tailored to your expertise" :
                "Preview how categories would change for different fields"
              }
            </p>
          </div>

          {/* Field Selection */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {fields.map((field) => {
              const Icon = field.icon;
              const isSelected = selectedField === field.id;
              
              return (
                <button
                  key={field.id}
                  onClick={() => handleFieldSelect(field.id)}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-md ${
                    isSelected ? field.selectedColor : field.color
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className="p-2 rounded-lg bg-white shadow-sm">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="font-semibold text-sm sm:text-base">
                      {field.name}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Recommendations Section */}
          {showRecommendations && selectedFieldData && (
            <div className="mt-6 p-4 sm:p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center mb-4">
                <div className={`p-2 rounded-lg mr-3 ${selectedFieldData.color.split(' ')[0]} ${selectedFieldData.color.split(' ')[2]}`}>
                  <selectedFieldData.icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Recommended for {selectedFieldData.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    AI research categories most relevant to your field
                  </p>
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedCategories.map((category, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200"
                  >
                    {category}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {user ? (
                  <button
                    onClick={handleSaveCategories}
                    disabled={isSaving}
                    className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Save to My Profile
                      </>
                    )}
                  </button>
                ) : (
                  <div className="flex items-center text-sm text-amber-700 bg-amber-50 px-4 py-2 rounded-lg border border-amber-200">
                    <span className="mr-2">👁️</span>
                    Preview only - Create account to save changes
                  </div>
                )}
                
                <button
                  onClick={() => {
                    setShowRecommendations(false);
                    onFieldSelect(null);
                    setSelectedCategories([]);
                  }}
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                >
                  Choose Different Field
                </button>
              </div>
            </div>
          )}

          {/* Call to Action for Non-Selected State */}
          {!showRecommendations && (
            <div className="text-center text-sm text-gray-500 mt-4">
              <p>Select your field above to see personalized research categories</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FieldQuiz;
