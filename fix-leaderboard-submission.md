# Fix Leaderboard Submission Issue

## Problem
The app is trying to submit game results using a new schema, but the AWS backend expects the old schema format.

## Solution Options

### Option A: Update App to Use Existing Schema (Recommended)

1. **Update the multiplayerService to use the existing table schema:**

```typescript
// In src/services/multiplayerService.ts, update submitGameResult:
async submitGameResult(gameId: string, gameStats: {
  score: number;
  guesses: number;
  hints: number;
  difficulty: string;
  gameWon: boolean;
}, username?: string): Promise<GameEndResult | null> {
  try {
    const finalUsername = username || this.getStoredUsername();
    if (!finalUsername) {
      throw new Error('No username provided or registered');
    }

    // Use the existing table schema
    const entry = {
      Id: gameId,
      Initials: finalUsername.substring(0, 10), // Limit to 10 chars
      Score: gameStats.score,
      Date: new Date().toLocaleDateString('en-US'),
      Difficulty: gameStats.difficulty === 'classic' ? 8 : 6, // Map difficulty
      Attempts: gameStats.guesses,
      Time: Math.round(get().getGameTimeMinutes() * 60), // Convert to seconds
      Valid: 1,
      Seed: Math.floor(Math.random() * 1000000), // Random seed
      RandomCount: Math.floor(Math.random() * 100),
      VersionNumber: 0
    };

    // Save to DynamoDB directly (bypass AppSync for now)
    const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
    const { DynamoDBDocumentClient, PutCommand } = await import('@aws-sdk/lib-dynamodb');
    
    const client = new DynamoDBClient({ region: 'us-east-1' });
    const docClient = DynamoDBDocumentClient.from(client);
    
    await docClient.send(new PutCommand({
      TableName: 'pfb-mobilehub-1126398616-LeaderBoardTable',
      Item: entry
    }));

    return {
      winner: finalUsername,
      rankings: [{
        rank: 1,
        username: finalUsername,
        score: gameStats.score,
        guesses: gameStats.guesses,
        hints: gameStats.hints,
        timeElapsed: Math.round(get().getGameTimeMinutes() * 60)
      }],
      leaderboardUpdated: true,
      newPersonalBest: true
    };
  } catch (error) {
    console.error('Submit game result failed:', error);
    return null;
  }
}
```

2. **Update the leaderboard retrieval to use existing schema:**

```typescript
// In src/services/multiplayerService.ts, update getLeaderboard:
async getLeaderboard(difficulty: string, limit: number = 20): Promise<LeaderboardEntry[]> {
  try {
    const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
    const { DynamoDBDocumentClient, ScanCommand } = await import('@aws-sdk/lib-dynamodb');
    
    const client = new DynamoDBClient({ region: 'us-east-1' });
    const docClient = DynamoDBDocumentClient.from(client);
    
    const result = await docClient.send(new ScanCommand({
      TableName: 'pfb-mobilehub-1126398616-LeaderBoardTable',
      Limit: limit
    }));

    return result.Items.map((item, index) => ({
      rank: index + 1,
      username: item.Initials?.S || 'Unknown',
      score: parseInt(item.Score?.N || '0'),
      timestamp: item.Date?.S || new Date().toISOString(),
      difficulty: item.Difficulty?.N === '8' ? 'classic' : 'easy'
    })).sort((a, b) => b.score - a.score);
  } catch (error) {
    console.error('Get leaderboard failed:', error);
    return [];
  }
}
```

### Option B: Create New AppSync Schema (Long-term Solution)

1. **Update AppSync schema to include submitGameResult mutation**
2. **Create new DynamoDB table with new schema**
3. **Update Lambda functions to handle new schema**

## Immediate Fix

For now, use Option A to get the leaderboard working with the existing infrastructure. 