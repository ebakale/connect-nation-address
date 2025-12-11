import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Database, Home, BarChart3, Lock, Eye, Info, AlertTriangle } from "lucide-react";
import { useTranslation } from 'react-i18next';

export function CARAdminGuide() {
  const { t } = useTranslation('admin');

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">{t('carAdminGuide.title')}</h1>
        <p className="text-muted-foreground">{t('carAdminGuide.subtitle')}</p>
      </div>

      {/* Important Note */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          {t('carAdminGuide.systemAdminNote')}
        </AlertDescription>
      </Alert>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          {t('carAdminGuide.gettingStarted.title')}
        </h2>
        <div className="space-y-3">
          <p><strong>{t('carAdminGuide.gettingStarted.yourRole')}:</strong> {t('carAdminGuide.gettingStarted.roleDescription')}</p>
          <p><strong>{t('carAdminGuide.gettingStarted.access')}:</strong> {t('carAdminGuide.gettingStarted.accessDescription')}</p>
          <p><strong>{t('carAdminGuide.gettingStarted.keyPermissions')}:</strong> {t('carAdminGuide.gettingStarted.permissionsDescription')}</p>
        </div>
      </Card>

      {/* Household Management */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Home className="h-5 w-5" />
          {t('carAdminGuide.householdManagement.title')}
        </h2>
        <div className="space-y-3">
          <p>{t('carAdminGuide.householdManagement.description')}</p>

          <h3 className="font-semibold mt-4">{t('carAdminGuide.householdManagement.householdGroups.title')}:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>{t('carAdminGuide.householdManagement.householdGroups.item1')}</li>
            <li>{t('carAdminGuide.householdManagement.householdGroups.item2')}</li>
            <li>{t('carAdminGuide.householdManagement.householdGroups.item3')}</li>
            <li>{t('carAdminGuide.householdManagement.householdGroups.item4')}</li>
            <li>{t('carAdminGuide.householdManagement.householdGroups.item5')}</li>
          </ul>

          <h3 className="font-semibold mt-4">{t('carAdminGuide.householdManagement.dependentManagement.title')}:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>{t('carAdminGuide.householdManagement.dependentManagement.item1')}</li>
            <li>{t('carAdminGuide.householdManagement.dependentManagement.item2')}</li>
            <li>{t('carAdminGuide.householdManagement.dependentManagement.item3')}</li>
            <li>{t('carAdminGuide.householdManagement.dependentManagement.item4')}</li>
            <li>{t('carAdminGuide.householdManagement.dependentManagement.item5')}</li>
          </ul>

          <h3 className="font-semibold mt-4">{t('carAdminGuide.householdManagement.custodyTracking.title')}:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>{t('carAdminGuide.householdManagement.custodyTracking.item1')}</li>
            <li>{t('carAdminGuide.householdManagement.custodyTracking.item2')}</li>
            <li>{t('carAdminGuide.householdManagement.custodyTracking.item3')}</li>
            <li>{t('carAdminGuide.householdManagement.custodyTracking.item4')}</li>
          </ul>

          <h3 className="font-semibold mt-4">{t('carAdminGuide.householdManagement.succession.title')}:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>{t('carAdminGuide.householdManagement.succession.item1')}</li>
            <li>{t('carAdminGuide.householdManagement.succession.item2')}</li>
            <li>{t('carAdminGuide.householdManagement.succession.item3')}</li>
          </ul>
        </div>
      </Card>

      {/* CAR Analytics */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          {t('carAdminGuide.carAnalytics.title')}
        </h2>
        <div className="space-y-3">
          <p>{t('carAdminGuide.carAnalytics.description')}</p>

          <h3 className="font-semibold mt-4">{t('carAdminGuide.carAnalytics.citizenMetrics.title')}:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>{t('carAdminGuide.carAnalytics.citizenMetrics.adoptionRate')}:</strong> {t('carAdminGuide.carAnalytics.citizenMetrics.adoptionRateDesc')}</li>
            <li><strong>{t('carAdminGuide.carAnalytics.citizenMetrics.verificationRate')}:</strong> {t('carAdminGuide.carAnalytics.citizenMetrics.verificationRateDesc')}</li>
            <li><strong>{t('carAdminGuide.carAnalytics.citizenMetrics.avgVerificationTime')}:</strong> {t('carAdminGuide.carAnalytics.citizenMetrics.avgVerificationTimeDesc')}</li>
          </ul>

          <h3 className="font-semibold mt-4">{t('carAdminGuide.carAnalytics.addressStatus.title')}:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>{t('carAdminGuide.carAnalytics.addressStatus.item1')}</li>
            <li>{t('carAdminGuide.carAnalytics.addressStatus.item2')}</li>
            <li>{t('carAdminGuide.carAnalytics.addressStatus.item3')}</li>
            <li>{t('carAdminGuide.carAnalytics.addressStatus.item4')}</li>
          </ul>

          <h3 className="font-semibold mt-4">{t('carAdminGuide.carAnalytics.householdAnalytics.title')}:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>{t('carAdminGuide.carAnalytics.householdAnalytics.formation')}:</strong> {t('carAdminGuide.carAnalytics.householdAnalytics.formationDesc')}</li>
            <li><strong>{t('carAdminGuide.carAnalytics.householdAnalytics.avgSize')}:</strong> {t('carAdminGuide.carAnalytics.householdAnalytics.avgSizeDesc')}</li>
            <li><strong>{t('carAdminGuide.carAnalytics.householdAnalytics.verified')}:</strong> {t('carAdminGuide.carAnalytics.householdAnalytics.verifiedDesc')}</li>
            <li><strong>{t('carAdminGuide.carAnalytics.householdAnalytics.dependentDist')}:</strong> {t('carAdminGuide.carAnalytics.householdAnalytics.dependentDistDesc')}</li>
            <li><strong>{t('carAdminGuide.carAnalytics.householdAnalytics.memberRelations')}:</strong> {t('carAdminGuide.carAnalytics.householdAnalytics.memberRelationsDesc')}</li>
          </ul>

          <div className="bg-muted p-4 rounded-lg mt-4">
            <p className="text-sm"><strong>{t('carAdminGuide.carAnalytics.dataSource')}:</strong> {t('carAdminGuide.carAnalytics.dataSourceDesc')}</p>
          </div>
        </div>
      </Card>

      {/* Privacy Analytics (Read-Only) */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Lock className="h-5 w-5" />
          {t('carAdminGuide.privacyAnalytics.title')}
          <Badge variant="secondary">{t('carAdminGuide.privacyAnalytics.readOnly')}</Badge>
        </h2>
        <div className="space-y-3">
          <p>{t('carAdminGuide.privacyAnalytics.description')}</p>

          <Alert variant="default" className="mt-4">
            <Eye className="h-4 w-4" />
            <AlertDescription>
              {t('carAdminGuide.privacyAnalytics.citizenControlNote')}
            </AlertDescription>
          </Alert>

          <h3 className="font-semibold mt-4">{t('carAdminGuide.privacyAnalytics.levels.title')}:</h3>
          <ul className="space-y-3 ml-4">
            <li>
              <strong className="text-destructive">{t('carAdminGuide.privacyAnalytics.levels.private')}:</strong>
              <p className="text-sm ml-4">{t('carAdminGuide.privacyAnalytics.levels.privateDesc')}</p>
            </li>
            <li>
              <strong className="text-warning">{t('carAdminGuide.privacyAnalytics.levels.regionOnly')}:</strong>
              <p className="text-sm ml-4">{t('carAdminGuide.privacyAnalytics.levels.regionOnlyDesc')}</p>
            </li>
            <li>
              <strong className="text-primary">{t('carAdminGuide.privacyAnalytics.levels.public')}:</strong>
              <p className="text-sm ml-4">{t('carAdminGuide.privacyAnalytics.levels.publicDesc')}</p>
            </li>
          </ul>

          <h3 className="font-semibold mt-4">{t('carAdminGuide.privacyAnalytics.availableMetrics.title')}:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>{t('carAdminGuide.privacyAnalytics.availableMetrics.item1')}</li>
            <li>{t('carAdminGuide.privacyAnalytics.availableMetrics.item2')}</li>
            <li>{t('carAdminGuide.privacyAnalytics.availableMetrics.item3')}</li>
            <li>{t('carAdminGuide.privacyAnalytics.availableMetrics.item4')}</li>
          </ul>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Database className="h-5 w-5" />
          {t('carAdminGuide.dataQuality.title')}
        </h2>
        <div className="space-y-3">
          <h3 className="font-semibold">{t('carAdminGuide.dataQuality.metrics.title')}:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>{t('carAdminGuide.dataQuality.metrics.item1')}</li>
            <li>{t('carAdminGuide.dataQuality.metrics.item2')}</li>
            <li>{t('carAdminGuide.dataQuality.metrics.item3')}</li>
            <li>{t('carAdminGuide.dataQuality.metrics.item4')}</li>
            <li>{t('carAdminGuide.dataQuality.metrics.item5')}</li>
          </ul>

          <h3 className="font-semibold mt-4">{t('carAdminGuide.dataQuality.bulkOperations.title')}:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>{t('carAdminGuide.dataQuality.bulkOperations.item1')}</li>
            <li>{t('carAdminGuide.dataQuality.bulkOperations.item2')}</li>
            <li>{t('carAdminGuide.dataQuality.bulkOperations.item3')}</li>
            <li>{t('carAdminGuide.dataQuality.bulkOperations.item4')}</li>
          </ul>

          <h3 className="font-semibold mt-4">{t('carAdminGuide.dataQuality.dataExport.title')}:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>{t('carAdminGuide.dataQuality.dataExport.item1')}</li>
            <li>{t('carAdminGuide.dataQuality.dataExport.item2')}</li>
            <li>{t('carAdminGuide.dataQuality.dataExport.item3')}</li>
          </ul>
        </div>
      </Card>

      {/* Verifier Directory (Read-Only) */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          {t('carAdminGuide.verifierDirectory.title')}
          <Badge variant="secondary">{t('carAdminGuide.verifierDirectory.readOnly')}</Badge>
        </h2>
        <div className="space-y-3">
          <p>{t('carAdminGuide.verifierDirectory.description')}</p>

          <h3 className="font-semibold mt-4">{t('carAdminGuide.verifierDirectory.availableInfo.title')}:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>{t('carAdminGuide.verifierDirectory.availableInfo.item1')}</li>
            <li>{t('carAdminGuide.verifierDirectory.availableInfo.item2')}</li>
            <li>{t('carAdminGuide.verifierDirectory.availableInfo.item3')}</li>
            <li>{t('carAdminGuide.verifierDirectory.availableInfo.item4')}</li>
            <li>{t('carAdminGuide.verifierDirectory.availableInfo.item5')}</li>
          </ul>

          <h3 className="font-semibold mt-4">{t('carAdminGuide.verifierDirectory.performanceTracking.title')}:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>{t('carAdminGuide.verifierDirectory.performanceTracking.item1')}</li>
            <li>{t('carAdminGuide.verifierDirectory.performanceTracking.item2')}</li>
            <li>{t('carAdminGuide.verifierDirectory.performanceTracking.item3')}</li>
            <li>{t('carAdminGuide.verifierDirectory.performanceTracking.item4')}</li>
          </ul>

          <div className="bg-muted p-4 rounded-lg mt-4">
            <p className="text-sm"><strong>{t('carAdminGuide.verifierDirectory.note')}:</strong> {t('carAdminGuide.verifierDirectory.noteDesc')}</p>
          </div>
        </div>
      </Card>

      {/* Person Record Management */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          {t('carAdminGuide.personRecordManagement.title')}
        </h2>
        <div className="space-y-3">
          <p>{t('carAdminGuide.personRecordManagement.description')}</p>

          <h3 className="font-semibold mt-4">{t('carAdminGuide.personRecordManagement.capabilities.title')}:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>{t('carAdminGuide.personRecordManagement.capabilities.item1')}</li>
            <li>{t('carAdminGuide.personRecordManagement.capabilities.item2')}</li>
            <li>{t('carAdminGuide.personRecordManagement.capabilities.item3')}</li>
            <li>{t('carAdminGuide.personRecordManagement.capabilities.item4')}</li>
            <li>{t('carAdminGuide.personRecordManagement.capabilities.item5')}</li>
          </ul>

          <h3 className="font-semibold">{t('carAdminGuide.personRecordManagement.duplicateDetection.title')}:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>{t('carAdminGuide.personRecordManagement.duplicateDetection.item1')}</li>
            <li>{t('carAdminGuide.personRecordManagement.duplicateDetection.item2')}</li>
            <li>{t('carAdminGuide.personRecordManagement.duplicateDetection.item3')}</li>
            <li>{t('carAdminGuide.personRecordManagement.duplicateDetection.item4')}</li>
          </ul>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">{t('carAdminGuide.bestPractices.title')}</h2>
        <div className="space-y-3">
          <h3 className="font-semibold">{t('carAdminGuide.bestPractices.systemHealth.title')}:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>✅ {t('carAdminGuide.bestPractices.systemHealth.item1')}</li>
            <li>✅ {t('carAdminGuide.bestPractices.systemHealth.item2')}</li>
            <li>✅ {t('carAdminGuide.bestPractices.systemHealth.item3')}</li>
            <li>✅ {t('carAdminGuide.bestPractices.systemHealth.item4')}</li>
            <li>✅ {t('carAdminGuide.bestPractices.systemHealth.item5')}</li>
            <li>✅ {t('carAdminGuide.bestPractices.systemHealth.item6')}</li>
          </ul>

          <h3 className="font-semibold mt-4">{t('carAdminGuide.bestPractices.households.title')}:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>✅ {t('carAdminGuide.bestPractices.households.item1')}</li>
            <li>✅ {t('carAdminGuide.bestPractices.households.item2')}</li>
            <li>✅ {t('carAdminGuide.bestPractices.households.item3')}</li>
            <li>✅ {t('carAdminGuide.bestPractices.households.item4')}</li>
          </ul>

          <h3 className="font-semibold mt-4">{t('carAdminGuide.bestPractices.security.title')}:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>🔒 {t('carAdminGuide.bestPractices.security.item1')}</li>
            <li>🔒 {t('carAdminGuide.bestPractices.security.item2')}</li>
            <li>🔒 {t('carAdminGuide.bestPractices.security.item3')}</li>
            <li>🔒 {t('carAdminGuide.bestPractices.security.item4')}</li>
          </ul>
        </div>
      </Card>

      <Card className="p-6 bg-muted">
        <h2 className="text-xl font-semibold mb-3">{t('carAdminGuide.needHelp.title')}</h2>
        <p>{t('carAdminGuide.needHelp.description')}</p>
      </Card>
    </div>
  );
}
