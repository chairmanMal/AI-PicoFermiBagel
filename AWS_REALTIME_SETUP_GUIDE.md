# AWS Real-Time Setup Guide

## Overview
This guide explains how to set up AWS AppSync and Lambda functions to enable real-time push notifications for the PicoFermiBagel multiplayer lobby.

## Prerequisites
- AWS CLI configured with appropriate permissions
- Existing AppSync API for PicoFermiBagel
- DynamoDB tables: `pfb-difficulty-interest`, `pfb-lobby-status`, `pfb-user-profiles`

## Step 1: Update AppSync Schema

Add the following to your AppSync schema:

```graphql
# Subscription types for real-time updates
type Subscription {
  # Real-time difficulty interest changes
  onDifficultyInterestChanged: DifficultyInterestUpdate!
  
  # Real-time lobby updates when players join/leave
  onPlayerJoinedLobby(difficulty: String!): LobbyUpdate!
  onPlayerLeftLobby(difficulty: String!): LobbyUpdate!
  
  # Real-time game start notifications
  onGameStarted(difficulty: String!): GameStartEvent!
}

# Types for subscription data
type DifficultyInterestUpdate {
  difficulty: String!
  interestCount: Int!
  timestamp: String!
}

type LobbyUpdate {
  difficulty: String!
  gameId: ID
  playersWaiting: Int!
  players: [LobbyPlayer!]!
  countdown: Int
}

type LobbyPlayer {
  username: String!
  joinedAt: String!
  seatIndex: Int!
}

type GameStartEvent {
  gameId: ID!
  difficulty: String!
  players: [String!]!
  gameSettings: GameSettings!
  randomSeed: Int!
}

type GameSettings {
  rows: Int!
  columns: Int!
  selectionSetSize: Int!
  multiRowFeedback: Boolean!
}

# Add these mutations to trigger real-time updates
extend type Mutation {
  # Update difficulty interest and trigger real-time notification
  updateDifficultyInterestWithNotification(input: UpdateDifficultyInterestInput!): UpdateDifficultyInterestResponse!
  
  # Join lobby with real-time notification
  joinLobbyWithNotification(input: JoinLobbyInput!): LobbyResponse!
  
  # Leave lobby with real-time notification  
  leaveLobbyWithNotification(input: LeaveLobbyInput!): Boolean!
  
  # Start game with real-time notification
  startGameWithNotification(input: StartGameInput!): GameStartResponse!
}

input UpdateDifficultyInterestInput {
  difficulty: String!
  deviceId: String!
  username: String!
  timestamp: String!
}

input StartGameInput {
  difficulty: String!
  gameId: ID!
  players: [String!]!
  gameSettings: GameSettingsInput!
  randomSeed: Int!
}

input GameSettingsInput {
  rows: Int!
  columns: Int!
  selectionSetSize: Int!
  multiRowFeedback: Boolean!
}

type UpdateDifficultyInterestResponse {
  success: Boolean!
  message: String!
  newInterestCount: Int!
}

type GameStartResponse {
  success: Boolean!
  gameId: ID!
  message: String!
}
```

## Step 2: Deploy Lambda Function

1. Update the `LAMBDA_ROLE_ARN` in `deploy-realtime-lambda.cjs` with your actual IAM role ARN
2. Run the deployment script:
   ```bash
   node deploy-realtime-lambda.cjs
   ```

## Step 3: Create DynamoDB Tables

If the tables don't exist, create them:

```bash
# Create difficulty interest table
aws dynamodb create-table \
  --table-name pfb-difficulty-interest \
  --attribute-definitions AttributeName=difficulty,AttributeType=S \
  --key-schema AttributeName=difficulty,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST

# Create lobby status table
aws dynamodb create-table \
  --table-name pfb-lobby-status \
  --attribute-definitions AttributeName=difficulty,AttributeType=S \
  --key-schema AttributeName=difficulty,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
```

## Step 4: Set Up AppSync Resolvers

For each mutation, create a resolver that invokes the Lambda function:

### updateDifficultyInterestWithNotification
- **Request Mapping Template**: Use the `request` function from `appsync-realtime-resolvers.js`
- **Response Mapping Template**: Use the `response` function from `appsync-realtime-resolvers.js`
- **Data Source**: Lambda function `pfb-realtime-updates`

### joinLobbyWithNotification
- **Request Mapping Template**: Use the `joinLobbyRequest` function from `appsync-realtime-resolvers.js`
- **Response Mapping Template**: Use the `joinLobbyResponse` function from `appsync-realtime-resolvers.js`
- **Data Source**: Lambda function `pfb-realtime-updates`

### leaveLobbyWithNotification
- **Request Mapping Template**: Use the `leaveLobbyRequest` function from `appsync-realtime-resolvers.js`
- **Response Mapping Template**: Use the `leaveLobbyResponse` function from `appsync-realtime-resolvers.js`
- **Data Source**: Lambda function `pfb-realtime-updates`

### startGameWithNotification
- **Request Mapping Template**: Use the `startGameRequest` function from `appsync-realtime-resolvers.js`
- **Response Mapping Template**: Use the `startGameResponse` function from `appsync-realtime-resolvers.js`
- **Data Source**: Lambda function `pfb-realtime-updates`

## Step 5: Configure IAM Permissions

Ensure your Lambda execution role has these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:*:*:table/pfb-difficulty-interest",
        "arn:aws:dynamodb:*:*:table/pfb-lobby-status",
        "arn:aws:dynamodb:*:*:table/pfb-user-profiles"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "appsync:GraphQL"
      ],
      "Resource": [
        "arn:aws:appsync:*:*:apis/*"
      ]
    }
  ]
}
```

## Step 6: Test the Setup

1. Deploy the Lambda function
2. Update the AppSync schema
3. Create the resolvers
4. Test with a simple GraphQL mutation:

```graphql
mutation TestDifficultyInterest {
  updateDifficultyInterestWithNotification(input: {
    difficulty: "classic"
    deviceId: "test-device"
    username: "testuser"
    timestamp: "2025-08-07T22:00:00Z"
  }) {
    success
    message
    newInterestCount
  }
}
```

## Step 7: Frontend Integration

Once the AWS backend is set up, the frontend can use the real-time subscriptions as implemented in the previous changes.

## Troubleshooting

### Common Issues:
1. **Lambda function not found**: Ensure the function is deployed and the ARN is correct
2. **Permission denied**: Check IAM roles and policies
3. **Subscription not working**: Verify AppSync schema and resolver configuration
4. **DynamoDB errors**: Ensure tables exist and have correct permissions

### Debugging:
- Check CloudWatch logs for Lambda function errors
- Use AppSync console to test queries and mutations
- Verify DynamoDB table contents
- Check IAM role permissions

## Next Steps

After completing this setup:
1. Update the frontend to use the new real-time mutations
2. Test with multiple clients to verify real-time updates
3. Monitor CloudWatch logs for any issues
4. Optimize performance as needed 