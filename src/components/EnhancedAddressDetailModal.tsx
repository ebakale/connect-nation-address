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
  Clock, Shield, Target, Calculator, Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { useEnhancedGeolocation } from '@/hooks/useEnhancedGeolocation';
import { supabase } from '@/integrations/supabase/client';

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
      title: "Copied",
      description: `${label} copied to clipboard`,
    });
  };

  const getDirections = (fromCurrentLocation = true, fromUAC?: string) => {
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
      // Directions from another UAC (would need to resolve UAC to coordinates first)
      toast({
        title: "Feature Coming Soon",
        description: "Directions from UAC will be available in a future update",
      });
      return;
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
        copyToClipboard(shareMessage, 'Address information');
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Address Details
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Address Information */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Address Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Full Address</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-foreground flex-1">{addressText}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(addressText, 'Address')}
                    >
                      {copiedField === 'Address' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-sm font-medium">Unique Address Code (UAC)</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded flex-1">
                      {address.uac}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(address.uac, 'UAC')}
                    >
                      {copiedField === 'UAC' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">GPS Coordinates</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded flex-1">
                      {address.latitude.toFixed(6)}, {address.longitude.toFixed(6)}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(`${address.latitude}, ${address.longitude}`, 'Coordinates')}
                    >
                      {copiedField === 'Coordinates' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2">
                  {address.verified && (
                    <Badge variant="default">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  <Badge variant={getQualityColor(address.completenessScore)}>
                    {address.completenessScore}% Complete
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {address.addressType}
                  </Badge>
                </div>

                {calculatedDistance && (
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="h-4 w-4 text-primary" />
                    <span>Distance from your location: <strong>{formatDistance(calculatedDistance)}</strong></span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* QR Code Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  QR Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <QRCodeGenerator 
                    uac={address.uac}
                    addressText={addressText}
                    variant="button"
                    size="md"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions Panel */}
          <div className="space-y-4">
            {/* Navigation Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Navigation className="h-5 w-5" />
                  Navigation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => getDirections(true)}
                  className="w-full justify-start"
                  variant="default"
                >
                  <Route className="h-4 w-4 mr-2" />
                  Directions from Current Location
                </Button>

                <div className="space-y-2">
                  <Label htmlFor="from-uac" className="text-sm">Get directions from another UAC:</Label>
                  <div className="flex gap-2">
                    <Input
                      id="from-uac"
                      placeholder="Enter UAC..."
                      value={customFromUAC}
                      onChange={(e) => setCustomFromUAC(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      onClick={() => getDirections(false, customFromUAC)}
                      variant="outline"
                      disabled={!customFromUAC.trim()}
                    >
                      <Navigation className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Button 
                  onClick={() => {
                    const url = `https://www.google.com/maps?q=${address.latitude},${address.longitude}`;
                    window.open(url, '_blank');
                  }}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on Google Maps
                </Button>
              </CardContent>
            </Card>

            {/* Sharing Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Share Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={() => shareAddress('whatsapp')}
                    variant="outline"
                    className="justify-start"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                  <Button 
                    onClick={() => shareAddress('email')}
                    variant="outline"
                    className="justify-start"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                  <Button 
                    onClick={() => shareAddress('sms')}
                    variant="outline"
                    className="justify-start"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    SMS
                  </Button>
                  <Button 
                    onClick={() => shareAddress('copy')}
                    variant="outline"
                    className="justify-start"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy All
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Distance Calculator */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Distance Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loadingEstimates && (
                  <div className="flex items-center justify-center text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Getting accurate estimates from Google Maps...
                  </div>
                )}
                
                {location && !loadingEstimates && (
                  <div className="space-y-3">
                    {/* Google Maps Estimates */}
                    {(distanceEstimates.driving || distanceEstimates.walking) && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-primary">Google Maps Estimates:</div>
                        
                        {distanceEstimates.driving && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>🚗 Driving distance:</span>
                              <span className="font-mono">{distanceEstimates.driving.distance}</span>
                            </div>
                            <div className="flex justify-between text-sm text-muted-foreground">
                              <span>Driving time:</span>
                              <span>{distanceEstimates.driving.duration}</span>
                            </div>
                          </div>
                        )}
                        
                        {distanceEstimates.walking && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>🚶 Walking distance:</span>
                              <span className="font-mono">{distanceEstimates.walking.distance}</span>
                            </div>
                            <div className="flex justify-between text-sm text-muted-foreground">
                              <span>Walking time:</span>
                              <span>{distanceEstimates.walking.duration}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Fallback to basic calculation if Google Maps fails */}
                    {!distanceEstimates.driving && !distanceEstimates.walking && calculatedDistance && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Basic Estimates:</div>
                        <div className="flex justify-between text-sm">
                          <span>Straight-line distance:</span>
                          <span className="font-mono">{formatDistance(calculatedDistance)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Est. walking time:</span>
                          <span>{Math.ceil(calculatedDistance / 83)} minutes</span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Est. driving time:</span>
                          <span>{Math.ceil(calculatedDistance / 833)} minutes</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {!location && (
                  <div className="text-sm text-muted-foreground text-center">
                    <Clock className="h-4 w-4 mx-auto mb-1" />
                    Enable location access to see distance information
                    <Button 
                      onClick={() => getCurrentPosition(false)}
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full"
                    >
                      Enable Location
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