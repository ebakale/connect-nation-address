import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Users, Shield, MapPin, CheckCircle, Clock, Search, 
  UserPlus, Mail, RefreshCw, Eye
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';

interface CARVerifier {
  userId: string;
  email: string;
  fullName: string;
  verificationDomain: string;
  geographicScope: string | null;
  scopeType: string | null;
  totalVerifications: number;
  pendingVerifications: number;
  approvedVerifications: number;
  rejectedVerifications: number;
  lastActivity: string | null;
}

export function CARVerifierDirectory() {
  const { toast } = useToast();
  const { t } = useTranslation(['admin', 'common']);
  const [verifiers, setVerifiers] = useState<CARVerifier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [requestReason, setRequestReason] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);

  useEffect(() => {
    fetchCARVerifiers();
  }, []);

  const fetchCARVerifiers = async () => {
    setLoading(true);
    try {
      // Get all users with verifier role and CAR domain
      const { data: verifierRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          user_role_metadata (
            scope_type,
            scope_value
          )
        `)
        .eq('role', 'verifier');

      if (rolesError) throw rolesError;

      // Filter for CAR domain verifiers
      const carVerifierIds: string[] = [];
      const verifierMetadata: Record<string, { domain: string; scopeType: string | null; scopeValue: string | null }> = {};

      verifierRoles?.forEach(role => {
        const metadata = role.user_role_metadata as any[];
        let hasCARDomain = false;
        let domain = '';
        let scopeType: string | null = null;
        let scopeValue: string | null = null;

        metadata?.forEach((m: any) => {
          if (m.scope_type === 'verification_domain') {
            if (m.scope_value === 'car' || m.scope_value === 'both') {
              hasCARDomain = true;
              domain = m.scope_value;
            }
          } else if (['city', 'region', 'province', 'national'].includes(m.scope_type)) {
            scopeType = m.scope_type;
            scopeValue = m.scope_value;
          }
        });

        if (hasCARDomain) {
          carVerifierIds.push(role.user_id);
          verifierMetadata[role.user_id] = { domain, scopeType, scopeValue };
        }
      });

      if (carVerifierIds.length === 0) {
        setVerifiers([]);
        setLoading(false);
        return;
      }

      // Get profile information
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, email, full_name')
        .in('user_id', carVerifierIds);

      if (profilesError) throw profilesError;

      // Get verification stats for each verifier
      const { data: verificationStats, error: statsError } = await supabase
        .from('residency_ownership_verifications')
        .select('verified_by, status, verified_at')
        .in('verified_by', carVerifierIds);

      if (statsError) throw statsError;

      // Compile verifier data
      const verifierData: CARVerifier[] = profiles?.map(profile => {
        const metadata = verifierMetadata[profile.user_id];
        const userVerifications = verificationStats?.filter(v => v.verified_by === profile.user_id) || [];
        
        const lastVerification = userVerifications
          .filter(v => v.verified_at)
          .sort((a, b) => new Date(b.verified_at!).getTime() - new Date(a.verified_at!).getTime())[0];

        return {
          userId: profile.user_id,
          email: profile.email || '',
          fullName: profile.full_name || t('common:unknownUser'),
          verificationDomain: metadata?.domain || 'car',
          geographicScope: metadata?.scopeValue,
          scopeType: metadata?.scopeType,
          totalVerifications: userVerifications.length,
          pendingVerifications: userVerifications.filter(v => v.status === 'pending').length,
          approvedVerifications: userVerifications.filter(v => v.status === 'approved').length,
          rejectedVerifications: userVerifications.filter(v => v.status === 'rejected').length,
          lastActivity: lastVerification?.verified_at || null
        };
      }) || [];

      setVerifiers(verifierData);
    } catch (error) {
      console.error('Error fetching CAR verifiers:', error);
      toast({
        title: t('common:error'),
        description: t('admin:verifierDirectory.fetchError'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestVerifier = async () => {
    if (!requestReason.trim()) {
      toast({
        title: t('common:error'),
        description: t('admin:verifierDirectory.pleaseProvideReason'),
        variant: "destructive"
      });
      return;
    }

    setSubmittingRequest(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get current user's profile for the request
      const { data: requesterProfile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('user_id', user.id)
        .single();

      // Get all system admins to notify
      const { data: adminRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      const adminIds = adminRoles?.map(r => r.user_id) || [];

      // Create notifications for all admins
      if (adminIds.length > 0) {
        const notifications = adminIds.map(adminId => ({
          user_id: adminId,
          title: t('admin:verifierDirectory.notificationTitle'),
          message: t('admin:verifierDirectory.notificationMessage', {
            requester: requesterProfile?.full_name || requesterProfile?.email || user.email,
            reason: requestReason
          }),
          type: 'verifier_request',
          priority_level: 2,
          metadata: {
            requester_id: user.id,
            requester_email: requesterProfile?.email || user.email,
            requester_name: requesterProfile?.full_name,
            request_reason: requestReason,
            domain: 'car'
          }
        }));

        const { error: notifyError } = await supabase
          .from('emergency_notifications')
          .insert(notifications);

        if (notifyError) throw notifyError;
      }

      toast({
        title: t('common:success'),
        description: t('admin:verifierDirectory.requestSent')
      });

      setRequestDialogOpen(false);
      setRequestReason('');
    } catch (error) {
      console.error('Error sending verifier request:', error);
      toast({
        title: t('common:error'),
        description: t('admin:verifierDirectory.requestError'),
        variant: "destructive"
      });
    } finally {
      setSubmittingRequest(false);
    }
  };

  const filteredVerifiers = verifiers.filter(v =>
    v.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (v.geographicScope?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getDomainBadge = (domain: string) => {
    if (domain === 'both') {
      return <Badge variant="default" className="bg-purple-600">{t('admin:verifierDirectory.domainBoth')}</Badge>;
    }
    return <Badge variant="secondary">{t('admin:verifierDirectory.domainCAR')}</Badge>;
  };

  const getScopeBadge = (scopeType: string | null, scopeValue: string | null) => {
    if (!scopeType) {
      return <Badge variant="outline">{t('admin:verifierDirectory.scopeNational')}</Badge>;
    }
    return (
      <Badge variant="outline" className="capitalize">
        {scopeValue || scopeType}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">{t('common:loading')}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t('admin:verifierDirectory.title')}
              </CardTitle>
              <CardDescription>
                {t('admin:verifierDirectory.description')}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchCARVerifiers}>
                <RefreshCw className="h-4 w-4 mr-2" />
                {t('common:buttons.refresh')}
              </Button>
              <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    {t('admin:verifierDirectory.requestVerifier')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('admin:verifierDirectory.requestDialogTitle')}</DialogTitle>
                    <DialogDescription>
                      {t('admin:verifierDirectory.requestDialogDescription')}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        {t('admin:verifierDirectory.reasonLabel')}
                      </label>
                      <Textarea
                        value={requestReason}
                        onChange={(e) => setRequestReason(e.target.value)}
                        placeholder={t('admin:verifierDirectory.reasonPlaceholder')}
                        rows={4}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setRequestDialogOpen(false)}>
                      {t('common:buttons.cancel')}
                    </Button>
                    <Button onClick={handleRequestVerifier} disabled={submittingRequest}>
                      {submittingRequest ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          {t('common:sending')}
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-2" />
                          {t('admin:verifierDirectory.sendRequest')}
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('admin:verifierDirectory.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{verifiers.length}</div>
              <div className="text-xs text-muted-foreground">{t('admin:verifierDirectory.totalVerifiers')}</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-600">
                {verifiers.reduce((sum, v) => sum + v.approvedVerifications, 0)}
              </div>
              <div className="text-xs text-muted-foreground">{t('admin:verifierDirectory.totalApproved')}</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {verifiers.reduce((sum, v) => sum + v.pendingVerifications, 0)}
              </div>
              <div className="text-xs text-muted-foreground">{t('admin:verifierDirectory.totalPending')}</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-red-600">
                {verifiers.reduce((sum, v) => sum + v.rejectedVerifications, 0)}
              </div>
              <div className="text-xs text-muted-foreground">{t('admin:verifierDirectory.totalRejected')}</div>
            </div>
          </div>

          {/* Verifiers List */}
          {filteredVerifiers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>{searchQuery ? t('admin:verifierDirectory.noMatchingVerifiers') : t('admin:verifierDirectory.noVerifiers')}</p>
              <p className="text-sm mt-1">{t('admin:verifierDirectory.requestVerifierHint')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredVerifiers.map((verifier) => (
                <div
                  key={verifier.userId}
                  className="border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{verifier.fullName}</div>
                        <div className="text-sm text-muted-foreground">{verifier.email}</div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {getDomainBadge(verifier.verificationDomain)}
                          {getScopeBadge(verifier.scopeType, verifier.geographicScope)}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>{verifier.approvedVerifications}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-yellow-600" />
                        <span>{verifier.pendingVerifications}</span>
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {verifier.lastActivity ? (
                          <span>
                            {t('admin:verifierDirectory.lastActive')}: {new Date(verifier.lastActivity).toLocaleDateString()}
                          </span>
                        ) : (
                          <span>{t('admin:verifierDirectory.noActivity')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Eye className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">{t('admin:verifierDirectory.readOnlyNotice')}</p>
              <p>{t('admin:verifierDirectory.readOnlyDescription')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
