#!/usr/bin/env node

// Mass conversion script to convert all remaining hardcoded strings at once
const fs = require('fs');
const path = require('path');

const componentPatterns = [
  // Common patterns
  { pattern: /"Navigation Apps"/g, replacement: '{t("addresses:navigationApps")}' },
  { pattern: /"Requested Address"/g, replacement: '{t("addresses:requestedAddress")}' },
  { pattern: /"Mapbox Token Required"/g, replacement: '{t("addresses:mapboxTokenRequired")}' },
  { pattern: /"Mapbox Public Token"/g, replacement: '{t("addresses:mapboxPublicToken")}' },
  { pattern: /"Location Information"/g, replacement: '{t("addresses:locationInformation")}' },
  { pattern: /"Publish verified addresses to the national registry"/g, replacement: '{t("addresses:publishVerifiedAddresses")}' },
  { pattern: /"No addresses pending publication"/g, replacement: '{t("addresses:noAddressesPendingPublication")}' },
  { pattern: /"Address Verification Queue"/g, replacement: '{t("addresses:addressVerificationQueue")}' },
  { pattern: /"Review and verify pending address submissions"/g, replacement: '{t("addresses:reviewAndVerifyPending")}' },
  { pattern: /"No address selected for viewing"/g, replacement: '{t("addresses:noAddressSelectedViewing")}' },
  { pattern: /"View complete address information"/g, replacement: '{t("addresses:viewCompleteAddress")}' },
  { pattern: /"Record Information"/g, replacement: '{t("addresses:recordInformation")}' },
  { pattern: /"Address Request Status"/g, replacement: '{t("addresses:addressRequestStatus")}' },
  { pattern: /"No address requests found"/g, replacement: '{t("addresses:noAddressRequestsFound")}' },
  { pattern: /"Submit your first address request to get started"/g, replacement: '{t("addresses:submitFirstRequest")}' },
  { pattern: /"Justification"/g, replacement: '{t("addresses:justification")}' },
  { pattern: /"Reviewer Notes"/g, replacement: '{t("addresses:reviewerNotes")}' },
  { pattern: /"Try searching with a different term or UAC code"/g, replacement: '{t("addresses:trySearchingDifferent")}' },
  { pattern: /"Manage addresses in the national registry"/g, replacement: '{t("addresses:manageAddressesRegistry")}' },
  { pattern: /"No published addresses found"/g, replacement: '{t("addresses:noPublishedAddresses")}' },
  { pattern: /"Address Request Approval"/g, replacement: '{t("addresses:addressRequestApproval")}' },
  { pattern: /"PDF document ready to upload"/g, replacement: '{t("addresses:pdfDocumentReady")}' },
  
  // Form labels that weren't converted yet
  { pattern: /"Province\/Region \*"/g, replacement: '{t("addresses:registration.form.region")} *' },
  { pattern: /"City \*"/g, replacement: '{t("addresses:registration.form.city")} *' },
  { pattern: /"Street Address \*"/g, replacement: '{t("addresses:registration.form.street")} *' },
  { pattern: /"Building\/Apartment \(Optional\)"/g, replacement: '{t("addresses:registration.form.building")} (Optional)' },
  { pattern: /"Latitude \(Optional\)"/g, replacement: '{t("addresses:registration.form.latitude")} (Optional)' },
  { pattern: /"Longitude \(Optional\)"/g, replacement: '{t("addresses:registration.form.longitude")} (Optional)' },
  { pattern: /"Description \(Optional\)"/g, replacement: '{t("addresses:registration.form.description")} (Optional)' },
  { pattern: /"Justification \*"/g, replacement: '{t("addresses:registration.form.justification")} *' },
  
  // More common hardcoded text
  { pattern: /"Get Location"/g, replacement: '{t("addresses:registration.actions.getCurrentLocation")}' },
  { pattern: /"Take Photo"/g, replacement: '{t("addresses:registration.actions.takePhoto")}' },
  { pattern: /"Upload Photo"/g, replacement: '{t("addresses:registration.actions.uploadPhoto")}' },
  { pattern: /"Submit Request"/g, replacement: '{t("addresses:registration.actions.submit")}' },
  { pattern: /"Submitting\.\.\."/g, replacement: '{t("addresses:registration.actions.submitting")}...' },
  
  // Status and descriptions
  { pattern: /"Location"/g, replacement: '{t("addresses:location")}' },
  { pattern: /"Type"/g, replacement: '{t("addresses:type")}' },
  { pattern: /"Photo"/g, replacement: '{t("addresses:photo")}' },
  { pattern: />Country</g, replacement: '>{t("addresses:registration.form.country")}' },
  { pattern: />Region</g, replacement: '>{t("addresses:registration.form.region")}' },
  { pattern: />City</g, replacement: '>{t("addresses:registration.form.city")}' },
  { pattern: />Street</g, replacement: '>{t("addresses:registration.form.street")}' },
  { pattern: />Latitude</g, replacement: '>{t("addresses:registration.form.latitude")}' },
  { pattern: />Longitude</g, replacement: '>{t("addresses:registration.form.longitude")}' },
  { pattern: />Description</g, replacement: '>{t("addresses:registration.form.description")}' },
];

function convertComponents() {
  const srcDir = path.join(__dirname, '../src');
  
  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        walkDir(filePath);
      } else if (file.endsWith('.tsx')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let changed = false;
        
        // Apply all patterns
        componentPatterns.forEach(({ pattern, replacement }) => {
          if (pattern.test(content)) {
            content = content.replace(pattern, replacement);
            changed = true;
          }
        });
        
        // Add useTranslation hook if needed and patterns were applied
        if (changed && !content.includes('useTranslation')) {
          // Add import
          content = content.replace(
            /import.*?from 'react';/,
            "$&\nimport { useTranslation } from 'react-i18next';"
          );
          
          // Add hook usage
          const functionMatch = content.match(/const (\w+):.*?= \([^)]*\) => \{/);
          if (functionMatch) {
            const replacement = functionMatch[0] + '\n  const { t } = useTranslation(\'addresses\');';
            content = content.replace(functionMatch[0], replacement);
          }
        }
        
        if (changed) {
          fs.writeFileSync(filePath, content);
          console.log(`✅ Converted ${file}`);
        }
      }
    });
  }
  
  walkDir(srcDir);
}

function main() {
  console.log('🚀 Running mass i18n conversion...\n');
  convertComponents();
  console.log('\n🎉 Mass conversion completed!');
}

if (require.main === module) {
  main();
}

module.exports = { convertComponents };