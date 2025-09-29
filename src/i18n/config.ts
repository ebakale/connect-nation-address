import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import commonEN from '../locales/en/common.json';
import authEN from '../locales/en/auth.json';
import dashboardEN from '../locales/en/dashboard.json';
import addressEN from '../locales/en/address.json';
import emergencyEN from '../locales/en/emergency.json';
import adminEN from '../locales/en/admin.json';

console.log('Loading admin.json, length:', JSON.stringify(adminEN).length);
console.log('Admin EN keys count:', Object.keys(adminEN).length);

import commonES from '../locales/es/common.json';
import authES from '../locales/es/auth.json';
import dashboardES from '../locales/es/dashboard.json';
import addressES from '../locales/es/address.json';
import emergencyES from '../locales/es/emergency.json';
import adminES from '../locales/es/admin.json';

import commonFR from '../locales/fr/common.json';
import authFR from '../locales/fr/auth.json';
import dashboardFR from '../locales/fr/dashboard.json';
import addressFR from '../locales/fr/address.json';
import emergencyFR from '../locales/fr/emergency.json';
import adminFR from '../locales/fr/admin.json';

const resources = {
  en: {
    common: commonEN,
    auth: authEN,
    dashboard: dashboardEN,
    address: addressEN,
    emergency: emergencyEN,
    admin: adminEN,
  },
  es: {
    common: commonES,
    auth: authES,
    dashboard: dashboardES,
    address: addressES,
    emergency: emergencyES,
    admin: adminES,
  },
  fr: {
    common: commonFR,
    auth: authFR,
    dashboard: dashboardFR,
    address: addressFR,
    emergency: emergencyFR,
    admin: adminFR,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    lng: 'en', // default language
    
    // Language detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    // Namespace and key separator
    ns: ['common', 'auth', 'dashboard', 'address', 'emergency', 'admin'],
    defaultNS: 'common',
    
    // Pluralization
    pluralSeparator: '_',
    
    // Debug mode (disable in production)
    debug: process.env.NODE_ENV === 'development',
    
    // Handle missing keys
    saveMissing: process.env.NODE_ENV === 'development',
    missingKeyHandler: (lng, ns, key) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation key: ${lng}:${ns}:${key}`);
      }
    },
  });

export default i18n;