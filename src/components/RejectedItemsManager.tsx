import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle, RefreshCw, Eye, FileX, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AddressRequestForm } from "@/components/AddressRequestForm";

export const RejectedItemsManager = () => {
  const { toast } = useToast();
  const [rejectedItems, setRejectedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [resubmissionDialogOpen, setResubmissionDialogOpen] = useState(false);

  useEffect(() => {
    fetchRejectedItems();
  }, []);

  const fetchRejectedItems = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch rejected address requests
      const { data: rejectedRequests, error: requestsError } = await supabase
        .from('address_requests')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'rejected')
        .order('rejected_at', { ascending: false });

      if (requestsError) throw requestsError;

      // Fetch rejected addresses (addresses with rejection info)
      const { data: rejectedAddresses, error: addressesError } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .not('rejection_reason', 'is', null)
        .order('rejected_at', { ascending: false });

      if (addressesError) throw addressesError;

      // Combine and format the results
      const allRejected = [
        ...(rejectedRequests || []).map(item => ({ ...item, item_type: 'request' })),
        ...(rejectedAddresses || []).map(item => ({ ...item, item_type: 'address' }))
      ].sort((a, b) => new Date(b.rejected_at || b.updated_at).getTime() - new Date(a.rejected_at || a.updated_at).getTime());

      setRejectedItems(allRejected);
    } catch (error) {
      console.error('Failed to fetch rejected items:', error);
      toast({
        title: "Error",
        description: "Failed to load rejected items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewFeedback = (item: any) => {
    setSelectedItem(item);
    setFeedbackDialogOpen(true);
  };

  const handleResubmit = (item: any) => {
    setSelectedItem(item);
    setResubmissionDialogOpen(true);
  };

  if (loading) {
    return <div className="p-4">Loading rejected items...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FileX className="h-5 w-5 text-destructive" />
        <h3 className="text-lg font-semibold">Rejected Items ({rejectedItems.length})</h3>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={fetchRejectedItems}
          className="ml-auto"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Refresh
        </Button>
      </div>
      
      {rejectedItems.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No rejected items found</p>
          </CardContent>
        </Card>
      ) : (
        rejectedItems.map((item) => (
          <Card key={`${item.item_type}-${item.id}`} className="border-red-200 bg-red-50/30">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    {item.uac || `${item.item_type === 'request' ? 'Address Request' : 'Address'} Rejected`}
                  </CardTitle>
                  <CardDescription>
                    {item.building && `${item.building}, `}
                    {item.street}, {item.city}, {item.region}
                  </CardDescription>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="destructive">
                    Rejected
                  </Badge>
                  {item.resubmission_count > 0 && (
                    <Badge variant="outline">
                      Resubmission #{item.resubmission_count}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="font-medium">Type:</span> {(() => {
                    const v = item.address_type as string | undefined;
                    const hasBraces = v ? v.includes('{{') || v.includes('}}') : false;
                    const cleaned = v ? v.replace(/[{}]/g, '').trim() : '';
                    const safe = !v || hasBraces || cleaned.toLowerCase() === 'type' || cleaned === '' ? 'unknown' : cleaned;
                    return safe;
                  })()}
                </div>
                <div>
                  <span className="font-medium">Rejected:</span> {new Date(item.rejected_at || item.updated_at).toLocaleDateString()}
                </div>
              </div>

              {/* Rejection Reason */}
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-red-900">Rejection Reason</span>
                </div>
                <p className="text-sm text-red-800 font-medium">{item.rejection_reason}</p>
                {item.rejection_notes && (
                  <p className="text-sm text-red-700 mt-2">{item.rejection_notes}</p>
                )}
              </div>

              {/* Original Request Reference */}
              {item.resubmission_of && (
                <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                  Resubmission of previous request
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewFeedback(item)}
                  className="flex items-center gap-1"
                >
                  <MessageSquare className="h-4 w-4" />
                  View Detailed Feedback
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleResubmit(item)}
                  className="flex items-center gap-1"
                >
                  <RefreshCw className="h-4 w-4" />
                  Resubmit Corrected Version
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Rejection Feedback</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">
                  {selectedItem.building && `${selectedItem.building}, `}
                  {selectedItem.street}, {selectedItem.city}, {selectedItem.region}
                </p>
                {selectedItem.uac && (
                  <p className="text-sm text-muted-foreground">UAC: {selectedItem.uac}</p>
                )}
              </div>

              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-900 mb-2">Rejection Reason</h4>
                <p className="text-sm text-red-800">{selectedItem.rejection_reason}</p>
              </div>

              {selectedItem.rejection_notes && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-2">Additional Notes & Instructions</h4>
                  <p className="text-sm text-yellow-800">{selectedItem.rejection_notes}</p>
                </div>
              )}

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Next Steps</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Review the rejection reason and notes above</li>
                  <li>• Address the specific issues mentioned</li>
                  <li>• Use the "Resubmit" button to create a corrected version</li>
                  <li>• Ensure all required documentation is included</li>
                </ul>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setFeedbackDialogOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setFeedbackDialogOpen(false);
                  handleResubmit(selectedItem);
                }}>
                  Resubmit Now
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Resubmission Dialog */}
      <Dialog open={resubmissionDialogOpen} onOpenChange={setResubmissionDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Resubmit Corrected Address</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Previous Submission Details</h4>
                <p className="text-sm">
                  {selectedItem.building && `${selectedItem.building}, `}
                  {selectedItem.street}, {selectedItem.city}, {selectedItem.region}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Rejection: {selectedItem.rejection_reason}
                </p>
              </div>
              
              <AddressRequestForm
                onSuccess={() => {
                  setResubmissionDialogOpen(false);
                  setSelectedItem(null);
                  fetchRejectedItems();
                  toast({
                    title: "Success", 
                    description: "Address resubmitted successfully for review",
                  });
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};