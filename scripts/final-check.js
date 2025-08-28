#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Final validation script
function runFinalCheck() {
  console.log('🔍 Running final i18n validation...\n');
  
  // 1. Check translation files exist
  const locales = ['en', 'es'];
  const namespaces = ['common', 'auth', 'dashboard', 'addresses', 'emergency', 'police', 'forms', 'errors'];
  
  console.log('📁 Checking translation files...');
  let filesOk = true;
  for (const locale of locales) {
    for (const ns of namespaces) {
      const filePath = path.join(__dirname, `../public/locales/${locale}/${ns}.json`);
      if (!fs.existsSync(filePath)) {
        console.log(`❌ Missing: ${locale}/${ns}.json`);
        filesOk = false;
      } else {
        console.log(`✅ Found: ${locale}/${ns}.json`);
      }
    }
  }
  
  // 2. Scan for remaining hardcoded strings
  console.log('\n🔍 Scanning for hardcoded strings...');
  const hardcoded = scanForHardcodedStrings();
  
  if (hardcoded.length === 0) {
    console.log('✅ No hardcoded strings found!');
  } else {
    console.log(`❌ Found ${hardcoded.length} hardcoded strings:`);
    hardcoded.slice(0, 10).forEach(item => {
      console.log(`   ${item.file}:${item.line} - "${item.text}"`);
    });
    if (hardcoded.length > 10) {
      console.log(`   ... and ${hardcoded.length - 10} more`);
    }
  }
  
  // 3. Check i18n setup
  console.log('\n⚙️  Checking i18n setup...');
  const appContent = fs.readFileSync(path.join(__dirname, '../src/App.tsx'), 'utf8');
  if (appContent.includes('I18nextProvider')) {
    console.log('✅ I18nextProvider found in App.tsx');
  } else {
    console.log('❌ I18nextProvider missing in App.tsx');
  }
  
  const mainContent = fs.readFileSync(path.join(__dirname, '../src/main.tsx'), 'utf8');
  if (mainContent.includes('./lib/i18n')) {
    console.log('✅ i18n initialization found in main.tsx');
  } else {
    console.log('❌ i18n initialization missing in main.tsx');
  }
  
  // 4. Generate final report
  const report = {
    timestamp: new Date().toISOString(),
    translationFiles: filesOk,
    hardcodedStrings: hardcoded.length,
    i18nSetup: appContent.includes('I18nextProvider') && mainContent.includes('./lib/i18n'),
    coverage: hardcoded.length === 0 ? '100%' : `${Math.max(0, 100 - hardcoded.length)}%`,
    status: (filesOk && hardcoded.length === 0) ? 'COMPLETE' : 'INCOMPLETE',
    details: hardcoded
  };
  
  fs.writeFileSync('i18n-final-report.json', JSON.stringify(report, null, 2));
  
  console.log(`\n📊 Final Report:`);
  console.log(`   Translation Files: ${filesOk ? '✅' : '❌'}`);
  console.log(`   Hardcoded Strings: ${hardcoded.length === 0 ? '✅ None' : `❌ ${hardcoded.length} found`}`);
  console.log(`   i18n Setup: ${report.i18nSetup ? '✅' : '❌'}`);
  console.log(`   Coverage: ${report.coverage}`);
  console.log(`   Status: ${report.status}\n`);
  
  return report;
}

function scanForHardcodedStrings() {
  const results = [];
  const srcDir = path.join(__dirname, '../src');
  
  function scanFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // Skip lines with t( or useTranslation
      if (line.includes('t(') || line.includes('useTranslation') || line.includes('console.')) return;
      
      // Look for JSX text that's not in braces and is likely user-visible
      const jsxTextMatches = line.match(/>\s*([A-Z][a-zA-Z\s]{2,})\s*</g);
      if (jsxTextMatches) {
        jsxTextMatches.forEach(match => {
          const text = match.replace(/[><]/g, '').trim();
          if (text.length > 2 && !/^[{(]/.test(text) && isUserVisibleText(text)) {
            results.push({
              file: filePath.replace(srcDir + '/', ''),
              line: index + 1,
              text: text
            });
          }
        });
      }
      
      // Check for hardcoded placeholders and labels
      const attrMatches = line.match(/(placeholder|title|aria-label)="([A-Z][^"]{2,})"/g);
      if (attrMatches) {
        attrMatches.forEach(match => {
          const [, attr, text] = match.match(/(placeholder|title|aria-label)="([^"]+)"/);
          if (text.length > 2 && isUserVisibleText(text)) {
            results.push({
              file: filePath.replace(srcDir + '/', ''),
              line: index + 1,
              text: `${attr}: ${text}`
            });
          }
        });
      }
    });
  }
  
  function isUserVisibleText(text) {
    // Filter out technical/code strings
    const skipPatterns = [
      /^(import|export|const|let|var|function|class)/,
      /^(true|false|null|undefined)$/,
      /^\d+$/,
      /^[A-Z_]{3,}$/, // Constants
      /\.(tsx?|css|json)$/,
      /^(http|https|ftp):/,
      /^\w+\(.*\)$/, // Function calls
    ];
    
    return !skipPatterns.some(pattern => pattern.test(text));
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
  runFinalCheck();
}

module.exports = { runFinalCheck, scanForHardcodedStrings };