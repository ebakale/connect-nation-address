import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Shield, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Eye,
  Calendar,
  User,
  Search,
  Filter
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface VerificationRequest {
  id: string;
  user_id: string;
  verification_type: string;
  claimant_relationship: string;
  primary_document_type: string;
  primary_document_url?: string;
  status: string;
  consent_given: boolean;
  privacy_level: string;
  verification_notes?: string;
  created_at: string;
  verified_at?: string;
  verified_by?: string;
  profiles?: {
    full_name: string;
    email: string;
  } | null;
}

export const ResidencyVerificationManager = () => {
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [selectedVerification, setSelectedVerification] = useState<VerificationRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewStatus, setReviewStatus] = useState('');
  
  const { canVerifyAddresses, hasAdminAccess } = useUserRole();
  const { toast } = useToast();

  const fetchVerifications = async () => {
    if (!canVerifyAddresses && !hasAdminAccess) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('residency_ownership_verifications')
        .select(`
          *
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter as any);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // If we have verifications, fetch the associated profiles separately
      if (data && data.length > 0) {
        const userIds = data.map(v => v.user_id);
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name, email')
          .in('user_id', userIds);

        if (profilesError) throw profilesError;

        // Combine the data
        const combinedData = data.map(verification => {
          const profile = profiles?.find(p => p.user_id === verification.user_id);
          return {
            ...verification,
            profiles: profile || { full_name: 'Unknown User', email: 'Unknown Email' }
          };
        });
        
        setVerifications(combinedData as unknown as VerificationRequest[]);
      } else {
        setVerifications([]);
      }
    } catch (error) {
      console.error('Error fetching verifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch verification requests',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateVerificationStatus = async (verificationId: string, newStatus: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from('residency_ownership_verifications')
        .update({
          status: newStatus as any,
          verification_notes: notes,
          verified_by: newStatus !== 'pending' ? (await supabase.auth.getUser()).data.user?.id : null,
          verified_at: newStatus !== 'pending' ? new Date().toISOString() : null
        })
        .eq('id', verificationId);

      if (error) throw error;

      toast({
        title: 'Status Updated',
        description: `Verification status updated to ${newStatus}`,
      });

      await fetchVerifications();
      setSelectedVerification(null);
      setReviewNotes('');
      setReviewStatus('');
    } catch (error: any) {
      console.error('Error updating verification:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update verification status',
        variant: 'destructive'
      });
    }
  };

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

  const filteredVerifications = verifications.filter(verification => {
    const matchesSearch = !searchTerm || 
      verification.profiles?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.profiles?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.primary_document_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  useEffect(() => {
    fetchVerifications();
  }, [canVerifyAddresses, hasAdminAccess, statusFilter]);

  if (!canVerifyAddresses && !hasAdminAccess) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Access Denied</h3>
          <p className="text-muted-foreground">
            You don't have permission to manage verification requests.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6" />
          <h2 className="text-2xl font-bold">Verification Management</h2>
        </div>
        <Button onClick={fetchVerifications} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search by name, email, or document type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="statusFilter">Status Filter</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="document_review">Document Review</SelectItem>
              <SelectItem value="field_verification">Field Verification</SelectItem>
              <SelectItem value="legal_review">Legal Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="under_investigation">Under Investigation</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Verification Requests */}
      <div className="grid gap-4">
        {filteredVerifications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Verification Requests</h3>
              <p className="text-muted-foreground">
                No verification requests match your current filters.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredVerifications.map((verification) => (
            <Card key={verification.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(verification.status)}
                      {formatStatus(verification.verification_type)} Verification
                    </CardTitle>
                    <CardDescription>
                      Submitted by {verification.profiles?.full_name} ({verification.profiles?.email}) 
                      on {format(new Date(verification.created_at), 'PPP')}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={getStatusColor(verification.status)}
                    >
                      {formatStatus(verification.status)}
                    </Badge>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedVerification(verification)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Verification Request Review</DialogTitle>
                        </DialogHeader>
                        {selectedVerification && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Applicant</Label>
                                <p className="text-sm">{selectedVerification.profiles?.full_name}</p>
                                <p className="text-xs text-muted-foreground">{selectedVerification.profiles?.email}</p>
                              </div>
                              <div>
                                <Label>Verification Type</Label>
                                <p className="text-sm">{formatStatus(selectedVerification.verification_type)}</p>
                              </div>
                              <div>
                                <Label>Claimant Relationship</Label>
                                <p className="text-sm">{formatStatus(selectedVerification.claimant_relationship)}</p>
                              </div>
                              <div>
                                <Label>Document Type</Label>
                                <p className="text-sm">{formatStatus(selectedVerification.primary_document_type)}</p>
                              </div>
                              <div>
                                <Label>Privacy Level</Label>
                                <p className="text-sm">{formatStatus(selectedVerification.privacy_level)}</p>
                              </div>
                              <div>
                                <Label>Consent Given</Label>
                                <p className="text-sm">{selectedVerification.consent_given ? 'Yes' : 'No'}</p>
                              </div>
                            </div>

                            {selectedVerification.primary_document_url && (
                              <div>
                                <Label>Submitted Document</Label>
                                <div className="border rounded-lg p-4 bg-muted/50">
                                  <div className="flex items-center gap-2 mb-2">
                                    <FileText className="w-4 h-4" />
                                    <span className="text-sm font-medium">
                                      {formatStatus(selectedVerification.primary_document_type)}
                                    </span>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={async () => {
                                      try {
                                        // Extract the file path from the full URL
                                        const url = selectedVerification.primary_document_url!;
                                        const pathMatch = url.match(/\/storage\/v1\/object\/public\/residency-documents\/(.+)$/);
                                        if (pathMatch) {
                                          const filePath = pathMatch[1];
                                          const { data, error } = await supabase.storage
                                            .from('residency-documents')
                                            .createSignedUrl(filePath, 3600); // 1 hour expiry
                                          
                                          if (error) throw error;
                                          if (data?.signedUrl) {
                                            window.open(data.signedUrl, '_blank');
                                          }
                                        } else {
                                          // Fallback: try to open the URL directly
                                          window.open(url, '_blank');
                                        }
                                      } catch (error) {
                                        console.error('Error viewing document:', error);
                                        toast({
                                          title: 'Error',
                                          description: 'Failed to open document. Please try again.',
                                          variant: 'destructive'
                                        });
                                      }
                                    }}
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    View Document
                                  </Button>
                                </div>
                              </div>
                            )}

                            {selectedVerification.verification_notes && (
                              <div>
                                <Label>Current Notes</Label>
                                <p className="text-sm bg-muted p-2 rounded">
                                  {selectedVerification.verification_notes}
                                </p>
                              </div>
                            )}

                            <div className="space-y-2">
                              <Label htmlFor="reviewStatus">Update Status</Label>
                              <Select value={reviewStatus} onValueChange={setReviewStatus}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select new status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="document_review">Document Review</SelectItem>
                                  <SelectItem value="field_verification">Field Verification</SelectItem>
                                  <SelectItem value="legal_review">Legal Review</SelectItem>
                                  <SelectItem value="approved">Approved</SelectItem>
                                  <SelectItem value="rejected">Rejected</SelectItem>
                                  <SelectItem value="requires_additional_documents">Requires Additional Documents</SelectItem>
                                  <SelectItem value="under_investigation">Under Investigation</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="reviewNotes">Review Notes</Label>
                              <Textarea
                                id="reviewNotes"
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                                placeholder="Add notes about this review..."
                                rows={3}
                              />
                            </div>

                            <div className="flex gap-2">
                              <Button
                                onClick={() => updateVerificationStatus(selectedVerification.id, reviewStatus, reviewNotes)}
                                disabled={!reviewStatus}
                                className="flex-1"
                              >
                                Update Status
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
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
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Submitted</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(verification.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};