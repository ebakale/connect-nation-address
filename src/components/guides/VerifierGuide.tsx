import { Card } from "@/components/ui/card";
import { CheckCircle, XCircle, Flag, Search, FileCheck } from "lucide-react";

export function VerifierGuide() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Verifier User Guide</h1>
        <p className="text-muted-foreground">Complete guide for reviewing and verifying address submissions</p>
      </div>

      {/* Getting Started */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileCheck className="h-5 w-5" />
          Getting Started
        </h2>
        <div className="space-y-3">
          <p><strong>Your Role:</strong> Verifiers ensure the quality and accuracy of address submissions before they are approved for the National Address Registry.</p>
          <p><strong>Access:</strong> Log in and navigate to the Unified Dashboard at /dashboard - verification tools will be available in your interface</p>
          <p><strong>Key Permissions:</strong> Review address requests, verify data quality, approve/reject submissions, flag issues</p>
        </div>
      </Card>

      {/* Verification Queue */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Working with the Verification Queue</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Step 1: Access Verification Queue</h3>
            <p>From your dashboard, click "Verification Queue" to see all pending address requests</p>
          </div>
          
          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Step 2: Review Request Details</h3>
            <p className="mb-2">Click on any request to view complete information:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>GPS Coordinates:</strong> Verify on map viewer</li>
              <li><strong>Address Components:</strong> Street, building, city, region</li>
              <li><strong>Photo Evidence:</strong> Review submitted photos</li>
              <li><strong>Submitter Info:</strong> Field agent or citizen details</li>
              <li><strong>Auto-Verification Score:</strong> System quality assessment</li>
              <li><strong>Completeness Score:</strong> Data completeness rating</li>
            </ul>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Step 3: Verify Quality</h3>
            <p className="mb-2">Check the following criteria:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>✅ GPS coordinates match the address location</li>
              <li>✅ Photo clearly shows the building/location</li>
              <li>✅ Address components are complete and accurate</li>
              <li>✅ No duplicate addresses exist</li>
              <li>✅ Street name spelling is correct</li>
              <li>✅ Region and city are correctly selected</li>
            </ul>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Step 4: Make a Decision</h3>
            <ul className="space-y-2 ml-2">
              <li><strong className="text-green-600">Approve:</strong> If all criteria pass, forward to registrar</li>
              <li><strong className="text-red-600">Reject:</strong> If quality issues exist, reject with feedback</li>
              <li><strong className="text-yellow-600">Flag for Review:</strong> If uncertain, flag for senior review</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Approval Process */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Approving Requests
        </h2>
        <div className="space-y-3">
          <p>When approving a request:</p>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Click the "Approve" button on the request card</li>
            <li>Review the confirmation dialog</li>
            <li>Add any verification notes (optional)</li>
            <li>Confirm approval</li>
          </ol>
          
          <div className="bg-muted p-4 rounded-lg mt-4">
            <p className="text-sm"><strong>📝 Note:</strong> Approved requests are forwarded to registrars for final approval and UAC generation</p>
          </div>
        </div>
      </Card>

      {/* Rejection Process */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <XCircle className="h-5 w-5 text-red-600" />
          Rejecting Requests
        </h2>
        <div className="space-y-3">
          <p>When rejecting a request:</p>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Click the "Reject" button</li>
            <li>Select a rejection reason from dropdown</li>
            <li>Add detailed feedback explaining the issue</li>
            <li>Submit rejection</li>
          </ol>

          <h3 className="font-semibold mt-4">Common Rejection Reasons:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>Inaccurate GPS:</strong> Coordinates don't match location</li>
            <li><strong>Poor Photo Quality:</strong> Blurry, dark, or unclear image</li>
            <li><strong>Incomplete Information:</strong> Missing required fields</li>
            <li><strong>Duplicate Address:</strong> Address already exists</li>
            <li><strong>Invalid Location:</strong> Location doesn't exist or incorrect</li>
            <li><strong>Incorrect Region/City:</strong> Administrative area mismatch</li>
          </ul>

          <div className="bg-muted p-4 rounded-lg mt-4">
            <p className="text-sm"><strong>💡 Tip:</strong> Provide clear, actionable feedback so submitters can correct and resubmit</p>
          </div>
        </div>
      </Card>

      {/* Flagging System */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Flag className="h-5 w-5 text-yellow-600" />
          Flagging for Manual Review
        </h2>
        <div className="space-y-3">
          <p>Use the flagging system when:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>You're uncertain about the decision</li>
            <li>Unusual or complex address situation</li>
            <li>Potential fraud or suspicious activity</li>
            <li>Conflicting information needs senior review</li>
            <li>System auto-verification score is borderline</li>
          </ul>

          <h3 className="font-semibold mt-4">How to Flag:</h3>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Click "Flag for Review" button</li>
            <li>Select flag reason</li>
            <li>Add detailed notes for senior reviewer</li>
            <li>Submit flag - request moves to manual review queue</li>
          </ol>
        </div>
      </Card>

      {/* Duplicate Detection */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Search className="h-5 w-5" />
          Checking for Duplicates
        </h2>
        <div className="space-y-3">
          <p>The system automatically checks for duplicates, but you should also verify:</p>
          
          <h3 className="font-semibold mt-4">Automatic Checks:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>GPS coordinates within 111 meters</li>
            <li>Identical street, city, region combination</li>
            <li>Duplicate analysis shown in request details</li>
          </ul>

          <h3 className="font-semibold mt-4">Manual Verification:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Use the map viewer to check nearby addresses</li>
            <li>Search existing addresses by UAC or street name</li>
            <li>Compare building numbers and descriptions</li>
            <li>If duplicate found, reject with "Duplicate Address" reason</li>
          </ul>
        </div>
      </Card>

      {/* CAR Verification */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">CAR (Citizen Address) Verification</h2>
        <div className="space-y-3">
          <p><strong>Additional Responsibility:</strong> Verifiers can also review citizen address declarations in the CAR system</p>
          
          <h3 className="font-semibold mt-4">CAR Verification Process:</h3>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Access CAR verification queue from dashboard</li>
            <li>Review citizen's declared address</li>
            <li>Verify UAC exists in NAR (if provided)</li>
            <li>Check supporting documents if uploaded</li>
            <li>Approve (CONFIRMED) or Reject status</li>
          </ol>

          <div className="bg-muted p-4 rounded-lg mt-4">
            <p className="text-sm"><strong>🔍 Auto-Approval:</strong> If citizen references a verified NAR UAC, the system auto-approves. Manual review only needed for flagged cases</p>
          </div>
        </div>
      </Card>

      {/* Best Practices */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Verification Best Practices</h2>
        <div className="space-y-3">
          <h3 className="font-semibold">Quality Standards:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Always verify GPS coordinates on the map viewer</li>
            <li>Check completeness score - aim for 80% or higher</li>
            <li>Ensure photos are clear and show building entrance</li>
            <li>Verify spelling against official street lists when available</li>
            <li>Check that address type matches the building use</li>
          </ul>

          <h3 className="font-semibold mt-4">Efficiency Tips:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Process requests in geographic batches (same city/region)</li>
            <li>Use keyboard shortcuts for faster navigation</li>
            <li>Review high auto-verification scores first</li>
            <li>Save complex cases for manual review queue</li>
            <li>Add verification notes for future reference</li>
          </ul>

          <h3 className="font-semibold mt-4">Common Issues to Watch For:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>🚨 GPS coordinates in water or outside jurisdiction</li>
            <li>🚨 Photos showing different location than GPS</li>
            <li>🚨 Suspicious patterns (same submitter, same location)</li>
            <li>🚨 Building number doesn't match photo</li>
            <li>🚨 Multiple addresses at exact same coordinates</li>
          </ul>
        </div>
      </Card>

      {/* Quality Metrics */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Understanding Quality Metrics</h2>
        <div className="space-y-3">
          <h3 className="font-semibold">Auto-Verification Score (0-100):</h3>
          <ul className="space-y-1 ml-4">
            <li><strong>80-100:</strong> High quality - quick approve recommended</li>
            <li><strong>60-79:</strong> Medium quality - careful review needed</li>
            <li><strong>Below 60:</strong> Low quality - likely reject or flag</li>
          </ul>

          <h3 className="font-semibold mt-4">Completeness Score (0-100):</h3>
          <ul className="space-y-1 ml-4">
            <li><strong>Required fields (60 pts):</strong> Street, city, region, country</li>
            <li><strong>Coordinates (20 pts):</strong> GPS latitude/longitude</li>
            <li><strong>Optional fields (20 pts):</strong> Building, description, photo</li>
          </ul>
        </div>
      </Card>

      {/* Troubleshooting */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Troubleshooting</h2>
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold">Map not loading?</h3>
            <ul className="list-disc list-inside ml-4 text-sm">
              <li>Check internet connection</li>
              <li>Refresh the page</li>
              <li>Clear browser cache</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">Can't see photo?</h3>
            <ul className="list-disc list-inside ml-4 text-sm">
              <li>Photo may not have been uploaded by field agent</li>
              <li>Try refreshing the request details</li>
              <li>Contact field agent if photo is required</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">Duplicate check not working?</h3>
            <ul className="list-disc list-inside ml-4 text-sm">
              <li>Use manual search in NAR database</li>
              <li>Check nearby addresses on map</li>
              <li>Report system issue to admin if persistent</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Support */}
      <Card className="p-6 bg-muted">
        <h2 className="text-xl font-semibold mb-3">Need Help?</h2>
        <p>Contact your registrar or system administrator for guidance on complex verification cases or system issues.</p>
      </Card>
    </div>
  );
}
