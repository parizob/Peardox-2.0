import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, Check, AlertCircle, Package } from 'lucide-react';
import { emailAPI, redemptionAPI, authAPI } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';

const RedemptionModal = ({ 
  isOpen, 
  onClose, 
  user, 
  itemId, 
  itemName, 
  itemPrice, 
  availableBalance,
  onRedemptionSuccess 
}) => {
  const { isDarkMode } = useTheme();
  
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [selectedSize, setSelectedSize] = useState('M');
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
    country: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', or null
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const sizes = ['S', 'M', 'L', 'XL', '2XL', '3XL'];

  // Load user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user?.id) {
        setIsLoadingProfile(false);
        return;
      }

      try {
        setIsLoadingProfile(true);
        const profile = await authAPI.getProfile(user.id);
        
        if (profile) {
          setUserName(profile.full_name || user.email?.split('@')[0] || '');
        } else {
          setUserName(user.email?.split('@')[0] || '');
        }
        setUserEmail(user.email || '');
      } catch (error) {
        console.error('Error loading profile:', error);
        setUserName(user.email?.split('@')[0] || '');
        setUserEmail(user.email || '');
      } finally {
        setIsLoadingProfile(false);
      }
    };

    if (isOpen) {
      loadUserProfile();
      // Reset form state when modal opens
      setSubmitStatus(null);
      setErrorMessage('');
      setShippingAddress({
        street: '',
        city: '',
        state: '',
        zip: '',
        country: ''
      });
      setSelectedSize('M');
    }
  }, [isOpen, user]);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
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
    
    // Validate all fields
    if (!shippingAddress.street.trim() || 
        !shippingAddress.city.trim() || 
        !shippingAddress.state.trim() || 
        !shippingAddress.zip.trim() || 
        !shippingAddress.country.trim()) {
      setSubmitStatus('error');
      setErrorMessage('Please fill in all shipping address fields');
      return;
    }

    // Check balance
    if (availableBalance < itemPrice) {
      setSubmitStatus('error');
      setErrorMessage(`Insufficient balance. You need ${itemPrice} PEAR tokens to redeem.`);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);
    setErrorMessage('');

    try {
      console.log('🎁 Processing redemption...');
      
      // Create redemption record in database
      const redemptionResult = await redemptionAPI.createRedemption(
        user.id,
        itemId,
        itemName,
        itemPrice,
        selectedSize,
        shippingAddress
      );
      
      if (!redemptionResult.success) {
        throw new Error('Failed to create redemption record');
      }
      
      console.log('✅ Redemption record created');
      
      // Send notification email
      try {
        await emailAPI.sendRedemptionEmail(
          userName,
          userEmail,
          itemName,
          selectedSize,
          shippingAddress
        );
        console.log('✅ Redemption email sent');
      } catch (emailError) {
        // Don't fail the whole process if email fails
        console.error('⚠️ Email notification failed, but redemption was successful:', emailError);
      }
      
      setSubmitStatus('success');
      
      // Notify parent of successful redemption
      if (onRedemptionSuccess) {
        onRedemptionSuccess();
      }
      
      // Close modal after 2.5 seconds
      setTimeout(() => {
        onClose();
        setSubmitStatus(null);
        setErrorMessage('');
      }, 2500);
      
    } catch (error) {
      console.error('❌ Redemption failed:', error);
      setSubmitStatus('error');
      setErrorMessage(error.message || 'Failed to process redemption. Please try again.');
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
                  <Package className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : ''}`}>Redeem {itemName}</h2>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-white/80'}`}>
                    Complete your order details
                  </p>
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
            {isLoadingProfile ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent" style={{ borderColor: '#1db954', borderTopColor: 'transparent' }}></div>
              </div>
            ) : (
              <>
                {submitStatus === 'success' && (
                  <div className={`mb-4 p-4 rounded-xl flex items-center space-x-3 ${
                    isDarkMode ? 'bg-green-900/50 border border-green-700' : 'bg-green-50 border border-green-200'
                  }`}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#1db954' }}>
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className={`font-medium ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>
                        🎉 Redemption Successful!
                      </p>
                      <p className={`text-sm ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                        Your {itemName} is on its way!
                      </p>
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
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name (Read-only) */}
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={userName}
                      readOnly
                      className={`w-full px-4 py-2.5 border rounded-xl text-sm cursor-not-allowed ${
                        isDarkMode 
                          ? 'bg-gray-800 border-gray-700 text-gray-400' 
                          : 'bg-gray-100 border-gray-200 text-gray-600'
                      }`}
                    />
                  </div>

                  {/* Size Selection */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Select Size *
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          disabled={isSubmitting || submitStatus === 'success'}
                          className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                            selectedSize === size
                              ? 'text-white shadow-md'
                              : isDarkMode 
                                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                          style={selectedSize === size ? { backgroundColor: '#1db954' } : {}}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Street Address */}
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="street"
                      value={shippingAddress.street}
                      onChange={handleAddressChange}
                      disabled={isSubmitting || submitStatus === 'success'}
                      className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none transition-all text-sm ${
                        isDarkMode 
                          ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 disabled:bg-gray-800 disabled:opacity-50' 
                          : 'bg-white border-gray-200 disabled:bg-gray-50 disabled:opacity-50'
                      }`}
                      placeholder="123 Main St, Apt 4"
                      required
                    />
                  </div>

                  {/* City & State */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={shippingAddress.city}
                        onChange={handleAddressChange}
                        disabled={isSubmitting || submitStatus === 'success'}
                        className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none transition-all text-sm ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 disabled:bg-gray-800 disabled:opacity-50' 
                            : 'bg-white border-gray-200 disabled:bg-gray-50 disabled:opacity-50'
                        }`}
                        placeholder="New York"
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        State/Province *
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={shippingAddress.state}
                        onChange={handleAddressChange}
                        disabled={isSubmitting || submitStatus === 'success'}
                        className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none transition-all text-sm ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 disabled:bg-gray-800 disabled:opacity-50' 
                            : 'bg-white border-gray-200 disabled:bg-gray-50 disabled:opacity-50'
                        }`}
                        placeholder="NY"
                        required
                      />
                    </div>
                  </div>

                  {/* Zip & Country */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        ZIP/Postal Code *
                      </label>
                      <input
                        type="text"
                        name="zip"
                        value={shippingAddress.zip}
                        onChange={handleAddressChange}
                        disabled={isSubmitting || submitStatus === 'success'}
                        className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none transition-all text-sm ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 disabled:bg-gray-800 disabled:opacity-50' 
                            : 'bg-white border-gray-200 disabled:bg-gray-50 disabled:opacity-50'
                        }`}
                        placeholder="10001"
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Country *
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={shippingAddress.country}
                        onChange={handleAddressChange}
                        disabled={isSubmitting || submitStatus === 'success'}
                        className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none transition-all text-sm ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 disabled:bg-gray-800 disabled:opacity-50' 
                            : 'bg-white border-gray-200 disabled:bg-gray-50 disabled:opacity-50'
                        }`}
                        placeholder="United States"
                        required
                      />
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Item
                      </span>
                      <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {itemName} (Size {selectedSize})
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Cost
                      </span>
                      <span className="text-sm font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                        {itemPrice} PEAR
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-600/30">
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Your Balance
                      </span>
                      <span className={`text-sm font-semibold ${availableBalance >= itemPrice ? 'text-green-500' : 'text-red-500'}`}>
                        {availableBalance} PEAR
                      </span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || submitStatus === 'success' || availableBalance < itemPrice}
                    className="w-full text-white py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                    style={{ backgroundColor: '#1db954' }}
                    onMouseEnter={(e) => { if (!isSubmitting && submitStatus !== 'success') e.currentTarget.style.backgroundColor = '#16a14a'; }}
                    onMouseLeave={(e) => { if (!isSubmitting && submitStatus !== 'success') e.currentTarget.style.backgroundColor = '#1db954'; }}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Processing...</span>
                      </>
                    ) : submitStatus === 'success' ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Redeemed!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4" />
                        <span>Complete Redemption</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-4 text-center">
                  <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    Free worldwide shipping. Estimated delivery: 7-14 business days.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default RedemptionModal;
