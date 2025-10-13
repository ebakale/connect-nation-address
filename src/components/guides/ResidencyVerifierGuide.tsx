import { Card } from "@/components/ui/card";
import { CheckCircle, XCircle, Home, Users, FileCheck, MapPin, AlertCircle, Shield } from "lucide-react";

export function ResidencyVerifierGuide() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Residency Verifier User Guide</h1>
        <p className="text-muted-foreground">Complete guide for verifying citizen residency claims in the CAR system</p>
      </div>

      <Card className="p-6">
        <div className="flex items-start gap-3">
          <Users className="h-6 w-6 text-primary mt-1" />
          <div>
            <h2 className="text-xl font-semibold mb-3">Your Role</h2>
            <p className="text-muted-foreground mb-4">
              As a Residency Verifier, you are responsible for verifying that citizens actually reside 
              at the addresses they declare in the Citizen Address Repository (CAR). Your work ensures 
              the accuracy of residency data for government services, voting, and social programs.
            </p>
            <div className="space-y-2">
              <h3 className="font-semibold">Key Responsibilities:</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Verify citizen residency claims through physical verification</li>
                <li>Review supporting documents (utility bills, rental agreements, etc.)</li>
                <li>Conduct field visits when necessary</li>
                <li>Approve, reject, or flag residency claims</li>
                <li>Maintain accurate residency verification records</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-start gap-3">
          <Home className="h-6 w-6 text-primary mt-1" />
          <div>
            <h2 className="text-xl font-semibold mb-3">Getting Started</h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-2">Access</h3>
                <p className="text-muted-foreground">
                  Log in at <strong>/dashboard</strong> with your Residency Verifier credentials.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Dashboard Overview</h3>
                <p className="text-muted-foreground">Your dashboard displays:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Residency verification queue</li>
                  <li>Pending claims requiring field visits</li>
                  <li>Your verification statistics</li>
                  <li>Recent verification history</li>
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
            <h2 className="text-xl font-semibold mb-3">Residency Verification Process</h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-2">Step 1: Review Claim</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Open a residency claim from your verification queue</li>
                  <li>Review citizen information (name, ID number, contact)</li>
                  <li>Check declared address and property details</li>
                  <li>Review supporting documents provided</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Step 2: Document Review</h3>
                <p className="text-muted-foreground mb-2">Acceptable proof of residency includes:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Utility bills (electricity, water) in citizen's name</li>
                  <li>Rental or lease agreements</li>
                  <li>Property ownership documents</li>
                  <li>Landlord verification letters</li>
                  <li>Tax receipts showing the address</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Step 3: Field Verification (if required)</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Schedule a field visit if documents are insufficient</li>
                  <li>Visit the property and verify occupancy</li>
                  <li>Interview neighbors or landlords if needed</li>
                  <li>Take photos of the property as evidence</li>
                  <li>Record GPS coordinates to confirm location</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Step 4: Make Decision</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li><strong>Approve:</strong> If residency is confirmed</li>
                  <li><strong>Reject:</strong> If citizen does not reside at the address</li>
                  <li><strong>Flag:</strong> If additional investigation is needed</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
          <div>
            <h2 className="text-xl font-semibold mb-3">Approval Criteria</h2>
            <p className="text-muted-foreground mb-3">Approve a residency claim when:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Valid proof of residency documents are provided</li>
              <li>Documents are recent (typically within 3 months)</li>
              <li>Citizen's name matches the documents</li>
              <li>Address matches the CAR declaration exactly</li>
              <li>Field verification confirms occupancy (if conducted)</li>
              <li>No red flags or inconsistencies detected</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-start gap-3">
          <XCircle className="h-6 w-6 text-red-600 mt-1" />
          <div>
            <h2 className="text-xl font-semibold mb-3">Rejection Criteria</h2>
            <p className="text-muted-foreground mb-3">Reject a residency claim when:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>No valid proof of residency provided</li>
              <li>Documents are outdated or expired</li>
              <li>Name on documents doesn't match citizen's name</li>
              <li>Address mismatch between documents and declaration</li>
              <li>Field visit confirms citizen does not reside there</li>
              <li>Evidence of fraudulent documentation</li>
            </ul>
            <div className="mt-3">
              <h3 className="font-semibold mb-2">Rejection Notes</h3>
              <p className="text-muted-foreground">
                Always provide clear, specific reasons for rejection. This helps citizens understand 
                what additional documentation they need to provide if they resubmit.
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-start gap-3">
          <MapPin className="h-6 w-6 text-primary mt-1" />
          <div>
            <h2 className="text-xl font-semibold mb-3">Field Verification Tips</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>Safety First:</strong> Conduct field visits in pairs when possible</li>
              <li><strong>Identify Yourself:</strong> Always show your official credentials</li>
              <li><strong>Be Respectful:</strong> Explain the verification process politely</li>
              <li><strong>Document Everything:</strong> Take clear photos and detailed notes</li>
              <li><strong>Verify GPS:</strong> Ensure coordinates match the declared address</li>
              <li><strong>Ask Neighbors:</strong> Confirm occupancy with nearby residents</li>
              <li><strong>Check Landmarks:</strong> Verify property descriptions and landmarks</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-yellow-600 mt-1" />
          <div>
            <h2 className="text-xl font-semibold mb-3">Special Cases</h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-2">Renters Without Lease</h3>
                <p className="text-muted-foreground">
                  Accept landlord verification letters with contact information for follow-up verification.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Shared Housing</h3>
                <p className="text-muted-foreground">
                  Multiple residents at one address are acceptable. Verify each person individually.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">New Residency</h3>
                <p className="text-muted-foreground">
                  For recent moves (within 1 month), accept moving receipts or welcome letters from utilities.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">No Formal Documentation</h3>
                <p className="text-muted-foreground">
                  In rural areas or informal settlements, field visits may be the primary verification method.
                </p>
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
              <li><strong>Be Thorough:</strong> Don't rush verifications - accuracy is critical</li>
              <li><strong>Stay Objective:</strong> Base decisions on evidence, not assumptions</li>
              <li><strong>Protect Privacy:</strong> Handle personal information with confidentiality</li>
              <li><strong>Document Decisions:</strong> Provide clear notes explaining your reasoning</li>
              <li><strong>Flag Fraud:</strong> Report suspected fraud to CAR Admin immediately</li>
              <li><strong>Stay Current:</strong> Keep up with policy changes and verification standards</li>
              <li><strong>Communicate Clearly:</strong> Explain decisions to citizens when contacted</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-muted">
        <h2 className="text-xl font-semibold mb-3">Help & Support</h2>
        <p className="text-muted-foreground">
          For verification questions or policy clarifications, contact your CAR Admin.
          For suspected fraud cases, escalate to CAR Admin immediately.
        </p>
      </Card>
    </div>
  );
}
