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
    pdf.text('Connect Nation Unified Platform', pageWidth / 2, 40, { align: 'center' });
    
    pdf.setFontSize(18);
    pdf.text('Comprehensive System Manual', pageWidth / 2, 55, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Version 2.0', pageWidth / 2, 70, { align: 'center' });
    pdf.text(new Date().toLocaleDateString(i18n.language), pageWidth / 2, 80, { align: 'center' });

    // Add a new page for content
    pdf.addPage();
    currentY = margin;

    // Table of Contents
    addHeading('Table of Contents');
    addText('1. System Overview....................................................3');
    addText('2. Module Overview....................................................4');
    addText('3. User Roles and Permissions.........................................5');
    addText('4. Core Workflows....................................................12');
    addText('5. Feature Descriptions..............................................18');
    addText('6. Administrator Guide...............................................22');
    addText('7. User Guides by Role...............................................26');
    addText('8. Technical Documentation...........................................30');
    addText('9. Troubleshooting...................................................32');

    // Start content
    pdf.addPage();
    currentY = margin;

    // 1. System Overview
    addHeading('1. System Overview');
    addText('The Connect Nation Unified Platform is a comprehensive digital ecosystem designed to modernize and integrate both address registration and police operations in Equatorial Guinea. This unified platform consists of two tightly integrated modules that work synergistically to provide enhanced public services, emergency response coordination, and data-driven urban planning capabilities.');

    // 2. Module Overview
    addHeading('2. Module Overview');
    
    addHeading('2.1 Address Registry Module', 2);
    addText('The address registry system manages the complete lifecycle of address registration, verification, and publication through a sophisticated multi-stage workflow. It provides a foundation for accurate location services and enables precise geographic data management across the nation.');
    
    addText('Core Capabilities:', 12, true);
    addText('• Structured Workflow Management: Submit Request → Capture Draft → Verify → Publish workflow');
    addText('• Geographic Information Integration: GPS-based location capture with coordinate validation');
    addText('• Unified Address Code (UAC) Generation: Standardized addressing with hierarchical codes');
    addText('• Evidence Documentation: Secure photo capture and document management');
    addText('• Quality Assurance Process: Multi-level verification with duplicate detection');
    addText('• Role-Based Access Control: Geographic and organizational scope restrictions');
    addText('• API Integration: Partner access for utilities, delivery services, and emergency systems');

    addHeading('2.2 Police Operations Module', 2);
    addText('The police operations system provides comprehensive incident management, emergency response coordination, and law enforcement operational support through real-time communication and tracking capabilities.');
    
    addText('Core Capabilities:', 12, true);
    addText('• Real-time Incident Management: End-to-end incident tracking from report to resolution');
    addText('• Emergency Dispatch Coordination: Intelligent unit assignment and resource optimization');
    addText('• Field Operations Support: Mobile-friendly tools for officers and supervisors');
    addText('• Communication Hub: Secure messaging and broadcast systems');
    addText('• Performance Analytics: Response time tracking and operational metrics');
    addText('• Unit Management: Hierarchical team organization and status monitoring');
    addText('• Backup Coordination: Streamlined resource request and deployment process');

    // 3. User Roles and Permissions
    addHeading('3. User Roles and Permissions');
    addText('The unified platform supports two distinct role hierarchies - one for the Address Registry Module and one for the Police Operations Module. Users can have roles in one or both modules based on their responsibilities.');
    
    addHeading('3.1 Address Registry Module Roles', 2);
    
    addText('Citizen (Default Role):', 12, true);
    addText('General public users who can search for verified addresses. Permissions include searching verified addresses, viewing redacted evidence/documents, and accessing status information for their own submissions.');
    
    addText('Property Claimant:', 12, true);
    addText('Property owners who can submit proof of ownership for address registration. Can upload evidence for own submissions only and view own evidence and submissions.');
    
    addText('Field Agent:', 12, true);
    addText('Data collection specialists who capture address information in the field. Can create draft addresses, upload evidence and photos, with geographic scope restrictions applied to assigned districts/areas.');
    
    addText('Verifier:', 12, true);
    addText('Quality assurance specialists who verify address accuracy and resolve duplicates. Can verify addresses, create corrective draft addresses, merge and split records, access full evidence, and flag addresses for review with district-level access.');
    
    addText('Registrar:', 12, true);
    addText('Provincial administrators who publish verified addresses to the official registry. Can publish addresses to public registry, retire/unpublish addresses, and have all Verifier permissions with province-level access.');
    
    addText('NDAA Admin (National Digital Address Authority):', 12, true);
    addText('National-level administrators with full system oversight. Can override system decisions, manage API keys and webhooks, edit national-level hierarchy, and access all audit logs with national access.');

    addHeading('3.2 Police Operations Module Roles', 2);
    
    addText('Police Admin:', 12, true);
    addText('System administrators for police operations with comprehensive oversight and configuration authority. Can manage all police system users and role assignments, configure system-wide settings, access all incident data and analytics.');
    
    addText('Police Supervisor:', 12, true);
    addText('Senior officers responsible for tactical oversight, unit management, and operational performance. Can monitor all incidents within assigned jurisdiction, assign units to incidents, access real-time unit status, and review officer performance metrics.');
    
    addText('Police Dispatcher:', 12, true);
    addText('Emergency response coordinators managing real-time incident dispatch and communication. Can receive and process emergency calls, create and manage incident records, dispatch units using optimal assignment algorithms, and coordinate emergency response.');
    
    addText('Police Operator:', 12, true);
    addText('Field officers and operational personnel responsible for direct incident response and law enforcement. Can view assigned incidents, update incident status, request backup, submit field reports, and access incident history for patrol areas.');

    // 4. Core Workflows
    addHeading('4. Core Workflows');
    
    addHeading('4.1 Standard Address Creation Workflow', 2);
    addText('Participants: Citizen → Field Agent → Verifier → Registrar');
    addText('1. Submit Request (Citizen): Submit new address request through web interface with basic location and justification information.');
    addText('2. Capture Draft (Field Agent): Visit location, capture precise coordinates, take photographs, and create detailed address draft with evidence.');
    addText('3. Verify (Verifier): Review draft for accuracy, check for duplicates, resolve data quality issues, and approve or request corrections.');
    addText('4. Publish (Registrar): Final review of verified addresses, publish to provincial registry, generate UAC, and make address publicly searchable.');

    addHeading('4.2 Emergency Incident Response Workflow', 2);
    addText('Participants: Citizen/System → Police Dispatcher → Police Operator → Police Supervisor');
    addText('SLA: Critical incidents within 4 minutes, standard incidents within 15 minutes');
    addText('1. Incident Report and Categorization: Emergency call received, incident details captured with automated categorization, location verified using integrated address registry.');
    addText('2. Intelligent Dispatch Coordination: Available units identified, optimal unit selection based on proximity and capability, incident assignment with comprehensive briefing.');
    addText('3. Dynamic Field Response: Unit dispatched with navigation to verified address, continuous status updates, mobile evidence collection, and backup request capability.');
    addText('4. Strategic Supervision and Analysis: Real-time response monitoring, resource coordination, quality assurance, and performance analysis.');

    // 5. Feature Descriptions
    addHeading('5. Feature Descriptions');
    
    addHeading('5.1 Address Registry Features', 2);
    addText('Address Search and Discovery: Comprehensive search functionality with filtering by location, status, and metadata. Support for geographic radius searches and coordinate-based lookups.');
    addText('Registration and Verification Tools: Multi-stage workflow management with evidence upload capabilities, GPS coordinate capture, and quality assurance processes.');
    addText('UAC Generation and Management: Automated generation of Unified Address Codes following national standards with hierarchical structure and validation.');

    addHeading('5.2 Police Operations Features', 2);
    addText('Incident Management: End-to-end incident lifecycle management with real-time updates, priority classification, and automated workflow routing.');
    addText('Dispatch Operations: Intelligent unit assignment algorithms, real-time communication tools, and performance monitoring capabilities.');
    addText('Analytics and Reporting: Comprehensive performance metrics, response time tracking, and operational intelligence dashboards.');

    // 6. Administrator Guide
    addHeading('6. Administrator Guide');
    
    addHeading('6.1 Initial System Setup', 2);
    addText('System administrators should begin with user management, role assignment, and geographic scope configuration. Establish province and district hierarchies, configure system parameters, and set up integration endpoints.');

    addHeading('6.2 Daily Operations', 2);
    addText('Monitor system performance, review audit logs, manage user access requests, and coordinate with stakeholders. Ensure data quality through regular verification processes and backup procedures.');

    addHeading('6.3 Security Management', 2);
    addText('Implement role-based access controls, monitor for unauthorized access attempts, maintain encryption standards, and ensure compliance with data protection regulations.');

    // Technical Documentation
    addHeading('7. Technical Documentation');
    
    addHeading('7.1 Database Schema', 2);
    addText('The system uses PostgreSQL with Supabase for backend services. Key tables include addresses, evidence, users, roles, incidents, and units. Row Level Security (RLS) policies enforce access controls at the database level.');

    addHeading('7.2 API Endpoints', 2);
    addText('RESTful API endpoints provide integration capabilities for external systems. Authentication uses JWT tokens with role-based permissions. Rate limiting and monitoring ensure system stability.');

    addHeading('7.3 Security Features', 2);
    addText('End-to-end encryption for sensitive data, secure file storage with access logging, audit trails for all system activities, and compliance with international security standards.');

    // Troubleshooting
    addHeading('8. Troubleshooting');
    
    addHeading('8.1 Common Issues', 2);
    addText('Authentication Problems: Verify user credentials, check role assignments, and ensure proper session management.');
    addText('Performance Issues: Monitor database queries, check system resources, and review network connectivity.');
    addText('Data Quality Concerns: Validate input data, check duplicate detection algorithms, and review verification processes.');

    addHeading('8.2 Support Contact Information', 2);
    addText('For technical support, contact the NDAA technical team at support@connectnation.gq or through the system help desk portal.');

    // Footer on every page
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.text(`Generated by Connect Nation Unified Platform - Page ${i} of ${totalPages}`, margin, pageHeight - 10);
      pdf.text(`Generated on ${new Date().toLocaleDateString(i18n.language)}`, margin, pageHeight - 5);
    }

    // Save the PDF
    const fileName = i18n.language === 'es' ? 'Manual-Sistema-Unificado.pdf' : 
                     i18n.language === 'fr' ? 'Manuel-Systeme-Unifie.pdf' : 
                     'Connect-Nation-System-Manual.pdf';
    pdf.save(fileName);
  };

  return (
    <Button onClick={generatePDF} className="w-full flex items-center gap-2 text-xs px-3 py-2 h-auto min-h-8">
      <FileText className="h-3 w-3 shrink-0" />
      <Download className="h-3 w-3 shrink-0" />
      <span className="text-wrap break-words">{t('admin:downloadSystemManual')}</span>
    </Button>
  );
};