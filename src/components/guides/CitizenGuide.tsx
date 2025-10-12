import { Card } from "@/components/ui/card";
import { Home, Search, FileText, MapPin, QrCode } from "lucide-react";

export function CitizenGuide() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Citizen User Guide</h1>
        <p className="text-muted-foreground">Complete guide for citizens using the National Address System</p>
      </div>

      {/* Getting Started */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Home className="h-5 w-5" />
          Getting Started
        </h2>
        <div className="space-y-3">
          <p><strong>Welcome!</strong> The Biakam National Address System allows you to search for addresses, request new address creation, and manage your personal addresses.</p>
          <p><strong>Access:</strong> Visit the Public Portal or Citizen Portal</p>
          <p><strong>Registration:</strong> Create a free account to access full features</p>
        </div>
      </Card>

      {/* Searching for Addresses */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Search className="h-5 w-5" />
          Searching for Addresses
        </h2>
        <div className="space-y-4">
          <p>Find any published address in the national registry:</p>
          
          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Search by UAC (Unified Address Code)</h3>
            <p className="mb-2">The most accurate way to find an address:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Enter the UAC code (format: GQ-BN-MAL-XXXXXX-XX)</li>
              <li>Click "Search"</li>
              <li>View complete address details and map location</li>
            </ol>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Search by Address Components</h3>
            <p className="mb-2">Search using street, city, or region:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Type street name, building, or landmark</li>
              <li>Select city and/or region to narrow results</li>
              <li>View matching addresses in list and map</li>
              <li>Click any result for full details</li>
            </ul>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">QR Code Search</h3>
            <p className="mb-2">Scan a building's QR code:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Click "Scan QR Code" button</li>
              <li>Allow camera permissions</li>
              <li>Point camera at QR code</li>
              <li>Address details appear automatically</li>
            </ol>
          </div>
        </div>
      </Card>

      {/* Requesting a New Address */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Requesting a New Address
        </h2>
        <div className="space-y-4">
          <p>If your address doesn't exist in the system, you can request its creation:</p>
          
          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Step 1: Create Account</h3>
            <p>Register for a free citizen account (required for requests)</p>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Step 2: Submit Address Request</h3>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>Click "Request New Address" from the citizen portal</li>
              <li>Fill in the address form:
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li><strong>Location:</strong> Allow GPS or pin on map</li>
                  <li><strong>Street:</strong> Street name or nearest landmark</li>
                  <li><strong>Building:</strong> Building name/number</li>
                  <li><strong>City & Region:</strong> Select from dropdowns</li>
                  <li><strong>Address Type:</strong> Residential, Commercial, etc.</li>
                  <li><strong>Description:</strong> Additional helpful details</li>
                </ul>
              </li>
              <li>Upload a photo of the building (optional but recommended)</li>
              <li>Add justification explaining why address is needed</li>
              <li>Click "Submit Request"</li>
            </ol>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Step 3: Wait for Verification</h3>
            <p>Your request will be reviewed by verifiers (typically 5 business days)</p>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Step 4: Receive Notification</h3>
            <p className="mb-2">You'll be notified of the decision:</p>
            <ul className="space-y-1 ml-2">
              <li><strong className="text-green-600">✅ Approved:</strong> Address published with UAC assigned</li>
              <li><strong className="text-red-600">❌ Rejected:</strong> Review feedback and resubmit with corrections</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Managing Personal Addresses (CAR) */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Managing Your Personal Addresses (CAR)
        </h2>
        <div className="space-y-3">
          <p><strong>CAR (Citizen Address Repository):</strong> Declare and manage your home and work addresses</p>

          <h3 className="font-semibold mt-4">Setting Your Primary Address:</h3>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Log in to the Citizen Portal</li>
            <li>Navigate to "My Addresses"</li>
            <li>Click "Set Primary Address"</li>
            <li>Enter the UAC of your home address (if it exists in NAR)</li>
            <li>Or provide full address details if UAC unknown</li>
            <li>Specify scope:
              <ul className="list-disc list-inside ml-4 mt-1">
                <li><strong>Building:</strong> You live in the whole building</li>
                <li><strong>Unit:</strong> You live in a specific apartment/unit</li>
              </ul>
            </li>
            <li>Add unit UAC if applicable (apartment number, etc.)</li>
            <li>Select occupant type (Owner, Tenant, etc.)</li>
            <li>Click "Save" - address is pending verification</li>
          </ol>

          <h3 className="font-semibold mt-4">Adding Secondary Addresses:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Work address, vacation home, etc.</li>
            <li>Follow same process as primary address</li>
            <li>Mark address kind as "Secondary"</li>
            <li>Can have multiple secondary addresses</li>
          </ul>

          <h3 className="font-semibold mt-4">Address Verification Status:</h3>
          <ul className="space-y-1 ml-4">
            <li><strong className="text-yellow-600">Self-Declared:</strong> Awaiting verification</li>
            <li><strong className="text-green-600">Confirmed:</strong> Verified and active</li>
            <li><strong className="text-red-600">Rejected:</strong> Issues found, needs correction</li>
          </ul>

          <div className="bg-muted p-4 rounded-lg mt-4">
            <p className="text-sm"><strong>🔄 Auto-Verification:</strong> If your UAC references a verified NAR address, your declaration is auto-approved instantly!</p>
          </div>
        </div>
      </Card>

      {/* Viewing Address Details */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Viewing Address Details</h2>
        <div className="space-y-3">
          <p>When you find an address, you can view:</p>
          
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>UAC Code:</strong> Unique identifier</li>
            <li><strong>Full Address:</strong> Street, building, city, region</li>
            <li><strong>Map Location:</strong> Interactive map with pin</li>
            <li><strong>Coordinates:</strong> GPS latitude/longitude</li>
            <li><strong>Address Type:</strong> Residential, commercial, etc.</li>
            <li><strong>QR Code:</strong> Download for printing/sharing</li>
            <li><strong>Directions:</strong> Get directions from your location</li>
          </ul>
        </div>
      </Card>

      {/* Using QR Codes */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Using QR Codes
        </h2>
        <div className="space-y-3">
          <h3 className="font-semibold">Generating QR Codes:</h3>
          <ol className="list-decimal list-inside space-y-1 ml-4">
            <li>Search for any address</li>
            <li>Click "View Details"</li>
            <li>Click "Generate QR Code"</li>
            <li>Download or print the QR code</li>
            <li>Display at your building entrance</li>
          </ol>

          <h3 className="font-semibold mt-4">Scanning QR Codes:</h3>
          <ol className="list-decimal list-inside space-y-1 ml-4">
            <li>Click "Scan QR Code" button</li>
            <li>Allow camera access</li>
            <li>Point camera at QR code</li>
            <li>Address details load automatically</li>
          </ol>

          <h3 className="font-semibold mt-4">Benefits of QR Codes:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>📦 Easy for delivery services to find your location</li>
            <li>🚑 Quick address lookup for emergency services</li>
            <li>👥 Share your exact location with visitors</li>
            <li>📱 No need to memorize complex UAC codes</li>
          </ul>
        </div>
      </Card>

      {/* Request Status Tracking */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Tracking Your Requests</h2>
        <div className="space-y-3">
          <p>Monitor the status of your address creation requests:</p>
          
          <h3 className="font-semibold mt-4">Request Statuses:</h3>
          <ul className="space-y-2 ml-4">
            <li><strong className="text-blue-600">Pending:</strong> Awaiting verification review</li>
            <li><strong className="text-purple-600">In Review:</strong> Being verified by staff</li>
            <li><strong className="text-yellow-600">Requires Additional Documents:</strong> Upload requested files</li>
            <li><strong className="text-green-600">Approved:</strong> Address published to NAR</li>
            <li><strong className="text-red-600">Rejected:</strong> See feedback for corrections needed</li>
          </ul>

          <h3 className="font-semibold mt-4">Resubmitting Rejected Requests:</h3>
          <ol className="list-decimal list-inside space-y-1 ml-4">
            <li>View rejection feedback in "My Requests"</li>
            <li>Click "Resubmit" on rejected request</li>
            <li>Make necessary corrections</li>
            <li>Add updated photo if photo quality was issue</li>
            <li>Submit - goes back to verification queue</li>
          </ol>
        </div>
      </Card>

      {/* Privacy & Data */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Privacy & Your Data</h2>
        <div className="space-y-3">
          <h3 className="font-semibold">What's Public:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Published NAR addresses (street, building, coordinates)</li>
            <li>UAC codes and map locations</li>
            <li>Address type and general information</li>
          </ul>

          <h3 className="font-semibold mt-4">What's Private:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Your personal information (name, contact details)</li>
            <li>Your CAR address declarations (who lives where)</li>
            <li>Your request submission history</li>
            <li>Supporting documents you upload</li>
          </ul>

          <h3 className="font-semibold mt-4">Data Control:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>You can update your CAR addresses anytime</li>
            <li>You can retire old addresses</li>
            <li>You can delete pending requests</li>
            <li>You control what documents you share</li>
          </ul>
        </div>
      </Card>

      {/* Best Practices */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Tips for Success</h2>
        <div className="space-y-3">
          <h3 className="font-semibold">When Requesting New Addresses:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>✅ Search first - your address might already exist</li>
            <li>✅ Provide accurate GPS coordinates</li>
            <li>✅ Take clear, daytime photos</li>
            <li>✅ Include building number if visible</li>
            <li>✅ Add helpful landmarks in description</li>
            <li>✅ Explain why the address is needed</li>
          </ul>

          <h3 className="font-semibold mt-4">When Managing CAR Addresses:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>✅ Use exact UAC from NAR when available</li>
            <li>✅ Specify correct unit/apartment number</li>
            <li>✅ Update when you move residences</li>
            <li>✅ Retire old addresses instead of deleting</li>
            <li>✅ Keep work addresses current</li>
          </ul>

          <h3 className="font-semibold mt-4">Common Mistakes to Avoid:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>❌ Requesting duplicate addresses</li>
            <li>❌ Providing inaccurate coordinates</li>
            <li>❌ Using blurry or indoor photos</li>
            <li>❌ Not checking UAC spelling</li>
            <li>❌ Forgetting to update moved addresses</li>
          </ul>
        </div>
      </Card>

      {/* FAQ */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold">How long does address approval take?</h3>
            <p className="text-sm ml-2">Typically 5 business days. High-quality submissions may be auto-approved faster.</p>
          </div>

          <div>
            <h3 className="font-semibold">Can I request addresses for other people?</h3>
            <p className="text-sm ml-2">Yes, but you need permission from the property owner or occupant.</p>
          </div>

          <div>
            <h3 className="font-semibold">What if my address is rejected?</h3>
            <p className="text-sm ml-2">Review the feedback, make corrections, and resubmit. You can resubmit unlimited times.</p>
          </div>

          <div>
            <h3 className="font-semibold">Do I need to pay for an address?</h3>
            <p className="text-sm ml-2">No, the national address system is completely free for all citizens.</p>
          </div>

          <div>
            <h3 className="font-semibold">Can I change my CAR address after verification?</h3>
            <p className="text-sm ml-2">Yes, you can update or retire addresses at any time through the Citizen Portal.</p>
          </div>

          <div>
            <h3 className="font-semibold">What if I don't know my UAC?</h3>
            <p className="text-sm ml-2">Use the search feature to find your address, or look for QR codes on your building.</p>
          </div>
        </div>
      </Card>

      {/* Support */}
      <Card className="p-6 bg-muted">
        <h2 className="text-xl font-semibold mb-3">Need Help?</h2>
        <p>Visit the Public Portal help section or contact the National Address Registry support team for assistance with searches, requests, or your account.</p>
      </Card>
    </div>
  );
}
