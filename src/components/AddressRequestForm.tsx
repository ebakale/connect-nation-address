import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { MapPin, Camera, Upload, X, Image } from 'lucide-react';

interface AddressRequestFormProps {
  onCancel?: () => void;
  onSuccess?: () => void;
}

export const AddressRequestForm = ({ onCancel, onSuccess }: AddressRequestFormProps) => {
  const [formData, setFormData] = useState({
    country: 'Equatorial Guinea',
    region: '',
    city: '',
    street: '',
    building: '',
    latitude: '',
    longitude: '',
    address_type: 'residential',
    description: '',
    justification: ''
  });

  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Regions and cities of Equatorial Guinea
  const regions = [
    'Annobón',
    'Bioko Norte',
    'Bioko Sur',
    'Centro Sur',
    'Djibloho',
    'Kié-Ntem',
    'Litoral',
    'Wele-Nzas'
  ];

  const citiesByRegion: Record<string, string[]> = {
    'Annobón': ['San Antonio de Palé'],
    'Bioko Norte': ['Malabo', 'Rebola', 'Baney'],
    'Bioko Sur': ['Luba', 'Riaba', 'Moca'],
    'Centro Sur': ['Evinayong', 'Acurenam', 'Niefang'],
    'Djibloho': ['Ciudad de la Paz'],
    'Kié-Ntem': ['Ebebiyín', 'Mikomeseng', 'Ncue', 'Nsork Nsomo'],
    'Litoral': ['Bata', 'Mbini', 'Kogo', 'Acalayong'],
    'Wele-Nzas': ['Mongomo', 'Añisoc', 'Aconibe', 'Nsok']
  };

  const availableCities = formData.region ? citiesByRegion[formData.region] || [] : [];
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString()
          }));
          toast({
            title: "Location captured",
            description: "Current location has been added to the request"
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast({
            title: "Location error",
            description: "Could not get current location. Please enter coordinates manually.",
            variant: "destructive"
          });
        }
      );
    } else {
      toast({
        title: "Location not supported",
        description: "Geolocation is not supported by this browser",
        variant: "destructive"
      });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive"
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive"
        });
        return;
      }

      setPhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photo || !user) return null;

    setUploading(true);
    try {
      const fileExt = photo.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('address-photos')
        .upload(fileName, photo);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('address-photos')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit requests",
        variant: "destructive"
      });
      return;
    }

    // Validate required fields
    if (!formData.region || !formData.city || !formData.street || !formData.justification) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Upload photo if selected
      let photoUrl = null;
      if (photo) {
        photoUrl = await uploadPhoto();
        if (!photoUrl) return; // Upload failed
      }

      const requestData = {
        ...formData,
        user_id: user.id,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        photo_url: photoUrl
      };

      const { error } = await supabase
        .from('address_requests')
        .insert(requestData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Address request submitted successfully! You can track its status in the Address Status section."
      });

      // Reset form
      setFormData({
        country: 'Equatorial Guinea',
        region: '',
        city: '',
        street: '',
        building: '',
        latitude: '',
        longitude: '',
        address_type: 'residential',
        description: '',
        justification: ''
      });
      setPhoto(null);
      setPhotoPreview("");

      onSuccess?.();
    } catch (error: any) {
      console.error('Error submitting request:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit address request",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Submit Address Request</CardTitle>
        <CardDescription>
          Request a new address to be added to the national addressing system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                disabled
                className="bg-muted"
              />
            </div>
            <div>
              <Label htmlFor="region">Province/Region *</Label>
              <Select 
                value={formData.region} 
                onValueChange={(value) => {
                  setFormData(prev => ({ ...prev, region: value, city: '' }));
                }}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select a province" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  {regions.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Select 
                value={formData.city} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, city: value }))}
                disabled={!formData.region}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder={formData.region ? "Select a city" : "Select province first"} />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  {availableCities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="street">Street Address *</Label>
              <Input
                id="street"
                value={formData.street}
                onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                placeholder="e.g., Calle de la Independencia 123"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="building">Building/Apartment (Optional)</Label>
            <Input
              id="building"
              value={formData.building}
              onChange={(e) => setFormData(prev => ({ ...prev, building: e.target.value }))}
              placeholder="e.g., Edificio Central, Apt 4B"
            />
          </div>

          <div>
            <Label htmlFor="address_type">Address Type</Label>
            <Select value={formData.address_type} onValueChange={(value) => setFormData(prev => ({ ...prev, address_type: value }))}>
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50">
                <SelectItem value="residential">Residential</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="industrial">Industrial</SelectItem>
                <SelectItem value="government">Government</SelectItem>
                <SelectItem value="educational">Educational</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="latitude">Latitude (Optional)</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                placeholder="e.g., 1.5000"
              />
            </div>
            <div>
              <Label htmlFor="longitude">Longitude (Optional)</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                placeholder="e.g., 9.7500"
              />
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                onClick={getCurrentLocation}
                variant="outline"
                className="w-full"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Get Location
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Additional details about the address or location"
              rows={3}
            />
          </div>

          {/* Photo Upload Section */}
          <div className="space-y-4">
            <Label>Address Photo (Optional)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6">
              {photoPreview ? (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Address preview"
                      className="w-full max-h-64 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={removePhoto}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Photo ready to upload with request
                  </p>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <Image className="h-12 w-12 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">
                    Add a photo of the address location
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => cameraInputRef.current?.click()}
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Take Photo
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Photo
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Max file size: 5MB. Supported formats: JPG, PNG, WEBP
                  </p>
                </div>
              )}
            </div>
            
            {/* Hidden file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          <div>
            <Label htmlFor="justification">Justification *</Label>
            <Textarea
              id="justification"
              value={formData.justification}
              onChange={(e) => setFormData(prev => ({ ...prev, justification: e.target.value }))}
              placeholder="Please explain why this address needs to be added to the system (e.g., new building, missing coverage, business need)"
              rows={4}
              required
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};