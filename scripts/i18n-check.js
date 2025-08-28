#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Check translation coverage and missing keys
function checkCoverage() {
  const enDir = path.join(__dirname, '../public/locales/en');
  const esDir = path.join(__dirname, '../public/locales/es');
  
  const issues = [];
  let totalKeys = 0;
  let translatedKeys = 0;
  
  // Get all namespace files
  const namespaces = fs.readdirSync(enDir).filter(f => f.endsWith('.json'));
  
  namespaces.forEach(namespace => {
    const enPath = path.join(enDir, namespace);
    const esPath = path.join(esDir, namespace);
    
    if (!fs.existsSync(esPath)) {
      issues.push(`❌ Missing Spanish translation file: ${namespace}`);
      return;
    }
    
    const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
    const esData = JSON.parse(fs.readFileSync(esPath, 'utf8'));
    
    // Check for missing keys in Spanish
    function checkKeys(obj, prefix = '', lang = 'es') {
      Object.keys(obj).forEach(key => {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        totalKeys++;
        
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          const targetObj = lang === 'es' ? esData : enData;
          const nestedObj = prefix ? getNestedValue(targetObj, prefix) : targetObj;
          if (nestedObj && nestedObj[key]) {
            checkKeys(obj[key], fullKey, lang);
          } else {
            issues.push(`❌ Missing ${lang} translation: ${namespace}:${fullKey}`);
          }
        } else {
          const targetObj = lang === 'es' ? esData : enData;
          const value = getNestedValue(targetObj, fullKey);
          if (value) {
            translatedKeys++;
          } else {
            issues.push(`❌ Missing ${lang} translation: ${namespace}:${fullKey}`);
          }
        }
      });
    }
    
    checkKeys(enData);
    checkKeys(esData, '', 'en');
  });
  
  // Scan for hardcoded strings in source
  const hardcodedStrings = scanForHardcodedStrings();
  hardcodedStrings.forEach(string => {
    issues.push(`🚫 Hardcoded string found: ${string.file}:${string.line} - "${string.text}"`);
  });
  
  const coverage = totalKeys > 0 ? Math.round((translatedKeys / totalKeys) * 100) : 100;
  
  const report = {
    timestamp: new Date().toISOString(),
    coverage: `${coverage}%`,
    totalKeys,
    translatedKeys,
    issues: issues.length,
    details: issues,
    status: issues.length === 0 ? 'PASS' : 'FAIL'
  };
  
  fs.writeFileSync('i18n-coverage.json', JSON.stringify(report, null, 2));
  
  console.log(`\n🌐 i18n Coverage Report`);
  console.log(`📊 Coverage: ${coverage}%`);
  console.log(`🔑 Total Keys: ${totalKeys}`);
  console.log(`✅ Translated: ${translatedKeys}`);
  console.log(`⚠️  Issues: ${issues.length}`);
  
  if (issues.length > 0) {
    console.log(`\n❌ Issues Found:`);
    issues.slice(0, 10).forEach(issue => console.log(`   ${issue}`));
    if (issues.length > 10) {
      console.log(`   ... and ${issues.length - 10} more issues`);
    }
    process.exit(1);
  } else {
    console.log(`\n✅ All checks passed!`);
    process.exit(0);
  }
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current && current[key], obj);
}

function scanForHardcodedStrings() {
  const results = [];
  const srcDir = path.join(__dirname, '../src');
  
  function scanFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // Skip lines with t( or useTranslation
      if (line.includes('t(') || line.includes('useTranslation')) return;
      
      // Look for JSX text that's not in braces
      const jsxTextMatches = line.match(/>\s*([A-Za-z][^<>{]*[A-Za-z])\s*</g);
      if (jsxTextMatches) {
        jsxTextMatches.forEach(match => {
          const text = match.replace(/[><]/g, '').trim();
          if (text.length > 2 && !/^[{(]/.test(text)) {
            results.push({
              file: filePath.replace(srcDir + '/', ''),
              line: index + 1,
              text: text
            });
          }
        });
      }
    });
  }
  
  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        walkDir(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        scanFile(filePath);
      }
    });
  }
  
  walkDir(srcDir);
  return results;
}

if (require.main === module) {
  checkCoverage();
}

module.exports = { checkCoverage };