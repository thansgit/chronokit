import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TimeNumPadProps {
  onPress: (value: string) => void;
  onDelete: () => void;
}

export const TimeNumPad: React.FC<TimeNumPadProps> = ({ onPress, onDelete }) => {
  const renderButton = (value: string) => (
    <TouchableOpacity
      style={styles.button}
      onPress={() => onPress(value)}
      activeOpacity={0.7}
    >
      <Text style={styles.buttonText}>{value}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {renderButton('1')}
        {renderButton('2')}
        {renderButton('3')}
      </View>
      <View style={styles.row}>
        {renderButton('4')}
        {renderButton('5')}
        {renderButton('6')}
      </View>
      <View style={styles.row}>
        {renderButton('7')}
        {renderButton('8')}
        {renderButton('9')}
      </View>
      <View style={styles.row}>
        {renderButton('00')}
        {renderButton('0')}
        <TouchableOpacity
          style={styles.button}
          onPress={onDelete}
          activeOpacity={0.7}
        >
          <Ionicons name="backspace-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 300,
    marginTop: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '500',
  },
});
