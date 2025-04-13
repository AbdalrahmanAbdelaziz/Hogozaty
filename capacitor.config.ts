import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'Healzy',
  webDir: 'dist',
  server: {
    cleartext: true,
    allowNavigation: ['192.168.100.19']
  },
  android: {
    allowMixedContent: true
  }
};

export default config;