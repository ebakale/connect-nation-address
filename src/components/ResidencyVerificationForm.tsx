import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Shield, Upload, FileText, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useResidencyVerification } from '@/hooks/useResidencyVerification';
import { useToast } from '@/hooks/use-toast';

interface ResidencyVerificationFormProps {
  addressRequestId: string;
  editingVerification?: any; // Optional: for editing existing requests
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ResidencyVerificationForm = ({ 
  addressRequestId, 
  editingVerification, 
  onSuccess, 
  onCancel 
}: ResidencyVerificationFormProps) => {
  const { 
    createVerificationRequest, 
    recordPrivacyConsent, 
    legalFramework, 
    documentTypes, 
    getRequiredDocuments 
  } = useResidencyVerification();
  
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    verificationType: editingVerification?.verification_type || 'residency',
    claimantRelationship: editingVerification?.claimant_relationship || 'resident', 
    primaryDocumentType: editingVerification?.primary_document_type || 'utility_bill',
    additionalNotes: ''
  });
  const [consents, setConsents] = useState({
    dataProcessing: editingVerification ? true : false,
    dataRetention: editingVerification ? true : false,
    dataSharing: false,
    qualityAssurance: false
  });
  const [primaryDocument, setPrimaryDocument] = useState<File | null>(null);
  const [supportingDocuments, setSupportingDocuments] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const primaryFileRef = useRef<HTMLInputElement>(null);
  const supportingFileRef = useRef<HTMLInputElement>(null);

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
    
    const requiredConsents = ['dataProcessing', 'dataRetention'];
    const allConsentsGiven = requiredConsents.every(consent => consents[consent as keyof typeof consents]);

    if (!allConsentsGiven) {
      toast({
        title: 'Consent Required',
        description: 'Please provide all required consents to proceed',
        variant: 'destructive'
      });
      return;
    }

    if (!primaryDocument && !editingVerification?.primary_document_url) {
      toast({
        title: 'Document Required',
        description: 'Please upload the primary verification document',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    setUploading(true);

    let verificationId: string | undefined;
    try {
      let primaryDocumentUrl = editingVerification?.primary_document_url;
      
      // Upload primary document if a new one is provided
      if (primaryDocument) {
        console.log('Uploading new document for user:', user?.id);
        primaryDocumentUrl = await uploadDocument(primaryDocument, 'verification-documents');
        if (!primaryDocumentUrl) {
          throw new Error('Failed to upload primary document');
        }
        console.log('Document uploaded successfully:', primaryDocumentUrl);
      }

      if (editingVerification) {
        // Update existing verification request
        const updateData: any = {
          verification_type: formData.verificationType,
          claimant_relationship: formData.claimantRelationship,
          primary_document_type: formData.primaryDocumentType,
          status: 'pending', // Reset to pending when edited
          updated_at: new Date().toISOString()
        };

        // Only update document URL if a new document was uploaded
        if (primaryDocumentUrl) {
          updateData.primary_document_url = primaryDocumentUrl;
        }

        const { error } = await supabase
          .from('residency_ownership_verifications')
          .update(updateData)
          .eq('id', editingVerification.id);

        if (error) throw error;
        verificationId = editingVerification.id;
      } else {
        // Create verification request
        verificationId = await createVerificationRequest(
          addressRequestId,
          formData.verificationType,
          formData.claimantRelationship,
          formData.primaryDocumentType,
          primaryDocumentUrl!
        );
      }

      // Record consents (only for new requests)
      if (!editingVerification && verificationId) {
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
      }

      toast({
        title: editingVerification ? 'Verification Request Updated' : 'Verification Request Submitted',
        description: editingVerification 
          ? 'Your verification request has been updated and is under review.'
          : 'Your residency/ownership verification request has been submitted for review. You will be notified of any updates.',
      });

      onSuccess?.();
    } catch (error: any) {
      console.error('Error submitting verification:', error);
      
      let errorMessage = 'Failed to submit verification request';
      if (editingVerification) {
        errorMessage = 'Failed to update verification request';
      }
      
      // Provide more specific error messages
      if (error.message?.includes('storage')) {
        errorMessage = 'Failed to upload document. Please try again.';
      } else if (error.message?.includes('database')) {
        errorMessage = 'Database error occurred. Please contact support.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
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
          {editingVerification ? 'Edit Verification Request' : 'Residency/Ownership Verification'}
        </CardTitle>
        <CardDescription>
          {editingVerification 
            ? 'Update your verification request with corrected information or new documents.'
            : 'Submit legal documents to verify your residency or ownership of this address. All information is processed securely according to legal requirements.'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Legal Framework Information */}
          {legalFramework && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Legal Framework</h3>
              <p className="text-sm text-blue-700 mb-2">
                Jurisdiction: {legalFramework.jurisdiction}
              </p>
              <p className="text-sm text-blue-700">
                Data Retention Period: {legalFramework.data_retention_period} days
              </p>
            </div>
          )}

          {/* Verification Type */}
          <div className="space-y-2">
            <Label htmlFor="verificationType">Verification Type *</Label>
            <Select 
              value={formData.verificationType} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, verificationType: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="residency">Residency Verification</SelectItem>
                <SelectItem value="ownership">Ownership Verification</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Claimant Relationship */}
          <div className="space-y-2">
            <Label htmlFor="claimantRelationship">Your Relationship to this Address *</Label>
            <Select 
              value={formData.claimantRelationship} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, claimantRelationship: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="resident">Resident</SelectItem>
                <SelectItem value="owner">Property Owner</SelectItem>
                <SelectItem value="tenant">Tenant</SelectItem>
                <SelectItem value="family_member">Family Member</SelectItem>
                <SelectItem value="business_operator">Business Operator</SelectItem>
                <SelectItem value="authorized_representative">Authorized Representative</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Primary Document Type */}
          <div className="space-y-2">
            <Label htmlFor="primaryDocumentType">Primary Document Type *</Label>
            <Select 
              value={formData.primaryDocumentType} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, primaryDocumentType: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((docType) => (
                  <SelectItem key={docType.value} value={docType.value}>
                    {docType.label} {docType.required && '*'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedDocumentType && (
              <p className="text-sm text-muted-foreground">
                {selectedDocumentType.description}
              </p>
            )}
          </div>

          {/* Required Documents */}
          <div className="space-y-2">
            <Label>Required Documents</Label>
            <div className="bg-gray-50 border rounded-lg p-4">
              <h4 className="font-medium mb-2">For your selection, you must provide:</h4>
              <ul className="space-y-1">
                {getRequiredDocuments(formData.verificationType, formData.claimantRelationship).map((docType, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    {documentTypes.find(d => d.value === docType)?.label || docType}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Separator />

          {/* Primary Document Upload */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="primaryDocument">Primary Document *</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Upload your {selectedDocumentType?.label.toLowerCase()} (PDF or image, max 10MB)
              </p>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => primaryFileRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
                <input
                  ref={primaryFileRef}
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={(e) => handleFileSelect(e, 'primary')}
                  className="hidden"
                />
                {primaryDocument && (
                  <span className="text-sm text-green-600">
                    ✓ {primaryDocument.name}
                  </span>
                )}
                {editingVerification?.primary_document_url && !primaryDocument && (
                  <span className="text-sm text-blue-600">
                    ✓ Document already uploaded
                  </span>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Privacy Consents */}
          <div className="space-y-4">
            <Label>Privacy and Data Processing Consents *</Label>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="dataProcessing"
                  checked={consents.dataProcessing}
                  onCheckedChange={(checked) => 
                    setConsents(prev => ({ ...prev, dataProcessing: !!checked }))
                  }
                />
                <Label htmlFor="dataProcessing" className="text-sm leading-5">
                  <span className="font-medium">Data Processing Consent *</span><br />
                  I consent to the processing of my personal data and submitted documents for the purpose of address verification in accordance with applicable data protection laws.
                </Label>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="dataRetention"
                  checked={consents.dataRetention}
                  onCheckedChange={(checked) => 
                    setConsents(prev => ({ ...prev, dataRetention: !!checked }))
                  }
                />
                <Label htmlFor="dataRetention" className="text-sm leading-5">
                  <span className="font-medium">Data Retention Consent *</span><br />
                  I understand and consent to my data being retained for {legalFramework?.data_retention_period || 2555} days for legal compliance and verification purposes.
                </Label>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="dataSharing"
                  checked={consents.dataSharing}
                  onCheckedChange={(checked) => 
                    setConsents(prev => ({ ...prev, dataSharing: !!checked }))
                  }
                />
                <Label htmlFor="dataSharing" className="text-sm leading-5">
                  <span className="font-medium">Authorized Data Sharing</span><br />
                  I consent to sharing of verified address information with authorized government agencies and emergency services for public safety purposes.
                </Label>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="qualityAssurance"
                  checked={consents.qualityAssurance}
                  onCheckedChange={(checked) => 
                    setConsents(prev => ({ ...prev, qualityAssurance: !!checked }))
                  }
                />
                <Label htmlFor="qualityAssurance" className="text-sm leading-5">
                  <span className="font-medium">Quality Assurance</span><br />
                  I consent to my data being used for system improvement and quality assurance purposes (anonymized data only).
                </Label>
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="additionalNotes">Additional Notes</Label>
            <Textarea
              id="additionalNotes"
              value={formData.additionalNotes}
              onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
              placeholder="Any additional information that might help with verification..."
              rows={3}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={loading || uploading}
              className="flex-1"
            >
              {uploading ? 'Uploading...' : loading ? 'Processing...' : editingVerification ? 'Update Request' : 'Submit Request'}
            </Button>
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={loading || uploading}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};