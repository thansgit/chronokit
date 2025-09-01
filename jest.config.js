module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-svg|expo|@expo|expo-.*)/)'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/__tests__/jest.setup.ts'],
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
};
