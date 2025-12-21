import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  MapPin, Navigation, Share2, QrCode, Copy, Check, 
  Phone, Mail, MessageCircle, ExternalLink, Route,
  Clock, Shield, Target, Calculator, Loader2, Map
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { SaveLocationButton } from "@/components/SaveLocationButton";
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { useEnhancedGeolocation } from '@/hooks/useEnhancedGeolocation';
import { supabase } from '@/integrations/supabase/client';
import GoogleMapsDirectionsView from '@/components/GoogleMapsDirectionsView';

interface AddressData {
  uac: string;
  street: string;
  city: string;
  region: string;
  country: string;
  building?: string;
  latitude: number;
  longitude: number;
  addressType: string;
  verified: boolean;
  completenessScore: number;
  distance?: number;
}

interface EnhancedAddressDetailModalProps {
  address: AddressData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EnhancedAddressDetailModal: React.FC<EnhancedAddressDetailModalProps> = ({
  address,
  open,
  onOpenChange
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [customFromUAC, setCustomFromUAC] = useState('');
  const [calculatedDistance, setCalculatedDistance] = useState<number | null>(null);
  const [distanceEstimates, setDistanceEstimates] = useState<{
    driving?: { distance: string; duration: string };
    walking?: { distance: string; duration: string };
  }>({});
  const [loadingEstimates, setLoadingEstimates] = useState(false);
  const [showInAppDirections, setShowInAppDirections] = useState(false);
  const [directionsOrigin, setDirectionsOrigin] = useState<{ lat: number; lng: number; name: string } | undefined>(undefined);
  const { toast } = useToast();
  const { t } = useTranslation(['common', 'dashboard']);
  const { location, getCurrentPosition } = useEnhancedGeolocation({
    enableHighAccuracy: true,
    enableCaching: true
  });

  useEffect(() => {
    if (open && address && location) {
      // Calculate basic distance from current location
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        address.latitude,
        address.longitude
      );
      setCalculatedDistance(distance);
      
      // Get Google Maps estimates
      getGoogleMapsEstimates();
    }
  }, [open, address, location]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c * 1000; // Distance in meters
  };

  const getGoogleMapsEstimates = async () => {
    if (!address || !location) return;
    
    setLoadingEstimates(true);
    try {
      // Get both driving and walking estimates
      const [drivingResponse, walkingResponse] = await Promise.all([
        supabase.functions.invoke('get-distance-estimates', {
          body: {
            origin: { lat: location.latitude, lng: location.longitude },
            destination: { lat: address.latitude, lng: address.longitude },
            mode: 'driving'
          }
        }),
        supabase.functions.invoke('get-distance-estimates', {
          body: {
            origin: { lat: location.latitude, lng: location.longitude },
            destination: { lat: address.latitude, lng: address.longitude },
            mode: 'walking'
          }
        })
      ]);

      const estimates: any = {};
      
      if (drivingResponse.data && !drivingResponse.error) {
        estimates.driving = {
          distance: drivingResponse.data.distance.text,
          duration: drivingResponse.data.duration.text
        };
      }
      
      if (walkingResponse.data && !walkingResponse.error) {
        estimates.walking = {
          distance: walkingResponse.data.distance.text,
          duration: walkingResponse.data.duration.text
        };
      }
      
      setDistanceEstimates(estimates);
    } catch (error) {
      console.error('Error getting Google Maps estimates:', error);
    } finally {
      setLoadingEstimates(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
    toast({
      title: t('common:copied'),
      description: t('common:copiedToClipboard', { item: label }),
    });
  };

  const getDirections = async (fromCurrentLocation = true, fromUAC?: string) => {
    if (!address) return;

    const { latitude, longitude } = address;
    let url;

    if (fromCurrentLocation) {
      // Directions from current location
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      
      if (isIOS) {
        url = `maps://maps.apple.com/?daddr=${latitude},${longitude}&dirflg=d`;
        // Fallback to Google Maps
        setTimeout(() => {
          window.open(`https://maps.google.com/maps?daddr=${latitude},${longitude}`);
        }, 25);
      } else if (isAndroid) {
        url = `intent://navigate?q=${latitude},${longitude}#Intent;scheme=google.navigation;package=com.google.android.apps.maps;end`;
        // Fallback to web version
        setTimeout(() => {
          window.open(`https://maps.google.com/maps?daddr=${latitude},${longitude}`);
        }, 25);
      } else {
        url = `https://maps.google.com/maps?daddr=${latitude},${longitude}`;
      }
    } else if (fromUAC) {
      // Lookup source UAC coordinates
      try {
        const { data: sourceAddress, error } = await supabase
          .from('addresses')
          .select('latitude, longitude, street, city')
          .eq('uac', fromUAC)
          .single();

        if (error || !sourceAddress?.latitude || !sourceAddress?.longitude) {
          toast({
            title: t('common:error'),
            description: t('common:addressNotFound'),
            variant: 'destructive',
          });
          return;
        }

        // Open Google Maps with directions from source to destination
        url = `https://maps.google.com/maps?saddr=${sourceAddress.latitude},${sourceAddress.longitude}&daddr=${latitude},${longitude}`;
      } catch (err) {
        toast({
          title: t('common:error'),
          description: t('common:addressNotFound'),
          variant: 'destructive',
        });
        return;
      }
    }

    if (url) {
      window.open(url, '_blank');
    }
  };

  const shareAddress = (method: 'whatsapp' | 'email' | 'sms' | 'copy') => {
    if (!address) return;

    const addressText = `${address.building ? address.building + ', ' : ''}${address.street}, ${address.city}, ${address.region}, ${address.country}`;
    const shareMessage = `📍 Address Information
${addressText}

🔖 UAC: ${address.uac}
📊 Coordinates: ${address.latitude.toFixed(5)}, ${address.longitude.toFixed(5)}
✅ Verified: ${address.verified ? 'Yes' : 'No'}
📈 Completeness: ${address.completenessScore}%
${calculatedDistance ? `📏 Distance: ${formatDistance(calculatedDistance)}` : ''}

🌍 View on Maps: https://maps.google.com/maps?q=${address.latitude},${address.longitude}

Shared from Equatorial Guinea Address Portal`;

    switch (method) {
      case 'whatsapp':
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
        window.open(whatsappUrl, '_blank');
        break;
      case 'email':
        const emailSubject = `Address Information - ${addressText}`;
        const emailUrl = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(shareMessage)}`;
        window.open(emailUrl);
        break;
      case 'sms':
        const smsUrl = `sms:?body=${encodeURIComponent(shareMessage)}`;
        window.open(smsUrl);
        break;
      case 'copy':
        copyToClipboard(shareMessage, t('common:addressInformation'));
        break;
    }
  };

  const formatDistance = (distance: number) => {
    if (distance < 1000) return `${Math.round(distance)}m`;
    return `${(distance / 1000).toFixed(1)}km`;
  };

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  if (!address) return null;

  const addressText = `${address.building ? address.building + ', ' : ''}${address.street}, ${address.city}, ${address.region}, ${address.country}`;

  // Show in-app directions view when triggered
  if (showInAppDirections) {
    return (
      <GoogleMapsDirectionsView
        destination={{
          uac: address.uac,
          readable: addressText,
          coordinates: {
            lat: address.latitude,
            lng: address.longitude
          },
          type: address.addressType,
          verified: address.verified
        }}
        origin={directionsOrigin}
        onClose={() => setShowInAppDirections(false)}
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-4 w-4" />
            {t('common:addressDetails')}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Address Information */}
          <div className="space-y-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t('common:addressInformation')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">{t('common:fullAddress')}</Label>
                  <div className="flex items-center gap-1 mt-1">
                    <p className="text-xs text-foreground flex-1">{addressText}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => copyToClipboard(addressText, t('common:address'))}
                    >
                      {copiedField === t('common:address') ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-xs font-medium text-muted-foreground">{t('common:uniqueAddressCode')}</Label>
                  <div className="flex items-center gap-1 mt-1">
                    <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded flex-1">
                      {address.uac}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => copyToClipboard(address.uac, t('common:uac'))}
                    >
                      {copiedField === t('common:uac') ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-medium text-muted-foreground">{t('common:gpsCoordinates')}</Label>
                  <div className="flex items-center gap-1 mt-1">
                    <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded flex-1">
                      {address.latitude.toFixed(4)}, {address.longitude.toFixed(4)}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => copyToClipboard(`${address.latitude}, ${address.longitude}`, t('common:coordinates'))}
                    >
                      {copiedField === t('common:coordinates') ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>

                <div className="flex gap-1 flex-wrap">
                  {address.verified && (
                    <Badge variant="default" className="text-xs px-1.5 py-0.5">
                      <Shield className="h-2 w-2 mr-1" />
                      {t('common:verified')}
                    </Badge>
                  )}
                  <Badge variant={getQualityColor(address.completenessScore)} className="text-xs px-1.5 py-0.5">
                    {address.completenessScore}%
                  </Badge>
                  <Badge variant="outline" className="capitalize text-xs px-1.5 py-0.5">
                    {address.addressType}
                  </Badge>
                </div>

                {(distanceEstimates.driving || distanceEstimates.walking || calculatedDistance) && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Target className="h-3 w-3 text-primary" />
                    <span>{t('common:distance')}: <strong>
                      {distanceEstimates.driving?.distance || distanceEstimates.walking?.distance || formatDistance(calculatedDistance!)}
                    </strong></span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* QR Code Section */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <QrCode className="h-4 w-4" />
                  {t('common:qrCode')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex justify-center">
                  <QRCodeGenerator 
                    uac={address.uac}
                    addressText={addressText}
                    variant="button"
                    size="sm"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions Panel */}
          <div className="space-y-3">
            {/* Navigation Actions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Navigation className="h-4 w-4" />
                  {t('common:navigationLabel')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-2">
                <Button 
                  onClick={() => {
                    setDirectionsOrigin(undefined);
                    setShowInAppDirections(true);
                  }}
                  className="w-full justify-start h-8 text-xs"
                  variant="default"
                  size="sm"
                >
                  <Map className="h-3 w-3 mr-1" />
                  {t('common:directionsFromCurrentLocation')}
                </Button>

                <div className="space-y-1">
                  <Label htmlFor="from-uac" className="text-xs text-muted-foreground">{t('common:getDirectionsFromUAC')}:</Label>
                  <div className="flex gap-1">
                    <Input
                      id="from-uac"
                      placeholder={t('common:enterUAC')}
                      value={customFromUAC}
                      onChange={(e) => setCustomFromUAC(e.target.value)}
                      className="flex-1 h-7 text-xs"
                    />
                    <Button 
                      onClick={async () => {
                        if (!customFromUAC.trim()) return;
                        try {
                          const { data: sourceAddress, error } = await supabase
                            .from('addresses')
                            .select('latitude, longitude, street, city')
                            .eq('uac', customFromUAC)
                            .single();

                          if (error || !sourceAddress?.latitude || !sourceAddress?.longitude) {
                            toast({
                              title: t('common:error'),
                              description: t('common:addressNotFound'),
                              variant: 'destructive',
                            });
                            return;
                          }

                          setDirectionsOrigin({
                            lat: sourceAddress.latitude,
                            lng: sourceAddress.longitude,
                            name: `${sourceAddress.street}, ${sourceAddress.city}`
                          });
                          setShowInAppDirections(true);
                        } catch (err) {
                          toast({
                            title: t('common:error'),
                            description: t('common:addressNotFound'),
                            variant: 'destructive',
                          });
                        }
                      }}
                      variant="outline"
                      disabled={!customFromUAC.trim()}
                      size="sm"
                      className="h-7 w-7 p-0"
                    >
                      <Navigation className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <Button 
                  onClick={() => {
                    const url = `https://www.google.com/maps?q=${address.latitude},${address.longitude}`;
                    window.open(url, '_blank');
                  }}
                  variant="outline"
                  className="w-full justify-start h-8 text-xs"
                  size="sm"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  {t('common:viewOnGoogleMaps')}
                </Button>

                <SaveLocationButton
                  address={{
                    uac: address.uac,
                    street: address.street,
                    city: address.city,
                    region: address.region,
                    country: address.country,
                    building: address.building,
                    latitude: address.latitude,
                    longitude: address.longitude,
                    addressType: address.addressType
                  }}
                  className="w-full h-8 text-xs"
                  variant="outline"
                  size="sm"
                />
              </CardContent>
            </Card>

            {/* Sharing Actions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  {t('common:shareAddress')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-2">
                <div className="grid grid-cols-2 gap-1">
                  <Button 
                    onClick={() => shareAddress('whatsapp')}
                    variant="outline"
                    className="justify-start h-7 text-xs"
                    size="sm"
                  >
                    <MessageCircle className="h-3 w-3 mr-1" />
                    WhatsApp
                  </Button>
                  <Button 
                    onClick={() => shareAddress('email')}
                    variant="outline"
                    className="justify-start h-7 text-xs"
                    size="sm"
                  >
                    <Mail className="h-3 w-3 mr-1" />
                    Email
                  </Button>
                  <Button 
                    onClick={() => shareAddress('sms')}
                    variant="outline"
                    className="justify-start h-7 text-xs"
                    size="sm"
                  >
                    <Phone className="h-3 w-3 mr-1" />
                    SMS
                  </Button>
                  <Button 
                    onClick={() => shareAddress('copy')}
                    variant="outline"
                    className="justify-start h-7 text-xs"
                    size="sm"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    {t('common:copyAll')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Distance Calculator */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  {t('common:distanceInformation')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-2">
                {loadingEstimates && (
                  <div className="flex items-center justify-center text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    {t('common:gettingEstimates')}
                  </div>
                )}
                
                {location && !loadingEstimates && (
                  <div className="space-y-2">
                    {/* Google Maps Estimates */}
                    {(distanceEstimates.driving || distanceEstimates.walking) && (
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-primary">{t('common:googleMaps')}:</div>
                        
                        {distanceEstimates.driving && (
                          <div className="space-y-0.5">
                            <div className="flex justify-between text-xs">
                              <span>🚗 {t('common:drive')}:</span>
                              <span className="font-mono">{distanceEstimates.driving.distance}</span>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>{t('common:time')}:</span>
                              <span>{distanceEstimates.driving.duration}</span>
                            </div>
                          </div>
                        )}
                        
                        {distanceEstimates.walking && (
                          <div className="space-y-0.5">
                            <div className="flex justify-between text-xs">
                              <span>🚶 {t('common:walk')}:</span>
                              <span className="font-mono">{distanceEstimates.walking.distance}</span>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>{t('common:time')}:</span>
                              <span>{distanceEstimates.walking.duration}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Fallback to basic calculation if Google Maps fails */}
                    {!distanceEstimates.driving && !distanceEstimates.walking && calculatedDistance && (
                      <div className="space-y-1">
                        <div className="text-xs font-medium">{t('common:basicEstimates')}:</div>
                        <div className="flex justify-between text-xs">
                          <span>{t('common:distance')}:</span>
                          <span className="font-mono">{formatDistance(calculatedDistance)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{t('common:walkSpeed')}:</span>
                          <span>{Math.ceil(calculatedDistance / 83)} min</span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{t('common:driveSpeed')}:</span>
                          <span>{Math.ceil(calculatedDistance / 833)} min</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {!location && (
                  <div className="text-xs text-muted-foreground text-center">
                    <Clock className="h-3 w-3 mx-auto mb-1" />
                    {t('common:enableLocationForDistance')}
                    <Button 
                      onClick={() => getCurrentPosition(false)}
                      variant="outline"
                      size="sm"
                      className="mt-1 w-full h-6 text-xs"
                    >
                      {t('common:enableLocation')}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};