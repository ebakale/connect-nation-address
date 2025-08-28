// Translation key extraction script
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const extractedKeys = new Set();
const srcDir = path.join(__dirname, '../src');

// Find all t() function calls
function extractTranslationKeys(content) {
  const regex = /t\(['"`]([^'"`]+)['"`]\)/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    extractedKeys.add(match[1]);
  }
}

// Process all TypeScript/JavaScript files
const files = glob.sync('**/*.{ts,tsx,js,jsx}', { cwd: srcDir });

files.forEach(file => {
  const filePath = path.join(srcDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  extractTranslationKeys(content);
});

console.log('Extracted translation keys:');
Array.from(extractedKeys).sort().forEach(key => {
  console.log(`  ${key}`);
});

console.log(`\nTotal keys found: ${extractedKeys.size}`);

// Check for missing keys in locale files
const localeDir = path.join(__dirname, '../public/locales');
const languages = ['en', 'es'];

languages.forEach(lang => {
  const langDir = path.join(localeDir, lang);
  if (fs.existsSync(langDir)) {
    const namespaces = fs.readdirSync(langDir).filter(f => f.endsWith('.json'));
    
    namespaces.forEach(ns => {
      const nsPath = path.join(langDir, ns);
      const nsData = JSON.parse(fs.readFileSync(nsPath, 'utf8'));
      
      console.log(`\n${lang}/${ns} keys:`, Object.keys(flattenObject(nsData)).length);
    });
  }
});

function flattenObject(obj, prefix = '') {
  let result = {};
  
  for (let key in obj) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      Object.assign(result, flattenObject(obj[key], newKey));
    } else {
      result[newKey] = obj[key];
    }
  }
  
  return result;
}