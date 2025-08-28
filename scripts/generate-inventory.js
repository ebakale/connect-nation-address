#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Generate CSV inventory of all translatable strings
function generateInventory() {
  const results = [];
  const srcDir = path.join(__dirname, '../src');
  
  function scanFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // Skip lines that already use translations
      if (line.includes('t(') || line.includes('useTranslation')) return;
      
      // JSX text nodes
      const jsxTextMatches = line.match(/>\s*([A-Z][a-zA-Z\s]{2,})\s*</g);
      if (jsxTextMatches) {
        jsxTextMatches.forEach(match => {
          const text = match.replace(/[><]/g, '').trim();
          if (text.length > 2 && !/^[{(]/.test(text)) {
            results.push({
              file: filePath.replace(srcDir + '/', ''),
              line: index + 1,
              key: generateKey(text),
              english_value: text,
              context_note: determineContext(text, line),
              status: 'needs-translation'
            });
          }
        });
      }
      
      // String literals in quotes (placeholders, etc.)
      const stringMatches = line.match(/"([A-Z][a-zA-Z\s\.]{2,})"/g);
      if (stringMatches) {
        stringMatches.forEach(match => {
          const text = match.slice(1, -1);
          if (text.length > 2 && /[A-Za-z]/.test(text) && !text.includes('$') && !text.includes('{')) {
            results.push({
              file: filePath.replace(srcDir + '/', ''),
              line: index + 1,
              key: generateKey(text),
              english_value: text,
              context_note: determineContext(text, line),
              status: 'needs-translation'
            });
          }
        });
      }
      
      // Attributes
      const attrMatches = line.match(/(placeholder|title|aria-label|alt)="([A-Z][^"]+)"/g);
      if (attrMatches) {
        attrMatches.forEach(match => {
          const [, attr, text] = match.match(/(placeholder|title|aria-label|alt)="([^"]+)"/);
          if (text.length > 1) {
            results.push({
              file: filePath.replace(srcDir + '/', ''),
              line: index + 1,
              key: generateKey(text),
              english_value: text,
              context_note: `${attr} attribute`,
              status: 'needs-translation'
            });
          }
        });
      }
    });
  }
  
  function generateKey(text) {
    return text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '')
      .substring(0, 30);
  }
  
  function determineContext(text, line) {
    if (line.includes('placeholder')) return 'form placeholder';
    if (line.includes('Button')) return 'button text';
    if (line.includes('Label')) return 'form label';
    if (line.includes('CardTitle')) return 'card title';
    if (line.includes('option') || line.includes('SelectItem')) return 'select option';
    return 'ui text';
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
  
  // Generate CSV
  const csvContent = ['file,line,key,english_value,context_note,status']
    .concat(results.map(r => 
      `"${r.file}",${r.line},"${r.key}","${r.english_value.replace(/"/g, '""')}","${r.context_note}","${r.status}"`
    ))
    .join('\n');
  
  fs.writeFileSync('i18n-inventory.csv', csvContent);
  
  // Generate JSON summary
  const summary = {
    timestamp: new Date().toISOString(),
    totalStrings: results.length,
    byContext: results.reduce((acc, r) => {
      acc[r.context_note] = (acc[r.context_note] || 0) + 1;
      return acc;
    }, {}),
    byFile: results.reduce((acc, r) => {
      acc[r.file] = (acc[r.file] || 0) + 1;
      return acc;
    }, {}),
    status: results.length === 0 ? 'COMPLETE' : 'INCOMPLETE'
  };
  
  fs.writeFileSync('i18n-coverage.json', JSON.stringify(summary, null, 2));
  
  console.log(`📊 Found ${results.length} strings needing translation`);
  console.log('📄 Generated i18n-inventory.csv and i18n-coverage.json');
  
  return results;
}

if (require.main === module) {
  generateInventory();
}

module.exports = { generateInventory };