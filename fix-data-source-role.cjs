const { execSync } = require('child_process');

async function fixDataSourceRole() {
  console.log('🔧 Fixing Data Source Service Role...\n');
  
  const API_ID = 'dzdcg7gk5zco3fu57dotwhbrdu';
  
  try {
    console.log('📋 ISSUE IDENTIFIED:');
    console.log('The pfb_lobby_management data source is using the wrong service role.');
    console.log('Current: arn:aws:iam::171591329315:role/service-role/pfb-auth-service-role-rteqat4u');
    console.log('Should be: arn:aws:iam::171591329315:role/PFB-AppSync-ServiceRole (like LambdaDataSource)\n');
    
    console.log('🔧 MANUAL FIX STEPS:');
    console.log('1. Go to AWS AppSync Console');
    console.log('2. Navigate to your API: PicoFermiBagel-Multiplayer-API');
    console.log('3. Go to "Data Sources" tab');
    console.log('4. Find "pfb_lobby_management" data source');
    console.log('5. Click "Edit" button');
    console.log('6. Change the IAM role to: PFB-AppSync-ServiceRole');
    console.log('7. Click "Save" button\n');
    
    console.log('📋 ALTERNATIVE - CLI FIX:');
    console.log('If you have the right permissions, you can run:');
    console.log(`
aws appsync update-data-source \\
  --api-id ${API_ID} \\
  --name pfb_lobby_management \\
  --type AWS_LAMBDA \\
  --service-role-arn arn:aws:iam::171591329315:role/PFB-AppSync-ServiceRole \\
  --lambda-config lambdaFunctionArn=arn:aws:lambda:us-east-1:171591329315:function:pfb-lobby-management
    `);
    
    console.log('✅ After fixing the service role, test with this query:');
    console.log(`
query TestGetDifficultyInterestCounts {
  getDifficultyInterestCounts {
    difficulty
    interestCount
    timestamp
  }
}
    `);
    
    console.log('\n📋 EXPECTED RESULT:');
    console.log('• Should return difficulty interest data or empty array');
    console.log('• No more "Unauthorized" errors');
    console.log('• App will show real interest counts instead of "Interest count unavailable"');
    
  } catch (error) {
    console.log('❌ Error during fix:', error.message);
  }
}

fixDataSourceRole(); 