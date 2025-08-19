import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lovable.connectnationaddress',
  appName: 'connect-nation-address',
  webDir: 'dist',
  server: {
    url: 'https://167d733c-34b8-469f-89d0-223c35eb3ba1.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffffff",
      showSpinner: false
    }
  }
};

export default config;