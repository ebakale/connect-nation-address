import { Card } from "@/components/ui/card";
import { Package, Navigation, Camera, CheckCircle, MapPin, Smartphone, Route, DollarSign, Truck } from "lucide-react";

export function PostalAgentGuide() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Postal Delivery Agent User Guide</h1>
        <p className="text-muted-foreground">Complete guide for field delivery operations, navigation, proof of delivery, COD collection, and pickup assignments</p>
      </div>

      {/* Getting Started */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Package className="h-5 w-5" />
          Getting Started
        </h2>
        <div className="space-y-3">
          <p><strong>Your Role:</strong> Postal Delivery Agents are responsible for physically delivering packages to recipients, capturing proof of delivery, collecting COD payments, executing pickup requests, and updating delivery status in real-time.</p>
          <p><strong>Access:</strong> Log in to the mobile app or navigate to /postal on your device. Your dashboard shows assigned deliveries.</p>
          <p><strong>Key Permissions:</strong> View assignments, update delivery status, capture proof (photos/signatures), navigate to addresses, collect COD payments, execute pickups</p>
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
              <li>Check for COD orders (payment collection required)</li>
            </ul>
          </div>
          
          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Step 2: Pick Up Packages</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Collect assigned packages from depot/office</li>
              <li>Verify package count matches assignments</li>
              <li>Note COD packages and amounts</li>
              <li>Mark orders as "Out for Delivery" when leaving</li>
            </ul>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Step 3: Navigate to Delivery</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Tap delivery in your list</li>
              <li>Choose navigation method (see Navigation section)</li>
              <li>System uses UAC GPS coordinates</li>
              <li>Follow turn-by-turn navigation</li>
            </ul>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Step 4: Complete Delivery</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Verify address matches UAC</li>
              <li>Collect COD payment if required (before handover)</li>
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

      {/* In-App Routing */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Route className="h-5 w-5" />
          In-App Routing (Show Route)
        </h2>
        <div className="space-y-3">
          <p>View embedded route maps without leaving the app:</p>
          
          <h3 className="font-semibold mt-4">Using In-App Routing:</h3>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Open the delivery order</li>
            <li>Tap the <strong>"Show Route"</strong> button</li>
            <li>RouteMapView opens with embedded map</li>
            <li>View route line from your location to destination</li>
            <li>Scroll the directions panel for turn-by-turn guidance</li>
            <li>Tap "Close" when done to return to delivery list</li>
          </ol>

          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold">Route Map Features</h4>
              <ul className="text-sm mt-1 space-y-1">
                <li>🔵 Blue marker: Your location</li>
                <li>🔴 Red marker: Destination</li>
                <li>🟣 Purple line: Route path</li>
                <li>📏 Distance and ETA displayed</li>
              </ul>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold">Directions Panel</h4>
              <ul className="text-sm mt-1 space-y-1">
                <li>Turn-by-turn instructions</li>
                <li>Scrollable direction list</li>
                <li>Distance for each step</li>
                <li>Road names included</li>
              </ul>
            </div>
          </div>

          <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg mt-4">
            <p className="text-sm"><strong>✓ Advantage:</strong> In-app routing keeps you in the postal app. No switching between apps - great for quick deliveries!</p>
          </div>
        </div>
      </Card>

      {/* External Navigation */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Navigation className="h-5 w-5" />
          External Navigation (Navigate Button)
        </h2>
        <div className="space-y-3">
          <p>Open directions in your device's native maps app:</p>
          
          <h3 className="font-semibold mt-4">Using External Navigation:</h3>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Open the delivery order</li>
            <li>Tap the <strong>"Navigate"</strong> button</li>
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
            <p className="text-sm"><strong>📍 When to use:</strong> External navigation is best for longer routes or when you need voice-guided turn-by-turn directions while driving.</p>
          </div>
        </div>
      </Card>

      {/* COD Collection */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          COD (Cash on Delivery) Collection
        </h2>
        <div className="space-y-3">
          <p>Some orders require payment collection at delivery:</p>
          
          <h3 className="font-semibold mt-4">Identifying COD Orders:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>COD orders display a badge with the amount</li>
            <li>Amount shown in order details</li>
            <li>Cannot complete delivery without payment</li>
          </ul>

          <h3 className="font-semibold mt-4">Collection Process:</h3>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Inform recipient of COD amount <strong>before</strong> handing package</li>
            <li>Collect exact payment amount</li>
            <li>In the app, tap "Record COD Payment"</li>
            <li>Select payment method (Cash, Card, Mobile)</li>
            <li>Enter receipt number if applicable</li>
            <li>Confirm collection</li>
            <li>Then proceed with normal proof of delivery</li>
          </ol>

          <div className="bg-yellow-50 dark:bg-yellow-500/10 border-l-4 border-yellow-500 p-4 mt-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200"><strong>⚠️ Important:</strong> Always collect payment BEFORE handing over the package. If recipient refuses to pay, mark as "Failed Delivery" with reason "Refused - COD not paid".</p>
          </div>

          <h3 className="font-semibold mt-4">Daily Remittance:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Return to office at end of shift</li>
            <li>Submit all collected COD payments to supervisor</li>
            <li>Keep receipts for reconciliation</li>
            <li>System tracks your collections automatically</li>
          </ul>
        </div>
      </Card>

      {/* Pickup Assignments */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Pickup Assignments
        </h2>
        <div className="space-y-3">
          <p>You may be assigned to collect packages from citizens:</p>
          
          <h3 className="font-semibold mt-4">Pickup Workflow:</h3>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Check your "Pickups" tab for assignments</li>
            <li>Review pickup details (address, package count, time window)</li>
            <li>Navigate to the pickup address</li>
            <li>Contact requester upon arrival</li>
            <li>Collect all packages</li>
            <li>Take photo proof of collected packages</li>
            <li>Mark pickup as "Completed"</li>
            <li>Return packages to post office for processing</li>
          </ol>

          <div className="bg-muted p-4 rounded-lg mt-4">
            <h4 className="font-semibold">Pickup Information Shown:</h4>
            <ul className="text-sm mt-2 space-y-1">
              <li>Requester name and contact</li>
              <li>Pickup address (UAC verified)</li>
              <li>Number of packages</li>
              <li>Estimated weight</li>
              <li>Preferred time window</li>
              <li>Special instructions</li>
            </ul>
          </div>

          <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg mt-4">
            <p className="text-sm"><strong>✓ Tip:</strong> Call the requester 10-15 minutes before arrival so they can prepare packages.</p>
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
            <li>✅ Use in-app routing for quick nearby deliveries</li>
            <li>✅ Use external navigation for longer routes</li>
            <li>✅ Follow route sequence for efficiency</li>
            <li>✅ Update status immediately after each delivery</li>
            <li>✅ Always capture required proof of delivery</li>
            <li>✅ Collect COD payment BEFORE handing over package</li>
            <li>✅ Call recipient if having trouble finding address</li>
            <li>✅ Take photos of delivery location for failed attempts</li>
            <li>✅ Check for special instructions before each delivery</li>
            <li>✅ Handle fragile/hazmat items with extra care</li>
            <li>✅ Complete pickup assignments same day</li>
            <li>✅ Report any system issues to dispatcher</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
