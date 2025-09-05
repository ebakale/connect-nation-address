import React from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

interface WorkflowStep {
  stage: string;
  role: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
}

export const WorkflowManager: React.FC = () => {
  const { role, getWorkflowStage, canAccessLocation } = useUserRole();

  const typicalWorkflows = [
    {
      name: 'Standard Address Creation',
      description: 'Citizen → Field Agent → Verifier → Registrar',
      steps: [
        { stage: 'submit_request', role: 'Citizen', description: 'Submits new place request', status: 'completed' as const },
        { stage: 'capture_draft', role: 'Field Agent', description: 'Captures draft + photos', status: 'current' as const },
        { stage: 'verify', role: 'Verifier', description: 'Resolves duplicates and verifies', status: 'pending' as const },
        { stage: 'publish', role: 'Registrar', description: 'Publishes to provincial registry', status: 'pending' as const }
      ]
    },
    {
      name: 'Partner Bulk Update',
      description: 'Utility → Data Steward → Verifier → Registrar',
      steps: [
        { stage: 'bulk_upload', role: 'Partner (Utility)', description: 'Uploads hashed customer refs with coordinates', status: 'completed' as const },
        { stage: 'qa_review', role: 'Data Steward', description: 'Runs quality assurance checks', status: 'current' as const },
        { stage: 'batch_verify', role: 'Verifier', description: 'Batch-approves subset', status: 'pending' as const },
        { stage: 'bulk_publish', role: 'Registrar', description: 'Publishes approved addresses', status: 'pending' as const }
      ]
    },
    {
      name: 'Emergency Fast-Track',
      description: 'EMS → Verifier → Registrar → Partner Webhook',
      steps: [
        { stage: 'emergency_flag', role: 'Partner (EMS)', description: 'Flags critical location', status: 'completed' as const },
        { stage: 'priority_verify', role: 'Verifier', description: 'Prioritizes review within SLA', status: 'current' as const },
        { stage: 'fast_publish', role: 'Registrar', description: 'Publishes within emergency SLA', status: 'pending' as const },
        { stage: 'webhook_confirm', role: 'Partner', description: 'Webhook confirms activation', status: 'pending' as const }
      ]
    }
  ];

  const currentStage = getWorkflowStage();

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
        return 'bg-green-100 text-green-800';
      case 'current':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Workflow Status</CardTitle>
          <CardDescription>
            Your current role and position in the address management workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-sm whitespace-nowrap">
              Current Role: {role ? role.replace('_', ' ').toUpperCase() : 'Not Assigned'}
            </Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline" className="text-sm whitespace-nowrap">
              Workflow Stage: {currentStage.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {typicalWorkflows.map((workflow, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg">{workflow.name}</CardTitle>
              <CardDescription>{workflow.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workflow.steps.map((step, stepIndex) => (
                  <div key={stepIndex} className="flex items-center gap-4 p-3 rounded-lg border">
                    <div className="flex items-center gap-2">
                      {getStageIcon(step.status)}
                      <Badge className={getStatusColor(step.status)}>
                        {step.role}
                      </Badge>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{step.description}</p>
                    </div>
                    {stepIndex < workflow.steps.length - 1 && (
                      <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ABAC Examples</CardTitle>
          <CardDescription>
            Attribute-Based Access Control with geographic scoping
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Verifier Geographic Scope</h4>
            <p className="text-sm text-blue-700">
              Verifier {'{district: MAL}'} can verify only addresses where hierarchy.district == MAL
            </p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Partner API Scope</h4>
            <p className="text-sm text-green-700">
              Partner {'{org: EMS, scope: read_verified}'} gets priority reads and event webhooks but no writes
            </p>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">Your Geographic Access</h4>
            <p className="text-sm text-purple-700">
              {canAccessLocation('TEST_DISTRICT', 'TEST_PROVINCE') 
                ? 'You have access to test geographic locations' 
                : 'Your access is limited by geographic scope'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};