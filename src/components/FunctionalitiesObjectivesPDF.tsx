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
      pptx.author = 'ConnectEG Platform';
      pptx.company = 'Guinea Ecuatorial';
      pptx.subject = 'Funcionalidades y Objetivos del Sistema ConnectEG';
      pptx.title = 'ConnectEG - Plataforma Digital de Guinea Ecuatorial';

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
      
      slide1.addText('ConnectEG', {
        x: 1, y: 2, w: 8, h: 1.5,
        fontSize: 48, bold: true, color: 'ffffff',
        align: 'center', shadow: { type: 'outer', blur: 3, offset: 2, angle: 45, color: '000000' }
      });
      
      slide1.addText('Plataforma Digital de Guinea Ecuatorial', {
        x: 1, y: 3.2, w: 8, h: 1,
        fontSize: 28, color: 'ffffff',
        align: 'center', shadow: { type: 'outer', blur: 2, offset: 1, angle: 45, color: '000000' }
      });
      
      slide1.addText('Funcionalidades Principales y Objetivos de la Plataforma', {
        x: 1, y: 4.5, w: 8, h: 1,
        fontSize: 20, color: 'e5e7eb',
        align: 'center'
      });

      slide1.addText('Conectando ciudadanos con servicios mediante tecnología innovadora', {
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
        '• Registro basado en GPS con geocodificación precisa',
        '• Verificación multinivel (NAR, CAR, autorización final)', 
        '• Búsqueda inteligente con filtros avanzados',
        '• Códigos UAC únicos con documentación QR',
        '• Gestión de múltiples direcciones por ciudadano'
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
        '• Alertas de emergencia en tiempo real',
        '• Despacho automatizado de unidades policiales',
        '• Comunicaciones integradas con chat y notificaciones',
        '• Seguimiento de respuesta y análisis de tiempos',
        '• Integración completa con el sistema de direcciones'
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
          title: 'Sistema de Roles Multinivel',
          description: 'Ciudadanos, Agentes de Campo, Verificadores, Registradores, Operadores de Emergencia',
          color: '1e40af',
          icon: '👥'
        },
        {
          title: 'Documentación Digital Avanzada', 
          description: 'Códigos UAC únicos, QR para verificación, documentos PDF generados automáticamente',
          color: '059669',
          icon: '📄'
        },
        {
          title: 'Analíticas y Dashboards',
          description: 'Métricas en tiempo real, reportes de cobertura, análisis de rendimiento operacional',
          color: 'dc2626',
          icon: '📊'
        },
        {
          title: 'Plataforma Multiidioma',
          description: 'Completamente localizada en español, francés e inglés con detección automática',
          color: '7c3aed',
          icon: '🌐'
        },
        {
          title: 'Integración de Emergencias',
          description: 'Sistema unificado que conecta direcciones con respuesta de emergencia',
          color: 'dc2626',
          icon: '🚨'
        },
        {
          title: 'Capacidades Offline',
          description: 'Funcionalidad completa sin conexión para agentes de campo en áreas remotas',
          color: '059669',
          icon: '📱'
        }
      ];

      keyFeatures.forEach((feature, index) => {
        const row = Math.floor(index / 3);
        const col = index % 3;
        const x = 0.5 + (col * 3);
        const y = 2 + (row * 2.2);

        // Feature card background
        slide4.addShape(pptx.ShapeType.rect, {
          x: x, y: y, w: 2.8, h: 2,
          fill: { color: 'ffffff' },
          line: { color: feature.color, width: 2 }
        });

        // Feature icon
        slide4.addText(feature.icon, {
          x: x + 0.1, y: y + 0.1, w: 0.6, h: 0.6,
          fontSize: 20, align: 'center'
        });

        // Feature title
        slide4.addText(feature.title, {
          x: x + 0.1, y: y + 0.7, w: 2.6, h: 0.5,
          fontSize: 12, bold: true, color: feature.color
        });

        // Feature description
        slide4.addText(feature.description, {
          x: x + 0.1, y: y + 1.2, w: 2.6, h: 0.7,
          fontSize: 9, color: '374151'
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
        { label: 'Reducción en tiempo de respuesta de emergencias', value: '65%', color: 'dc2626' },
        { label: 'Mejora en precisión de geolocalización', value: '90%', color: '059669' },
        { label: 'Aumento en eficiencia de verificación', value: '80%', color: '1e40af' },
        { label: 'Cobertura territorial esperada', value: '95%', color: '7c3aed' }
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
        'Transformación digital completa del sistema de direccionamiento nacional',
        'Modernización integral de los servicios de emergencia y seguridad pública',
        'Empoderamiento ciudadano con acceso directo a servicios gubernamentales',
        'Facilitación de la planificación urbana inteligente basada en datos',
        'Establecimiento de infraestructura digital robusta y escalable',
        'Mejora sustancial en tiempos de respuesta y calidad de servicios públicos'
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

      slide6.addText('ConnectEG está listo para transformar\nla infraestructura digital de Guinea Ecuatorial\nconectando ciudadanos con servicios esenciales', {
        x: 1, y: 3.2, w: 8, h: 1.8,
        fontSize: 18, color: 'ffffff',
        align: 'center', shadow: { type: 'outer', blur: 1, offset: 1, angle: 45, color: '000000' }
      });

      slide6.addText('Para más información, contacte con el equipo de desarrollo', {
        x: 1, y: 5.5, w: 8, h: 0.8,
        fontSize: 16, color: 'e5e7eb',
        align: 'center'
      });

      // Generate and download the PowerPoint
      const fileName = `ConnectEG-Funcionalidades-Objetivos-${new Date().toISOString().split('T')[0]}.pptx`;
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