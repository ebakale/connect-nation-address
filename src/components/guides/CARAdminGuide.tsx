import { Card } from "@/components/ui/card";
import { Shield, Users, Database, Settings } from "lucide-react";

export function CARAdminGuide() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">CAR Admin User Guide</h1>
        <p className="text-muted-foreground">Complete guide for administering the Citizen Address Repository</p>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Getting Started
        </h2>
        <div className="space-y-3">
          <p><strong>Your Role:</strong> CAR administrators manage the Citizen Address Repository system, including user permissions, data quality, and system configuration.</p>
          <p><strong>Access:</strong> Full CAR management dashboard</p>
          <p><strong>Key Permissions:</strong> Manage CAR verifiers, configure verification rules, access all citizen declarations, manage data quality, view analytics</p>
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
            <li>Set manual review triggers</li>
            <li>Configure duplicate detection sensitivity</li>
            <li>Define quality thresholds</li>
          </ul>

          <h3 className="font-semibold mt-4">Workflow Settings:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Set verification SLA timelines</li>
            <li>Configure notification rules</li>
            <li>Define escalation procedures</li>
            <li>Manage status workflow stages</li>
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
            <li>View all CAR verifiers and their permissions</li>
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
          </ul>

          <h3 className="font-semibold mt-4">Security:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>🔒 Grant minimum necessary permissions</li>
            <li>🔒 Review permission assignments regularly</li>
            <li>🔒 Monitor for suspicious declaration patterns</li>
            <li>🔒 Maintain audit logs for compliance</li>
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
