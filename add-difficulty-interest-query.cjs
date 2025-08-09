const { execSync } = require('child_process');

async function addDifficultyInterestQuery() {
  console.log('🔧 Adding getDifficultyInterestCounts Query to AppSync Schema...\n');
  
  const API_ID = 'dzdcg7gk5zco3fu57dotwhbrdu';
  
  try {
    console.log('📋 Step 1: Creating resolver for getDifficultyInterestCounts...');
    
    // First, let's check if the query already exists in the schema
    console.log('🔍 Checking current schema...');
    
    try {
      const schemaCheck = execSync(`aws appsync get-introspection-schema --api-id ${API_ID} --format JSON --output text`, { encoding: 'utf8' });
      console.log('✅ Schema retrieved successfully');
      
      if (schemaCheck.includes('getDifficultyInterestCounts')) {
        console.log('✅ Query already exists in schema');
      } else {
        console.log('❌ Query not found in schema, needs to be added');
      }
    } catch (error) {
      console.log('❌ Could not retrieve schema:', error.message);
    }
    
    console.log('\n📋 Step 2: Manual Steps Required:');
    console.log('1. Go to AWS AppSync Console');
    console.log('2. Navigate to your API: PicoFermiBagel-Multiplayer-API');
    console.log('3. Go to "Schema" tab');
    console.log('4. Add this to your schema:');
    
    const schemaAddition = `
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
    
    console.log(schemaAddition);
    
    console.log('\n📋 Step 3: Create Resolver for getDifficultyInterestCounts');
    console.log('1. After adding the query to schema, click "Attach" next to getDifficultyInterestCounts');
    console.log('2. Choose "Lambda" as data source');
    console.log('3. Select the pfb-lobby-management Lambda function');
    console.log('4. For Request mapping template, use:');
    
    const requestTemplate = `
{
  "version": "2017-02-28",
  "operation": "Invoke",
  "payload": {
    "operation": "getDifficultyInterestCounts"
  }
}
    `;
    
    console.log(requestTemplate);
    
    console.log('5. For Response mapping template, use:');
    
    const responseTemplate = `
#if($ctx.error)
  $util.error($ctx.error.message, $ctx.error.type)
#end
$util.toJson($ctx.result)
    `;
    
    console.log(responseTemplate);
    
    console.log('\n📋 Step 4: Test the Query');
    console.log('After setup, test with this GraphQL query:');
    
    const testQuery = `
query TestGetDifficultyInterestCounts {
  getDifficultyInterestCounts {
    difficulty
    interestCount
    timestamp
  }
}
    `;
    
    console.log(testQuery);
    
    console.log('\n📋 Step 5: Update Frontend');
    console.log('The frontend is already configured to use this query.');
    console.log('Once the schema is updated, the app will show real difficulty interest counts.');
    
  } catch (error) {
    console.log('❌ Error during setup:', error.message);
  }
}

addDifficultyInterestQuery(); 