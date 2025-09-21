import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle, Clock, AlertTriangle, User, Home, 
  FileText, Eye, Settings, Users, Shield 
} from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from '@/hooks/useUserRole';
import { CitizenAddress } from '@/types/car';
import { CARAutoApprovalStats } from './CARAutoApprovalStats';
import { useTranslation } from 'react-i18next';

interface CARVerificationWorkflowProps {
  onUpdate?: () => void;
}

export function CARVerificationWorkflow({ onUpdate }: CARVerificationWorkflowProps) {
  const [pendingAddresses, setPendingAddresses] = useState<CitizenAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useTranslation(['admin', 'common']);
  const { hasCARAccess, hasCARManagementAccess } = useUserRole();

  useEffect(() => {
    if (hasCARAccess) {
      fetchPendingAddresses();
    }
  }, [hasCARAccess]);

  const fetchPendingAddresses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('citizen_address_manual_review_queue')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingAddresses((data || []) as CitizenAddress[]);
    } catch (error) {
      console.error('Error fetching pending addresses:', error);
      toast({
        title: t('common:error'),
        description: t('admin:carWorkflow.toastMessages.fetchError'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (addressId: string, newStatus: 'CONFIRMED' | 'REJECTED') => {
    if (!hasCARAccess) {
      toast({
        title: t('common:error'),
        description: t('admin:carWorkflow.toastMessages.accessDeniedMessage'),
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.rpc('set_citizen_address_status', {
        p_address_id: addressId,
        p_status: newStatus
      });

      if (error) throw error;

      toast({
        title: t('common:success'),
        description: t('admin:carWorkflow.toastMessages.statusUpdateSuccess', { status: newStatus.toLowerCase() }),
      });

      await fetchPendingAddresses();
      onUpdate?.();
    } catch (error) {
      console.error('Error updating address status:', error);
      toast({
        title: t('common:error'),
        description: t('admin:carWorkflow.toastMessages.statusUpdateError'),
        variant: "destructive",
      });
    }
  };

  if (!hasCARAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t('admin:carWorkflow.title')}
          </CardTitle>
          <CardDescription>
            {t('admin:carWorkflow.accessDenied')}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <CARAutoApprovalStats />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('admin:carWorkflow.autoApprovalTitle')}
          </CardTitle>
          <CardDescription>
            {t('admin:carWorkflow.description')}
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">{t('admin:carWorkflow.manualReviewRequired')} ({pendingAddresses.length})</TabsTrigger>
          <TabsTrigger value="workflow">{t('admin:carWorkflow.autoApprovalGuide')}</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingAddresses.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">{t('admin:carWorkflow.noManualReviewsRequired')}</h3>
                <p className="text-muted-foreground">{t('admin:carWorkflow.allAddressesProcessed')}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingAddresses.map((address) => (
                <Card key={address.id} className="border-l-4 border-l-orange-500">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                         <CardTitle className="text-lg flex items-center gap-2">
                           <Home className="h-4 w-4" />
                           {address.address_kind} {t('admin:carWorkflow.addressDeclaration')}
                           <Badge variant="outline" className="bg-orange-50 text-orange-700">
                             {address.verification_status === 'UAC_NOT_FOUND' ? t('admin:carWorkflow.statusLabels.unknownUac') : t('admin:carWorkflow.statusLabels.unverifiedUac')}
                           </Badge>
                         </CardTitle>
                         <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                           {t('admin:carWorkflow.requiresManualReview')}
                         </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-700 border-green-700 hover:bg-green-50"
                          onClick={() => handleStatusUpdate(address.id!, 'CONFIRMED')}
                          disabled={!hasCARAccess}
                        >
                           <CheckCircle className="h-4 w-4 mr-1" />
                           {t('admin:carWorkflow.confirm')}
                         </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-700 border-red-700 hover:bg-red-50"
                          onClick={() => handleStatusUpdate(address.id!, 'REJECTED')}
                          disabled={!hasCARAccess}
                        >
                           <AlertTriangle className="h-4 w-4 mr-1" />
                           {t('admin:carWorkflow.reject')}
                         </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                         <h4 className="font-medium mb-2">{t('admin:carWorkflow.addressDetails')}</h4>
                         <div className="space-y-1 text-sm">
                           <p><span className="font-medium">{t('admin:carWorkflow.uac')}:</span> {address.uac}</p>
                           <p><span className="font-medium">{t('admin:carWorkflow.scope')}:</span> {address.scope}</p>
                           {address.unit_uac && (
                             <p><span className="font-medium">{t('admin:carWorkflow.unitUac')}:</span> {address.unit_uac}</p>
                           )}
                           <p><span className="font-medium">{t('admin:carWorkflow.occupantType')}:</span> {address.occupant}</p>
                         </div>
                      </div>
                      <div>
                         <h4 className="font-medium mb-2">{t('admin:carWorkflow.locationInformation')}</h4>
                         <div className="space-y-1 text-sm">
                           {address.street && <p><span className="font-medium">{t('admin:carWorkflow.street')}:</span> {address.street}</p>}
                           {address.city && <p><span className="font-medium">{t('admin:carWorkflow.city')}:</span> {address.city}</p>}
                           {address.region && <p><span className="font-medium">{t('admin:carWorkflow.region')}:</span> {address.region}</p>}
                           {address.latitude && address.longitude && (
                             <p><span className="font-medium">{t('admin:carWorkflow.coordinates')}:</span> {address.latitude}, {address.longitude}</p>
                           )}
                         </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground border-t pt-4">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                         <span>{t('admin:carWorkflow.personId')}: {address.person_id?.slice(0, 8)}...</span>
                       </div>
                       <div className="flex items-center gap-1">
                         <Clock className="h-3 w-3" />
                         <span>{t('admin:carWorkflow.declared')}: {new Date(address.created_at!).toLocaleDateString()}</span>
                       </div>
                       <div className="flex items-center gap-1">
                         <FileText className="h-3 w-3" />
                         <span>{t('admin:carWorkflow.source')}: {address.source}</span>
                       </div>
                    </div>

                    {address.notes && (
                      <div className="bg-muted/50 p-3 rounded-lg">
                         <h5 className="font-medium text-sm mb-1">{t('admin:carWorkflow.notes')}</h5>
                        <p className="text-sm text-muted-foreground">{address.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="workflow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin:carWorkflow.autoApprovalProcess.title')}</CardTitle>
              <CardDescription>{t('admin:carWorkflow.autoApprovalProcess.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-green-50 p-4 rounded-lg mb-6">
                <h4 className="font-medium text-green-900 mb-2">{t('admin:carWorkflow.autoApprovalProcess.automaticProcessingTitle')}</h4>
                <p className="text-sm text-green-700">
                  {t('admin:carWorkflow.autoApprovalProcess.automaticProcessingDescription')}
                </p>
              </div>

              <div className="grid gap-4">
                <div className="flex gap-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-medium text-sm">1</div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">{t('admin:carWorkflow.autoApprovalProcess.step1Title')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t('admin:carWorkflow.autoApprovalProcess.step1Description')}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center font-medium text-sm">2</div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">{t('admin:carWorkflow.autoApprovalProcess.step2Title')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t('admin:carWorkflow.autoApprovalProcess.step2Description')}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-medium text-sm">3</div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">{t('admin:carWorkflow.autoApprovalProcess.step3Title')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t('admin:carWorkflow.autoApprovalProcess.step3Description')}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-medium text-sm">4</div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">{t('admin:carWorkflow.autoApprovalProcess.step4Title')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t('admin:carWorkflow.autoApprovalProcess.step4Description')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">{t('admin:carWorkflow.autoApprovalProcess.benefitsTitle')}</h4>
                <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                  <li>{t('admin:carWorkflow.autoApprovalProcess.benefit1')}</li>
                  <li>{t('admin:carWorkflow.autoApprovalProcess.benefit2')}</li>
                  <li>{t('admin:carWorkflow.autoApprovalProcess.benefit3')}</li>
                  <li>{t('admin:carWorkflow.autoApprovalProcess.benefit4')}</li>
                  <li>{t('admin:carWorkflow.autoApprovalProcess.benefit5')}</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}