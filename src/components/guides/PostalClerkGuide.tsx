import { Card } from "@/components/ui/card";
import { Package, FileText, MapPin, CheckCircle, AlertCircle } from "lucide-react";

export function PostalClerkGuide() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Postal Clerk User Guide</h1>
        <p className="text-muted-foreground">Complete guide for creating and managing delivery orders in the Government Postal System</p>
      </div>

      {/* Getting Started */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Package className="h-5 w-5" />
          Getting Started
        </h2>
        <div className="space-y-3">
          <p><strong>Your Role:</strong> Postal Clerks are responsible for creating delivery orders, validating recipient addresses using UAC codes, and ensuring all package information is complete before handoff to dispatch.</p>
          <p><strong>Access:</strong> Log in and navigate to the Postal Portal at /postal - clerk controls will be accessible based on your role</p>
          <p><strong>Key Permissions:</strong> Create delivery orders, validate UAC addresses, view order status, manage intake queue</p>
        </div>
      </Card>

      {/* Creating Delivery Orders */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Creating Delivery Orders
        </h2>
        <div className="space-y-4">
          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Step 1: Access Order Creation</h3>
            <p>From the Postal Dashboard, click "Create New Order" to open the order form</p>
          </div>
          
          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Step 2: Enter Sender Information</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Sender name (required)</li>
              <li>Sender phone number</li>
              <li>Sender branch/office location</li>
              <li>Sender UAC address (optional)</li>
            </ul>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Step 3: Enter Recipient Information</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Recipient UAC (required):</strong> Use the UAC lookup to validate the address</li>
              <li>Recipient name (required)</li>
              <li>Recipient phone number</li>
              <li>Recipient email (for notifications)</li>
            </ul>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Step 4: Package Details</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Package Type:</strong> Letter, Parcel, Registered, Fragile, Hazmat, Other</li>
              <li>Weight (grams)</li>
              <li>Dimensions (cm)</li>
              <li>Declared value (for insurance)</li>
              <li>Special instructions</li>
            </ul>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Step 5: Delivery Options</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Priority level (1-5, with 1 being highest)</li>
              <li>Scheduled delivery date</li>
              <li>Delivery deadline</li>
              <li>Requires signature (checkbox)</li>
              <li>Requires ID verification (checkbox)</li>
            </ul>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Step 6: Submit Order</h3>
            <p>Review all information and click "Create Order". The system will generate a unique order number.</p>
          </div>
        </div>
      </Card>

      {/* UAC Address Validation */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          UAC Address Validation
        </h2>
        <div className="space-y-3">
          <p>All delivery orders require a valid UAC (Unified Address Code) for the recipient address:</p>
          
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
              <h4 className="font-semibold text-green-700 dark:text-green-400 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Valid UAC
              </h4>
              <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                <li>Address exists in NAR system</li>
                <li>Address is verified</li>
                <li>GPS coordinates available</li>
                <li>Order can proceed</li>
              </ul>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg">
              <h4 className="font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Invalid UAC
              </h4>
              <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                <li>Address not found</li>
                <li>Address not verified</li>
                <li>Must use valid UAC</li>
                <li>Order cannot proceed</li>
              </ul>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg mt-4">
            <p className="text-sm"><strong>Tip:</strong> Use the UAC picker to search by UAC code or address text. The system will validate and populate address details automatically.</p>
          </div>
        </div>
      </Card>

      {/* Order Status Flow */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Order Status Flow</h2>
        <div className="space-y-3">
          <p>After creation, orders progress through these statuses:</p>
          
          <div className="flex flex-col gap-2 mt-4">
            {[
              { status: 'Pending Intake', desc: 'Order created, awaiting processing', color: 'bg-yellow-500' },
              { status: 'Ready for Assignment', desc: 'Clerk marks ready, dispatcher can assign', color: 'bg-blue-500' },
              { status: 'Assigned', desc: 'Dispatcher assigned to delivery agent', color: 'bg-purple-500' },
              { status: 'Out for Delivery', desc: 'Agent has package, en route', color: 'bg-orange-500' },
              { status: 'Delivered', desc: 'Successfully delivered with proof', color: 'bg-green-500' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                <div>
                  <span className="font-semibold">{item.status}:</span>
                  <span className="text-muted-foreground ml-2">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-muted p-4 rounded-lg mt-4">
            <p className="text-sm"><strong>Your Responsibility:</strong> Mark orders as "Ready for Assignment" once intake is complete. This signals dispatchers that the order is ready for routing.</p>
          </div>
        </div>
      </Card>

      {/* Best Practices */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Best Practices</h2>
        <div className="space-y-3">
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>✅ Always validate UAC before creating order</li>
            <li>✅ Capture accurate weight and dimensions for routing</li>
            <li>✅ Include recipient phone for delivery coordination</li>
            <li>✅ Mark fragile/hazmat items clearly</li>
            <li>✅ Set realistic delivery deadlines</li>
            <li>✅ Add special instructions for complex deliveries</li>
            <li>✅ Process intake queue promptly to maintain SLAs</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
