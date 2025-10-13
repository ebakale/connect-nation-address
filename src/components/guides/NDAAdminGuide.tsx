import { Card } from "@/components/ui/card";
import { Shield, Database, Key, Settings, Globe, FileCheck } from "lucide-react";

export function NDAAdminGuide() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">NDAA Admin User Guide</h1>
        <p className="text-muted-foreground">Complete guide for National Digital Address Authority administrators</p>
      </div>

      <Card className="p-6">
        <div className="flex items-start gap-3">
          <Shield className="h-6 w-6 text-primary mt-1" />
          <div>
            <h2 className="text-xl font-semibold mb-3">Your Role</h2>
            <p className="text-muted-foreground mb-4">
              As an NDAA Admin, you have the highest level of authority in the National Address System. 
              You are responsible for national-level governance, policy enforcement, and strategic oversight 
              of the entire address registry infrastructure.
            </p>
            <div className="space-y-2">
              <h3 className="font-semibold">Key Responsibilities:</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>National-level system governance and policy enforcement</li>
                <li>API key and integration management</li>
                <li>Override authority on all decisions</li>
                <li>Strategic oversight of all registries (NAR, CAR)</li>
                <li>National audit log access and compliance monitoring</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-start gap-3">
          <Globe className="h-6 w-6 text-primary mt-1" />
          <div>
            <h2 className="text-xl font-semibold mb-3">Getting Started</h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-2">Access</h3>
                <p className="text-muted-foreground">
                  Log in at <strong>/dashboard</strong> with your NDAA Admin credentials.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Scope</h3>
                <p className="text-muted-foreground">
                  You have national-level access across all provinces, districts, and systems.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-start gap-3">
          <Key className="h-6 w-6 text-primary mt-1" />
          <div>
            <h2 className="text-xl font-semibold mb-3">API & Integration Management</h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-2">API Key Management</h3>
                <p className="text-muted-foreground mb-2">Only NDAA Admins can create and manage API keys:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Generate new API keys for government agencies and partners</li>
                  <li>Revoke compromised or expired API keys</li>
                  <li>Monitor API usage and rate limits</li>
                  <li>Set access levels and permissions per API key</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Webhook Configuration</h3>
                <p className="text-muted-foreground mb-2">Configure external integrations:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Set up webhook endpoints for real-time data synchronization</li>
                  <li>Configure event triggers for government systems</li>
                  <li>Monitor webhook delivery status and failures</li>
                  <li>Manage retry policies and error handling</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-start gap-3">
          <FileCheck className="h-6 w-6 text-primary mt-1" />
          <div>
            <h2 className="text-xl font-semibold mb-3">Override Authority</h2>
            <div className="space-y-3">
              <p className="text-muted-foreground">
                As NDAA Admin, you have the authority to override decisions made at any level:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li><strong>Verification Overrides:</strong> Override verifier rejections or approvals</li>
                <li><strong>Publishing Overrides:</strong> Force publish or unpublish addresses</li>
                <li><strong>CAR Overrides:</strong> Override CAR verification decisions</li>
                <li><strong>Policy Exceptions:</strong> Grant exceptions to standard policies when justified</li>
              </ul>
              <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                <p className="text-sm text-yellow-600 dark:text-yellow-500">
                  <strong>Important:</strong> All override actions are logged in the national audit trail. 
                  Use this authority responsibly and document reasons for overrides.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-start gap-3">
          <Database className="h-6 w-6 text-primary mt-1" />
          <div>
            <h2 className="text-xl font-semibold mb-3">National Oversight</h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-2">NAR (National Address Registry)</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Monitor national address coverage and quality metrics</li>
                  <li>Review registrar performance across provinces</li>
                  <li>Set national standards and quality benchmarks</li>
                  <li>Access full evidence and verification records</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">CAR (Citizen Address Repository)</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Oversee citizen address declarations nationwide</li>
                  <li>Monitor CAR verifier performance</li>
                  <li>Review residency verification processes</li>
                  <li>Access aggregated person and household data</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Emergency Services Integration</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Monitor address system usage by police and emergency services</li>
                  <li>Review incident response times and address accuracy</li>
                  <li>Coordinate with police admins on system improvements</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-start gap-3">
          <Settings className="h-6 w-6 text-primary mt-1" />
          <div>
            <h2 className="text-xl font-semibold mb-3">System Configuration</h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-2">National Policies</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Define national address assignment standards</li>
                  <li>Set verification requirements and quality thresholds</li>
                  <li>Configure auto-verification rules and AI settings</li>
                  <li>Establish data retention and privacy policies</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Hierarchy Management</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Edit national administrative hierarchy (provinces, districts)</li>
                  <li>Define geographic boundaries and jurisdictions</li>
                  <li>Manage organizational structures and reporting lines</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">User & Role Management</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Create and manage registrar accounts</li>
                  <li>Assign geographic and organizational scopes to users</li>
                  <li>Audit user permissions and access patterns</li>
                  <li>Deactivate or transfer user responsibilities</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-start gap-3">
          <Database className="h-6 w-6 text-primary mt-1" />
          <div>
            <h2 className="text-xl font-semibold mb-3">Analytics & Reporting</h2>
            <div className="space-y-3">
              <p className="text-muted-foreground">Access comprehensive national-level analytics:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li><strong>Coverage Metrics:</strong> National address coverage by province, district, and locality</li>
                <li><strong>Performance Analytics:</strong> Verification times, approval rates, and workflow efficiency</li>
                <li><strong>Quality Metrics:</strong> Data quality scores, photo quality, coordinate accuracy</li>
                <li><strong>Usage Statistics:</strong> API calls, search queries, citizen portal usage</li>
                <li><strong>Audit Trails:</strong> Full access to all system actions and changes</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-start gap-3">
          <Shield className="h-6 w-6 text-primary mt-1" />
          <div>
            <h2 className="text-xl font-semibold mb-3">Best Practices</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>Document Overrides:</strong> Always document reasons when overriding decisions</li>
              <li><strong>API Key Security:</strong> Use secure key rotation schedules and monitor for compromises</li>
              <li><strong>Policy Updates:</strong> Communicate policy changes to all registrars before implementation</li>
              <li><strong>Regular Audits:</strong> Review audit logs regularly for anomalies or security issues</li>
              <li><strong>Stakeholder Communication:</strong> Keep government agencies informed of system changes</li>
              <li><strong>Data Privacy:</strong> Ensure all configurations comply with national data protection laws</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-muted">
        <h2 className="text-xl font-semibold mb-3">Help & Support</h2>
        <p className="text-muted-foreground">
          For technical assistance or escalations, contact the system development team.
          For policy questions, consult with the NDAA directorate.
        </p>
      </Card>
    </div>
  );
}
