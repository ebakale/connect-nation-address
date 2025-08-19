import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import jsPDF from 'jspdf';

export const RolesDocumentGenerator = () => {
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
    addText('National Digital Addressing Authority', 18, true);
    addText('User Roles & Permissions Guide', 16, true);
    addText('Comprehensive Documentation', 12);
    yPos += 10;

    // Table of Contents
    addText('Table of Contents', 14, true);
    addText('1. Administrative Roles');
    addText('   • NDAA Admin');
    addText('   • Admin');
    addText('   • Moderator');
    addText('2. Operational Roles');
    addText('   • Registrar');
    addText('   • Verifier');
    addText('   • Field Agent');
    addText('3. User Roles');
    addText('   • Property Claimant');
    addText('   • Citizen');
    addText('4. System Roles');
    addText('   • Partner');
    addText('   • Auditor');
    addText('   • Data Steward');
    addText('   • Support');
    yPos += 15;

    // 1. ADMINISTRATIVE ROLES
    addText('1. ADMINISTRATIVE ROLES', 16, true);

    // NDAA Admin
    addText('NDAA ADMIN', 14, true);
    addText('The highest authority role in the National Digital Addressing Authority system.');
    addText('GEOGRAPHIC SCOPE:');
    addText('• National-level access across all provinces and districts');
    addText('WORKFLOW STAGE:');
    addText('• View-only access to all workflow stages');
    addText('KEY RESPONSIBILITIES:');
    addText('• Override any decision made by lower-level roles');
    addText('• Manage API keys and system integrations');
    addText('• Edit national-level geographic hierarchy and boundaries');
    addText('• Full audit log access across the entire nation');
    addText('• Publish and retire addresses at national level');
    addText('PERMISSIONS:');
    addText('• Full evidence access (unredacted)');
    addText('• Can merge and split address records');
    addText('• Can verify and publish addresses');
    addText('• Can create draft addresses');
    addText('• Can upload evidence');
    yPos += 10;

    // Admin
    addText('ADMIN', 14, true);
    addText('High-level administrative role with broad system access.');
    addText('GEOGRAPHIC SCOPE:');
    addText('• Configurable based on assignment (province or national)');
    addText('WORKFLOW STAGE:');
    addText('• View-only access to monitor system operations');
    addText('KEY RESPONSIBILITIES:');
    addText('• User management and role assignments');
    addText('• System configuration and maintenance');
    addText('• Address publication and retirement authority');
    addText('• Province-level audit log access');
    addText('PERMISSIONS:');
    addText('• Full evidence access (unredacted)');
    addText('• Can verify and publish addresses');
    addText('• Can merge and split records');
    addText('• Can create draft addresses for corrections');
    yPos += 10;

    // Moderator
    addText('MODERATOR', 14, true);
    addText('Content moderation and quality control role.');
    addText('GEOGRAPHIC SCOPE:');
    addText('• Varies based on assignment');
    addText('WORKFLOW STAGE:');
    addText('• View-only monitoring');
    addText('KEY RESPONSIBILITIES:');
    addText('• Content quality assurance');
    addText('• User behavior monitoring');
    addText('• Report generation and analysis');
    addText('PERMISSIONS:');
    addText('• Redacted evidence viewing');
    addText('• Read-only access to most system functions');
    yPos += 10;

    // 2. OPERATIONAL ROLES
    addText('2. OPERATIONAL ROLES', 16, true);

    // Registrar
    addText('REGISTRAR', 14, true);
    addText('Provincial-level authority responsible for final address publication.');
    addText('GEOGRAPHIC SCOPE:');
    addText('• Province-level access and authority');
    addText('• Can access all districts within assigned province');
    addText('WORKFLOW STAGE:');
    addText('• "Publish" - Final stage in address approval workflow');
    addText('KEY RESPONSIBILITIES:');
    addText('• EXCLUSIVE: Publish verified addresses to make them public');
    addText('• EXCLUSIVE: Retire outdated or incorrect addresses');
    addText('• Review and approve verifier decisions');
    addText('• Manage province-level geographic boundaries');
    addText('• Override verifier decisions when necessary');
    addText('PERMISSIONS:');
    addText('• Full evidence access (unredacted)');
    addText('• Can verify addresses (inherited from verifier)');
    addText('• Can merge and split address records');
    addText('• Province-wide audit log visibility');
    addText('• Can create draft addresses for corrections');
    yPos += 10;

    // Verifier
    addText('VERIFIER', 14, true);
    addText('District-level role focused on address accuracy validation.');
    addText('GEOGRAPHIC SCOPE:');
    addText('• District-level access within assigned districts');
    addText('• Cannot access other districts without explicit permission');
    addText('WORKFLOW STAGE:');
    addText('• "Verify" - Reviews and validates address accuracy');
    addText('KEY RESPONSIBILITIES:');
    addText('• Verify address accuracy and completeness');
    addText('• Review evidence submitted with addresses');
    addText('• Validate GPS coordinates and physical location');
    addText('• Approve or reject address submissions from field agents');
    addText('• Manage district-level geographic boundaries');
    addText('PERMISSIONS:');
    addText('• Full evidence access (unredacted)');
    addText('• Can verify addresses (but NOT publish them)');
    addText('• Can merge and split address records');
    addText('• District-level audit log access');
    addText('• Can create draft addresses for corrections');
    addText('LIMITATIONS:');
    addText('• Cannot publish addresses (requires Registrar approval)');
    addText('• Cannot retire addresses');
    yPos += 10;

    // Field Agent
    addText('FIELD AGENT', 14, true);
    addText('Ground-level data collection role with address capture authority.');
    addText('GEOGRAPHIC SCOPE:');
    addText('• Assigned to specific districts or regions');
    addText('WORKFLOW STAGE:');
    addText('• "Capture Draft" - Creates initial address records');
    addText('KEY RESPONSIBILITIES:');
    addText('• Capture new addresses in the field using GPS');
    addText('• Take photographs of address locations');
    addText('• Create draft addresses that require verification');
    addText('• Upload supporting evidence and documentation');
    addText('PERMISSIONS:');
    addText('• Can create draft addresses directly');
    addText('• Can upload evidence and photos');
    addText('• View own submissions only in evidence');
    addText('• Search verified addresses for reference');
    addText('LIMITATIONS:');
    addText('• Cannot verify or publish addresses');
    addText('• Can only view their own evidence uploads');
    addText('• Cannot access audit logs');
    yPos += 10;

    // 3. USER ROLES
    addText('3. USER ROLES', 16, true);

    // Property Claimant
    addText('PROPERTY CLAIMANT', 14, true);
    addText('Property owners seeking to register or claim addresses.');
    addText('GEOGRAPHIC SCOPE:');
    addText('• Limited to properties they own or claim');
    addText('WORKFLOW STAGE:');
    addText('• Can submit requests and provide evidence');
    addText('KEY RESPONSIBILITIES:');
    addText('• Provide evidence of property ownership');
    addText('• Submit address registration requests');
    addText('• Upload supporting documentation');
    addText('• Respond to verification requests');
    addText('PERMISSIONS:');
    addText('• Can upload evidence for their claims');
    addText('• View own evidence and submissions');
    addText('• Full access to their own audit logs');
    addText('• Search verified public addresses');
    addText('LIMITATIONS:');
    addText('• Cannot create draft addresses');
    addText('• Cannot verify or approve addresses');
    addText('• Limited to properties they have legitimate claims on');
    yPos += 10;

    // Citizen
    addText('CITIZEN', 14, true);
    addText('General public users who can search addresses and submit requests.');
    addText('GEOGRAPHIC SCOPE:');
    addText('• National access for searching public addresses');
    addText('WORKFLOW STAGE:');
    addText('• "Submit Request" - Can request new addresses');
    addText('KEY RESPONSIBILITIES:');
    addText('• Submit address registration requests');
    addText('• Search for verified public addresses');
    addText('• Track status of their requests');
    addText('• Report issues with existing addresses');
    addText('PERMISSIONS:');
    addText('• Search verified addresses (with privacy protections)');
    addText('• Submit address requests with justification');
    addText('• View redacted evidence only');
    addText('• Status-only access to audit logs');
    addText('LIMITATIONS:');
    addText('• Cannot create draft addresses');
    addText('• Cannot verify or approve addresses');
    addText('• Cannot upload evidence');
    addText('• Limited geographic coordinate access (rounded for privacy)');
    yPos += 10;

    // 4. SYSTEM ROLES
    addText('4. SYSTEM ROLES', 16, true);

    // Partner
    addText('PARTNER', 14, true);
    addText('External organizations integrated with the addressing system.');
    addText('GEOGRAPHIC SCOPE:');
    addText('• Based on partnership agreement and scope');
    addText('WORKFLOW STAGE:');
    addText('• View-only monitoring of delivery logs');
    addText('KEY RESPONSIBILITIES:');
    addText('• Integration with external delivery systems');
    addText('• API access for address lookups');
    addText('• Provide delivery confirmation data');
    addText('PERMISSIONS:');
    addText('• Request API access for integrations');
    addText('• Access delivery logs and statistics');
    addText('• Search verified addresses via API');
    addText('LIMITATIONS:');
    addText('• No evidence access');
    addText('• Cannot modify address data');
    addText('• API-only access (no web interface for most functions)');
    yPos += 10;

    // Auditor
    addText('AUDITOR', 14, true);
    addText('Independent oversight role for system accountability.');
    addText('GEOGRAPHIC SCOPE:');
    addText('• District-level access for auditing purposes');
    addText('WORKFLOW STAGE:');
    addText('• Read-only monitoring across all stages');
    addText('KEY RESPONSIBILITIES:');
    addText('• System audit and compliance monitoring');
    addText('• Report generation and analysis');
    addText('• Quality assurance reviews');
    addText('• Performance monitoring');
    addText('PERMISSIONS:');
    addText('• Redacted evidence viewing for oversight');
    addText('• District-level audit log access');
    addText('• Read-only access to all address data');
    addText('LIMITATIONS:');
    addText('• Cannot modify any system data');
    addText('• Cannot create, verify, or publish addresses');
    addText('• No full evidence access (privacy protection)');
    yPos += 10;

    // Data Steward
    addText('DATA STEWARD', 14, true);
    addText('Quality assurance role focused on data integrity.');
    addText('GEOGRAPHIC SCOPE:');
    addText('• QA-focused access across assigned regions');
    addText('WORKFLOW STAGE:');
    addText('• QA-only stage for testing and validation');
    addText('KEY RESPONSIBILITIES:');
    addText('• Data quality assurance and testing');
    addText('• Create test sandboxes for quality control');
    addText('• Suggest hierarchy and boundary changes');
    addText('• Monitor data integrity across the system');
    addText('PERMISSIONS:');
    addText('• Can create draft addresses for testing purposes');
    addText('• Redacted evidence viewing for QA');
    addText('• Can suggest (but not implement) hierarchy changes');
    addText('LIMITATIONS:');
    addText('• Cannot verify or publish addresses');
    addText('• Cannot implement boundary changes directly');
    addText('• Limited to QA and testing functions');
    yPos += 10;

    // Support
    addText('SUPPORT', 14, true);
    addText('Technical support role for user assistance.');
    addText('GEOGRAPHIC SCOPE:');
    addText('• User-focused access for support purposes');
    addText('WORKFLOW STAGE:');
    addText('• Cross-stage access for troubleshooting');
    addText('KEY RESPONSIBILITIES:');
    addText('• User technical support and assistance');
    addText('• System troubleshooting and issue resolution');
    addText('• User training and onboarding');
    addText('• Documentation maintenance');
    addText('PERMISSIONS:');
    addText('• Limited system access for support purposes');
    addText('• Can view user issues and provide assistance');
    addText('LIMITATIONS:');
    addText('• Cannot modify address data');
    addText('• No evidence access');
    addText('• Cannot perform administrative functions');
    yPos += 10;

    // Summary section
    addText('ROLE HIERARCHY SUMMARY', 16, true);
    addText('The system follows a clear hierarchy for address management:');
    addText('');
    addText('1. CREATION: Field Agents → Create draft addresses');
    addText('2. VERIFICATION: Verifiers → Validate accuracy and completeness');
    addText('3. PUBLICATION: Registrars → Make addresses publicly available');
    addText('4. OVERSIGHT: Auditors & NDAA Admin → Monitor and audit');
    addText('');
    addText('Geographic Scopes:');
    addText('• National: NDAA Admin');
    addText('• Provincial: Registrar, Admin');
    addText('• District: Verifier, Auditor');
    addText('• Localized: Field Agent, Property Claimant');
    addText('• Public: Citizen, Partner');
    yPos += 10;

    addText('ACCESS CONTROL MATRIX', 16, true);
    addText('Evidence Access Levels:');
    addText('• Full (Unredacted): NDAA Admin, Admin, Registrar, Verifier');
    addText('• Own Submissions: Field Agent, Property Claimant');
    addText('• Redacted: Citizen, Auditor, Data Steward');
    addText('• None: Partner, Support');
    addText('');
    addText('Address Management:');
    addText('• Create Drafts: Field Agent, Verifier, Registrar, Admin, NDAA Admin, Data Steward');
    addText('• Verify: Verifier, Registrar, Admin, NDAA Admin');
    addText('• Publish: Registrar, Admin, NDAA Admin');
    addText('• Retire: Registrar, Admin, NDAA Admin');

    // Footer
    doc.setFontSize(8);
    doc.text('Generated by National Digital Addressing Authority System', margin, pageHeight - 10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, pageHeight - 5);

    // Save the PDF
    doc.save('NDAA_User_Roles_Guide.pdf');
  };

  return (
    <Button onClick={generateRolesPDF} className="flex items-center gap-2">
      <FileText className="h-4 w-4" />
      <Download className="h-4 w-4" />
      Generate Roles PDF Guide
    </Button>
  );
};