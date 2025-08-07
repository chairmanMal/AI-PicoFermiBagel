import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import { authService } from '../services/authService';

interface RegisterScreenProps {
  onRegisterSuccess: (username: string) => void;
  onBack: () => void;
  onSwitchToLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ 
  onRegisterSuccess, 
  onBack, 
  onSwitchToLogin 
}) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateForm = () => {
    if (!credentials.username.trim()) {
      setError('Username is required');
      return false;
    }
    if (credentials.username.length < 3) {
      setError('Username must be at least 3 characters long');
      return false;
    }
    if (!credentials.password) {
      setError('Password is required');
      return false;
    }
    if (credentials.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (credentials.password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      // Initialize AWS first
      const { initializeAWS } = await import('../services/awsConfig');
      initializeAWS();
      
      // Small delay to ensure AWS is fully initialized
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const result = await authService.registerUser(credentials);
      
      if (result.success) {
        // Use the username from the successful registration result
        const username = result.user?.username || credentials.username;
        onRegisterSuccess(username);
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '400px',
          width: '90%',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '8px',
            marginBottom: '8px'
          }}>
            <UserPlus size={24} color="#10b981" />
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: '#1f2937' }}>
              Create Account
            </h2>
          </div>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
            Choose a username and password
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontSize: '14px', 
              fontWeight: '500',
              color: '#374151'
            }}>
              Username
            </label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              placeholder="Choose a username"
              disabled={isLoading}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontSize: '14px', 
              fontWeight: '500',
              color: '#374151'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  paddingRight: '40px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                placeholder="Choose a password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontSize: '14px', 
              fontWeight: '500',
              color: '#374151'
            }}>
              Confirm Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  paddingRight: '40px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                placeholder="Confirm your password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              padding: '12px',
              marginBottom: '16px',
              color: '#dc2626',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              marginBottom: '12px'
            }}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>

          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              onClick={onSwitchToLogin}
              style={{
                background: 'none',
                border: 'none',
                color: '#3b82f6',
                fontSize: '14px',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Already have an account? Sign in
            </button>
          </div>
        </form>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              color: '#6b7280',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            ← Back to menu
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}; 