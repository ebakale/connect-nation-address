import { Card } from "@/components/ui/card";
import { Home, Search, FileText, MapPin, QrCode, Building2, Users, Shield } from "lucide-react";

export function CitizenGuide() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Citizen User Guide</h1>
        <p className="text-muted-foreground">Complete guide for citizens using the National Address System (Updated Dec 2025)</p>
      </div>

      {/* Getting Started */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Home className="h-5 w-5" />
          Getting Started
        </h2>
        <div className="space-y-3">
          <p><strong>Welcome!</strong> The Biakam National Address System allows you to search for addresses, request new address creation, declare your residence, register businesses, and manage your household.</p>
          <p><strong>Access:</strong> Visit the Public Portal (no login) or Citizen Portal (with account)</p>
          <p><strong>Registration:</strong> Create a free account to access full features including CAR declarations and business registration</p>
        </div>
      </Card>

      {/* Unified Address Request - NEW */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Unified Address Request
        </h2>
        <div className="space-y-4">
          <p>The Unified Address Request wizard guides you through all address-related actions in one place:</p>
          
          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Step 1: Address Lookup</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Search for existing address by UAC code</li>
              <li>If found, proceed to declare it as your residence or register a business</li>
              <li>If not found, you can request creation of a new address (NAR request)</li>
            </ul>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Step 2: Choose Action</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Declare as Residence (CAR):</strong> Link this address to your profile</li>
              <li><strong>Register Business:</strong> Register your business at this location</li>
              <li><strong>Request New Address:</strong> If address doesn't exist in system</li>
            </ul>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Step 3: Complete Form</h3>
            <p>Fill in the required details based on your selected action</p>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm"><strong>💡 Tip:</strong> If you're declaring an address linked to a verified NAR address, your CAR declaration may be auto-approved instantly!</p>
          </div>
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

      {/* Business Address Registration - NEW */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Business Address Registration
        </h2>
        <div className="space-y-4">
          <p>Register your business to appear in the public Business Directory:</p>
          
          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Step 1: Access via Unified Address Request</h3>
            <p>Start from the dashboard and select "Register Business" option</p>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Step 2: Select Address</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Search for existing address by UAC</li>
              <li>Or request creation of new address if not found</li>
            </ul>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Step 3: Business Information (Required)</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Organization Name:</strong> Official business name</li>
              <li><strong>Business Category:</strong> retail, restaurant, healthcare, etc.</li>
              <li><strong>Contact Details:</strong> Phone, email, website</li>
              <li><strong>Services:</strong> What your business offers</li>
              <li><strong>Operating Hours:</strong> When you're open</li>
            </ul>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Step 4: Approval & Directory Listing</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Business addresses are auto-published when approved</li>
              <li>Your business appears in the public Business Directory</li>
              <li>Customers can find you via search</li>
            </ul>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg">
            <p className="text-sm"><strong>⚠️ Important:</strong> Organization name and business category are required. Incomplete registrations cannot be approved.</p>
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
            <li>Navigate to "My Addresses" or use Unified Address Request</li>
            <li>Click "Set Primary Address"</li>
            <li>Enter the UAC of your home address (if it exists in NAR)</li>
            <li>Specify scope:
              <ul className="list-disc list-inside ml-4 mt-1">
                <li><strong>Building:</strong> You live in the whole building</li>
                <li><strong>Unit:</strong> You live in a specific apartment/unit</li>
              </ul>
            </li>
            <li>Add unit UAC if applicable (apartment number, etc.)</li>
            <li>Select occupant type (Owner, Tenant, etc.)</li>
            <li>Click "Save" - address is pending verification or auto-approved</li>
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

      {/* Household Management - NEW */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Household Management
        </h2>
        <div className="space-y-4">
          <p>Manage your household group and family members:</p>
          
          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Creating a Household</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Navigate to "Household Management" from your profile</li>
              <li>Click "Create Household"</li>
              <li>Enter household name and primary address (UAC)</li>
              <li>You become the household head automatically</li>
            </ul>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Adding Dependents</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Add minors (under 18) as dependents</li>
              <li>Specify relationship: child, grandchild, sibling, ward</li>
              <li>Provide date of birth and full name</li>
              <li>System tracks when dependents reach majority age</li>
            </ul>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Household Members</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Add adult household members (spouse, adult children, etc.)</li>
              <li>Members can have their own account or be linked to yours</li>
              <li>Designate primary vs secondary residents</li>
              <li>Track move-in and move-out dates</li>
            </ul>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Shared Custody Support</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Dependents can belong to multiple households</li>
              <li>Set custody type: sole, joint, primary, secondary</li>
              <li>Define residence percentage if shared</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Privacy Levels - NEW */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Privacy Settings
        </h2>
        <div className="space-y-3">
          <p>Control who can see your address information:</p>

          <h3 className="font-semibold mt-4">Privacy Levels:</h3>
          <ul className="space-y-3 ml-4">
            <li>
              <strong className="text-red-600">PRIVATE:</strong>
              <p className="text-sm ml-4">Only you and authorized government officials can see your address. Not searchable by public.</p>
            </li>
            <li>
              <strong className="text-yellow-600">REGION_ONLY:</strong>
              <p className="text-sm ml-4">Visible to users within your region (emergency services, local government). Limited public visibility.</p>
            </li>
            <li>
              <strong className="text-green-600">PUBLIC:</strong>
              <p className="text-sm ml-4">Fully searchable. Useful if you want delivery services or visitors to find you easily.</p>
            </li>
          </ul>

          <h3 className="font-semibold mt-4">Changing Privacy Level:</h3>
          <ol className="list-decimal list-inside space-y-1 ml-4">
            <li>Go to "My Addresses" in your dashboard</li>
            <li>Select the address to modify</li>
            <li>Click "Privacy Settings"</li>
            <li>Choose your preferred level</li>
            <li>Save changes (applies immediately)</li>
          </ol>

          <div className="bg-muted p-4 rounded-lg mt-4">
            <p className="text-sm"><strong>Note:</strong> Regardless of your privacy setting, emergency services always have access to your address during emergencies.</p>
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
            <li><strong>Map Location:</strong> Interactive map with pin (Google Maps or OpenStreetMap)</li>
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
          <p>Monitor the status of your address and business requests:</p>
          
          <h3 className="font-semibold mt-4">Request Statuses:</h3>
          <ul className="space-y-2 ml-4">
            <li><strong className="text-blue-600">Pending:</strong> Awaiting verification review</li>
            <li><strong className="text-purple-600">In Review:</strong> Being verified by staff</li>
            <li><strong className="text-yellow-600">Requires Additional Documents:</strong> Upload requested files</li>
            <li><strong className="text-green-600">Approved:</strong> Address published to NAR / Business in directory</li>
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

          <div className="bg-muted p-4 rounded-lg mt-4">
            <p className="text-sm"><strong>Rejected Items Retention:</strong> Rejected requests are kept for 6 months, then archived. After 24 months, personal data is anonymized. You can manually delete rejected requests anytime.</p>
          </div>
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
            <li>Business listings in the Business Directory</li>
          </ul>

          <h3 className="font-semibold mt-4">What's Private:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Your personal information (name, contact details)</li>
            <li>Your CAR address declarations (based on privacy level)</li>
            <li>Your request submission history</li>
            <li>Supporting documents you upload</li>
            <li>Household and dependent information</li>
          </ul>

          <h3 className="font-semibold mt-4">Data Control:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>You can update your CAR addresses anytime</li>
            <li>You can change privacy levels for each address</li>
            <li>You can retire old addresses</li>
            <li>You can delete pending/rejected requests</li>
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
            <li>✅ Choose appropriate privacy level</li>
          </ul>

          <h3 className="font-semibold mt-4">When Registering Businesses:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>✅ Provide complete business information</li>
            <li>✅ Choose accurate business category</li>
            <li>✅ Keep operating hours updated</li>
            <li>✅ Add services offered for better searchability</li>
          </ul>

          <h3 className="font-semibold mt-4">Common Mistakes to Avoid:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>❌ Requesting duplicate addresses</li>
            <li>❌ Providing inaccurate coordinates</li>
            <li>❌ Using blurry or indoor photos</li>
            <li>❌ Not checking UAC spelling</li>
            <li>❌ Forgetting to update moved addresses</li>
            <li>❌ Leaving business category blank</li>
          </ul>
        </div>
      </Card>

      {/* FAQ */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold">How long does address approval take?</h3>
            <p className="text-sm ml-2">Typically 5 business days. High-quality submissions with verified UAC links may be auto-approved faster.</p>
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
            <p className="text-sm ml-2">Yes, you can update, retire, or change privacy levels at any time through the Citizen Portal.</p>
          </div>

          <div>
            <h3 className="font-semibold">What if I don't know my UAC?</h3>
            <p className="text-sm ml-2">Use the search feature to find your address, or look for QR codes on your building.</p>
          </div>

          <div>
            <h3 className="font-semibold">Can my dependents have their own addresses?</h3>
            <p className="text-sm ml-2">Minors are linked to your household. When they turn 18, they can create their own account and manage their own addresses.</p>
          </div>

          <div>
            <h3 className="font-semibold">What happens to my business if I move?</h3>
            <p className="text-sm ml-2">You can update your business address through the Business Management section. The old listing will be updated.</p>
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
