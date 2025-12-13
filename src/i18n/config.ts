import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { supabase } from '@/integrations/supabase/client';

// Import translation files
import commonEN from '../locales/en/common.json';
import authEN from '../locales/en/auth.json';
import dashboardEN from '../locales/en/dashboard.json';
import addressEN from '../locales/en/address.json';
import emergencyEN from '../locales/en/emergency.json';
import adminEN from '../locales/en/admin.json';
import countriesEN from '../locales/en/countries.json';
import carEN from '../locales/en/car.json';

import commonES from '../locales/es/common.json';
import authES from '../locales/es/auth.json';
import dashboardES from '../locales/es/dashboard.json';
import addressES from '../locales/es/address.json';
import emergencyES from '../locales/es/emergency.json';
import adminES from '../locales/es/admin.json';
import countriesES from '../locales/es/countries.json';
import carES from '../locales/es/car.json';

import commonFR from '../locales/fr/common.json';
import authFR from '../locales/fr/auth.json';
import dashboardFR from '../locales/fr/dashboard.json';
import addressFR from '../locales/fr/address.json';
import emergencyFR from '../locales/fr/emergency.json';
import adminFR from '../locales/fr/admin.json';
import countriesFR from '../locales/fr/countries.json';
import carFR from '../locales/fr/car.json';

import businessEN from '../locales/en/business.json';
import businessES from '../locales/es/business.json';
import businessFR from '../locales/fr/business.json';

import postalEN from '../locales/en/postal.json';
import postalES from '../locales/es/postal.json';
import postalFR from '../locales/fr/postal.json';

const resources = {
  en: {
    common: commonEN,
    auth: authEN,
    dashboard: dashboardEN,
    address: addressEN,
    emergency: emergencyEN,
    admin: adminEN,
    countries: countriesEN,
    car: carEN,
    business: businessEN,
    postal: postalEN,
  },
  es: {
    common: commonES,
    auth: authES,
    dashboard: dashboardES,
    address: addressES,
    emergency: emergencyES,
    admin: adminES,
    countries: countriesES,
    car: carES,
    business: businessES,
    postal: postalES,
  },
  fr: {
    common: commonFR,
    auth: authFR,
    dashboard: dashboardFR,
    address: addressFR,
    emergency: emergencyFR,
    admin: adminFR,
    countries: countriesFR,
    car: carFR,
    business: businessFR,
    postal: postalFR,
  },
};

// Helper function to set nested value in an object
function setNestedValue(obj: any, path: string, value: any) {
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!current[key]) {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[keys[keys.length - 1]] = value;
}

// Load and apply translation fixes from database
async function loadTranslationFixes() {
  try {
    const { data: fixes, error } = await supabase
      .from('translation_fixes')
      .select('*')
      .eq('status', 'applied');
    
    if (error) {
      console.error('Error loading translation fixes:', error);
      return;
    }

    if (!fixes || fixes.length === 0) {
      return;
    }

    console.log(`Loading ${fixes.length} translation fixes...`);

    // Apply fixes to the resources
    fixes.forEach(fix => {
      try {
        // Apply English translation
        setNestedValue(resources.en[fix.namespace as keyof typeof resources.en], fix.key, fix.translation_en);
        
        // Apply Spanish translation
        setNestedValue(resources.es[fix.namespace as keyof typeof resources.es], fix.key, fix.translation_es);
        
        // Apply French translation
        setNestedValue(resources.fr[fix.namespace as keyof typeof resources.fr], fix.key, fix.translation_fr);
        
        console.log(`Applied fix for ${fix.namespace}:${fix.key}`);
      } catch (err) {
        console.error(`Error applying fix for ${fix.namespace}:${fix.key}:`, err);
      }
    });

    // Re-initialize i18n with updated resources
    i18n.init({
      resources,
      fallbackLng: 'en',
      supportedLngs: ['en', 'es', 'fr'],
      nonExplicitSupportedLngs: true,
      
      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage'],
        lookupLocalStorage: 'i18nextLng',
      },

      interpolation: {
        escapeValue: false,
      },

      ns: ['common', 'auth', 'dashboard', 'address', 'emergency', 'admin', 'countries', 'car', 'business'],
      defaultNS: 'common',
      
      pluralSeparator: '_',
      
      debug: process.env.NODE_ENV === 'development',
      
      saveMissing: process.env.NODE_ENV === 'development',
      missingKeyHandler: (lng, ns, key) => {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Missing translation key: ${lng}:${ns}:${key}`);
        }
      },
    });

    console.log('Translation fixes applied successfully');
  } catch (error) {
    console.error('Error in loadTranslationFixes:', error);
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'es', 'fr'],
    nonExplicitSupportedLngs: true,
    
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
    ns: ['common', 'auth', 'dashboard', 'address', 'emergency', 'admin', 'countries', 'car', 'business'],
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

// Load translation fixes after initial setup
loadTranslationFixes();

export default i18n;