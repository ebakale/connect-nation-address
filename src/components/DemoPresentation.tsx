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
  Download,
  Radio,
  Camera,
  Bell,
  FileText,
  Volume2
} from 'lucide-react';
import { toast } from 'sonner';
import PptxGenJS from 'pptxgenjs';
import demoImage from '@/assets/demo-presentation-image.png';
import { GovernmentMonetizationPPT } from '@/components/GovernmentMonetizationPPT';
import { PresidentialDecreePDF } from '@/components/PresidentialDecreePDF';
import { BiakamGovernmentContractPDF } from '@/components/BiakamGovernmentContractPDF';

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
    id: 'public-portal',
    title: 'Portal Público de Búsqueda',
    actor: 'Ciudadanos (Acceso Público)',
    description: 'Portal público para búsqueda y consulta de direcciones verificadas del registro nacional',
    features: [
      'Búsqueda pública de direcciones por texto o UAC',
      'Visualización de direcciones verificadas en mapa',
      'Acceso a información básica de direcciones públicas',
      'Navegación de resultados con filtros geográficos',
      'Descarga de información en formatos estándar',
      'Acceso desde cualquier dispositivo sin autenticación',
      'Interfaz optimizada para búsquedas rápidas',
      'Coordinadas aproximadas para direcciones privadas',
      'Información completa para direcciones con UAC exacto',
      'Directorio de negocios integrado (comerciales auto-publicadas)',
      'Mapas de respaldo con OpenStreetMap cuando Google Maps no disponible'
    ],
    workflow: [
      'Acceso directo al portal público sin autenticación',
      'Ingreso de criterio de búsqueda (texto libre o UAC)',
      'Visualización de resultados en lista y mapa',
      'Selección de dirección para ver detalles',
      'Navegación entre resultados con paginación',
      'Aplicación de filtros por región/ciudad',
      'Exportación de resultados en formato estándar'
    ],
    benefits: [
      'Acceso libre y transparente a información pública',
      'Búsqueda eficiente sin barreras de entrada',
      'Información confiable del registro oficial',
      'Interfaz intuitiva para usuarios no técnicos',
      'Disponibilidad 24/7 sin restricciones',
      'Auto-publicación de direcciones comerciales verificadas'
    ],
    icon: <Search className="h-6 w-6" />,
    color: 'bg-blue-500'
  },
  {
    id: 'police-integrated',
    title: 'Portal Policial Integrado',
    actor: 'Personal Policial (Operadores, Despachadores, Supervisores, Administradores)',
    description: 'Sistema unificado de gestión policial que integra operaciones, emergencias, comunicaciones en tiempo real, y administración según rol con características avanzadas de respaldo y evidencia',
    features: [
      'Recepción automática de alertas ciudadanas con geolocalización',
      'Mapa unificado de incidentes activos por jurisdicción',
      'Sistema de despacho inteligente con asignación automática',
      'Comunicaciones bidireccionales en hilos con notificaciones sonoras por prioridad',
      'Gestión de estado de oficiales y unidades en tiempo real',
      'Botón "OFFICER DOWN" para emergencias críticas con difusión inmediata a TODO el personal',
      'Sistema de respaldo escalonado: Supervisores aprueban, Despachadores coordinan',
      'Reconocimiento obligatorio de respaldo (recibido, en-route, on-scene, all-clear)',
      'Diálogo completo de solicitud de recursos (tipo, urgencia, cantidad, ubicación)',
      'Captura de evidencia fotográfica en escena con geolocalización GPS',
      'Navegación integrada a escenas de incidentes (iOS/Android/Web)',
      'Panel de Logs de Auditoría completo para transparencia operativa',
      'Configuración persistente del sistema con almacenamiento en base de datos',
      'Analíticas en tiempo real con rangos de fecha personalizables',
      'Encriptación de datos sensibles para seguridad operativa',
      'Sesiones operativas con control de turnos',
      'Difusión de alertas masivas para emergencias'
    ],
    workflow: [
      'Autenticación con credenciales policiales',
      'Inicialización de sesión operativa según rol',
      'Dashboard personalizado (Operador/Despachador/Supervisor/Admin)',
      'Recepción automática de alerta ciudadana con notificación sonora',
      'Procesamiento y clasificación de emergencia',
      'Asignación inteligente a unidad más cercana',
      'Comunicación en hilos con unidades en campo (Bandeja/Enviados/Historial)',
      'Monitoreo de progreso en tiempo real con GPS',
      'Solicitud de respaldo con aprobación escalonada (Supervisor aprueba)',
      'Activación de "OFFICER DOWN" para emergencias críticas',
      'Reconocimiento obligatorio de respaldo por despachadores y unidades',
      'Captura de evidencia fotográfica georreferenciada en escena',
      'Navegación integrada a ubicación del incidente',
      'Actualización de estado hasta resolución',
      'Cierre con documentación completa y evidencia',
      'Análisis post-incidente con logs de auditoría'
    ],
    benefits: [
      'Respuesta unificada y coordinada a emergencias',
      'Eliminación de duplicación entre sistemas',
      'Comunicación mejorada en hilos con alertas sonoras por prioridad',
      'Asignación optimizada de recursos según ubicación',
      'Trazabilidad completa de operaciones con auditoría',
      'Reducción significativa en tiempos de respuesta',
      'Gestión eficiente de múltiples incidentes simultáneos',
      'Transparencia operativa con supervisión jerárquica',
      'Captura de evidencia integrada para documentación legal',
      'Navegación directa a escenas desde cualquier dispositivo'
    ],
    icon: <Shield className="h-6 w-6" />,
    color: 'bg-red-500'
  },
  {
    id: 'nar-portal',
    title: 'Portal NAR Unificado',
    actor: 'Registradores y Verificadores NAR',
    description: 'Sistema consolidado del Registro Nacional que unifica verificación y publicación territorial con auto-publicación de direcciones comerciales',
    features: [
      'Cola integrada de solicitudes pendientes de verificación',
      'Herramientas avanzadas de verificación geoespacial',
      'Panel unificado de aprobación/rechazo con justificación',
      'Sistema automático de detección de duplicados',
      'Dashboard territorial con métricas por provincia/municipio',
      'Auto-publicación automática de direcciones comerciales verificadas',
      'Cola de despublicación para direcciones obsoletas',
      'Analíticas de cobertura geográfica del territorio',
      'Reportes de calidad de datos por región',
      'Validación cruzada con bases de datos existentes',
      'Herramientas de análisis de calidad fotográfica',
      'Sistema de verificación por lotes para eficiencia',
      'Gestión de alcance geográfico por registrador',
      'Monitoreo de métricas de rendimiento diario',
      'Flujo unificado para NAR, CAR y Business en un solo wizard'
    ],
    workflow: [
      'Autenticación según rol (Verificador/Registrador)',
      'Dashboard personalizado con métricas territoriales',
      'Revisión de solicitudes pendientes en cola',
      'Análisis detallado con herramientas geoespaciales',
      'Verificación de fotografías y coordenadas',
      'Detección automática de duplicados',
      'Decisión de aprobación/rechazo con documentación',
      'Auto-publicación automática según tipo de dirección',
      'Gestión de direcciones ya publicadas',
      'Análisis de cobertura y calidad territorial',
      'Generación de reportes de rendimiento'
    ],
    benefits: [
      'Flujo unificado de verificación a publicación',
      'Control de calidad garantizado en registro nacional',
      'Eliminación de pasos manuales para direcciones comerciales',
      'Gestión territorial eficiente y coordinada',
      'Proceso estandarizado con trazabilidad completa',
      'Optimización de recursos por área geográfica'
    ],
    icon: <FileCheck className="h-6 w-6" />,
    color: 'bg-green-500'
  },
  {
    id: 'field-agent',
    title: 'App de Campo Móvil',
    actor: 'Agentes de Campo',
    description: 'Aplicación móvil especializada para captura y verificación in-situ con capacidades offline y flujo de aprobación integrado',
    features: [
      'Captura GPS automática de alta precisión',
      'Fotografía georreferenciada con metadatos completos',
      'Trabajo offline completo con sincronización inteligente',
      'Escáner QR para verificación instantánea de direcciones',
      'Mapa de campo interactivo con direcciones cercanas',
      'Sistema de caché inteligente para mapas offline',
      'Geolocalización mejorada con seguimiento de precisión',
      'Generación de códigos QR para direcciones nuevas',
      'Validación automática de calidad de fotografías',
      'Sistema de respaldo local con encriptación',
      'Indicadores de estado de red y progreso de sincronización',
      'Optimización para dispositivos móviles y tablets',
      'Captura de cámara nativa con permisos automáticos',
      'Almacenamiento local seguro para trabajo remoto',
      'Envío a cola de aprobación NAR (no creación directa)',
      'Filtrado por alcance geográfico asignado'
    ],
    workflow: [
      'Autenticación en dispositivo móvil',
      'Activación de modo campo con permisos de ubicación',
      'Navegación al área de trabajo asignada (según scope)',
      'Uso del mapa offline para ubicar direcciones objetivo',
      'Captura automática de coordenadas GPS precisas',
      'Toma de fotografías georreferenciadas',
      'Escaneo QR para verificación de direcciones existentes',
      'Almacenamiento local cuando no hay conectividad',
      'Validación automática de calidad antes del envío',
      'Envío a cola de aprobación NAR para revisión',
      'Sincronización automática al recuperar conectividad',
      'Confirmación de envío exitoso al sistema central'
    ],
    benefits: [
      'Independencia total de conectividad para trabajo remoto',
      'Datos precisos capturados directamente desde terreno',
      'Verificación fotográfica con geolocalización exacta',
      'Reducción de errores por validación automática',
      'Flexibilidad operativa en áreas sin cobertura',
      'Integración seamless con sistema central',
      'Flujo de aprobación que mantiene control de calidad'
    ],
    icon: <Navigation className="h-6 w-6" />,
    color: 'bg-orange-500'
  },
  {
    id: 'car-portal',
    title: 'Portal CAR - Direcciones Personales',
    actor: 'Ciudadanos y Verificadores CAR',
    description: 'Sistema especializado para gestión de direcciones personales ciudadanas con verificación de residencia y verificadores con dominio configurable',
    features: [
      'Creación automática de registro personal al autenticarse',
      'Gestión de direcciones primarias y secundarias personales',
      'Declaración de tipo de ocupación (propietario/inquilino/familia)',
      'Control de vigencia temporal con fechas efectivas',
      'Verificación automática con direcciones NAR existentes',
      'Sistema de verificación de residencia con documentos legales',
      'Verificador unificado con dominio configurable (NAR/CAR/ambos)',
      'Seguimiento de estado: autodeclarado/confirmado/rechazado',
      'Auditoría completa de eventos y cambios personales',
      'Historial detallado de direcciones por ciudadano',
      'Gestión de consentimientos de privacidad',
      'Integración con marco legal de cumplimiento',
      'Directorio de verificadores (solo lectura para CAR Admin)',
      'Flujo "Solicitar Verificador" a Admin del Sistema',
      'Analíticas de privacidad (solo lectura para CAR Admin)',
      'Métricas de calidad específicas del registro ciudadano',
      'Gestión de hogares y dependientes'
    ],
    workflow: [
      'Autenticación ciudadana y creación automática de registro',
      'Declaración de dirección primaria usando UAC del NAR',
      'Especificación de tipo de ocupación y alcance (edificio/unidad)',
      'Validación automática si UAC existe en NAR verificado',
      'Envío a cola de revisión manual si UAC no verificado',
      'Verificación por verificador con dominio CAR asignado',
      'Proceso de verificación legal con documentos de propiedad',
      'Aprobación/rechazo con justificación documentada',
      'Notificación automática al ciudadano del resultado',
      'Registro de eventos de auditoría para trazabilidad',
      'Gestión de direcciones secundarias adicionales',
      'Acceso a historial completo de direcciones personales'
    ],
    benefits: [
      'Separación clara entre registro nacional y personal',
      'Verificación formal de residencia con documentos legales',
      'Historial personal completo de direcciones ciudadanas',
      'Validación automática con direcciones oficiales NAR',
      'Cumplimiento legal con documentación requerida',
      'Control de privacidad y consentimientos',
      'Auditoría completa para transparencia ciudadana',
      'Gestión eficiente de verificadores con dominio flexible'
    ],
    icon: <Users className="h-6 w-6" />,
    color: 'bg-indigo-500'
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

        // Slide de características
        const featuresSlide = pptx.addSlide();
        featuresSlide.addText(`${scenario.title} - Características`, {
          x: 0.5,
          y: 0.5,
          w: 9,
          h: 0.8,
          fontSize: 24,
          bold: true
        });

        scenario.features.forEach((feature, idx) => {
          featuresSlide.addText(`• ${feature}`, {
            x: 0.5,
            y: 1.5 + (idx * 0.4),
            w: 9,
            h: 0.3,
            fontSize: 12
          });
        });

        // Slide de flujo de trabajo
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
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 0.8,
        fontSize: 28,
        bold: true
      });

      techSlide.addText("• 99.9% Precisión GPS\n• <30s Tiempo de Respuesta\n• 24/7 Disponibilidad\n• 100% Trabajo Offline\n• Mensajería en Hilos\n• Alertas Sonoras por Prioridad\n• Captura de Evidencia GPS\n• Navegación Multiplataforma", {
        x: 0.5,
        y: 1.5,
        w: 9,
        h: 3,
        fontSize: 18,
        bullet: true
      });

      await pptx.writeFile({ fileName: 'ConnectNation-Demo-Presentation.pptx' });
      toast.success('Presentación exportada exitosamente');
    } catch (error) {
      console.error('Error exporting PowerPoint:', error);
      toast.error('Error al exportar la presentación');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            ConnectNation Address - Demo Interactivo
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Demostraciones adaptadas a las necesidades específicas de cada actor del sistema
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button onClick={exportToPowerPoint} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar PowerPoint
            </Button>
            <GovernmentMonetizationPPT />
            <PresidentialDecreePDF />
            <BiakamGovernmentContractPDF />
          </div>
        </div>

        {/* Scenario Selection */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {demoScenarios.map((scenario) => (
            <Card 
              key={scenario.id}
              className={`cursor-pointer transition-all hover:scale-105 ${
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
            {/* Left: Scenario Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-lg ${currentScenario.color} flex items-center justify-center text-white`}>
                      {currentScenario.icon}
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{currentScenario.title}</CardTitle>
                      <CardDescription className="text-lg">{currentScenario.actor}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{currentScenario.description}</p>
                </CardContent>
              </Card>

              {/* Features, Workflow, Benefits */}
              <Tabs defaultValue="features" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="features">Características</TabsTrigger>
                  <TabsTrigger value="workflow">Flujo de Trabajo</TabsTrigger>
                  <TabsTrigger value="benefits">Beneficios</TabsTrigger>
                </TabsList>
                
                <TabsContent value="features" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Características Principales</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {currentScenario.features.map((feature, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="workflow" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Flujo de Trabajo</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {currentScenario.workflow.map((step, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>
                            <span className="text-sm">{step}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="benefits" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Beneficios Clave</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {currentScenario.benefits.map((benefit, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <BarChart3 className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right: Interactive Demo */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Demo Interactivo</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Current Step */}
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="flex items-center space-x-2 mb-2">
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        <p className="text-xs">Gestión de usuarios/roles, Configuración del sistema, Analíticas globales, Creación de verificadores con dominio</p>
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
                  <Card className="border-indigo-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Administrador CAR (car_admin)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-muted-foreground">Administrador del Registro Ciudadano de Direcciones (sin gestión de roles)</p>
                      <div>
                        <span className="text-xs font-medium text-blue-600">Portales:</span>
                        <p className="text-xs">Portal CAR administrativo, Dashboard de calidad CAR</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-green-600">Permisos:</span>
                        <p className="text-xs">Gestión de personas, Métricas de calidad, Directorio de verificadores (solo lectura), "Solicitar Verificador", Analíticas de privacidad, Gestión de hogares</p>
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
                      <CardTitle className="text-base flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Administrador Policial (police_admin)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-muted-foreground">Administración completa del sistema policial</p>
                      <div>
                        <span className="text-xs font-medium text-blue-600">Portales:</span>
                        <p className="text-xs">Dashboard policial completo, Central de emergencias, Administración de unidades</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-green-600">Nuevas Funciones:</span>
                        <p className="text-xs">Logs de auditoría del sistema, Configuración persistente, Analíticas en tiempo real con rangos de fecha, Gestión de roles policiales</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-red-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <UserCheck className="h-4 w-4" />
                        Supervisor Policial (police_supervisor)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-muted-foreground">Supervisión de operaciones policiales con autoridad de aprobación</p>
                      <div>
                        <span className="text-xs font-medium text-blue-600">Portales:</span>
                        <p className="text-xs">Dashboard policial, Central de emergencias, Dashboard de liderazgo</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-green-600">Nuevas Funciones:</span>
                        <p className="text-xs">Aprobación/denegación de respaldo, Revisión de evidencia capturada, Gestión de unidades con métricas, Modificación de prioridad de incidentes</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-red-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Radio className="h-4 w-4" />
                        Despachador Policial (police_dispatcher)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-muted-foreground">Despacho y coordinación de unidades (sin autoridad de aprobación)</p>
                      <div>
                        <span className="text-xs font-medium text-blue-600">Portales:</span>
                        <p className="text-xs">Central de emergencias, Sistema de comunicaciones</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-green-600">Nuevas Funciones:</span>
                        <p className="text-xs">Comunicaciones en hilos (Bandeja/Enviados/Historial), Notificaciones sonoras por prioridad, Coordinación de respaldo (sin aprobación), Escalamiento a supervisores, Reconocimiento de respaldo</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-red-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Operador Policial (police_operator)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-muted-foreground">Operaciones en campo con herramientas avanzadas</p>
                      <div>
                        <span className="text-xs font-medium text-blue-600">Portales:</span>
                        <p className="text-xs">Dashboard de campo, Recepción de incidentes</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-green-600">Nuevas Funciones:</span>
                        <p className="text-xs">Botón "OFFICER DOWN" para emergencias críticas, Solicitud de respaldo completa (tipo, urgencia, ubicación, médico), Solicitud de recursos detallada, Captura de evidencia con GPS, Navegación integrada (iOS/Android/Web), Seguimiento de reconocimiento de respaldo</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Roles de Registro NAR */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-green-600">Roles de Registro NAR</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-green-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Registrador (registrar)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-muted-foreground">Gestión del registro nacional por territorio</p>
                      <div>
                        <span className="text-xs font-medium text-blue-600">Portal:</span>
                        <p className="text-xs">Consola de registro NAR</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-green-600">Permisos:</span>
                        <p className="text-xs">Publicación de direcciones, Gestión territorial, Analíticas de cobertura, Auto-publicación de comerciales</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-green-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Verificador Unificado (verifier)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-muted-foreground">Verificador con dominio configurable (NAR/CAR/ambos)</p>
                      <div>
                        <span className="text-xs font-medium text-blue-600">Portal:</span>
                        <p className="text-xs">Dashboard de verificación según dominio asignado</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-green-600">Permisos (según dominio):</span>
                        <p className="text-xs">NAR: Validación geoespacial, Aprobación/rechazo. CAR: Verificación de residencia, Validación de documentos. Ambos: Todos los permisos</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-green-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Agente de Campo (field_agent)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-muted-foreground">Captura de datos en terreno con flujo de aprobación</p>
                      <div>
                        <span className="text-xs font-medium text-blue-600">Portal:</span>
                        <p className="text-xs">App de campo móvil</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-green-600">Permisos:</span>
                        <p className="text-xs">Captura GPS, Fotografía georreferenciada, Trabajo offline, Envío a cola de aprobación (no creación directa), Filtrado por scope</p>
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
                        <p className="text-xs">Búsqueda de direcciones, Solicitudes personales, Reporte de emergencias, Flujo unificado de direcciones (NAR/CAR/Business), Gestión de hogares y dependientes</p>
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
                  <Badge variant="secondary" className="p-3 justify-center">Comunicaciones en Hilos</Badge>
                  <Badge variant="secondary" className="p-3 justify-center">Alertas Sonoras</Badge>
                  <Badge variant="secondary" className="p-3 justify-center">Captura de Evidencia</Badge>
                  <Badge variant="secondary" className="p-3 justify-center">Navegación GPS</Badge>
                  <Badge variant="secondary" className="p-3 justify-center">Respaldo Escalonado</Badge>
                  <Badge variant="secondary" className="p-3 justify-center">Analíticas</Badge>
                  <Badge variant="secondary" className="p-3 justify-center">Logs de Auditoría</Badge>
                  <Badge variant="secondary" className="p-3 justify-center">Trabajo Offline</Badge>
                  <Badge variant="secondary" className="p-3 justify-center">OpenStreetMap Fallback</Badge>
                </div>
              </TabsContent>
              
              <TabsContent value="integration" className="space-y-4">
                <p className="text-muted-foreground">
                  El sistema se integra con servicios existentes de gobierno, sistemas de emergencia, 
                  y plataformas de mapas (Google Maps con fallback a OpenStreetMap) para proporcionar una solución completa de gestión de direcciones.
                  Incluye integración con aplicaciones de navegación nativas (Apple Maps, Google Maps) para enrutamiento en campo.
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
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary">&lt;2min</div>
                    <div className="text-sm text-muted-foreground">Respaldo Ackn.</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary">100%</div>
                    <div className="text-sm text-muted-foreground">Auditoría</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary">3</div>
                    <div className="text-sm text-muted-foreground">Idiomas</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary">Auto</div>
                    <div className="text-sm text-muted-foreground">Publicación Comercial</div>
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
