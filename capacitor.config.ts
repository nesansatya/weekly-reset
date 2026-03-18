import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.weeklyresat.app',
  appName: 'Weekly Reset',
  webDir: 'out',
  server: {
    url: 'https://weekly-reset.vercel.app',
    cleartext: true,
  },
};

export default config;