import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

test('smoke: renders text', () => {
  render(React.createElement(Text, null, 'Hello'));
  expect(screen.getByText('Hello')).toBeTruthy();
});
