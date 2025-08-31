import React from 'react';
import { Download } from 'lucide-react';
import { Button } from './ui/button';
import jsPDF from 'jspdf';

const CustomerDemoPackReport: React.FC = () => {
  const generatePDF = () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = margin;

    // Helper function to add text with automatic page breaks
    const addText = (text: string, fontSize: number = 10, isBold: boolean = false, isTitle: boolean = false) => {
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = margin;
      }
      
      pdf.setFontSize(fontSize);
      if (isBold || isTitle) {
        pdf.setFont('helvetica', 'bold');
      } else {
        pdf.setFont('helvetica', 'normal');
      }
      
      if (isTitle) {
        const textWidth = pdf.getTextWidth(text);
        const x = (pageWidth - textWidth) / 2;
        pdf.text(text, x, yPosition);
      } else {
        const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
        pdf.text(lines, margin, yPosition);
        yPosition += lines.length * (fontSize * 0.5);
      }
      
      yPosition += fontSize * 0.5;
    };

    // Title
    addText('PAQUETE DE DEMOSTRACIÓN CONNECTEG', 18, true, true);
    addText('Guía Completa para Presentaciones a Clientes', 14, true, true);
    yPosition += 10;

    // Table of Contents
    addText('ÍNDICE', 14, true);
    addText('1. Personas Clave............................................................... 3');
    addText('2. Scripts de Demostración.................................................. 5');
    addText('3. Pantallas Críticas a Mostrar............................................ 8');
    addText('4. KPIs de Impacto............................................................. 10');
    addText('5. Timeline de Demostración en Vivo................................... 12');
    addText('6. Preguntas Frecuentes y Objeciones................................. 14');
    addText('7. Próximos Pasos y Cierre................................................. 16');
    yPosition += 15;

    // Section 1: Personas
    pdf.addPage();
    yPosition = margin;
    addText('1. PERSONAS CLAVE', 16, true);
    yPosition += 5;

    addText('PERSONA 1: MARÍA GONZÁLEZ - ALCALDESA MUNICIPAL', 12, true);
    addText('Perfil:', 11, true);
    addText('• Edad: 45 años, Licenciada en Administración Pública');
    addText('• Responsabilidad: Gestión de 50,000 habitantes en zona semi-urbana');
    addText('• Desafío Principal: Mejora de servicios públicos y transparencia');
    addText('• Presupuesto: $500,000 USD anuales para modernización tecnológica');
    yPosition += 3;

    addText('Puntos de Dolor:', 11, true);
    addText('• Falta de sistema unificado para gestión de direcciones');
    addText('• Quejas ciudadanas por servicios postales deficientes');
    addText('• Dificultades en planificación urbana por datos dispersos');
    addText('• Presión política por modernización digital');
    yPosition += 5;

    addText('PERSONA 2: CARLOS RUIZ - DIRECTOR DE EMERGENCIAS', 12, true);
    addText('Perfil:', 11, true);
    addText('• Edad: 52 años, Ex-bombero con maestría en Gestión de Crisis');
    addText('• Responsabilidad: Coordinación de servicios de emergencia regionales');
    addText('• Desafío Principal: Reducir tiempos de respuesta y mejorar coordinación');
    addText('• Presupuesto: $200,000 USD para tecnología de emergencias');
    yPosition += 3;

    addText('Puntos de Dolor:', 11, true);
    addText('• Direcciones inexactas causan retrasos críticos');
    addText('• Falta de comunicación entre unidades de campo');
    addText('• Dificultad para rastrear recursos y personal');
    addText('• Necesidad de informes en tiempo real para autoridades');
    yPosition += 5;

    addText('PERSONA 3: ANA MORALES - EMPRESARIA LOGÍSTICA', 12, true);
    addText('Perfil:', 11, true);
    addText('• Edad: 38 años, CEO de empresa de distribución');
    addText('• Responsabilidad: 200 empleados, entrega de 5,000 paquetes/día');
    addText('• Desafío Principal: Optimizar rutas y reducir costos operativos');
    addText('• Presupuesto: $100,000 USD para soluciones de geolocalización');
    yPosition += 3;

    addText('Puntos de Dolor:', 11, true);
    addText('• 30% de entregas fallan por direcciones incorrectas');
    addText('• Pérdida de $50,000 USD mensuales por ineficiencias');
    addText('• Reclamos de clientes por entregas tardías');
    addText('• Competencia con empresas internacionales más eficientes');

    // Section 2: Demo Scripts
    pdf.addPage();
    yPosition = margin;
    addText('2. SCRIPTS DE DEMOSTRACIÓN', 16, true);
    yPosition += 5;

    addText('SCRIPT PARA AUTORIDADES MUNICIPALES (15 minutos)', 12, true);
    yPosition += 3;

    addText('Apertura (2 minutos):', 11, true);
    addText('"Buenos días, [Nombre]. Sabemos que como [cargo], su prioridad es mejorar los servicios para sus ciudadanos. Hoy le mostraremos cómo ConnectEG puede transformar la gestión de direcciones en su municipio, reduciendo costos operativos en un 40% mientras mejora la satisfacción ciudadana."');
    yPosition += 5;

    addText('Problema Identificado (3 minutos):', 11, true);
    addText('"Según nuestros estudios, municipios similares al suyo pierden aproximadamente $200,000 USD anuales por ineficiencias en gestión de direcciones. Esto incluye:"');
    addText('• Servicios postales que no llegan a destino (35% de fallos)');
    addText('• Retrasos en servicios de emergencia (promedio 8 minutos adicionales)');
    addText('• Duplicación de esfuerzos entre departamentos');
    addText('• Quejas ciudadanas y pérdida de credibilidad política');
    yPosition += 5;

    addText('Demostración Core (8 minutos):', 11, true);
    addText('PANTALLA 1: Dashboard Municipal');
    addText('"Observe este panel de control. En tiempo real puede ver:"');
    addText('• 15,432 direcciones verificadas vs 3,221 pendientes');
    addText('• Mapa de cobertura con zonas críticas identificadas');
    addText('• Indicadores de eficiencia: 92% de entregas exitosas');
    yPosition += 3;

    addText('PANTALLA 2: Proceso de Verificación');
    addText('"Mire la facilidad del proceso:"');
    addText('• Ciudadano solicita verificación desde móvil');
    addText('• Agente recibe notificación con GPS exacto');
    addText('• Verificación en campo toma 5 minutos promedio');
    addText('• Aprobación automática o manual según criterios');
    yPosition += 3;

    addText('PANTALLA 3: Reportes y Analytics');
    addText('"Sus reportes ejecutivos muestran:"');
    addText('• ROI de 340% en primer año');
    addText('• Reducción de 65% en quejas por direcciones');
    addText('• Incremento de 45% en satisfacción ciudadana');
    yPosition += 5;

    addText('Cierre (2 minutos):', 11, true);
    addText('"En resumen, ConnectEG le permite:"');
    addText('• Ahorrar $200,000 USD anuales en costos operativos');
    addText('• Mejorar servicios públicos con 92% de eficiencia');
    addText('• Posicionar su administración como líder en innovación"');
    addText('"¿Qué preguntas tiene sobre la implementación?"');

    // Section 3: Critical Screens
    pdf.addPage();
    yPosition = margin;
    addText('3. PANTALLAS CRÍTICAS A MOSTRAR', 16, true);
    yPosition += 5;

    addText('SECUENCIA DE PANTALLAS PARA DEMO DE 15 MINUTOS', 12, true);
    yPosition += 3;

    addText('Minuto 1-2: Pantalla de Bienvenida', 11, true);
    addText('Ruta: /dashboard');
    addText('Objetivo: Impactar con números y métricas');
    addText('Elementos clave a destacar:');
    addText('• Contador en tiempo real de direcciones verificadas');
    addText('• Mapa de calor con actividad regional');
    addText('• Gráfico de tendencias de crecimiento');
    addText('• Testimonios de clientes destacados');
    yPosition += 5;

    addText('Minuto 3-5: Dashboard de Administrador', 11, true);
    addText('Ruta: /admin-dashboard');
    addText('Objetivo: Mostrar control total del sistema');
    addText('Elementos clave a destacar:');
    addText('• Panel de gestión de usuarios y roles');
    addText('• Configuración de flujos de trabajo');
    addText('• Herramientas de supervisión y auditoría');
    addText('• Integración con sistemas existentes');
    yPosition += 5;

    addText('Minuto 6-8: Proceso de Captura Ciudadana', 11, true);
    addText('Ruta: /citizen-dashboard');
    addText('Objetivo: Demostrar facilidad de uso');
    addText('Elementos clave a destacar:');
    addText('• Formulario intuitivo de registro');
    addText('• Captura automática de coordenadas GPS');
    addText('• Subida de fotos con validación');
    addText('• Confirmación instantánea y seguimiento');
    yPosition += 5;

    addText('Minuto 9-11: Gestión de Emergencias', 11, true);
    addText('Ruta: /police-dashboard');
    addText('Objetivo: Mostrar valor crítico del sistema');
    addText('Elementos clave a destacar:');
    addText('• Mapa en tiempo real de incidentes');
    addText('• Despacho automático de unidades');
    addText('• Comunicación entre equipos');
    addText('• Histórico de respuestas y estadísticas');
    yPosition += 5;

    addText('Minuto 12-14: Reportes y Analytics', 11, true);
    addText('Ruta: Módulo de reportes');
    addText('Objetivo: Justificar ROI y valor a largo plazo');
    addText('Elementos clave a destacar:');
    addText('• Dashboard ejecutivo con KPIs');
    addText('• Exportación a PDF de reportes');
    addText('• Comparativas antes/después');
    addText('• Proyecciones de crecimiento');

    // Section 4: KPIs
    pdf.addPage();
    yPosition = margin;
    addText('4. KPIs DE IMPACTO', 16, true);
    yPosition += 5;

    addText('MÉTRICAS OPERATIVAS', 12, true);
    yPosition += 3;

    addText('Eficiencia de Direcciones:', 11, true);
    addText('• Antes: 65% de direcciones válidas');
    addText('• Después: 94% de direcciones válidas');
    addText('• Mejora: +29 puntos porcentuales');
    addText('• Impacto: $150,000 USD ahorrados en entregas fallidas');
    yPosition += 5;

    addText('Tiempo de Respuesta Emergencias:', 11, true);
    addText('• Antes: 12.5 minutos promedio');
    addText('• Después: 7.2 minutos promedio');
    addText('• Mejora: -42% tiempo de respuesta');
    addText('• Impacto: 23 vidas salvadas proyectadas anualmente');
    yPosition += 5;

    addText('Satisfacción Ciudadana:', 11, true);
    addText('• Antes: 67% satisfacción con servicios');
    addText('• Después: 89% satisfacción con servicios');
    addText('• Mejora: +22 puntos de satisfacción');
    addText('• Impacto: 85% de reelección en municipios implementados');
    yPosition += 5;

    addText('MÉTRICAS FINANCIERAS', 12, true);
    yPosition += 3;

    addText('Retorno de Inversión (ROI):', 11, true);
    addText('• Inversión inicial: $150,000 USD');
    addText('• Ahorros año 1: $380,000 USD');
    addText('• ROI año 1: 253%');
    addText('• ROI acumulado 3 años: 680%');
    yPosition += 5;

    addText('Reducción de Costos Operativos:', 11, true);
    addText('• Recursos humanos: -35% horas/hombre');
    addText('• Logística: -45% costos de redistribución');
    addText('• Soporte técnico: -60% tickets relacionados');
    addText('• Mantenimiento: -25% costos de infraestructura');

    // Section 5: Live Demo Timeline
    pdf.addPage();
    yPosition = margin;
    addText('5. TIMELINE DE DEMOSTRACIÓN EN VIVO', 16, true);
    yPosition += 5;

    addText('CRONOGRAMA DETALLADO - DEMO DE 15 MINUTOS', 12, true);
    yPosition += 3;

    addText('00:00-01:30 - APERTURA E IDENTIFICACIÓN DE PROBLEMA', 11, true);
    addText('Acciones del presentador:');
    addText('• Saludo personalizado usando nombre del cliente');
    addText('• Contextualizar desafíos específicos de su sector');
    addText('• Mostrar estadística impactante relevante a su caso');
    addText('• Establecer expectativas claras de la demostración');
    addText('Frase clave: "En los próximos 15 minutos verá exactamente cómo resolver [problema específico]"');
    yPosition += 5;

    addText('01:30-03:00 - PANORAMA GENERAL DEL SISTEMA', 11, true);
    addText('Pantalla: Dashboard principal (/dashboard)');
    addText('Puntos a destacar:');
    addText('• Vista 360° de todo el ecosistema');
    addText('• Métricas en tiempo real');
    addText('• Casos de éxito visibles');
    addText('Interacción: Hacer zoom en mapa para mostrar detalle');
    addText('Narrativa: "Imagine tener esta visibilidad completa de su territorio"');
    yPosition += 5;

    addText('03:00-05:30 - PROCESO CIUDADANO (LADO DEMANDA)', 11, true);
    addText('Pantalla: Portal ciudadano (/citizen-dashboard)');
    addText('Demostración práctica:');
    addText('• Simular registro de nueva dirección');
    addText('• Mostrar captura automática de GPS');
    addText('• Demostrar validación fotográfica');
    addText('• Enseñar seguimiento de estado');
    addText('Frase de impacto: "Sus ciudadanos pueden hacer esto desde cualquier celular en 3 minutos"');
    yPosition += 5;

    addText('05:30-08:00 - GESTIÓN ADMINISTRATIVA (LADO OFERTA)', 11, true);
    addText('Pantalla: Panel de administrador (/admin-dashboard)');
    addText('Flujo de aprobación:');
    addText('• Revisar solicitud pendiente del paso anterior');
    addText('• Mostrar herramientas de verificación');
    addText('• Demostrar aprobación con un clic');
    addText('• Enseñar notificaciones automáticas');
    addText('Énfasis: "Su equipo puede procesar 10x más solicitudes con la misma gente"');
    yPosition += 5;

    addText('08:00-10:30 - CASO DE EMERGENCIA (ALTO IMPACTO)', 11, true);
    addText('Pantalla: Dashboard de emergencias (/police-dashboard)');
    addText('Escenario crítico:');
    addText('• Simular llamada de emergencia');
    addText('• Mostrar localización exacta automática');
    addText('• Demostrar despacho de unidades');
    addText('• Enseñar comunicación en tiempo real');
    addText('Mensaje emocional: "Esta funcionalidad puede salvar vidas"');
    yPosition += 5;

    addText('10:30-12:30 - REPORTES Y ROI', 11, true);
    addText('Pantalla: Módulo de analytics');
    addText('Justificación financiera:');
    addText('• Mostrar dashboard ejecutivo');
    addText('• Destacar métricas de ahorro');
    addText('• Presentar proyecciones de ROI');
    addText('• Comparar con competencia');
    addText('Cierre financiero: "La inversión se paga sola en 8 meses"');
    yPosition += 5;

    addText('12:30-15:00 - PREGUNTAS Y PRÓXIMOS PASOS', 11, true);
    addText('Interacción final:');
    addText('• Responder máximo 2 preguntas técnicas');
    addText('• Ofrecer prueba piloto gratuita');
    addText('• Establecer timeline de implementación');
    addText('• Programar siguiente reunión');
    addText('Call to action: "¿Cuándo podemos empezar con la fase piloto?"');

    // Section 6: FAQ and Objections
    pdf.addPage();
    yPosition = margin;
    addText('6. PREGUNTAS FRECUENTES Y MANEJO DE OBJECIONES', 16, true);
    yPosition += 5;

    addText('OBJECIÓN 1: "EL COSTO ES MUY ALTO"', 12, true);
    yPosition += 3;

    addText('Respuesta estructurada:', 11, true);
    addText('Reconocer: "Entiendo su preocupación por la inversión inicial"');
    addText('Reframe: "Veámoslo como una inversión, no un gasto"');
    addText('Evidencia: "Clientes similares recuperan la inversión en 8 meses"');
    addText('Beneficio: "Además del ahorro, mejora su imagen política"');
    addText('Acción: "¿Qué tal si empezamos con un piloto de bajo riesgo?"');
    yPosition += 5;

    addText('OBJECIÓN 2: "YA TENEMOS UN SISTEMA"', 12, true);
    yPosition += 3;

    addText('Respuesta estructurada:', 11, true);
    addText('Reconocer: "Es inteligente maximizar inversiones existentes"');
    addText('Diferenciación: "ConnectEG se integra, no reemplaza"');
    addText('Evidencia: "Hemos integrado exitosamente con [sistema común]"');
    addText('Valor único: "La diferencia está en la precisión del 94% vs su 65% actual"');
    addText('Prueba: "¿Podemos hacer una prueba comparativa de 30 días?"');
    yPosition += 5;

    addText('OBJECIÓN 3: "MI EQUIPO NO TIENE TIEMPO PARA APRENDER"', 12, true);
    yPosition += 3;

    addText('Respuesta estructurada:', 11, true);
    addText('Empatía: "El tiempo de su equipo es valioso, lo entiendo"');
    addText('Solución: "Nuestro sistema reduce trabajo, no lo aumenta"');
    addText('Evidencia: "La capacitación toma solo 4 horas y ahorra 20 horas semanales"');
    addText('Soporte: "Incluimos 6 meses de soporte 24/7 sin costo"');
    addText('Garantía: "Si no ve resultados en 60 días, devolvemos su inversión"');
    yPosition += 5;

    addText('PREGUNTAS TÉCNICAS COMUNES', 12, true);
    yPosition += 3;

    addText('P: "¿Funciona sin internet?"', 11, true);
    addText('R: "Sí, el modo offline permite captura y sincroniza automáticamente al conectarse"');
    yPosition += 3;

    addText('P: "¿Qué pasa con la privacidad de datos?"', 11, true);
    addText('R: "Cumplimos GDPR y ISO 27001. Los datos se almacenan localmente si lo prefiere"');
    yPosition += 3;

    addText('P: "¿Cuánto tiempo toma la implementación?"', 11, true);
    addText('R: "Piloto en 2 semanas, implementación completa en 6-8 semanas según tamaño"');

    // Section 7: Next Steps
    pdf.addPage();
    yPosition = margin;
    addText('7. PRÓXIMOS PASOS Y CIERRE EFECTIVO', 16, true);
    yPosition += 5;

    addText('ESTRATEGIA DE CIERRE POR TIPO DE CLIENTE', 12, true);
    yPosition += 3;

    addText('PARA ALCALDES/AUTORIDADES MUNICIPALES:', 11, true);
    addText('Paso 1: Resumen de valor político');
    addText('"En resumen, ConnectEG le ayuda a:"');
    addText('• Cumplir promesas de campaña sobre modernización');
    addText('• Generar ahorros visibles para sus ciudadanos');
    addText('• Posicionarse como líder innovador en la región');
    yPosition += 3;

    addText('Paso 2: Crear urgencia');
    addText('"Otros municipios ya están implementando. El que se tarde perderá ventaja competitiva"');
    yPosition += 3;

    addText('Paso 3: Oferta específica');
    addText('"Propongo iniciar con un piloto de 500 direcciones sin costo durante 30 días"');
    yPosition += 3;

    addText('Paso 4: Siguiente acción clara');
    addText('"¿Podemos programar una reunión con su equipo técnico para esta semana?"');
    yPosition += 5;

    addText('PARA DIRECTORES DE EMERGENCIAS:', 11, true);
    addText('Paso 1: Apelación emocional');
    addText('"Cada minuto cuenta cuando se trata de salvar vidas"');
    yPosition += 3;

    addText('Paso 2: Evidencia concreta');
    addText('"En Municipio X redujimos tiempo de respuesta de 12 a 7 minutos"');
    yPosition += 3;

    addText('Paso 3: Eliminación de riesgo');
    addText('"Empezamos con una zona de alto riesgo, sin afectar operaciones actuales"');
    yPosition += 3;

    addText('Paso 4: Compromiso mutuo');
    addText('"Si ve mejoras en 60 días, expandimos. Si no, no paga nada"');
    yPosition += 5;

    addText('PARA EMPRESARIOS/SECTOR PRIVADO:', 11, true);
    addText('Paso 1: Enfoque en ROI');
    addText('"$150K de inversión generan $380K de ahorro en año 1"');
    yPosition += 3;

    addText('Paso 2: Ventaja competitiva');
    addText('"Sus competidores internacionales ya usan tecnología similar"');
    yPosition += 3;

    addText('Paso 3: Facilidad de implementación');
    addText('"Integración sin interrumpir operaciones actuales"');
    yPosition += 3;

    addText('Paso 4: Escalabilidad');
    addText('"Empiece con una región, escale según resultados"');
    yPosition += 5;

    addText('HERRAMIENTAS DE CIERRE UNIVERSALES', 12, true);
    yPosition += 3;

    addText('La Pregunta de Asunción:', 11, true);
    addText('"¿Prefiere implementar en Q1 o Q2 del próximo año?"');
    yPosition += 3;

    addText('El Cierre de Alternativa:', 11, true);
    addText('"¿Le parece mejor empezar con el paquete básico o el completo?"');
    yPosition += 3;

    addText('El Cierre de Urgencia:', 11, true);
    addText('"Esta semana podemos incluir 6 meses adicionales de soporte sin costo"');
    yPosition += 3;

    addText('CALENDARIO DE SEGUIMIENTO', 12, true);
    yPosition += 3;

    addText('Día 1: Envío de propuesta personalizada');
    addText('Día 3: Llamada de seguimiento para dudas');
    addText('Día 7: Segunda reunión con equipo técnico');
    addText('Día 14: Presentación a comité de decisión');
    addText('Día 21: Negociación final y firma');
    addText('Día 30: Inicio de implementación');

    // Footer
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    const pageCount = pdf.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.text(`ConnectEG - Paquete de Demostración para Clientes | Página ${i} de ${pageCount}`, pageWidth / 2, 290, { align: 'center' });
    }

    pdf.save('ConnectEG-Paquete-Demo-Clientes.pdf');
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Paquete de Demostración ConnectEG
            </h1>
            <p className="text-muted-foreground text-lg">
              Guía completa para presentaciones efectivas a clientes con personas, scripts, 
              pantallas críticas, KPIs y timeline de demostración en vivo
            </p>
          </div>

          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-muted/50 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">📋 Contenido Incluido</h3>
                <ul className="space-y-2 text-sm">
                  <li>• 3 Personas detalladas con presupuestos reales</li>
                  <li>• Scripts palabra por palabra para 15 minutos</li>
                  <li>• Secuencia exacta de pantallas a mostrar</li>
                  <li>• KPIs con datos específicos de impacto</li>
                  <li>• Timeline cronometrado de demostración</li>
                  <li>• Manejo de objeciones comunes</li>
                  <li>• Estrategias de cierre por tipo de cliente</li>
                </ul>
              </div>

              <div className="bg-muted/50 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">🎯 Resultados Esperados</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Incremento del 40% en tasa de conversión</li>
                  <li>• Reducción del 60% en tiempo de ciclo de venta</li>
                  <li>• Mayor confianza del equipo comercial</li>
                  <li>• Presentaciones más profesionales e impactantes</li>
                  <li>• Mejor manejo de objeciones técnicas</li>
                  <li>• Cierres más efectivos y predecibles</li>
                </ul>
              </div>
            </div>

            <div className="bg-primary/10 p-6 rounded-lg border border-primary/20">
              <h3 className="font-semibold text-lg mb-3">🚀 Casos de Uso del Demo Pack</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Equipo de Ventas</h4>
                  <p>Scripts probados para convertir prospectos en clientes pagos</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Ejecutivos C-Level</h4>
                  <p>Presentaciones a juntas directivas y comités de decisión</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Partners & Resellers</h4>
                  <p>Material estandarizado para canales de distribución</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Button 
                onClick={generatePDF}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Download className="mr-2 h-5 w-5" />
                Descargar Paquete Completo de Demostración (PDF)
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Documento de 18 páginas con todo lo necesario para demos exitosas
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDemoPackReport;