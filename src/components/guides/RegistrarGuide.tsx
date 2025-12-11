import { Card } from "@/components/ui/card";
import { Shield, Settings, Users, Database, Eye, Globe, Clock } from "lucide-react";

export function RegistrarGuide() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Registrar User Guide</h1>
        <p className="text-muted-foreground">Complete guide for managing the National Address Registry system (Updated Dec 2025)</p>
      </div>

      {/* Getting Started */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Getting Started
        </h2>
        <div className="space-y-3">
          <p><strong>Your Role:</strong> Registrars have the highest level of administrative control over the National Address Registry within their geographic scope, responsible for final approvals, system configuration, and data quality management.</p>
          <p><strong>Access:</strong> Log in and navigate to the Unified Dashboard at /dashboard - full registrar controls will be accessible based on your geographic scope</p>
          <p><strong>Key Permissions:</strong> Approve/reject addresses, manage users, configure system, manage NAR authorities, view analytics, monitor retention policy</p>
        </div>
      </Card>

      {/* Geographic Scope - NEW */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Geographic Scope
        </h2>
        <div className="space-y-3">
          <p>Your access is limited to your assigned geographic region:</p>
          
          <h3 className="font-semibold mt-4">Scope Types:</h3>
          <ul className="space-y-2 ml-4">
            <li><strong>National:</strong> Full access to all provinces, cities, and addresses</li>
            <li><strong>Regional:</strong> Access to a specific region (e.g., Bioko Norte, Litoral)</li>
            <li><strong>Provincial:</strong> Access to a specific province</li>
            <li><strong>City:</strong> Access to a specific city only</li>
          </ul>

          <div className="bg-muted p-4 rounded-lg mt-4">
            <p className="text-sm"><strong>📍 Scope Badge:</strong> Your current scope is displayed in the dashboard header. You will only see pending requests, statistics, and users within your assigned jurisdiction.</p>
          </div>
        </div>
      </Card>

      {/* Final Approval Process */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Final Address Approval</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Step 1: Access Approval Queue</h3>
            <p>From dashboard, navigate to "Pending Approvals" to see verifier-approved addresses in your geographic scope</p>
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
              <li><strong className="text-green-600">Approve:</strong>
                <ul className="list-disc list-inside ml-4 text-sm mt-1">
                  <li>Generates unique UAC (Unified Address Code)</li>
                  <li>Auto-publishing applies based on address type</li>
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

      {/* Auto-Publishing Policy - NEW */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Auto-Publishing Policy</h2>
        <div className="space-y-3">
          <p>Upon approval, the system automatically sets the public status based on address type:</p>
          
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
              <h4 className="font-semibold text-green-700 dark:text-green-400">Auto-Published (public=true)</h4>
              <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                <li>Business</li>
                <li>Commercial</li>
                <li>Government</li>
                <li>Landmark</li>
                <li>Institutional</li>
                <li>Industrial</li>
                <li>Public</li>
              </ul>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-700 dark:text-yellow-400">Private by Default (public=false)</h4>
              <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                <li>Residential</li>
              </ul>
              <p className="text-sm mt-2 text-muted-foreground">Residential addresses require explicit publication if needed.</p>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg mt-4">
            <p className="text-sm"><strong>Note:</strong> This eliminates the need for manual publishing workflows. The Publishing tab is now for exceptional cases only.</p>
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
          <p>Access User Manager to control system access and roles within your geographic scope</p>

          <h3 className="font-semibold mt-4">Available Roles (20+):</h3>
          <div className="grid md:grid-cols-2 gap-4 mt-2">
            <div>
              <h4 className="font-medium text-sm text-primary">Address Management</h4>
              <ul className="text-sm space-y-1 ml-4 mt-1">
                <li>• <strong>admin:</strong> Full system access</li>
                <li>• <strong>registrar:</strong> Registry management</li>
                <li>• <strong>verifier:</strong> Address/residency verification</li>
                <li>• <strong>field_agent:</strong> Field address capture</li>
                <li>• <strong>nar_authority:</strong> Direct address creation</li>
                <li>• <strong>car_admin:</strong> CAR system administration</li>
                <li>• <strong>data_steward:</strong> Data quality management</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm text-primary">Emergency Services</h4>
              <ul className="text-sm space-y-1 ml-4 mt-1">
                <li>• <strong>police_admin:</strong> Police administration</li>
                <li>• <strong>police_supervisor:</strong> Unit supervision</li>
                <li>• <strong>police_operator:</strong> Field operations</li>
                <li>• <strong>emergency_dispatcher:</strong> Dispatch management</li>
                <li>• <strong>unit_lead:</strong> Unit leadership</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm text-primary">System & Support</h4>
              <ul className="text-sm space-y-1 ml-4 mt-1">
                <li>• <strong>system_admin:</strong> Technical administration</li>
                <li>• <strong>support:</strong> User support</li>
                <li>• <strong>auditor:</strong> Compliance auditing</li>
                <li>• <strong>partner:</strong> External partner access</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm text-primary">Public Access</h4>
              <ul className="text-sm space-y-1 ml-4 mt-1">
                <li>• <strong>citizen:</strong> Basic citizen access</li>
                <li>• <strong>business_owner:</strong> Business registration</li>
              </ul>
            </div>
          </div>

          <h3 className="font-semibold mt-4">User Management Actions:</h3>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Click "User Manager" from dashboard</li>
            <li>View all users within your geographic scope</li>
            <li>Click "Edit" to modify user roles</li>
            <li>Select appropriate role(s) from dropdown</li>
            <li>Add role metadata:
              <ul className="list-disc list-inside ml-4 mt-1 text-sm">
                <li><strong>Geographic scope:</strong> city, region, province, or national</li>
                <li><strong>Verification domain:</strong> nar, car, or both (for verifiers)</li>
              </ul>
            </li>
            <li>Save changes - user receives updated permissions</li>
          </ol>

          <div className="bg-yellow-50 dark:bg-yellow-500/10 border-l-4 border-yellow-500 p-4 mt-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200"><strong>🔒 Security:</strong> Only assign roles to verified staff. Review user access regularly. Verifiers should have explicit domain scope (NAR, CAR, or both).</p>
          </div>
        </div>
      </Card>

      {/* Retention Policy - NEW */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Data Retention Policy
        </h2>
        <div className="space-y-3">
          <p>Rejected items follow a tiered retention policy:</p>

          <div className="space-y-3 mt-4">
            <div className="flex items-start gap-3">
              <div className="w-24 text-sm font-medium">0-6 months</div>
              <div className="flex-1">
                <p className="font-semibold">Active Retention</p>
                <p className="text-sm text-muted-foreground">Full data in main tables. Citizens can view and delete their own rejected items.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-24 text-sm font-medium">6-24 months</div>
              <div className="flex-1">
                <p className="font-semibold">Archive</p>
                <p className="text-sm text-muted-foreground">Moved to archive tables. PII preserved for audit/compliance needs.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-24 text-sm font-medium">24+ months</div>
              <div className="flex-1">
                <p className="font-semibold">Anonymization</p>
                <p className="text-sm text-muted-foreground">PII removed. Statistical data retained for historical analysis.</p>
              </div>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg mt-4">
            <p className="text-sm"><strong>Cleanup Schedule:</strong> Monthly cron job runs on the 1st at 3 AM to execute archiving and anonymization.</p>
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
            <li>View address coverage by region and city (within your scope)</li>
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

          <h3 className="font-semibold mt-4">CAR Analytics:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Citizen adoption rate (% users with CAR addresses)</li>
            <li>CAR verification rate (% confirmed addresses)</li>
            <li>Household formation metrics</li>
            <li>Privacy level distribution</li>
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
            <li>✅ Assign explicit geographic scope to all users</li>
          </ul>

          <h3 className="font-semibold mt-4">Data Quality:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>✅ Review rejection reasons and provide verifier feedback</li>
            <li>✅ Run monthly quality audits on published addresses</li>
            <li>✅ Monitor completeness scores and trends</li>
            <li>✅ Address duplicate detection issues promptly</li>
            <li>✅ Validate business metadata before approval</li>
          </ul>

          <h3 className="font-semibold mt-4">Workflow Efficiency:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>✅ Process approval queue daily to maintain SLAs</li>
            <li>✅ Use bulk operations for routine tasks</li>
            <li>✅ Configure auto-verification to reduce manual load</li>
            <li>✅ Trust auto-publishing for non-residential addresses</li>
          </ul>
        </div>
      </Card>

      {/* Troubleshooting */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Common Issues</h2>
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold">Business approval failing?</h3>
            <ul className="list-disc list-inside ml-4 text-sm">
              <li>Check that organization_name is provided</li>
              <li>Verify business_category is set</li>
              <li>System prevents "Unknown Organization" records</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">Users not seeing expected data?</h3>
            <ul className="list-disc list-inside ml-4 text-sm">
              <li>Check their geographic scope assignment</li>
              <li>Verify they have the correct role</li>
              <li>Review their verification domain (NAR/CAR/both)</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">Address not appearing after approval?</h3>
            <ul className="list-disc list-inside ml-4 text-sm">
              <li>Residential addresses are private by default</li>
              <li>Check the public flag status</li>
              <li>Use Publishing Queue for explicit publication</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Support */}
      <Card className="p-6 bg-muted">
        <h2 className="text-xl font-semibold mb-3">Need Help?</h2>
        <p>As a registrar, you have high-level access within your scope. Contact the NDAA Admin for cross-regional issues or the system administrator for technical support.</p>
      </Card>
    </div>
  );
}
