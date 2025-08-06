const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  try {
    const { username } = event.arguments.input;
    
    if (!username || username.trim() === '') {
      return {
        available: false,
        message: 'Username cannot be empty',
        suggestions: []
      };
    }
    
    // Check username format
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return {
        available: false,
        message: 'Username must be 3-20 characters, letters, numbers, hyphens, and underscores only',
        suggestions: []
      };
    }
    
    // Check if username exists in DynamoDB
    const params = {
      TableName: 'pfb-usernames',
      Key: {
        username: username.toLowerCase()
      }
    };
    
    const result = await dynamodb.get(params).promise();
    
    if (result.Item) {
      // Username exists, generate suggestions
      const suggestions = generateSuggestions(username);
      return {
        available: false,
        message: 'Username is already taken',
        suggestions: suggestions
      };
    }
    
    // Username is available
    return {
      available: true,
      message: 'Username is available',
      suggestions: []
    };
    
  } catch (error) {
    console.error('Error:', error);
    return {
      available: false,
      message: 'Validation failed due to server error',
      suggestions: []
    };
  }
};

function generateSuggestions(username) {
  const suggestions = [];
  const base = username.toLowerCase();
  
  // Add numbers
  for (let i = 1; i <= 5; i++) {
    suggestions.push(`${base}${i}`);
  }
  
  // Add common suffixes
  const suffixes = ['_', '1', '2', '2024', 'gamer', 'player'];
  suffixes.forEach(suffix => {
    suggestions.push(`${base}${suffix}`);
  });
  
  return suggestions.slice(0, 5); // Return max 5 suggestions
}
