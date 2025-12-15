import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useBulkImport } from '@/hooks/useBulkImport';
import { BulkImportRowData } from '@/types/postalEnhanced';
import { Upload, FileSpreadsheet, Download, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';

interface BulkImportDialogProps {
  open: boolean;
  onClose: () => void;
}

export const BulkImportDialog = ({ open, onClose }: BulkImportDialogProps) => {
  const { t } = useTranslation('postal');
  const { processImport, loading, downloadTemplate } = useBulkImport();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<'upload' | 'preview' | 'progress' | 'complete'>('upload');
  const [fileName, setFileName] = useState('');
  const [parsedData, setParsedData] = useState<BulkImportRowData[]>([]);
  const [validationErrors, setValidationErrors] = useState<{ row: number; error: string }[]>([]);
  const [importResult, setImportResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

      const parsed: BulkImportRowData[] = jsonData.map((row) => ({
        sender_name: String(row['sender_name'] || ''),
        sender_phone: row['sender_phone'] ? String(row['sender_phone']) : undefined,
        recipient_name: String(row['recipient_name'] || ''),
        recipient_address_uac: String(row['recipient_address_uac'] || ''),
        recipient_phone: row['recipient_phone'] ? String(row['recipient_phone']) : undefined,
        recipient_email: row['recipient_email'] ? String(row['recipient_email']) : undefined,
        package_type: String(row['package_type'] || 'letter'),
        weight_grams: row['weight_grams'] ? String(row['weight_grams']) : undefined,
        declared_value: row['declared_value'] ? String(row['declared_value']) : undefined,
        priority_level: row['priority_level'] ? String(row['priority_level']) : '3',
        notes: row['notes'] ? String(row['notes']) : undefined,
        cod_amount: row['cod_amount'] ? String(row['cod_amount']) : undefined,
      }));

      // Validate
      const errors: { row: number; error: string }[] = [];
      parsed.forEach((row, index) => {
        if (!row.sender_name) errors.push({ row: index + 2, error: t('validation.senderNameRequired') });
        if (!row.recipient_name) errors.push({ row: index + 2, error: t('validation.recipientNameRequired') });
        if (!row.recipient_address_uac) errors.push({ row: index + 2, error: t('validation.recipientAddressRequired') });
      });

      setParsedData(parsed);
      setValidationErrors(errors);
      setStep('preview');
    } catch (error) {
      console.error('Error parsing file:', error);
    }
  };

  const handleImport = async () => {
    setStep('progress');

    const result = await processImport(fileName, parsedData);

    if (result) {
      setImportResult({
        success: result.success_count,
        failed: result.error_count,
        errors: result.error_summary?.map(e => `Row ${e.row}: ${e.error}`) || [],
      });
      setStep('complete');
    } else {
      setStep('upload');
    }
  };

  const resetDialog = () => {
    setStep('upload');
    setFileName('');
    setParsedData([]);
    setValidationErrors([]);
    setImportResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    resetDialog();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            {t('bulkImport.title')}
          </DialogTitle>
          <DialogDescription>
            {t('bulkImport.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {step === 'upload' && (
            <div className="space-y-6 py-4">
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">{t('bulkImport.dragDrop')}</p>
                <p className="text-sm text-muted-foreground">{t('bulkImport.orClick')}</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              <div className="flex justify-center">
                <Button variant="outline" onClick={downloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  {t('bulkImport.downloadTemplate')}
                </Button>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{fileName}</p>
                  <p className="text-sm text-muted-foreground">
                    {parsedData.length} {t('bulkImport.rowsFound')}
                  </p>
                </div>
                {validationErrors.length > 0 && (
                  <Badge variant="destructive">
                    {validationErrors.length} {t('bulkImport.errors')}
                  </Badge>
                )}
              </div>

              {validationErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside">
                      {validationErrors.slice(0, 5).map((err, i) => (
                        <li key={i}>
                          {t('bulkImport.row')} {err.row}: {err.error}
                        </li>
                      ))}
                      {validationErrors.length > 5 && (
                        <li>...{t('bulkImport.andMore', { count: validationErrors.length - 5 })}</li>
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <ScrollArea className="h-[300px] rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>{t('sender.name')}</TableHead>
                      <TableHead>{t('recipient.name')}</TableHead>
                      <TableHead>{t('recipient.address')}</TableHead>
                      <TableHead>{t('package.type')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.slice(0, 50).map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 2}</TableCell>
                        <TableCell>{row.sender_name}</TableCell>
                        <TableCell>{row.recipient_name}</TableCell>
                        <TableCell className="font-mono text-xs">{row.recipient_address_uac}</TableCell>
                        <TableCell>{row.package_type}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={resetDialog}>
                  {t('bulkImport.chooseAnother')}
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={validationErrors.length > 0 || loading}
                >
                  {t('bulkImport.startImport')}
                </Button>
              </div>
            </div>
          )}

          {step === 'progress' && (
            <div className="py-8 text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <p className="text-lg font-medium">{t('bulkImport.importing')}</p>
              <Progress value={50} className="w-full" />
            </div>
          )}

          {step === 'complete' && importResult && (
            <div className="py-4 space-y-6">
              <div className="text-center space-y-4">
                <CheckCircle className="h-12 w-12 mx-auto text-success" />
                <p className="text-lg font-medium">{t('bulkImport.complete')}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg text-center">
                  <p className="text-3xl font-bold text-success">{importResult.success}</p>
                  <p className="text-sm text-muted-foreground">{t('bulkImport.successful')}</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <p className="text-3xl font-bold text-destructive">{importResult.failed}</p>
                  <p className="text-sm text-muted-foreground">{t('bulkImport.failed')}</p>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside">
                      {importResult.errors.slice(0, 5).map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end">
                <Button onClick={handleClose}>{t('common:buttons.close')}</Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
