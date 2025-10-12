import { Card } from "@/components/ui/card";
import { Shield, Settings, Database, Users } from "lucide-react";

export function PoliceAdminGuide() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Police Admin User Guide</h1>
        <p className="text-muted-foreground">Complete guide for administering the emergency management system</p>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Getting Started
        </h2>
        <div className="space-y-3">
          <p><strong>Your Role:</strong> Police administrators have the highest level of control over the emergency management system, including user management, system configuration, and data access.</p>
          <p><strong>Access:</strong> Full Police Dashboard with administrative controls</p>
          <p><strong>Key Permissions:</strong> Manage all users, configure system settings, access all incidents nationwide, manage emergency units, view all analytics</p>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Role Management
        </h2>
        <div className="space-y-3">
          <h3 className="font-semibold">Police Role Types:</h3>
          <ul className="space-y-2 ml-4">
            <li><strong>Police Admin:</strong> Full system administration</li>
            <li><strong>Police Dispatcher:</strong> Incident management and unit coordination</li>
            <li><strong>Police Supervisor:</strong> Unit management within geographic scope</li>
            <li><strong>Police Operator:</strong> Field response officers</li>
          </ul>

          <h3 className="font-semibold mt-4">Assigning Roles:</h3>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Navigate to User Manager</li>
            <li>Select user to modify</li>
            <li>Add appropriate police role</li>
            <li>For supervisors: set geographic scope metadata
              <ul className="list-disc list-inside ml-4 mt-1">
                <li>Scope type: city, region, or province</li>
                <li>Scope value: specific city/region name</li>
              </ul>
            </li>
            <li>Save changes - user receives updated permissions</li>
          </ol>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-4">
            <p className="text-sm text-yellow-800"><strong>⚠️ Security:</strong> Be careful with police_admin role - it grants full system access</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5" />
          System Configuration
        </h2>
        <div className="space-y-3">
          <h3 className="font-semibold">Emergency Settings:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Configure emergency types and priorities</li>
            <li>Set automatic dispatch rules</li>
            <li>Define response time SLAs</li>
            <li>Configure encryption settings for sensitive data</li>
          </ul>

          <h3 className="font-semibold mt-4">Unit Configuration:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Define unit types (patrol, motorcycle, K9, etc.)</li>
            <li>Set coverage area requirements</li>
            <li>Configure GPS tracking settings</li>
            <li>Manage unit status options</li>
          </ul>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Database className="h-5 w-5" />
          Data Management
        </h2>
        <div className="space-y-3">
          <h3 className="font-semibold">Access Control:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>View all incidents system-wide (encrypted data)</li>
            <li>Access incident logs and audit trails</li>
            <li>Export incident data for reporting</li>
            <li>Manage data retention policies</li>
          </ul>

          <h3 className="font-semibold mt-4">Analytics:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>System-wide performance metrics</li>
            <li>Regional and city-level analytics</li>
            <li>Response time analysis</li>
            <li>Resource utilization reports</li>
          </ul>
        </div>
      </Card>

      <Card className="p-6 bg-muted">
        <h2 className="text-xl font-semibold mb-3">Need Help?</h2>
        <p>Contact the system administrator for technical issues or configuration assistance.</p>
      </Card>
    </div>
  );
}
