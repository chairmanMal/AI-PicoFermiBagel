const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  
  const operation = event.operation || event.payload?.operation;
  
  try {
    switch (operation) {
      case 'updateDifficultyInterestWithNotification':
        return await handleUpdateDifficultyInterest(event);
      
      case 'getDifficultyInterestCounts':
        return await handleGetDifficultyInterestCounts();
      
      case 'onDifficultyInterestUpdate': // New handler for subscription
        return await handleDifficultyInterestSubscription();
      
      case 'sendHeartbeat':
        return await handleHeartbeat(event);
      
      case 'removeDifficultyInterest':
        return await handleRemoveDifficultyInterest(event);
      
      case 'cleanupStaleInterests':
        return await handleCleanupStaleInterests();
      
      case 'joinLobby':
        return await handleJoinLobby(event);
      
      case 'leaveLobby':
        return await handleLeaveLobby(event);
      
      case 'startGame':
        return await handleStartGame(event);
      
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

async function handleUpdateDifficultyInterest(event) {
  const { difficulty, deviceId, username } = event.input || event.payload?.input || {};
  
  if (!difficulty) {
    throw new Error('Difficulty is required');
  }
  
  console.log(`Updating difficulty interest: ${difficulty}, deviceId: ${deviceId}, username: ${username}`);
  
  try {
    // For now, we'll always increment when this mutation is called
    // In a more sophisticated implementation, you might track individual user interests
    // and determine increment/decrement based on current state
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
    
    // Also track this device's heartbeat
    await updateDeviceHeartbeat(deviceId, difficulty, username);
    
    // Publish subscription update
    await publishDifficultyInterestUpdate();
    
    return {
      success: true,
      message: `Successfully incremented interest for ${difficulty}`,
      newInterestCount: result.Attributes.interestCount
    };
    
  } catch (error) {
    console.error('Error updating difficulty interest:', error);
    return {
      success: false,
      message: `Failed to update interest for ${difficulty}`,
      newInterestCount: 0
    };
  }
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

async function handleHeartbeat(event) {
  const { deviceId, difficulty, username } = event.input || event.payload?.input || {};
  
  if (!deviceId || !difficulty) {
    throw new Error('DeviceId and difficulty are required for heartbeat');
  }
  
  console.log(`Processing heartbeat for device ${deviceId} on difficulty ${difficulty}`);
  
  try {
    await updateDeviceHeartbeat(deviceId, difficulty, username);
    
    return {
      success: true,
      message: 'Heartbeat processed successfully'
    };
  } catch (error) {
    console.error('Error processing heartbeat:', error);
    return {
      success: false,
      message: 'Failed to process heartbeat'
    };
  }
}

async function handleRemoveDifficultyInterest(event) {
  const { deviceId, difficulty, username } = event.input || event.payload?.input || {};
  
  if (!deviceId || !difficulty) {
    throw new Error('DeviceId and difficulty are required for removing interest');
  }
  
  console.log(`Removing difficulty interest for device ${deviceId} on difficulty ${difficulty}`);
  
  try {
    // Remove the device's heartbeat record
    const deleteHeartbeatParams = {
      TableName: 'pfb-device-heartbeats',
      Key: { deviceId }
    };
    
    await dynamodb.delete(deleteHeartbeatParams).promise();
    console.log(`Removed heartbeat for device ${deviceId}`);
    
    // Decrement the difficulty interest count
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
    
    // Publish subscription update
    await publishDifficultyInterestUpdate();
    
    return {
      success: true,
      message: `Successfully removed interest for ${difficulty}`,
      newInterestCount: result.Attributes.interestCount
    };
    
  } catch (error) {
    console.error('Error removing difficulty interest:', error);
    
    // If the condition fails (count already 0), that's okay
    if (error.code === 'ConditionalCheckFailedException') {
      console.log(`Interest count for ${difficulty} was already 0`);
      return {
        success: true,
        message: `Interest count for ${difficulty} was already 0`,
        newInterestCount: 0
      };
    }
    
    return {
      success: false,
      message: 'Failed to remove difficulty interest'
    };
  }
}

async function handleCleanupStaleInterests() {
  console.log('Cleaning up stale interests...');
  
  try {
    // Get all device heartbeats
    const heartbeatParams = {
      TableName: 'pfb-device-heartbeats',
      ProjectionExpression: 'deviceId, difficulty, lastHeartbeat'
    };
    
    const heartbeats = await dynamodb.scan(heartbeatParams).promise();
    const now = new Date();
    const staleThreshold = new Date(now.getTime() - (3 * 60 * 1000)); // 3 minutes
    
    // Group by difficulty and count active devices
    const difficultyCounts = {};
    const activeDevices = new Set();
    
    if (heartbeats.Items) {
      heartbeats.Items.forEach(item => {
        const lastHeartbeat = new Date(item.lastHeartbeat);
        if (lastHeartbeat > staleThreshold) {
          // Device is active
          difficultyCounts[item.difficulty] = (difficultyCounts[item.difficulty] || 0) + 1;
          activeDevices.add(item.deviceId);
        }
      });
    }
    
    // Update difficulty interest counts based on active devices only
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
    
    // Clean up stale heartbeats
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
    
    // Publish subscription update
    await publishDifficultyInterestUpdate();
    
    return {
      success: true,
      message: `Cleanup completed. Active devices: ${activeDevices.size}`,
      activeDevices: Array.from(activeDevices)
    };
    
  } catch (error) {
    console.error('Error during cleanup:', error);
    return {
      success: false,
      message: 'Failed to cleanup stale interests'
    };
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
    
    // Return array format as expected by the schema
    const counts = [];
    if (result.Items) {
      result.Items.forEach(item => {
        counts.push({
          difficulty: item.difficulty,
          interestCount: item.interestCount,
          timestamp: item.lastUpdated || new Date().toISOString()
        });
      });
    }
    
    return counts;
    
  } catch (error) {
    console.error('Error getting difficulty interest counts:', error);
    throw error;
  }
}

async function handleDifficultyInterestSubscription() {
  console.log('Handling difficulty interest subscription');
  
  try {
    // Return current difficulty interest counts for subscription
    const counts = await handleGetDifficultyInterestCounts();
    
    // Return the array directly since handleGetDifficultyInterestCounts now returns array
    return counts;
    
  } catch (error) {
    console.error('Error in subscription handler:', error);
    // Return empty array instead of throwing to avoid null
    return [];
  }
}

async function publishDifficultyInterestUpdate() {
  console.log('Publishing difficulty interest update');
  
  try {
    // Get current counts (now returns array format)
    const counts = await handleGetDifficultyInterestCounts();
    
    // Note: In a real implementation, you would publish to AppSync subscriptions here
    // For now, we'll return the data and let AppSync handle the subscription
    console.log('Difficulty interest update data:', counts);
    
    return counts;
    
  } catch (error) {
    console.error('Error publishing difficulty interest update:', error);
    // Return empty array instead of throwing to avoid null
    return [];
  }
}

async function handleJoinLobby(event) {
  const { difficulty, username } = event.input || event.payload?.input || {};
  
  if (!difficulty || !username) {
    throw new Error('Difficulty and username are required');
  }
  
  console.log(`Player ${username} joining lobby for difficulty: ${difficulty}`);
  
  // Add player to lobby logic here
  // For now, just return success
  return {
    success: true,
    gameId: 'mock-game-id',
    playersWaiting: 1,
    message: 'Successfully joined lobby'
  };
}

async function handleLeaveLobby(event) {
  const { difficulty, username } = event.input || event.payload?.input || {};
  
  if (!difficulty || !username) {
    throw new Error('Difficulty and username are required');
  }
  
  console.log(`Player ${username} leaving lobby for difficulty: ${difficulty}`);
  
  // Remove player from lobby logic here
  // For now, just return success
  return {
    success: true,
    message: 'Successfully left lobby'
  };
}

async function handleStartGame(event) {
  const { gameId, difficulty, players, gameSettings, randomSeed } = event.input || event.payload?.input || {};
  
  if (!gameId || !difficulty || !players) {
    throw new Error('GameId, difficulty, and players are required');
  }
  
  console.log(`Starting game ${gameId} for difficulty: ${difficulty}`);
  
  // Start game logic here
  // For now, just return success
  return {
    success: true,
    gameId,
    message: 'Game started successfully'
  };
} 