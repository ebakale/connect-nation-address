import { AddressRequestApprovalPanel } from "./AddressRequestApprovalPanel";
import { ReviewQueuePanel } from "./ReviewQueuePanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckSquare, Flag } from "lucide-react";

export function AddressVerificationQueue() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="requests" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            Address Request Approval
          </TabsTrigger>
          <TabsTrigger value="review" className="flex items-center gap-2">
            <Flag className="h-4 w-4" />
            Review Queue
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="requests" className="mt-6">
          <AddressRequestApprovalPanel />
        </TabsContent>
        
        <TabsContent value="review" className="mt-6">
          <ReviewQueuePanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}