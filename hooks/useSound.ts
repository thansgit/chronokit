import { useCallback } from 'react';
import { useSoundStore } from '@/stores/useSoundStore';
import { soundService } from '@/services/SoundService';
import { SoundCue, SoundEffectId } from '@/types';

/**
 * Custom hook for sound functionality
 */
export function useSound() {
  const isMuted = useSoundStore((state) => state.isMuted);
  const volume = useSoundStore((state) => state.volume);
  
  // Toggle mute state
  const toggleMute = useCallback(() => {
    return soundService.toggleMute();
  }, []);
  
  // Set mute state
  const setMute = useCallback((muted: boolean) => {
    return soundService.setMute(muted);
  }, []);
  
  // Set volume
  const setVolume = useCallback((volume: number) => {
    return soundService.setVolume(volume);
  }, []);
  
  // Play a sound by ID
  const playSound = useCallback((soundId: SoundEffectId) => {
    return soundService.playSound(soundId);
  }, []);
  
  // Play a sound cue
  const playCue = useCallback((soundCue?: SoundCue) => {
    return soundService.playCue(soundCue);
  }, []);
  
  return {
    isMuted,
    volume,
    toggleMute,
    setMute,
    setVolume,
    playSound,
    playCue
  };
}
