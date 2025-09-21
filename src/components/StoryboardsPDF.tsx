import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/button';
import { FileDown, Users, MapPin, Phone, Truck, Shield } from 'lucide-react';

const StoryboardsPDF = () => {
  const generatePDF = async () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Cover page
    pdf.setFontSize(24);
    pdf.setTextColor(0, 102, 204);
    pdf.text('SYSTEM STORYBOARDS & PERSONAS', 20, 30);
    
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text('ConnectNation Address System', 20, 45);
    pdf.text('User Journey Stories for Equatorial Guinea', 20, 55);
    
    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Transforming Address Management Through Digital Innovation', 20, 70);
    
    // Personas Section
    pdf.addPage();
    pdf.setFontSize(20);
    pdf.setTextColor(0, 102, 204);
    pdf.text('USER PERSONAS', 20, 20);
    
    const personas = [
      {
        name: 'María Santos',
        role: 'Rural Citizen',
        age: '35, Mother of 3',
        location: 'Rural Malabo outskirts',
        goals: 'Receive mail, access services, get emergency help',
        frustrations: 'No official address, services can\'t find her home'
      },
      {
        name: 'Officer Carlos Nguema',
        role: 'Police Officer',
        age: '28, Field Officer',
        location: 'Malabo Police Station',
        goals: 'Respond quickly to emergencies, locate incidents accurately',
        frustrations: 'Wastes time searching for locations, delayed responses'
      },
      {
        name: 'Dr. Elena Obiang',
        role: 'Emergency Dispatcher',
        age: '42, Medical Professional',
        location: 'Central Emergency Services',
        goals: 'Dispatch ambulances efficiently, save lives',
        frustrations: 'Can\'t locate patients, delayed medical response'
      },
      {
        name: 'Miguel Ekua',
        role: 'Small Business Owner',
        age: '39, Entrepreneur',
        location: 'Bata Commercial District',
        goals: 'Deliver products, expand customer base',
        frustrations: 'Can\'t deliver to customers without clear addresses'
      },
      {
        name: 'Minister Ana Mba',
        role: 'Government Official',
        age: '45, Planning Ministry',
        location: 'Government Complex',
        goals: 'Improve public services, modernize infrastructure',
        frustrations: 'Difficulty planning services without address data'
      }
    ];
    
    let yPos = 35;
    personas.forEach((persona, index) => {
      if (yPos > 250) {
        pdf.addPage();
        yPos = 20;
      }
      
      pdf.setFontSize(14);
      pdf.setTextColor(0, 102, 204);
      pdf.text(`${persona.name} - ${persona.role}`, 20, yPos);
      
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Age: ${persona.age}`, 20, yPos + 10);
      pdf.text(`Location: ${persona.location}`, 20, yPos + 18);
      pdf.text(`Goals: ${persona.goals}`, 20, yPos + 26);
      pdf.text(`Frustrations: ${persona.frustrations}`, 20, yPos + 34);
      
      yPos += 50;
    });
    
    // Storyboard 1: Citizen Registration
    pdf.addPage();
    pdf.setFontSize(18);
    pdf.setTextColor(0, 102, 204);
    pdf.text('STORYBOARD 1: CITIZEN ADDRESS REGISTRATION', 20, 20);
    
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Persona: María Santos - Rural Citizen', 20, 35);
    
    const story1Scenes = [
      {
        title: 'BEFORE: The Problem',
        description: 'María lives in a rural area without street names. When she needs medical care or wants to receive packages, she must travel to town to meet delivery people at landmarks.'
      },
      {
        title: 'SCENE 1: Discovery',
        description: 'María hears about the new address system from a community meeting. A field agent visits her neighborhood with a tablet.'
      },
      {
        title: 'SCENE 2: Registration',
        description: 'The agent uses GPS to capture María\'s exact location. They assign her home a unique address code: "MAL-RURAL-001-A".'
      },
      {
        title: 'SCENE 3: Verification',
        description: 'María receives an SMS with her new address. She can share this code with anyone who needs to find her home.'
      },
      {
        title: 'AFTER: The Solution',
        description: 'Now María can receive mail delivery, medical visits, and online purchases directly at her home. Emergency services can find her quickly.'
      }
    ];
    
    yPos = 50;
    story1Scenes.forEach((scene) => {
      if (yPos > 240) {
        pdf.addPage();
        yPos = 20;
      }
      
      pdf.setFontSize(11);
      pdf.setTextColor(204, 102, 0);
      pdf.text(scene.title, 20, yPos);
      
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      const lines = pdf.splitTextToSize(scene.description, 170);
      pdf.text(lines, 20, yPos + 8);
      
      yPos += lines.length * 5 + 15;
    });
    
    // Storyboard 2: Emergency Response
    pdf.addPage();
    pdf.setFontSize(18);
    pdf.setTextColor(0, 102, 204);
    pdf.text('STORYBOARD 2: EMERGENCY RESPONSE', 20, 20);
    
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Persona: Dr. Elena Obiang - Emergency Dispatcher', 20, 35);
    
    const story2Scenes = [
      {
        title: 'BEFORE: The Crisis',
        description: 'Emergency calls often include vague directions like "near the big tree" or "behind the market". Response times are long and sometimes rescuers get lost.'
      },
      {
        title: 'SCENE 1: Emergency Call',
        description: 'A caller reports a medical emergency and provides their address code: "MAL-CENTRO-045-B". Dr. Elena immediately knows the exact location.'
      },
      {
        title: 'SCENE 2: Dispatch',
        description: 'She enters the code into the system, which shows GPS coordinates and the fastest route. The ambulance team receives precise navigation.'
      },
      {
        title: 'SCENE 3: Response',
        description: 'The ambulance arrives in record time. The paramedics use the address system to confirm they\'re at the correct location.'
      },
      {
        title: 'AFTER: Life Saved',
        description: 'Response time reduced from 45 minutes to 12 minutes. The patient receives timely medical care and recovers fully.'
      }
    ];
    
    yPos = 50;
    story2Scenes.forEach((scene) => {
      if (yPos > 240) {
        pdf.addPage();
        yPos = 20;
      }
      
      pdf.setFontSize(11);
      pdf.setTextColor(204, 102, 0);
      pdf.text(scene.title, 20, yPos);
      
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      const lines = pdf.splitTextToSize(scene.description, 170);
      pdf.text(lines, 20, yPos + 8);
      
      yPos += lines.length * 5 + 15;
    });
    
    // Storyboard 3: Police Operations
    pdf.addPage();
    pdf.setFontSize(18);
    pdf.setTextColor(0, 102, 204);
    pdf.text('STORYBOARD 3: POLICE OPERATIONS', 20, 20);
    
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Persona: Officer Carlos Nguema - Police Officer', 20, 35);
    
    const story3Scenes = [
      {
        title: 'BEFORE: Inefficient Patrols',
        description: 'Carlos spends hours trying to locate reported incidents. Citizens give confusing directions, leading to delayed responses and missed opportunities to prevent crime.'
      },
      {
        title: 'SCENE 1: Incident Report',
        description: 'A theft is reported at address "BAT-MARKET-078-C". Carlos immediately sees the location on his mobile device with turn-by-turn directions.'
      },
      {
        title: 'SCENE 2: Quick Response',
        description: 'He arrives at the scene within minutes. The standardized address system allows him to coordinate with backup units precisely.'
      },
      {
        title: 'SCENE 3: Investigation',
        description: 'Carlos uses the address database to check incident history in the area and identify patterns of criminal activity.'
      },
      {
        title: 'AFTER: Effective Policing',
        description: 'Crime response time improves dramatically. Carlos can now focus on preventing crime rather than searching for locations.'
      }
    ];
    
    yPos = 50;
    story3Scenes.forEach((scene) => {
      if (yPos > 240) {
        pdf.addPage();
        yPos = 20;
      }
      
      pdf.setFontSize(11);
      pdf.setTextColor(204, 102, 0);
      pdf.text(scene.title, 20, yPos);
      
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      const lines = pdf.splitTextToSize(scene.description, 170);
      pdf.text(lines, 20, yPos + 8);
      
      yPos += lines.length * 5 + 15;
    });
    
    // Storyboard 4: Business Delivery
    pdf.addPage();
    pdf.setFontSize(18);
    pdf.setTextColor(0, 102, 204);
    pdf.text('STORYBOARD 4: BUSINESS DELIVERY TRANSFORMATION', 20, 20);
    
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Persona: Miguel Ekua - Small Business Owner', 20, 35);
    
    const story4Scenes = [
      {
        title: 'BEFORE: Lost Business',
        description: 'Miguel\'s online store loses customers because he can\'t deliver products reliably. Many orders are cancelled due to address confusion.'
      },
      {
        title: 'SCENE 1: Customer Order',
        description: 'A customer places an order and provides their registered address code. Miguel enters it into his delivery app.'
      },
      {
        title: 'SCENE 2: Efficient Planning',
        description: 'The system plots the most efficient delivery route. Miguel can now deliver to 15 customers per day instead of 5.'
      },
      {
        title: 'SCENE 3: Successful Delivery',
        description: 'His delivery driver finds each address quickly using GPS navigation. Customers are delighted with the reliable service.'
      },
      {
        title: 'AFTER: Business Growth',
        description: 'Miguel\'s delivery success rate increases to 98%. His business expands, and he hires more employees to meet growing demand.'
      }
    ];
    
    yPos = 50;
    story4Scenes.forEach((scene) => {
      if (yPos > 240) {
        pdf.addPage();
        yPos = 20;
      }
      
      pdf.setFontSize(11);
      pdf.setTextColor(204, 102, 0);
      pdf.text(scene.title, 20, yPos);
      
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      const lines = pdf.splitTextToSize(scene.description, 170);
      pdf.text(lines, 20, yPos + 8);
      
      yPos += lines.length * 5 + 15;
    });
    
    // Storyboard 5: Government Planning
    pdf.addPage();
    pdf.setFontSize(18);
    pdf.setTextColor(0, 102, 204);
    pdf.text('STORYBOARD 5: GOVERNMENT INFRASTRUCTURE PLANNING', 20, 20);
    
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Persona: Minister Ana Mba - Government Official', 20, 35);
    
    const story5Scenes = [
      {
        title: 'BEFORE: Blind Planning',
        description: 'Ana struggles to plan public services without knowing where citizens actually live. Infrastructure projects often miss the areas of greatest need.'
      },
      {
        title: 'SCENE 1: Data Analysis',
        description: 'Using the address database, Ana analyzes population density maps to identify underserved areas needing schools and clinics.'
      },
      {
        title: 'SCENE 2: Resource Allocation',
        description: 'She can now allocate healthcare resources based on precise population data and geographic distribution patterns.'
      },
      {
        title: 'SCENE 3: Infrastructure Planning',
        description: 'New road construction is planned using actual settlement patterns rather than outdated maps, ensuring maximum community benefit.'
      },
      {
        title: 'AFTER: Effective Governance',
        description: 'Public services reach 85% more citizens. Infrastructure investment becomes more efficient and impactful for community development.'
      }
    ];
    
    yPos = 50;
    story5Scenes.forEach((scene) => {
      if (yPos > 240) {
        pdf.addPage();
        yPos = 20;
      }
      
      pdf.setFontSize(11);
      pdf.setTextColor(204, 102, 0);
      pdf.text(scene.title, 20, yPos);
      
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      const lines = pdf.splitTextToSize(scene.description, 170);
      pdf.text(lines, 20, yPos + 8);
      
      yPos += lines.length * 5 + 15;
    });
    
    // System Features Overview
    pdf.addPage();
    pdf.setFontSize(18);
    pdf.setTextColor(0, 102, 204);
    pdf.text('SYSTEM CAPABILITIES DEMONSTRATED', 20, 20);
    
    const features = [
      'GPS-based precise location registration',
      'Unique address code generation (e.g., MAL-CENTRO-045-B)',
      'Mobile-first citizen interface',
      'Real-time emergency dispatch integration',
      'Business delivery optimization',
      'Government analytics and planning tools',
      'Multi-language support (Spanish, French, Portuguese)',
      'Offline capability for rural areas',
      'QR code address sharing',
      'Integration with existing government systems'
    ];
    
    yPos = 40;
    features.forEach((feature) => {
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`• ${feature}`, 25, yPos);
      yPos += 8;
    });
    
    // Impact Summary
    pdf.addPage();
    pdf.setFontSize(18);
    pdf.setTextColor(0, 102, 204);
    pdf.text('EXPECTED IMPACT ACROSS USER GROUPS', 20, 20);
    
    const impacts = [
      {
        group: 'Citizens',
        benefits: [
          'Access to postal services and deliveries',
          'Faster emergency response times',
          'Increased access to government services',
          'Enhanced property rights and documentation'
        ]
      },
      {
        group: 'Government',
        benefits: [
          'Improved service delivery efficiency',
          'Better resource allocation and planning',
          'Enhanced emergency response coordination',
          'Increased revenue through better tax collection'
        ]
      },
      {
        group: 'Businesses',
        benefits: [
          'Reliable delivery and logistics',
          'Expanded customer reach',
          'Improved market analysis capabilities',
          'Enhanced customer satisfaction'
        ]
      },
      {
        group: 'Emergency Services',
        benefits: [
          'Reduced response times',
          'Improved coordination between units',
          'Better incident tracking and analysis',
          'Enhanced public safety outcomes'
        ]
      }
    ];
    
    yPos = 40;
    impacts.forEach((impact) => {
      if (yPos > 230) {
        pdf.addPage();
        yPos = 20;
      }
      
      pdf.setFontSize(14);
      pdf.setTextColor(0, 102, 204);
      pdf.text(impact.group, 20, yPos);
      
      yPos += 10;
      impact.benefits.forEach((benefit) => {
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        pdf.text(`• ${benefit}`, 25, yPos);
        yPos += 6;
      });
      yPos += 5;
    });
    
    pdf.save('System_Storyboards_and_Personas.pdf');
  };

  return (
    <Button 
      onClick={generatePDF}
      className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
    >
      <FileDown className="h-4 w-4" />
      Download Storyboards & Personas PDF
    </Button>
  );
};

export default StoryboardsPDF;