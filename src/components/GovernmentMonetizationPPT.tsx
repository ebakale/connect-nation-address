import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import pptxgen from "pptxgenjs";

export const GovernmentMonetizationPPT = () => {
  const generatePowerPoint = async () => {
    const pptx = new pptxgen();

    // Slide 1: Title
    const slide1 = pptx.addSlide();
    slide1.background = { color: "1e293b" };
    slide1.addText("Sistema de Direcciones Digitales de Guinea Ecuatorial", {
      x: 0.5,
      y: 2.0,
      w: 9,
      h: 1.5,
      fontSize: 36,
      bold: true,
      color: "FFFFFF",
      align: "center",
    });
    slide1.addText("Estrategia de Implementación Gubernamental y Monetización", {
      x: 0.5,
      y: 3.5,
      w: 9,
      h: 0.8,
      fontSize: 24,
      color: "94a3b8",
      align: "center",
    });

    // Slide 2: Agenda
    const slide2 = pptx.addSlide();
    slide2.background = { color: "FFFFFF" };
    slide2.addText("Agenda", {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.6,
      fontSize: 32,
      bold: true,
      color: "1e293b",
    });
    slide2.addText([
      { text: "1. ", options: { bold: true, color: "3b82f6" } },
      { text: "Estrategia de Implementación Obligatoria\n", options: { color: "334155" } },
      { text: "2. ", options: { bold: true, color: "3b82f6" } },
      { text: "Conectividad Limitada: Soluciones Prácticas\n", options: { color: "334155" } },
      { text: "3. ", options: { bold: true, color: "3b82f6" } },
      { text: "Marco de Implementación Justa y Rápida\n", options: { color: "334155" } },
      { text: "4. ", options: { bold: true, color: "3b82f6" } },
      { text: "Estrategia de Monetización\n", options: { color: "334155" } },
      { text: "5. ", options: { bold: true, color: "3b82f6" } },
      { text: "Casos de Uso y Modelos de Ingresos", options: { color: "334155" } },
    ], {
      x: 1,
      y: 1.5,
      w: 8,
      h: 3.5,
      fontSize: 20,
      lineSpacing: 36,
    });

    // Slide 3: Implementación Obligatoria - Parte 1
    const slide3 = pptx.addSlide();
    slide3.background = { color: "FFFFFF" };
    slide3.addText("Estrategia de Implementación Obligatoria", {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.6,
      fontSize: 28,
      bold: true,
      color: "1e293b",
    });
    slide3.addText("Fase 1: Marco Legal (Meses 1-3)", {
      x: 0.5,
      y: 1.3,
      w: 9,
      h: 0.4,
      fontSize: 22,
      bold: true,
      color: "3b82f6",
    });
    slide3.addText([
      { text: "• ", options: { bullet: true } },
      { text: "Decreto presidencial estableciendo el sistema como estándar nacional\n" },
      { text: "• ", options: { bullet: true } },
      { text: "Ley de direcciones digitales con sanciones por incumplimiento\n" },
      { text: "• ", options: { bullet: true } },
      { text: "Requisito obligatorio para todos los servicios gubernamentales\n" },
      { text: "• ", options: { bullet: true } },
      { text: "Período de gracia de 12 meses para adaptación" },
    ], {
      x: 0.8,
      y: 1.9,
      w: 8.5,
      h: 1.5,
      fontSize: 16,
      color: "334155",
      lineSpacing: 24,
    });
    slide3.addText("Fase 2: Integración Institucional (Meses 4-9)", {
      x: 0.5,
      y: 3.6,
      w: 9,
      h: 0.4,
      fontSize: 22,
      bold: true,
      color: "3b82f6",
    });
    slide3.addText([
      { text: "• ", options: { bullet: true } },
      { text: "Registro Civil: Obligatorio para nuevos nacimientos y renovaciones\n" },
      { text: "• ", options: { bullet: true } },
      { text: "Servicios Públicos: Requisito para contratos de agua, luz, telefonía\n" },
      { text: "• ", options: { bullet: true } },
      { text: "Sistema Bancario: Necesario para apertura de cuentas\n" },
      { text: "• ", options: { bullet: true } },
      { text: "Servicios de Salud: Integración con historias clínicas" },
    ], {
      x: 0.8,
      y: 4.1,
      w: 8.5,
      h: 1.5,
      fontSize: 16,
      color: "334155",
      lineSpacing: 24,
    });

    // Slide 4: Implementación Obligatoria - Parte 2
    const slide4 = pptx.addSlide();
    slide4.background = { color: "FFFFFF" };
    slide4.addText("Estrategia de Implementación Obligatoria (cont.)", {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.6,
      fontSize: 28,
      bold: true,
      color: "1e293b",
    });
    slide4.addText("Fase 3: Adopción Masiva (Meses 10-18)", {
      x: 0.5,
      y: 1.3,
      w: 9,
      h: 0.4,
      fontSize: 22,
      bold: true,
      color: "3b82f6",
    });
    slide4.addText([
      { text: "• ", options: { bullet: true } },
      { text: "Empresas privadas: Obligatorio para licencias comerciales\n" },
      { text: "• ", options: { bullet: true } },
      { text: "E-commerce: Requisito para operaciones de entrega\n" },
      { text: "• ", options: { bullet: true } },
      { text: "Seguros: Necesario para pólizas de propiedad y vehículos\n" },
      { text: "• ", options: { bullet: true } },
      { text: "Educación: Registro escolar y universitario" },
    ], {
      x: 0.8,
      y: 1.9,
      w: 8.5,
      h: 1.5,
      fontSize: 16,
      color: "334155",
      lineSpacing: 24,
    });
    slide4.addText("Incentivos para Adopción Temprana", {
      x: 0.5,
      y: 3.6,
      w: 9,
      h: 0.4,
      fontSize: 22,
      bold: true,
      color: "10b981",
    });
    slide4.addText([
      { text: "• ", options: { bullet: true } },
      { text: "Descuentos en servicios públicos (10-15%) durante el primer año\n" },
      { text: "• ", options: { bullet: true } },
      { text: "Prioridad en trámites gubernamentales\n" },
      { text: "• ", options: { bullet: true } },
      { text: "Acceso gratuito a servicios premium del sistema\n" },
      { text: "• ", options: { bullet: true } },
      { text: "Reconocimiento público a comunidades con mayor adopción" },
    ], {
      x: 0.8,
      y: 4.1,
      w: 8.5,
      h: 1.5,
      fontSize: 16,
      color: "334155",
      lineSpacing: 24,
    });

    // Slide 5: Soluciones para Conectividad Limitada
    const slide5 = pptx.addSlide();
    slide5.background = { color: "FFFFFF" };
    slide5.addText("Conectividad Limitada: Soluciones Prácticas", {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.6,
      fontSize: 28,
      bold: true,
      color: "1e293b",
    });
    slide5.addText("Modo Offline Completo", {
      x: 0.5,
      y: 1.3,
      w: 4.2,
      h: 0.4,
      fontSize: 20,
      bold: true,
      color: "3b82f6",
    });
    slide5.addText([
      { text: "• ", options: { bullet: true } },
      { text: "Captura de datos sin internet\n" },
      { text: "• ", options: { bullet: true } },
      { text: "Sincronización automática\n" },
      { text: "• ", options: { bullet: true } },
      { text: "Mapas precargados offline\n" },
      { text: "• ", options: { bullet: true } },
      { text: "Códigos QR físicos en propiedades" },
    ], {
      x: 0.5,
      y: 1.9,
      w: 4.2,
      h: 2.0,
      fontSize: 15,
      color: "334155",
      lineSpacing: 22,
    });
    slide5.addText("Infraestructura de Apoyo", {
      x: 5.3,
      y: 1.3,
      w: 4.2,
      h: 0.4,
      fontSize: 20,
      bold: true,
      color: "3b82f6",
    });
    slide5.addText([
      { text: "• ", options: { bullet: true } },
      { text: "Puntos de sincronización WiFi públicos\n" },
      { text: "• ", options: { bullet: true } },
      { text: "Agentes de campo con dispositivos móviles\n" },
      { text: "• ", options: { bullet: true } },
      { text: "Centros comunitarios con acceso\n" },
      { text: "• ", options: { bullet: true } },
      { text: "SMS como canal alternativo" },
    ], {
      x: 5.3,
      y: 1.9,
      w: 4.2,
      h: 2.0,
      fontSize: 15,
      color: "334155",
      lineSpacing: 22,
    });
    slide5.addText("Proceso Híbrido de Registro", {
      x: 0.5,
      y: 4.2,
      w: 9,
      h: 0.4,
      fontSize: 20,
      bold: true,
      color: "10b981",
    });
    slide5.addText([
      { text: "1. ", options: { bold: true } },
      { text: "Agente visita propiedad → " },
      { text: "2. ", options: { bold: true } },
      { text: "Captura datos offline → " },
      { text: "3. ", options: { bold: true } },
      { text: "Sincroniza en punto WiFi → " },
      { text: "4. ", options: { bold: true } },
      { text: "Dirección activada" },
    ], {
      x: 0.8,
      y: 4.8,
      w: 8.5,
      h: 0.6,
      fontSize: 14,
      color: "334155",
    });

    // Slide 6: Marco de Implementación Justa
    const slide6 = pptx.addSlide();
    slide6.background = { color: "FFFFFF" };
    slide6.addText("Implementación Justa y Rápida", {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.6,
      fontSize: 28,
      bold: true,
      color: "1e293b",
    });
    slide6.addText("Equidad y Accesibilidad", {
      x: 0.5,
      y: 1.3,
      w: 4.2,
      h: 0.4,
      fontSize: 20,
      bold: true,
      color: "3b82f6",
    });
    slide6.addText([
      { text: "• ", options: { bullet: true } },
      { text: "Registro gratuito para ciudadanos\n" },
      { text: "• ", options: { bullet: true } },
      { text: "Brigadas móviles en áreas remotas\n" },
      { text: "• ", options: { bullet: true } },
      { text: "Soporte multiidioma (ES/FR/EN)\n" },
      { text: "• ", options: { bullet: true } },
      { text: "Sin requisito de smartphone personal" },
    ], {
      x: 0.5,
      y: 1.9,
      w: 4.2,
      h: 2.0,
      fontSize: 15,
      color: "334155",
      lineSpacing: 22,
    });
    slide6.addText("Velocidad de Implementación", {
      x: 5.3,
      y: 1.3,
      w: 4.2,
      h: 0.4,
      fontSize: 20,
      bold: true,
      color: "3b82f6",
    });
    slide6.addText([
      { text: "• ", options: { bullet: true } },
      { text: "Meta: 500,000 direcciones en 18 meses\n" },
      { text: "• ", options: { bullet: true } },
      { text: "100 agentes de campo capacitados\n" },
      { text: "• ", options: { bullet: true } },
      { text: "Sistema de verificación acelerada\n" },
      { text: "• ", options: { bullet: true } },
      { text: "Auto-registro para áreas urbanas" },
    ], {
      x: 5.3,
      y: 1.9,
      w: 4.2,
      h: 2.0,
      fontSize: 15,
      color: "334155",
      lineSpacing: 22,
    });
    slide6.addText("Mecanismos de Protección", {
      x: 0.5,
      y: 4.2,
      w: 9,
      h: 0.4,
      fontSize: 20,
      bold: true,
      color: "10b981",
    });
    slide6.addText([
      { text: "• ", options: { bullet: true } },
      { text: "Privacidad garantizada: datos personales protegidos\n" },
      { text: "• ", options: { bullet: true } },
      { text: "Sistema de apelación para disputas\n" },
      { text: "• ", options: { bullet: true } },
      { text: "Transparencia en proceso de asignación\n" },
      { text: "• ", options: { bullet: true } },
      { text: "Auditorías independientes trimestrales" },
    ], {
      x: 0.8,
      y: 4.8,
      w: 8.5,
      h: 1.2,
      fontSize: 14,
      color: "334155",
      lineSpacing: 20,
    });

    // Slide 7: Estrategia de Monetización - Overview
    const slide7 = pptx.addSlide();
    slide7.background = { color: "1e293b" };
    slide7.addText("Estrategia de Monetización", {
      x: 0.5,
      y: 2.0,
      w: 9,
      h: 1.0,
      fontSize: 40,
      bold: true,
      color: "FFFFFF",
      align: "center",
    });
    slide7.addText("Sostenibilidad Financiera del Sistema", {
      x: 0.5,
      y: 3.2,
      w: 9,
      h: 0.6,
      fontSize: 24,
      color: "94a3b8",
      align: "center",
    });

    // Slide 8: Modelo de Monetización
    const slide8 = pptx.addSlide();
    slide8.background = { color: "FFFFFF" };
    slide8.addText("Modelo de Monetización Dual", {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.6,
      fontSize: 28,
      bold: true,
      color: "1e293b",
    });
    slide8.addText("Gratuito para Ciudadanos", {
      x: 0.5,
      y: 1.3,
      w: 4.2,
      h: 0.5,
      fontSize: 20,
      bold: true,
      color: "10b981",
      fill: { color: "d1fae5" },
    });
    slide8.addText([
      { text: "✓ ", options: { color: "10b981", bold: true } },
      { text: "Registro de dirección\n" },
      { text: "✓ ", options: { color: "10b981", bold: true } },
      { text: "Búsqueda básica\n" },
      { text: "✓ ", options: { color: "10b981", bold: true } },
      { text: "Código QR personal\n" },
      { text: "✓ ", options: { color: "10b981", bold: true } },
      { text: "Acceso móvil\n" },
      { text: "✓ ", options: { color: "10b981", bold: true } },
      { text: "Emergencias 100% gratis" },
    ], {
      x: 0.5,
      y: 2.0,
      w: 4.2,
      h: 2.5,
      fontSize: 15,
      color: "334155",
      lineSpacing: 24,
    });
    slide8.addText("De Pago para Empresas/Instituciones", {
      x: 5.3,
      y: 1.3,
      w: 4.2,
      h: 0.5,
      fontSize: 20,
      bold: true,
      color: "3b82f6",
      fill: { color: "dbeafe" },
    });
    slide8.addText([
      { text: "$ ", options: { color: "3b82f6", bold: true } },
      { text: "Acceso API para integración\n" },
      { text: "$ ", options: { color: "3b82f6", bold: true } },
      { text: "Validación masiva de direcciones\n" },
      { text: "$ ", options: { color: "3b82f6", bold: true } },
      { text: "Analytics y reportes\n" },
      { text: "$ ", options: { color: "3b82f6", bold: true } },
      { text: "SLA garantizado\n" },
      { text: "$ ", options: { color: "3b82f6", bold: true } },
      { text: "Soporte técnico premium" },
    ], {
      x: 5.3,
      y: 2.0,
      w: 4.2,
      h: 2.5,
      fontSize: 15,
      color: "334155",
      lineSpacing: 24,
    });
    slide8.addText("Principio: Bien Público con Sostenibilidad Comercial", {
      x: 0.5,
      y: 4.8,
      w: 9,
      h: 0.6,
      fontSize: 18,
      bold: true,
      color: "FFFFFF",
      align: "center",
      fill: { color: "3b82f6" },
    });

    // Slide 9: Servicios de Emergencia (EMS)
    const slide9 = pptx.addSlide();
    slide9.background = { color: "FFFFFF" };
    slide9.addText("Monetización: Servicios de Emergencia (EMS)", {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.6,
      fontSize: 28,
      bold: true,
      color: "1e293b",
    });
    slide9.addText("Servicios Gratuitos Base", {
      x: 0.5,
      y: 1.3,
      w: 9,
      h: 0.4,
      fontSize: 20,
      bold: true,
      color: "10b981",
    });
    slide9.addText([
      { text: "• ", options: { bullet: true } },
      { text: "Alertas de emergencia ciudadanas\n" },
      { text: "• ", options: { bullet: true } },
      { text: "Geolocalización automática\n" },
      { text: "• ", options: { bullet: true } },
      { text: "Coordinación básica de respuesta" },
    ], {
      x: 0.8,
      y: 1.9,
      w: 8.5,
      h: 1.2,
      fontSize: 16,
      color: "334155",
      lineSpacing: 24,
    });
    slide9.addText("Servicios Premium para Hospitales/Clínicas Privadas", {
      x: 0.5,
      y: 3.3,
      w: 9,
      h: 0.4,
      fontSize: 20,
      bold: true,
      color: "3b82f6",
    });
    slide9.addText([
      { text: "💰 ", options: { bold: true } },
      { text: "API de Despacho Avanzado: ", options: { bold: true } },
      { text: "$500/mes + $0.50 por llamada despachada\n" },
      { text: "💰 ", options: { bold: true } },
      { text: "Integración con Sistema de Gestión Hospitalaria: ", options: { bold: true } },
      { text: "$1,200/mes\n" },
      { text: "💰 ", options: { bold: true } },
      { text: "Analytics de Tiempos de Respuesta: ", options: { bold: true } },
      { text: "$300/mes\n" },
      { text: "💰 ", options: { bold: true } },
      { text: "Servicio de Ambulancia Privada con Prioridad: ", options: { bold: true } },
      { text: "$2,000/mes\n" },
      { text: "💰 ", options: { bold: true } },
      { text: "Historiales de Pacientes Vinculados a Direcciones: ", options: { bold: true } },
      { text: "$800/mes" },
    ], {
      x: 0.8,
      y: 3.9,
      w: 8.5,
      h: 2.2,
      fontSize: 14,
      color: "334155",
      lineSpacing: 20,
    });
    slide9.addText("Ingresos Proyectados: $180,000 - $300,000/año", {
      x: 0.5,
      y: 6.3,
      w: 9,
      h: 0.4,
      fontSize: 16,
      bold: true,
      color: "FFFFFF",
      align: "center",
      fill: { color: "10b981" },
    });

    // Slide 10: Servicios Postales
    const slide10 = pptx.addSlide();
    slide10.background = { color: "FFFFFF" };
    slide10.addText("Monetización: Servicios Postales", {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.6,
      fontSize: 28,
      bold: true,
      color: "1e293b",
    });
    slide10.addText("Correos de Guinea Ecuatorial (Público)", {
      x: 0.5,
      y: 1.3,
      w: 9,
      h: 0.4,
      fontSize: 20,
      bold: true,
      color: "3b82f6",
    });
    slide10.addText([
      { text: "💰 ", options: { bold: true } },
      { text: "Licencia Institucional: ", options: { bold: true } },
      { text: "$8,000/año (negociable con gobierno)\n" },
      { text: "💰 ", options: { bold: true } },
      { text: "Validación en Tiempo Real de Direcciones: ", options: { bold: true } },
      { text: "$0.05 por validación\n" },
      { text: "💰 ", options: { bold: true } },
      { text: "Optimización de Rutas de Entrega: ", options: { bold: true } },
      { text: "$1,500/mes\n" },
      { text: "💰 ", options: { bold: true } },
      { text: "Tracking de Paquetes con Direcciones Digitales: ", options: { bold: true } },
      { text: "$0.10 por envío" },
    ], {
      x: 0.8,
      y: 1.9,
      w: 8.5,
      h: 1.8,
      fontSize: 14,
      color: "334155",
      lineSpacing: 20,
    });
    slide10.addText("Empresas de Mensajería Privada (DHL, UPS, locales)", {
      x: 0.5,
      y: 3.9,
      w: 9,
      h: 0.4,
      fontSize: 20,
      bold: true,
      color: "3b82f6",
    });
    slide10.addText([
      { text: "💰 ", options: { bold: true } },
      { text: "Licencia Comercial API: ", options: { bold: true } },
      { text: "$3,000/mes por empresa\n" },
      { text: "💰 ", options: { bold: true } },
      { text: "Verificación de Dirección Pre-Entrega: ", options: { bold: true } },
      { text: "$0.15 por verificación\n" },
      { text: "💰 ", options: { bold: true } },
      { text: "Confirmación de Entrega Digital: ", options: { bold: true } },
      { text: "$0.20 por confirmación\n" },
      { text: "💰 ", options: { bold: true } },
      { text: "Panel de Control con Analytics: ", options: { bold: true } },
      { text: "$800/mes adicional" },
    ], {
      x: 0.8,
      y: 4.5,
      w: 8.5,
      h: 1.8,
      fontSize: 14,
      color: "334155",
      lineSpacing: 20,
    });
    slide10.addText("Ingresos Proyectados: $250,000 - $400,000/año", {
      x: 0.5,
      y: 6.5,
      w: 9,
      h: 0.4,
      fontSize: 16,
      bold: true,
      color: "FFFFFF",
      align: "center",
      fill: { color: "10b981" },
    });

    // Slide 11: Utilities (Servicios Públicos)
    const slide11 = pptx.addSlide();
    slide11.background = { color: "FFFFFF" };
    slide11.addText("Monetización: Servicios Públicos (Utilities)", {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.6,
      fontSize: 28,
      bold: true,
      color: "1e293b",
    });
    slide11.addText("Compañías de Electricidad y Agua", {
      x: 0.5,
      y: 1.3,
      w: 9,
      h: 0.4,
      fontSize: 20,
      bold: true,
      color: "3b82f6",
    });
    slide11.addText([
      { text: "💰 ", options: { bold: true } },
      { text: "Licencia Institucional: ", options: { bold: true } },
      { text: "$10,000/año por compañía\n" },
      { text: "💰 ", options: { bold: true } },
      { text: "Vinculación de Medidores a Direcciones: ", options: { bold: true } },
      { text: "$0.25 por medidor activo/mes\n" },
      { text: "💰 ", options: { bold: true } },
      { text: "Geolocalización de Averías: ", options: { bold: true } },
      { text: "$1,000/mes\n" },
      { text: "💰 ", options: { bold: true } },
      { text: "Optimización de Lectura de Medidores: ", options: { bold: true } },
      { text: "$2,500/mes" },
    ], {
      x: 0.8,
      y: 1.9,
      w: 8.5,
      h: 1.8,
      fontSize: 14,
      color: "334155",
      lineSpacing: 20,
    });
    slide11.addText("Telecomunicaciones", {
      x: 0.5,
      y: 3.9,
      w: 9,
      h: 0.4,
      fontSize: 20,
      bold: true,
      color: "3b82f6",
    });
    slide11.addText([
      { text: "💰 ", options: { bold: true } },
      { text: "Integración de Cobertura de Red: ", options: { bold: true } },
      { text: "$5,000/mes por operador\n" },
      { text: "💰 ", options: { bold: true } },
      { text: "Validación de Direcciones para Instalación: ", options: { bold: true } },
      { text: "$0.30 por validación\n" },
      { text: "💰 ", options: { bold: true } },
      { text: "Mapa de Cobertura con Direcciones: ", options: { bold: true } },
      { text: "$1,500/mes\n" },
      { text: "💰 ", options: { bold: true } },
      { text: "API para Facturación: ", options: { bold: true } },
      { text: "$3,000/mes" },
    ], {
      x: 0.8,
      y: 4.5,
      w: 8.5,
      h: 1.8,
      fontSize: 14,
      color: "334155",
      lineSpacing: 20,
    });
    slide11.addText("Ingresos Proyectados: $300,000 - $500,000/año", {
      x: 0.5,
      y: 6.5,
      w: 9,
      h: 0.4,
      fontSize: 16,
      bold: true,
      color: "FFFFFF",
      align: "center",
      fill: { color: "10b981" },
    });

    // Slide 12: E-commerce y Última Milla
    const slide12 = pptx.addSlide();
    slide12.background = { color: "FFFFFF" };
    slide12.addText("Monetización: E-commerce y Última Milla", {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.6,
      fontSize: 28,
      bold: true,
      color: "1e293b",
    });
    slide12.addText("Plataformas de E-commerce", {
      x: 0.5,
      y: 1.3,
      w: 9,
      h: 0.4,
      fontSize: 20,
      bold: true,
      color: "3b82f6",
    });
    slide12.addText([
      { text: "💰 ", options: { bold: true } },
      { text: "Integración API Checkout: ", options: { bold: true } },
      { text: "$2,500/mes + $0.10 por transacción verificada\n" },
      { text: "💰 ", options: { bold: true } },
      { text: "Auto-completado de Direcciones: ", options: { bold: true } },
      { text: "$1,500/mes\n" },
      { text: "💰 ", options: { bold: true } },
      { text: "Validación Preventiva (reduce devoluciones): ", options: { bold: true } },
      { text: "$0.08 por validación\n" },
      { text: "💰 ", options: { bold: true } },
      { text: "Widget de Mapa Interactivo: ", options: { bold: true } },
      { text: "$800/mes" },
    ], {
      x: 0.8,
      y: 1.9,
      w: 8.5,
      h: 1.8,
      fontSize: 14,
      color: "334155",
      lineSpacing: 20,
    });
    slide12.addText("Servicios de Delivery y Última Milla", {
      x: 0.5,
      y: 3.9,
      w: 9,
      h: 0.4,
      fontSize: 20,
      bold: true,
      color: "3b82f6",
    });
    slide12.addText([
      { text: "💰 ", options: { bold: true } },
      { text: "Licencia para Aplicaciones de Delivery: ", options: { bold: true } },
      { text: "$4,000/mes\n" },
      { text: "💰 ", options: { bold: true } },
      { text: "Optimización de Rutas en Tiempo Real: ", options: { bold: true } },
      { text: "$2,000/mes\n" },
      { text: "💰 ", options: { bold: true } },
      { text: "Verificación por Entrega: ", options: { bold: true } },
      { text: "$0.12 por entrega completada\n" },
      { text: "💰 ", options: { bold: true } },
      { text: "Panel de Conductor con Navegación: ", options: { bold: true } },
      { text: "$1,200/mes\n" },
      { text: "💰 ", options: { bold: true } },
      { text: "Analytics de Desempeño: ", options: { bold: true } },
      { text: "$600/mes" },
    ], {
      x: 0.8,
      y: 4.5,
      w: 8.5,
      h: 2.0,
      fontSize: 14,
      color: "334155",
      lineSpacing: 19,
    });
    slide12.addText("Ingresos Proyectados: $350,000 - $600,000/año", {
      x: 0.5,
      y: 6.7,
      w: 9,
      h: 0.4,
      fontSize: 16,
      bold: true,
      color: "FFFFFF",
      align: "center",
      fill: { color: "10b981" },
    });

    // Slide 13: Otros Sectores
    const slide13 = pptx.addSlide();
    slide13.background = { color: "FFFFFF" };
    slide13.addText("Monetización: Otros Sectores", {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.6,
      fontSize: 28,
      bold: true,
      color: "1e293b",
    });
    slide13.addText("Sector Inmobiliario", {
      x: 0.5,
      y: 1.2,
      w: 4.2,
      h: 0.4,
      fontSize: 18,
      bold: true,
      color: "3b82f6",
    });
    slide13.addText([
      { text: "• Integración MLS: $1,500/mes\n" },
      { text: "• Verificación de propiedades: $0.50/cada una\n" },
      { text: "• Tours virtuales con direcciones: $800/mes" },
    ], {
      x: 0.5,
      y: 1.7,
      w: 4.2,
      h: 1.2,
      fontSize: 13,
      color: "334155",
      lineSpacing: 18,
    });
    slide13.addText("Seguros", {
      x: 5.3,
      y: 1.2,
      w: 4.2,
      h: 0.4,
      fontSize: 18,
      bold: true,
      color: "3b82f6",
    });
    slide13.addText([
      { text: "• Evaluación de riesgo por ubicación: $2,000/mes\n" },
      { text: "• Validación de siniestros: $0.40/caso\n" },
      { text: "• Mapas de riesgo: $1,200/mes" },
    ], {
      x: 5.3,
      y: 1.7,
      w: 4.2,
      h: 1.2,
      fontSize: 13,
      color: "334155",
      lineSpacing: 18,
    });
    slide13.addText("Bancos y Finanzas", {
      x: 0.5,
      y: 3.1,
      w: 4.2,
      h: 0.4,
      fontSize: 18,
      bold: true,
      color: "3b82f6",
    });
    slide13.addText([
      { text: "• KYC y verificación de domicilio: $0.60/verificación\n" },
      { text: "• Anti-fraude geográfico: $3,500/mes\n" },
      { text: "• Análisis crediticio por zona: $2,500/mes" },
    ], {
      x: 0.5,
      y: 3.6,
      w: 4.2,
      h: 1.2,
      fontSize: 13,
      color: "334155",
      lineSpacing: 18,
    });
    slide13.addText("Transporte y Logística", {
      x: 5.3,
      y: 3.1,
      w: 4.2,
      h: 0.4,
      fontSize: 18,
      bold: true,
      color: "3b82f6",
    });
    slide13.addText([
      { text: "• Gestión de flotas: $2,800/mes\n" },
      { text: "• Planificación de rutas: $1,800/mes\n" },
      { text: "• Tracking de vehículos: $0.05/evento" },
    ], {
      x: 5.3,
      y: 3.6,
      w: 4.2,
      h: 1.2,
      fontSize: 13,
      color: "334155",
      lineSpacing: 18,
    });
    slide13.addText("Gobierno y Servicios Públicos", {
      x: 0.5,
      y: 5.0,
      w: 9,
      h: 0.4,
      fontSize: 18,
      bold: true,
      color: "3b82f6",
    });
    slide13.addText([
      { text: "• Censo y estadísticas: $15,000/año por ministerio\n" },
      { text: "• Planificación urbana: $10,000/año\n" },
      { text: "• Gestión de permisos: $8,000/año" },
    ], {
      x: 0.8,
      y: 5.5,
      w: 8.5,
      h: 1.2,
      fontSize: 13,
      color: "334155",
      lineSpacing: 18,
    });
    slide13.addText("Ingresos Adicionales Proyectados: $200,000 - $350,000/año", {
      x: 0.5,
      y: 6.8,
      w: 9,
      h: 0.4,
      fontSize: 15,
      bold: true,
      color: "FFFFFF",
      align: "center",
      fill: { color: "10b981" },
    });

    // Slide 14: Proyección de Ingresos Total
    const slide14 = pptx.addSlide();
    slide14.background = { color: "FFFFFF" };
    slide14.addText("Proyección Total de Ingresos", {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.6,
      fontSize: 28,
      bold: true,
      color: "1e293b",
    });
    
    // Create a table
    const rows = [
      [
        { text: "Sector", options: { bold: true, fill: { color: "e2e8f0" } } },
        { text: "Ingresos Anuales (Conservador)", options: { bold: true, fill: { color: "e2e8f0" } } },
        { text: "Ingresos Anuales (Optimista)", options: { bold: true, fill: { color: "e2e8f0" } } }
      ],
      [{ text: "Servicios de Emergencia" }, { text: "$180,000" }, { text: "$300,000" }],
      [{ text: "Servicios Postales" }, { text: "$250,000" }, { text: "$400,000" }],
      [{ text: "Utilities (Electricidad, Agua, Telco)" }, { text: "$300,000" }, { text: "$500,000" }],
      [{ text: "E-commerce y Última Milla" }, { text: "$350,000" }, { text: "$600,000" }],
      [{ text: "Otros Sectores" }, { text: "$200,000" }, { text: "$350,000" }],
      [
        { text: "TOTAL", options: { bold: true, fill: { color: "dbeafe" } } },
        { text: "$1,280,000", options: { bold: true, fill: { color: "dbeafe" } } },
        { text: "$2,150,000", options: { bold: true, fill: { color: "dbeafe" } } }
      ],
    ];
    
    slide14.addTable(rows, {
      x: 0.5,
      y: 1.5,
      w: 9,
      h: 3.5,
      fontSize: 14,
      color: "334155",
      fill: { color: "f8fafc" },
      border: { pt: 1, color: "cbd5e1" },
      rowH: 0.5,
      colW: [3.0, 3.0, 3.0],
      align: "center",
      valign: "middle",
    });
    
    slide14.addText("Modelo Escalable", {
      x: 0.5,
      y: 5.3,
      w: 9,
      h: 0.4,
      fontSize: 20,
      bold: true,
      color: "3b82f6",
    });
    slide14.addText([
      { text: "• Los ingresos crecen con la adopción masiva\n" },
      { text: "• Costos operativos relativamente fijos después de la implementación\n" },
      { text: "• ROI positivo esperado en 24-36 meses\n" },
      { text: "• Potencial de expansión regional (CEMAC)" },
    ], {
      x: 0.8,
      y: 5.8,
      w: 8.5,
      h: 1.5,
      fontSize: 15,
      color: "334155",
      lineSpacing: 22,
    });

    // Slide 15: Estructura de Costos
    const slide15 = pptx.addSlide();
    slide15.background = { color: "FFFFFF" };
    slide15.addText("Estructura de Costos Operacionales", {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.6,
      fontSize: 28,
      bold: true,
      color: "1e293b",
    });
    slide15.addText("Inversión Inicial (Año 1)", {
      x: 0.5,
      y: 1.3,
      w: 4.2,
      h: 0.4,
      fontSize: 20,
      bold: true,
      color: "3b82f6",
    });
    slide15.addText([
      { text: "• Infraestructura tecnológica: $200,000\n" },
      { text: "• Capacitación y despliegue: $150,000\n" },
      { text: "• Marketing y comunicación: $100,000\n" },
      { text: "• Legal y regulatorio: $50,000\n" },
      { text: "TOTAL INICIAL: $500,000" },
    ], {
      x: 0.5,
      y: 1.9,
      w: 4.2,
      h: 2.3,
      fontSize: 14,
      color: "334155",
      lineSpacing: 22,
    });
    slide15.addText("Costos Operacionales Anuales", {
      x: 5.3,
      y: 1.3,
      w: 4.2,
      h: 0.4,
      fontSize: 20,
      bold: true,
      color: "3b82f6",
    });
    slide15.addText([
      { text: "• Servidores y hosting: $80,000/año\n" },
      { text: "• Personal técnico (10 personas): $180,000/año\n" },
      { text: "• Mantenimiento y actualizaciones: $60,000/año\n" },
      { text: "• Soporte al cliente: $40,000/año\n" },
      { text: "TOTAL ANUAL: $360,000" },
    ], {
      x: 5.3,
      y: 1.9,
      w: 4.2,
      h: 2.3,
      fontSize: 14,
      color: "334155",
      lineSpacing: 22,
    });
    slide15.addText("Margen de Beneficio Proyectado", {
      x: 0.5,
      y: 4.5,
      w: 9,
      h: 0.5,
      fontSize: 22,
      bold: true,
      color: "FFFFFF",
      align: "center",
      fill: { color: "10b981" },
    });
    slide15.addText([
      { text: "Año 1: ", options: { bold: true } },
      { text: "-$500,000 (inversión inicial)\n" },
      { text: "Año 2: ", options: { bold: true } },
      { text: "+$520,000 a +$890,000 (después de costos)\n" },
      { text: "Año 3+: ", options: { bold: true } },
      { text: "+$920,000 a +$1,790,000/año (escala completa)" },
    ], {
      x: 1.0,
      y: 5.2,
      w: 8.0,
      h: 1.5,
      fontSize: 16,
      color: "334155",
      lineSpacing: 24,
      align: "center",
    });

    // Slide 16: Modelos de Pago Flexibles
    const slide16 = pptx.addSlide();
    slide16.background = { color: "FFFFFF" };
    slide16.addText("Modelos de Pago Flexibles para Clientes", {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.6,
      fontSize: 28,
      bold: true,
      color: "1e293b",
    });
    slide16.addText("Pago por Uso (Pay-as-you-go)", {
      x: 0.5,
      y: 1.3,
      w: 4.2,
      h: 0.4,
      fontSize: 18,
      bold: true,
      color: "3b82f6",
    });
    slide16.addText([
      { text: "✓ Sin compromiso mensual\n" },
      { text: "✓ Ideal para empresas pequeñas\n" },
      { text: "✓ Cobro por transacción\n" },
      { text: "✓ Facturación transparente\n" },
      { text: "Ejemplo: $0.15 por verificación" },
    ], {
      x: 0.5,
      y: 1.9,
      w: 4.2,
      h: 2.0,
      fontSize: 14,
      color: "334155",
      lineSpacing: 20,
    });
    slide16.addText("Suscripción Mensual", {
      x: 5.3,
      y: 1.3,
      w: 4.2,
      h: 0.4,
      fontSize: 18,
      bold: true,
      color: "3b82f6",
    });
    slide16.addText([
      { text: "✓ Tarifas predecibles\n" },
      { text: "✓ Descuentos por volumen\n" },
      { text: "✓ Límites generosos incluidos\n" },
      { text: "✓ Soporte prioritario\n" },
      { text: "Ejemplo: $2,500/mes con 20,000 consultas" },
    ], {
      x: 5.3,
      y: 1.9,
      w: 4.2,
      h: 2.0,
      fontSize: 14,
      color: "334155",
      lineSpacing: 20,
    });
    slide16.addText("Licencias Empresariales", {
      x: 0.5,
      y: 4.2,
      w: 4.2,
      h: 0.4,
      fontSize: 18,
      bold: true,
      color: "3b82f6",
    });
    slide16.addText([
      { text: "✓ Acceso ilimitado\n" },
      { text: "✓ SLA garantizado 99.9%\n" },
      { text: "✓ Integración personalizada\n" },
      { text: "✓ Soporte 24/7\n" },
      { text: "Ejemplo: $50,000/año para corporación" },
    ], {
      x: 0.5,
      y: 4.8,
      w: 4.2,
      h: 2.0,
      fontSize: 14,
      color: "334155",
      lineSpacing: 20,
    });
    slide16.addText("Subsidio Gubernamental", {
      x: 5.3,
      y: 4.2,
      w: 4.2,
      h: 0.4,
      fontSize: 18,
      bold: true,
      color: "10b981",
    });
    slide16.addText([
      { text: "✓ Tarifa reducida para servicios esenciales\n" },
      { text: "✓ Hospitales públicos: 50% descuento\n" },
      { text: "✓ Escuelas: Acceso gratuito\n" },
      { text: "✓ ONGs: Tarifa especial\n" },
      { text: "✓ Fomenta adopción en sectores clave" },
    ], {
      x: 5.3,
      y: 4.8,
      w: 4.2,
      h: 2.0,
      fontSize: 14,
      color: "334155",
      lineSpacing: 20,
    });

    // Slide 17: Ventajas Competitivas
    const slide17 = pptx.addSlide();
    slide17.background = { color: "FFFFFF" };
    slide17.addText("Ventajas Competitivas para Monetización", {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.6,
      fontSize: 28,
      bold: true,
      color: "1e293b",
    });
    slide17.addText([
      { text: "1. ", options: { bold: true, color: "3b82f6" } },
      { text: "Monopolio Natural: ", options: { bold: true } },
      { text: "Sistema respaldado por el gobierno, único proveedor oficial de direcciones digitales\n\n" },
      { text: "2. ", options: { bold: true, color: "3b82f6" } },
      { text: "Efecto de Red: ", options: { bold: true } },
      { text: "Valor crece exponencialmente con cada nueva dirección registrada\n\n" },
      { text: "3. ", options: { bold: true, color: "3b82f6" } },
      { text: "Datos Únicos: ", options: { bold: true } },
      { text: "Base de datos nacional de direcciones verificadas, imposible de replicar\n\n" },
      { text: "4. ", options: { bold: true, color: "3b82f6" } },
      { text: "Integración Profunda: ", options: { bold: true } },
      { text: "APIs conectan con sistemas críticos (emergencias, logística, servicios)\n\n" },
      { text: "5. ", options: { bold: true, color: "3b82f6" } },
      { text: "Barrera de Entrada: ", options: { bold: true } },
      { text: "Alto costo de crear sistema alternativo + respaldo legal del gobierno\n\n" },
      { text: "6. ", options: { bold: true, color: "3b82f6" } },
      { text: "Solución Completa: ", options: { bold: true } },
      { text: "No solo direcciones, sino ecosistema completo con QR, mapas, offline, emergencias" },
    ], {
      x: 0.8,
      y: 1.3,
      w: 8.5,
      h: 5.5,
      fontSize: 15,
      color: "334155",
      lineSpacing: 22,
    });

    // Slide 18: Riesgos y Mitigación
    const slide18 = pptx.addSlide();
    slide18.background = { color: "FFFFFF" };
    slide18.addText("Riesgos y Estrategias de Mitigación", {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.6,
      fontSize: 28,
      bold: true,
      color: "1e293b",
    });
    
    const risksTable = [
      [
        { text: "Riesgo", options: { bold: true, fill: { color: "e2e8f0" } } },
        { text: "Probabilidad", options: { bold: true, fill: { color: "e2e8f0" } } },
        { text: "Mitigación", options: { bold: true, fill: { color: "e2e8f0" } } }
      ],
      [
        { text: "Adopción lenta de empresas" },
        { text: "Media", options: { fill: { color: "fef3c7" } } },
        { text: "Incentivos fiscales, demostraciones ROI, casos de éxito" }
      ],
      [
        { text: "Resistencia ciudadana a mandato" },
        { text: "Baja", options: { fill: { color: "d1fae5" } } },
        { text: "Comunicación clara, período de gracia, beneficios tangibles" }
      ],
      [
        { text: "Problemas técnicos de conectividad" },
        { text: "Alta", options: { fill: { color: "fee2e2" } } },
        { text: "Sistema offline robusto, infraestructura híbrida" }
      ],
      [
        { text: "Competencia de soluciones alternativas" },
        { text: "Baja", options: { fill: { color: "d1fae5" } } },
        { text: "Marco legal, respaldo gubernamental, integración profunda" }
      ],
      [
        { text: "Falta de recursos gubernamentales" },
        { text: "Media", options: { fill: { color: "fef3c7" } } },
        { text: "Modelo autofinanciado, ingresos de sector privado" }
      ],
    ];
    
    slide18.addTable(risksTable, {
      x: 0.5,
      y: 1.5,
      w: 9,
      h: 4.0,
      fontSize: 12,
      color: "334155",
      fill: { color: "f8fafc" },
      border: { pt: 1, color: "cbd5e1" },
      rowH: 0.8,
      colW: [3.5, 2.0, 3.5],
      valign: "middle",
    });
    
    slide18.addText("Plan de Contingencia: Fondo de reserva del 15% de ingresos anuales", {
      x: 0.5,
      y: 5.8,
      w: 9,
      h: 0.5,
      fontSize: 16,
      bold: true,
      color: "FFFFFF",
      align: "center",
      fill: { color: "f59e0b" },
    });

    // Slide 19: Roadmap de Implementación
    const slide19 = pptx.addSlide();
    slide19.background = { color: "FFFFFF" };
    slide19.addText("Roadmap de Implementación y Monetización", {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.6,
      fontSize: 28,
      bold: true,
      color: "1e293b",
    });
    slide19.addText([
      { text: "Q1-Q2 (Meses 1-6): ", options: { bold: true, color: "3b82f6" } },
      { text: "Fase Legal y Piloto\n" },
      { text: "  • Decreto presidencial y marco legal\n" },
      { text: "  • Piloto en Malabo (10,000 direcciones)\n" },
      { text: "  • Primeros clientes: Correos, SEGESA, hospitales públicos\n" },
      { text: "  • Ingresos: $20,000/mes\n\n" },
      
      { text: "Q3-Q4 (Meses 7-12): ", options: { bold: true, color: "3b82f6" } },
      { text: "Expansión Nacional\n" },
      { text: "  • Despliegue en Bata y ciudades principales\n" },
      { text: "  • Integración con bancos y telecomunicaciones\n" },
      { text: "  • Onboarding de empresas de delivery y e-commerce\n" },
      { text: "  • Ingresos: $60,000/mes\n\n" },
      
      { text: "Año 2 (Meses 13-24): ", options: { bold: true, color: "3b82f6" } },
      { text: "Cobertura Completa y Optimización\n" },
      { text: "  • 80% del territorio cubierto\n" },
      { text: "  • Expansión a sectores secundarios (seguros, inmobiliario)\n" },
      { text: "  • Optimización de APIs y servicios premium\n" },
      { text: "  • Ingresos: $100,000-150,000/mes\n\n" },
      
      { text: "Año 3+: ", options: { bold: true, color: "10b981" } },
      { text: "Escala y Expansión Regional\n" },
      { text: "  • Cobertura nacional 100%\n" },
      { text: "  • Exploración de mercados CEMAC\n" },
      { text: "  • Nuevos productos (analytics avanzados, IA predictiva)\n" },
      { text: "  • Ingresos: $150,000-200,000/mes" },
    ], {
      x: 0.6,
      y: 1.3,
      w: 8.8,
      h: 5.5,
      fontSize: 13,
      color: "334155",
      lineSpacing: 18,
    });

    // Slide 20: Conclusión
    const slide20 = pptx.addSlide();
    slide20.background = { color: "1e293b" };
    slide20.addText("Conclusión", {
      x: 0.5,
      y: 1.5,
      w: 9,
      h: 0.6,
      fontSize: 36,
      bold: true,
      color: "FFFFFF",
      align: "center",
    });
    slide20.addText([
      { text: "✓ Implementación obligatoria factible en 18 meses con enfoque justo\n\n" },
      { text: "✓ Soluciones robustas para conectividad limitada garantizan cobertura total\n\n" },
      { text: "✓ Modelo de monetización sostenible: $1.3M - $2.2M anuales\n\n" },
      { text: "✓ Ciudadanos siempre gratis, empresas pagan por valor agregado\n\n" },
      { text: "✓ ROI positivo en 24-36 meses con beneficios económicos y sociales masivos\n\n" },
      { text: "✓ Sistema escalable con potencial de expansión regional" },
    ], {
      x: 0.8,
      y: 2.5,
      w: 8.4,
      h: 3.5,
      fontSize: 16,
      color: "FFFFFF",
      lineSpacing: 28,
    });
    slide20.addText("Sistema de Direcciones Digitales de Guinea Ecuatorial", {
      x: 0.5,
      y: 6.3,
      w: 9,
      h: 0.5,
      fontSize: 20,
      bold: true,
      color: "94a3b8",
      align: "center",
    });

    // Save the presentation
    await pptx.writeFile({ fileName: "Estrategia_Implementacion_Monetizacion_GE.pptx" });
  };

  return (
    <Button onClick={generatePowerPoint} className="gap-2">
      <FileDown className="h-4 w-4" />
      Descargar Presentación: Implementación y Monetización (Español)
    </Button>
  );
};
