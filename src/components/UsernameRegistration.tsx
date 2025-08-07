// src/components/UsernameRegistration.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { DeviceDetection } from '../utils/deviceDetection';

interface UsernameRegistrationProps {
  onRegistrationComplete: (username: string) => void;
  onCancel?: () => void;
}

export const UsernameRegistration: React.FC<UsernameRegistrationProps> = ({
  onCancel
}) => {
  const [currentLayout, setCurrentLayout] = useState(() => DeviceDetection.getCurrentLayout());

  useEffect(() => {
    const handleResize = () => {
      setCurrentLayout(DeviceDetection.getCurrentLayout());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleGoToMenu = () => {
    console.log('🔄 UsernameRegistration: Navigating to menu for sign-in/sign-up');
    window.dispatchEvent(new CustomEvent('navigateToMenu'));
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
            Sign In / Sign Up
          </h2>
          <p style={styles.subtitle}>
            Please use the main menu to manage your account
          </p>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            backgroundColor: '#fef3c7',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '16px',
            border: '1px solid #f59e0b'
          }}>
            <p style={{ 
              color: '#92400e', 
              fontSize: '14px', 
              margin: '0',
              lineHeight: '1.4'
            }}>
              Username registration has been moved to the main menu. Please use the Sign In / Sign Up option in the settings drawer or main menu to manage your account.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                backgroundColor: 'white',
                color: '#374151',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={handleGoToMenu}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: '#2563eb',
              color: 'white',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Go to Menu
          </button>
        </div>
      </motion.div>
    </div>
  );
};