console.log('🧹 Browser Storage Cleanup Guide\n');

console.log('📋 To clear any stale browser data that might be cached:');
console.log('\n1. Open Developer Tools in each device/browser');
console.log('2. Go to Application/Storage tab');
console.log('3. Clear localStorage and sessionStorage for your app domain');
console.log('4. Or run this in browser console:');

console.log('\n--- Copy this into browser console ---');
console.log(`
// Clear all localStorage
Object.keys(localStorage).forEach(key => {
  console.log('Removing localStorage key:', key, 'value:', localStorage.getItem(key));
  localStorage.removeItem(key);
});

// Clear all sessionStorage
Object.keys(sessionStorage).forEach(key => {
  console.log('Removing sessionStorage key:', key, 'value:', sessionStorage.getItem(key));
  sessionStorage.removeItem(key);
});

console.log('✅ Browser storage cleared - reload the app');
`);

console.log('\n5. Reload the app after clearing storage');
console.log('\n🎯 This will ensure no stale interest count data is cached locally');

// Also check what localStorage keys we expect
console.log('\n📋 Expected localStorage keys in the app:');
console.log('- pfb_username: User authentication');
console.log('- pfb_global_username: Global username');
console.log('- pfb_current_user: User profile data');
console.log('- pfb_previous_usernames: Username history');
console.log('- pfb_user_registered: Registration status');
console.log('\n❌ Should NOT see any keys related to:');
console.log('- difficulty_interest');
console.log('- interest_counts'); 
console.log('- lobby_data');
console.log('- Any cached multiplayer data'); 