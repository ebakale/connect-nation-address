import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';

export const SystemManualPDF: React.FC = () => {
  const { t } = useTranslation(['common', 'admin']);
  
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
    pdf.text('National Digital Addressing System', pageWidth / 2, 40, { align: 'center' });
    
    pdf.setFontSize(18);
    pdf.text('Comprehensive User Manual', pageWidth / 2, 55, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Version 2.0', pageWidth / 2, 70, { align: 'center' });
    pdf.text(new Date().toLocaleDateString(), pageWidth / 2, 80, { align: 'center' });

    // Add a new page for content
    pdf.addPage();
    currentY = margin;

    // Table of Contents
    addHeading('Table of Contents');
    addText('1. Introduction..................................................3');
    addText('2. System Overview...............................................4');
    addText('3. User Roles and Permissions...................................5');
    addText('4. Address Registry Module......................................8');
    addText('5. Police Operations Module....................................15');
    addText('6. Integration and Workflow....................................22');
    addText('7. Technical Guidelines........................................25');
    addText('8. Troubleshooting.............................................28');
    addText('9. Security and Best Practices................................30');
    addText('10. Appendices.................................................32');

    // Start content
    pdf.addPage();
    currentY = margin;

    // 1. Introduction
    addHeading('1. Introduction');
    addText('The National Digital Addressing System is a comprehensive platform designed to modernize address management and emergency response services in Equatorial Guinea. This system integrates traditional addressing capabilities with advanced police operations management, creating a unified platform for government services.');
    
    addText('This manual provides complete guidance for all system users, from citizens submitting address requests to administrators managing system-wide operations. The platform serves multiple user roles and facilitates complex workflows while maintaining high security standards.');

    // 2. System Overview
    addHeading('2. System Overview');
    addText('The platform consists of two primary modules:');
    addText('• Address Registry Module: Manages the complete lifecycle of address creation, verification, and publication');
    addText('• Police Operations Module: Handles emergency incident management, unit coordination, and communication systems');
    
    addText('These modules work together to provide integrated services, enabling emergency responders to access verified address information during incidents and allowing address data to be used across government services.');

    // 3. User Roles and Permissions
    addHeading('3. User Roles and Permissions');
    
    addHeading('3.1 Address Registry Roles', 2);
    
    addText('Citizen:', 12, true);
    addText('• Submit new address requests with location details and documentation');
    addText('• Track submission status and receive notifications');
    addText('• Access their own address records and verification status');
    addText('• Resubmit requests after addressing rejection feedback');
    
    addText('Field Agent:', 12, true);
    addText('• Visit requested locations to capture GPS coordinates');
    addText('• Take verification photos and document site conditions');
    addText('• Create detailed address drafts with technical specifications');
    addText('• Work offline in areas with limited connectivity');
    
    addText('Verifier:', 12, true);
    addText('• Review address drafts for accuracy and completeness');
    addText('• Check for duplicate addresses in the system');
    addText('• Resolve conflicts between multiple submissions');
    addText('• Flag problematic requests for additional review');
    addText('• Provide recommendations for address improvements');
    
    addText('Registrar:', 12, true);
    addText('• Perform final reviews of verified address drafts');
    addText('• Publish approved addresses to the official registry');
    addText('• Generate Unique Address Codes (UACs) for verified locations');
    addText('• Manage address publication status and visibility');
    addText('• Handle administrative appeals and complex cases');

    addHeading('3.2 Police Operations Roles', 2);
    
    addText('Police Operator:', 12, true);
    addText('• Respond to emergency incidents and update status in real-time');
    addText('• Request backup support when situations require additional resources');
    addText('• Communicate with dispatchers and other units through secure channels');
    addText('• Document incident details and evidence during field operations');
    
    addText('Police Dispatcher:', 12, true);
    addText('• Receive emergency calls and create incident records');
    addText('• Assign appropriate units based on location and incident type');
    addText('• Coordinate multi-unit responses and resource allocation');
    addText('• Monitor active incidents and maintain communication links');
    addText('• Process backup requests and coordinate additional resources');
    
    addText('Police Supervisor:', 12, true);
    addText('• Monitor unit performance and incident response times');
    addText('• Approve backup requests and resource allocation decisions');
    addText('• Oversee operations within assigned geographic areas');
    addText('• Manage escalations and complex incident situations');
    addText('• Conduct performance reviews and process improvements');
    
    addText('Police Administrator:', 12, true);
    addText('• Configure system settings and user permissions');
    addText('• Manage unit assignments and organizational structure');
    addText('• Analyze performance metrics across the entire force');
    addText('• Oversee system security and access controls');
    addText('• Generate reports for command staff and government officials');

    // 4. Address Registry Module
    addHeading('4. Address Registry Module');
    
    addHeading('4.1 Address Request Process', 2);
    addText('The address registration process follows a structured workflow designed to ensure accuracy and prevent duplicates:');
    
    addText('Step 1: Citizen Submission', 12, true);
    addText('Citizens submit requests through the web portal, providing basic location information, justification for the address, and any supporting documentation. The system validates the submission and assigns it a unique tracking number.');
    
    addText('Step 2: Field Verification', 12, true);
    addText('Field agents visit the location to capture precise GPS coordinates, take verification photos, and document the physical characteristics of the site. This creates a comprehensive address draft with technical specifications.');
    
    addText('Step 3: Technical Review', 12, true);
    addText('Verifiers examine the draft for accuracy, check for potential duplicates, and ensure compliance with addressing standards. They may request additional information or flag the request for manual review.');
    
    addText('Step 4: Final Publication', 12, true);
    addText('Registrars perform final quality checks and publish approved addresses to the official registry. This generates a Unique Address Code (UAC) and makes the address available for government services.');

    addHeading('4.2 Address Search and Discovery', 2);
    addText('The system provides multiple ways to search for addresses:');
    addText('• UAC Search: Direct lookup using the unique address code returns exact coordinates and full details');
    addText('• Public Address Search: Browse public addresses by street name, city, or region');
    addText('• Emergency Services Search: Special access for verified emergency responders');
    addText('• Administrative Search: Full access for government staff with appropriate permissions');

    addHeading('4.3 Quality Assurance Features', 2);
    addText('Multiple safeguards ensure address accuracy:');
    addText('• Automated duplicate detection using coordinate proximity analysis');
    addText('• Manual review workflow for flagged or complex submissions');
    addText('• Photo verification requirements for field verification');
    addText('• Multi-stage approval process with role separation');
    addText('• Audit trails tracking all changes and approvals');

    // 5. Police Operations Module
    addHeading('5. Police Operations Module');
    
    addHeading('5.1 Incident Management Workflow', 2);
    addText('Emergency incident management follows a structured response protocol:');
    
    addText('Incident Reporting:', 12, true);
    addText('Incidents are reported through emergency calls, online submissions, or direct officer observations. The system creates a unique incident record with location verification and priority classification.');
    
    addText('Dispatch Coordination:', 12, true);
    addText('Dispatchers review incident details, verify location information using the address registry, and assign appropriate units based on proximity, availability, and incident type.');
    
    addText('Field Response:', 12, true);
    addText('Responding officers update incident status in real-time, document evidence, and communicate with command through secure channels. GPS tracking ensures accurate location monitoring.');
    
    addText('Supervision and Analysis:', 12, true);
    addText('Supervisors monitor active incidents, analyze response times, and coordinate additional resources when needed. Performance data supports continuous improvement efforts.');

    addHeading('5.2 Unit Management and Coordination', 2);
    addText('The system manages police units and personnel:');
    addText('• Real-time unit status tracking and availability monitoring');
    addText('• Geographic assignment management with boundary enforcement');
    addText('• Communication systems for secure inter-unit messaging');
    addText('• Backup request and approval workflow for resource coordination');
    addText('• Performance analytics and response time measurement');

    addHeading('5.3 Communication Systems', 2);
    addText('Secure communication features include:');
    addText('• Radio code integration for standardized emergency communications');
    addText('• Unit-to-unit messaging with priority levels and acknowledgment tracking');
    addText('• Dispatcher broadcast capabilities for wide-area notifications');
    addText('• Emergency backup communication through SMS fallback systems');

    // 6. Integration and Workflow
    addHeading('6. Integration and Workflow');
    
    addHeading('6.1 Cross-Module Operations', 2);
    addText('The platform enables seamless integration between addressing and police operations:');
    
    addText('Emergency Address Verification:', 12, true);
    addText('During emergency incidents, unverified locations can be fast-tracked through the address verification process, enabling rapid response while maintaining data quality standards.');
    
    addText('Intelligence Sharing:', 12, true);
    addText('Address registry data enhances police operations through accurate location information, while incident data helps identify address verification priorities in high-activity areas.');
    
    addText('Unified Analytics:', 12, true);
    addText('Combined data from both modules provides insights for urban planning, emergency preparedness, and resource allocation decisions.');

    addHeading('6.2 Workflow Automation', 2);
    addText('Automated processes improve efficiency:');
    addText('• Duplicate detection algorithms reduce manual review requirements');
    addText('• Location-based unit assignment optimizes emergency response times');
    addText('• Status update triggers maintain real-time information accuracy');
    addText('• Notification systems keep stakeholders informed of process changes');

    // 7. Technical Guidelines
    addHeading('7. Technical Guidelines');
    
    addHeading('7.1 System Access and Authentication', 2);
    addText('All users must authenticate using secure credentials. The system supports:');
    addText('• Multi-factor authentication for sensitive roles');
    addText('• Role-based access control with geographic and organizational scoping');
    addText('• Session management with automatic timeout for inactive users');
    addText('• Audit logging for all system access and data modifications');

    addHeading('7.2 Data Security and Privacy', 2);
    addText('The platform implements comprehensive security measures:');
    addText('• End-to-end encryption for sensitive data transmission');
    addText('• Geographic access controls limiting data visibility by jurisdiction');
    addText('• Privacy settings allowing address owners to control information sharing');
    addText('• Regular security audits and vulnerability assessments');

    addHeading('7.3 Mobile and Offline Capabilities', 2);
    addText('Field operations are supported through:');
    addText('• Mobile-responsive web application with touch-optimized interfaces');
    addText('• Offline data capture with automatic synchronization when connectivity returns');
    addText('• GPS integration for accurate location capture');
    addText('• Camera integration for verification photo capture');

    // 8. Troubleshooting
    addHeading('8. Troubleshooting');
    
    addHeading('8.1 Common Issues and Solutions', 2);
    addText('Login Problems:', 12, true);
    addText('• Verify username and password accuracy');
    addText('• Clear browser cache and cookies');
    addText('• Contact administrator for account status verification');
    
    addText('Data Synchronization Issues:', 12, true);
    addText('• Check internet connectivity');
    addText('• Verify system status through the status page');
    addText('• Contact technical support for server-side issues');
    
    addText('Permission Errors:', 12, true);
    addText('• Verify role assignments with system administrator');
    addText('• Check geographic scope permissions for location-specific data');
    addText('• Review organization membership for cross-department access');

    addHeading('8.2 Support Resources', 2);
    addText('Technical support is available through:');
    addText('• Online help documentation and FAQ sections');
    addText('• Email support with 24-hour response time commitment');
    addText('• Phone support for emergency situations');
    addText('• Training materials and video tutorials for new users');

    // 9. Security and Best Practices
    addHeading('9. Security and Best Practices');
    
    addHeading('9.1 User Security Guidelines', 2);
    addText('• Use strong passwords with regular updates');
    addText('• Never share login credentials with other users');
    addText('• Log out completely when finished using the system');
    addText('• Report suspected security incidents immediately');
    addText('• Keep personal contact information current for security notifications');

    addHeading('9.2 Data Handling Best Practices', 2);
    addText('• Verify information accuracy before submission');
    addText('• Use appropriate privacy settings for sensitive locations');
    addText('• Follow data retention policies for temporary information');
    addText('• Report data quality issues through proper channels');

    // 10. Appendices
    addHeading('10. Appendices');
    
    addHeading('10.1 Keyboard Shortcuts and Quick Actions', 2);
    addText('Common keyboard shortcuts for power users:');
    addText('• Ctrl+S: Save current form or draft');
    addText('• Ctrl+F: Open search interface');
    addText('• Esc: Close current dialog or cancel operation');
    addText('• Tab: Navigate between form fields');

    addHeading('10.2 System Status Codes', 2);
    addText('Address Request Status:');
    addText('• Pending: Awaiting field verification');
    addText('• Draft: Under technical review');
    addText('• Flagged: Requires manual attention');
    addText('• Approved: Published to registry');
    addText('• Rejected: Not meeting quality standards');

    addText('Incident Status:');
    addText('• Reported: Initial incident record created');
    addText('• Dispatched: Units assigned and en route');
    addText('• Responding: Units on scene');
    addText('• Resolved: Incident concluded');
    addText('• Closed: Final documentation complete');

    addHeading('10.3 Contact Information', 2);
    addText('System Administration:');
    addText('Email: admin@addressing.gov.gq');
    addText('Phone: +240-XXX-XXXX');
    addText('Office Hours: Monday-Friday, 8:00 AM - 6:00 PM');

    addText('Technical Support:');
    addText('Email: support@addressing.gov.gq');
    addText('Emergency: +240-XXX-XXXX (24/7)');

    // Save the PDF
    pdf.save('NDAS-User-Manual.pdf');
  };

  return (
    <Button onClick={generatePDF} className="flex items-center gap-2">
      <Download className="h-4 w-4" />
      {t('admin:downloadSystemManual')}
    </Button>
  );
};