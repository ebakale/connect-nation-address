import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import type { PostalLabel, LabelType } from '@/types/postalEnhanced';
import type { DeliveryOrder } from '@/types/postal';

export const usePostalLabels = () => {
  const { t } = useTranslation('postal');
  const { user } = useAuth();
  const [generating, setGenerating] = useState(false);

  const generateQRCode = async (data: string): Promise<string> => {
    try {
      return await QRCode.toDataURL(data, {
        width: 150,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' }
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      return '';
    }
  };

  const generateLabelPDF = useCallback(async (
    order: DeliveryOrder,
    s10TrackingNumber: string,
    labelType: LabelType = 'standard'
  ): Promise<Blob> => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [100, 150] // 10cm x 15cm standard label
    });

    // Background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 100, 150, 'F');

    // Border
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.rect(2, 2, 96, 146);

    // Header - Government Postal Service
    doc.setFillColor(0, 51, 102);
    doc.rect(2, 2, 96, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('GOVERNMENT POSTAL SERVICE', 50, 10, { align: 'center' });
    doc.setFontSize(8);
    doc.text('EQUATORIAL GUINEA', 50, 15, { align: 'center' });

    // Label type indicator
    doc.setTextColor(0, 0, 0);
    const labelColors: Record<LabelType, [number, number, number]> = {
      standard: [200, 200, 200],
      express: [255, 69, 0],
      registered: [0, 128, 0],
      return: [128, 0, 128]
    };
    doc.setFillColor(...labelColors[labelType]);
    doc.rect(70, 20, 28, 8, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(labelType === 'standard' ? 0 : 255, labelType === 'standard' ? 0 : 255, labelType === 'standard' ? 0 : 255);
    doc.text(labelType.toUpperCase(), 84, 25, { align: 'center' });

    // Priority indicator
    const priorityLabels = ['URGENT', 'HIGH', 'NORMAL', 'LOW', 'ECONOMY'];
    const priorityColors: [number, number, number][] = [
      [255, 0, 0], [255, 165, 0], [0, 128, 0], [0, 0, 255], [128, 128, 128]
    ];
    const priority = (order.priority_level || 3) - 1;
    doc.setFillColor(...priorityColors[priority]);
    doc.rect(5, 20, 25, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6);
    doc.text(priorityLabels[priority], 17.5, 25, { align: 'center' });

    // Sender section
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('FROM:', 5, 35);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(order.sender_name || 'N/A', 5, 41);
    if (order.sender_phone) {
      doc.setFontSize(7);
      doc.text(`Tel: ${order.sender_phone}`, 5, 46);
    }

    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.line(5, 50, 95, 50);

    // Recipient section
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('TO:', 5, 57);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(order.recipient_name || 'N/A', 5, 64);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    // UAC Address
    doc.setFillColor(240, 240, 240);
    doc.rect(5, 67, 90, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(order.recipient_address_uac || 'N/A', 50, 73, { align: 'center' });

    // Full address if available
    if (order.recipient_address) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const addressLine = `${order.recipient_address.street}, ${order.recipient_address.city}`;
      doc.text(addressLine, 5, 82, { maxWidth: 60 });
    }

    // Phone
    if (order.recipient_phone) {
      doc.setFontSize(8);
      doc.text(`Tel: ${order.recipient_phone}`, 5, 88);
    }

    // QR Code
    const trackingUrl = `${window.location.origin}/track?order=${order.order_number}`;
    const qrDataUrl = await generateQRCode(trackingUrl);
    if (qrDataUrl) {
      doc.addImage(qrDataUrl, 'PNG', 65, 78, 30, 30);
    }

    // Divider
    doc.line(5, 110, 95, 110);

    // Tracking number
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('TRACKING NUMBER', 50, 117, { align: 'center' });
    doc.setFontSize(12);
    doc.text(s10TrackingNumber, 50, 125, { align: 'center' });

    // Order number
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Order: ${order.order_number}`, 50, 131, { align: 'center' });

    // Package info
    doc.setFontSize(7);
    const packageInfo: string[] = [];
    if (order.package_type) packageInfo.push(order.package_type.toUpperCase());
    if (order.weight_grams) packageInfo.push(`${order.weight_grams}g`);
    if (order.requires_signature) packageInfo.push('SIGNATURE REQ.');
    if (order.requires_id_verification) packageInfo.push('ID REQ.');
    doc.text(packageInfo.join(' | '), 50, 137, { align: 'center' });

    // COD indicator if applicable
    if (order.cod_required && order.cod_amount) {
      doc.setFillColor(255, 215, 0);
      doc.rect(5, 140, 90, 8, 'F');
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(`COD: ${order.cod_amount.toLocaleString()} XAF`, 50, 145, { align: 'center' });
    }

    return doc.output('blob');
  }, []);

  const generateLabel = async (
    order: DeliveryOrder,
    labelType: LabelType = 'standard'
  ): Promise<PostalLabel | null> => {
    if (!user) return null;
    setGenerating(true);

    try {
      // Generate S10 tracking number
      const { data: trackingNumber, error: rpcError } = await supabase
        .rpc('generate_s10_tracking_number');

      if (rpcError) throw rpcError;

      // Generate QR code data
      const trackingUrl = `${window.location.origin}/track?order=${order.order_number}`;

      // Create label record
      const { data: label, error: labelError } = await supabase
        .from('postal_labels')
        .insert({
          order_id: order.id,
          label_type: labelType,
          s10_tracking_number: trackingNumber,
          barcode_data: trackingNumber,
          qr_code_data: trackingUrl,
          generated_by: user.id,
        })
        .select()
        .single();

      if (labelError) throw labelError;

      // Update delivery order
      await supabase
        .from('delivery_orders')
        .update({ label_generated: true })
        .eq('id', order.id);

      toast.success(t('labels.generated'));
      
      return {
        ...label,
        label_type: label.label_type as LabelType,
        metadata: (label.metadata || {}) as Record<string, unknown>
      };
    } catch (error) {
      console.error('Error generating label:', error);
      toast.error(t('labels.generateError'));
      return null;
    } finally {
      setGenerating(false);
    }
  };

  const printLabel = async (order: DeliveryOrder): Promise<void> => {
    setGenerating(true);

    try {
      // Check if label already exists
      const { data: existingLabel } = await supabase
        .from('postal_labels')
        .select('*')
        .eq('order_id', order.id)
        .maybeSingle();

      let trackingNumber: string;

      if (existingLabel) {
        trackingNumber = existingLabel.s10_tracking_number || order.order_number;
      } else {
        // Generate new label
        const label = await generateLabel(order);
        if (!label) throw new Error('Failed to generate label');
        trackingNumber = label.s10_tracking_number || order.order_number;
      }

      // Generate PDF
      const pdfBlob = await generateLabelPDF(order, trackingNumber);
      
      // Open PDF in new window for printing
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const printWindow = window.open(pdfUrl, '_blank');
      
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }

      // Record print action
      if (existingLabel) {
        await supabase
          .from('postal_labels')
          .update({
            printed_at: new Date().toISOString(),
            printed_by: user?.id,
          })
          .eq('id', existingLabel.id);
      }

      toast.success(t('labels.printing'));
    } catch (error) {
      console.error('Error printing label:', error);
      toast.error(t('labels.printError'));
    } finally {
      setGenerating(false);
    }
  };

  const downloadLabel = async (order: DeliveryOrder): Promise<void> => {
    setGenerating(true);

    try {
      // Check if label exists
      const { data: existingLabel } = await supabase
        .from('postal_labels')
        .select('s10_tracking_number')
        .eq('order_id', order.id)
        .maybeSingle();

      let trackingNumber: string;

      if (existingLabel?.s10_tracking_number) {
        trackingNumber = existingLabel.s10_tracking_number;
      } else {
        // Generate new label
        const label = await generateLabel(order);
        if (!label) throw new Error('Failed to generate label');
        trackingNumber = label.s10_tracking_number || order.order_number;
      }

      // Generate PDF
      const pdfBlob = await generateLabelPDF(order, trackingNumber);
      
      // Download
      const link = document.createElement('a');
      link.href = URL.createObjectURL(pdfBlob);
      link.download = `label_${order.order_number}.pdf`;
      link.click();

      toast.success(t('labels.downloaded'));
    } catch (error) {
      console.error('Error downloading label:', error);
      toast.error(t('labels.downloadError'));
    } finally {
      setGenerating(false);
    }
  };

  const getLabelByOrderId = async (orderId: string): Promise<PostalLabel | null> => {
    try {
      const { data, error } = await supabase
        .from('postal_labels')
        .select('*')
        .eq('order_id', orderId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      
      return {
        ...data,
        label_type: data.label_type as LabelType,
        metadata: (data.metadata || {}) as Record<string, unknown>
      };
    } catch (error) {
      console.error('Error fetching label:', error);
      return null;
    }
  };

  return {
    generating,
    generateLabel,
    printLabel,
    downloadLabel,
    getLabelByOrderId,
    generateLabelPDF,
  };
};
