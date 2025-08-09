import React, { useState, useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import { LeaderboardEntry } from '../types/game';
import { ArrowLeft, AlertCircle, RefreshCw, Home } from 'lucide-react';
import { getBackgroundGradient } from '../utils/gameLogic';
import { ServiceError } from '../services/multiplayerService';

interface LeaderboardScreenProps {
  onBack: () => void;
}

interface ErrorState {
  message: string;
  details: string;
  suggestions: string[];
  retryable: boolean;
  operation: string;
}

const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ onBack }) => {
  const { leaderboard, settings, globalUsername } = useGameStore();
  
  // Use the current game difficulty as the initial selected difficulty
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>(settings.difficulty);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [userStats, setUserStats] = useState({
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    bestScores: [] as { difficulty: string; score: number }[],
    averageScores: [] as { difficulty: string; score: number }[]
  });

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [dataSource, setDataSource] = useState<'aws' | 'local'>('local');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorState | null>(null);

  const difficulties = ['easy', 'classic', 'medium', 'hard', 'harder', 'hardest', 'expert'];

  // Enhanced error handling
  const handleServiceError = (serviceError: ServiceError, operation: string) => {
    const suggestions = getRecoverySuggestions(serviceError);
    
    setError({
      message: serviceError.message,
      details: serviceError.details,
      suggestions,
      retryable: serviceError.retryable,
      operation
    });

    console.error(`🚨 ${operation} failed:`, {
      type: serviceError.type,
      message: serviceError.message,
      details: serviceError.details,
      retryable: serviceError.retryable,
      suggestedAction: serviceError.suggestedAction,
      timestamp: serviceError.timestamp
    });
  };

  const getRecoverySuggestions = (serviceError: ServiceError): string[] => {
    switch (serviceError.suggestedAction) {
      case 'RETRY':
        return ['Try again', 'Check your internet connection', 'Switch to single player mode'];
      case 'CHECK_CREDENTIALS':
        return ['Check AWS credentials', 'Contact support', 'Switch to single player mode'];
      case 'CONTACT_SUPPORT':
        return ['Contact support', 'Switch to single player mode'];
      case 'SWITCH_TO_SINGLE_PLAYER':
        return ['Switch to single player mode', 'Try again later'];
      default:
        return ['Try again', 'Switch to single player mode'];
    }
  };

  const clearError = () => {
    setError(null);
  };

  const retryOperation = async () => {
    if (!error?.retryable) return;
    
    clearError();
    await loadLeaderboardFromAWS();
  };

  const switchToSinglePlayer = () => {
    clearError();
    onBack();
  };

  // Load leaderboard data from AWS when component mounts
  const loadLeaderboardFromAWS = async () => {
    setLoading(true);
    clearError();
    
    try {
      console.log('🏆 LeaderboardScreen: Loading leaderboard data from AWS for difficulty:', selectedDifficulty);
      
      // Initialize AWS first
      console.log('🏆 LeaderboardScreen: About to import awsConfig...');
      const { initializeAWS } = await import('../services/awsConfig');
      console.log('🏆 LeaderboardScreen: awsConfig imported successfully');
      initializeAWS();
      console.log('🏆 LeaderboardScreen: AWS initialized');
      
      // Import multiplayerService dynamically to avoid circular dependencies
      console.log('🏆 LeaderboardScreen: About to import multiplayerService...');
      
      // Import multiplayerService
      const { multiplayerService } = await import('../services/multiplayerService');
      console.log('🏆 LeaderboardScreen: multiplayerService imported successfully');
      
      console.log('🏆 LeaderboardScreen: About to call getLeaderboard...');
      const awsData = await multiplayerService.getLeaderboard(selectedDifficulty, 20);
      console.log('🏆 LeaderboardScreen: AWS leaderboard data:', awsData);
      
      if (awsData && awsData.length > 0) {
        // Convert AWS data format to local format
        const convertedData: LeaderboardEntry[] = awsData.map(entry => ({
          id: entry.rank?.toString() || Math.random().toString(),
          playerName: entry.username,
          score: entry.score,
          guesses: 0, // AWS doesn't provide this
          timeMinutes: 0, // AWS doesn't provide this
          difficulty: entry.difficulty,
          timestamp: new Date(entry.timestamp)
        }));
        
        console.log('🏆 LeaderboardScreen: Converted AWS data:', convertedData);
        setLeaderboardData(convertedData);
        setLastUpdated(new Date());
        setDataSource('aws');
      } else {
        console.log('🏆 LeaderboardScreen: No AWS data found, using local data');
        const difficultyData = leaderboard.get(selectedDifficulty) || [];
        setLeaderboardData(difficultyData);
        setLastUpdated(new Date());
        setDataSource('local');
      }
    } catch (error: any) {
      console.error('🏆 LeaderboardScreen: Error loading from AWS:', error);
      console.error('🏆 LeaderboardScreen: Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Check if it's a ServiceError
      if (error.type && error.suggestedAction) {
        handleServiceError(error, 'getLeaderboard');
      } else {
        setError({
          message: 'Failed to load leaderboard',
          details: error.message || 'Unknown error occurred while loading leaderboard data',
          suggestions: ['Try again', 'Check your internet connection', 'Switch to single player mode'],
          retryable: true,
          operation: 'getLeaderboard'
        });
      }
      
      // Fall back to local data
      console.log('🏆 LeaderboardScreen: Falling back to local data');
      const difficultyData = leaderboard.get(selectedDifficulty) || [];
      setLeaderboardData(difficultyData);
      setLastUpdated(new Date());
      setDataSource('local');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboardFromAWS();
  }, [selectedDifficulty]);

  useEffect(() => {
    // Calculate user statistics
    const calculateUserStats = () => {
      const allEntries = leaderboardData;
      const userEntries = allEntries.filter(entry => entry.playerName === globalUsername);
      
      const gamesPlayed = userEntries.length;
      const wins = userEntries.filter(entry => entry.score > 0).length;
      const losses = gamesPlayed - wins;
      const winRate = gamesPlayed > 0 ? (wins / gamesPlayed) * 100 : 0;
      
      // Calculate best scores by difficulty
      const bestScores = difficulties.map(difficulty => {
        const difficultyEntries = userEntries.filter(entry => entry.difficulty === difficulty);
        const bestScore = difficultyEntries.length > 0 ? Math.max(...difficultyEntries.map(e => e.score)) : 0;
        return { difficulty, score: bestScore };
      }).filter(score => score.score > 0);
      
      // Calculate average scores by difficulty
      const averageScores = difficulties.map(difficulty => {
        const difficultyEntries = userEntries.filter(entry => entry.difficulty === difficulty);
        const averageScore = difficultyEntries.length > 0 
          ? difficultyEntries.reduce((sum, entry) => sum + entry.score, 0) / difficultyEntries.length 
          : 0;
        return { difficulty, score: Math.round(averageScore) };
      }).filter(score => score.score > 0);
      
      setUserStats({
        gamesPlayed,
        wins,
        losses,
        winRate,
        bestScores,
        averageScores
      });
    };
    
    calculateUserStats();
  }, [leaderboardData, globalUsername, difficulties]);

  const formatDate = (timestamp: Date) => {
    return timestamp.toLocaleDateString() + ' ' + timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getDifficultyDisplayName = (difficulty: string) => {
    const difficultyNames: { [key: string]: string } = {
      easy: 'Easy',
      classic: 'Classic',
      medium: 'Medium',
      hard: 'Hard',
      expert: 'Expert'
    };
    return difficultyNames[difficulty] || difficulty;
  };

  const itemsPerPage = 10;
  const totalPages = Math.ceil(leaderboardData.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = leaderboardData.slice(startIndex, endIndex);

  // Error overlay
  if (error) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        background: getBackgroundGradient(settings.backgroundColor),
        display: 'flex',
        flexDirection: 'column',
        padding: '20px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          marginBottom: '20px'
        }}>
          <button
            onClick={onBack}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 style={{ color: '#ffffff', margin: 0, fontSize: '24px' }}>Leaderboard</h1>
        </div>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          gap: '20px',
          padding: '20px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          margin: '20px'
        }}>
          <AlertCircle size={48} color="#ef4444" />
          
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: '#ffffff', margin: '0 0 10px 0', fontSize: '20px' }}>
              {error.message}
            </h2>
            <p style={{ color: '#ffffff', margin: '0 0 20px 0', fontSize: '14px', opacity: 0.8 }}>
              {error.details}
            </p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '300px' }}>
            {error.suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  if (suggestion.includes('Try again') && error.retryable) {
                    retryOperation();
                  } else if (suggestion.includes('Switch to single player')) {
                    switchToSinglePlayer();
                  } else {
                    clearError();
                  }
                }}
                style={{
                  background: suggestion.includes('Try again') ? '#3b82f6' : 
                           suggestion.includes('Switch to single player') ? '#ef4444' : 
                           'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  color: '#ffffff',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                disabled={loading}
              >
                {suggestion.includes('Try again') && <RefreshCw size={16} />}
                {suggestion.includes('Switch to single player') && <Home size={16} />}
                {suggestion}
              </button>
            ))}
          </div>
          
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff' }}>
              <div style={{ width: '16px', height: '16px', border: '2px solid #ffffff', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              Retrying...
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: getBackgroundGradient(settings.backgroundColor),
      display: 'flex',
      flexDirection: 'column',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        marginBottom: '20px'
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '8px',
            padding: '8px',
            color: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ color: '#ffffff', margin: 0, fontSize: '24px' }}>Leaderboard</h1>
      </div>

      {/* Difficulty Selector */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        {difficulties.map(difficulty => (
          <button
            key={difficulty}
            onClick={() => setSelectedDifficulty(difficulty)}
            style={{
              background: selectedDifficulty === difficulty ? '#3b82f6' : 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              color: '#ffffff',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: selectedDifficulty === difficulty ? 'bold' : 'normal'
            }}
          >
            {getDifficultyDisplayName(difficulty)}
          </button>
        ))}
      </div>

      {/* Data Source Indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '15px',
        fontSize: '12px',
        color: '#ffffff',
        opacity: 0.8
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: dataSource === 'aws' ? '#10b981' : '#f59e0b'
        }} />
        <span>
          {dataSource === 'aws' ? 'AWS Data' : 'Local Data'}
          {lastUpdated && ` • Last updated: ${formatDate(lastUpdated)}`}
        </span>
      </div>

      {/* User Statistics */}
      {globalUsername && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '15px',
          marginBottom: '20px'
        }}>
          <h3 style={{ color: '#ffffff', margin: '0 0 10px 0', fontSize: '16px' }}>
            Your Stats ({globalUsername})
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '10px',
            fontSize: '14px',
            color: '#ffffff'
          }}>
            <div>Games: {userStats.gamesPlayed}</div>
            <div>Wins: {userStats.wins}</div>
            <div>Losses: {userStats.losses}</div>
            <div>Win Rate: {userStats.winRate.toFixed(1)}%</div>
          </div>
          {userStats.bestScores.length > 0 && (
            <div style={{ marginTop: '10px' }}>
              <div style={{ fontSize: '12px', color: '#ffffff', opacity: 0.8, marginBottom: '5px' }}>
                Best Scores:
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {userStats.bestScores.map(score => (
                  <span key={score.difficulty} style={{ fontSize: '12px', color: '#ffffff' }}>
                    {getDifficultyDisplayName(score.difficulty)}: {score.score}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Leaderboard Table */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '15px',
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <h3 style={{ color: '#ffffff', margin: '0 0 15px 0', fontSize: '18px' }}>
          {getDifficultyDisplayName(selectedDifficulty)} Leaderboard
        </h3>
        
        {loading ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            color: '#ffffff'
          }}>
            <div style={{ width: '20px', height: '20px', border: '2px solid #ffffff', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginRight: '10px' }}></div>
            Loading leaderboard...
          </div>
        ) : currentData.length === 0 ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            color: '#ffffff',
            opacity: 0.7
          }}>
            No data available for {getDifficultyDisplayName(selectedDifficulty)}
          </div>
        ) : (
          <>
            <div style={{ flex: 1, overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>
                    <th style={{ textAlign: 'left', padding: '10px', color: '#ffffff', fontSize: '14px', fontWeight: 'bold' }}>Rank</th>
                    <th style={{ textAlign: 'left', padding: '10px', color: '#ffffff', fontSize: '14px', fontWeight: 'bold' }}>Player</th>
                    <th style={{ textAlign: 'right', padding: '10px', color: '#ffffff', fontSize: '14px', fontWeight: 'bold' }}>Score</th>
                    <th style={{ textAlign: 'right', padding: '10px', color: '#ffffff', fontSize: '14px', fontWeight: 'bold' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((entry, index) => (
                    <tr 
                      key={entry.id}
                      style={{ 
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        background: entry.playerName === globalUsername ? 'rgba(59, 130, 246, 0.2)' : 'transparent'
                      }}
                    >
                      <td style={{ padding: '10px', color: '#ffffff', fontSize: '14px' }}>
                        {startIndex + index + 1}
                      </td>
                      <td style={{ padding: '10px', color: '#ffffff', fontSize: '14px', fontWeight: entry.playerName === globalUsername ? 'bold' : 'normal' }}>
                        {entry.playerName}
                      </td>
                      <td style={{ textAlign: 'right', padding: '10px', color: '#ffffff', fontSize: '14px' }}>
                        {entry.score}
                      </td>
                      <td style={{ textAlign: 'right', padding: '10px', color: '#ffffff', fontSize: '12px', opacity: 0.8 }}>
                        {formatDate(entry.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '10px',
                marginTop: '15px',
                paddingTop: '15px',
                borderTop: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  style={{
                    background: currentPage === 0 ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    color: '#ffffff',
                    fontSize: '14px',
                    cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                    opacity: currentPage === 0 ? 0.5 : 1
                  }}
                >
                  Previous
                </button>
                
                <span style={{ color: '#ffffff', fontSize: '14px', padding: '8px 12px' }}>
                  {currentPage + 1} of {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage === totalPages - 1}
                  style={{
                    background: currentPage === totalPages - 1 ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    color: '#ffffff',
                    fontSize: '14px',
                    cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer',
                    opacity: currentPage === totalPages - 1 ? 0.5 : 1
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LeaderboardScreen; 