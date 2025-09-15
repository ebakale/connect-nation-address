import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';

export const StrategicOverviewPDF: React.FC = () => {
  const { t, i18n } = useTranslation(['admin']);
  
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
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text(t('admin:strategicOverview.title'), pageWidth / 2, 40, { align: 'center' });
    
    pdf.setFontSize(14);
    pdf.text(t('admin:strategicOverview.subtitle'), pageWidth / 2, 55, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(t('admin:strategicOverview.version'), pageWidth / 2, 75, { align: 'center' });
    pdf.text(new Date().toLocaleDateString(i18n.language), pageWidth / 2, 85, { align: 'center' });

    // Add Republic of Equatorial Guinea
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'italic');
    const countryText = i18n.language === 'es' ? 'República de Guinea Ecuatorial' :
                        i18n.language === 'fr' ? 'République de Guinée Équatoriale' :
                        'Republic of Equatorial Guinea';
    pdf.text(countryText, pageWidth / 2, 100, { align: 'center' });

    // Add new page for content
    pdf.addPage();
    currentY = margin;

    // Executive Summary
    addHeading(`1. ${t('admin:strategicOverview.executiveSummary')}`);
    addText(t('admin:strategicOverview.content.executiveSummaryText'));

    // System Overview
    addHeading(`2. ${t('admin:strategicOverview.systemOverview')}`);
    addText(t('admin:strategicOverview.content.systemOverviewText'));

    addHeading('2.1 Address Registry Module', 2);
    addText(t('admin:strategicOverview.content.addressModuleDescription'));

    addHeading('2.2 Police Operations Module', 2);
    addText(t('admin:strategicOverview.content.policeModuleDescription'));

    // National Benefits Analysis
    addHeading(`3. ${t('admin:strategicOverview.nationalBenefits')}`);

    addHeading(`3.1 ${t('admin:strategicOverview.securityBenefits')}`, 2);
    addText(t('admin:strategicOverview.content.securityBenefitsText'));

    addHeading(`3.2 ${t('admin:strategicOverview.economicBenefits')}`, 2);
    addText(t('admin:strategicOverview.content.economicBenefitsText'));

    addHeading(`3.3 ${t('admin:strategicOverview.socialBenefits')}`, 2);
    addText(t('admin:strategicOverview.content.socialBenefitsText'));

    addHeading(`3.4 ${t('admin:strategicOverview.governmentBenefits')}`, 2);
    addText(t('admin:strategicOverview.content.governmentBenefitsText'));

    // Implementation Strategy
    addHeading(`4. ${t('admin:strategicOverview.implementationStrategy')}`);
    addText(t('admin:strategicOverview.content.implementationText'));

    // Conclusion
    addHeading(`5. ${t('admin:strategicOverview.conclusion')}`);
    addText(t('admin:strategicOverview.content.conclusionText'));

    // Footer
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    
    const footerText = i18n.language === 'es' ? 'Documento Estratégico - Connect Nation' :
                       i18n.language === 'fr' ? 'Document Stratégique - Connect Nation' :
                       'Strategic Document - Connect Nation';
    
    pdf.text(footerText, margin, pageHeight - 10);
    pdf.text(`${t('admin:pdfContent.generatedOn')} ${new Date().toLocaleDateString(i18n.language)}`, margin, pageHeight - 5);

    // Save the PDF
    const fileName = i18n.language === 'es' ? 'Vision-Estrategica-Guinea-Ecuatorial.pdf' : 
                     i18n.language === 'fr' ? 'Vision-Strategique-Guinee-Equatoriale.pdf' : 
                     'Strategic-Overview-Equatorial-Guinea.pdf';
    pdf.save(fileName);
  };

  return (
    <Button onClick={generatePDF} className="flex items-center gap-2">
      <FileText className="h-4 w-4" />
      <Download className="h-4 w-4" />
      {t('admin:downloadStrategicOverview')}
    </Button>
  );
};