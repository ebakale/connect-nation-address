import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Phone, MapPin, Send, Loader2 } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useGeolocation } from "@/hooks/useGeolocation";
import { toast } from "sonner";

interface EmergencyAlertData {
  message: string;
  latitude: number;
  longitude: number;
  emergencyType: string;
  contactInfo?: string;
}

const EmergencyAlertProcessor = () => {
  const { user } = useAuth();
  const { latitude, longitude, getCurrentPosition } = useGeolocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    emergencyType: '',
    message: '',
    contactInfo: ''
  });

  const processEmergencyAlert = async (alertData: EmergencyAlertData) => {
    try {
      const { data, error } = await supabase.functions.invoke('process-emergency-alert', {
        body: {
          ...alertData,
          reporterId: user?.id,
          language: 'en'
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error processing emergency alert:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!latitude || !longitude) {
      toast.error('Location is required for emergency alerts');
      return;
    }

    if (!formData.emergencyType || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const alertData: EmergencyAlertData = {
        emergencyType: formData.emergencyType,
        message: formData.message,
        latitude: latitude,
        longitude: longitude,
        contactInfo: formData.contactInfo || undefined
      };

      await processEmergencyAlert(alertData);
      
      toast.success('Emergency alert sent successfully!');
      setFormData({ emergencyType: '', message: '', contactInfo: '' });
    } catch (error) {
      toast.error('Failed to send emergency alert');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="p-2 bg-red-100 rounded-full">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl text-red-600">Emergency Alert</CardTitle>
        </div>
        <Badge variant="destructive" className="animate-pulse">
          Emergency Services Only
        </Badge>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="emergencyType">Emergency Type *</Label>
            <Select 
              value={formData.emergencyType} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, emergencyType: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select emergency type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fire">Fire Emergency</SelectItem>
                <SelectItem value="medical">Medical Emergency</SelectItem>
                <SelectItem value="police">Police Emergency</SelectItem>
                <SelectItem value="accident">Traffic Accident</SelectItem>
                <SelectItem value="natural_disaster">Natural Disaster</SelectItem>
                <SelectItem value="other">Other Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="message">Emergency Description *</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Describe the emergency situation..."
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="contactInfo">Contact Information</Label>
            <Input
              id="contactInfo"
              type="tel"
              value={formData.contactInfo}
              onChange={(e) => setFormData(prev => ({ ...prev, contactInfo: e.target.value }))}
              placeholder="Phone number (optional)"
            />
          </div>

          {latitude && longitude ? (
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <MapPin className="h-4 w-4" />
                <span className="text-sm font-medium">Location detected</span>
              </div>
              <p className="text-xs text-green-600 mt-1">
                Lat: {latitude.toFixed(6)}, Lon: {longitude.toFixed(6)}
              </p>
            </div>
          ) : (
            <Button 
              type="button" 
              variant="outline" 
              onClick={getCurrentPosition}
              className="w-full"
            >
              <MapPin className="mr-2 h-4 w-4" />
              Get Current Location
            </Button>
          )}

          <Button 
            type="submit" 
            className="w-full bg-red-600 hover:bg-red-700"
            disabled={isSubmitting || !latitude || !longitude}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Alert...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Emergency Alert
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default EmergencyAlertProcessor;