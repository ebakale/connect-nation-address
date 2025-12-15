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

  const getPackageTypeLabel = (packageType: string): string => {
    const key = `package.types.${packageType}`;
    const translated = t(key);
    return translated !== key ? translated : packageType.replace(/_/g, ' ').toUpperCase();
  };

  const getPriorityLabel = (priority: number): string => {
    const labels = [
      t('priority.urgent'),
      t('priority.high'),
      t('priority.normal'),
      t('priority.low'),
      t('priority.economy')
    ];
    return labels[Math.min(priority - 1, 4)] || t('priority.normal');
  };

  const generateLabelHTML = async (
    order: DeliveryOrder,
    s10TrackingNumber: string,
    labelType: LabelType = 'standard'
  ): Promise<string> => {
    const trackingUrl = `${window.location.origin}/track?order=${order.order_number}`;
    const qrDataUrl = await generateQRCode(trackingUrl);
    
    const priorityColors = ['#ff0000', '#ffa500', '#008000', '#0000ff', '#808080'];
    const priority = (order.priority_level || 3) - 1;
    const priorityColor = priorityColors[priority] || '#008000';
    
    const labelColors: Record<LabelType, string> = {
      standard: '#c8c8c8',
      express: '#ff4500',
      registered: '#008000',
      return: '#800080'
    };

    const packageInfo: string[] = [];
    if (order.package_type) packageInfo.push(getPackageTypeLabel(order.package_type));
    if (order.weight_grams) packageInfo.push(`${order.weight_grams}g`);
    if (order.requires_signature) packageInfo.push(t('labels.signatureRequired'));
    if (order.requires_id_verification) packageInfo.push(t('labels.idRequired'));

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${t('labels.title')} - ${order.order_number}</title>
        <style>
          @page { size: 100mm 150mm; margin: 0; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: Arial, Helvetica, sans-serif; 
            width: 100mm; 
            height: 150mm; 
            padding: 2mm;
          }
          .label { 
            border: 0.5mm solid #000; 
            width: 96mm; 
            height: 146mm; 
            position: relative;
          }
          .header { 
            background: #003366; 
            color: white; 
            padding: 3mm; 
            text-align: center; 
          }
          .header h1 { font-size: 10pt; margin-bottom: 1mm; }
          .header h2 { font-size: 8pt; font-weight: normal; }
          .badges { display: flex; justify-content: space-between; padding: 2mm 3mm; }
          .badge { 
            padding: 1mm 3mm; 
            font-size: 6pt; 
            font-weight: bold; 
            color: white; 
            border-radius: 1mm;
          }
          .priority { background: ${priorityColor}; }
          .label-type { 
            background: ${labelColors[labelType]}; 
            color: ${labelType === 'standard' ? '#000' : '#fff'};
          }
          .section { padding: 2mm 3mm; }
          .section-title { font-size: 8pt; font-weight: bold; margin-bottom: 1mm; }
          .sender-name { font-size: 9pt; }
          .sender-phone { font-size: 7pt; color: #666; }
          .divider { border-top: 0.3mm solid #ccc; margin: 2mm 3mm; }
          .recipient-name { font-size: 11pt; font-weight: bold; }
          .uac-box { 
            background: #f0f0f0; 
            padding: 2mm; 
            text-align: center; 
            font-size: 10pt; 
            font-weight: bold; 
            margin: 2mm 0;
          }
          .address { font-size: 8pt; }
          .qr-section { display: flex; justify-content: space-between; align-items: flex-start; }
          .qr-left { flex: 1; }
          .qr-code { width: 30mm; height: 30mm; }
          .tracking-section { 
            text-align: center; 
            padding: 2mm 3mm; 
            border-top: 0.3mm solid #ccc;
          }
          .tracking-label { font-size: 10pt; font-weight: bold; }
          .tracking-number { font-size: 12pt; font-weight: bold; margin: 1mm 0; }
          .order-number { font-size: 8pt; color: #666; }
          .package-info { font-size: 7pt; text-align: center; margin-top: 1mm; }
          .cod-box { 
            background: #ffd700; 
            text-align: center; 
            padding: 2mm; 
            font-weight: bold; 
            font-size: 9pt;
          }
        </style>
      </head>
      <body>
        <div class="label">
          <div class="header">
            <h1>${t('labels.governmentPostalService')}</h1>
            <h2>${t('labels.equatorialGuinea')}</h2>
          </div>
          
          <div class="badges">
            <span class="badge priority">${getPriorityLabel(order.priority_level || 3)}</span>
            <span class="badge label-type">${labelType.toUpperCase()}</span>
          </div>
          
          <div class="section">
            <div class="section-title">${t('labels.from')}:</div>
            <div class="sender-name">${order.sender_name || 'N/A'}</div>
            ${order.sender_phone ? `<div class="sender-phone">Tel: ${order.sender_phone}</div>` : ''}
          </div>
          
          <div class="divider"></div>
          
          <div class="section qr-section">
            <div class="qr-left">
              <div class="section-title">${t('labels.to')}:</div>
              <div class="recipient-name">${order.recipient_name || 'N/A'}</div>
              <div class="uac-box">${order.recipient_address_uac || 'N/A'}</div>
              ${order.recipient_address ? 
                `<div class="address">${order.recipient_address.street}, ${order.recipient_address.city}</div>` : ''}
              ${order.recipient_phone ? `<div class="sender-phone">Tel: ${order.recipient_phone}</div>` : ''}
            </div>
            ${qrDataUrl ? `<img class="qr-code" src="${qrDataUrl}" alt="QR Code" />` : ''}
          </div>
          
          <div class="tracking-section">
            <div class="tracking-label">${t('labels.trackingNumber')}</div>
            <div class="tracking-number">${s10TrackingNumber}</div>
            <div class="order-number">${t('labels.order')}: ${order.order_number}</div>
            <div class="package-info">${packageInfo.join(' | ')}</div>
          </div>
          
          ${order.cod_required && order.cod_amount ? 
            `<div class="cod-box">COD: ${order.cod_amount.toLocaleString()} XAF</div>` : ''}
        </div>
      </body>
      </html>
    `;
  };

  const generateLabelPDF = useCallback(async (
    order: DeliveryOrder,
    s10TrackingNumber: string,
    labelType: LabelType = 'standard'
  ): Promise<Blob> => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [100, 150]
    });

    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 100, 150, 'F');
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.rect(2, 2, 96, 146);

    // Header
    doc.setFillColor(0, 51, 102);
    doc.rect(2, 2, 96, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(t('labels.governmentPostalService'), 50, 10, { align: 'center' });
    doc.setFontSize(8);
    doc.text(t('labels.equatorialGuinea'), 50, 15, { align: 'center' });

    // Label type
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

    // Priority
    const priorityColors: [number, number, number][] = [
      [255, 0, 0], [255, 165, 0], [0, 128, 0], [0, 0, 255], [128, 128, 128]
    ];
    const priority = (order.priority_level || 3) - 1;
    doc.setFillColor(...priorityColors[priority]);
    doc.rect(5, 20, 25, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6);
    doc.text(getPriorityLabel(order.priority_level || 3), 17.5, 25, { align: 'center' });

    // Sender
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(`${t('labels.from')}:`, 5, 35);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(order.sender_name || 'N/A', 5, 41);
    if (order.sender_phone) {
      doc.setFontSize(7);
      doc.text(`Tel: ${order.sender_phone}`, 5, 46);
    }

    doc.setDrawColor(200, 200, 200);
    doc.line(5, 50, 95, 50);

    // Recipient
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(`${t('labels.to')}:`, 5, 57);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(order.recipient_name || 'N/A', 5, 64);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    doc.setFillColor(240, 240, 240);
    doc.rect(5, 67, 90, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(order.recipient_address_uac || 'N/A', 50, 73, { align: 'center' });

    if (order.recipient_address) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const addressLine = `${order.recipient_address.street}, ${order.recipient_address.city}`;
      doc.text(addressLine, 5, 82, { maxWidth: 60 });
    }

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

    doc.line(5, 110, 95, 110);

    // Tracking
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(t('labels.trackingNumber'), 50, 117, { align: 'center' });
    doc.setFontSize(12);
    doc.text(s10TrackingNumber, 50, 125, { align: 'center' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`${t('labels.order')}: ${order.order_number}`, 50, 131, { align: 'center' });

    // Package info
    doc.setFontSize(7);
    const packageInfo: string[] = [];
    if (order.package_type) packageInfo.push(getPackageTypeLabel(order.package_type));
    if (order.weight_grams) packageInfo.push(`${order.weight_grams}g`);
    if (order.requires_signature) packageInfo.push(t('labels.signatureRequired'));
    if (order.requires_id_verification) packageInfo.push(t('labels.idRequired'));
    doc.text(packageInfo.join(' | '), 50, 137, { align: 'center' });

    // COD
    if (order.cod_required && order.cod_amount) {
      doc.setFillColor(255, 215, 0);
      doc.rect(5, 140, 90, 8, 'F');
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(`COD: ${order.cod_amount.toLocaleString()} XAF`, 50, 145, { align: 'center' });
    }

    return doc.output('blob');
  }, [t]);

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

      // Generate HTML label for printing
      const labelHTML = await generateLabelHTML(order, trackingNumber);
      
      // Create hidden iframe
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);

      // Write HTML content to iframe
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) throw new Error('Could not access iframe document');
      
      iframeDoc.open();
      iframeDoc.write(labelHTML);
      iframeDoc.close();

      // Wait for images (QR code) to load, then print
      const images = iframeDoc.getElementsByTagName('img');
      const imageLoadPromises = Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        });
      });

      await Promise.all(imageLoadPromises);
      
      // Small delay to ensure rendering is complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Trigger print dialog
      iframe.contentWindow?.print();

      // Clean up after print dialog closes
      setTimeout(() => {
        if (iframe.parentNode) {
          document.body.removeChild(iframe);
        }
      }, 1000);

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
