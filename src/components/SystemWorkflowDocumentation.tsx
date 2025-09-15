import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Shield, 
  Users, 
  ArrowRight, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Settings,
  FileText,
  Zap
} from 'lucide-react';

interface WorkflowStep {
  stage: string;
  role: string;
  description: string;
  sla?: string;
  status: 'completed' | 'current' | 'pending';
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  module: 'address' | 'police' | 'integration';
  steps: WorkflowStep[];
}

export const SystemWorkflowDocumentation: React.FC = () => {
  const { t } = useTranslation(['admin', 'common']);
  const [activeModule, setActiveModule] = useState<'address' | 'police' | 'integration'>('address');

  const addressWorkflows: Workflow[] = [
    {
      id: 'standard-creation',
      name: 'Standard Address Creation',
      description: 'Complete workflow from citizen request to published address with UAC generation',
      module: 'address',
      steps: [
        { stage: 'submit_request', role: 'Citizen', description: 'Submit new address request with basic location information', status: 'completed' },
        { stage: 'capture_draft', role: 'Field Agent', description: 'Visit location, capture GPS coordinates and photographic evidence', sla: '48 hours', status: 'current' },
        { stage: 'verify', role: 'Verifier', description: 'Review draft for accuracy, check duplicates, resolve conflicts', sla: '24 hours', status: 'pending' },
        { stage: 'publish', role: 'Registrar', description: 'Final review, publish to registry, generate UAC', sla: '12 hours', status: 'pending' }
      ]
    },
    {
      id: 'partner-bulk',
      name: 'Partner Bulk Update',
      description: 'Automated bulk address upload and verification for utility partners and service providers',
      module: 'address',
      steps: [
        { stage: 'bulk_upload', role: 'Partner/Utility', description: 'Upload customer references with coordinates via API', status: 'completed' },
        { stage: 'qa_review', role: 'Data Steward', description: 'Automated quality checks and suspicious entry flagging', sla: '2 hours', status: 'current' },
        { stage: 'batch_verify', role: 'Verifier', description: 'Review QA results and approve clean data subset', sla: '4 hours', status: 'pending' },
        { stage: 'bulk_publish', role: 'Registrar', description: 'Batch publish with UAC generation and webhook confirmation', sla: '1 hour', status: 'pending' }
      ]
    },
    {
      id: 'emergency-fasttrack',
      name: 'Emergency Fast-Track',
      description: 'Priority address verification for emergency services and critical infrastructure',
      module: 'address',
      steps: [
        { stage: 'emergency_flag', role: 'Partner (EMS)', description: 'Flag critical location with emergency justification', status: 'completed' },
        { stage: 'priority_verify', role: 'Verifier', description: 'Priority processing within emergency SLA', sla: '2 hours', status: 'current' },
        { stage: 'fast_publish', role: 'Registrar', description: 'Immediate publication with temporary UAC if needed', sla: '30 minutes', status: 'pending' }
      ]
    }
  ];

  const policeWorkflows: Workflow[] = [
    {
      id: 'incident-response',
      name: 'Emergency Incident Response',
      description: 'Complete incident lifecycle from emergency call to resolution and performance analysis',
      module: 'police',
      steps: [
        { stage: 'incident_report', role: 'Citizen/System', description: 'Emergency call received, categorized, and location verified', status: 'completed' },
        { stage: 'dispatch_coordination', role: 'Police Dispatcher', description: 'Optimal unit selection and deployment coordination', sla: '4 minutes (critical)', status: 'current' },
        { stage: 'field_response', role: 'Police Operator', description: 'On-scene response with real-time status updates', sla: '15 minutes (standard)', status: 'pending' },
        { stage: 'supervision_analysis', role: 'Police Supervisor', description: 'Performance monitoring and outcome evaluation', status: 'pending' }
      ]
    },
    {
      id: 'backup-coordination',
      name: 'Backup Request and Resource Allocation',
      description: 'Dynamic resource coordination for field units requiring additional support',
      module: 'police',
      steps: [
        { stage: 'backup_request', role: 'Police Operator', description: 'Situational assessment and structured backup request', status: 'completed' },
        { stage: 'resource_coordination', role: 'Police Dispatcher', description: 'Available resource identification and deployment planning', sla: '2 minutes', status: 'current' },
        { stage: 'approval_deployment', role: 'Police Supervisor', description: 'Strategic approval and multi-unit coordination', sla: '8 minutes', status: 'pending' }
      ]
    },
    {
      id: 'performance-tracking',
      name: 'Unit Performance and Communication',
      description: 'Continuous performance monitoring and communication hub management',
      module: 'police',
      steps: [
        { stage: 'performance_tracking', role: 'Police Operator', description: 'Real-time activity logging and self-assessment', status: 'completed' },
        { stage: 'communication_hub', role: 'Police Dispatcher', description: 'Central coordination and message routing', status: 'current' },
        { stage: 'performance_analysis', role: 'Police Supervisor', description: 'Evaluation and improvement identification', status: 'pending' },
        { stage: 'strategic_management', role: 'Police Admin', description: 'System-wide analysis and policy development', status: 'pending' }
      ]
    }
  ];

  const integrationWorkflows: Workflow[] = [
    {
      id: 'emergency-address-verification',
      name: 'Emergency Address Verification',
      description: 'Cross-module coordination for urgent address verification during police incidents',
      module: 'integration',
      steps: [
        { stage: 'emergency_location', role: 'Police Dispatcher', description: 'Unverified location during emergency incident', status: 'completed' },
        { stage: 'expedited_verification', role: 'Address Verifier', description: 'Fast-track verification with field coordination', sla: '30 minutes', status: 'current' },
        { stage: 'emergency_publication', role: 'Address Registrar', description: 'Immediate registry update with emergency UAC', sla: '15 minutes', status: 'pending' },
        { stage: 'operational_integration', role: 'Police Operations', description: 'Integration into active incident management', status: 'pending' }
      ]
    },
    {
      id: 'intelligence-sharing',
      name: 'Intelligence Sharing and Data Integration',
      description: 'Cross-module analytics and intelligence generation for operational optimization',
      module: 'integration',
      steps: [
        { stage: 'data_collection', role: 'Data Analysts', description: 'Cross-module data harvesting and pattern recognition', status: 'completed' },
        { stage: 'intelligence_generation', role: 'System Administrators', description: 'Strategic insights and optimization recommendations', status: 'current' },
        { stage: 'operational_optimization', role: 'Operations Teams', description: 'Implementation and performance monitoring', status: 'pending' }
      ]
    }
  ];

  const getAllWorkflows = () => {
    switch (activeModule) {
      case 'address':
        return addressWorkflows;
      case 'police':
        return policeWorkflows;
      case 'integration':
        return integrationWorkflows;
      default:
        return addressWorkflows;
    }
  };

  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'address':
        return <MapPin className="h-4 w-4" />;
      case 'police':
        return <Shield className="h-4 w-4" />;
      case 'integration':
        return <Zap className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const getStageIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'current':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-gray-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'current':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            System Workflow Documentation
          </CardTitle>
          <p className="text-muted-foreground">
            Comprehensive overview of workflows across address registry, police operations, and cross-module integration
          </p>
        </CardHeader>
      </Card>

      <Tabs value={activeModule} onValueChange={(value) => setActiveModule(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="address" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Address Registry
          </TabsTrigger>
          <TabsTrigger value="police" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Police Operations
          </TabsTrigger>
          <TabsTrigger value="integration" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Cross-Module Integration
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeModule} className="space-y-6">
          {getAllWorkflows().map((workflow) => (
            <Card key={workflow.id} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getModuleIcon(workflow.module)}
                    <div>
                      <CardTitle className="text-lg">{workflow.name}</CardTitle>
                      <p className="text-muted-foreground text-sm">{workflow.description}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {workflow.module}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {workflow.steps.map((step, stepIndex) => (
                    <div key={stepIndex} className="flex items-start gap-4 p-4 rounded-lg border transition-all hover:shadow-md">
                      <div className="flex items-center gap-2 min-w-0">
                        {getStageIcon(step.status)}
                        <Badge className={`${getStatusColor(step.status)} whitespace-nowrap`}>
                          {step.role}
                        </Badge>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium mb-1">{step.description}</p>
                        {step.sla && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>SLA: {step.sla}</span>
                          </div>
                        )}
                      </div>
                      {stepIndex < workflow.steps.length - 1 && (
                        <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Module Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Module Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h4 className="font-semibold">Address Registry</h4>
              <p className="text-2xl font-bold text-primary">{addressWorkflows.length}</p>
              <p className="text-sm text-muted-foreground">Core Workflows</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Shield className="h-8 w-8 text-destructive" />
              </div>
              <h4 className="font-semibold">Police Operations</h4>
              <p className="text-2xl font-bold text-destructive">{policeWorkflows.length}</p>
              <p className="text-sm text-muted-foreground">Core Workflows</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Zap className="h-8 w-8 text-secondary" />
              </div>
              <h4 className="font-semibold">Integration</h4>
              <p className="text-2xl font-bold text-secondary">{integrationWorkflows.length}</p>
              <p className="text-sm text-muted-foreground">Integration Workflows</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};