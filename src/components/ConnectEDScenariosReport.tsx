import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Users, MapPin, Shield } from 'lucide-react';
import jsPDF from 'jspdf';

const ConnectEDScenariosReport = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      const doc = new jsPDF();
      let yPosition = 20;
      
      // Configure fonts and colors
      const primaryColor = [41, 128, 185]; // Blue
      const secondaryColor = [39, 174, 96]; // Green
      const accentColor = [231, 76, 60]; // Red
      const textColor = [52, 73, 94]; // Dark gray
      
      // Helper function to add text with automatic page breaks
      const addText = (text: string, x: number, y: number, options: any = {}) => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.setFont(options.font || 'helvetica', options.style || 'normal');
        doc.setFontSize(options.size || 10);
        doc.setTextColor(options.color?.[0] || textColor[0], options.color?.[1] || textColor[1], options.color?.[2] || textColor[2]);
        doc.text(text, x, y);
        return y + (options.lineHeight || 6);
      };

      // Helper function to add section headers
      const addSectionHeader = (title: string, y: number, color = primaryColor) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.setFillColor(color[0], color[1], color[2]);
        doc.rect(10, y - 5, 190, 12, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text(title, 15, y + 3);
        return y + 20;
      };

      // Helper function to add persona cards
      const addPersonaCard = (persona: any, y: number) => {
        if (y > 250) {
          doc.addPage();
          y = 20;
        }
        
        // Card background
        doc.setFillColor(248, 249, 250);
        doc.rect(15, y - 5, 180, 45, 'F');
        doc.setDrawColor(229, 231, 235);
        doc.rect(15, y - 5, 180, 45, 'S');
        
        // Name and role
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(persona.name, 20, y + 5);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(persona.role, 20, y + 12);
        
        // Details
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.setFontSize(9);
        doc.text(`Edad: ${persona.age} años`, 20, y + 20);
        doc.text(`Ubicación: ${persona.location}`, 20, y + 27);
        doc.text(`Objetivo: ${persona.objective}`, 20, y + 34);
        
        return y + 55;
      };

      // Helper function to add scenario
      const addScenario = (scenario: any, y: number) => {
        if (y > 220) {
          doc.addPage();
          y = 20;
        }
        
        // Scenario title
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        y = addText(scenario.title, 15, y, { color: secondaryColor, font: 'helvetica', style: 'bold', size: 11, lineHeight: 8 });
        
        // Challenge
        doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        y = addText('Desafío:', 15, y, { color: accentColor, font: 'helvetica', style: 'bold', size: 9, lineHeight: 7 });
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.setFont('helvetica', 'normal');
        const challengeLines = doc.splitTextToSize(scenario.challenge, 175);
        challengeLines.forEach((line: string) => {
          y = addText(line, 15, y, { size: 9, lineHeight: 5 });
        });
        
        y += 3;
        
        // Solution
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        y = addText('Solución ConnectED:', 15, y, { color: secondaryColor, font: 'helvetica', style: 'bold', size: 9, lineHeight: 7 });
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.setFont('helvetica', 'normal');
        const solutionLines = doc.splitTextToSize(scenario.solution, 175);
        solutionLines.forEach((line: string) => {
          y = addText(line, 15, y, { size: 9, lineHeight: 5 });
        });
        
        y += 3;
        
        // Impact
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        y = addText('Impacto:', 15, y, { color: primaryColor, font: 'helvetica', style: 'bold', size: 9, lineHeight: 7 });
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.setFont('helvetica', 'normal');
        const impactLines = doc.splitTextToSize(scenario.impact, 175);
        impactLines.forEach((line: string) => {
          y = addText(line, 15, y, { size: 9, lineHeight: 5 });
        });
        
        return y + 10;
      };

      // Document title
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 30, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('ConnectED Platform', 105, 15, { align: 'center' });
      doc.setFontSize(14);
      doc.text('Escenarios de Impacto y Casos de Uso', 105, 23, { align: 'center' });
      
      yPosition = 50;

      // Introduction
      yPosition = addSectionHeader('Introducción Ejecutiva', yPosition, primaryColor);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const introText = 'ConnectED Platform es una solución integral que revoluciona la gestión de direcciones y operaciones policiales en Guinea Ecuatorial. A través de dos módulos integrados - Registro de Direcciones y Gestión de Emergencias - la plataforma transforma la prestación de servicios públicos, facilita el comercio electrónico y mejora significativamente la respuesta a emergencias.';
      const introLines = doc.splitTextToSize(introText, 180);
      introLines.forEach((line: string) => {
        yPosition = addText(line, 15, yPosition, { lineHeight: 5 });
      });
      yPosition += 10;

      // Personas
      yPosition = addSectionHeader('Personas Principales', yPosition, secondaryColor);
      
      const personas = [
        {
          name: 'María Nsue Okomo',
          role: 'Empresaria de E-commerce',
          age: 34,
          location: 'Malabo, Bioko Norte',
          objective: 'Expandir su negocio de venta online con entregas precisas'
        },
        {
          name: 'Carlos Mbomio Nguema',
          role: 'Oficial de Policía',
          age: 28,
          location: 'Bata, Litoral',
          objective: 'Responder eficientemente a emergencias y coordinar patrullas'
        },
        {
          name: 'Dr. Ana Bolekia Ramos',
          role: 'Directora de Servicios de Emergencia',
          age: 45,
          location: 'Malabo, Bioko Norte',
          objective: 'Coordinar respuestas médicas de emergencia rápidas y efectivas'
        },
        {
          name: 'Tomás Oyono Ayingono',
          role: 'Registrador de Direcciones',
          age: 39,
          location: 'Ebibeyin, Kié-Ntem',
          objective: 'Verificar y publicar direcciones oficiales con precisión'
        }
      ];

      personas.forEach(persona => {
        yPosition = addPersonaCard(persona, yPosition);
      });

      // Scenarios for Citizens/Business
      yPosition = addSectionHeader('Escenarios para Ciudadanos y Empresarios', yPosition, secondaryColor);
      
      const citizenScenarios = [
        {
          title: 'E-commerce en Crecimiento - Historia de María',
          challenge: 'María tiene un negocio online de productos artesanales pero pierde el 30% de sus entregas debido a direcciones incorrectas o inexistentes. Sus clientes se frustran cuando los repartidores no pueden encontrar sus ubicaciones, especialmente en barrios nuevos de Malabo.',
          solution: 'Con ConnectED, María puede verificar las direcciones de sus clientes antes del envío usando el sistema de búsqueda inteligente. Los nuevos clientes pueden registrar sus direcciones con coordenadas GPS precisas. Su tasa de entrega exitosa aumenta al 95%, y puede ofrecer seguimiento en tiempo real.',
          impact: 'Incremento del 40% en ventas, reducción del 70% en costos de reenvío, mejora significativa en satisfacción del cliente y expansión a zonas rurales previamente inaccesibles.'
        },
        {
          title: 'Servicios Públicos Eficientes - Caso de Distribución Eléctrica',
          challenge: 'La empresa eléctrica nacional tiene dificultades para localizar medidores y responder a averías. Muchas zonas residenciales carecen de direcciones claras, causando retrasos de hasta 3 días en reparaciones urgentes.',
          solution: 'Utilizando la API de ConnectED, la empresa integra el sistema de direcciones con su plataforma de gestión. Cada medidor se vincula a una dirección verificada con código UAC único. Los técnicos reciben rutas optimizadas y coordenadas exactas.',
          impact: 'Reducción del 60% en tiempo de respuesta a averías, mejora del 80% en precisión de facturación, y capacidad de planificar expansiones de red basadas en datos geográficos precisos.'
        }
      ];

      citizenScenarios.forEach(scenario => {
        yPosition = addScenario(scenario, yPosition);
      });

      // Emergency Services Scenarios
      yPosition = addSectionHeader('Escenarios de Servicios de Emergencia', yPosition, accentColor);
      
      const emergencyScenarios = [
        {
          title: 'Respuesta Médica de Emergencia - Dr. Ana Bolekia',
          challenge: 'Una emergencia médica se reporta en un barrio sin direcciones claras de Malabo. La ambulancia da vueltas durante 15 minutos buscando la ubicación mientras el tiempo crítico se agota. La comunicación entre dispatch y unidades médicas es fragmentada.',
          solution: 'ConnectED procesa automáticamente la llamada de emergencia y proporciona coordenadas exactas del incidente. El sistema dispatcha la ambulancia más cercana con navegación GPS precisa y establece comunicación directa entre médicos de campo y hospital.',
          impact: 'Reducción del 65% en tiempo de respuesta promedio (de 18 a 6 minutos), aumento del 30% en tasa de supervivencia en emergencias críticas, y coordinación perfecta entre servicios médicos y policiales.'
        },
        {
          title: 'Operativo Policial Coordinado - Oficial Carlos Mbomio',
          challenge: 'Se reporta un incidente de seguridad que requiere múltiples unidades policiales. La coordinación manual entre patrullas causa confusión sobre ubicaciones exactas y disponibilidad de unidades, retrasando la respuesta efectiva.',
          solution: 'El módulo policial de ConnectED muestra en tiempo real la ubicación de todas las unidades, analiza automáticamente la proximidad al incidente, y coordina el deployment óptimo. El oficial Carlos recibe instrucciones precisas y puede solicitar backup con un click.',
          impact: 'Mejora del 75% en tiempo de coordinación entre unidades, reducción del 50% en costos operativos, y aumento significativo en efectividad de operativos multi-unidad.'
        }
      ];

      emergencyScenarios.forEach(scenario => {
        yPosition = addScenario(scenario, yPosition);
      });

      // Government Scenarios
      yPosition = addSectionHeader('Escenarios para Agencias Gubernamentales', yPosition, primaryColor);
      
      const governmentScenarios = [
        {
          title: 'Planificación Urbana Inteligente - Ministerio de Infraestructura',
          challenge: 'El gobierno necesita planificar nuevas escuelas y centros de salud pero carece de datos precisos sobre densidad poblacional y ubicaciones exactas en zonas en desarrollo. Las decisiones se basan en estimaciones inexactas.',
          solution: 'ConnectED proporciona análisis detallado de distribución poblacional basado en direcciones verificadas. Los planificadores acceden a mapas de calor que muestran densidad real, distancias a servicios existentes, y zonas de crecimiento.',
          impact: 'Optimización del 40% en ubicación de nuevos servicios públicos, reducción del 30% en costos de infraestructura innecesaria, y mejora significativa en acceso equitativo a servicios para todos los ciudadanos.'
        },
        {
          title: 'Censo Nacional Digital - Instituto Nacional de Estadística',
          challenge: 'La realización del censo nacional requiere enormes recursos para localizar cada hogar. Muchas zonas rurales y periurbanas son difíciles de mapear, causando sub-registro poblacional del 15-20%.',
          solution: 'El sistema de direcciones de ConnectED sirve como base para el censo digital. Cada dirección verificada incluye coordenadas exactas y fotografías de referencia. Los censistas reciben rutas optimizadas y pueden actualizar información en tiempo real.',
          impact: 'Aumento del 95% en cobertura censal, reducción del 60% en costos operativos del censo, y datos poblacionales precisos que mejoran la asignación de recursos y planificación de políticas públicas.'
        }
      ];

      governmentScenarios.forEach(scenario => {
        yPosition = addScenario(scenario, yPosition);
      });

      // Benefits Summary
      yPosition = addSectionHeader('Resumen de Beneficios por Sector', yPosition, primaryColor);
      
      const benefits = [
        '• Ciudadanos: Acceso mejorado a servicios, entregas confiables, respuesta rápida a emergencias',
        '• Empresas: Expansión de e-commerce, reducción de costos logísticos, nuevas oportunidades de mercado',
        '• Gobierno: Planificación basada en datos, servicios públicos eficientes, ahorro en recursos',
        '• Emergencias: Respuesta más rápida, coordinación mejorada, mayor tasa de supervivencia',
        '• Economía Nacional: Facilitación del comercio digital, atracción de inversión, modernización de infraestructura'
      ];

      benefits.forEach(benefit => {
        yPosition = addText(benefit, 15, yPosition, { lineHeight: 6 });
      });

      // Conclusion
      yPosition += 10;
      yPosition = addSectionHeader('Conclusión', yPosition, secondaryColor);
      const conclusionText = 'ConnectED Platform representa una transformación fundamental en la prestación de servicios públicos y privados en Guinea Ecuatorial. A través de casos de uso reales y personas representativas, hemos demostrado cómo la plataforma genera valor tangible para todos los sectores de la sociedad. La implementación de ConnectED no solo moderniza la infraestructura digital del país, sino que establece las bases para un crecimiento económico sostenible y una mejor calidad de vida para todos los ciudadanos.';
      const conclusionLines = doc.splitTextToSize(conclusionText, 180);
      conclusionLines.forEach((line: string) => {
        yPosition = addText(line, 15, yPosition, { lineHeight: 5 });
      });

      // Footer
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(8);
        doc.text(`ConnectED Platform - Escenarios de Impacto | Página ${i} de ${pageCount}`, 105, 290, { align: 'center' });
        doc.text(`Generado el ${new Date().toLocaleDateString('es-ES')}`, 105, 295, { align: 'center' });
      }

      // Save the PDF
      doc.save('ConnectED-Platform-Escenarios-de-Impacto.pdf');
      
    } catch (error) {
      console.error('Error generando PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl">
          <FileText className="h-8 w-8 text-primary" />
          Generador de Escenarios ConnectED
        </CardTitle>
        <p className="text-muted-foreground text-lg">
          Crea un documento PDF completo con escenarios realistas y personas que demuestran 
          el impacto de ConnectED Platform en diferentes sectores de la sociedad.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <div className="font-semibold text-blue-900">Ciudadanos</div>
              <div className="text-sm text-blue-700">E-commerce y servicios</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <MapPin className="h-8 w-8 text-green-600" />
            <div>
              <div className="font-semibold text-green-900">Empresas</div>
              <div className="text-sm text-green-700">Logística y entregas</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <FileText className="h-8 w-8 text-purple-600" />
            <div>
              <div className="font-semibold text-purple-900">Gobierno</div>
              <div className="text-sm text-purple-700">Planificación urbana</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg">
            <Shield className="h-8 w-8 text-red-600" />
            <div>
              <div className="font-semibold text-red-900">Emergencias</div>
              <div className="text-sm text-red-700">Respuesta rápida</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Contenido del Documento</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <Badge variant="outline" className="mb-2">Personas Incluidas</Badge>
              <ul className="space-y-1 text-muted-foreground">
                <li>• María Nsue - Empresaria E-commerce</li>
                <li>• Carlos Mbomio - Oficial de Policía</li>
                <li>• Dr. Ana Bolekia - Directora de Emergencias</li>
                <li>• Tomás Oyono - Registrador de Direcciones</li>
              </ul>
            </div>
            <div>
              <Badge variant="outline" className="mb-2">Escenarios Cubiertos</Badge>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Expansión de e-commerce</li>
                <li>• Respuesta a emergencias médicas</li>
                <li>• Coordinación policial</li>
                <li>• Planificación urbana inteligente</li>
                <li>• Censo nacional digital</li>
              </ul>
            </div>
          </div>
        </div>

        <Button 
          onClick={generatePDF}
          disabled={isGenerating}
          className="w-full py-6 text-lg"
          size="lg"
        >
          <Download className="h-5 w-5 mr-2" />
          {isGenerating ? 'Generando PDF...' : 'Descargar Documento de Escenarios'}
        </Button>
        
        <p className="text-center text-sm text-muted-foreground">
          El documento incluye personas detalladas, escenarios realistas con desafíos específicos, 
          soluciones implementadas y métricas de impacto cuantificables para cada sector.
        </p>
      </CardContent>
    </Card>
  );
};

export default ConnectEDScenariosReport;