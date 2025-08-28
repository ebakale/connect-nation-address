import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

const GovernmentPresentationPDF: React.FC = () => {
  const generatePresentationPDF = () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (2 * margin);
      let yPosition = margin;

      // Helper function to add text with word wrapping and page breaks
      const addText = (text: string, fontSize: number = 12, isBold: boolean = false, isTitle: boolean = false) => {
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
        
        if (isTitle) {
          const textWidth = pdf.getTextWidth(text);
          const xPosition = (pageWidth - textWidth) / 2;
          pdf.text(text, xPosition, yPosition);
          yPosition += fontSize * 0.6;
          return;
        }

        const splitText = pdf.splitTextToSize(text, contentWidth);
        
        // Check if we need a new page
        if (yPosition + (splitText.length * fontSize * 0.6) > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        
        pdf.text(splitText, margin, yPosition);
        yPosition += splitText.length * fontSize * 0.6 + 5;
      };

      const addHeading = (text: string, level: number = 1) => {
        const fontSize = level === 1 ? 18 : level === 2 ? 14 : 12;
        addText(text, fontSize, true);
        yPosition += 5;
      };

      const addBulletPoint = (text: string) => {
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        const bulletText = `• ${text}`;
        const splitText = pdf.splitTextToSize(bulletText, contentWidth - 10);
        
        if (yPosition + (splitText.length * 11 * 0.6) > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        
        pdf.text(splitText, margin + 5, yPosition);
        yPosition += splitText.length * 11 * 0.6 + 3;
      };

      // Cover Page
      yPosition = pageHeight / 3;
      addText('NATIONAL DIGITAL ADDRESSING AUTHORITY', 24, true, true);
      yPosition += 20;
      addText('Connect Nation Unified Platform', 20, true, true);
      yPosition += 15;
      addText('Government Presentation', 16, false, true);
      yPosition += 40;
      addText('Transforming Equatorial Guinea Through Digital Innovation', 14, false, true);
      yPosition += 30;
      addText(`Prepared for: High Government Official\nDate: ${new Date().toLocaleDateString()}`, 12, false, true);

      // Page 2 - Executive Summary
      pdf.addPage();
      yPosition = margin;
      addHeading('EXECUTIVE SUMMARY');
      
      addText('The Connect Nation Unified Platform represents a revolutionary digital infrastructure initiative that will position Equatorial Guinea as a leader in digital governance and smart city development across Central Africa.');
      
      addText('This comprehensive platform combines two critical systems:');
      addBulletPoint('National Digital Address Registry - Creating a unified addressing system for the entire country');
      addBulletPoint('Integrated Police Operations System - Modernizing emergency response and law enforcement');
      
      addText('Key Impact Areas:');
      addBulletPoint('Economic Growth: Enable e-commerce, delivery services, and location-based businesses');
      addBulletPoint('Public Safety: Enhance emergency response times and police operational efficiency');
      addBulletPoint('Government Services: Improve service delivery through accurate citizen location data');
      addBulletPoint('Urban Planning: Support smart city initiatives and infrastructure development');

      // Page 3 - National Benefits
      pdf.addPage();
      yPosition = margin;
      addHeading('BENEFITS TO THE NATION');
      
      addHeading('Economic Transformation', 2);
      addBulletPoint('GDP Growth: Enable $50M+ in new economic activity through improved logistics and delivery services');
      addBulletPoint('Business Registration: Streamline business licensing and taxation through accurate address verification');
      addBulletPoint('Tourism Revenue: Enhance visitor experience with reliable navigation and emergency services');
      addBulletPoint('Investment Attraction: Position EG as a digitally advanced nation for international investors');
      
      addHeading('Social Development', 2);
      addBulletPoint('Healthcare Access: Improve ambulance response times by 40% through precise addressing');
      addBulletPoint('Education Services: Optimize school enrollment and transportation planning');
      addBulletPoint('Financial Inclusion: Enable banking services in remote areas through verified addresses');
      addBulletPoint('Digital Literacy: Build citizen capacity for digital government services');

      // Page 4 - Government Benefits
      pdf.addPage();
      yPosition = margin;
      addHeading('BENEFITS TO GOVERNMENT');
      
      addHeading('Administrative Efficiency', 2);
      addBulletPoint('Taxation: Increase revenue collection accuracy by 25% through verified property addresses');
      addBulletPoint('Census Operations: Reduce 2025 census costs by 30% using existing address database');
      addBulletPoint('Service Delivery: Cut government service delivery costs by 20% through improved logistics');
      addBulletPoint('Resource Planning: Data-driven decision making for infrastructure investments');
      
      addHeading('Security and Law Enforcement', 2);
      addBulletPoint('Emergency Response: Reduce average police response time from 18 to 8 minutes');
      addBulletPoint('Crime Prevention: Enable predictive policing through location-based crime analytics');
      addBulletPoint('Border Security: Enhance monitoring of remote areas through systematic addressing');
      addBulletPoint('Disaster Management: Improve evacuation planning and disaster response coordination');
      
      addHeading('Digital Governance', 2);
      addBulletPoint('Transparency: Real-time tracking of government service delivery performance');
      addBulletPoint('Accountability: Comprehensive audit trails for all system operations');
      addBulletPoint('Innovation: Foundation for AI, IoT, and smart city initiatives');

      // Page 5 - Business Sector Benefits
      pdf.addPage();
      yPosition = margin;
      addHeading('BENEFITS TO BUSINESS SECTOR');
      
      addHeading('Logistics and Delivery', 2);
      addBulletPoint('E-commerce Growth: Enable Amazon, DHL, and other global companies to operate efficiently');
      addBulletPoint('Last-Mile Delivery: Reduce delivery costs by 35% through accurate addressing');
      addBulletPoint('Supply Chain Optimization: Improve inventory management and distribution planning');
      addBulletPoint('Customer Service: Enhance customer satisfaction through reliable delivery promises');
      
      addHeading('Financial Services', 2);
      addBulletPoint('Banking Expansion: Enable banks to offer services in previously unaddressed areas');
      addBulletPoint('Insurance Services: Accurate risk assessment for property and business insurance');
      addBulletPoint('Credit Assessment: Improved loan underwriting through verified address history');
      addBulletPoint('Mobile Money: Support digital payment systems expansion');
      
      addHeading('Real Estate and Construction', 2);
      addBulletPoint('Property Valuation: Standardized addressing increases property values by 15-20%');
      addBulletPoint('Construction Planning: Streamlined permitting and utility connections');
      addBulletPoint('Property Management: Efficient maintenance and service delivery');

      // Page 6 - Technical Innovation
      pdf.addPage();
      yPosition = margin;
      addHeading('TECHNICAL INNOVATION & CAPABILITIES');
      
      addHeading('Cutting-Edge Technology Stack', 2);
      addBulletPoint('Cloud-Native Architecture: Scalable, resilient, and cost-effective infrastructure');
      addBulletPoint('Real-Time Analytics: AI-powered insights for decision making');
      addBulletPoint('Mobile-First Design: Optimized for smartphone access across all user levels');
      addBulletPoint('Multi-Language Support: Spanish, French, Portuguese, and local languages');
      
      addHeading('Integration Capabilities', 2);
      addBulletPoint('Government Systems: Seamless integration with existing ministries and agencies');
      addBulletPoint('International Standards: Compatible with global addressing standards (ISO 19160)');
      addBulletPoint('API Ecosystem: Enable third-party developers and service providers');
      addBulletPoint('Data Export: Support for GIS, mapping, and planning applications');
      
      addHeading('Security and Compliance', 2);
      addBulletPoint('End-to-End Encryption: Military-grade security for sensitive police operations');
      addBulletPoint('Role-Based Access: Granular permissions ensuring data security');
      addBulletPoint('Audit Trails: Complete tracking of all system activities');
      addBulletPoint('GDPR Compliance: International privacy standards implementation');

      // Page 7 - Implementation Roadmap
      pdf.addPage();
      yPosition = margin;
      addHeading('IMPLEMENTATION ROADMAP');
      
      addHeading('Phase 1: Foundation (Months 1-3)', 2);
      addBulletPoint('System deployment in Malabo and Bata urban centers');
      addBulletPoint('Police operator training for 200+ officers');
      addBulletPoint('Address registration pilot in 5 key districts');
      addBulletPoint('Integration with existing emergency services');
      
      addHeading('Phase 2: Expansion (Months 4-8)', 2);
      addBulletPoint('Provincial rollout to all 7 provinces');
      addBulletPoint('Rural area addressing using satellite technology');
      addBulletPoint('Business and government API integrations');
      addBulletPoint('Advanced analytics and reporting deployment');
      
      addHeading('Phase 3: Optimization (Months 9-12)', 2);
      addBulletPoint('AI-powered address verification automation');
      addBulletPoint('Predictive policing analytics implementation');
      addBulletPoint('International address sharing agreements');
      addBulletPoint('Smart city sensors and IoT integration');

      // Page 8 - ROI and Metrics
      pdf.addPage();
      yPosition = margin;
      addHeading('RETURN ON INVESTMENT');
      
      addHeading('Financial Benefits (Annual)', 2);
      addBulletPoint('Government Revenue Increase: $2.5M through improved taxation and services');
      addBulletPoint('Cost Savings: $1.8M in reduced emergency response and administrative costs');
      addBulletPoint('Economic Growth: $8M in new business activity enabled by the platform');
      addBulletPoint('Healthcare Savings: $1.2M through faster emergency medical response');
      
      addHeading('Performance Metrics', 2);
      addBulletPoint('Address Coverage: Target 95% national coverage by end of Year 1');
      addBulletPoint('Emergency Response: Improve response times by 60% in urban areas');
      addBulletPoint('User Adoption: 500,000+ citizens using the system within 18 months');
      addBulletPoint('Business Integration: 200+ businesses using address APIs');
      
      addHeading('International Recognition', 2);
      addBulletPoint('UN Sustainable Development Goals: Contribute to SDGs 11 (Sustainable Cities) and 16 (Peace and Justice)');
      addBulletPoint('World Bank Digital Government Rankings: Position EG in top 50 globally');
      addBulletPoint('Technology Export: License platform to other African nations');

      // Page 9 - Key Features Overview
      pdf.addPage();
      yPosition = margin;
      addHeading('KEY PLATFORM FEATURES');
      
      addHeading('Address Registry System', 2);
      addBulletPoint('GPS-Powered Registration: Military-grade accuracy for all addresses');
      addBulletPoint('Multi-Level Verification: Quality assurance through field agents and experts');
      addBulletPoint('Unified Address Codes (UAC): Global standard compatible addressing');
      addBulletPoint('Evidence Management: Photo and document verification for each address');
      addBulletPoint('Real-Time Search: Instant address lookup for citizens and businesses');
      
      addHeading('Police Operations System', 2);
      addBulletPoint('Emergency Dispatch: Automated unit assignment based on location and availability');
      addBulletPoint('Real-Time Tracking: Live monitoring of all police units and incidents');
      addBulletPoint('Performance Analytics: Data-driven insights for operational improvement');
      addBulletPoint('Secure Communications: Encrypted messaging for sensitive operations');
      addBulletPoint('Evidence Chain Management: Digital evidence tracking and preservation');

      // Page 10 - Strategic Vision
      pdf.addPage();
      yPosition = margin;
      addHeading('STRATEGIC VISION FOR EQUATORIAL GUINEA');
      
      addText('The Connect Nation Unified Platform is more than a technology solution - it is the foundation for Equatorial Guinea\'s transformation into a leading digital nation in Africa.');
      
      addHeading('Smart Nation Initiative', 2);
      addBulletPoint('Digital Infrastructure: Foundation for 5G, IoT, and smart city technologies');
      addBulletPoint('Citizen Services: Move 80% of government services online by 2026');
      addBulletPoint('Economic Diversification: Reduce oil dependency through technology sector growth');
      addBulletPoint('Regional Leadership: Become the digital services hub for Central Africa');
      
      addHeading('Long-Term Impact (5-Year Vision)', 2);
      addBulletPoint('Technology Sector: Create 5,000+ high-skilled technology jobs');
      addBulletPoint('Education: Integrate digital literacy into national curriculum');
      addBulletPoint('Healthcare: Telemedicine services reaching every citizen');
      addBulletPoint('Environment: Smart monitoring systems for natural resource protection');
      
      addHeading('International Partnerships', 2);
      addBulletPoint('Technology Transfer: Collaborate with leading global technology companies');
      addBulletPoint('Capacity Building: Exchange programs with digital government leaders');
      addBulletPoint('Export Opportunities: License technology to neighboring countries');
      addBulletPoint('Investment Attraction: Demonstrate EG as a technology-forward investment destination');

      // Page 11 - Call to Action
      pdf.addPage();
      yPosition = margin;
      addHeading('CALL TO ACTION');
      
      addText('The Connect Nation Unified Platform represents a historic opportunity to transform Equatorial Guinea\'s digital future. The time to act is now.');
      
      addHeading('Immediate Next Steps', 2);
      addBulletPoint('Cabinet Approval: Secure government backing for national rollout');
      addBulletPoint('Budget Allocation: Approve initial implementation funding');
      addBulletPoint('Stakeholder Engagement: Begin coordination with ministries and agencies');
      addBulletPoint('International Partnerships: Initiate discussions with technology partners');
      
      addHeading('Success Factors', 2);
      addBulletPoint('Political Will: Strong government commitment to digital transformation');
      addBulletPoint('Citizen Engagement: Public awareness and adoption campaigns');
      addBulletPoint('Technical Excellence: Maintain high standards for system reliability');
      addBulletPoint('Continuous Innovation: Regular updates and feature enhancements');
      
      addText('With the Connect Nation Unified Platform, Equatorial Guinea will join the ranks of the world\'s most digitally advanced nations, creating prosperity, security, and opportunity for all citizens.');
      
      yPosition += 20;
      addText('Together, we will build the digital foundation for Equatorial Guinea\'s bright future.', 14, true, true);

      // Footer on each page
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Connect Nation Unified Platform - Government Presentation', margin, pageHeight - 10);
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 10);
      }

      // Save the PDF
      pdf.save('Connect_Nation_Government_Presentation.pdf');
      toast.success('Government presentation PDF downloaded successfully!');
    } catch (error) {
      console.error('Error generating presentation PDF:', error);
      toast.error('Failed to generate presentation PDF');
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Government Presentation - Connect Nation Platform
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <p className="text-muted-foreground">
            This comprehensive presentation highlights the strategic benefits and transformational impact 
            of the Connect Nation Unified Platform for Equatorial Guinea's government, businesses, and citizens.
          </p>
          
          <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
            <h3 className="font-semibold text-lg mb-2">Presentation Contents</h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Executive Summary & Platform Overview</li>
              <li>• National Economic & Social Benefits</li>
              <li>• Government Efficiency & Security Improvements</li>
              <li>• Business Sector Growth Opportunities</li>
              <li>• Technical Innovation & Capabilities</li>
              <li>• Implementation Roadmap & Timeline</li>
              <li>• Return on Investment Analysis</li>
              <li>• Strategic Vision for Digital Transformation</li>
              <li>• Action Plan & Success Factors</li>
            </ul>
          </div>
          
          <div className="bg-secondary/5 p-4 rounded-lg border border-secondary/20">
            <h3 className="font-semibold mb-2">Key Value Propositions</h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• $50M+ in new economic activity</li>
              <li>• 60% improvement in emergency response times</li>
              <li>• 25% increase in taxation accuracy</li>
              <li>• Position as regional digital leader</li>
              <li>• Foundation for smart city initiatives</li>
            </ul>
          </div>
        </div>
        
        <Button 
          onClick={generatePresentationPDF}
          size="lg"
          className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
        >
          <Download className="h-5 w-5 mr-2" />
          Download Government Presentation PDF
        </Button>
      </CardContent>
    </Card>
  );
};

export default GovernmentPresentationPDF;