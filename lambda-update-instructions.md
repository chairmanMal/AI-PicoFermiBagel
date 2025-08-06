# Lambda Function Update Instructions

## Update the Lambda Function Code in AWS Console:

1. **Go to AWS Console → Lambda**
2. **Click on your `pfb-validateUsername` function**
3. **Go to the "Code" tab**
4. **Replace the existing code with this updated version:**

```javascript
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
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
    
    const result = await dynamodb.send(new GetCommand(params));
    
    if (result.Item) {
      // Username exists, generate suggestions
      const suggestions = generateSuggestions(username);
      return {
        available: false,
        message: 'The username you entered is not unique amongst the universe of PicoFermiBagel game players. Please select one previously used on this device from the list or choose a different name.',
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
```

5. **Click "Deploy"**

## Key Changes:
- **Updated error message** for non-unique usernames to be more specific and user-friendly
- **Removed redundant "Username not available:" prefix** from frontend error displays
- **Maintained suggestions functionality** for helpful alternatives

## Test the Update:
After updating the Lambda function, test it with:
```bash
aws lambda invoke --function-name pfb-validateUsername --payload '{"arguments":{"input":{"username":"admin","timestamp":"2024-01-01T00:00:00Z"}}}' response.json --region us-east-1 --cli-binary-format raw-in-base64-out
``` 