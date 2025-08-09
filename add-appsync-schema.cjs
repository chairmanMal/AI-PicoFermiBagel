const { execSync } = require('child_process');
const fs = require('fs');

async function addAppSyncSchema() {
  console.log('🔧 Adding AppSync Schema Mutations...\n');
  
  const API_ID = 'dzdcg7gk5zco3fu57dotwhbrdu';
  
  // Schema to add
  const schemaAddition = `
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
  `;
  
  try {
    console.log('📋 Getting current schema...');
    
    // Get current schema
    const currentSchema = execSync(`aws appsync get-introspection-schema --api-id ${API_ID} --format SDL schema.sdl`, { encoding: 'utf8' });
    console.log('✅ Retrieved current schema');
    
    // Read the current schema
    if (fs.existsSync('schema.sdl')) {
      const schemaContent = fs.readFileSync('schema.sdl', 'utf8');
      console.log('📄 Current schema length:', schemaContent.length);
      
      // Check if our mutations already exist
      if (schemaContent.includes('updateDifficultyInterestWithNotification')) {
        console.log('⚠️  Schema mutations already exist!');
        return;
      }
      
      // Add our schema additions
      const updatedSchema = schemaContent + '\n' + schemaAddition;
      
      // Write updated schema
      fs.writeFileSync('updated-schema.sdl', updatedSchema);
      console.log('📝 Created updated schema with new mutations');
      
      console.log('\n📋 Manual Steps to Update Schema:');
      console.log('1. Go to AWS AppSync Console');
      console.log('2. Navigate to your API: PicoFermiBagel-Multiplayer-API');
      console.log('3. Go to "Schema" tab');
      console.log('4. Copy and paste the schema additions below:');
      console.log('\n' + schemaAddition);
      console.log('\n5. Click "Save" to update the schema');
      
    } else {
      console.log('❌ Could not read current schema file');
    }
    
  } catch (error) {
    console.log('❌ Error updating schema:', error.message);
    console.log('\n📋 Manual Schema Update Required:');
    console.log('1. Go to AWS AppSync Console');
    console.log('2. Navigate to your API: PicoFermiBagel-Multiplayer-API');
    console.log('3. Go to "Schema" tab');
    console.log('4. Add the schema mutations manually');
  }
  
  // Cleanup
  if (fs.existsSync('schema.sdl')) fs.unlinkSync('schema.sdl');
  if (fs.existsSync('updated-schema.sdl')) fs.unlinkSync('updated-schema.sdl');
}

addAppSyncSchema(); 