const { IAMClient, ListRolesCommand, GetRoleCommand } = require('@aws-sdk/client-iam');

const iam = new IAMClient({ region: 'us-east-1' });

async function checkIAMRoles() {
  console.log('🔍 Checking IAM roles...\n');
  
  try {
    const response = await iam.send(new ListRolesCommand({}));
    
    console.log('📋 Found IAM roles:');
    const pfbRoles = response.Roles.filter(role => 
      role.RoleName.includes('PFB') || 
      role.RoleName.includes('pfb') || 
      role.RoleName.includes('AppSync') ||
      role.RoleName.includes('Lambda')
    );
    
    if (pfbRoles.length > 0) {
      console.log('\n🎯 PFB/AppSync related roles:');
      for (const role of pfbRoles) {
        console.log(`   - ${role.RoleName} (${role.Arn})`);
      }
    } else {
      console.log('\n❌ No PFB/AppSync related roles found');
    }
    
    console.log('\n📋 All roles (first 20):');
    response.Roles.slice(0, 20).forEach(role => {
      console.log(`   - ${role.RoleName}`);
    });
    
    if (response.Roles.length > 20) {
      console.log(`   ... and ${response.Roles.length - 20} more`);
    }
    
  } catch (error) {
    console.error('❌ Error checking IAM roles:', error.message);
  }
}

checkIAMRoles(); 