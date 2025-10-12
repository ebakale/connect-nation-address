import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProcessFlowDiagramPDF from '@/components/ProcessFlowDiagramPDF';
import ProcessFlowDiagramPDFEnglish from '@/components/ProcessFlowDiagramPDFEnglish';
import { FileText, BookOpen, Workflow } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FieldAgentGuide } from '@/components/guides/FieldAgentGuide';
import { VerifierGuide } from '@/components/guides/VerifierGuide';
import { RegistrarGuide } from '@/components/guides/RegistrarGuide';
import { CitizenGuide } from '@/components/guides/CitizenGuide';
import { EmergencyDispatcherGuide } from '@/components/guides/EmergencyDispatcherGuide';
import { PoliceOperatorGuide } from '@/components/guides/PoliceOperatorGuide';
import { PoliceSupervisorGuide } from '@/components/guides/PoliceSupervisorGuide';
import { PoliceAdminGuide } from '@/components/guides/PoliceAdminGuide';
import { CARVerifierGuide } from '@/components/guides/CARVerifierGuide';
import { CARAdminGuide } from '@/components/guides/CARAdminGuide';

const Documentation: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4 py-8">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
            <BookOpen className="h-10 w-10 text-primary" />
            System Documentation
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Access comprehensive documentation, process flows, and technical resources for the Biakam National Address System
          </p>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="flows" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
            <TabsTrigger value="flows" className="flex items-center gap-2">
              <Workflow className="h-4 w-4" />
              Process Flows
            </TabsTrigger>
            <TabsTrigger value="technical" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Technical Docs
            </TabsTrigger>
            <TabsTrigger value="guides" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              User Guides
            </TabsTrigger>
          </TabsList>

          {/* Process Flow Diagrams */}
          <TabsContent value="flows" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Workflow className="h-5 w-5" />
                    Process Flow Diagrams (English)
                  </CardTitle>
                  <CardDescription>
                    Complete workflow documentation for NAR, CAR, and Emergency Management processes in English
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Includes:</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      <li>NAR Process - National Address Registry</li>
                      <li>CAR Process - Citizen Address Repository</li>
                      <li>Emergency Management Process</li>
                      <li>Module Integration Workflows</li>
                      <li>Roles and Responsibilities</li>
                      <li>Performance Metrics (SLA)</li>
                    </ul>
                  </div>
                  <div className="pt-4">
                    <ProcessFlowDiagramPDFEnglish />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Workflow className="h-5 w-5" />
                    Diagramas de Flujo de Procesos (Español)
                  </CardTitle>
                  <CardDescription>
                    Documentación completa de flujos de trabajo para procesos NAR, CAR y Gestión de Emergencias en español
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Incluye:</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      <li>Proceso NAR - Registro Nacional de Direcciones</li>
                      <li>Proceso CAR - Repositorio de Direcciones Ciudadanas</li>
                      <li>Proceso de Gestión de Emergencias</li>
                      <li>Flujos de Integración de Módulos</li>
                      <li>Roles y Responsabilidades</li>
                      <li>Métricas de Rendimiento (SLA)</li>
                    </ul>
                  </div>
                  <div className="pt-4">
                    <ProcessFlowDiagramPDF />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Visual Process Flow Diagrams */}
            <div className="grid gap-6 mt-6">
              {/* NAR Process Diagram */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-primary">NAR Process - National Address Registry</CardTitle>
                  <CardDescription>Complete workflow from field capture to publication</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    {[
                      { title: 'START', desc: 'Citizen/authority submits address request', icon: '🚀' },
                      { title: 'DATA CAPTURE', desc: 'GPS coordinates, photos, justification, documents', icon: '📸' },
                      { title: 'AUTO-VERIFICATION', desc: 'Coordinate validation, photo quality, duplicates', icon: '🤖' },
                      { title: 'FLAGGING', desc: 'System flags for standard or manual review', icon: '🚩' },
                      { title: 'VERIFIER REVIEW', desc: 'Verifier reviews in queue, approves/rejects/edits', icon: '👁️' },
                      { title: 'APPROVAL', desc: 'Creates address via approve_address_request() RPC', icon: '✅' },
                      { title: 'UAC GENERATION', desc: 'System generates UAC using generate_unified_uac_unique()', icon: '🔢' },
                      { title: 'PUBLICATION', desc: 'Registrar sets verified=true and public=true', icon: '🌐' },
                      { title: 'END', desc: 'Address searchable, available for emergencies and CAR', icon: '🎯' }
                    ].map((step, idx) => (
                      <div key={idx}>
                        <div className="flex items-start gap-4 p-3 bg-muted/50 rounded-lg">
                          <div className="text-2xl">{step.icon}</div>
                          <div className="flex-1">
                            <div className="font-semibold text-sm">{step.title}</div>
                            <div className="text-xs text-muted-foreground">{step.desc}</div>
                          </div>
                        </div>
                        {idx < 8 && (
                          <div className="flex justify-center py-1">
                            <div className="text-muted-foreground">↓</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* CAR Process Diagram */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-primary">CAR Process - Citizen Address Repository</CardTitle>
                  <CardDescription>Citizen address declaration and verification workflow</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    {[
                      { title: 'START', desc: 'Citizen accesses CitizenAddressVerificationManager', icon: '🚀' },
                      { title: 'PERSON RECORD', desc: 'System creates/loads person record linked to auth.uid()', icon: '👤' },
                      { title: 'ACTION SELECTION', desc: 'Set Primary/Add Secondary/Request Verification', icon: '📝' },
                      { title: 'UAC INPUT', desc: 'Citizen enters UAC from NAR (must exist)', icon: '🔍' },
                      { title: 'SCOPE SELECTION', desc: 'DWELLING (whole property) or UNIT (specific unit)', icon: '🏠' },
                      { title: 'RPC EXECUTION', desc: 'set_primary_address() or add_secondary_address()', icon: '⚙️' },
                      { title: 'STATUS', desc: 'Address created with status "SELF_DECLARED"', icon: '⏳' },
                      { title: 'VERIFIER REVIEW', desc: 'CAR verifiers review in queue', icon: '👁️' },
                      { title: 'STATUS UPDATE', desc: 'set_citizen_address_status() to CONFIRMED/REJECTED', icon: '✅' },
                      { title: 'END', desc: 'Active in citizen profile with effective dates', icon: '🎯' }
                    ].map((step, idx) => (
                      <div key={idx}>
                        <div className="flex items-start gap-4 p-3 bg-muted/50 rounded-lg">
                          <div className="text-2xl">{step.icon}</div>
                          <div className="flex-1">
                            <div className="font-semibold text-sm">{step.title}</div>
                            <div className="text-xs text-muted-foreground">{step.desc}</div>
                          </div>
                        </div>
                        {idx < 9 && (
                          <div className="flex justify-center py-1">
                            <div className="text-muted-foreground">↓</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Management Diagram */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-primary">Emergency Management Process</CardTitle>
                  <CardDescription>Incident reporting and response workflow</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    {[
                      { title: 'START', desc: 'Reporter submits via EmergencyDispatchDialog', icon: '🚨' },
                      { title: 'INCIDENT CREATION', desc: 'Generates INC-[timestamp] number', icon: '📋' },
                      { title: 'DATA ENCRYPTION', desc: 'decrypt-incident-data edge function encrypts data', icon: '🔒' },
                      { title: 'STATUS: REPORTED', desc: 'Initial incident status in emergency_incidents table', icon: '📝' },
                      { title: 'OPERATOR NOTIFICATION', desc: 'notify-emergency-operators edge function', icon: '🔔' },
                      { title: 'OPERATOR ASSIGNMENT', desc: 'Dispatcher assigns to operator', icon: '👤' },
                      { title: 'UNIT ASSIGNMENT', desc: 'Operator assigns units, status: ASSIGNED', icon: '🚔' },
                      { title: 'UNIT NOTIFICATION', desc: 'notify-unit-assignment edge function', icon: '📲' },
                      { title: 'STATUS: RESPONDING', desc: 'Unit en route, GPS tracking active', icon: '🚗' },
                      { title: 'STATUS: ON_SCENE', desc: 'Unit arrives, responded_at timestamp', icon: '📍' },
                      { title: 'BACKUP (if needed)', desc: 'process-backup-request via BackupNotificationManager', icon: '🆘' },
                      { title: 'STATUS: RESOLVED', desc: 'Officer completes report, resolved_at timestamp', icon: '✅' },
                      { title: 'STATUS: CLOSED', desc: 'Final documentation, analytics updated', icon: '📊' },
                      { title: 'END', desc: 'notify-incident-reporter notifies reporter', icon: '🎯' }
                    ].map((step, idx) => (
                      <div key={idx}>
                        <div className="flex items-start gap-4 p-3 bg-muted/50 rounded-lg">
                          <div className="text-2xl">{step.icon}</div>
                          <div className="flex-1">
                            <div className="font-semibold text-sm">{step.title}</div>
                            <div className="text-xs text-muted-foreground">{step.desc}</div>
                          </div>
                        </div>
                        {idx < 13 && (
                          <div className="flex justify-center py-1">
                            <div className="text-muted-foreground">↓</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Technical Documentation */}
          <TabsContent value="technical" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Technical Documentation</CardTitle>
                <CardDescription>
                  Architecture, API documentation, and system specifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <Button variant="outline" className="justify-start" asChild>
                    <a href="/docs/system-manual.md" target="_blank">
                      <FileText className="h-4 w-4 mr-2" />
                      System Manual
                    </a>
                  </Button>
                  <Button variant="outline" className="justify-start" asChild>
                    <a href="/docs/security-overview.md" target="_blank">
                      <FileText className="h-4 w-4 mr-2" />
                      Security Overview
                    </a>
                  </Button>
                  <Button variant="outline" className="justify-start" asChild>
                    <a href="/docs/current-hosting-blueprint.md" target="_blank">
                      <FileText className="h-4 w-4 mr-2" />
                      Hosting Blueprint
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Guides */}
          <TabsContent value="guides" className="mt-6">
            <Tabs defaultValue="field-agent" className="w-full">
              <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10 max-w-6xl mx-auto">
                <TabsTrigger value="field-agent">Field Agent</TabsTrigger>
                <TabsTrigger value="verifier">Verifier</TabsTrigger>
                <TabsTrigger value="registrar">Registrar</TabsTrigger>
                <TabsTrigger value="citizen">Citizen</TabsTrigger>
                <TabsTrigger value="dispatcher">Dispatcher</TabsTrigger>
                <TabsTrigger value="police-operator">Police Officer</TabsTrigger>
                <TabsTrigger value="police-supervisor">Supervisor</TabsTrigger>
                <TabsTrigger value="police-admin">Police Admin</TabsTrigger>
                <TabsTrigger value="car-verifier">CAR Verifier</TabsTrigger>
                <TabsTrigger value="car-admin">CAR Admin</TabsTrigger>
              </TabsList>
              
              <TabsContent value="field-agent" className="mt-6">
                <FieldAgentGuide />
              </TabsContent>
              
              <TabsContent value="verifier" className="mt-6">
                <VerifierGuide />
              </TabsContent>
              
              <TabsContent value="registrar" className="mt-6">
                <RegistrarGuide />
              </TabsContent>
              
              <TabsContent value="citizen" className="mt-6">
                <CitizenGuide />
              </TabsContent>
              
              <TabsContent value="dispatcher" className="mt-6">
                <EmergencyDispatcherGuide />
              </TabsContent>
              
              <TabsContent value="police-operator" className="mt-6">
                <PoliceOperatorGuide />
              </TabsContent>
              
              <TabsContent value="police-supervisor" className="mt-6">
                <PoliceSupervisorGuide />
              </TabsContent>
              
              <TabsContent value="police-admin" className="mt-6">
                <PoliceAdminGuide />
              </TabsContent>
              
              <TabsContent value="car-verifier" className="mt-6">
                <CARVerifierGuide />
              </TabsContent>
              
              <TabsContent value="car-admin" className="mt-6">
                <CARAdminGuide />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Documentation;