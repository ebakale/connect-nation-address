import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { MapPin } from 'lucide-react';

interface AddressRequestFormProps {
  onCancel?: () => void;
  onSuccess?: () => void;
}

export const AddressRequestForm = ({ onCancel, onSuccess }: AddressRequestFormProps) => {
  const [formData, setFormData] = useState({
    country: '',
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
    if (!formData.country || !formData.region || !formData.city || !formData.street || !formData.justification) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        ...formData,
        user_id: user.id,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null
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
        country: '',
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
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                placeholder="e.g., Nigeria"
                required
              />
            </div>
            <div>
              <Label htmlFor="region">State/Region *</Label>
              <Input
                id="region"
                value={formData.region}
                onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                placeholder="e.g., Lagos"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                placeholder="e.g., Ikeja"
                required
              />
            </div>
            <div>
              <Label htmlFor="street">Street Address *</Label>
              <Input
                id="street"
                value={formData.street}
                onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                placeholder="e.g., 123 Allen Avenue"
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
              placeholder="e.g., Apt 4B, Building C"
            />
          </div>

          <div>
            <Label htmlFor="address_type">Address Type</Label>
            <Select value={formData.address_type} onValueChange={(value) => setFormData(prev => ({ ...prev, address_type: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
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
                placeholder="e.g., 6.5244"
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
                placeholder="e.g., 3.3792"
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