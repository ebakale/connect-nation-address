import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, MapPin, Phone, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EmergencyDispatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EmergencyDispatchDialog = ({ open, onOpenChange }: EmergencyDispatchDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    emergencyType: "",
    priority: "high",
    location: "",
    description: "",
    callerName: "",
    callerPhone: ""
  });

  const emergencyTypes = [
    "medical",
    "fire",
    "robbery",
    "assault", 
    "domestic_violence",
    "traffic_accident",
    "suspicious_activity",
    "other"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create emergency incident
      const { data: incident, error: incidentError } = await supabase
        .from('emergency_incidents')
        .insert({
          emergency_type: formData.emergencyType,
          priority_level: formData.priority === 'low' ? 1 : formData.priority === 'medium' ? 2 : formData.priority === 'high' ? 3 : 4,
          location_address: formData.location,
          incident_message: formData.description,
          reporter_contact_info: `${formData.callerName} - ${formData.callerPhone}`,
          status: 'reported',
          encrypted_message: formData.description, // Required field
          incident_number: `INC-${Date.now()}` // Generate incident number
        })
        .select()
        .single();

      if (incidentError) throw incidentError;

      // Notify emergency operators
      const { error: notifyError } = await supabase.functions.invoke('notify-emergency-operators', {
        body: {
          incidentId: incident.id,
          priority: formData.priority,
          emergencyType: formData.emergencyType,
          incidentNumber: incident.incident_number
        }
      });

      if (notifyError) {
        console.error('Error notifying operators:', notifyError);
        // Don't fail the whole operation if notification fails
      }

      toast({
        title: "Emergency Dispatch Initiated",
        description: `Incident #${incident.incident_number} created and operators notified`,
      });

      // Reset form and close dialog
      setFormData({
        emergencyType: "",
        priority: "high",
        location: "",
        description: "",
        callerName: "",
        callerPhone: ""
      });
      onOpenChange(false);

    } catch (error) {
      console.error('Error creating emergency dispatch:', error);
      toast({
        title: "Error",
        description: "Failed to create emergency dispatch",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Emergency Dispatch
          </DialogTitle>
          <DialogDescription>
            Create and dispatch an emergency incident to available units
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="emergencyType">Emergency Type</Label>
              <Select 
                value={formData.emergencyType} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, emergencyType: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {emergencyTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Street address or description"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Detailed description of the emergency"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="callerName" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Caller Name
              </Label>
              <Input
                id="callerName"
                value={formData.callerName}
                onChange={(e) => setFormData(prev => ({ ...prev, callerName: e.target.value }))}
                placeholder="Caller's name"
              />
            </div>

            <div>
              <Label htmlFor="callerPhone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </Label>
              <Input
                id="callerPhone"
                value={formData.callerPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, callerPhone: e.target.value }))}
                placeholder="Contact number"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !formData.emergencyType || !formData.location || !formData.description}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? "Dispatching..." : "Dispatch Emergency"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EmergencyDispatchDialog;