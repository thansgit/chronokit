import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface TimeInputProps {
  hours: string;
  minutes: string;
  seconds: string;
}

export const TimeInput: React.FC<TimeInputProps> = ({ hours, minutes, seconds }) => {
  // Check if each segment has a non-zero value
  const hoursValue = parseInt(hours || '0', 10);
  const minutesValue = parseInt(minutes || '0', 10);
  const secondsValue = parseInt(seconds || '0', 10);
  
  // A segment is active only if it has a non-zero value
  const isHoursActive = hoursValue > 0;
  const isMinutesActive = minutesValue > 0;
  const isSecondsActive = secondsValue > 0;
  
  return (
    <View style={styles.container}>
      <View style={styles.timeContainer}>
        <Text style={[styles.timeText, isHoursActive ? styles.activeText : styles.inactiveText]}>
          {hours.padStart(2, '0')}h
        </Text>
        <Text style={[styles.timeText, isMinutesActive ? styles.activeText : styles.inactiveText]}>
          {minutes.padStart(2, '0')}m
        </Text>
        <Text style={[styles.timeText, isSecondsActive ? styles.activeText : styles.inactiveText]}>
          {seconds.padStart(2, '0')}s
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 30,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginHorizontal: 4,
  },
  activeText: {
    color: '#ffd33d', // Highlight color (matches tab active color)
  },
  inactiveText: {
    color: '#888', // Grey color for inactive segments
  },
});
