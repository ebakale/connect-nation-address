import { Card } from "@/components/ui/card";
import { Radio, AlertTriangle, Users, MapPin, ImageIcon, Navigation } from "lucide-react";

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
          <p><strong>Key Permissions:</strong> View all incidents, dispatch units, communicate with field teams, track response times, view field evidence</p>
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

          <h3 className="font-semibold mt-4">Incident Details:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>Location:</strong> Address, coordinates, distance to nearest unit</li>
            <li><strong>Navigate Button:</strong> Opens map app for field navigation</li>
            <li><strong>Reporter Info:</strong> Contact details (encrypted)</li>
            <li><strong>Field Notes:</strong> Updates from responding officers</li>
            <li><strong>Evidence Tab:</strong> Photos captured by field officers</li>
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

          <h3 className="font-semibold mt-4">Distance & Time Estimates:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>View distance from each unit to incident</li>
            <li>Estimated arrival times displayed</li>
            <li>Helps select optimal unit for dispatch</li>
          </ul>
        </div>
      </Card>

      {/* Evidence Viewing - NEW */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Field Evidence
        </h2>
        <div className="space-y-3">
          <p>View evidence captured by field officers during incident response.</p>
          
          <h3 className="font-semibold mt-4">Accessing Evidence:</h3>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Open incident details</li>
            <li>Scroll to "Evidence" section or tab</li>
            <li>View photos with descriptions</li>
            <li>See capture location and timestamp</li>
          </ol>

          <h3 className="font-semibold mt-4">Using Evidence:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Assess situation severity from photos</li>
            <li>Coordinate additional resources if needed</li>
            <li>Brief backup units on scene conditions</li>
            <li>Document incident details for records</li>
          </ul>

          <div className="bg-muted p-4 rounded-lg mt-4">
            <p className="text-sm"><strong>💡 Tip:</strong> Check evidence regularly during active incidents to stay informed of scene conditions</p>
          </div>
        </div>
      </Card>

      {/* Navigation Support - NEW */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Navigation className="h-5 w-5" />
          Navigation Support
        </h2>
        <div className="space-y-3">
          <p>Help field units navigate to incident locations using integrated mapping.</p>
          
          <h3 className="font-semibold mt-4">Features:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>View incident location on map</li>
            <li>"Navigate" button opens external maps</li>
            <li>Distance and time estimates for all units</li>
            <li>UAC (Unified Address Code) for precise location</li>
          </ul>

          <h3 className="font-semibold mt-4">Guiding Units:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Share UAC for address verification</li>
            <li>Provide additional landmarks if needed</li>
            <li>Monitor unit progress on map</li>
            <li>Redirect units if route issues occur</li>
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
