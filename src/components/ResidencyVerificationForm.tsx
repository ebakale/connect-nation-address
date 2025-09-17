import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Shield, FileText, CheckCircle, AlertTriangle, Upload, X } from 'lucide-react';
import { useResidencyVerification } from '@/hooks/useResidencyVerification';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ResidencyVerificationFormProps {
  addressRequestId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ResidencyVerificationForm = ({ 
  addressRequestId, 
  onSuccess, 
  onCancel 
}: ResidencyVerificationFormProps) => {
  const { 
    createVerificationRequest, 
    recordPrivacyConsent, 
    getRequiredDocuments, 
    documentTypes,
    legalFramework
  } = useResidencyVerification();
  
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    verificationType: 'both',
    claimantRelationship: 'owner',
    primaryDocumentType: '',
    privacyLevel: 'restricted',
    notes: ''
  });

  const [consents, setConsents] = useState({
    dataProcessing: false,
    dataRetention: false,
    documentVerification: false,
    fieldVerification: false
  });

  const [primaryDocument, setPrimaryDocument] = useState<File | null>(null);
  const [supportingDocuments, setSupportingDocuments] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const requiredDocuments = getRequiredDocuments(formData.verificationType, formData.claimantRelationship);
  const allConsentsGiven = Object.values(consents).every(consent => consent);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, type: 'primary' | 'supporting') => {
    const files = event.target.files;
    if (!files) return;

    const file = files[0];
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: 'File Too Large',
        description: 'Please select a file smaller than 10MB',
        variant: 'destructive'
      });
      return;
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid File Type',
        description: 'Please select a PDF or image file',
        variant: 'destructive'
      });
      return;
    }

    if (type === 'primary') {
      setPrimaryDocument(file);
    } else {
      setSupportingDocuments(prev => [...prev, file]);
    }
  };

  const uploadDocument = async (file: File, folder: string): Promise<string | null> => {
    if (!user) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('residency-documents')
        .upload(fileName, file);

      if (error) throw error;

      // Return just the file path since bucket is private
      return fileName;
    } catch (error) {
      console.error('Error uploading document:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!allConsentsGiven) {
      toast({
        title: 'Consent Required',
        description: 'Please provide all required consents to proceed',
        variant: 'destructive'
      });
      return;
    }

    if (!primaryDocument) {
      toast({
        title: 'Document Required',
        description: 'Please upload the primary verification document',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    setUploading(true);

    try {
      // Upload primary document
      const primaryDocumentUrl = await uploadDocument(primaryDocument, 'verification-documents');
      if (!primaryDocumentUrl) {
        throw new Error('Failed to upload primary document');
      }

      // Create verification request
      const verificationId = await createVerificationRequest(
        addressRequestId,
        formData.verificationType,
        formData.claimantRelationship,
        formData.primaryDocumentType,
        primaryDocumentUrl
      );

      // Record consents
      for (const [consentType, consentGiven] of Object.entries(consents)) {
        if (consentGiven) {
          await recordPrivacyConsent(
            verificationId,
            consentType,
            true,
            {
              timestamp: new Date().toISOString(),
              ipAddress: 'user_provided',
              userAgent: navigator.userAgent
            }
          );
        }
      }

      toast({
        title: 'Verification Request Submitted',
        description: 'Your residency/ownership verification request has been submitted for review. You will be notified of any updates.',
      });

      onSuccess?.();
    } catch (error: any) {
      console.error('Error submitting verification:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit verification request',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const selectedDocumentType = documentTypes.find(doc => doc.value === formData.primaryDocumentType);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Residency/Ownership Verification
        </CardTitle>
        <CardDescription>
          Submit legal documents to verify your residency or ownership of this address. All information is processed securely according to legal requirements.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Legal Framework Information */}
          {legalFramework && (
            <Alert>
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                <strong>Legal Framework:</strong> This verification process is governed by {legalFramework.applicable_laws.join(', ')}. 
                Data retention period: {Math.floor(legalFramework.data_retention_period / 365)} years.
              </AlertDescription>
            </Alert>
          )}

          {/* Verification Type */}
          <div className="space-y-2">
            <Label htmlFor="verificationType">Verification Type *</Label>
            <Select 
              value={formData.verificationType} 
              onValueChange={(value) => 
                setFormData(prev => ({ ...prev, verificationType: value, primaryDocumentType: '' }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="residency">Residency Verification</SelectItem>
                <SelectItem value="ownership">Ownership Verification</SelectItem>
                <SelectItem value="both">Both Residency & Ownership</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Claimant Relationship */}
          <div className="space-y-2">
            <Label htmlFor="claimantRelationship">Your Relationship to Property *</Label>
            <Select 
              value={formData.claimantRelationship} 
              onValueChange={(value) => 
                setFormData(prev => ({ ...prev, claimantRelationship: value, primaryDocumentType: '' }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">Property Owner</SelectItem>
                <SelectItem value="tenant">Tenant/Renter</SelectItem>
                <SelectItem value="family_member">Family Member</SelectItem>
                <SelectItem value="authorized_representative">Authorized Representative</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Required Documents Information */}
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Required Documents for Your Case:</h4>
            <div className="flex flex-wrap gap-2">
              {requiredDocuments.map(docType => {
                const doc = documentTypes.find(d => d.value === docType);
                return (
                  <Badge key={docType} variant="secondary">
                    {doc?.label}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Primary Document Type */}
          <div className="space-y-2">
            <Label htmlFor="primaryDocumentType">Primary Verification Document *</Label>
            <Select 
              value={formData.primaryDocumentType} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, primaryDocumentType: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select the main document you'll provide" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes
                  .filter(doc => requiredDocuments.includes(doc.value))
                  .map(doc => (
                    <SelectItem key={doc.value} value={doc.value}>
                      <div className="flex flex-col">
                        <span>{doc.label}</span>
                        <span className="text-xs text-muted-foreground">{doc.description}</span>
                      </div>
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
            {selectedDocumentType && (
              <p className="text-sm text-muted-foreground">{selectedDocumentType.description}</p>
            )}
          </div>

          {/* Primary Document Upload */}
          <div className="space-y-2">
            <Label>Primary Document Upload *</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6">
              {primaryDocument ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm">{primaryDocument.name}</span>
                    <Badge variant="outline">{(primaryDocument.size / 1024 / 1024).toFixed(1)} MB</Badge>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setPrimaryDocument(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload your primary verification document (PDF or image, max 10MB)
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose File
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={(e) => handleFileSelect(e, 'primary')}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Privacy Level */}
          <div className="space-y-2">
            <Label htmlFor="privacyLevel">Privacy Level</Label>
            <Select 
              value={formData.privacyLevel} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, privacyLevel: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="restricted">Restricted (Staff only)</SelectItem>
                <SelectItem value="confidential">Confidential (Authorized verifiers only)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Privacy Consents */}
          <div className="space-y-4">
            <h4 className="font-medium">Required Consents</h4>
            
            <div className="space-y-3">
              {[
                {
                  key: 'dataProcessing',
                  label: 'Data Processing Consent',
                  description: 'I consent to the processing of my personal data for address verification purposes'
                },
                {
                  key: 'dataRetention',
                  label: 'Data Retention Consent',
                  description: `I consent to the retention of my data for ${legalFramework?.data_retention_period ? Math.floor(legalFramework.data_retention_period / 365) : 7} years as required by law`
                },
                {
                  key: 'documentVerification',
                  label: 'Document Verification Consent',
                  description: 'I consent to the verification of submitted documents with relevant authorities'
                },
                {
                  key: 'fieldVerification',
                  label: 'Field Verification Consent',
                  description: 'I consent to field verification visits if required for this verification process'
                }
              ].map(consent => (
                <div key={consent.key} className="flex items-start space-x-2">
                  <Checkbox
                    id={consent.key}
                    checked={consents[consent.key as keyof typeof consents]}
                    onCheckedChange={(checked) => 
                      setConsents(prev => ({ ...prev, [consent.key]: checked === true }))
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor={consent.key}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {consent.label} *
                    </label>
                    <p className="text-xs text-muted-foreground">
                      {consent.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional information that might help with the verification process..."
              rows={3}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={!allConsentsGiven || !primaryDocument || loading}
              className="flex-1"
            >
              {uploading ? 'Uploading...' : loading ? 'Submitting...' : 'Submit Verification Request'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};