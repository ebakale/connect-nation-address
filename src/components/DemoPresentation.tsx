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
    actor: 'Ciudadano',
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
    actor: 'Oficiales de Policía',
    description: 'Sistema integral de gestión operativa policial con múltiples roles y funcionalidades especializadas',
    features: [
      'Mapa en tiempo real de incidentes activos',
      'Sistema de comunicaciones entre unidades',
      'Gestión de estado de oficiales y unidades',
      'Panel de despacho y asignación de recursos',
      'Seguimiento de tiempos de respuesta',
      'Sistema de respaldo (backup) entre unidades',
      'Analíticas avanzadas y reportes de rendimiento',
      'Gestión administrativa de usuarios y unidades',
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
    actor: 'Registradores',
    description: 'Herramientas para validación y gestión del registro de direcciones',
    features: [
      'Cola de revisión de solicitudes',
      'Herramientas de verificación geográfica',
      'Panel de aprobación/rechazo',
      'Gestión de duplicados',
      'Reportes de calidad de datos'
    ],
    workflow: [
      'Acceso al panel de administración',
      'Revisión de solicitudes pendientes',
      'Verificación con herramientas geoespaciales',
      'Aprobación o rechazo con justificación',
      'Publicación de direcciones verificadas'
    ],
    benefits: [
      'Control de calidad garantizado',
      'Proceso de verificación estandarizado',
      'Trazabilidad completa',
      'Reducción de errores'
    ],
    icon: <FileCheck className="h-6 w-6" />,
    color: 'bg-green-500'
  },
  {
    id: 'field-agent',
    title: 'App de Campo',
    actor: 'Agentes de Campo',
    description: 'Aplicación móvil para captura y verificación in-situ',
    features: [
      'Captura GPS automática',
      'Fotografía georreferenciada',
      'Trabajo offline',
      'Sincronización automática',
      'Escáner QR para verificación'
    ],
    workflow: [
      'Activación de modo campo en dispositivo móvil',
      'Navegación a ubicación objetivo',
      'Captura automática de coordenadas GPS',
      'Fotografía del lugar con metadatos',
      'Sincronización cuando hay conectividad'
    ],
    benefits: [
      'Datos precisos desde el terreno',
      'Trabajo sin dependencia de conectividad',
      'Verificación fotográfica',
      'Mayor eficiencia operativa'
    ],
    icon: <Navigation className="h-6 w-6" />,
    color: 'bg-orange-500'
  },
  {
    id: 'emergency',
    title: 'Central de Emergencias',
    actor: 'Operadores de Emergencia',
    description: 'Sistema de gestión y despacho de servicios de emergencia',
    features: [
      'Recepción automática de alertas',
      'Geolocalización precisa de incidentes',
      'Asignación inteligente de recursos',
      'Comunicación con unidades en campo',
      'Monitoreo en tiempo real'
    ],
    workflow: [
      'Recepción de alerta ciudadana',
      'Validación automática de ubicación',
      'Clasificación del tipo de emergencia',
      'Asignación de unidad más cercana',
      'Seguimiento hasta resolución'
    ],
    benefits: [
      'Reducción significativa en tiempos de respuesta',
      'Mejor asignación de recursos',
      'Comunicación mejorada',
      'Registro completo de operaciones'
    ],
    icon: <AlertTriangle className="h-6 w-6" />,
    color: 'bg-purple-500'
  }
];

export const DemoPresentation: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<string>('citizen');
  const [currentStep, setCurrentStep] = useState<number>(0);

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