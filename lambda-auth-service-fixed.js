const AWS = require('aws-sdk');
const crypto = require('crypto');

// Configure AWS
AWS.config.update({ region: 'us-east-1' });
const dynamodb = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = 'pfb-user-profiles';

// Hash password for secure storage
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Verify password against stored hash
function verifyPassword(password, storedHash) {
  const hashedPassword = hashPassword(password);
  return hashedPassword === storedHash;
}

exports.handler = async (event) => {
  console.log('🔧 Auth Service: Received event:', JSON.stringify(event, null, 2));

  try {
    // Extract operation from input object (matches your current schema format)
    const { input } = event;
    const operation = input.operation;
    
    console.log('🔧 Auth Service: Operation:', operation);
    console.log('🔧 Auth Service: Input:', JSON.stringify(input, null, 2));

    if (operation === 'registerUserWithPassword') {
      return await handleRegistration(input);
    } else if (operation === 'loginUser') {
      return await handleLogin(input);
    } else {
      throw new Error(`Unknown operation: ${operation}`);
    }
  } catch (error) {
    console.error('🔧 Auth Service: Error:', error);
    return {
      success: false,
      message: 'Authentication service error',
      suggestions: ['Try again', 'Contact support if problem persists']
    };
  }
};

async function handleRegistration(input) {
  const { username, password, deviceId, timestamp } = input;

  if (!username || !password || !deviceId) {
    return {
      success: false,
      message: 'Missing required fields',
      suggestions: ['Please provide username, password, and device ID']
    };
  }

  // Check if username already exists
  try {
    const existingUser = await dynamodb.get({
      TableName: TABLE_NAME,
      Key: { username }
    }).promise();

    if (existingUser.Item) {
      return {
        success: false,
        message: 'Username already exists',
        suggestions: ['Choose a different username', 'Try signing in instead']
      };
    }
  } catch (error) {
    console.error('🔧 Auth Service: Error checking existing user:', error);
    return {
      success: false,
      message: 'Database error during registration',
      suggestions: ['Try again', 'Contact support if problem persists']
    };
  }

  // Create new user with hashed password
  const hashedPassword = hashPassword(password);
  const userProfile = {
    username,
    deviceId,
    passwordHash: hashedPassword,
    createdAt: timestamp || new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    gamesPlayed: 0,
    bestScore: 0,
    averageScore: 0
  };

  try {
    await dynamodb.put({
      TableName: TABLE_NAME,
      Item: userProfile
    }).promise();

    console.log('🔧 Auth Service: User registered successfully:', username);

    return {
      success: true,
      user: {
        username: userProfile.username,
        deviceId: userProfile.deviceId,
        createdAt: userProfile.createdAt,
        lastLogin: userProfile.lastLogin,
        gamesPlayed: userProfile.gamesPlayed,
        bestScore: userProfile.bestScore,
        averageScore: userProfile.averageScore
      },
      message: 'Registration successful',
      suggestions: ['Welcome! You can now sign in']
    };
  } catch (error) {
    console.error('🔧 Auth Service: Error creating user:', error);
    return {
      success: false,
      message: 'Database error during registration',
      suggestions: ['Try again', 'Contact support if problem persists']
    };
  }
}

async function handleLogin(input) {
  const { username, password, deviceId } = input;

  if (!username || !password) {
    return {
      success: false,
      message: 'Missing required fields',
      suggestions: ['Please provide username and password']
    };
  }

  try {
    // Get user from database
    const result = await dynamodb.get({
      TableName: TABLE_NAME,
      Key: { username }
    }).promise();

    if (!result.Item) {
      return {
        success: false,
        message: 'Username not found',
        suggestions: ['Check your username', 'Try signing up instead']
      };
    }

    const user = result.Item;

    // Verify password
    if (!verifyPassword(password, user.passwordHash)) {
      return {
        success: false,
        message: 'Invalid password',
        suggestions: ['Check your password', 'Try again']
      };
    }

    // Update last login and device ID
    const updatedUser = {
      ...user,
      lastLogin: new Date().toISOString(),
      deviceId: deviceId || user.deviceId
    };

    await dynamodb.put({
      TableName: TABLE_NAME,
      Item: updatedUser
    }).promise();

    console.log('🔧 Auth Service: User logged in successfully:', username);

    return {
      success: true,
      user: {
        username: updatedUser.username,
        deviceId: updatedUser.deviceId,
        createdAt: updatedUser.createdAt,
        lastLogin: updatedUser.lastLogin,
        gamesPlayed: updatedUser.gamesPlayed,
        bestScore: updatedUser.bestScore,
        averageScore: updatedUser.averageScore
      },
      message: 'Login successful',
      suggestions: ['Welcome back!']
    };
  } catch (error) {
    console.error('🔧 Auth Service: Error during login:', error);
    return {
      success: false,
      message: 'Database error during login',
      suggestions: ['Try again', 'Contact support if problem persists']
    };
  }
} 