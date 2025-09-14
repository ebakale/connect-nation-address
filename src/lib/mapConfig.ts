/// <reference types="google.maps" />
import { Loader } from '@googlemaps/js-api-loader';
import { supabase } from '@/integrations/supabase/client';

// Unified map configuration
export const MAP_CONFIG = {
  // Default map settings
  defaultCenter: { lat: 3.7500, lng: 8.7833 }, // Malabo, Equatorial Guinea
  defaultZoom: 12,
  defaultCurrentLocationZoom: 16,
  maxZoom: 20,
  minZoom: 8,

  // Map controls
  controls: {
    mapTypeControl: false,
    streetViewControl: true,
    fullscreenControl: true,
    zoomControl: true,
  },

  // Marker styles
  markers: {
    defaultSize: 24,
    hoverSize: 28,
    currentLocationSize: 24,
    
    // Standard colors for address types
    colors: {
      commercial: '#9333ea', // purple
      landmark: '#dc2626',   // red
      government: '#16a34a', // green
      industrial: '#ea580c', // orange
      residential: '#3b82f6', // blue
      unverified: '#6b7280', // gray
      currentLocation: '#3b82f6', // blue
    },

    // Priority colors for incidents
    priorityColors: {
      1: '#ef4444', // red - critical
      2: '#f97316', // orange - high
      3: '#eab308', // yellow - medium
      4: '#3b82f6', // blue - low
      5: '#6b7280', // gray - lowest
    }
  },

  // Animation settings
  animations: {
    flash: {
      duration: '1.5s',
      easing: 'ease-in-out',
      iterations: 'infinite'
    },
    pulse: {
      duration: '2s',
      easing: 'ease-out',
      iterations: 'infinite'
    }
  }
};

// Unified Google Maps loader
export const createMapLoader = async (): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-google-maps-token');
    if (error) throw error;
    return data.apiKey;
  } catch (error) {
    console.error('Error fetching Google Maps API key:', error);
    throw new Error('Failed to load Google Maps API key');
  }
};

// Initialize Google Maps with unified configuration
export const initializeGoogleMaps = async (apiKey: string): Promise<void> => {
  const loader = new Loader({
    apiKey,
    version: 'weekly',
    libraries: ['places']
  });
  await loader.load();
};

// Create standardized map instance
export const createStandardMap = (
  container: HTMLDivElement,
  options: {
    center?: google.maps.LatLngLiteral;
    zoom?: number;
    mapType?: google.maps.MapTypeId;
  } = {}
): google.maps.Map => {
  return new google.maps.Map(container, {
    center: options.center || MAP_CONFIG.defaultCenter,
    zoom: options.zoom || MAP_CONFIG.defaultZoom,
    mapTypeId: options.mapType || google.maps.MapTypeId.ROADMAP,
    ...MAP_CONFIG.controls,
    maxZoom: MAP_CONFIG.maxZoom,
    minZoom: MAP_CONFIG.minZoom,
  });
};

// Create standardized current location marker with flashing animation
export const createCurrentLocationMarker = (
  map: google.maps.Map,
  position: google.maps.LatLngLiteral,
  accuracy?: number
): google.maps.Marker => {
  return new google.maps.Marker({
    position,
    map,
    title: 'Your Location',
    icon: {
      url: `data:image/svg+xml,${encodeURIComponent(`
        <svg width="${MAP_CONFIG.markers.currentLocationSize}" height="${MAP_CONFIG.markers.currentLocationSize}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <style>
              .pulse-ring {
                animation: pulse ${MAP_CONFIG.animations.pulse.duration} ${MAP_CONFIG.animations.pulse.easing} ${MAP_CONFIG.animations.pulse.iterations};
                transform-origin: center;
              }
              @keyframes pulse {
                0% { opacity: 1; transform: scale(0.8); }
                50% { opacity: 0.3; transform: scale(1.2); }
                100% { opacity: 0; transform: scale(1.5); }
              }
              .flash-dot {
                animation: flash ${MAP_CONFIG.animations.flash.duration} ${MAP_CONFIG.animations.flash.easing} ${MAP_CONFIG.animations.flash.iterations};
              }
              @keyframes flash {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.4; }
              }
            </style>
          </defs>
          <circle cx="12" cy="12" r="10" class="pulse-ring" fill="none" stroke="${MAP_CONFIG.markers.colors.currentLocation}" stroke-width="2"/>
          <circle cx="12" cy="12" r="7" class="flash-dot" fill="${MAP_CONFIG.markers.colors.currentLocation}" stroke="white" stroke-width="3"/>
        </svg>
      `)}`,
      scaledSize: new google.maps.Size(MAP_CONFIG.markers.currentLocationSize, MAP_CONFIG.markers.currentLocationSize),
      anchor: new google.maps.Point(12, 12)
    }
  });
};

// Create standardized POI marker
export const createPOIMarker = (
  map: google.maps.Map,
  position: google.maps.LatLngLiteral,
  type: string,
  options: {
    title?: string;
    size?: number;
    onClick?: () => void;
    onHover?: () => void;
    onHoverEnd?: () => void;
  } = {}
): google.maps.Marker => {
  const size = options.size || MAP_CONFIG.markers.defaultSize;
  const color = MAP_CONFIG.markers.colors[type as keyof typeof MAP_CONFIG.markers.colors] || MAP_CONFIG.markers.colors.residential;

  const marker = new google.maps.Marker({
    position,
    map,
    title: options.title,
    icon: {
      url: `data:image/svg+xml,${encodeURIComponent(`
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
          <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="${color}" stroke="white" stroke-width="2"/>
        </svg>
      `)}`,
      scaledSize: new google.maps.Size(size, size),
      anchor: new google.maps.Point(size/2, size/2)
    },
    clickable: true,
    optimized: false,
  });

  // Add hover effects
  if (options.onHover) {
    marker.addListener('mouseover', () => {
      marker.setIcon({
        url: `data:image/svg+xml,${encodeURIComponent(`
          <svg width="${MAP_CONFIG.markers.hoverSize}" height="${MAP_CONFIG.markers.hoverSize}" viewBox="0 0 ${MAP_CONFIG.markers.hoverSize} ${MAP_CONFIG.markers.hoverSize}" xmlns="http://www.w3.org/2000/svg">
            <circle cx="${MAP_CONFIG.markers.hoverSize/2}" cy="${MAP_CONFIG.markers.hoverSize/2}" r="${MAP_CONFIG.markers.hoverSize/2 - 2}" fill="${color}" stroke="white" stroke-width="2"/>
          </svg>
        `)}`,
        scaledSize: new google.maps.Size(MAP_CONFIG.markers.hoverSize, MAP_CONFIG.markers.hoverSize),
        anchor: new google.maps.Point(MAP_CONFIG.markers.hoverSize/2, MAP_CONFIG.markers.hoverSize/2)
      });
      options.onHover?.();
    });
  }

  if (options.onHoverEnd) {
    marker.addListener('mouseout', () => {
      marker.setIcon({
        url: `data:image/svg+xml,${encodeURIComponent(`
          <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
            <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="${color}" stroke="white" stroke-width="2"/>
          </svg>
        `)}`,
        scaledSize: new google.maps.Size(size, size),
        anchor: new google.maps.Point(size/2, size/2)
      });
      options.onHoverEnd?.();
    });
  }

  if (options.onClick) {
    marker.addListener('click', options.onClick);
  }

  return marker;
};

// Create flashing searched address marker
export const createFlashingSearchMarker = (
  map: google.maps.Map,
  position: google.maps.LatLngLiteral,
  type: string,
  options: {
    title?: string;
    uac?: string;
    duration?: number; // Duration in milliseconds
    onComplete?: () => void;
  } = {}
): google.maps.Marker => {
  const color = MAP_CONFIG.markers.colors[type as keyof typeof MAP_CONFIG.markers.colors] || MAP_CONFIG.markers.colors.residential;
  const duration = options.duration || 5000; // Default 5 seconds
  
  const marker = new google.maps.Marker({
    position,
    map,
    title: options.title,
    icon: {
      url: `data:image/svg+xml,${encodeURIComponent(`
        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <style>
              .flash-marker {
                animation: searchFlash 1s ease-in-out infinite;
                transform-origin: center;
              }
              .pulse-ring-search {
                animation: searchPulse 2s ease-out infinite;
                transform-origin: center;
              }
              @keyframes searchFlash {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.3; transform: scale(1.2); }
              }
              @keyframes searchPulse {
                0% { opacity: 0.8; transform: scale(1); }
                50% { opacity: 0.3; transform: scale(1.5); }
                100% { opacity: 0; transform: scale(2); }
              }
            </style>
          </defs>
          <circle cx="16" cy="16" r="18" class="pulse-ring-search" fill="none" stroke="${color}" stroke-width="2"/>
          <circle cx="16" cy="16" r="12" class="flash-marker" fill="${color}" stroke="white" stroke-width="3"/>
          <circle cx="16" cy="16" r="6" fill="white"/>
        </svg>
      `)}`,
      scaledSize: new google.maps.Size(32, 32),
      anchor: new google.maps.Point(16, 16)
    },
    zIndex: 1000, // High z-index to appear above other markers
  });

  // Auto-remove after duration and replace with normal marker
  setTimeout(() => {
    if (marker.getMap()) {
      // Replace with normal marker
      marker.setIcon({
        url: `data:image/svg+xml,${encodeURIComponent(`
          <svg width="${MAP_CONFIG.markers.defaultSize}" height="${MAP_CONFIG.markers.defaultSize}" viewBox="0 0 ${MAP_CONFIG.markers.defaultSize} ${MAP_CONFIG.markers.defaultSize}" xmlns="http://www.w3.org/2000/svg">
            <circle cx="${MAP_CONFIG.markers.defaultSize/2}" cy="${MAP_CONFIG.markers.defaultSize/2}" r="${MAP_CONFIG.markers.defaultSize/2 - 2}" fill="${color}" stroke="white" stroke-width="2"/>
          </svg>
        `)}`,
        scaledSize: new google.maps.Size(MAP_CONFIG.markers.defaultSize, MAP_CONFIG.markers.defaultSize),
        anchor: new google.maps.Point(MAP_CONFIG.markers.defaultSize/2, MAP_CONFIG.markers.defaultSize/2)
      });
      marker.setZIndex(100); // Normal z-index
      options.onComplete?.();
    }
  }, duration);

  return marker;
};

// Create standardized info window content
export const createStandardInfoWindow = (
  title: string,
  content: string,
  metadata?: {
    uac?: string;
    type?: string;
    verified?: boolean;
    coordinates?: { lat: number; lng: number };
  },
  translations?: {
    coordinates?: string;
    clickMarkerForFullDetails?: string;
  }
): google.maps.InfoWindow => {
  const t = translations || {
    coordinates: 'Coordinates',
    clickMarkerForFullDetails: 'Click marker for full details'
  };

  const infoContent = `
    <div style="padding: 8px; font-family: Arial, sans-serif; min-width: 200px;">
      <div style="font-weight: 600; margin-bottom: 4px; color: #111;">${title}</div>
      <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">${content}</div>
      ${metadata?.uac ? `<div style="font-size: 12px; color: #1d4ed8; font-weight: 600; margin-bottom: 4px;">UAC: ${metadata.uac}</div>` : ''}
      ${metadata?.type ? `<div style="font-size: 11px; color: #6b7280; text-transform: capitalize; margin-bottom: 4px;">${metadata.type}</div>` : ''}
      ${metadata?.verified !== undefined ? `
        <div style="margin-bottom: 4px;">
          <span style="font-size: 10px; padding: 2px 6px; border-radius: 3px; ${metadata.verified ? 'background: #dcfce7; color: #16a34a;' : 'background: #fef3c7; color: #d97706;'}">
            ${metadata.verified ? '✓ Verified' : '⚠ Unverified'}
          </span>
        </div>
      ` : ''}
      ${metadata?.coordinates ? `<div style="font-size: 10px; color: #9ca3af; margin-top: 4px;">${t.coordinates}: ${metadata.coordinates.lat.toFixed(6)}, ${metadata.coordinates.lng.toFixed(6)}</div>` : ''}
      <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">${t.clickMarkerForFullDetails}</div>
    </div>
  `;

  return new google.maps.InfoWindow({ content: infoContent });
};

// Standard legend configuration
export const STANDARD_LEGEND = {
  title: 'Points of Interest',
  items: [
    { color: MAP_CONFIG.markers.colors.commercial, label: 'Commercial' },
    { color: MAP_CONFIG.markers.colors.landmark, label: 'Landmark' },
    { color: MAP_CONFIG.markers.colors.government, label: 'Government' },
    { color: MAP_CONFIG.markers.colors.industrial, label: 'Industrial' },
    { color: MAP_CONFIG.markers.colors.residential, label: 'Residential' },
    { color: MAP_CONFIG.markers.colors.currentLocation, label: 'Your Location', special: true },
  ]
};

// Map type toggle functionality
export const createMapTypeToggle = (map: google.maps.Map) => {
  return () => {
    const currentType = map.getMapTypeId();
    map.setMapTypeId(
      currentType === google.maps.MapTypeId.ROADMAP 
        ? google.maps.MapTypeId.SATELLITE 
        : google.maps.MapTypeId.ROADMAP
    );
  };
};