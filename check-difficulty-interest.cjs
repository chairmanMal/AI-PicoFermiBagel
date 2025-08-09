const { execSync } = require('child_process');

async function checkDifficultyInterest() {
  console.log('🔍 Checking Difficulty Interest Table Contents...\n');
  
  try {
    console.log('📋 Scanning pfb-difficulty-interest table...');
    const result = execSync('aws dynamodb scan --table-name pfb-difficulty-interest', { encoding: 'utf8' });
    console.log('Table contents:');
    console.log(result);
    
    // Parse the JSON output
    const data = JSON.parse(result);
    console.log('\n📋 Parsed data:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.Items && data.Items.length > 0) {
      console.log('\n📋 Found items:');
      data.Items.forEach((item, index) => {
        console.log(`${index + 1}. Difficulty: ${item.difficulty?.S}, Count: ${item.interestCount?.N}, Updated: ${item.lastUpdated?.S}`);
      });
    } else {
      console.log('\n✅ Table is empty - this is correct for a fresh start');
    }
    
  } catch (error) {
    console.log('❌ Error checking table:', error.message);
  }
}

checkDifficultyInterest(); 