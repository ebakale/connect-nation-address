import React from 'react';
import jsPDF from 'jspdf';
import { Button } from './ui/button';
import { Download, Calculator } from 'lucide-react';

const FinancialAnalysisPDF = () => {
  const generatePDF = () => {
    const pdf = new jsPDF('portrait', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Set up colors
    const primaryColor = '#2563eb';
    const accentColor = '#059669';
    const warningColor = '#dc2626';
    const textColor = '#1f2937';
    
    // Helper function to add new page
    const addNewPage = () => {
      pdf.addPage();
    };
    
    // Helper function for section headers
    const addSectionHeader = (title: string, y: number) => {
      pdf.setFontSize(16);
      pdf.setTextColor(primaryColor);
      pdf.text(title, 15, y);
      pdf.setDrawColor(primaryColor);
      pdf.line(15, y + 2, pageWidth - 15, y + 2);
      return y + 10;
    };
    
    // Helper function for tables
    const addTable = (headers: string[], rows: string[][], startY: number) => {
      const colWidth = (pageWidth - 30) / headers.length;
      let currentY = startY;
      
      // Headers
      pdf.setFillColor(primaryColor);
      pdf.rect(15, currentY, pageWidth - 30, 8, 'F');
      pdf.setFontSize(9);
      pdf.setTextColor(255, 255, 255);
      headers.forEach((header, i) => {
        pdf.text(header, 17 + (i * colWidth), currentY + 5);
      });
      currentY += 8;
      
      // Rows
      pdf.setTextColor(textColor);
      pdf.setFontSize(8);
      rows.forEach((row, rowIndex) => {
        const fillColor = rowIndex % 2 === 0 ? '#f9fafb' : '#ffffff';
        pdf.setFillColor(fillColor);
        pdf.rect(15, currentY, pageWidth - 30, 6, 'F');
        
        row.forEach((cell, i) => {
          pdf.text(cell, 17 + (i * colWidth), currentY + 4);
        });
        currentY += 6;
      });
      
      return currentY + 5;
    };
    
    // Page 1: Title and Introduction
    pdf.setFontSize(20);
    pdf.setTextColor(primaryColor);
    pdf.text('ANÁLISIS FINANCIERO - BIAKAM', pageWidth / 2, 30, { align: 'center' });
    pdf.setFontSize(14);
    pdf.text('Proyección 3 Años - Guinea Ecuatorial', pageWidth / 2, 40, { align: 'center' });
    
    let currentY = 60;
    currentY = addSectionHeader('RESUMEN EJECUTIVO', currentY);
    
    pdf.setFontSize(10);
    pdf.setTextColor(textColor);
    const executiveSummary = [
      'Este análisis presenta las proyecciones financieras para la implementación del Sistema',
      'Nacional de Direcciones de Biakam en Guinea Ecuatorial durante los primeros 3 años.',
      '',
      'CONTEXTO PAÍS:',
      '• Población: ~1.4 millones de habitantes',
      '• PIB per cápita: ~$8,000 USD (2023)',
      '• Economía basada en petróleo con diversificación en curso',
      '• Infraestructura tecnológica en desarrollo',
      '• Gobierno con capacidad de inversión en modernización',
      '',
      'SUPUESTOS CLAVE:',
      '• Implementación gradual en 3 fases (Malabo, Bata, resto del país)',
      '• Adopción progresiva del 20% año 1, 60% año 2, 85% año 3',
      '• Costos ajustados al mercado local de Guinea Ecuatorial',
      '• Ingresos basados en licencias gubernamentales y servicios'
    ];
    
    executiveSummary.forEach(line => {
      if (currentY > pageHeight - 20) {
        addNewPage();
        currentY = 20;
      }
      pdf.text(line, 15, currentY);
      currentY += 5;
    });
    
    // Page 2: CAPEX Analysis
    addNewPage();
    currentY = 20;
    currentY = addSectionHeader('ANÁLISIS CAPEX (Inversión Inicial)', currentY);
    
    const capexHeaders = ['Categoría', 'Descripción', 'Costo (€)', 'Justificación'];
    const capexRows = [
      ['Desarrollo Software', 'Plataforma inicial + móvil', '450,000', 'Desarrollo específico para EG'],
      ['Infraestructura TI', 'Servidores, hosting, seguridad', '180,000', 'Infraestructura robusta local'],
      ['Licencias Software', 'GIS, bases de datos, herramientas', '120,000', 'Licencias especializadas'],
      ['Equipamiento', 'Hardware, dispositivos móviles', '90,000', 'Equipos para equipos de campo'],
      ['Capacitación Inicial', 'Formación usuarios y técnicos', '75,000', 'Formación masiva necesaria'],
      ['Marketing Lanzamiento', 'Campaña awareness nacional', '60,000', 'Educación ciudadana esencial'],
      ['Legal y Regulatorio', 'Cumplimiento normativo', '45,000', 'Adaptación marco legal'],
      ['Contingencias (10%)', 'Imprevistos', '102,000', 'Riesgos proyecto grande'],
      ['TOTAL CAPEX', '', '1,122,000', 'Inversión inicial total']
    ];
    
    currentY = addTable(capexHeaders, capexRows, currentY);
    
    // Page 3: OPEX Analysis
    addNewPage();
    currentY = 20;
    currentY = addSectionHeader('ANÁLISIS OPEX (Gastos Operativos Anuales)', currentY);
    
    const opexHeaders = ['Categoría', 'Año 1 (€)', 'Año 2 (€)', 'Año 3 (€)', 'Notas'];
    const opexRows = [
      ['Personal Técnico', '240,000', '280,000', '320,000', 'Crecimiento equipo'],
      ['Soporte y Mantenimiento', '120,000', '140,000', '160,000', 'Escalado con usuarios'],
      ['Infraestructura Hosting', '60,000', '85,000', '110,000', 'Crecimiento capacidad'],
      ['Marketing Continuo', '45,000', '55,000', '65,000', 'Adopción sostenida'],
      ['Actualizaciones Software', '36,000', '42,000', '48,000', 'Mejoras continuas'],
      ['Capacitación Continua', '30,000', '35,000', '40,000', 'Formación nuevos usuarios'],
      ['Administración', '48,000', '55,000', '62,000', 'Gastos administrativos'],
      ['Contingencias Operativas', '30,000', '35,000', '40,000', 'Imprevistos operativos'],
      ['TOTAL OPEX ANUAL', '609,000', '727,000', '845,000', 'Gastos operativos totales']
    ];
    
    currentY = addTable(opexHeaders, opexRows, currentY);
    
    // Page 4: Revenue Analysis
    addNewPage();
    currentY = 20;
    currentY = addSectionHeader('ANÁLISIS DE INGRESOS', currentY);
    
    const revenueHeaders = ['Fuente de Ingresos', 'Año 1 (€)', 'Año 2 (€)', 'Año 3 (€)', 'Modelo'];
    const revenueRows = [
      ['Licencia Gobierno Central', '400,000', '450,000', '500,000', 'Anual + escalado'],
      ['Licencias Municipalidades', '120,000', '280,000', '420,000', 'Adopción gradual'],
      ['Servicios Implementación', '200,000', '150,000', '100,000', 'Decreciente'],
      ['APIs Empresas Privadas', '50,000', '180,000', '350,000', 'Crecimiento exponencial'],
      ['Capacitación y Consultoría', '80,000', '120,000', '160,000', 'Servicios continuos'],
      ['Soporte Premium', '30,000', '70,000', '120,000', 'Valor agregado'],
      ['Verificación Direcciones', '20,000', '80,000', '150,000', 'Servicios comerciales'],
      ['Integración Sistemas', '100,000', '80,000', '60,000', 'Proyecto único'],
      ['TOTAL INGRESOS', '1,000,000', '1,410,000', '1,860,000', 'Crecimiento sostenido']
    ];
    
    currentY = addTable(revenueHeaders, revenueRows, currentY);
    
    // Page 5: Financial Summary
    addNewPage();
    currentY = 20;
    currentY = addSectionHeader('RESUMEN FINANCIERO Y ANÁLISIS', currentY);
    
    const summaryHeaders = ['Métrica', 'Año 1', 'Año 2', 'Año 3', 'Total/Promedio'];
    const summaryRows = [
      ['Ingresos (€)', '1,000,000', '1,410,000', '1,860,000', '4,270,000'],
      ['OPEX (€)', '609,000', '727,000', '845,000', '2,181,000'],
      ['EBITDA (€)', '391,000', '683,000', '1,015,000', '2,089,000'],
      ['Margen EBITDA (%)', '39.1%', '48.4%', '54.6%', '48.9%'],
      ['Flujo Acumulado (€)', '-731,000', '-48,000', '967,000', ''],
      ['ROI Acumulado (%)', '-65%', '-4%', '+86%', ''],
      ['Payback Period', '', '', '2.1 años', ''],
      ['VPN (10% descuento)', '', '', '', '1,456,000']
    ];
    
    currentY = addTable(summaryHeaders, summaryRows, currentY);
    
    currentY += 10;
    pdf.setFontSize(12);
    pdf.setTextColor(accentColor);
    pdf.text('CONCLUSIONES CLAVE:', 15, currentY);
    currentY += 8;
    
    pdf.setFontSize(10);
    pdf.setTextColor(textColor);
    const conclusions = [
      '✓ Proyecto financieramente viable con payback de 2.1 años',
      '✓ Márgenes crecientes del 39% al 55% indicando escalabilidad',
      '✓ VPN positivo de €1.46M con tasa descuento conservadora 10%',
      '✓ Diversificación de ingresos reduce riesgos de dependencia',
      '✓ Oportunidad única de liderazgo en mercado sin competencia',
      '',
      'RIESGOS PRINCIPALES:',
      '• Adopción gubernamental más lenta que proyectada',
      '• Competencia internacional tardía pero posible',
      '• Cambios regulatorios o políticos',
      '• Desafíos técnicos en infraestructura local',
      '',
      'RECOMENDACIONES:',
      '• Asegurar contratos gubernamentales a largo plazo',
      '• Desarrollar alianzas estratégicas locales fuertes',
      '• Invertir en capacitación masiva para adopción',
      '• Mantener innovación tecnológica continua'
    ];
    
    conclusions.forEach(line => {
      if (currentY > pageHeight - 15) {
        addNewPage();
        currentY = 20;
      }
      pdf.text(line, 15, currentY);
      currentY += 5;
    });
    
    // Footer
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text('© 2024 Biakam - Análisis Financiero Sistema Nacional de Direcciones', pageWidth / 2, pageHeight - 10, { align: 'center' });
    
    pdf.save('Analisis-Financiero-Biakam-Guinea-Ecuatorial.pdf');
  };

  return (
    <Button
      onClick={generatePDF}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <Calculator className="h-4 w-4" />
      <Download className="h-4 w-4" />
      Análisis Financiero (ES)
    </Button>
  );
};

export default FinancialAnalysisPDF;