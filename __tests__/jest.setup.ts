// Jest global setup for React Native/Expo environment
// Mock AsyncStorage native module with provided Jest mock
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Mock Ionicons to avoid act() warnings due to internal async font/state updates
jest.mock('@expo/vector-icons/Ionicons', () => {
  const React = require('react');
  return (props: any) => React.createElement('Icon', props);
});
