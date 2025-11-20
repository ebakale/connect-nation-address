import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ReviewQueueStatsProps {
  totalRequests: number;
  pendingRequests: number;
  flaggedRequests: number;
}

export function ReviewQueueStats({ totalRequests, pendingRequests, flaggedRequests }: ReviewQueueStatsProps) {
  const processedRequests = totalRequests - pendingRequests;
  const completionRate = totalRequests > 0 ? (processedRequests / totalRequests) * 100 : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Total Requests</CardDescription>
          <CardTitle className="text-2xl">{totalRequests}</CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Pending Review</CardDescription>
          <CardTitle className="text-2xl text-yellow-600">{pendingRequests}</CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Flagged Items</CardDescription>
          <CardTitle className="text-2xl text-orange-600">{flaggedRequests}</CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Completion Rate</CardDescription>
          <CardTitle className="text-2xl text-green-600">{completionRate.toFixed(1)}%</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Progress value={completionRate} className="h-2" />
        </CardContent>
      </Card>
    </div>
  );
}