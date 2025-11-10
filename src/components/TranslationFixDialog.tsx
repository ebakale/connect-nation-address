import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface TranslationIssue {
  key: string;
  namespace: string;
  type: 'missing' | 'incomplete' | 'empty';
  missingIn: string[];
  values: { [lang: string]: string };
}

interface TranslationFixDialogProps {
  issue: TranslationIssue | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function TranslationFixDialog({ issue, open, onOpenChange, onSuccess }: TranslationFixDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState({
    en: '',
    es: '',
    fr: ''
  });

  // Pre-fill existing values when issue changes
  useState(() => {
    if (issue) {
      setValues({
        en: issue.values.en || '',
        es: issue.values.es || '',
        fr: issue.values.fr || ''
      });
    }
  });

  const handleSave = async () => {
    if (!issue) return;

    // Validate all fields are filled
    if (!values.en.trim() || !values.es.trim() || !values.fr.trim()) {
      toast({
        title: 'Incomplete translations',
        description: 'Please provide translations for all three languages (EN, ES, FR)',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('save-translation-fix', {
        body: {
          namespace: issue.namespace,
          key: issue.key,
          translations: {
            en: values.en.trim(),
            es: values.es.trim(),
            fr: values.fr.trim()
          }
        }
      });

      if (error) throw error;

      toast({
        title: 'Translation fixed!',
        description: `Successfully saved translation for ${issue.namespace}:${issue.key}`,
      });

      // Reload the page to apply the fix
      setTimeout(() => {
        window.location.reload();
      }, 1000);

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving translation fix:', error);
      toast({
        title: 'Error saving translation',
        description: error instanceof Error ? error.message : 'Failed to save translation fix',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!issue) return;

    const exportData = {
      namespace: issue.namespace,
      key: issue.key,
      translations: values
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${issue.namespace}-${issue.key.replace(/\./g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Exported!',
      description: 'Translation fix exported as JSON file',
    });
  };

  if (!issue) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Fix Translation</DialogTitle>
          <DialogDescription>
            <span className="font-mono text-sm">{issue.namespace}:{issue.key}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="en">English (EN) {issue.missingIn.includes('EN') && <span className="text-destructive">*Missing</span>}</Label>
            <Textarea
              id="en"
              value={values.en}
              onChange={(e) => setValues({ ...values, en: e.target.value })}
              placeholder="Enter English translation..."
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="es">Spanish (ES) {issue.missingIn.includes('ES') && <span className="text-destructive">*Missing</span>}</Label>
            <Textarea
              id="es"
              value={values.es}
              onChange={(e) => setValues({ ...values, es: e.target.value })}
              placeholder="Enter Spanish translation..."
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fr">French (FR) {issue.missingIn.includes('FR') && <span className="text-destructive">*Missing</span>}</Label>
            <Textarea
              id="fr"
              value={values.fr}
              onChange={(e) => setValues({ ...values, fr: e.target.value })}
              placeholder="Enter French translation..."
              className="min-h-[80px]"
            />
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <Button variant="outline" onClick={handleExport}>
            Export as JSON
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Fix
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}