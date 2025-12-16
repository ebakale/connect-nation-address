import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FileText, 
  Download, 
  Printer, 
  ChevronRight, 
  ChevronDown,
  User,
  Users,
  Building2,
  AlertTriangle,
  Radio,
  MapPin,
  BarChart3,
  CheckCircle2,
  Clock,
  Target,
  Lightbulb,
  Monitor,
  Home,
  Truck,
  Package,
  Phone,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';

interface DemoStep {
  step: number;
  action: string;
  screen: string;
  notes: string;
}

interface DemoActor {
  role: string;
  name: string;
  type: 'primary' | 'secondary';
}

interface DemoScenario {
  id: string;
  translationKey: string;
  title: string;
  icon: React.ElementType;
  context: string;
  objective: string;
  actors: DemoActor[];
  modules: string[];
  steps: DemoStep[];
  outcome: string[];
  presenterNotes: string;
}

const scenarioConfig = [
  { id: 'citizen-registration', key: 'citizenRegistration', icon: User, stepsCount: 12, actorKeys: ['citizen', 'verifier'] },
  { id: 'municipality-validation', key: 'municipalityValidation', icon: Building2, stepsCount: 13, actorKeys: ['verifier', 'citizen'] },
  { id: 'business-verification', key: 'businessVerification', icon: Building2, stepsCount: 11, actorKeys: ['officer'] },
  { id: 'car-registration-household', key: 'carRegistrationHousehold', icon: Home, stepsCount: 20, actorKeys: ['citizen', 'spouse', 'verifier'] },
  { id: 'passport-delivery-car', key: 'passportDeliveryCar', icon: Truck, stepsCount: 16, actorKeys: ['agent', 'clerk', 'citizen', 'supervisor'] },
  { id: 'emergency-address-linked', key: 'emergencyAddressLinked', icon: AlertTriangle, stepsCount: 14, actorKeys: ['citizen', 'operator'] },
  { id: 'dispatcher-units', key: 'dispatcherUnits', icon: Radio, stepsCount: 13, actorKeys: ['dispatcher', 'supervisor', 'officer'] },
  { id: 'field-responders', key: 'fieldResponders', icon: MapPin, stepsCount: 15, actorKeys: ['officer', 'partner', 'dispatcher'] },
  { id: 'supervisor-reports', key: 'supervisorReports', icon: BarChart3, stepsCount: 11, actorKeys: ['supervisor'] },
  { id: 'postal-delivery-workflow', key: 'postalDeliveryWorkflow', icon: Package, stepsCount: 18, actorKeys: ['clerk', 'dispatcher', 'agent', 'supervisor'] },
  { id: 'pickup-request-workflow', key: 'pickupRequestWorkflow', icon: Phone, stepsCount: 12, actorKeys: ['citizen', 'dispatcher', 'agent'] },
  { id: 'return-reverse-logistics', key: 'returnReverseLogistics', icon: RotateCcw, stepsCount: 10, actorKeys: ['citizen', 'clerk', 'agent'] },
];

export function DemoScriptDocument() {
  const { t, i18n } = useTranslation('demo');
  const [activeScenario, setActiveScenario] = useState('citizen-registration');
  const [highlightedStep, setHighlightedStep] = useState<number | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<Set<number>>(new Set());
  const contentRef = useRef<HTMLDivElement>(null);

  // Build scenarios from translations
  const scenarios: DemoScenario[] = scenarioConfig.map(config => {
    const scenarioData = t(`scenarios.${config.key}`, { returnObjects: true }) as any;
    
    // Build actors array from actor keys
    const actors: DemoActor[] = config.actorKeys.map((actorKey, index) => {
      const actorData = scenarioData?.actors?.[actorKey] || {};
      return {
        role: actorData.role || actorKey,
        name: actorData.name || '',
        type: index === 0 ? 'primary' : 'secondary' as 'primary' | 'secondary',
      };
    });

    // Build steps array
    const steps: DemoStep[] = [];
    for (let i = 1; i <= config.stepsCount; i++) {
      const stepData = scenarioData?.steps?.[String(i)] || {};
      steps.push({
        step: i,
        action: stepData.action || '',
        screen: stepData.screen || '',
        notes: stepData.notes || '',
      });
    }

    // Get modules - handle both array and object formats
    const modulesData = scenarioData?.modules || [];
    const modules = Array.isArray(modulesData) ? modulesData : Object.values(modulesData);

    // Get outcomes - handle both array and object formats
    const outcomesData = scenarioData?.outcomes || [];
    const outcomes = Array.isArray(outcomesData) ? outcomesData : Object.values(outcomesData);

    return {
      id: config.id,
      translationKey: config.key,
      title: scenarioData?.title || config.id,
      icon: config.icon,
      context: scenarioData?.context || '',
      objective: scenarioData?.objective || '',
      actors,
      modules: modules as string[],
      steps,
      outcome: outcomes as string[],
      presenterNotes: scenarioData?.presenterNotes || '',
    };
  });

  const currentScenario = scenarios.find(s => s.id === activeScenario) || scenarios[0];

  const toggleNote = (stepNumber: number) => {
    const newExpanded = new Set(expandedNotes);
    if (newExpanded.has(stepNumber)) {
      newExpanded.delete(stepNumber);
    } else {
      newExpanded.add(stepNumber);
    }
    setExpandedNotes(newExpanded);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    let yPosition = margin;

    // Title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text(t('title'), pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(t('subtitle'), pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Export each scenario
    for (const scenario of scenarios) {
      // Check if we need a new page
      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        yPosition = margin;
      }

      // Scenario title
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(scenario.title, margin, yPosition);
      yPosition += 8;

      // Context
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const contextLines = pdf.splitTextToSize(scenario.context, pageWidth - 2 * margin);
      pdf.text(contextLines, margin, yPosition);
      yPosition += contextLines.length * 5 + 5;

      // Objective
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${t('objective')}: `, margin, yPosition);
      pdf.setFont('helvetica', 'normal');
      const objectiveLines = pdf.splitTextToSize(scenario.objective, pageWidth - 2 * margin - 20);
      pdf.text(objectiveLines, margin + 20, yPosition);
      yPosition += objectiveLines.length * 5 + 5;

      // Steps
      for (const step of scenario.steps) {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.setFont('helvetica', 'bold');
        pdf.text(`${step.step}. `, margin, yPosition);
        pdf.setFont('helvetica', 'normal');
        const actionLines = pdf.splitTextToSize(step.action, pageWidth - 2 * margin - 10);
        pdf.text(actionLines, margin + 8, yPosition);
        yPosition += actionLines.length * 5 + 3;
      }

      yPosition += 10;
    }

    pdf.save('coneg-demo-script.pdf');
  };

  // Get UI translations with fallbacks
  const uiText = {
    title: t('title'),
    subtitle: t('subtitle'),
    print: t('print'),
    exportPdf: t('exportPDF'),
    scenarios: t('scenariosLabel', { defaultValue: 'Scenarios' }),
    scenario: t('scenario'),
    of: t('of'),
    context: t('context'),
    objective: t('objective'),
    actorsInvolved: t('actors'),
    primary: t('primary'),
    secondary: t('secondary'),
    modulesUsed: t('modulesUsed'),
    stepByStepFlow: t('stepByStepFlow'),
    notes: t('notes'),
    presenterNote: t('presenterNote'),
    outcomesAndValue: t('outcomesTitle'),
    keyPresenterMessage: t('keyPresenterMessage'),
    previousScenario: t('previousScenario'),
    nextScenario: t('nextScenario'),
    generatedOn: t('generated'),
  };

  return (
    <div className="min-h-screen bg-background" key={i18n.resolvedLanguage || i18n.language}>
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 print:static print:border-0">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary" />
            <div>
              <h1 className="font-semibold">{uiText.title}</h1>
              <p className="text-xs text-muted-foreground">{uiText.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              {uiText.print}
            </Button>
            <Button size="sm" onClick={handleExportPDF}>
              <Download className="h-4 w-4 mr-2" />
              {uiText.exportPdf}
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-6 print:py-0" ref={contentRef}>
        {/* Print Header */}
        <div className="hidden print:block mb-8">
          <h1 className="text-2xl font-bold text-center">{uiText.title}</h1>
          <p className="text-center text-muted-foreground">{uiText.subtitle}</p>
          <p className="text-center text-sm text-muted-foreground mt-2">
            {uiText.generatedOn} {new Date().toLocaleDateString(i18n.language)}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-6">
          {/* Sidebar - Scenario Navigation */}
          <aside className="print:hidden">
            <Card className="sticky top-20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">{uiText.scenarios}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-200px)]">
                  <div className="px-3 pb-3 space-y-1">
                    {scenarios.map((scenario, index) => {
                      const Icon = scenario.icon;
                      return (
                        <button
                          key={scenario.id}
                          onClick={() => {
                            setActiveScenario(scenario.id);
                            setHighlightedStep(null);
                            setExpandedNotes(new Set());
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-colors",
                            activeScenario === scenario.id
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted"
                          )}
                        >
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium shrink-0",
                            activeScenario === scenario.id
                              ? "bg-primary-foreground/20 text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          )}>
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 shrink-0" />
                              <span className="truncate font-medium">{scenario.title}</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="space-y-6">
            {/* Scenario Header */}
            <Card className="print:shadow-none print:border-0">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    {React.createElement(currentScenario.icon, { className: "h-8 w-8 text-primary" })}
                  </div>
                  <div className="flex-1">
                    <Badge variant="outline" className="mb-2">
                      {uiText.scenario} {scenarios.findIndex(s => s.id === activeScenario) + 1} {uiText.of} {scenarios.length}
                    </Badge>
                    <CardTitle className="text-2xl">{currentScenario.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">{uiText.context}</h4>
                  <p className="text-sm leading-relaxed">{currentScenario.context}</p>
                </div>
                <Separator />
                <div className="flex items-center gap-2 text-sm">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="font-medium">{uiText.objective}:</span>
                  <span className="text-muted-foreground">{currentScenario.objective}</span>
                </div>
              </CardContent>
            </Card>

            {/* Actors & Modules */}
            <Card className="print:shadow-none print:border-0">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Users className="h-4 w-4" />
                      {uiText.actorsInvolved}
                    </div>
                    <div className="space-y-2">
                      {currentScenario.actors.map((actor, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Badge variant={actor.type === 'primary' ? 'default' : 'secondary'} className="text-xs">
                            {actor.type === 'primary' ? uiText.primary : uiText.secondary}
                          </Badge>
                          <span className="text-sm font-medium">{actor.name}</span>
                          <span className="text-sm text-muted-foreground">({actor.role})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Monitor className="h-4 w-4" />
                      {uiText.modulesUsed}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {currentScenario.modules.map((module, index) => (
                        <React.Fragment key={index}>
                          <Badge variant="outline" className="text-xs">{module}</Badge>
                          {index < currentScenario.modules.length - 1 && (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Steps */}
            <Card className="print:shadow-none print:border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {uiText.stepByStepFlow}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentScenario.steps.map((step) => (
                  <Collapsible key={step.step} open={expandedNotes.has(step.step)}>
                    <div
                      className={cn(
                        "rounded-lg border transition-all cursor-pointer",
                        highlightedStep === step.step
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "hover:border-primary/50 hover:bg-muted/50"
                      )}
                      onClick={() => setHighlightedStep(step.step === highlightedStep ? null : step.step)}
                    >
                      <div className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                            highlightedStep === step.step
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          )}>
                            {step.step}
                          </div>
                          <div className="flex-1 min-w-0 space-y-2">
                            <p className="font-medium">{step.action}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Monitor className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{step.screen}</span>
                            </div>
                          </div>
                          <CollapsibleTrigger asChild onClick={(e) => { e.stopPropagation(); toggleNote(step.step); }}>
                            <Button variant="ghost" size="sm" className="shrink-0">
                              <Lightbulb className="h-4 w-4 mr-1" />
                              {uiText.notes}
                              {expandedNotes.has(step.step) ? (
                                <ChevronDown className="h-4 w-4 ml-1" />
                              ) : (
                                <ChevronRight className="h-4 w-4 ml-1" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                      </div>
                      <CollapsibleContent>
                        <div className="px-4 pb-4 pt-0">
                          <div className="ml-12 p-3 rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                            <p className="text-sm text-amber-800 dark:text-amber-200">
                              <span className="font-medium">{uiText.presenterNote}: </span>
                              {step.notes}
                            </p>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                ))}
              </CardContent>
            </Card>

            {/* Outcomes */}
            <Card className="print:shadow-none print:border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  {uiText.outcomesAndValue}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {currentScenario.outcome.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Presenter Key Message */}
            <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20 print:bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                  <Lightbulb className="h-5 w-5" />
                  {uiText.keyPresenterMessage}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <blockquote className="text-sm italic text-amber-900 dark:text-amber-100 border-l-4 border-amber-400 pl-4">
                  "{currentScenario.presenterNotes}"
                </blockquote>
              </CardContent>
            </Card>

            {/* Navigation Buttons - Hidden in print */}
            <div className="flex justify-between pt-4 print:hidden">
              <Button
                variant="outline"
                onClick={() => {
                  const currentIndex = scenarios.findIndex(s => s.id === activeScenario);
                  if (currentIndex > 0) {
                    setActiveScenario(scenarios[currentIndex - 1].id);
                    setHighlightedStep(null);
                  }
                }}
                disabled={scenarios.findIndex(s => s.id === activeScenario) === 0}
              >
                ← {uiText.previousScenario}
              </Button>
              <Button
                onClick={() => {
                  const currentIndex = scenarios.findIndex(s => s.id === activeScenario);
                  if (currentIndex < scenarios.length - 1) {
                    setActiveScenario(scenarios[currentIndex + 1].id);
                    setHighlightedStep(null);
                  }
                }}
                disabled={scenarios.findIndex(s => s.id === activeScenario) === scenarios.length - 1}
              >
                {uiText.nextScenario} →
              </Button>
            </div>
          </main>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
        }
      `}</style>
    </div>
  );
}
