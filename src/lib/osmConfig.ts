// OpenStreetMap Configuration for Leaflet fallback

export const OSM_CONFIG = {
  // Default tile layer (OpenStreetMap standard)
  tileLayer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  
  // Alternative tile providers
  tileLayers: {
    standard: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    }
  },
  
  // Default map center (Malabo, Equatorial Guinea)
  defaultCenter: [3.7500, 8.7833] as [number, number],
  defaultZoom: 12,
  
  // Marker colors matching Google Maps implementation
  markerColors: {
    verified: '#22c55e',      // green-500
    draft: '#f59e0b',         // amber-500
    business: '#3b82f6',      // blue-500
    residential: '#8b5cf6',   // violet-500
    government: '#ef4444',    // red-500
    landmark: '#06b6d4',      // cyan-500
    selected: '#ef4444',      // red-500
    userLocation: '#3b82f6',  // blue-500
    default: '#6b7280'        // gray-500
  }
};

// Create SVG marker icon for Leaflet
export const createMarkerIcon = (color: string, size: number = 30) => {
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 3}" fill="${color}" stroke="white" stroke-width="3"/>
      <circle cx="${size/2}" cy="${size/2}" r="${size/4}" fill="white"/>
    </svg>
  `;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

// Get marker color based on address type and verification status
export const getMarkerColor = (address: {
  verified?: boolean;
  address_type?: string;
  business_address_type?: string;
}): string => {
  if (address.business_address_type || address.address_type === 'business') {
    return OSM_CONFIG.markerColors.business;
  }
  if (address.address_type === 'government') {
    return OSM_CONFIG.markerColors.government;
  }
  if (address.address_type === 'landmark') {
    return OSM_CONFIG.markerColors.landmark;
  }
  if (address.verified) {
    return OSM_CONFIG.markerColors.verified;
  }
  return OSM_CONFIG.markerColors.draft;
};
