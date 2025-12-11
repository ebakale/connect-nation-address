import { Card } from "@/components/ui/card";
import { Settings, Database, Users, Activity, AlertTriangle, Globe, Shield, Map, Clock, Zap } from "lucide-react";

export function SystemAdminGuide() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">System Admin User Guide</h1>
        <p className="text-muted-foreground">Complete guide for system administrators managing the technical infrastructure (Updated Dec 2025)</p>
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
                <li>Map provider and API management</li>
                <li>Retention policy monitoring</li>
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
                  <li>Review map provider status (Google Maps vs OSM fallback)</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Map Provider Fallback - NEW */}
      <Card className="p-6">
        <div className="flex items-start gap-3">
          <Map className="h-6 w-6 text-primary mt-1" />
          <div>
            <h2 className="text-xl font-semibold mb-3">Map Provider Management</h2>
            <div className="space-y-3">
              <p className="text-muted-foreground">
                The system implements automatic OpenStreetMap/Leaflet fallback when Google Maps is unavailable.
              </p>
              
              <div>
                <h3 className="font-semibold mb-2">Provider Priority</h3>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li><strong>Primary:</strong> Google Maps (requires billing enabled)</li>
                  <li><strong>Fallback:</strong> OpenStreetMap + Leaflet (free, automatic)</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Fallback Detection</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>System automatically detects Google Maps API errors</li>
                  <li>Transparently switches to OpenStreetMap</li>
                  <li>Users see warning banner when using OSM fallback</li>
                  <li>All map features continue working seamlessly</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Universal Map Components</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li><strong>UniversalFieldMap:</strong> For field agent operations</li>
                  <li><strong>UniversalLocationMap:</strong> For address viewing</li>
                  <li><strong>UniversalLocationPicker:</strong> For location selection</li>
                </ul>
              </div>

              <div className="bg-muted p-4 rounded-lg mt-4">
                <p className="text-sm"><strong>To enable Google Maps:</strong> Enable billing in Google Cloud Console and ensure the GOOGLE_MAPS_API_KEY secret is configured.</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Edge Functions - NEW */}
      <Card className="p-6">
        <div className="flex items-start gap-3">
          <Zap className="h-6 w-6 text-primary mt-1" />
          <div>
            <h2 className="text-xl font-semibold mb-3">Edge Functions (42+)</h2>
            <div className="space-y-3">
              <p className="text-muted-foreground">
                The system uses Supabase Edge Functions for serverless backend logic:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-primary">Address Management</h4>
                  <ul className="text-xs space-y-1 ml-4 mt-1 text-muted-foreground">
                    <li>• address-search-api</li>
                    <li>• address-validation-api</li>
                    <li>• address-webhook-triggers</li>
                    <li>• admin-address-requests</li>
                    <li>• auto-verify-address</li>
                    <li>• ml-address-validation</li>
                    <li>• unified-address-statistics</li>
                    <li>• unified-address-analytics</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-primary">Emergency Services</h4>
                  <ul className="text-xs space-y-1 ml-4 mt-1 text-muted-foreground">
                    <li>• process-emergency-alert</li>
                    <li>• notify-emergency-operators</li>
                    <li>• notify-unit-assignment</li>
                    <li>• notify-incident-reporter</li>
                    <li>• police-incident-actions</li>
                    <li>• police-operator-management</li>
                    <li>• process-backup-request</li>
                    <li>• decrypt-incident-data</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-primary">Business & Integration</h4>
                  <ul className="text-xs space-y-1 ml-4 mt-1 text-muted-foreground">
                    <li>• register-business-address</li>
                    <li>• external-api</li>
                    <li>• government-integration-api</li>
                    <li>• webhook-delivery-processor</li>
                    <li>• webhook-events</li>
                    <li>• import-google-maps-addresses</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-primary">System & Maintenance</h4>
                  <ul className="text-xs space-y-1 ml-4 mt-1 text-muted-foreground">
                    <li>• cleanup-rejected-items</li>
                    <li>• backup-system-api</li>
                    <li>• admin-user-operations</li>
                    <li>• seed-police-users</li>
                    <li>• generate-missing-uacs</li>
                    <li>• backfill-dependent-addresses</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Retention Policy Monitoring - NEW */}
      <Card className="p-6">
        <div className="flex items-start gap-3">
          <Clock className="h-6 w-6 text-primary mt-1" />
          <div>
            <h2 className="text-xl font-semibold mb-3">Retention Policy Monitoring</h2>
            <div className="space-y-3">
              <p className="text-muted-foreground">
                Monitor the automated data retention policy for rejected items:
              </p>
              
              <div>
                <h3 className="font-semibold mb-2">Retention Schedule</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li><strong>0-6 months:</strong> Active retention in main tables</li>
                  <li><strong>6-24 months:</strong> Archived to history tables</li>
                  <li><strong>24+ months:</strong> PII anonymized</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Archive Tables</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>rejected_requests_archive</li>
                  <li>rejected_citizen_addresses_archive</li>
                  <li>rejected_verifications_archive</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Monitoring Tasks</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Verify monthly cleanup job runs on 1st at 3 AM</li>
                  <li>Check cleanup_audit_log for execution records</li>
                  <li>Monitor archive table growth</li>
                  <li>Verify anonymization is working correctly</li>
                </ul>
              </div>

              <div className="bg-muted p-4 rounded-lg mt-4">
                <p className="text-sm"><strong>Cleanup Edge Function:</strong> cleanup-rejected-items handles archiving and anonymization. Monitor its execution in edge function logs.</p>
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
                  <li>Configure verification domains (NAR, CAR, both)</li>
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
                  <li>Monitor Google Maps API usage (or OSM fallback status)</li>
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
                  <li><strong>Map Not Loading:</strong> Check Google Maps billing or verify OSM fallback</li>
                  <li><strong>Geographic Scope Issues:</strong> Verify user's scope_type and scope_value</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Diagnostic Tools</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Access system-wide audit logs for troubleshooting</li>
                  <li>Run database queries to diagnose data issues</li>
                  <li>Check edge function logs for errors</li>
                  <li>Monitor network requests in browser developer tools</li>
                  <li>Review cleanup_audit_log for retention issues</li>
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
              <li><strong>Retention Monitoring:</strong> Verify cleanup jobs run successfully each month</li>
              <li><strong>Map Provider:</strong> Monitor for Google Maps quota issues and fallback frequency</li>
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
