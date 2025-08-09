// Crown icons for different player states in multiplayer lobbies
export const getCrownForPlayer = (isCurrentPlayer: boolean, seatIndex: number): string => {
  // Gold crown for current player in their own lobby
  if (isCurrentPlayer) {
    return '/crown-icons/crown-gold.svg';
  }
  
  // Different colored crowns for other players
  const otherPlayerCrowns = [
    '/crown-icons/crown-silver.svg',  // Silver with blue gems
    '/crown-icons/crown-bronze.svg',  // Bronze with green gems
    '/crown-icons/crown-purple.svg'   // Purple with yellow gems
  ];
  
  return otherPlayerCrowns[seatIndex % otherPlayerCrowns.length];
};

// Get crown for current player (always gold)
export const getCurrentPlayerCrown = (): string => {
  return '/crown-icons/crown-gold.svg';
};

// Get crown for other players based on seat index
export const getOtherPlayerCrown = (seatIndex: number): string => {
  const otherPlayerCrowns = [
    '/crown-icons/crown-silver.svg',  // Seat 0 - Silver crown
    '/crown-icons/crown-bronze.svg',  // Seat 1 - Bronze crown  
    '/crown-icons/crown-purple.svg'   // Seat 2 - Purple crown
  ];
  
  return otherPlayerCrowns[seatIndex % otherPlayerCrowns.length];
};

// Legacy chess piece functions (deprecated - use crown functions instead)
export const getChessPieceForSeat = (seatIndex: number): string => {
  return getCrownForPlayer(false, seatIndex);
};

export const getCurrentPlayerChessPiece = (): string => {
  return getCurrentPlayerCrown();
};

export const getOtherPlayerChessPiece = (seatIndex: number): string => {
  return getOtherPlayerCrown(seatIndex);
}; 