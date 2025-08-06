// src/config/version.ts
export const VERSION = '1.0.0';
export const BUILD_REVISION = 27;
export const BUILD_DATE = '2025-08-06';

export const getVersionString = () => {
  return `${VERSION} (Build ${BUILD_REVISION})`;
};

export const getBuildInfo = () => {
  return {
    version: VERSION,
    buildRevision: BUILD_REVISION,
    buildDate: BUILD_DATE,
    versionString: getVersionString()
  };
}; 