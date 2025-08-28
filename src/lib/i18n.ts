import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: 'es', // Default to Spanish
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',

    // Namespace configuration
    ns: ['common', 'auth', 'dashboard', 'addresses', 'emergency', 'police', 'forms', 'errors'],
    defaultNS: 'common',

    // Backend configuration
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
      requestOptions: {
        cache: 'no-cache'
      }
    },

    // Language detection
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false, // React already does escaping
    },

    // Resource versioning for cache busting
    load: 'languageOnly',
    
    // Initialize with empty resources to prevent initial loading flicker
    resources: {},

    // React specific options
    react: {
      useSuspense: false,
    },
  });

// Update HTML lang attribute when language changes
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
});

export default i18n;