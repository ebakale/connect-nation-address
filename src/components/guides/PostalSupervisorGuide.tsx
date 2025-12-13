import { Card } from "@/components/ui/card";
import { BarChart3, Users, Package, FileText, Shield, Clock } from "lucide-react";

export function PostalSupervisorGuide() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Postal Supervisor User Guide</h1>
        <p className="text-muted-foreground">Complete guide for overseeing postal operations, agent performance, and generating reports</p>
      </div>

      {/* Getting Started */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Getting Started
        </h2>
        <div className="space-y-3">
          <p><strong>Your Role:</strong> Postal Supervisors oversee all postal operations, monitor agent performance, approve orders, review delivery attempts, and generate operational reports.</p>
          <p><strong>Access:</strong> Log in and navigate to /postal - full supervisor dashboard with analytics, agent management, and reporting tools</p>
          <p><strong>Key Permissions:</strong> View all orders, approve/reject orders, access analytics, review proof of delivery, export reports, manage escalations</p>
        </div>
      </Card>

      {/* Dashboard Overview */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Dashboard Overview
        </h2>
        <div className="space-y-3">
          <p>Your dashboard provides real-time operational visibility:</p>
          
          <h3 className="font-semibold mt-4">Key Metrics:</h3>
          <div className="grid md:grid-cols-2 gap-4 mt-2">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold">Order Statistics</h4>
              <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                <li>Total orders today</li>
                <li>Pending intake count</li>
                <li>Out for delivery count</li>
                <li>Delivered today count</li>
                <li>Failed deliveries</li>
              </ul>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold">Performance Metrics</h4>
              <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                <li>Delivery success rate</li>
                <li>Average delivery time</li>
                <li>On-time delivery percentage</li>
                <li>Agent utilization rate</li>
              </ul>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg mt-4">
            <p className="text-sm"><strong>📊 Filters:</strong> Use date range and status filters to analyze specific time periods or order categories.</p>
          </div>
        </div>
      </Card>

      {/* Order Approval */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Package className="h-5 w-5" />
          Order Oversight
        </h2>
        <div className="space-y-4">
          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Reviewing Orders</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Access "All Orders" view for complete visibility</li>
              <li>Filter by status, date, agent, or region</li>
              <li>Click any order to see full details</li>
              <li>View complete status history timeline</li>
            </ul>
          </div>
          
          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Approving/Rejecting Orders</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Review order details and recipient address</li>
              <li>Verify UAC is valid and deliverable</li>
              <li>Approve legitimate orders for dispatch</li>
              <li>Reject orders with issues (provide reason)</li>
            </ul>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Reviewing Proof of Delivery</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Access delivered orders</li>
              <li>View captured photos and signatures</li>
              <li>Verify GPS location matches UAC</li>
              <li>Flag issues for investigation if needed</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Agent Performance */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Agent Performance Monitoring
        </h2>
        <div className="space-y-3">
          <p>Track and manage delivery agent performance:</p>
          
          <h3 className="font-semibold mt-4">Agent Metrics:</h3>
          <div className="grid md:grid-cols-3 gap-4 mt-2">
            <div className="border p-3 rounded-lg">
              <h4 className="font-semibold text-blue-600">Deliveries</h4>
              <ul className="text-sm mt-1 space-y-1">
                <li>Total assigned</li>
                <li>Completed today</li>
                <li>Success rate</li>
              </ul>
            </div>
            <div className="border p-3 rounded-lg">
              <h4 className="font-semibold text-green-600">Efficiency</h4>
              <ul className="text-sm mt-1 space-y-1">
                <li>Avg delivery time</li>
                <li>On-time rate</li>
                <li>Route adherence</li>
              </ul>
            </div>
            <div className="border p-3 rounded-lg">
              <h4 className="font-semibold text-purple-600">Quality</h4>
              <ul className="text-sm mt-1 space-y-1">
                <li>Proof capture rate</li>
                <li>Customer complaints</li>
                <li>Failed deliveries</li>
              </ul>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-500/10 border-l-4 border-yellow-500 p-4 mt-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200"><strong>⚠️ Action Items:</strong> Agents with high failure rates or low proof capture rates may need additional training or support.</p>
          </div>
        </div>
      </Card>

      {/* Reporting */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Reports & Export
        </h2>
        <div className="space-y-3">
          <p>Generate reports for analysis and record-keeping:</p>
          
          <h3 className="font-semibold mt-4">Available Reports:</h3>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Daily Delivery Report:</strong> All deliveries with status and times</li>
            <li><strong>Agent Performance Report:</strong> Metrics by agent</li>
            <li><strong>Failed Deliveries Report:</strong> All failures with reasons</li>
            <li><strong>Geographic Coverage Report:</strong> Deliveries by region</li>
          </ul>

          <h3 className="font-semibold mt-4">Export Options:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>CSV:</strong> For spreadsheet analysis</li>
            <li><strong>PDF:</strong> For official documentation</li>
          </ul>

          <div className="bg-muted p-4 rounded-lg mt-4">
            <p className="text-sm"><strong>📅 Scheduling:</strong> Use date range filters to generate reports for specific periods (daily, weekly, monthly).</p>
          </div>
        </div>
      </Card>

      {/* Escalation Handling */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Handling Escalations
        </h2>
        <div className="space-y-3">
          <p>Manage delivery issues and customer escalations:</p>
          
          <h3 className="font-semibold mt-4">Common Escalation Types:</h3>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Multiple Failed Attempts:</strong> After 3 failures, review and decide on return</li>
            <li><strong>Address Issues:</strong> Coordinate with NAR team for address verification</li>
            <li><strong>Customer Complaints:</strong> Review proof of delivery, investigate issues</li>
            <li><strong>Missing Packages:</strong> Track status history, identify last known location</li>
          </ul>

          <div className="bg-muted p-4 rounded-lg mt-4">
            <p className="text-sm"><strong>Resolution:</strong> Document all escalation resolutions for audit trail and continuous improvement.</p>
          </div>
        </div>
      </Card>

      {/* Best Practices */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Best Practices</h2>
        <div className="space-y-3">
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>✅ Review dashboard metrics at start and end of each day</li>
            <li>✅ Monitor real-time delivery status throughout the day</li>
            <li>✅ Investigate failed deliveries promptly</li>
            <li>✅ Provide feedback to agents on performance</li>
            <li>✅ Generate weekly reports for management</li>
            <li>✅ Review proof of delivery for quality assurance</li>
            <li>✅ Address escalations within 24 hours</li>
            <li>✅ Track trends in delivery success rates</li>
            <li>✅ Coordinate with dispatchers on workload balance</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
