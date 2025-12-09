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
import { CARAdminGuide } from '@/components/guides/CARAdminGuide';
import { NDAAdminGuide } from '@/components/guides/NDAAdminGuide';
import { SystemAdminGuide } from '@/components/guides/SystemAdminGuide';


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
                    Complete workflow documentation for NAR, CAR, and Emergency Management - verified against actual implementation. Note: Address requests require Citizen Portal authentication.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Includes:</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      <li><strong>⚠️ Important:</strong> Address requests require Citizen Portal authentication</li>
                      <li>NAR Process - Verifier sets verified=true, Registrar sets public=true</li>
                      <li>CAR Process - Auto-approval via trigger for verified NAR links</li>
                      <li>Emergency Management - Auto-status to 'dispatched' on unit assignment</li>
                      <li>Module Integration Workflows</li>
                      <li>Roles and Responsibilities (cross-referenced with RLS policies)</li>
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
                      <li><strong>⚠️ Importante:</strong> Las solicitudes de dirección requieren autenticación en Portal Ciudadano</li>
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
                      { title: 'START', desc: 'Citizen logs in to Citizen Portal (authentication required)', icon: '🚀' },
                      { title: 'ADDRESS REQUEST', desc: 'Submits request via authenticated Citizen Portal only', icon: '📋' },
                      { title: 'DATA CAPTURE', desc: 'GPS coordinates, photos, justification, documents', icon: '📸' },
                      { title: 'AUTO-VERIFICATION', desc: 'Coordinate validation, photo quality, duplicates', icon: '🤖' },
                      { title: 'FLAGGING', desc: 'System flags for standard or manual review', icon: '🚩' },
                      { title: 'VERIFIER REVIEW', desc: 'Verifier reviews, sets verified=true', icon: '👁️' },
                      { title: 'UAC GENERATION', desc: 'UAC auto-generated via generate_unified_uac_unique()', icon: '🔢' },
                      { title: 'REGISTRAR APPROVAL', desc: 'Registrar sets public=true to publish', icon: '✅' },
                      { title: 'PUBLICATION', desc: 'Address now in public NAR, searchable', icon: '🌐' },
                      { title: 'END', desc: 'Available for emergencies and CAR linking', icon: '🎯' }
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
                      { title: 'UAC INPUT', desc: 'Citizen enters UAC from verified NAR address', icon: '🔍' },
                      { title: 'SCOPE SELECTION', desc: 'BUILDING (whole property) or UNIT (specific unit)', icon: '🏠' },
                      { title: 'RPC EXECUTION', desc: 'set_primary_address() or add_secondary_address()', icon: '⚙️' },
                      { title: 'AUTO-APPROVAL CHECK', desc: 'trigger_auto_approve_citizen_address() trigger', icon: '🤖' },
                      { title: 'STATUS: SELF_DECLARED', desc: 'If NAR UAC verified → Auto CONFIRMED', icon: '✅' },
                      { title: 'MANUAL REVIEW', desc: 'CAR verifiers review non-auto-approved', icon: '👁️' },
                      { title: 'STATUS UPDATE', desc: 'set_citizen_address_status() to CONFIRMED/REJECTED', icon: '✔️' },
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
                        {idx < 10 && (
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
                      { title: 'INCIDENT CREATION', desc: 'Generates INC-[year]-[sequence] number', icon: '📋' },
                      { title: 'DATA ENCRYPTION', desc: 'decrypt-incident-data edge function encrypts data', icon: '🔒' },
                      { title: 'STATUS: reported', desc: 'Initial incident status in emergency_incidents table', icon: '📝' },
                      { title: 'OPERATOR NOTIFICATION', desc: 'notify-emergency-operators edge function', icon: '🔔' },
                      { title: 'DISPATCHER ASSIGNMENT', desc: 'Dispatcher reviews and assigns units', icon: '👤' },
                      { title: 'UNIT ASSIGNMENT', desc: 'Units assigned to incident (assigned_units[] array)', icon: '🚔' },
                      { title: 'AUTO-STATUS UPDATE', desc: 'Trigger sets status=dispatched when units assigned', icon: '⚡' },
                      { title: 'UNIT NOTIFICATION', desc: 'notify-unit-assignment edge function', icon: '📲' },
                      { title: 'STATUS: responded', desc: 'Unit en route, responded_at timestamp set', icon: '🚗' },
                      { title: 'STATUS: resolved', desc: 'Incident handled, resolved_at timestamp', icon: '✅' },
                      { title: 'BACKUP (if needed)', desc: 'process-backup-request via BackupNotificationManager', icon: '🆘' },
                      { title: 'STATUS: closed', desc: 'Final documentation, closed_at timestamp', icon: '📊' },
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
                  Comprehensive architecture, API documentation, and system specifications (verified Jan 2025)
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
                    <a href="/docs/portal-functionalities-comparison.md" target="_blank">
                      <FileText className="h-4 w-4 mr-2" />
                      Portal Functionalities Comparison
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
              <TabsList className="grid w-full grid-cols-5 lg:grid-cols-11 max-w-full mx-auto gap-1">
                <TabsTrigger value="ndaa-admin">NDAA Admin</TabsTrigger>
                <TabsTrigger value="system-admin">System Admin</TabsTrigger>
                <TabsTrigger value="registrar">Registrar</TabsTrigger>
                <TabsTrigger value="field-agent">Field Agent</TabsTrigger>
                <TabsTrigger value="verifier">Verifier (NAR/CAR)</TabsTrigger>
                <TabsTrigger value="car-admin">CAR Admin</TabsTrigger>
                <TabsTrigger value="police-admin">Police Admin</TabsTrigger>
                <TabsTrigger value="police-supervisor">Supervisor</TabsTrigger>
                <TabsTrigger value="dispatcher">Dispatcher</TabsTrigger>
                <TabsTrigger value="police-operator">Police Officer</TabsTrigger>
                <TabsTrigger value="citizen">Citizen</TabsTrigger>
              </TabsList>
              
              <TabsContent value="ndaa-admin" className="mt-6">
                <NDAAdminGuide />
              </TabsContent>
              
              <TabsContent value="system-admin" className="mt-6">
                <SystemAdminGuide />
              </TabsContent>
              
              <TabsContent value="registrar" className="mt-6">
                <RegistrarGuide />
              </TabsContent>
              
              <TabsContent value="field-agent" className="mt-6">
                <FieldAgentGuide />
              </TabsContent>
              
              <TabsContent value="verifier" className="mt-6">
                <VerifierGuide />
              </TabsContent>
              
              <TabsContent value="car-admin" className="mt-6">
                <CARAdminGuide />
              </TabsContent>
              
              <TabsContent value="police-admin" className="mt-6">
                <PoliceAdminGuide />
              </TabsContent>
              
              <TabsContent value="police-supervisor" className="mt-6">
                <PoliceSupervisorGuide />
              </TabsContent>
              
              <TabsContent value="dispatcher" className="mt-6">
                <EmergencyDispatcherGuide />
              </TabsContent>
              
              <TabsContent value="police-operator" className="mt-6">
                <PoliceOperatorGuide />
              </TabsContent>
              
              <TabsContent value="citizen" className="mt-6">
                <CitizenGuide />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Documentation;