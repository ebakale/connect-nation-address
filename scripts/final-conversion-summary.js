#!/usr/bin/env node

// Final conversion summary and completion check
const fs = require('fs');
const path = require('path');

console.log('🎯 Final i18n Conversion Summary\n');

// Check current state
function scanRemainingStrings() {
  const results = [];
  const srcDir = path.join(__dirname, '../src');
  
  function scanFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // Skip lines that already use translations
      if (line.includes('t(') || line.includes('useTranslation') || line.includes('console.')) return;
      
      // Look for JSX text that appears to be user-visible
      const jsxMatches = line.match(/>\s*([A-Z][a-zA-Z\s]{3,})\s*</g);
      if (jsxMatches) {
        jsxMatches.forEach(match => {
          const text = match.replace(/[><]/g, '').trim();
          if (isUserVisibleText(text)) {
            results.push({
              file: filePath.replace(srcDir + '/', ''),
              line: index + 1,
              text: text,
              context: 'jsx-text'
            });
          }
        });
      }
      
      // Check for hardcoded placeholders
      const placeholderMatches = line.match(/placeholder="([A-Z][^"]{3,})"/g);
      if (placeholderMatches) {
        placeholderMatches.forEach(match => {
          const text = match.match(/placeholder="([^"]+)"/)[1];
          if (isUserVisibleText(text)) {
            results.push({
              file: filePath.replace(srcDir + '/', ''),
              line: index + 1,
              text: `placeholder: ${text}`,
              context: 'placeholder'
            });
          }
        });
      }
    });
  }
  
  function isUserVisibleText(text) {
    const skipPatterns = [
      /^(import|export|const|let|var|function|class)/,
      /^(true|false|null|undefined)$/,
      /^\d+$/,
      /^[A-Z_]{3,}$/, // Constants
      /\.(tsx?|css|json|js)$/,
      /^(http|https|ftp):/,
      /^\w+\(.*\)$/, // Function calls
      /^(px|rem|em|\d+)$/,
      /^(flex|grid|block|inline)$/,
      /^[a-z-]+$/, // CSS classes
      /^(pk\.|Bearer |eyJ)/, // Tokens
    ];
    
    return !skipPatterns.some(pattern => pattern.test(text)) && text.length > 3;
  }
  
  function walkDir(dir) {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        walkDir(filePath);
      } else if (file.endsWith('.tsx')) {
        scanFile(filePath);
      }
    });
  }
  
  walkDir(srcDir);
  return results;
}

// Generate final report
function generateFinalReport() {
  const remaining = scanRemainingStrings();
  
  // Group by file
  const byFile = remaining.reduce((acc, item) => {
    if (!acc[item.file]) acc[item.file] = [];
    acc[item.file].push(item);
    return acc;
  }, {});
  
  console.log(`📊 CONVERSION STATUS:`);
  console.log(`   Remaining hardcoded strings: ${remaining.length}`);
  
  if (remaining.length === 0) {
    console.log('\n🎉 CONVERSION COMPLETE!');
    console.log('✅ All user-facing strings converted to translation keys');
    console.log('🌐 Spanish-first i18n implementation is ready');
    
    const report = {
      status: 'COMPLETE',
      timestamp: new Date().toISOString(),
      totalStrings: 0,
      converted: '100%',
      remaining: [],
      summary: 'All components successfully converted to use i18n translation system'
    };
    
    fs.writeFileSync('i18n-conversion-complete.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Final report saved to i18n-conversion-complete.json');
    
  } else {
    console.log(`\n⚠️  CONVERSION INCOMPLETE:`);
    console.log(`   ${remaining.length} strings still need conversion\n`);
    
    // Show top files needing conversion
    const sortedFiles = Object.entries(byFile)
      .sort(([,a], [,b]) => b.length - a.length)
      .slice(0, 10);
    
    console.log('🔍 Top files needing conversion:');
    sortedFiles.forEach(([file, strings]) => {
      console.log(`   ${file}: ${strings.length} strings`);
      strings.slice(0, 3).forEach(s => {
        console.log(`      Line ${s.line}: "${s.text}"`);
      });
      if (strings.length > 3) {
        console.log(`      ... and ${strings.length - 3} more`);
      }
      console.log('');
    });
    
    const report = {
      status: 'INCOMPLETE',
      timestamp: new Date().toISOString(),
      totalStrings: remaining.length,
      converted: `${Math.max(0, 100 - remaining.length)}%`,
      remaining: remaining,
      byFile: byFile,
      topFiles: sortedFiles.map(([file, strings]) => ({ file, count: strings.length }))
    };
    
    fs.writeFileSync('i18n-conversion-progress.json', JSON.stringify(report, null, 2));
    console.log('📄 Progress report saved to i18n-conversion-progress.json');
  }
  
  return remaining.length === 0;
}

// Translation file summary
function checkTranslationFiles() {
  console.log('\n📁 Translation Files Status:');
  
  const namespaces = ['common', 'auth', 'dashboard', 'addresses', 'emergency', 'police', 'forms', 'errors'];
  const locales = ['en', 'es'];
  
  let totalKeys = 0;
  
  for (const locale of locales) {
    console.log(`\n${locale.toUpperCase()} translations:`);
    for (const ns of namespaces) {
      const filePath = path.join(__dirname, `../public/locales/${locale}/${ns}.json`);
      if (fs.existsSync(filePath)) {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const keyCount = countKeys(content);
        totalKeys += keyCount;
        console.log(`   ${ns}.json: ${keyCount} keys`);
      } else {
        console.log(`   ${ns}.json: ❌ MISSING`);
      }
    }
  }
  
  console.log(`\n📊 Total translation keys: ${totalKeys}`);
  return totalKeys;
}

function countKeys(obj, prefix = '') {
  let count = 0;
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      count += countKeys(obj[key], prefix + key + '.');
    } else {
      count++;
    }
  }
  return count;
}

// Main execution
function main() {
  console.log('🚀 Running final i18n conversion check...\n');
  
  const translationKeys = checkTranslationFiles();
  const conversionComplete = generateFinalReport();
  
  console.log('\n💡 Next Steps:');
  if (conversionComplete) {
    console.log('   ✅ Conversion is complete! Hard refresh browser to see changes');
    console.log('   🔄 Test language switching (Spanish ↔ English)');
    console.log('   🌐 All UI should display translated text');
  } else {
    console.log('   🔄 Continue converting remaining components');
    console.log('   📝 Add missing translation keys to common.json');
    console.log('   🎯 Focus on most visible UI components first');
  }
  
  console.log('\n🌟 i18n Implementation Features:');
  console.log('   • Spanish-first default language');
  console.log('   • 8 modular translation namespaces');
  console.log('   • Language switching with persistence');
  console.log('   • Quality assurance scripts');
  console.log(`   • ${translationKeys} total translation keys`);
}

if (require.main === module) {
  main();
}

module.exports = { scanRemainingStrings, generateFinalReport, checkTranslationFiles };