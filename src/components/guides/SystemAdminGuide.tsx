import { Card } from "@/components/ui/card";
import { Settings, Database, Users, Activity, AlertTriangle, Globe, Shield } from "lucide-react";

export function SystemAdminGuide() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">System Admin User Guide</h1>
        <p className="text-muted-foreground">Complete guide for system administrators managing the technical infrastructure</p>
      </div>

      <Card className="p-6">
        <div className="flex items-start gap-3">
          <Settings className="h-6 w-6 text-primary mt-1" />
          <div>
            <h2 className="text-xl font-semibold mb-3">Your Role</h2>
            <p className="text-muted-foreground mb-4">
              As a System Admin, you are responsible for the technical operation and maintenance 
              of the National Address System. You have regional-level access and focus on system 
              reliability, performance, and technical support.
            </p>
            <div className="space-y-2">
              <h3 className="font-semibold">Key Responsibilities:</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Technical system maintenance and monitoring</li>
                <li>Regional user support and troubleshooting</li>
                <li>Database optimization and performance tuning</li>
                <li>Webhook and integration management</li>
                <li>System-wide audit log access for debugging</li>
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
                  Log in at <strong>/dashboard</strong> with your System Admin credentials.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Scope</h3>
                <p className="text-muted-foreground">
                  You have regional-level access, which includes multiple provinces within your assigned region.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Initial Setup</h3>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Review current system health and monitoring dashboards</li>
                  <li>Familiarize yourself with active webhooks and integrations</li>
                  <li>Check recent audit logs for any anomalies</li>
                  <li>Verify backup systems are functioning properly</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-start gap-3">
          <Database className="h-6 w-6 text-primary mt-1" />
          <div>
            <h2 className="text-xl font-semibold mb-3">System Monitoring</h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-2">Performance Monitoring</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Monitor database query performance and slow queries</li>
                  <li>Track API response times and error rates</li>
                  <li>Review edge function execution times and failures</li>
                  <li>Monitor storage usage and optimize as needed</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">System Health</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Check uptime and availability metrics</li>
                  <li>Monitor backup success rates</li>
                  <li>Review error logs and exception reports</li>
                  <li>Track user authentication issues</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-start gap-3">
          <Users className="h-6 w-6 text-primary mt-1" />
          <div>
            <h2 className="text-xl font-semibold mb-3">User Management</h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-2">User Support</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Reset user passwords and resolve authentication issues</li>
                  <li>Troubleshoot permission and access problems</li>
                  <li>Assist with technical issues in workflows</li>
                  <li>Provide training and onboarding support</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Role Administration</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Create user accounts for registrars, verifiers, and field agents</li>
                  <li>Assign appropriate roles and geographic scopes</li>
                  <li>Manage role transitions and promotions</li>
                  <li>Deactivate accounts for departed personnel</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-start gap-3">
          <Activity className="h-6 w-6 text-primary mt-1" />
          <div>
            <h2 className="text-xl font-semibold mb-3">Integration Management</h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-2">Webhook Management</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Configure webhook endpoints for external systems</li>
                  <li>Monitor webhook delivery status and retry attempts</li>
                  <li>Debug failed webhook deliveries</li>
                  <li>Update webhook configurations as needed</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">External APIs</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Monitor external API integrations (Google Maps, etc.)</li>
                  <li>Track API usage and quota limits</li>
                  <li>Troubleshoot integration failures</li>
                  <li>Update API credentials and configurations</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 text-primary mt-1" />
          <div>
            <h2 className="text-xl font-semibold mb-3">Troubleshooting</h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-2">Common Issues</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li><strong>User Can't Login:</strong> Check user_roles table and authentication status</li>
                  <li><strong>Slow Performance:</strong> Review database indexes and query patterns</li>
                  <li><strong>Webhook Failures:</strong> Check endpoint availability and authentication</li>
                  <li><strong>Missing Permissions:</strong> Verify role assignments and scope metadata</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Diagnostic Tools</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Access system-wide audit logs for troubleshooting</li>
                  <li>Run database queries to diagnose data issues</li>
                  <li>Check edge function logs for errors</li>
                  <li>Monitor network requests in browser developer tools</li>
                </ul>
              </div>
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
              <li><strong>Regular Monitoring:</strong> Check system health dashboards daily</li>
              <li><strong>Proactive Maintenance:</strong> Address performance issues before they impact users</li>
              <li><strong>Documentation:</strong> Document all configuration changes and technical decisions</li>
              <li><strong>Security:</strong> Monitor for suspicious activity and potential security issues</li>
              <li><strong>Communication:</strong> Keep NDAA Admin and registrars informed of system changes</li>
              <li><strong>Backup Verification:</strong> Regularly test backup restoration procedures</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-muted">
        <h2 className="text-xl font-semibold mb-3">Help & Support</h2>
        <p className="text-muted-foreground">
          For infrastructure issues, contact the hosting provider. For policy questions, escalate to NDAA Admin.
          For critical outages, follow the incident response procedures in the system documentation.
        </p>
      </Card>
    </div>
  );
}
