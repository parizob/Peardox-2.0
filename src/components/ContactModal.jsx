import React, { useState } from 'react';
import { X, Mail, Send, Check, AlertCircle } from 'lucide-react';
import { emailAPI } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';

const ContactModal = ({ isOpen, onClose }) => {
  const { isDarkMode } = useTheme();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', or null
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (submitStatus === 'error') {
      setSubmitStatus(null);
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation with trimming
    if (!formData.name.trim() || !formData.email.trim() || !formData.subject || !formData.message.trim()) {
      setSubmitStatus('error');
      setErrorMessage('Please fill in all fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setSubmitStatus('error');
      setErrorMessage('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);
    setErrorMessage('');

    try {
      console.log('📧 Submitting contact form...');
      
      await emailAPI.sendContactEmail(
        formData.name.trim(),
        formData.email.trim(),
        formData.subject,
        formData.message.trim()
      );
      
      console.log('✅ Email sent successfully');
      setSubmitStatus('success');
      
      // Clear form after successful submission
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
        setSubmitStatus(null);
        setErrorMessage('');
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error submitting contact form:', error);
      setSubmitStatus('error');
      
      // Provide specific error messages
      if (error.message.includes('Invalid email')) {
        setErrorMessage('Please enter a valid email address');
      } else if (error.message.includes('Missing required fields')) {
        setErrorMessage('Please fill in all fields');
      } else if (error.message.includes('Failed to send email')) {
        setErrorMessage('Unable to send email at this time. Please try again later or contact us directly at pearadoxapp@gmail.com');
      } else {
        setErrorMessage(error.message || 'Failed to send message. Please try again later.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setSubmitStatus(null);
      setErrorMessage('');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className={`rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden ${
          isDarkMode ? 'bg-gray-900' : 'bg-white'
        }`}>
          {/* Header */}
          <div 
            className={`p-6 ${isDarkMode ? 'bg-gray-800 border-b border-gray-700' : 'text-white'}`}
            style={!isDarkMode ? { backgroundColor: '#1db954' } : {}}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode ? '' : 'bg-white/20'}`}
                  style={isDarkMode ? { backgroundColor: '#1db954' } : {}}
                >
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : ''}`}>Contact Us</h2>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-white/80'}`}>We'd love to hear from you!</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className={`p-2 rounded-full transition-colors disabled:opacity-50 ${
                  isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-white/20 text-white'
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {submitStatus === 'success' && (
              <div className={`mb-4 p-4 rounded-xl flex items-center space-x-3 ${
                isDarkMode ? 'bg-green-900/50 border border-green-700' : 'bg-green-50 border border-green-200'
              }`}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#1db954' }}>
                  <Check className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className={`font-medium ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>Message sent successfully!</p>
                  <p className={`text-sm ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>We'll get back to you soon.</p>
                </div>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className={`mb-4 p-4 rounded-xl flex items-center space-x-3 ${
                isDarkMode ? 'bg-red-900/50 border border-red-700' : 'bg-red-50 border border-red-200'
              }`}>
                <AlertCircle className={`h-5 w-5 flex-shrink-0 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
                <div>
                  <p className={`font-medium ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>{errorMessage}</p>
                  {!errorMessage.includes('contact us directly') && (
                    <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                      Please check your information and try again.
                    </p>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={isSubmitting || submitStatus === 'success'}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none transition-all text-sm ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 disabled:bg-gray-800 disabled:opacity-50' 
                      : 'bg-white border-gray-200 disabled:bg-gray-50 disabled:opacity-50'
                  }`}
                  placeholder="Your full name"
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isSubmitting || submitStatus === 'success'}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none transition-all text-sm ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 disabled:bg-gray-800 disabled:opacity-50' 
                      : 'bg-white border-gray-200 disabled:bg-gray-50 disabled:opacity-50'
                  }`}
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Subject *
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  disabled={isSubmitting || submitStatus === 'success'}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none transition-all text-sm ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700 text-white disabled:bg-gray-800 disabled:opacity-50' 
                      : 'bg-white border-gray-200 disabled:bg-gray-50 disabled:opacity-50'
                  }`}
                  required
                >
                  <option value="" className={isDarkMode ? 'bg-gray-800' : ''}>Select a subject</option>
                  <option value="General Feedback" className={isDarkMode ? 'bg-gray-800' : ''}>General Feedback</option>
                  <option value="Bug Report" className={isDarkMode ? 'bg-gray-800' : ''}>Bug Report</option>
                  <option value="Feature Request" className={isDarkMode ? 'bg-gray-800' : ''}>Feature Request</option>
                  <option value="Account Issues" className={isDarkMode ? 'bg-gray-800' : ''}>Account Issues</option>
                  <option value="Technical Support" className={isDarkMode ? 'bg-gray-800' : ''}>Technical Support</option>
                  <option value="Partnership Inquiry" className={isDarkMode ? 'bg-gray-800' : ''}>Partnership Inquiry</option>
                  <option value="Other" className={isDarkMode ? 'bg-gray-800' : ''}>Other</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  disabled={isSubmitting || submitStatus === 'success'}
                  rows={4}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none transition-all text-sm resize-none ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 disabled:bg-gray-800 disabled:opacity-50' 
                      : 'bg-white border-gray-200 disabled:bg-gray-50 disabled:opacity-50'
                  }`}
                  placeholder="Tell us about your experience, suggestions, or any issues you've encountered..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || submitStatus === 'success'}
                className="w-full text-white py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                style={{ backgroundColor: '#1db954' }}
                onMouseEnter={(e) => { if (!isSubmitting && submitStatus !== 'success') e.currentTarget.style.backgroundColor = '#16a14a'; }}
                onMouseLeave={(e) => { if (!isSubmitting && submitStatus !== 'success') e.currentTarget.style.backgroundColor = '#1db954'; }}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Sending...</span>
                  </>
                ) : submitStatus === 'success' ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Sent!</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 text-center">
              <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Your message will be sent securely to our team.
                <br />
                We typically respond within 24 hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactModal;
