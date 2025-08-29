import { useState, useEffect } from 'react';
import { offlineStorage, OfflinePoliceIncident } from '@/lib/offlineStorage';
import { useLocalAuth } from '@/hooks/useLocalAuth';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Plus, MapPin, Clock, User, Shield } from 'lucide-react';
import { toast } from 'sonner';

export const OfflinePoliceIncidentManager = () => {
  const { user } = useLocalAuth();
  const { latitude, longitude, getCurrentPosition } = useGeolocation();
  const [incidents, setIncidents] = useState<OfflinePoliceIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    type: '',
    priority: 'medium' as const,
    description: '',
    address: ''
  });

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    try {
      setLoading(true);
      await offlineStorage.init();
      const data = await offlineStorage.getPoliceIncidents();
      setIncidents(data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (error) {
      console.error('Failed to load incidents:', error);
      toast.error('Failed to load incidents');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to create incidents');
      return;
    }

    if (!latitude || !longitude) {
      toast.error('Location is required. Please get your location first.');
      return;
    }

    if (!formData.type || !formData.description) {
      toast.error('Type and description are required');
      return;
    }

    try {
      const incident: OfflinePoliceIncident = {
        id: crypto.randomUUID(),
        type: formData.type,
        status: 'pending',
        priority: formData.priority,
        description: formData.description,
        location: {
          latitude,
          longitude,
          address: formData.address
        },
        reported_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        synced: false
      };

      await offlineStorage.savePoliceIncident(incident);
      await loadIncidents();
      
      // Reset form
      setFormData({
        type: '',
        priority: 'medium',
        description: '',
        address: ''
      });
      setShowForm(false);
      
      toast.success('Incident created successfully (offline)');
    } catch (error) {
      console.error('Failed to create incident:', error);
      toast.error('Failed to create incident');
    }
  };

  const updateIncidentStatus = async (incidentId: string, status: OfflinePoliceIncident['status']) => {
    try {
      const incident = incidents.find(i => i.id === incidentId);
      if (!incident) return;

      const updated = {
        ...incident,
        status,
        updated_at: new Date().toISOString(),
        synced: false
      };

      await offlineStorage.savePoliceIncident(updated);
      await loadIncidents();
      
      toast.success(`Incident status updated to ${status}`);
    } catch (error) {
      console.error('Failed to update incident:', error);
      toast.error('Failed to update incident');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading incidents...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="w-6 h-6" />
          Police Incidents (Offline)
        </h2>
        <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Incident
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Incident</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Location</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={getCurrentPosition}
                    className="flex items-center gap-2"
                  >
                    <MapPin className="w-4 h-4" />
                    Get Current Location
                  </Button>
                  {latitude && longitude && (
                    <Badge variant="secondary">
                      {latitude.toFixed(6)}, {longitude.toFixed(6)}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Incident Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select incident type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="theft">Theft</SelectItem>
                      <SelectItem value="assault">Assault</SelectItem>
                      <SelectItem value="traffic_accident">Traffic Accident</SelectItem>
                      <SelectItem value="domestic_violence">Domestic Violence</SelectItem>
                      <SelectItem value="burglary">Burglary</SelectItem>
                      <SelectItem value="vandalism">Vandalism</SelectItem>
                      <SelectItem value="drug_offense">Drug Offense</SelectItem>
                      <SelectItem value="public_disturbance">Public Disturbance</SelectItem>
                      <SelectItem value="emergency_medical">Emergency Medical</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as any }))}
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

              <div className="space-y-2">
                <Label htmlFor="address">Address/Location Description</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Street address or location description"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed description of the incident..."
                  rows={4}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={!latitude || !longitude}>
                  Create Incident
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {incidents.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No incidents recorded yet</p>
            </CardContent>
          </Card>
        ) : (
          incidents.map((incident) => (
            <Card key={incident.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{incident.type.replace('_', ' ').toUpperCase()}</h3>
                      <Badge className={getPriorityColor(incident.priority)}>
                        {incident.priority.toUpperCase()}
                      </Badge>
                      <Badge className={getStatusColor(incident.status)}>
                        {incident.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      {!incident.synced && (
                        <Badge variant="outline" className="text-orange-700 border-orange-200">
                          Offline
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(incident.created_at).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {incident.location.address || `${incident.location.latitude.toFixed(4)}, ${incident.location.longitude.toFixed(4)}`}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {incident.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => updateIncidentStatus(incident.id, 'in_progress')}
                      >
                        Start
                      </Button>
                    )}
                    {incident.status === 'in_progress' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateIncidentStatus(incident.id, 'resolved')}
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
                
                <p className="text-sm mb-4">{incident.description}</p>
                
                {incident.assigned_units && incident.assigned_units.length > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4" />
                    <span>Assigned Units: {incident.assigned_units.join(', ')}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};