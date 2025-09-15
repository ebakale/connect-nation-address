import React from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation(['admin']);
  const { role, getWorkflowStage, canAccessLocation } = useUserRole();

  const addressWorkflows = [
    {
      name: t('admin:standardAddressCreation'),
      description: t('admin:standardAddressCreationFlow'),
      steps: [
        { stage: 'submit_request', role: t('admin:roleLabels.citizen'), description: t('admin:stepDescriptions.submit_request'), status: 'completed' as const },
        { stage: 'capture_draft', role: t('admin:roleLabels.field_agent'), description: t('admin:stepDescriptions.capture_draft'), status: 'current' as const },
        { stage: 'verify', role: t('admin:roleLabels.verifier'), description: t('admin:stepDescriptions.verify'), status: 'pending' as const },
        { stage: 'publish', role: t('admin:roleLabels.registrar'), description: t('admin:stepDescriptions.publish'), status: 'pending' as const }
      ]
    },
    {
      name: t('admin:partnerBulkUpdate'),
      description: t('admin:partnerBulkUpdateFlow'),
      steps: [
        { stage: 'bulk_upload', role: t('admin:roleLabels.partnerUtility'), description: t('admin:stepDescriptions.bulk_upload'), status: 'completed' as const },
        { stage: 'qa_review', role: t('admin:roleLabels.data_steward'), description: t('admin:stepDescriptions.qa_review'), status: 'current' as const },
        { stage: 'batch_verify', role: t('admin:roleLabels.verifier'), description: t('admin:stepDescriptions.batch_verify'), status: 'pending' as const },
        { stage: 'bulk_publish', role: t('admin:roleLabels.registrar'), description: t('admin:stepDescriptions.bulk_publish'), status: 'pending' as const }
      ]
    },
    {
      name: t('admin:emergencyFastTrack'),
      description: t('admin:emergencyFastTrackFlow'),
      steps: [
        { stage: 'emergency_flag', role: t('admin:roleLabels.partnerEMS'), description: t('admin:stepDescriptions.emergency_flag'), status: 'completed' as const },
        { stage: 'priority_verify', role: t('admin:roleLabels.verifier'), description: t('admin:stepDescriptions.priority_verify'), status: 'current' as const },
        { stage: 'fast_publish', role: t('admin:roleLabels.registrar'), description: t('admin:stepDescriptions.fast_publish'), status: 'pending' as const },
        { stage: 'webhook_confirm', role: t('admin:roleLabels.partner'), description: t('admin:stepDescriptions.webhook_confirm'), status: 'pending' as const }
      ]
    }
  ];

  const policeWorkflows = [
    {
      name: 'Emergency Incident Response',
      description: 'Standard emergency response workflow from incident report to resolution',
      steps: [
        { stage: 'incident_report', role: 'Citizen/System', description: 'Emergency call received and incident created', status: 'completed' as const },
        { stage: 'dispatch_coordination', role: 'Police Dispatcher', description: 'Unit selection and dispatch coordination', status: 'current' as const },
        { stage: 'field_response', role: 'Police Operator', description: 'On-scene response and investigation', status: 'pending' as const },
        { stage: 'supervision_followup', role: 'Police Supervisor', description: 'Oversight and performance evaluation', status: 'pending' as const }
      ]
    },
    {
      name: 'Backup Request and Resource Allocation',
      description: 'Process for requesting and coordinating additional resources',
      steps: [
        { stage: 'backup_request', role: 'Police Operator', description: 'Field unit requests additional support', status: 'completed' as const },
        { stage: 'resource_coordination', role: 'Police Dispatcher', description: 'Evaluate request and identify resources', status: 'current' as const },
        { stage: 'approval_deployment', role: 'Police Supervisor', description: 'Approve allocation and monitor deployment', status: 'pending' as const }
      ]
    },
    {
      name: 'Cross-Module Emergency Address Verification',
      description: 'Fast-track address verification for emergency incidents',
      steps: [
        { stage: 'emergency_location_issue', role: 'Police Dispatcher', description: 'Unverified location reported during emergency', status: 'completed' as const },
        { stage: 'priority_verification', role: 'Address Verifier', description: 'Expedited address verification process', status: 'current' as const },
        { stage: 'emergency_publication', role: 'Address Registrar', description: 'Immediate registry update and UAC generation', status: 'pending' as const }
      ]
    }
  ];

  const allWorkflows = [...addressWorkflows, ...policeWorkflows];

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
          <CardTitle>{t('admin:workflowStatus')}</CardTitle>
          <CardDescription>
            {t('admin:currentRolePosition')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <Badge variant="secondary" className="text-sm whitespace-nowrap truncate max-w-[200px]">
              {t('admin:currentRole')}: {role ? t(`admin:roleLabels.${role}`, { defaultValue: role.replace('_', ' ') }) : t('admin:notAssigned')}
            </Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground hidden sm:block" />
            <Badge variant="outline" className="text-sm whitespace-nowrap max-w-[300px]">
              {t('admin:workflowStage')}: {t(`admin:workflowStages.${currentStage}`, { defaultValue: currentStage.replace('_', ' ') })}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {allWorkflows.map((workflow, index) => (
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
          <CardTitle>{t('admin:abacExamples')}</CardTitle>
          <CardDescription>
            {t('admin:attributeBasedAccessControl')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">{t('admin:verifierGeographicScope')}</h4>
            <p className="text-sm text-blue-700">
              {t('admin:verifierGeographicScopeDesc')}
            </p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">{t('admin:partnerApiScope')}</h4>
            <p className="text-sm text-green-700">
              {t('admin:partnerApiScopeDesc')}
            </p>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">{t('admin:yourGeographicAccess')}</h4>
            <p className="text-sm text-purple-700">
              {canAccessLocation('TEST_DISTRICT', 'TEST_PROVINCE') 
                ? t('admin:hasGeographicAccess')
                : t('admin:limitedGeographicAccess')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};