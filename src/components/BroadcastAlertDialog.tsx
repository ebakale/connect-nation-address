import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { RadioTower, Users, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BroadcastAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Unit {
  id: string;
  unit_code: string;
  status: string;
  unit_type: string;
}

const BroadcastAlertDialog = ({ open, onOpenChange }: BroadcastAlertDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    alertType: "general",
    priority: "medium",
    subject: "",
    message: "",
    targetAudience: "all_units"
  });

  const alertTypes = [
    "general",
    "weather",
    "traffic",
    "security",
    "operational",
    "emergency"
  ];

  useEffect(() => {
    if (open) {
      fetchUnits();
    }
  }, [open]);

  const fetchUnits = async () => {
    try {
      const { data, error } = await supabase
        .from('emergency_units')
        .select('id, unit_code, status, unit_type')
        .eq('status', 'available')
        .order('unit_code');

      if (error) throw error;
      setUnits(data || []);
    } catch (error) {
      console.error('Error fetching units:', error);
    }
  };

  const handleUnitSelection = (unitId: string, checked: boolean) => {
    setSelectedUnits(prev => 
      checked 
        ? [...prev, unitId]
        : prev.filter(id => id !== unitId)
    );
  };

  const selectAllUnits = () => {
    setSelectedUnits(units.map(unit => unit.id));
  };

  const clearAllUnits = () => {
    setSelectedUnits([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const recipientUnits = formData.targetAudience === "selected_units" 
        ? selectedUnits 
        : units.map(unit => unit.id);

      if (recipientUnits.length === 0) {
        toast({
          title: "No Recipients",
          description: "Please select at least one unit to broadcast to",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // Send broadcast alert via unit communications edge function
      const { error } = await supabase.functions.invoke('unit-communications', {
        body: {
          type: 'broadcast_alert',
          alert_type: formData.alertType,
          priority: formData.priority,
          subject: formData.subject,
          message: formData.message,
          recipient_units: recipientUnits,
          sender_type: 'emergency_operator'
        }
      });

      if (error) throw error;

      toast({
        title: "Broadcast Alert Sent",
        description: `Alert sent to ${recipientUnits.length} unit(s)`,
      });

      // Reset form and close dialog
      setFormData({
        alertType: "general",
        priority: "medium", 
        subject: "",
        message: "",
        targetAudience: "all_units"
      });
      setSelectedUnits([]);
      onOpenChange(false);

    } catch (error) {
      console.error('Error sending broadcast alert:', error);
      toast({
        title: "Error",
        description: "Failed to send broadcast alert",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-600">
            <RadioTower className="h-5 w-5" />
            Broadcast Alert
          </DialogTitle>
          <DialogDescription>
            Send an alert message to emergency units
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="alertType">Alert Type</Label>
              <Select 
                value={formData.alertType} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, alertType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {alertTypes.map(type => (
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
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Alert subject line"
              required
            />
          </div>

          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Alert message content"
              rows={4}
              required
            />
          </div>

          <div>
            <Label>Target Audience</Label>
            <Select 
              value={formData.targetAudience} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, targetAudience: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_units">All Available Units</SelectItem>
                <SelectItem value="selected_units">Selected Units</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.targetAudience === "selected_units" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Select Units ({selectedUnits.length} selected)
                </Label>
                <div className="space-x-2">
                  <Button type="button" variant="outline" size="sm" onClick={selectAllUnits}>
                    Select All
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={clearAllUnits}>
                    Clear All
                  </Button>
                </div>
              </div>

              <div className="max-h-40 overflow-y-auto border rounded-md p-3 space-y-2">
                {units.map((unit) => (
                  <div key={unit.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={unit.id}
                      checked={selectedUnits.includes(unit.id)}
                      onCheckedChange={(checked) => handleUnitSelection(unit.id, checked as boolean)}
                    />
                    <label htmlFor={unit.id} className="flex items-center gap-2 cursor-pointer flex-1">
                      <span className="font-medium">{unit.unit_code}</span>
                      <Badge variant="secondary" className="text-xs">
                        {unit.unit_type}
                      </Badge>
                      <Badge 
                        variant={unit.status === 'available' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {unit.status}
                      </Badge>
                    </label>
                  </div>
                ))}
                
                {units.length === 0 && (
                  <div className="text-center text-muted-foreground py-4">
                    <AlertTriangle className="h-6 w-6 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No available units</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !formData.subject || !formData.message}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isSubmitting ? "Broadcasting..." : "Send Broadcast"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BroadcastAlertDialog;