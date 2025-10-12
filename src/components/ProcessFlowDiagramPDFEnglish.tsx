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
      'START → Citizen or authority submits address request',
      '↓',
      'DATA CAPTURE → GPS coordinates, photographs, justification, documents',
      '↓', 
      'AUTO-VERIFICATION → Coordinate validation, photo quality, duplicates',
      '↓',
      'FLAGGING → System flags for standard or manual review',
      '↓',
      'VERIFIER REVIEW → Verifier reviews in queue, approves/rejects/edits',
      '↓',
      'APPROVAL → Creates address record via approve_address_request()',
      '↓',
      'UAC GENERATION → System generates UAC using generate_unified_uac_unique()',
      '↓',
      'PUBLICATION → Registrar sets verified=true and public=true',
      '↓',
      'END → Address searchable, available for emergencies and CAR'
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
      'START → Citizen accesses CitizenAddressVerificationManager',
      '↓',
      'PERSON RECORD → System creates/loads person record linked to auth.uid()',
      '↓',
      'ACTION SELECTION → Set Primary/Add Secondary/Request Verification',
      '↓',
      'UAC INPUT → Citizen enters UAC from NAR (must exist)',
      '↓',
      'SCOPE SELECTION → DWELLING (whole property) or UNIT (specific unit)',
      '↓',
      'RPC EXECUTION → set_primary_address() or add_secondary_address()',
      '↓',
      'STATUS → Address created with status "SELF_DECLARED"',
      '↓',
      'VERIFIER REVIEW → CAR verifiers review in queue',
      '↓',
      'STATUS UPDATE → set_citizen_address_status() to CONFIRMED/REJECTED',
      '↓',
      'END → Active in citizen profile with effective dates'
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
      'START → Reporter submits via EmergencyDispatchDialog',
      '↓',
      'INCIDENT CREATION → Generates INC-[timestamp] number',
      '↓',
      'DATA ENCRYPTION → decrypt-incident-data edge function encrypts data',
      '↓',
      'STATUS: REPORTED → Initial incident status in emergency_incidents table',
      '↓',
      'OPERATOR NOTIFICATION → notify-emergency-operators edge function',
      '↓',
      'OPERATOR ASSIGNMENT → Dispatcher assigns to operator',
      '↓',
      'UNIT ASSIGNMENT → Operator assigns units, status: ASSIGNED',
      '↓',
      'UNIT NOTIFICATION → notify-unit-assignment edge function',
      '↓',
      'STATUS: RESPONDING → Unit en route, GPS tracking active',
      '↓',
      'STATUS: ON_SCENE → Unit arrives, responded_at timestamp',
      '↓',
      'BACKUP (if needed) → process-backup-request via BackupNotificationManager',
      '↓',
      'STATUS: RESOLVED → Officer completes report, resolved_at timestamp',
      '↓',
      'STATUS: CLOSED → Final documentation, analytics updated',
      '↓',
      'END → notify-incident-reporter edge function notifies reporter'
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
      '• CAR requires valid NAR UACs (foreign key relationship)',
      '• Emergency incidents reference NAR addresses via incident_uac',
      '• Citizen addresses link to person records via person_id',
      '• Person records link to auth users via auth_user_id',
      '• Unified RLS policies use has_role() function across all modules',
      '• Emergency units track location for nearest-unit assignment',
      '• Quality metrics track coverage and verification rates',
      '• Edge functions provide secure processing and notifications'
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
      'ADMIN → Full system access, manages users and configuration',
      'REGISTRAR → Publishes addresses, manages NAR authorities',
      'VERIFIER → Reviews and approves NAR address requests',
      'CITIZEN → Submits address requests, declares CAR addresses',
      'CAR_ADMIN → Manages CAR permissions and quality metrics',
      'CAR_VERIFIER → Reviews and verifies citizen address declarations',
      'POLICE_ADMIN → Manages police system and units',
      'POLICE_SUPERVISOR → Manages units and geographic coverage',
      'POLICE_OPERATOR → Responds to incidents, unit member',
      'POLICE_DISPATCHER → Assigns incidents to units',
      'NAR_AUTHORITY → Can create/verify/update addresses (regional scope)'
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
      'Auto-verification → Immediate (coordinates, duplicates, photo quality)',
      'Verifier Review → Address requests flagged within 24 hours',
      'NAR Publication → Approved addresses published within 48 hours',
      'CAR Verification → Citizen addresses reviewed within 5 business days',
      'Critical Emergency → Operator notification < 1 minute, response varies by unit',
      'Incident Tracking → Real-time GPS updates from units',
      'Data Encryption → All sensitive emergency data encrypted at rest',
      'System Availability → RLS policies enforce role-based access 24/7'
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