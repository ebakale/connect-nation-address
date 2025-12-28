import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const timeRange = url.searchParams.get('timeRange') || '30d';

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Fetch all orders within time range
    const { data: orders, error: ordersError } = await supabaseClient
      .from('delivery_orders')
      .select('*')
      .gte('created_at', startDate.toISOString());

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      throw ordersError;
    }

    // Calculate status counts
    const statusCounts = {
      pending_intake: 0,
      ready_for_assignment: 0,
      assigned: 0,
      out_for_delivery: 0,
      delivered: 0,
      failed_delivery: 0,
      address_not_found: 0,
      returned_to_sender: 0,
    };

    orders?.forEach((order) => {
      if (statusCounts.hasOwnProperty(order.status)) {
        statusCounts[order.status as keyof typeof statusCounts]++;
      }
    });

    // Calculate package type distribution
    const packageTypeCounts: Record<string, number> = {};
    orders?.forEach((order) => {
      const type = order.package_type || 'other';
      packageTypeCounts[type] = (packageTypeCounts[type] || 0) + 1;
    });

    // Calculate priority distribution
    const priorityCounts: Record<string, number> = { urgent: 0, high: 0, normal: 0, low: 0 };
    orders?.forEach((order) => {
      if (order.priority_level === 1) priorityCounts.urgent++;
      else if (order.priority_level === 2) priorityCounts.high++;
      else if (order.priority_level === 3) priorityCounts.normal++;
      else priorityCounts.low++;
    });

    // Calculate daily trends
    const dailyTrends: Record<string, { created: number; delivered: number; failed: number }> = {};
    const dayMs = 24 * 60 * 60 * 1000;
    
    for (let d = new Date(startDate); d <= now; d = new Date(d.getTime() + dayMs)) {
      const dateKey = d.toISOString().split('T')[0];
      dailyTrends[dateKey] = { created: 0, delivered: 0, failed: 0 };
    }

    orders?.forEach((order) => {
      const createdDate = order.created_at.split('T')[0];
      if (dailyTrends[createdDate]) {
        dailyTrends[createdDate].created++;
      }
      
      if (order.completed_at) {
        const completedDate = order.completed_at.split('T')[0];
        if (dailyTrends[completedDate]) {
          if (order.status === 'delivered') {
            dailyTrends[completedDate].delivered++;
          } else if (['failed_delivery', 'address_not_found', 'returned_to_sender'].includes(order.status)) {
            dailyTrends[completedDate].failed++;
          }
        }
      }
    });

    // Convert to array format for charts
    const trendsArray = Object.entries(dailyTrends).map(([date, counts]) => ({
      date,
      ...counts,
    }));

    // Calculate average delivery time (for completed orders)
    const completedOrders = orders?.filter(o => o.completed_at && o.status === 'delivered') || [];
    let avgDeliveryTimeHours = 0;
    if (completedOrders.length > 0) {
      const totalHours = completedOrders.reduce((sum, order) => {
        const created = new Date(order.created_at).getTime();
        const completed = new Date(order.completed_at).getTime();
        return sum + (completed - created) / (1000 * 60 * 60);
      }, 0);
      avgDeliveryTimeHours = Math.round(totalHours / completedOrders.length * 10) / 10;
    }

    // Fetch agent performance from assignments
    const { data: assignments } = await supabaseClient
      .from('delivery_assignments')
      .select(`
        agent_id,
        order_id,
        delivery_orders!inner(status, completed_at)
      `)
      .gte('assigned_at', startDate.toISOString());

    // Calculate agent stats
    const agentStats: Record<string, { assigned: number; delivered: number; failed: number }> = {};
    assignments?.forEach((assignment: any) => {
      const agentId = assignment.agent_id;
      if (!agentStats[agentId]) {
        agentStats[agentId] = { assigned: 0, delivered: 0, failed: 0 };
      }
      agentStats[agentId].assigned++;
      if (assignment.delivery_orders?.status === 'delivered') {
        agentStats[agentId].delivered++;
      } else if (['failed_delivery', 'address_not_found', 'returned_to_sender'].includes(assignment.delivery_orders?.status)) {
        agentStats[agentId].failed++;
      }
    });

    // Fetch agent profiles to get names
    const agentIds = Object.keys(agentStats);
    let profileMap = new Map<string, string>();
    if (agentIds.length > 0) {
      const { data: profiles } = await supabaseClient
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', agentIds);
      
      profileMap = new Map(profiles?.map(p => [p.user_id, p.full_name || 'Unknown']) || []);
    }

    // Calculate overall metrics
    const totalOrders = orders?.length || 0;
    const deliveredCount = statusCounts.delivered;
    const failedCount = statusCounts.failed_delivery + statusCounts.address_not_found + statusCounts.returned_to_sender;
    const successRate = totalOrders > 0 ? Math.round((deliveredCount / totalOrders) * 100) : 0;
    const pendingCount = statusCounts.pending_intake + statusCounts.ready_for_assignment + statusCounts.assigned + statusCounts.out_for_delivery;

    const response = {
      summary: {
        totalOrders,
        deliveredCount,
        failedCount,
        pendingCount,
        successRate,
        avgDeliveryTimeHours,
      },
      statusDistribution: Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count,
      })),
      packageTypeDistribution: Object.entries(packageTypeCounts).map(([type, count]) => ({
        type,
        count,
      })),
      priorityDistribution: Object.entries(priorityCounts).map(([priority, count]) => ({
        priority,
        count,
      })),
      dailyTrends: trendsArray,
      agentPerformance: Object.entries(agentStats).map(([agentId, stats]) => ({
        agentId,
        agentName: profileMap.get(agentId) || 'Unknown Agent',
        ...stats,
        successRate: stats.assigned > 0 ? Math.round((stats.delivered / stats.assigned) * 100) : 0,
      })),
      timeRange,
      generatedAt: new Date().toISOString(),
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in postal-analytics-api:', error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
