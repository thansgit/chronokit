// Jest global setup for React Native/Expo environment
// Mock AsyncStorage native module with provided Jest mock
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);
