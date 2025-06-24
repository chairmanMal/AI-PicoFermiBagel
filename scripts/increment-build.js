#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Path to the version.ts file
const versionFilePath = path.join(__dirname, '../src/config/version.ts');

// Read the current version file
const versionFileContent = fs.readFileSync(versionFilePath, 'utf8');

// Extract current build revision number
const buildRevisionMatch = versionFileContent.match(/BUILD_REVISION:\s*(\d+)/);
if (!buildRevisionMatch) {
  console.error('Could not find BUILD_REVISION in version.ts');
  process.exit(1);
}

const currentBuildRevision = parseInt(buildRevisionMatch[1]);
const newBuildRevision = currentBuildRevision + 1;

// Get current date in YYYY-MM-DD format
const today = new Date();
const buildDate = today.toISOString().split('T')[0];

// Update the version file content
const newVersionFileContent = versionFileContent
  .replace(/BUILD_REVISION:\s*\d+/, `BUILD_REVISION: ${newBuildRevision}`)
  .replace(/BUILD_DATE:\s*'[^']*'/, `BUILD_DATE: '${buildDate}'`);

// Write the updated version file
fs.writeFileSync(versionFilePath, newVersionFileContent, 'utf8');

console.log(`✅ Build number incremented: ${currentBuildRevision} → ${newBuildRevision}`);
console.log(`📅 Build date updated: ${buildDate}`); 