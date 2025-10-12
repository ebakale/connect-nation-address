import { Card } from "@/components/ui/card";
import { CheckCircle, XCircle, Home, FileCheck } from "lucide-react";

export function CARVerifierGuide() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">CAR Verifier User Guide</h1>
        <p className="text-muted-foreground">Complete guide for verifying citizen address declarations</p>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileCheck className="h-5 w-5" />
          Getting Started
        </h2>
        <div className="space-y-3">
          <p><strong>Your Role:</strong> CAR verifiers review and verify citizen address declarations in the Citizen Address Repository (CAR).</p>
          <p><strong>Access:</strong> CAR Verification Dashboard</p>
          <p><strong>Key Permissions:</strong> Review citizen declarations, verify residency claims, approve/reject addresses, access address history</p>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">CAR vs NAR Verification</h2>
        <div className="space-y-3">
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Important Distinction:</h3>
            <ul className="space-y-2">
              <li><strong className="text-primary">NAR (National Address Registry):</strong>
                <p className="text-sm ml-4">Physical addresses verified by field agents - buildings, streets, locations</p>
              </li>
              <li><strong className="text-primary">CAR (Citizen Address Repository):</strong>
                <p className="text-sm ml-4">Personal address declarations - citizens claiming residence at specific addresses</p>
              </li>
            </ul>
          </div>
          
          <p className="mt-4">As a CAR verifier, you verify that citizens actually live at the addresses they declare, not the physical address itself.</p>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">CAR Verification Queue</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Step 1: Access Queue</h3>
            <p>Navigate to "CAR Verification Queue" to see pending citizen declarations</p>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Step 2: Review Declaration</h3>
            <p className="mb-2">Each declaration shows:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Citizen Info:</strong> Name and contact details</li>
              <li><strong>UAC Reference:</strong> Address they're claiming</li>
              <li><strong>Address Kind:</strong> Primary or Secondary</li>
              <li><strong>Scope:</strong> Building or specific Unit</li>
              <li><strong>Unit UAC:</strong> Apartment/unit number if applicable</li>
              <li><strong>Occupant Type:</strong> Owner, Tenant, Family, etc.</li>
              <li><strong>Supporting Documents:</strong> If uploaded</li>
              <li><strong>NAR Address Details:</strong> Full address from registry</li>
              <li><strong>Status:</strong> SELF_DECLARED (pending your review)</li>
            </ul>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Step 3: Verification Checks</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>✅ UAC exists in NAR (verified address)</li>
              <li>✅ Unit UAC is appropriate for scope</li>
              <li>✅ Supporting documents are valid (if provided)</li>
              <li>✅ No conflicts with existing declarations</li>
              <li>✅ Citizen details match declaration</li>
            </ul>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Step 4: Make Decision</h3>
            <ul className="space-y-2 ml-2">
              <li><strong className="text-green-600">Confirm (CONFIRMED):</strong> Citizen's residency claim is verified</li>
              <li><strong className="text-red-600">Reject (REJECTED):</strong> Issues found, citizen needs to correct</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Confirming Declarations
        </h2>
        <div className="space-y-3">
          <p>Confirm when:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>UAC references a verified NAR address</li>
            <li>Scope and unit UAC are correctly specified</li>
            <li>Supporting documents validate residency (if provided)</li>
            <li>No duplicate or conflicting declarations</li>
            <li>Occupant type is reasonable</li>
          </ul>

          <div className="bg-muted p-4 rounded-lg mt-4">
            <p className="text-sm"><strong>🔄 Auto-Confirmation:</strong> If citizen references a verified NAR UAC, system auto-confirms. Manual review only for flagged cases.</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <XCircle className="h-5 w-5 text-red-600" />
          Rejecting Declarations
        </h2>
        <div className="space-y-3">
          <p>Reject when:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>UAC doesn't exist in NAR</li>
            <li>Scope/unit mismatch (e.g., claiming unit but no unit UAC)</li>
            <li>Insufficient or invalid documentation</li>
            <li>Suspicious patterns or fraud indicators</li>
            <li>Conflicting declarations for same address</li>
          </ul>

          <h3 className="font-semibold mt-4">Rejection Process:</h3>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Click "Reject" on declaration</li>
            <li>Add detailed feedback explaining issue</li>
            <li>Specify what citizen needs to correct</li>
            <li>Submit - citizen is notified and can resubmit</li>
          </ol>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Home className="h-5 w-5" />
          Understanding Address Types
        </h2>
        <div className="space-y-3">
          <h3 className="font-semibold">Address Kind:</h3>
          <ul className="space-y-2 ml-4">
            <li><strong>PRIMARY:</strong> Main residence (only one allowed per person)</li>
            <li><strong>SECONDARY:</strong> Work, vacation home, etc. (multiple allowed)</li>
            <li><strong>OTHER:</strong> Other address types</li>
          </ul>

          <h3 className="font-semibold mt-4">Scope:</h3>
          <ul className="space-y-2 ml-4">
            <li><strong>BUILDING:</strong> Entire building (no unit UAC needed)</li>
            <li><strong>UNIT:</strong> Specific apartment/unit (unit UAC required)</li>
          </ul>

          <h3 className="font-semibold mt-4">Occupant Type:</h3>
          <ul className="space-y-1 ml-4 text-sm">
            <li>OWNER, TENANT, FAMILY, EMPLOYEE, GUEST, OTHER</li>
          </ul>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Manual Review Queue</h2>
        <div className="space-y-3">
          <p><strong>Special Cases:</strong> Some declarations require manual review even if UAC is verified</p>
          
          <h3 className="font-semibold mt-4">Review Required When:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Multiple people claiming same unit</li>
            <li>Suspicious declaration patterns</li>
            <li>Mismatched scope and unit UAC</li>
            <li>System flags quality issues</li>
            <li>High-value properties or sensitive locations</li>
          </ul>

          <p className="mt-4 text-sm">Access "Manual Review Queue" for these flagged cases</p>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Best Practices</h2>
        <div className="space-y-3">
          <h3 className="font-semibold">Quality Verification:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>✅ Always verify UAC exists in NAR first</li>
            <li>✅ Check scope matches unit UAC presence</li>
            <li>✅ Review supporting documents carefully</li>
            <li>✅ Look for duplicate declarations</li>
            <li>✅ Provide clear feedback on rejections</li>
          </ul>

          <h3 className="font-semibold mt-4">Common Issues:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>🚨 Claiming UNIT scope but no unit UAC provided</li>
            <li>🚨 UAC typos (verify exact match)</li>
            <li>🚨 Wrong occupant type for situation</li>
            <li>🚨 Multiple primaries (only one allowed)</li>
          </ul>
        </div>
      </Card>

      <Card className="p-6 bg-muted">
        <h2 className="text-xl font-semibold mb-3">Need Help?</h2>
        <p>Contact CAR administrators or registrars for complex verification cases or policy questions.</p>
      </Card>
    </div>
  );
}
