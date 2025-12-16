import { Card } from "@/components/ui/card";
import { BarChart3, Users, Package, FileText, Shield, Clock, DollarSign, RotateCcw, Truck } from "lucide-react";

export function PostalSupervisorGuide() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Postal Supervisor User Guide</h1>
        <p className="text-muted-foreground">Complete guide for overseeing postal operations, COD management, returns tracking, agent performance, and generating reports</p>
      </div>

      {/* Getting Started */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Getting Started
        </h2>
        <div className="space-y-3">
          <p><strong>Your Role:</strong> Postal Supervisors oversee all postal operations, monitor agent performance, manage COD reconciliation, track returns, approve orders, review delivery proof, and generate operational reports.</p>
          <p><strong>Access:</strong> Log in and navigate to /postal - full supervisor dashboard with analytics, COD management, returns tracking, agent management, and reporting tools</p>
          <p><strong>Key Permissions:</strong> View all orders, approve/reject orders, access analytics, review proof of delivery, manage COD reconciliation, track returns and pickups, export reports, manage escalations</p>
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
                <li>COD orders pending collection</li>
              </ul>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold">Performance Metrics</h4>
              <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                <li>Delivery success rate</li>
                <li>Average delivery time</li>
                <li>On-time delivery percentage</li>
                <li>Agent utilization rate</li>
                <li>Pickup completion rate</li>
              </ul>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg mt-4">
            <p className="text-sm"><strong>📊 Filters:</strong> Use date range and status filters to analyze specific time periods or order categories.</p>
          </div>
        </div>
      </Card>

      {/* COD Management */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          COD Management & Reconciliation
        </h2>
        <div className="space-y-3">
          <p>Track and reconcile Cash on Delivery payments:</p>
          
          <h3 className="font-semibold mt-4">COD Dashboard:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Total COD pending collection</li>
            <li>Total COD collected (awaiting remittance)</li>
            <li>Total COD remitted today</li>
            <li>Outstanding by agent</li>
          </ul>

          <h3 className="font-semibold mt-4">Daily Reconciliation Process:</h3>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>At end of shift, agents return with collected payments</li>
            <li>Access the "COD" tab to see collections by agent</li>
            <li>Verify cash amounts match system records</li>
            <li>Mark collections as "Remitted" when received</li>
            <li>Enter remittance reference number</li>
            <li>System updates collection status</li>
          </ol>

          <div className="grid md:grid-cols-3 gap-4 mt-4">
            <div className="border p-3 rounded-lg">
              <h4 className="font-semibold text-yellow-600">Pending</h4>
              <p className="text-sm text-muted-foreground">COD not yet collected</p>
            </div>
            <div className="border p-3 rounded-lg">
              <h4 className="font-semibold text-blue-600">Collected</h4>
              <p className="text-sm text-muted-foreground">Agent has cash, not remitted</p>
            </div>
            <div className="border p-3 rounded-lg">
              <h4 className="font-semibold text-green-600">Remitted</h4>
              <p className="text-sm text-muted-foreground">Cash submitted to office</p>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-500/10 border-l-4 border-yellow-500 p-4 mt-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200"><strong>⚠️ Important:</strong> Reconcile COD collections daily. Discrepancies should be investigated immediately and documented.</p>
          </div>
        </div>
      </Card>

      {/* Returns Tracking */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <RotateCcw className="h-5 w-5" />
          Returns Tracking
        </h2>
        <div className="space-y-3">
          <p>Monitor the complete return order lifecycle:</p>
          
          <h3 className="font-semibold mt-4">Return Pipeline:</h3>
          <div className="grid md:grid-cols-2 gap-4 mt-2">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold">Return Reasons</h4>
              <ul className="text-sm mt-2 space-y-1">
                <li>Failed delivery (max attempts)</li>
                <li>Customer return request</li>
                <li>Sender recall</li>
                <li>Refused by recipient</li>
                <li>Wrong item / damaged</li>
              </ul>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold">Return Metrics</h4>
              <ul className="text-sm mt-2 space-y-1">
                <li>Returns initiated today</li>
                <li>Returns in transit</li>
                <li>Returns received at office</li>
                <li>Returns processed/closed</li>
                <li>Average return time</li>
              </ul>
            </div>
          </div>

          <h3 className="font-semibold mt-4">Supervisor Actions:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Review return reasons for patterns</li>
            <li>Approve return requests</li>
            <li>Mark returns as received when packages arrive</li>
            <li>Close returns after processing</li>
            <li>Investigate high return rates</li>
          </ul>
        </div>
      </Card>

      {/* Pickup Oversight */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Pickup Request Oversight
        </h2>
        <div className="space-y-3">
          <p>Monitor citizen pickup request fulfillment:</p>
          
          <h3 className="font-semibold mt-4">Pickup Metrics:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Total requests today</li>
            <li>Pending scheduling</li>
            <li>Scheduled for today</li>
            <li>Completed today</li>
            <li>Failed/cancelled</li>
          </ul>

          <h3 className="font-semibold mt-4">Supervisor Actions:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Review overdue pickup requests</li>
            <li>Reassign failed pickups</li>
            <li>Monitor citizen complaints</li>
            <li>Track pickup completion rates by agent</li>
          </ul>

          <div className="bg-muted p-4 rounded-lg mt-4">
            <p className="text-sm"><strong>SLA:</strong> Pickup requests should be scheduled within 24 hours and completed within the requested time window.</p>
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

          <h3 className="font-semibold mt-4">Additional Metrics:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Pickup completion rate</li>
            <li>COD collection accuracy</li>
            <li>Return handling time</li>
          </ul>

          <div className="bg-yellow-50 dark:bg-yellow-500/10 border-l-4 border-yellow-500 p-4 mt-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200"><strong>⚠️ Action Items:</strong> Agents with high failure rates, low proof capture rates, or COD discrepancies may need additional training or support.</p>
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
            <li><strong>COD Reconciliation Report:</strong> Collections and remittances</li>
            <li><strong>Returns Report:</strong> Return orders and reasons</li>
            <li><strong>Pickup Report:</strong> Pickup requests and completion</li>
            <li><strong>Bulk Import Summary:</strong> Import job results</li>
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
            <li><strong>COD Disputes:</strong> Verify collection records and receipts</li>
            <li><strong>Pickup No-Shows:</strong> Contact requester, reschedule or cancel</li>
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
            <li>✅ Reconcile COD collections daily</li>
            <li>✅ Monitor real-time delivery status throughout the day</li>
            <li>✅ Investigate failed deliveries promptly</li>
            <li>✅ Track return pipeline for bottlenecks</li>
            <li>✅ Review pickup completion rates</li>
            <li>✅ Provide feedback to agents on performance</li>
            <li>✅ Generate weekly reports for management</li>
            <li>✅ Review proof of delivery for quality assurance</li>
            <li>✅ Address escalations within 24 hours</li>
            <li>✅ Track trends in delivery success rates</li>
            <li>✅ Coordinate with dispatchers on workload balance</li>
            <li>✅ Monitor bulk import error rates</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
