#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Component conversion script to replace hardcoded strings with translation keys
function convertComponent(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Add useTranslation import if not present
  if (!content.includes('useTranslation') && !content.includes('import')) {
    return; // Skip files without imports
  }

  // Add import statement if missing
  if (!content.includes("import { useTranslation }") && !content.includes("useTranslation")) {
    const lastImportMatch = content.match(/^import.*from.*['"];$/gm);
    if (lastImportMatch) {
      const lastImport = lastImportMatch[lastImportMatch.length - 1];
      const insertAfter = content.indexOf(lastImport) + lastImport.length;
      content = content.slice(0, insertAfter) + 
        "\nimport { useTranslation } from 'react-i18next';" + 
        content.slice(insertAfter);
      modified = true;
    }
  }

  // Add translation hook if component doesn't have it
  if (!content.includes('const { t }') && content.includes('export')) {
    // Find function component start
    const componentMatch = content.match(/(export\s+(?:const|function)\s+\w+.*?=.*?\{|\bfunction\s+\w+.*?\{)/);
    if (componentMatch) {
      const insertPoint = content.indexOf(componentMatch[0]) + componentMatch[0].length;
      content = content.slice(0, insertPoint) + 
        "\n  const { t } = useTranslation(['common', 'forms', 'addresses']);" +
        content.slice(insertPoint);
      modified = true;
    }
  }

  // Common string replacements
  const replacements = [
    // Basic labels
    [/>\s*Country\s*</g, ">{t('forms:labels.country')}<"],
    [/>\s*Province\/Region\s*</g, ">{t('addresses:provinceRegion')}<"],
    [/>\s*City\s*</g, ">{t('forms:labels.city')}<"],
    [/>\s*Street\s*Address\s*</g, ">{t('addresses:streetAddress')}<"],
    [/>\s*Address\s*Type\s*</g, ">{t('addresses:addressType')}<"],
    [/>\s*Description\s*</g, ">{t('forms:labels.description')}<"],
    [/>\s*Save\s*</g, ">{t('forms:actions.save')}<"],
    [/>\s*Cancel\s*</g, ">{t('forms:actions.cancel')}<"],
    [/>\s*Edit\s*</g, ">{t('forms:actions.edit')}<"],
    [/>\s*Delete\s*</g, ">{t('forms:actions.delete')}<"],
    [/>\s*Update\s*</g, ">{t('forms:actions.update')}<"],
    [/>\s*Create\s*</g, ">{t('forms:actions.create')}<"],
    [/>\s*View\s*</g, ">{t('forms:actions.view')}<"],
    [/>\s*Loading\.\.\.\s*</g, ">{t('forms:states.loading')}<"],
    [/>\s*Saving\.\.\.\s*</g, ">{t('forms:states.saving')}<"],

    // Address types
    [/>\s*Residential\s*</g, ">{t('forms:addressTypes.residential')}<"],
    [/>\s*Commercial\s*</g, ">{t('forms:addressTypes.commercial')}<"],
    [/>\s*Industrial\s*</g, ">{t('forms:addressTypes.industrial')}<"],
    [/>\s*Government\s*</g, ">{t('forms:addressTypes.government')}<"],
    [/>\s*Educational\s*</g, ">{t('forms:addressTypes.educational')}<"],
    [/>\s*Healthcare\s*</g, ">{t('forms:addressTypes.healthcare')}<"],
    [/>\s*Other\s*</g, ">{t('forms:addressTypes.other')}<"],

    // Status and options
    [/>\s*Public\s*</g, ">{t('forms:options.public')}<"],
    [/>\s*Private\s*</g, ">{t('forms:options.private')}<"],
    [/>\s*Active\s*</g, ">{t('forms:options.active')}<"],
    [/>\s*Inactive\s*</g, ">{t('forms:options.inactive')}<"],
    [/>\s*Verified\s*</g, ">{t('addresses:verification.verified')}<"],
    [/>\s*Pending\s*</g, ">{t('addresses:verification.pending')}<"],

    // Common placeholders (in quotes)
    [/"Select a province"/g, "t('addresses:selectProvince')"],
    [/"Select a city"/g, "t('addresses:selectCity')"],
    [/"Search\.\.\."/g, "t('forms:placeholders.search')"],
    [/"Enter text\.\.\."/g, "t('forms:placeholders.enterText')"],
    [/"Enter description\.\.\."/g, "t('forms:placeholders.enterDescription')"],

    // Common titles
    [/"Address Management"/g, "t('addresses:management')"],
    [/"Edit Address"/g, "t('addresses:edit')"],
    [/"View Address"/g, "t('addresses:view')"],
    [/"New Address"/g, "t('addresses:new')"],
  ];

  // Apply replacements
  for (const [pattern, replacement] of replacements) {
    const newContent = content.replace(pattern, replacement);
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  }

  // Save if modified
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Converted: ${filePath}`);
  }
}

// Convert all components
function convertAllComponents() {
  const componentsDir = path.join(__dirname, '../src/components');
  const pagesDir = path.join(__dirname, '../src/pages');
  
  function processDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        processDir(filePath);
      } else if (file.endsWith('.tsx')) {
        convertComponent(filePath);
      }
    });
  }

  console.log('🔄 Converting components...');
  processDir(componentsDir);
  processDir(pagesDir);
  console.log('✅ Component conversion complete!');
}

if (require.main === module) {
  convertAllComponents();
}

module.exports = { convertComponent, convertAllComponents };