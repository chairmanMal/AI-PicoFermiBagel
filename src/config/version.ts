// Build version configuration
// Increment BUILD_REVISION for each new build/deployment
export const VERSION_CONFIG = {
  MAJOR: 1,
  MINOR: 0,
  PATCH: 0,
      BUILD_REVISION: 966,
  BUILD_DATE: '2025-07-08', // YYYY-MM-DD format
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
  buildNumber: 965,
  buildDate: '2025-07-08',
  changes: [
    'FIXED: Bottom edge now properly raised 15px above screen bottom (with safe area)',
    'REPOSITIONED: Scrollbar now appears to the right of icon centerline when visible',
    'ALIGNED: Content right edge now aligns with hamburger icon centerline',
    'ADDED: Content scaling to fit within the red border container',
    'IMPROVED: Scrollbar positioning outside red border for better UX'
  ]
}; 