#!/usr/bin/env node

// Execute the complete conversion
const { convertComponent, convertAllComponents, addMissingTranslations } = require('./complete-i18n-conversion');

console.log('🚀 Starting complete i18n conversion...\n');

// Add all missing translations first
addMissingTranslations();

// Convert all components
convertAllComponents();

console.log('\n✨ Conversion complete!');
console.log('🌐 All components now use the translation system');
console.log('📱 Hard refresh the browser to see changes');