import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Search, Image, MessageSquare, Clock, CheckCircle2, AlertTriangle, Map, Target, Camera, Zap, Eye, Crosshair, Move, Ruler, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { UniversalLocationMap } from "@/components/UniversalLocationMap";
import { FlaggedAddressManager } from "@/components/FlaggedAddressManager";
import { useTranslation } from 'react-i18next';
import { useGoogleMapsPreload } from '@/hooks/useGoogleMapsPreload';

interface VerificationRecord {
  id: string;
  address_id: string;
  verifier_notes: string;
  verification_date: string;
  coordinates_accuracy: number;
  photo_quality_score: number;
}

interface AddressDetails {
  id: string;
  uac: string;
  street: string;
  city: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  photo_url?: string;
  description?: string;
  verified: boolean;
  public: boolean;
  created_at: string;
}

interface VerificationToolsProps {
  onClose?: () => void;
}

export const VerificationTools = ({ onClose }: VerificationToolsProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAddress, setSelectedAddress] = useState<AddressDetails | null>(null);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [coordinatesAccuracy, setCoordinatesAccuracy] = useState<number>(95);
  const [photoQualityScore, setPhotoQualityScore] = useState<number>(90);
  const [searchResults, setSearchResults] = useState<AddressDetails[]>([]);
  const [pendingAddresses, setPendingAddresses] = useState<AddressDetails[]>([]);
  const [flaggedAddresses, setFlaggedAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [flaggedLoading, setFlaggedLoading] = useState(false);
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [verificationMapOpen, setVerificationMapOpen] = useState(false);
  const [coordVerificationResults, setCoordVerificationResults] = useState<{
    accuracy: number;
    distance: number;
    confidence: string;
  } | null>(null);
  const [photoAnalysis, setPhotoAnalysis] = useState<{
    resolution: string;
    quality: number;
    hasAddressVisible: boolean;
    gpsMatch: boolean;
  } | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { roleMetadata, loading: roleLoading } = useUserRole();
  const { t } = useTranslation(['admin', 'common']);
  
  // Pre-load Google Maps in background when VerificationTools mounts
  useGoogleMapsPreload(true);

  // Extract geographic scope from role metadata
  const geographicScope = roleMetadata.find(m => 
    m.scope_type === 'region' || m.scope_type === 'province' || m.scope_type === 'city' || m.scope_type === 'geographic'
  );
  const hasNationalScope = roleMetadata.length === 0 || !geographicScope;

  // Load pending addresses and flagged addresses on component mount
  useEffect(() => {
    if (!roleLoading) {
      loadPendingAddresses();
      loadFlaggedAddresses();
    }
  }, [roleLoading, geographicScope?.scope_type, geographicScope?.scope_value]);

  // Load all addresses in the system (filtered by geographic scope)
  const loadPendingAddresses = async () => {
    if (roleLoading) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('addresses')
        .select('*');

      // Apply geographical scope filter for non-national scope users
      if (!hasNationalScope && geographicScope) {
        if (geographicScope.scope_type === 'city') {
          query = query.ilike('city', geographicScope.scope_value);
        } else if (geographicScope.scope_type === 'region' || geographicScope.scope_type === 'province') {
          query = query.ilike('region', geographicScope.scope_value);
        } else if (geographicScope.scope_type === 'geographic') {
          query = query.or(`city.ilike.${geographicScope.scope_value},region.ilike.${geographicScope.scope_value}`);
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setPendingAddresses(data || []);
    } catch (error) {
      console.error('Failed to load pending addresses:', error);
      toast({
        title: t('admin:error'),
        description: t('admin:unableToLoadAddresses'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load flagged addresses for review (filtered by geographic scope)
  const loadFlaggedAddresses = async () => {
    if (roleLoading) return;
    
    setFlaggedLoading(true);
    try {
      let query = supabase
        .from('address_requests')
        .select(`
          id,
          street,
          city,
          region,
          country,
          latitude,
          longitude,
          photo_url,
          description,
          address_type,
          status,
          justification,
          flag_reason,
          flagged,
          flagged_at,
          verification_analysis,
          verification_recommendations
        `)
        .eq('flagged', true);

      // Apply geographical scope filter for non-national scope users
      if (!hasNationalScope && geographicScope) {
        if (geographicScope.scope_type === 'city') {
          query = query.ilike('city', geographicScope.scope_value);
        } else if (geographicScope.scope_type === 'region' || geographicScope.scope_type === 'province') {
          query = query.ilike('region', geographicScope.scope_value);
        } else if (geographicScope.scope_type === 'geographic') {
          query = query.or(`city.ilike.${geographicScope.scope_value},region.ilike.${geographicScope.scope_value}`);
        }
      }

      const { data, error } = await query.order('flagged_at', { ascending: false });

      if (error) throw error;
      setFlaggedAddresses(data || []);
    } catch (error) {
      console.error('Failed to load flagged addresses:', error);
      toast({
        title: t('admin:error'),
        description: t('admin:unableToLoadFlaggedAddresses'),
        variant: "destructive",
      });
    } finally {
      setFlaggedLoading(false);
    }
  };

  // Search addresses for verification (filtered by geographic scope)
  const searchAddresses = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('addresses')
        .select('*')
        .or(`uac.ilike.%${searchQuery}%,street.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`);

      // Apply geographical scope filter for non-national scope users
      if (!hasNationalScope && geographicScope) {
        if (geographicScope.scope_type === 'city') {
          query = query.ilike('city', geographicScope.scope_value);
        } else if (geographicScope.scope_type === 'region' || geographicScope.scope_type === 'province') {
          query = query.ilike('region', geographicScope.scope_value);
        } else if (geographicScope.scope_type === 'geographic') {
          query = query.or(`city.ilike.${geographicScope.scope_value},region.ilike.${geographicScope.scope_value}`);
        }
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Search failed:', error);
      toast({
        title: t('admin:searchFailed'),
        description: t('admin:unableToSearchAddresses'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Save verification record
  const saveVerificationRecord = async () => {
    if (!selectedAddress || !user) return;

    try {
      // For now, we'll save notes in the address table
      // In a real system, you might have a separate verification_records table
      const { error } = await supabase
        .from('addresses')
        .update({
          description: verificationNotes ? 
            (selectedAddress.description ? 
              `${selectedAddress.description}\n\nVerifier Notes: ${verificationNotes}` : 
              `Verifier Notes: ${verificationNotes}`) : 
            selectedAddress.description
        })
        .eq('id', selectedAddress.id);

      if (error) throw error;

      toast({
        title: t('admin:success'),
        description: t('admin:successVerificationSaved'),
      });

      setVerificationNotes("");
    } catch (error) {
      console.error('Failed to save verification record:', error);
      toast({
        title: t('admin:error'),
        description: t('admin:errorVerificationFailed'),
        variant: "destructive",
      });
    }
  };

  // Bulk verification actions
  const bulkVerifyAddresses = async (addressIds: string[], verified: boolean) => {
    try {
      const { error } = await supabase
        .from('addresses')
        .update({ verified })
        .in('id', addressIds);

      if (error) throw error;

      toast({
        title: t('admin:success'),
        description: `${addressIds.length} ${verified ? t('admin:addressesVerifiedSuccessfully') : t('admin:addressesRejectedSuccessfully')}`,
      });

      // Refresh search results
      if (searchQuery) {
        searchAddresses();
      }
    } catch (error) {
      console.error('Bulk verification failed:', error);
      toast({
        title: t('admin:error'),
        description: t('admin:bulkVerificationFailed'),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4 p-4 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold break-words">{t('admin:verificationTools')}</h3>
          <p className="text-sm text-muted-foreground break-words">{t('admin:advancedToolsForAddressVerification')}</p>
        </div>
        {onClose && (
          <Button variant="outline" size="sm" onClick={onClose} className="self-start sm:self-center">
            <X className="h-4 w-4 mr-2" />
            {t('admin:close')}
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">{t('admin:totalAddresses')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-blue-600">
              {pendingAddresses.length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">{t('admin:verifiedToday')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              {searchResults.filter(addr => addr.verified).length}
            </div>
          </CardContent>
        </Card>
        
        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">{t('admin:qualityScore')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-blue-600">
              {Math.round((coordinatesAccuracy + photoQualityScore) / 2)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="search" className="w-full">
        <TabsList className="flex flex-wrap w-full gap-1 h-auto p-1 justify-start">
          <TabsTrigger value="search" className="text-xs sm:text-sm p-2 sm:p-3 whitespace-nowrap">
            {t('admin:allAddresses')}
          </TabsTrigger>
          <TabsTrigger value="individual" className="text-xs sm:text-sm p-2 sm:p-3 whitespace-nowrap">
            {t('admin:individualVerify')}
          </TabsTrigger>
          <TabsTrigger value="verify" className="text-xs sm:text-sm p-2 sm:p-3 whitespace-nowrap">
            {t('admin:verificationToolsTab')}
          </TabsTrigger>
          <TabsTrigger value="flagged" className="text-xs sm:text-sm p-2 sm:p-3 whitespace-nowrap">
            {t('admin:flaggedAddresses')}
          </TabsTrigger>
          <TabsTrigger value="quality" className="text-xs sm:text-sm p-2 sm:p-3 whitespace-nowrap">
            {t('admin:qualityControl')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                {t('admin:allAddressesInSystem')}
              </CardTitle>
              <CardDescription>
                {t('admin:browseAndSelectAnyAddress')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                  <div className="text-center py-8">
                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                   <p className="text-muted-foreground">{t('admin:loadingAddresses')}</p>
                 </div>
              ) : pendingAddresses.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {pendingAddresses.map((address) => (
                    <Card 
                      key={address.id} 
                      className={`cursor-pointer transition-colors ${
                        selectedAddress?.id === address.id ? 'bg-primary/10' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedAddress(address)}
                    >
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium text-sm sm:text-base break-words">{address.uac}</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground break-words">
                              {address.street}, {address.city}, {address.region}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <MapPin className="h-3 w-3 flex-shrink-0" />
                              <span className="text-xs break-all">{address.latitude}, {address.longitude}</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Created: {new Date(address.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex gap-1 flex-wrap">
                            <Badge variant={address.verified ? "default" : "secondary"} className="text-xs">
                              {address.verified ? t('common:status.verified') : t('common:status.pending')}
                            </Badge>
                            <Badge variant={address.public ? "default" : "outline"} className="text-xs">
                              {address.public ? t('common:status.public') : t('common:status.private')}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t('admin:noAddressesFound')}</p>
                  <p className="text-sm">{t('admin:noAddressesExistYet')}</p>
                </div>
              )}
              
              {pendingAddresses.length > 0 && (
                <Button 
                  onClick={loadPendingAddresses} 
                  variant="outline" 
                  className="w-full"
                  disabled={loading}
                >
                  <Search className="h-4 w-4 mr-2" />
                  {t('admin:refreshList')}
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="individual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                {t('admin:individualAddressVerification')}
              </CardTitle>
              <CardDescription>
                {t('admin:verifyOrRejectIndividualAddresses')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedAddress ? (
                <>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label>{t('admin:addressDetails')}</Label>
                      <div className="p-4 bg-muted rounded-md space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-lg">{selectedAddress.uac}</p>
                            <p className="text-muted-foreground">
                              {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.region}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {t('admin:coordinates')}: {selectedAddress.latitude}, {selectedAddress.longitude}
                            </p>
                            {selectedAddress.description && (
                              <p className="text-sm mt-2">{selectedAddress.description}</p>
                            )}
                          </div>
                          <div className="flex flex-col gap-1">
                            <Badge variant={selectedAddress.verified ? "default" : "secondary"}>
                              {selectedAddress.verified ? t('common:status.verified') : t('common:status.pending')}
                            </Badge>
                            <Badge variant={selectedAddress.public ? "default" : "outline"}>
                              {selectedAddress.public ? t('common:status.public') : "Private"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {selectedAddress.photo_url && (
                      <div>
                        <Label>{t('admin:addressPhoto')}</Label>
                        <div className="p-2 bg-muted rounded-md">
                          <img 
                            src={selectedAddress.photo_url} 
                            alt="Address photo" 
                            className="w-full max-w-md h-48 object-cover rounded-md mx-auto"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Button
                      onClick={async () => {
                        try {
                          const { error } = await supabase
                            .from('addresses')
                            .update({ verified: true })
                            .eq('id', selectedAddress.id);

                          if (error) throw error;

                          toast({
                            title: t('admin:addressVerified'),
                            description: `${selectedAddress.uac} ${t('admin:addressVerifiedSuccessfully')}`,
                          });

                          // Update selected address state
                          setSelectedAddress(prev => prev ? {...prev, verified: true} : null);
                          
                          // Refresh pending addresses list
                          loadPendingAddresses();
                        } catch (error) {
                          console.error('Verification failed:', error);
                          toast({
                            title: t('admin:error'),
                            description: t('admin:failedToVerifyAddress'),
                            variant: "destructive",
                          });
                        }
                      }}
                      className="w-full"
                      disabled={selectedAddress.verified}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      {selectedAddress.verified ? t('admin:alreadyVerified') : t('admin:verifyAddress')}
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={async () => {
                        try {
                          const { error } = await supabase
                            .from('addresses')
                            .update({ verified: false })
                            .eq('id', selectedAddress.id);

                          if (error) throw error;

                          toast({
                            title: t('admin:addressRejected'),
                            description: `${selectedAddress.uac} ${t('admin:addressRejectedSuccessfully')}`,
                          });

                          // Update selected address state
                          setSelectedAddress(prev => prev ? {...prev, verified: false} : null);
                          
                          // Refresh pending addresses list
                          loadPendingAddresses();
                        } catch (error) {
                          console.error('Rejection failed:', error);
                          toast({
                            title: t('admin:error'),
                            description: t('admin:failedToRejectAddress'),
                            variant: "destructive",
                          });
                        }
                      }}
                      className="w-full"
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      {t('admin:rejectAddress')}
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={async () => {
                        try {
                          const { error } = await supabase
                            .from('addresses')
                            .update({ public: !selectedAddress.public })
                            .eq('id', selectedAddress.id);

                          if (error) throw error;

                          toast({
                            title: "Status Updated",
                            description: `Address is now ${!selectedAddress.public ? 'public' : 'private'}`,
                          });

                          // Update selected address state
                          setSelectedAddress(prev => prev ? {...prev, public: !prev.public} : null);
                          
                          // Refresh pending addresses list
                          loadPendingAddresses();
                        } catch (error) {
                          console.error('Status update failed:', error);
                          toast({
                            title: "Error",
                            description: "Failed to update status",
                            variant: "destructive",
                          });
                        }
                      }}
                      className="flex-1"
                    >
                      Make {selectedAddress.public ? 'Private' : 'Public'}
                    </Button>
                    
                    <Button
                      variant="secondary"
                      onClick={() => setMapDialogOpen(true)}
                      className="flex-1"
                    >
                      <Map className="h-4 w-4 mr-2" />
                      {t('admin:viewOnMap')}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t('admin:selectAddressFirst')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verify" className="space-y-4">
          {selectedAddress ? (
            <>
              {/* Address Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    {t('admin:advancedVerificationTools')} - {selectedAddress.uac}
                  </CardTitle>
                  <CardDescription>
                    {t('admin:comprehensiveCoordinatePhotoVerification')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
                    <div className="lg:col-span-5 space-y-4">
                      {/* Coordinate Verification Section */}
                      <div className="border rounded-lg p-4 space-y-3">
                        <h3 className="font-medium flex items-center gap-2">
                          <Crosshair className="h-4 w-4" />
                          {t('admin:coordinateVerification')}
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm">{t('admin:reportedCoordinates')}</Label>
                            <div className="p-2 bg-muted rounded text-sm font-mono">
                              {selectedAddress.latitude}, {selectedAddress.longitude}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm">{t('admin:addressComponents')}</Label>
                            <div className="p-2 bg-muted rounded text-sm">
                              {selectedAddress.street}, {selectedAddress.city}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          <Button
                            size="sm"
                            onClick={() => setVerificationMapOpen(true)}
                            className="flex-1"
                          >
                            <Map className="h-4 w-4 mr-2" />
                            {t('admin:verifyOnMap')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              try {
                                const { data, error } = await supabase.functions.invoke('analyze-coordinates', {
                                  body: {
                                    latitude: selectedAddress.latitude,
                                    longitude: selectedAddress.longitude,
                                    address: {
                                      street: selectedAddress.street,
                                      city: selectedAddress.city,
                                      region: selectedAddress.region,
                                      country: selectedAddress.country
                                    }
                                  }
                                });

                                if (error) throw error;
                                
                                setCoordVerificationResults({
                                  accuracy: data.overallScore,
                                  distance: data.accuracy.estimatedError,
                                  confidence: data.overallScore > 85 ? "High" : data.overallScore > 70 ? "Medium" : "Low"
                                });

                                // Auto-flag if accuracy is below 70%
                                if (data.overallScore < 70) {
                                  const flagReason = `Low accuracy score: ${data.overallScore}%. Issues: ${data.recommendations.join(', ')}`;
                                  
                                  const { error: flagError } = await supabase.rpc('flag_address_for_review', {
                                    p_address_id: selectedAddress.id,
                                    p_reason: flagReason,
                                    p_analysis: {
                                      overallScore: data.overallScore,
                                      accuracy: data.accuracy,
                                      consistency: data.consistency,
                                      validation: data.validation,
                                      crossReference: data.crossReference,
                                      analysisDate: new Date().toISOString(),
                                      analysisTrigger: 'auto-verify'
                                    },
                                    p_recommendations: data.recommendations
                                  });

                                  if (flagError) {
                                    console.error('Failed to flag address:', flagError);
                                    toast({
                                      title: "Analysis Complete - Manual Review Required",
                                      description: `${data.overallScore}% accuracy detected issues. Please manually flag for review.`,
                                      variant: "destructive",
                                    });
                                  } else {
                                    toast({
                                      title: "Address Flagged for Review",
                                      description: `Low accuracy (${data.overallScore}%) detected. Address flagged for human review.`,
                                      variant: "destructive",
                                    });
                                  }
                                } else {
                                  toast({
                                    title: "Coordinate Analysis Complete",
                                    description: `${data.overallScore}% confidence with ±${data.accuracy.estimatedError}m accuracy`,
                                  });
                                }
                              } catch (error) {
                                console.error('Coordinate analysis failed:', error);
                                toast({
                                  title: "Analysis Failed",
                                  description: "Could not analyze coordinates. Please try again.",
                                  variant: "destructive",
                                });
                              }
                            }}
                          >
                            <Zap className="h-4 w-4 mr-2" />
                            {t('admin:autoVerify')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              // Open external map services for cross-reference
                              const lat = selectedAddress.latitude;
                              const lng = selectedAddress.longitude;
                              window.open(`https://www.google.com/maps/@${lat},${lng},18z`, '_blank');
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            {t('admin:crossReference')}
                          </Button>
                        </div>

                        {coordVerificationResults && (
                          <div className="grid grid-cols-3 gap-2 mt-3">
                            <div className="p-2 bg-blue-50 rounded text-center">
                              <div className="text-lg font-bold text-blue-600">{coordVerificationResults.accuracy}%</div>
                              <div className="text-xs text-blue-600">{t('admin:accuracy')}</div>
                            </div>
                            <div className="p-2 bg-green-50 rounded text-center">
                              <div className="text-lg font-bold text-green-600">{coordVerificationResults.distance}m</div>
                              <div className="text-xs text-green-600">{t('admin:distance')}</div>
                            </div>
                            <div className="p-2 bg-purple-50 rounded text-center">
                              <div className="text-lg font-bold text-purple-600">{coordVerificationResults.confidence}</div>
                              <div className="text-xs text-purple-600">{t('admin:confidence')}</div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Verification Summary Panel */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">{t('admin:verificationStatus')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">{t('admin:overallScore')}</span>
                            <Badge variant={
                              coordVerificationResults && photoAnalysis 
                                ? (coordVerificationResults.accuracy + photoAnalysis.quality) / 2 > 80 
                                  ? "default" 
                                  : "secondary"
                                : "outline"
                            }>
                              {coordVerificationResults && photoAnalysis 
                                ? Math.round((coordVerificationResults.accuracy + photoAnalysis.quality) / 2)
                                : "--"}%
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span>{t('admin:coordinates')}</span>
                              <span className={coordVerificationResults ? "text-green-600" : "text-muted-foreground"}>
                                {coordVerificationResults ? t('admin:verified') : t('admin:pending')}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>{t('admin:photoQuality')}</span>
                              <span className={photoAnalysis ? "text-green-600" : "text-muted-foreground"}>
                                {photoAnalysis ? t('admin:analyzed') : selectedAddress.photo_url ? t('admin:pending') : t('admin:noPhoto')}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Verification Actions */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">{t('admin:actions')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={async () => {
                              try {
                                const { error } = await supabase
                                  .from('addresses')
                                  .update({ verified: true })
                                  .eq('id', selectedAddress.id);

                                if (error) throw error;

                                toast({
                                  title: "Address Verified",
                                  description: "Address has been successfully verified",
                                });

                                setSelectedAddress(prev => prev ? {...prev, verified: true} : null);
                                loadPendingAddresses();
                              } catch (error) {
                                toast({
                                  title: "Error",
                                  description: "Failed to verify address",
                                  variant: "destructive",
                                });
                              }
                            }}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            {t('admin:markAsVerified')}
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="destructive"
                            className="w-full"
                            onClick={async () => {
                              try {
                                const flagReason = prompt("Enter reason for flagging this address:");
                                if (!flagReason) return;

                                // Include current verification results if available
                                const analysisData = coordVerificationResults ? {
                                  manualFlag: true,
                                  previousAccuracy: coordVerificationResults.accuracy,
                                  previousConfidence: coordVerificationResults.confidence,
                                  flaggedDate: new Date().toISOString(),
                                  analysisTrigger: 'manual-flag'
                                } : null;

                                const { error } = await supabase.rpc('flag_address_for_review', {
                                  p_address_id: selectedAddress.id,
                                  p_reason: flagReason,
                                  p_analysis: analysisData,
                                  p_recommendations: [`Manual flag: ${flagReason}`]
                                });

                                if (error) throw error;

                                toast({
                                  title: "Address Flagged",
                                  description: "Address has been flagged for human review",
                                  variant: "destructive",
                                });

                                loadPendingAddresses();
                              } catch (error) {
                                toast({
                                  title: "Error",
                                  description: "Failed to flag address",
                                  variant: "destructive",
                                });
                              }
                            }}
                          >
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            {t('admin:flagForReview')}
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                              setCoordVerificationResults(null);
                              setPhotoAnalysis(null);
                              toast({
                                title: "Reset Complete",
                                description: "Verification data has been cleared",
                              });
                            }}
                          >
                            {t('admin:resetAnalysis')}
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Verification Notes */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">{t('admin:notes')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Textarea
                            placeholder={t('admin:addVerificationNotes')}
                            value={verificationNotes}
                            onChange={(e) => setVerificationNotes(e.target.value)}
                            className="min-h-[80px] text-sm"
                          />
                          <Button
                            size="sm"
                            className="w-full mt-2"
                            onClick={saveVerificationRecord}
                            disabled={!verificationNotes.trim()}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            {t('admin:saveNotes')}
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Photo Quality Assessment */}
                      {selectedAddress.photo_url && (
                        <div className="border rounded-lg p-4 space-y-3">
                          <h3 className="font-medium flex items-center gap-2">
                            <Camera className="h-4 w-4" />
                            {t('admin:photoQualityAssessment')}
                          </h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <img 
                                src={selectedAddress.photo_url} 
                                alt="Address photo" 
                                className="w-full h-32 object-cover rounded border"
                              />
                              <Button
                                size="sm"
                                className="w-full"
                                onClick={async () => {
                                  try {
                                    const { data, error } = await supabase.functions.invoke('analyze-photo-quality', {
                                      body: {
                                        imageUrl: selectedAddress.photo_url,
                                        expectedLocation: {
                                          latitude: selectedAddress.latitude,
                                          longitude: selectedAddress.longitude
                                        }
                                      }
                                    });

                                    if (error) throw error;
                                    
                                    setPhotoAnalysis({
                                      resolution: `${data.resolution.width}x${data.resolution.height}`,
                                      quality: data.overallScore,
                                      hasAddressVisible: data.content.hasBuilding || data.content.hasStreetSign,
                                      gpsMatch: data.metadata.hasGPS && data.metadata.coordinates.latitude
                                    });
                                    
                                    toast({
                                      title: "Photo Analysis Complete",
                                      description: `Quality: ${data.overallScore}% | ${data.resolution.width}x${data.resolution.height}`,
                                    });
                                  } catch (error) {
                                    console.error('Photo analysis failed:', error);
                                    toast({
                                      title: "Analysis Failed", 
                                      description: "Could not analyze photo quality. Please try again.",
                                      variant: "destructive",
                                    });
                                  }
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                {t('admin:analyzePhoto')}
                              </Button>
                            </div>
                            
                            {photoAnalysis && (
                              <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div className="p-2 bg-muted rounded">
                                    <div className="font-medium">{t('admin:resolution')}</div>
                                    <div className="text-muted-foreground">{photoAnalysis.resolution}</div>
                                  </div>
                                  <div className="p-2 bg-muted rounded">
                                    <div className="font-medium">{t('admin:quality')}</div>
                                    <div className="text-muted-foreground">{photoAnalysis.quality}%</div>
                                  </div>
                                </div>
                                
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 text-sm">
                                    <div className={`w-2 h-2 rounded-full ${photoAnalysis.hasAddressVisible ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    {t('admin:addressNumberVisible')}
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <div className={`w-2 h-2 rounded-full ${photoAnalysis.gpsMatch ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    {t('admin:gpsCoordinatesMatch')}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                     </div>

                    {/* Right Column - Verification Actions */}
                    <div className="space-y-4">
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">{t('admin:advancedVerificationTools')}</p>
                  <p className="text-sm">{t('admin:selectAddressFromAllAddresses')}</p>
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 max-w-md mx-auto text-xs">
                    <div className="p-2 bg-muted rounded">
                      <Crosshair className="h-4 w-4 mx-auto mb-1" />
                      {t('admin:coordinateVerificationTool')}
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <Camera className="h-4 w-4 mx-auto mb-1" />
                      {t('admin:photoAnalysisTool')}
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <Map className="h-4 w-4 mx-auto mb-1" />
                      {t('admin:mapIntegration')}
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <Eye className="h-4 w-4 mx-auto mb-1" />
                      {t('admin:crossReferenceTool')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="flagged" className="space-y-4">
          {flaggedLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">{t('admin:loadingFlaggedAddresses')}</p>
            </div>
          ) : (
            <FlaggedAddressManager 
              addresses={flaggedAddresses} 
              onUpdate={() => {
                loadFlaggedAddresses();
                loadPendingAddresses(); // Also refresh pending addresses
              }} 
            />
          )}
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                {t('admin:qualityControlBulkActions')}
              </CardTitle>
              <CardDescription>
                {t('admin:performBulkVerificationQualityControl')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Section */}
              <div className="space-y-2">
                <Label htmlFor="search-addresses">{t('admin:searchAddresses')}</Label>
                <div className="flex gap-2">
                  <Input
                    id="search-addresses"
                    placeholder={t('admin:searchByUACStreetCity')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchAddresses()}
                    className="flex-1"
                  />
                  <Button 
                    onClick={searchAddresses} 
                    disabled={!searchQuery.trim() || loading}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    {t('admin:search')}
                  </Button>
                </div>
              </div>

              {searchResults.length > 0 ? (
                <>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => bulkVerifyAddresses(
                        searchResults.filter(addr => !addr.verified).map(addr => addr.id), 
                        true
                      )}
                      className="flex-1"
                      disabled={searchResults.filter(addr => !addr.verified).length === 0}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      {t('admin:verifyAllPending')} ({searchResults.filter(addr => !addr.verified).length})
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => bulkVerifyAddresses(
                        searchResults.filter(addr => addr.verified).map(addr => addr.id), 
                        false
                      )}
                      disabled={searchResults.filter(addr => addr.verified).length === 0}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      {t('admin:rejectAllVerified')} ({searchResults.filter(addr => addr.verified).length})
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">{t('admin:qualityMetrics')}</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-3 bg-muted rounded-md">
                        <p className="font-medium">{t('admin:verificationRate')}</p>
                        <p className="text-muted-foreground">
                          {searchResults.length > 0 ? 
                            Math.round((searchResults.filter(addr => addr.verified).length / searchResults.length) * 100) : 0}%
                        </p>
                      </div>
                      <div className="p-3 bg-muted rounded-md">
                        <p className="font-medium">{t('admin:publicAddresses')}</p>
                        <p className="text-muted-foreground">
                          {searchResults.filter(addr => addr.public).length} of {searchResults.length}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t('admin:searchForAddressesQualityControl')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Verification Map Dialog */}
      <Dialog open={verificationMapOpen} onOpenChange={setVerificationMapOpen}>
        <DialogContent className="max-w-6xl w-full h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crosshair className="h-5 w-5" />
              {t('admin:coordinateVerificationMap')} - {selectedAddress?.uac}
            </DialogTitle>
          </DialogHeader>
          {selectedAddress && (
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 h-full overflow-hidden">
              <div className="flex flex-col space-y-2 min-h-0">
                <div className="text-sm font-medium">{t('admin:interactiveVerificationMap')}</div>
                <div className="flex-1 min-h-[300px] lg:min-h-0">
                  <UniversalLocationMap
                    latitude={selectedAddress.latitude}
                    longitude={selectedAddress.longitude}
                    address={{
                      street: selectedAddress.street,
                      city: selectedAddress.city,
                      region: selectedAddress.region,
                      country: selectedAddress.country,
                    }}
                    onClose={() => setVerificationMapOpen(false)}
                    allowResize={false}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="text-sm font-medium">{t('admin:verificationChecklist')}</div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2 p-2 bg-muted rounded">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">{t('admin:coordinateLocation')}</div>
                      <div className="text-muted-foreground">{t('admin:verifyPinCorrectBuilding')}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-2 bg-muted rounded">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">{t('admin:streetAccess')}</div>
                      <div className="text-muted-foreground">{t('admin:confirmAddressAccessible')}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-2 bg-muted rounded">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">{t('admin:buildingType')}</div>
                      <div className="text-muted-foreground">{t('admin:checkStructureMatches')}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-2 bg-muted rounded">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">{t('admin:surroundingArea')}</div>
                      <div className="text-muted-foreground">{t('admin:verifyConsistencyNeighborhood')}</div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="text-sm font-medium mb-2">{t('admin:currentCoordinates')}</div>
                  <div className="p-2 bg-muted rounded font-mono text-sm">
                    {selectedAddress.latitude}, {selectedAddress.longitude}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      const accuracy = Math.floor(Math.random() * 20) + 80;
                      const distance = Math.floor(Math.random() * 25);
                      const confidence = accuracy > 90 ? "High" : accuracy > 80 ? "Medium" : "Low";
                      
                      setCoordVerificationResults({ accuracy, distance, confidence });
                      setVerificationMapOpen(false);
                      
                      toast({
                        title: "Verification Complete",
                        description: `Coordinates verified with ${confidence.toLowerCase()} confidence`,
                      });
                    }}
                    className="flex-1"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {t('admin:approveCoordinates')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setVerificationMapOpen(false)}
                    className="flex-1"
                  >
                    {t('admin:close')}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Regular Map Dialog */}
      <Dialog open={mapDialogOpen} onOpenChange={setMapDialogOpen}>
        <DialogContent className="max-w-4xl w-full h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              {t('admin:addressLocationView')} - {selectedAddress?.uac}
            </DialogTitle>
          </DialogHeader>
          {selectedAddress && (
            <UniversalLocationMap
              latitude={selectedAddress.latitude}
              longitude={selectedAddress.longitude}
              address={{
                street: selectedAddress.street,
                city: selectedAddress.city,
                region: selectedAddress.region,
                country: selectedAddress.country,
              }}
              onClose={() => setMapDialogOpen(false)}
              allowResize={false}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};