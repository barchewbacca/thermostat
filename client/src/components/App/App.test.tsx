import React from 'react';
import { getByTestId, render } from '@testing-library/react';
import App from './App';

it('should render thermostat', () => {
  const { container } = render(<App />);
  const thermostatElement = getByTestId(container, 'thermostat');
  expect(thermostatElement).toBeInTheDocument();
});
