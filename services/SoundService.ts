import { useSoundStore } from "@/stores/useSoundStore";
import { SoundCue, SoundEffectId } from "@/types";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";

class SoundService {
  private sounds: Record<string, Audio.Sound> = {};

  // Get mute state from the store
  private get isMuted(): boolean {
    return useSoundStore.getState().isMuted;
  }

  // Get volume from the store
  private get volume(): number {
    return useSoundStore.getState().volume;
  }

  constructor() {
    this.preloadSounds();
  }

  // Preload common sounds for better performance
  async preloadSounds() {
    try {
      // These paths are placeholders - need to add actual sound files
      const soundsToLoad: Record<string, any> = {
        beep: require("../assets/sounds/beep.mp3"),
        gong: require("../assets/sounds/gong.wav"),
        bell: require("../assets/sounds/bell.wav"),
        complete: require("../assets/sounds/complete.wav"),
      };

      for (const [key, source] of Object.entries(soundsToLoad)) {
        const { sound } = await Audio.Sound.createAsync(source);
        this.sounds[key] = sound;
      }

      console.log("Sounds preloaded successfully");
    } catch (error) {
      console.error("Failed to preload sounds:", error);
    }
  }

  // Play a preloaded sound
  async playSound(soundId: SoundEffectId) {
    if (this.isMuted) return;

    try {
      const sound = this.sounds[soundId];
      if (sound) {
        // Stop and rewind before playing
        await sound.stopAsync().catch(() => {});
        await sound.setPositionAsync(0);
        await sound.playAsync();
      } else {
        console.warn(`Sound ${soundId} not found`);
      }
    } catch (error) {
      console.error(`Error playing sound ${soundId}:`, error);
    }
  }

  // Play text-to-speech
  async speak(text: string, options: Speech.SpeechOptions = {}) {
    if (this.isMuted) return;

    try {
      // Stop any current speech
      Speech.stop();

      // Default options
      const speechOptions = {
        language: "en-US",
        pitch: 1.0,
        rate: 0.9,
        ...options,
      };

      await Speech.speak(text, speechOptions);
    } catch (error) {
      console.error("Error with text-to-speech:", error);
    }
  }

  // Play a sound cue (either sound or TTS)
  async playCue(soundCue?: SoundCue) {
    if (!soundCue || this.isMuted) return;

    try {
      if (soundCue.type === "sound") {
        await this.playSound(soundCue.soundId as SoundEffectId);
      } else if (soundCue.type === "tts") {
        await this.speak(soundCue.text, soundCue.options);
      }
    } catch (error) {
      console.error("Error playing sound cue:", error);
    }
  }

  // Toggle mute status using the store
  toggleMute() {
    const newMuteState = useSoundStore.getState().toggleMute();
    if (newMuteState) {
      Speech.stop();
      // Stop all playing sounds
      Object.values(this.sounds).forEach((sound) => {
        sound.stopAsync().catch(() => {});
      });
    }
    return newMuteState;
  }

  // Set mute status directly using the store
  setMute(muted: boolean) {
    useSoundStore.getState().setMute(muted);
    if (muted) {
      Speech.stop();
    }
    return muted;
  }

  // Set volume using the store
  setVolume(volume: number) {
    useSoundStore.getState().setVolume(volume);
    // Apply volume to all sounds
    Object.values(this.sounds).forEach((sound) => {
      sound.setVolumeAsync(volume).catch(() => {});
    });
    return volume;
  }

  // Clean up resources
  async unloadSounds() {
    try {
      for (const sound of Object.values(this.sounds)) {
        await sound.unloadAsync();
      }
      this.sounds = {} as Record<string, Audio.Sound>;
    } catch (error) {
      console.error("Error unloading sounds:", error);
    }
  }
}

// Create a singleton instance
export const soundService = new SoundService();
