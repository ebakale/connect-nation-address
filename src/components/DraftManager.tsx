import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Edit, Trash2, Send, MapPin, Clock, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AddressCaptureForm } from "./AddressCaptureForm";

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
  verified: boolean;
  public: boolean;
  created_at: string;
  updated_at: string;
}

interface DraftManagerProps {
  onClose?: () => void;
}

const DraftManager = ({ onClose }: DraftManagerProps) => {
  const { user } = useAuth();
  const [drafts, setDrafts] = useState<DraftAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDraft, setEditingDraft] = useState<DraftAddress | null>(null);
  const [submitting, setSubmitting] = useState<string | null>(null);

  const fetchDrafts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .or('verified.is.false,public.is.false')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDrafts(data || []);
    } catch (error) {
      console.error('Error fetching drafts:', error);
      toast.error('Failed to load drafts');
    } finally {
      setLoading(false);
    }
  };

  const submitDraft = async (draftId: string) => {
    setSubmitting(draftId);
    try {
      const { error } = await supabase
        .from('addresses')
        .update({ 
          verified: false, // Still needs verification by staff
          public: false,   // Will be made public after verification
          updated_at: new Date().toISOString()
        })
        .eq('id', draftId);

      if (error) throw error;
      
      toast.success('Draft submitted for verification');
      fetchDrafts(); // Refresh the list
    } catch (error) {
      console.error('Error submitting draft:', error);
      toast.error('Failed to submit draft');
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
      
      toast.success('Draft deleted');
      fetchDrafts(); // Refresh the list
    } catch (error) {
      console.error('Error deleting draft:', error);
      toast.error('Failed to delete draft');
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-lg">Loading drafts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">My Drafts</h2>
          <p className="text-muted-foreground">
            Manage your draft addresses before submission
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{drafts.length} draft(s)</Badge>
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          )}
        </div>
      </div>

      {drafts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No drafts yet</h3>
            <p className="text-muted-foreground">
              Start capturing addresses to see your drafts here
            </p>
          </CardContent>
        </Card>
      ) : (
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
                    {draft.address_type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Created {new Date(draft.created_at).toLocaleDateString()}
                  </div>
                  
                  {draft.description && (
                    <p className="text-sm text-muted-foreground">
                      {draft.description}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setEditingDraft(draft)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Edit Draft Address</DialogTitle>
                          <DialogDescription>
                            Update the address details before submission
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
                      {submitting === draft.id ? 'Submitting...' : 'Submit'}
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Draft</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this draft? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteDraft(draft.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
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