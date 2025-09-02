import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { 
  Users, MapPin, Radio, Car, Crown, User, Shield, 
  Activity, Clock, Target, ArrowLeft, RefreshCw, Search, Filter 
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
  const [refreshing, setRefreshing] = useState(false);
  const [userCity, setUserCity] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stats, setStats] = useState({
    totalUnits: 0,
    totalOfficers: 0,
    availableUnits: 0,
    onDutyUnits: 0,
    unassignedUnits: 0
  });

  const fetchUserCity = async () => {
    if (!user?.id) return;
    
    try {
      const { data: roleData, error } = await supabase
        .from('user_roles')
        .select(`
          role,
          user_role_metadata!fk_user_role_metadata_user_role(scope_type, scope_value)
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

  const fetchUnitsData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
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

      setUnits(unitsData || []);
      
      // Calculate statistics
      const uniqueOfficerIds = new Set<string>(
        (unitsData || []).flatMap(unit =>
          (unit.emergency_unit_members || []).map(member => member.officer_id)
        )
      );
      
      const stats = {
        totalUnits: unitsData?.length || 0,
        totalOfficers: uniqueOfficerIds.size,
        availableUnits: unitsData?.filter(unit => unit.status === 'available').length || 0,
        onDutyUnits: unitsData?.filter(unit => 
          ['dispatched', 'busy', 'on_duty', 'on_call'].includes(unit.status)
        ).length || 0,
        unassignedUnits: unitsData?.filter(unit => (unit.emergency_unit_members?.length || 0) === 0).length || 0
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
      setRefreshing(false);
    }
  }, [userCity, toast]);

  useEffect(() => {
    fetchUserCity();
  }, [user]);

  useEffect(() => {
    if (userCity) {
      fetchUnitsData();
    }
  }, [userCity, fetchUnitsData]);

  // Filtered and sorted units
  const filteredUnits = useMemo(() => {
    let filtered = units;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(unit =>
        unit.unit_code.toLowerCase().includes(query) ||
        unit.unit_name.toLowerCase().includes(query) ||
        unit.unit_type.toLowerCase().includes(query) ||
        unit.emergency_unit_members.some(member =>
          member.profiles.full_name.toLowerCase().includes(query)
        )
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(unit => unit.status === statusFilter);
    }

    // Sort by priority: available first, then by unit code
    return filtered.sort((a, b) => {
      if (a.status === 'available' && b.status !== 'available') return -1;
      if (a.status !== 'available' && b.status === 'available') return 1;
      return a.unit_code.localeCompare(b.unit_code);
    });
  }, [units, searchQuery, statusFilter]);

  const handleRefresh = useCallback(() => {
    fetchUnitsData(true);
  }, [fetchUnitsData]);

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
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-20" />
          <div className="flex-1">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        
        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Units Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-fit">
              <CardHeader>
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-4 w-32" />
                <div className="flex gap-2 mt-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <Separator />
                <div className="space-y-3">
                  <Skeleton className="h-4 w-32" />
                  {[...Array(2)].map((_, j) => (
                    <div key={j} className="border rounded-lg p-3 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button at Top */}
      {onClose && (
        <Button variant="outline" size="sm" onClick={onClose}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      )}
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-xl font-bold">Emergency Units Overview</h1>
          <p className="text-muted-foreground">
            {userCity ? `Units in ${userCity}` : 'Complete view of all units and their composition'}
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm" disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search units, officers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'available', 'dispatched', 'busy', 'unavailable'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className="capitalize"
            >
              {status === 'all' ? 'All Status' : status}
            </Button>
          ))}
        </div>
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
              Unassigned Units
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.unassignedUnits}</div>
          </CardContent>
        </Card>
      </div>

      {/* Results Summary */}
      {searchQuery || statusFilter !== 'all' ? (
        <div className="text-sm text-muted-foreground">
          Showing {filteredUnits.length} of {units.length} units
          {searchQuery && ` matching "${searchQuery}"`}
          {statusFilter !== 'all' && ` with status "${statusFilter}"`}
        </div>
      ) : null}

      {/* Units Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredUnits.map((unit) => (
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

      {filteredUnits.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            {units.length === 0 ? (
              <>
                <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Units Found</h3>
                <p className="text-muted-foreground">
                  No emergency units have been created yet. Contact an administrator to set up units.
                </p>
              </>
            ) : (
              <>
                <Filter className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Matching Units</h3>
                <p className="text-muted-foreground">
                  No units match your current search criteria. Try adjusting your filters.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};