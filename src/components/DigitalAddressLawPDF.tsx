import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';

export const DigitalAddressLawPDF: React.FC = () => {
  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      let yPos = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const maxWidth = pageWidth - (margin * 2);

      // Helper function to add text with automatic page breaks
      const addText = (text: string, fontSize: number = 10, isBold: boolean = false, align: 'left' | 'center' = 'left') => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        
        if (align === 'center') {
          const textWidth = doc.getTextWidth(text);
          const xPos = (pageWidth - textWidth) / 2;
          doc.text(text, xPos, yPos);
          yPos += fontSize / 2 + 2;
        } else {
          const lines = doc.splitTextToSize(text, maxWidth);
          lines.forEach((line: string) => {
            if (yPos > 270) {
              doc.addPage();
              yPos = 20;
            }
            doc.text(line, margin, yPos);
            yPos += fontSize / 2 + 2;
          });
        }
      };

      const addSpace = (space: number = 5) => {
        yPos += space;
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
      };

      // Title Page
      addSpace(40);
      addText('REPÚBLICA DE GUINEA ECUATORIAL', 14, true, 'center');
      addSpace(10);
      addText('LEY N° XX/2025', 16, true, 'center');
      addSpace(5);
      addText('LEY DE SISTEMA NACIONAL DE', 12, true, 'center');
      addText('DIRECCIONES DIGITALES', 12, true, 'center');
      addSpace(30);
      addText('Fecha de promulgación: [Pendiente]', 10, false, 'center');
      addText('Publicación en Boletín Oficial: [Pendiente]', 10, false, 'center');

      // New page for content
      doc.addPage();
      yPos = 20;

      // Preámbulo
      addText('PREÁMBULO', 14, true);
      addSpace(5);
      addText('Considerando que la modernización de la infraestructura nacional requiere la implementación de un sistema estandarizado de direcciones que facilite la prestación de servicios públicos, el desarrollo económico y la seguridad ciudadana;', 10);
      addSpace(3);
      addText('Considerando la necesidad de establecer un marco legal que garantice la correcta identificación de inmuebles y ubicaciones en todo el territorio nacional;', 10);
      addSpace(3);
      addText('Considerando los beneficios en términos de planificación urbana, servicios de emergencia, comercio electrónico y desarrollo social;', 10);
      addSpace(3);
      addText('En virtud de las atribuciones conferidas por la Constitución, el Parlamento aprueba la siguiente Ley:', 10);
      addSpace(10);

      // TÍTULO I
      addText('TÍTULO I', 12, true);
      addText('DISPOSICIONES GENERALES', 12, true);
      addSpace(5);

      addText('Artículo 1. Objeto y Finalidad', 11, true);
      addText('La presente Ley tiene por objeto establecer el marco jurídico para la creación, implementación, gestión y uso del Sistema Nacional de Direcciones Digitales de Guinea Ecuatorial (ConnectNation Address System), con las siguientes finalidades:', 10);
      addText('a) Dotar a todo inmueble del territorio nacional de una dirección digital única y estandarizada;', 10);
      addText('b) Facilitar la prestación eficiente de servicios públicos y privados;', 10);
      addText('c) Mejorar la respuesta de servicios de emergencia;', 10);
      addText('d) Promover el desarrollo económico y el comercio electrónico;', 10);
      addText('e) Fortalecer la planificación urbana y territorial;', 10);
      addText('f) Garantizar el acceso universal a una dirección formal.', 10);
      addSpace(5);

      addText('Artículo 2. Ámbito de Aplicación', 11, true);
      addText('Esta Ley se aplica en todo el territorio de la República de Guinea Ecuatorial, incluyendo la Región Continental y la Región Insular, y vincula a:', 10);
      addText('a) Todas las instituciones del Estado en sus niveles nacional, regional y local;', 10);
      addText('b) Personas físicas y jurídicas, públicas y privadas;', 10);
      addText('c) Organismos nacionales e internacionales que operen en el país.', 10);
      addSpace(5);

      addText('Artículo 3. Definiciones', 11, true);
      addText('Para efectos de esta Ley, se entiende por:', 10);
      addText('a) Dirección Digital: Código alfanumérico único asignado a un inmueble o ubicación específica que permite su identificación precisa mediante coordenadas geográficas;', 10);
      addText('b) UAC (Código Unificado de Dirección): Formato estandarizado de 14 caracteres que identifica de manera única cada dirección en el territorio nacional;', 10);
      addText('c) Sistema Nacional: Plataforma tecnológica integrada que gestiona el registro, verificación y consulta de direcciones digitales;', 10);
      addText('d) Autoridad Nacional de Registro (NAR): Organismo responsable de la administración central del sistema;', 10);
      addText('e) Autoridad de Certificación de Direcciones (CAR): Entidades autorizadas para verificar y certificar direcciones;', 10);
      addText('f) Inmueble: Toda construcción, edificación, terreno o espacio físico susceptible de ser identificado geográficamente.', 10);
      addSpace(10);

      // TÍTULO II
      addText('TÍTULO II', 12, true);
      addText('ORGANIZACIÓN Y GOBERNANZA DEL SISTEMA', 12, true);
      addSpace(5);

      addText('Artículo 4. Autoridad Nacional de Registro de Direcciones', 11, true);
      addText('Se crea la Autoridad Nacional de Registro de Direcciones (NAR) como organismo público adscrito al Ministerio del Interior, con personalidad jurídica y autonomía técnica, administrativa y financiera.', 10);
      addSpace(5);

      addText('Artículo 5. Competencias de la NAR', 11, true);
      addText('Son competencias de la NAR:', 10);
      addText('a) Administrar y supervisar el Sistema Nacional de Direcciones Digitales;', 10);
      addText('b) Establecer normas técnicas y estándares para la asignación de direcciones;', 10);
      addText('c) Mantener el registro nacional de direcciones digitales;', 10);
      addText('d) Autorizar y supervisar a las Autoridades de Certificación;', 10);
      addText('e) Resolver conflictos relacionados con la asignación de direcciones;', 10);
      addText('f) Establecer tarifas para servicios comerciales;', 10);
      addText('g) Celebrar convenios de cooperación con entidades públicas y privadas;', 10);
      addText('h) Garantizar la seguridad y privacidad de los datos del sistema.', 10);
      addSpace(5);

      addText('Artículo 6. Autoridades de Certificación de Direcciones', 11, true);
      addText('Las Autoridades de Certificación de Direcciones (CAR) son entidades públicas o privadas autorizadas por la NAR para:', 10);
      addText('a) Verificar físicamente la existencia y ubicación de inmuebles;', 10);
      addText('b) Validar la información proporcionada por solicitantes;', 10);
      addText('c) Certificar la correspondencia entre direcciones digitales y ubicaciones físicas;', 10);
      addText('d) Realizar inspecciones periódicas de calidad.', 10);
      addSpace(5);

      addText('Artículo 7. Registro Nacional de Direcciones', 11, true);
      addText('Se establece el Registro Nacional de Direcciones Digitales como base de datos oficial que contendrá:', 10);
      addText('a) Código UAC de cada dirección;', 10);
      addText('b) Coordenadas geográficas precisas;', 10);
      addText('c) Información catastral asociada;', 10);
      addText('d) Datos del titular o propietario (protegidos según normativa de privacidad);', 10);
      addText('e) Historial de verificaciones y actualizaciones;', 10);
      addText('f) Estado de la dirección (activa, pendiente, inactiva).', 10);
      addSpace(10);

      // TÍTULO III
      doc.addPage();
      yPos = 20;
      addText('TÍTULO III', 12, true);
      addText('REGISTRO Y ASIGNACIÓN DE DIRECCIONES', 12, true);
      addSpace(5);

      addText('Artículo 8. Derecho a la Dirección Digital', 11, true);
      addText('Todo ciudadano y residente de Guinea Ecuatorial tiene derecho a obtener una dirección digital para su residencia principal de forma gratuita. La solicitud se realizará a través de los canales oficiales establecidos por la NAR.', 10);
      addSpace(5);

      addText('Artículo 9. Obligatoriedad del Registro', 11, true);
      addText('Es obligatorio el registro de direcciones digitales para:', 10);
      addText('a) Todos los inmuebles de nueva construcción;', 10);
      addText('b) Inmuebles donde se realicen actividades comerciales o industriales;', 10);
      addText('c) Sedes de instituciones públicas;', 10);
      addText('d) Instalaciones de servicios públicos esenciales;', 10);
      addText('e) Cualquier otro inmueble según determine el Reglamento.', 10);
      addSpace(5);

      addText('Artículo 10. Procedimiento de Registro', 11, true);
      addText('El registro de una dirección digital seguirá el siguiente procedimiento:', 10);
      addText('1. Solicitud: El interesado presenta solicitud ante la NAR o CAR autorizada, proporcionando documentación requerida;', 10);
      addText('2. Verificación: La CAR realiza inspección física y valida la información;', 10);
      addText('3. Asignación: La NAR asigna el código UAC único;', 10);
      addText('4. Publicación: La dirección se inscribe en el Registro Nacional;', 10);
      addText('5. Certificación: Se emite certificado oficial de dirección digital.', 10);
      addSpace(5);

      addText('Artículo 11. Plazo de Registro', 11, true);
      addText('Los propietarios o titulares de inmuebles existentes dispondrán de un plazo de 24 meses, contados desde la entrada en vigor de esta Ley, para registrar sus inmuebles. Pasado este plazo, la NAR podrá asignar direcciones de oficio.', 10);
      addSpace(5);

      addText('Artículo 12. Actualización de Direcciones', 11, true);
      addText('Los titulares están obligados a notificar a la NAR cualquier cambio que afecte la dirección digital dentro de los 30 días siguientes al cambio. Los cambios incluyen modificaciones estructurales, cambios de uso o demolición del inmueble.', 10);
      addSpace(10);

      // TÍTULO IV
      addText('TÍTULO IV', 12, true);
      addText('USO OBLIGATORIO Y INTEGRACIÓN', 12, true);
      addSpace(5);

      addText('Artículo 13. Uso en Documentos Oficiales', 11, true);
      addText('A partir de la vigencia de esta Ley, todas las instituciones públicas deberán utilizar exclusivamente las direcciones digitales en:', 10);
      addText('a) Documentos de identidad (DNI, pasaportes, carnets);', 10);
      addText('b) Registros civiles (nacimientos, matrimonios, defunciones);', 10);
      addText('c) Registro de la propiedad y catastro;', 10);
      addText('d) Licencias y permisos administrativos;', 10);
      addText('e) Facturas de servicios públicos;', 10);
      addText('f) Cualquier otro documento oficial.', 10);
      addSpace(5);

      addText('Artículo 14. Servicios de Emergencia', 11, true);
      addText('Los servicios de emergencia (policía, bomberos, ambulancias, protección civil) están obligados a integrar el Sistema Nacional en sus plataformas de despacho y respuesta, garantizando localización precisa y reducción de tiempos de respuesta.', 10);
      addSpace(5);

      addText('Artículo 15. Servicios Postales y Mensajería', 11, true);
      addText('Todas las empresas de servicios postales y mensajería, públicas y privadas, deberán adoptar el sistema de direcciones digitales para la entrega de correspondencia y paquetes en un plazo máximo de 12 meses.', 10);
      addSpace(5);

      addText('Artículo 16. Empresas de Servicios Públicos', 11, true);
      addText('Las empresas proveedoras de servicios públicos (agua, electricidad, gas, telecomunicaciones) deberán utilizar las direcciones digitales para:', 10);
      addText('a) Facturación y gestión de clientes;', 10);
      addText('b) Planificación de expansión de redes;', 10);
      addText('c) Atención de averías y mantenimiento;', 10);
      addText('d) Lectura de contadores.', 10);
      addSpace(5);

      addText('Artículo 17. Censos y Estadísticas', 11, true);
      addText('El Instituto Nacional de Estadística utilizará el Sistema Nacional para la realización de censos de población y vivienda, encuestas nacionales y recopilación de datos estadísticos, garantizando mayor precisión y eficiencia.', 10);
      addSpace(10);

      // TÍTULO V
      doc.addPage();
      yPos = 20;
      addText('TÍTULO V', 12, true);
      addText('PROTECCIÓN DE DATOS Y PRIVACIDAD', 12, true);
      addSpace(5);

      addText('Artículo 18. Protección de Datos Personales', 11, true);
      addText('El tratamiento de datos personales en el Sistema Nacional se regirá por la legislación vigente en materia de protección de datos y por los siguientes principios:', 10);
      addText('a) Licitud, lealtad y transparencia;', 10);
      addText('b) Limitación de la finalidad;', 10);
      addText('c) Minimización de datos;', 10);
      addText('d) Exactitud;', 10);
      addText('e) Limitación del plazo de conservación;', 10);
      addText('f) Integridad y confidencialidad.', 10);
      addSpace(5);

      addText('Artículo 19. Información Pública y Privada', 11, true);
      addText('Se establece la siguiente clasificación:', 10);
      addText('a) Información Pública: Código UAC, coordenadas geográficas, municipio, región (accesible sin restricciones);', 10);
      addText('b) Información Restringida: Datos del propietario, fotografías interiores, información catastral detallada (requiere autorización o justificación legal).', 10);
      addSpace(5);

      addText('Artículo 20. Consentimiento y Derechos', 11, true);
      addText('Los titulares de direcciones digitales tienen derecho a:', 10);
      addText('a) Acceder a sus datos personales;', 10);
      addText('b) Rectificar información incorrecta;', 10);
      addText('c) Limitar el tratamiento de datos sensibles;', 10);
      addText('d) Oponerse a usos no autorizados;', 10);
      addText('e) Solicitar la portabilidad de sus datos.', 10);
      addSpace(5);

      addText('Artículo 21. Medidas de Seguridad', 11, true);
      addText('La NAR implementará medidas técnicas y organizativas apropiadas para garantizar la seguridad de los datos, incluyendo encriptación, control de acceso, auditorías periódicas y protocolos de respuesta a incidentes.', 10);
      addSpace(10);

      // TÍTULO VI
      addText('TÍTULO VI', 12, true);
      addText('MONETIZACIÓN Y SOSTENIBILIDAD FINANCIERA', 12, true);
      addSpace(5);

      addText('Artículo 22. Servicios Gratuitos', 11, true);
      addText('Son gratuitos:', 10);
      addText('a) Registro de dirección de residencia principal para ciudadanos;', 10);
      addText('b) Consultas básicas en portal público;', 10);
      addText('c) Uso por servicios de emergencia;', 10);
      addText('d) Acceso para fines educativos e investigación académica.', 10);
      addSpace(5);

      addText('Artículo 23. Servicios de Pago', 11, true);
      addText('Están sujetos a tarifas establecidas por la NAR:', 10);
      addText('a) Acceso API para empresas (por volumen de consultas);', 10);
      addText('b) Registro de múltiples propiedades comerciales;', 10);
      addText('c) Certificaciones oficiales urgentes;', 10);
      addText('d) Servicios de verificación acelerada;', 10);
      addText('e) Integración de sistemas empresariales;', 10);
      addText('f) Licencias para desarrolladores externos.', 10);
      addSpace(5);

      addText('Artículo 24. Estructura de Tarifas', 11, true);
      addText('La NAR establecerá mediante resolución:', 10);
      addText('a) Tarifas diferenciadas por tipo de usuario (PYME, gran empresa, gobierno);', 10);
      addText('b) Descuentos por volumen y contratos anuales;', 10);
      addText('c) Tarifas promocionales para adopción temprana;', 10);
      addText('d) Revisiones anuales según inflación y costos operativos.', 10);
      addSpace(5);

      addText('Artículo 25. Fondo de Sostenibilidad', 11, true);
      addText('Se crea el Fondo de Sostenibilidad del Sistema Nacional, constituido por:', 10);
      addText('a) Asignaciones presupuestarias del Estado;', 10);
      addText('b) Ingresos por servicios comerciales;', 10);
      addText('c) Multas y sanciones administrativas;', 10);
      addText('d) Donaciones y cooperación internacional;', 10);
      addText('e) Rendimientos financieros del fondo.', 10);
      addSpace(10);

      // TÍTULO VII
      doc.addPage();
      yPos = 20;
      addText('TÍTULO VII', 12, true);
      addText('INFRACCIONES Y SANCIONES', 12, true);
      addSpace(5);

      addText('Artículo 26. Infracciones Leves', 11, true);
      addText('Constituyen infracciones leves:', 10);
      addText('a) No actualizar información de dirección en plazo establecido;', 10);
      addText('b) Proporcionar información incompleta sin intención fraudulenta;', 10);
      addText('c) Incumplimiento de requisitos formales de solicitud.', 10);
      addText('Sanción: Amonestación o multa de 50.000 a 200.000 francos CFA.', 10);
      addSpace(5);

      addText('Artículo 27. Infracciones Graves', 11, true);
      addText('Constituyen infracciones graves:', 10);
      addText('a) No registrar inmuebles obligatorios en plazo legal;', 10);
      addText('b) Uso de direcciones falsas en documentos;', 10);
      addText('c) Negativa de instituciones públicas a adoptar el sistema;', 10);
      addText('d) Divulgación no autorizada de datos protegidos.', 10);
      addText('Sanción: Multa de 200.000 a 1.000.000 francos CFA.', 10);
      addSpace(5);

      addText('Artículo 28. Infracciones Muy Graves', 11, true);
      addText('Constituyen infracciones muy graves:', 10);
      addText('a) Alteración maliciosa de la base de datos;', 10);
      addText('b) Creación fraudulenta de direcciones;', 10);
      addText('c) Uso comercial no autorizado de datos del sistema;', 10);
      addText('d) Obstaculización sistemática de la implementación.', 10);
      addText('Sanción: Multa de 1.000.000 a 5.000.000 francos CFA y/o suspensión de licencias.', 10);
      addSpace(5);

      addText('Artículo 29. Procedimiento Sancionador', 11, true);
      addText('El procedimiento sancionador se regirá por los principios de legalidad, debido proceso, presunción de inocencia y proporcionalidad. Los infractores tendrán derecho a ser notificados, presentar alegaciones y recurrir las sanciones.', 10);
      addSpace(10);

      // TÍTULO VIII
      addText('TÍTULO VIII', 12, true);
      addText('ASOCIACIONES PÚBLICO-PRIVADAS', 12, true);
      addSpace(5);

      addText('Artículo 30. Alianzas Estratégicas', 11, true);
      addText('La NAR podrá celebrar convenios con entidades privadas nacionales e internacionales para:', 10);
      addText('a) Cofinanciamiento de infraestructura tecnológica;', 10);
      addText('b) Desarrollo de aplicaciones y servicios complementarios;', 10);
      addText('c) Capacitación técnica y transferencia de conocimiento;', 10);
      addText('d) Expansión de cobertura en zonas remotas.', 10);
      addSpace(5);

      addText('Artículo 31. Participación del Sector Privado', 11, true);
      addText('Las empresas privadas podrán participar como:', 10);
      addText('a) Autoridades de Certificación autorizadas;', 10);
      addText('b) Proveedores de servicios tecnológicos;', 10);
      addText('c) Desarrolladores de soluciones integradas;', 10);
      addText('d) Socios en modelos de negocio compartidos.', 10);
      addSpace(10);

      // DISPOSICIONES TRANSITORIAS
      addText('DISPOSICIONES TRANSITORIAS', 12, true);
      addSpace(5);

      addText('Primera. Implementación Gradual', 11, true);
      addText('La implementación del Sistema Nacional se realizará de forma gradual en tres fases:', 10);
      addText('Fase 1 (Meses 1-12): Malabo, Bata y principales ciudades;', 10);
      addText('Fase 2 (Meses 13-24): Capitales regionales y municipios secundarios;', 10);
      addText('Fase 3 (Meses 25-36): Zonas rurales y áreas remotas.', 10);
      addSpace(5);

      addText('Segunda. Coexistencia de Sistemas', 11, true);
      addText('Durante el período de transición, coexistirán el sistema tradicional y el sistema digital. Las instituciones aceptarán ambos formatos hasta la finalización de la Fase 3.', 10);
      addSpace(5);

      addText('Tercera. Capacitación Institucional', 11, true);
      addText('El Gobierno, a través de la NAR, ejecutará programa nacional de capacitación para funcionarios públicos, empresas de servicios y ciudadanos en un plazo de 18 meses.', 10);
      addSpace(5);

      addText('Cuarta. Presupuesto Inicial', 11, true);
      addText('El Ministerio de Economía asignará presupuesto extraordinario para la implementación inicial del sistema durante los primeros tres años fiscales.', 10);
      addSpace(10);

      // DISPOSICIONES FINALES
      addText('DISPOSICIONES FINALES', 12, true);
      addSpace(5);

      addText('Primera. Desarrollo Reglamentario', 11, true);
      addText('El Gobierno aprobará el Reglamento de esta Ley en un plazo máximo de 6 meses desde su entrada en vigor, detallando procedimientos técnicos, formularios, tarifas y estándares.', 10);
      addSpace(5);

      addText('Segunda. Modificaciones Legislativas', 11, true);
      addText('Se autoriza al Gobierno para adecuar mediante decreto la normativa vigente en materia de registro civil, catastro, urbanismo y servicios públicos para su armonización con esta Ley.', 10);
      addSpace(5);

      addText('Tercera. Entrada en Vigor', 11, true);
      addText('Esta Ley entrará en vigor a los tres meses de su publicación en el Boletín Oficial del Estado, con excepción de las disposiciones que expresamente establezcan otro plazo.', 10);
      addSpace(5);

      addText('Cuarta. Revisión y Evaluación', 11, true);
      addText('Transcurridos cinco años desde la entrada en vigor, el Gobierno presentará al Parlamento un informe de evaluación del sistema y propondrá, si procede, las modificaciones necesarias.', 10);
      addSpace(15);

      // Signature section
      addText('Dada en Malabo, a los ____ días del mes de __________ de dos mil veinticinco.', 10, false, 'center');
      addSpace(20);
      addText('EL PRESIDENTE DE LA REPÚBLICA', 10, true, 'center');
      addSpace(15);
      addText('_______________________________', 10, false, 'center');

      // Save PDF
      doc.save('Ley_Direcciones_Digitales_Guinea_Ecuatorial.pdf');
      toast.success('Documento de Ley generado exitosamente');
    } catch (error) {
      console.error('Error generating law PDF:', error);
      toast.error('Error al generar el documento de Ley');
    }
  };

  return (
    <Button onClick={generatePDF} variant="outline" className="gap-2">
      <FileText className="h-4 w-4" />
      Descargar Ley de Direcciones Digitales (PDF)
    </Button>
  );
};
