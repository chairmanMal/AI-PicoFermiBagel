const { IAMClient, AttachUserPolicyCommand } = require('@aws-sdk/client-iam');

const iam = new IAMClient({ region: 'us-east-1' });

async function addPassRolePermission() {
  console.log('🔧 Adding missing iam:PassRole permission...\n');
  
  const policy = {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Action: "iam:PassRole",
        Resource: "arn:aws:iam::171591329315:role/PFB-AppSync-ServiceRole"
      }
    ]
  };
  
  try {
    console.log('🔧 Attaching PassRole policy...');
    
    await iam.send(new AttachUserPolicyCommand({
      UserName: 'chris@malachowsky.com',
      PolicyArn: 'arn:aws:iam::171591329315:policy/PassRolePolicy'
    }));
    
    console.log('✅ Successfully added PassRole permission');
    
  } catch (error) {
    console.error('❌ Error adding PassRole permission:', error.message);
    console.log('\n💡 You may need to create the policy first. Here\'s the policy JSON:');
    console.log(JSON.stringify(policy, null, 2));
  }
}

addPassRolePermission(); 