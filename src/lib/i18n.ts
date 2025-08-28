import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations directly as a fallback
import commonEn from '../../public/locales/en/common.json';
import commonEs from '../../public/locales/es/common.json';

const resources = {
  en: {
    common: commonEn,
  },
  es: {
    common: commonEs,
  },
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: 'es', // Default to Spanish
    fallbackLng: 'en',
    debug: true, // Enable debug to see what's happening
    
    // Include resources directly for immediate availability
    resources,

    // Namespace configuration
    ns: ['common', 'auth', 'dashboard', 'addresses', 'emergency', 'police', 'forms', 'errors'],
    defaultNS: 'common',

    // Backend configuration for loading additional translation files
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

    // Load immediately without waiting
    load: 'languageOnly',
    
    // Preload both languages
    preload: ['es', 'en'],
    
    // React specific options
    react: {
      useSuspense: false,
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p'],
    },

    // Ensure initialization is complete
    initImmediate: false,
  });

// Update HTML lang attribute when language changes
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
  console.log('Language changed to:', lng);
});

// Log initialization status
i18n.on('initialized', () => {
  console.log('i18n initialized successfully');
  console.log('Current language:', i18n.language);
  console.log('Available resources:', Object.keys(i18n.getResourceBundle(i18n.language, 'common') || {}));
});

// Log when resources are loaded
i18n.on('loaded', (loaded) => {
  console.log('i18n resources loaded:', loaded);
});

export default i18n;