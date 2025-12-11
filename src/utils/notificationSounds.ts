// Web Audio API sound generation for notification alerts

type SoundType = 'critical' | 'high' | 'normal';

let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

export const generateAlertTone = (type: SoundType, volume: number): void => {
  try {
    const ctx = getAudioContext();
    
    // Resume context if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const gainNode = ctx.createGain();
    gainNode.connect(ctx.destination);
    gainNode.gain.value = Math.max(0, Math.min(1, volume));

    const now = ctx.currentTime;

    switch (type) {
      case 'critical':
        // Urgent double beep - two-tone alert repeated
        playTone(ctx, gainNode, 800, now, 0.15);
        playTone(ctx, gainNode, 1000, now + 0.2, 0.15);
        playTone(ctx, gainNode, 800, now + 0.5, 0.15);
        playTone(ctx, gainNode, 1000, now + 0.7, 0.15);
        break;
      
      case 'high':
        // Single alert tone - attention grabbing
        playTone(ctx, gainNode, 600, now, 0.3);
        break;
      
      case 'normal':
        // Soft chime - subtle notification
        playTone(ctx, gainNode, 440, now, 0.15, 'sine');
        playTone(ctx, gainNode, 554, now + 0.1, 0.15, 'sine');
        break;
    }
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
};

const playTone = (
  ctx: AudioContext,
  gainNode: GainNode,
  frequency: number,
  startTime: number,
  duration: number,
  waveType: OscillatorType = 'square'
): void => {
  const oscillator = ctx.createOscillator();
  const envelope = ctx.createGain();
  
  oscillator.type = waveType;
  oscillator.frequency.value = frequency;
  
  envelope.gain.setValueAtTime(0, startTime);
  envelope.gain.linearRampToValueAtTime(gainNode.gain.value, startTime + 0.01);
  envelope.gain.linearRampToValueAtTime(0, startTime + duration);
  
  oscillator.connect(envelope);
  envelope.connect(ctx.destination);
  
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.01);
};

export const getPriorityFromLevel = (level: number): SoundType => {
  if (level === 1) return 'critical';
  if (level === 2) return 'high';
  return 'normal';
};
