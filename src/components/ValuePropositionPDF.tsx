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
      
      pdf.setFontSize(12);
      pdf.text('Transforming National Address Infrastructure', pageWidth / 2, 130, { align: 'center' });
      pdf.text('for Government Excellence & Citizen Empowerment', pageWidth / 2, 140, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, 260, { align: 'center' });

      // Page 2: Value Proposition Canvas Overview
      pdf.addPage();
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(20);
      pdf.text('Customer Value Proposition Canvas', margin, 30);
      
      pdf.setFontSize(12);
      const canvasText = `ConnectNation's Digital Addressing System follows a proven Customer Value Proposition framework that directly addresses government challenges while delivering measurable benefits.

This document outlines:
• Products & Services we offer
• Gain Generators that create value
• Pain Relievers that solve problems
• Customer Gains you'll achieve
• Customer Pains we eliminate
• Customer Jobs we help you accomplish

Our systematic approach ensures every feature delivers tangible value to your organization and citizens.`;

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
        '   • Centralized address database with unique codes',
        '   • Real-time address validation and verification',
        '   • Multi-language support and standardization',
        '',
        '2. Citizen Address Repository (CAR)',
        '   • Self-service address registration portal',
        '   • Digital address cards and QR codes',
        '   • Mobile-first citizen experience',
        '',
        '3. Emergency Response Management',
        '   • Real-time incident tracking and dispatch',
        '   • GPS-enabled unit coordination',
        '   • Automated backup request system',
        '',
        '4. Professional Services',
        '   • 90-day deployment program',
        '   • Staff training and change management',
        '   • Ongoing technical support and maintenance'
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
        'Operational Excellence:',
        '• 99.9% system uptime with enterprise infrastructure',
        '• Automated workflows reduce manual processing by 90%',
        '• Real-time data synchronization across all modules',
        '',
        'Citizen Empowerment:',
        '• Self-service registration reduces counter visits by 80%',
        '• Mobile-first design increases accessibility',
        '• Multi-language support serves diverse populations',
        '',
        'Emergency Efficiency:',
        '• GPS integration enables precise location tracking',
        '• Automated dispatch reduces response coordination time',
        '• Real-time unit status prevents resource conflicts',
        '',
        'Future-Ready Technology:',
        '• API-first architecture enables unlimited integrations',
        '• Offline-first design works in remote areas',
        '• Cloud-native scaling handles growing demands'
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
        'Address Management Chaos:',
        '• Unified registry eliminates duplicate and conflicting addresses',
        '• Standardized formats ensure consistency across departments',
        '• Real-time validation prevents data quality issues',
        '',
        'Emergency Response Delays:',
        '• GPS coordinates enable instant location identification',
        '• Automated dispatch eliminates manual coordination delays',
        '• Real-time status updates prevent resource conflicts',
        '',
        'Citizen Service Barriers:',
        '• Self-service portal eliminates office visit requirements',
        '• Mobile-first design serves citizens anywhere, anytime',
        '• Multi-language support removes language barriers',
        '',
        'Bureaucratic Inefficiencies:',
        '• Automated workflows eliminate manual paper processing',
        '• Digital approvals reduce processing from weeks to hours',
        '• Integrated systems eliminate departmental silos'
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
        '• Increased operational efficiency and cost savings',
        '• Enhanced citizen satisfaction and trust',
        '• Improved inter-agency collaboration and data sharing',
        '• Measurable performance metrics and accountability',
        '',
        'For Citizens:',
        '• Faster, more convenient government services',
        '• Improved emergency response and personal safety',
        '• Reduced bureaucratic hassles and wait times',
        '• Digital empowerment and accessibility',
        '',
        'For Emergency Services:',
        '• Life-saving response time improvements',
        '• Better resource allocation and coordination',
        '• Enhanced situational awareness and decision-making',
        '• Reduced operational stress and improved outcomes'
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
        '• Legacy systems create operational chaos and inefficiency',
        '• Manual processes consume excessive time and resources',
        '• Lack of inter-agency coordination hampers service delivery',
        '• Poor data quality undermines decision-making',
        '',
        'For Citizens:',
        '• Bureaucratic barriers limit access to essential services',
        '• Long wait times and complex procedures cause frustration',
        '• Inconsistent service quality across departments',
        '• Language barriers exclude many from government services',
        '',
        'For Emergency Services:',
        '• Location uncertainty delays critical response times',
        '• Poor coordination leads to resource conflicts',
        '• Manual dispatch processes waste precious minutes',
        '• Lack of real-time information hampers decision-making'
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
        'Functional Jobs (Government Officials):',
        '• Modernize national address infrastructure',
        '• Improve inter-agency coordination and data sharing',
        '• Enhance emergency response capabilities',
        '• Increase operational efficiency and reduce costs',
        '',
        'Emotional Jobs (Citizens):',
        '• Feel safe and protected in emergencies',
        '• Experience efficient, respectful government services',
        '• Maintain dignity when accessing public services',
        '• Feel empowered through digital access',
        '',
        'Social Jobs (Emergency Services):',
        '• Save lives through faster response times',
        '• Protect communities with better coordination',
        '• Serve the public with pride and effectiveness',
        '• Build trust through reliable emergency services',
        '',
        'Survival Jobs (All):',
        '• Ensure critical services function during crises',
        '• Maintain government continuity and legitimacy',
        '• Protect public safety and national security'
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