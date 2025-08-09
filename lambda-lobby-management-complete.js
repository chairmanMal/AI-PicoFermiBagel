const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

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

// ===== LOBBY MANAGEMENT =====

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

async function handleLeaveLobby(event) {
  const { difficulty, username, deviceId } = event.input || event.payload?.input || {};
  
  if (!difficulty || !deviceId) {
    throw new Error('Difficulty and deviceId are required');
  }

  console.log(`Player ${username} leaving ${difficulty} lobby`);

  try {
    // Get current lobby state
    const lobbyParams = {
      TableName: 'pfb-lobby-management',
      Key: { difficulty }
    };

    const lobbyResult = await dynamodb.get(lobbyParams).promise();
    if (!lobbyResult.Item) {
      return {
        success: true,
        message: 'Lobby does not exist'
      };
    }

    let lobby = lobbyResult.Item;

    // Remove player
    lobby.players = lobby.players.filter(p => p.deviceId !== deviceId);

    // Cancel countdown if less than 2 players
    if (lobby.players.length < 2) {
      lobby.countdown = null;
      lobby.countdownStartTime = null;
    }

    lobby.lastUpdated = new Date().toISOString();

    // Save updated lobby
    await dynamodb.put({
      TableName: 'pfb-lobby-management',
      Item: lobby
    }).promise();

    // Publish lobby update
    await publishLobbyUpdate(difficulty, lobby);

    return {
      success: true,
      message: `Successfully left ${difficulty} lobby`
    };

  } catch (error) {
    console.error('Error leaving lobby:', error);
    throw error;
  }
}

async function handleGetLobbyStatus(event) {
  const { difficulty } = event.input || event.payload?.input || {};
  
  if (!difficulty) {
    throw new Error('Difficulty is required');
  }

  try {
    const lobbyParams = {
      TableName: 'pfb-lobby-management',
      Key: { difficulty }
    };

    const result = await dynamodb.get(lobbyParams).promise();
    const lobby = result.Item || {
      difficulty,
      players: [],
      gameId: null,
      countdown: null,
      gameActive: false
    };

    return {
      difficulty: lobby.difficulty,
      playersWaiting: lobby.players.length,
      players: lobby.players.map(p => ({
        username: p.username,
        joinedAt: p.joinedAt,
        seatIndex: p.seatIndex
      })),
      gameId: lobby.gameId,
      countdown: lobby.countdown
    };

  } catch (error) {
    console.error('Error getting lobby status:', error);
    throw error;
  }
}

async function handleStartGame(event) {
  const { gameId, difficulty, players, gameSettings, randomSeed } = event.input || event.payload?.input || {};
  
  console.log(`Starting game ${gameId} for difficulty ${difficulty}`);

  try {
    // Update lobby to mark game as active
    const lobby = {
      difficulty,
      players: [],
      gameId,
      countdown: null,
      gameActive: true,
      gameSettings,
      randomSeed,
      gameStartTime: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    await dynamodb.put({
      TableName: 'pfb-lobby-management',
      Item: lobby
    }).promise();

    // Publish game start event
    await publishGameStart(gameId, difficulty, players, gameSettings, randomSeed);

    return {
      success: true,
      gameId,
      message: 'Game started successfully'
    };

  } catch (error) {
    console.error('Error starting game:', error);
    throw error;
  }
}

// ===== SUBSCRIPTION HANDLERS =====

async function handleLobbySubscription(event) {
  const { difficulty } = event.input || event.payload?.input || {};
  
  try {
    const lobbyStatus = await handleGetLobbyStatus({ input: { difficulty } });
    return lobbyStatus;
  } catch (error) {
    console.error('Error in lobby subscription:', error);
    return {
      difficulty: difficulty || 'unknown',
      playersWaiting: 0,
      players: [],
      gameId: null,
      countdown: null
    };
  }
}

async function handleGameStartSubscription(event) {
  // This would return game start events for a specific device
  const { deviceId } = event.input || event.payload?.input || {};
  
  // For now, return empty - this would be populated by publishGameStart
  return {
    gameId: null,
    difficulty: null,
    players: [],
    gameSettings: null,
    randomSeed: null
  };
}

// ===== INTEREST TRACKING (existing code) =====

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
    await publishDifficultyInterestUpdate();

    return {
      success: true,
      message: `Successfully updated interest for ${difficulty}`,
      newInterestCount: result.Attributes.interestCount
    };
  } catch (error) {
    console.error('Error updating difficulty interest:', error);
    throw error;
  }
}

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

async function handleHeartbeat(event) {
  const { deviceId, difficulty, username } = event.input || event.payload?.input || {};
  
  if (!deviceId || !difficulty) {
    throw new Error('DeviceId and difficulty are required for heartbeat');
  }

  console.log(`Processing heartbeat for device ${deviceId} on difficulty ${difficulty}`);
  
  try {
    await updateDeviceHeartbeat(deviceId, difficulty, username);
    return { success: true, message: 'Heartbeat processed successfully' };
  } catch (error) {
    console.error('Error processing heartbeat:', error);
    return { success: false, message: 'Failed to process heartbeat' };
  }
}

async function handleCleanupStaleInterests() {
  console.log('Cleaning up stale interests...');
  
  try {
    const heartbeatParams = {
      TableName: 'pfb-device-heartbeats',
      ProjectionExpression: 'deviceId, difficulty, lastHeartbeat'
    };

    const heartbeats = await dynamodb.scan(heartbeatParams).promise();
    const now = new Date();
    const staleThreshold = new Date(now.getTime() - (3 * 60 * 1000)); // 3 minutes

    const difficultyCounts = {};
    const activeDevices = new Set();

    if (heartbeats.Items) {
      heartbeats.Items.forEach(item => {
        const lastHeartbeat = new Date(item.lastHeartbeat);
        if (lastHeartbeat > staleThreshold) {
          difficultyCounts[item.difficulty] = (difficultyCounts[item.difficulty] || 0) + 1;
          activeDevices.add(item.deviceId);
        }
      });
    }

    // Update interest counts
    for (const [difficulty, activeCount] of Object.entries(difficultyCounts)) {
      const params = {
        TableName: 'pfb-difficulty-interest',
        Key: { difficulty },
        UpdateExpression: 'SET interestCount = :count, lastUpdated = :timestamp',
        ExpressionAttributeValues: {
          ':count': activeCount,
          ':timestamp': new Date().toISOString()
        },
        ReturnValues: 'ALL_NEW'
      };

      await dynamodb.update(params).promise();
      console.log(`Updated ${difficulty} to ${activeCount} active devices`);
    }

    // Remove stale heartbeats
    if (heartbeats.Items) {
      for (const item of heartbeats.Items) {
        const lastHeartbeat = new Date(item.lastHeartbeat);
        if (lastHeartbeat <= staleThreshold) {
          const deleteParams = {
            TableName: 'pfb-device-heartbeats',
            Key: { deviceId: item.deviceId }
          };

          await dynamodb.delete(deleteParams).promise();
          console.log(`Removed stale heartbeat for device ${item.deviceId}`);
        }
      }
    }

    await publishDifficultyInterestUpdate();

    return { 
      success: true, 
      message: `Cleanup completed. Active devices: ${activeDevices.size}`, 
      activeDevices: Array.from(activeDevices) 
    };
  } catch (error) {
    console.error('Error during cleanup:', error);
    return { success: false, message: 'Failed to cleanup stale interests' };
  }
}

async function handleRemoveDifficultyInterest(event) {
  const { deviceId, difficulty, username } = event.input || event.payload?.input || {};
  
  if (!deviceId || !difficulty) {
    throw new Error('DeviceId and difficulty are required for removing interest');
  }

  console.log(`Removing difficulty interest for device ${deviceId} on difficulty ${difficulty}`);
  
  try {
    // Remove heartbeat
    const deleteHeartbeatParams = {
      TableName: 'pfb-device-heartbeats',
      Key: { deviceId }
    };

    await dynamodb.delete(deleteHeartbeatParams).promise();
    console.log(`Removed heartbeat for device ${deviceId}`);

    // Decrement interest count
    const params = {
      TableName: 'pfb-difficulty-interest',
      Key: { difficulty },
      UpdateExpression: 'SET interestCount = interestCount - :dec, lastUpdated = :timestamp',
      ExpressionAttributeValues: {
        ':dec': 1,
        ':timestamp': new Date().toISOString()
      },
      ConditionExpression: 'attribute_exists(interestCount) AND interestCount > :zero',
      ReturnValues: 'ALL_NEW'
    };

    const result = await dynamodb.update(params).promise();
    console.log(`Updated ${difficulty} interest count to ${result.Attributes.interestCount}`);

    await publishDifficultyInterestUpdate();

    return { 
      success: true, 
      message: `Successfully removed interest for ${difficulty}`, 
      newInterestCount: result.Attributes.interestCount 
    };
  } catch (error) {
    console.error('Error removing difficulty interest:', error);
    
    if (error.code === 'ConditionalCheckFailedException') {
      console.log(`Interest count for ${difficulty} was already 0`);
      return { success: true, message: `Interest count for ${difficulty} was already 0`, newInterestCount: 0 };
    }

    return { success: false, message: 'Failed to remove difficulty interest' };
  }
}

// ===== HELPER FUNCTIONS =====

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

async function publishLobbyUpdate(difficulty, lobby) {
  console.log(`Publishing lobby update for ${difficulty}:`, lobby);
  
  // This would trigger the subscription in a real implementation
  // For now, we just log it
  return {
    difficulty: lobby.difficulty,
    playersWaiting: lobby.players.length,
    gameId: lobby.gameId,
    countdown: lobby.countdown,
    players: lobby.players.map(p => ({
      username: p.username,
      joinedAt: p.joinedAt,
      seatIndex: p.seatIndex
    }))
  };
}

async function publishGameStart(gameId, difficulty, players, gameSettings, randomSeed) {
  console.log(`Publishing game start for ${gameId}:`, { difficulty, players, gameSettings, randomSeed });
  
  // This would trigger the game start subscription
  return {
    gameId,
    difficulty,
    players,
    gameSettings,
    randomSeed
  };
}

async function publishDifficultyInterestUpdate() {
  console.log('Publishing difficulty interest update');
  
  try {
    const updateData = await handleDifficultyInterestSubscription();
    console.log('Difficulty interest update data:', updateData);
    return updateData;
  } catch (error) {
    console.error('Error publishing difficulty interest update:', error);
    throw error;
  }
} 