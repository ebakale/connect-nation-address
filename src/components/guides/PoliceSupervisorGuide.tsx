import { Card } from "@/components/ui/card";
import { Shield, Users, BarChart, MapPin, Radio, ImageIcon, Eye } from "lucide-react";

export function PoliceSupervisorGuide() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Police Supervisor User Guide</h1>
        <p className="text-muted-foreground">Complete guide for supervising emergency units and operations</p>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Getting Started
        </h2>
        <div className="space-y-3">
          <p><strong>Your Role:</strong> Police supervisors oversee emergency units, monitor operations, and manage personnel within their jurisdiction.</p>
          <p><strong>Access:</strong> Police Dashboard with expanded supervisor controls</p>
          <p><strong>Key Permissions:</strong> Manage units, view all incidents in jurisdiction, assign/reassign operators, approve backup requests, view performance analytics, review field evidence</p>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Unit Management
        </h2>
        <div className="space-y-3">
          <h3 className="font-semibold">Creating & Managing Units:</h3>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Navigate to "Unit Management"</li>
            <li>Click "Create New Unit"</li>
            <li>Configure unit details:
              <ul className="list-disc list-inside ml-4 mt-1">
                <li><strong>Unit Code:</strong> Unique identifier (e.g., P-001)</li>
                <li><strong>Unit Name:</strong> Descriptive name</li>
                <li><strong>Unit Type:</strong> Patrol, motorcycle, K9, SWAT, etc.</li>
                <li><strong>Coverage Region/City:</strong> Assigned area</li>
                <li><strong>Vehicle ID:</strong> Police vehicle number</li>
                <li><strong>Radio Frequency:</strong> Communication channel</li>
              </ul>
            </li>
            <li>Assign officers to unit</li>
            <li>Designate unit lead</li>
            <li>Save - unit becomes active</li>
          </ol>

          <h3 className="font-semibold mt-4">Assigning Officers to Units:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Only police operators can be assigned to units</li>
            <li>Dispatchers and supervisors have system-wide access</li>
            <li>Set officer role: Officer or Unit Lead</li>
            <li>Officers see only their unit's incidents</li>
            <li>Reassign officers between units as needed</li>
          </ul>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Monitoring Operations
        </h2>
        <div className="space-y-3">
          <h3 className="font-semibold">Real-Time Unit Tracking:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>View all units in your jurisdiction on map</li>
            <li>See unit status (available, en route, on scene, busy)</li>
            <li>Track unit locations in real-time</li>
            <li>Monitor active incidents per unit</li>
            <li>View distance from units to new incidents</li>
          </ul>

          <h3 className="font-semibold mt-4">Incident Oversight:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>View all incidents in your geographic scope</li>
            <li>Monitor incident status and response times</li>
            <li>Review field notes from operators</li>
            <li>Approve or deny backup requests</li>
            <li>Reassign incidents if needed</li>
          </ul>
        </div>
      </Card>

      {/* Evidence Review - NEW */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Evidence Review
        </h2>
        <div className="space-y-3">
          <p>Review field evidence captured by operators during incident response.</p>
          
          <h3 className="font-semibold mt-4">Viewing Evidence:</h3>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Open incident details</li>
            <li>Navigate to the "Evidence" section</li>
            <li>View photos captured by field officers</li>
            <li>Review location data and timestamps</li>
            <li>Read officer descriptions of evidence</li>
          </ol>

          <h3 className="font-semibold mt-4">Evidence Quality Assessment:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Verify photos are clear and relevant</li>
            <li>Check descriptions are adequate</li>
            <li>Ensure proper documentation of scene</li>
            <li>Identify any gaps in evidence collection</li>
          </ul>

          <h3 className="font-semibold mt-4">Using Evidence for Oversight:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Verify officers are following protocols</li>
            <li>Assess incident handling quality</li>
            <li>Identify training opportunities</li>
            <li>Support investigation reviews</li>
          </ul>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Radio className="h-5 w-5" />
          Backup Management
        </h2>
        <div className="space-y-3">
          <p>When officers request backup:</p>
          
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Receive notification of backup request</li>
            <li>Review incident details and reason</li>
            <li>Check available units in area</li>
            <li>Approve backup - system assigns nearest available unit</li>
            <li>Or deny if resources unavailable (add reason)</li>
            <li>Monitor backup unit response</li>
          </ol>

          <div className="bg-muted p-4 rounded-lg mt-4">
            <p className="text-sm"><strong>💡 Tip:</strong> Prioritize backup for high-priority incidents and officer safety situations</p>
          </div>
        </div>
      </Card>

      {/* Real-Time Analytics - UPDATED */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BarChart className="h-5 w-5" />
          Real-Time Performance Analytics
        </h2>
        <div className="space-y-3">
          <p>Analytics are pulled directly from the database in real-time for accurate operational insights.</p>
          
          <h3 className="font-semibold mt-4">Unit Performance Metrics:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>Response Times:</strong> Average time to reach incidents</li>
            <li><strong>Resolution Times:</strong> Time to handle incidents</li>
            <li><strong>Incidents Per Shift:</strong> Workload tracking</li>
            <li><strong>Status Compliance:</strong> Timely status updates</li>
            <li><strong>Backup Requests:</strong> Frequency and reasons</li>
            <li><strong>Evidence Capture Rate:</strong> Documentation quality</li>
          </ul>

          <h3 className="font-semibold mt-4">Time Range Options:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>7 days:</strong> Recent performance snapshot</li>
            <li><strong>30 days:</strong> Monthly trends</li>
            <li><strong>90 days:</strong> Quarterly analysis</li>
          </ul>

          <h3 className="font-semibold mt-4">Using Analytics:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Identify high-performing units</li>
            <li>Spot areas needing improvement</li>
            <li>Optimize unit coverage based on incident patterns</li>
            <li>Plan training and resources allocation</li>
            <li>Generate reports for upper management</li>
          </ul>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Personnel Management</h2>
        <div className="space-y-3">
          <h3 className="font-semibold">Officer Status:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>View all officers in your jurisdiction</li>
            <li>See current assignments and availability</li>
            <li>Reassign officers between units</li>
            <li>Remove officers from units (shift changes)</li>
          </ul>

          <h3 className="font-semibold mt-4">Shift Management:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Set units to offline at end of shift</li>
            <li>Activate units at start of shift</li>
            <li>Track operator sessions</li>
            <li>Manage unit availability</li>
          </ul>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Geographic Scope</h2>
        <div className="space-y-3">
          <p><strong>Jurisdiction Limits:</strong> Your access is limited to your assigned geographic scope</p>
          
          <h3 className="font-semibold mt-4">Scope Types:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>City:</strong> All units and incidents in specific city</li>
            <li><strong>Region/Province:</strong> All cities within region</li>
            <li><strong>National:</strong> Entire country (rare, high-level supervisors)</li>
          </ul>

          <p className="mt-4 text-sm text-muted-foreground">Your scope is set by administrators. Contact police admin to request scope changes.</p>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Best Practices</h2>
        <div className="space-y-3">
          <h3 className="font-semibold">For Effective Supervision:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>✅ Monitor unit locations and status regularly</li>
            <li>✅ Respond quickly to backup requests</li>
            <li>✅ Review daily performance metrics</li>
            <li>✅ Check evidence quality from incidents</li>
            <li>✅ Ensure balanced unit coverage across jurisdiction</li>
            <li>✅ Communicate with dispatchers for coordination</li>
            <li>✅ Address performance issues promptly</li>
          </ul>

          <h3 className="font-semibold mt-4">Resource Optimization:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>📊 Deploy more units to high-incident areas</li>
            <li>📊 Rotate units to balance workload</li>
            <li>📊 Plan coverage for shift changes</li>
            <li>📊 Keep reserve units for backup</li>
          </ul>
        </div>
      </Card>

      <Card className="p-6 bg-muted">
        <h2 className="text-xl font-semibold mb-3">Need Help?</h2>
        <p>Contact your police administrator or system administrator for personnel management issues or system configuration needs.</p>
      </Card>
    </div>
  );
}
