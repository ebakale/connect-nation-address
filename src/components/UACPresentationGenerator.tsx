import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Presentation, Hash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import pptxgen from 'pptxgenjs';

export const UACPresentationGenerator: React.FC = () => {
  const { toast } = useToast();

  const generateUACPresentation = () => {
    try {
      const pres = new pptxgen();
      
      // Slide 1: Título
      const slide1 = pres.addSlide();
      slide1.addText('Sistema UAC\n(Unified Address Code)', {
        x: 1,
        y: 2,
        w: 8,
        h: 2,
        fontSize: 44,
        fontFace: 'Arial',
        color: '2E8B57',
        bold: true,
        align: 'center'
      });
      
      slide1.addText('Guinea Ecuatorial', {
        x: 1,
        y: 4,
        w: 8,
        h: 1,
        fontSize: 28,
        fontFace: 'Arial',
        color: '4A5568',
        align: 'center'
      });
      
      slide1.addText('Sistema Estandarizado de Codificación de Direcciones', {
        x: 1,
        y: 5.5,
        w: 8,
        h: 0.5,
        fontSize: 18,
        fontFace: 'Arial',
        color: '666666',
        align: 'center',
        italic: true
      });

      // Slide 2: ¿Qué es el Sistema UAC?
      const slide2 = pres.addSlide();
      slide2.addText('¿Qué es el Sistema UAC?', {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 1,
        fontSize: 32,
        fontFace: 'Arial',
        color: '2E8B57',
        bold: true
      });
      
      const uacDefinition = [
        '• Sistema estandarizado de codificación de direcciones',
        '• Sigue las mejores prácticas internacionales',
        '• Códigos únicos e identificables para cada dirección',
        '• Cubre Guinea Ecuatorial y otros países de África Central',
        '• Facilita la gestión y localización de direcciones'
      ];
      
      slide2.addText(uacDefinition.join('\n\n'), {
        x: 0.5,
        y: 1.8,
        w: 9,
        h: 4,
        fontSize: 20,
        fontFace: 'Arial',
        color: '333333',
        bullet: false
      });

      // Slide 3: Formato del UAC
      const slide3 = pres.addSlide();
      slide3.addText('Formato del UAC', {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 1,
        fontSize: 32,
        fontFace: 'Arial',
        color: '2E8B57',
        bold: true
      });
      
      slide3.addText('Estructura:', {
        x: 0.5,
        y: 1.5,
        w: 9,
        h: 0.5,
        fontSize: 24,
        fontFace: 'Arial',
        color: '4A5568',
        bold: true
      });
      
      slide3.addText('[PAÍS]-[REGIÓN]-[CIUDAD]-[SECUENCIA]-[VERIFICACIÓN]', {
        x: 0.5,
        y: 2.1,
        w: 9,
        h: 0.8,
        fontSize: 22,
        fontFace: 'Courier New',
        color: '1A365D',
        bold: true,
        fill: { color: 'E2E8F0' }
      });
      
      slide3.addText('Ejemplo: GQ-BN-MAL-001A00-7K', {
        x: 0.5,
        y: 3.2,
        w: 9,
        h: 0.8,
        fontSize: 24,
        fontFace: 'Courier New',
        color: 'DC2626',
        bold: true,
        fill: { color: 'FEF2F2' }
      });
      
      const breakdown = [
        'GQ = Guinea Ecuatorial (código ISO 3166-1)',
        'BN = Bioko Norte (código de región)', 
        'MAL = Malabo (código de ciudad)',
        '001A00 = Identificador secuencial (número + alfanumérico)',
        '7K = Dígito de verificación (2 caracteres)'
      ];
      
      slide3.addText(breakdown.join('\n'), {
        x: 0.5,
        y: 4.3,
        w: 9,
        h: 2,
        fontSize: 16,
        fontFace: 'Arial',
        color: '4A5568'
      });

      // Slide 4: Códigos de Regiones
      const slide4 = pres.addSlide();
      slide4.addText('Códigos de Regiones de Guinea Ecuatorial', {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 1,
        fontSize: 28,
        fontFace: 'Arial',
        color: '2E8B57',
        bold: true
      });
      
      const regions = [
        'AN = Annobón',
        'BN = Bioko Norte',
        'BS = Bioko Sur', 
        'CS = Centro Sur',
        'DJ = Djibloho',
        'KN = Kié-Ntem',
        'LI = Litoral',
        'WN = Wele-Nzas'
      ];
      
      slide4.addText(regions.join('\n\n'), {
        x: 1,
        y: 1.8,
        w: 8,
        h: 4,
        fontSize: 20,
        fontFace: 'Arial',
        color: '333333'
      });

      // Slide 5: Ciudades Principales - Parte 1
      const slide5 = pres.addSlide();
      slide5.addText('Códigos de Ciudades Principales (1/2)', {
        x: 0.5,
        y: 0.3,
        w: 9,
        h: 0.7,
        fontSize: 26,
        fontFace: 'Arial',
        color: '2E8B57',
        bold: true
      });
      
      const cities1 = [
        'Bioko Norte:',
        '  • MAL = Malabo (capital)',
        '  • REB = Rebola',
        '  • BAN = Baney',
        '',
        'Bioko Sur:',
        '  • LUB = Luba',
        '  • RIA = Riaba',
        '  • MOC = Moca',
        '',
        'Litoral:',
        '  • BAT = Bata (ciudad principal)',
        '  • MBI = Mbini',
        '  • KOG = Kogo',
        '  • ACA = Acalayong'
      ];
      
      slide5.addText(cities1.join('\n'), {
        x: 0.5,
        y: 1.2,
        w: 9,
        h: 5,
        fontSize: 18,
        fontFace: 'Arial',
        color: '333333'
      });

      // Slide 6: Ciudades Principales - Parte 2
      const slide6 = pres.addSlide();
      slide6.addText('Códigos de Ciudades Principales (2/2)', {
        x: 0.5,
        y: 0.3,
        w: 9,
        h: 0.7,
        fontSize: 26,
        fontFace: 'Arial',
        color: '2E8B57',
        bold: true
      });
      
      const cities2 = [
        'Centro Sur:',
        '  • EVI = Evinayong  • ACU = Acurenam  • NIE = Niefang',
        '',
        'Djibloho:',
        '  • CDP = Ciudad de la Paz (capital futura)',
        '',
        'Kié-Ntem:',
        '  • EBE = Ebebiyín  • MIK = Mikomeseng',
        '  • NCU = Ncue      • NSO = Nsork Nsomo',
        '',
        'Wele-Nzas:',
        '  • MON = Mongomo  • ANI = Añisoc',
        '  • ACO = Aconibe  • NSK = Nsok',
        '',
        'Annobón:',
        '  • SAP = San Antonio de Palé'
      ];
      
      slide6.addText(cities2.join('\n'), {
        x: 0.5,
        y: 1.2,
        w: 9,
        h: 5,
        fontSize: 18,
        fontFace: 'Arial',
        color: '333333'
      });

      // Slide 7: Funcionalidades del Sistema
      const slide7 = pres.addSlide();
      slide7.addText('Funcionalidades del Sistema', {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 1,
        fontSize: 32,
        fontFace: 'Arial',
        color: '2E8B57',
        bold: true
      });
      
      const functionalities = [
        '1. Generación Automática',
        '   • Códigos únicos secuenciales',
        '   • Cálculo automático del dígito de verificación',
        '   • Prevención de duplicados',
        '',
        '2. Validación',
        '   • Verifica formato correcto',
        '   • Valida dígito de verificación',
        '   • Decodifica componentes',
        '',
        '3. Búsqueda y Gestión',
        '   • Búsqueda por UAC exacto',
        '   • Búsqueda parcial en direcciones públicas',
        '   • Protección de privacidad'
      ];
      
      slide7.addText(functionalities.join('\n'), {
        x: 0.5,
        y: 1.8,
        w: 9,
        h: 4.5,
        fontSize: 16,
        fontFace: 'Arial',
        color: '333333'
      });

      // Slide 8: Beneficios
      const slide8 = pres.addSlide();
      slide8.addText('Beneficios del Sistema UAC', {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 1,
        fontSize: 32,
        fontFace: 'Arial',
        color: '2E8B57',
        bold: true
      });
      
      const benefits = [
        '✓ Estandarización',
        '   Códigos uniformes en todo el país',
        '',
        '✓ Interoperabilidad',
        '   Compatible con sistemas internacionales',
        '',
        '✓ Verificación',
        '   Detección automática de errores',
        '',
        '✓ Escalabilidad',
        '   Soporte para millones de direcciones',
        '',
        '✓ Privacidad y Trazabilidad',
        '   Control de acceso granular y registro completo'
      ];
      
      slide8.addText(benefits.join('\n'), {
        x: 0.5,
        y: 1.8,
        w: 9,
        h: 4.5,
        fontSize: 18,
        fontFace: 'Arial',
        color: '333333'
      });

      // Slide 9: Integración con Emergencias
      const slide9 = pres.addSlide();
      slide9.addText('Integración con Servicios de Emergencia', {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 1,
        fontSize: 28,
        fontFace: 'Arial',
        color: '2E8B57',
        bold: true
      });
      
      const emergency = [
        '🚨 Genera UACs para incidentes de emergencia',
        '',
        '📍 Permite localización rápida para servicios de respuesta',
        '',
        '🚔 Integración con el sistema policial y de despacho',
        '',
        '⚡ Respuesta más eficiente ante emergencias',
        '',
        '🗺️ Mejora la coordinación entre unidades de respuesta'
      ];
      
      slide9.addText(emergency.join('\n'), {
        x: 0.5,
        y: 1.8,
        w: 9,
        h: 4,
        fontSize: 20,
        fontFace: 'Arial',
        color: '333333'
      });

      // Slide 10: Conclusión
      const slide10 = pres.addSlide();
      slide10.addText('Conclusión', {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 1,
        fontSize: 32,
        fontFace: 'Arial',
        color: '2E8B57',
        bold: true
      });
      
      slide10.addText('El sistema UAC es fundamental para la gestión moderna de direcciones en Guinea Ecuatorial', {
        x: 0.5,
        y: 1.8,
        w: 9,
        h: 1.5,
        fontSize: 22,
        fontFace: 'Arial',
        color: '4A5568',
        align: 'center',
        bold: true
      });
      
      const conclusion = [
        '• Base sólida para servicios gubernamentales',
        '• Mejora en servicios de emergencia',
        '• Apoyo al desarrollo urbano planificado',
        '• Estándar internacional adaptado a Guinea Ecuatorial'
      ];
      
      slide10.addText(conclusion.join('\n\n'), {
        x: 0.5,
        y: 3.5,
        w: 9,
        h: 2.5,
        fontSize: 18,
        fontFace: 'Arial',
        color: '333333',
        align: 'center'
      });

      // Generar y descargar
      pres.writeFile({ fileName: 'Sistema_UAC_Guinea_Ecuatorial.pptx' });
      
      toast({
        title: "Presentación generada",
        description: "La presentación del Sistema UAC se está descargando...",
      });
      
    } catch (error) {
      console.error('Error generando presentación:', error);
      toast({
        title: "Error",
        description: "No se pudo generar la presentación. Inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Presentation className="h-5 w-5" />
          Presentación del Sistema UAC
        </CardTitle>
        <CardDescription>
          Genera una presentación completa en PowerPoint sobre el sistema UAC de Guinea Ecuatorial
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Contenido de la presentación:
            </h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Introducción al Sistema UAC</li>
              <li>• Formato y estructura de códigos</li>
              <li>• Códigos de regiones de Guinea Ecuatorial</li>
              <li>• Códigos de ciudades principales</li>
              <li>• Funcionalidades del sistema</li>
              <li>• Beneficios e integración con emergencias</li>
              <li>• Conclusiones</li>
            </ul>
          </div>
          
          <Button onClick={generateUACPresentation} className="w-full" size="lg">
            <Download className="h-4 w-4 mr-2" />
            Generar y Descargar Presentación PowerPoint
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};