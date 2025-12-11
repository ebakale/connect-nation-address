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

      {/* Backup Request Management - UPDATED for Tiered Approval */}
      <Card className="p-6 border-amber-500/30">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Backup Request Management
        </h2>
        <div className="space-y-4">
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg">
            <h3 className="font-semibold text-red-600 mb-2">🚨 Officer Down Alerts</h3>
            <p className="text-sm">Critical alerts that bypass normal workflow:</p>
            <ul className="list-disc list-inside space-y-1 ml-4 text-sm mt-2">
              <li>Immediate notification to ALL dispatchers and supervisors</li>
              <li>Maximum priority - requires immediate coordination</li>
              <li>Officer location included in alert</li>
              <li>Coordinate mass response with available units</li>
            </ul>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg">
            <h3 className="font-semibold text-amber-700 mb-2">📋 Dispatcher Capabilities</h3>
            <p className="text-sm mb-2">As a dispatcher, you can:</p>
            <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
              <li><strong>Acknowledge Receipt:</strong> Confirm you've received the request</li>
              <li><strong>Mark En Route:</strong> Indicate backup unit is responding</li>
              <li><strong>Mark On Scene:</strong> Confirm backup has arrived</li>
              <li><strong>Escalate to Supervisor:</strong> Send for approval when needed</li>
            </ul>
            <p className="text-sm mt-3 text-amber-700"><strong>Note:</strong> Approval and denial of backup requests requires supervisor authorization.</p>
          </div>

          <h3 className="font-semibold">Handling Backup Requests:</h3>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li><strong>Acknowledge:</strong> Confirm you've received the request immediately</li>
            <li><strong>Review:</strong> Check incident details, urgency, requesting unit</li>
            <li><strong>Coordinate:</strong> Identify nearest available backup unit</li>
            <li><strong>Escalate:</strong> If approval needed, escalate to supervisor with notes</li>
            <li><strong>Track:</strong> Monitor backup unit acknowledgments and status</li>
          </ol>

          <h3 className="font-semibold mt-4">Escalating to Supervisor:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Click "Escalate to Supervisor" button</li>
            <li>Add notes explaining urgency or context</li>
            <li>All supervisors in the area receive notification</li>
            <li>Request status changes to "Escalated"</li>
            <li>Supervisor can then approve, modify priority, or deny</li>
          </ul>

          <h3 className="font-semibold mt-4">Acknowledgment System:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>Receipt:</strong> Mark request as seen/received</li>
            <li><strong>En Route:</strong> Backup unit confirms response with ETA</li>
            <li><strong>On Scene:</strong> Backup unit arrived</li>
            <li><strong>All Clear:</strong> Situation resolved</li>
          </ul>

          <div className="bg-muted p-4 rounded-lg mt-4">
            <p className="text-sm"><strong>💡 Priority:</strong> Officer Down alerts should be immediately acknowledged and escalated if approval is needed. Quick acknowledgment lets officers know help is being coordinated.</p>
          </div>
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
