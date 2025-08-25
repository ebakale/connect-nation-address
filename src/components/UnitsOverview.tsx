import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Users, MapPin, Radio, Car, Crown, User, Shield, 
  Activity, Clock, Target, ArrowLeft, RefreshCw 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface OfficerInfo {
  id: string;
  officer_id: string;
  role: string;
  is_lead: boolean;
  joined_at: string;
  profiles: {
    full_name: string;
    email: string;
    phone?: string;
  };
}

interface UnitInfo {
  id: string;
  unit_code: string;
  unit_name: string;
  unit_type: string;
  status: string;
  radio_frequency?: string;
  vehicle_id?: string;
  current_location?: string;
  location_latitude?: number;
  location_longitude?: number;
  location_updated_at?: string;
  created_at: string;
  emergency_unit_members: OfficerInfo[];
}

interface UnitsOverviewProps {
  onClose?: () => void;
}

export const UnitsOverview: React.FC<UnitsOverviewProps> = ({ onClose }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [units, setUnits] = useState<UnitInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCity, setUserCity] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalUnits: 0,
    totalOfficers: 0,
    availableUnits: 0,
    onDutyUnits: 0,
    unassignedOfficers: 0
  });

  useEffect(() => {
    fetchUserCity();
  }, [user]);

  useEffect(() => {
    if (userCity) {
      fetchUnitsData();
    }
  }, [userCity]);

  const fetchUserCity = async () => {
    if (!user?.id) return;
    
    try {
      const { data: roleData, error } = await supabase
        .from('user_roles')
        .select(`
          role,
          user_role_metadata(scope_type, scope_value)
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      // Find city assignment
      const cityMetadata = roleData?.find(role => 
        role.user_role_metadata?.some(meta => meta.scope_type === 'city')
      );
      
      const assignedCity = cityMetadata?.user_role_metadata?.find(meta => meta.scope_type === 'city')?.scope_value || null;
      setUserCity(assignedCity);
    } catch (error) {
      console.error('Error fetching user city:', error);
    }
  };

  const fetchUnitsData = async () => {
    try {
      setLoading(true);
      
      // Fetch units with their members - filtered by user's city
      let query = supabase
        .from('emergency_units')
        .select(`
          *,
          emergency_unit_members(
            id,
            officer_id,
            role,
            is_lead,
            joined_at,
            profiles!emergency_unit_members_officer_id_fkey(
              full_name,
              email,
              phone
            )
          )
        `)
        .order('unit_code');

      // Filter by user's assigned city
      if (userCity) {
        query = query.eq('coverage_city', userCity);
      }

      const { data: unitsData, error: unitsError } = await query;

      if (unitsError) throw unitsError;

      // Fetch all police officers for unassigned count
      const { data: allOfficers, error: officersError } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          role,
          profiles!inner(
            user_id,
            full_name
          )
        `)
        .in('role', ['police_operator', 'police_dispatcher', 'police_supervisor']);

      if (officersError) throw officersError;

      setUnits(unitsData || []);
      
      // Calculate statistics
      const assignedOfficers = (unitsData || []).flatMap(unit => 
        unit.emergency_unit_members.map(member => member.officer_id)
      );
      
      const stats = {
        totalUnits: unitsData?.length || 0,
        totalOfficers: allOfficers?.length || 0,
        availableUnits: unitsData?.filter(unit => unit.status === 'available').length || 0,
        onDutyUnits: unitsData?.filter(unit => unit.status === 'dispatched' || unit.status === 'busy').length || 0,
        unassignedOfficers: (allOfficers?.length || 0) - assignedOfficers.length
      };
      
      setStats(stats);
    } catch (error) {
      console.error('Error fetching units data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch units data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'dispatched': return 'bg-blue-500';
      case 'busy': return 'bg-yellow-500';
      case 'unavailable': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'available': return 'default';
      case 'dispatched': return 'secondary';
      case 'busy': return 'outline';
      case 'unavailable': return 'destructive';
      default: return 'secondary';
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'sergeant': return 'default';
      case 'dispatcher': return 'secondary';
      case 'officer': return 'outline';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        {onClose && (
          <Button variant="outline" size="sm" onClick={onClose}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Emergency Units Overview</h1>
          <p className="text-muted-foreground">
            {userCity ? `Units in ${userCity}` : 'Complete view of all units and their composition'}
          </p>
        </div>
        <Button onClick={fetchUnitsData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-600" />
              Total Units
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalUnits}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              Total Officers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.totalOfficers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-600" />
              Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.availableUnits}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-orange-600" />
              On Duty
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.onDutyUnits}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4 text-amber-600" />
              Unassigned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.unassignedOfficers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Units Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {units.map((unit) => (
          <Card key={unit.id} className="h-fit">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(unit.status)}`} />
                    {unit.unit_code}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground font-medium">{unit.unit_name}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">
                      {unit.unit_type.charAt(0).toUpperCase() + unit.unit_type.slice(1)}
                    </Badge>
                    <Badge variant={getStatusBadgeVariant(unit.status)}>
                      {unit.status.charAt(0).toUpperCase() + unit.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Unit Details */}
              <div className="space-y-2">
                {unit.radio_frequency && (
                  <div className="flex items-center gap-2 text-sm">
                    <Radio className="h-4 w-4 text-muted-foreground" />
                    <span>Radio: {unit.radio_frequency}</span>
                  </div>
                )}
                
                {unit.vehicle_id && (
                  <div className="flex items-center gap-2 text-sm">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    <span>Vehicle: {unit.vehicle_id}</span>
                  </div>
                )}
                
                {unit.current_location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{unit.current_location}</span>
                  </div>
                )}

                {unit.location_updated_at && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Last update: {new Date(unit.location_updated_at).toLocaleString()}</span>
                  </div>
                )}
              </div>

              <Separator />

              {/* Unit Members */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Unit Members ({unit.emergency_unit_members.length})
                  </h4>
                </div>

                {unit.emergency_unit_members.length > 0 ? (
                  <div className="space-y-3">
                    {unit.emergency_unit_members.map((member) => (
                      <div key={member.id} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {member.is_lead ? (
                              <Crown className="h-4 w-4 text-yellow-600" />
                            ) : (
                              <User className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="font-medium">{member.profiles.full_name}</span>
                          </div>
                          <div className="flex gap-1">
                            <Badge variant={getRoleBadgeVariant(member.role)} className="text-xs">
                              {member.role}
                            </Badge>
                            {member.is_lead && (
                              <Badge variant="secondary" className="text-xs">
                                Lead
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>Email: {member.profiles.email}</div>
                          {member.profiles.phone && (
                            <div>Phone: {member.profiles.phone}</div>
                          )}
                          <div>Joined: {new Date(member.joined_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No officers assigned</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {units.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Units Found</h3>
            <p className="text-muted-foreground">
              No emergency units have been created yet. Contact an administrator to set up units.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};