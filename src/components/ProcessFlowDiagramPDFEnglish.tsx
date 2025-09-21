import React from 'react';
import jsPDF from 'jspdf';
import { Button } from './ui/button';
import { Download } from 'lucide-react';

const ProcessFlowDiagramPDFEnglish: React.FC = () => {
  const generatePDF = () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;

    // Title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PROCESS FLOW DIAGRAMS - BIAKAM', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 15;
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('National Address System and Emergency Management', pageWidth / 2, yPosition, { align: 'center' });
    pdf.text('Republic of Equatorial Guinea', pageWidth / 2, yPosition + 5, { align: 'center' });

    yPosition += 20;

    // NAR Process Flow
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('1. NAR PROCESS - NATIONAL ADDRESS REGISTRY', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    const narSteps = [
      'START → Field Agent identifies new location',
      '↓',
      'DATA CAPTURE → GPS coordinates, photographs, description',
      '↓', 
      'UAC GENERATION → System generates Unique Address Code',
      '↓',
      'VALIDATION → Automatic verification of coordinates and duplicates',
      '↓',
      'MANUAL REVIEW → Verifier reviews data quality',
      '↓',
      'APPROVAL → Registrar approves inclusion in NAR',
      '↓',
      'PUBLICATION → Address becomes publicly available',
      '↓',
      'END → Address active in the system'
    ];

    narSteps.forEach(step => {
      if (step === '↓') {
        pdf.text(step, 105, yPosition, { align: 'center' });
        yPosition += 4;
      } else {
        pdf.text(step, 20, yPosition);
        yPosition += 6;
      }
    });

    yPosition += 10;

    // CAR Process Flow
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('2. CAR PROCESS - CITIZEN ADDRESS REPOSITORY', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    const carSteps = [
      'START → Citizen accesses CAR portal',
      '↓',
      'AUTHENTICATION → Login with credentials or new registration',
      '↓',
      'DECLARATION → Citizen declares residence address',
      '↓',
      'UAC SEARCH → System searches corresponding UAC in NAR',
      '↓',
      'VALIDATION → Verification of personal data and address',
      '↓',
      'INITIAL STATUS → Address marked as "SELF_DECLARED"',
      '↓',
      'VERIFICATION → Confirmation process by authorities',
      '↓',
      'APPROVAL/REJECTION → Final status "CONFIRMED" or "REJECTED"',
      '↓',
      'END → Address registered in citizen profile'
    ];

    carSteps.forEach(step => {
      if (step === '↓') {
        pdf.text(step, 105, yPosition, { align: 'center' });
        yPosition += 4;
      } else {
        pdf.text(step, 20, yPosition);
        yPosition += 6;
      }
    });

    // New page for Emergency Management
    pdf.addPage();
    yPosition = 20;

    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('3. EMERGENCY MANAGEMENT PROCESS', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    const emergencySteps = [
      'START → Citizen reports emergency',
      '↓',
      'RECEPTION → System receives alert (call, SMS, app)',
      '↓',
      'CLASSIFICATION → Emergency type and priority',
      '↓',
      'LOCATION → Identification of nearest UAC',
      '↓',
      'ENCRYPTION → Sensitive data encrypted for security',
      '↓',
      'ASSIGNMENT → System assigns available dispatcher',
      '↓',
      'NOTIFICATION → Alert to emergency units',
      '↓',
      'DISPATCH → Units proceed to location',
      '↓',
      'TRACKING → Real-time incident monitoring',
      '↓',
      'RESOLUTION → Incident closure and final report',
      '↓',
      'END → Incident resolved and documented'
    ];

    emergencySteps.forEach(step => {
      if (step === '↓') {
        pdf.text(step, 105, yPosition, { align: 'center' });
        yPosition += 4;
      } else {
        pdf.text(step, 20, yPosition);
        yPosition += 6;
      }
    });

    yPosition += 15;

    // Integration Flow
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('4. MODULE INTEGRATION', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    const integrationFlow = [
      '• NAR provides verified address base for CAR',
      '• CAR feeds NAR with citizen address reports',
      '• Emergencies use NAR UACs for precise location',
      '• CAR provides resident data for emergency contact',
      '• Unified authentication system across modules',
      '• Integrated dashboards for authorities and administrators'
    ];

    integrationFlow.forEach(item => {
      pdf.text(item, 20, yPosition);
      yPosition += 6;
    });

    yPosition += 15;

    // Roles and Responsibilities
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('5. ROLES AND RESPONSIBILITIES', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    const roles = [
      'FIELD AGENT → Captures addresses in the field',
      'VERIFIER → Validates address data quality',
      'REGISTRAR → Approves inclusion in national registry',
      'CITIZEN → Declares and maintains their addresses',
      'DISPATCHER → Manages emergencies and coordinates response',
      'EMERGENCY UNIT → Responds to incidents',
      'ADMINISTRATOR → Supervises system and users'
    ];

    roles.forEach(role => {
      pdf.text(role, 20, yPosition);
      yPosition += 6;
    });

    yPosition += 15;

    // SLA and Performance Metrics
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('6. PERFORMANCE METRICS (SLA)', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    const slaMetrics = [
      'NAR Registration → Maximum 48 hours from capture',
      'CAR Verification → Maximum 5 business days',
      'Critical Emergency Response → Maximum 3 minutes',
      'Normal Emergency Response → Maximum 15 minutes',
      'System Availability → 99.5% uptime',
      'Incident Resolution Time → According to protocol'
    ];

    slaMetrics.forEach(metric => {
      pdf.text(metric, 20, yPosition);
      yPosition += 6;
    });

    // Footer
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    pdf.text('Generated by Biakam System - Equatorial Guinea', pageWidth / 2, pageHeight - 10, { align: 'center' });
    pdf.text(`Date: ${new Date().toLocaleDateString('en-US')}`, pageWidth - 20, pageHeight - 10, { align: 'right' });

    pdf.save('biakam-process-flow-diagrams-en.pdf');
  };

  return (
    <Button onClick={generatePDF} variant="outline" size="sm">
      <Download className="h-4 w-4 mr-2" />
      Process Flow Diagrams (EN)
    </Button>
  );
};

export default ProcessFlowDiagramPDFEnglish;