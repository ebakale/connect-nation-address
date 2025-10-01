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
      addText('DECRETO PRESIDENCIAL N° XX/2025', 16, true, 'center');
      addSpace(10);
      addText('REGLAMENTO DE IMPLEMENTACIÓN DEL', 12, true, 'center');
      addText('SISTEMA NACIONAL DE DIRECCIONES DIGITALES', 12, true, 'center');
      addText('CONNECTNATION ADDRESS', 12, true, 'center');
      addSpace(30);
      addText('Fecha de promulgación: [Pendiente]', 10, false, 'center');
      addText('Publicación en Boletín Oficial: [Pendiente]', 10, false, 'center');

      // New page for content
      doc.addPage();
      yPos = 20;

      // Preámbulo
      addText('EL PRESIDENTE DE LA REPÚBLICA DE GUINEA ECUATORIAL', 12, true, 'center');
      addSpace(10);
      addText('CONSIDERANDO:', 11, true);
      addSpace(5);
      addText('Que la modernización del Estado requiere la implementación urgente de un Sistema Nacional de Direcciones Digitales para mejorar la prestación de servicios públicos, facilitar el desarrollo económico y garantizar respuestas eficientes en situaciones de emergencia;', 10);
      addSpace(3);
      addText('Que la empresa Biakam, con sede en Guinea Ecuatorial, ha desarrollado la plataforma tecnológica ConnectNation Address System, probada y lista para su implementación inmediata a nivel nacional;', 10);
      addSpace(3);
      addText('Que resulta estratégico para el país establecer una asociación público-privada que permita aprovechar la innovación tecnológica privada bajo supervisión y regulación gubernamental;', 10);
      addSpace(3);
      addText('Que es necesario establecer el marco operativo para la implementación coordinada del sistema mientras se tramita la ley correspondiente en el Parlamento;', 10);
      addSpace(3);
      addText('En uso de las atribuciones que me confiere la Constitución de la República;', 10);
      addSpace(5);
      addText('DECRETO:', 12, true, 'center');
      addSpace(10);

      // CAPÍTULO I
      addText('CAPÍTULO I', 12, true);
      addText('DISPOSICIONES GENERALES Y OBJETO DEL DECRETO', 12, true);
      addSpace(5);

      addText('Artículo 1. Objeto del Decreto', 11, true);
      addText('El presente Decreto tiene por objeto establecer el marco operativo inmediato para la implementación del Sistema Nacional de Direcciones Digitales ConnectNation Address, desarrollado por la empresa Biakam, mediante un modelo de licenciamiento gubernamental y regulación pública.', 10);
      addSpace(5);

      addText('Artículo 2. Reconocimiento del Operador Tecnológico', 11, true);
      addText('Se reconoce a Biakam, empresa registrada en Guinea Ecuatorial, como operador tecnológico autorizado del Sistema Nacional de Direcciones Digitales ConnectNation Address, en calidad de propietaria de la plataforma, sus algoritmos, códigos y desarrollos tecnológicos asociados.', 10);
      addSpace(5);

      addText('Artículo 3. Modelo de Licenciamiento', 11, true);
      addText('El Gobierno de Guinea Ecuatorial actuará como licenciatario del sistema para uso institucional completo, pagando una licencia anual según contrato de asociación público-privada que se detalla en este Decreto.', 10);
      addSpace(10);

      // CAPÍTULO II
      addText('CAPÍTULO II', 12, true);
      addText('ESTRUCTURA DE LA ASOCIACIÓN PÚBLICO-PRIVADA', 12, true);
      addSpace(5);

      addText('Artículo 4. Roles y Responsabilidades de Biakam', 11, true);
      addText('Biakam, como operador tecnológico privado, asume las siguientes responsabilidades:', 10);
      addText('a) Propiedad y gestión de la infraestructura tecnológica (servidores, bases de datos, plataforma);', 10);
      addText('b) Garantía de disponibilidad del sistema 24/7 con SLA (Acuerdo de Nivel de Servicio) del 99.9%;', 10);
      addText('c) Provisión de soporte técnico continuo al Gobierno y usuarios;', 10);
      addText('d) Seguridad informática, encriptación y respaldo de datos;', 10);
      addText('e) Actualizaciones tecnológicas y mejoras continuas sin costo adicional para el Gobierno;', 10);
      addText('f) Capacitación inicial y continua de funcionarios públicos;', 10);
      addText('g) Cumplimiento estricto de normativas de protección de datos;', 10);
      addText('h) Desarrollo de nuevas funcionalidades según necesidades del Gobierno.', 10);
      addSpace(5);

      addText('Artículo 5. Roles y Responsabilidades del Gobierno', 11, true);
      addText('El Gobierno de Guinea Ecuatorial, como licenciatario y regulador, asume las siguientes responsabilidades:', 10);
      addText('a) Pago puntual de licencia anual según contrato establecido;', 10);
      addText('b) Promoción activa y obligatoriedad de uso en instituciones públicas;', 10);
      addText('c) Regulación y supervisión del cumplimiento legal;', 10);
      addText('d) Protección del interés público y acceso ciudadano;', 10);
      addText('e) Facilitación de datos públicos necesarios para funcionamiento del sistema;', 10);
      addText('f) Coordinación de campañas nacionales de adopción;', 10);
      addText('g) Garantía de gratuidad del registro básico para ciudadanos;', 10);
      addText('h) Supervisión de tarifas comerciales a terceros.', 10);
      addSpace(5);

      addText('Artículo 6. Estructura de Licenciamiento Gubernamental', 11, true);
      addText('Se establece la siguiente estructura de licenciamiento:', 10);
      addText('Fase de Implementación (Años 1-3): Licencia anual de 2.5 millones de dólares estadounidenses, incluyendo implementación completa, capacitación masiva y soporte intensivo;', 10);
      addText('Fase de Operación (Año 4 en adelante): Licencia anual de 1.8 millones de dólares estadounidenses para operación, mantenimiento, actualizaciones y soporte continuo.', 10);
      addSpace(5);

      addText('Artículo 7. Servicios Incluidos en Licencia Gubernamental', 11, true);
      addText('La licencia gubernamental incluye:', 10);
      addText('a) Uso ilimitado del sistema por todas las instituciones públicas;', 10);
      addText('b) Registro gratuito de direcciones digitales para todos los ciudadanos;', 10);
      addText('c) Acceso completo a panel de administración y analíticas;', 10);
      addText('d) Soporte técnico 24/7 con tiempo de respuesta garantizado;', 10);
      addText('e) Capacitación inicial de 5,000 funcionarios públicos;', 10);
      addText('f) Capacitación continua anual de 1,000 funcionarios adicionales;', 10);
      addText('g) Actualizaciones tecnológicas sin costo adicional;', 10);
      addText('h) SLA del 99.9% de disponibilidad con penalidades por incumplimiento;', 10);
      addText('i) Respaldo diario de datos con retención de 7 años.', 10);
      addSpace(10);

      // CAPÍTULO III
      doc.addPage();
      yPos = 20;
      addText('CAPÍTULO III', 12, true);
      addText('CREACIÓN DE LA AUTORIDAD NACIONAL DE REGISTRO (NAR)', 12, true);
      addSpace(5);

      addText('Artículo 8. Establecimiento de la NAR', 11, true);
      addText('Se crea la Autoridad Nacional de Registro de Direcciones (NAR) como organismo público adscrito al Ministerio del Interior, con personalidad jurídica, autonomía técnica y presupuesto asignado.', 10);
      addSpace(5);

      addText('Artículo 9. Funciones de la NAR', 11, true);
      addText('La NAR tendrá las siguientes funciones:', 10);
      addText('a) Actuar como interlocutor oficial entre el Gobierno y Biakam;', 10);
      addText('b) Supervisar el cumplimiento del contrato de licenciamiento;', 10);
      addText('c) Coordinar la implementación en instituciones públicas;', 10);
      addText('d) Gestionar la integración con registros existentes (catastro, civil);', 10);
      addText('e) Autorizar y supervisar Autoridades de Certificación (CAR);', 10);
      addText('f) Establecer y revisar tarifas para servicios comerciales;', 10);
      addText('g) Resolver conflictos relacionados con direcciones;', 10);
      addText('h) Garantizar protección de datos y privacidad ciudadana;', 10);
      addText('i) Reportar trimestralmente al Presidente sobre avances.', 10);
      addSpace(5);

      addText('Artículo 10. Estructura y Personal de la NAR', 11, true);
      addText('La NAR contará con:', 10);
      addText('- Director Ejecutivo: Nombrado por el Ministro del Interior', 10);
      addText('- Subdirector Técnico: Especialista en sistemas de información geográfica', 10);
      addText('- Subdirector Administrativo: Responsable de contratos y supervisión', 10);
      addText('- Departamento de Verificación y Certificación', 10);
      addText('- Departamento de Tecnología e Integraciones', 10);
      addText('- Departamento Legal y Protección de Datos', 10);
      addText('- Departamento de Comunicación y Adopción Ciudadana', 10);
      addText('Personal inicial: 25 funcionarios. Personal objetivo año 3: 60 funcionarios.', 10);
      addSpace(5);

      addText('Artículo 11. Presupuesto Inicial de la NAR', 11, true);
      addText('Se asigna a la NAR un presupuesto extraordinario inicial de:', 10);
      addText('Año 1: $800,000 (equipamiento, contratación, oficinas)', 10);
      addText('Año 2: $600,000 (operación, expansión de personal)', 10);
      addText('Año 3 en adelante: $450,000 anuales (operación estable)', 10);
      addSpace(10);

      // CAPÍTULO IV
      addText('CAPÍTULO IV', 12, true);
      addText('IMPLEMENTACIÓN POR FASES', 12, true);
      addSpace(5);

      addText('Artículo 12. Calendario de Implementación', 11, true);
      addText('La implementación del sistema se realizará en tres fases progresivas:', 10);
      addSpace(3);
      addText('FASE 1 - Ciudades Principales (Meses 1-12):', 10, true);
      addText('- Malabo: Implementación completa en 6 meses', 10);
      addText('- Bata: Implementación completa en 9 meses', 10);
      addText('- Meta: 80% de direcciones registradas en áreas urbanas principales', 10);
      addText('- Servicios prioritarios: Emergencias (policía, bomberos, ambulancias)', 10);
      addSpace(3);
      addText('FASE 2 - Capitales Provinciales y Ciudades Secundarias (Meses 13-24):', 10, true);
      addText('- Evinayong, Ebebiyin, Mongomo, Luba, Riaba', 10);
      addText('- Meta: 60% de direcciones registradas en ciudades secundarias', 10);
      addText('- Expansión de servicios: Postal, servicios públicos (agua, electricidad)', 10);
      addSpace(3);
      addText('FASE 3 - Zonas Rurales y Remotas (Meses 25-36):', 10, true);
      addText('- Comunidades rurales y áreas remotas', 10);
      addText('- Meta: 40% de cobertura en zonas rurales', 10);
      addText('- Unidades móviles de registro y verificación', 10);
      addSpace(5);

      addText('Artículo 13. Instituciones Obligadas por Fase', 11, true);
      addText('Fase 1 (Meses 1-12):', 10);
      addText('- Ministerio del Interior, Policía Nacional, Bomberos', 10);
      addText('- Servicios de Emergencia y Protección Civil', 10);
      addText('- Registro Civil y Catastro Nacional', 10);
      addSpace(3);
      addText('Fase 2 (Meses 13-24):', 10);
      addText('- Correos de Guinea Ecuatorial', 10);
      addText('- Empresas de servicios públicos (SEGESA, SOMAGEC)', 10);
      addText('- Ministerios de Salud, Educación, Agricultura', 10);
      addSpace(3);
      addText('Fase 3 (Meses 25-36):', 10);
      addText('- Todos los demás ministerios y organismos públicos', 10);
      addText('- Gobiernos provinciales y municipales', 10);
      addText('- Instituciones educativas y sanitarias', 10);
      addSpace(10);

      // CAPÍTULO V
      doc.addPage();
      yPos = 20;
      addText('CAPÍTULO V', 12, true);
      addText('PROTECCIÓN DE DATOS Y SUPERVISIÓN', 12, true);
      addSpace(5);

      addText('Artículo 14. Protección de Datos con Operador Privado', 11, true);
      addText('Dado que Biakam, operador privado, gestionará datos personales de ciudadanos, se establecen las siguientes salvaguardas:', 10);
      addText('a) Auditorías gubernamentales trimestrales de seguridad y privacidad;', 10);
      addText('b) Encriptación obligatoria de datos sensibles (AES-256);', 10);
      addText('c) Servidores físicamente ubicados en territorio de Guinea Ecuatorial;', 10);
      addText('d) Prohibición de transferencia internacional de datos sin autorización;', 10);
      addText('e) Acceso gubernamental a logs completos de acceso a datos;', 10);
      addText('f) Oficial de Protección de Datos independiente nombrado por el Gobierno;', 10);
      addText('g) Multas de hasta $500,000 por violaciones de privacidad;', 10);
      addText('h) Derecho gubernamental de auditoría sorpresa sin previo aviso.', 10);
      addSpace(5);

      addText('Artículo 15. Comité de Supervisión Presidencial', 11, true);
      addText('Se crea Comité de Supervisión presidido por el Ministro del Interior e integrado por:', 10);
      addText('- Director de la NAR', 10);
      addText('- Representante del Ministerio de Economía', 10);
      addText('- Representante del Ministerio de Justicia', 10);
      addText('- Oficial de Protección de Datos', 10);
      addText('- Representante de Biakam (con voz pero sin voto)', 10);
      addText('Funciones: Supervisión trimestral, evaluación de cumplimiento contractual, aprobación de cambios mayores.', 10);
      addSpace(5);

      addText('Artículo 16. Indicadores de Desempeño del Operador', 11, true);
      addText('Biakam será evaluada trimestralmente según los siguientes KPIs:', 10);
      addText('- Disponibilidad del sistema: Mínimo 99.9% (penalidad: 1% reducción de pago mensual por cada 0.1% bajo meta)', 10);
      addText('- Tiempo de respuesta de API: <200ms promedio', 10);
      addText('- Tiempo de resolución de soporte: Crítico <1h, Alto <4h, Medio <24h', 10);
      addText('- Satisfacción de usuarios institucionales: >85% (encuesta trimestral)', 10);
      addText('- Incidentes de seguridad: 0 críticos, máximo 2 menores/trimestre', 10);
      addSpace(10);

      // CAPÍTULO VI
      addText('CAPÍTULO VI', 12, true);
      addText('MODELO ECONÓMICO Y SOSTENIBILIDAD', 12, true);
      addSpace(5);

      addText('Artículo 17. Fuentes de Ingreso de Biakam', 11, true);
      addText('Biakam podrá generar ingresos mediante:', 10);
      addText('1. Licencia gubernamental anual (según Art. 6)', 10);
      addText('2. Licencias comerciales a empresas privadas para acceso API', 10);
      addText('3. Servicios de consultoría e integración tecnológica', 10);
      addText('4. Servicios premium de analítica avanzada', 10);
      addSpace(3);
      addText('Todas las tarifas comerciales (punto 2-4) requerirán aprobación de la NAR para garantizar precios justos y competitivos.', 10);
      addSpace(5);

      addText('Artículo 18. Tarifas Comerciales Máximas Autorizadas', 11, true);
      addText('Se establecen las siguientes tarifas máximas para servicios comerciales:', 10);
      addText('API Básica: $0.001 por consulta (volumen >100,000/mes)', 10);
      addText('API Premium: $0.003 por consulta (incluye datos enriquecidos)', 10);
      addText('Integración empresarial: $5,000 - $20,000 según complejidad', 10);
      addText('Suscripción mensual PYME: $50 - $200 según volumen', 10);
      addText('Suscripción mensual gran empresa: $500 - $2,000 según volumen', 10);
      addText('Analítica avanzada: $300 - $1,500/mes según alcance', 10);
      addSpace(3);
      addText('Biakam podrá ofrecer descuentos pero no exceder estos máximos sin autorización de NAR.', 10);
      addSpace(5);

      addText('Artículo 19. Gratuidad para Ciudadanos', 11, true);
      addText('El Gobierno garantiza que ningún ciudadano pagará por:', 10);
      addText('a) Registro de su dirección de residencia principal', 10);
      addText('b) Actualización de datos de su dirección', 10);
      addText('c) Consulta básica en portal público', 10);
      addText('d) Obtención de código UAC y certificado básico', 10);
      addText('Estos servicios están cubiertos por la licencia gubernamental.', 10);
      addSpace(5);

      addText('Artículo 20. Cláusula de Exclusividad Temporal', 11, true);
      addText('Durante la vigencia del contrato (renovable cada 5 años), el Gobierno se compromete a:', 10);
      addText('a) No desarrollar ni licenciar sistema alternativo de direcciones digitales', 10);
      addText('b) No autorizar a terceros para crear sistemas competidores', 10);
      addText('c) Promover activamente ConnectNation como estándar nacional', 10);
      addText('Esta exclusividad puede revocarse por incumplimiento grave de Biakam certificado por auditoría independiente.', 10);
      addSpace(10);

      // CAPÍTULO VII
      doc.addPage();
      yPos = 20;
      addText('CAPÍTULO VII', 12, true);
      addText('CAPACITACIÓN Y ADOPCIÓN', 12, true);
      addSpace(5);

      addText('Artículo 21. Programa Nacional de Capacitación', 11, true);
      addText('Biakam ejecutará, como parte de la licencia, el siguiente programa de capacitación:', 10);
      addText('Año 1:', 10);
      addText('- 200 verificadores de campo (capacitación intensiva 2 semanas)', 10);
      addText('- 500 funcionarios de instituciones prioritarias (capacitación 3 días)', 10);
      addText('- 50 administradores de sistemas (capacitación técnica 1 semana)', 10);
      addText('Año 2:', 10);
      addText('- 300 verificadores adicionales', 10);
      addText('- 800 funcionarios de servicios públicos', 10);
      addText('- Talleres en 10 provincias', 10);
      addText('Año 3 en adelante:', 10);
      addText('- 1,000 funcionarios anuales (capacitación continua)', 10);
      addSpace(5);

      addText('Artículo 22. Campaña Nacional de Sensibilización', 11, true);
      addText('El Gobierno, con apoyo técnico de Biakam, ejecutará campaña masiva incluyendo:', 10);
      addText('a) Spots televisivos y radiales en lenguas locales (español, francés, fang, bubi)', 10);
      addText('b) Material impreso distribuido en escuelas, mercados y centros comunitarios', 10);
      addText('c) Embajadores provinciales del sistema (1 por provincia)', 10);
      addText('d) Jornadas de registro comunitarias con unidades móviles', 10);
      addText('e) Línea telefónica gratuita de atención (incluida en licencia)', 10);
      addText('f) Portal web y app móvil en múltiples idiomas', 10);
      addSpace(10);

      // CAPÍTULO VIII
      addText('CAPÍTULO VIII', 12, true);
      addText('SANCIONES Y RESOLUCIÓN DE CONFLICTOS', 12, true);
      addSpace(5);

      addText('Artículo 23. Sanciones a Instituciones Públicas', 11, true);
      addText('Las instituciones públicas que no cumplan plazos de adopción establecidos enfrentarán:', 10);
      addText('- Amonestación escrita del Presidente a titular de la institución', 10);
      addText('- Suspensión de 20% del presupuesto discrecional hasta cumplimiento', 10);
      addText('- Remoción del titular por incumplimiento reiterado (3 meses sin justificación)', 10);
      addSpace(5);

      addText('Artículo 24. Penalidades Contractuales a Biakam', 11, true);
      addText('Biakam enfrentará las siguientes penalidades por incumplimiento:', 10);
      addText('- Disponibilidad <99.9%: Reducción de 1% del pago mensual por cada 0.1% deficitario', 10);
      addText('- Incidente de seguridad crítico: Multa de $50,000 - $200,000 según gravedad', 10);
      addText('- Violación de privacidad: Multa de hasta $500,000 + posible rescisión de contrato', 10);
      addText('- Incumplimiento de capacitación: Reducción proporcional del pago anual', 10);
      addText('- Violación de exclusividad geográfica: Multa de $1,000,000 + rescisión', 10);
      addSpace(5);

      addText('Artículo 25. Mecanismo de Resolución de Controversias', 11, true);
      addText('Las controversias entre Gobierno y Biakam se resolverán mediante:', 10);
      addText('1. Negociación directa (plazo: 30 días)', 10);
      addText('2. Mediación del Comité de Supervisión (plazo: 45 días)', 10);
      addText('3. Arbitraje según normativa de Guinea Ecuatorial (vinculante)', 10);
      addText('Jurisdicción exclusiva: Tribunales de Malabo.', 10);
      addSpace(5);

      addText('Artículo 26. Causales de Rescisión del Contrato', 11, true);
      addText('El contrato puede rescindirse por:', 10);
      addText('Por parte del Gobierno:', 10);
      addText('- Incumplimiento grave reiterado de SLA (3 trimestres consecutivos)', 10);
      addText('- Violación grave de seguridad o privacidad', 10);
      addText('- Insolvencia financiera de Biakam', 10);
      addText('Por parte de Biakam:', 10);
      addText('- Falta de pago gubernamental por 6 meses consecutivos', 10);
      addText('- Interferencia indebida del Gobierno en operaciones técnicas', 10);
      addSpace(3);
      addText('En caso de rescisión, se aplicará cláusula de reversión (Art. 27).', 10);
      addSpace(10);

      // CAPÍTULO IX
      doc.addPage();
      yPos = 20;
      addText('CAPÍTULO IX', 12, true);
      addText('CLÁUSULA DE REVERSIÓN Y CONTINUIDAD', 12, true);
      addSpace(5);

      addText('Artículo 27. Plan de Reversión Tecnológica', 11, true);
      addText('En caso de rescisión del contrato o cese de operaciones de Biakam, se activará protocolo de reversión:', 10);
      addText('a) Biakam transferirá base de datos completa al Gobierno (formato abierto)', 10);
      addText('b) Biakam proporcionará documentación técnica completa', 10);
      addText('c) Biakam capacitará a equipo gubernamental de transición (60 días)', 10);
      addText('d) Gobierno tendrá derecho a licencia perpetua del software (sin soporte)', 10);
      addText('e) Periodo de transición asistida de 6 meses', 10);
      addSpace(3);
      addText('Biakam mantendrá backup actualizado mensualmente en custodia de tercero neutral designado por NAR.', 10);
      addSpace(5);

      addText('Artículo 28. Garantía de Continuidad del Servicio', 11, true);
      addText('Para garantizar continuidad operativa:', 10);
      addText('a) Biakam depositará fianza de cumplimiento de $500,000 renovable anualmente', 10);
      addText('b) Biakam contratará seguro de responsabilidad civil por $2,000,000', 10);
      addText('c) Gobierno destinará fondo de contingencia de $1,000,000 para migración de emergencia', 10);
      addSpace(10);

      // CAPÍTULO X
      addText('CAPÍTULO X', 12, true);
      addText('INCENTIVOS Y PROMOCIÓN', 12, true);
      addSpace(5);

      addText('Artículo 29. Incentivos Fiscales a Empresas Adoptantes', 11, true);
      addText('Las empresas privadas que adopten ConnectNation recibirán:', 10);
      addText('a) Reducción de 15% en impuesto sobre sociedades (primer año de adopción)', 10);
      addText('b) Prioridad en licitaciones públicas (criterio de evaluación)', 10);
      addText('c) Sello de "Empresa Digitalmente Verificada" para marketing', 10);
      addText('d) Capacitación gratuita del personal (incluida en licencia gubernamental)', 10);
      addSpace(5);

      addText('Artículo 30. Reconocimientos Institucionales', 11, true);
      addText('Se otorgarán reconocimientos presidenciales anuales a:', 10);
      addText('- Institución pública con mayor nivel de adopción', 10);
      addText('- Municipio con mejor cobertura de registro', 10);
      addText('- Empresa privada líder en integración', 10);
      addText('Premios incluyen placa presidencial y publicación en medios oficiales.', 10);
      addSpace(10);

      // DISPOSICIONES FINALES
      addText('DISPOSICIONES FINALES', 12, true);
      addSpace(5);

      addText('Primera. Autorización Contractual', 11, true);
      addText('Se autoriza al Ministro del Interior a suscribir contrato de licenciamiento con Biakam según términos establecidos en este Decreto, con vigencia inicial de 5 años renovable automáticamente salvo notificación contraria con 12 meses de anticipación.', 10);
      addSpace(5);

      addText('Segunda. Asignación Presupuestaria', 11, true);
      addText('El Ministerio de Economía asignará para el ejercicio fiscal en curso:', 10);
      addText('- Licencia anual a Biakam: $2,500,000', 10);
      addText('- Presupuesto NAR (establecimiento): $800,000', 10);
      addText('- Campaña de sensibilización: $300,000', 10);
      addText('- Fondo de contingencia: $400,000', 10);
      addText('Total: $4,000,000 (financiado por presupuesto extraordinario de modernización)', 10);
      addSpace(5);

      addText('Tercera. Comisión de Implementación', 11, true);
      addText('Se crea Comisión Interministerial de Implementación presidida por Ministro del Interior e integrada por representantes de todos los ministerios. Reuniones mensuales durante primeros 24 meses.', 10);
      addSpace(5);

      addText('Cuarta. Vigencia Inmediata', 11, true);
      addText('Este Decreto entra en vigor inmediatamente desde su publicación en el Boletín Oficial del Estado y será aplicable mientras se tramita la ley correspondiente en el Parlamento.', 10);
      addSpace(5);

      addText('Quinta. Transición a Marco Legal Definitivo', 11, true);
      addText('Una vez aprobada la Ley de Direcciones Digitales por el Parlamento, este Decreto se mantendrá vigente en todo lo que no contradiga la Ley, actuando como reglamento de desarrollo de la misma.', 10);
      addSpace(5);

      addText('Sexta. Publicidad y Difusión', 11, true);
      addText('Este Decreto será:', 10);
      addText('a) Publicado en Boletín Oficial del Estado', 10);
      addText('b) Difundido en medios de comunicación nacionales', 10);
      addText('c) Traducido a lenguas locales (francés, fang, bubi)', 10);
      addText('d) Notificado personalmente a todos los ministros y gobernadores provinciales', 10);
      addText('e) Publicado en portal web oficial del Gobierno', 10);
      addSpace(15);

      // Signature section
      addText('Dado en Malabo, a los ____ días del mes de __________ de dos mil veinticinco.', 10, false, 'center');
      addSpace(20);
      addText('EL PRESIDENTE DE LA REPÚBLICA', 10, true, 'center');
      addSpace(15);
      addText('_______________________________', 10, false, 'center');
      addSpace(10);
      addText('POR ORDEN DEL PRESIDENTE:', 10, false, 'center');
      addText('EL MINISTRO DEL INTERIOR', 10, true, 'center');
      addSpace(15);
      addText('_______________________________', 10, false, 'center');

      // Save PDF
      doc.save('Decreto_Presidencial_Direcciones_Digitales_GE.pdf');
      toast({
        title: "Éxito",
        description: "Decreto Presidencial generado exitosamente",
      });
    } catch (error) {
      console.error('Error generating decree PDF:', error);
      toast({
        title: "Error",
        description: "Error al generar el Decreto Presidencial",
        variant: "destructive",
      });
    }
  };

  return (
    <Button onClick={generatePDF} variant="outline" className="gap-2">
      <Scale className="h-4 w-4" />
      Descargar Decreto Presidencial (PDF)
    </Button>
  );
};
