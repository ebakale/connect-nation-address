import React from 'react';
import jsPDF from 'jspdf';
import { Button } from './ui/button';
import { Download, Calculator } from 'lucide-react';

const FinancialAnalysisPDFEnglish = () => {
  const generatePDF = () => {
    const pdf = new jsPDF('portrait', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Set up colors
    const primaryColor = '#2563eb';
    const accentColor = '#059669';
    const warningColor = '#dc2626';
    const textColor = '#1f2937';
    
    // Helper function to add new page
    const addNewPage = () => {
      pdf.addPage();
    };
    
    // Helper function for section headers
    const addSectionHeader = (title: string, y: number) => {
      pdf.setFontSize(16);
      pdf.setTextColor(primaryColor);
      pdf.text(title, 15, y);
      pdf.setDrawColor(primaryColor);
      pdf.line(15, y + 2, pageWidth - 15, y + 2);
      return y + 10;
    };
    
    // Helper function for tables
    const addTable = (headers: string[], rows: string[][], startY: number) => {
      const colWidth = (pageWidth - 30) / headers.length;
      let currentY = startY;
      
      // Headers
      pdf.setFillColor(primaryColor);
      pdf.rect(15, currentY, pageWidth - 30, 8, 'F');
      pdf.setFontSize(9);
      pdf.setTextColor(255, 255, 255);
      headers.forEach((header, i) => {
        pdf.text(header, 17 + (i * colWidth), currentY + 5);
      });
      currentY += 8;
      
      // Rows
      pdf.setTextColor(textColor);
      pdf.setFontSize(8);
      rows.forEach((row, rowIndex) => {
        const fillColor = rowIndex % 2 === 0 ? '#f9fafb' : '#ffffff';
        pdf.setFillColor(fillColor);
        pdf.rect(15, currentY, pageWidth - 30, 6, 'F');
        
        row.forEach((cell, i) => {
          pdf.text(cell, 17 + (i * colWidth), currentY + 4);
        });
        currentY += 6;
      });
      
      return currentY + 5;
    };
    
    // Page 1: Title and Introduction
    pdf.setFontSize(20);
    pdf.setTextColor(primaryColor);
    pdf.text('FINANCIAL ANALYSIS - BIAKAM', pageWidth / 2, 30, { align: 'center' });
    pdf.setFontSize(14);
    pdf.text('3-Year Projection - Equatorial Guinea', pageWidth / 2, 40, { align: 'center' });
    
    let currentY = 60;
    currentY = addSectionHeader('EXECUTIVE SUMMARY', currentY);
    
    pdf.setFontSize(10);
    pdf.setTextColor(textColor);
    const executiveSummary = [
      'This analysis presents financial projections for implementing Biakam\'s National',
      'Address System in Equatorial Guinea during the first 3 years of operation.',
      '',
      'COUNTRY CONTEXT:',
      '• Population: ~1.4 million inhabitants',
      '• GDP per capita: ~$8,000 USD (2023)',
      '• Oil-based economy with ongoing diversification',
      '• Developing technological infrastructure',
      '• Government with investment capacity for modernization',
      '',
      'KEY ASSUMPTIONS:',
      '• Gradual implementation in 3 phases (Malabo, Bata, rest of country)',
      '• Progressive adoption: 20% year 1, 60% year 2, 85% year 3',
      '• Costs adjusted to Equatorial Guinea local market',
      '• Revenue based on government licenses and services'
    ];
    
    executiveSummary.forEach(line => {
      if (currentY > pageHeight - 20) {
        addNewPage();
        currentY = 20;
      }
      pdf.text(line, 15, currentY);
      currentY += 5;
    });
    
    // Page 2: CAPEX Analysis
    addNewPage();
    currentY = 20;
    currentY = addSectionHeader('CAPEX ANALYSIS (Initial Investment)', currentY);
    
    const capexHeaders = ['Category', 'Description', 'Cost (€)', 'Justification'];
    const capexRows = [
      ['Software Development', 'Initial platform + mobile', '450,000', 'EG-specific development'],
      ['IT Infrastructure', 'Servers, hosting, security', '180,000', 'Robust local infrastructure'],
      ['Software Licenses', 'GIS, databases, tools', '120,000', 'Specialized licenses'],
      ['Equipment', 'Hardware, mobile devices', '90,000', 'Field team equipment'],
      ['Initial Training', 'User and technical training', '75,000', 'Massive training needed'],
      ['Launch Marketing', 'National awareness campaign', '60,000', 'Citizen education essential'],
      ['Legal & Regulatory', 'Regulatory compliance', '45,000', 'Legal framework adaptation'],
      ['Contingencies (10%)', 'Unforeseen costs', '102,000', 'Large project risks'],
      ['TOTAL CAPEX', '', '1,122,000', 'Total initial investment']
    ];
    
    currentY = addTable(capexHeaders, capexRows, currentY);
    
    // Page 3: OPEX Analysis
    addNewPage();
    currentY = 20;
    currentY = addSectionHeader('OPEX ANALYSIS (Annual Operating Expenses)', currentY);
    
    const opexHeaders = ['Category', 'Year 1 (€)', 'Year 2 (€)', 'Year 3 (€)', 'Notes'];
    const opexRows = [
      ['Technical Staff', '240,000', '280,000', '320,000', 'Team growth'],
      ['Support & Maintenance', '120,000', '140,000', '160,000', 'Scales with users'],
      ['Hosting Infrastructure', '60,000', '85,000', '110,000', 'Capacity growth'],
      ['Continuous Marketing', '45,000', '55,000', '65,000', 'Sustained adoption'],
      ['Software Updates', '36,000', '42,000', '48,000', 'Continuous improvements'],
      ['Ongoing Training', '30,000', '35,000', '40,000', 'New user training'],
      ['Administration', '48,000', '55,000', '62,000', 'Administrative expenses'],
      ['Operational Contingencies', '30,000', '35,000', '40,000', 'Operational unforeseen'],
      ['TOTAL ANNUAL OPEX', '609,000', '727,000', '845,000', 'Total operating expenses']
    ];
    
    currentY = addTable(opexHeaders, opexRows, currentY);
    
    // Page 4: Revenue Analysis
    addNewPage();
    currentY = 20;
    currentY = addSectionHeader('REVENUE ANALYSIS', currentY);
    
    const revenueHeaders = ['Revenue Source', 'Year 1 (€)', 'Year 2 (€)', 'Year 3 (€)', 'Model'];
    const revenueRows = [
      ['Central Government License', '400,000', '450,000', '500,000', 'Annual + scaled'],
      ['Municipal Licenses', '120,000', '280,000', '420,000', 'Gradual adoption'],
      ['Implementation Services', '200,000', '150,000', '100,000', 'Decreasing'],
      ['Private Company APIs', '50,000', '180,000', '350,000', 'Exponential growth'],
      ['Training & Consulting', '80,000', '120,000', '160,000', 'Continuous services'],
      ['Premium Support', '30,000', '70,000', '120,000', 'Value-added'],
      ['Address Verification', '20,000', '80,000', '150,000', 'Commercial services'],
      ['System Integration', '100,000', '80,000', '60,000', 'One-time project'],
      ['TOTAL REVENUE', '1,000,000', '1,410,000', '1,860,000', 'Sustained growth']
    ];
    
    currentY = addTable(revenueHeaders, revenueRows, currentY);
    
    // Page 5: Financial Summary
    addNewPage();
    currentY = 20;
    currentY = addSectionHeader('FINANCIAL SUMMARY AND ANALYSIS', currentY);
    
    const summaryHeaders = ['Metric', 'Year 1', 'Year 2', 'Year 3', 'Total/Average'];
    const summaryRows = [
      ['Revenue (€)', '1,000,000', '1,410,000', '1,860,000', '4,270,000'],
      ['OPEX (€)', '609,000', '727,000', '845,000', '2,181,000'],
      ['EBITDA (€)', '391,000', '683,000', '1,015,000', '2,089,000'],
      ['EBITDA Margin (%)', '39.1%', '48.4%', '54.6%', '48.9%'],
      ['Cumulative Cash Flow (€)', '-731,000', '-48,000', '967,000', ''],
      ['Cumulative ROI (%)', '-65%', '-4%', '+86%', ''],
      ['Payback Period', '', '', '2.1 years', ''],
      ['NPV (10% discount)', '', '', '', '1,456,000']
    ];
    
    currentY = addTable(summaryHeaders, summaryRows, currentY);
    
    currentY += 10;
    pdf.setFontSize(12);
    pdf.setTextColor(accentColor);
    pdf.text('KEY CONCLUSIONS:', 15, currentY);
    currentY += 8;
    
    pdf.setFontSize(10);
    pdf.setTextColor(textColor);
    const conclusions = [
      '✓ Financially viable project with 2.1-year payback period',
      '✓ Growing margins from 39% to 55% indicating scalability',
      '✓ Positive NPV of €1.46M with conservative 10% discount rate',
      '✓ Revenue diversification reduces dependency risks',
      '✓ Unique opportunity for market leadership with no competition',
      '',
      'MAIN RISKS:',
      '• Slower government adoption than projected',
      '• Late but possible international competition',
      '• Regulatory or political changes',
      '• Technical challenges in local infrastructure',
      '',
      'RECOMMENDATIONS:',
      '• Secure long-term government contracts',
      '• Develop strong local strategic partnerships',
      '• Invest in massive training for adoption',
      '• Maintain continuous technological innovation'
    ];
    
    conclusions.forEach(line => {
      if (currentY > pageHeight - 15) {
        addNewPage();
        currentY = 20;
      }
      pdf.text(line, 15, currentY);
      currentY += 5;
    });
    
    // Footer
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text('© 2024 Biakam - Financial Analysis National Address System', pageWidth / 2, pageHeight - 10, { align: 'center' });
    
    pdf.save('Financial-Analysis-Biakam-Equatorial-Guinea-EN.pdf');
  };

  return (
    <Button
      onClick={generatePDF}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <Calculator className="h-4 w-4" />
      <Download className="h-4 w-4" />
      Financial Analysis (EN)
    </Button>
  );
};

export default FinancialAnalysisPDFEnglish;