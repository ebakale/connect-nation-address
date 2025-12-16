import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Download, 
  Printer, 
  Globe, 
  MapPin, 
  AlertTriangle, 
  Package,
  CheckCircle,
  Users,
  Building,
  Shield,
  Truck,
  Phone,
  TrendingUp,
  Heart,
  Landmark,
  Briefcase,
  GraduationCap,
  Home,
  Eye,
  Lock,
  Target,
  Radio
} from 'lucide-react';
import jsPDF from 'jspdf';
import { toast } from '@/hooks/use-toast';
import { ModulePresentationPowerPoint } from './ModulePresentationPowerPoint';

export const ModulePresentationDocument: React.FC = () => {
  const { t, i18n } = useTranslation('demo');
  const [activeModule, setActiveModule] = useState('digital-address');

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let yPos = 20;

      // Title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('ConEG - National Digital Services Platform', pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text(t('modulePresentation.subtitle'), pageWidth / 2, yPos, { align: 'center' });
      yPos += 20;

      // Module 1: Digital Address
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('1. ' + t('modulePresentation.modules.digitalAddress.name'), margin, yPos);
      yPos += 8;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(t('modulePresentation.purposeLabel'), margin, yPos);
      yPos += 6;
      
      doc.setFont('helvetica', 'normal');
      const purpose1 = doc.splitTextToSize(t('modulePresentation.modules.digitalAddress.purpose'), pageWidth - 2 * margin);
      doc.text(purpose1, margin, yPos);
      yPos += purpose1.length * 5 + 10;

      // Add more modules...
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('2. ' + t('modulePresentation.modules.emergency.name'), margin, yPos);
      yPos += 8;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(t('modulePresentation.purposeLabel'), margin, yPos);
      yPos += 6;
      
      doc.setFont('helvetica', 'normal');
      const purpose2 = doc.splitTextToSize(t('modulePresentation.modules.emergency.purpose'), pageWidth - 2 * margin);
      doc.text(purpose2, margin, yPos);
      yPos += purpose2.length * 5 + 10;

      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('3. ' + t('modulePresentation.modules.postal.name'), margin, yPos);
      yPos += 8;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(t('modulePresentation.purposeLabel'), margin, yPos);
      yPos += 6;
      
      doc.setFont('helvetica', 'normal');
      const purpose3 = doc.splitTextToSize(t('modulePresentation.modules.postal.purpose'), pageWidth - 2 * margin);
      doc.text(purpose3, margin, yPos);

      doc.save('ConEG-Module-Presentation.pdf');
      toast({
        title: t('modulePresentation.exportSuccess'),
        description: t('modulePresentation.exportSuccessDesc'),
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: t('modulePresentation.exportError'),
        variant: 'destructive',
      });
    }
  };

  const modules = [
    {
      id: 'digital-address',
      icon: MapPin,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      id: 'emergency',
      icon: AlertTriangle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
    {
      id: 'postal',
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 print:bg-white">
      {/* Header */}
      <div className="bg-gov-header text-white py-8 print:py-4 print:bg-primary">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                <FileText className="h-8 w-8" />
                {t('modulePresentation.title')}
              </h1>
              <p className="text-lg opacity-90 mt-2">
                {t('modulePresentation.subtitle')}
              </p>
            </div>
            
            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 print:hidden">
              {/* Language Selector */}
              <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
                <Button
                  variant={i18n.language === 'en' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => handleLanguageChange('en')}
                  className="text-xs"
                >
                  EN
                </Button>
                <Button
                  variant={i18n.language === 'es' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => handleLanguageChange('es')}
                  className="text-xs"
                >
                  ES
                </Button>
                <Button
                  variant={i18n.language === 'fr' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => handleLanguageChange('fr')}
                  className="text-xs"
                >
                  FR
                </Button>
              </div>
              
              <Button variant="secondary" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-1" />
                {t('print')}
              </Button>
              <Button variant="secondary" size="sm" onClick={handleExportPDF}>
                <Download className="h-4 w-4 mr-1" />
                PDF
              </Button>
              <ModulePresentationPowerPoint />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Introduction */}
        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              {t('modulePresentation.introduction.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p className="text-muted-foreground leading-relaxed">
              {t('modulePresentation.introduction.description')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {modules.map((module) => (
                <div key={module.id} className={`flex items-center gap-3 p-3 rounded-lg ${module.bgColor}`}>
                  <module.icon className={`h-6 w-6 ${module.color}`} />
                  <span className="font-medium">
                    {t(`modulePresentation.modules.${module.id === 'digital-address' ? 'digitalAddress' : module.id}.name`)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Module Tabs */}
        <Tabs value={activeModule} onValueChange={setActiveModule} className="print:hidden">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="digital-address" className="flex items-center gap-2 py-3">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">{t('modulePresentation.modules.digitalAddress.name')}</span>
              <span className="sm:hidden">{t('modulePresentation.tabLabels.address')}</span>
            </TabsTrigger>
            <TabsTrigger value="emergency" className="flex items-center gap-2 py-3">
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">{t('modulePresentation.modules.emergency.name')}</span>
              <span className="sm:hidden">{t('modulePresentation.tabLabels.emergency')}</span>
            </TabsTrigger>
            <TabsTrigger value="postal" className="flex items-center gap-2 py-3">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">{t('modulePresentation.modules.postal.name')}</span>
              <span className="sm:hidden">{t('modulePresentation.tabLabels.postal')}</span>
            </TabsTrigger>
          </TabsList>

          {/* Digital Address Module */}
          <TabsContent value="digital-address" className="mt-6">
            <ModuleSection
              icon={MapPin}
              color="text-primary"
              bgColor="bg-primary/10"
              name={t('modulePresentation.modules.digitalAddress.name')}
              purpose={t('modulePresentation.modules.digitalAddress.purpose')}
              functionalities={t('modulePresentation.modules.digitalAddress.functionalities', { returnObjects: true }) as string[]}
              scenarios={t('modulePresentation.modules.digitalAddress.scenarios', { returnObjects: true }) as Array<{ title: string; description: string }>}
              benefits={t('modulePresentation.modules.digitalAddress.benefits', { returnObjects: true }) as string[]}
              t={t}
            />
          </TabsContent>

          {/* Emergency Module */}
          <TabsContent value="emergency" className="mt-6">
            <ModuleSection
              icon={AlertTriangle}
              color="text-destructive"
              bgColor="bg-destructive/10"
              name={t('modulePresentation.modules.emergency.name')}
              purpose={t('modulePresentation.modules.emergency.purpose')}
              functionalities={t('modulePresentation.modules.emergency.functionalities', { returnObjects: true }) as string[]}
              scenarios={t('modulePresentation.modules.emergency.scenarios', { returnObjects: true }) as Array<{ title: string; description: string }>}
              benefits={t('modulePresentation.modules.emergency.benefits', { returnObjects: true }) as string[]}
              t={t}
            />
          </TabsContent>

          {/* Postal Module */}
          <TabsContent value="postal" className="mt-6">
            <ModuleSection
              icon={Package}
              color="text-blue-600"
              bgColor="bg-blue-100"
              name={t('modulePresentation.modules.postal.name')}
              purpose={t('modulePresentation.modules.postal.purpose')}
              functionalities={t('modulePresentation.modules.postal.functionalities', { returnObjects: true }) as string[]}
              scenarios={t('modulePresentation.modules.postal.scenarios', { returnObjects: true }) as Array<{ title: string; description: string }>}
              benefits={t('modulePresentation.modules.postal.benefits', { returnObjects: true }) as string[]}
              t={t}
            />
          </TabsContent>
        </Tabs>

        {/* Print-only: Show all modules */}
        <div className="hidden print:block space-y-8">
          <ModuleSection
            icon={MapPin}
            color="text-primary"
            bgColor="bg-primary/10"
            name={t('modulePresentation.modules.digitalAddress.name')}
            purpose={t('modulePresentation.modules.digitalAddress.purpose')}
            functionalities={t('modulePresentation.modules.digitalAddress.functionalities', { returnObjects: true }) as string[]}
            scenarios={t('modulePresentation.modules.digitalAddress.scenarios', { returnObjects: true }) as Array<{ title: string; description: string }>}
            benefits={t('modulePresentation.modules.digitalAddress.benefits', { returnObjects: true }) as string[]}
            t={t}
          />
          <div className="page-break-before" />
          <ModuleSection
            icon={AlertTriangle}
            color="text-destructive"
            bgColor="bg-destructive/10"
            name={t('modulePresentation.modules.emergency.name')}
            purpose={t('modulePresentation.modules.emergency.purpose')}
            functionalities={t('modulePresentation.modules.emergency.functionalities', { returnObjects: true }) as string[]}
            scenarios={t('modulePresentation.modules.emergency.scenarios', { returnObjects: true }) as Array<{ title: string; description: string }>}
            benefits={t('modulePresentation.modules.emergency.benefits', { returnObjects: true }) as string[]}
            t={t}
          />
          <div className="page-break-before" />
          <ModuleSection
            icon={Package}
            color="text-blue-600"
            bgColor="bg-blue-100"
            name={t('modulePresentation.modules.postal.name')}
            purpose={t('modulePresentation.modules.postal.purpose')}
            functionalities={t('modulePresentation.modules.postal.functionalities', { returnObjects: true }) as string[]}
            scenarios={t('modulePresentation.modules.postal.scenarios', { returnObjects: true }) as Array<{ title: string; description: string }>}
            benefits={t('modulePresentation.modules.postal.benefits', { returnObjects: true }) as string[]}
            t={t}
          />
        </div>

        {/* Summary */}
        <Card className="border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle>{t('modulePresentation.summary.title')}</CardTitle>
            <CardDescription>{t('modulePresentation.summary.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">{t('modulePresentation.summary.headers.module')}</th>
                    <th className="text-left py-3 px-4 font-semibold">{t('modulePresentation.summary.headers.primaryBenefit')}</th>
                    <th className="text-left py-3 px-4 font-semibold">{t('modulePresentation.summary.headers.keyUsers')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        {t('modulePresentation.modules.digitalAddress.name')}
                      </div>
                    </td>
                    <td className="py-3 px-4">{t('modulePresentation.summary.digitalAddress.benefit')}</td>
                    <td className="py-3 px-4">{t('modulePresentation.summary.digitalAddress.users')}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        {t('modulePresentation.modules.emergency.name')}
                      </div>
                    </td>
                    <td className="py-3 px-4">{t('modulePresentation.summary.emergency.benefit')}</td>
                    <td className="py-3 px-4">{t('modulePresentation.summary.emergency.users')}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-blue-600" />
                        {t('modulePresentation.modules.postal.name')}
                      </div>
                    </td>
                    <td className="py-3 px-4">{t('modulePresentation.summary.postal.benefit')}</td>
                    <td className="py-3 px-4">{t('modulePresentation.summary.postal.users')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* National Impact Section */}
        <Card className="border-t-4 border-t-green-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-green-600" />
              {t('modulePresentation.nationalImpact.title')}
            </CardTitle>
            <CardDescription>{t('modulePresentation.nationalImpact.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Context */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-muted-foreground leading-relaxed">
                {t('modulePresentation.nationalImpact.context')}
              </p>
            </div>

            {/* Three Impact Areas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Economic Impact */}
              <Card className="border-l-4 border-l-green-600">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-green-600" />
                    {t('modulePresentation.nationalImpact.economic.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {(t('modulePresentation.nationalImpact.economic.benefits', { returnObjects: true }) as string[]).map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Social Impact */}
              <Card className="border-l-4 border-l-blue-600">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Heart className="h-5 w-5 text-blue-600" />
                    {t('modulePresentation.nationalImpact.social.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {(t('modulePresentation.nationalImpact.social.benefits', { returnObjects: true }) as string[]).map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Government Impact */}
              <Card className="border-l-4 border-l-primary">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Landmark className="h-5 w-5 text-primary" />
                    {t('modulePresentation.nationalImpact.government.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {(t('modulePresentation.nationalImpact.government.benefits', { returnObjects: true }) as string[]).map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Key Statistics / Potential Impact */}
            <div className="bg-gradient-to-r from-primary/5 to-green-600/5 p-6 rounded-lg">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                {t('modulePresentation.nationalImpact.potentialImpact.title')}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(t('modulePresentation.nationalImpact.potentialImpact.stats', { returnObjects: true }) as Array<{ label: string; value: string }>).map((stat, index) => (
                  <div key={index} className="text-center p-3 bg-background rounded-lg">
                    <div className="text-2xl font-bold text-primary">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Closing statement */}
            <div className="text-center border-t pt-6">
              <p className="text-muted-foreground">{t('modulePresentation.nationalImpact.closing')}</p>
            </div>
          </CardContent>
        </Card>

        {/* National Security Section */}
        <Card className="border-t-4 border-t-red-700 print:break-before-page">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-red-100">
                <Shield className="h-8 w-8 text-red-700" />
              </div>
              <div>
                <CardTitle className="text-xl">{t('modulePresentation.nationalSecurity.title')}</CardTitle>
                <CardDescription>{t('modulePresentation.nationalSecurity.subtitle')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Context */}
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-muted-foreground leading-relaxed">
                {t('modulePresentation.nationalSecurity.context')}
              </p>
            </div>

            {/* Security Areas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Border & Immigration Security */}
              <Card className="border-l-4 border-l-red-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-red-700" />
                    {t('modulePresentation.nationalSecurity.border.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {(t('modulePresentation.nationalSecurity.border.benefits', { returnObjects: true }) as string[]).map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-red-700 mt-0.5 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Law Enforcement */}
              <Card className="border-l-4 border-l-blue-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Eye className="h-5 w-5 text-blue-700" />
                    {t('modulePresentation.nationalSecurity.lawEnforcement.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {(t('modulePresentation.nationalSecurity.lawEnforcement.benefits', { returnObjects: true }) as string[]).map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-blue-700 mt-0.5 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Crisis & Disaster Management */}
              <Card className="border-l-4 border-l-orange-600">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Radio className="h-5 w-5 text-orange-600" />
                    {t('modulePresentation.nationalSecurity.crisis.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {(t('modulePresentation.nationalSecurity.crisis.benefits', { returnObjects: true }) as string[]).map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Data Security & Sovereignty */}
              <Card className="border-l-4 border-l-purple-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lock className="h-5 w-5 text-purple-700" />
                    {t('modulePresentation.nationalSecurity.dataSecurity.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {(t('modulePresentation.nationalSecurity.dataSecurity.benefits', { returnObjects: true }) as string[]).map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-purple-700 mt-0.5 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Strategic Value */}
            <div className="bg-gradient-to-r from-red-50 to-blue-50 p-6 rounded-lg border">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-700" />
                {t('modulePresentation.nationalSecurity.strategicValue.title')}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(t('modulePresentation.nationalSecurity.strategicValue.points', { returnObjects: true }) as Array<{ title: string; description: string }>).map((point, index) => (
                  <div key={index} className="text-center p-4 bg-background rounded-lg">
                    <div className="font-semibold text-primary mb-1">{point.title}</div>
                    <div className="text-xs text-muted-foreground">{point.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Closing */}
            <div className="text-center border-t pt-6">
              <p className="text-muted-foreground">{t('modulePresentation.nationalSecurity.closing')}</p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <Card>
          <CardContent className="py-6">
            <Separator className="mb-6" />
            <div className="text-center text-muted-foreground text-sm">
              <p>{t('modulePresentation.footer.closing')}</p>
              <p className="mt-2 font-medium text-primary">{t('modulePresentation.footer.tagline')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

interface ModuleSectionProps {
  icon: React.ElementType;
  color: string;
  bgColor: string;
  name: string;
  purpose: string;
  functionalities: string[];
  scenarios: Array<{ title: string; description: string }>;
  benefits: string[];
  t: (key: string) => string;
}

const ModuleSection: React.FC<ModuleSectionProps> = ({
  icon: Icon,
  color,
  bgColor,
  name,
  purpose,
  functionalities,
  scenarios,
  benefits,
  t,
}) => {
  return (
    <div className="space-y-6">
      {/* Module Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${bgColor}`}>
              <Icon className={`h-8 w-8 ${color}`} />
            </div>
            <div>
              <CardTitle className="text-2xl">{name}</CardTitle>
              <Badge variant="outline" className="mt-1">{t('modulePresentation.labels.module')}</Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Purpose */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            {t('modulePresentation.purposeLabel')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">{purpose}</p>
        </CardContent>
      </Card>

      {/* Key Functionalities */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            {t('modulePresentation.functionalitiesLabel')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {functionalities.map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Real-Life Scenarios */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            {t('modulePresentation.scenariosLabel')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scenarios.map((scenario, index) => (
              <div key={index} className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full ${bgColor} ${color} flex items-center justify-center text-xs font-bold`}>
                    {index + 1}
                  </span>
                  {scenario.title}
                </h4>
                <p className="text-sm text-muted-foreground pl-8">{scenario.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Benefits & Impact */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            {t('modulePresentation.benefitsLabel')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className={`w-2 h-2 rounded-full ${color.replace('text-', 'bg-')} mt-2`} />
                <span className="text-sm">{benefit}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModulePresentationDocument;
