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

      // Page 2: Executive Summary
      pdf.addPage();
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(20);
      pdf.text('Executive Summary', margin, 30);
      
      pdf.setFontSize(12);
      const summaryText = `ConnectNation Digital Addressing System revolutionizes how governments manage addresses and emergency services. Our comprehensive platform combines a National Digital Address Registry (NAR), Citizen Address Repository (CAR), and Emergency Response Management into one unified solution.

Key Benefits:
• 90% faster address registration
• 40% reduction in emergency response times  
• 60% decrease in administrative overhead
• 99.9% system uptime guarantee
• Multi-language support (English, Spanish, French)
• Offline-first design for remote areas

Our solution addresses critical pain points including address management chaos, emergency response delays, and citizen service barriers while delivering significant gains in operational efficiency, citizen empowerment, and government credibility.`;

      const lines = pdf.splitTextToSize(summaryText, pageWidth - 2 * margin);
      pdf.text(lines, margin, 50);

      // Page 3: Customer Segments Chart
      pdf.addPage();
      pdf.setFontSize(20);
      pdf.text('Customer Segments', margin, 30);

      // Create a simple pie chart representation
      pdf.setFontSize(12);
      pdf.text('Target Customer Distribution:', margin, 50);
      
      let yPos = 70;
      customerSegmentData.forEach((segment, index) => {
        pdf.setFillColor(...hexToRgb(segment.color));
        pdf.circle(margin + 5, yPos, 3, 'F');
        pdf.text(`${segment.name}: ${segment.value}%`, margin + 15, yPos + 2);
        yPos += 15;
      });

      // Page 4: Pain Points & Solutions
      pdf.addPage();
      pdf.setFontSize(20);
      pdf.text('Pain Points & Solutions', margin, 30);
      
      pdf.setFontSize(14);
      pdf.text('Critical Problems We Solve:', margin, 50);
      
      const painPoints = [
        'Address Management Chaos → Unified Digital Registry',
        'Emergency Response Delays → Real-time Coordination',
        'Citizen Service Barriers → Self-service Portal',
        'Bureaucratic Inefficiencies → Automated Workflows',
        'Data Fragmentation → Centralized Database'
      ];
      
      yPos = 70;
      painPoints.forEach(point => {
        pdf.setFontSize(12);
        pdf.text(`• ${point}`, margin, yPos);
        yPos += 10;
      });

      // Page 5: Value Metrics
      pdf.addPage();
      pdf.setFontSize(20);
      pdf.text('Value Metrics & ROI', margin, 30);
      
      pdf.setFontSize(14);
      pdf.text('Quantified Benefits:', margin, 50);
      
      const metrics = [
        'Process Efficiency: 80% reduction in manual work',
        'Time Savings: 90% faster registration process',
        'Emergency Response: 40% faster response times',
        'Cost Reduction: 60% lower administrative overhead',
        'System Reliability: 99.9% uptime guarantee',
        'Deployment Speed: Fully operational in 90 days'
      ];
      
      yPos = 70;
      metrics.forEach(metric => {
        pdf.setFontSize(12);
        pdf.text(`• ${metric}`, margin, yPos);
        yPos += 12;
      });

      // Page 6: Implementation Timeline
      pdf.addPage();
      pdf.setFontSize(20);
      pdf.text('Implementation Timeline', margin, 30);
      
      pdf.setFontSize(12);
      pdf.text('90-Day Deployment Schedule:', margin, 50);
      
      const timeline = [
        'Month 1: System Setup & Data Migration (25% complete)',
        'Month 2: Staff Training & Pilot Testing (60% complete)', 
        'Month 3: Full Deployment & Go-Live (100% complete)',
        'Month 6: Full User Adoption Achieved (95% adoption)'
      ];
      
      yPos = 70;
      timeline.forEach(phase => {
        pdf.text(`• ${phase}`, margin, yPos);
        yPos += 15;
      });

      // Page 7: Technical Architecture
      pdf.addPage();
      pdf.setFontSize(20);
      pdf.text('Technical Architecture', margin, 30);
      
      const techSpecs = [
        'Platform: Enterprise-grade Supabase infrastructure',
        'Deployment: Cloud-native with edge computing',
        'Security: SOC 2, GDPR, ISO 27001 compliant',
        'Scalability: Handles millions of addresses',
        'Integration: API-first design for seamless connectivity',
        'Mobile: Native iOS/Android applications',
        'Offline: Full functionality without internet',
        'Languages: Multi-language support built-in'
      ];
      
      yPos = 50;
      techSpecs.forEach(spec => {
        pdf.setFontSize(12);
        pdf.text(`• ${spec}`, margin, yPos);
        yPos += 12;
      });

      // Page 8: Competitive Advantage
      pdf.addPage();
      pdf.setFontSize(20);
      pdf.text('Competitive Advantage', margin, 30);
      
      pdf.setFontSize(14);
      pdf.text('Why Choose ConnectNation?', margin, 50);
      
      const advantages = [
        'Complete Solution: Address management + emergency response in one platform',
        'Rapid Deployment: 90-day implementation vs 12+ months for custom builds',
        'Proven Technology: Built on enterprise-grade, battle-tested infrastructure',
        'Government-Focused: Designed specifically for public sector requirements',
        'Future-Ready: API-first architecture enables unlimited integrations',
        'Cost-Effective: 70% lower total cost of ownership vs custom development',
        'Support Included: Comprehensive training and ongoing technical support'
      ];
      
      yPos = 70;
      advantages.forEach(advantage => {
        pdf.setFontSize(11);
        const lines = pdf.splitTextToSize(advantage, pageWidth - 2 * margin - 10);
        pdf.text(`• ${lines[0]}`, margin, yPos);
        if (lines.length > 1) {
          for (let i = 1; i < lines.length; i++) {
            pdf.text(`  ${lines[i]}`, margin + 5, yPos + (i * 6));
          }
        }
        yPos += Math.max(12, lines.length * 6 + 2);
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