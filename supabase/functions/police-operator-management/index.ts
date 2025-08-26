import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has supervisor or admin role
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);
    
    const hasSupervisorRole = userRoles?.some(r => 
      ['police_supervisor', 'police_admin', 'admin'].includes(r.role)
    );

    if (!hasSupervisorRole) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, data } = await req.json();

    let result;
    
    switch (action) {
      case 'getActiveOperators':
        const { data: sessions, error: sessionsError } = await supabase
          .from('emergency_operator_sessions')
          .select(`
            *,
            profiles (full_name, email)
          `)
          .eq('status', 'active')
          .is('session_end', null)
          .order('session_start', { ascending: false });

        if (sessionsError) throw sessionsError;

        result = { success: true, data: sessions };
        break;

      case 'getOperatorPerformance':
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30); // Last 30 days

        const { data: performance, error: perfError } = await supabase
          .from('emergency_incident_logs')
          .select(`
            user_id,
            action,
            timestamp,
            profiles (full_name)
          `)
          .gte('timestamp', startDate.toISOString())
          .in('action', ['incident_created', 'incident_resolved', 'units_assigned']);

        if (perfError) throw perfError;

        // Process performance data
        const operatorStats: Record<string, any> = {};
        performance?.forEach(log => {
          if (!operatorStats[log.user_id]) {
            operatorStats[log.user_id] = {
              name: log.profiles?.full_name || 'Unknown',
              incidents_created: 0,
              incidents_resolved: 0,
              units_assigned: 0
            };
          }
          if (log.action === 'incident_created') operatorStats[log.user_id].incidents_created++;
          if (log.action === 'incident_resolved') operatorStats[log.user_id].incidents_resolved++;
          if (log.action === 'units_assigned') operatorStats[log.user_id].units_assigned++;
        });

        result = { success: true, data: Object.values(operatorStats) };
        break;

      case 'assignShift':
        const { error: shiftError } = await supabase
          .from('emergency_operator_sessions')
          .update({
            status: data.status,
            updated_at: new Date().toISOString()
          })
          .eq('operator_id', data.operatorId)
          .is('session_end', null);

        if (shiftError) throw shiftError;

        result = { success: true, message: 'Operator shift updated' };
        break;

      case 'getIncidentStats':
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { data: todayIncidents, error: todayError } = await supabase
          .from('emergency_incidents')
          .select('status, priority_level, emergency_type')
          .gte('reported_at', today.toISOString());

        if (todayError) throw todayError;

        const stats: any = {
          total_today: todayIncidents?.length || 0,
          by_status: {},
          by_priority: {},
          by_type: {}
        };

        todayIncidents?.forEach(incident => {
          stats.by_status[incident.status] = (stats.by_status[incident.status] || 0) + 1;
          stats.by_priority[incident.priority_level] = (stats.by_priority[incident.priority_level] || 0) + 1;
          stats.by_type[incident.emergency_type] = (stats.by_type[incident.emergency_type] || 0) + 1;
        });

        result = { success: true, data: stats };
        break;

      case 'getDispatchersInScope':
        // Determine supervisor/admin scope
        const { data: rolesWithMeta, error: scopeErr } = await supabase
          .from('user_roles')
          .select('id, role, user_role_metadata(scope_type, scope_value)')
          .eq('user_id', user.id);
        if (scopeErr) throw scopeErr;

        const supScope = (rolesWithMeta || []).find((r: any) => r.role === 'police_supervisor')?.user_role_metadata?.[0];

        let dispatcherUserIds: string[] = [];
        if (supScope && supScope.scope_type && supScope.scope_value) {
          const { data: dispatcherRoles, error: drErr } = await supabase
            .from('user_roles')
            .select('user_id, user_role_metadata!inner(scope_type, scope_value)')
            .eq('role', 'police_dispatcher')
            .eq('user_role_metadata.scope_type', supScope.scope_type)
            .eq('user_role_metadata.scope_value', supScope.scope_value);
          if (drErr) throw drErr;
          dispatcherUserIds = Array.from(new Set((dispatcherRoles || []).map((r: any) => r.user_id)));
        } else {
          // No scope found (admin or unspecific) -> list all dispatchers
          const { data: dispatcherRoles, error: drErr } = await supabase
            .from('user_roles')
            .select('user_id')
            .eq('role', 'police_dispatcher');
          if (drErr) throw drErr;
          dispatcherUserIds = Array.from(new Set((dispatcherRoles || []).map((r: any) => r.user_id)));
        }

        let dispatchers: any[] = [];
        if (dispatcherUserIds.length > 0) {
          const { data: profiles, error: profErr } = await supabase
            .from('profiles')
            .select('user_id, full_name, email')
            .in('user_id', dispatcherUserIds);
          if (profErr) throw profErr;
          dispatchers = (profiles || []).map((p: any) => ({
            id: p.user_id,
            name: p.full_name || p.email || p.user_id,
            role: 'police_dispatcher'
          }));
        }

        result = { success: true, data: dispatchers };
        break;

      default:
        throw new Error('Invalid action');
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Police operator management error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});