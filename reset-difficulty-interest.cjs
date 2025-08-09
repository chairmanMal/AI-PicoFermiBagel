const { execSync } = require('child_process');

async function resetDifficultyInterest() {
  console.log('🔧 Resetting Difficulty Interest Counts in DynamoDB...\n');
  
  const TABLE_NAME = 'pfb-difficulty-interest';
  
  try {
    console.log('📋 Step 1: Checking current data in the table...');
    
    try {
      const scanResult = execSync(`aws dynamodb scan --table-name ${TABLE_NAME}`, { encoding: 'utf8' });
      console.log('Current items in table:');
      console.log(scanResult);
    } catch (error) {
      console.log('❌ Could not scan table:', error.message);
    }
    
    console.log('\n📋 Step 2: Clearing all items from the table...');
    
    try {
      // Get all items first
      const items = execSync(`aws dynamodb scan --table-name ${TABLE_NAME} --query "Items[*].difficulty.S" --output text`, { encoding: 'utf8' });
      
      if (items.trim()) {
        const difficulties = items.trim().split('\n');
        console.log(`Found ${difficulties.length} items to delete:`, difficulties);
        
        // Delete each item
        for (const difficulty of difficulties) {
          if (difficulty) {
            console.log(`Deleting item with difficulty: ${difficulty}`);
            execSync(`aws dynamodb delete-item --table-name ${TABLE_NAME} --key '{"difficulty":{"S":"${difficulty}"}}'`, { stdio: 'inherit' });
          }
        }
        console.log('✅ All items deleted successfully!');
      } else {
        console.log('✅ Table is already empty');
      }
    } catch (error) {
      console.log('❌ Error deleting items:', error.message);
    }
    
    console.log('\n📋 Step 3: Verifying the table is empty...');
    
    try {
      const verifyResult = execSync(`aws dynamodb scan --table-name ${TABLE_NAME} --query "Count" --output text`, { encoding: 'utf8' });
      console.log(`Table now contains ${verifyResult.trim()} items`);
      
      if (verifyResult.trim() === '0') {
        console.log('✅ Table successfully cleared!');
      } else {
        console.log('⚠️  Table still contains items');
      }
    } catch (error) {
      console.log('❌ Could not verify table:', error.message);
    }
    
    console.log('\n📋 Step 4: Testing the query after reset...');
    console.log('You can test the query in AppSync console with:');
    console.log(`
query TestGetDifficultyInterestCounts {
  getDifficultyInterestCounts {
    difficulty
    interestCount
    timestamp
  }
}
    `);
    
    console.log('\n✅ EXPECTED RESULTS:');
    console.log('• Query should return an empty array: []');
    console.log('• App should show "0" or no counts for all difficulties');
    console.log('• Fresh start for tracking real interest');
    
    console.log('\n📋 Step 5: Next Steps for Proper Cleanup');
    console.log('To prevent this issue in the future, consider:');
    console.log('1. Adding TTL (Time To Live) to the table');
    console.log('2. Implementing automatic cleanup when players leave');
    console.log('3. Adding heartbeat monitoring');
    console.log('4. Periodic cleanup of stale entries');
    
  } catch (error) {
    console.log('❌ Error during reset:', error.message);
  }
}

resetDifficultyInterest(); 