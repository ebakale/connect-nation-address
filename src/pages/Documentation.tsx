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
                    Complete workflow documentation for NAR, CAR, Business, and Emergency Management - verified against actual implementation (Dec 2025)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Includes:</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      <li><strong>⚠️ Important:</strong> Address requests require Citizen Portal authentication</li>
                      <li>Unified Address Request - Multi-purpose wizard for CAR/NAR/Business</li>
                      <li>NAR Process - Auto-publishing: non-residential → public, residential → private</li>
                      <li>Business Address Registration - Full business workflow</li>
                      <li>CAR Process - Auto-approval via trigger for verified NAR links</li>
                      <li>Emergency Management - Auto-status to 'dispatched' on unit assignment</li>
                      <li>Rejected Items Retention - 6mo archive, 24mo anonymization</li>
                      <li>Map Fallback - OpenStreetMap when Google Maps unavailable</li>
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
                    Documentación completa de flujos de trabajo para procesos NAR, CAR, Negocio y Gestión de Emergencias en español
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Incluye:</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      <li><strong>⚠️ Importante:</strong> Las solicitudes de dirección requieren autenticación en Portal Ciudadano</li>
                      <li>Solicitud Unificada de Direcciones - Asistente multipropósito</li>
                      <li>Proceso NAR - Auto-publicación según tipo de dirección</li>
                      <li>Registro de Direcciones de Negocio</li>
                      <li>Proceso CAR - Repositorio de Direcciones Ciudadanas</li>
                      <li>Proceso de Gestión de Emergencias</li>
                      <li>Política de Retención de Elementos Rechazados</li>
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
              {/* Unified Address Request Flow - NEW */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-primary">Unified Address Request Flow</CardTitle>
                  <CardDescription>Multi-purpose wizard for CAR declarations, Business registration, and NAR requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    {[
                      { title: 'START', desc: 'Citizen accesses Unified Address Request from dashboard', icon: '🚀' },
                      { title: 'ADDRESS LOOKUP', desc: 'Search existing address by UAC or create new address request', icon: '🔍' },
                      { title: 'EXISTING FOUND?', desc: 'If UAC found → proceed to declaration; if not → create NAR request first', icon: '❓' },
                      { title: 'REQUEST TYPE', desc: 'Select: Declare as Residence (CAR) or Register Business', icon: '📋' },
                      { title: 'CAR DECLARATION', desc: 'Set as primary/secondary address, select scope (BUILDING/UNIT), occupant type', icon: '🏠' },
                      { title: 'BUSINESS REGISTRATION', desc: 'Enter organization name, category, contacts, services, operating hours', icon: '🏢' },
                      { title: 'AUTO-APPROVAL CHECK', desc: 'CAR: auto-approved if UAC verified; Business: auto-published if non-residential', icon: '🤖' },
                      { title: 'MANUAL REVIEW', desc: 'If not auto-approved, goes to verifier queue', icon: '👁️' },
                      { title: 'END', desc: 'Address declaration/business active in citizen profile', icon: '🎯' }
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

              {/* NAR Process Diagram - UPDATED */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-primary">NAR Process - National Address Registry</CardTitle>
                  <CardDescription>Complete workflow from field capture to auto-publication</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    {[
                      { title: 'START', desc: 'Citizen/Field Agent initiates address request', icon: '🚀' },
                      { title: 'ADDRESS REQUEST', desc: 'Submits via Unified Address Request or Field Agent capture form', icon: '📋' },
                      { title: 'DATA CAPTURE', desc: 'GPS coordinates, photos, justification, documents', icon: '📸' },
                      { title: 'AUTO-VERIFICATION', desc: 'Coordinate validation, photo quality, duplicates (score threshold: 70)', icon: '🤖' },
                      { title: 'FLAGGING', desc: 'System flags for standard or manual review based on score', icon: '🚩' },
                      { title: 'VERIFIER REVIEW', desc: 'Verifier (NAR domain) reviews, sets verified=true', icon: '👁️' },
                      { title: 'UAC GENERATION', desc: 'UAC auto-generated via generate_unified_uac_unique()', icon: '🔢' },
                      { title: 'REGISTRAR APPROVAL', desc: 'Final approval - triggers auto-publishing policy', icon: '✅' },
                      { title: 'AUTO-PUBLISHING', desc: 'Non-residential → public=true; Residential → public=false', icon: '🌐' },
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
                        {idx < 9 && (
                          <div className="flex justify-center py-1">
                            <div className="text-muted-foreground">↓</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="bg-muted p-4 rounded-lg mt-4">
                    <p className="text-sm"><strong>Auto-Publishing Policy:</strong> Non-residential types (business, commercial, government, landmark, institutional, industrial, public) are automatically public. Residential addresses require explicit publication.</p>
                  </div>
                </CardContent>
              </Card>

              {/* Business Address Registration - NEW */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-primary">Business Address Registration</CardTitle>
                  <CardDescription>Complete flow for registering business addresses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    {[
                      { title: 'START', desc: 'User selects "Register Business" in Unified Address Request', icon: '🚀' },
                      { title: 'ADDRESS SELECTION', desc: 'Search existing NAR address by UAC or request new address creation', icon: '🔍' },
                      { title: 'BUSINESS DETAILS', desc: 'Enter organization_name, business_category (required for approval)', icon: '📝' },
                      { title: 'CONTACT INFO', desc: 'Add business phone, email, website, social media links', icon: '📞' },
                      { title: 'SERVICES', desc: 'List services offered, business description, keywords', icon: '🛠️' },
                      { title: 'OPERATING HOURS', desc: 'Set daily opening/closing times, special hours', icon: '🕐' },
                      { title: 'VISIBILITY', desc: 'Choose directory listing preferences', icon: '👁️' },
                      { title: 'VALIDATION', desc: 'System validates complete metadata before approval', icon: '✔️' },
                      { title: 'AUTO-PUBLISH', desc: 'Business addresses auto-set to public=true on approval', icon: '🌐' },
                      { title: 'END', desc: 'Business appears in public Business Directory', icon: '🎯' }
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
                  <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg mt-4">
                    <p className="text-sm"><strong>⚠️ Validation:</strong> Business requests with incomplete metadata (missing organization_name or business_category) cannot be approved. The system prevents "Unknown Organization" records.</p>
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
                      { title: 'START', desc: 'Citizen accesses Unified Address Request or My CAR Addresses', icon: '🚀' },
                      { title: 'PERSON RECORD', desc: 'System creates/loads person record linked to auth.uid()', icon: '👤' },
                      { title: 'ACTION SELECTION', desc: 'Set Primary/Add Secondary/Request Verification', icon: '📝' },
                      { title: 'UAC INPUT', desc: 'Citizen enters UAC from verified NAR address', icon: '🔍' },
                      { title: 'SCOPE SELECTION', desc: 'BUILDING (whole property) or UNIT (specific unit)', icon: '🏠' },
                      { title: 'PRIVACY LEVEL', desc: 'Select: PRIVATE, REGION_ONLY, or PUBLIC', icon: '🔒' },
                      { title: 'RPC EXECUTION', desc: 'set_primary_address() or add_secondary_address()', icon: '⚙️' },
                      { title: 'AUTO-APPROVAL CHECK', desc: 'trigger_auto_approve_citizen_address() - if NAR verified → CONFIRMED', icon: '🤖' },
                      { title: 'STATUS: SELF_DECLARED', desc: 'If not auto-approved → pending manual review', icon: '⏳' },
                      { title: 'CAR VERIFIER REVIEW', desc: 'Verifiers (CAR domain) review pending declarations', icon: '👁️' },
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
                        {idx < 11 && (
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
                      { title: 'NAVIGATE TO SCENE', desc: 'Unit uses Navigate button for turn-by-turn directions', icon: '🗺️' },
                      { title: 'STATUS: responded', desc: 'Unit en route, responded_at timestamp set', icon: '🚗' },
                      { title: 'EVIDENCE CAPTURE', desc: 'Officer captures photos via EvidenceCaptureDialog with location', icon: '📸' },
                      { title: 'STATUS: resolved', desc: 'Incident handled, resolved_at timestamp', icon: '✅' },
                      { title: 'BACKUP (if needed)', desc: 'process-backup-request via BackupNotificationManager', icon: '🆘' },
                      { title: 'STATUS: closed', desc: 'Final documentation, closed_at timestamp', icon: '📊' },
                      { title: 'AUDIT LOGGED', desc: 'All actions recorded in emergency_incident_logs', icon: '📋' },
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
                        {idx < 16 && (
                          <div className="flex justify-center py-1">
                            <div className="text-muted-foreground">↓</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Rejected Items Retention - NEW */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-primary">Rejected Items Retention Policy</CardTitle>
                  <CardDescription>Data lifecycle for rejected addresses and verifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    {[
                      { title: 'REJECTION', desc: 'Item rejected (NAR request, CAR declaration, or verification)', icon: '❌' },
                      { title: 'ACTIVE RETENTION', desc: '0-6 months: Full data in main tables, citizen can delete', icon: '📂' },
                      { title: 'ARCHIVING', desc: '6-24 months: Moved to archive tables, PII preserved', icon: '📦' },
                      { title: 'ANONYMIZATION', desc: '24+ months: PII removed, statistical data retained', icon: '🔒' },
                      { title: 'MONTHLY CLEANUP', desc: 'Cron job runs 1st of month at 3 AM', icon: '🗓️' },
                      { title: 'MANUAL DELETE', desc: 'Citizens can delete own rejected items anytime', icon: '🗑️' }
                    ].map((step, idx) => (
                      <div key={idx}>
                        <div className="flex items-start gap-4 p-3 bg-muted/50 rounded-lg">
                          <div className="text-2xl">{step.icon}</div>
                          <div className="flex-1">
                            <div className="font-semibold text-sm">{step.title}</div>
                            <div className="text-xs text-muted-foreground">{step.desc}</div>
                          </div>
                        </div>
                        {idx < 5 && (
                          <div className="flex justify-center py-1">
                            <div className="text-muted-foreground">↓</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Map Fallback Note */}
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-primary">Map Provider Fallback</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm">The system implements automatic OpenStreetMap/Leaflet fallback when Google Maps billing is not enabled or API errors occur.</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li><strong>Primary:</strong> Google Maps (requires billing enabled)</li>
                      <li><strong>Fallback:</strong> OpenStreetMap + Leaflet (free, automatic)</li>
                      <li><strong>Detection:</strong> System automatically detects Google Maps failures</li>
                      <li><strong>Components:</strong> UniversalFieldMap, UniversalLocationMap, UniversalLocationPicker</li>
                    </ul>
                    <p className="text-sm text-muted-foreground">Users see a warning banner when using OSM fallback. All map features continue working seamlessly.</p>
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
                  Comprehensive architecture, API documentation, and system specifications (updated Dec 2025)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
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
                  <Button variant="outline" className="justify-start" asChild>
                    <a href="/docs/business-address-guide.md" target="_blank">
                      <FileText className="h-4 w-4 mr-2" />
                      Business Address Guide
                    </a>
                  </Button>
                  <Button variant="outline" className="justify-start" asChild>
                    <a href="/docs/retention-policy.md" target="_blank">
                      <FileText className="h-4 w-4 mr-2" />
                      Data Retention Policy
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
