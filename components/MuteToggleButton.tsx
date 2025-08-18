import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { soundService } from '../services/SoundService';

type Props = {
  size?: number;
  color?: string;
  style?: any;
};

export function MuteToggleButton({ size = 24, color = "#FFFFFF", style }: Props) {
  const [isMuted, setIsMuted] = useState(false);

  // Toggle mute state
  const toggleMute = () => {
    const newMuteState = soundService.toggleMute();
    setIsMuted(newMuteState);
  };

  return (
    <TouchableOpacity 
      onPress={toggleMute} 
      style={[styles.container, style]}
      accessibilityLabel={isMuted ? "Unmute sounds" : "Mute sounds"}
      accessibilityRole="button"
    >
      <Ionicons 
        name={isMuted ? "volume-mute" : "volume-high"} 
        size={size} 
        color={color} 
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
});
