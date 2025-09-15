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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('address');
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
      toast.success(t('autoVerificationCompleted', { action: data.decision.action }));
      onUpdate?.();
    } catch (error) {
      console.error('Auto-verification failed:', error);
      toast.error(t('autoVerificationFailed'));
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
        .order('created_at', { ascending: true })
        .limit(20);

      if (error) throw error;
      setPendingRequests(data || []);
    } catch (error) {
      console.error('Failed to load pending requests:', error);
      toast.error(t('failedToLoadPendingRequests'));
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
      toast.success(t('batchProcessed', { approved: data.approved, flagged: data.flagged }));
      setSelectedRequests([]);
      loadPendingRequests();
      onUpdate?.();
    } catch (error) {
      console.error('Batch verification failed:', error);
      toast.error(t('batchVerificationFailed'));
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
        return <Badge className="bg-green-100 text-green-700">{t('autoApproved')}</Badge>;
      case 'flag':
        return <Badge variant="destructive">{t('flagged')}</Badge>;
      default:
        return <Badge variant="outline">{t('manualReview')}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Auto-Verification Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="h-5 w-5 text-primary" />
            {t('autoVerificationTools')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={handleBatchVerification}
              disabled={batchProcessing || (pendingRequests.length === 0)}
              className="flex items-center gap-2 text-xs whitespace-normal text-wrap h-auto py-2"
            >
              {batchProcessing ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  {t('processingBatch')}
                </>
              ) : (
                <>
                  <Target className="h-4 w-4" />
                  {t('runAutoVerification')} {selectedRequests.length > 0 && `(${selectedRequests.length} ${t('selected')})`}
                </>
              )}
            </Button>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>
                {selectedRequests.length > 0 
                  ? t('processSelected', { count: selectedRequests.length })
                  : t('processAll', { count: pendingRequests.length })
                }
              </span>
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs">
            <h4 className="font-medium text-blue-900 mb-2">{t('autoVerificationCriteria')}</h4>
            <div className="text-blue-800 space-y-1">
              <p>• <strong>{t('autoApprove')}:</strong> {t('scoreGreaterEqual85')}</p>
              <p>• <strong>{t('flagForRejection')}:</strong> {t('scoreLess50')}</p>
              <p>• <strong>{t('manualReview')}:</strong> {t('allOtherCases')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Request Selection */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2 text-base">
                <CheckSquare className="h-5 w-5 text-primary" />
                {t('selectRequestsForAutoVerification')}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={loadingRequests}
                className="text-xs"
              >
                {selectedRequests.length === pendingRequests.length ? t('deselectAll') : t('selectAll')}
              </Button>
            </div>
            {loadingRequests ? (
              <div className="flex items-center justify-center py-8">
                <Clock className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">{t('loadingPendingRequests')}</span>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {pendingRequests.map((request) => (
                  <div 
                    key={request.id} 
                    className="flex flex-col gap-3 p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedRequests.includes(request.id)}
                        onCheckedChange={() => handleSelectRequest(request.id)}
                        className="mt-1 flex-shrink-0 h-1 w-3 sm:h-2 sm:w-4"
                      />
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {request.street}, {request.city}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {request.region}, {request.country}
                            </p>
                          </div>
                          <div className="flex flex-col sm:items-end gap-1">
                            <Badge variant="outline" className="text-xs w-fit">
                              {request.id.slice(0, 8)}...
                            </Badge>
                            <p className="text-xs text-muted-foreground">
                              {new Date(request.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground break-all">
                            {t('coordinates')}: {request.latitude}, {request.longitude}
                          </p>
                          {request.justification && (
                            <p className="text-xs text-muted-foreground line-clamp-2 break-words">
                              {request.justification}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {pendingRequests.length === 0 && !loadingRequests && (
              <div className="text-center py-8 text-muted-foreground">
                {t('noPendingRequestsAvailable')}
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
              {t('batchVerificationResults')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{batchResult.approved}</div>
                <div className="text-sm text-muted-foreground">{t('autoApproved')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{batchResult.flagged}</div>
                <div className="text-sm text-muted-foreground">{t('flagged')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{batchResult.manualReview}</div>
                <div className="text-sm text-muted-foreground">{t('manualReview')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{batchResult.processed}</div>
                <div className="text-sm text-muted-foreground">{t('totalProcessed')}</div>
              </div>
            </div>

            {batchResult.results.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">{t('individualResults')}:</h4>
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
              {t('verificationAnalysis')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">{t('overallDecision')}:</span>
              {getActionBadge(lastResult.decision.action)}
            </div>

            <Separator />

            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">{t('overallScore')}</span>
                  <span className={`text-sm font-bold ${getScoreColor(lastResult.analysis.overallScore)}`}>
                    {lastResult.analysis.overallScore}%
                  </span>
                </div>
                <Progress value={lastResult.analysis.overallScore} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-muted-foreground">{t('coordinateValidity')}</span>
                    <span className="text-xs">{lastResult.analysis.coordinateValidity}%</span>
                  </div>
                  <Progress value={lastResult.analysis.coordinateValidity} className="h-1" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-muted-foreground">{t('addressConsistency')}</span>
                    <span className="text-xs">{lastResult.analysis.addressConsistency}%</span>
                  </div>
                  <Progress value={lastResult.analysis.addressConsistency} className="h-1" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-muted-foreground">{t('completeness')}</span>
                    <span className="text-xs">{lastResult.analysis.completeness}%</span>
                  </div>
                  <Progress value={lastResult.analysis.completeness} className="h-1" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-muted-foreground">{t('fraudRisk')}</span>
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
                    {t('recommendations')}
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
              <div>{t('method')}: {lastResult.analysis.method}</div>
              <div>{t('confidence')}: {lastResult.decision.confidence}</div>
              <div>{t('reasoning')}: {lastResult.decision.reasoning}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}