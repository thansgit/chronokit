import React from 'react';
import { Text, TextStyle } from 'react-native';

interface FormattedTimeDisplayProps {
  seconds: number;
  style?: TextStyle | TextStyle[];
}

/**
 * Formats seconds into appropriate time display
 * - Under 60 seconds: just seconds (e.g., 45)
 * - 60 seconds to 3599: minutes:seconds (e.g., 1:30)
 * - 3600 and above: hours:minutes:seconds (e.g., 1:00:00)
 */
const formatTime = (seconds: number): string => {
  // Handle hours format (1:00:00)
  if (seconds >= 3600) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  // Handle minutes format (1:00)
  if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
  
  // Just seconds
  return seconds.toString();
};

export function FormattedTimeDisplay({ seconds, style }: FormattedTimeDisplayProps) {
  return <Text style={style}>{formatTime(seconds)}</Text>;
}
