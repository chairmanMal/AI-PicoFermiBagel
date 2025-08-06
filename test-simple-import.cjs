const fs = require('fs');
const path = require('path');

async function testSimpleImport() {
  console.log('🔧 Testing simple import...\n');
  
  try {
    // Check if the file has any syntax errors by trying to parse it
    const filePath = path.join(__dirname, 'src/services/multiplayerService.ts');
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for common syntax issues
    const issues = [];
    
    // Check for unmatched braces
    const openBraces = (content.match(/\{/g) || []).length;
    const closeBraces = (content.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) {
      issues.push(`Unmatched braces: ${openBraces} open, ${closeBraces} close`);
    }
    
    // Check for unmatched parentheses
    const openParens = (content.match(/\(/g) || []).length;
    const closeParens = (content.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      issues.push(`Unmatched parentheses: ${openParens} open, ${closeParens} close`);
    }
    
    // Check for unmatched brackets
    const openBrackets = (content.match(/\[/g) || []).length;
    const closeBrackets = (content.match(/\]/g) || []).length;
    if (openBrackets !== closeBrackets) {
      issues.push(`Unmatched brackets: ${openBrackets} open, ${closeBrackets} close`);
    }
    
    if (issues.length > 0) {
      console.log('❌ Syntax issues found:');
      issues.forEach(issue => console.log('  -', issue));
    } else {
      console.log('✅ No obvious syntax issues found');
    }
    
    // Check for the debugging logs
    if (content.includes('🔧 MultiplayerService: mutations imported:')) {
      console.log('✅ Debugging logs present');
    } else {
      console.log('❌ Debugging logs missing');
    }
    
    // Check for the getLeaderboard method
    if (content.includes('async getLeaderboard')) {
      console.log('✅ getLeaderboard method present');
    } else {
      console.log('❌ getLeaderboard method missing');
    }
    
    // Check for the export
    if (content.includes('export default multiplayerService')) {
      console.log('✅ Default export present');
    } else {
      console.log('❌ Default export missing');
    }
    
  } catch (error) {
    console.error('❌ Error testing import:', error);
  }
}

testSimpleImport(); 