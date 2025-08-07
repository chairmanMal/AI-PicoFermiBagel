import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DeviceDetection } from '../utils/deviceDetection';
import { Users, LogIn, UserPlus, LogOut } from 'lucide-react';
import { useGameStore } from '../stores/gameStore';
import { authService } from '../services/authService';
import { LoginScreen } from './LoginScreen';
import { RegisterScreen } from './RegisterScreen';

interface MainMenuProps {
  onSinglePlayer: () => void;
  onMultiplayer: () => void;
  multiplayerAvailable: boolean;
  isConnecting?: boolean;
}

const MainMenu: React.FC<MainMenuProps> = ({ 
  onSinglePlayer, 
  onMultiplayer, 
  multiplayerAvailable,
  isConnecting = false
}) => {
  const [currentLayout, setCurrentLayout] = useState(() => DeviceDetection.getCurrentLayout());
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  
  // Use global username from gameStore
  const { setGlobalUsername } = useGameStore();

  // Check authentication status on mount
  useEffect(() => {
    const user = authService.getCurrentUser();
    console.log('🔧 MainMenu: Checking authentication status:', { user, isAuthenticated: !!user });
    if (user) {
      setIsAuthenticated(true);
      setCurrentUser(user.username);
      setGlobalUsername(user.username);
    }
  }, [setGlobalUsername]);

  const handleLoginSuccess = (username: string) => {
    console.log('🔧 MainMenu: Login success for:', username);
    setIsAuthenticated(true);
    setCurrentUser(username);
    setGlobalUsername(username);
    setShowLogin(false);
    // Dispatch event to notify App component that username changed
    window.dispatchEvent(new CustomEvent('usernameChanged'));
  };

  const handleRegisterSuccess = (username: string) => {
    console.log('🔧 MainMenu: Register success for:', username);
    setIsAuthenticated(true);
    setCurrentUser(username);
    setGlobalUsername(username);
    setShowRegister(false);
    // Dispatch event to notify App component that username changed
    window.dispatchEvent(new CustomEvent('usernameChanged'));
  };

  const handleSignOut = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setGlobalUsername('');
    // Dispatch event to notify App component that username changed
    window.dispatchEvent(new CustomEvent('usernameChanged'));
  };

  useEffect(() => {
    const handleResize = () => {
      setCurrentLayout(DeviceDetection.getCurrentLayout());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get responsive styles based on device and orientation
  const getResponsiveStyles = () => {
    const { device, orientation, isIpadLandscape } = currentLayout;
    
    if (isIpadLandscape) {
      // iPad landscape: 3-column layout with smaller content
      return {
        container: {
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #faf5ff 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px'
        },
        content: {
          textAlign: 'center' as const,
          maxWidth: '300px',
          width: '100%'
        },
        title: {
          fontSize: '28px',
          fontWeight: 'bold' as const,
          color: '#1f2937',
          marginBottom: '24px'
        },
        buttonContainer: {
          marginTop: '24px',
          maxWidth: '280px',
          margin: '24px auto 0'
        },
        button: {
          width: '100%',
          padding: '12px 20px',
          borderRadius: '10px',
          fontWeight: '600' as const,
          fontSize: '16px',
          border: 'none',
          cursor: 'pointer' as const,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          marginBottom: '12px',
          transition: 'background-color 0.2s ease'
        }
      };
    } else if (device === 'ipad' && orientation === 'portrait') {
      // iPad portrait: centered with medium size
      return {
        container: {
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #faf5ff 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        },
        content: {
          textAlign: 'center' as const,
          maxWidth: '400px',
          width: '100%'
        },
        title: {
          fontSize: '32px',
          fontWeight: 'bold' as const,
          color: '#1f2937',
          marginBottom: '28px'
        },
        buttonContainer: {
          marginTop: '28px',
          maxWidth: '280px',
          margin: '28px auto 0'
        },
        button: {
          width: '100%',
          padding: '14px 24px',
          borderRadius: '10px',
          fontWeight: '600' as const,
          fontSize: '18px',
          border: 'none',
          cursor: 'pointer' as const,
          boxShadow: '0 3px 5px rgba(0, 0, 0, 0.1)',
          marginBottom: '14px',
          transition: 'background-color 0.2s ease'
        }
      };
    } else {
      // Mobile: full screen with larger buttons
      return {
        container: {
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #faf5ff 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        },
        content: {
          textAlign: 'center' as const,
          maxWidth: '320px',
          width: '100%'
        },
        title: {
          fontSize: '36px',
          fontWeight: 'bold' as const,
          color: '#1f2937',
          marginBottom: '32px'
        },
        buttonContainer: {
          marginTop: '32px',
          maxWidth: '280px',
          margin: '32px auto 0'
        },
        button: {
          width: '100%',
          padding: '16px 24px',
          borderRadius: '12px',
          fontWeight: '600' as const,
          fontSize: '18px',
          border: 'none',
          cursor: 'pointer' as const,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          marginBottom: '16px',
          transition: 'background-color 0.2s ease'
        }
      };
    }
  };

  const styles = getResponsiveStyles();

  return (
    <div style={styles.container}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={styles.content}
      >
        <h1 style={styles.title}>
          PicoFermiBagel
        </h1>
        
        {/* Authentication Status */}
        <div style={{
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          {isAuthenticated ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '12px'
              }}
            >
              <Users size={20} color="#10b981" />
              <span style={{ fontSize: '16px', color: '#10b981', fontWeight: '500' }}>
                Signed in as {currentUser}
              </span>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '12px'
              }}
            >
              <Users size={20} color="#6b7280" />
              <span style={{ fontSize: '16px', color: '#6b7280', fontWeight: '500' }}>
                Sign in to play multiplayer
              </span>
            </motion.div>
          )}
          
          {isAuthenticated ? (
            <button
              onClick={handleSignOut}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #fecaca',
                background: '#fef2f2',
                color: '#dc2626',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '0 auto'
              }}
            >
              <LogOut size={16} />
              Sign Out
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowLogin(true)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  background: 'white',
                  color: '#374151',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <LogIn size={16} />
                Sign In
              </button>
              <button
                onClick={() => setShowRegister(true)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  background: 'white',
                  color: '#374151',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <UserPlus size={16} />
                Sign Up
              </button>
            </div>
          )}
        </div>

        {/* Game Mode Buttons */}
        <div style={styles.buttonContainer}>
          <button
            onClick={onSinglePlayer}
            style={{
              ...styles.button,
              background: '#3b82f6',
              color: 'white'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#2563eb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#3b82f6';
            }}
          >
            Single Player
          </button>

          <button
            onClick={onMultiplayer}
            disabled={!multiplayerAvailable || isConnecting || !isAuthenticated}
            style={{
              ...styles.button,
              background: isAuthenticated ? '#10b981' : '#9ca3af',
              color: 'white',
              cursor: (multiplayerAvailable && !isConnecting && isAuthenticated) ? 'pointer' : 'not-allowed',
              opacity: (multiplayerAvailable && !isConnecting && isAuthenticated) ? 1 : 0.6
            }}
            onMouseEnter={(e) => {
              if (multiplayerAvailable && !isConnecting && isAuthenticated) {
                e.currentTarget.style.background = '#059669';
              }
            }}
            onMouseLeave={(e) => {
              if (multiplayerAvailable && !isConnecting && isAuthenticated) {
                e.currentTarget.style.background = '#10b981';
              }
            }}
          >
            {isConnecting ? 'Connecting...' : 'Multiplayer'}
          </button>
        </div>
      </motion.div>

      {/* Authentication Modals */}
      <AnimatePresence>
        {showLogin && (
          <LoginScreen
            onLoginSuccess={handleLoginSuccess}
            onBack={() => setShowLogin(false)}
            onSwitchToRegister={() => {
              setShowLogin(false);
              setShowRegister(true);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRegister && (
          <RegisterScreen
            onRegisterSuccess={handleRegisterSuccess}
            onBack={() => setShowRegister(false)}
            onSwitchToLogin={() => {
              setShowRegister(false);
              setShowLogin(true);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MainMenu; 