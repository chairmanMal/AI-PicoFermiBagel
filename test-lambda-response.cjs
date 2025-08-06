#!/usr/bin/env node

/**
 * Test Lambda Function Response
 * 
 * This script will test the submitGameResult mutation to see
 * what the Lambda function is actually returning.
 */

console.log('🧪 Testing Lambda Function Response\n');

async function testLambdaResponse() {
  console.log('📤 Testing submitGameResult mutation...');
  
  try {
    // Test data
    const testGameData = {
      gameId: `test-game-${Date.now()}`,
      deviceId: `test-device-${Date.now()}`,
      username: 'TestPlayer',
      score: 95,
      guesses: 3,
      hints: 0,
      difficulty: 'classic',
      gameWon: true,
      timestamp: new Date().toISOString()
    };
    
    console.log('📋 Test data:', testGameData);
    
    // AppSync endpoint and API key
    const endpoint = 'https://i4n55xxcjrds7e7aygfxajkozq.appsync-api.us-east-1.amazonaws.com/graphql';
    const apiKey = 'da2-nfhc7ukfhjaypm2ey62x22omc4';
    
    const query = `
      mutation SubmitGameResult($input: GameResultInput!) {
        submitGameResult(input: $input) {
          winner
          rankings {
            rank
            username
            score
            guesses
            hints
            timeElapsed
          }
          leaderboardUpdated
          newPersonalBest
        }
      }
    `;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({
        query,
        variables: {
          input: testGameData
        }
      })
    });
    
    const result = await response.json();
    
    console.log('📋 Full Response:', JSON.stringify(result, null, 2));
    
    if (result.errors) {
      console.log('❌ GraphQL errors:', result.errors);
      
      // Check if it's still returning null values
      result.errors.forEach(error => {
        if (error.message.includes('Cannot return null')) {
          console.log('🔍 Lambda function is still returning null values');
          console.log('🔍 Need to update the Lambda function with the correct return structure');
        }
      });
    } else if (result.data) {
      console.log('✅ Mutation successful!');
      console.log('📋 Response data:', JSON.stringify(result.data.submitGameResult, null, 2));
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

async function main() {
  await testLambdaResponse();
  
  console.log('\n📋 Summary:');
  console.log('If you see "Cannot return null" errors, the Lambda function needs to be updated');
  console.log('The Lambda function should return proper values instead of null');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { testLambdaResponse }; 