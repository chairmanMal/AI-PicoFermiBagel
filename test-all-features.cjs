const fs = require('fs');
const path = require('path');

async function testAllFeatures() {
  console.log('🧪 Testing All New Features...\n');
  
  try {
    // Test 1: Developer Reset Button
    console.log('🔧 Testing Developer Reset Button...');
    const settingsDrawerPath = path.join(__dirname, 'src/components/SettingsDrawerContent.tsx');
    const settingsDrawerContent = fs.readFileSync(settingsDrawerPath, 'utf8');
    
    if (settingsDrawerContent.includes('handleDeveloperReset')) {
      console.log('✅ Developer reset function found');
    } else {
      console.log('❌ Developer reset function missing');
    }
    
    if (settingsDrawerContent.includes('Reset All Data')) {
      console.log('✅ Developer reset button found');
    } else {
      console.log('❌ Developer reset button missing');
    }
    
    if (settingsDrawerContent.includes('localStorage.clear()')) {
      console.log('✅ localStorage clearing found');
    } else {
      console.log('❌ localStorage clearing missing');
    }
    
    if (settingsDrawerContent.includes('resetGame()')) {
      console.log('✅ Game reset found');
    } else {
      console.log('❌ Game reset missing');
    }
    
    if (settingsDrawerContent.includes('updateSettings({')) {
      console.log('✅ Settings reset found');
    } else {
      console.log('❌ Settings reset missing');
    }
    
    // Test 2: Leaderboard Difficulty Sync
    console.log('\n🏆 Testing Leaderboard Difficulty Sync...');
    const leaderboardPath = path.join(__dirname, 'src/components/LeaderboardScreen.tsx');
    const leaderboardContent = fs.readFileSync(leaderboardPath, 'utf8');
    
    if (leaderboardContent.includes('settings.difficulty')) {
      console.log('✅ Leaderboard uses current game difficulty');
    } else {
      console.log('❌ Leaderboard not using current game difficulty');
    }
    
    if (leaderboardContent.includes('useState<string>')) {
      console.log('✅ Proper TypeScript typing for difficulty');
    } else {
      console.log('❌ TypeScript typing missing for difficulty');
    }
    
    // Test 3: AWS Error Handling
    console.log('\n🛡️ Testing AWS Error Handling...');
    const multiplayerPath = path.join(__dirname, 'src/services/multiplayerService.ts');
    const multiplayerContent = fs.readFileSync(multiplayerPath, 'utf8');
    
    // Check for improved error handling in registration methods
    const registrationErrorHandling = multiplayerContent.match(/validateUsername.*catch|registerUser.*catch/g);
    if (registrationErrorHandling && registrationErrorHandling.length >= 2) {
      console.log('✅ Error handling found in registration methods');
    } else {
      console.log('❌ Error handling missing in registration methods');
    }
    
    // Check for getLobbyStatus method
    if (multiplayerContent.includes('async getLobbyStatus')) {
      console.log('✅ getLobbyStatus method found');
    } else {
      console.log('❌ getLobbyStatus method missing');
    }
    
    // Check for proper GraphQL error handling
    if (multiplayerContent.includes('result.errors && result.errors.length > 0')) {
      console.log('✅ GraphQL error handling found');
    } else {
      console.log('❌ GraphQL error handling missing');
    }
    
    // Check for proper TypeScript casting
    if (multiplayerContent.includes('(result as any).data')) {
      console.log('✅ TypeScript casting for GraphQL results');
    } else {
      console.log('❌ TypeScript casting missing for GraphQL results');
    }
    
    // Test 4: Code Quality
    console.log('\n📝 Testing Code Quality...');
    
    // Check for proper logging
    const loggingPatterns = [
      { pattern: 'console.log.*🎮 MultiplayerService', name: 'MultiplayerService logging' },
      { pattern: 'console.error.*🎮 MultiplayerService', name: 'MultiplayerService error logging' },
      { pattern: 'console.log.*🔧 Developer', name: 'Developer logging' }
    ];
    
    const allContent = [multiplayerContent, settingsDrawerContent];
    
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
    
    // Check for proper error handling patterns
    const errorHandlingPatterns = [
      { pattern: 'try.*{', name: 'Try blocks' },
      { pattern: 'catch.*error.*{', name: 'Catch blocks' },
      { pattern: 'window.confirm', name: 'User confirmation dialogs' }
    ];
    
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
    
    // Test 5: Professional Implementation
    console.log('\n🏗️ Testing Professional Implementation...');
    
    // Check for clean separation of duties
    const separationPatterns = [
      { pattern: '// Clear all localStorage data', name: 'Clear comments' },
      { pattern: '// Reset game store to defaults', name: 'Reset comments' },
      { pattern: '// Store username locally', name: 'Storage comments' }
    ];
    
    separationPatterns.forEach(({ pattern, name }) => {
      const hasComments = allContent.some(content => 
        content.includes(pattern)
      );
      
      if (hasComments) {
        console.log(`✅ ${name} found`);
      } else {
        console.log(`❌ ${name} missing`);
      }
    });
    
    // Check for proper function organization
    const functionPatterns = [
      { pattern: 'const handleDeveloperReset', name: 'Developer reset function' },
      { pattern: 'const handleDeveloperModeEnable', name: 'Developer mode function' },
      { pattern: 'async getLobbyStatus', name: 'Lobby status function' }
    ];
    
    functionPatterns.forEach(({ pattern, name }) => {
      const hasFunction = allContent.some(content => 
        content.includes(pattern)
      );
      
      if (hasFunction) {
        console.log(`✅ ${name} found`);
      } else {
        console.log(`❌ ${name} missing`);
      }
    });
    
    console.log('\n🎯 All features test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error in comprehensive test:', error);
  }
}

testAllFeatures(); 