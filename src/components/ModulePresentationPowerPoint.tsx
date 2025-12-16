import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Presentation, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PptxGenJS from 'pptxgenjs';
import { toast } from '@/hooks/use-toast';

// Color palette matching the web design
const COLORS = {
  primary: '1e40af', // Navy blue (government)
  secondary: '0d9488', // Teal
  destructive: 'dc2626', // Red
  green: '059669',
  blue: '2563eb',
  orange: 'ea580c',
  purple: '7c3aed',
  red700: 'b91c1c',
  blue700: '1d4ed8',
  white: 'ffffff',
  lightGray: 'f8fafc',
  darkGray: '374151',
  mutedGray: '6b7280',
};

export const ModulePresentationPowerPoint: React.FC = () => {
  const { t, i18n } = useTranslation('demo');
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePowerPoint = async () => {
    setIsGenerating(true);
    
    try {
      const pptx = new PptxGenJS();
      
      // Configure presentation properties
      pptx.author = 'ConEG Platform';
      pptx.company = 'Government of Equatorial Guinea';
      pptx.subject = t('modulePresentation.title');
      pptx.title = 'ConEG - National Digital Services Platform';

      // Helper function to add slide header
      const addSlideHeader = (slide: PptxGenJS.Slide, title: string, color: string = COLORS.primary) => {
        slide.addShape(pptx.ShapeType.rect, {
          x: 0, y: 0, w: '100%', h: 1.2,
          fill: { color },
          line: { type: 'none' }
        });
        slide.addText(title, {
          x: 0.5, y: 0.35, w: 9, h: 0.5,
          fontSize: 28, bold: true, color: COLORS.white
        });
      };

      // Helper for bullet list
      const addBulletList = (slide: PptxGenJS.Slide, items: string[], startY: number, color: string = COLORS.darkGray) => {
        items.forEach((item, index) => {
          slide.addText(`• ${item}`, {
            x: 0.5, y: startY + (index * 0.45), w: 9, h: 0.4,
            fontSize: 14, color,
            valign: 'top'
          });
        });
      };

      // ============================================
      // SLIDE 1: Title Slide
      // ============================================
      const slide1 = pptx.addSlide();
      slide1.background = { fill: COLORS.primary };
      
      slide1.addText('ConEG', {
        x: 0, y: 2, w: '100%', h: 1.2,
        fontSize: 64, bold: true, color: COLORS.white,
        align: 'center'
      });
      
      slide1.addText(t('modulePresentation.subtitle'), {
        x: 0, y: 3.2, w: '100%', h: 0.6,
        fontSize: 28, color: COLORS.white,
        align: 'center'
      });
      
      slide1.addText(t('modulePresentation.title'), {
        x: 0, y: 4.2, w: '100%', h: 0.5,
        fontSize: 18, color: 'e5e7eb',
        align: 'center', italic: true
      });

      // Three module icons
      const moduleIcons = ['📍', '🚨', '📦'];
      const moduleColors = [COLORS.green, COLORS.destructive, COLORS.blue];
      moduleIcons.forEach((icon, i) => {
        slide1.addShape(pptx.ShapeType.ellipse, {
          x: 2.8 + (i * 1.8), y: 5.2, w: 1, h: 1,
          fill: { color: moduleColors[i], transparency: 30 },
          line: { color: COLORS.white, width: 2 }
        });
        slide1.addText(icon, {
          x: 2.8 + (i * 1.8), y: 5.4, w: 1, h: 0.6,
          fontSize: 24, align: 'center'
        });
      });

      // ============================================
      // SLIDE 2: Platform Introduction
      // ============================================
      const slide2 = pptx.addSlide();
      slide2.background = { fill: COLORS.white };
      addSlideHeader(slide2, t('modulePresentation.introduction.title'));

      slide2.addText(t('modulePresentation.introduction.description'), {
        x: 0.5, y: 1.5, w: 9, h: 1.2,
        fontSize: 16, color: COLORS.darkGray,
        valign: 'top'
      });

      // Three module cards
      const moduleData = [
        { name: t('modulePresentation.modules.digitalAddress.name'), icon: '📍', color: COLORS.primary },
        { name: t('modulePresentation.modules.emergency.name'), icon: '🚨', color: COLORS.destructive },
        { name: t('modulePresentation.modules.postal.name'), icon: '📦', color: COLORS.blue },
      ];

      moduleData.forEach((mod, i) => {
        slide2.addShape(pptx.ShapeType.rect, {
          x: 0.5 + (i * 3.1), y: 3, w: 2.9, h: 1.5,
          fill: { color: COLORS.lightGray },
          line: { color: mod.color, width: 3 }
        });
        slide2.addText(mod.icon, {
          x: 0.5 + (i * 3.1), y: 3.1, w: 2.9, h: 0.6,
          fontSize: 28, align: 'center'
        });
        slide2.addText(mod.name, {
          x: 0.5 + (i * 3.1), y: 3.8, w: 2.9, h: 0.6,
          fontSize: 12, bold: true, color: mod.color,
          align: 'center'
        });
      });

      // ============================================
      // SLIDES 3-5: Digital Address Module
      // ============================================
      // Slide 3: Digital Address - Title & Purpose
      const slide3 = pptx.addSlide();
      slide3.background = { fill: COLORS.white };
      addSlideHeader(slide3, t('modulePresentation.modules.digitalAddress.name'), COLORS.primary);

      slide3.addText(t('modulePresentation.purposeLabel'), {
        x: 0.5, y: 1.5, w: 9, h: 0.4,
        fontSize: 18, bold: true, color: COLORS.primary
      });

      slide3.addText(t('modulePresentation.modules.digitalAddress.purpose'), {
        x: 0.5, y: 2, w: 9, h: 1.2,
        fontSize: 14, color: COLORS.darkGray,
        valign: 'top'
      });

      slide3.addText(t('modulePresentation.functionalitiesLabel'), {
        x: 0.5, y: 3.4, w: 9, h: 0.4,
        fontSize: 18, bold: true, color: COLORS.primary
      });

      const addressFuncs = t('modulePresentation.modules.digitalAddress.functionalities', { returnObjects: true }) as string[];
      addBulletList(slide3, addressFuncs.slice(0, 7), 3.9);

      // Slide 4: Digital Address - Scenarios
      const slide4 = pptx.addSlide();
      slide4.background = { fill: COLORS.lightGray };
      addSlideHeader(slide4, `${t('modulePresentation.modules.digitalAddress.name')} - ${t('modulePresentation.scenariosLabel')}`, COLORS.primary);

      const addressScenarios = t('modulePresentation.modules.digitalAddress.scenarios', { returnObjects: true }) as Array<{ title: string; description: string }>;
      addressScenarios.forEach((scenario, i) => {
        slide4.addShape(pptx.ShapeType.rect, {
          x: 0.5, y: 1.5 + (i * 1.6), w: 9, h: 1.4,
          fill: { color: COLORS.white },
          line: { color: COLORS.primary, width: 1 }
        });
        slide4.addShape(pptx.ShapeType.ellipse, {
          x: 0.6, y: 1.6 + (i * 1.6), w: 0.5, h: 0.5,
          fill: { color: COLORS.primary },
          line: { type: 'none' }
        });
        slide4.addText(String(i + 1), {
          x: 0.6, y: 1.7 + (i * 1.6), w: 0.5, h: 0.3,
          fontSize: 14, bold: true, color: COLORS.white, align: 'center'
        });
        slide4.addText(scenario.title, {
          x: 1.3, y: 1.6 + (i * 1.6), w: 8, h: 0.4,
          fontSize: 14, bold: true, color: COLORS.primary
        });
        slide4.addText(scenario.description, {
          x: 1.3, y: 2 + (i * 1.6), w: 8, h: 0.8,
          fontSize: 11, color: COLORS.darkGray
        });
      });

      // Slide 5: Digital Address - Benefits
      const slide5 = pptx.addSlide();
      slide5.background = { fill: COLORS.white };
      addSlideHeader(slide5, `${t('modulePresentation.modules.digitalAddress.name')} - ${t('modulePresentation.benefitsLabel')}`, COLORS.primary);

      const addressBenefits = t('modulePresentation.modules.digitalAddress.benefits', { returnObjects: true }) as string[];
      addressBenefits.forEach((benefit, i) => {
        slide5.addText('✓', {
          x: 0.5, y: 1.6 + (i * 0.7), w: 0.4, h: 0.4,
          fontSize: 18, color: COLORS.green
        });
        slide5.addText(benefit, {
          x: 1, y: 1.6 + (i * 0.7), w: 8.5, h: 0.6,
          fontSize: 16, color: COLORS.darkGray
        });
      });

      // ============================================
      // SLIDES 6-8: Emergency Module
      // ============================================
      // Slide 6: Emergency - Title & Purpose
      const slide6 = pptx.addSlide();
      slide6.background = { fill: COLORS.white };
      addSlideHeader(slide6, t('modulePresentation.modules.emergency.name'), COLORS.destructive);

      slide6.addText(t('modulePresentation.purposeLabel'), {
        x: 0.5, y: 1.5, w: 9, h: 0.4,
        fontSize: 18, bold: true, color: COLORS.destructive
      });

      slide6.addText(t('modulePresentation.modules.emergency.purpose'), {
        x: 0.5, y: 2, w: 9, h: 1.2,
        fontSize: 14, color: COLORS.darkGray,
        valign: 'top'
      });

      slide6.addText(t('modulePresentation.functionalitiesLabel'), {
        x: 0.5, y: 3.4, w: 9, h: 0.4,
        fontSize: 18, bold: true, color: COLORS.destructive
      });

      const emergencyFuncs = t('modulePresentation.modules.emergency.functionalities', { returnObjects: true }) as string[];
      addBulletList(slide6, emergencyFuncs.slice(0, 7), 3.9);

      // Slide 7: Emergency - Scenarios
      const slide7 = pptx.addSlide();
      slide7.background = { fill: COLORS.lightGray };
      addSlideHeader(slide7, `${t('modulePresentation.modules.emergency.name')} - ${t('modulePresentation.scenariosLabel')}`, COLORS.destructive);

      const emergencyScenarios = t('modulePresentation.modules.emergency.scenarios', { returnObjects: true }) as Array<{ title: string; description: string }>;
      emergencyScenarios.forEach((scenario, i) => {
        slide7.addShape(pptx.ShapeType.rect, {
          x: 0.5, y: 1.5 + (i * 1.6), w: 9, h: 1.4,
          fill: { color: COLORS.white },
          line: { color: COLORS.destructive, width: 1 }
        });
        slide7.addShape(pptx.ShapeType.ellipse, {
          x: 0.6, y: 1.6 + (i * 1.6), w: 0.5, h: 0.5,
          fill: { color: COLORS.destructive },
          line: { type: 'none' }
        });
        slide7.addText(String(i + 1), {
          x: 0.6, y: 1.7 + (i * 1.6), w: 0.5, h: 0.3,
          fontSize: 14, bold: true, color: COLORS.white, align: 'center'
        });
        slide7.addText(scenario.title, {
          x: 1.3, y: 1.6 + (i * 1.6), w: 8, h: 0.4,
          fontSize: 14, bold: true, color: COLORS.destructive
        });
        slide7.addText(scenario.description, {
          x: 1.3, y: 2 + (i * 1.6), w: 8, h: 0.8,
          fontSize: 11, color: COLORS.darkGray
        });
      });

      // Slide 8: Emergency - Benefits
      const slide8 = pptx.addSlide();
      slide8.background = { fill: COLORS.white };
      addSlideHeader(slide8, `${t('modulePresentation.modules.emergency.name')} - ${t('modulePresentation.benefitsLabel')}`, COLORS.destructive);

      const emergencyBenefits = t('modulePresentation.modules.emergency.benefits', { returnObjects: true }) as string[];
      emergencyBenefits.forEach((benefit, i) => {
        slide8.addText('✓', {
          x: 0.5, y: 1.6 + (i * 0.7), w: 0.4, h: 0.4,
          fontSize: 18, color: COLORS.green
        });
        slide8.addText(benefit, {
          x: 1, y: 1.6 + (i * 0.7), w: 8.5, h: 0.6,
          fontSize: 16, color: COLORS.darkGray
        });
      });

      // ============================================
      // SLIDES 9-11: Postal Module
      // ============================================
      // Slide 9: Postal - Title & Purpose
      const slide9 = pptx.addSlide();
      slide9.background = { fill: COLORS.white };
      addSlideHeader(slide9, t('modulePresentation.modules.postal.name'), COLORS.blue);

      slide9.addText(t('modulePresentation.purposeLabel'), {
        x: 0.5, y: 1.5, w: 9, h: 0.4,
        fontSize: 18, bold: true, color: COLORS.blue
      });

      slide9.addText(t('modulePresentation.modules.postal.purpose'), {
        x: 0.5, y: 2, w: 9, h: 1.2,
        fontSize: 14, color: COLORS.darkGray,
        valign: 'top'
      });

      slide9.addText(t('modulePresentation.functionalitiesLabel'), {
        x: 0.5, y: 3.4, w: 9, h: 0.4,
        fontSize: 18, bold: true, color: COLORS.blue
      });

      const postalFuncs = t('modulePresentation.modules.postal.functionalities', { returnObjects: true }) as string[];
      addBulletList(slide9, postalFuncs.slice(0, 7), 3.9);

      // Slide 10: Postal - Scenarios
      const slide10 = pptx.addSlide();
      slide10.background = { fill: COLORS.lightGray };
      addSlideHeader(slide10, `${t('modulePresentation.modules.postal.name')} - ${t('modulePresentation.scenariosLabel')}`, COLORS.blue);

      const postalScenarios = t('modulePresentation.modules.postal.scenarios', { returnObjects: true }) as Array<{ title: string; description: string }>;
      postalScenarios.forEach((scenario, i) => {
        slide10.addShape(pptx.ShapeType.rect, {
          x: 0.5, y: 1.5 + (i * 1.6), w: 9, h: 1.4,
          fill: { color: COLORS.white },
          line: { color: COLORS.blue, width: 1 }
        });
        slide10.addShape(pptx.ShapeType.ellipse, {
          x: 0.6, y: 1.6 + (i * 1.6), w: 0.5, h: 0.5,
          fill: { color: COLORS.blue },
          line: { type: 'none' }
        });
        slide10.addText(String(i + 1), {
          x: 0.6, y: 1.7 + (i * 1.6), w: 0.5, h: 0.3,
          fontSize: 14, bold: true, color: COLORS.white, align: 'center'
        });
        slide10.addText(scenario.title, {
          x: 1.3, y: 1.6 + (i * 1.6), w: 8, h: 0.4,
          fontSize: 14, bold: true, color: COLORS.blue
        });
        slide10.addText(scenario.description, {
          x: 1.3, y: 2 + (i * 1.6), w: 8, h: 0.8,
          fontSize: 11, color: COLORS.darkGray
        });
      });

      // Slide 11: Postal - Benefits
      const slide11 = pptx.addSlide();
      slide11.background = { fill: COLORS.white };
      addSlideHeader(slide11, `${t('modulePresentation.modules.postal.name')} - ${t('modulePresentation.benefitsLabel')}`, COLORS.blue);

      const postalBenefits = t('modulePresentation.modules.postal.benefits', { returnObjects: true }) as string[];
      postalBenefits.forEach((benefit, i) => {
        slide11.addText('✓', {
          x: 0.5, y: 1.6 + (i * 0.7), w: 0.4, h: 0.4,
          fontSize: 18, color: COLORS.green
        });
        slide11.addText(benefit, {
          x: 1, y: 1.6 + (i * 0.7), w: 8.5, h: 0.6,
          fontSize: 16, color: COLORS.darkGray
        });
      });

      // ============================================
      // SLIDE 12: Cross-Module Summary
      // ============================================
      const slide12 = pptx.addSlide();
      slide12.background = { fill: COLORS.white };
      addSlideHeader(slide12, t('modulePresentation.summary.title'));

      slide12.addText(t('modulePresentation.summary.subtitle'), {
        x: 0.5, y: 1.4, w: 9, h: 0.4,
        fontSize: 14, color: COLORS.mutedGray, italic: true
      });

      // Table header
      const headers = [
        t('modulePresentation.summary.headers.module'),
        t('modulePresentation.summary.headers.primaryBenefit'),
        t('modulePresentation.summary.headers.keyUsers')
      ];
      headers.forEach((header, i) => {
        slide12.addShape(pptx.ShapeType.rect, {
          x: 0.5 + (i * 3), y: 2, w: 3, h: 0.5,
          fill: { color: COLORS.primary },
          line: { type: 'none' }
        });
        slide12.addText(header, {
          x: 0.5 + (i * 3), y: 2.1, w: 3, h: 0.4,
          fontSize: 12, bold: true, color: COLORS.white, align: 'center'
        });
      });

      // Table rows
      const summaryRows = [
        {
          module: `📍 ${t('modulePresentation.modules.digitalAddress.name')}`,
          benefit: t('modulePresentation.summary.digitalAddress.benefit'),
          users: t('modulePresentation.summary.digitalAddress.users'),
          color: COLORS.primary
        },
        {
          module: `🚨 ${t('modulePresentation.modules.emergency.name')}`,
          benefit: t('modulePresentation.summary.emergency.benefit'),
          users: t('modulePresentation.summary.emergency.users'),
          color: COLORS.destructive
        },
        {
          module: `📦 ${t('modulePresentation.modules.postal.name')}`,
          benefit: t('modulePresentation.summary.postal.benefit'),
          users: t('modulePresentation.summary.postal.users'),
          color: COLORS.blue
        }
      ];

      summaryRows.forEach((row, i) => {
        const y = 2.6 + (i * 1);
        slide12.addShape(pptx.ShapeType.rect, {
          x: 0.5, y, w: 9, h: 0.9,
          fill: { color: i % 2 === 0 ? COLORS.lightGray : COLORS.white },
          line: { color: 'e5e7eb', width: 1 }
        });
        slide12.addText(row.module, {
          x: 0.6, y: y + 0.25, w: 2.8, h: 0.4,
          fontSize: 11, bold: true, color: row.color
        });
        slide12.addText(row.benefit, {
          x: 3.6, y: y + 0.15, w: 2.8, h: 0.6,
          fontSize: 10, color: COLORS.darkGray
        });
        slide12.addText(row.users, {
          x: 6.6, y: y + 0.25, w: 2.8, h: 0.4,
          fontSize: 10, color: COLORS.mutedGray
        });
      });

      // ============================================
      // SLIDE 13: National Impact - Introduction
      // ============================================
      const slide13 = pptx.addSlide();
      slide13.background = { fill: COLORS.white };
      addSlideHeader(slide13, t('modulePresentation.nationalImpact.title'), COLORS.green);

      slide13.addText(t('modulePresentation.nationalImpact.subtitle'), {
        x: 0.5, y: 1.4, w: 9, h: 0.4,
        fontSize: 14, color: COLORS.mutedGray, italic: true
      });

      slide13.addShape(pptx.ShapeType.rect, {
        x: 0.5, y: 2, w: 9, h: 2.5,
        fill: { color: COLORS.lightGray },
        line: { color: COLORS.green, width: 2 }
      });

      slide13.addText(t('modulePresentation.nationalImpact.context'), {
        x: 0.7, y: 2.2, w: 8.6, h: 2.2,
        fontSize: 14, color: COLORS.darkGray,
        valign: 'top'
      });

      // Impact areas preview
      const impactAreas = [
        { title: t('modulePresentation.nationalImpact.economic.title'), icon: '💼', color: COLORS.green },
        { title: t('modulePresentation.nationalImpact.social.title'), icon: '❤️', color: COLORS.blue },
        { title: t('modulePresentation.nationalImpact.government.title'), icon: '🏛️', color: COLORS.primary }
      ];

      impactAreas.forEach((area, i) => {
        slide13.addShape(pptx.ShapeType.rect, {
          x: 0.5 + (i * 3.1), y: 5, w: 2.9, h: 1,
          fill: { color: area.color, transparency: 85 },
          line: { color: area.color, width: 2 }
        });
        slide13.addText(`${area.icon} ${area.title}`, {
          x: 0.5 + (i * 3.1), y: 5.3, w: 2.9, h: 0.4,
          fontSize: 12, bold: true, color: area.color, align: 'center'
        });
      });

      // ============================================
      // SLIDE 14: Economic Benefits
      // ============================================
      const slide14 = pptx.addSlide();
      slide14.background = { fill: COLORS.white };
      addSlideHeader(slide14, `💼 ${t('modulePresentation.nationalImpact.economic.title')}`, COLORS.green);

      const economicBenefits = t('modulePresentation.nationalImpact.economic.benefits', { returnObjects: true }) as string[];
      economicBenefits.forEach((benefit, i) => {
        slide14.addText('✓', {
          x: 0.5, y: 1.5 + (i * 0.75), w: 0.4, h: 0.4,
          fontSize: 16, color: COLORS.green
        });
        slide14.addText(benefit, {
          x: 1, y: 1.5 + (i * 0.75), w: 8.5, h: 0.7,
          fontSize: 13, color: COLORS.darkGray
        });
      });

      // ============================================
      // SLIDE 15: Social Benefits
      // ============================================
      const slide15 = pptx.addSlide();
      slide15.background = { fill: COLORS.white };
      addSlideHeader(slide15, `❤️ ${t('modulePresentation.nationalImpact.social.title')}`, COLORS.blue);

      const socialBenefits = t('modulePresentation.nationalImpact.social.benefits', { returnObjects: true }) as string[];
      socialBenefits.forEach((benefit, i) => {
        slide15.addText('✓', {
          x: 0.5, y: 1.5 + (i * 0.75), w: 0.4, h: 0.4,
          fontSize: 16, color: COLORS.blue
        });
        slide15.addText(benefit, {
          x: 1, y: 1.5 + (i * 0.75), w: 8.5, h: 0.7,
          fontSize: 13, color: COLORS.darkGray
        });
      });

      // ============================================
      // SLIDE 16: Government Benefits
      // ============================================
      const slide16 = pptx.addSlide();
      slide16.background = { fill: COLORS.white };
      addSlideHeader(slide16, `🏛️ ${t('modulePresentation.nationalImpact.government.title')}`, COLORS.primary);

      const govBenefits = t('modulePresentation.nationalImpact.government.benefits', { returnObjects: true }) as string[];
      govBenefits.forEach((benefit, i) => {
        slide16.addText('✓', {
          x: 0.5, y: 1.5 + (i * 0.75), w: 0.4, h: 0.4,
          fontSize: 16, color: COLORS.primary
        });
        slide16.addText(benefit, {
          x: 1, y: 1.5 + (i * 0.75), w: 8.5, h: 0.7,
          fontSize: 13, color: COLORS.darkGray
        });
      });

      // ============================================
      // SLIDE 17: Projected Impact Statistics
      // ============================================
      const slide17 = pptx.addSlide();
      slide17.background = { fill: COLORS.lightGray };
      addSlideHeader(slide17, t('modulePresentation.nationalImpact.potentialImpact.title'), COLORS.green);

      const stats = t('modulePresentation.nationalImpact.potentialImpact.stats', { returnObjects: true }) as Array<{ label: string; value: string }>;
      const statColors = [COLORS.destructive, COLORS.green, COLORS.blue, COLORS.primary];

      stats.forEach((stat, i) => {
        const x = 0.5 + (i * 2.35);
        
        // Circle background
        slide17.addShape(pptx.ShapeType.ellipse, {
          x: x + 0.4, y: 2, w: 1.6, h: 1.6,
          fill: { color: statColors[i], transparency: 80 },
          line: { color: statColors[i], width: 4 }
        });

        // Value
        slide17.addText(stat.value, {
          x: x + 0.4, y: 2.5, w: 1.6, h: 0.6,
          fontSize: 24, bold: true, color: statColors[i], align: 'center'
        });

        // Label
        slide17.addText(stat.label, {
          x: x, y: 3.8, w: 2.35, h: 0.8,
          fontSize: 11, color: COLORS.darkGray, align: 'center'
        });
      });

      // Closing statement
      slide17.addShape(pptx.ShapeType.rect, {
        x: 0.5, y: 5, w: 9, h: 1,
        fill: { color: COLORS.white },
        line: { color: COLORS.green, width: 1 }
      });
      slide17.addText(t('modulePresentation.nationalImpact.closing'), {
        x: 0.7, y: 5.1, w: 8.6, h: 0.8,
        fontSize: 11, color: COLORS.darkGray, align: 'center'
      });

      // ============================================
      // SLIDE 18: National Security - Introduction
      // ============================================
      const slide18 = pptx.addSlide();
      slide18.background = { fill: COLORS.white };
      addSlideHeader(slide18, `🛡️ ${t('modulePresentation.nationalSecurity.title')}`, COLORS.red700);

      slide18.addText(t('modulePresentation.nationalSecurity.subtitle'), {
        x: 0.5, y: 1.4, w: 9, h: 0.4,
        fontSize: 14, color: COLORS.mutedGray, italic: true
      });

      slide18.addShape(pptx.ShapeType.rect, {
        x: 0.5, y: 2, w: 9, h: 1.8,
        fill: { color: 'fef2f2' },
        line: { color: COLORS.red700, width: 2 }
      });

      slide18.addText(t('modulePresentation.nationalSecurity.context'), {
        x: 0.7, y: 2.2, w: 8.6, h: 1.5,
        fontSize: 13, color: COLORS.darkGray,
        valign: 'top'
      });

      // Security areas preview
      const securityAreas = [
        { title: t('modulePresentation.nationalSecurity.border.title'), icon: '🎯', color: COLORS.red700 },
        { title: t('modulePresentation.nationalSecurity.lawEnforcement.title'), icon: '👁️', color: COLORS.blue700 },
        { title: t('modulePresentation.nationalSecurity.crisis.title'), icon: '📻', color: COLORS.orange },
        { title: t('modulePresentation.nationalSecurity.dataSecurity.title'), icon: '🔒', color: COLORS.purple }
      ];

      securityAreas.forEach((area, i) => {
        slide18.addShape(pptx.ShapeType.rect, {
          x: 0.5 + (i * 2.35), y: 4.2, w: 2.2, h: 1.2,
          fill: { color: area.color, transparency: 85 },
          line: { color: area.color, width: 2 }
        });
        slide18.addText(area.icon, {
          x: 0.5 + (i * 2.35), y: 4.3, w: 2.2, h: 0.5,
          fontSize: 20, align: 'center'
        });
        slide18.addText(area.title, {
          x: 0.5 + (i * 2.35), y: 4.8, w: 2.2, h: 0.5,
          fontSize: 9, bold: true, color: area.color, align: 'center'
        });
      });

      // ============================================
      // SLIDE 19: Border & Immigration Security
      // ============================================
      const slide19 = pptx.addSlide();
      slide19.background = { fill: COLORS.white };
      addSlideHeader(slide19, `🎯 ${t('modulePresentation.nationalSecurity.border.title')}`, COLORS.red700);

      const borderBenefits = t('modulePresentation.nationalSecurity.border.benefits', { returnObjects: true }) as string[];
      borderBenefits.forEach((benefit, i) => {
        slide19.addText('✓', {
          x: 0.5, y: 1.6 + (i * 1), w: 0.4, h: 0.4,
          fontSize: 18, color: COLORS.red700
        });
        slide19.addText(benefit, {
          x: 1, y: 1.6 + (i * 1), w: 8.5, h: 0.9,
          fontSize: 14, color: COLORS.darkGray
        });
      });

      // ============================================
      // SLIDE 20: Law Enforcement
      // ============================================
      const slide20 = pptx.addSlide();
      slide20.background = { fill: COLORS.white };
      addSlideHeader(slide20, `👁️ ${t('modulePresentation.nationalSecurity.lawEnforcement.title')}`, COLORS.blue700);

      const lawBenefits = t('modulePresentation.nationalSecurity.lawEnforcement.benefits', { returnObjects: true }) as string[];
      lawBenefits.forEach((benefit, i) => {
        slide20.addText('✓', {
          x: 0.5, y: 1.6 + (i * 0.85), w: 0.4, h: 0.4,
          fontSize: 18, color: COLORS.blue700
        });
        slide20.addText(benefit, {
          x: 1, y: 1.6 + (i * 0.85), w: 8.5, h: 0.8,
          fontSize: 14, color: COLORS.darkGray
        });
      });

      // ============================================
      // SLIDE 21: Crisis & Disaster Management
      // ============================================
      const slide21 = pptx.addSlide();
      slide21.background = { fill: COLORS.white };
      addSlideHeader(slide21, `📻 ${t('modulePresentation.nationalSecurity.crisis.title')}`, COLORS.orange);

      const crisisBenefits = t('modulePresentation.nationalSecurity.crisis.benefits', { returnObjects: true }) as string[];
      crisisBenefits.forEach((benefit, i) => {
        slide21.addText('✓', {
          x: 0.5, y: 1.6 + (i * 1), w: 0.4, h: 0.4,
          fontSize: 18, color: COLORS.orange
        });
        slide21.addText(benefit, {
          x: 1, y: 1.6 + (i * 1), w: 8.5, h: 0.9,
          fontSize: 14, color: COLORS.darkGray
        });
      });

      // ============================================
      // SLIDE 22: Data Sovereignty & Protection
      // ============================================
      const slide22 = pptx.addSlide();
      slide22.background = { fill: COLORS.white };
      addSlideHeader(slide22, `🔒 ${t('modulePresentation.nationalSecurity.dataSecurity.title')}`, COLORS.purple);

      const dataBenefits = t('modulePresentation.nationalSecurity.dataSecurity.benefits', { returnObjects: true }) as string[];
      dataBenefits.forEach((benefit, i) => {
        slide22.addText('✓', {
          x: 0.5, y: 1.6 + (i * 1), w: 0.4, h: 0.4,
          fontSize: 18, color: COLORS.purple
        });
        slide22.addText(benefit, {
          x: 1, y: 1.6 + (i * 1), w: 8.5, h: 0.9,
          fontSize: 14, color: COLORS.darkGray
        });
      });

      // ============================================
      // SLIDE 23: Strategic Security Value
      // ============================================
      const slide23 = pptx.addSlide();
      slide23.background = { fill: 'fef2f2' };
      addSlideHeader(slide23, t('modulePresentation.nationalSecurity.strategicValue.title'), COLORS.red700);

      const strategicPoints = t('modulePresentation.nationalSecurity.strategicValue.points', { returnObjects: true }) as Array<{ title: string; description: string }>;
      const pointColors = [COLORS.red700, COLORS.blue700, COLORS.primary];

      strategicPoints.forEach((point, i) => {
        slide23.addShape(pptx.ShapeType.rect, {
          x: 0.5 + (i * 3.1), y: 1.8, w: 2.9, h: 2.8,
          fill: { color: COLORS.white },
          line: { color: pointColors[i], width: 3 }
        });
        slide23.addShape(pptx.ShapeType.ellipse, {
          x: 1.1 + (i * 3.1), y: 2, w: 1.7, h: 1.7,
          fill: { color: pointColors[i], transparency: 80 },
          line: { color: pointColors[i], width: 2 }
        });
        slide23.addText(String(i + 1), {
          x: 1.1 + (i * 3.1), y: 2.5, w: 1.7, h: 0.7,
          fontSize: 28, bold: true, color: pointColors[i], align: 'center'
        });
        slide23.addText(point.title, {
          x: 0.6 + (i * 3.1), y: 3.8, w: 2.7, h: 0.4,
          fontSize: 12, bold: true, color: pointColors[i], align: 'center'
        });
        slide23.addText(point.description, {
          x: 0.6 + (i * 3.1), y: 4.2, w: 2.7, h: 0.6,
          fontSize: 10, color: COLORS.darkGray, align: 'center'
        });
      });

      // Security closing
      slide23.addShape(pptx.ShapeType.rect, {
        x: 0.5, y: 5.2, w: 9, h: 1,
        fill: { color: COLORS.red700 },
        line: { type: 'none' }
      });
      slide23.addText(t('modulePresentation.nationalSecurity.closing'), {
        x: 0.7, y: 5.3, w: 8.6, h: 0.8,
        fontSize: 11, color: COLORS.white, align: 'center'
      });

      // ============================================
      // SLIDE 24: Closing
      // ============================================
      const slide24 = pptx.addSlide();
      slide24.background = { fill: COLORS.primary };

      slide24.addText('ConEG', {
        x: 0, y: 1.5, w: '100%', h: 1,
        fontSize: 56, bold: true, color: COLORS.white, align: 'center'
      });

      slide24.addText(t('modulePresentation.footer.closing'), {
        x: 0.5, y: 3, w: 9, h: 1,
        fontSize: 16, color: 'e5e7eb', align: 'center'
      });

      slide24.addText(t('modulePresentation.footer.tagline'), {
        x: 0.5, y: 4.5, w: 9, h: 0.6,
        fontSize: 20, bold: true, color: COLORS.white, align: 'center'
      });

      // Three module icons at bottom
      moduleIcons.forEach((icon, i) => {
        slide24.addText(icon, {
          x: 3.5 + (i * 1.2), y: 5.5, w: 1, h: 0.6,
          fontSize: 24, align: 'center'
        });
      });

      // ============================================
      // Generate and download
      // ============================================
      const langCode = i18n.language.toUpperCase();
      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `ConEG-Module-Presentation-${langCode}-${dateStr}.pptx`;
      
      await pptx.writeFile({ fileName });
      
      toast({
        title: t('modulePresentation.exportSuccess'),
        description: `${fileName}`,
      });
    } catch (error) {
      console.error('PowerPoint generation error:', error);
      toast({
        title: t('modulePresentation.exportError'),
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      variant="secondary" 
      size="sm" 
      onClick={generatePowerPoint}
      disabled={isGenerating}
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
      ) : (
        <Presentation className="h-4 w-4 mr-1" />
      )}
      {isGenerating ? 'Generating...' : 'PowerPoint'}
    </Button>
  );
};

export default ModulePresentationPowerPoint;
