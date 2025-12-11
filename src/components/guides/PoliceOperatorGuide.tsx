import { Card } from "@/components/ui/card";
import { Radio, MapPin, Camera, MessageSquare, AlertCircle, Navigation, ImagePlus, Ruler } from "lucide-react";

export function PoliceOperatorGuide() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Police Operator (Field Unit) User Guide</h1>
        <p className="text-muted-foreground">Complete guide for responding to incidents and managing field operations</p>
      </div>

      {/* Getting Started */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Radio className="h-5 w-5" />
          Getting Started
        </h2>
        <div className="space-y-3">
          <p><strong>Your Role:</strong> Police operators are field officers assigned to emergency units who respond to incidents on the ground.</p>
          <p><strong>Access:</strong> Police Dashboard at /police-dashboard or Units & Profiles page</p>
          <p><strong>Key Permissions:</strong> View assigned incidents, update incident status, communicate with dispatch, report field notes, request backup, capture evidence, navigate to incidents</p>
        </div>
      </Card>

      {/* Unit Assignment */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Your Unit Assignment</h2>
        <div className="space-y-3">
          <p>You are assigned to a specific emergency unit (patrol car, motorcycle, etc.)</p>
          
          <h3 className="font-semibold mt-4">Unit Information:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>Unit Code:</strong> Your unique identifier (e.g., P-001)</li>
            <li><strong>Unit Type:</strong> Patrol, motorcycle, K9, etc.</li>
            <li><strong>Coverage Area:</strong> Your assigned region/city</li>
            <li><strong>Unit Members:</strong> Your team members</li>
            <li><strong>Unit Lead:</strong> Your team leader (if applicable)</li>
          </ul>

          <h3 className="font-semibold mt-4">Unit Status:</h3>
          <ul className="space-y-1 ml-4">
            <li><strong className="text-green-600">Available:</strong> Ready for dispatch</li>
            <li><strong className="text-blue-600">En Route:</strong> Traveling to incident</li>
            <li><strong className="text-yellow-600">On Scene:</strong> At incident location</li>
            <li><strong className="text-purple-600">Busy:</strong> Engaged in incident</li>
            <li><strong className="text-red-600">Offline:</strong> Not available for dispatch</li>
          </ul>
        </div>
      </Card>

      {/* Receiving Incidents */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Receiving Incident Assignments
        </h2>
        <div className="space-y-4">
          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Step 1: Receive Notification</h3>
            <p className="mb-2">When dispatched to an incident, you'll receive:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Push notification (if on mobile)</li>
              <li>Alert in your dashboard</li>
              <li>Radio communication from dispatcher</li>
            </ul>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Step 2: Review Incident Details</h3>
            <p className="mb-2">Click the incident to view:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Incident Number:</strong> Unique ID (e.g., INC-2025-000123)</li>
              <li><strong>Emergency Type:</strong> Medical, crime, fire, etc.</li>
              <li><strong>Priority Level:</strong> 1 (highest) to 5 (lowest)</li>
              <li><strong>Location:</strong> Address with UAC and coordinates</li>
              <li><strong>Incident UAC:</strong> Location identifier</li>
              <li><strong>Reporter Info:</strong> Contact details (encrypted)</li>
              <li><strong>Description:</strong> What happened</li>
              <li><strong>Distance:</strong> From your current location</li>
            </ul>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Step 3: Acknowledge Assignment</h3>
            <p>Change your status to "En Route" to confirm you're responding</p>
          </div>
        </div>
      </Card>

      {/* Navigation Integration - NEW */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Navigation className="h-5 w-5" />
          Navigation to Incident
        </h2>
        <div className="space-y-3">
          <p>Use the integrated navigation feature to get turn-by-turn directions to the incident location.</p>
          
          <h3 className="font-semibold mt-4">How to Navigate:</h3>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Open the incident details</li>
            <li>Click the "Navigate" button</li>
            <li>Your device's default maps app will open with directions</li>
            <li>Follow turn-by-turn navigation to the scene</li>
          </ol>

          <h3 className="font-semibold mt-4">Platform Support:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>iOS:</strong> Opens Apple Maps by default</li>
            <li><strong>Android:</strong> Opens Google Maps</li>
            <li><strong>Web:</strong> Opens Google Maps in browser</li>
          </ul>

          <h3 className="font-semibold mt-4">Distance & Time Estimates:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>View distance to incident from current location</li>
            <li>Estimated travel time displayed (based on 40 km/h average)</li>
            <li>Updates as you move closer to the scene</li>
          </ul>

          <div className="bg-muted p-4 rounded-lg mt-4">
            <p className="text-sm"><strong>💡 Tip:</strong> Enable location services for accurate distance estimates and optimal routing</p>
          </div>
        </div>
      </Card>

      {/* Evidence Capture - NEW */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <ImagePlus className="h-5 w-5" />
          Evidence Capture
        </h2>
        <div className="space-y-3">
          <p>Document incident scenes with photos that are securely stored with location data.</p>
          
          <h3 className="font-semibold mt-4">Capturing Evidence:</h3>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Open the incident details while on scene</li>
            <li>Click "Capture Evidence" button</li>
            <li>Take a photo using your device camera</li>
            <li>Add a description of what the photo shows</li>
            <li>Location coordinates are automatically captured</li>
            <li>Submit - photo is securely uploaded</li>
          </ol>

          <h3 className="font-semibold mt-4">What to Document:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Scene overview upon arrival</li>
            <li>Damage or injuries (if appropriate)</li>
            <li>Evidence at the scene</li>
            <li>Relevant environmental conditions</li>
            <li>Vehicle positions (traffic incidents)</li>
            <li>Identifiable landmarks for location context</li>
          </ul>

          <h3 className="font-semibold mt-4">Evidence Security:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Photos stored in secure cloud storage</li>
            <li>Linked to incident record automatically</li>
            <li>Visible to supervisors and dispatchers</li>
            <li>Location and timestamp metadata preserved</li>
            <li>Cannot be edited after upload (chain of custody)</li>
          </ul>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-4">
            <p className="text-sm text-yellow-800"><strong>⚠️ Privacy:</strong> Only capture evidence relevant to the incident. Respect privacy of uninvolved individuals.</p>
          </div>
        </div>
      </Card>

      {/* Responding to Incidents */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Responding to Incidents</h2>
        <div className="space-y-4">
          <h3 className="font-semibold">Navigation:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Use the "Navigate" button for turn-by-turn directions</li>
            <li>View distance and estimated arrival time</li>
            <li>UAC helps identify exact building/location</li>
            <li>Look for QR codes on buildings to verify address</li>
          </ul>

          <h3 className="font-semibold mt-4">Status Updates:</h3>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li><strong>En Route:</strong> Set when leaving for incident</li>
            <li><strong>On Scene:</strong> Set when arriving at location</li>
            <li><strong>Resolved:</strong> Set when incident handled</li>
            <li><strong>Available:</strong> Set when ready for next call</li>
          </ol>

          <div className="bg-muted p-4 rounded-lg mt-4">
            <p className="text-sm"><strong>⏱️ Important:</strong> Update status promptly - response times are tracked and affect performance metrics</p>
          </div>
        </div>
      </Card>

      {/* Field Reporting */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Field Reporting
        </h2>
        <div className="space-y-3">
          <h3 className="font-semibold">Adding Field Notes:</h3>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Open the incident details</li>
            <li>Click "Add Field Notes"</li>
            <li>Document what you found:
              <ul className="list-disc list-inside ml-4 mt-1">
                <li>Situation upon arrival</li>
                <li>Actions taken</li>
                <li>People involved</li>
                <li>Evidence collected</li>
                <li>Any safety concerns</li>
              </ul>
            </li>
            <li>Save notes - dispatcher and supervisors can see them</li>
          </ol>

          <h3 className="font-semibold mt-4">Photo Evidence:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Use "Capture Evidence" for scene documentation</li>
            <li>Photos are encrypted and securely stored</li>
            <li>Include in incident report automatically</li>
            <li>Viewable in Evidence tab of incident details</li>
          </ul>
        </div>
      </Card>

      {/* Communication */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Communication
        </h2>
        <div className="space-y-3">
          <h3 className="font-semibold">With Dispatch:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Receive messages from dispatchers</li>
            <li>Reply to dispatcher queries</li>
            <li>Report status changes</li>
            <li>Request additional information</li>
          </ul>

          <h3 className="font-semibold mt-4">With Other Units:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>See other units assigned to same incident</li>
            <li>Coordinate response with backup units</li>
            <li>Share field observations</li>
          </ul>
        </div>
      </Card>

      {/* Enhanced Backup Request System - NEW */}
      <Card className="p-6 border-red-500/30">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          Backup Request System
        </h2>
        <div className="space-y-4">
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg">
            <h3 className="font-semibold text-red-600 mb-2">🚨 OFFICER DOWN Emergency Button</h3>
            <p className="text-sm mb-2">For life-threatening situations requiring immediate assistance:</p>
            <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
              <li><strong>Location:</strong> Large red button at top of operator dashboard</li>
              <li><strong>Action:</strong> Sends IMMEDIATE mass broadcast to ALL police personnel</li>
              <li><strong>Priority:</strong> Maximum (0) - bypasses normal approval workflow</li>
              <li><strong>Notification:</strong> All operators, supervisors, dispatchers, and admins alerted</li>
              <li><strong>GPS:</strong> Your current location automatically included</li>
            </ul>
            <p className="text-sm mt-2 text-red-600"><strong>⚠️ Use ONLY in genuine emergencies</strong></p>
          </div>

          <h3 className="font-semibold mt-4">Standard Backup Request:</h3>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Click "Request Backup" on active incident</li>
            <li>Select backup type (additional officers, medical, K9, SWAT, etc.)</li>
            <li>Set urgency level (1-5)</li>
            <li>Add description of situation</li>
            <li>Submit - notifies dispatch and supervisor</li>
          </ol>

          <h3 className="font-semibold mt-4">Tracking Your Request:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>Pending:</strong> Request submitted, awaiting review</li>
            <li><strong>Acknowledged:</strong> Supervisor has seen your request</li>
            <li><strong>Approved:</strong> Backup unit being dispatched</li>
            <li><strong>En Route:</strong> Backup unit on the way (ETA shown)</li>
            <li><strong>On Scene:</strong> Backup has arrived</li>
            <li><strong>Denied:</strong> Request denied (reason provided)</li>
          </ul>

          <h3 className="font-semibold mt-4">Acknowledgment Notifications:</h3>
          <p className="text-sm text-muted-foreground">You'll receive real-time updates as your backup request progresses through the workflow, including who acknowledged it and their estimated arrival time.</p>
        </div>
      </Card>

      {/* Location Tracking */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location Tracking
        </h2>
        <div className="space-y-3">
          <p><strong>GPS Tracking:</strong> Your unit's location is tracked in real-time for dispatch coordination</p>
          
          <h3 className="font-semibold mt-4">Why It Matters:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>📍 Dispatch can see your location and assign nearest incidents</li>
            <li>🚨 Safety monitoring - supervisor knows where you are</li>
            <li>⏱️ Accurate response time calculation</li>
            <li>🗺️ Helps backup units find you if needed</li>
          </ul>

          <h3 className="font-semibold mt-4">Updating Location:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Location updates automatically when GPS is enabled</li>
            <li>Ensure location permissions are allowed</li>
            <li>Location accuracy shown in dashboard</li>
          </ul>
        </div>
      </Card>

      {/* Distance Estimates - NEW */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Ruler className="h-5 w-5" />
          Distance & Time Estimates
        </h2>
        <div className="space-y-3">
          <p>View distance and estimated travel time to incidents from your current location.</p>
          
          <h3 className="font-semibold mt-4">Distance Display:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Distances under 1 km shown in meters</li>
            <li>Distances over 1 km shown in kilometers</li>
            <li>Calculated using Haversine formula (straight-line)</li>
            <li>Actual road distance may be slightly longer</li>
          </ul>

          <h3 className="font-semibold mt-4">Time Estimates:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Based on average urban speed of 40 km/h</li>
            <li>Displayed as minutes or hours+minutes</li>
            <li>Use as rough guide - actual time varies with traffic</li>
          </ul>

          <h3 className="font-semibold mt-4">Requirements:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Location services must be enabled</li>
            <li>Incident must have valid coordinates</li>
            <li>Updates when you refresh incident list</li>
          </ul>
        </div>
      </Card>

      {/* Best Practices */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Best Practices</h2>
        <div className="space-y-3">
          <h3 className="font-semibold">For Effective Response:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>✅ Update status promptly at each stage</li>
            <li>✅ Review full incident details before responding</li>
            <li>✅ Use "Navigate" button for fastest route</li>
            <li>✅ Capture evidence upon arrival</li>
            <li>✅ Document thoroughly with field notes</li>
            <li>✅ Communicate clearly with dispatch</li>
            <li>✅ Request backup early if situation requires it</li>
          </ul>

          <h3 className="font-semibold mt-4">Safety First:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>🛡️ Assess scene safety before engaging</li>
            <li>🛡️ Keep dispatch informed of situation changes</li>
            <li>🛡️ Don't hesitate to request backup</li>
            <li>🛡️ Report any safety concerns immediately</li>
          </ul>

          <h3 className="font-semibold mt-4">Common Mistakes to Avoid:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>❌ Not updating status (dispatch can't track you)</li>
            <li>❌ Incomplete field notes (poor documentation)</li>
            <li>❌ Not capturing evidence at scene</li>
            <li>❌ Not requesting backup when needed</li>
            <li>❌ Forgetting to set "Available" after incident</li>
          </ul>
        </div>
      </Card>

      {/* Performance */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Performance Tracking</h2>
        <div className="space-y-3">
          <p>Your performance is tracked to improve emergency response:</p>
          
          <h3 className="font-semibold mt-4">Key Metrics:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>Response Time:</strong> Time from dispatch to on-scene</li>
            <li><strong>Resolution Time:</strong> Time from on-scene to resolved</li>
            <li><strong>Incidents Handled:</strong> Total count per shift</li>
            <li><strong>Status Update Compliance:</strong> Timely status changes</li>
            <li><strong>Evidence Captured:</strong> Documentation quality</li>
          </ul>

          <p className="mt-4 text-sm text-muted-foreground">View your performance statistics in the Unit Performance dashboard</p>
        </div>
      </Card>

      {/* Support */}
      <Card className="p-6 bg-muted">
        <h2 className="text-xl font-semibold mb-3">Need Help?</h2>
        <p>Contact your unit lead, supervisor, or dispatch for operational support and guidance.</p>
      </Card>
    </div>
  );
}
