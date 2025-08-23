import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { 
  Eye, MapPin, Clock, User, Phone, MessageSquare, 
  AlertTriangle, Calendar, Shield, Navigation
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EmergencyIncident {
  id: string;
  incident_number: string;
  emergency_type: string;
  priority_level: number;
  status: string;
  reported_at: string;
  dispatched_at?: string;
  responded_at?: string;
  resolved_at?: string;
  assigned_operator_id?: string;
  assigned_units?: string[];
  dispatcher_notes?: string;
  language_code: string;
}

interface DecryptedIncident {
  id: string;
  incident_number: string;
  emergency_type: string;
  priority_level: number;
  status: string;
  reported_at: string;
  dispatched_at?: string;
  responded_at?: string;
  resolved_at?: string;
  assigned_operator_id?: string;
  assigned_units?: string[];
  dispatcher_notes?: string;
  language_code: string;
  latitude?: number;
  longitude?: number;
  message?: string;
  contact_info?: string;
  address?: string;
  location_accuracy?: number;
}

interface IncidentDetailDialogProps {
  incident: EmergencyIncident;
}

const IncidentDetailDialog = ({ incident }: IncidentDetailDialogProps) => {
  const [decryptedData, setDecryptedData] = useState<DecryptedIncident | null>(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);

  const loadDecryptedData = async () => {
    setLoading(true);
    try {
      const { data: response, error } = await supabase.functions.invoke('decrypt-incident-data', {
        body: { incidentId: incident.id }
      });

      if (error) throw error;

      if (response?.success) {
        setDecryptedData(response.incident);
      } else {
        throw new Error('Failed to decrypt incident data');
      }
    } catch (error) {
      console.error('Error loading incident details:', error);
      toast.error('Failed to load incident details');
    } finally {
      setLoading(false);
    }
  };

  const loadIncidentLogs = async () => {
    try {
      const { data: logsData, error } = await supabase
        .from('emergency_incident_logs')
        .select(`
          *,
          profiles!emergency_incident_logs_user_id_fkey (
            full_name
          )
        `)
        .eq('incident_id', incident.id)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      setLogs(logsData || []);
    } catch (error) {
      console.error('Error loading incident logs:', error);
    }
  };

  useEffect(() => {
    loadIncidentLogs();
  }, [incident.id]);

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'bg-red-100 text-red-800 border-red-200';
      case 2: return 'bg-orange-100 text-orange-800 border-orange-200';
      case 3: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 4: return 'bg-blue-100 text-blue-800 border-blue-200';
      case 5: return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported': return 'bg-red-100 text-red-800';
      case 'dispatched': return 'bg-orange-100 text-orange-800';
      case 'responding': return 'bg-blue-100 text-blue-800';
      case 'on_scene': return 'bg-purple-100 text-purple-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" onClick={loadDecryptedData}>
          <Eye className="h-4 w-4 mr-1" />
          Details
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Incident Details: {incident.incident_number}
          </DialogTitle>
          <DialogDescription>
            Confidential emergency incident information
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Decrypting incident data...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Incident Number</label>
                    <p className="font-mono text-lg">{incident.incident_number}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Emergency Type</label>
                    <p className="text-lg capitalize">{incident.emergency_type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Priority Level</label>
                    <Badge className={getPriorityColor(incident.priority_level)}>
                      Priority {incident.priority_level}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Current Status</label>
                    <Badge className={getStatusColor(incident.status)}>
                      {incident.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Reported At</label>
                    <p className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(incident.reported_at).toLocaleString()}
                    </p>
                  </div>
                  {incident.dispatched_at && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Dispatched At</label>
                      <p className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {new Date(incident.dispatched_at).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sensitive Information */}
            {decryptedData && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-lg text-red-800">
                    Sensitive Information (Encrypted)
                  </CardTitle>
                  <CardDescription className="text-red-600">
                    This information is encrypted and access is logged
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {decryptedData.message && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Emergency Message
                      </label>
                      <p className="mt-1 p-3 bg-white rounded border">{decryptedData.message}</p>
                    </div>
                  )}
                  
                  {decryptedData.contact_info && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Contact Information
                      </label>
                      <p className="mt-1 font-mono">{decryptedData.contact_info}</p>
                    </div>
                  )}
                  
                  {decryptedData.latitude && decryptedData.longitude && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Location Coordinates
                      </label>
                      <div className="mt-1 space-y-2">
                        <p className="font-mono">
                          {decryptedData.latitude.toFixed(6)}, {decryptedData.longitude.toFixed(6)}
                        </p>
                        {decryptedData.location_accuracy && (
                          <p className="text-sm text-muted-foreground">
                            Accuracy: ±{decryptedData.location_accuracy.toFixed(0)}m
                          </p>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            const url = `https://www.google.com/maps?q=${decryptedData.latitude},${decryptedData.longitude}`;
                            window.open(url, '_blank');
                          }}
                        >
                          <Navigation className="h-4 w-4 mr-1" />
                          Open in Maps
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Assignment Information */}
            {(incident.assigned_units?.length || incident.dispatcher_notes) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Assignment & Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {incident.assigned_units && incident.assigned_units.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Assigned Units
                      </label>
                      <div className="mt-1 flex gap-2">
                        {incident.assigned_units.map((unit, index) => (
                          <Badge key={index} variant="secondary">{unit}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {incident.dispatcher_notes && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Dispatcher Notes</label>
                      <p className="mt-1 p-3 bg-muted rounded">{incident.dispatcher_notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Activity Log */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Activity Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {logs.map((log, index) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 bg-muted rounded">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{log.action.replace('_', ' ').toUpperCase()}</span>
                          <span className="text-sm text-muted-foreground">
                            by {log.profiles?.full_name || 'System'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                        {log.details && (
                          <pre className="text-xs mt-2 text-muted-foreground">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {logs.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      No activity logs available
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default IncidentDetailDialog;