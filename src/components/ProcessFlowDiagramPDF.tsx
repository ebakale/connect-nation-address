import React from 'react';
import jsPDF from 'jspdf';
import { Button } from './ui/button';
import { Download } from 'lucide-react';

const ProcessFlowDiagramPDF: React.FC = () => {
  const generatePDF = () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;

    // Title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DIAGRAMAS DE FLUJO DE PROCESOS - BIAKAM', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 15;
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Sistema Nacional de Direcciones y Gestión de Emergencias', pageWidth / 2, yPosition, { align: 'center' });
    pdf.text('República de Guinea Ecuatorial', pageWidth / 2, yPosition + 5, { align: 'center' });

    yPosition += 20;

    // NAR Process Flow
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('1. PROCESO NAR - REGISTRO NACIONAL DE DIRECCIONES', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    const narSteps = [
      'INICIO → Ciudadano o autoridad envía solicitud de dirección',
      '↓',
      'CAPTURA DE DATOS → Coordenadas GPS, fotos, justificación, documentos',
      '↓', 
      'AUTO-VERIFICACIÓN → Validación coordenadas, calidad foto, duplicados',
      '↓',
      'MARCADO → Sistema marca para revisión estándar o manual',
      '↓',
      'REVISIÓN VERIFICADOR → Verifica en cola, aprueba/rechaza/edita',
      '↓',
      'APROBACIÓN → Crea registro dirección via approve_address_request()',
      '↓',
      'GENERACIÓN UAC → Sistema genera UAC con generate_unified_uac_unique()',
      '↓',
      'PUBLICACIÓN → Registrador establece verified=true y public=true',
      '↓',
      'FIN → Dirección buscable, disponible para emergencias y CAR'
    ];

    narSteps.forEach(step => {
      if (step === '↓') {
        pdf.text(step, 105, yPosition, { align: 'center' });
        yPosition += 4;
      } else {
        pdf.text(step, 20, yPosition);
        yPosition += 6;
      }
    });

    yPosition += 10;

    // CAR Process Flow
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('2. PROCESO CAR - REPOSITORIO CIUDADANO DE DIRECCIONES', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    const carSteps = [
      'INICIO → Ciudadano accede a CitizenAddressVerificationManager',
      '↓',
      'REGISTRO PERSONA → Sistema crea/carga registro persona con auth.uid()',
      '↓',
      'SELECCIÓN ACCIÓN → Principal/Secundaria/Solicitar Verificación',
      '↓',
      'ENTRADA UAC → Ciudadano ingresa UAC de NAR (debe existir)',
      '↓',
      'SELECCIÓN ALCANCE → DWELLING (propiedad) o UNIT (unidad específica)',
      '↓',
      'EJECUCIÓN RPC → set_primary_address() o add_secondary_address()',
      '↓',
      'ESTADO → Dirección creada con estado "SELF_DECLARED"',
      '↓',
      'REVISIÓN VERIFICADOR → Verificadores CAR revisan en cola',
      '↓',
      'ACTUALIZACIÓN ESTADO → set_citizen_address_status() a CONFIRMED/REJECTED',
      '↓',
      'FIN → Activa en perfil ciudadano con fechas efectivas'
    ];

    carSteps.forEach(step => {
      if (step === '↓') {
        pdf.text(step, 105, yPosition, { align: 'center' });
        yPosition += 4;
      } else {
        pdf.text(step, 20, yPosition);
        yPosition += 6;
      }
    });

    // New page for Emergency Management
    pdf.addPage();
    yPosition = 20;

    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('3. PROCESO DE GESTIÓN DE EMERGENCIAS', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    const emergencySteps = [
      'INICIO → Reportante envía via EmergencyDispatchDialog',
      '↓',
      'CREACIÓN INCIDENTE → Genera número INC-[timestamp]',
      '↓',
      'CIFRADO DATOS → decrypt-incident-data edge function encripta',
      '↓',
      'ESTADO: REPORTED → Estado inicial en tabla emergency_incidents',
      '↓',
      'NOTIFICACIÓN OPERADOR → notify-emergency-operators edge function',
      '↓',
      'ASIGNACIÓN OPERADOR → Despachador asigna a operador',
      '↓',
      'ASIGNACIÓN UNIDAD → Operador asigna unidades, estado: ASSIGNED',
      '↓',
      'NOTIFICACIÓN UNIDAD → notify-unit-assignment edge function',
      '↓',
      'ESTADO: RESPONDING → Unidad en ruta, rastreo GPS activo',
      '↓',
      'ESTADO: ON_SCENE → Unidad llega, timestamp responded_at',
      '↓',
      'RESPALDO (si necesario) → process-backup-request via BackupNotificationManager',
      '↓',
      'ESTADO: RESOLVED → Oficial completa reporte, timestamp resolved_at',
      '↓',
      'ESTADO: CLOSED → Documentación final, analíticas actualizadas',
      '↓',
      'FIN → notify-incident-reporter edge function notifica reportante'
    ];

    emergencySteps.forEach(step => {
      if (step === '↓') {
        pdf.text(step, 105, yPosition, { align: 'center' });
        yPosition += 4;
      } else {
        pdf.text(step, 20, yPosition);
        yPosition += 6;
      }
    });

    yPosition += 15;

    // Integration Flow
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('4. INTEGRACIÓN ENTRE MÓDULOS', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    const integrationFlow = [
      '• CAR requiere UACs NAR válidos (relación foreign key)',
      '• Incidentes emergencia referencian direcciones NAR via incident_uac',
      '• Direcciones ciudadanas vinculan a registros persona via person_id',
      '• Registros persona vinculan a usuarios auth via auth_user_id',
      '• Políticas RLS unificadas usan función has_role() en módulos',
      '• Unidades emergencia rastrean ubicación para asignación cercana',
      '• Métricas calidad rastrean cobertura y tasas de verificación',
      '• Edge functions proveen procesamiento seguro y notificaciones'
    ];

    integrationFlow.forEach(item => {
      pdf.text(item, 20, yPosition);
      yPosition += 6;
    });

    yPosition += 15;

    // Roles and Responsibilities
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('5. ROLES Y RESPONSABILIDADES', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    const roles = [
      'ADMIN → Acceso completo sistema, gestiona usuarios y configuración',
      'REGISTRAR → Publica direcciones, gestiona autoridades NAR',
      'VERIFIER → Revisa y aprueba solicitudes direcciones NAR',
      'CITIZEN → Envía solicitudes direcciones, declara direcciones CAR',
      'CAR_ADMIN → Gestiona permisos CAR y métricas calidad',
      'CAR_VERIFIER → Revisa y verifica declaraciones direcciones ciudadanos',
      'POLICE_ADMIN → Gestiona sistema policial y unidades',
      'POLICE_SUPERVISOR → Gestiona unidades y cobertura geográfica',
      'POLICE_OPERATOR → Responde incidentes, miembro unidad',
      'POLICE_DISPATCHER → Asigna incidentes a unidades',
      'NAR_AUTHORITY → Puede crear/verificar/actualizar direcciones (alcance regional)'
    ];

    roles.forEach(role => {
      pdf.text(role, 20, yPosition);
      yPosition += 6;
    });

    yPosition += 15;

    // SLA and Performance Metrics
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('6. MÉTRICAS DE RENDIMIENTO (SLA)', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    const slaMetrics = [
      'Auto-verificación → Inmediata (coordenadas, duplicados, calidad foto)',
      'Revisión Verificador → Solicitudes marcadas dentro de 24 horas',
      'Publicación NAR → Direcciones aprobadas publicadas en 48 horas',
      'Verificación CAR → Direcciones ciudadanas revisadas en 5 días hábiles',
      'Emergencia Crítica → Notificación operador < 1 minuto, respuesta varía',
      'Rastreo Incidentes → Actualizaciones GPS en tiempo real de unidades',
      'Cifrado Datos → Todos datos sensibles emergencia cifrados en reposo',
      'Disponibilidad Sistema → Políticas RLS aplican acceso basado en rol 24/7'
    ];

    slaMetrics.forEach(metric => {
      pdf.text(metric, 20, yPosition);
      yPosition += 6;
    });

    // Footer
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    pdf.text('Generado por Sistema Biakam - Guinea Ecuatorial', pageWidth / 2, pageHeight - 10, { align: 'center' });
    pdf.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, pageWidth - 20, pageHeight - 10, { align: 'right' });

    pdf.save('biakam-diagramas-flujo-procesos-es.pdf');
  };

  return (
    <Button onClick={generatePDF} variant="outline" size="sm">
      <Download className="h-4 w-4 mr-2" />
      Diagramas de Flujo (ES)
    </Button>
  );
};

export default ProcessFlowDiagramPDF;