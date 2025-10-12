import { Card } from "@/components/ui/card";
import { Radio, AlertTriangle, Users, MapPin } from "lucide-react";

export function EmergencyDispatcherGuide() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Emergency Dispatcher User Guide</h1>
        <p className="text-muted-foreground">Complete guide for managing emergency incidents and coordinating units</p>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Radio className="h-5 w-5" />
          Getting Started
        </h2>
        <div className="space-y-3">
          <p><strong>Your Role:</strong> Emergency dispatchers manage incoming incidents, coordinate response units, and ensure timely emergency response.</p>
          <p><strong>Access:</strong> Police Dashboard at /police-dashboard</p>
          <p><strong>Key Permissions:</strong> View all incidents, dispatch units, communicate with field teams, track response times</p>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Managing Incidents
        </h2>
        <div className="space-y-3">
          <h3 className="font-semibold">Incident Dashboard:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>View all active incidents on map and list</li>
            <li>Filter by status, priority, type</li>
            <li>Click incident for full details</li>
            <li>Assign units to incidents</li>
            <li>Track incident status and response times</li>
          </ul>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Unit Coordination
        </h2>
        <div className="space-y-3">
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>View available units by location</li>
            <li>Dispatch units to incidents</li>
            <li>Send messages to units</li>
            <li>Request backup when needed</li>
            <li>Monitor unit status in real-time</li>
          </ul>
        </div>
      </Card>

      <Card className="p-6 bg-muted">
        <h2 className="text-xl font-semibold mb-3">Need Help?</h2>
        <p>Contact your supervisor or system administrator for emergency management support.</p>
      </Card>
    </div>
  );
}
