const fs = require('fs');
const path = require('path');

async function testUserRegistration() {
  console.log('🧪 Testing User Registration & Validation...\n');
  
  try {
    const multiplayerPath = path.join(__dirname, 'src/services/multiplayerService.ts');
    const multiplayerContent = fs.readFileSync(multiplayerPath, 'utf8');
    
    // Test validateUsername method
    if (multiplayerContent.includes('async validateUsername')) {
      console.log('✅ validateUsername method found');
    } else {
      console.log('❌ validateUsername method missing');
    }
    
    // Test registerUser method
    if (multiplayerContent.includes('async registerUser')) {
      console.log('✅ registerUser method found');
    } else {
      console.log('❌ registerUser method missing');
    }
    
    // Test hasRegisteredUsername method
    if (multiplayerContent.includes('async hasRegisteredUsername')) {
      console.log('✅ hasRegisteredUsername method found');
    } else {
      console.log('❌ hasRegisteredUsername method missing');
    }
    
    // Test getStoredUsername method
    if (multiplayerContent.includes('getStoredUsername')) {
      console.log('✅ getStoredUsername method found');
    } else {
      console.log('❌ getStoredUsername method missing');
    }
    
    // Check for proper interfaces
    if (multiplayerContent.includes('interface UserRegistrationResult')) {
      console.log('✅ UserRegistrationResult interface found');
    } else {
      console.log('❌ UserRegistrationResult interface missing');
    }
    
    // Check for device ID handling
    if (multiplayerContent.includes('deviceId')) {
      console.log('✅ Device ID handling found');
    } else {
      console.log('❌ Device ID handling missing');
    }
    
    // Check for localStorage usage
    if (multiplayerContent.includes('localStorage')) {
      console.log('✅ localStorage usage found');
    } else {
      console.log('❌ localStorage usage missing');
    }
    
    // Check for error handling in registration
    const registrationErrorHandling = multiplayerContent.match(/validateUsername.*catch|registerUser.*catch/g);
    if (registrationErrorHandling && registrationErrorHandling.length >= 2) {
      console.log('✅ Error handling found in registration methods');
    } else {
      console.log('❌ Error handling missing in registration methods');
    }
    
    console.log('\n🎯 User registration test completed');
    
  } catch (error) {
    console.error('❌ Error testing user registration:', error);
  }
}

testUserRegistration(); 