import React from 'react';
import jsPDF from 'jspdf';
import { Button } from './ui/button';
import { Download, FileText } from 'lucide-react';

const BusinessModelCanvasPDF = () => {
  const generatePDF = () => {
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Set up colors
    const primaryColor = '#2563eb';
    const secondaryColor = '#f3f4f6';
    const textColor = '#1f2937';
    
    // Title
    pdf.setFontSize(24);
    pdf.setTextColor(primaryColor);
    pdf.text('LIENZO DEL MODELO DE NEGOCIO - BIAKAM', pageWidth / 2, 20, { align: 'center' });
    pdf.setFontSize(16);
    pdf.text('Sistema Nacional de Direcciones para Guinea Ecuatorial', pageWidth / 2, 30, { align: 'center' });
    
    // Grid setup
    const startY = 45;
    const cellHeight = (pageHeight - startY - 10) / 2;
    const cellWidth = pageWidth / 5;
    
    // Helper function to add section
    const addSection = (x: number, y: number, width: number, height: number, title: string, content: string[]) => {
      pdf.setDrawColor(primaryColor);
      pdf.setLineWidth(0.5);
      pdf.rect(x, y, width, height);
      
      // Title background
      pdf.setFillColor(primaryColor);
      pdf.rect(x, y, width, 8, 'F');
      
      // Title text
      pdf.setFontSize(10);
      pdf.setTextColor(255, 255, 255);
      pdf.text(title, x + 2, y + 5);
      
      // Content
      pdf.setTextColor(textColor);
      pdf.setFontSize(8);
      let contentY = y + 12;
      content.forEach((line, index) => {
        if (contentY < y + height - 3) {
          const lines = pdf.splitTextToSize(line, width - 4);
          lines.forEach((splitLine: string) => {
            if (contentY < y + height - 3) {
              pdf.text(splitLine, x + 2, contentY);
              contentY += 3;
            }
          });
          contentY += 1;
        }
      });
    };

    // Top row sections
    addSection(0, startY, cellWidth, cellHeight, 'SOCIOS CLAVE', [
      '• Gobierno de Guinea Ecuatorial',
      '• Ministerio del Interior y Seguridad',
      '• Servicios de Emergencia (Bomberos, Ambulancias)',
      '• Cuerpos de Seguridad del Estado',
      '• Empresas de telecomunicaciones locales',
      '• Proveedores de tecnología GPS/GIS',
      '• Organismos de cooperación internacional',
      '• Universidades locales para formación',
      '• Empresas de logística y distribución',
      '• Bancos y entidades financieras',
      '• Organizaciones comunitarias locales'
    ]);
    
    addSection(cellWidth, startY, cellWidth, cellHeight, 'ACTIVIDADES CLAVE', [
      '• Desarrollo y mantenimiento del software',
      '• Capacitación de usuarios del sistema',
      '• Registro y verificación de direcciones',
      '• Soporte técnico 24/7',
      '• Actualización continua de la base de datos',
      '• Integración con sistemas gubernamentales',
      '• Servicios de consultoría tecnológica',
      '• Monitoreo y análisis del sistema',
      '• Implementación de medidas de seguridad',
      '• Desarrollo de APIs para terceros',
      '• Marketing y promoción del sistema'
    ]);
    
    addSection(cellWidth * 2, startY, cellWidth, cellHeight, 'PROPUESTA DE VALOR', [
      '• Primer sistema nacional de direcciones',
      '• Localización precisa en tiempo real',
      '• Mejora de servicios de emergencia',
      '• Facilita el desarrollo comercial',
      '• Reduce tiempos de respuesta policial',
      '• Empodera a los ciudadanos',
      '• Moderniza la infraestructura del país',
      '• Genera códigos únicos de dirección',
      '• Interfaz multiidioma (español, francés, fang)',
      '• Funciona offline en áreas remotas',
      '• Integración con servicios gubernamentales'
    ]);
    
    addSection(cellWidth * 3, startY, cellWidth, cellHeight, 'RELACIÓN CON CLIENTES', [
      '• Soporte técnico dedicado',
      '• Capacitación presencial continua',
      '• Portal de autoservicio online',
      '• Actualizaciones automáticas',
      '• Comunidad de usuarios',
      '• Feedback y mejoras constantes',
      '• Asistencia en implementación',
      '• Documentación técnica completa',
      '• Webinars y talleres',
      '• Centro de llamadas local',
      '• Visitas técnicas regulares'
    ]);
    
    addSection(cellWidth * 4, startY, cellWidth, cellHeight, 'SEGMENTOS DE CLIENTES', [
      '• Gobierno Central y Regional',
      '• Cuerpos de Seguridad del Estado',
      '• Servicios de Emergencia',
      '• Municipalidades y Consejos Locales',
      '• Empresas de logística y reparto',
      '• Bancos y entidades financieras',
      '• Empresas de telecomunicaciones',
      '• Compañías de seguros',
      '• Organizaciones internacionales',
      '• Ciudadanos individuales',
      '• Empresas de comercio electrónico'
    ]);
    
    // Bottom row sections
    addSection(0, startY + cellHeight, cellWidth * 2, cellHeight, 'RECURSOS CLAVE', [
      '• Equipo técnico especializado',
      '• Plataforma tecnológica robusta',
      '• Base de datos georreferenciada',
      '• Licencias de software GIS',
      '• Infraestructura de servidores',
      '• Red de soporte local',
      '• Propiedad intelectual y algoritmos',
      '• Alianzas estratégicas',
      '• Capital financiero para expansión',
      '• Conocimiento del mercado local',
      '• Certificaciones de seguridad'
    ]);
    
    addSection(cellWidth * 2, startY + cellHeight, cellWidth, cellHeight, 'CANALES', [
      '• Ventas directas al gobierno',
      '• Licitaciones públicas',
      '• Socios comerciales locales',
      '• Plataforma web institucional',
      '• Aplicaciones móviles',
      '• Centros de atención ciudadana',
      '• Eventos gubernamentales',
      '• Medios de comunicación local',
      '• Redes sociales oficiales',
      '• Partnerships tecnológicos',
      '• Canales de distribución física'
    ]);
    
    addSection(cellWidth * 3, startY + cellHeight, cellWidth, cellHeight, 'ESTRUCTURA DE COSTOS', [
      '• Desarrollo y mantenimiento de software',
      '• Personal técnico y de soporte',
      '• Infraestructura tecnológica (servidores, hosting)',
      '• Licencias de software y herramientas',
      '• Marketing y ventas',
      '• Capacitación y formación',
      '• Investigación y desarrollo',
      '• Costos operativos locales',
      '• Cumplimiento regulatorio',
      '• Seguridad y respaldo de datos',
      '• Gastos administrativos'
    ]);
    
    addSection(cellWidth * 4, startY + cellHeight, cellWidth, cellHeight, 'FUENTES DE INGRESOS', [
      '• Licencias de software gubernamental',
      '• Servicios de implementación',
      '• Suscripciones anuales de mantenimiento',
      '• Capacitación y consultoría',
      '• APIs para empresas privadas',
      '• Servicios de verificación de direcciones',
      '• Integración con sistemas existentes',
      '• Soporte técnico premium',
      '• Actualizaciones y mejoras',
      '• Servicios de análisis de datos',
      '• Licencias para desarrolladores'
    ]);
    
    // Footer
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text('© 2024 Biakam - Sistema Nacional de Direcciones de Guinea Ecuatorial', pageWidth / 2, pageHeight - 5, { align: 'center' });
    
    pdf.save('Business-Model-Canvas-Biakam-Guinea-Ecuatorial.pdf');
  };

  return (
    <Button
      onClick={generatePDF}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <FileText className="h-4 w-4" />
      <Download className="h-4 w-4" />
      Lienzo de Modelo de Negocio
    </Button>
  );
};

export default BusinessModelCanvasPDF;