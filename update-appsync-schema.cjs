const { execSync } = require('child_process');
const fs = require('fs');

async function updateAppSyncSchema() {
  console.log('🔧 Updating AppSync Schema and Resolver...\n');
  
  const API_ID = 'dzdcg7gk5zco3fu57dotwhbrdu';
  
  try {
    // Step 1: Get current schema
    console.log('📋 Step 1: Getting current schema...');
    
    try {
      execSync(`aws appsync get-introspection-schema --api-id ${API_ID} --format JSON --outfile current-schema.json`, { stdio: 'inherit' });
      console.log('✅ Current schema retrieved');
      
      const schema = JSON.parse(fs.readFileSync('current-schema.json', 'utf8'));
      console.log('✅ Schema parsed successfully');
      
      // Check if the query already exists
      const queryType = schema.data.__schema.types.find(t => t.name === 'Query');
      if (queryType) {
        const hasQuery = queryType.fields.some(f => f.name === 'getDifficultyInterestCounts');
        if (hasQuery) {
          console.log('✅ getDifficultyInterestCounts query already exists');
        } else {
          console.log('❌ getDifficultyInterestCounts query not found, needs to be added');
        }
      }
      
    } catch (error) {
      console.log('❌ Could not get current schema:', error.message);
      console.log('📋 Will proceed with manual schema update');
    }
    
    // Step 2: Create schema update
    console.log('\n📋 Step 2: Creating schema update...');
    
    const schemaUpdate = `
# Add this type if it doesn't exist
type DifficultyInterest {
  difficulty: String!
  interestCount: Int!
  timestamp: String!
}

# Add this query to your existing Query type
extend type Query {
  getDifficultyInterestCounts: [DifficultyInterest!]!
}
    `;
    
    fs.writeFileSync('schema-update.graphql', schemaUpdate);
    console.log('✅ Schema update file created: schema-update.graphql');
    
    // Step 3: Try to update the schema (this might not work via CLI)
    console.log('\n📋 Step 3: Attempting to update schema...');
    
    try {
      // Note: AppSync schema updates via CLI are limited
      // We'll need to do this manually in the console
      console.log('⚠️  Schema updates via CLI are limited. Manual update required.');
    } catch (error) {
      console.log('❌ Schema update failed:', error.message);
    }
    
    // Step 4: Create resolver
    console.log('\n📋 Step 4: Creating resolver for getDifficultyInterestCounts...');
    
    const resolverRequestTemplate = `
{
  "version": "2017-02-28",
  "operation": "Invoke",
  "payload": {
    "operation": "getDifficultyInterestCounts"
  }
}
    `;
    
    const resolverResponseTemplate = `
#if($ctx.error)
  $util.error($ctx.error.message, $ctx.error.type)
#end
$util.toJson($ctx.result)
    `;
    
    fs.writeFileSync('resolver-request.vtl', resolverRequestTemplate);
    fs.writeFileSync('resolver-response.vtl', resolverResponseTemplate);
    
    console.log('✅ Resolver templates created');
    
    // Step 5: Try to create the resolver
    console.log('\n📋 Step 5: Attempting to create resolver...');
    
    try {
      execSync(`aws appsync create-resolver --api-id ${API_ID} --type-name Query --field-name getDifficultyInterestCounts --data-source-name pfb_lobby_management --request-mapping-template file://resolver-request.vtl --response-mapping-template file://resolver-response.vtl`, { stdio: 'inherit' });
      console.log('✅ Resolver created successfully!');
    } catch (error) {
      console.log('❌ Resolver creation failed:', error.message);
      console.log('📋 Manual resolver creation required');
    }
    
    // Step 6: Test the setup
    console.log('\n📋 Step 6: Testing the setup...');
    
    const testQuery = `
query TestGetDifficultyInterestCounts {
  getDifficultyInterestCounts {
    difficulty
    interestCount
    timestamp
  }
}
    `;
    
    fs.writeFileSync('test-query.graphql', testQuery);
    console.log('✅ Test query created: test-query.graphql');
    
    console.log('\n📋 Manual Steps Required:');
    console.log('1. Go to AWS AppSync Console');
    console.log('2. Navigate to your API: PicoFermiBagel-Multiplayer-API');
    console.log('3. Go to "Schema" tab');
    console.log('4. Add the content from schema-update.graphql to your schema');
    console.log('5. Go to "Resolvers" tab');
    console.log('6. Click "Attach" next to getDifficultyInterestCounts');
    console.log('7. Use the templates from resolver-request.vtl and resolver-response.vtl');
    
    // Clean up
    try {
      fs.unlinkSync('current-schema.json');
    } catch (e) {}
    
  } catch (error) {
    console.log('❌ Error during update:', error.message);
  }
}

updateAppSyncSchema(); 