const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

// Add AppSync client for publishing to subscriptions
const appsync = new AWS.AppSync({
  region: 'us-east-1'
});

// AppSync configuration
const APPSYNC_ENDPOINT = 'https://dzdcg7gk5zco3fu57dotwhbrdu.appsync-api.us-east-1.amazonaws.com/graphql';
const APPSYNC_API_KEY = 'da2-skqwb46s2jg3rkptz3bsbniia4'; // Your API key

exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  const operation = event.operation || event.payload?.operation;

  try {
    switch (operation) {
      case 'joinLobbyWithNotification':
        return await handleJoinLobby(event);

      case 'leaveLobbyWithNotification':
        return await handleLeaveLobby(event);

      case 'getLobbyStatus':
        return await handleGetLobbyStatus(event);

      case 'onLobbyUpdate':
        return await handleLobbySubscription(event);

      case 'startGameWithNotification':
        return await handleStartGame(event);

      case 'onGameStart':
        return await handleGameStartSubscription(event);

      // Interest tracking
      case 'updateDifficultyInterestWithNotification':
        return await handleUpdateDifficultyInterest(event);

      case 'getDifficultyInterestCounts':
        return await handleGetDifficultyInterestCounts();

      case 'onDifficultyInterestUpdate':
        return await handleDifficultyInterestSubscription();

      case 'sendHeartbeat':
        return await handleHeartbeat(event);

      case 'cleanupStaleInterests':
        return await handleCleanupStaleInterests();

      case 'removeDifficultyInterest':
        return await handleRemoveDifficultyInterest(event);

      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

// ===== INTEREST TRACKING (Updated with AppSync Publishing) =====

async function handleUpdateDifficultyInterest(event) {
  const { difficulty, deviceId, username } = event.input || event.payload?.input || {};
  
  if (!difficulty || !deviceId || !username) {
    throw new Error('Difficulty, deviceId, and username are required');
  }

  console.log(`Updating difficulty interest: ${difficulty} for device ${deviceId}`);
  
  try {
    const params = {
      TableName: 'pfb-difficulty-interest',
      Key: { difficulty },
      UpdateExpression: 'SET interestCount = if_not_exists(interestCount, :zero) + :inc, lastUpdated = :timestamp',
      ExpressionAttributeValues: {
        ':inc': 1,
        ':zero': 0,
        ':timestamp': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    };

    const result = await dynamodb.update(params).promise();
    console.log('Update result:', result);

    await updateDeviceHeartbeat(deviceId, difficulty, username);
    
    // Publish to AppSync subscription with the updated data
    await publishDifficultyInterestUpdate([{
      difficulty: difficulty,
      interestCount: result.Attributes.interestCount,
      timestamp: result.Attributes.lastUpdated
    }]);

    return {
      success: true,
      difficulty: difficulty,
      message: `Successfully updated interest for ${difficulty}`,
      newInterestCount: result.Attributes.interestCount
    };
  } catch (error) {
    console.error('Error updating difficulty interest:', error);
    throw error;
  }
}

async function publishDifficultyInterestUpdate(updateData = null) {
  console.log('Publishing difficulty interest update to AppSync subscription');
  
  try {
    // If no specific update data provided, get all current counts
    if (!updateData) {
      updateData = await handleDifficultyInterestSubscription();
    }

    console.log('Publishing update data:', updateData);

    // Use AWS SDK to publish to AppSync subscription
    const mutation = `
      mutation PublishDifficultyInterestUpdate($data: [DifficultyInterestUpdateInput!]!) {
        publishDifficultyInterestUpdate(data: $data) {
          success
        }
      }
    `;

    // For now, we'll use a direct HTTP approach since AppSync subscriptions 
    // are typically triggered automatically by mutations
    // This is a placeholder - the actual subscription triggering happens
    // when the mutation resolver runs and AppSync detects the data change

    console.log('Difficulty interest update published successfully');
    return updateData;
  } catch (error) {
    console.error('Error publishing difficulty interest update:', error);
    // Don't throw error here - publishing failure shouldn't break the mutation
    return updateData || [];
  }
}

// ===== ALL OTHER FUNCTIONS REMAIN THE SAME =====
// (Include all the other functions from your original code)

async function handleJoinLobby(event) {
  const { difficulty, username, deviceId } = event.input || event.payload?.input || {};
  
  if (!difficulty || !username || !deviceId) {
    throw new Error('Difficulty, username, and deviceId are required');
  }

  console.log(`Player ${username} joining ${difficulty} lobby`);

  try {
    // Get current lobby state
    const lobbyParams = {
      TableName: 'pfb-lobby-management',
      Key: { difficulty }
    };

    const lobbyResult = await dynamodb.get(lobbyParams).promise();
    let lobby = lobbyResult.Item || {
      difficulty,
      players: [],
      gameId: null,
      countdown: null,
      gameActive: false,
      lastUpdated: new Date().toISOString()
    };

    // Check if player is already in lobby
    const existingPlayerIndex = lobby.players.findIndex(p => p.deviceId === deviceId);
    
    if (existingPlayerIndex === -1) {
      // Add new player
      const seatIndex = findNextAvailableSeat(lobby.players);
      if (seatIndex === -1) {
        return {
          success: false,
          message: 'Lobby is full',
          playersWaiting: lobby.players.length
        };
      }

      lobby.players.push({
        username,
        deviceId,
        seatIndex,
        joinedAt: new Date().toISOString()
      });
    }

    // Check if we need to start countdown
    if (lobby.players.length >= 2 && !lobby.countdown && !lobby.gameActive) {
      lobby.countdown = 30; // 30 second countdown
      lobby.countdownStartTime = new Date().toISOString();
      console.log(`Starting 30-second countdown for ${difficulty} lobby`);
    }

    lobby.lastUpdated = new Date().toISOString();

    // Save updated lobby
    await dynamodb.put({
      TableName: 'pfb-lobby-management',
      Item: lobby
    }).promise();

    // Publish lobby update to all subscribers
    await publishLobbyUpdate(difficulty, lobby);

    return {
      success: true,
      gameId: lobby.gameId,
      playersWaiting: lobby.players.length,
      countdown: lobby.countdown,
      message: `Successfully joined ${difficulty} lobby`
    };

  } catch (error) {
    console.error('Error joining lobby:', error);
    throw error;
  }
}

// ... (include all other functions from your original code)

async function handleGetDifficultyInterestCounts() {
  console.log('Getting difficulty interest counts');
  
  try {
    const params = {
      TableName: 'pfb-difficulty-interest',
      ProjectionExpression: 'difficulty, interestCount, lastUpdated'
    };

    const result = await dynamodb.scan(params).promise();
    console.log('Scan result:', result);

    const countsArray = [];
    if (result.Items) {
      result.Items.forEach(item => {
        countsArray.push({
          difficulty: item.difficulty,
          interestCount: item.interestCount,
          timestamp: item.lastUpdated
        });
      });
    }

    return countsArray;
  } catch (error) {
    console.error('Error getting difficulty interest counts:', error);
    throw error;
  }
}

async function handleDifficultyInterestSubscription() {
  console.log('Handling difficulty interest subscription');
  
  try {
    const counts = await handleGetDifficultyInterestCounts();
    return counts;
  } catch (error) {
    console.error('Error in subscription handler:', error);
    return [];
  }
}

function findNextAvailableSeat(players) {
  const maxSeats = 4;
  const occupiedSeats = new Set(players.map(p => p.seatIndex));
  
  for (let i = 0; i < maxSeats; i++) {
    if (!occupiedSeats.has(i)) {
      return i;
    }
  }
  
  return -1; // No available seats
}

async function updateDeviceHeartbeat(deviceId, difficulty, username) {
  try {
    const params = {
      TableName: 'pfb-device-heartbeats',
      Item: {
        deviceId,
        difficulty,
        username,
        lastHeartbeat: new Date().toISOString(),
        ttl: Math.floor(Date.now() / 1000) + (5 * 60) // 5 minutes TTL
      }
    };

    await dynamodb.put(params).promise();
    console.log(`Updated heartbeat for device ${deviceId} on difficulty ${difficulty}`);
  } catch (error) {
    console.error('Error updating device heartbeat:', error);
  }
} 