import { Card } from "@/components/ui/card";
import { Package, FileText, MapPin, CheckCircle, AlertCircle, Search, Upload, DollarSign } from "lucide-react";

export function PostalClerkGuide() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Postal Clerk User Guide</h1>
        <p className="text-muted-foreground">Complete guide for creating delivery orders, searching recipients, bulk imports, and COD orders in the Government Postal System</p>
      </div>

      {/* Getting Started */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Package className="h-5 w-5" />
          Getting Started
        </h2>
        <div className="space-y-3">
          <p><strong>Your Role:</strong> Postal Clerks are responsible for creating delivery orders, validating recipient addresses using UAC codes or name search, managing bulk imports, and ensuring all package information is complete before handoff to dispatch.</p>
          <p><strong>Access:</strong> Log in and navigate to the Postal Portal at /postal - clerk controls will be accessible based on your role</p>
          <p><strong>Key Permissions:</strong> Create delivery orders, validate UAC addresses, search recipients by name, import bulk orders, create COD orders, view order status, manage intake queue</p>
        </div>
      </Card>

      {/* Recipient Search */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Search className="h-5 w-5" />
          Recipient Search Methods
        </h2>
        <div className="space-y-4">
          <p>You can find recipient addresses using two methods:</p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Search by UAC
              </h4>
              <p className="text-sm mt-2">Enter the recipient's Unified Address Code directly. Best when the UAC is known.</p>
              <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                <li>Fast and precise</li>
                <li>Directly validates address</li>
                <li>Auto-populates all fields</li>
              </ul>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold flex items-center gap-2">
                <Search className="h-4 w-4" />
                Search by Name
              </h4>
              <p className="text-sm mt-2">Search for recipients by their name. Finds citizens and household dependents.</p>
              <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                <li>Works when UAC unknown</li>
                <li>Finds household members</li>
                <li>Shows dependent relationships</li>
              </ul>
            </div>
          </div>

          <h3 className="font-semibold mt-4">Name Search Results:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>Direct matches:</strong> Citizens with their own registered addresses</li>
            <li><strong>Dependent matches:</strong> Household members (children, elderly) - shows "Care of: [Guardian Name]"</li>
            <li><strong>Badges:</strong> Shows dependent type (Minor, Adult Dependent) when applicable</li>
          </ul>

          <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg mt-4">
            <p className="text-sm"><strong>✓ Tip:</strong> When delivering to a minor or dependent, the package will be delivered to the guardian's address. Always note "Care of" relationships.</p>
          </div>
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
              <li><strong>Option A - UAC:</strong> Enter UAC directly if known</li>
              <li><strong>Option B - Name Search:</strong> Search by recipient name to find address</li>
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
              <li>Cash on Delivery amount (if COD)</li>
            </ul>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold mb-2">Step 6: Submit Order</h3>
            <p>Review all information and click "Create Order". The system will generate a unique order number and S10 tracking number for the label.</p>
          </div>
        </div>
      </Card>

      {/* COD Orders */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Creating COD (Cash on Delivery) Orders
        </h2>
        <div className="space-y-3">
          <p>Some packages require payment collection at delivery:</p>
          
          <h3 className="font-semibold mt-4">Setting Up COD:</h3>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>In the order form, check "Cash on Delivery Required"</li>
            <li>Enter the COD amount</li>
            <li>Select currency (defaults to XAF)</li>
            <li>Complete the rest of the order as normal</li>
          </ol>

          <div className="bg-muted p-4 rounded-lg mt-4">
            <h4 className="font-semibold">COD Order Flow:</h4>
            <ul className="text-sm mt-2 space-y-1">
              <li>1. Order created with COD flag and amount</li>
              <li>2. Agent sees COD badge on delivery card</li>
              <li>3. Agent collects payment before handover</li>
              <li>4. Payment recorded in system</li>
              <li>5. Agent remits to supervisor at end of shift</li>
            </ul>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-500/10 border-l-4 border-yellow-500 p-4 mt-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200"><strong>⚠️ Important:</strong> Double-check COD amounts before submitting. Incorrect amounts cause delivery issues and customer complaints.</p>
          </div>
        </div>
      </Card>

      {/* Bulk Import */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Bulk Order Import
        </h2>
        <div className="space-y-3">
          <p>For high-volume days, import multiple orders via CSV:</p>
          
          <h3 className="font-semibold mt-4">Import Process:</h3>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Click "Bulk Import" in the postal dashboard</li>
            <li>Download the CSV template</li>
            <li>Fill in order data (one row per order)</li>
            <li>Upload completed CSV file</li>
            <li>Review validation results</li>
            <li>Confirm import to create orders</li>
          </ol>

          <h3 className="font-semibold mt-4">Required CSV Columns:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><code>sender_name</code> - Sender's name</li>
            <li><code>recipient_name</code> - Recipient's name</li>
            <li><code>recipient_uac</code> - Valid UAC code</li>
            <li><code>package_type</code> - letter, parcel, registered, etc.</li>
            <li><code>priority_level</code> - 1-5</li>
          </ul>

          <h3 className="font-semibold mt-4">Optional CSV Columns:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><code>sender_phone</code>, <code>recipient_phone</code></li>
            <li><code>weight_grams</code>, <code>dimensions_cm</code></li>
            <li><code>cod_amount</code> (creates COD order)</li>
            <li><code>special_instructions</code></li>
            <li><code>requires_signature</code> (true/false)</li>
          </ul>

          <div className="bg-muted p-4 rounded-lg mt-4">
            <p className="text-sm"><strong>💡 Tip:</strong> Invalid rows are highlighted with error messages. Fix errors in your CSV and re-upload, or proceed with valid rows only.</p>
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
            <p className="text-sm"><strong>Tip:</strong> Use the UAC picker to search by UAC code, address text, or recipient name. The system will validate and populate address details automatically.</p>
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
            <li>✅ Use name search when UAC is unknown</li>
            <li>✅ Always validate UAC before creating order</li>
            <li>✅ Note "Care of" relationships for dependent recipients</li>
            <li>✅ Capture accurate weight and dimensions for routing</li>
            <li>✅ Include recipient phone for delivery coordination</li>
            <li>✅ Mark fragile/hazmat items clearly</li>
            <li>✅ Set realistic delivery deadlines</li>
            <li>✅ Double-check COD amounts before submission</li>
            <li>✅ Use bulk import for high-volume days</li>
            <li>✅ Add special instructions for complex deliveries</li>
            <li>✅ Process intake queue promptly to maintain SLAs</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
