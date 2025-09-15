import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import jsPDF from 'jspdf';

export const RolesDocumentGenerator = () => {
  const { t, i18n } = useTranslation('admin');
  
  const generateRolesPDF = () => {
    const doc = new jsPDF();
    let yPos = 20;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const lineHeight = 7;

    // Helper function to add text with automatic page breaks
    const addText = (text: string, fontSize: number = 10, isBold: boolean = false) => {
      if (yPos > pageHeight - 30) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(fontSize);
      if (isBold) {
        doc.setFont(undefined, 'bold');
      } else {
        doc.setFont(undefined, 'normal');
      }
      
      const lines = doc.splitTextToSize(text, doc.internal.pageSize.width - 2 * margin);
      doc.text(lines, margin, yPos);
      yPos += lines.length * lineHeight + 5;
    };

    // Title
    addText(t('pdfTitles.nationalDigitalAddressingSystem'), 18, true);
    addText(t('pdfTitles.userRolesPermissionsGuide'), 16, true);
    addText(t('pdfTitles.comprehensiveDocumentation'), 12);
    yPos += 10;

    // Table of Contents
    addText(t('pdfSections.tableOfContents'), 14, true);
    addText(`1. ${t('pdfSections.administrativeRoles')}`);
    addText('   • NDAA Admin');
    addText('   • Admin');
    addText('   • Moderator');
    addText(`2. ${t('pdfSections.operationalRoles')}`);
    addText('   • Registrar');
    addText('   • Verifier');
    addText('   • Field Agent');
    addText(`3. ${t('pdfSections.policeRoles')}`);
    addText('   • Police Admin');
    addText('   • Police Supervisor');
    addText('   • Police Dispatcher');
    addText('   • Police Operator');
    addText(`4. ${t('pdfSections.systemRoles')}`);
    addText('   • Citizen');
    yPos += 10;

    // Content
    addText(`1. ${t('pdfSections.administrativeRoles')}`, 14, true);
    
    addText('NDAA Admin', 12, true);
    addText(t('pdfContent.citizenRole')); // Using role content for demonstration
    
    addText('Admin', 12, true);
    addText(t('pdfContent.fieldAgentRole'));
    
    addText('Moderator', 12, true);
    addText(t('pdfContent.verifierRole'));

    addText(`2. ${t('pdfSections.operationalRoles')}`, 14, true);
    
    addText('Registrar', 12, true);
    addText(t('pdfContent.registrarRole'));
    
    addText('Verifier', 12, true);
    addText(t('pdfContent.verifierRole'));
    
    addText('Field Agent', 12, true);
    addText(t('pdfContent.fieldAgentRole'));

    addText(`3. ${t('pdfSections.policeRoles')}`, 14, true);
    
    addText('Police Admin', 12, true);
    addText(t('pdfContent.policeAdminRole'));
    
    addText('Police Supervisor', 12, true);
    addText(t('pdfContent.policeSupervisorRole'));
    
    addText('Police Dispatcher', 12, true);
    addText(t('pdfContent.policeDispatcherRole'));
    
    addText('Police Operator', 12, true);
    addText(t('pdfContent.policeOperatorRole'));

    addText(`4. ${t('pdfSections.systemRoles')}`, 14, true);
    
    addText('Citizen', 12, true);
    addText(t('pdfContent.citizenRole'));

    // Footer
    doc.setFontSize(8);
    doc.text(t('pdfContent.generatedBy'), margin, pageHeight - 10);
    doc.text(`${t('pdfContent.generatedOn')} ${new Date().toLocaleDateString(i18n.language)}`, margin, pageHeight - 5);

    // Save the PDF
    const fileName = i18n.language === 'es' ? 'Guia-Roles-NDAA.pdf' : 
                     i18n.language === 'fr' ? 'Guide-Roles-NDAA.pdf' : 
                     'NDAA_User_Roles_Guide.pdf';
    doc.save(fileName);
  };

  return (
    <Button onClick={generateRolesPDF} className="flex items-center gap-2">
      <FileText className="h-4 w-4" />
      <Download className="h-4 w-4" />
      {t('generateRolesPdfGuide')}
    </Button>
  );
};