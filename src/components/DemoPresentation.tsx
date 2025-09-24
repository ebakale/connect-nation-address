import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Shield, 
  MapPin, 
  FileCheck, 
  AlertTriangle, 
  Search,
  Smartphone,
  Monitor,
  Calendar,
  BarChart3,
  CheckCircle,
  Clock,
  UserCheck,
  Navigation,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import PptxGenJS from 'pptxgenjs';
import demoImage from '@/assets/demo-presentation-image.png';

interface DemoScenario {
  id: string;
  title: string;
  actor: string;
  description: string;
  features: string[];
  workflow: string[];
  benefits: string[];
  icon: React.ReactNode;
  color: string;
}

const demoScenarios: DemoScenario[] = [
  {
    id: 'citizen',
    title: 'Portal Ciudadano',
    actor: 'Ciudadanos',
    description: 'Portal integral para búsqueda pública, gestión de direcciones personales y reporte de emergencias',
    features: [
      'Acceso al portal público para búsqueda de direcciones',
      'Búsqueda de direcciones por texto o UAC',
      'Sistema de solicitudes de nuevas direcciones',
      'Gestión de mis direcciones personales',
      'Seguimiento de solicitudes en tiempo real',
      'Verificación de residencia con documentos',
      'Reporte de incidentes y emergencias',
      'Notificaciones de emergencia en tiempo real',
      'Visualización en mapas interactivos',
      'Acceso móvil optimizado'
    ],
    workflow: [
      'Acceso al portal público para búsqueda de direcciones',
      'Búsqueda de direcciones verificadas por texto o UAC',
      'Visualización de resultados en mapa interactivo',
      'Acceso autenticado al portal ciudadano personal',
      'Navegación a "Solicitudes de Direcciones"',
      'Revisión de solicitudes en "Ver Solicitudes"',
      'Creación de nueva solicitud en "Nueva Solicitud"',
      'Acceso a la pestaña "Emergencias" para reportar incidentes',
      'Envío de alerta con ubicación automática',
      'Seguimiento del estado de solicitudes y reportes'
    ],
    benefits: [
      'Acceso público a información de direcciones verificadas',
      'Portal personal completo para gestión de direcciones',
      'Sistema integrado de emergencias y alertas',
      'Seguimiento transparente de todos los procesos',
      'Verificación documental integrada',
      'Respuesta rápida a emergencias con geolocalización',
      'Acceso 24/7 desde cualquier dispositivo',
      'Historial completo de solicitudes y reportes'
    ],
    icon: <Users className="h-6 w-6" />,
    color: 'bg-blue-500'
  },
  {
    id: 'police',
    title: 'Dashboard Policial',
    actor: 'Personal Policial (Operadores, Despachadores, Supervisores)',
    description: 'Sistema integral de gestión operativa policial con múltiples roles y funcionalidades especializadas según el rango',
    features: [
      'Mapa en tiempo real de incidentes activos por ciudad',
      'Sistema de comunicaciones entre unidades policiales',
      'Gestión de estado de oficiales y unidades operativas',
      'Panel de despacho y asignación de recursos',
      'Seguimiento de tiempos de respuesta',
      'Sistema de respaldo (backup) entre unidades',
      'Analíticas avanzadas y reportes de rendimiento',
      'Gestión administrativa de usuarios y unidades (Admin)',
      'Dashboard de liderazgo para supervisores',
      'Panel de coordinación para áreas geográficas',
      'Estado operativo y sesiones de operadores',
      'Notificaciones y alertas en tiempo real'
    ],
    workflow: [
      'Autenticación con credenciales policiales',
      'Inicialización automática de sesión operativa',
      'Visualización del dashboard según rol (Operador/Despachador/Supervisor/Admin)',
      'Monitoreo del mapa de incidentes activos por ciudad asignada',
      'Asignación automática o manual de incidentes a unidades',
      'Comunicación bidireccional con unidades en campo',
      'Solicitud y gestión de respaldo entre unidades',
      'Actualización de estado de incidentes en tiempo real',
      'Análisis de rendimiento y generación de reportes',
      'Administración de personal y configuración del sistema'
    ],
    benefits: [
      'Coordinación eficiente entre roles policiales',
      'Respuesta más rápida a emergencias',
      'Mejor asignación de recursos según ubicación',
      'Comunicación mejorada entre unidades',
      'Seguimiento completo de operaciones',
      'Análisis de rendimiento para mejora continua',
      'Gestión centralizada de personal y equipos',
      'Optimización de recursos policiales',
      'Transparencia operativa y trazabilidad'
    ],
    icon: <Shield className="h-6 w-6" />,
    color: 'bg-red-500'
  },
  {
    id: 'registrar',
    title: 'Consola de Registro',
    actor: 'Registradores Territoriales',
    description: 'Sistema integral de gestión y publicación del registro nacional de direcciones con control de calidad territorial',
    features: [
      'Dashboard con estadísticas clave del registro territorial',
      'Cola de publicación de direcciones verificadas',
      'Cola de despublicación de direcciones publicadas',
      'Gestión territorial por provincias y municipios asignados',
      'Analíticas de cobertura geográfica del territorio',
      'Control de calidad y detección de duplicados',
      'Reportes de rendimiento del sistema por región',
      'Seguimiento de métricas de publicación diaria',
      'Gestión de alcance geográfico por registrador',
      'Herramientas de verificación geoespacial',
      'Panel de aprobación/rechazo con justificación',
      'Monitoreo de cobertura territorial asignada'
    ],
    workflow: [
      'Autenticación como registrador territorial',
      'Visualización del dashboard con métricas de registro',
      'Revisión de direcciones listas para publicar en su territorio',
      'Validación con herramientas geoespaciales avanzadas',
      'Publicación masiva de direcciones verificadas',
      'Gestión de direcciones ya publicadas (despublicación)',
      'Administración de estructura provincial y municipal',
      'Análisis de cobertura geográfica del registro',
      'Generación de reportes de calidad de datos',
      'Supervisión de métricas de rendimiento diario'
    ],
    benefits: [
      'Control de calidad garantizado en el registro nacional',
      'Gestión eficiente de la cobertura territorial',
      'Publicación coordinada de direcciones verificadas',
      'Supervisión completa del registro por provincias',
      'Métricas claras de rendimiento del sistema',
      'Trazabilidad completa del proceso de registro',
      'Optimización de recursos por área geográfica',
      'Mantenimiento de la integridad del registro nacional'
    ],
    icon: <FileCheck className="h-6 w-6" />,
    color: 'bg-green-500'
  },
  {
    id: 'field-agent',
    title: 'App de Campo',
    actor: 'Agentes de Campo',
    description: 'Aplicación móvil robusta con capacidades offline para captura y verificación in-situ de direcciones',
    features: [
      'Captura GPS automática de alta precisión',
      'Fotografía georreferenciada con metadatos',
      'Trabajo offline completo con sincronización inteligente',
      'Escáner QR para verificación instantánea',
      'Mapa de campo interactivo con direcciones cercanas',
      'Captura de direcciones offline con almacenamiento local',
      'Mejoras UX móvil con indicadores de red y batería',
      'Sistema de caché inteligente para mapas offline',
      'Geolocalización mejorada con seguimiento de precisión',
      'Captura de cámara nativa con permisos automáticos',
      'Generación de códigos QR para direcciones nuevas',
      'Indicador de estado offline con progreso de sincronización',
      'Optimización para dispositivos móviles y tablets',
      'Validación automática de calidad de fotos',
      'Sistema de respaldo de datos locales'
    ],
    workflow: [
      'Autenticación en dispositivo móvil',
      'Activación de modo campo con permisos de ubicación',
      'Navegación al área de trabajo asignada',
      'Uso del mapa de campo para ubicar direcciones objetivo',
      'Captura automática de coordenadas GPS de alta precisión',
      'Toma de fotografías georreferenciadas con cámara nativa',
      'Escaneo de códigos QR para verificación de direcciones existentes',
      'Captura offline cuando no hay conectividad',
      'Almacenamiento local seguro con encriptación',
      'Sincronización automática al recuperar conectividad',
      'Validación de calidad de datos antes del envío',
      'Confirmación de sincronización exitosa'
    ],
    benefits: [
      'Trabajo continuo independiente de conectividad',
      'Datos precisos capturados directamente desde el terreno',
      'Verificación fotográfica con geolocalización exacta',
      'Eficiencia operativa maximizada en campo',
      'Reducción de errores por validación automática',
      'Integración perfecta con el sistema central',
      'Optimización de recursos de campo',
      'Trazabilidad completa de actividades de campo',
      'Flexibilidad para trabajar en áreas remotas',
      'Experiencia de usuario optimizada para móviles'
    ],
    icon: <Navigation className="h-6 w-6" />,
    color: 'bg-orange-500'
  },
  {
    id: 'emergency',
    title: 'Central de Emergencias',
    actor: 'Operadores de Emergencia (Operadores, Despachadores, Supervisores)',
    description: 'Sistema integral de gestión, despacho y coordinación de servicios de emergencia con múltiples roles operativos',
    features: [
      'Recepción automática de alertas ciudadanas',
      'Procesador de alertas de emergencia con geolocalización',
      'Sistema de despacho inteligente de recursos',
      'Comunicaciones avanzadas entre despachadores y unidades',
      'Panel de estado de operadores en tiempo real',
      'Sistema de difusión de alertas masivas',
      'Gestión detallada de incidentes con logs completos',
      'Seguimiento de tiempos de respuesta y métricas',
      'Contactos de emergencia con alertas automáticas',
      'Diálogo de despacho de emergencias manuales',
      'Sistema de notificaciones a reporteros',
      'Solicitud y gestión de respaldo entre unidades',
      'Dashboard administrativo policial con analíticas',
      'Actualización de estado de incidentes en tiempo real',
      'Envío de mensajes directos a unidades específicas',
      'Coordenadas encriptadas para seguridad de datos',
      'Múltiples roles: Operador, Despachador, Supervisor'
    ],
    workflow: [
      'Recepción automática de alerta ciudadana',
      'Procesamiento de alerta con validación de ubicación GPS',
      'Clasificación automática del tipo de emergencia',
      'Asignación inteligente de recursos según disponibilidad',
      'Notificación automática a la unidad más cercana',
      'Comunicación bidireccional con unidades en campo',
      'Monitoreo en tiempo real del progreso del incidente',
      'Actualización continua de estado por parte de unidades',
      'Seguimiento de tiempos de respuesta y resolución',
      'Cierre del incidente con documentación completa',
      'Análisis de métricas de rendimiento operativo',
      'Generación de reportes para supervisión administrativa'
    ],
    benefits: [
      'Reducción drástica en tiempos de respuesta de emergencia',
      'Optimización de asignación de recursos policiales',
      'Comunicación mejorada y coordinada entre todas las unidades',
      'Registro completo y trazabilidad de todas las operaciones',
      'Análisis detallado de rendimiento para mejora continua',
      'Seguridad de datos sensibles con encriptación avanzada',
      'Gestión eficiente de múltiples emergencias simultáneas',
      'Transparencia operativa con supervisión administrativa',
      'Coordinación efectiva entre diferentes roles operativos',
      'Respuesta rápida y coordinada ante emergencias masivas'
    ],
    icon: <AlertTriangle className="h-6 w-6" />,
    color: 'bg-purple-500'
  },
  {
    id: 'verifier',
    title: 'Dashboard de Verificación',
    actor: 'Verificadores de Direcciones',
    description: 'Sistema especializado para verificación y validación de solicitudes de direcciones con herramientas avanzadas',
    features: [
      'Cola de revisión de solicitudes pendientes',
      'Herramientas de verificación geográfica avanzadas',
      'Panel de aprobación/rechazo con justificación detallada',
      'Sistema de detección automática de duplicados',
      'Validación cruzada con bases de datos existentes',
      'Herramientas de análisis de calidad de fotografías',
      'Sistema de verificación por lotes',
      'Reportes de calidad de datos y métricas',
      'Integración con mapas satelitales para validación',
      'Historial completo de decisiones de verificación'
    ],
    workflow: [
      'Acceso al panel de verificación especializado',
      'Revisión de cola de solicitudes pendientes',
      'Análisis detallado de cada solicitud con herramientas',
      'Verificación geoespacial usando mapas y coordenadas',
      'Validación de fotografías y documentos adjuntos',
      'Detección de posibles duplicados en el sistema',
      'Decisión de aprobación o rechazo con justificación',
      'Documentación del proceso de verificación',
      'Envío de notificación al solicitante',
      'Actualización de métricas de calidad'
    ],
    benefits: [
      'Control de calidad garantizado en verificaciones',
      'Proceso de verificación estandarizado y trazable',
      'Reducción significativa de errores y duplicados',
      'Eficiencia en el procesamiento de solicitudes',
      'Documentación completa de decisiones',
      'Mejora continua del proceso de verificación'
    ],
    icon: <UserCheck className="h-6 w-6" />,
    color: 'bg-teal-500'
  }
];

export const DemoPresentation: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<string>('citizen');
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [showRoles, setShowRoles] = useState(false);

  const currentScenario = demoScenarios.find(s => s.id === selectedScenario);

  const nextStep = () => {
    if (currentScenario && currentStep < currentScenario.workflow.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetDemo = () => {
    setCurrentStep(0);
  };

  const exportToPowerPoint = async () => {
    try {
      const pptx = new PptxGenJS();
      
      // Slide de título
      const titleSlide = pptx.addSlide();
      titleSlide.addText("ConnectNation Address - Presentación Demo", {
        x: 1,
        y: 1,
        w: 8,
        h: 1,
        fontSize: 32,
        bold: true,
        align: 'center'
      });
      titleSlide.addText("Demostraciones adaptadas a las necesidades específicas de cada actor del sistema", {
        x: 1,
        y: 2.5,
        w: 8,
        h: 0.5,
        fontSize: 18,
        align: 'center'
      });

      // Slide para cada escenario
      demoScenarios.forEach((scenario, index) => {
        // Slide principal del escenario
        const scenarioSlide = pptx.addSlide();
        scenarioSlide.addText(scenario.title, {
          x: 0.5,
          y: 0.5,
          w: 9,
          h: 0.8,
          fontSize: 28,
          bold: true,
          color: scenario.color.replace('bg-', '').replace('-500', '')
        });
        
        scenarioSlide.addText(`Actor: ${scenario.actor}`, {
          x: 0.5,
          y: 1.3,
          w: 9,
          h: 0.5,
          fontSize: 16,
          italic: true
        });

        scenarioSlide.addText(scenario.description, {
          x: 0.5,
          y: 2,
          w: 9,
          h: 0.8,
          fontSize: 14
        });

        // Características
        scenarioSlide.addText("Características Principales:", {
          x: 0.5,
          y: 3,
          w: 4,
          h: 0.4,
          fontSize: 16,
          bold: true
        });

        scenario.features.forEach((feature, idx) => {
          scenarioSlide.addText(`• ${feature}`, {
            x: 0.5,
            y: 3.5 + (idx * 0.3),
            w: 4,
            h: 0.3,
            fontSize: 12
          });
        });

        // Beneficios
        scenarioSlide.addText("Beneficios:", {
          x: 5,
          y: 3,
          w: 4,
          h: 0.4,
          fontSize: 16,
          bold: true
        });

        scenario.benefits.forEach((benefit, idx) => {
          scenarioSlide.addText(`• ${benefit}`, {
            x: 5,
            y: 3.5 + (idx * 0.3),
            w: 4,
            h: 0.3,
            fontSize: 12
          });
        });

        // Slide de workflow
        const workflowSlide = pptx.addSlide();
        workflowSlide.addText(`${scenario.title} - Flujo de Trabajo`, {
          x: 0.5,
          y: 0.5,
          w: 9,
          h: 0.8,
          fontSize: 24,
          bold: true
        });

        scenario.workflow.forEach((step, idx) => {
          workflowSlide.addText(`${idx + 1}. ${step}`, {
            x: 0.5,
            y: 1.5 + (idx * 0.6),
            w: 9,
            h: 0.5,
            fontSize: 14,
            bullet: true
          });
        });
      });

      // Slide de especificaciones técnicas
      const techSlide = pptx.addSlide();
      techSlide.addText("Especificaciones Técnicas", {
        x: 1,
        y: 0.5,
        w: 8,
        h: 0.8,
        fontSize: 24,
        bold: true,
        align: 'center'
      });

      techSlide.addText("Dispositivos Compatibles:", {
        x: 0.5,
        y: 1.5,
        w: 4,
        h: 0.4,
        fontSize: 16,
        bold: true
      });

      techSlide.addText("• Móviles iOS/Android\n• Navegadores de escritorio\n• Dispositivos de campo", {
        x: 0.5,
        y: 2,
        w: 4,
        h: 1,
        fontSize: 12
      });

      techSlide.addText("Métricas Clave:", {
        x: 5,
        y: 1.5,
        w: 4,
        h: 0.4,
        fontSize: 16,
        bold: true
      });

      techSlide.addText("• 99.9% Precisión GPS\n• <30s Tiempo de Respuesta\n• 24/7 Disponibilidad\n• 100% Trabajo Offline", {
        x: 5,
        y: 2,
        w: 4,
        h: 1,
        fontSize: 12
      });

      await pptx.writeFile({ fileName: "ConnectNation_Address_Demo.pptx" });
      toast.success("Presentación exportada exitosamente como PowerPoint");
    } catch (error) {
      console.error("Error al exportar PowerPoint:", error);
      toast.error("Error al exportar la presentación");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-foreground">
                ConnectNation Address - Presentación Demo
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Demostraciones adaptadas a las necesidades específicas de cada actor del sistema
              </p>
            </div>
            <Button 
              onClick={exportToPowerPoint}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Exportar a PowerPoint</span>
            </Button>
          </div>
          <div className="flex justify-center">
            <img 
              src={demoImage} 
              alt="Demo adaptada a necesidades específicas"
              className="max-w-md rounded-lg shadow-lg"
            />
          </div>
        </div>

        {/* Scenario Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {demoScenarios.map((scenario) => (
            <Card 
              key={scenario.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedScenario === scenario.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => {
                setSelectedScenario(scenario.id);
                setCurrentStep(0);
              }}
            >
              <CardHeader className="pb-2">
                <div className={`w-12 h-12 rounded-lg ${scenario.color} flex items-center justify-center text-white mb-2`}>
                  {scenario.icon}
                </div>
                <CardTitle className="text-sm">{scenario.title}</CardTitle>
                <CardDescription className="text-xs">{scenario.actor}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Demo Content */}
        {currentScenario && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Scenario Info */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg ${currentScenario.color} flex items-center justify-center text-white`}>
                      {currentScenario.icon}
                    </div>
                    <div>
                      <CardTitle>{currentScenario.title}</CardTitle>
                      <CardDescription>{currentScenario.actor}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {currentScenario.description}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Características Principales</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {currentScenario.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Beneficios</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {currentScenario.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <BarChart3 className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Demo Workflow */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Flujo de Trabajo Demo</CardTitle>
                    <Badge variant="outline">
                      Paso {currentStep + 1} de {currentScenario.workflow.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Progress Bar */}
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentStep + 1) / currentScenario.workflow.length) * 100}%` }}
                    />
                  </div>

                  {/* Current Step */}
                  <div className="bg-secondary/50 rounded-lg p-6 border-l-4 border-primary">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                        {currentStep + 1}
                      </div>
                      <h3 className="text-lg font-semibold">Paso Actual</h3>
                    </div>
                    <p className="text-foreground text-base">
                      {currentScenario.workflow[currentStep]}
                    </p>
                  </div>

                  {/* All Steps Overview */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-muted-foreground">Pasos del Demo:</h4>
                    {currentScenario.workflow.map((step, index) => (
                      <div 
                        key={index}
                        className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                          index === currentStep 
                            ? 'bg-primary/10 border border-primary/30' 
                            : index < currentStep 
                              ? 'bg-green-50 border border-green-200' 
                              : 'bg-muted/30'
                        }`}
                      >
                        <div className={`rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold ${
                          index === currentStep 
                            ? 'bg-primary text-primary-foreground' 
                            : index < currentStep 
                              ? 'bg-green-500 text-white' 
                              : 'bg-muted text-muted-foreground'
                        }`}>
                          {index < currentStep ? '✓' : index + 1}
                        </div>
                        <span className={`text-sm ${
                          index === currentStep ? 'font-medium text-foreground' : 'text-muted-foreground'
                        }`}>
                          {step}
                        </span>
                        {index === currentStep && (
                          <Clock className="h-4 w-4 text-primary ml-auto" />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Demo Controls */}
                  <div className="flex justify-between items-center pt-4">
                    <Button 
                      variant="outline" 
                      onClick={prevStep}
                      disabled={currentStep === 0}
                    >
                      Anterior
                    </Button>

                    <Button 
                      variant="outline" 
                      onClick={resetDemo}
                    >
                      Reiniciar Demo
                    </Button>

                    <Button 
                      onClick={nextStep}
                      disabled={currentStep === currentScenario.workflow.length - 1}
                    >
                      {currentStep === currentScenario.workflow.length - 1 ? 'Completado' : 'Siguiente'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Roles de Usuarios y Acceso */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Roles de Usuarios y Acceso a Portales</CardTitle>
            <CardDescription>
              El sistema ConnectNation Address implementa un sistema de roles jerárquico que determina el acceso a diferentes portales y funcionalidades.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Roles Administrativos */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-primary">Roles Administrativos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-blue-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Administrador del Sistema (admin)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-muted-foreground">Acceso completo a todos los portales y funcionalidades administrativas</p>
                      <div>
                        <span className="text-xs font-medium text-blue-600">Portales:</span>
                        <p className="text-xs">Todos los portales, Panel de administración global</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-green-600">Permisos:</span>
                        <p className="text-xs">Gestión de usuarios, Configuración del sistema, Analíticas globales</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-blue-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Administrador NDAA (ndaa_admin)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-muted-foreground">Administrador de la Autoridad Nacional de Direcciones</p>
                      <div>
                        <span className="text-xs font-medium text-blue-600">Portales:</span>
                        <p className="text-xs">Dashboard administrativo, Consola de registro, Analíticas nacionales</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-green-600">Permisos:</span>
                        <p className="text-xs">Supervisión nacional, Gestión de registradores, Políticas nacionales</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Roles Policiales */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-red-600">Roles Policiales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-red-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Administrador Policial (police_admin)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-muted-foreground">Administración completa del sistema policial</p>
                      <div>
                        <span className="text-xs font-medium text-blue-600">Portales:</span>
                        <p className="text-xs">Dashboard policial completo, Central de emergencias, Administración de unidades</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-red-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Supervisor Policial (police_supervisor)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-muted-foreground">Supervisión de operaciones policiales</p>
                      <div>
                        <span className="text-xs font-medium text-blue-600">Portales:</span>
                        <p className="text-xs">Dashboard policial, Central de emergencias, Dashboard de liderazgo</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-red-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Despachador Policial (police_dispatcher)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-muted-foreground">Despacho y coordinación de unidades</p>
                      <div>
                        <span className="text-xs font-medium text-blue-600">Portales:</span>
                        <p className="text-xs">Central de emergencias, Sistema de comunicaciones</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-red-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Operador Policial (police_operator)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-muted-foreground">Operaciones básicas policiales</p>
                      <div>
                        <span className="text-xs font-medium text-blue-600">Portales:</span>
                        <p className="text-xs">Dashboard policial básico, Recepción de incidentes</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Roles de Registro */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-green-600">Roles de Registro</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-green-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Registrador (registrar)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-muted-foreground">Gestión del registro por territorio</p>
                      <div>
                        <span className="text-xs font-medium text-blue-600">Portal:</span>
                        <p className="text-xs">Consola de registro</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-green-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Verificador (verifier)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-muted-foreground">Verificación de solicitudes</p>
                      <div>
                        <span className="text-xs font-medium text-blue-600">Portal:</span>
                        <p className="text-xs">Dashboard de verificación</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-green-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Agente de Campo (field_agent)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-muted-foreground">Captura de datos en terreno</p>
                      <div>
                        <span className="text-xs font-medium text-blue-600">Portal:</span>
                        <p className="text-xs">App de campo móvil</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Roles Ciudadanos */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-blue-600">Roles Ciudadanos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-blue-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Ciudadano (citizen)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-muted-foreground">Usuario general del sistema</p>
                      <div>
                        <span className="text-xs font-medium text-blue-600">Portales:</span>
                        <p className="text-xs">Portal ciudadano, Portal público</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-green-600">Permisos:</span>
                        <p className="text-xs">Búsqueda de direcciones, Solicitudes personales, Reporte de emergencias</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-blue-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Reclamante de Propiedad (property_claimant)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-muted-foreground">Ciudadano con derechos sobre propiedades</p>
                      <div>
                        <span className="text-xs font-medium text-blue-600">Portal:</span>
                        <p className="text-xs">Portal ciudadano avanzado</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-green-600">Permisos:</span>
                        <p className="text-xs">Gestión de propiedades, Verificación de residencia</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Specifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Especificaciones Técnicas del Demo</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="devices" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="devices">Dispositivos</TabsTrigger>
                <TabsTrigger value="features">Funcionalidades</TabsTrigger>
                <TabsTrigger value="integration">Integración</TabsTrigger>
                <TabsTrigger value="metrics">Métricas</TabsTrigger>
              </TabsList>
              
              <TabsContent value="devices" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3 p-4 border rounded-lg">
                    <Smartphone className="h-8 w-8 text-blue-500" />
                    <div>
                      <h4 className="font-semibold">Móviles</h4>
                      <p className="text-sm text-muted-foreground">iOS/Android optimizado</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border rounded-lg">
                    <Monitor className="h-8 w-8 text-green-500" />
                    <div>
                      <h4 className="font-semibold">Escritorio</h4>
                      <p className="text-sm text-muted-foreground">Navegadores modernos</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border rounded-lg">
                    <Navigation className="h-8 w-8 text-orange-500" />
                    <div>
                      <h4 className="font-semibold">Campo</h4>
                      <p className="text-sm text-muted-foreground">Trabajo offline</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="features" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Badge variant="secondary" className="p-3 justify-center">Geolocalización GPS</Badge>
                  <Badge variant="secondary" className="p-3 justify-center">Mapas Interactivos</Badge>
                  <Badge variant="secondary" className="p-3 justify-center">Códigos QR/UAC</Badge>
                  <Badge variant="secondary" className="p-3 justify-center">Comunicaciones</Badge>
                  <Badge variant="secondary" className="p-3 justify-center">Analíticas</Badge>
                  <Badge variant="secondary" className="p-3 justify-center">Reportes</Badge>
                  <Badge variant="secondary" className="p-3 justify-center">Trabajo Offline</Badge>
                  <Badge variant="secondary" className="p-3 justify-center">Sincronización</Badge>
                </div>
              </TabsContent>
              
              <TabsContent value="integration" className="space-y-4">
                <p className="text-muted-foreground">
                  El sistema se integra con servicios existentes de gobierno, sistemas de emergencia, 
                  y plataformas de mapas para proporcionar una solución completa de gestión de direcciones.
                </p>
              </TabsContent>
              
              <TabsContent value="metrics" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary">99.9%</div>
                    <div className="text-sm text-muted-foreground">Precisión GPS</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary">&lt;30s</div>
                    <div className="text-sm text-muted-foreground">Tiempo Respuesta</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary">24/7</div>
                    <div className="text-sm text-muted-foreground">Disponibilidad</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary">100%</div>
                    <div className="text-sm text-muted-foreground">Trabajo Offline</div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};