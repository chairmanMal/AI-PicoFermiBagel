const { execSync } = require('child_process');

async function testSpecificIssues() {
  console.log('🔍 Testing Specific Issues...\n');
  
  console.log('✅ GOOD NEWS:');
  console.log('- DynamoDB tables exist: pfb-difficulty-interest, pfb-lobby-status');
  console.log('- Lambda function exists: pfb-lobby-management');
  
  console.log('\n❌ ISSUES FOUND:');
  console.log('1. MISSING RESOLVERS: The new mutations have no AppSync resolvers');
  console.log('   - updateDifficultyInterestWithNotification: MISSING');
  console.log('   - joinLobbyWithNotification: MISSING');
  console.log('   - leaveLobbyWithNotification: MISSING');
  console.log('   - startGameWithNotification: MISSING');
  
  console.log('\n2. SCHEMA ISSUE: The mutations may not be in the AppSync schema');
  
  console.log('\n3. LAMBDA TESTING ISSUE: AWS CLI has encoding problems');
  
  console.log('\n🔧 IMMEDIATE FIXES NEEDED:');
  console.log('\nStep 1: Add mutations to AppSync schema');
  console.log('1. Go to AWS AppSync Console');
  console.log('2. Navigate to your API: PicoFermiBagel-Multiplayer-API');
  console.log('3. Go to "Schema" tab');
  console.log('4. Add these mutations to your schema:');
  
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

# Add these mutations to your existing Mutation type
extend type Mutation {
  updateDifficultyInterestWithNotification(input: UpdateDifficultyInterestInput!): UpdateDifficultyInterestResponse!
  joinLobbyWithNotification(input: JoinLobbyInputWithNotification!): LobbyJoinResponseWithNotification!
  leaveLobbyWithNotification(input: LeaveLobbyInputWithNotification!): LobbyLeaveResponseWithNotification!
  startGameWithNotification(input: StartGameInputWithNotification!): GameStartResponseWithNotification!
}
  `);
  
  console.log('\nStep 2: Create AppSync resolvers');
  console.log('After adding the schema, create resolvers for each mutation:');
  console.log('1. Click "Attach" next to each mutation');
  console.log('2. Choose Lambda data source: pfb-lobby-management');
  console.log('3. Use JavaScript resolver code (not VTL templates!)');
  
  console.log('\n📝 JavaScript Resolver Code for updateDifficultyInterestWithNotification:');
  console.log('Request:');
  console.log(`
export function request(ctx) {
  return {
    operation: 'Invoke',
    payload: {
      operation: 'updateDifficultyInterestWithNotification',
      input: ctx.args.input
    }
  };
}
  `);
  
  console.log('Response:');
  console.log(`
export function response(ctx) {
  if (ctx.error) {
    throw new Error(ctx.error.message);
  }
  return ctx.result;
}
  `);
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Add the schema mutations first');
  console.log('2. Create the resolvers with JavaScript code');
  console.log('3. Test the mutation in AppSync Console');
  console.log('4. If it works, proceed with subscriptions');
}

testSpecificIssues(); 