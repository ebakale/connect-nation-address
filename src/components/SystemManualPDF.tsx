import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';

export const SystemManualPDF: React.FC = () => {
  const { t, i18n } = useTranslation(['common', 'admin']);
  
  const generatePDF = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const lineHeight = 6;
    let currentY = margin;

    // Helper function to add text with word wrapping
    const addText = (text: string, fontSize: number = 10, isBold: boolean = false) => {
      pdf.setFontSize(fontSize);
      if (isBold) {
        pdf.setFont('helvetica', 'bold');
      } else {
        pdf.setFont('helvetica', 'normal');
      }

      const textLines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
      
      // Check if we need a new page
      if (currentY + (textLines.length * lineHeight) > pageHeight - margin) {
        pdf.addPage();
        currentY = margin;
      }

      pdf.text(textLines, margin, currentY);
      currentY += textLines.length * lineHeight + 3;
    };

    // Helper function to add a heading
    const addHeading = (text: string, level: number = 1) => {
      const fontSize = level === 1 ? 16 : level === 2 ? 14 : 12;
      currentY += level === 1 ? 10 : 5;
      addText(text, fontSize, true);
      currentY += 5;
    };

    // Title Page
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text(t('admin:pdfTitles.nationalDigitalAddressingSystem'), pageWidth / 2, 40, { align: 'center' });
    
    pdf.setFontSize(18);
    pdf.text(t('admin:pdfTitles.comprehensiveUserManual'), pageWidth / 2, 55, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(t('admin:pdfTitles.version'), pageWidth / 2, 70, { align: 'center' });
    pdf.text(new Date().toLocaleDateString(i18n.language), pageWidth / 2, 80, { align: 'center' });

    // Add a new page for content
    pdf.addPage();
    currentY = margin;

    // Table of Contents
    addHeading(t('admin:pdfSections.tableOfContents'));
    addText(`1. ${t('admin:pdfSections.introduction')}..................................................3`);
    addText(`2. ${t('admin:pdfSections.systemOverview')}...............................................4`);
    addText(`3. ${t('admin:pdfSections.userRolesAndPermissions')}...................................5`);
    addText(`4. ${t('admin:pdfSections.addressRegistryModule')}......................................8`);
    addText(`5. ${t('admin:pdfSections.policeOperationsModule')}....................................15`);
    addText(`6. ${t('admin:pdfSections.integrationAndWorkflow')}....................................22`);
    addText(`7. ${t('admin:pdfSections.technicalGuidelines')}........................................25`);
    addText(`8. ${t('admin:pdfSections.troubleshooting')}.............................................28`);
    addText(`9. ${t('admin:pdfSections.securityAndBestPractices')}................................30`);
    addText(`10. ${t('admin:pdfSections.appendices')}.................................................32`);

    // Start content
    pdf.addPage();
    currentY = margin;

    // 1. Introduction
    addHeading(`1. ${t('admin:pdfSections.introduction')}`);
    addText(t('admin:pdfContent.introductionText'));
    addText(t('admin:pdfContent.introductionText2'));

    // 2. System Overview
    addHeading(`2. ${t('admin:pdfSections.systemOverview')}`);
    addText(t('admin:pdfContent.systemOverviewText'));
    addText(t('admin:pdfContent.systemOverviewText2'));

    // 3. User Roles and Permissions
    addHeading(`3. ${t('admin:pdfSections.userRolesAndPermissions')}`);
    
    addHeading('3.1 Address Registry Roles', 2);
    
    addText('Citizen:', 12, true);
    addText(t('admin:pdfContent.citizenRole'));
    
    addText('Field Agent:', 12, true);
    addText(t('admin:pdfContent.fieldAgentRole'));
    
    addText('Verifier:', 12, true);
    addText(t('admin:pdfContent.verifierRole'));
    
    addText('Registrar:', 12, true);
    addText(t('admin:pdfContent.registrarRole'));

    addHeading('3.2 Police Operations Roles', 2);
    
    addText('Police Operator:', 12, true);
    addText(t('admin:pdfContent.policeOperatorRole'));
    
    addText('Police Dispatcher:', 12, true);
    addText(t('admin:pdfContent.policeDispatcherRole'));
    
    addText('Police Supervisor:', 12, true);
    addText(t('admin:pdfContent.policeSupervisorRole'));
    
    addText('Police Administrator:', 12, true);
    addText(t('admin:pdfContent.policeAdminRole'));

    // Footer
    pdf.setFontSize(8);
    pdf.text(t('admin:pdfContent.generatedBy'), margin, pageHeight - 10);
    pdf.text(`${t('admin:pdfContent.generatedOn')} ${new Date().toLocaleDateString(i18n.language)}`, margin, pageHeight - 5);

    // Save the PDF
    const fileName = i18n.language === 'es' ? 'Manual-Usuario-NDAS.pdf' : 
                     i18n.language === 'fr' ? 'Manuel-Utilisateur-NDAS.pdf' : 
                     'NDAS-User-Manual.pdf';
    pdf.save(fileName);
  };

  return (
    <Button onClick={generatePDF} className="flex items-center gap-2">
      <FileText className="h-4 w-4" />
      <Download className="h-4 w-4" />
      {t('admin:downloadSystemManual')}
    </Button>
  );
};