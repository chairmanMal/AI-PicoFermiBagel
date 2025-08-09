// Chess piece images for different seat positions
export const getChessPieceForSeat = (seatIndex: number): string => {
  const chessPieces = [
    '/chess-pieces/king.png',    // Seat 0 - Top (King for current player)
    '/chess-pieces/rook.png',    // Seat 1 - Right (Rook)
    '/chess-pieces/bishop.png',  // Seat 2 - Bottom (Bishop)
    '/chess-pieces/knight.png'   // Seat 3 - Left (Knight)
  ];
  
  return chessPieces[seatIndex] || chessPieces[0];
};

// Get chess piece for current player (always king)
export const getCurrentPlayerChessPiece = (): string => {
  return '/chess-pieces/king.png';
};

// Get chess piece for other players based on seat
export const getOtherPlayerChessPiece = (seatIndex: number): string => {
  const otherPieces = [
    '/chess-pieces/rook.png',    // Seat 0 - Rook
    '/chess-pieces/bishop.png',  // Seat 1 - Bishop  
    '/chess-pieces/knight.png',  // Seat 2 - Knight
    '/chess-pieces/queen.png'    // Seat 3 - Queen
  ];
  
  return otherPieces[seatIndex] || otherPieces[0];
}; 