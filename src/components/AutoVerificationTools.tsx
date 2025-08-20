import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Zap, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Clock,
  Target,
  Shield,
  MapPin,
  CheckSquare
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AutoVerificationResult {
  requestId: string;
  analysis: {
    overallScore: number;
    coordinateValidity: number;
    addressConsistency: number;
    completeness: number;
    fraudRisk: number;
    recommendations: string[];
    reasoning: string;
    method: string;
  };
  decision: {
    action: 'approve' | 'flag' | 'manual_review';
    requiresManualReview: boolean;
    confidence: string;
    reasoning: string;
  };
}

interface BatchResult {
  processed: number;
  approved: number;
  flagged: number;
  manualReview: number;
  results: Array<{
    requestId: string;
    action: string;
    score: number;
  }>;
}

interface PendingRequest {
  id: string;
  street: string;
  city: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  created_at: string;
  justification: string;
}

interface AutoVerificationToolsProps {
  onUpdate?: () => void;
}

export function AutoVerificationTools({ onUpdate }: AutoVerificationToolsProps) {
  const [processing, setProcessing] = useState(false);
  const [batchProcessing, setBatchProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<AutoVerificationResult | null>(null);
  const [batchResult, setBatchResult] = useState<BatchResult | null>(null);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const handleSingleVerification = async (requestId: string) => {
    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('auto-verify-address', {
        body: { requestId, mode: 'single' }
      });

      if (error) throw error;

      setLastResult(data);
      toast.success(`Auto-verification completed: ${data.decision.action}`);
      onUpdate?.();
    } catch (error) {
      console.error('Auto-verification failed:', error);
      toast.error("Auto-verification failed");
    } finally {
      setProcessing(false);
    }
  };

  const loadPendingRequests = async () => {
    setLoadingRequests(true);
    try {
      const { data, error } = await supabase
        .from('address_requests')
        .select('id, street, city, region, country, latitude, longitude, created_at, justification')
        .eq('status', 'pending')
        .is('auto_verified_at', null)
        .order('created_at', { ascending: true })
        .limit(20);

      if (error) throw error;
      setPendingRequests(data || []);
    } catch (error) {
      console.error('Failed to load pending requests:', error);
      toast.error("Failed to load pending requests");
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    loadPendingRequests();
  }, []);

  const handleBatchVerification = async () => {
    setBatchProcessing(true);
    try {
      const requestIds = selectedRequests.length > 0 ? selectedRequests : undefined;
      const { data, error } = await supabase.functions.invoke('auto-verify-address', {
        body: { mode: 'batch', requestIds }
      });

      if (error) throw error;

      setBatchResult(data);
      toast.success(`Batch processed: ${data.approved} approved, ${data.flagged} flagged`);
      setSelectedRequests([]);
      loadPendingRequests();
      onUpdate?.();
    } catch (error) {
      console.error('Batch verification failed:', error);
      toast.error("Batch verification failed");
    } finally {
      setBatchProcessing(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedRequests.length === pendingRequests.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(pendingRequests.map(req => req.id));
    }
  };

  const handleSelectRequest = (requestId: string) => {
    setSelectedRequests(prev => 
      prev.includes(requestId) 
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'approve':
        return <Badge className="bg-green-100 text-green-700">Auto-Approved</Badge>;
      case 'flag':
        return <Badge variant="destructive">Flagged</Badge>;
      default:
        return <Badge variant="outline">Manual Review</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Auto-Verification Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Auto-Verification Tools
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={handleBatchVerification}
              disabled={batchProcessing || (pendingRequests.length === 0)}
              className="flex items-center gap-2"
            >
              {batchProcessing ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  Processing Batch...
                </>
              ) : (
                <>
                  <Target className="h-4 w-4" />
                  Run Auto-Verification {selectedRequests.length > 0 && `(${selectedRequests.length} selected)`}
                </>
              )}
            </Button>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>
                {selectedRequests.length > 0 
                  ? `Process ${selectedRequests.length} selected requests` 
                  : `Process all ${pendingRequests.length} pending requests`
                }
              </span>
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Auto-Verification Criteria</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• <strong>Auto-Approve:</strong> Score ≥85% + Low fraud risk (&lt;30%)</p>
              <p>• <strong>Flag for Rejection:</strong> Score &lt;50% or High fraud risk (&gt;70%)</p>
              <p>• <strong>Manual Review:</strong> All other cases</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Request Selection */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-primary" />
                Select Requests for Auto-Verification
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={loadingRequests}
              >
                {selectedRequests.length === pendingRequests.length ? 'Deselect All' : 'Select All'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingRequests ? (
              <div className="flex items-center justify-center py-8">
                <Clock className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading pending requests...</span>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {pendingRequests.map((request) => (
                  <div 
                    key={request.id} 
                    className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={selectedRequests.includes(request.id)}
                      onCheckedChange={() => handleSelectRequest(request.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {request.street}, {request.city}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {request.region}, {request.country}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Coordinates: {request.latitude}, {request.longitude}
                          </p>
                          {request.justification && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {request.justification}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="text-xs">
                            {request.id.slice(0, 8)}...
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {pendingRequests.length === 0 && !loadingRequests && (
              <div className="text-center py-8 text-muted-foreground">
                No pending requests available for auto-verification
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Batch Results */}
      {batchResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Batch Verification Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{batchResult.approved}</div>
                <div className="text-sm text-muted-foreground">Auto-Approved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{batchResult.flagged}</div>
                <div className="text-sm text-muted-foreground">Flagged</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{batchResult.manualReview}</div>
                <div className="text-sm text-muted-foreground">Manual Review</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{batchResult.processed}</div>
                <div className="text-sm text-muted-foreground">Total Processed</div>
              </div>
            </div>

            {batchResult.results.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Individual Results:</h4>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {batchResult.results.map((result, index) => (
                    <div key={index} className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                      <span className="font-mono text-xs">{result.requestId.slice(0, 8)}...</span>
                      <div className="flex items-center gap-2">
                        <span className={getScoreColor(result.score)}>
                          {result.score}%
                        </span>
                        {getActionBadge(result.action)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Last Single Verification Result */}
      {lastResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Verification Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Overall Decision:</span>
              {getActionBadge(lastResult.decision.action)}
            </div>

            <Separator />

            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Overall Score</span>
                  <span className={`text-sm font-bold ${getScoreColor(lastResult.analysis.overallScore)}`}>
                    {lastResult.analysis.overallScore}%
                  </span>
                </div>
                <Progress value={lastResult.analysis.overallScore} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-muted-foreground">Coordinate Validity</span>
                    <span className="text-xs">{lastResult.analysis.coordinateValidity}%</span>
                  </div>
                  <Progress value={lastResult.analysis.coordinateValidity} className="h-1" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-muted-foreground">Address Consistency</span>
                    <span className="text-xs">{lastResult.analysis.addressConsistency}%</span>
                  </div>
                  <Progress value={lastResult.analysis.addressConsistency} className="h-1" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-muted-foreground">Completeness</span>
                    <span className="text-xs">{lastResult.analysis.completeness}%</span>
                  </div>
                  <Progress value={lastResult.analysis.completeness} className="h-1" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-muted-foreground">Fraud Risk</span>
                    <span className="text-xs text-red-600">{lastResult.analysis.fraudRisk}%</span>
                  </div>
                  <Progress value={lastResult.analysis.fraudRisk} className="h-1" />
                </div>
              </div>
            </div>

            {lastResult.analysis.recommendations.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    Recommendations
                  </h4>
                  <ul className="text-sm space-y-1">
                    {lastResult.analysis.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-yellow-600">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            <div className="text-xs text-muted-foreground">
              <div>Method: {lastResult.analysis.method}</div>
              <div>Confidence: {lastResult.decision.confidence}</div>
              <div>Reasoning: {lastResult.decision.reasoning}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}