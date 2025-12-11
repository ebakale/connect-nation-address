import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Camera, MapPin, Clock, User, Image, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface Evidence {
  id: string;
  file_path: string;
  file_type: string;
  description: string | null;
  captured_at: string;
  location_latitude: number | null;
  location_longitude: number | null;
  officer_id: string;
  officer_name?: string;
  file_url?: string;
}

interface IncidentEvidenceViewerProps {
  incidentId: string;
  refreshTrigger?: number;
}

export const IncidentEvidenceViewer = ({ incidentId, refreshTrigger }: IncidentEvidenceViewerProps) => {
  const { t, i18n } = useTranslation('emergency');
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    fetchEvidence();
  }, [incidentId, refreshTrigger]);

  const fetchEvidence = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('incident_evidence')
        .select('*')
        .eq('incident_id', incidentId)
        .order('captured_at', { ascending: false });

      if (error) throw error;

      // Fetch officer names and signed URLs
      const officerIds = [...new Set(data?.map(e => e.officer_id).filter(Boolean))];
      
      const { data: profiles } = officerIds.length > 0 
        ? await supabase.from('profiles').select('user_id, full_name, email').in('user_id', officerIds)
        : { data: [] };

      const profileMap = new Map((profiles || []).map(p => [p.user_id, p.full_name || p.email]));

      // Get signed URLs for images
      const enrichedEvidence = await Promise.all((data || []).map(async (item) => {
        const { data: urlData } = await supabase.storage
          .from('incident-evidence')
          .createSignedUrl(item.file_path, 3600);
        
        return {
          ...item,
          officer_name: profileMap.get(item.officer_id) || t('evidence.unknownOfficer'),
          file_url: urlData?.signedUrl
        };
      }));

      setEvidence(enrichedEvidence);
    } catch (error) {
      console.error('Error fetching evidence:', error);
      toast.error(t('evidence.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (evidence.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground" key={i18n.resolvedLanguage}>
        <Camera className="h-12 w-12 mb-4 opacity-50" />
        <p>{t('evidence.noEvidenceYet')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" key={i18n.resolvedLanguage}>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        {evidence.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            {item.file_url && (
              <div 
                className="aspect-video bg-muted cursor-pointer relative group"
                onClick={() => setSelectedImage(item.file_url || null)}
              >
                <img
                  src={item.file_url}
                  alt={item.description || 'Evidence'}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <Image className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            )}
            <CardContent className="p-3 space-y-2">
              {item.description && (
                <p className="text-sm">{item.description}</p>
              )}
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {item.officer_name}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {format(new Date(item.captured_at), 'MMM d, HH:mm')}
                </span>
                {item.location_latitude && item.location_longitude && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {item.location_latitude.toFixed(4)}, {item.location_longitude.toFixed(4)}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Evidence full view"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </div>
  );
};

export default IncidentEvidenceViewer;
