const fs = require('fs');
const path = require('path');

async function debugDynamicImport() {
  console.log('🔧 Adding debugging to dynamic import...\n');
  
  const leaderboardScreenPath = path.join(__dirname, 'src/components/LeaderboardScreen.tsx');
  
  // Read the current file
  let content = fs.readFileSync(leaderboardScreenPath, 'utf8');
  
  // Add debugging around the dynamic imports
  const updatedLoadFunction = `  // Load leaderboard data from AWS when component mounts
  useEffect(() => {
    const loadLeaderboardFromAWS = async () => {
      try {
        console.log('🏆 LeaderboardScreen: Loading leaderboard data from AWS for difficulty:', selectedDifficulty);
        
        // Initialize AWS first
        console.log('🏆 LeaderboardScreen: About to import awsConfig...');
        const { initializeAWS } = await import('../services/awsConfig');
        console.log('🏆 LeaderboardScreen: awsConfig imported successfully');
        initializeAWS();
        console.log('🏆 LeaderboardScreen: AWS initialized');
        
        // Import multiplayerService dynamically to avoid circular dependencies
        console.log('🏆 LeaderboardScreen: About to import multiplayerService...');
        const { default: multiplayerService } = await import('../services/multiplayerService');
        console.log('🏆 LeaderboardScreen: multiplayerService imported successfully');
        console.log('🏆 LeaderboardScreen: multiplayerService methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(multiplayerService)));
        
        console.log('🏆 LeaderboardScreen: About to call getLeaderboard...');
        const awsData = await multiplayerService.getLeaderboard(selectedDifficulty, 20);
        console.log('🏆 LeaderboardScreen: AWS leaderboard data:', awsData);
        
        if (awsData && awsData.length > 0) {
          // Convert AWS data format to local format
          const convertedData: LeaderboardEntry[] = awsData.map(entry => ({
            id: entry.rank?.toString() || Math.random().toString(),
            playerName: entry.username,
            score: entry.score,
            guesses: 0, // AWS doesn't provide this
            timeMinutes: 0, // AWS doesn't provide this
            difficulty: entry.difficulty,
            timestamp: new Date(entry.timestamp)
          }));
          
          console.log('🏆 LeaderboardScreen: Converted AWS data:', convertedData);
          setLeaderboardData(convertedData);
          setLastUpdated(new Date());
          setDataSource('aws');
        } else {
          console.log('🏆 LeaderboardScreen: No AWS data found, using local data');
          const difficultyData = leaderboard.get(selectedDifficulty) || [];
          setLeaderboardData(difficultyData);
          setLastUpdated(new Date());
          setDataSource('local');
        }
      } catch (error) {
        console.error('🏆 LeaderboardScreen: Error loading from AWS:', error);
        console.error('🏆 LeaderboardScreen: Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        console.log('🏆 LeaderboardScreen: Falling back to local data');
        const difficultyData = leaderboard.get(selectedDifficulty) || [];
        setLeaderboardData(difficultyData);
        setLastUpdated(new Date());
        setDataSource('local');
      }
    };
    
    loadLeaderboardFromAWS();
  }, [selectedDifficulty]);`;
  
  // Find and replace the loadLeaderboardFromAWS function
  const oldFunctionRegex = /\/\/ Load leaderboard data from AWS when component mounts[\s\S]*?loadLeaderboardFromAWS\(\);[\s\S]*?}, \[selectedDifficulty\]\);/;
  
  if (oldFunctionRegex.test(content)) {
    content = content.replace(oldFunctionRegex, updatedLoadFunction);
    fs.writeFileSync(leaderboardScreenPath, content);
    console.log('✅ Successfully added debugging to dynamic import');
  } else {
    console.log('❌ Could not find the loadLeaderboardFromAWS function to replace');
  }
}

debugDynamicImport(); 