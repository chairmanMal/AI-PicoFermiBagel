import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.malachowsky.picofermibagel',
  appName: 'PicoFermiBagel',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
