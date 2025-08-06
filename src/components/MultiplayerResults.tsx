// src/components/MultiplayerResults.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Target, 
  UserX,
  Crown,
  Star
} from 'lucide-react';
import { PlayerRanking, LeaderboardEntry } from '../services/multiplayerService';

interface MultiplayerResultsProps {
  winner: string;
  rankings: PlayerRanking[];
  currentUsername: string;
  gameStats: {
    duration: number;
    totalGuesses: number;
    averageScore: number;
  };
  leaderboardData?: LeaderboardEntry[];
  newPersonalBest: boolean;
  onNewGame: () => void;
  onRematch?: () => void;
  onViewLeaderboard: () => void;
  onMainMenu: () => void;
}

export const MultiplayerResults: React.FC<MultiplayerResultsProps> = ({
  winner,
  rankings,
  currentUsername,
  gameStats,
  leaderboardData = [],
  newPersonalBest,
  onNewGame,
  onRematch,
  // onViewLeaderboard,
  onMainMenu
}) => {
  const [showLeaderboard, setShowLeaderboard] = React.useState(false);
  const [currentLeaderboardIndex, setCurrentLeaderboardIndex] = React.useState(0);

  const currentPlayerRank = rankings.find(r => r.username === currentUsername);
  const isWinner = winner === currentUsername;
  
  React.useEffect(() => {
    // Auto-scroll leaderboard
    if (showLeaderboard && leaderboardData.length > 0) {
      const interval = setInterval(() => {
        setCurrentLeaderboardIndex((prev) => 
          (prev + 1) % Math.min(leaderboardData.length, 10)
        );
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [showLeaderboard, leaderboardData.length]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <UserX className="w-6 h-6 text-gray-400" />;
      case 3:
        return <UserX className="w-6 h-6 text-orange-500" />;
      default:
        return <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">{rank}</div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 50 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className={`p-6 text-white ${
          isWinner 
            ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' 
            : 'bg-gradient-to-r from-blue-500 to-purple-600'
        }`}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="text-center"
          >
            <div className="flex justify-center mb-2">
              {isWinner ? (
                <Crown className="w-12 h-12" />
              ) : (
                <Trophy className="w-12 h-12" />
              )}
            </div>
            <h1 className="text-3xl font-bold mb-2">
              {isWinner ? '🎉 Victory!' : 'Game Complete'}
            </h1>
            <p className="text-lg opacity-90">
              {isWinner 
                ? 'Congratulations, you won!'
                : `${winner} won this round`
              }
            </p>
            
            {newPersonalBest && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-3 flex items-center justify-center gap-2 bg-white bg-opacity-20 rounded-lg px-4 py-2"
              >
                <Star className="w-5 h-5" />
                <span className="font-medium">New Personal Best!</span>
              </motion.div>
            )}
          </motion.div>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Current Player Stats */}
          {currentPlayerRank && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-50 rounded-xl p-4 mb-6"
            >
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Your Performance
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">#{currentPlayerRank.rank}</div>
                  <div className="text-sm text-gray-600">Rank</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{currentPlayerRank.score}</div>
                  <div className="text-sm text-gray-600">Score</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{currentPlayerRank.guesses}</div>
                  <div className="text-sm text-gray-600">Guesses</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">{formatTime(currentPlayerRank.timeElapsed)}</div>
                  <div className="text-sm text-gray-600">Time</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Final Rankings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-6"
          >
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <UserX className="w-5 h-5" />
              Final Rankings
            </h3>
            <div className="space-y-3">
              {rankings.map((player, index) => {
                const isCurrentUser = player.username === currentUsername;
                
                return (
                  <motion.div
                    key={player.username}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                      isCurrentUser 
                        ? 'border-blue-300 bg-blue-50' 
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {getRankIcon(player.rank)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 truncate">
                        {isCurrentUser ? 'You' : player.username}
                        {player.rank === 1 && <span className="ml-2 text-yellow-600">👑</span>}
                      </div>
                      <div className="text-sm text-gray-600">
                        {player.guesses} guesses • {formatTime(player.timeElapsed)}
                        {player.hints > 0 && ` • ${player.hints} hints`}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-800">{player.score}</div>
                      <div className="text-xs text-gray-500">points</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Game Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gray-50 rounded-xl p-4 mb-6"
          >
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <UserX className="w-5 h-5" />
              Game Statistics
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-blue-600">{formatTime(gameStats.duration)}</div>
                <div className="text-sm text-gray-600">Game Duration</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">{gameStats.totalGuesses}</div>
                <div className="text-sm text-gray-600">Total Guesses</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-600">{gameStats.averageScore}</div>
                <div className="text-sm text-gray-600">Avg Score</div>
              </div>
            </div>
          </motion.div>

          {/* Auto-scrolling Leaderboard */}
          {/* Removed AnimatePresence as it's not used for leaderboard */}
          {showLeaderboard && leaderboardData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-4 mb-6"
            >
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Global Leaderboard
              </h3>
              <div className="space-y-2">
                {leaderboardData.slice(currentLeaderboardIndex, currentLeaderboardIndex + 5).map((entry) => (
                  <motion.div
                    key={`${entry.rank}-${entry.timestamp}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between bg-white bg-opacity-20 rounded-lg px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold">#{entry.rank}</span>
                      <span>{entry.username}</span>
                    </div>
                    <span className="font-bold">{entry.score}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex gap-3">
            {onRematch && (
              <button
                onClick={onRematch}
                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <UserX className="w-4 h-4" />
                Rematch
              </button>
            )}
            
            <button
              onClick={onNewGame}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <UserX className="w-4 h-4" />
              New Game
            </button>
            
            <button
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              Leaderboard
            </button>
            
            <button
              onClick={onMainMenu}
              className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
            >
              <UserX className="w-4 h-4" />
              Menu
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};