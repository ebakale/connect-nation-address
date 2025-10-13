import { Card } from "@/components/ui/card";
import { Shield, Settings, Users, Database, Eye } from "lucide-react";

export function RegistrarGuide() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Registrar User Guide</h1>
        <p className="text-muted-foreground">Complete guide for managing the National Address Registry system</p>
      </div>

      {/* Getting Started */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Getting Started
        </h2>
        <div className="space-y-3">
          <p><strong>Your Role:</strong> Registrars have the highest level of administrative control over the National Address Registry, responsible for final approvals, system configuration, and data quality management.</p>
          <p><strong>Access:</strong> Log in and navigate to the Unified Dashboard at /dashboard - full registrar controls will be accessible</p>
          <p><strong>Key Permissions:</strong> Approve/reject addresses, manage users, publish addresses, configure system, manage NAR authorities, view analytics</p>
        </div>
      </Card>

      {/* Final Approval Process */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Final Address Approval</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Step 1: Access Approval Queue</h3>
            <p>From dashboard, navigate to "Pending Approvals" to see verifier-approved addresses</p>
          </div>
          
          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Step 2: Review Verified Addresses</h3>
            <p className="mb-2">Each address shows:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Complete address details</li>
              <li>GPS coordinates and map view</li>
              <li>Submitted photo evidence</li>
              <li>Verifier approval and notes</li>
              <li>Quality scores and analysis</li>
              <li>Duplicate check results</li>
            </ul>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Step 3: Final Decision</h3>
            <ul className="space-y-2 ml-2">
              <li><strong className="text-green-600">Approve & Publish:</strong>
                <ul className="list-disc list-inside ml-4 text-sm mt-1">
                  <li>Generates unique UAC (Unified Address Code)</li>
                  <li>Publishes to national registry</li>
                  <li>Makes address publicly searchable</li>
                  <li>Notifies submitter of approval</li>
                </ul>
              </li>
              <li><strong className="text-red-600">Reject:</strong>
                <ul className="list-disc list-inside ml-4 text-sm mt-1">
                  <li>Send back to verifier with feedback</li>
                  <li>Specify quality concerns</li>
                  <li>Request additional verification</li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Publishing Management */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Publishing & Unpublishing</h2>
        <div className="space-y-3">
          <h3 className="font-semibold">Publishing Addresses:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Use "Publishing Queue" to batch publish multiple addresses</li>
            <li>Review addresses before final publish</li>
            <li>Click "Publish Selected" to make public</li>
            <li>Published addresses receive UAC and become searchable</li>
          </ul>

          <h3 className="font-semibold mt-4">Unpublishing Addresses:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Access "Unpublishing Queue" for removal requests</li>
            <li>Select addresses to unpublish</li>
            <li>Provide reason for unpublishing</li>
            <li>Click "Unpublish Selected" - removes from public search</li>
          </ul>

          <div className="bg-muted p-4 rounded-lg mt-4">
            <p className="text-sm"><strong>⚠️ Important:</strong> Unpublished addresses retain their UAC but won't appear in public searches. They can be republished later.</p>
          </div>
        </div>
      </Card>

      {/* User Management */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Management
        </h2>
        <div className="space-y-3">
          <p>Access User Manager to control system access and roles</p>

          <h3 className="font-semibold mt-4">Available Roles:</h3>
          <ul className="space-y-2 ml-4">
            <li><strong>Admin:</strong> Full system access (create with caution)</li>
            <li><strong>Registrar:</strong> Registry management and approvals</li>
            <li><strong>Verifier:</strong> Quality verification of submissions</li>
            <li><strong>Field Agent:</strong> Address capture in the field</li>
            <li><strong>Citizen:</strong> Public access for address requests</li>
            <li><strong>Police Roles:</strong> Emergency management system access</li>
            <li><strong>CAR Verifier:</strong> Citizen address verification</li>
          </ul>

          <h3 className="font-semibold mt-4">User Management Actions:</h3>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Click "User Manager" from dashboard</li>
            <li>View all users and their roles</li>
            <li>Click "Edit" to modify user roles</li>
            <li>Select appropriate role(s) from dropdown</li>
            <li>Add role metadata (geographic scope, jurisdiction)</li>
            <li>Save changes - user receives updated permissions</li>
          </ol>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-4">
            <p className="text-sm text-yellow-800"><strong>🔒 Security:</strong> Only assign roles to verified staff. Review user access regularly.</p>
          </div>
        </div>
      </Card>

      {/* NAR Authority Management */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">NAR Authority Management</h2>
        <div className="space-y-3">
          <p><strong>Purpose:</strong> NAR Authorities are special users who can create addresses directly without going through the verification workflow</p>

          <h3 className="font-semibold mt-4">Creating NAR Authority:</h3>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Navigate to "NAR Authority Manager"</li>
            <li>Click "Create New Authority"</li>
            <li>Select user to grant authority</li>
            <li>Choose authority level:
              <ul className="list-disc list-inside ml-4 mt-1">
                <li><strong>National:</strong> Create addresses anywhere</li>
                <li><strong>Regional:</strong> Limited to specific region</li>
                <li><strong>City:</strong> Limited to specific city</li>
              </ul>
            </li>
            <li>Set permissions:
              <ul className="list-disc list-inside ml-4 mt-1">
                <li>Can create addresses (recommended: Yes)</li>
                <li>Can verify addresses (recommended: Yes)</li>
                <li>Can update addresses (use with caution)</li>
              </ul>
            </li>
            <li>Define jurisdiction (region/city if limited)</li>
            <li>Save - authority is active immediately</li>
          </ol>

          <h3 className="font-semibold mt-4">Managing Existing Authorities:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>View all active authorities</li>
            <li>Edit permissions and jurisdiction</li>
            <li>Deactivate authority if needed</li>
            <li>Monitor creation logs for audit trail</li>
          </ul>
        </div>
      </Card>

      {/* System Configuration */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5" />
          System Configuration
        </h2>
        <div className="space-y-3">
          <p>Access "System Configuration" to manage global settings</p>

          <h3 className="font-semibold mt-4">Auto-Verification Settings:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Enable/disable auto-verification for citizen requests</li>
            <li>Set minimum quality score threshold (recommended: 70)</li>
            <li>Configure duplicate detection sensitivity</li>
            <li>Set photo requirement rules</li>
          </ul>

          <h3 className="font-semibold mt-4">Workflow Configuration:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Set SLA timelines for verification/approval</li>
            <li>Configure notification settings</li>
            <li>Enable/disable specific features</li>
            <li>Manage approval workflow stages</li>
          </ul>

          <h3 className="font-semibold mt-4">Data Quality Rules:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Set completeness score requirements</li>
            <li>Define mandatory fields</li>
            <li>Configure coordinate accuracy thresholds</li>
            <li>Set photo quality requirements</li>
          </ul>
        </div>
      </Card>

      {/* Analytics & Reporting */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Database className="h-5 w-5" />
          Analytics & Reporting
        </h2>
        <div className="space-y-3">
          <h3 className="font-semibold">Coverage Analytics:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>View address coverage by region and city</li>
            <li>Track verification and publication rates</li>
            <li>Monitor growth trends over time</li>
            <li>Identify underserved areas</li>
          </ul>

          <h3 className="font-semibold mt-4">Quality Metrics:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Completeness score distribution</li>
            <li>Verification success/rejection rates</li>
            <li>Average processing time per stage</li>
            <li>Field agent performance metrics</li>
          </ul>

          <h3 className="font-semibold mt-4">System Usage:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Active user counts by role</li>
            <li>Search analytics and popular queries</li>
            <li>API usage statistics</li>
            <li>Public portal access metrics</li>
          </ul>
        </div>
      </Card>

      {/* Data Management */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Data Management & Export</h2>
        <div className="space-y-3">
          <h3 className="font-semibold">Bulk Operations:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Bulk approve multiple verified addresses</li>
            <li>Bulk publish/unpublish addresses</li>
            <li>Batch update address attributes</li>
            <li>Mass data quality improvements</li>
          </ul>

          <h3 className="font-semibold mt-4">Data Export:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Export addresses to CSV/Excel</li>
            <li>Generate reports for government agencies</li>
            <li>Export analytics dashboards</li>
            <li>Create backup exports</li>
          </ul>

          <h3 className="font-semibold mt-4">Quality Management:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Run quality audits on existing addresses</li>
            <li>Identify and fix duplicate addresses</li>
            <li>Update incomplete address records</li>
            <li>Flag low-quality addresses for review</li>
          </ul>
        </div>
      </Card>

      {/* API & Webhooks */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">API & Webhook Management</h2>
        <div className="space-y-3">
          <h3 className="font-semibold">Public API:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Enable/disable public API access</li>
            <li>Generate API keys for partners</li>
            <li>Monitor API usage and rate limits</li>
            <li>Configure allowed endpoints</li>
          </ul>

          <h3 className="font-semibold mt-4">Webhook Configuration:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Set up webhooks for address events</li>
            <li>Configure government integration endpoints</li>
            <li>Monitor webhook delivery status</li>
            <li>Retry failed webhook deliveries</li>
          </ul>
        </div>
      </Card>

      {/* Best Practices */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Best Practices
        </h2>
        <div className="space-y-3">
          <h3 className="font-semibold">Security:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>✅ Review user access permissions monthly</li>
            <li>✅ Limit NAR authority assignments to trusted staff</li>
            <li>✅ Monitor audit logs for suspicious activity</li>
            <li>✅ Use strong authentication for all users</li>
            <li>✅ Keep backup exports in secure location</li>
          </ul>

          <h3 className="font-semibold mt-4">Data Quality:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>✅ Review rejection reasons and provide verifier feedback</li>
            <li>✅ Run monthly quality audits on published addresses</li>
            <li>✅ Monitor completeness scores and trends</li>
            <li>✅ Address duplicate detection issues promptly</li>
            <li>✅ Maintain consistent address formatting standards</li>
          </ul>

          <h3 className="font-semibold mt-4">Workflow Efficiency:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>✅ Process approval queue daily to maintain SLAs</li>
            <li>✅ Use bulk operations for routine tasks</li>
            <li>✅ Configure auto-verification to reduce manual load</li>
            <li>✅ Provide timely feedback to field agents and verifiers</li>
            <li>✅ Monitor and address workflow bottlenecks</li>
          </ul>
        </div>
      </Card>

      {/* Troubleshooting */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Common Issues</h2>
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold">UAC generation failing?</h3>
            <ul className="list-disc list-inside ml-4 text-sm">
              <li>Check address has all required fields</li>
              <li>Verify region and city codes are valid</li>
              <li>Review system logs for errors</li>
              <li>Contact system admin if persistent</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">Duplicate detection not working?</h3>
            <ul className="list-disc list-inside ml-4 text-sm">
              <li>Manually search for similar addresses</li>
              <li>Check GPS coordinate accuracy</li>
              <li>Review duplicate threshold settings</li>
              <li>Run database cleanup if needed</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">Webhook delivery failures?</h3>
            <ul className="list-disc list-inside ml-4 text-sm">
              <li>Verify partner endpoint is accessible</li>
              <li>Check webhook configuration settings</li>
              <li>Review delivery logs for error details</li>
              <li>Use manual retry for failed deliveries</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Support */}
      <Card className="p-6 bg-muted">
        <h2 className="text-xl font-semibold mb-3">Need Help?</h2>
        <p>As a registrar, you have the highest level of access. Contact the system administrator or technical support team for complex system issues or feature requests.</p>
      </Card>
    </div>
  );
}
