const { execSync } = require('child_process');

async function fixRemainingIssues() {
  console.log('🔧 Fixing Remaining Issues...\n');
  
  console.log('✅ What\'s Working:');
  console.log('1. ✅ Lambda function exists and works correctly');
  console.log('2. ✅ DynamoDB tables exist');
  console.log('3. ✅ Lambda function can handle operations correctly');
  
  console.log('\n❌ What Needs to be Fixed:');
  console.log('1. ❌ AppSync permissions - You need more permissions');
  console.log('2. ❌ AppSync schema - Missing mutations and types');
  console.log('3. ❌ AppSync resolvers - Missing resolver attachments');
  
  console.log('\n🔧 Step-by-Step Fix Guide:');
  
  console.log('\n📋 Step 1: Fix AppSync Permissions');
  console.log('You need to add these permissions to your IAM user:');
  console.log(`
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "appsync:ListApis",
        "appsync:GetApi",
        "appsync:UpdateApi",
        "appsync:GetIntrospectionSchema",
        "appsync:ListResolvers",
        "appsync:GetResolver",
        "appsync:CreateResolver",
        "appsync:UpdateResolver",
        "appsync:DeleteResolver",
        "appsync:ListDataSources",
        "appsync:GetDataSource",
        "appsync:CreateDataSource",
        "appsync:UpdateDataSource",
        "appsync:DeleteDataSource"
      ],
      "Resource": [
        "arn:aws:appsync:us-east-1:171591329315:apis/*",
        "arn:aws:appsync:us-east-1:171591329315:apis/i4n55xxcjrds7e7aygfxajkozq/*"
      ]
    }
  ]
}
  `);
  
  console.log('\n📋 Step 2: Add Schema to AppSync');
  console.log('Go to AWS AppSync Console → Your API → Schema tab');
  console.log('Add this complete schema:');
  console.log(`
# Add these input types
input UpdateDifficultyInterestInput {
  difficulty: String!
  deviceId: String!
  username: String!
  timestamp: AWSDateTime!
}

input JoinLobbyInputWithNotification {
  difficulty: String!
  username: String!
  deviceId: String!
  timestamp: AWSDateTime!
}

input LeaveLobbyInputWithNotification {
  difficulty: String!
  username: String!
  deviceId: String!
  timestamp: AWSDateTime!
}

input GameSettingsInput {
  rows: Int!
  columns: Int!
  selectionSetSize: Int!
  multiRowFeedback: Boolean!
}

input StartGameInputWithNotification {
  gameId: ID!
  difficulty: String!
  players: [String!]!
  gameSettings: GameSettingsInput!
  randomSeed: Int!
}

# Add these response types
type UpdateDifficultyInterestResponse {
  success: Boolean!
  message: String
  newInterestCount: Int
}

type LobbyJoinResponseWithNotification {
  success: Boolean!
  gameId: ID
  playersWaiting: Int
  message: String
}

type LobbyLeaveResponseWithNotification {
  success: Boolean!
  message: String
}

type GameStartResponseWithNotification {
  success: Boolean!
  gameId: ID!
  message: String
}

type DifficultyInterest {
  difficulty: String!
  interestCount: Int!
  timestamp: AWSDateTime!
}

type PlayerInLobby {
  username: String!
  joinedAt: AWSDateTime!
  seatIndex: Int!
}

type LobbyStatus {
  difficulty: String!
  playersWaiting: Int!
  players: [PlayerInLobby!]!
  gameId: ID
  countdown: Int
}

type GameSettings {
  rows: Int!
  columns: Int!
  selectionSetSize: Int!
  multiRowFeedback: Boolean!
}

type GameStartEvent {
  gameId: ID!
  difficulty: String!
  players: [String!]!
  gameSettings: GameSettings!
  randomSeed: Int!
}

# Add these mutations to your existing Mutation type
extend type Mutation {
  updateDifficultyInterestWithNotification(input: UpdateDifficultyInterestInput!): UpdateDifficultyInterestResponse!
  joinLobbyWithNotification(input: JoinLobbyInputWithNotification!): LobbyJoinResponseWithNotification!
  leaveLobbyWithNotification(input: LeaveLobbyInputWithNotification!): LobbyLeaveResponseWithNotification!
  startGameWithNotification(input: StartGameInputWithNotification!): GameStartResponseWithNotification!
}

# Add these queries to your existing Query type
extend type Query {
  getDifficultyInterestCounts: [DifficultyInterest!]!
  getLobbyStatus(difficulty: String!): LobbyStatus
}

# Add these subscriptions to your existing Subscription type
extend type Subscription {
  onDifficultyInterestChanged: DifficultyInterest!
    @aws_subscribe(mutations: ["updateDifficultyInterestWithNotification"])
  
  onPlayerJoinedLobby(difficulty: String!): LobbyStatus!
    @aws_subscribe(mutations: ["joinLobbyWithNotification"])
  
  onPlayerLeftLobby(difficulty: String!): LobbyStatus!
    @aws_subscribe(mutations: ["leaveLobbyWithNotification"])
  
  onGameStarted(difficulty: String!): GameStartEvent!
    @aws_subscribe(mutations: ["startGameWithNotification"])
}
  `);
  
  console.log('\n📋 Step 3: Create Data Source');
  console.log('Go to AppSync Console → Data Sources → Create data source');
  console.log('Name: pfb_lobby_management');
  console.log('Type: AWS Lambda function');
  console.log('Region: us-east-1');
  console.log('Lambda function ARN: arn:aws:lambda:us-east-1:171591329315:function:pfb-lobby-management');
  
  console.log('\n📋 Step 4: Create Resolvers');
  console.log('For each mutation, create a resolver with this JavaScript code:');
  console.log(`
// Request Mapping Template (JavaScript)
export function request(ctx) {
  return {
    operation: 'Invoke',
    payload: {
      operation: 'updateDifficultyInterestWithNotification',
      input: ctx.args.input
    }
  };
}

// Response Mapping Template (JavaScript)
export function response(ctx) {
  return ctx.result;
}
  `);
  
  console.log('\n📋 Step 5: Create All Required Resolvers');
  console.log('Create resolvers for these mutations:');
  console.log('1. updateDifficultyInterestWithNotification');
  console.log('2. joinLobbyWithNotification');
  console.log('3. leaveLobbyWithNotification');
  console.log('4. startGameWithNotification');
  
  console.log('\n📋 Step 6: Test Everything');
  console.log('After completing the above steps, run:');
  console.log('node test-complete-setup.cjs');
  
  console.log('\n🎯 Expected Results:');
  console.log('✅ Lambda function works (already confirmed)');
  console.log('✅ AppSync API accessible');
  console.log('✅ Schema includes all required types and mutations');
  console.log('✅ Resolvers are attached and working');
  console.log('✅ Frontend can connect and use real-time features');
  
  console.log('\n⚠️  Important Notes:');
  console.log('- Make sure to use JavaScript resolvers, not VTL');
  console.log('- The Lambda function is already working correctly');
  console.log('- All DynamoDB tables exist and are accessible');
  console.log('- The main issue is AppSync configuration');
  console.log('- Data source name should be: pfb_lobby_management');
  console.log('- Use the "WithNotification" mutation names');
}

fixRemainingIssues(); 