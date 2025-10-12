import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProcessFlowDiagramPDF from '@/components/ProcessFlowDiagramPDF';
import ProcessFlowDiagramPDFEnglish from '@/components/ProcessFlowDiagramPDFEnglish';
import { FileText, BookOpen, Workflow, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

            {/* Visual Preview Section */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Process Overview</CardTitle>
                <CardDescription>
                  Quick reference guide to main system workflows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 border rounded-lg space-y-2">
                    <div className="font-semibold text-primary">1. NAR Process</div>
                    <p className="text-sm text-muted-foreground">
                      Address creation workflow from citizen submission through auto-verification, manual review, and final publication
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg space-y-2">
                    <div className="font-semibold text-primary">2. CAR Process</div>
                    <p className="text-sm text-muted-foreground">
                      Citizen address declaration and verification workflow with self-declaration and confirmation steps
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg space-y-2">
                    <div className="font-semibold text-primary">3. Emergency Management</div>
                    <p className="text-sm text-muted-foreground">
                      Incident reporting and response workflow with real-time dispatch and tracking
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
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
            <Card>
              <CardHeader>
                <CardTitle>User Guides</CardTitle>
                <CardDescription>
                  Step-by-step guides for different user roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-semibold mb-2">Field Agents</h4>
                    <p className="text-muted-foreground">
                      Learn how to capture addresses, take photos, and submit requests for verification
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-semibold mb-2">Verifiers</h4>
                    <p className="text-muted-foreground">
                      Guidelines for reviewing address data quality and approving or flagging submissions
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-semibold mb-2">Registrars</h4>
                    <p className="text-muted-foreground">
                      Process for final approval and publication of addresses to the national registry
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-semibold mb-2">Citizens</h4>
                    <p className="text-muted-foreground">
                      How to declare your address, request verification, and manage your address book
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-semibold mb-2">Emergency Dispatchers</h4>
                    <p className="text-muted-foreground">
                      Managing emergency incidents, dispatching units, and tracking response times
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Documentation;