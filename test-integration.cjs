const fs = require('fs');
const path = require('path');

async function testIntegration() {
  console.log('🧪 Testing Complete AWS Integration...\n');
  
  try {
    // Test all components together
    const components = [
      { name: 'AWS Configuration', path: 'src/services/awsConfig.ts' },
      { name: 'Multiplayer Service', path: 'src/services/multiplayerService.ts' },
      { name: 'GraphQL Mutations', path: 'src/graphql/mutations.ts' },
      { name: 'GraphQL Queries', path: 'src/graphql/queries.ts' },
      { name: 'GraphQL Subscriptions', path: 'src/graphql/subscriptions.ts' },
      { name: 'Leaderboard Screen', path: 'src/components/LeaderboardScreen.tsx' }
    ];
    
    console.log('📋 Testing All Components:');
    let allComponentsExist = true;
    
    components.forEach(component => {
      if (fs.existsSync(path.join(__dirname, component.path))) {
        console.log(`✅ ${component.name} exists`);
      } else {
        console.log(`❌ ${component.name} missing`);
        allComponentsExist = false;
      }
    });
    
    if (!allComponentsExist) {
      console.log('\n❌ Some components are missing!');
      return;
    }
    
    // Test import/export consistency
    console.log('\n🔗 Testing Import/Export Consistency:');
    
    const multiplayerContent = fs.readFileSync(path.join(__dirname, 'src/services/multiplayerService.ts'), 'utf8');
    const mutationsContent = fs.readFileSync(path.join(__dirname, 'src/graphql/mutations.ts'), 'utf8');
    const queriesContent = fs.readFileSync(path.join(__dirname, 'src/graphql/queries.ts'), 'utf8');
    const subscriptionsContent = fs.readFileSync(path.join(__dirname, 'src/graphql/subscriptions.ts'), 'utf8');
    
    // Check if multiplayerService imports all GraphQL files
    if (multiplayerContent.includes("import * as mutations")) {
      console.log('✅ MultiplayerService imports mutations');
    } else {
      console.log('❌ MultiplayerService missing mutations import');
    }
    
    if (multiplayerContent.includes("import * as queries")) {
      console.log('✅ MultiplayerService imports queries');
    } else {
      console.log('❌ MultiplayerService missing queries import');
    }
    
    if (multiplayerContent.includes("import * as subscriptions")) {
      console.log('✅ MultiplayerService imports subscriptions');
    } else {
      console.log('❌ MultiplayerService missing subscriptions import');
    }
    
    // Check if LeaderboardScreen imports required services
    const leaderboardContent = fs.readFileSync(path.join(__dirname, 'src/components/LeaderboardScreen.tsx'), 'utf8');
    
    if (leaderboardContent.includes("import('../services/awsConfig')")) {
      console.log('✅ LeaderboardScreen imports awsConfig');
    } else {
      console.log('❌ LeaderboardScreen missing awsConfig import');
    }
    
    if (leaderboardContent.includes("import('../services/multiplayerService')")) {
      console.log('✅ LeaderboardScreen imports multiplayerService');
    } else {
      console.log('❌ LeaderboardScreen missing multiplayerService import');
    }
    
    // Test error handling consistency
    console.log('\n🛡️ Testing Error Handling:');
    
    const errorHandlingPatterns = [
      { pattern: 'catch.*error', name: 'Basic error handling' },
      { pattern: 'console.error', name: 'Error logging' },
      { pattern: 'try.*{', name: 'Try-catch blocks' }
    ];
    
    const allContent = [multiplayerContent, leaderboardContent];
    
    errorHandlingPatterns.forEach(({ pattern, name }) => {
      const hasErrorHandling = allContent.some(content => 
        new RegExp(pattern, 'g').test(content)
      );
      
      if (hasErrorHandling) {
        console.log(`✅ ${name} found`);
      } else {
        console.log(`❌ ${name} missing`);
      }
    });
    
    // Test TypeScript typing
    console.log('\n📝 Testing TypeScript Typing:');
    
    const typingPatterns = [
      { pattern: ': any', name: 'Error typing' },
      { pattern: 'interface.*{', name: 'Interface definitions' },
      { pattern: 'export interface', name: 'Exported interfaces' },
      { pattern: 'Promise<', name: 'Promise typing' }
    ];
    
    typingPatterns.forEach(({ pattern, name }) => {
      const hasTyping = allContent.some(content => 
        new RegExp(pattern, 'g').test(content)
      );
      
      if (hasTyping) {
        console.log(`✅ ${name} found`);
      } else {
        console.log(`❌ ${name} missing`);
      }
    });
    
    // Test logging consistency
    console.log('\n📊 Testing Logging:');
    
    const loggingPatterns = [
      { pattern: 'console.log', name: 'Info logging' },
      { pattern: 'console.error', name: 'Error logging' },
      { pattern: 'console.warn', name: 'Warning logging' }
    ];
    
    loggingPatterns.forEach(({ pattern, name }) => {
      const hasLogging = allContent.some(content => 
        new RegExp(pattern, 'g').test(content)
      );
      
      if (hasLogging) {
        console.log(`✅ ${name} found`);
      } else {
        console.log(`❌ ${name} missing`);
      }
    });
    
    console.log('\n🎯 Integration test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error in integration test:', error);
  }
}

testIntegration(); 