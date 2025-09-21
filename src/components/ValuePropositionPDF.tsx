import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, Target, TrendingUp, Shield, Users } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '@/components/ui/use-toast';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const ValuePropositionPDF: React.FC = () => {
  const { toast } = useToast();
  const contentRef = useRef<HTMLDivElement>(null);

  // Sample data for charts
  const efficiencyData = [
    { name: 'Manual Processing', before: 100, after: 20 },
    { name: 'Response Time', before: 40, after: 16 },
    { name: 'Administrative Overhead', before: 80, after: 32 },
    { name: 'Registration Time', before: 120, after: 12 },
  ];

  const customerSegmentData = [
    { name: 'Government Officials', value: 35, color: '#0088FE' },
    { name: 'Citizens', value: 45, color: '#00C49F' },
    { name: 'Emergency Services', value: 20, color: '#FFBB28' },
  ];

  const painReliefData = [
    { category: 'Address Chaos', impact: 95 },
    { category: 'Emergency Delays', impact: 88 },
    { category: 'Service Barriers', impact: 92 },
    { category: 'Bureaucracy', impact: 85 },
  ];

  const adoptionTimelineData = [
    { month: 'Month 1', deployment: 25, adoption: 10 },
    { month: 'Month 2', deployment: 60, adoption: 35 },
    { month: 'Month 3', deployment: 100, adoption: 75 },
    { month: 'Month 6', deployment: 100, adoption: 95 },
  ];

  const generatePDF = async () => {
    if (!contentRef.current) return;

    try {
      toast({
        title: "Generating PDF",
        description: "Creating your value proposition document...",
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;

      // Cover Page
      pdf.setFillColor(8, 47, 73);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(28);
      pdf.text('ConnectNation', pageWidth / 2, 60, { align: 'center' });
      
      pdf.setFontSize(24);
      pdf.text('Digital Addressing System', pageWidth / 2, 80, { align: 'center' });
      
      pdf.setFontSize(18);
      pdf.text('Customer Value Proposition', pageWidth / 2, 100, { align: 'center' });
      
      pdf.setFontSize(16);
      pdf.text('For Equatorial Guinea', pageWidth / 2, 120, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.text('Building the Nation\'s First Comprehensive Address System', pageWidth / 2, 140, { align: 'center' });
      pdf.text('Transforming Economic Opportunity & Emergency Response', pageWidth / 2, 150, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, 260, { align: 'center' });

      // Page 2: Value Proposition Canvas Overview
      pdf.addPage();
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(20);
      pdf.text('Customer Value Proposition Canvas', margin, 30);
      
      pdf.setFontSize(12);
      const canvasText = `Equatorial Guinea faces a unique challenge: the absence of a traditional national address system. Poor urbanization has left citizens, businesses, emergency services, and government agencies unable to reliably locate people and places.

ConnectNation's Digital Addressing System represents a transformational opportunity to leapfrog traditional addressing limitations and establish Equatorial Guinea as a leader in digital infrastructure.

This document outlines our Customer Value Proposition:
• Products & Services that build addressing from ground zero
• Gain Generators that unlock previously impossible opportunities
• Pain Relievers that solve fundamental location challenges
• Customer Gains that transform society and economy
• Customer Pains that currently cripple service delivery
• Customer Jobs that require urgent national addressing

Our approach transforms Equatorial Guinea's addressing challenge into a competitive advantage.`;

      const lines = pdf.splitTextToSize(canvasText, pageWidth - 2 * margin);
      pdf.text(lines, margin, 50);

      // Page 3: Products & Services
      pdf.addPage();
      pdf.setFontSize(20);
      pdf.text('Products & Services', margin, 30);

      pdf.setFontSize(14);
      pdf.text('Core Platform Components:', margin, 50);
      
      const products = [
        '1. National Digital Address Registry (NAR)',
        '   • First-ever centralized address database for Equatorial Guinea',
        '   • Unique address codes for every location nationwide',
        '   • GPS-based coordinate system with visual landmarks',
        '   • Multi-language support (Spanish, French, Portuguese)',
        '',
        '2. Citizen Address Repository (CAR)',
        '   • Mobile-first registration for citizens without addresses',
        '   • QR-coded digital address cards for instant identification',
        '   • Offline capability for rural and remote areas',
        '   • SMS-based address sharing for basic phones',
        '',
        '3. Emergency Response Revolution',
        '   • GPS-enabled emergency location for the first time',
        '   • Real-time unit dispatch with precise coordinates',
        '   • Life-saving response capabilities in previously unreachable areas',
        '',
        '4. Economic Enablement Platform',
        '   • Business registration with verifiable addresses',
        '   • Delivery and logistics infrastructure foundation',
        '   • Banking and financial services location verification',
        '',
        '5. National Infrastructure Services',
        '   • Complete system deployment in 90 days',
        '   • Government staff training and capacity building',
        '   • Ongoing support for national addressing maintenance'
      ];
      
      let yPos = 70;
      products.forEach(product => {
        pdf.setFontSize(product.startsWith('   ') ? 10 : product.match(/^\d+\./) ? 12 : 11);
        pdf.text(product, margin, yPos);
        yPos += product === '' ? 5 : 8;
      });

      // Page 4: Gain Generators
      pdf.addPage();
      pdf.setFontSize(20);
      pdf.text('Gain Generators', margin, 30);
      
      pdf.setFontSize(14);
      pdf.text('How We Create Value for You:', margin, 50);
      
      const gainGenerators = [
        'National Addressing Foundation:',
        '• Creates Equatorial Guinea\'s first comprehensive address system',
        '• Establishes unique location identity for every citizen and business',
        '• Enables international standards compliance for global integration',
        '',
        'Economic Transformation:',
        '• Unlocks e-commerce and delivery services for the first time',
        '• Enables banking services to reach previously "unaddressable" citizens',
        '• Creates foundation for foreign investment and business expansion',
        '',
        'Emergency Service Revolution:',
        '• Transforms emergency response from impossible to life-saving',
        '• GPS-enabled location for medical, fire, and police emergencies',
        '• Reduces emergency response uncertainty from hours to minutes',
        '',
        'Government Service Delivery:',
        '• Enables home delivery of government services and documents',
        '• Creates voter registration and census capabilities',
        '• Establishes tax collection and social services infrastructure',
        '',
        'Digital Leapfrogging:',
        '• Bypasses traditional addressing limitations entirely',
        '• Positions Equatorial Guinea as regional digital leader',
        '• Creates modern infrastructure without legacy system constraints'
      ];
      
      yPos = 70;
      gainGenerators.forEach(item => {
        const isBold = !item.startsWith('•') && !item.startsWith(' ') && item !== '';
        pdf.setFontSize(isBold ? 12 : 10);
        if (isBold && item.endsWith(':')) {
          pdf.setFont('helvetica', 'bold');
        } else {
          pdf.setFont('helvetica', 'normal');
        }
        pdf.text(item, margin, yPos);
        yPos += item === '' ? 5 : 8;
      });

      // Page 5: Pain Relievers
      pdf.addPage();
      pdf.setFontSize(20);
      pdf.text('Pain Relievers', margin, 30);
      
      pdf.setFontSize(14);
      pdf.text('Critical Problems We Solve:', margin, 50);
      
      const painRelievers = [
        'Complete Address Absence:',
        '• Creates the nation\'s first systematic addressing infrastructure',
        '• Eliminates the fundamental "no address" barrier to services',
        '• Establishes location identity for previously "invisible" citizens',
        '',
        'Emergency Service Impossibility:',
        '• Transforms "we cannot find you" into precise GPS location',
        '• Eliminates emergency service failures due to unknown locations',
        '• Enables life-saving response in previously unreachable areas',
        '',
        'Economic Exclusion:',
        '• Removes the "no address, no service" barrier to banking',
        '• Enables delivery services to reach every citizen for the first time',
        '• Creates business registration capability for informal economy',
        '',
        'Government Service Gaps:',
        '• Eliminates inability to deliver services to "addressless" citizens',
        '• Removes location barriers to healthcare and education access',
        '• Enables tax collection and social services in all areas',
        '',
        'Social Isolation:',
        '• Connects rural and urban populations to national infrastructure',
        '• Removes geographic barriers to citizen participation',
        '• Enables family and social connections across distances'
      ];
      
      yPos = 70;
      painRelievers.forEach(item => {
        const isBold = !item.startsWith('•') && !item.startsWith(' ') && item !== '';
        pdf.setFontSize(isBold ? 12 : 10);
        if (isBold && item.endsWith(':')) {
          pdf.setFont('helvetica', 'bold');
        } else {
          pdf.setFont('helvetica', 'normal');
        }
        pdf.text(item, margin, yPos);
        yPos += item === '' ? 5 : 8;
      });

      // Page 6: Customer Gains
      pdf.addPage();
      pdf.setFontSize(20);
      pdf.text('Customer Gains', margin, 30);
      
      pdf.setFontSize(14);
      pdf.text('Benefits You Will Achieve:', margin, 50);
      
      const customerGains = [
        'For Government Officials:',
        '• National infrastructure creation enhances international standing',
        '• First-time ability to locate and serve all citizens equally',
        '• Foundation for modern tax collection and census capabilities',
        '• Positions Equatorial Guinea as regional technology leader',
        '',
        'For Citizens:',
        '• First-time access to banking, delivery, and modern services',
        '• Emergency services can finally find and help them',
        '• Economic opportunities through addressable business registration',
        '• Connection to national identity and civic participation',
        '',
        'For Emergency Services:',
        '• Transformation from impossible to life-saving response capability',
        '• GPS-enabled location of every citizen for the first time',
        '• Professional emergency coordination replacing chaos',
        '• Ability to save lives previously unreachable',
        '',
        'For Businesses:',
        '• Access to previously unreachable customer markets',
        '• Delivery and logistics capabilities enable new business models',
        '• Formal economy expansion through addressable registration',
        '• International business credibility through proper addressing'
      ];
      
      yPos = 70;
      customerGains.forEach(item => {
        const isBold = !item.startsWith('•') && !item.startsWith(' ') && item !== '';
        pdf.setFontSize(isBold ? 12 : 10);
        if (isBold && item.endsWith(':')) {
          pdf.setFont('helvetica', 'bold');
        } else {
          pdf.setFont('helvetica', 'normal');
        }
        pdf.text(item, margin, yPos);
        yPos += item === '' ? 5 : 8;
      });

      // Page 7: Customer Pains
      pdf.addPage();
      pdf.setFontSize(20);
      pdf.text('Customer Pains', margin, 30);
      
      pdf.setFontSize(14);
      pdf.text('Current Challenges You Face:', margin, 50);
      
      const customerPains = [
        'For Government Officials:',
        '• Complete inability to locate citizens for service delivery',
        '• No infrastructure for tax collection or census operations',
        '• International embarrassment over lack of basic addressing',
        '• Cannot attract foreign investment without addressable locations',
        '',
        'For Citizens:',
        '• Excluded from banking services due to "no fixed address"',
        '• Cannot receive deliveries, mail, or essential services',
        '• Emergency services cannot find them during life-threatening situations',
        '• Economic isolation prevents business development and job opportunities',
        '',
        'For Emergency Services:',
        '• Completely unable to locate people during emergencies',
        '• Lives lost due to inability to find accident or medical emergency sites',
        '• No coordination capability for disaster response',
        '• International aid cannot reach specific affected areas',
        '',
        'For Businesses:',
        '• Cannot establish formal business presence without addresses',
        '• Unable to deliver products or services to customers',
        '• Excluded from international commerce and logistics',
        '• Informal economy prevents growth and investment'
      ];
      
      yPos = 70;
      customerPains.forEach(item => {
        const isBold = !item.startsWith('•') && !item.startsWith(' ') && item !== '';
        pdf.setFontSize(isBold ? 12 : 10);
        if (isBold && item.endsWith(':')) {
          pdf.setFont('helvetica', 'bold');
        } else {
          pdf.setFont('helvetica', 'normal');
        }
        pdf.text(item, margin, yPos);
        yPos += item === '' ? 5 : 8;
      });

      // Page 8: Customer Jobs
      pdf.addPage();
      pdf.setFontSize(20);
      pdf.text('Customer Jobs', margin, 30);
      
      pdf.setFontSize(14);
      pdf.text('Jobs You Need to Get Done:', margin, 50);
      
      const customerJobs = [
        'Nation-Building Jobs (Government Officials):',
        '• Create Equatorial Guinea\'s first national addressing system',
        '• Establish modern infrastructure for economic development',
        '• Build foundation for international business and investment',
        '• Enable systematic governance and citizen services',
        '',
        'Survival Jobs (Citizens):',
        '• Obtain basic location identity for accessing services',
        '• Ensure emergency services can find them during crises',
        '• Access banking, healthcare, and economic opportunities',
        '• Participate in formal economy and civic life',
        '',
        'Life-Saving Jobs (Emergency Services):',
        '• Locate citizens during medical emergencies for the first time',
        '• Respond to disasters with precise coordinate capability',
        '• Save lives currently lost due to location uncertainty',
        '• Provide professional emergency services nationwide',
        '',
        'Economic Development Jobs (Businesses):',
        '• Establish formal business presence with verifiable addresses',
        '• Access previously unreachable customer markets',
        '• Enable delivery and logistics business models',
        '• Connect to international commerce and supply chains',
        '',
        'Transformation Jobs (All Stakeholders):',
        '• Leapfrog from no addressing to world-class digital system',
        '• Position Equatorial Guinea as regional technology leader',
        '• Create foundation for smart city and digital economy initiatives'
      ];
      
      yPos = 70;
      customerJobs.forEach(item => {
        const isBold = !item.startsWith('•') && !item.startsWith(' ') && item !== '';
        pdf.setFontSize(isBold ? 12 : 10);
        if (isBold && item.endsWith(':')) {
          pdf.setFont('helvetica', 'bold');
        } else {
          pdf.setFont('helvetica', 'normal');
        }
        pdf.text(item, margin, yPos);
        yPos += item === '' ? 5 : 8;
      });

      // Page 9: Contact & Next Steps
      pdf.addPage();
      pdf.setFontSize(20);
      pdf.text('Next Steps', margin, 30);
      
      pdf.setFontSize(14);
      pdf.text('Ready to Transform Your Address Infrastructure?', margin, 50);
      
      pdf.setFontSize(12);
      const nextSteps = [
        '1. Schedule a personalized demonstration',
        '2. Conduct technical requirements assessment',
        '3. Receive customized implementation proposal',
        '4. Begin 90-day deployment process',
        '5. Go live with full system capabilities'
      ];
      
      yPos = 70;
      nextSteps.forEach(step => {
        pdf.text(step, margin, yPos);
        yPos += 15;
      });
      
      pdf.setFontSize(14);
      pdf.text('Contact Information:', margin, yPos + 20);
      pdf.setFontSize(12);
      pdf.text('ConnectNation Solutions Team', margin, yPos + 35);
      pdf.text('Email: solutions@connectnation.gov', margin, yPos + 45);
      pdf.text('Phone: +240 XXX XXX XXX', margin, yPos + 55);
      pdf.text('Web: www.connectnation.gov', margin, yPos + 65);

      // Save the PDF
      pdf.save('ConnectNation-Value-Proposition.pdf');
      
      toast({
        title: "PDF Generated Successfully",
        description: "Your value proposition document has been downloaded.",
      });

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error Generating PDF",
        description: "There was an error creating the document. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Helper function to convert hex to RGB
  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [0, 0, 0];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <FileText className="h-6 w-6" />
            ConnectNation Value Proposition PDF
          </CardTitle>
          <p className="text-muted-foreground">
            Generate a comprehensive PDF document with charts and infographics
          </p>
        </CardHeader>
        <CardContent className="text-center">
          <Button 
            onClick={generatePDF}
            size="lg"
            className="w-full max-w-md"
          >
            <Download className="h-5 w-5 mr-2" />
            Generate & Download PDF
          </Button>
        </CardContent>
      </Card>

      {/* Preview Section with Charts */}
      <div ref={contentRef} className="space-y-8 p-6 bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-primary">ConnectNation Digital Addressing System</h1>
          <h2 className="text-2xl text-muted-foreground">Customer Value Proposition</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Segments Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Customer Segments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={customerSegmentData}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {customerSegmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Efficiency Improvements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Process Efficiency Gains
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={efficiencyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="before" fill="#FF8042" name="Before (%)" />
                  <Bar dataKey="after" fill="#00C49F" name="After (%)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pain Relief Impact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Pain Relief Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={painReliefData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="category" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="impact" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Implementation Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Implementation Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={adoptionTimelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="deployment" stackId="1" stroke="#8884d8" fill="#8884d8" name="Deployment %" />
                  <Area type="monotone" dataKey="adoption" stackId="2" stroke="#82ca9d" fill="#82ca9d" name="Adoption %" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-600">90%</div>
              <div className="text-sm text-muted-foreground">Faster Registration</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-600">40%</div>
              <div className="text-sm text-muted-foreground">Response Time Reduction</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-purple-600">99.9%</div>
              <div className="text-sm text-muted-foreground">System Uptime</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-orange-600">90</div>
              <div className="text-sm text-muted-foreground">Days to Deploy</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};