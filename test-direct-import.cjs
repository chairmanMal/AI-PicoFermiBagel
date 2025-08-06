const fs = require('fs');
const path = require('path');

async function testDirectImport() {
  console.log('🔧 Testing direct import...\n');
  
  try {
    // Check if the file exists and can be read
    const filePath = path.join(__dirname, 'src/services/multiplayerService.ts');
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for any import issues
    const imports = content.match(/import.*from.*['"][^'"]*['"]/g);
    if (imports) {
      console.log('📦 Imports found:');
      imports.forEach(imp => console.log('  -', imp));
    }
    
    // Check for any circular dependencies
    const importPaths = imports?.map(imp => {
      const match = imp.match(/from\s+['"]([^'"]*)['"]/);
      return match ? match[1] : null;
    }).filter(Boolean) || [];
    
    console.log('📁 Import paths:');
    importPaths.forEach(path => console.log('  -', path));
    
    // Check if any of the imported files exist
    for (const importPath of importPaths) {
      if (importPath.startsWith('.')) {
        const fullPath = path.join(__dirname, 'src/services', importPath);
        if (importPath.endsWith('.ts')) {
          if (fs.existsSync(fullPath)) {
            console.log('✅', importPath, 'exists');
          } else {
            console.log('❌', importPath, 'does not exist');
          }
        } else {
          // Check for .ts extension
          const tsPath = fullPath + '.ts';
          if (fs.existsSync(tsPath)) {
            console.log('✅', importPath + '.ts', 'exists');
          } else {
            console.log('❌', importPath, 'does not exist');
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing direct import:', error);
  }
}

testDirectImport(); 