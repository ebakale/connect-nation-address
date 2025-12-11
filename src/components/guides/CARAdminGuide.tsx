import { Card } from "@/components/ui/card";
import { Shield, Users, Database, Settings, Home, BarChart3, Lock } from "lucide-react";

export function CARAdminGuide() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">CAR Admin User Guide</h1>
        <p className="text-muted-foreground">Complete guide for administering the Citizen Address Repository (Updated Dec 2025)</p>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Getting Started
        </h2>
        <div className="space-y-3">
          <p><strong>Your Role:</strong> CAR administrators manage the Citizen Address Repository system, including user permissions, household management, data quality, and system configuration.</p>
          <p><strong>Access:</strong> Log in and navigate to the Unified Dashboard at /dashboard - full CAR administration tools will be available</p>
          <p><strong>Key Permissions:</strong> Manage CAR verifiers, configure verification rules, access all citizen declarations, manage households, view CAR analytics</p>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          CAR Permission Management
        </h2>
        <div className="space-y-3">
          <p><strong>CAR-Specific Permissions:</strong> Beyond role-based access, CAR uses granular permissions system</p>

          <h3 className="font-semibold mt-4">Granting CAR Permissions:</h3>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Navigate to "CAR Permissions Manager"</li>
            <li>Select user to grant permissions</li>
            <li>Configure permission settings:
              <ul className="list-disc list-inside ml-4 mt-1">
                <li><strong>Can review citizen addresses:</strong> Review declarations</li>
                <li><strong>Can verify residency:</strong> Confirm/reject declarations</li>
                <li><strong>Can manage person records:</strong> Edit person data</li>
                <li><strong>Can access address history:</strong> View full history</li>
                <li><strong>Can update address status:</strong> Change declaration status</li>
                <li><strong>Can merge duplicate persons:</strong> Data cleanup</li>
              </ul>
            </li>
            <li>Set geographic scope (optional):
              <ul className="list-disc list-inside ml-4 mt-1">
                <li>Limit to specific regions/cities</li>
                <li>Or grant full access</li>
              </ul>
            </li>
            <li>Define jurisdiction scope (national, regional, local)</li>
            <li>Save - permissions active immediately</li>
          </ol>

          <div className="bg-muted p-4 rounded-lg mt-4">
            <p className="text-sm"><strong>Unified Verifier Role:</strong> Verifiers now have a verification_domain scope: 'nar' (address verification), 'car' (residency verification), or 'both'. Configure this when assigning the verifier role.</p>
          </div>
        </div>
      </Card>

      {/* Household Management - NEW */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Home className="h-5 w-5" />
          Household Management
        </h2>
        <div className="space-y-3">
          <p>Oversee household groups, dependents, and family structures:</p>

          <h3 className="font-semibold mt-4">Household Groups:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>View all household groups in your jurisdiction</li>
            <li>Each household has a designated head (linked to person record)</li>
            <li>Primary UAC links household to physical address</li>
            <li>Track household status: active, inactive, dissolved</li>
            <li>Verify households for official recognition</li>
          </ul>

          <h3 className="font-semibold mt-4">Dependent Management:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>View all dependents registered by guardians</li>
            <li>Dependent types: minor, student, disabled_adult, elderly</li>
            <li>Track majority age notifications (when minors turn 18)</li>
            <li>Monitor claimed_own_account status</li>
            <li>Verify documentation: birth certificates, student IDs, disability certificates</li>
          </ul>

          <h3 className="font-semibold mt-4">Custody Tracking:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Dependents can belong to multiple households (shared custody)</li>
            <li>Custody types: sole, joint, primary, secondary</li>
            <li>Residence percentage tracking for shared custody</li>
            <li>Custody schedule documentation</li>
          </ul>

          <h3 className="font-semibold mt-4">Household Succession:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>When household head changes, track succession</li>
            <li>Previous household ID maintained for history</li>
            <li>Succession date recorded for audit</li>
          </ul>
        </div>
      </Card>

      {/* CAR Analytics - NEW */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          CAR Analytics
        </h2>
        <div className="space-y-3">
          <p>Monitor citizen-focused metrics for the CAR system:</p>

          <h3 className="font-semibold mt-4">Citizen Adoption Metrics:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>Citizen Adoption Rate:</strong> % of registered users with CAR addresses</li>
            <li><strong>CAR Verification Rate:</strong> % of declarations confirmed vs pending</li>
            <li><strong>Average Verification Time:</strong> Hours from declaration to confirmation</li>
          </ul>

          <h3 className="font-semibold mt-4">Address Status Breakdown:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Self-declared vs Confirmed vs Rejected counts</li>
            <li>Primary vs Secondary address distribution</li>
            <li>Privacy level distribution (PRIVATE, REGION_ONLY, PUBLIC)</li>
            <li>Address scope distribution (BUILDING vs UNIT)</li>
          </ul>

          <h3 className="font-semibold mt-4">Household Analytics:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>Household Formation:</strong> Total active households</li>
            <li><strong>Average Household Size:</strong> Members per household</li>
            <li><strong>Verified Households:</strong> % verified by CAR</li>
            <li><strong>Dependent Distribution:</strong> By type (minor, student, etc.)</li>
            <li><strong>Member Relationships:</strong> By relationship type (spouse, child, etc.)</li>
          </ul>

          <div className="bg-muted p-4 rounded-lg mt-4">
            <p className="text-sm"><strong>Data Source:</strong> Analytics are pulled directly from citizen_address, household_groups, household_members, household_dependents, and profiles tables.</p>
          </div>
        </div>
      </Card>

      {/* Privacy Levels - NEW */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Privacy Level Management
        </h2>
        <div className="space-y-3">
          <p>Manage citizen address privacy settings:</p>

          <h3 className="font-semibold mt-4">Privacy Levels:</h3>
          <ul className="space-y-3 ml-4">
            <li>
              <strong className="text-red-600">PRIVATE:</strong>
              <p className="text-sm ml-4">Only the citizen and authorized officials can see. Not searchable.</p>
            </li>
            <li>
              <strong className="text-yellow-600">REGION_ONLY:</strong>
              <p className="text-sm ml-4">Visible to users within the same region. Emergency services, local government.</p>
            </li>
            <li>
              <strong className="text-green-600">PUBLIC:</strong>
              <p className="text-sm ml-4">Fully searchable by all users. searchable_by_public=true.</p>
            </li>
          </ul>

          <h3 className="font-semibold mt-4">Admin Override:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>CAR admins can view all addresses regardless of privacy</li>
            <li>Emergency services always have access during emergencies</li>
            <li>Privacy changes are logged in citizen_address_event table</li>
          </ul>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5" />
          System Configuration
        </h2>
        <div className="space-y-3">
          <h3 className="font-semibold">Auto-Verification Rules:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Enable/disable auto-confirmation for verified UACs</li>
            <li>Trigger: trigger_auto_approve_citizen_address()</li>
            <li>Auto-approves if UAC links to verified NAR address</li>
            <li>Set manual review triggers for edge cases</li>
          </ul>

          <h3 className="font-semibold mt-4">Workflow Settings:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Set verification SLA timelines</li>
            <li>Configure notification rules</li>
            <li>Define escalation procedures</li>
            <li>Manage status workflow stages</li>
          </ul>

          <h3 className="font-semibold mt-4">Quality Thresholds:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Configure duplicate detection sensitivity</li>
            <li>Set quality score requirements</li>
            <li>Define manual review triggers</li>
          </ul>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Database className="h-5 w-5" />
          Data Quality Management
        </h2>
        <div className="space-y-3">
          <h3 className="font-semibold">Quality Metrics:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Total citizen addresses by status</li>
            <li>Pending vs confirmed vs rejected breakdown</li>
            <li>Duplicate person records detection</li>
            <li>Address coverage by region</li>
            <li>Average verification time</li>
          </ul>

          <h3 className="font-semibold mt-4">Bulk Operations:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Bulk approve verified declarations</li>
            <li>Merge duplicate person records</li>
            <li>Update address statuses in batch</li>
            <li>Data cleanup operations</li>
          </ul>

          <h3 className="font-semibold mt-4">Data Export:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Export declarations to CSV</li>
            <li>Generate compliance reports</li>
            <li>Create analytics dashboards</li>
          </ul>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Managing Verifiers</h2>
        <div className="space-y-3">
          <h3 className="font-semibold">Verifier Oversight:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>View all verifiers with CAR domain (verification_domain='car' or 'both')</li>
            <li>Monitor verification activity and performance</li>
            <li>Review decisions for quality assurance</li>
            <li>Adjust permissions based on performance</li>
            <li>Provide training and guidance</li>
          </ul>

          <h3 className="font-semibold mt-4">Performance Tracking:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Verifications per verifier</li>
            <li>Average verification time</li>
            <li>Approval/rejection rates</li>
            <li>Quality of feedback provided</li>
          </ul>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Person Record Management</h2>
        <div className="space-y-3">
          <h3 className="font-semibold">Duplicate Detection:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>System flags potential duplicate person records</li>
            <li>Same auth_user_id with multiple person entries</li>
            <li>Review and merge duplicates</li>
            <li>Preserve address history when merging</li>
          </ul>

          <h3 className="font-semibold mt-4">Merging Process:</h3>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Identify duplicate person records</li>
            <li>Review all addresses for each duplicate</li>
            <li>Select primary person record to keep</li>
            <li>Merge addresses from duplicate to primary</li>
            <li>Archive duplicate record</li>
            <li>Log merge event for audit trail</li>
          </ol>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Best Practices</h2>
        <div className="space-y-3">
          <h3 className="font-semibold">For System Health:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>✅ Run weekly quality metrics reviews</li>
            <li>✅ Monitor auto-verification success rates</li>
            <li>✅ Address duplicate person records promptly</li>
            <li>✅ Review verifier performance monthly</li>
            <li>✅ Keep verification SLAs realistic</li>
            <li>✅ Monitor household data quality</li>
          </ul>

          <h3 className="font-semibold mt-4">For Households:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>✅ Verify household documentation when flagged</li>
            <li>✅ Monitor custody arrangements for conflicts</li>
            <li>✅ Track dependents approaching majority age</li>
            <li>✅ Ensure household heads are correctly assigned</li>
          </ul>

          <h3 className="font-semibold mt-4">Security:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>🔒 Grant minimum necessary permissions</li>
            <li>🔒 Review permission assignments regularly</li>
            <li>🔒 Monitor for suspicious declaration patterns</li>
            <li>🔒 Maintain audit logs for compliance</li>
            <li>🔒 Respect citizen privacy level choices</li>
          </ul>
        </div>
      </Card>

      <Card className="p-6 bg-muted">
        <h2 className="text-xl font-semibold mb-3">Need Help?</h2>
        <p>Contact system administrators for technical issues or integrations with the NAR system.</p>
      </Card>
    </div>
  );
}
