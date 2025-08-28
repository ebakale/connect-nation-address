#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Convert all files from old LanguageContext to new i18n
function convertFiles() {
  const srcDir = path.join(__dirname, '../src');
  let convertedFiles = 0;
  
  function convertFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    // Replace import
    if (content.includes("import { useLanguage } from '@/contexts/LanguageContext'")) {
      content = content.replace(
        "import { useLanguage } from '@/contexts/LanguageContext';",
        "import { useTranslation } from 'react-i18next';"
      );
      changed = true;
    }
    
    // Replace hook usage - need to be more specific about namespace
    if (content.includes('const { t } = useLanguage();')) {
      // Determine namespace based on file path
      let namespace = 'common';
      if (filePath.includes('/pages/Auth.') || filePath.includes('Auth')) namespace = 'auth';
      else if (filePath.includes('Dashboard') || filePath.includes('dashboard')) namespace = 'dashboard';
      else if (filePath.includes('Address') || filePath.includes('address')) namespace = 'addresses';
      else if (filePath.includes('Emergency') || filePath.includes('emergency')) namespace = 'emergency';
      else if (filePath.includes('Police') || filePath.includes('police')) namespace = 'police';
      else if (filePath.includes('Form') || filePath.includes('form')) namespace = 'forms';
      
      content = content.replace(
        'const { t } = useLanguage();',
        `const { t } = useTranslation('${namespace}');`
      );
      changed = true;
    }
    
    if (changed) {
      fs.writeFileSync(filePath, content);
      convertedFiles++;
      console.log(`✅ Converted: ${filePath.replace(srcDir + '/', '')}`);
    }
  }
  
  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory() && file !== 'contexts') {
        walkDir(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        convertFile(filePath);
      }
    });
  }
  
  walkDir(srcDir);
  console.log(`\n🔄 Converted ${convertedFiles} files to use react-i18next`);
}

if (require.main === module) {
  convertFiles();
}

module.exports = { convertFiles };