// lambda-realtime-updates.js
// Lambda function for handling real-time multiplayer updates

const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const appsync = new AWS.AppSync();

const DIFFICULTY_INTEREST_TABLE = 'pfb-difficulty-interest';
const LOBBY_TABLE = 'pfb-lobby-status';
const USER_PROFILES_TABLE = 'pfb-user-profiles';

exports.handler = async (event) => {
  console.log('🎮 Real-time updates handler called with event:', JSON.stringify(event, null, 2));
  
  // Extract operation and input from AppSync resolver payload
  const { operation, input } = event.payload || event;
  
  console.log('🎮 Extracted operation:', operation);
  console.log('🎮 Extracted input:', JSON.stringify(input, null, 2));
  
  try {
    switch (operation) {
      case 'updateDifficultyInterest':
        return await handleDifficultyInterestUpdate(input);
      
      case 'joinLobby':
        return await handlePlayerJoinLobby(input);
      
      case 'leaveLobby':
        return await handlePlayerLeaveLobby(input);
      
      case 'startGame':
        return await handleGameStart(input);
      
      // Handle the "WithNotification" versions
      case 'updateDifficultyInterestWithNotification':
        return await handleDifficultyInterestUpdate(input);
      
      case 'joinLobbyWithNotification':
        return await handlePlayerJoinLobby(input);
      
      case 'leaveLobbyWithNotification':
        return await handlePlayerLeaveLobby(input);
      
      case 'startGameWithNotification':
        return await handleGameStart(input);
      
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  } catch (error) {
    console.error('🎮 Real-time updates handler error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

async function handleDifficultyInterestUpdate(input) {
  const { difficulty, deviceId, username, timestamp } = input;
  
  console.log(`🎮 Updating difficulty interest for ${difficulty} by ${username}`);
  
  try {
    // Get current lobby status to count actual players
    const lobbyParams = {
      TableName: LOBBY_TABLE,
      Key: { difficulty }
    };
    
    let lobbyResult = await dynamodb.get(lobbyParams).promise();
    let lobby = lobbyResult.Item || {
      difficulty,
      playersWaiting: 0,
      players: [],
      gameId: null,
      countdown: null
    };
    
    // Count actual players in lobby
    const actualPlayerCount = lobby.players.length;
    
    // Update difficulty interest count to match actual players
    const params = {
      TableName: DIFFICULTY_INTEREST_TABLE,
      Key: { difficulty },
      UpdateExpression: 'SET interestCount = :count, lastUpdated = :timestamp',
      ExpressionAttributeValues: {
        ':count': actualPlayerCount,
        ':timestamp': timestamp
      },
      ReturnValues: 'UPDATED_NEW'
    };
    
    const result = await dynamodb.update(params).promise();
    const newInterestCount = result.Attributes.interestCount;
    
    console.log(`🎮 Successfully updated difficulty interest. Actual players: ${actualPlayerCount}, New count: ${newInterestCount}`);
    
    return {
      success: true,
      message: 'Difficulty interest updated successfully',
      newInterestCount
    };
  } catch (error) {
    console.error('🎮 Error updating difficulty interest:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function handlePlayerJoinLobby(input) {
  const { difficulty, username, deviceId, timestamp } = input;
  
  console.log(`🎮 Player ${username} joining lobby for ${difficulty}`);
  
  try {
    // Get current lobby status
    const lobbyParams = {
      TableName: LOBBY_TABLE,
      Key: { difficulty }
    };
    
    let lobbyResult = await dynamodb.get(lobbyParams).promise();
    let lobby = lobbyResult.Item || {
      difficulty,
      playersWaiting: 0,
      players: [],
      gameId: null,
      countdown: null
    };
    
    // Check if player is already in lobby
    if (lobby.players.some(p => p.username === username)) {
      console.log(`🎮 Player ${username} already in lobby for ${difficulty}. No change.`);
      return {
        success: true,
        gameId: lobby.gameId,
        playersWaiting: lobby.playersWaiting,
        message: 'Player already in lobby'
      };
    }
  
    // Add player to lobby
    const newPlayer = {
      username,
      joinedAt: timestamp,
      seatIndex: lobby.players.length // Simple seat assignment
    };
    
    lobby.players.push(newPlayer);
    lobby.playersWaiting = lobby.players.length;
    
    // Update lobby in DynamoDB
    const updateParams = {
      TableName: LOBBY_TABLE,
      Item: lobby
    };
    
    await dynamodb.put(updateParams).promise();
    
    console.log(`🎮 Successfully added player ${username} to lobby. Total players: ${lobby.playersWaiting}`);
    
    // Also update difficulty interest count
    const interestParams = {
      TableName: DIFFICULTY_INTEREST_TABLE,
      Key: { difficulty },
      UpdateExpression: 'SET interestCount = :count, lastUpdated = :timestamp',
      ExpressionAttributeValues: {
        ':count': lobby.playersWaiting,
        ':timestamp': timestamp
      }
    };
    
    await dynamodb.update(interestParams).promise();
    console.log(`🎮 Updated difficulty interest count to ${lobby.playersWaiting} for ${difficulty}`);
    
    return {
      success: true,
      gameId: lobby.gameId,
      playersWaiting: lobby.playersWaiting,
      message: 'Successfully joined lobby'
    };
  } catch (error) {
    console.error('🎮 Error joining lobby:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function handlePlayerLeaveLobby(input) {
  const { difficulty, username, deviceId, timestamp } = input;
  
  console.log(`🎮 Player ${username} leaving lobby for ${difficulty}`);
  
  try {
    // Get current lobby status
    const lobbyParams = {
      TableName: LOBBY_TABLE,
      Key: { difficulty }
    };
    
    let lobbyResult = await dynamodb.get(lobbyParams).promise();
    let lobby = lobbyResult.Item;
    
    if (!lobby) {
      console.log(`🎮 Lobby for ${difficulty} not found when player ${username} tried to leave.`);
      return {
        success: false,
        message: 'Lobby not found'
      };
    }
    
    // Remove player from lobby
    const initialPlayerCount = lobby.players.length;
    lobby.players = lobby.players.filter(p => p.username !== username);
    lobby.playersWaiting = lobby.players.length;
  
    if (lobby.players.length === initialPlayerCount) {
      console.log(`🎮 Player ${username} not found in lobby for ${difficulty}. No change.`);
      return {
        success: true,
        message: 'Player not found in lobby, no change'
      };
    }
  
    // Update lobby in DynamoDB
    const updateParams = {
      TableName: LOBBY_TABLE,
      Item: lobby
    };
    
    await dynamodb.put(updateParams).promise();
    
    console.log(`🎮 Successfully removed player ${username} from lobby. Remaining players: ${lobby.playersWaiting}`);
    
    // Also update difficulty interest count
    const interestParams = {
      TableName: DIFFICULTY_INTEREST_TABLE,
      Key: { difficulty },
      UpdateExpression: 'SET interestCount = :count, lastUpdated = :timestamp',
      ExpressionAttributeValues: {
        ':count': lobby.playersWaiting,
        ':timestamp': timestamp
      }
    };
    
    await dynamodb.update(interestParams).promise();
    console.log(`🎮 Updated difficulty interest count to ${lobby.playersWaiting} for ${difficulty}`);
    
    return {
      success: true,
      message: 'Successfully left lobby'
    };
  } catch (error) {
    console.error('🎮 Error leaving lobby:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function handleGameStart(input) {
  const { difficulty, gameId, players, gameSettings, randomSeed } = input;
  
  console.log(`🎮 Starting game ${gameId} for ${difficulty}`);
  
  try {
    // Clear lobby for this difficulty after game starts
    const deleteLobbyParams = {
      TableName: LOBBY_TABLE,
      Key: { difficulty }
    };
    await dynamodb.delete(deleteLobbyParams).promise();
  
    console.log(`🎮 Successfully started game ${gameId} and cleared lobby for ${difficulty}`);
    
    return {
      success: true,
      gameId,
      message: 'Game started successfully'
    };
  } catch (error) {
    console.error('🎮 Error starting game:', error);
    return {
      success: false,
      error: error.message
    };
  }
} 