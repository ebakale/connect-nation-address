import { Card } from "@/components/ui/card";
import { MapPin, Camera, Wifi, WifiOff, Upload, CheckCircle } from "lucide-react";

export function FieldAgentGuide() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Field Agent User Guide</h1>
        <p className="text-muted-foreground">Complete guide for capturing and managing addresses in the field</p>
      </div>

      {/* Getting Started */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Getting Started
        </h2>
        <div className="space-y-3">
          <p><strong>Your Role:</strong> Field agents are responsible for capturing new addresses in the National Address Registry (NAR) by visiting locations and collecting accurate data.</p>
          <p><strong>Access:</strong> Log in to the Field Agent Dashboard at /field-agent-dashboard</p>
          <p><strong>Key Permissions:</strong> Create address drafts, capture GPS coordinates, take photos, work offline</p>
        </div>
      </Card>

      {/* Capturing New Addresses */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Capturing New Addresses</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Step 1: Navigate to Address Capture</h3>
            <p>Click "Capture Address" button on your dashboard to open the capture form</p>
          </div>
          
          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Step 2: Get GPS Location</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Allow location permissions when prompted</li>
              <li>Wait for GPS accuracy indicator to show good signal</li>
              <li>Verify coordinates on the map preview</li>
              <li>You can manually adjust location by tapping the map</li>
            </ul>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Step 3: Fill Address Details</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Street:</strong> Enter the street name or nearest landmark</li>
              <li><strong>Building:</strong> Building name, number, or description</li>
              <li><strong>City:</strong> Select from dropdown or type</li>
              <li><strong>Region:</strong> Select the administrative region</li>
              <li><strong>Country:</strong> Default is Equatorial Guinea</li>
              <li><strong>Address Type:</strong> Residential, Commercial, Government, etc.</li>
              <li><strong>Description:</strong> Add helpful details (optional)</li>
            </ul>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Step 4: Take Photo</h3>
            <p className="mb-2">Photos are recommended for verification:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Click the camera icon to capture</li>
              <li>Take a clear photo showing the building/location</li>
              <li>Include street signs or landmarks if visible</li>
              <li>Review and retake if needed</li>
            </ul>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Step 5: Submit for Verification</h3>
            <p>Click "Submit Request" - your draft will be sent to verifiers for quality review</p>
          </div>
        </div>
      </Card>

      {/* Offline Mode */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <WifiOff className="h-5 w-5" />
          Working Offline
        </h2>
        <div className="space-y-3">
          <p><strong>Automatic Offline Detection:</strong> The app automatically detects when you lose internet connection</p>
          
          <h3 className="font-semibold mt-4">Offline Capabilities:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Capture addresses with GPS and photos</li>
            <li>Data is saved locally on your device</li>
            <li>View previously captured drafts</li>
            <li>Edit pending submissions</li>
          </ul>

          <h3 className="font-semibold mt-4">Syncing When Back Online:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>App automatically detects when connection is restored</li>
            <li>Sync button appears - click to upload pending addresses</li>
            <li>Progress indicator shows upload status</li>
            <li>Successful uploads are marked with checkmark</li>
          </ul>

          <div className="bg-muted p-4 rounded-lg mt-4">
            <p className="text-sm"><strong>💡 Tip:</strong> Always sync your data at the end of each day when you have reliable internet connection</p>
          </div>
        </div>
      </Card>

      {/* Managing Drafts */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Managing Your Drafts</h2>
        <div className="space-y-3">
          <p><strong>Draft Manager:</strong> Access from dashboard to view all your pending submissions</p>
          
          <h3 className="font-semibold mt-4">Draft Statuses:</h3>
          <ul className="space-y-2 ml-4">
            <li><strong className="text-yellow-600">Pending:</strong> Awaiting verification review</li>
            <li><strong className="text-blue-600">In Review:</strong> Currently being verified</li>
            <li><strong className="text-green-600">Approved:</strong> Approved and published to NAR</li>
            <li><strong className="text-red-600">Rejected:</strong> Needs corrections (see feedback)</li>
          </ul>

          <h3 className="font-semibold mt-4">Actions:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>View:</strong> See complete address details</li>
            <li><strong>Edit:</strong> Modify pending drafts before verification</li>
            <li><strong>Resubmit:</strong> Fix and resubmit rejected addresses</li>
            <li><strong>Delete:</strong> Remove unwanted drafts</li>
          </ul>
        </div>
      </Card>

      {/* Best Practices */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Best Practices
        </h2>
        <div className="space-y-2">
          <h3 className="font-semibold">For High-Quality Data:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Always capture GPS at the actual building entrance</li>
            <li>Take clear, well-lit photos during daytime</li>
            <li>Double-check spelling of street names</li>
            <li>Include building numbers in the Building field</li>
            <li>Add helpful landmarks in the description</li>
            <li>Verify coordinates match the location on map</li>
          </ul>

          <h3 className="font-semibold mt-4">For Efficient Fieldwork:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Plan your route to cover areas systematically</li>
            <li>Capture multiple addresses in one area before moving</li>
            <li>Sync data regularly when you have WiFi</li>
            <li>Charge your device fully before field visits</li>
            <li>Enable high accuracy GPS in device settings</li>
          </ul>

          <h3 className="font-semibold mt-4">Common Mistakes to Avoid:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>❌ Taking GPS reading while inside a building</li>
            <li>❌ Blurry or dark photos</li>
            <li>❌ Mixing up building name and street name</li>
            <li>❌ Submitting without verifying location on map</li>
            <li>❌ Using unofficial or slang street names</li>
          </ul>
        </div>
      </Card>

      {/* Troubleshooting */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Troubleshooting</h2>
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold">GPS not working?</h3>
            <ul className="list-disc list-inside ml-4 text-sm">
              <li>Check if location permissions are enabled</li>
              <li>Move to an open area away from tall buildings</li>
              <li>Wait 10-30 seconds for GPS to stabilize</li>
              <li>Restart the app if issue persists</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">Camera not opening?</h3>
            <ul className="list-disc list-inside ml-4 text-sm">
              <li>Check camera permissions in device settings</li>
              <li>Close other apps using the camera</li>
              <li>Restart the app</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">Upload failing?</h3>
            <ul className="list-disc list-inside ml-4 text-sm">
              <li>Check internet connection strength</li>
              <li>Try uploading one address at a time</li>
              <li>Contact your supervisor if persistent</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Support */}
      <Card className="p-6 bg-muted">
        <h2 className="text-xl font-semibold mb-3">Need Help?</h2>
        <p>Contact your supervisor or system administrator for additional support and training.</p>
      </Card>
    </div>
  );
}
