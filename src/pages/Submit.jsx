import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, FileText, CheckCircle, AlertCircle, Loader2, UserPlus, Lock } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AccountModal from '../components/AccountModal';
import { useUser } from '../contexts/UserContext';

const Submit = () => {
  const navigate = useNavigate();
  const { user, userSkillLevel, handleSkillLevelChange, handleResearchInterestsChange } = useUser();
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file: null
  });
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type (PDF)
      if (file.type !== 'application/pdf') {
        setErrorMessage('Please upload a PDF file');
        setSubmitStatus('error');
        return;
      }
      
      // Validate file size (max 25MB)
      if (file.size > 25 * 1024 * 1024) {
        setErrorMessage('File size must be less than 25MB');
        setSubmitStatus('error');
        return;
      }

      setFormData(prev => ({
        ...prev,
        file: file
      }));
      setFileName(file.name);
      setSubmitStatus(null);
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title || !formData.description || !formData.file) {
      setErrorMessage('Please fill in all fields and upload a file');
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // TODO: Replace with actual API call to submit paper
      // For now, simulate an API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate successful submission
      console.log('Form submitted:', formData);
      
      setSubmitStatus('success');
      
      // Reset form after 3 seconds and redirect
      setTimeout(() => {
        setFormData({
          title: '',
          description: '',
          file: null
        });
        setFileName('');
        navigate('/');
      }, 3000);

    } catch (error) {
      console.error('Submission error:', error);
      setErrorMessage('Failed to submit. Please try again.');
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-400/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-400/10 to-transparent rounded-full blur-3xl"></div>
      </div>

      <Header 
        searchTerm=""
        onSearchChange={() => {}}
        selectedCategory=""
        onCategoryChange={() => {}}
        categories={[]}
        onShowSavedArticles={() => {}}
        onShowAccount={() => setIsAccountOpen(true)}
        savedCount={0}
        user={user}
        userSkillLevel={userSkillLevel || "Beginner"}
      />

      {/* Content Spacer for Fixed Header */}
      <div className="h-24 sm:h-20"></div>

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors group"
        >
          <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Home</span>
        </button>

        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
            <FileText className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Submit Your Research
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Share your groundbreaking research with the Pearadox community. Help democratize AI knowledge and make complex research accessible to everyone.
          </p>
        </div>

        {/* Authentication Check */}
        {!user ? (
          // Not Authenticated - Show Sign In Message
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 sm:p-12">
            <div className="text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl mb-6">
                <Lock className="h-10 w-10 text-indigo-600" />
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Account Required
              </h2>
              
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                To submit your research paper to Pearadox, you'll need to create a free account. This helps us maintain quality submissions and allows you to track your submission status.
              </p>

              <div className="space-y-4 mb-8 text-left bg-blue-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Benefits of creating an account:</h3>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Submit and track your research papers</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Save and organize your favorite articles</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Get personalized content for your skill level</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Join a community of AI researchers and enthusiasts</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                >
                  Back to Home
                </button>
                <button
                  onClick={() => setIsAccountOpen(true)}
                  className="group px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center justify-center"
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  <span>Create Free Account</span>
                </button>
              </div>

              <p className="text-sm text-gray-500 mt-6">
                Already have an account? Click "Create Free Account" to sign in.
              </p>
            </div>
          </div>
        ) : (
          // Authenticated - Show Form
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 sm:p-12">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Title Input */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                Paper Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter the title of your research paper"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none text-gray-900"
                required
              />
            </div>

            {/* Description Textarea */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                Description / Abstract *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Provide a brief description or abstract of your research (max 500 words)"
                rows="6"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none text-gray-900 resize-none"
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                {formData.description.split(/\s+/).filter(word => word.length > 0).length} / 500 words
              </p>
            </div>

            {/* File Upload */}
            <div>
              <label htmlFor="file" className="block text-sm font-semibold text-gray-700 mb-2">
                Upload Research Paper (PDF) *
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="file"
                  name="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  required
                />
                <label
                  htmlFor="file"
                  className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/50 transition-all group"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="h-12 w-12 text-gray-400 group-hover:text-indigo-500 mb-3 transition-colors" />
                    <p className="mb-2 text-sm text-gray-700">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PDF (MAX. 25MB)</p>
                    {fileName && (
                      <p className="mt-3 text-sm text-indigo-600 font-medium flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {fileName}
                      </p>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Status Messages */}
            {submitStatus === 'success' && (
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-900">Submission Successful!</h4>
                  <p className="text-green-700 text-sm mt-1">
                    Thank you for your submission. We'll review your paper and get back to you soon.
                  </p>
                </div>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start space-x-3">
                <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-900">Submission Failed</h4>
                  <p className="text-red-700 text-sm mt-1">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex-1 px-6 py-4 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <FileText className="h-5 w-5 mr-2" />
                    Submit Paper
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Info Box */}
          <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
            <h4 className="font-semibold text-blue-900 mb-2">Submission Guidelines</h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Papers should be in PDF format and not exceed 25MB</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Include a clear abstract describing your research</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Research should be original and properly cited</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Review process typically takes 3-5 business days</span>
              </li>
            </ul>
          </div>
        </div>
        )}
      </main>

      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        userSkillLevel={userSkillLevel}
        onSkillLevelChange={handleSkillLevelChange}
        onResearchInterestsChange={handleResearchInterestsChange}
      />

      <Footer onContactClick={() => {}} />
    </div>
  );
};

export default Submit;

