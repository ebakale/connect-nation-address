import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface LegalDocumentType {
  value: string;
  label: string;
  required: boolean;
  description: string;
}

export interface VerificationRequest {
  id: string;
  user_id: string;
  citizen_address_id: string;
  address_request_id: string | null; // Keep for backward compatibility
  verification_type: string;
  claimant_relationship: string;
  primary_document_type: string;
  status: string;
  consent_given: boolean;
  privacy_level: string;
  created_at: string;
  verification_notes?: string;
}

export const useResidencyVerification = () => {
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [legalFramework, setLegalFramework] = useState<any>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const documentTypes: LegalDocumentType[] = [
    { value: 'property_deed', label: 'Property Deed', required: true, description: 'Official document proving property ownership' },
    { value: 'land_certificate', label: 'Land Certificate', required: true, description: 'Government-issued land ownership certificate' },
    { value: 'lease_agreement', label: 'Lease Agreement', required: false, description: 'Legal contract for property rental' },
    { value: 'tenancy_agreement', label: 'Tenancy Agreement', required: false, description: 'Formal rental agreement' },
    { value: 'utility_bill', label: 'Utility Bill', required: false, description: 'Recent utility bill showing address' },
    { value: 'bank_statement', label: 'Bank Statement', required: false, description: 'Bank statement showing address' },
    { value: 'tax_certificate', label: 'Tax Certificate', required: true, description: 'Property tax payment certificate' },
    { value: 'inheritance_document', label: 'Inheritance Document', required: true, description: 'Legal document proving inheritance' },
    { value: 'court_order', label: 'Court Order', required: true, description: 'Court-issued property ownership order' },
    { value: 'government_id', label: 'Government ID', required: false, description: 'National identification document' },
  ];

  const fetchLegalFramework = async () => {
    try {
      const { data, error } = await supabase
        .from('legal_compliance_framework')
        .select('*')
        .eq('is_active', true)
        .eq('jurisdiction', 'Equatorial Guinea')
        .single();

      if (error) throw error;
      setLegalFramework(data);
    } catch (error) {
      console.error('Error fetching legal framework:', error);
    }
  };

  const fetchVerifications = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('residency_ownership_verifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVerifications(data || []);
    } catch (error) {
      console.error('Error fetching verifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch verification requests',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createVerificationRequest = async (
    citizenAddressId: string,
    verificationType: string,
    claimantRelationship: string,
    primaryDocumentType: string,
    documentUrl?: string
  ) => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    try {
      // First, create the verification request using the database function
      const { data: verificationId, error: functionError } = await supabase
        .rpc('initiate_residency_verification', {
          p_user_id: user.id,
          p_citizen_address_id: citizenAddressId,
          p_verification_type: verificationType,
          p_claimant_relationship: claimantRelationship,
          p_primary_document_type: primaryDocumentType as any,
          p_legal_basis: 'legitimate_interest',
          p_processing_purpose: 'address_verification'
        });

      if (functionError) throw functionError;

      // Update with document URL if provided
      if (documentUrl && verificationId) {
        const { error: updateError } = await supabase
          .from('residency_ownership_verifications')
          .update({ primary_document_url: documentUrl })
          .eq('id', verificationId);

        if (updateError) throw updateError;
      }

      await fetchVerifications();
      
      toast({
        title: 'Verification Request Created',
        description: 'Your residency/ownership verification request has been submitted for review.'
      });

      return verificationId;
    } catch (error: any) {
      console.error('Error creating verification request:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create verification request',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const recordPrivacyConsent = async (
    verificationId: string,
    consentType: string,
    consentGiven: boolean,
    consentDetails: any = {}
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .rpc('record_privacy_consent', {
          p_user_id: user.id,
          p_verification_id: verificationId,
          p_consent_type: consentType,
          p_consent_given: consentGiven,
          p_consent_details: consentDetails
        });

      if (error) throw error;

      toast({
        title: 'Consent Recorded',
        description: `Your ${consentType} consent has been recorded.`
      });
    } catch (error: any) {
      console.error('Error recording consent:', error);
      toast({
        title: 'Error',
        description: 'Failed to record consent',
        variant: 'destructive'
      });
    }
  };

  const getRequiredDocuments = (verificationType: string, claimantRelationship: string) => {
    const baseRequired = ['government_id'];
    
    if (verificationType === 'ownership' || verificationType === 'both') {
      if (claimantRelationship === 'owner') {
        return [...baseRequired, 'property_deed', 'tax_certificate'];
      }
    }
    
    if (verificationType === 'residency' || verificationType === 'both') {
      if (claimantRelationship === 'tenant') {
        return [...baseRequired, 'lease_agreement', 'utility_bill'];
      }
      if (claimantRelationship === 'family_member') {
        return [...baseRequired, 'utility_bill', 'bank_statement'];
      }
    }
    
    return baseRequired;
  };

  useEffect(() => {
    fetchLegalFramework();
    if (user) {
      fetchVerifications();
    }
  }, [user]);

  return {
    verifications,
    loading,
    legalFramework,
    documentTypes,
    createVerificationRequest,
    recordPrivacyConsent,
    getRequiredDocuments,
    fetchVerifications,
    refetch: fetchVerifications
  };
};