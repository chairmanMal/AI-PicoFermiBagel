// src/config/version.ts
export const BUILD_REVISION = 49;
export const BUILD_DATE = '2025-08-07';
export const VERSION = '1.0.0';

export const getVersionString = () => {
  return `${VERSION} (Build ${BUILD_REVISION}, ${BUILD_DATE})`;
};

export const getBuildInfo = () => {
  return {
    version: VERSION,
    buildRevision: BUILD_REVISION,
    buildDate: BUILD_DATE,
    versionString: getVersionString()
  };
}; 