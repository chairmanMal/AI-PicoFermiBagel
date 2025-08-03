// src/components/UsernameRegistration.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import multiplayerService from '../services/multiplayerService';
import { DeviceDetection } from '../utils/deviceDetection';

interface UsernameRegistrationProps {
  onRegistrationComplete: (username: string) => void;
  onCancel?: () => void;
}

export const UsernameRegistration: React.FC<UsernameRegistrationProps> = ({
  onRegistrationComplete,
  onCancel
}) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(false);
  const [currentLayout, setCurrentLayout] = useState(() => DeviceDetection.getCurrentLayout());

  useEffect(() => {
    const handleResize = () => {
      setCurrentLayout(DeviceDetection.getCurrentLayout());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Check if user already has a registered username
    const checkExistingUsername = async () => {
      const hasUsername = await multiplayerService.hasRegisteredUsername();
      if (hasUsername) {
        const storedUsername = multiplayerService.getStoredUsername();
        if (storedUsername) {
          onRegistrationComplete(storedUsername);
        }
      }
    };

    checkExistingUsername();
  }, [onRegistrationComplete]);

  useEffect(() => {
    // Validate username format
    const isValidFormat = /^[a-zA-Z0-9]{5,40}$/.test(username);
    setIsValid(isValidFormat);
    
    if (username.length > 0 && !isValidFormat) {
      if (username.length < 5) {
        setError('Username must be at least 5 characters');
      } else if (username.length > 40) {
        setError('Username must be 40 characters or less');
      } else if (!/^[a-zA-Z0-9]+$/.test(username)) {
        setError('Username can only contain letters and numbers');
      }
    } else {
      setError('');
    }
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValid || loading) return;

    setLoading(true);
    setError('');
    setSuggestions([]);

    try {
      console.log('🎮 UsernameRegistration: Attempting to register user:', username);
      const result = await multiplayerService.registerUser(username);
      console.log('🎮 UsernameRegistration: Registration result:', result);
      
      if (result.success) {
        console.log('🎮 UsernameRegistration: Registration successful, calling onRegistrationComplete');
        onRegistrationComplete(result.username);
      } else {
        console.log('🎮 UsernameRegistration: Registration failed:', result.message);
        setError(result.message);
        if (result.suggestions && result.suggestions.length > 0) {
          setSuggestions(result.suggestions);
        }
      }
    } catch (error) {
      console.error('🎮 UsernameRegistration: Registration error:', error);
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setUsername(suggestion);
    setSuggestions([]);
    setError('');
  };

  // Get responsive styles based on device and orientation
  const getResponsiveStyles = () => {
    const { device, orientation, isIpadLandscape } = currentLayout;
    
    if (isIpadLandscape) {
      // iPad landscape: smaller modal
      return {
        overlay: {
          position: 'fixed' as const,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '8px'
        },
        modal: {
          backgroundColor: 'white',
          borderRadius: '10px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
          padding: '24px',
          maxWidth: '350px',
          width: '100%',
          maxHeight: '85vh',
          overflowY: 'auto' as const
        },
        title: {
          fontSize: '24px',
          fontWeight: 'bold' as const,
          color: '#1f2937',
          marginBottom: '8px'
        },
        subtitle: {
          fontSize: '14px',
          color: '#6b7280',
          marginBottom: '20px'
        },
        input: {
          width: '100%',
          padding: '12px 16px',
          borderRadius: '8px',
          border: '1px solid #d1d5db',
          fontSize: '16px',
          outline: 'none'
        }
      };
    } else if (device === 'ipad' && orientation === 'portrait') {
      // iPad portrait: medium modal
      return {
        overlay: {
          position: 'fixed' as const,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '20px'
        },
        modal: {
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
          padding: '32px',
          maxWidth: '450px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto' as const
        },
        title: {
          fontSize: '28px',
          fontWeight: 'bold' as const,
          color: '#1f2937',
          marginBottom: '12px'
        },
        subtitle: {
          fontSize: '16px',
          color: '#6b7280',
          marginBottom: '24px'
        },
        input: {
          width: '100%',
          padding: '14px 18px',
          borderRadius: '10px',
          border: '1px solid #d1d5db',
          fontSize: '18px',
          outline: 'none'
        }
      };
    } else {
      // iPhone portrait: compact modal
      return {
        overlay: {
          position: 'fixed' as const,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '16px'
        },
        modal: {
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
          padding: '28px',
          maxWidth: '380px',
          width: '100%',
          maxHeight: '85vh',
          overflowY: 'auto' as const
        },
        title: {
          fontSize: '24px',
          fontWeight: 'bold' as const,
          color: '#1f2937',
          marginBottom: '10px'
        },
        subtitle: {
          fontSize: '14px',
          color: '#6b7280',
          marginBottom: '20px'
        },
        input: {
          width: '100%',
          padding: '12px 16px',
          borderRadius: '8px',
          border: '1px solid #d1d5db',
          fontSize: '16px',
          outline: 'none'
        }
      };
    }
  };

  const styles = getResponsiveStyles();

  return (
    <div style={styles.overlay}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        style={styles.modal}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            backgroundColor: '#dbeafe',
            borderRadius: '50%',
            padding: '12px',
            width: '64px',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <User style={{ width: '32px', height: '32px', color: '#2563eb' }} />
          </div>
          <h2 style={styles.title}>
            Choose Your Username
          </h2>
          <p style={styles.subtitle}>
            This will be your identity in multiplayer games
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username (5-40 characters)"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  error
                    ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                    : isValid
                    ? 'border-green-300 focus:ring-green-200 focus:border-green-500'
                    : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                }`}
                maxLength={40}
                autoFocus
                disabled={loading}
              />
              <div className="absolute right-3 top-3">
                {loading ? (
                  <Loader className="w-5 h-5 text-gray-400 animate-spin" />
                ) : username.length > 0 ? (
                  isValid ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )
                ) : null}
              </div>
            </div>
            
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>{username.length}/40 characters</span>
              <span>Letters and numbers only</span>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-red-600 text-sm bg-red-50 p-3 rounded-lg"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-blue-50 p-3 rounded-lg"
              >
                <p className="text-sm text-blue-800 mb-2">
                  Username taken. Try these suggestions:
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-3 pt-4">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={!isValid || loading}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                isValid && !loading
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Registering...
                </>
              ) : (
                'Continue'
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          Your username will be visible to other players in multiplayer games
        </div>
      </motion.div>
    </div>
  );
};