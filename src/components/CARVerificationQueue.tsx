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
  UserCheck, Shield, MapPin, CheckCircle, Clock, AlertTriangle, 
  FileText, Search, Eye, Edit, X, Database, Flag
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import type { CitizenAddress } from '@/types/car';

export function CARVerificationQueue() {
  const { toast } = useToast();
  const { t } = useTranslation(['dashboard', 'address']);
  const [addresses, setAddresses] = useState<CitizenAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('SELF_DECLARED');
  const [kindFilter, setKindFilter] = useState<string>('all');
  const [selectedAddress, setSelectedAddress] = useState<CitizenAddress | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [reviewDialog, setReviewDialog] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    rejected: 0,
    flagged: 0
  });

  useEffect(() => {
    fetchVerificationQueue();
    fetchStats();
  }, [statusFilter, kindFilter]);

  const fetchVerificationQueue = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('citizen_address_with_details')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (kindFilter !== 'all') {
        query = query.eq('address_kind', kindFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      setAddresses(data || []);
    } catch (error) {
      console.error('Error fetching verification queue:', error);
      toast({
        title: t('dashboard:error'),
        description: t('dashboard:failedToLoadAddresses'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('citizen_address')
        .select('status');

      if (error) throw error;

      const newStats = {
        total: data.length,
        pending: data.filter(addr => addr.status === 'SELF_DECLARED').length,
        confirmed: data.filter(addr => addr.status === 'CONFIRMED').length,
        rejected: data.filter(addr => addr.status === 'REJECTED').length,
        flagged: 0 // Will be updated when flagging is available
      };

      setStats(newStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const updateAddressStatus = async (addressId: string, newStatus: 'CONFIRMED' | 'REJECTED', notes?: string) => {
    try {
      const { error } = await supabase.rpc('set_citizen_address_status', {
        p_address_id: addressId,
        p_status: newStatus
      });

      if (error) throw error;

      // Update notes if provided
      if (notes) {
        await supabase
          .from('citizen_address')
          .update({ notes })
          .eq('id', addressId);
      }

      toast({
        title: t('dashboard:success'),
        description: t('dashboard:addressStatusUpdated'),
      });

      await fetchVerificationQueue();
      await fetchStats();
      setReviewDialog(false);
      setSelectedAddress(null);
      setVerificationNotes('');
    } catch (error) {
      console.error('Error updating address status:', error);
      toast({
        title: t('dashboard:error'),
        description: t('dashboard:failedToUpdateStatus'),
        variant: 'destructive',
      });
    }
  };

  const flagAddressForReview = async (addressId: string, reason: string) => {
    try {
      // Add notes instead of using flagged column that doesn't exist
      const { error } = await supabase
        .from('citizen_address')
        .update({ 
          notes: `FLAGGED: ${reason}`
        })
        .eq('id', addressId);

      if (error) throw error;

      toast({
        title: t('dashboard:success'),
        description: 'Address flagged for manual review',
      });

      await fetchVerificationQueue();
      await fetchStats();
    } catch (error) {
      console.error('Error flagging address:', error);
      toast({
        title: t('dashboard:error'),
        description: 'Failed to flag address',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'REJECTED': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'SELF_DECLARED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED': return <X className="h-4 w-4" />;
      case 'SELF_DECLARED': return <Clock className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const filteredAddresses = addresses.filter(addr => {
    const matchesSearch = !searchTerm || 
      addr.uac?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      addr.street?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      addr.city?.toLowerCase().includes(searchTerm.toLowerCase());
    
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
        <StatCard title="Total Addresses" value={stats.total} color="text-blue-600" />
        <StatCard title="Pending Review" value={stats.pending} color="text-yellow-600" />
        <StatCard title="Confirmed" value={stats.confirmed} color="text-green-600" />
        <StatCard title="Rejected" value={stats.rejected} color="text-red-600" />
        <StatCard title="Flagged" value={stats.flagged} color="text-orange-600" />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('dashboard:filters')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">{t('dashboard:searchAddresses')}</Label>
              <Input
                id="search"
                placeholder={t('dashboard:searchByUACOrAddress')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="status">{t('dashboard:filterByStatus')}</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('dashboard:allStatuses')}</SelectItem>
                  <SelectItem value="SELF_DECLARED">{t('dashboard:selfDeclared')}</SelectItem>
                  <SelectItem value="CONFIRMED">{t('dashboard:confirmed')}</SelectItem>
                  <SelectItem value="REJECTED">{t('dashboard:rejected')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="kind">Address Kind</Label>
              <Select value={kindFilter} onValueChange={setKindFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="PRIMARY">Primary</SelectItem>
                  <SelectItem value="SECONDARY">Secondary</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address List */}
      <div className="grid gap-4">
        {filteredAddresses.map((address) => (
          <Card key={address.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="font-mono text-sm bg-muted px-2 py-1 rounded">
                      {address.uac}
                    </div>
                    <Badge className={getStatusColor(address.status!)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(address.status!)}
                        {address.status?.replace('_', ' ')}
                      </div>
                    </Badge>
                    {address.notes?.includes('FLAGGED:') && (
                      <Badge variant="destructive">
                        <Flag className="h-3 w-3 mr-1" />
                        Flagged
                      </Badge>
                    )}
                    {address.nar_verified && (
                      <Badge variant="secondary">
                        <Database className="h-3 w-3 mr-1" />
                        NAR Verified
                      </Badge>
                    )}
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {[address.building, address.street, address.city, address.region]
                        .filter(Boolean)
                        .join(', ')
                      }
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-muted-foreground">
                    <div>
                      <span className="font-medium">{t('dashboard:addressKind')}:</span> 
                      <br />{address.address_kind?.replace('_', ' ')}
                    </div>
                    <div>
                      <span className="font-medium">{t('dashboard:occupant')}:</span> 
                      <br />{address.occupant?.replace('_', ' ')}
                    </div>
                    <div>
                      <span className="font-medium">{t('dashboard:scope')}:</span> 
                      <br />{address.scope}
                    </div>
                    <div>
                      <span className="font-medium">Verification Status:</span> 
                      <br />{address.verification_status || 'Unknown'}
                    </div>
                  </div>

                  {address.notes && (
                    <div className="text-sm">
                      <span className="font-medium">{t('dashboard:notes')}:</span> {address.notes}
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
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>{t('dashboard:addressDetails')}</DialogTitle>
                      </DialogHeader>
                      <Tabs defaultValue="details" className="w-full">
                        <TabsList>
                          <TabsTrigger value="details">Details</TabsTrigger>
                          <TabsTrigger value="nar-cross-ref">NAR Cross-Reference</TabsTrigger>
                          <TabsTrigger value="history">History</TabsTrigger>
                        </TabsList>
                        <TabsContent value="details" className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><strong>UAC:</strong> {address.uac}</div>
                            <div><strong>{t('dashboard:status')}:</strong> {address.status}</div>
                            <div><strong>{t('dashboard:addressKind')}:</strong> {address.address_kind}</div>
                            <div><strong>{t('dashboard:occupant')}:</strong> {address.occupant}</div>
                            <div><strong>{t('dashboard:scope')}:</strong> {address.scope}</div>
                            <div><strong>Effective From:</strong> {address.effective_from}</div>
                            <div><strong>Coordinates:</strong> {address.latitude}, {address.longitude}</div>
                            <div><strong>NAR Verified:</strong> {address.nar_verified ? 'Yes' : 'No'}</div>
                          </div>
                          {address.notes && (
                            <div>
                              <strong>{t('dashboard:notes')}:</strong>
                              <p className="mt-1 text-muted-foreground">{address.notes}</p>
                            </div>
                          )}
                        </TabsContent>
                        <TabsContent value="nar-cross-ref">
                          <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                              Cross-reference with National Address Registry
                            </p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div><strong>NAR Public:</strong> {address.nar_public ? 'Yes' : 'No'}</div>
                              <div><strong>NAR Verified:</strong> {address.nar_verified ? 'Yes' : 'No'}</div>
                              <div><strong>Verification Status:</strong> {address.verification_status || 'Unknown'}</div>
                            </div>
                          </div>
                        </TabsContent>
                        <TabsContent value="history">
                          <div className="text-sm text-muted-foreground">
                            Address history and events would be displayed here
                          </div>
                        </TabsContent>
                      </Tabs>
                    </DialogContent>
                  </Dialog>

                  {address.status === 'SELF_DECLARED' && (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          setSelectedAddress(address);
                          setReviewDialog(true);
                        }}
                      >
                        <UserCheck className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => flagAddressForReview(address.id, 'Requires additional verification')}
                      >
                        <Flag className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredAddresses.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">{t('dashboard:noAddressesFound')}</h3>
              <p className="text-muted-foreground">{t('dashboard:tryAdjustingFilters')}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Review Dialog */}
      <Dialog open={reviewDialog} onOpenChange={setReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('dashboard:reviewAddress')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedAddress && (
              <div className="bg-muted p-4 rounded-lg">
                <div className="font-mono text-sm">{selectedAddress.uac}</div>
                <div className="text-sm text-muted-foreground">
                  {[selectedAddress.building, selectedAddress.street, selectedAddress.city]
                    .filter(Boolean)
                    .join(', ')
                  }
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="notes">{t('dashboard:verificationNotes')}</Label>
              <Textarea
                id="notes"
                placeholder={t('dashboard:addNotesAboutVerification')}
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => updateAddressStatus(selectedAddress?.id!, 'CONFIRMED', verificationNotes)}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {t('dashboard:confirm')}
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => updateAddressStatus(selectedAddress?.id!, 'REJECTED', verificationNotes)}
              >
                <X className="h-4 w-4 mr-2" />
                {t('dashboard:reject')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}