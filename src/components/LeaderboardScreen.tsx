import React, { useState, useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import { LeaderboardEntry } from '../types/game';

interface LeaderboardScreenProps {
  onBack: () => void;
}

const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ onBack }) => {
  const { leaderboard, stats, settings } = useGameStore();
  
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

  const difficulties = ['easy', 'classic', 'medium', 'hard', 'expert'];

    // Load leaderboard data from AWS when component mounts
  useEffect(() => {
    const loadLeaderboardFromAWS = async () => {
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
        
        console.log('🏆 LeaderboardScreen: multiplayerService imported successfully');
        console.log('🏆 LeaderboardScreen: multiplayerService methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(multiplayerService)));
        
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
        console.log('🏆 LeaderboardScreen: Falling back to local data');
        const difficultyData = leaderboard.get(selectedDifficulty) || [];
        setLeaderboardData(difficultyData);
        setLastUpdated(new Date());
        setDataSource('local');
      }
    };
    
    loadLeaderboardFromAWS();
  }, [selectedDifficulty]);

  useEffect(() => {
    // Load leaderboard data for selected difficulty
    const difficultyData = leaderboard.get(selectedDifficulty) || [];
    console.log('🏆 LeaderboardScreen: Loading data for difficulty:', selectedDifficulty);
    console.log('🏆 LeaderboardScreen: Available difficulties:', Array.from(leaderboard.keys()));
    console.log('🏆 LeaderboardScreen: Data for', selectedDifficulty, ':', difficultyData);
    setLeaderboardData(difficultyData);
    setCurrentPage(0);
  }, [selectedDifficulty, leaderboard]);

  useEffect(() => {
    // Calculate user statistics
    const userStatsData = {
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      bestScores: [] as { difficulty: string; score: number }[],
      averageScores: [] as { difficulty: string; score: number }[]
    };

    // Calculate stats from game store
    difficulties.forEach(difficulty => {
      const difficultyStats = stats.get(difficulty);
      if (difficultyStats) {
        userStatsData.gamesPlayed += difficultyStats.gamesPlayed;
        userStatsData.wins += difficultyStats.gamesWon;
        userStatsData.bestScores.push({
          difficulty,
          score: difficultyStats.bestScore
        });
        userStatsData.averageScores.push({
          difficulty,
          score: difficultyStats.averageScore
        });
      }
    });

    userStatsData.losses = userStatsData.gamesPlayed - userStatsData.wins;
    userStatsData.winRate = userStatsData.gamesPlayed > 0 
      ? (userStatsData.wins / userStatsData.gamesPlayed) * 100 
      : 0;

    setUserStats(userStatsData);
  }, [stats]);

  const formatDate = (timestamp: Date) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const getDifficultyDisplayName = (difficulty: string) => {
    const names: { [key: string]: string } = {
      easy: 'Easy',
      classic: 'Classic',
      medium: 'Medium',
      hard: 'Hard',
      expert: 'Expert'
    };
    return names[difficulty] || difficulty;
  };

  const entriesPerPage = 10;
  const totalPages = Math.ceil(leaderboardData.length / entriesPerPage);
  const startIndex = currentPage * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const currentEntries = leaderboardData.slice(startIndex, endIndex);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column',
      color: 'white',
      zIndex: 1000
    }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid rgba(255,255,255,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
          🏆 Leaderboard
        </h1>
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          ← Back
        </button>
      </div>

      {/* Difficulty Filter */}
      <div style={{
        padding: '20px',
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap'
      }}>
        {difficulties.map(difficulty => (
          <button
            key={difficulty}
            onClick={() => setSelectedDifficulty(difficulty)}
            style={{
              background: selectedDifficulty === difficulty 
                ? 'rgba(255,255,255,0.3)' 
                : 'rgba(255,255,255,0.1)',
              border: 'none',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'background 0.2s'
            }}
          >
            {getDifficultyDisplayName(difficulty)}
          </button>
        ))}
      </div>

      {/* User Statistics */}
      <div style={{
        padding: '0 20px 20px',
        background: 'rgba(255,255,255,0.1)',
        margin: '0 20px',
        borderRadius: '8px'
      }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>📊 Your Statistics</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '15px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{userStats.gamesPlayed}</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>Games Played</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{userStats.wins}</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>Wins</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{userStats.losses}</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>Losses</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{userStats.winRate.toFixed(1)}%</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>Win Rate</div>
          </div>
        </div>
        
        {/* Best Scores */}
        <div style={{ marginTop: '15px' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>🏆 Best Scores</h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '10px'
          }}>
            {userStats.bestScores.map(score => (
              <div key={score.difficulty} style={{
                background: 'rgba(255,255,255,0.1)',
                padding: '8px',
                borderRadius: '6px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>
                  {getDifficultyDisplayName(score.difficulty)}
                </div>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                  {score.score}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div style={{
        flex: 1,
        padding: '0 20px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ margin: '0 0 15px 0' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>
            🏅 {getDifficultyDisplayName(selectedDifficulty)} Leaderboard
          </h3>
          {lastUpdated && (
            <div style={{ 
              fontSize: '12px', 
              opacity: 0.7,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>
                {dataSource === 'aws' ? '☁️' : '📱'} 
                Last updated: {lastUpdated.toLocaleDateString()} at {lastUpdated.toLocaleTimeString()}
              </span>
              <span style={{ 
                padding: '2px 6px', 
                background: dataSource === 'aws' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                borderRadius: '4px',
                fontSize: '10px'
              }}>
                {dataSource === 'aws' ? 'AWS' : 'Local'}
              </span>
            </div>
          )}
        </div>
        
        <div style={{
          flex: 1,
          overflow: 'auto',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '8px',
          padding: '10px'
        }}>
          {currentEntries.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              opacity: 0.7
            }}>
              No scores yet for {getDifficultyDisplayName(selectedDifficulty)}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {currentEntries.map((entry, index) => (
                <div
                  key={entry.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      fontWeight: 'bold',
                      fontSize: '16px',
                      minWidth: '30px'
                    }}>
                      #{startIndex + index + 1}
                    </span>
                    <span style={{ fontWeight: '500' }}>{entry.playerName}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                      {entry.score}
                    </span>
                    <span style={{ fontSize: '12px', opacity: 0.7 }}>
                      {formatDate(entry.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '10px',
            padding: '15px 0'
          }}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              style={{
                background: currentPage === 0 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '6px',
                cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              ← Prev
            </button>
            <span style={{ padding: '8px 12px', fontSize: '14px' }}>
              {currentPage + 1} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage === totalPages - 1}
              style={{
                background: currentPage === totalPages - 1 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '6px',
                cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardScreen; 