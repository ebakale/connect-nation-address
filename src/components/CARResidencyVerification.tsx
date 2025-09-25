import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, FileText, CheckCircle, Clock, AlertTriangle, 
  Eye, Download, Upload, User, Home, Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface ResidencyVerification {
  id: string;
  user_id: string;
  verification_type: string;
  status: string;
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  documents_url?: string;
  verification_notes?: string;
  rejection_reason?: string;
  metadata?: any;
  // Profile information
  full_name?: string;
  email?: string;
}

export function CARResidencyVerification() {
  const { toast } = useToast();
  const { t } = useTranslation(['dashboard', 'address']);
  const [verifications, setVerifications] = useState<ResidencyVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedVerification, setSelectedVerification] = useState<ResidencyVerification | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewDialog, setReviewDialog] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    requires_documents: 0
  });

  useEffect(() => {
    fetchVerifications();
    fetchStats();
  }, [statusFilter, typeFilter]);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('residency_ownership_verifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter as any);
      }

      if (typeFilter !== 'all') {
        query = query.eq('verification_type', typeFilter as any);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Use the data as-is since we're not joining profiles for now
      setVerifications(data || []);
    } catch (error) {
      console.error('Error fetching verifications:', error);
      toast({
        title: t('dashboard:error'),
        description: 'Failed to load verification requests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('residency_ownership_verifications')
        .select('status');

      if (error) throw error;

      const newStats = {
        total: data.length,
        pending: data.filter(v => v.status === 'pending').length,
        approved: data.filter(v => v.status === 'approved').length,
        rejected: data.filter(v => v.status === 'rejected').length,
        requires_documents: data.filter(v => v.status === 'requires_additional_documents').length
      };

      setStats(newStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const updateVerificationStatus = async (
    verificationId: string, 
    newStatus: string, 
    notes?: string, 
    rejectionReason?: string
  ) => {
    try {
      const updateData: any = {
        status: newStatus,
        reviewed_at: new Date().toISOString(),
        reviewed_by: (await supabase.auth.getUser()).data.user?.id
      };

      if (notes) updateData.verification_notes = notes;
      if (rejectionReason) updateData.rejection_reason = rejectionReason;

      const { error } = await supabase
        .from('residency_ownership_verifications')
        .update(updateData)
        .eq('id', verificationId);

      if (error) throw error;

      // Create audit log entry
      await supabase
        .from('document_verification_audit')
        .insert({
          verification_id: verificationId,
          performed_by: (await supabase.auth.getUser()).data.user?.id,
          action: `status_changed_to_${newStatus}`,
          verification_details: {
            status: newStatus,
            notes: notes,
            rejection_reason: rejectionReason
          },
          document_hash: 'verification_record'
        });

      toast({
        title: t('dashboard:success'),
        description: 'Verification status updated successfully',
      });

      await fetchVerifications();
      await fetchStats();
      setReviewDialog(false);
      setSelectedVerification(null);
      setReviewNotes('');
    } catch (error) {
      console.error('Error updating verification status:', error);
      toast({
        title: t('dashboard:error'),
        description: 'Failed to update verification status',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'requires_additional_documents': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <AlertTriangle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'requires_additional_documents': return <Upload className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const filteredVerifications = verifications.filter(verification => {
    const matchesSearch = !searchTerm || 
      verification.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.verification_type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const StatCard = ({ title, value, color }: { title: string; value: number; color: string }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard title="Total Requests" value={stats.total} color="text-blue-600" />
        <StatCard title="Pending Review" value={stats.pending} color="text-yellow-600" />
        <StatCard title="Approved" value={stats.approved} color="text-green-600" />
        <StatCard title="Rejected" value={stats.rejected} color="text-red-600" />
        <StatCard title="Need Documents" value={stats.requires_documents} color="text-orange-600" />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Verification Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Search Verifications</Label>
              <Input
                id="search"
                placeholder="Search by name, email, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="status">Filter by Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="requires_additional_documents">Needs Documents</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type">Verification Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="residency">Residency</SelectItem>
                  <SelectItem value="ownership">Ownership</SelectItem>
                  <SelectItem value="rental_agreement">Rental Agreement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Requests List */}
      <div className="grid gap-4">
        {filteredVerifications.map((verification) => (
          <Card key={verification.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">{verification.full_name || 'Unknown User'}</span>
                    </div>
                    <Badge className={getStatusColor(verification.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(verification.status)}
                        {verification.status.replace('_', ' ')}
                      </div>
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Type:</span> 
                      <br />{verification.verification_type?.replace('_', ' ')}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> 
                      <br />{verification.email}
                    </div>
                        <div>
                          <span className="font-medium">Created:</span> 
                          <br />{new Date(verification.created_at).toLocaleDateString()}
                        </div>
                    <div>
                      <span className="font-medium">Reviewed:</span> 
                      <br />{verification.reviewed_at ? new Date(verification.reviewed_at).toLocaleDateString() : 'Not reviewed'}
                    </div>
                  </div>

                  {verification.verification_notes && (
                    <div className="text-sm">
                      <span className="font-medium">Notes:</span> {verification.verification_notes}
                    </div>
                  )}

                  {verification.rejection_reason && (
                    <div className="text-sm text-red-600">
                      <span className="font-medium">Rejection Reason:</span> {verification.rejection_reason}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle>Verification Request Details</DialogTitle>
                      </DialogHeader>
                      <Tabs defaultValue="details" className="w-full">
                        <TabsList>
                          <TabsTrigger value="details">Details</TabsTrigger>
                          <TabsTrigger value="documents">Documents</TabsTrigger>
                          <TabsTrigger value="history">History</TabsTrigger>
                        </TabsList>
                        <TabsContent value="details" className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><strong>User:</strong> {verification.full_name}</div>
                            <div><strong>Email:</strong> {verification.email}</div>
                            <div><strong>Type:</strong> {verification.verification_type}</div>
                            <div><strong>Status:</strong> {verification.status}</div>
                            <div><strong>Created:</strong> {new Date(verification.created_at).toLocaleDateString()}</div>
                            <div><strong>Reviewed:</strong> {verification.reviewed_at ? new Date(verification.reviewed_at).toLocaleDateString() : 'Not reviewed'}</div>
                          </div>
                          {verification.metadata && (
                            <div>
                              <strong>Additional Information:</strong>
                              <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-auto">
                                {JSON.stringify(verification.metadata, null, 2)}
                              </pre>
                            </div>
                          )}
                        </TabsContent>
                        <TabsContent value="documents">
                          <div className="space-y-4">
                            {verification.documents_url ? (
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                <span>Documents attached</span>
                                <Button variant="outline" size="sm">
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </Button>
                              </div>
                            ) : (
                              <p className="text-muted-foreground">No documents uploaded</p>
                            )}
                          </div>
                        </TabsContent>
                        <TabsContent value="history">
                          <div className="text-sm text-muted-foreground">
                            Verification history and audit trail would be displayed here
                          </div>
                        </TabsContent>
                      </Tabs>
                    </DialogContent>
                  </Dialog>

                  {verification.status === 'pending' && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        setSelectedVerification(verification);
                        setReviewDialog(true);
                      }}
                    >
                      <Shield className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredVerifications.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No verification requests found</h3>
              <p className="text-muted-foreground">Try adjusting your filters to see more results.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Review Dialog */}
      <Dialog open={reviewDialog} onOpenChange={setReviewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Review Verification Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedVerification && (
              <div className="bg-muted p-4 rounded-lg">
                <div className="font-medium">{selectedVerification.full_name}</div>
                <div className="text-sm text-muted-foreground">
                  {selectedVerification.verification_type?.replace('_', ' ')} verification
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="notes">Review Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add notes about your decision..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Button
                className="w-full"
                onClick={() => updateVerificationStatus(selectedVerification?.id!, 'approved', reviewNotes)}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => updateVerificationStatus(selectedVerification?.id!, 'requires_additional_documents', reviewNotes)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Request More Documents
              </Button>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => updateVerificationStatus(selectedVerification?.id!, 'rejected', reviewNotes, reviewNotes)}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}