import { useState, useCallback, useEffect } from 'react';
import { generateAlertTone, getPriorityFromLevel } from '@/utils/notificationSounds';

const STORAGE_KEYS = {
  ENABLED: 'dispatcher-sound-enabled',
  VOLUME: 'dispatcher-sound-volume'
};

export const useNotificationSound = () => {
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.ENABLED);
    return stored !== 'false'; // Default to true
  });

  const [volume, setVolumeState] = useState<number>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.VOLUME);
    return stored ? parseFloat(stored) : 0.7; // Default 70%
  });

  // Persist sound enabled preference
  const setSoundEnabled = useCallback((enabled: boolean) => {
    setSoundEnabledState(enabled);
    localStorage.setItem(STORAGE_KEYS.ENABLED, String(enabled));
  }, []);

  // Persist volume preference
  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
    localStorage.setItem(STORAGE_KEYS.VOLUME, String(clampedVolume));
  }, []);

  // Play notification sound based on priority level
  const playNotificationSound = useCallback((priorityLevel: number) => {
    if (!soundEnabled) return;
    
    const soundType = getPriorityFromLevel(priorityLevel);
    generateAlertTone(soundType, volume);
  }, [soundEnabled, volume]);

  // Test sound function
  const testSound = useCallback((type: 'critical' | 'high' | 'normal' = 'high') => {
    generateAlertTone(type, volume);
  }, [volume]);

  return {
    soundEnabled,
    setSoundEnabled,
    volume,
    setVolume,
    playNotificationSound,
    testSound
  };
};
