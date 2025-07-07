// Build version configuration
// Increment BUILD_REVISION for each new build/deployment
export const VERSION_CONFIG = {
  MAJOR: 1,
  MINOR: 0,
  PATCH: 0,
      BUILD_REVISION: 924,
  BUILD_DATE: '2025-07-07', // YYYY-MM-DD format
};

export const getVersionString = () => {
  return `v${VERSION_CONFIG.MAJOR}.${VERSION_CONFIG.MINOR}.${VERSION_CONFIG.PATCH}`;
};

export const getBuildString = () => {
  return `Build ${VERSION_CONFIG.BUILD_REVISION}`;
};

export const getBuildDateString = () => {
  return VERSION_CONFIG.BUILD_DATE;
};

export const getFullVersionString = () => {
  return `${getVersionString()} (${getBuildString()}, ${getBuildDateString()})`;
};

export const version = {
  buildNumber: 918,
  buildDate: '2025-07-07',
  changes: [
    'CRITICAL FIX: Touch-outside-to-close now works EVERYWHERE including below drawers',
    'Enhanced overlay click/touch handlers with better event prevention',
    'Added comprehensive debugging for drawer touch detection',
    'Improved event handling to prevent conflicts between overlays and touch detection',
    'Better visual feedback and logging for touch interactions',
    'Fixed drawer closing behavior for all screen areas outside drawer content'
  ]
}; 