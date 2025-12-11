import { Capacitor } from '@capacitor/core';

export interface NavigationOptions {
  latitude: number;
  longitude: number;
  label?: string;
}

/**
 * Opens external navigation app with destination coordinates
 * Detects platform and uses appropriate URL scheme
 */
export const openNavigation = async (options: NavigationOptions): Promise<boolean> => {
  const { latitude, longitude, label } = options;
  
  if (!latitude || !longitude) {
    console.error('NavigationService: Invalid coordinates');
    return false;
  }

  const platform = Capacitor.getPlatform();
  const encodedLabel = encodeURIComponent(label || 'Destination');

  try {
    let url: string;

    if (platform === 'ios') {
      // iOS Maps app
      url = `maps://?daddr=${latitude},${longitude}&dirflg=d`;
    } else if (platform === 'android') {
      // Google Maps on Android (will open app if installed)
      url = `google.navigation:q=${latitude},${longitude}&mode=d`;
      
      // Try Google Maps first, fallback to geo: intent
      try {
        window.open(url, '_system');
        return true;
      } catch {
        url = `geo:${latitude},${longitude}?q=${latitude},${longitude}(${encodedLabel})`;
      }
    } else {
      // Web fallback - Google Maps in new tab
      url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;
    }

    window.open(url, '_blank');
    return true;
  } catch (error) {
    console.error('NavigationService: Failed to open navigation', error);
    return false;
  }
};

/**
 * Calculate approximate distance between two points using Haversine formula
 * Returns distance in kilometers
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (deg: number): number => deg * (Math.PI / 180);

/**
 * Estimate travel time based on distance
 * Assumes average urban speed of 30 km/h
 */
export const estimateTravelTime = (distanceKm: number): string => {
  const avgSpeedKmh = 30;
  const timeHours = distanceKm / avgSpeedKmh;
  const timeMinutes = Math.round(timeHours * 60);
  
  if (timeMinutes < 1) return '< 1 min';
  if (timeMinutes < 60) return `${timeMinutes} min`;
  
  const hours = Math.floor(timeMinutes / 60);
  const mins = timeMinutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

/**
 * Format distance for display
 */
export const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
};
