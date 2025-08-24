import { AddressRequestApprovalPanel } from "./AddressRequestApprovalPanel";
import { ReviewQueuePanel } from "./ReviewQueuePanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CheckSquare, Flag, X } from "lucide-react";

interface AddressVerificationQueueProps {
  onClose?: () => void;
}

export function AddressVerificationQueue({ onClose }: AddressVerificationQueueProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Address Verification Queue</h3>
          <p className="text-sm text-muted-foreground">Review and verify pending address submissions</p>
        </div>
        {onClose && (
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        )}
      </div>
      
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