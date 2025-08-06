// src/components/MultiplayerGameProgress.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Timer, 
  Trophy, 
  Target, 
  UserX,
  Crown
} from 'lucide-react';
import { PlayerProgress } from '../services/multiplayerService';

interface MultiplayerGameProgressProps {
  players: PlayerProgress[];
  gameTimeElapsed: number;
  currentUsername: string;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

export const MultiplayerGameProgress: React.FC<MultiplayerGameProgressProps> = ({
  players,
  gameTimeElapsed,
  currentUsername,
  isVisible,
  onToggleVisibility
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const sortedPlayers = [...players].sort((a, b) => {
    // Sort by active status first, then by score
    if (a.active !== b.active) {
      return a.active ? -1 : 1;
    }
    return b.score - a.score;
  });

  const currentPlayer = players.find(p => p.username === currentUsername);
  const activePlayers = players.filter(p => p.active);
  const leader = activePlayers.length > 0 
    ? activePlayers.reduce((leader, player) => 
        player.score > leader.score ? player : leader
      )
    : null;

  if (!isVisible) {
    // Collapsed view - just a toggle button
    return (
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed top-4 right-4 z-40"
      >
        <button
          onClick={onToggleVisibility}
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          title="Show player progress"
        >
          <Users className="w-5 h-5" />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="fixed top-4 right-4 bg-white rounded-xl shadow-2xl border border-gray-200 z-40 w-80 max-h-96 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <span className="font-semibold">Multiplayer Game</span>
          </div>
          <button
            onClick={onToggleVisibility}
            className="text-white hover:text-gray-200 transition-colors"
          >
            ×
          </button>
        </div>
        
        <div className="flex items-center gap-4 mt-2 text-sm">
          <div className="flex items-center gap-1">
            <Timer className="w-4 h-4" />
            <span>{formatTime(gameTimeElapsed)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="w-4 h-4" />
            <span>{activePlayers.length} active</span>
          </div>
        </div>
      </div>

      {/* Players List */}
      <div className="p-4 max-h-80 overflow-y-auto">
        <div className="space-y-3">
          <AnimatePresence>
            {sortedPlayers.map((player, index) => {
              const isCurrentUser = player.username === currentUsername;
              const isLeader = leader && player.username === leader.username && player.active;
              const rank = activePlayers
                .sort((a, b) => b.score - a.score)
                .findIndex(p => p.username === player.username) + 1;

              return (
                <motion.div
                  key={player.username}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-3 rounded-lg border transition-all ${
                    isCurrentUser
                      ? 'border-blue-300 bg-blue-50'
                      : player.active
                      ? 'border-gray-200 bg-white'
                      : 'border-gray-100 bg-gray-50 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {/* Rank/Status Icon */}
                      <div className="flex-shrink-0">
                        {!player.active ? (
                          <UserX className="w-4 h-4 text-gray-400" />
                        ) : isLeader ? (
                          <Crown className="w-4 h-4 text-yellow-500" />
                        ) : (
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                            rank === 2 ? 'bg-gray-100 text-gray-700' :
                            rank === 3 ? 'bg-orange-100 text-orange-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {rank}
                          </div>
                        )}
                      </div>

                      {/* Player Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className={`font-medium truncate ${
                            isCurrentUser ? 'text-blue-700' : 'text-gray-800'
                          }`}>
                            {isCurrentUser ? 'You' : player.username}
                          </span>
                          {!player.active && (
                            <span className="text-xs text-gray-500 italic">
                              (inactive)
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                          <span className="flex items-center gap-1">
                            <Trophy className="w-3 h-3" />
                            {player.score}
                          </span>
                          <span>{player.guesses} guess{player.guesses !== 1 ? 'es' : ''}</span>
                        </div>
                      </div>
                    </div>

                    {/* Score */}
                    <div className={`text-right ${
                      player.active ? 'text-gray-800' : 'text-gray-500'
                    }`}>
                      <div className="font-bold text-lg">
                        {player.score}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {player.active && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((player.score / 100) * 100, 100)}%` }}
                          transition={{ duration: 0.5 }}
                          className={`h-1.5 rounded-full ${
                            isCurrentUser
                              ? 'bg-blue-500'
                              : isLeader
                              ? 'bg-yellow-500'
                              : 'bg-gray-400'
                          }`}
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Quick Stats */}
        {currentPlayer && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="text-center text-sm text-gray-600">
              <div className="font-medium">Your Position</div>
              <div className="text-xs mt-1">
                {currentPlayer.active 
                  ? `${activePlayers.sort((a, b) => b.score - a.score).findIndex(p => p.username === currentUsername) + 1} of ${activePlayers.length} active players`
                  : 'Game completed'
                }
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};