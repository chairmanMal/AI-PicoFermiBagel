const fs = require('fs');
const path = require('path');

async function debugQueriesImport() {
  console.log('🔧 Adding debugging to queries import...\n');
  
  const multiplayerServicePath = path.join(__dirname, 'src/services/multiplayerService.ts');
  
  // Read the current file
  let content = fs.readFileSync(multiplayerServicePath, 'utf8');
  
  // Add debugging after the imports
  const updatedImports = `// src/services/multiplayerService.ts
import { generateClient } from 'aws-amplify/api';
import { v4 as uuidv4 } from 'uuid';
import * as mutations from '../graphql/mutations';
import * as queries from '../graphql/queries';
import * as subscriptions from '../graphql/subscriptions';

// Debug imports
console.log('🔧 MultiplayerService: mutations imported:', Object.keys(mutations));
console.log('🔧 MultiplayerService: queries imported:', Object.keys(queries));
console.log('🔧 MultiplayerService: subscriptions imported:', Object.keys(subscriptions));
console.log('🔧 MultiplayerService: getLeaderboard query:', queries.getLeaderboard);`;
  
  // Replace the imports section
  const importRegex = /\/\/ src\/services\/multiplayerService\.ts[\s\S]*?import \* as subscriptions from '\.\.\/graphql\/subscriptions';/;
  
  if (importRegex.test(content)) {
    content = content.replace(importRegex, updatedImports);
    fs.writeFileSync(multiplayerServicePath, content);
    console.log('✅ Successfully added debugging to queries import');
  } else {
    console.log('❌ Could not find the imports section to replace');
  }
}

debugQueriesImport(); 