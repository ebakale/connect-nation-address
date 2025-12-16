import { Card } from "@/components/ui/card";
import { Truck, Users, MapPin, Route, Clock, BarChart3, Package, RotateCcw, Upload } from "lucide-react";

export function PostalDispatcherGuide() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Postal Dispatcher User Guide</h1>
        <p className="text-muted-foreground">Complete guide for assigning orders, managing routes, coordinating pickup requests, and overseeing returns</p>
      </div>

      {/* Getting Started */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Getting Started
        </h2>
        <div className="space-y-3">
          <p><strong>Your Role:</strong> Postal Dispatchers manage order assignments, optimize delivery routes, coordinate pickup requests, oversee returns, and ensure efficient postal operations across the team.</p>
          <p><strong>Access:</strong> Log in and navigate to the Postal Portal at /postal - dispatcher dashboard will show assignment queue, pickups, returns, and agent management</p>
          <p><strong>Key Permissions:</strong> Assign orders to agents, manage routes, update order status, view agent workloads, monitor delivery progress, schedule pickups, track returns, review bulk imports</p>
        </div>
      </Card>

      {/* Order Assignment */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Order Assignment
        </h2>
        <div className="space-y-4">
          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Step 1: Review Assignment Queue</h3>
            <p>Access the "Ready for Assignment" tab to see orders awaiting dispatch</p>
            <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
              <li>Filter by priority, date, or region</li>
              <li>Sort by deadline to prioritize urgent orders</li>
              <li>View recipient UAC location on map</li>
              <li>Check recipient delivery preferences</li>
            </ul>
          </div>
          
          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Step 2: Select Delivery Agent</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>View available agents and their current workload</li>
              <li>Check agent assigned regions/zones</li>
              <li>Consider agent proximity to pickup location</li>
              <li>Balance workload across team</li>
            </ul>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Step 3: Assign Order</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Click "Assign" on the order card</li>
              <li>Select agent from dropdown</li>
              <li>Set route sequence number (for multi-stop routes)</li>
              <li>Add assignment notes if needed</li>
              <li>Set estimated delivery time</li>
            </ul>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Step 4: Confirm Assignment</h3>
            <p>Click "Confirm Assignment". Agent receives notification and order moves to "Assigned" status.</p>
          </div>
        </div>
      </Card>

      {/* Pickup Request Management */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Package className="h-5 w-5" />
          Managing Pickup Requests
        </h2>
        <div className="space-y-3">
          <p>Citizens can request package collection from their addresses:</p>
          
          <h3 className="font-semibold mt-4">Pickup Request Workflow:</h3>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Access the "Pickups" tab to see pending requests</li>
            <li>Review request details (address, package count, time window)</li>
            <li>Schedule a pickup date/time</li>
            <li>Assign to an available agent in that area</li>
            <li>Monitor pickup completion</li>
          </ol>

          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold">Request Information</h4>
              <ul className="text-sm mt-2 space-y-1">
                <li>Requester name and contact</li>
                <li>Pickup address (UAC verified)</li>
                <li>Number of packages</li>
                <li>Estimated weight</li>
                <li>Preferred date/time window</li>
              </ul>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold">Pickup Statuses</h4>
              <ul className="text-sm mt-2 space-y-1">
                <li><span className="text-yellow-600">●</span> Pending - Awaiting scheduling</li>
                <li><span className="text-blue-600">●</span> Scheduled - Date/time confirmed</li>
                <li><span className="text-purple-600">●</span> Assigned - Agent assigned</li>
                <li><span className="text-orange-600">●</span> En Route - Agent on the way</li>
                <li><span className="text-green-600">●</span> Completed - Packages collected</li>
              </ul>
            </div>
          </div>

          <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg mt-4">
            <p className="text-sm"><strong>✓ Tip:</strong> Group pickup requests by area and assign to agents already delivering in that zone for efficiency.</p>
          </div>
        </div>
      </Card>

      {/* Returns Management */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <RotateCcw className="h-5 w-5" />
          Returns & Reverse Logistics
        </h2>
        <div className="space-y-3">
          <p>Track and manage return orders:</p>
          
          <h3 className="font-semibold mt-4">Return Sources:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>Failed Delivery:</strong> After max delivery attempts</li>
            <li><strong>Customer Return:</strong> Recipient initiates return</li>
            <li><strong>Sender Recall:</strong> Sender requests return before delivery</li>
            <li><strong>Refused:</strong> Recipient refused package</li>
          </ul>

          <h3 className="font-semibold mt-4">Return Workflow:</h3>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Access the "Returns" tab to see return orders</li>
            <li>Review return reason and original order details</li>
            <li>Arrange collection (agent pickup or citizen drop-off)</li>
            <li>Track return to origin post office</li>
            <li>Mark as processed when complete</li>
          </ol>

          <div className="bg-muted p-4 rounded-lg mt-4">
            <h4 className="font-semibold">Return Statuses:</h4>
            <ul className="text-sm mt-2 space-y-1">
              <li><span className="text-yellow-600">●</span> Initiated - Return requested</li>
              <li><span className="text-blue-600">●</span> Label Generated - Return label created</li>
              <li><span className="text-orange-600">●</span> In Transit - Being returned</li>
              <li><span className="text-green-600">●</span> Received - Back at origin office</li>
              <li><span className="text-gray-600">●</span> Processed - Return completed</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Bulk Import Review */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Bulk Import Review
        </h2>
        <div className="space-y-3">
          <p>Monitor and review bulk order imports:</p>
          
          <h3 className="font-semibold mt-4">Import Job Information:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Total rows in uploaded file</li>
            <li>Successfully processed orders</li>
            <li>Failed rows with error details</li>
            <li>Processing status and time</li>
          </ul>

          <h3 className="font-semibold mt-4">Common Import Errors:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>Invalid UAC:</strong> Recipient address not found in system</li>
            <li><strong>Missing Required Field:</strong> sender_name, recipient_name, etc.</li>
            <li><strong>Invalid Package Type:</strong> Unrecognized package type value</li>
            <li><strong>Format Error:</strong> CSV formatting issues</li>
          </ul>

          <div className="bg-yellow-50 dark:bg-yellow-500/10 border-l-4 border-yellow-500 p-4 mt-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200"><strong>⚠️ Action:</strong> For failed imports, coordinate with clerks to correct data and re-import, or manually create individual orders.</p>
          </div>
        </div>
      </Card>

      {/* Route Management */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Route className="h-5 w-5" />
          Route Management
        </h2>
        <div className="space-y-3">
          <p>Optimize delivery routes for efficiency:</p>
          
          <h3 className="font-semibold mt-4">Route Sequencing:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Assign sequence numbers to orders (1, 2, 3...)</li>
            <li>Group orders by geographic area</li>
            <li>Consider traffic patterns and delivery windows</li>
            <li>Place time-sensitive orders early in sequence</li>
            <li>Include pickup requests in route planning</li>
          </ul>

          <h3 className="font-semibold mt-4">Map View:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>View all assigned orders on map</li>
            <li>See agent current locations (if GPS enabled)</li>
            <li>Visualize delivery clusters</li>
            <li>Identify route inefficiencies</li>
          </ul>

          <div className="bg-muted p-4 rounded-lg mt-4">
            <p className="text-sm"><strong>Tip:</strong> Use the map view to identify nearby deliveries and pickups, then group them for the same agent to minimize travel time.</p>
          </div>
        </div>
      </Card>

      {/* Agent Workload */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Agent Workload Management
        </h2>
        <div className="space-y-3">
          <p>Monitor and balance agent workloads:</p>
          
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold">Workload Metrics</h4>
              <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                <li>Active assignments count</li>
                <li>Pending pickups count</li>
                <li>Completed today count</li>
                <li>Average delivery time</li>
                <li>Success rate percentage</li>
              </ul>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold">Status Indicators</h4>
              <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                <li><span className="text-green-600">●</span> Available - Can take orders</li>
                <li><span className="text-yellow-600">●</span> Busy - Currently delivering</li>
                <li><span className="text-red-600">●</span> Unavailable - Off duty</li>
              </ul>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-500/10 border-l-4 border-yellow-500 p-4 mt-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200"><strong>⚠️ Balance:</strong> Avoid overloading single agents. Distribute orders and pickups evenly to maintain service quality and agent satisfaction.</p>
          </div>
        </div>
      </Card>

      {/* Status Updates */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Monitoring Deliveries
        </h2>
        <div className="space-y-3">
          <p>Track order progress in real-time:</p>
          
          <h3 className="font-semibold mt-4">Status Transitions:</h3>
          <div className="flex flex-col gap-2 mt-2">
            {[
              { from: 'Ready for Assignment', to: 'Assigned', actor: 'Dispatcher assigns agent' },
              { from: 'Assigned', to: 'Out for Delivery', actor: 'Agent picks up package' },
              { from: 'Out for Delivery', to: 'Delivered', actor: 'Agent completes delivery' },
              { from: 'Out for Delivery', to: 'Failed', actor: 'Delivery attempt failed' },
              { from: 'Failed', to: 'Out for Delivery', actor: 'Retry scheduled' },
              { from: 'Failed (3x)', to: 'Return Initiated', actor: 'Auto-return triggered' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <span className="font-medium">{item.from}</span>
                <span>→</span>
                <span className="font-medium">{item.to}</span>
                <span className="text-muted-foreground">({item.actor})</span>
              </div>
            ))}
          </div>

          <div className="bg-muted p-4 rounded-lg mt-4">
            <p className="text-sm"><strong>Real-time Updates:</strong> Dashboard refreshes automatically. Click any order to see detailed status history and tracking information.</p>
          </div>
        </div>
      </Card>

      {/* Best Practices */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Best Practices</h2>
        <div className="space-y-3">
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>✅ Process assignment queue at start of each shift</li>
            <li>✅ Check recipient preferences before assignment</li>
            <li>✅ Group nearby deliveries and pickups for same agent</li>
            <li>✅ Prioritize orders by deadline</li>
            <li>✅ Schedule pickups within requested time windows</li>
            <li>✅ Monitor agent locations throughout day</li>
            <li>✅ Reassign failed deliveries promptly</li>
            <li>✅ Track return orders to completion</li>
            <li>✅ Review bulk import results for errors</li>
            <li>✅ Communicate special instructions to agents</li>
            <li>✅ Balance workload to prevent agent burnout</li>
            <li>✅ Review end-of-day reports for optimization</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
