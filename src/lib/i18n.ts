import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

const i18nConfig = {
  fallbackLng: 'en',
  lng: 'es', // Default to Spanish
  debug: import.meta.env.DEV,
  
  interpolation: {
    escapeValue: false,
  },
  
  backend: {
    loadPath: '/locales/{{lng}}/{{ns}}.json',
    // Cache translations for performance
    requestOptions: {
      cache: 'default',
    },
  },
  
  detection: {
    order: ['localStorage', 'navigator', 'htmlTag'],
    caches: ['localStorage'],
    lookupLocalStorage: 'i18nextLng',
  },
  
  ns: ['common', 'auth', 'dashboard', 'errors', 'forms', 'addresses', 'emergency', 'police'],
  defaultNS: 'common',
  
  react: {
    useSuspense: false,
  },
  
  // Load namespaces on demand for performance
  partialBundledLanguages: true,
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init(i18nConfig)
  .then(() => {
    // Update HTML lang attribute on language change
    i18n.on('languageChanged', (lng) => {
      document.documentElement.lang = lng;
    });
    
    // Set initial HTML lang
    document.documentElement.lang = i18n.language;
  });

export default i18n;