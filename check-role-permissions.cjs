const { IAMClient, GetRoleCommand, ListAttachedRolePoliciesCommand, GetPolicyCommand } = require('@aws-sdk/client-iam');

const iam = new IAMClient({ region: 'us-east-1' });

async function checkRolePermissions() {
  console.log('🔍 Checking PFB-Lambda-ExecutionRole permissions...\n');
  
  try {
    // Get the role details
    const roleResponse = await iam.send(new GetRoleCommand({
      RoleName: 'PFB-Lambda-ExecutionRole'
    }));
    
    console.log('📋 Role details:');
    console.log(`   Name: ${roleResponse.Role.RoleName}`);
    console.log(`   ARN: ${roleResponse.Role.Arn}`);
    console.log(`   Description: ${roleResponse.Role.Description || 'No description'}`);
    
    // Get attached policies
    const policiesResponse = await iam.send(new ListAttachedRolePoliciesCommand({
      RoleName: 'PFB-Lambda-ExecutionRole'
    }));
    
    console.log('\n📋 Attached policies:');
    for (const policy of policiesResponse.AttachedPolicies) {
      console.log(`   - ${policy.PolicyName} (${policy.PolicyArn})`);
      
      // Get policy details
      try {
        const policyResponse = await iam.send(new GetPolicyCommand({
          PolicyArn: policy.PolicyArn
        }));
        console.log(`     Description: ${policyResponse.Policy.Description || 'No description'}`);
      } catch (error) {
        console.log(`     Could not get policy details: ${error.message}`);
      }
    }
    
    if (policiesResponse.AttachedPolicies.length === 0) {
      console.log('   No attached policies found');
    }
    
  } catch (error) {
    console.error('❌ Error checking role permissions:', error.message);
  }
}

checkRolePermissions(); 