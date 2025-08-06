#!/usr/bin/env node

/**
 * Test submitGameResult Mutation
 * 
 * This script will test the submitGameResult mutation to see:
 * 1. Which Lambda function is being called
 * 2. What the Lambda function returns
 * 3. If there are any errors
 */

// Using built-in fetch (Node.js 18+)

console.log('🧪 Testing submitGameResult Mutation\n');

async function testSubmitGameResult() {
  console.log('📤 Testing submitGameResult mutation directly...');
  
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
    
    // AppSync endpoint and API key from awsConfig.ts
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
      
      // Check if it's a Lambda function error
      result.errors.forEach(error => {
        if (error.message.includes('Lambda')) {
          console.log('🔍 This suggests a Lambda function error');
        }
      });
    } else if (result.data) {
      console.log('✅ Mutation successful!');
      console.log('📋 Response data:', JSON.stringify(result.data.submitGameResult, null, 2));
      
      // Check if all required fields are present
      const response = result.data.submitGameResult;
      if (!response.winner) console.log('⚠️  Missing winner field');
      if (!response.rankings) console.log('⚠️  Missing rankings field');
      if (response.leaderboardUpdated === null) console.log('⚠️  leaderboardUpdated is null');
      if (response.newPersonalBest === null) console.log('⚠️  newPersonalBest is null');
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

async function testOtherMutations() {
  console.log('\n📤 Testing other mutations to see which ones work...');
  
  const endpoint = 'https://i4n55xxcjrds7e7aygfxajkozq.appsync-api.us-east-1.amazonaws.com/graphql';
  const apiKey = 'da2-nfhc7ukfhjaypm2ey62x22omc4';
  
  // Test registerUser (we know this works)
  try {
    console.log('\n1. Testing registerUser mutation...');
    const registerQuery = `
      mutation RegisterUser($input: UserRegistrationInput!) {
        registerUser(input: $input) {
          success
          deviceId
          username
          message
        }
      }
    `;
    
    const registerResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({
        query: registerQuery,
        variables: {
          input: {
            deviceId: `test-device-${Date.now()}`,
            username: 'TestUser',
            timestamp: new Date().toISOString()
          }
        }
      })
    });
    
    const registerResult = await registerResponse.json();
    console.log('registerUser result:', JSON.stringify(registerResult, null, 2));
    
  } catch (error) {
    console.log('registerUser failed:', error.message);
  }
  
  // Test validateUsername (we know this works)
  try {
    console.log('\n2. Testing validateUsername mutation...');
    const validateQuery = `
      mutation ValidateUsername($username: String!) {
        validateUsername(username: $username) {
          available
          message
          suggestions
        }
      }
    `;
    
    const validateResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({
        query: validateQuery,
        variables: {
          username: 'TestUser'
        }
      })
    });
    
    const validateResult = await validateResponse.json();
    console.log('validateUsername result:', JSON.stringify(validateResult, null, 2));
    
  } catch (error) {
    console.log('validateUsername failed:', error.message);
  }
}

async function main() {
  await testSubmitGameResult();
  await testOtherMutations();
  
  console.log('\n📋 Summary:');
  console.log('1. Check the submitGameResult response for null values');
  console.log('2. Compare with working mutations (registerUser, validateUsername)');
  console.log('3. The Lambda function backing submitGameResult needs to return proper values');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { testSubmitGameResult, testOtherMutations }; 