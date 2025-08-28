import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { 
  Shield, Star, Clock, MapPin, Phone, Mail, 
  Crown, User, Users as UsersIcon, Calendar, Award, TrendingUp,
  Navigation, Radio, ArrowLeft, ChevronDown, ChevronRight
} from 'lucide-react';

interface OfficerProfile {
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  organization?: string;
  created_at: string;
  user_roles: Array<{ role: string }>;
  emergency_unit_members?: Array<{
    role: string;
    is_lead: boolean;
    joined_at: string;
      emergency_units: {
        unit_code: string;
        unit_name: string;
        unit_type: string;
        status: string;
        coverage_city?: string;
      };
  }>;
}

interface OfficerStats {
  total_incidents: number;
  incidents_responded: number;
  avg_response_time: number;
  units_assigned: number;
  rank_score: number;
}

interface OfficerProfileDashboardProps {
  onClose?: () => void;
}

export const OfficerProfileDashboard: React.FC<OfficerProfileDashboardProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { t } = useTranslation('police');
  const [officers, setOfficers] = useState<OfficerProfile[]>([]);
  const [officerStats, setOfficerStats] = useState<Record<string, OfficerStats>>({});
  const [expandedOfficers, setExpandedOfficers] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    fetchOfficers();
  }, []);

  const fetchOfficers = async () => {
    try {
      // First check the current user's role and scope
      const { data: currentUserRole, error: currentRoleError } = await supabase
        .from('user_roles')
        .select('role, user_role_metadata!fk_user_role_metadata_user_role(scope_type, scope_value)')
        .eq('user_id', user?.id);

      if (currentRoleError) throw currentRoleError;

      const userRole = currentUserRole?.[0]?.role;
      const userScope = currentUserRole?.[0]?.user_role_metadata;
      const userCityMeta = currentUserRole?.flatMap((r: any) => r.user_role_metadata || []).find((m: any) => m.scope_type === 'city');
      const userCity = userCityMeta?.scope_value;

      // Get all profiles with police roles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          user_id,
          full_name,
          email,
          phone,
          organization,
          created_at
        `);

      if (profilesError) throw profilesError;

      // Supervisor with city scope: derive visible officers from unit members in that city
      if (userRole === 'police_supervisor' && userCity) {
        const unitsQuery = supabase
          .from('emergency_unit_members')
          .select(`
            officer_id,
            role,
            is_lead,
            joined_at,
            emergency_units(
              unit_code,
              unit_name,
              unit_type,
              status,
              coverage_city
            )
          `)
          .eq('emergency_units.coverage_city', userCity);

        const { data: cityUnitsMembers, error: cityUnitsError } = await unitsQuery;
        if (cityUnitsError) throw cityUnitsError;

        // Filter out any assignments with null emergency_units
        const validCityUnitsMembers = (cityUnitsMembers || []).filter((m: any) => m.emergency_units !== null);

        const operatorIds: string[] = Array.from(new Set(validCityUnitsMembers.map((m: any) => m.officer_id)));
        const allowedUserIds = new Set<string>([...operatorIds, user?.id as string].filter(Boolean) as string[]);

        const officersWithRoles = (profilesData || [])
          .filter((profile: any) => allowedUserIds.has(profile.user_id))
          .map((profile: any) => {
            const isSupervisorSelf = profile.user_id === user?.id;
            const isOperator = operatorIds.includes(profile.user_id);
            const user_roles = [
              ...(isOperator ? [{ role: 'police_operator' }] : []),
              ...(isSupervisorSelf ? [{ role: 'police_supervisor' }] : []),
            ];
            const emergency_unit_members = isOperator
              ? validCityUnitsMembers.filter((m: any) => m.officer_id === profile.user_id)
              : [];
            return { ...profile, user_roles, emergency_unit_members };
          });

        setOfficers(officersWithRoles);
        for (const officer of officersWithRoles) {
          await fetchOfficerStats(officer.user_id);
        }
        return;
      }

      // Get user roles - filter based on supervisor scope if applicable
      let rolesQuery = supabase
        .from('user_roles')
        .select('user_id, role, user_role_metadata(scope_type, scope_value)')
        .in('role', ['police_operator', 'police_dispatcher', 'police_supervisor']);

      const { data: rolesData, error: rolesError } = await rolesQuery;

      if (rolesError) throw rolesError;

      // Filter officers based on supervisor's scope
      let filteredRoles = rolesData || [];
      
      if (userRole === 'police_supervisor') {
        // If supervisor has scope, only show officers in the same scope
        if (userScope && userScope.length > 0) {
          const supervisorScope = userScope[0];
          filteredRoles = rolesData?.filter(roleData => {
            // Include the supervisor themselves
            if (roleData.user_id === user?.id) return true;
            
            // For operators, check if they're in the same scope (city/region)
            if (roleData.role === 'police_operator') {
              const officerScope = roleData.user_role_metadata?.[0];
              return officerScope && 
                     officerScope.scope_type === supervisorScope.scope_type &&
                     officerScope.scope_value === supervisorScope.scope_value;
            }
            
            // Include dispatchers (they work with all units)
            return roleData.role === 'police_dispatcher';
          }) || [];
        } else {
          // If no scope defined, show all officers (fallback behavior)
          filteredRoles = rolesData || [];
        }
      } else if (userRole === 'police_admin') {
        // Police admins see everyone
        filteredRoles = rolesData || [];
      } else {
        // Regular operators/dispatchers see everyone (for transparency)
        filteredRoles = rolesData || [];
      }

      // Get unit assignments (only for operators)
      const { data: unitsData, error: unitsError } = await supabase
        .from('emergency_unit_members')
        .select(`
          officer_id,
          role,
          is_lead,
          joined_at,
          emergency_units(
            unit_code,
            unit_name,
            unit_type,
            status,
            coverage_city
          )
        `);

      if (unitsError) throw unitsError;

      // Combine the data, showing unit assignments only for operators
      const officersWithRoles = profilesData?.filter(profile => 
        filteredRoles?.some(role => role.user_id === profile.user_id)
      ).map(profile => {
        const userRoles = filteredRoles?.filter(role => role.user_id === profile.user_id) || [];
        const isOperator = userRoles.some(role => role.role === 'police_operator');
        
        return {
          ...profile,
          user_roles: userRoles,
          emergency_unit_members: isOperator 
            ? (unitsData?.filter(unit => unit.officer_id === profile.user_id) || [])
            : [] // Supervisors and dispatchers don't have unit assignments
        };
      }) || [];

      // Filter by city for supervisors: only operators assigned to units in their city
      let finalOfficers = officersWithRoles;
      if (userRole === 'police_supervisor' && userCity) {
        finalOfficers = officersWithRoles.filter(officer => {
          const isOperator = officer.user_roles.some(r => r.role === 'police_operator');
          if (!isOperator) return true; // keep supervisors/dispatchers in view
          return officer.emergency_unit_members?.some(m => m.emergency_units?.coverage_city === userCity);
        });
      }

      setOfficers(finalOfficers);
      
      // Fetch stats for each officer
      for (const officer of finalOfficers) {
        await fetchOfficerStats(officer.user_id);
      }
    } catch (error) {
      console.error('Error fetching officers:', error);
    }
  };

  const fetchOfficerStats = async (officerId: string) => {
    try {
      // Get incident statistics
      const { data: incidentData, error: incidentError } = await supabase
        .from('emergency_incident_logs')
        .select(`
          incident_id,
          action,
          details,
          timestamp,
          emergency_incidents(status, priority_level)
        `)
        .eq('user_id', officerId);

      if (incidentError) throw incidentError;

      // Calculate stats
      const totalIncidents = new Set(incidentData?.map(log => log.incident_id) || []).size;
      const respondedIncidents = incidentData?.filter(log => log.action === 'unit_responded') || [];
      const responseTimes = respondedIncidents
        .map(log => {
          const details = log.details as any;
          return details?.response_time;
        })
        .filter(time => time && typeof time === 'string')
        .map(time => parseInt(time.split(' ')[0]));

      const avgResponseTime = responseTimes.length > 0
        ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
        : 0;

      // Get unit assignments count (only for operators)
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', officerId);
      
      const isOperator = roleData?.some(role => role.role === 'police_operator');
      let unitAssignmentCount = 0;
      
      if (isOperator) {
        const { data: unitData, error: unitError } = await supabase
          .from('emergency_unit_members')
          .select('unit_id')
          .eq('officer_id', officerId);

        if (unitError) throw unitError;
        
        unitAssignmentCount = unitData?.length || 0;
      }

      const stats: OfficerStats = {
        total_incidents: totalIncidents,
        incidents_responded: respondedIncidents.length,
        avg_response_time: avgResponseTime,
        units_assigned: unitAssignmentCount,
        rank_score: calculateRankScore(totalIncidents, respondedIncidents.length, avgResponseTime)
      };

      setOfficerStats(prev => ({ ...prev, [officerId]: stats }));
    } catch (error) {
      console.error(`Error fetching stats for officer ${officerId}:`, error);
    }
  };

  const calculateRankScore = (totalIncidents: number, responded: number, avgResponse: number): number => {
    const responseRate = totalIncidents > 0 ? (responded / totalIncidents) * 100 : 0;
    const timeScore = avgResponse > 0 ? Math.max(0, 100 - avgResponse) : 0;
    return Math.round((responseRate * 0.6) + (timeScore * 0.4));
  };

  const getRoleColor = (role: string): string => {
    switch (role) {
      case 'police_supervisor': return 'bg-purple-500';
      case 'police_dispatcher': return 'bg-blue-500';
      case 'police_operator': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleName = (role: string): string => {
    switch (role) {
      case 'police_supervisor': return t('supervisor');
      case 'police_dispatcher': return t('dispatcher');
      case 'police_operator': return t('operator');
      default: return role;
    }
  };

  const getRankIcon = (score: number) => {
    if (score >= 90) return <Crown className="h-4 w-4 text-yellow-500" />;
    if (score >= 75) return <Star className="h-4 w-4 text-blue-500" />;
    if (score >= 60) return <Award className="h-4 w-4 text-green-500" />;
    return <Shield className="h-4 w-4 text-gray-500" />;
  };

  const getPerformanceBadge = (score: number) => {
    if (score >= 90) return { label: t('excellent'), variant: 'default' as const, color: 'text-yellow-600' };
    if (score >= 75) return { label: t('good'), variant: 'secondary' as const, color: 'text-blue-600' };
    if (score >= 60) return { label: t('average'), variant: 'outline' as const, color: 'text-green-600' };
    return { label: t('needsImprovement'), variant: 'destructive' as const, color: 'text-red-600' };
  };

  const toggleOfficerExpansion = (officerId: string) => {
    setExpandedOfficers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(officerId)) {
        newSet.delete(officerId);
      } else {
        newSet.add(officerId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('officerProfilesAndPerformance')}</h1>
        <p className="text-muted-foreground">{t('viewOfficerProfiles')}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('totalOfficers')}</p>
                <p className="text-2xl font-bold">{officers.length}</p>
              </div>
              <Shield className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('supervisors')}</p>
                <p className="text-2xl font-bold text-purple-600">
                  {officers.filter(o => o.user_roles.some(r => r.role === 'police_supervisor')).length}
                </p>
              </div>
              <Crown className="h-5 w-5 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('dispatchers')}</p>
                <p className="text-2xl font-bold text-blue-600">
                  {officers.filter(o => o.user_roles.some(r => r.role === 'police_dispatcher')).length}
                </p>
              </div>
              <Radio className="h-5 w-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('operators')}</p>
                <p className="text-2xl font-bold text-green-600">
                  {officers.filter(o => o.user_roles.some(r => r.role === 'police_operator')).length}
                </p>
              </div>
              <User className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Officers List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5" />
            Officers List
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {/* Pagination calculations */}
            {(() => {
              const totalPages = Math.ceil(officers.length / ITEMS_PER_PAGE);
              const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
              const paginatedOfficers = officers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
              
              return (
                <>
                  {paginatedOfficers.map((officer) => {
              const stats = officerStats[officer.user_id];
              const primaryRole = officer.user_roles[0]?.role || '';
              const performance = stats ? getPerformanceBadge(stats.rank_score) : null;
              const isExpanded = expandedOfficers.has(officer.user_id);
              
              return (
                <Collapsible key={officer.user_id} open={isExpanded} onOpenChange={() => toggleOfficerExpansion(officer.user_id)}>
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {officer.full_name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{officer.full_name}</h3>
                            <div className={`w-2 h-2 rounded-full ${getRoleColor(primaryRole)}`} />
                          </div>
                          <p className="text-sm text-muted-foreground">{getRoleName(primaryRole)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {stats && (
                          <div className="flex items-center gap-1">
                            {getRankIcon(stats.rank_score)}
                            <span className="text-sm font-medium">{stats.rank_score}</span>
                          </div>
                        )}
                        {performance && (
                          <Badge variant={performance.variant} className={performance.color}>
                            {performance.label}
                          </Badge>
                        )}
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="px-4 pb-4 space-y-4 bg-muted/20">
                      {/* Contact Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Contact Information</h4>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span className="truncate">{officer.email}</span>
                            </div>
                            
                            {officer.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{officer.phone}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{t('joined')} {new Date(officer.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Performance Metrics */}
                        {stats && (
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">Performance Metrics</h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div className="text-center p-2 bg-background rounded">
                                <p className="font-bold text-lg">{stats.total_incidents}</p>
                                <p className="text-muted-foreground">{t('incidents')}</p>
                              </div>
                              <div className="text-center p-2 bg-background rounded">
                                <p className="font-bold text-lg">{stats.incidents_responded}</p>
                                <p className="text-muted-foreground">{t('responded')}</p>
                              </div>
                              <div className="text-center p-2 bg-background rounded">
                                <p className="font-bold text-lg">{stats.avg_response_time}m</p>
                                <p className="text-muted-foreground">{t('avgResponse')}</p>
                              </div>
                              <div className="text-center p-2 bg-background rounded">
                                <p className="font-bold text-lg">{stats.units_assigned}</p>
                                <p className="text-muted-foreground">{t('units')}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Current Unit Assignment - Only show for operators */}
                      {officer.user_roles.some(role => role.role === 'police_operator') && 
                       officer.emergency_unit_members && officer.emergency_unit_members.length > 0 && (
                         <div className="space-y-2">
                           <h4 className="font-medium text-sm">{t('currentAssignment')}</h4>
                           <div className="space-y-2">
                             {officer.emergency_unit_members
                               .filter((assignment) => assignment?.emergency_units)
                               .map((assignment, index) => (
                               <div key={index} className="flex items-center justify-between text-sm bg-background rounded p-3">
                                 <div>
                                   <div className="flex items-center gap-2">
                                     {assignment.is_lead && <Crown className="h-3 w-3 text-yellow-600" />}
                                     <span className="font-medium">{assignment.emergency_units?.unit_code}</span>
                                   </div>
                                   <span className="text-muted-foreground">{assignment.emergency_units?.unit_name}</span>
                                   <div className="text-xs text-muted-foreground">Role: {assignment.role}</div>
                                 </div>
                                 <Badge 
                                   variant="outline" 
                                   className={`${assignment.emergency_units?.status === 'available' ? 'text-green-600' : 'text-blue-600'}`}
                                 >
                                   {assignment.emergency_units?.status}
                                 </Badge>
                               </div>
                             ))}
                           </div>
                         </div>
                       )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4 p-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="min-w-[36px]"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
                </>
              );
            })()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};