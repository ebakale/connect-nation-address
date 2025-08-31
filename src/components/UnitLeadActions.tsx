import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, Users, MessageSquare, Settings, 
  Activity, Shield, Radio, Navigation
} from 'lucide-react';

interface UnitLeadActionsProps {
  onOpenUnitDashboard: () => void;
}

export const UnitLeadActions: React.FC<UnitLeadActionsProps> = ({ onOpenUnitDashboard }) => {
  return (
    <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-800">
          <Crown className="h-5 w-5" />
          Unit Leadership Tools
        </CardTitle>
        <CardDescription className="text-yellow-700">
          Enhanced capabilities available as Unit Lead
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          onClick={onOpenUnitDashboard}
          variant="outline" 
          className="w-full border-yellow-300 text-yellow-800 hover:bg-yellow-100"
        >
          <Shield className="h-4 w-4 mr-2" />
          Unit Command Dashboard
        </Button>
        
        <div className="text-xs text-yellow-700 bg-yellow-100 p-2 rounded">
          <p className="font-medium mb-1">Leadership Privileges:</p>
          <ul className="space-y-1">
            <li>• Manage unit status & location</li>
            <li>• Assign tasks to team members</li>
            <li>• Coordinate unit responses</li>
            <li>• Access unit performance data</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};