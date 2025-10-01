import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useToast } from '@/hooks/use-toast';

export const BiakamGovernmentContractPDF: React.FC = () => {
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
      doc.text("CONTRATO DE LICENCIA Y OPERACIÓN", 105, yPos, { align: "center" });
      yPos += 8;
      doc.text("Sistema Nacional de Direcciones Digitales", 105, yPos, { align: "center" });
      yPos += 6;
      doc.text("ConnectNation Address System", 105, yPos, { align: "center" });
      yPos += 15;

      // Partes del contrato
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("ENTRE LAS PARTES:", margin, yPos);
      yPos += lineHeight + 3;

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("PRIMERA PARTE: EL GOBIERNO", margin, yPos);
      yPos += lineHeight;
      doc.setFont("helvetica", "normal");
      yPos = addWrappedText(doc, "El Gobierno de la República de Guinea Ecuatorial, representado en este acto por el Ministro de Interior, con sede en Malabo, Guinea Ecuatorial, en adelante denominado 'EL GOBIERNO'.", margin, yPos, 170);
      yPos += lineHeight;

      doc.setFont("helvetica", "bold");
      doc.text("SEGUNDA PARTE: EL OPERADOR", margin, yPos);
      yPos += lineHeight;
      doc.setFont("helvetica", "normal");
      yPos = addWrappedText(doc, "Biakam S.L., sociedad legalmente constituida, con CIF [___________], con domicilio social en [Dirección], representada por su Administrador Único D. [Nombre], en adelante denominado 'BIAKAM' o 'EL OPERADOR'.", margin, yPos, 170);
      yPos += lineHeight + 3;

      // Antecedentes
      checkPageBreak();
      doc.setFont("helvetica", "bold");
      doc.text("ANTECEDENTES", margin, yPos);
      yPos += lineHeight + 2;

      doc.setFont("helvetica", "normal");
      const antecedentes = [
        "I. BIAKAM es titular de todos los derechos de propiedad intelectual e industrial sobre el sistema tecnológico ConnectNation Address System, una plataforma digital de direccionamiento georreferenciado.",
        "II. EL GOBIERNO tiene interés en implementar un sistema moderno y eficiente de direcciones digitales para todo el territorio nacional, que mejore los servicios públicos, la seguridad ciudadana y el desarrollo económico.",
        "III. Ambas partes han acordado establecer una alianza estratégica mediante la cual BIAKAM otorga al GOBIERNO una licencia de uso del sistema, manteniéndose como operador tecnológico responsable."
      ];

      antecedentes.forEach(item => {
        checkPageBreak();
        yPos = addWrappedText(doc, item, margin, yPos, 170);
        yPos += 2;
      });

      yPos += lineHeight;
      doc.setFont("helvetica", "bold");
      doc.text("CLÁUSULAS", margin, yPos);
      yPos += lineHeight + 3;

      // CLÁUSULA PRIMERA: Objeto del Contrato
      checkPageBreak();
      doc.setFont("helvetica", "bold");
      doc.text("PRIMERA. Objeto del Contrato", margin, yPos);
      yPos += lineHeight;
      doc.setFont("helvetica", "normal");
      yPos = addWrappedText(doc, "El presente contrato tiene por objeto regular la licencia de uso, operación y mantenimiento del Sistema ConnectNation Address System como sistema oficial de direcciones digitales de Guinea Ecuatorial. BIAKAM otorga al GOBIERNO una licencia no exclusiva, intransferible y territorial para el uso institucional del sistema en todo el territorio nacional.", margin, yPos, 170);
      yPos += lineHeight;

      // CLÁUSULA SEGUNDA: Propiedad Intelectual
      checkPageBreak();
      doc.setFont("helvetica", "bold");
      doc.text("SEGUNDA. Propiedad Intelectual", margin, yPos);
      yPos += lineHeight;
      doc.setFont("helvetica", "normal");
      yPos = addWrappedText(doc, "BIAKAM mantiene la propiedad exclusiva de todos los derechos de propiedad intelectual, industrial, código fuente, algoritmos, bases de datos, y cualquier desarrollo tecnológico relacionado con el sistema ConnectNation. El GOBIERNO reconoce expresamente estos derechos y se compromete a no realizar ingeniería inversa, copiar, modificar o explotar comercialmente el sistema sin autorización escrita.", margin, yPos, 170);
      yPos += lineHeight;

      // CLÁUSULA TERCERA: Contraprestación Económica
      checkPageBreak();
      doc.setFont("helvetica", "bold");
      doc.text("TERCERA. Contraprestación Económica", margin, yPos);
      yPos += lineHeight;
      doc.setFont("helvetica", "normal");
      yPos = addWrappedText(doc, "Como contraprestación por la licencia de uso y servicios de operación, EL GOBIERNO abonará a BIAKAM las siguientes cantidades:", margin, yPos, 170);
      yPos += lineHeight;

      const tarifas = [
        "a) Años 1 a 3: USD $2,500,000 (dos millones quinientos mil dólares) anuales",
        "b) Año 4 en adelante: USD $1,800,000 (un millón ochocientos mil dólares) anuales",
        "c) Forma de pago: En cuatro cuotas trimestrales anticipadas",
        "d) Actualización: Las tarifas se actualizarán anualmente según el IPC de Guinea Ecuatorial"
      ];
      
      tarifas.forEach(item => {
        checkPageBreak();
        yPos = addWrappedText(doc, item, margin + 5, yPos, 165);
      });
      yPos += lineHeight;

      // CLÁUSULA CUARTA: Obligaciones de BIAKAM
      checkPageBreak();
      doc.setFont("helvetica", "bold");
      doc.text("CUARTA. Obligaciones de BIAKAM", margin, yPos);
      yPos += lineHeight;
      doc.setFont("helvetica", "normal");
      yPos = addWrappedText(doc, "BIAKAM se compromete a:", margin, yPos, 170);
      yPos += lineHeight;

      const obligacionesBiakam = [
        "a) Garantizar disponibilidad del sistema 24/7 con nivel de servicio (SLA) del 99.9%",
        "b) Proporcionar soporte técnico multilingüe (español, francés, portugués) en horario 8:00-20:00",
        "c) Operar y mantener el Módulo de Gestión de Emergencias con disponibilidad 24/7",
        "d) Proporcionar soporte técnico prioritario para emergencias con respuesta inmediata",
        "e) Capacitar al personal de emergencias (operadores, despachadores, supervisores)",
        "f) Realizar mantenimiento preventivo mensual y correctivo inmediato",
        "g) Actualizar la plataforma tecnológica conforme a estándares internacionales",
        "h) Implementar medidas de seguridad y cifrado de datos según ISO 27001",
        "i) Capacitar gratuitamente al personal gubernamental (mínimo 200 horas anuales)",
        "j) Realizar campañas de concienciación pública (mínimo 4 campañas anuales)",
        "k) Proporcionar informes trimestrales de desempeño, estadísticas y métricas de emergencias",
        "l) Garantizar acceso gratuito para todos los ciudadanos a funcionalidades básicas",
        "m) Respetar la privacidad de los datos según normativa de protección de datos"
      ];
      
      obligacionesBiakam.forEach(item => {
        checkPageBreak();
        yPos = addWrappedText(doc, item, margin + 5, yPos, 165);
      });
      yPos += lineHeight;

      // CLÁUSULA QUINTA: Obligaciones del GOBIERNO
      checkPageBreak();
      doc.setFont("helvetica", "bold");
      doc.text("QUINTA. Obligaciones del GOBIERNO", margin, yPos);
      yPos += lineHeight;
      doc.setFont("helvetica", "normal");
      yPos = addWrappedText(doc, "EL GOBIERNO se compromete a:", margin, yPos, 170);
      yPos += lineHeight;

      const obligacionesGobierno = [
        "a) Abonar puntualmente las tarifas anuales establecidas",
        "b) Promover la adopción masiva del sistema entre ciudadanos e instituciones",
        "c) Designar y capacitar personal para operar el Módulo de Gestión de Emergencias",
        "d) Establecer protocolos de respuesta a emergencias basados en direcciones UAC",
        "e) Integrar obligatoriamente el sistema en servicios públicos esenciales",
        "f) Asignar presupuesto anual para campañas de concienciación ciudadana",
        "g) Facilitar acceso a datos geográficos oficiales (mapas, catastro)",
        "h) Designar personal de enlace para coordinación con BIAKAM",
        "i) Supervisar el cumplimiento de estándares de calidad mediante la NAR",
        "j) Proporcionar retroalimentación sobre el módulo de emergencias y necesidades de mejora",
        "k) No desarrollar ni contratar sistemas de direccionamiento alternativos competidores",
        "l) Proteger los derechos de propiedad intelectual de BIAKAM",
        "m) Garantizar la seguridad física de infraestructuras compartidas"
      ];
      
      obligacionesGobierno.forEach(item => {
        checkPageBreak();
        yPos = addWrappedText(doc, item, margin + 5, yPos, 165);
      });
      yPos += lineHeight;

      // CLÁUSULA SEXTA: Acceso Ciudadano
      checkPageBreak();
      doc.setFont("helvetica", "bold");
      doc.text("SEXTA. Acceso Ciudadano Gratuito", margin, yPos);
      yPos += lineHeight;
      doc.setFont("helvetica", "normal");
      yPos = addWrappedText(doc, "BIAKAM garantiza que todos los ciudadanos de Guinea Ecuatorial podrán registrar gratuitamente sus direcciones en el sistema y acceder a las funcionalidades básicas (registro, búsqueda, actualización, códigos QR). Este acceso gratuito es condición esencial del contrato y su incumplimiento constituirá causa de resolución.", margin, yPos, 170);
      yPos += lineHeight;

      // CLÁUSULA SÉPTIMA: Monetización Comercial
      checkPageBreak();
      doc.setFont("helvetica", "bold");
      doc.text("SÉPTIMA. Monetización Comercial de BIAKAM", margin, yPos);
      yPos += lineHeight;
      doc.setFont("helvetica", "normal");
      yPos = addWrappedText(doc, "BIAKAM podrá monetizar comercialmente el sistema mediante:", margin, yPos, 170);
      yPos += lineHeight;

      const monetizacion = [
        "a) APIs de integración para empresas privadas (delivery, logística, servicios)",
        "b) Servicios premium para usuarios (direcciones personalizadas, análisis avanzados)",
        "c) Consultoría y desarrollo de funcionalidades personalizadas para terceros",
        "d) Licenciamiento del sistema a otros países"
      ];
      
      monetizacion.forEach(item => {
        checkPageBreak();
        yPos = addWrappedText(doc, item, margin + 5, yPos, 165);
      });
      yPos += lineHeight;
      
      yPos = addWrappedText(doc, "Las tarifas comerciales serán supervisadas por la Autoridad Nacional de Registro (NAR) para garantizar accesibilidad y prevenir prácticas monopolísticas.", margin, yPos, 170);
      yPos += lineHeight;

      // CLÁUSULA OCTAVA: Protección de Datos
      checkPageBreak();
      doc.setFont("helvetica", "bold");
      doc.text("OCTAVA. Protección de Datos Personales", margin, yPos);
      yPos += lineHeight;
      doc.setFont("helvetica", "normal");
      yPos = addWrappedText(doc, "Ambas partes se comprometen a cumplir estrictamente las leyes de protección de datos. BIAKAM implementará medidas técnicas de seguridad (cifrado AES-256, autenticación multifactor, auditorías de seguridad). Los ciudadanos tendrán derechos de acceso, rectificación, supresión y portabilidad de datos. Los datos no podrán ser cedidos a terceros sin consentimiento expreso, salvo obligación legal.", margin, yPos, 170);
      yPos += lineHeight;

      // CLÁUSULA NOVENA: Nivel de Servicio (SLA)
      checkPageBreak();
      doc.setFont("helvetica", "bold");
      doc.text("NOVENA. Nivel de Servicio (SLA)", margin, yPos);
      yPos += lineHeight;
      doc.setFont("helvetica", "normal");
      yPos = addWrappedText(doc, "BIAKAM garantiza los siguientes niveles de servicio:", margin, yPos, 170);
      yPos += lineHeight;

      const sla = [
        "• Disponibilidad: 99.9% mensual (máximo 43 minutos de inactividad/mes)",
        "• Tiempo de respuesta: Incidencias críticas en < 2 horas, no críticas en < 24 horas",
        "• Mantenimiento programado: Máximo 4 horas mensuales, notificadas con 7 días de anticipación",
        "• Recuperación ante desastres: Backup diario, recuperación completa en < 24 horas",
        "• Penalizaciones por incumplimiento: 5% de tarifa mensual por cada 0.1% por debajo del 99.9%"
      ];
      
      sla.forEach(item => {
        checkPageBreak();
        yPos = addWrappedText(doc, item, margin + 5, yPos, 165);
      });
      yPos += lineHeight;

      // CLÁUSULA DÉCIMA: Duración y Renovación
      checkPageBreak();
      doc.setFont("helvetica", "bold");
      doc.text("DÉCIMA. Duración y Renovación", margin, yPos);
      yPos += lineHeight;
      doc.setFont("helvetica", "normal");
      yPos = addWrappedText(doc, "El presente contrato tendrá una duración inicial de cinco (5) años desde su firma, renovable automáticamente por períodos de tres (3) años, salvo denuncia expresa de cualquiera de las partes con al menos doce (12) meses de antelación. Tras la renovación inicial, cualquier parte podrá denunciar el contrato con notificación de seis (6) meses.", margin, yPos, 170);
      yPos += lineHeight;

      // CLÁUSULA UNDÉCIMA: Causas de Resolución
      checkPageBreak();
      doc.setFont("helvetica", "bold");
      doc.text("UNDÉCIMA. Causas de Resolución", margin, yPos);
      yPos += lineHeight;
      doc.setFont("helvetica", "normal");
      yPos = addWrappedText(doc, "El contrato podrá resolverse anticipadamente por las siguientes causas:", margin, yPos, 170);
      yPos += lineHeight;

      const causas = [
        "a) Incumplimiento grave de obligaciones por cualquiera de las partes",
        "b) Impago de dos cuotas trimestrales consecutivas por EL GOBIERNO",
        "c) Incumplimiento reiterado de SLA (disponibilidad < 95% en tres meses consecutivos)",
        "d) Violación de protección de datos o seguridad",
        "e) Cesión no autorizada del contrato",
        "f) Fuerza mayor que impida la ejecución por más de 180 días",
        "g) Mutuo acuerdo de las partes"
      ];
      
      causas.forEach(item => {
        checkPageBreak();
        yPos = addWrappedText(doc, item, margin + 5, yPos, 165);
      });
      yPos += lineHeight;

      // CLÁUSULA DUODÉCIMA: Consecuencias de la Resolución
      checkPageBreak();
      doc.setFont("helvetica", "bold");
      doc.text("DUODÉCIMA. Consecuencias de la Resolución", margin, yPos);
      yPos += lineHeight;
      doc.setFont("helvetica", "normal");
      yPos = addWrappedText(doc, "En caso de resolución del contrato:", margin, yPos, 170);
      yPos += lineHeight;

      const consecuencias = [
        "a) BIAKAM garantiza un período de transición de noventa (90) días calendario",
        "b) BIAKAM proporcionará exportación completa de todos los datos en formatos estándar (CSV, JSON, SQL)",
        "c) EL GOBIERNO pagará todas las cantidades pendientes hasta la fecha efectiva de resolución",
        "d) BIAKAM conserva todos los derechos de propiedad intelectual sobre el sistema",
        "e) EL GOBIERNO deberá cesar inmediatamente el uso del sistema ConnectNation",
        "f) Se realizará una auditoría conjunta para verificar eliminación segura de datos sensibles"
      ];
      
      consecuencias.forEach(item => {
        checkPageBreak();
        yPos = addWrappedText(doc, item, margin + 5, yPos, 165);
      });
      yPos += lineHeight;

      // CLÁUSULA DECIMOTERCERA: Autoridad Nacional de Registro
      checkPageBreak();
      doc.setFont("helvetica", "bold");
      doc.text("DECIMOTERCERA. Autoridad Nacional de Registro (NAR)", margin, yPos);
      yPos += lineHeight;
      doc.setFont("helvetica", "normal");
      yPos = addWrappedText(doc, "EL GOBIERNO creará la Autoridad Nacional de Registro (NAR) como entidad supervisora independiente. La NAR tendrá competencias para: validar direcciones, resolver disputas entre usuarios, supervisar la calidad del servicio de BIAKAM, garantizar el cumplimiento de estándares, y regular tarifas comerciales. BIAKAM colaborará plenamente con la NAR proporcionando información y acceso necesario.", margin, yPos, 170);
      yPos += lineHeight;

      // CLÁUSULA DECIMOCUARTA: Confidencialidad
      checkPageBreak();
      doc.setFont("helvetica", "bold");
      doc.text("DECIMOCUARTA. Confidencialidad", margin, yPos);
      yPos += lineHeight;
      doc.setFont("helvetica", "normal");
      yPos = addWrappedText(doc, "Ambas partes se comprometen a mantener confidencialidad sobre toda información técnica, comercial, operativa y estratégica intercambiada durante la vigencia del contrato. Esta obligación permanecerá vigente durante cinco (5) años después de la finalización del contrato. Se exceptúa la información que deba revelarse por obligación legal o judicial.", margin, yPos, 170);
      yPos += lineHeight;

      // CLÁUSULA DECIMOQUINTA: Modificaciones del Contrato
      checkPageBreak();
      doc.setFont("helvetica", "bold");
      doc.text("DECIMOQUINTA. Modificaciones del Contrato", margin, yPos);
      yPos += lineHeight;
      doc.setFont("helvetica", "normal");
      yPos = addWrappedText(doc, "Cualquier modificación del presente contrato deberá formalizarse mediante adenda escrita firmada por representantes autorizados de ambas partes. Las modificaciones técnicas menores (actualizaciones de software, mejoras de funcionalidad) no requerirán adenda contractual siempre que no afecten derechos y obligaciones esenciales.", margin, yPos, 170);
      yPos += lineHeight;

      // CLÁUSULA DECIMOSEXTA: Cesión del Contrato
      checkPageBreak();
      doc.setFont("helvetica", "bold");
      doc.text("DECIMOSEXTA. Cesión del Contrato", margin, yPos);
      yPos += lineHeight;
      doc.setFont("helvetica", "normal");
      yPos = addWrappedText(doc, "Ninguna de las partes podrá ceder o transferir este contrato sin el consentimiento previo y escrito de la otra parte. Se exceptúa la cesión de BIAKAM a una sociedad del mismo grupo empresarial, previa notificación con treinta (30) días de antelación.", margin, yPos, 170);
      yPos += lineHeight;

      // CLÁUSULA DECIMOSÉPTIMA: Fuerza Mayor
      checkPageBreak();
      doc.setFont("helvetica", "bold");
      doc.text("DECIMOSÉPTIMA. Fuerza Mayor", margin, yPos);
      yPos += lineHeight;
      doc.setFont("helvetica", "normal");
      yPos = addWrappedText(doc, "Ninguna de las partes será responsable por incumplimientos derivados de eventos de fuerza mayor (desastres naturales, guerras, pandemias, terrorismo, cortes masivos de comunicaciones). La parte afectada notificará inmediatamente a la otra y ambas colaborarán para minimizar el impacto. Si la fuerza mayor persiste por más de ciento ochenta (180) días, cualquier parte podrá resolver el contrato sin penalización.", margin, yPos, 170);
      yPos += lineHeight;

      // CLÁUSULA DECIMOCTAVA: Resolución de Disputas
      checkPageBreak();
      doc.setFont("helvetica", "bold");
      doc.text("DECIMOCTAVA. Resolución de Disputas", margin, yPos);
      yPos += lineHeight;
      doc.setFont("helvetica", "normal");
      yPos = addWrappedText(doc, "Las partes se comprometen a resolver cualquier controversia mediante negociación de buena fe durante sesenta (60) días. Si no se alcanza acuerdo, las disputas se someterán a arbitraje de equidad conforme a las reglas de la Cámara de Comercio Internacional (CCI). El arbitraje será en español, con sede en Madrid, España, y será definitivo y vinculante.", margin, yPos, 170);
      yPos += lineHeight;

      // CLÁUSULA DECIMONOVENA: Notificaciones
      checkPageBreak();
      doc.setFont("helvetica", "bold");
      doc.text("DECIMONOVENA. Notificaciones", margin, yPos);
      yPos += lineHeight;
      doc.setFont("helvetica", "normal");
      yPos = addWrappedText(doc, "Todas las notificaciones contractuales deberán realizarse por escrito a las siguientes direcciones:", margin, yPos, 170);
      yPos += lineHeight;

      yPos = addWrappedText(doc, "GOBIERNO: Ministerio de Interior, [Dirección], Malabo, Guinea Ecuatorial. Email: [email]", margin + 5, yPos, 165);
      yPos += lineHeight;
      yPos = addWrappedText(doc, "BIAKAM: [Dirección completa], Email: [email]", margin + 5, yPos, 165);
      yPos += lineHeight;

      // CLÁUSULA VIGÉSIMA: Legislación Aplicable
      checkPageBreak();
      doc.setFont("helvetica", "bold");
      doc.text("VIGÉSIMA. Legislación Aplicable", margin, yPos);
      yPos += lineHeight;
      doc.setFont("helvetica", "normal");
      yPos = addWrappedText(doc, "El presente contrato se regirá e interpretará conforme a las leyes de Guinea Ecuatorial. En lo no previsto en este contrato, se aplicarán las disposiciones del Código Civil y legislación mercantil vigente.", margin, yPos, 170);
      yPos += lineHeight + 5;

      // Cláusula de aceptación
      checkPageBreak();
      yPos = addWrappedText(doc, "Y en prueba de conformidad, las partes firman el presente contrato por duplicado en el lugar y fecha indicados.", margin, yPos, 170);
      yPos += lineHeight + 10;

      // Firmas
      checkPageBreak();
      doc.setFont("helvetica", "bold");
      doc.text("En Malabo, a ___ de __________ de 2025", margin, yPos);
      yPos += lineHeight * 4;

      doc.text("POR EL GOBIERNO", margin, yPos);
      doc.text("POR BIAKAM", margin + 100, yPos);
      yPos += lineHeight * 3;

      doc.text("_______________________________", margin, yPos);
      doc.text("_______________________________", margin + 100, yPos);
      yPos += lineHeight;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("Ministro de Interior", margin, yPos);
      doc.text("Administrador Único", margin + 100, yPos);
      yPos += lineHeight;
      doc.text("Gobierno de Guinea Ecuatorial", margin, yPos);
      doc.text("Biakam S.L.", margin + 100, yPos);

      doc.save('Contrato_Biakam_Gobierno_Guinea_Ecuatorial.pdf');
      toast({
        title: "Contrato generado",
        description: "El contrato se ha descargado exitosamente",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al generar el contrato",
        variant: "destructive",
      });
    }
  };

  return (
    <Button onClick={generatePDF} variant="outline" className="gap-2">
      <FileText className="h-4 w-4" />
      <Download className="h-4 w-4" />
      Descargar Contrato Biakam-Gobierno
    </Button>
  );
};
