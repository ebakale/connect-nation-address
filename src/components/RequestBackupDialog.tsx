import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RequestBackupDialogProps {
  children: React.ReactNode;
  incidentId?: string;
  incidentNumber?: string;
  unitCode?: string;
  unitName?: string;
}

export function RequestBackupDialog({ 
  children, 
  incidentId,
  incidentNumber,
  unitCode,
  unitName 
}: RequestBackupDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    incident_id: incidentId || '',
    incident_number: incidentNumber || '',
    requesting_unit_code: unitCode || '',
    requesting_unit_name: unitName || '',
    reason: '',
    priority_level: 2,
    location: ''
  });

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.incident_id || !formData.requesting_unit_code || !formData.reason || !formData.location) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('process-backup-request', {
        body: formData
      });

      if (error) throw error;

      toast({
        title: "Backup Request Sent",
        description: `Regional backup has been requested. ${data.notifications_sent} supervisors/dispatchers have been notified.`,
        variant: "default"
      });

      setOpen(false);
      setFormData({
        incident_id: incidentId || '',
        incident_number: incidentNumber || '',
        requesting_unit_code: unitCode || '',
        requesting_unit_name: unitName || '',
        reason: '',
        priority_level: 2,
        location: ''
      });

    } catch (error: any) {
      console.error('Error requesting backup:', error);
      toast({
        title: "Request Failed",
        description: error.message || "Failed to send backup request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Request Regional Backup
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="incident_id">Incident ID *</Label>
              <Input
                id="incident_id"
                value={formData.incident_id}
                onChange={(e) => setFormData(prev => ({ ...prev, incident_id: e.target.value }))}
                placeholder="Enter incident ID"
                required
              />
            </div>
            <div>
              <Label htmlFor="incident_number">Incident Number</Label>
              <Input
                id="incident_number"
                value={formData.incident_number}
                onChange={(e) => setFormData(prev => ({ ...prev, incident_number: e.target.value }))}
                placeholder="e.g., INC-2024-000123"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="unit_code">Your Unit Code *</Label>
              <Input
                id="unit_code"
                value={formData.requesting_unit_code}
                onChange={(e) => setFormData(prev => ({ ...prev, requesting_unit_code: e.target.value }))}
                placeholder="e.g., UNIT-001"
                required
              />
            </div>
            <div>
              <Label htmlFor="unit_name">Unit Name</Label>
              <Input
                id="unit_name"
                value={formData.requesting_unit_name}
                onChange={(e) => setFormData(prev => ({ ...prev, requesting_unit_name: e.target.value }))}
                placeholder="Unit name"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location">Incident Location *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Enter incident location"
              required
            />
          </div>

          <div>
            <Label htmlFor="priority">Priority Level</Label>
            <Select 
              value={formData.priority_level.toString()} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, priority_level: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">🔴 Critical (1)</SelectItem>
                <SelectItem value="2">🟡 High (2)</SelectItem>
                <SelectItem value="3">🟢 Medium (3)</SelectItem>
                <SelectItem value="4">⚪ Low (4)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="reason">Reason for Backup Request *</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Describe why backup is needed (e.g., multiple suspects, crowd control, medical emergency)"
              rows={3}
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Sending..." : "Send Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}