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
      'INICIO → Agente de Campo identifica nueva ubicación',
      '↓',
      'CAPTURA DE DATOS → Coordenadas GPS, fotografías, descripción',
      '↓', 
      'GENERACIÓN UAC → Sistema genera Código Único de Dirección',
      '↓',
      'VALIDACIÓN → Verificación automática de coordenadas y duplicados',
      '↓',
      'REVISIÓN MANUAL → Verificador revisa calidad de datos',
      '↓',
      'APROBACIÓN → Registrador aprueba inclusión en NAR',
      '↓',
      'PUBLICACIÓN → Dirección disponible públicamente',
      '↓',
      'FIN → Dirección activa en el sistema'
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
      'INICIO → Ciudadano accede al portal CAR',
      '↓',
      'AUTENTICACIÓN → Login con credenciales o registro nuevo',
      '↓',
      'DECLARACIÓN → Ciudadano declara su dirección de residencia',
      '↓',
      'BÚSQUEDA UAC → Sistema busca UAC correspondiente en NAR',
      '↓',
      'VALIDACIÓN → Verificación de datos personales y dirección',
      '↓',
      'ESTADO INICIAL → Dirección marcada como "AUTODECLARADA"',
      '↓',
      'VERIFICACIÓN → Proceso de confirmación por autoridades',
      '↓',
      'APROBACIÓN/RECHAZO → Estado final "CONFIRMADA" o "RECHAZADA"',
      '↓',
      'FIN → Dirección registrada en perfil ciudadano'
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
      'INICIO → Ciudadano reporta emergencia',
      '↓',
      'RECEPCIÓN → Sistema recibe alerta (llamada, SMS, app)',
      '↓',
      'CLASIFICACIÓN → Tipo y prioridad de emergencia',
      '↓',
      'LOCALIZACIÓN → Identificación de UAC más cercano',
      '↓',
      'CIFRADO → Datos sensibles encriptados por seguridad',
      '↓',
      'ASIGNACIÓN → Sistema asigna despachador disponible',
      '↓',
      'NOTIFICACIÓN → Alerta a unidades de emergencia',
      '↓',
      'DESPACHO → Unidades se dirigen al lugar',
      '↓',
      'SEGUIMIENTO → Monitoreo en tiempo real del incidente',
      '↓',
      'RESOLUCIÓN → Cierre del incidente y reporte final',
      '↓',
      'FIN → Incidente resuelto y documentado'
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
      '• NAR proporciona base de direcciones verificadas para CAR',
      '• CAR alimenta NAR con reportes ciudadanos de direcciones',
      '• Emergencias utilizan UACs de NAR para localización precisa',
      '• CAR proporciona datos de residentes para contacto en emergencias',
      '• Sistema unificado de autenticación entre módulos',
      '• Dashboards integrados para autoridades y administradores'
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
      'AGENTE DE CAMPO → Captura direcciones en terreno',
      'VERIFICADOR → Valida calidad de datos de direcciones',
      'REGISTRADOR → Aprueba inclusión en registro nacional',
      'CIUDADANO → Declara y mantiene sus direcciones',
      'DESPACHADOR → Gestiona emergencias y coordina respuesta',
      'UNIDAD DE EMERGENCIA → Responde a incidentes',
      'ADMINISTRADOR → Supervisa sistema y usuarios'
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
      'Registro NAR → Máximo 48 horas desde captura',
      'Verificación CAR → Máximo 5 días hábiles',
      'Respuesta Emergencia Crítica → Máximo 3 minutos',
      'Respuesta Emergencia Normal → Máximo 15 minutos',
      'Disponibilidad Sistema → 99.5% tiempo activo',
      'Tiempo Resolución Incidentes → Según protocolo'
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