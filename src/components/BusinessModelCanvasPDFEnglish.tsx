import React from 'react';
import jsPDF from 'jspdf';
import { Button } from './ui/button';
import { Download, FileText } from 'lucide-react';

const BusinessModelCanvasPDFEnglish = () => {
  const generatePDF = () => {
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Set up colors
    const primaryColor = '#2563eb';
    const secondaryColor = '#f3f4f6';
    const textColor = '#1f2937';
    
    // Title
    pdf.setFontSize(24);
    pdf.setTextColor(primaryColor);
    pdf.text('BUSINESS MODEL CANVAS - BIAKAM', pageWidth / 2, 20, { align: 'center' });
    pdf.setFontSize(16);
    pdf.text('National Address System for Equatorial Guinea', pageWidth / 2, 30, { align: 'center' });
    
    // Grid setup
    const startY = 45;
    const cellHeight = (pageHeight - startY - 10) / 2;
    const cellWidth = pageWidth / 5;
    
    // Helper function to add section
    const addSection = (x: number, y: number, width: number, height: number, title: string, content: string[]) => {
      pdf.setDrawColor(primaryColor);
      pdf.setLineWidth(0.5);
      pdf.rect(x, y, width, height);
      
      // Title background
      pdf.setFillColor(primaryColor);
      pdf.rect(x, y, width, 8, 'F');
      
      // Title text
      pdf.setFontSize(10);
      pdf.setTextColor(255, 255, 255);
      pdf.text(title, x + 2, y + 5);
      
      // Content
      pdf.setTextColor(textColor);
      pdf.setFontSize(8);
      let contentY = y + 12;
      content.forEach((line, index) => {
        if (contentY < y + height - 3) {
          const lines = pdf.splitTextToSize(line, width - 4);
          lines.forEach((splitLine: string) => {
            if (contentY < y + height - 3) {
              pdf.text(splitLine, x + 2, contentY);
              contentY += 3;
            }
          });
          contentY += 1;
        }
      });
    };

    // Top row sections
    addSection(0, startY, cellWidth, cellHeight, 'KEY PARTNERS', [
      '• Government of Equatorial Guinea',
      '• Ministry of Interior and Security',
      '• Emergency Services (Fire, Ambulance)',
      '• State Security Forces',
      '• Local telecommunications companies',
      '• GPS/GIS technology providers',
      '• International cooperation organizations',
      '• Local universities for training',
      '• Logistics and distribution companies',
      '• Banks and financial institutions',
      '• Local community organizations'
    ]);
    
    addSection(cellWidth, startY, cellWidth, cellHeight, 'KEY ACTIVITIES', [
      '• Software development and maintenance',
      '• User training and capacity building',
      '• Address registration and verification',
      '• 24/7 technical support',
      '• Continuous database updates',
      '• Government system integration',
      '• Technology consulting services',
      '• System monitoring and analysis',
      '• Security measures implementation',
      '• Third-party API development',
      '• Marketing and system promotion'
    ]);
    
    addSection(cellWidth * 2, startY, cellWidth, cellHeight, 'VALUE PROPOSITIONS', [
      '• First national address system',
      '• Real-time precise location',
      '• Enhanced emergency services',
      '• Facilitates commercial development',
      '• Reduces police response times',
      '• Empowers citizens',
      '• Modernizes national infrastructure',
      '• Generates unique address codes',
      '• Multi-language interface (Spanish, French, Fang)',
      '• Works offline in remote areas',
      '• Government services integration'
    ]);
    
    addSection(cellWidth * 3, startY, cellWidth, cellHeight, 'CUSTOMER RELATIONSHIPS', [
      '• Dedicated technical support',
      '• Continuous on-site training',
      '• Online self-service portal',
      '• Automatic updates',
      '• User community building',
      '• Constant feedback and improvements',
      '• Implementation assistance',
      '• Complete technical documentation',
      '• Webinars and workshops',
      '• Local call center',
      '• Regular technical visits'
    ]);
    
    addSection(cellWidth * 4, startY, cellWidth, cellHeight, 'CUSTOMER SEGMENTS', [
      '• Central and Regional Government',
      '• State Security Forces',
      '• Emergency Services',
      '• Municipalities and Local Councils',
      '• Logistics and delivery companies',
      '• Banks and financial institutions',
      '• Telecommunications companies',
      '• Insurance companies',
      '• International organizations',
      '• Individual citizens',
      '• E-commerce companies'
    ]);
    
    // Bottom row sections
    addSection(0, startY + cellHeight, cellWidth * 2, cellHeight, 'KEY RESOURCES', [
      '• Specialized technical team',
      '• Robust technology platform',
      '• Georeferenced database',
      '• GIS software licenses',
      '• Server infrastructure',
      '• Local support network',
      '• Intellectual property and algorithms',
      '• Strategic partnerships',
      '• Financial capital for expansion',
      '• Local market knowledge',
      '• Security certifications'
    ]);
    
    addSection(cellWidth * 2, startY + cellHeight, cellWidth, cellHeight, 'CHANNELS', [
      '• Direct government sales',
      '• Public tenders',
      '• Local commercial partners',
      '• Institutional web platform',
      '• Mobile applications',
      '• Citizen service centers',
      '• Government events',
      '• Local media',
      '• Official social networks',
      '• Technology partnerships',
      '• Physical distribution channels'
    ]);
    
    addSection(cellWidth * 3, startY + cellHeight, cellWidth, cellHeight, 'COST STRUCTURE', [
      '• Software development and maintenance',
      '• Technical and support staff',
      '• Technology infrastructure (servers, hosting)',
      '• Software licenses and tools',
      '• Marketing and sales',
      '• Training and capacity building',
      '• Research and development',
      '• Local operational costs',
      '• Regulatory compliance',
      '• Data security and backup',
      '• Administrative expenses'
    ]);
    
    addSection(cellWidth * 4, startY + cellHeight, cellWidth, cellHeight, 'REVENUE STREAMS', [
      '• Government software licenses',
      '• Implementation services',
      '• Annual maintenance subscriptions',
      '• Training and consulting',
      '• APIs for private companies',
      '• Address verification services',
      '• Existing system integration',
      '• Premium technical support',
      '• Updates and improvements',
      '• Data analysis services',
      '• Developer licenses'
    ]);
    
    // Footer
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text('© 2024 Biakam - National Address System for Equatorial Guinea', pageWidth / 2, pageHeight - 5, { align: 'center' });
    
    pdf.save('Business-Model-Canvas-Biakam-Equatorial-Guinea-EN.pdf');
  };

  return (
    <Button
      onClick={generatePDF}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <FileText className="h-4 w-4" />
      <Download className="h-4 w-4" />
      Business Model Canvas (EN)
    </Button>
  );
};

export default BusinessModelCanvasPDFEnglish;