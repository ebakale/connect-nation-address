import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';

export const SystemManualPDF: React.FC = () => {
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
    pdf.text('Connect Nation Unified Platform', pageWidth / 2, 50, { align: 'center' });
    
    pdf.setFontSize(18);
    pdf.text('Comprehensive Manual', pageWidth / 2, 70, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Equatorial Guinea National Digital Address Authority', pageWidth / 2, 90, { align: 'center' });
    pdf.text('Version 1.0 - December 2024', pageWidth / 2, 110, { align: 'center' });

    // Add new page for content
    pdf.addPage();
    currentY = margin;

    // Table of Contents
    addHeading('Table of Contents', 1);
    const tocItems = [
      '1. System Overview',
      '2. Module Overview',
      '3. User Roles and Permissions',
      '4. Core Workflows',
      '5. Feature Descriptions',
      '6. Administrator Guide',
      '7. User Guides by Role',
      '8. Technical Documentation',
      '9. Troubleshooting'
    ];
    
    tocItems.forEach(item => {
      addText(item);
    });

    pdf.addPage();
    currentY = margin;

    // Content
    addHeading('1. System Overview', 1);
    addText('The Connect Nation Unified Platform is a comprehensive digital ecosystem for managing both address registration and police operations in Equatorial Guinea. The platform consists of two integrated modules that work together to provide enhanced public services, emergency response, and urban planning capabilities.');

    addHeading('2. Module Overview', 1);
    
    addHeading('Address Registry Module', 2);
    addText('The address registry system manages the complete lifecycle of address registration, verification, and distribution. Key features include:');
    addText('• Address registration and verification workflow');
    addText('• Geographic information system (GIS) integration');
    addText('• Unified Address Code (UAC) generation');
    addText('• Evidence management and photo capture');
    addText('• Multi-role approval process');

    addHeading('Police Operations Module', 2);
    addText('The police operations system provides comprehensive incident management, emergency response coordination, and law enforcement support capabilities. Key features include:');
    addText('• Real-time incident reporting and tracking');
    addText('• Emergency dispatch and unit coordination');
    addText('• Officer dashboard and performance monitoring');
    addText('• Communication systems for field operations');
    addText('• Analytics and reporting tools');

    addHeading('Platform Benefits', 2);
    addText('• Enhanced Service Delivery: Improve emergency response, postal delivery, and public services through accurate addressing');
    addText('• Economic Acceleration: Enable e-commerce, delivery services, and location-based business growth');
    addText('• Smart Urban Planning: Support infrastructure development and city planning with precise location data');
    addText('• Digital Infrastructure: Create a foundation for IoT, smart city initiatives, and digital governance');
    addText('• Integrated Emergency Response: Seamless coordination between address verification and police operations');
    addText('• Data-Driven Policing: Evidence-based decision making through comprehensive analytics');

    addHeading('System Architecture', 2);
    addText('• Frontend: React-based web application with responsive design');
    addText('• Backend: Supabase with PostgreSQL database');
    addText('• Authentication: Secure role-based access control with module-specific permissions');
    addText('• Storage: Cloud-based file storage for evidence and documentation');
    addText('• Real-time Communication: WebSocket support for live updates and dispatch');
    addText('• APIs: RESTful APIs for integration with external systems');
    addText('• Security: End-to-end encryption for sensitive police data');

    pdf.addPage();
    currentY = margin;

    addHeading('3. User Roles and Permissions', 1);
    addText('The unified platform supports two distinct role hierarchies - one for the Address Registry Module and one for the Police Operations Module. Users can have roles in one or both modules based on their responsibilities.');

    addHeading('Address Registry Module Roles', 2);

    addHeading('1. Citizen (Default Role)', 3);
    addText('Purpose: General public users who can search for verified addresses');
    addText('Permissions:');
    addText('✓ Search verified addresses');
    addText('✓ View redacted evidence/documents');
    addText('✓ Access status information for their own submissions');
    addText('✗ Cannot create draft addresses');
    addText('✗ Cannot upload evidence');
    addText('✗ Cannot verify or publish addresses');
    addText('Workflow Stage: Submit Request');

    addHeading('2. Property Claimant', 3);
    addText('Purpose: Property owners who can submit proof of ownership for address registration');
    addText('Permissions:');
    addText('✓ Search verified addresses');
    addText('✓ Upload evidence (own submissions only)');
    addText('✓ View own evidence and submissions');
    addText('✓ Access audit logs for own records');
    addText('✗ Cannot create draft addresses');
    addText('✗ Cannot verify addresses');
    addText('Workflow Stage: Submit Request with Evidence');

    addHeading('3. Field Agent', 3);
    addText('Purpose: Data collection specialists who capture address information in the field');
    addText('Permissions:');
    addText('✓ Create draft addresses');
    addText('✓ Upload evidence and photos');
    addText('✓ View own submissions and evidence');
    addText('✓ Access audit logs for own work');
    addText('✓ Geographic scope restrictions apply');
    addText('✗ Cannot verify or publish addresses');
    addText('Workflow Stage: Capture Draft');
    addText('Geographic Scope: Limited to assigned districts/areas');

    pdf.addPage();
    currentY = margin;

    addHeading('4. Verifier', 3);
    addText('Purpose: Quality assurance specialists who verify address accuracy and resolve duplicates');
    addText('Permissions:');
    addText('✓ Verify addresses');
    addText('✓ Create corrective draft addresses');
    addText('✓ Merge and split records');
    addText('✓ Access full evidence');
    addText('✓ Flag addresses for review');
    addText('✓ Edit district-level metadata');
    addText('✓ Access district-level audit logs');
    addText('✗ Cannot publish to public registry');
    addText('Workflow Stage: Verify');
    addText('Geographic Scope: District-level access');

    addHeading('5. Registrar', 3);
    addText('Purpose: Provincial administrators who publish verified addresses to the official registry');
    addText('Permissions:');
    addText('✓ Publish addresses to public registry');
    addText('✓ Retire/unpublish addresses');
    addText('✓ All Verifier permissions');
    addText('✓ Merge and split records');
    addText('✓ Edit province-level metadata');
    addText('✓ Access province-level audit logs');
    addText('✗ Cannot override system decisions');
    addText('Workflow Stage: Publish');
    addText('Geographic Scope: Province-level access');

    addHeading('6. NDAA Admin (National Digital Address Authority)', 3);
    addText('Purpose: National-level administrators with full system oversight');
    addText('Permissions:');
    addText('✓ Override system decisions');
    addText('✓ Manage API keys and webhooks');
    addText('✓ Edit national-level hierarchy');
    addText('✓ Access all audit logs');
    addText('✓ All lower-level permissions');
    addText('✓ System configuration management');
    addText('Workflow Stage: Override/Supervise');
    addText('Geographic Scope: National access');

    pdf.addPage();
    currentY = margin;

    addHeading('Police Operations Module Roles', 2);

    addHeading('1. Police Admin', 3);
    addText('Purpose: System administrators for police operations with full oversight');
    addText('Permissions: Manage all police system users and roles, configure system settings, access all incident data and analytics, manage unit structures, override operational decisions, full audit trail access');
    addText('Scope: System-wide police operations');

    addHeading('2. Police Supervisor', 3);
    addText('Purpose: Senior officers responsible for operational oversight and unit management');
    addText('Permissions: Monitor all incidents within jurisdiction, assign units to incidents, access real-time unit status, review officer performance metrics, approve backup requests, generate operational reports');
    addText('Scope: Regional or departmental oversight');

    addHeading('3. Police Dispatcher', 3);
    addText('Purpose: Emergency response coordinators managing incident dispatch');
    addText('Permissions: Receive and process emergency calls, create and update incident records, dispatch units to incidents, monitor unit status, coordinate emergency response, communicate with field units');
    addText('Scope: Dispatch center operations');

    addHeading('4. Police Operator', 3);
    addText('Purpose: Field officers and operational personnel');
    addText('Permissions: View assigned incidents, update incident status, request backup and resources, submit field reports and evidence, access incident history, communicate with dispatch and units');
    addText('Scope: Field operations and assigned incidents');

    pdf.addPage();
    currentY = margin;

    addHeading('4. Core Workflows', 1);

    addHeading('Address Registry Module Workflows', 2);

    addHeading('1. Standard Address Creation Workflow', 2);
    addText('Participants: Citizen → Field Agent → Verifier → Registrar');
    addText('');
    addText('1. Submit Request (Citizen)');
    addText('   • Submit new address request through web interface');
    addText('   • Provide basic location and justification information');
    addText('   • Upload optional supporting documentation');
    addText('');
    addText('2. Capture Draft (Field Agent)');
    addText('   • Visit location and capture precise coordinates');
    addText('   • Take photographs of the location');
    addText('   • Create detailed address draft with evidence');
    addText('   • Verify physical existence and accessibility');
    addText('');
    addText('3. Verify (Verifier)');
    addText('   • Review draft for accuracy and completeness');
    addText('   • Check for duplicates and conflicts');
    addText('   • Resolve data quality issues');
    addText('   • Approve or request corrections');
    addText('');
    addText('4. Publish (Registrar)');
    addText('   • Final review of verified addresses');
    addText('   • Publish to provincial registry');
    addText('   • Generate Unified Address Code (UAC)');
    addText('   • Make address publicly searchable');

    addHeading('2. Partner Bulk Update Workflow', 2);
    addText('Participants: Partner → Data Steward → Verifier → Registrar');
    addText('');
    addText('1. Bulk Upload (Partner/Utility)');
    addText('   • Upload customer references with coordinates');
    addText('   • Provide hashed personal data for privacy');
    addText('   • Submit batch requests via API');
    addText('');
    addText('2. QA Review (Data Steward)');
    addText('   • Run automated quality assurance checks');
    addText('   • Validate data format and completeness');
    addText('   • Flag suspicious or duplicate entries');
    addText('');
    addText('3. Batch Verify (Verifier)');
    addText('   • Review QA results');
    addText('   • Approve subset of clean data');
    addText('   • Flag problematic entries for manual review');
    addText('');
    addText('4. Bulk Publish (Registrar)');
    addText('   • Publish approved address batches');
    addText('   • Generate UACs for all new addresses');
    addText('   • Send confirmation webhooks to partners');

    addHeading('Police Operations Module Workflows', 2);

    addHeading('1. Emergency Incident Response Workflow', 3);
    addText('Participants: Citizen → Police Dispatcher → Police Operator → Police Supervisor');
    addText('1. Incident Report: Emergency call received, details captured, location verified, priority assigned');
    addText('2. Dispatch Coordination: Units identified, optimal unit selected, incident assigned, communication established');
    addText('3. Field Response: Unit dispatched, status updates provided, on-scene assessment, evidence collected');
    addText('4. Supervision: Monitor progress, coordinate resources, review resolution, performance evaluation');

    addHeading('2. Backup Request Workflow', 3);
    addText('Participants: Police Operator → Police Dispatcher → Police Supervisor');
    addText('1. Backup Request: Assess situation, submit request with justification, provide details');
    addText('2. Resource Coordination: Evaluate request, identify available units, coordinate deployment');
    addText('3. Approval and Deployment: Review and approve allocation, monitor coordination, ensure utilization');

    pdf.addPage();
    currentY = margin;

    addHeading('5. Feature Descriptions', 1);

    addHeading('Address Registry Module Features', 2);

    addHeading('Address Search', 2);
    addText('• Smart Search: Natural language and coordinate-based search');
    addText('• Filter Options: By verification status, date, location type');
    addText('• Map Integration: Visual search with interactive maps');
    addText('• Export Functions: Data export in multiple formats');

    addHeading('Address Registration', 2);
    addText('• Multi-Step Form: Guided registration process');
    addText('• Photo Upload: Evidence capture with automatic compression');
    addText('• GPS Integration: Automatic coordinate capture');
    addText('• Duplicate Detection: Real-time duplicate checking');

    addHeading('Verification Tools', 2);
    addText('• Bulk Verification: Process multiple addresses simultaneously');
    addText('• Quality Scoring: Automated quality assessment');
    addText('• Conflict Resolution: Tools for resolving address conflicts');
    addText('• Evidence Review: Secure evidence viewing and annotation');

    addHeading('Administrative Tools', 2);
    addText('• Role Management: Assign and modify user roles');
    addText('• Permission Matrix: Visual permission management');
    addText('• Workflow Monitoring: Track progress through stages');
    addText('• Analytics Dashboard: System usage and performance metrics');

    addHeading('UAC Generation', 2);
    addText('• Unified Address Codes: Standardized address identifiers');
    addText('• Hierarchical Structure: Country-Region-City-Unique format');
    addText('• Check Digits: Built-in validation for accuracy');
    addText('• Batch Generation: Efficient bulk UAC creation');

    addHeading('Police Operations Module Features', 2);

    addHeading('Incident Management', 3);
    addText('• Real-time incident tracking with live status updates');
    addText('• Priority classification based on severity and type');
    addText('• Location integration with address registry');
    addText('• Evidence management and secure storage');

    addHeading('Dispatch Operations', 3);
    addText('• Unit tracking with real-time location monitoring');
    addText('• Optimal assignment based on proximity and availability');
    addText('• Communication hub for dispatch and field units');
    addText('• Emergency protocols for high-priority incidents');

    addHeading('Performance Analytics', 3);
    addText('• Response time tracking and efficiency metrics');
    addText('• Officer and unit performance monitoring');
    addText('• Crime pattern analysis and trend identification');
    addText('• Resource utilization analysis');

    addHeading('Unit Management', 3);
    addText('• Team organization and hierarchical structure');
    addText('• Shift scheduling and duty assignment');
    addText('• Backup coordination and deployment');
    addText('• Status monitoring and availability tracking');

    pdf.addPage();
    currentY = margin;

    addHeading('6. Technical Support', 1);
    addText('For technical assistance:');
    addText('• Email: tech-support@address-system.gq');
    addText('• Phone: +240-XXX-XXXX');
    addText('• Hours: Monday-Friday, 8:00-17:00');
    addText('');
    addText('Emergency Support:');
    addText('• 24/7 Hotline: +240-XXX-XXXX');
    addText('• Emergency Email: emergency@address-system.gq');
    addText('• Response Time: Within 2 hours');

    // Footer
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    const totalPages = pdf.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
      pdf.text('Connect Nation Unified Platform - User Manual', margin, pageHeight - 10);
    }

    // Save the PDF
    pdf.save('Connect-Nation-Unified-Platform-Manual.pdf');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          System Manual PDF
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Download the complete system manual as a PDF document. This comprehensive guide covers both 
            the Address Registry and Police Operations modules, including all user roles, workflows, 
            features, and administrative guidelines.
          </p>
          <Button onClick={generatePDF} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download PDF Manual
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};