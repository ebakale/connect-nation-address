import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { 
  Activity, Clock, User, Shield, Coffee, 
  AlertTriangle, CheckCircle, PhoneCall 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import EmergencyDispatchDialog from "./EmergencyDispatchDialog";
import BroadcastAlertDialog from "./BroadcastAlertDialog";

interface OperatorSession {
  id: string;
  operator_id: string;
  session_start: string;
  session_end?: string;
  active_incidents: string[];
  status: string;
  created_at: string;
  updated_at: string;
}

interface OperatorStatusPanelProps {
  operatorSession: OperatorSession | null;
}

const OperatorStatusPanel = ({ operatorSession }: OperatorStatusPanelProps) => {
  const { user } = useAuth();
  const [status, setStatus] = useState<string>('available');
  const [sessionDuration, setSessionDuration] = useState<string>('0m');
  const [activeOperators, setActiveOperators] = useState<any[]>([]);
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false);
  const [showBroadcastDialog, setShowBroadcastDialog] = useState(false);

  useEffect(() => {
    if (operatorSession) {
      setStatus(operatorSession.status);
      
      // Update session duration every minute
      const updateDuration = () => {
        const start = new Date(operatorSession.session_start);
        const now = new Date();
        const diffMs = now.getTime() - start.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        if (diffHours > 0) {
          setSessionDuration(`${diffHours}h ${diffMinutes}m`);
        } else {
          setSessionDuration(`${diffMinutes}m`);
        }
      };

      updateDuration();
      const interval = setInterval(updateDuration, 60000); // Update every minute

      return () => clearInterval(interval);
    }
  }, [operatorSession]);

  useEffect(() => {
    const fetchActiveOperators = async () => {
      try {
        const { data: operators, error } = await supabase
          .from('emergency_operator_sessions')
          .select(`
            *,
            profiles!emergency_operator_sessions_operator_id_fkey (
              full_name,
              email
            )
          `)
          .eq('status', 'active')
          .is('session_end', null)
          .order('session_start', { ascending: false });

        if (error) throw error;
        setActiveOperators(operators || []);
      } catch (error) {
        console.error('Error fetching active operators:', error);
      }
    };

    fetchActiveOperators();

    // Subscribe to operator session changes
    const subscription = supabase
      .channel('operator-sessions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'emergency_operator_sessions'
        },
        () => {
          fetchActiveOperators();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const handleStatusChange = async (newStatus: string) => {
    if (!operatorSession) return;

    try {
      const { error } = await supabase
        .from('emergency_operator_sessions')
        .update({ status: newStatus })
        .eq('id', operatorSession.id);

      if (error) throw error;

      setStatus(newStatus);
      // Note: We'll implement proper toast notifications when shadcn toast is properly set up
    } catch (error) {
      console.error('Error updating status:', error);
      // Note: We'll implement proper error toast notifications when shadcn toast is properly set up
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'break': return 'bg-yellow-100 text-yellow-800';
      case 'offline': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Activity className="h-4 w-4" />;
      case 'break': return <Coffee className="h-4 w-4" />;
      case 'offline': return <CheckCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const handleEmergencyDispatch = () => {
    setShowEmergencyDialog(true);
  };

  const handleBroadcastAlert = () => {
    setShowBroadcastDialog(true);
  };

  return (
    <div className="space-y-4">
      {/* Current Operator Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Your Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {operatorSession ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <Badge className={getStatusColor(status)}>
                    {getStatusIcon(status)}
                    <span className="ml-1 capitalize">{status}</span>
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Session Duration</div>
                  <div className="font-semibold">{sessionDuration}</div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Update Status</label>
                <Select value={status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-green-600" />
                        Active
                      </div>
                    </SelectItem>
                    <SelectItem value="break">
                      <div className="flex items-center gap-2">
                        <Coffee className="h-4 w-4 text-yellow-600" />
                        On Break
                      </div>
                    </SelectItem>
                    <SelectItem value="offline">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-gray-600" />
                        Going Offline
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Session started: {new Date(operatorSession.session_start).toLocaleTimeString()}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-muted-foreground">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No active session</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Operators */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Active Operators</CardTitle>
          <CardDescription>
            {activeOperators.length} operators currently online
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {activeOperators.slice(0, 5).map((operator) => (
              <div key={operator.id} className="flex items-center justify-between p-2 bg-muted rounded">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {operator.profiles?.full_name || 'Unknown Operator'}
                  </span>
                </div>
                <Badge className={getStatusColor(operator.status)} variant="secondary">
                  {operator.status}
                </Badge>
              </div>
            ))}
            
            {activeOperators.length === 0 && (
              <div className="text-center text-muted-foreground py-4">
                <User className="h-6 w-6 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No other operators online</p>
              </div>
            )}
            
            {activeOperators.length > 5 && (
              <div className="text-center text-sm text-muted-foreground">
                +{activeOperators.length - 5} more operators
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="w-full justify-start hover:bg-red-50 hover:border-red-200"
            onClick={handleEmergencyDispatch}
          >
            <PhoneCall className="mr-2 h-4 w-4 text-red-600" />
            Emergency Dispatch
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="w-full justify-start hover:bg-orange-50 hover:border-orange-200"
            onClick={handleBroadcastAlert}
          >
            <AlertTriangle className="mr-2 h-4 w-4 text-orange-600" />
            Broadcast Alert
          </Button>
        </CardContent>
      </Card>

      <EmergencyDispatchDialog 
        open={showEmergencyDialog} 
        onOpenChange={setShowEmergencyDialog} 
      />
      
      <BroadcastAlertDialog 
        open={showBroadcastDialog} 
        onOpenChange={setShowBroadcastDialog} 
      />
    </div>
  );
};

export default OperatorStatusPanel;