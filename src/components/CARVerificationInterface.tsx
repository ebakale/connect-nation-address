import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  UserCheck, Shield, MapPin, CheckCircle, Clock, AlertTriangle, 
  FileText, Search, Eye, Edit, X 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface CitizenAddress {
  id: string;
  person_id: string;
  uac: string;
  address_kind: string;
  scope: string;
  occupant: string;
  status: 'SELF_DECLARED' | 'CONFIRMED' | 'REJECTED';
  effective_from: string;
  effective_to?: string;
  notes?: string;
  created_at: string;
  // Address details from join
  street?: string;
  city?: string;
  region?: string;
  country?: string;
  building?: string;
  latitude?: number;
  longitude?: number;
}

export function CARVerificationInterface() {
  const { toast } = useToast();
  const { t } = useTranslation(['dashboard', 'address']);
  const [addresses, setAddresses] = useState<CitizenAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAddress, setSelectedAddress] = useState<CitizenAddress | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [reviewDialog, setReviewDialog] = useState(false);

  useEffect(() => {
    fetchCitizenAddresses();
  }, []);

  const fetchCitizenAddresses = async () => {
    try {
      setLoading(true);
      
      // Fetch citizen addresses with address details
      const { data, error } = await supabase
        .from('citizen_address_with_details')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setAddresses(data || []);
    } catch (error) {
      console.error('Error fetching citizen addresses:', error);
      toast({
        title: t('dashboard:error'),
        description: t('dashboard:failedToLoadAddresses'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAddressStatus = async (addressId: string, newStatus: 'SELF_DECLARED' | 'CONFIRMED' | 'REJECTED', notes?: string) => {
    try {
      const { error } = await supabase
        .from('citizen_address')
        .update({ 
          status: newStatus,
          notes: notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', addressId);

      if (error) throw error;

      // Create audit event
      await supabase
        .from('citizen_address_event')
        .insert({
          citizen_address_id: addressId,
          person_id: selectedAddress?.person_id,
          event_type: 'status_change',
          payload: { 
            old_status: selectedAddress?.status, 
            new_status: newStatus,
            notes: notes 
          },
          actor_id: (await supabase.auth.getUser()).data.user?.id
        });

      toast({
        title: t('dashboard:success'),
        description: t('dashboard:addressStatusUpdated'),
      });

      fetchCitizenAddresses();
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'PENDING_VERIFICATION': return 'bg-yellow-100 text-yellow-800';
      case 'SELF_DECLARED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED': return <X className="h-4 w-4" />;
      case 'PENDING_VERIFICATION': return <Clock className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const filteredAddresses = addresses.filter(addr => {
    const matchesSearch = !searchTerm || 
      addr.uac?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      addr.street?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      addr.city?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || addr.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('dashboard:carVerification')}</h2>
          <p className="text-muted-foreground">{t('dashboard:reviewCitizenAddresses')}</p>
        </div>
        <Badge variant="outline">
          {filteredAddresses.length} {t('dashboard:addresses')}
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('dashboard:filters')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <SelectItem value="PENDING_VERIFICATION">{t('dashboard:pendingVerification')}</SelectItem>
                  <SelectItem value="CONFIRMED">{t('dashboard:confirmed')}</SelectItem>
                  <SelectItem value="REJECTED">{t('dashboard:rejected')}</SelectItem>
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
                    <Badge className={getStatusColor(address.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(address.status)}
                        {address.status?.replace('_', ' ')}
                      </div>
                    </Badge>
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
                      <span className="font-medium">{t('dashboard:effectiveFrom')}:</span> 
                      <br />{address.effective_from}
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
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{t('dashboard:addressDetails')}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div><strong>UAC:</strong> {address.uac}</div>
                          <div><strong>{t('dashboard:status')}:</strong> {address.status}</div>
                          <div><strong>{t('dashboard:addressKind')}:</strong> {address.address_kind}</div>
                          <div><strong>{t('dashboard:occupant')}:</strong> {address.occupant}</div>
                          <div><strong>{t('dashboard:scope')}:</strong> {address.scope}</div>
                          <div><strong>{t('dashboard:effectiveFrom')}:</strong> {address.effective_from}</div>
                        </div>
                        {address.notes && (
                          <div>
                            <strong>{t('dashboard:notes')}:</strong>
                            <p className="mt-1 text-muted-foreground">{address.notes}</p>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>

                  {address.status !== 'CONFIRMED' && address.status !== 'REJECTED' && (
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

export default CARVerificationInterface;