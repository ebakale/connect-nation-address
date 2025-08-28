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
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init(i18nConfig);

export default i18n;