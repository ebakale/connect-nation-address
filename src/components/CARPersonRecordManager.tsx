import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Users, Search, Eye, AlertTriangle, Shield, MapPin, 
  Calendar, Mail, Phone, IdCard, Home, ChevronLeft, ChevronRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';
import { useUserRole } from "@/hooks/useUserRole";

interface PersonRecord {
  id: string;
  auth_user_id: string | null;
  national_id: string | null;
  is_protected_class: boolean;
  protection_reason: string | null;
  created_at: string;
  full_name?: string;
  email?: string;
  phone?: string;
  address_count?: number;
}

interface CitizenAddress {
  id: string;
  uac: string;
  status: string;
  address_kind: string;
  scope: string;
  effective_from: string;
  effective_to: string | null;
  street?: string;
  city?: string;
  region?: string;
}

export function CARPersonRecordManager() {
  const { toast } = useToast();
  const { t } = useTranslation('admin');
  const { roleMetadata } = useUserRole();
  
  const [persons, setPersons] = useState<PersonRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedPerson, setSelectedPerson] = useState<PersonRecord | null>(null);
  const [personAddresses, setPersonAddresses] = useState<CitizenAddress[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Filters
  const [filterHasAddresses, setFilterHasAddresses] = useState(false);
  const [filterProtectedOnly, setFilterProtectedOnly] = useState(false);
  
  const pageSize = 10;
  const geographicScope = roleMetadata?.find(m => m.scope_type === 'region' || m.scope_type === 'city' || m.scope_type === 'province');

  useEffect(() => {
    fetchPersons();
  }, [currentPage, searchQuery, filterHasAddresses, filterProtectedOnly]);

  const fetchPersons = async () => {
    setLoading(true);
    try {
      // First get persons with optional scope filtering
      let query = supabase
        .from('person')
        .select('id, auth_user_id, national_id, is_protected_class, protection_reason, created_at', { count: 'exact' });

      if (filterProtectedOnly) {
        query = query.eq('is_protected_class', true);
      }

      if (searchQuery) {
        query = query.or(`national_id.ilike.%${searchQuery}%`);
      }

      const { data: personData, error: personError, count } = await query
        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1)
        .order('created_at', { ascending: false });

      if (personError) throw personError;

      // Enrich with profile data
      const authUserIds = personData?.map(p => p.auth_user_id).filter(Boolean) || [];
      
      let profiles: any[] = [];
      if (authUserIds.length > 0) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('user_id, full_name, email, phone')
          .in('user_id', authUserIds);
        profiles = profileData || [];
      }

      // Get address counts
      const personIds = personData?.map(p => p.id) || [];
      const { data: addressCounts } = await supabase
        .from('citizen_address')
        .select('person_id')
        .in('person_id', personIds);

      const addressCountMap = new Map<string, number>();
      addressCounts?.forEach(addr => {
        const current = addressCountMap.get(addr.person_id) || 0;
        addressCountMap.set(addr.person_id, current + 1);
      });

      // Apply geographic scope filter if needed
      let filteredPersonIds = personIds;
      if (geographicScope) {
        const { data: scopedAddresses } = await supabase
          .from('citizen_address_with_details')
          .select('person_id, region, city')
          .in('person_id', personIds);

        const personIdsInScope = new Set<string>();
        scopedAddresses?.forEach(addr => {
          if (geographicScope.scope_type === 'region' && addr.region?.toLowerCase() === geographicScope.scope_value?.toLowerCase()) {
            personIdsInScope.add(addr.person_id);
          } else if (geographicScope.scope_type === 'city' && addr.city?.toLowerCase() === geographicScope.scope_value?.toLowerCase()) {
            personIdsInScope.add(addr.person_id);
          }
        });
        filteredPersonIds = [...personIdsInScope];
      }

      const profileMap = new Map(profiles.map(p => [p.user_id, p]));

      let enrichedPersons = personData?.map(person => {
        const profile = profileMap.get(person.auth_user_id);
        return {
          ...person,
          full_name: profile?.full_name || t('personRecordManager.unknownPerson'),
          email: profile?.email || '',
          phone: profile?.phone || '',
          address_count: addressCountMap.get(person.id) || 0
        };
      }) || [];

      // Apply has addresses filter
      if (filterHasAddresses) {
        enrichedPersons = enrichedPersons.filter(p => (p.address_count || 0) > 0);
      }

      // Apply geographic scope filter
      if (geographicScope && filteredPersonIds.length > 0) {
        enrichedPersons = enrichedPersons.filter(p => filteredPersonIds.includes(p.id));
      }

      setPersons(enrichedPersons);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching persons:', error);
      toast({
        title: t('personRecordManager.errorTitle'),
        description: t('personRecordManager.fetchError'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPersonAddresses = async (personId: string) => {
    try {
      const { data, error } = await supabase
        .from('citizen_address_with_details')
        .select('id, uac, status, address_kind, scope, effective_from, effective_to, street, city, region')
        .eq('person_id', personId)
        .order('effective_from', { ascending: false });

      if (error) throw error;
      setPersonAddresses(data || []);
    } catch (error) {
      console.error('Error fetching person addresses:', error);
    }
  };

  const handleViewPerson = async (person: PersonRecord) => {
    setSelectedPerson(person);
    await fetchPersonAddresses(person.id);
    setDialogOpen(true);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-4">
      {geographicScope && (
        <Alert>
          <MapPin className="h-4 w-4" />
          <AlertDescription>
            {t('personRecordManager.scopeRestriction')}: <Badge variant="outline">{geographicScope.scope_value}</Badge>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('personRecordManager.title')}
          </CardTitle>
          <CardDescription>{t('personRecordManager.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('personRecordManager.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="hasAddresses"
                  checked={filterHasAddresses}
                  onCheckedChange={(checked) => {
                    setFilterHasAddresses(checked as boolean);
                    setCurrentPage(1);
                  }}
                />
                <label htmlFor="hasAddresses" className="text-sm">
                  {t('personRecordManager.filters.hasAddresses')}
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="protectedOnly"
                  checked={filterProtectedOnly}
                  onCheckedChange={(checked) => {
                    setFilterProtectedOnly(checked as boolean);
                    setCurrentPage(1);
                  }}
                />
                <label htmlFor="protectedOnly" className="text-sm">
                  {t('personRecordManager.filters.protectedOnly')}
                </label>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('personRecordManager.columns.name')}</TableHead>
                  <TableHead className="hidden md:table-cell">{t('personRecordManager.columns.email')}</TableHead>
                  <TableHead className="hidden lg:table-cell">{t('personRecordManager.columns.nationalId')}</TableHead>
                  <TableHead>{t('personRecordManager.columns.protectedStatus')}</TableHead>
                  <TableHead>{t('personRecordManager.columns.addressCount')}</TableHead>
                  <TableHead className="hidden md:table-cell">{t('personRecordManager.columns.createdAt')}</TableHead>
                  <TableHead>{t('personRecordManager.columns.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="animate-pulse text-muted-foreground">
                        {t('personRecordManager.loading')}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : persons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {t('personRecordManager.emptyState')}
                    </TableCell>
                  </TableRow>
                ) : (
                  persons.map((person) => (
                    <TableRow key={person.id}>
                      <TableCell className="font-medium">{person.full_name}</TableCell>
                      <TableCell className="hidden md:table-cell">{person.email || '-'}</TableCell>
                      <TableCell className="hidden lg:table-cell">{person.national_id || '-'}</TableCell>
                      <TableCell>
                        {person.is_protected_class ? (
                          <Badge variant="destructive" className="gap-1">
                            <Shield className="h-3 w-3" />
                            {t('personRecordManager.protected')}
                          </Badge>
                        ) : (
                          <Badge variant="outline">{t('personRecordManager.standard')}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{person.address_count}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {new Date(person.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewPerson(person)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          {t('personRecordManager.actions.viewDetails')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {t('personRecordManager.pagination.showing', { 
                  start: (currentPage - 1) * pageSize + 1, 
                  end: Math.min(currentPage * pageSize, totalCount),
                  total: totalCount 
                })}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Person Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('personRecordManager.personDetails.title')}
            </DialogTitle>
            <DialogDescription>
              {selectedPerson?.full_name}
            </DialogDescription>
          </DialogHeader>

          {selectedPerson && (
            <Tabs defaultValue="info" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="info">{t('personRecordManager.personDetails.basicInfo')}</TabsTrigger>
                <TabsTrigger value="addresses">{t('personRecordManager.personDetails.addresses')}</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">{t('personRecordManager.columns.name')}</p>
                          <p className="font-medium">{selectedPerson.full_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">{t('personRecordManager.columns.email')}</p>
                          <p className="font-medium">{selectedPerson.email || '-'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">{t('personRecordManager.personDetails.phone')}</p>
                          <p className="font-medium">{selectedPerson.phone || '-'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <IdCard className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">{t('personRecordManager.columns.nationalId')}</p>
                          <p className="font-medium">{selectedPerson.national_id || '-'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">{t('personRecordManager.columns.createdAt')}</p>
                          <p className="font-medium">{new Date(selectedPerson.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    {selectedPerson.is_protected_class && (
                      <Alert variant="destructive">
                        <Shield className="h-4 w-4" />
                        <AlertDescription>
                          <strong>{t('personRecordManager.personDetails.protectedClass')}</strong>
                          {selectedPerson.protection_reason && (
                            <p className="mt-1">{t('personRecordManager.personDetails.protectionReason')}: {selectedPerson.protection_reason}</p>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="addresses" className="space-y-4">
                {personAddresses.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      <Home className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      {t('personRecordManager.personDetails.noAddresses')}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {personAddresses.map((address) => (
                      <Card key={address.id}>
                        <CardContent className="pt-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                            <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                              {address.uac}
                            </code>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant={address.status === 'CONFIRMED' ? 'default' : 'secondary'}>
                                {t(`address:status.${address.status?.toLowerCase()}`)}
                              </Badge>
                              <Badge variant="outline">{t(`address:kind.${address.address_kind?.toLowerCase()}`)}</Badge>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <p>{address.street}, {address.city}, {address.region}</p>
                            <p className="mt-1">
                              {t('personRecordManager.personDetails.effectiveFrom')}: {new Date(address.effective_from).toLocaleDateString()}
                              {address.effective_to && ` - ${new Date(address.effective_to).toLocaleDateString()}`}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
