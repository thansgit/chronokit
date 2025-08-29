import React from 'react';
import { Text, TextStyle } from 'react-native';
import { formatClock } from '@/helpers/format';

interface TimeDisplayProps {
  seconds: number;
  style?: TextStyle | TextStyle[];
}

/**
 * Uses formatClock helper for time formatting
 */

export function TimeDisplay({ seconds, style }: TimeDisplayProps) {
  return <Text style={style}>{formatClock(seconds)}</Text>;
}
