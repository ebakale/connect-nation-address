import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Presentation } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PptxGenJS from 'pptxgenjs';

// Import the same images used in the main page
import heroImage from '@/assets/hero-address-system.jpg';
import featureSearch from '@/assets/feature-address-search.jpg';
import featureRegistration from '@/assets/feature-address-registration.jpg';
import featureEmergencyManagement from '@/assets/feature-emergency-management.jpg';

const FunctionalitiesObjectivesPDF: React.FC = () => {
  const { t, i18n } = useTranslation(['common', 'address', 'emergency']);

  const generatePowerPoint = async () => {
    try {
      const pptx = new PptxGenJS();
      
      // Configure presentation properties
      pptx.author = 'ConnectNation Address System';
      pptx.company = 'Guinea Ecuatorial';
      pptx.subject = 'Funcionalidades y Objetivos del Sistema';
      pptx.title = 'ConnectNation - Funcionalidades y Objetivos';

      // Slide 1: Title slide with hero image
      const slide1 = pptx.addSlide();
      
      // Add hero image as background
      slide1.addImage({
        path: heroImage,
        x: 0, y: 0, w: '100%', h: '100%'
      });
      
      // Add dark overlay rectangle
      slide1.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: '100%', h: '100%',
        fill: { color: '000000', transparency: 40 },
        line: { type: 'none' }
      });
      
      slide1.addText('ConnectNation', {
        x: 1, y: 2, w: 8, h: 1.5,
        fontSize: 48, bold: true, color: 'ffffff',
        align: 'center', shadow: { type: 'outer', blur: 3, offset: 2, angle: 45, color: '000000' }
      });
      
      slide1.addText('Plataforma Digital', {
        x: 1, y: 3.2, w: 8, h: 1,
        fontSize: 32, color: 'ffffff',
        align: 'center', shadow: { type: 'outer', blur: 2, offset: 1, angle: 45, color: '000000' }
      });
      
      slide1.addText('Funcionalidades Principales y Objetivos de la Plataforma', {
        x: 1, y: 4.5, w: 8, h: 1,
        fontSize: 20, color: 'e5e7eb',
        align: 'center'
      });

      slide1.addText('Sistema de Direcciones Digitales para Guinea Ecuatorial', {
        x: 1, y: 5.5, w: 8, h: 0.8,
        fontSize: 16, color: 'e5e7eb',
        align: 'center', italic: true
      });

      // Slide 2: Core Functionalities Overview
      const slide2 = pptx.addSlide();
      slide2.background = { fill: 'ffffff' };
      
      slide2.addText('Funcionalidades Principales', {
        x: 0.5, y: 0.5, w: 9, h: 1,
        fontSize: 36, bold: true, color: '1e40af',
        align: 'center'
      });

      slide2.addText('Plataforma de Doble Núcleo', {
        x: 0.5, y: 1.5, w: 9, h: 0.6,
        fontSize: 20, bold: true, color: '374151'
      });

      slide2.addText('Dos sistemas integrados trabajando juntos para brindar soluciones integrales', {
        x: 0.5, y: 2.1, w: 9, h: 0.5,
        fontSize: 16, color: '6b7280'
      });

      // Address Registry System details with image
      slide2.addImage({
        path: featureSearch,
        x: 0.5, y: 3, w: 4, h: 2.5,
        rounding: true
      });

      // Add overlay for text readability
      slide2.addShape(pptx.ShapeType.rect, {
        x: 0.5, y: 4.8, w: 4, h: 0.7,
        fill: { color: '1e40af', transparency: 10 },
        line: { type: 'none' }
      });

      slide2.addText('1. Sistema de Registro de Direcciones', {
        x: 0.5, y: 4.9, w: 4, h: 0.5,
        fontSize: 16, bold: true, color: 'ffffff'
      });

      const addressFeatures = [
        '• Registro basado en GPS',
        '• Verificación multinivel', 
        '• Búsqueda y descubrimiento inteligente',
        '• Documentación digital con códigos QR'
      ];

      addressFeatures.forEach((feature, index) => {
        slide2.addText(feature, {
          x: 0.5, y: 5.8 + (index * 0.3), w: 4, h: 0.25,
          fontSize: 12, color: '374151'
        });
      });

      // Emergency Management System details with image  
      slide2.addImage({
        path: featureEmergencyManagement,
        x: 5, y: 3, w: 4, h: 2.5,
        rounding: true
      });

      // Add overlay for text readability
      slide2.addShape(pptx.ShapeType.rect, {
        x: 5, y: 4.8, w: 4, h: 0.7,
        fill: { color: 'dc2626', transparency: 10 },
        line: { type: 'none' }
      });

      slide2.addText('2. Sistema de Gestión de Emergencias', {
        x: 5, y: 4.9, w: 4, h: 0.5,
        fontSize: 16, bold: true, color: 'ffffff'
      });

      const emergencyFeatures = [
        '• Reporte de incidentes en tiempo real',
        '• Despacho de unidades basado en GPS',
        '• Comunicaciones multicanal',
        '• Análisis y seguimiento de respuesta'
      ];

      emergencyFeatures.forEach((feature, index) => {
        slide2.addText(feature, {
          x: 5, y: 5.8 + (index * 0.3), w: 4, h: 0.25,
          fontSize: 12, color: '374151'
        });
      });

      // Slide 3: Platform Objectives
      const slide3 = pptx.addSlide();
      slide3.background = { fill: 'ffffff' };
      
      slide3.addText('Objetivos de la Plataforma', {
        x: 0.5, y: 0.5, w: 9, h: 1,
        fontSize: 36, bold: true, color: '1e40af',
        align: 'center'
      });

      slide3.addText('Objetivos Estratégicos', {
        x: 0.5, y: 1.5, w: 9, h: 0.6,
        fontSize: 20, bold: true, color: '374151'
      });

      slide3.addText('Transformando Guinea Ecuatorial a través de la innovación digital', {
        x: 0.5, y: 2.1, w: 9, h: 0.5,
        fontSize: 16, color: '6b7280'
      });

      // First row of objectives
      slide3.addText('1. Infraestructura Digital', {
        x: 0.5, y: 3, w: 4.5, h: 0.5,
        fontSize: 16, bold: true, color: '1e40af'
      });
      slide3.addText('Establecer un sistema integral de direccionamiento digital que cubra todo el territorio nacional.', {
        x: 0.5, y: 3.5, w: 4.5, h: 0.8,
        fontSize: 12, color: '374151'
      });

      slide3.addText('2. Mejora de la Seguridad Pública', {
        x: 5, y: 3, w: 4.5, h: 0.5,
        fontSize: 16, bold: true, color: 'dc2626'
      });
      slide3.addText('Modernizar la respuesta de emergencia y mejorar la coordinación entre servicios policiales.', {
        x: 5, y: 3.5, w: 4.5, h: 0.8,
        fontSize: 12, color: '374151'
      });

      // Second row of objectives
      slide3.addText('3. Empoderamiento Ciudadano', {
        x: 0.5, y: 4.8, w: 4.5, h: 0.5,
        fontSize: 16, bold: true, color: '059669'
      });
      slide3.addText('Proporcionar acceso directo a servicios gubernamentales y mejorar la participación ciudadana.', {
        x: 0.5, y: 5.3, w: 4.5, h: 0.8,
        fontSize: 12, color: '374151'
      });

      slide3.addText('4. Planificación Urbana Inteligente', {
        x: 5, y: 4.8, w: 4.5, h: 0.5,
        fontSize: 16, bold: true, color: 'dc2626'
      });
      slide3.addText('Habilitar la toma de decisiones basada en datos para el desarrollo urbano sostenible.', {
        x: 5, y: 5.3, w: 4.5, h: 0.8,
        fontSize: 12, color: '374151'
      });

      // Slide 4: Key Features with Visual Design
      const slide4 = pptx.addSlide();
      slide4.background = { fill: 'f8fafc' };
      
      slide4.addText('Características Clave del Sistema', {
        x: 0.5, y: 0.5, w: 9, h: 1,
        fontSize: 32, bold: true, color: '1e40af',
        align: 'center'
      });

      // Create visual cards for features
      const keyFeatures = [
        {
          title: 'Control de Acceso Basado en Roles',
          description: 'Gestión avanzada de roles para permisos seguros y granulares',
          color: '1e40af',
          icon: '👥'
        },
        {
          title: 'Documentación Digital', 
          description: 'Generación automatizada de documentos con códigos QR',
          color: '059669',
          icon: '📄'
        },
        {
          title: 'Analíticas en Tiempo Real',
          description: 'Reportes comprensivos e insights operacionales',
          color: 'dc2626',
          icon: '📊'
        },
        {
          title: 'Soporte Multiidioma',
          description: 'Interfaz disponible en español, francés e inglés',
          color: '7c3aed',
          icon: '🌐'
        }
      ];

      keyFeatures.forEach((feature, index) => {
        const row = Math.floor(index / 2);
        const col = index % 2;
        const x = 0.5 + (col * 4.5);
        const y = 2 + (row * 2.8);

        // Feature card background
        slide4.addShape(pptx.ShapeType.rect, {
          x: x, y: y, w: 4, h: 2.5,
          fill: { color: 'ffffff' },
          line: { color: feature.color, width: 2 }
        });

        // Feature icon
        slide4.addText(feature.icon, {
          x: x + 0.2, y: y + 0.2, w: 0.8, h: 0.8,
          fontSize: 24, align: 'center'
        });

        // Feature title
        slide4.addText(feature.title, {
          x: x + 0.2, y: y + 1, w: 3.6, h: 0.6,
          fontSize: 14, bold: true, color: feature.color
        });

        // Feature description
        slide4.addText(feature.description, {
          x: x + 0.2, y: y + 1.6, w: 3.6, h: 0.8,
          fontSize: 11, color: '374151'
        });
      });

      // Slide 5: Benefits with Visual Infographics
      const slide5 = pptx.addSlide();
      slide5.background = { fill: 'f8fafc' };
      
      slide5.addText('Beneficios e Impacto Esperado', {
        x: 0.5, y: 0.5, w: 9, h: 1,
        fontSize: 32, bold: true, color: '1e40af',
        align: 'center'
      });

      // Create visual statistics
      const statistics = [
        { label: 'Reducción en tiempo de respuesta', value: '60%', color: 'dc2626' },
        { label: 'Mejora en precisión de ubicación', value: '85%', color: '059669' },
        { label: 'Eficiencia operacional', value: '75%', color: '1e40af' },
        { label: 'Satisfacción ciudadana', value: '90%', color: '7c3aed' }
      ];

      statistics.forEach((stat, index) => {
        const x = 0.5 + (index * 2.25);
        const y = 2;

        // Circular progress background
        slide5.addShape(pptx.ShapeType.ellipse, {
          x: x + 0.5, y: y, w: 1.2, h: 1.2,
          fill: { color: stat.color, transparency: 20 },
          line: { color: stat.color, width: 3 }
        });

        // Statistic value
        slide5.addText(stat.value, {
          x: x + 0.5, y: y + 0.4, w: 1.2, h: 0.4,
          fontSize: 20, bold: true, color: stat.color,
          align: 'center'
        });

        // Statistic label
        slide5.addText(stat.label, {
          x: x, y: y + 1.5, w: 2.2, h: 0.8,
          fontSize: 10, color: '374151',
          align: 'center'
        });
      });

      // Add benefits list
      const benefits = [
        'Reducción significativa en tiempos de respuesta de emergencias',
        'Mejora en la precisión de localización de servicios',
        'Mayor eficiencia en operaciones policiales y de seguridad',
        'Facilitación del desarrollo urbano planificado',
        'Mejora en la calidad de vida de los ciudadanos',
        'Fortalecimiento de la infraestructura digital nacional'
      ];

      slide5.addText('Impactos Clave:', {
        x: 1, y: 4.2, w: 8, h: 0.5,
        fontSize: 16, bold: true, color: '1e40af'
      });

      benefits.forEach((benefit, index) => {
        slide5.addText(`✓ ${benefit}`, {
          x: 1, y: 4.8 + (index * 0.4), w: 8, h: 0.35,
          fontSize: 12, color: '374151'
        });
      });

      // Final slide: Contact and Next Steps with registration image
      const slide6 = pptx.addSlide();
      
      // Add registration feature image
      slide6.addImage({
        path: featureRegistration,
        x: 0, y: 0, w: '100%', h: '100%'
      });
      
      // Add dark overlay for text readability
      slide6.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: '100%', h: '100%',
        fill: { color: '1e40af', transparency: 60 },
        line: { type: 'none' }
      });
      
      slide6.addText('Próximos Pasos', {
        x: 1, y: 2, w: 8, h: 1,
        fontSize: 36, bold: true, color: 'ffffff',
        align: 'center', shadow: { type: 'outer', blur: 2, offset: 1, angle: 45, color: '000000' }
      });

      slide6.addText('ConnectNation está listo para transformar\nla gestión de direcciones y emergencias\nen Guinea Ecuatorial', {
        x: 1, y: 3.5, w: 8, h: 1.5,
        fontSize: 20, color: 'ffffff',
        align: 'center', shadow: { type: 'outer', blur: 1, offset: 1, angle: 45, color: '000000' }
      });

      slide6.addText('Para más información, contacte con el equipo de desarrollo', {
        x: 1, y: 5.5, w: 8, h: 0.8,
        fontSize: 16, color: 'e5e7eb',
        align: 'center'
      });

      // Generate and download the PowerPoint
      const fileName = `ConnectNation-Funcionalidades-Objetivos-${new Date().toISOString().split('T')[0]}.pptx`;
      await pptx.writeFile({ fileName });
      
      console.log('PowerPoint generado exitosamente');
    } catch (error) {
      console.error('Error generating PowerPoint:', error);
    }
  };

  return (
    <div className="w-full">
      <Button 
        onClick={generatePowerPoint}
        className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-lg"
        size="lg"
      >
        <Presentation className="h-5 w-5 mr-2" />
        <div className="flex flex-col items-start">
          <span className="font-semibold">Generar Presentación PowerPoint</span>
          <span className="text-xs text-white/80">Funcionalidades y Objetivos</span>
        </div>
        <Download className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
};

export default FunctionalitiesObjectivesPDF;