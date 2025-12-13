import { Card } from "@/components/ui/card";
import { Package, Navigation, Camera, CheckCircle, MapPin, Smartphone } from "lucide-react";

export function PostalAgentGuide() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Postal Delivery Agent User Guide</h1>
        <p className="text-muted-foreground">Complete guide for field delivery operations, navigation, and proof of delivery capture</p>
      </div>

      {/* Getting Started */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Package className="h-5 w-5" />
          Getting Started
        </h2>
        <div className="space-y-3">
          <p><strong>Your Role:</strong> Postal Delivery Agents are responsible for physically delivering packages to recipients, capturing proof of delivery, and updating delivery status in real-time.</p>
          <p><strong>Access:</strong> Log in to the mobile app or navigate to /postal on your device. Your dashboard shows assigned deliveries.</p>
          <p><strong>Key Permissions:</strong> View assignments, update delivery status, capture proof (photos/signatures), navigate to addresses</p>
        </div>
      </Card>

      {/* Daily Workflow */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Daily Delivery Workflow
        </h2>
        <div className="space-y-4">
          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Step 1: Start Your Shift</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Log in to your account</li>
              <li>Review your assigned deliveries</li>
              <li>Check route sequence (1, 2, 3...)</li>
              <li>Note any priority or special instruction items</li>
            </ul>
          </div>
          
          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Step 2: Pick Up Packages</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Collect assigned packages from depot/office</li>
              <li>Verify package count matches assignments</li>
              <li>Mark orders as "Out for Delivery" when leaving</li>
            </ul>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Step 3: Navigate to Delivery</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Tap delivery in your list</li>
              <li>Click "Navigate" to open directions</li>
              <li>System uses UAC GPS coordinates</li>
              <li>Follow turn-by-turn navigation</li>
            </ul>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Step 4: Complete Delivery</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Verify address matches UAC</li>
              <li>Hand package to recipient</li>
              <li>Capture proof of delivery (see below)</li>
              <li>Mark as "Delivered"</li>
            </ul>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Step 5: Handle Failed Deliveries</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>If recipient unavailable, mark "Failed Delivery"</li>
              <li>Select failure reason (not home, address issue, refused)</li>
              <li>Add notes for dispatcher</li>
              <li>Take photo of location if needed</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Navigation */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Navigation className="h-5 w-5" />
          Navigation to Delivery Address
        </h2>
        <div className="space-y-3">
          <p>The system uses UAC coordinates for precise navigation:</p>
          
          <h3 className="font-semibold mt-4">Using Navigation:</h3>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Open the delivery order</li>
            <li>Tap the "Navigate" button</li>
            <li>Your device's default maps app opens</li>
            <li>Follow directions to the GPS coordinates</li>
          </ol>

          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold">iOS Devices</h4>
              <p className="text-sm mt-1">Opens Apple Maps by default</p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold">Android Devices</h4>
              <p className="text-sm mt-1">Opens Google Maps by default</p>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg mt-4">
            <p className="text-sm"><strong>📍 UAC Precision:</strong> UAC coordinates are verified and accurate. Trust the GPS location - it's been validated during address registration.</p>
          </div>
        </div>
      </Card>

      {/* Proof of Delivery */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Capturing Proof of Delivery
        </h2>
        <div className="space-y-3">
          <p>Different orders require different proof types:</p>
          
          <h3 className="font-semibold mt-4">Photo Capture:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Tap "Capture Photo" button</li>
            <li>Take clear photo of delivered package or recipient</li>
            <li>System automatically adds GPS coordinates</li>
            <li>Add optional description</li>
          </ul>

          <h3 className="font-semibold mt-4">Signature Capture:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>For "Requires Signature" orders</li>
            <li>Tap "Capture Signature"</li>
            <li>Have recipient sign on screen</li>
            <li>Confirm and save</li>
          </ul>

          <h3 className="font-semibold mt-4">ID Verification:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>For "Requires ID Verification" orders</li>
            <li>Ask recipient for government ID</li>
            <li>Verify name matches order</li>
            <li>Record ID type and last 4 digits</li>
          </ul>

          <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg mt-4">
            <p className="text-sm"><strong>✓ Complete Proof:</strong> Always capture required proof before marking as delivered. This protects you and confirms successful delivery.</p>
          </div>
        </div>
      </Card>

      {/* Status Updates */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Status Updates
        </h2>
        <div className="space-y-3">
          <p>Keep status current for real-time tracking:</p>
          
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="border p-3 rounded-lg">
              <h4 className="font-semibold text-green-600">Delivered</h4>
              <p className="text-sm text-muted-foreground">Package successfully handed to recipient</p>
            </div>
            <div className="border p-3 rounded-lg">
              <h4 className="font-semibold text-red-600">Failed Delivery</h4>
              <p className="text-sm text-muted-foreground">Could not complete delivery (retry needed)</p>
            </div>
            <div className="border p-3 rounded-lg">
              <h4 className="font-semibold text-yellow-600">Address Not Found</h4>
              <p className="text-sm text-muted-foreground">Location doesn't match or doesn't exist</p>
            </div>
            <div className="border p-3 rounded-lg">
              <h4 className="font-semibold text-purple-600">Returned to Sender</h4>
              <p className="text-sm text-muted-foreground">Package returned after failed attempts</p>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-500/10 border-l-4 border-yellow-500 p-4 mt-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200"><strong>⚠️ Important:</strong> Always add notes when marking failed/returned. This helps dispatchers understand the issue and plan retries.</p>
          </div>
        </div>
      </Card>

      {/* Best Practices */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Best Practices</h2>
        <div className="space-y-3">
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>✅ Review all assignments before leaving depot</li>
            <li>✅ Follow route sequence for efficiency</li>
            <li>✅ Update status immediately after each delivery</li>
            <li>✅ Always capture required proof of delivery</li>
            <li>✅ Call recipient if having trouble finding address</li>
            <li>✅ Take photos of delivery location for failed attempts</li>
            <li>✅ Check for special instructions before each delivery</li>
            <li>✅ Handle fragile/hazmat items with extra care</li>
            <li>✅ Report any system issues to dispatcher</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
