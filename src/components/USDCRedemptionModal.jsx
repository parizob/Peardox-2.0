import React, { useState, useEffect } from 'react';
import { X, Wallet, Check, AlertCircle, DollarSign } from 'lucide-react';
import { emailAPI, redemptionAPI, authAPI } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';

const USDCRedemptionModal = ({ 
  isOpen, 
  onClose, 
  user, 
  availableBalance,
  onRedemptionSuccess 
}) => {
  const { isDarkMode } = useTheme();
  
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [ethereumAddress, setEthereumAddress] = useState('');
  const [redeemAmount, setRedeemAmount] = useState(100); // Default to minimum (100 PEAR = $1)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', or null
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const PEAR_TO_USD = 1; // 1 PEAR = $1 USDC
  const MIN_REDEEM = 1; // Minimum 1 PEAR

  // Calculate max redeemable (in PEAR, rounded down to nearest 100)
  const maxRedeemable = Math.floor(availableBalance / PEAR_TO_USD) * PEAR_TO_USD;
  const usdcAmount = redeemAmount / PEAR_TO_USD;

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

    if (isOpen && submitStatus !== 'success') {
      loadUserProfile();
      // Reset form state when modal opens (but not if showing success)
      setSubmitStatus(null);
      setErrorMessage('');
      setEthereumAddress('');
      setRedeemAmount(Math.min(maxRedeemable, MIN_REDEEM) || MIN_REDEEM);
    }
  }, [isOpen, user, maxRedeemable, submitStatus]);

  // Validate Ethereum address or ENS domain format
  const isValidEthereumAddress = (address) => {
    // Standard Ethereum address (0x + 40 hex characters)
    const isHexAddress = /^0x[a-fA-F0-9]{40}$/.test(address);
    // ENS domain (.eth or .xyz)
    const isENSDomain = /^[a-zA-Z0-9-]+\.(eth|xyz)$/.test(address);
    return isHexAddress || isENSDomain;
  };

  const handleAddressChange = (e) => {
    setEthereumAddress(e.target.value);
    
    // Clear error when user starts typing
    if (submitStatus === 'error') {
      setSubmitStatus(null);
      setErrorMessage('');
    }
  };

  const handleAmountChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    // Clamp between min and max
    const clamped = Math.max(MIN_REDEEM, Math.min(value, maxRedeemable));
    setRedeemAmount(clamped);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate Ethereum address
    if (!ethereumAddress.trim()) {
      setSubmitStatus('error');
      setErrorMessage('Please enter your Ethereum wallet address');
      return;
    }

    if (!isValidEthereumAddress(ethereumAddress.trim())) {
      setSubmitStatus('error');
      setErrorMessage('Please enter a valid Ethereum address (0x...) or ENS domain (.eth/.xyz)');
      return;
    }

    // Check balance
    if (availableBalance < redeemAmount) {
      setSubmitStatus('error');
      setErrorMessage(`Insufficient balance. You need at least ${redeemAmount} PEAR tokens.`);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);
    setErrorMessage('');

    try {
      console.log('💰 Processing USDC redemption...');
      
      // Create redemption record in database
      const redemptionResult = await redemptionAPI.createRedemption(
        user.id,
        'usdc',
        `USDC ($${usdcAmount})`,
        redeemAmount,
        null, // No size for USDC
        { ethereum_address: ethereumAddress.trim() } // Store ETH address in shipping_address field
      );
      
      if (!redemptionResult.success) {
        throw new Error('Failed to create redemption record');
      }
      
      console.log('✅ USDC redemption record created');
      
      // Send notification email
      try {
        await emailAPI.sendUSDCRedemptionEmail(
          userName,
          userEmail,
          usdcAmount,
          redeemAmount,
          ethereumAddress.trim()
        );
        console.log('✅ USDC redemption email sent');
      } catch (emailError) {
        // Don't fail the whole process if email fails
        console.error('⚠️ Email notification failed, but redemption was successful:', emailError);
      }
      
      setSubmitStatus('success');
      
      // Notify parent of successful redemption with amount
      if (onRedemptionSuccess) {
        onRedemptionSuccess(redeemAmount);
      }
      
      // Close modal after 3 seconds and navigate back
      setTimeout(() => {
        onClose();
      }, 3000);
      
    } catch (error) {
      console.error('❌ USDC redemption failed:', error);
      setSubmitStatus('error');
      setErrorMessage(error.message || 'Failed to process redemption. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      // Reset state when closing
      setSubmitStatus(null);
      setErrorMessage('');
      setEthereumAddress('');
      onClose();
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
            style={!isDarkMode ? { backgroundColor: '#3b82f6' } : {}}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode ? '' : 'bg-white/20'}`}
                  style={isDarkMode ? { backgroundColor: '#3b82f6' } : {}}
                >
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : ''}`}>Redeem USDC</h2>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-white/80'}`}>
                    Convert PEAR to stablecoin
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
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent" style={{ borderColor: '#3b82f6', borderTopColor: 'transparent' }}></div>
              </div>
            ) : submitStatus === 'success' ? (
              /* Success Screen - Replaces Form */
              <div className="text-center py-8">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#1db954' }}>
                  <Check className="h-10 w-10 text-white" />
                </div>
                <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Redemption Submitted!
                </h3>
                <p className={`text-lg mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <span className="font-semibold text-blue-500">${usdcAmount} USDC</span> is on its way
                </p>
                <div className={`p-4 rounded-xl mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    The Pearadox team will review and process your redemption shortly. USDC will be sent to your wallet within <strong>1-3 business days</strong>.
                  </p>
                </div>
                <div className={`p-3 rounded-lg text-sm font-mono break-all ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                  {ethereumAddress}
                </div>
                <p className={`mt-4 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Closing automatically...
                </p>
              </div>
            ) : (
              <>
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
                  {/* Amount Selection */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Amount to Redeem *
                    </label>
                    <div className={`flex items-center gap-3 p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                      <input
                        type="range"
                        min={MIN_REDEEM}
                        max={maxRedeemable || MIN_REDEEM}
                        step={1}
                        value={redeemAmount}
                        onChange={handleAmountChange}
                        disabled={isSubmitting || submitStatus === 'success' || maxRedeemable < MIN_REDEEM}
                        className="flex-1 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                      <div className="text-right min-w-[100px]">
                        <p className="text-lg font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                          {redeemAmount} PEAR
                        </p>
                        <p className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                          = ${usdcAmount} USDC
                        </p>
                      </div>
                    </div>
                    <p className={`text-xs mt-1.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      Available: {availableBalance} PEAR (max ${availableBalance} USDC)
                    </p>
                  </div>

                  {/* Ethereum Address */}
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Ethereum Wallet Address *
                    </label>
                    <div className="relative">
                      <Wallet className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      <input
                        type="text"
                        value={ethereumAddress}
                        onChange={handleAddressChange}
                        disabled={isSubmitting || submitStatus === 'success'}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition-all text-sm font-mono ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 disabled:bg-gray-800 disabled:opacity-50' 
                            : 'bg-white border-gray-200 disabled:bg-gray-50 disabled:opacity-50'
                        }`}
                        placeholder="0x... or name.eth"
                        required
                      />
                    </div>
                    <p className={`text-xs mt-1.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      Enter your wallet address or ENS domain (.eth, .xyz). USDC sent via Base Network.
                    </p>
                  </div>

                  {/* Network Info */}
                  <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-blue-900/20 border-blue-700/50' : 'bg-blue-50 border-blue-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">B</span>
                      </div>
                      <span className={`font-semibold text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>Base Network</span>
                    </div>
                    <p className={`text-xs ${isDarkMode ? 'text-blue-400/80' : 'text-blue-700'}`}>
                      We use Base (Coinbase's L2) for fast, low-cost USDC transfers. Processing typically takes 1-3 business days.
                    </p>
                  </div>

                  {/* Order Summary */}
                  <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        You Send
                      </span>
                      <span className="text-sm font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                        {redeemAmount} PEAR
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        You Receive
                      </span>
                      <span className={`text-sm font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        ${usdcAmount} USDC
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-600/30">
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Remaining Balance
                      </span>
                      <span className={`text-sm font-semibold ${(availableBalance - redeemAmount) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {availableBalance - redeemAmount} PEAR
                      </span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || submitStatus === 'success' || availableBalance < MIN_REDEEM}
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
                        <Wallet className="h-4 w-4" />
                        <span>Redeem ${usdcAmount} USDC</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-4 text-center">
                  <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    USDC redemptions are processed within 1-3 business days.
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

export default USDCRedemptionModal;
