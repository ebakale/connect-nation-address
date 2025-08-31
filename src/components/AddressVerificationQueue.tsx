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
    <div className="space-y-4 p-4 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold break-words">Address Verification Queue</h3>
          <p className="text-sm text-muted-foreground break-words">Review and verify pending address submissions</p>
        </div>
        {onClose && (
          <Button variant="outline" size="sm" onClick={onClose} className="self-start sm:self-center">
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        )}
      </div>
      
      <Tabs defaultValue="requests" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto">
          <TabsTrigger value="requests" className="flex items-center gap-1 text-xs sm:text-sm p-2 sm:p-3">
            <CheckSquare className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="hidden xs:inline">Address Request Approval</span>
            <span className="xs:hidden">Requests</span>
          </TabsTrigger>
          <TabsTrigger value="review" className="flex items-center gap-1 text-xs sm:text-sm p-2 sm:p-3">
            <Flag className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="hidden xs:inline">Review Queue</span>
            <span className="xs:hidden">Review</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="requests" className="mt-4 max-w-full overflow-hidden">
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
            <AddressRequestApprovalPanel />
          </div>
        </TabsContent>
        
        <TabsContent value="review" className="mt-4 max-w-full overflow-hidden">
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
            <ReviewQueuePanel />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}