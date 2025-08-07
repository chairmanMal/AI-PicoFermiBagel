// Chess piece SVG data URLs for lobby seats
export const chessPieces = {
  castle: `data:image/svg+xml;base64,${btoa(`
    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="28" width="24" height="8" fill="#8B4513" stroke="#654321" stroke-width="1"/>
      <rect x="12" y="20" width="4" height="8" fill="#8B4513" stroke="#654321" stroke-width="1"/>
      <rect x="24" y="20" width="4" height="8" fill="#8B4513" stroke="#654321" stroke-width="1"/>
      <rect x="16" y="16" width="8" height="4" fill="#8B4513" stroke="#654321" stroke-width="1"/>
      <rect x="14" y="12" width="12" height="4" fill="#8B4513" stroke="#654321" stroke-width="1"/>
      <rect x="16" y="8" width="8" height="4" fill="#8B4513" stroke="#654321" stroke-width="1"/>
      <rect x="18" y="4" width="4" height="4" fill="#8B4513" stroke="#654321" stroke-width="1"/>
    </svg>
  `)}`,
  
  bishop: `data:image/svg+xml;base64,${btoa(`
    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="32" r="6" fill="#8B4513" stroke="#654321" stroke-width="1"/>
      <path d="M 20 8 L 16 20 L 24 20 Z" fill="#8B4513" stroke="#654321" stroke-width="1"/>
      <rect x="18" y="20" width="4" height="12" fill="#8B4513" stroke="#654321" stroke-width="1"/>
      <circle cx="20" cy="6" r="2" fill="#8B4513" stroke="#654321" stroke-width="1"/>
    </svg>
  `)}`,
  
  king: `data:image/svg+xml;base64,${btoa(`
    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="32" r="6" fill="#FFD700" stroke="#B8860B" stroke-width="1"/>
      <rect x="18" y="20" width="4" height="12" fill="#FFD700" stroke="#B8860B" stroke-width="1"/>
      <path d="M 20 8 L 16 20 L 24 20 Z" fill="#FFD700" stroke="#B8860B" stroke-width="1"/>
      <rect x="19" y="4" width="2" height="4" fill="#FFD700" stroke="#B8860B" stroke-width="1"/>
      <rect x="17" y="6" width="6" height="2" fill="#FFD700" stroke="#B8860B" stroke-width="1"/>
    </svg>
  `)}`,
  
  horse: `data:image/svg+xml;base64,${btoa(`
    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="32" r="6" fill="#8B4513" stroke="#654321" stroke-width="1"/>
      <rect x="18" y="20" width="4" height="12" fill="#8B4513" stroke="#654321" stroke-width="1"/>
      <path d="M 20 8 Q 16 12 18 20 Q 22 12 20 8" fill="#8B4513" stroke="#654321" stroke-width="1"/>
      <circle cx="18" cy="10" r="1" fill="#654321"/>
    </svg>
  `)}`
};

// Get chess piece for seat index
export const getChessPieceForSeat = (seatIndex: number): string => {
  const pieces = [chessPieces.castle, chessPieces.bishop, chessPieces.king, chessPieces.horse];
  return pieces[seatIndex % pieces.length];
}; 