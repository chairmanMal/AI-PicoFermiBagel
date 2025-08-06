const fs = require('fs');
const path = require('path');

async function testModuleLoad() {
  console.log('🔧 Testing module load...\n');
  
  try {
    // Check if there are any TypeScript compilation issues
    const filePath = path.join(__dirname, 'src/services/multiplayerService.ts');
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for any TypeScript-specific syntax that might cause issues
    const issues = [];
    
    // Check for any type annotations that might cause issues
    const typeAnnotations = content.match(/:\s*[A-Za-z<>\[\]{}|&,]+/g);
    if (typeAnnotations) {
      console.log('📝 Type annotations found:', typeAnnotations.length);
    }
    
    // Check for any interface definitions
    const interfaces = content.match(/interface\s+[A-Za-z]+/g);
    if (interfaces) {
      console.log('📋 Interfaces found:', interfaces.length);
    }
    
    // Check for any class definitions
    const classes = content.match(/class\s+[A-Za-z]+/g);
    if (classes) {
      console.log('🏗️  Classes found:', classes.length);
    }
    
    // Check for any export statements
    const exports = content.match(/export\s+/g);
    if (exports) {
      console.log('📤 Exports found:', exports.length);
    }
    
    // Check for any import statements
    const imports = content.match(/import\s+/g);
    if (imports) {
      console.log('📥 Imports found:', imports.length);
    }
    
    // Check for any console.log statements
    const consoleLogs = content.match(/console\.log/g);
    if (consoleLogs) {
      console.log('📝 Console.log statements found:', consoleLogs.length);
    }
    
    // Check for any debugging logs
    const debugLogs = content.match(/🔧 MultiplayerService:/g);
    if (debugLogs) {
      console.log('🔧 Debug logs found:', debugLogs.length);
    }
    
    // Check for any error handling
    const errorHandling = content.match(/catch\s*\(/g);
    if (errorHandling) {
      console.log('⚠️  Error handling found:', errorHandling.length);
    }
    
    // Check for any async functions
    const asyncFunctions = content.match(/async\s+function/g);
    if (asyncFunctions) {
      console.log('⚡ Async functions found:', asyncFunctions.length);
    }
    
    // Check for any await statements
    const awaitStatements = content.match(/await\s+/g);
    if (awaitStatements) {
      console.log('⏳ Await statements found:', awaitStatements.length);
    }
    
  } catch (error) {
    console.error('❌ Error testing module load:', error);
  }
}

testModuleLoad(); 