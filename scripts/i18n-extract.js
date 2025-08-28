#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Extract all user-visible strings from source files
function extractStrings() {
  const results = [];
  const srcDir = path.join(__dirname, '../src');
  
  function scanFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // JSX text nodes
      const jsxTextMatches = line.match(/>\s*([A-Za-z][^<>]*[A-Za-z])\s*</g);
      if (jsxTextMatches) {
        jsxTextMatches.forEach(match => {
          const text = match.replace(/[><]/g, '').trim();
          if (text.length > 1 && !/^[{(]/.test(text)) {
            results.push({
              file: filePath.replace(srcDir + '/', ''),
              line: index + 1,
              type: 'jsx-text',
              text: text,
              context: line.trim()
            });
          }
        });
      }
      
      // String literals in quotes
      const stringMatches = line.match(/["'][^"']*["']/g);
      if (stringMatches) {
        stringMatches.forEach(match => {
          const text = match.slice(1, -1);
          if (text.length > 2 && /[A-Za-z]/.test(text) && !text.includes('$') && !text.includes('{')) {
            results.push({
              file: filePath.replace(srcDir + '/', ''),
              line: index + 1,
              type: 'string-literal',
              text: text,
              context: line.trim()
            });
          }
        });
      }
      
      // Attributes like placeholder, title, aria-label
      const attrMatches = line.match(/(placeholder|title|aria-label|alt)=["']([^"']*)["']/g);
      if (attrMatches) {
        attrMatches.forEach(match => {
          const [, attr, text] = match.match(/(placeholder|title|aria-label|alt)=["']([^"']*)["']/);
          if (text.length > 1) {
            results.push({
              file: filePath.replace(srcDir + '/', ''),
              line: index + 1,
              type: `attribute-${attr}`,
              text: text,
              context: line.trim()
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

// Generate CSV report
function generateReport() {
  const strings = extractStrings();
  const csvContent = ['file,line,type,text,context,status']
    .concat(strings.map(s => 
      `"${s.file}",${s.line},"${s.type}","${s.text.replace(/"/g, '""')}","${s.context.replace(/"/g, '""')}","needs-translation"`
    ))
    .join('\n');
  
  fs.writeFileSync('i18n-inventory.csv', csvContent);
  
  const summary = {
    totalStrings: strings.length,
    byType: strings.reduce((acc, s) => {
      acc[s.type] = (acc[s.type] || 0) + 1;
      return acc;
    }, {}),
    byFile: strings.reduce((acc, s) => {
      acc[s.file] = (acc[s.file] || 0) + 1;
      return acc;
    }, {})
  };
  
  fs.writeFileSync('i18n-coverage.json', JSON.stringify(summary, null, 2));
  
  console.log(`✅ Extracted ${strings.length} translatable strings`);
  console.log('📊 Generated i18n-inventory.csv and i18n-coverage.json');
}

if (require.main === module) {
  generateReport();
}

module.exports = { extractStrings, generateReport };