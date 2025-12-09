import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Edit, Trash2, Send, MapPin, Clock, X, Eye } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AddressCaptureForm } from "./AddressCaptureForm";
import { useTranslation } from 'react-i18next';

interface DraftAddress {
  id: string;
  country: string;
  region: string;
  city: string;
  street: string;
  building?: string;
  address_type: string;
  latitude: number;
  longitude: number;
  description?: string;
  photo_url?: string;
  verified: boolean;
  public: boolean;
  created_at: string;
  updated_at: string;
}

interface AddressRequest {
  id: string;
  country: string;
  region: string;
  city: string;
  street: string;
  building?: string;
  address_type: string;
  latitude: number | null;
  longitude: number | null;
  description?: string;
  photo_url?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface DraftManagerProps {
  onClose?: () => void;
}

const DraftManager = ({ onClose }: DraftManagerProps) => {
  const { user } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const { t } = useTranslation(['dashboard', 'address']);
  const [drafts, setDrafts] = useState<DraftAddress[]>([]);
  const [pendingRequests, setPendingRequests] = useState<AddressRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDraft, setEditingDraft] = useState<DraftAddress | null>(null);
  const [submitting, setSubmitting] = useState<string | null>(null);

  const isFieldAgent = role === 'field_agent';

  const fetchDrafts = async () => {
    if (!user) return;

    try {
      if (isFieldAgent) {
        // Field agents see their pending address requests
        const { data, error } = await supabase
          .from('address_requests')
          .select('id, country, region, city, street, building, latitude, longitude, address_type, description, photo_url, status, created_at, updated_at')
          .eq('requester_id', user.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPendingRequests(data || []);
        setDrafts([]);
      } else {
        // NAR authorities see their draft addresses
        const { data, error } = await supabase
          .from('addresses')
          .select('id, uac, country, region, city, street, building, latitude, longitude, address_type, description, verified, public, photo_url, created_at, updated_at')
          .eq('created_by_authority', user.id)
          .or('verified.is.false,public.is.false')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setDrafts(data || []);
        setPendingRequests([]);
      }
    } catch (error) {
      console.error('Error fetching drafts:', error);
      toast.error(t('dashboard:drafts.failedToLoadDrafts'));
    } finally {
      setLoading(false);
    }
  };

  const submitDraft = async (draftId: string) => {
    setSubmitting(draftId);
    try {
      const draft = drafts.find(d => d.id === draftId);
      if (!draft) {
        toast.error(t('dashboard:drafts.failedToSubmitDraft'));
        setSubmitting(null);
        return;
      }

      // Create an address request from the draft and remove the draft from addresses
      const { error: insertError } = await supabase
        .from('address_requests')
        .insert({
          requester_id: user?.id,
          latitude: draft.latitude,
          longitude: draft.longitude,
          street: draft.street,
          city: draft.city,
          region: draft.region,
          country: draft.country,
          building: draft.building,
          address_type: draft.address_type,
          description: draft.description,
          photo_url: draft.photo_url || null,
          status: 'pending',
          justification: 'Submitted by NAR authority for approval'
        });

      if (insertError) throw insertError;

      const { error: deleteError } = await supabase
        .from('addresses')
        .delete()
        .eq('id', draftId);
      
      toast.success(t('dashboard:drafts.draftSubmitted'));
      fetchDrafts(); // Refresh the list
    } catch (error) {
      console.error('Error submitting draft:', error);
      toast.error(t('dashboard:drafts.failedToSubmitDraft'));
    } finally {
      setSubmitting(null);
    }
  };

  const deleteDraft = async (draftId: string) => {
    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', draftId);

      if (error) throw error;
      
      toast.success(t('dashboard:drafts.draftDeleted'));
      fetchDrafts(); // Refresh the list
    } catch (error) {
      console.error('Error deleting draft:', error);
      toast.error(t('dashboard:drafts.failedToDeleteDraft'));
    }
  };

  useEffect(() => {
    if (!roleLoading) {
      fetchDrafts();
    }
  }, [user, role, roleLoading]);

  if (loading || roleLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-lg">{t('dashboard:drafts.loadingDrafts')}</div>
      </div>
    );
  }

  const itemCount = isFieldAgent ? pendingRequests.length : drafts.length;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">
            {isFieldAgent ? t('dashboard:drafts.pendingSubmissions') : t('dashboard:drafts.myDrafts')}
          </h2>
          <p className="text-muted-foreground">
            {isFieldAgent 
              ? t('dashboard:drafts.pendingSubmissionsDescription')
              : t('dashboard:drafts.manageDraftAddresses')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {isFieldAgent 
              ? t('dashboard:drafts.pendingCount', { count: itemCount })
              : t('dashboard:drafts.draftsCount', { count: itemCount })}
          </Badge>
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              {t('dashboard:drafts.close')}
            </Button>
          )}
        </div>
      </div>

      {itemCount === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {isFieldAgent ? t('dashboard:drafts.noPendingSubmissions') : t('dashboard:drafts.noDraftsYet')}
            </h3>
            <p className="text-muted-foreground">
              {t('dashboard:drafts.startCapturingAddresses')}
            </p>
          </CardContent>
        </Card>
      ) : isFieldAgent ? (
        // Field Agent view - pending requests
        <div className="grid gap-4">
          {pendingRequests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {request.street}{request.building && `, ${request.building}`}
                    </CardTitle>
                    <CardDescription>
                      {request.city}, {request.region}, {request.country}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary">
                      {t(`address:addressTypes.${request.address_type?.toLowerCase()}`, request.address_type)}
                    </Badge>
                    <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                      {t('dashboard:drafts.pendingReview')}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {t('dashboard:drafts.submitted', { date: new Date(request.created_at).toLocaleDateString() })}
                  </div>
                  
                  {request.description && (
                    <p className="text-sm text-muted-foreground">
                      {request.description}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled>
                      <Eye className="h-4 w-4 mr-2" />
                      {t('dashboard:drafts.awaitingReview')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // NAR Authority view - draft addresses
        <div className="grid gap-4">
          {drafts.map((draft) => (
            <Card key={draft.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {draft.street}{draft.building && `, ${draft.building}`}
                    </CardTitle>
                    <CardDescription>
                      {draft.city}, {draft.region}, {draft.country}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    {t(`address:addressTypes.${draft.address_type?.toLowerCase()}`, draft.address_type)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {t('dashboard:drafts.created', { date: new Date(draft.created_at).toLocaleDateString() })}
                  </div>
                  
                  {draft.description && (
                    <p className="text-sm text-muted-foreground">
                      {draft.description}
                    </p>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setEditingDraft(draft)}>
                          <Edit className="h-4 w-4 mr-2" />
                          {t('dashboard:drafts.edit')}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{t('dashboard:drafts.editDraftAddress')}</DialogTitle>
                          <DialogDescription>
                            {t('dashboard:drafts.updateAddressDetails')}
                          </DialogDescription>
                        </DialogHeader>
                        {editingDraft && (
                          <AddressCaptureForm
                            initialData={editingDraft}
                            onSave={() => {
                              setEditingDraft(null);
                              fetchDrafts();
                            }}
                            onCancel={() => setEditingDraft(null)}
                          />
                        )}
                      </DialogContent>
                    </Dialog>

                    <Button 
                      size="sm" 
                      onClick={() => submitDraft(draft.id)}
                      disabled={submitting === draft.id}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {submitting === draft.id ? t('dashboard:drafts.submitting') : t('dashboard:drafts.submit')}
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t('dashboard:drafts.delete')}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('dashboard:drafts.deleteDraft')}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('dashboard:drafts.deleteDraftConfirm')}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('dashboard:drafts.cancel')}</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteDraft(draft.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {t('dashboard:drafts.delete')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DraftManager;
