// Build version configuration
// Increment BUILD_REVISION for each new build/deployment
export const VERSION_CONFIG = {
  MAJOR: 1,
  MINOR: 0,
  PATCH: 0,
      BUILD_REVISION: 1521,
  BUILD_DATE: '2025-07-28', // YYYY-MM-DD format
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
  buildNumber: 985,
  buildDate: '2025-07-08',
  changes: [
    'FIXED: Red box upper right corner now properly positioned below icon (top: 111px)',
    'EXPANDED: Green border now extends to red border horizontally (margin: 0)',
    'INCREASED: Height to 500px to cover entire Score element including game details',
    'IMPROVED: Scrollbar positioning with 25px right padding to abut content',
    'OPTIMIZED: Content width to 395px to accommodate scrollbar space properly'
  ]
}; 