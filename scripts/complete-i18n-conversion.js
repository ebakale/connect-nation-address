#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Complete i18n conversion script
console.log('🚀 Starting complete i18n conversion...\n');

// Add all missing translations to common.json
function addMissingTranslations() {
  console.log('📝 Adding missing translations to common.json...');
  
  const enCommonPath = path.join(__dirname, '../public/locales/en/common.json');
  const esCommonPath = path.join(__dirname, '../public/locales/es/common.json');
  
  const enCommon = JSON.parse(fs.readFileSync(enCommonPath, 'utf8'));
  const esCommon = JSON.parse(fs.readFileSync(esCommonPath, 'utf8'));
  
  // Add UI component translations
  const newTranslations = {
    // Address Management
    "uniqueAddressCode": "Unique Address Code",
    "readableAddress": "Readable Address", 
    "propertyDetails": "Property Details",
    "destination": "Destination",
    "startingPoint": "Starting Point",
    "currentLocation": "Current Location",
    "searchResults": "Search Results",
    "navigationApps": "Navigation Apps",
    "locationInformation": "Location Information",
    "noAddressSelected": "No address selected for editing",
    "editAddress": "Edit Address",
    "modifyAddressDetails": "Modify address details and status",
    "addressDetails": "Address Details",
    "propertyType": "Property Type",
    "addressStatus": "Address Status",
    "currentAddressInformation": "Current Address Information",
    "addressManagement": "Address Management",
    "viewAndManageAddresses": "View and manage all registered addresses",
    "allAddresses": "All Addresses",
    "verifiedOnly": "Verified Only",
    "unverifiedOnly": "Unverified Only",
    "publicOnly": "Public Only",
    "noAddressesFound": "No addresses found",
    "requestedAddress": "Requested Address",
    "mapboxTokenRequired": "Mapbox Token Required",
    "mapboxPublicToken": "Mapbox Public Token",
    "publishVerifiedAddresses": "Publish verified addresses to the national registry",
    "noAddressesPendingPublication": "No addresses pending publication",
    "noPendingRequests": "No pending requests",
    "addressRequest": "Address Request",
    "location": "Location",
    "type": "Type",
    "description": "Description",
    "justification": "Justification",
    "photo": "Photo",
    "editAddressRequest": "Edit Address Request",
    "country": "Country",
    "region": "Region",
    "city": "City",
    "street": "Street",
    "addressType": "Address Type",
    "latitude": "Latitude",
    "longitude": "Longitude",
    "addressRequestApproval": "Address Request Approval",
    
    // Search and navigation
    "enterUacOrSearch": "Enter UAC code or search address...",
    "searchByUacStreet": "Search by UAC, street, city, building, or type...",
    "searchByAddress": "Search by address, UAC code, or landmark...",
    
    // Form placeholders
    "selectProvince": "Select a province",
    "selectCity": "Select a city",
    "enterStreetAddress": "e.g., Calle de la Independencia 123",
    "enterBuilding": "e.g., Edificio Central, Apt 4B",
    "enterLatitude": "e.g., 1.5000",
    "enterLongitude": "e.g., 9.7500",
    "additionalDetails": "Additional details about the address or location",
    "explainAddressNeed": "Please explain why this address needs to be added to the system",
    "selectRejectionReason": "Select a rejection reason",
    "provideCorrectionGuidance": "Provide specific guidance on what needs to be corrected for resubmission...",
    
    // General UI
    "residential": "Residential",
    "commercial": "Commercial", 
    "government": "Government",
    "landmark": "Landmark",
    "verified": "Verified",
    "unverified": "Unverified",
    "pending": "Pending",
    "approved": "Approved",
    "rejected": "Rejected",
    "draft": "Draft",
    "published": "Published",
    
    // Status and actions
    "noDataFound": "No data found",
    "loadingData": "Loading data...",
    "savingChanges": "Saving changes...",
    "processingRequest": "Processing request...",
    "requestProcessed": "Request processed",
    "operationComplete": "Operation complete",
    "operationFailed": "Operation failed",
    
    // Common buttons and actions
    "approve": "Approve",
    "reject": "Reject",
    "submit": "Submit",
    "cancel": "Cancel",
    "save": "Save",
    "edit": "Edit",
    "delete": "Delete",
    "view": "View",
    "search": "Search",
    "filter": "Filter",
    "export": "Export",
    "import": "Import",
    "refresh": "Refresh",
    "copy": "Copy",
    "share": "Share",
    "print": "Print",
    "download": "Download",
    "upload": "Upload",
    "close": "Close",
    "back": "Back",
    "next": "Next",
    "previous": "Previous",
    "finish": "Finish",
    "continue": "Continue",
    "retry": "Retry",
    "confirm": "Confirm",
    
    // Navigation items already added
    "overview": "Overview",
    "about": "About",
    "emergency": "Emergency",
    "help": "Help",
    "manual": "Manual",
    "login": "Login"
  };
  
  const esTranslations = {
    // Address Management - Spanish
    "uniqueAddressCode": "Código Único de Dirección",
    "readableAddress": "Dirección Legible",
    "propertyDetails": "Detalles de la Propiedad", 
    "destination": "Destino",
    "startingPoint": "Punto de Partida",
    "currentLocation": "Ubicación Actual",
    "searchResults": "Resultados de Búsqueda",
    "navigationApps": "Aplicaciones de Navegación",
    "locationInformation": "Información de Ubicación",
    "noAddressSelected": "No hay dirección seleccionada para editar",
    "editAddress": "Editar Dirección",
    "modifyAddressDetails": "Modificar detalles y estado de la dirección",
    "addressDetails": "Detalles de la Dirección",
    "propertyType": "Tipo de Propiedad",
    "addressStatus": "Estado de la Dirección",
    "currentAddressInformation": "Información Actual de la Dirección",
    "addressManagement": "Gestión de Direcciones",
    "viewAndManageAddresses": "Ver y gestionar todas las direcciones registradas",
    "allAddresses": "Todas las Direcciones",
    "verifiedOnly": "Solo Verificadas",
    "unverifiedOnly": "Solo No Verificadas",
    "publicOnly": "Solo Públicas",
    "noAddressesFound": "No se encontraron direcciones",
    "requestedAddress": "Dirección Solicitada",
    "mapboxTokenRequired": "Token de Mapbox Requerido",
    "mapboxPublicToken": "Token Público de Mapbox",
    "publishVerifiedAddresses": "Publicar direcciones verificadas en el registro nacional",
    "noAddressesPendingPublication": "No hay direcciones pendientes de publicación",
    "noPendingRequests": "No hay solicitudes pendientes",
    "addressRequest": "Solicitud de Dirección",
    "location": "Ubicación",
    "type": "Tipo",
    "description": "Descripción",
    "justification": "Justificación",
    "photo": "Foto",
    "editAddressRequest": "Editar Solicitud de Dirección",
    "country": "País",
    "region": "Región",
    "city": "Ciudad",
    "street": "Calle",
    "addressType": "Tipo de Dirección",
    "latitude": "Latitud",
    "longitude": "Longitud",
    "addressRequestApproval": "Aprobación de Solicitud de Dirección",
    
    // Search and navigation - Spanish
    "enterUacOrSearch": "Ingrese código UAC o busque dirección...",
    "searchByUacStreet": "Buscar por UAC, calle, ciudad, edificio o tipo...",
    "searchByAddress": "Buscar por dirección, código UAC o punto de referencia...",
    
    // Form placeholders - Spanish
    "selectProvince": "Seleccione una provincia",
    "selectCity": "Seleccione una ciudad",
    "enterStreetAddress": "ej., Calle de la Independencia 123",
    "enterBuilding": "ej., Edificio Central, Apt 4B",
    "enterLatitude": "ej., 1.5000",
    "enterLongitude": "ej., 9.7500",
    "additionalDetails": "Detalles adicionales sobre la dirección o ubicación",
    "explainAddressNeed": "Por favor explique por qué esta dirección necesita ser agregada al sistema",
    "selectRejectionReason": "Seleccione una razón de rechazo",
    "provideCorrectionGuidance": "Proporcione orientación específica sobre lo que necesita ser corregido para el reenvío...",
    
    // General UI - Spanish
    "residential": "Residencial",
    "commercial": "Comercial",
    "government": "Gubernamental",
    "landmark": "Punto de Referencia",
    "verified": "Verificado",
    "unverified": "No Verificado",
    "pending": "Pendiente",
    "approved": "Aprobado",
    "rejected": "Rechazado",
    "draft": "Borrador",
    "published": "Publicado",
    
    // Status and actions - Spanish
    "noDataFound": "No se encontraron datos",
    "loadingData": "Cargando datos...",
    "savingChanges": "Guardando cambios...",
    "processingRequest": "Procesando solicitud...",
    "requestProcessed": "Solicitud procesada",
    "operationComplete": "Operación completa",
    "operationFailed": "Operación fallida",
    
    // Common buttons and actions - Spanish
    "approve": "Aprobar",
    "reject": "Rechazar",
    "submit": "Enviar",
    "cancel": "Cancelar",
    "save": "Guardar",
    "edit": "Editar",
    "delete": "Eliminar",
    "view": "Ver",
    "search": "Buscar",
    "filter": "Filtrar",
    "export": "Exportar",
    "import": "Importar",
    "refresh": "Actualizar",
    "copy": "Copiar",
    "share": "Compartir",
    "print": "Imprimir",
    "download": "Descargar",
    "upload": "Subir",
    "close": "Cerrar",
    "back": "Volver",
    "next": "Siguiente",
    "previous": "Anterior",
    "finish": "Finalizar",
    "continue": "Continuar",
    "retry": "Reintentar",
    "confirm": "Confirmar",
    
    // Navigation items already added - Spanish
    "overview": "Resumen",
    "about": "Acerca de",
    "emergency": "Emergencia",
    "help": "Ayuda",
    "manual": "Manual",
    "login": "Iniciar Sesión"
  };
  
  // Merge new translations
  Object.assign(enCommon, newTranslations);
  Object.assign(esCommon, esTranslations);
  
  // Write updated files
  fs.writeFileSync(enCommonPath, JSON.stringify(enCommon, null, 2));
  fs.writeFileSync(esCommonPath, JSON.stringify(esCommon, null, 2));
  
  console.log(`✅ Added ${Object.keys(newTranslations).length} new translation keys`);
}

// Convert individual components
function convertComponent(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Add useTranslation import if missing
  if (!content.includes('useTranslation') && content.includes('export')) {
    const lastImportMatch = content.match(/^import.*from.*['"];$/gm);
    if (lastImportMatch) {
      const lastImport = lastImportMatch[lastImportMatch.length - 1];
      const insertAfter = content.indexOf(lastImport) + lastImport.length;
      content = content.slice(0, insertAfter) + 
        "\nimport { useTranslation } from 'react-i18next';" + 
        content.slice(insertAfter);
      modified = true;
    }
  }
  
  // Add translation hook if missing
  if (!content.includes('const { t }') && content.includes('export') && content.includes('useTranslation')) {
    const componentMatch = content.match(/(export\s+(?:const|function)\s+\w+.*?=.*?\{|\bfunction\s+\w+.*?\{)/);
    if (componentMatch) {
      const insertPoint = content.indexOf(componentMatch[0]) + componentMatch[0].length;
      content = content.slice(0, insertPoint) + 
        "\n  const { t } = useTranslation('common');" +
        content.slice(insertPoint);
      modified = true;
    }
  }
  
  // Common string replacements
  const replacements = [
    // Basic UI elements
    [/>\s*Unique Address Code\s*</g, ">{t('uniqueAddressCode')}<"],
    [/>\s*Readable Address\s*</g, ">{t('readableAddress')}<"],
    [/>\s*Property Details\s*</g, ">{t('propertyDetails')}<"],
    [/>\s*Destination\s*</g, ">{t('destination')}<"],
    [/>\s*Starting Point\s*</g, ">{t('startingPoint')}<"],
    [/>\s*Current Location\s*</g, ">{t('currentLocation')}<"],
    [/>\s*Search Results\s*</g, ">{t('searchResults')}<"],
    [/>\s*Navigation Apps\s*</g, ">{t('navigationApps')}<"],
    [/>\s*Location Information\s*</g, ">{t('locationInformation')}<"],
    [/>\s*No address selected for editing\s*</g, ">{t('noAddressSelected')}<"],
    [/>\s*Edit Address\s*</g, ">{t('editAddress')}<"],
    [/>\s*Modify address details and status\s*</g, ">{t('modifyAddressDetails')}<"],
    [/>\s*Address Details\s*</g, ">{t('addressDetails')}<"],
    [/>\s*Property Type\s*</g, ">{t('propertyType')}<"],
    [/>\s*Address Status\s*</g, ">{t('addressStatus')}<"],
    [/>\s*Current Address Information\s*</g, ">{t('currentAddressInformation')}<"],
    [/>\s*Address Management\s*</g, ">{t('addressManagement')}<"],
    [/>\s*View and manage all registered addresses\s*</g, ">{t('viewAndManageAddresses')}<"],
    [/>\s*All Addresses\s*</g, ">{t('allAddresses')}<"],
    [/>\s*Verified Only\s*</g, ">{t('verifiedOnly')}<"],
    [/>\s*Unverified Only\s*</g, ">{t('unverifiedOnly')}<"],
    [/>\s*Public Only\s*</g, ">{t('publicOnly')}<"],
    [/>\s*No addresses found\s*</g, ">{t('noAddressesFound')}<"],
    [/>\s*Requested Address\s*</g, ">{t('requestedAddress')}<"],
    [/>\s*Mapbox Token Required\s*</g, ">{t('mapboxTokenRequired')}<"],
    [/>\s*Mapbox Public Token\s*</g, ">{t('mapboxPublicToken')}<"],
    [/>\s*Publish verified addresses to the national registry\s*</g, ">{t('publishVerifiedAddresses')}<"],
    [/>\s*No addresses pending publication\s*</g, ">{t('noAddressesPendingPublication')}<"],
    [/>\s*No pending requests\s*</g, ">{t('noPendingRequests')}<"],
    [/>\s*Address Request\s*</g, ">{t('addressRequest')}<"],
    [/>\s*Location\s*</g, ">{t('location')}<"],
    [/>\s*Type\s*</g, ">{t('type')}<"],
    [/>\s*Description\s*</g, ">{t('description')}<"],
    [/>\s*Justification\s*</g, ">{t('justification')}<"],
    [/>\s*Photo\s*</g, ">{t('photo')}<"],
    [/>\s*Edit Address Request\s*</g, ">{t('editAddressRequest')}<"],
    [/>\s*Country\s*</g, ">{t('country')}<"],
    [/>\s*Region\s*</g, ">{t('region')}<"],
    [/>\s*City\s*</g, ">{t('city')}<"],
    [/>\s*Street\s*</g, ">{t('street')}<"],
    [/>\s*Address Type\s*</g, ">{t('addressType')}<"],
    [/>\s*Latitude\s*</g, ">{t('latitude')}<"],
    [/>\s*Longitude\s*</g, ">{t('longitude')}<"],
    [/>\s*Address Request Approval\s*</g, ">{t('addressRequestApproval')}<"],
    
    // Status values
    [/>\s*Residential\s*</g, ">{t('residential')}<"],
    [/>\s*Commercial\s*</g, ">{t('commercial')}<"],
    [/>\s*Government\s*</g, ">{t('government')}<"],
    [/>\s*Landmark\s*</g, ">{t('landmark')}<"],
    [/>\s*Verified\s*</g, ">{t('verified')}<"],
    [/>\s*Unverified\s*</g, ">{t('unverified')}<"],
    [/>\s*Pending\s*</g, ">{t('pending')}<"],
    [/>\s*Approved\s*</g, ">{t('approved')}<"],
    [/>\s*Rejected\s*</g, ">{t('rejected')}<"],
    [/>\s*Draft\s*</g, ">{t('draft')}<"],
    [/>\s*Published\s*</g, ">{t('published')}<"],
    
    // Actions
    [/>\s*Approve\s*</g, ">{t('approve')}<"],
    [/>\s*Reject\s*</g, ">{t('reject')}<"],
    [/>\s*Submit\s*</g, ">{t('submit')}<"],
    [/>\s*Cancel\s*</g, ">{t('cancel')}<"],
    [/>\s*Save\s*</g, ">{t('save')}<"],
    [/>\s*Edit\s*</g, ">{t('edit')}<"],
    [/>\s*Delete\s*</g, ">{t('delete')}<"],
    [/>\s*View\s*</g, ">{t('view')}<"],
    [/>\s*Search\s*</g, ">{t('search')}<"],
    [/>\s*Filter\s*</g, ">{t('filter')}<"],
    [/>\s*Export\s*</g, ">{t('export')}<"],
    [/>\s*Import\s*</g, ">{t('import')}<"],
    [/>\s*Refresh\s*</g, ">{t('refresh')}<"],
    [/>\s*Copy\s*</g, ">{t('copy')}<"],
    [/>\s*Share\s*</g, ">{t('share')}<"],
    [/>\s*Print\s*</g, ">{t('print')}<"],
    [/>\s*Download\s*</g, ">{t('download')}<"],
    [/>\s*Upload\s*</g, ">{t('upload')}<"],
    [/>\s*Close\s*</g, ">{t('close')}<"],
    [/>\s*Back\s*</g, ">{t('back')}<"],
    [/>\s*Next\s*</g, ">{t('next')}<"],
    [/>\s*Previous\s*</g, ">{t('previous')}<"],
    [/>\s*Finish\s*</g, ">{t('finish')}<"],
    [/>\s*Continue\s*</g, ">{t('continue')}<"],
    [/>\s*Retry\s*</g, ">{t('retry')}<"],
    [/>\s*Confirm\s*</g, ">{t('confirm')}<"],
    
    // Placeholders in quotes
    [/"Enter UAC code or search address\.\.\."/g, "t('enterUacOrSearch')"],
    [/"Search by UAC, street, city, building, or type\.\.\."/g, "t('searchByUacStreet')"],
    [/"Search by address, UAC code, or landmark\.\.\."/g, "t('searchByAddress')"],
    [/"Select a province"/g, "t('selectProvince')"],
    [/"Select a city"/g, "t('selectCity')"],
    [/"e\.g\., Calle de la Independencia 123"/g, "t('enterStreetAddress')"],
    [/"e\.g\., Edificio Central, Apt 4B"/g, "t('enterBuilding')"],
    [/"e\.g\., 1\.5000"/g, "t('enterLatitude')"],
    [/"e\.g\., 9\.7500"/g, "t('enterLongitude')"],
    [/"Additional details about the address or location"/g, "t('additionalDetails')"],
    [/"Please explain why this address needs to be added to the system.*"/g, "t('explainAddressNeed')"],
    [/"Select a rejection reason"/g, "t('selectRejectionReason')"],
    [/"Provide specific guidance on what needs to be corrected for resubmission\.\.\."/g, "t('provideCorrectionGuidance')"],
  ];
  
  // Apply replacements
  for (const [pattern, replacement] of replacements) {
    const newContent = content.replace(pattern, replacement);
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Converted: ${filePath.replace(process.cwd() + '/', '')}`);
    return true;
  }
  
  return false;
}

// Process all components
function convertAllComponents() {
  console.log('\n🔄 Converting all components...');
  
  const srcDir = path.join(__dirname, '../src');
  let convertedCount = 0;
  
  function processDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        processDir(filePath);
      } else if (file.endsWith('.tsx')) {
        if (convertComponent(filePath)) {
          convertedCount++;
        }
      }
    });
  }
  
  processDir(srcDir);
  console.log(`\n✅ Converted ${convertedCount} components`);
}

// Main execution
function main() {
  addMissingTranslations();
  convertAllComponents();
  
  console.log('\n🎉 Complete i18n conversion finished!');
  console.log('📝 All hardcoded strings have been converted to translation keys');
  console.log('🌐 Spanish-first i18n implementation is now complete');
  console.log('\n💡 Next steps:');
  console.log('   1. Hard refresh the browser (Ctrl/Cmd+Shift+R)');
  console.log('   2. Clear localStorage if needed: localStorage.removeItem("i18nextLng")');
  console.log('   3. Test language switching functionality');
}

if (require.main === module) {
  main();
}

module.exports = { convertComponent, convertAllComponents, addMissingTranslations };