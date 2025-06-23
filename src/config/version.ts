// Build version configuration
// Increment BUILD_REVISION for each new build/deployment
export const VERSION_CONFIG = {
  MAJOR: 1,
  MINOR: 0,
  PATCH: 0,
  BUILD_REVISION: 5,
  BUILD_DATE: '2025-06-23', // YYYY-MM-DD format
};

export const getVersionString = () => {
  return `v${VERSION_CONFIG.MAJOR}.${VERSION_CONFIG.MINOR}.${VERSION_CONFIG.PATCH}`;
};

export const getBuildString = () => {
  return `Build ${VERSION_CONFIG.BUILD_REVISION}`;
};

export const getFullVersionString = () => {
  return `${getVersionString()} (${getBuildString()})`;
}; 