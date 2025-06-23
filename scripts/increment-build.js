#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const versionFilePath = path.join(__dirname, '..', 'src', 'config', 'version.ts');

try {
  // Read the current version file
  let content = fs.readFileSync(versionFilePath, 'utf8');
  
  // Extract current build revision
  const buildRevisionMatch = content.match(/BUILD_REVISION:\s*(\d+)/);
  if (!buildRevisionMatch) {
    throw new Error('Could not find BUILD_REVISION in version file');
  }
  
  const currentRevision = parseInt(buildRevisionMatch[1]);
  const newRevision = currentRevision + 1;
  
  // Update the build revision
  content = content.replace(
    /BUILD_REVISION:\s*\d+/,
    `BUILD_REVISION: ${newRevision}`
  );
  
  // Update the build date
  const today = new Date().toISOString().split('T')[0];
  content = content.replace(
    /BUILD_DATE:\s*new Date\(\)\.toISOString\(\)\.split\('T'\)\[0\]/,
    `BUILD_DATE: '${today}'`
  );
  
  // Write the updated content back
  fs.writeFileSync(versionFilePath, content);
  
  console.log(`✅ Build revision incremented: ${currentRevision} → ${newRevision}`);
  console.log(`📅 Build date updated: ${today}`);
  
} catch (error) {
  console.error('❌ Error incrementing build revision:', error.message);
  process.exit(1);
} 