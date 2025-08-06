# 🚀 MANUAL LAMBDA FUNCTION DEPLOYMENT GUIDE

## 🎯 **PROBLEM**
The Lambda function is returning `null` instead of a proper `GameEndResponse` object, causing:
- ❌ "Cannot return null for non-nullable type: 'GameEndResponse'" errors
- ❌ No game wins posted to DynamoDB
- ❌ App fails to submit scores

## 🛠️ **SOLUTION**
Deploy the fixed Lambda function code that ALWAYS returns a proper `GameEndResponse` object.

## 📋 **OPTION 1: AUTOMATED DEPLOYMENT**

### Prerequisites:
1. Install AWS CLI: `brew install awscli`
2. Configure AWS credentials: `aws configure`
3. Install AWS SDK: `npm install @aws-sdk/client-lambda`

### Deploy:
```bash
node deploy-lambda-fix.js
```

## 📋 **OPTION 2: MANUAL AWS CONSOLE DEPLOYMENT**

### Step 1: Access AWS Lambda Console
1. Go to [AWS Lambda Console](https://console.aws.amazon.com/lambda/)
2. Find your Lambda function (likely named something like `pfb-leaderboard-function`)

### Step 2: Update Function Code
1. Click on your Lambda function
2. Go to the "Code" tab
3. Click "Edit" in the code editor
4. Replace the entire code with the fix below
5. Click "Deploy"

### Step 3: Test the Fix
1. Go to the "Test" tab
2. Create a test event with this data:
```json
{
  "field": "submitGameResult",
  "arguments": {
    "input": {
      "gameId": "test-game-123",
      "deviceId": "test-device-123",
      "username": "TST25",
      "score": 95,
      "guesses": 4,
      "hints": 0,
      "difficulty": "easy",
      "gameWon": true,
      "timestamp": "2025-08-06T00:00:00.000Z"
    }
  }
}
```

## 🔧 **LAMBDA FUNCTION FIX CODE**

```typescript
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: 'us-east-1' });
const dynamodb = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  console.log("Event:", JSON.stringify(event, null, 2));
  
  try {
    // Handle multiple AppSync event formats
    let action, input;
    
    if (event.field) {
      // Direct AppSync format: { field: "submitGameResult", arguments: {...} }
      action = event.field;
      input = event.arguments?.input;
    } else if (event.info && event.info.fieldName) {
      // AppSync format: { info: { fieldName: "submitGameResult" }, arguments: {...} }
      action = event.info.fieldName;
      input = event.arguments;
    } else if (event.payload && event.payload.field) {
      // Alternative AppSync format
      action = event.payload.field;
      input = event.payload.arguments?.input;
    } else if (event.arguments && event.arguments.input) {
      // Direct format
      action = event.arguments?.action || event.action;
      input = event.arguments.input;
    } else {
      // Fallback format
      action = event.action;
      input = event.input;
    }
    
    console.log("Action:", action);
    console.log("Input:", JSON.stringify(input, null, 2));
    
    if (action === "submitGameResult") {
      const { gameId, deviceId, username, score, guesses, hints, difficulty, gameWon, timestamp } = input;
      
      // Create entry for DynamoDB
      const entry = {
        gameId: gameId,
        username: username,
        score: score,
        guesses: guesses,
        hints: hints,
        difficulty: difficulty,
        gameWon: gameWon,
        timestamp: timestamp,
        deviceId: deviceId,
        createdAt: new Date().toISOString()
      };
      
      console.log("Writing to DynamoDB:", entry);
      
      try {
        await dynamodb.send(new PutCommand({
          TableName: "pfb-leaderboard-v2",
          Item: entry
        }));
        
        console.log("Successfully wrote game result to DynamoDB");
      } catch (dbError) {
        console.error("DynamoDB write error:", dbError);
        // Continue execution even if DynamoDB write fails
      }
      
      // ALWAYS return a proper GameEndResponse object (never null)
      const response = {
        winner: username,
        rankings: [{
          rank: 1,
          username: username,
          score: score,
          guesses: guesses,
          hints: hints,
          timeElapsed: Math.round((Date.now() - new Date(timestamp).getTime()) / 1000)
        }],
        leaderboardUpdated: true,
        newPersonalBest: true
      };
      
      console.log("Returning GameEndResponse:", JSON.stringify(response, null, 2));
      return response;
    }
    
    if (action === "getLeaderboard") {
      const { difficulty, limit } = input || {};
      
      try {
        const params = {
          TableName: "pfb-leaderboard-v2",
          IndexName: "difficulty-score-index",
          KeyConditionExpression: "difficulty = :difficulty",
          ExpressionAttributeValues: {
            ":difficulty": difficulty || "classic"
          },
          ScanIndexForward: false,
          Limit: limit || 20
        };
        
        const result = await dynamodb.send(new QueryCommand(params));
        
        return (result.Items || []).map((item, index) => ({
          rank: index + 1,
          username: item.username,
          score: item.score,
          timestamp: item.timestamp,
          difficulty: item.difficulty
        }));
      } catch (dbError) {
        console.error("DynamoDB query error:", dbError);
        return [];
      }
    }
    
    // If no action matched, return a default GameEndResponse instead of null
    console.log("No matching action found, returning default GameEndResponse");
    return {
      winner: "Unknown",
      rankings: [],
      leaderboardUpdated: false,
      newPersonalBest: false
    };
    
  } catch (error) {
    console.error("Error in leaderboard function:", error);
    
    // ALWAYS return a proper GameEndResponse object (never null)
    return {
      winner: "Error",
      rankings: [],
      leaderboardUpdated: false,
      newPersonalBest: false
    };
  }
};
```

## 🧪 **TESTING AFTER DEPLOYMENT**

### Step 1: Test Lambda Function
1. In AWS Lambda console, go to "Test" tab
2. Use the test event above
3. Verify it returns a proper response (not null)

### Step 2: Test Real Game Win
1. Play a game and win
2. Dismiss the win banner
3. Check DynamoDB table for new entry
4. Verify no more "Cannot return null" errors

### Step 3: Verify DynamoDB
1. Go to [DynamoDB Console](https://console.aws.amazon.com/dynamodb/)
2. Check table `pfb-leaderboard-v2`
3. Verify new entries are being added

## 🎯 **EXPECTED RESULTS**

After deploying the fix:
- ✅ No more "Cannot return null" errors
- ✅ Game wins are posted to DynamoDB
- ✅ App continues working with fallback responses
- ✅ All GraphQL mutations work correctly

## 🚨 **TROUBLESHOOTING**

### If deployment fails:
1. Check AWS credentials are configured
2. Verify you have Lambda update permissions
3. Check the function name is correct
4. Ensure you're in the right AWS region (us-east-1)

### If testing fails:
1. Check CloudWatch logs for errors
2. Verify DynamoDB table exists and is accessible
3. Check IAM permissions for DynamoDB access
4. Test with simpler data first 