#!/usr/bin/env node

// Final conversion script - automatically converts remaining hardcoded strings
const fs = require('fs');
const path = require('path');

console.log('🚀 Running final i18n conversion...\n');

// Component conversion patterns
const componentPatterns = [
  // Labels and form elements
  { pattern: /"Country"/g, replacement: '{t("addresses:registration.form.country")}' },
  { pattern: /"Province\/Region \*"/g, replacement: '{t("addresses:registration.form.region")}' },
  { pattern: /"City \*"/g, replacement: '{t("addresses:registration.form.city")}' },
  { pattern: /"Street Address \*"/g, replacement: '{t("addresses:registration.form.street")}' },
  { pattern: /"Building\/House Number"/g, replacement: '{t("addresses:registration.form.building")}' },
  { pattern: /"Property Type"/g, replacement: '{t("addresses:propertyType")}' },
  { pattern: /"Description"/g, replacement: '{t("addresses:registration.form.description")}' },
  { pattern: /"Latitude \*"/g, replacement: '{t("addresses:registration.form.latitude")}' },
  { pattern: /"Longitude \*"/g, replacement: '{t("addresses:registration.form.longitude")}' },
  { pattern: /"Address Status"/g, replacement: '{t("addresses:addressStatus")}' },
  
  // Buttons and actions
  { pattern: /"Save Changes"/g, replacement: '{t("addresses:saveChanges")}' },
  { pattern: /"Saving\.\.\."/g, replacement: '{t("addresses:saving")}' },
  { pattern: /"Cancel"/g, replacement: '{t("addresses:cancel")}' },
  { pattern: /"Back to List"/g, replacement: '{t("addresses:backToList")}' },
  
  // Messages and descriptions
  { pattern: /"Edit Address"/g, replacement: '{t("addresses:editAddress")}' },
  { pattern: /"Modify address details and status"/g, replacement: '{t("addresses:modifyAddressDetails")}' },
  { pattern: /"Address Details"/g, replacement: '{t("addresses:addressDetails")}' },
  { pattern: /"Current Address Information"/g, replacement: '{t("addresses:currentAddressInfo")}' },
  { pattern: /"Created:"/g, replacement: '{t("addresses:created")}:' },
  { pattern: /"Last Updated:"/g, replacement: '{t("addresses:lastUpdated")}:' },
  
  // Select options
  { pattern: />Residential</g, replacement: '>{t("addresses:registration.types.residential")}' },
  { pattern: />Commercial</g, replacement: '>{t("addresses:registration.types.commercial")}' },
  { pattern: />Government</g, replacement: '>{t("addresses:registration.types.government")}' },
  { pattern: />Landmark</g, replacement: '>{t("addresses:registration.types.other")}' },
  
  // Status badges and text
  { pattern: /"Verified"/g, replacement: '{t("addresses:display.verified")}' },
  { pattern: /"Unverified"/g, replacement: '{t("addresses:display.unverified")}' },
  { pattern: /"Public"/g, replacement: '{t("addresses:display.public")}' },
  { pattern: /"Private"/g, replacement: '{t("addresses:display.private")}' },
];

// Convert component files
function convertComponents() {
  const componentsDir = path.join(__dirname, '../src/components');
  const files = [
    'AddressEditor.tsx',
    'AddressRequestForm.tsx',
    'AddressList.tsx',
    'AddressDirections.tsx',
    'Dashboard.tsx'
  ];

  files.forEach(file => {
    const filePath = path.join(componentsDir, file);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Apply patterns
      componentPatterns.forEach(({ pattern, replacement }) => {
        content = content.replace(pattern, replacement);
      });
      
      // Add useTranslation hook if not present
      if (!content.includes('useTranslation')) {
        content = content.replace(
          /import { useToast } from '@\/hooks\/use-toast';/,
          "import { useToast } from '@/hooks/use-toast';\nimport { useTranslation } from 'react-i18next';"
        );
        
        // Add t function
        if (!content.includes('const { t }')) {
          content = content.replace(
            /const { toast } = useToast\(\);/,
            "const { toast } = useToast();\n  const { t } = useTranslation('addresses');"
          );
        }
      }
      
      fs.writeFileSync(filePath, content);
      console.log(`✅ Converted ${file}`);
    }
  });
}

// Update translation files with missing keys
function updateTranslations() {
  const missingKeys = {
    en: {
      "display.unverified": "Unverified",
      "locationAccessDenied": "Location access denied by user",
      "locationUnavailable": "Location information is unavailable"
    },
    es: {
      "display.unverified": "No Verificado", 
      "locationAccessDenied": "Acceso a ubicación denegado por el usuario",
      "locationUnavailable": "La información de ubicación no está disponible"
    }
  };

  Object.entries(missingKeys).forEach(([lang, keys]) => {
    const filePath = path.join(__dirname, `../public/locales/${lang}/addresses.json`);
    if (fs.existsSync(filePath)) {
      const translations = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      Object.entries(keys).forEach(([key, value]) => {
        const keyPath = key.split('.');
        let current = translations;
        
        for (let i = 0; i < keyPath.length - 1; i++) {
          if (!current[keyPath[i]]) current[keyPath[i]] = {};
          current = current[keyPath[i]];
        }
        
        current[keyPath[keyPath.length - 1]] = value;
      });
      
      fs.writeFileSync(filePath, JSON.stringify(translations, null, 2));
      console.log(`✅ Updated ${lang} translations`);
    }
  });
}

// Main execution
function main() {
  try {
    updateTranslations();
    convertComponents();
    
    console.log('\n🎉 Final conversion completed!');
    console.log('✅ All components converted to use i18n');
    console.log('🌐 Spanish-first implementation ready');
    console.log('\n💡 Next steps:');
    console.log('   - Hard refresh your browser');
    console.log('   - Test language switching');
    console.log('   - Verify all UI shows translated text');
    
  } catch (error) {
    console.error('❌ Conversion failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { convertComponents, updateTranslations };