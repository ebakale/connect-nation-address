import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Calendar,
  User,
  Download
} from 'lucide-react';
import { useResidencyVerification } from '@/hooks/useResidencyVerification';
import { format } from 'date-fns';

export const ResidencyVerificationDashboard = () => {
  const { verifications, loading, legalFramework } = useResidencyVerification();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'under_investigation':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default:
        return <FileText className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'under_investigation':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="w-6 h-6" />
        <h2 className="text-2xl font-bold">Residency & Ownership Verification</h2>
      </div>

      <Tabs defaultValue="verifications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="verifications">My Verifications</TabsTrigger>
          <TabsTrigger value="legal">Legal Framework</TabsTrigger>
        </TabsList>

        <TabsContent value="verifications" className="space-y-4">
          {verifications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Verification Requests</h3>
                <p className="text-muted-foreground">
                  You haven't submitted any residency or ownership verification requests yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {verifications.map((verification) => (
                <Card key={verification.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {getStatusIcon(verification.status)}
                          {formatStatus(verification.verification_type)} Verification
                        </CardTitle>
                        <CardDescription>
                          Submitted {format(new Date(verification.created_at), 'PPP')}
                        </CardDescription>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={getStatusColor(verification.status)}
                      >
                        {formatStatus(verification.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Claimant Type</p>
                          <p className="text-sm text-muted-foreground">
                            {formatStatus(verification.claimant_relationship)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Document Type</p>
                          <p className="text-sm text-muted-foreground">
                            {formatStatus(verification.primary_document_type)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Privacy Level</p>
                          <p className="text-sm text-muted-foreground">
                            {formatStatus(verification.privacy_level)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {verification.verification_notes && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-1">Verification Notes</p>
                        <p className="text-sm text-muted-foreground">
                          {verification.verification_notes}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Consent Given: {verification.consent_given ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="legal" className="space-y-4">
          {legalFramework ? (
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Legal Compliance Framework</CardTitle>
                  <CardDescription>
                    Jurisdiction: {legalFramework.jurisdiction}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Applicable Laws</h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {legalFramework.applicable_laws.map((law: string, index: number) => (
                        <li key={index} className="text-muted-foreground">{law}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Privacy Regulations</h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {legalFramework.privacy_regulations.map((reg: string, index: number) => (
                        <li key={index} className="text-muted-foreground">{reg}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Consent Requirements</h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {legalFramework.consent_requirements.map((req: string, index: number) => (
                        <li key={index} className="text-muted-foreground">{req}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center gap-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        Data Retention: {Math.floor(legalFramework.data_retention_period / 365)} years
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Active Framework</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Legal Framework Loading</h3>
                <p className="text-muted-foreground">
                  Loading legal compliance framework...
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};