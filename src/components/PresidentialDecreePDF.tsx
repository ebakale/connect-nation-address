import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Scale } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useToast } from '@/hooks/use-toast';

export const PresidentialDecreePDF: React.FC = () => {
  const { toast } = useToast();
  
  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      let yPos = 20;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      const lineHeight = 7;

      const checkPageBreak = () => {
        if (yPos > pageHeight - margin - 10) {
          doc.addPage();
          yPos = 20;
        }
      };

      const addWrappedText = (doc: jsPDF, text: string, x: number, y: number, maxWidth: number): number => {
        const lines = doc.splitTextToSize(text, maxWidth);
        lines.forEach((line: string) => {
          checkPageBreak();
          doc.text(line, x, y);
          y += lineHeight;
        });
        return y;
      };

      // Título principal
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("REPÚBLICA DE GUINEA ECUATORIAL", 105, yPos, { align: "center" });
      yPos += 10;
      
      doc.setFontSize(14);
      doc.text("DECRETO PRESIDENCIAL N° __/2025", 105, yPos, { align: "center" });
      yPos += 8;
      doc.text("Por el que se adopta el Sistema Nacional", 105, yPos, { align: "center" });
      yPos += 6;
      doc.text("de Direcciones Digitales ConnectNation", 105, yPos, { align: "center" });
      yPos += 15;

      // Preámbulo
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("EL PRESIDENTE DE LA REPÚBLICA", margin, yPos);
      yPos += lineHeight + 3;
      
      doc.setFont("helvetica", "normal");
      doc.text("En uso de sus atribuciones constitucionales,", margin, yPos);
      yPos += lineHeight + 3;
      
      doc.setFont("helvetica", "bold");
      doc.text("CONSIDERANDO:", margin, yPos);
      yPos += lineHeight + 2;
      
      doc.setFont("helvetica", "normal");
      const considerandos = [
        "Que es responsabilidad del Estado garantizar sistemas eficientes de direccionamiento para el desarrollo nacional;",
        "Que Guinea Ecuatorial carece actualmente de un sistema moderno y unificado de direcciones;",
        "Que la empresa Biakam ha desarrollado el sistema ConnectNation Address System con tecnología avanzada y probada;",
        "Que la adopción de este sistema mejorará los servicios públicos, la seguridad ciudadana y el desarrollo económico;",
        "Que es conveniente establecer una alianza estratégica con el sector privado para garantizar la sostenibilidad técnica y financiera;",
        "Que el sistema respeta los estándares internacionales de protección de datos y seguridad;"
      ];

      considerandos.forEach(considerando => {
        checkPageBreak();
        yPos = addWrappedText(doc, considerando, margin, yPos, 170);
        yPos += 2;
      });

      yPos += lineHeight;
      doc.setFont("helvetica", "bold");
      doc.text("DECRETA:", margin, yPos);
      yPos += lineHeight + 3;

      // Artículo 1: Objeto
      doc.setFont("helvetica", "bold");
      doc.text("Artículo 1. Objeto y Alcance", margin, yPos);
      yPos += lineHeight;
      doc.setFont("helvetica", "normal");
      yPos = addWrappedText(doc, "Se adopta el Sistema ConnectNation Address System como sistema oficial y obligatorio de direcciones digitales en todo el territorio nacional. Este sistema será de uso obligatorio para todas las instituciones públicas y recomendado para entidades privadas.", margin, yPos, 170);
      yPos += lineHeight;

      // Artículo 2: Operador Autorizado
      checkPageBreak();
      doc.setFont("helvetica", "bold");
      doc.text("Artículo 2. Operador Autorizado", margin, yPos);
      yPos += lineHeight;
      doc.setFont("helvetica", "normal");
      yPos = addWrappedText(doc, "Se reconoce a la empresa Biakam como operador autorizado del sistema nacional de direcciones digitales. Biakam mantendrá la propiedad intelectual del sistema y será responsable de su operación, mantenimiento y evolución tecnológica.", margin, yPos, 170);
      yPos += lineHeight;

      // Artículo 3: Licencia Gubernamental
      checkPageBreak();
      doc.setFont("helvetica", "bold");
      doc.text("Artículo 3. Licencia Gubernamental", margin, yPos);
      yPos += lineHeight;
      doc.setFont("helvetica", "normal");
      yPos = addWrappedText(doc, "El Gobierno de Guinea Ecuatorial suscribirá un contrato de licencia anual con Biakam por el uso institucional del sistema. La tarifa anual será de USD $2,500,000 durante los primeros tres años, y USD $1,800,000 a partir del cuarto año. Estos fondos se asignarán del presupuesto nacional.", margin, yPos, 170);
      yPos += lineHeight;

      // Artículo 4: Acceso Ciudadano Gratuito
      checkPageBreak();
      doc.setFont("helvetica", "bold");
      doc.text("Artículo 4. Acceso Ciudadano Gratuito", margin, yPos);
      yPos += lineHeight;
      doc.setFont("helvetica", "normal");
      yPos = addWrappedText(doc, "Todos los ciudadanos de Guinea Ecuatorial tendrán derecho a registrar gratuitamente sus direcciones en el sistema y acceder a las funcionalidades básicas. Biakam garantizará este acceso sin cargo para los usuarios finales.", margin, yPos, 170);
      yPos += lineHeight;

      // Artículo 5: Modelo Comercial
      checkPageBreak();
      doc.setFont("helvetica", "bold");
      doc.text("Artículo 5. Monetización Comercial", margin, yPos);
      yPos += lineHeight;
      doc.setFont("helvetica", "normal");
      yPos = addWrappedText(doc, "Biakam podrá monetizar comercialmente el sistema mediante: a) APIs de integración para empresas privadas, b) Servicios premium para usuarios, c) Consultoría y desarrollo de funcionalidades personalizadas. Las tarifas comerciales serán reguladas para garantizar accesibilidad y competitividad.", margin, yPos, 170);
      yPos += lineHeight;

      // Artículo 6: Obligaciones de Biakam
      checkPageBreak();
      doc.setFont("helvetica", "bold");
      doc.text("Artículo 6. Obligaciones del Operador", margin, yPos);
      yPos += lineHeight;
      doc.setFont("helvetica", "normal");
      const obligacionesBiakam = [
        "• Garantizar disponibilidad del sistema 24/7 con 99.9% uptime",
        "• Proporcionar soporte técnico en español, francés y portugués",
        "• Actualizar la tecnología según estándares internacionales",
        "• Proteger la privacidad y seguridad de los datos según normativa",
        "• Capacitar gratuitamente al personal gubernamental",
        "• Realizar campañas de concienciación pública"
      ];
      obligacionesBiakam.forEach(item => {
        checkPageBreak();
        yPos = addWrappedText(doc, item, margin, yPos, 170);
      });
      yPos += lineHeight;

      // Artículo 7: Obligaciones del Gobierno
      checkPageBreak();
      doc.setFont("helvetica", "bold");
      doc.text("Artículo 7. Obligaciones Gubernamentales", margin, yPos);
      yPos += lineHeight;
      doc.setFont("helvetica", "normal");
      const obligacionesGobierno = [
        "• Pagar puntualmente la licencia anual establecida",
        "• Promover la adopción masiva entre ciudadanos",
        "• Integrar el sistema en servicios públicos esenciales",
        "• Garantizar el presupuesto para campañas de concienciación",
        "• Facilitar el acceso a datos geográficos oficiales",
        "• Supervisar el cumplimiento de estándares de calidad"
      ];
      obligacionesGobierno.forEach(item => {
        checkPageBreak();
        yPos = addWrappedText(doc, item, margin, yPos, 170);
      });
      yPos += lineHeight;

      // Artículo 8: Protección de Datos
      checkPageBreak();
      doc.setFont("helvetica", "bold");
      doc.text("Artículo 8. Protección de Datos Personales", margin, yPos);
      yPos += lineHeight;
      doc.setFont("helvetica", "normal");
      yPos = addWrappedText(doc, "Todos los datos personales recopilados por el sistema serán tratados conforme a las leyes de protección de datos. Biakam implementará medidas técnicas de seguridad y encriptación. Los ciudadanos tendrán derecho de acceso, rectificación y eliminación de sus datos.", margin, yPos, 170);
      yPos += lineHeight;

      // Artículo 9: Autoridad Nacional de Registro
      checkPageBreak();
      doc.setFont("helvetica", "bold");
      doc.text("Artículo 9. Autoridad Nacional de Registro (NAR)", margin, yPos);
      yPos += lineHeight;
      doc.setFont("helvetica", "normal");
      yPos = addWrappedText(doc, "Se crea la Autoridad Nacional de Registro (NAR) como entidad supervisora del sistema. La NAR será responsable de: validar direcciones, resolver disputas, supervisar la calidad del servicio, y garantizar el cumplimiento de estándares.", margin, yPos, 170);
      yPos += lineHeight;

      // Artículo 10: Autoridades de Certificación Regional
      checkPageBreak();
      doc.setFont("helvetica", "bold");
      doc.text("Artículo 10. Autoridades Regionales (CAR)", margin, yPos);
      yPos += lineHeight;
      doc.setFont("helvetica", "normal");
      yPos = addWrappedText(doc, "Se establecen Autoridades de Certificación Regional (CAR) en cada provincia para verificar direcciones en campo, resolver casos complejos, y servir como enlace entre ciudadanos y el sistema central.", margin, yPos, 170);
      yPos += lineHeight;

      // Artículo 11: Integración con Servicios Públicos
      checkPageBreak();
      doc.setFont("helvetica", "bold");
      doc.text("Artículo 11. Integración Institucional", margin, yPos);
      yPos += lineHeight;
      doc.setFont("helvetica", "normal");
      yPos = addWrappedText(doc, "Se ordena la integración progresiva del sistema en: servicios de emergencia (911), servicios postales, catastro, censos, servicios de delivery, y sistemas de respuesta a emergencias. Las instituciones tendrán un plazo de 24 meses para completar la integración.", margin, yPos, 170);
      yPos += lineHeight;

      // Artículo 12: Campaña de Concienciación
      checkPageBreak();
      doc.setFont("helvetica", "bold");
      doc.text("Artículo 12. Campaña Nacional", margin, yPos);
      yPos += lineHeight;
      doc.setFont("helvetica", "normal");
      yPos = addWrappedText(doc, "Se establece una campaña nacional de concienciación sobre los beneficios del sistema de direcciones digitales. El Gobierno asignará fondos anuales, y Biakam proporcionará materiales educativos y soporte técnico para la campaña.", margin, yPos, 170);
      yPos += lineHeight;

      // Artículo 13: Tarifas Reguladas
      checkPageBreak();
      doc.setFont("helvetica", "bold");
      doc.text("Artículo 13. Regulación de Tarifas Comerciales", margin, yPos);
      yPos += lineHeight;
      doc.setFont("helvetica", "normal");
      yPos = addWrappedText(doc, "Las tarifas comerciales de Biakam para APIs empresariales y servicios premium serán supervisadas por la NAR para garantizar accesibilidad y prevenir prácticas monopolísticas. Se establecerán tarifas máximas referenciales.", margin, yPos, 170);
      yPos += lineHeight;

      // Artículo 14: Resolución de Disputas
      checkPageBreak();
      doc.setFont("helvetica", "bold");
      doc.text("Artículo 14. Mecanismo de Quejas y Apelaciones", margin, yPos);
      yPos += lineHeight;
      doc.setFont("helvetica", "normal");
      yPos = addWrappedText(doc, "Se establece un sistema de quejas y apelaciones gestionado por la NAR para resolver disputas sobre direcciones, errores del sistema, o violaciones de privacidad. Las resoluciones serán vinculantes y ejecutables.", margin, yPos, 170);
      yPos += lineHeight;

      // Artículo 15: Supervisión y Auditoría
      checkPageBreak();
      doc.setFont("helvetica", "bold");
      doc.text("Artículo 15. Supervisión del Servicio", margin, yPos);
      yPos += lineHeight;
      doc.setFont("helvetica", "normal");
      yPos = addWrappedText(doc, "Biakam presentará informes trimestrales a la NAR sobre: disponibilidad del sistema, incidentes de seguridad, estadísticas de uso, y mejoras implementadas. La NAR realizará auditorías anuales de calidad y seguridad.", margin, yPos, 170);
      yPos += lineHeight;

      // Artículo 16: Incumplimiento y Sanciones
      checkPageBreak();
      doc.setFont("helvetica", "bold");
      doc.text("Artículo 16. Consecuencias de Incumplimiento", margin, yPos);
      yPos += lineHeight;
      doc.setFont("helvetica", "normal");
      yPos = addWrappedText(doc, "El incumplimiento grave por cualquiera de las partes dará lugar a:", margin, yPos, 170);
      yPos += lineHeight;

      const consecuencias = [
        "• Incumplimiento de Biakam: suspensión temporal, multas, o rescisión del contrato",
        "• Incumplimiento del Gobierno: suspensión del servicio hasta regularización de pagos",
        "• En caso de rescisión: Biakam garantiza exportación completa de datos en 90 días"
      ];
      
      consecuencias.forEach(item => {
        checkPageBreak();
        yPos = addWrappedText(doc, item, margin + 5, yPos, 165);
      });
      yPos += lineHeight;

      // Artículo 17: Poblaciones Vulnerables
      checkPageBreak();
      doc.setFont("helvetica", "bold");
      doc.text("Artículo 17. Inclusión y Accesibilidad", margin, yPos);
      yPos += lineHeight;
      doc.setFont("helvetica", "normal");
      yPos = addWrappedText(doc, "Se garantiza el acceso al sistema para personas con discapacidad, comunidades rurales, y poblaciones vulnerables. Biakam implementará interfaces accesibles, y el Gobierno facilitará puntos de registro asistido en zonas remotas.", margin, yPos, 170);
      yPos += lineHeight;

      // Artículo 18: Arbitraje
      checkPageBreak();
      doc.setFont("helvetica", "bold");
      doc.text("Artículo 18. Arbitraje Internacional", margin, yPos);
      yPos += lineHeight;
      doc.setFont("helvetica", "normal");
      yPos = addWrappedText(doc, "Las disputas contractuales entre el Gobierno y Biakam que no puedan resolverse mediante negociación serán sometidas a arbitraje internacional según las reglas de la Cámara de Comercio Internacional (CCI).", margin, yPos, 170);
      yPos += lineHeight;

      // DISPOSICIONES FINALES
      checkPageBreak();
      doc.setFont("helvetica", "bold");
      doc.text("DISPOSICIONES FINALES", margin, yPos);
      yPos += lineHeight + 2;

      doc.setFont("helvetica", "normal");
      yPos = addWrappedText(doc, "Primera: El presente decreto entrará en vigor el 1 de abril de 2026.", margin, yPos, 170);
      yPos += lineHeight;

      yPos = addWrappedText(doc, "Segunda: Los Ministerios de Interior, Infraestructura, y Telecomunicaciones desarrollarán las normativas técnicas complementarias en un plazo de 90 días.", margin, yPos, 170);
      yPos += lineHeight;

      yPos = addWrappedText(doc, "Tercera: El contrato de licencia con Biakam será suscrito en un plazo máximo de 60 días desde la entrada en vigor.", margin, yPos, 170);
      yPos += lineHeight;

      yPos = addWrappedText(doc, "Cuarta: Se derogan todas las disposiciones que se opongan al presente decreto.", margin, yPos, 170);
      yPos += lineHeight + 5;

      // Firmas
      checkPageBreak();
      yPos += 10;
      doc.setFont("helvetica", "bold");
      doc.text("Dado en Malabo,", margin, yPos);
      yPos += lineHeight;
      doc.text("A los ___ días del mes de ________ de 2025", margin, yPos);
      yPos += lineHeight * 3;
      doc.text("_________________________________", margin, yPos);
      yPos += lineHeight;
      doc.text("Presidente de la República de Guinea Ecuatorial", margin, yPos);

      doc.save('Decreto_Presidencial_Sistema_Direcciones_Digitales.pdf');
      toast({
        title: "PDF generado",
        description: "El Decreto Presidencial se ha descargado exitosamente",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al generar el PDF",
        variant: "destructive",
      });
    }
  };

  return (
    <Button onClick={generatePDF} variant="outline" className="gap-2">
      <Scale className="h-4 w-4" />
      <Download className="h-4 w-4" />
      Descargar Decreto Presidencial
    </Button>
  );
};
