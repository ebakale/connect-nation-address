#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Generate pseudolocalized versions for testing
function generatePseudoLocale() {
  const enDir = path.join(__dirname, '../public/locales/en');
  const pseudoDir = path.join(__dirname, '../public/locales/pseudo');
  
  // Create pseudo directory if it doesn't exist
  if (!fs.existsSync(pseudoDir)) {
    fs.mkdirSync(pseudoDir, { recursive: true });
  }
  
  // Process each namespace file
  const namespaces = fs.readdirSync(enDir).filter(f => f.endsWith('.json'));
  
  namespaces.forEach(namespace => {
    const enPath = path.join(enDir, namespace);
    const pseudoPath = path.join(pseudoDir, namespace);
    
    const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
    const pseudoData = pseudolocalize(enData);
    
    fs.writeFileSync(pseudoPath, JSON.stringify(pseudoData, null, 2));
  });
  
  console.log('🔄 Generated pseudolocalized files in public/locales/pseudo/');
  console.log('📝 To test: Change language to "pseudo" in browser dev tools');
  console.log('🎯 Any English text visible indicates missing translations');
}

function pseudolocalize(obj) {
  if (typeof obj === 'string') {
    return pseudolocalizeString(obj);
  } else if (typeof obj === 'object' && obj !== null) {
    const result = {};
    Object.keys(obj).forEach(key => {
      result[key] = pseudolocalize(obj[key]);
    });
    return result;
  }
  return obj;
}

function pseudolocalizeString(str) {
  // Don't pseudolocalize interpolation variables or HTML
  if (str.includes('{{') || str.includes('<') || str.length < 2) {
    return str;
  }
  
  // Character substitution map for pseudolocalization
  const charMap = {
    'a': 'ä', 'A': 'Ä',
    'e': 'ë', 'E': 'Ë', 
    'i': 'ï', 'I': 'Ï',
    'o': 'ö', 'O': 'Ö',
    'u': 'ü', 'U': 'Ü',
    'c': 'ç', 'C': 'Ç',
    'n': 'ñ', 'N': 'Ñ'
  };
  
  let pseudo = str.split('').map(char => charMap[char] || char).join('');
  
  // Add brackets and padding for visibility
  pseudo = `[${pseudo}]`;
  
  // Add length padding (30% longer to test layout)
  const padding = '~'.repeat(Math.ceil(str.length * 0.3));
  pseudo = pseudo + padding;
  
  return pseudo;
}

if (require.main === module) {
  generatePseudoLocale();
}

module.exports = { generatePseudoLocale };