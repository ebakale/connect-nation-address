import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
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
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loadingIncidents, setLoadingIncidents] = useState(false);
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
  const { roleMetadata } = useUserRole();
  const { user } = useAuth();
  // Fetch incidents in supervisor's area
  useEffect(() => {
    if (open && roleMetadata?.length > 0) {
      fetchIncidents();
    }
  }, [open, roleMetadata]);

  const fetchIncidents = async () => {
    if (!roleMetadata?.[0]?.scope_value) return;
    
    setLoadingIncidents(true);
    try {
      const { data, error } = await supabase
        .from('emergency_incidents')
        .select('id, incident_number, incident_uac, location_address, assigned_units, status, priority_level')
        .eq('city', roleMetadata[0].scope_value)
        .in('status', ['reported', 'dispatched', 'responding', 'on_scene'])
        .not('assigned_units', 'is', null)
        .order('priority_level', { ascending: false })
        .order('reported_at', { ascending: false });

      if (error) throw error;
      
      // Filter out incidents with empty assigned_units arrays
      const filteredData = (data || []).filter(incident => 
        incident.assigned_units && incident.assigned_units.length > 0
      );
      
      setIncidents(filteredData);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      toast({
        title: "Error",
        description: "Failed to load incidents",
        variant: "destructive"
      });
    } finally {
      setLoadingIncidents(false);
    }
  };

  const handleIncidentSelect = (incidentId: string) => {
    const selectedIncident = incidents.find(inc => inc.id === incidentId);
    if (selectedIncident) {
      setFormData(prev => ({
        ...prev,
        incident_id: selectedIncident.id,
        incident_number: selectedIncident.incident_number,
        requesting_unit_code: selectedIncident.assigned_units?.[0] || '',
        requesting_unit_name: selectedIncident.assigned_units?.[0] || '',
        location: selectedIncident.incident_uac || selectedIncident.location_address || ''
      }));
    }
  };

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
        body: { ...formData, requested_by_user_id: user?.id }
      });

      if (error) throw error;

      // Notify local listeners to refresh panels immediately
      window.dispatchEvent(new CustomEvent('backup-request:sent', { detail: { incident_id: formData.incident_id } }));

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
          <div>
            <Label htmlFor="incident_select">Select Incident *</Label>
            <Select value={formData.incident_id || undefined} onValueChange={handleIncidentSelect} disabled={loadingIncidents}>
              <SelectTrigger>
                <SelectValue placeholder={loadingIncidents ? "Loading incidents..." : "Select an incident"} />
              </SelectTrigger>
              <SelectContent className="z-50 bg-popover">
                {incidents.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">No incidents found</div>
                ) : (
                  incidents.map((incident) => (
                    <SelectItem key={incident.id} value={incident.id}>
                      {incident.incident_number} · UAC {incident.incident_uac} · {incident.status} (P{incident.priority_level})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="incident_id">Incident ID</Label>
              <Input
                id="incident_id"
                value={formData.incident_id}
                readOnly
                className="bg-muted"
              />
            </div>
            <div>
              <Label htmlFor="incident_number">Incident Number</Label>
              <Input
                id="incident_number"
                value={formData.incident_number}
                readOnly
                className="bg-muted"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="unit_code">Assigned Unit Code</Label>
              <Input
                id="unit_code"
                value={formData.requesting_unit_code}
                readOnly
                className="bg-muted"
                placeholder="Will be populated from incident"
              />
            </div>
            <div>
              <Label htmlFor="unit_name">Unit Name</Label>
              <Input
                id="unit_name"
                value={formData.requesting_unit_name}
                readOnly
                className="bg-muted"
                placeholder="Will be populated from incident"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location">Incident UAC</Label>
            <Input
              id="location"
              value={formData.location}
              readOnly
              className="bg-muted"
              placeholder="Will be populated from incident"
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