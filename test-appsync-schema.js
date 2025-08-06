// Use built-in fetch

const APPSYNC_ENDPOINT = 'https://i4n55xxcjrds7e7aygfxajkozq.appsync-api.us-east-1.amazonaws.com/graphql';
const APPSYNC_API_KEY = 'da2-nfhc7ukfhjaypm2ey62x22omc4';

async function testAppSyncSchema() {
  console.log('🔍 Testing AppSync Schema...\n');

  // Test 1: Introspection query to see available types
  const introspectionQuery = `
    query IntrospectionQuery {
      __schema {
        types {
          name
          kind
          description
        }
      }
    }
  `;

  try {
    const response = await fetch(APPSYNC_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': APPSYNC_API_KEY
      },
      body: JSON.stringify({
        query: introspectionQuery
      })
    });

    const result = await response.json();
    
    if (result.data) {
      console.log('✅ AppSync introspection successful');
      console.log('Available types:');
      result.data.__schema.types
        .filter(type => type.kind === 'OBJECT' && !type.name.startsWith('__'))
        .forEach(type => {
          console.log(`  - ${type.name}`);
        });
    } else {
      console.log('❌ AppSync introspection failed:', result.errors);
    }
  } catch (error) {
    console.log('❌ AppSync test failed:', error.message);
  }

  // Test 2: Check what mutations are available
  console.log('\n🔍 Checking available mutations...');
  
  const mutationsQuery = `
    query GetMutations {
      __type(name: "Mutation") {
        fields {
          name
          type {
            name
            kind
            ofType {
              name
              kind
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(APPSYNC_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': APPSYNC_API_KEY
      },
      body: JSON.stringify({
        query: mutationsQuery
      })
    });

    const result = await response.json();
    
    if (result.data) {
      console.log('✅ Available mutations:');
      result.data.__type.fields.forEach(field => {
        console.log(`  - ${field.name}: ${field.type.name || field.type.ofType?.name}`);
      });
    } else {
      console.log('❌ Failed to get mutations:', result.errors);
    }
  } catch (error) {
    console.log('❌ Mutations query failed:', error.message);
  }

  // Test 3: Check GameEndResponse type structure
  console.log('\n🔍 Checking GameEndResponse type...');
  
  const gameEndResponseQuery = `
    query GetGameEndResponse {
      __type(name: "GameEndResponse") {
        fields {
          name
          type {
            name
            kind
            ofType {
              name
              kind
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(APPSYNC_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': APPSYNC_API_KEY
      },
      body: JSON.stringify({
        query: gameEndResponseQuery
      })
    });

    const result = await response.json();
    
    if (result.data) {
      console.log('✅ GameEndResponse fields:');
      result.data.__type.fields.forEach(field => {
        console.log(`  - ${field.name}: ${field.type.name || field.type.ofType?.name}`);
      });
    } else {
      console.log('❌ Failed to get GameEndResponse:', result.errors);
    }
  } catch (error) {
    console.log('❌ GameEndResponse query failed:', error.message);
  }

  // Test 4: Check what input type submitGameResult expects
  console.log('\n🔍 Checking submitGameResult input type...');
  
  const mutationDetailsQuery = `
    query GetMutationDetails {
      __type(name: "Mutation") {
        fields(includeDeprecated: true) {
          name
          args {
            name
            type {
              name
              kind
              ofType {
                name
                kind
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(APPSYNC_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': APPSYNC_API_KEY
      },
      body: JSON.stringify({
        query: mutationDetailsQuery
      })
    });

    const result = await response.json();
    
    if (result.data) {
      const submitGameResult = result.data.__type.fields.find(field => field.name === 'submitGameResult');
      if (submitGameResult) {
        console.log('✅ submitGameResult arguments:');
        submitGameResult.args.forEach(arg => {
          console.log(`  - ${arg.name}: ${arg.type.name || arg.type.ofType?.name}`);
        });
      } else {
        console.log('❌ submitGameResult not found in mutations');
      }
    } else {
      console.log('❌ Failed to get mutation details:', result.errors);
    }
  } catch (error) {
    console.log('❌ Mutation details query failed:', error.message);
  }

  // Test 5: Check what input types are available
  console.log('\n🔍 Checking available input types...');
  
  const inputTypesQuery = `
    query GetInputTypes {
      __schema {
        types {
          name
          kind
        }
      }
    }
  `;

  try {
    const response = await fetch(APPSYNC_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': APPSYNC_API_KEY
      },
      body: JSON.stringify({
        query: inputTypesQuery
      })
    });

    const result = await response.json();
    
    if (result.data) {
      console.log('✅ Available input types:');
      result.data.__schema.types
        .filter(type => type.kind === 'INPUT_OBJECT')
        .forEach(type => {
          console.log(`  - ${type.name}`);
        });
    } else {
      console.log('❌ Failed to get input types:', result.errors);
    }
  } catch (error) {
    console.log('❌ Input types query failed:', error.message);
  }

  // Test 6: Check GameResultInput structure
  console.log('\n🔍 Checking GameResultInput structure...');
  
  const gameResultInputStructureQuery = `
    query GetGameResultInputStructure {
      __type(name: "GameResultInput") {
        fields {
          name
          type {
            name
            kind
            ofType {
              name
              kind
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(APPSYNC_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': APPSYNC_API_KEY
      },
      body: JSON.stringify({
        query: gameResultInputStructureQuery
      })
    });

    const result = await response.json();
    
    if (result.data && result.data.__type) {
      console.log('✅ GameResultInput fields:');
      result.data.__type.fields.forEach(field => {
        console.log(`  - ${field.name}: ${field.type.name || field.type.ofType?.name}`);
      });
    } else {
      console.log('❌ Failed to get GameResultInput structure:', result.errors);
    }
  } catch (error) {
    console.log('❌ GameResultInput structure query failed:', error.message);
  }

  // Test 7: Test validateUsername to see working pattern
  console.log('\n🔍 Testing validateUsername to see working pattern...');
  
  const testValidateUsername = `
    mutation TestValidateUsername($input: UsernameValidationInput!) {
      validateUsername(input: $input) {
        available
        message
        suggestions
      }
    }
  `;

  try {
    const response = await fetch(APPSYNC_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': APPSYNC_API_KEY
      },
      body: JSON.stringify({
        query: testValidateUsername,
        variables: {
          input: {
            username: "testuser123",
            timestamp: new Date().toISOString()
          }
        }
      })
    });

    const result = await response.json();
    
    if (result.data) {
      console.log('✅ validateUsername works:', JSON.stringify(result.data, null, 2));
    } else {
      console.log('❌ validateUsername failed:', result.errors);
    }
  } catch (error) {
    console.log('❌ validateUsername test failed:', error.message);
  }

  // Test 8: Test submitGameResult with different input structure
  console.log('\n🔍 Testing submitGameResult with minimal input...');
  
  const testSubmitGameResult = `
    mutation TestSubmitGameResult($input: GameResultInput!) {
      submitGameResult(input: $input) {
        winner
        rankings {
          rank
          username
          score
        }
        leaderboardUpdated
        newPersonalBest
      }
    }
  `;

  try {
    const response = await fetch(APPSYNC_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': APPSYNC_API_KEY
      },
      body: JSON.stringify({
        query: testSubmitGameResult,
        variables: {
          input: {
            gameId: "test-game-123",
            username: "TestUser",
            score: 95,
            guesses: 5,
            hints: 0,
            difficulty: "classic",
            gameWon: true,
            timestamp: new Date().toISOString()
          }
        }
      })
    });

    const result = await response.json();
    
    if (result.data) {
      console.log('✅ submitGameResult works:', JSON.stringify(result.data, null, 2));
    } else {
      console.log('❌ submitGameResult failed:', result.errors);
    }
  } catch (error) {
    console.log('❌ submitGameResult test failed:', error.message);
  }

  console.log('\n🎯 Schema test complete!');
}

// Run the test
testAppSyncSchema().catch(console.error); 