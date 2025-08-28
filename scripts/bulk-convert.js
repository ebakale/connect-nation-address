#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Bulk convert remaining files
const conversions = [
  { file: 'src/components/AddressDirections.tsx', namespace: 'addresses' },
  { file: 'src/components/AddressList.tsx', namespace: 'addresses' },
  { file: 'src/components/AddressPublishingQueue.tsx', namespace: 'addresses' },
  { file: 'src/components/AddressViewer.tsx', namespace: 'addresses' },
  { file: 'src/components/AdminPanel.tsx', namespace: 'dashboard' },
  { file: 'src/components/AnalyticsReports.tsx', namespace: 'dashboard' },
  { file: 'src/components/IncidentList.tsx', namespace: 'police' },
  { file: 'src/components/OfficerProfileDashboard.tsx', namespace: 'police' },
  { file: 'src/components/ProfileEditor.tsx', namespace: 'common' },
  { file: 'src/components/UnitFieldDashboard.tsx', namespace: 'police' },
  { file: 'src/pages/AdminDashboard.tsx', namespace: 'dashboard' },
  { file: 'src/pages/CitizenDashboard.tsx', namespace: 'dashboard' },
  { file: 'src/pages/FieldAgentDashboard.tsx', namespace: 'dashboard' },
  { file: 'src/pages/PoliceDashboard.tsx', namespace: 'police' },
  { file: 'src/pages/Portal.tsx', namespace: 'common' },
  { file: 'src/pages/RegistrarDashboard.tsx', namespace: 'dashboard' },
  { file: 'src/pages/UnifiedDashboard.tsx', namespace: 'dashboard' },
  { file: 'src/pages/UnitsAndProfilesPage.tsx', namespace: 'police' },
  { file: 'src/pages/VerifierDashboard.tsx', namespace: 'dashboard' }
];

conversions.forEach(({ file, namespace }) => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;
    
    // Replace import
    if (content.includes("import { useLanguage } from '@/contexts/LanguageContext'")) {
      content = content.replace(
        "import { useLanguage } from '@/contexts/LanguageContext';",
        "import { useTranslation } from 'react-i18next';"
      );
      changed = true;
    }
    
    // Replace hook usage
    if (content.includes('const { t } = useLanguage();')) {
      content = content.replace(
        'const { t } = useLanguage();',
        `const { t } = useTranslation('${namespace}');`
      );
      changed = true;
    }
    
    if (changed) {
      fs.writeFileSync(file, content);
      console.log(`✅ Converted: ${file}`);
    }
  } catch (error) {
    console.error(`❌ Error converting ${file}:`, error.message);
  }
});

console.log('\n🔄 Bulk conversion completed!');