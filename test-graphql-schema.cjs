const fs = require('fs');
const path = require('path');

async function testGraphQLSchema() {
  console.log('🧪 Testing GraphQL Schema & Queries...\n');
  
  try {
    // Test mutations
    const mutationsPath = path.join(__dirname, 'src/graphql/mutations.ts');
    const mutationsContent = fs.readFileSync(mutationsPath, 'utf8');
    
    const requiredMutations = [
      'submitGameResult',
      'joinLobby',
      'leaveLobby',
      'registerUser',
      'validateUsername',
      'sendGamePulse'
    ];
    
    console.log('📝 Testing Mutations:');
    requiredMutations.forEach(mutation => {
      if (mutationsContent.includes(mutation)) {
        console.log(`✅ ${mutation} mutation found`);
      } else {
        console.log(`❌ ${mutation} mutation missing`);
      }
    });
    
    // Test queries
    const queriesPath = path.join(__dirname, 'src/graphql/queries.ts');
    const queriesContent = fs.readFileSync(queriesPath, 'utf8');
    
    const requiredQueries = [
      'getLeaderboard',
      'getLobbyStatus',
      'getUserStats'
    ];
    
    console.log('\n📝 Testing Queries:');
    requiredQueries.forEach(query => {
      if (queriesContent.includes(query)) {
        console.log(`✅ ${query} query found`);
      } else {
        console.log(`❌ ${query} query missing`);
      }
    });
    
    // Test subscriptions
    const subscriptionsPath = path.join(__dirname, 'src/graphql/subscriptions.ts');
    const subscriptionsContent = fs.readFileSync(subscriptionsPath, 'utf8');
    
    const requiredSubscriptions = [
      'onLobbyUpdate',
      'onGameUpdate',
      'onGameStart',
      'onGameEnd'
    ];
    
    console.log('\n📝 Testing Subscriptions:');
    requiredSubscriptions.forEach(subscription => {
      if (subscriptionsContent.includes(subscription)) {
        console.log(`✅ ${subscription} subscription found`);
      } else {
        console.log(`❌ ${subscription} subscription missing`);
      }
    });
    
    // Check for proper GraphQL syntax
    const allGraphQLFiles = [mutationsContent, queriesContent, subscriptionsContent];
    
    // Check for proper export syntax
    const exportPattern = /export const \w+ = `[\s\S]*?`;/g;
    const exports = allGraphQLFiles.flatMap(content => content.match(exportPattern) || []);
    console.log(`\n📤 Total GraphQL exports found: ${exports.length}`);
    
    // Check for proper query structure
    const queryPattern = /query \w+\([^)]*\) \{[\s\S]*?\}/g;
    const queries = allGraphQLFiles.flatMap(content => content.match(queryPattern) || []);
    console.log(`📤 Total queries found: ${queries.length}`);
    
    // Check for proper mutation structure
    const mutationPattern = /mutation \w+\([^)]*\) \{[\s\S]*?\}/g;
    const mutations = allGraphQLFiles.flatMap(content => content.match(mutationPattern) || []);
    console.log(`📤 Total mutations found: ${mutations.length}`);
    
    // Check for proper subscription structure
    const subscriptionPattern = /subscription \w+\([^)]*\) \{[\s\S]*?\}/g;
    const subscriptions = allGraphQLFiles.flatMap(content => content.match(subscriptionPattern) || []);
    console.log(`📤 Total subscriptions found: ${subscriptions.length}`);
    
    console.log('\n🎯 GraphQL schema test completed');
    
  } catch (error) {
    console.error('❌ Error testing GraphQL schema:', error);
  }
}

testGraphQLSchema(); 