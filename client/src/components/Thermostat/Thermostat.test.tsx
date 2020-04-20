import React from 'react';
import { cleanup, fireEvent, render, waitForElement } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Thermostat from './Thermostat';
import fetchMock from 'fetch-mock';

const URL = 'http://localhost:9090/';

describe('<Thermostat />', () => {
  afterEach(cleanup);

  beforeEach(() => {
    const mockData = {
      currentSetpoint: 22,
      currentTemp: 18,
      timestamp: 1587384922990,
    };

    fetchMock
      .get(URL, mockData, { overwriteRoutes: false })
      .patch(URL, 200, { overwriteRoutes: false });
  });

  it('should mount', async () => {
    const { getByTestId } = await waitForElement(() => render(<Thermostat />));
    const thermostat = await waitForElement(() => getByTestId('thermostat'));

    expect(thermostat).toBeInTheDocument();
  });

  it('should increment and decrement the setpoint by 0.5', async () => {
    const { getByTestId } = await waitForElement(() => render(<Thermostat />));
    const increment = await waitForElement(() => getByTestId('increment-btn'));
    const decrement = await waitForElement(() => getByTestId('decrement-btn'));
    const setpoint = await waitForElement(() => getByTestId('setpoint'));

    fireEvent.click(increment);
    fireEvent.click(increment);
    fireEvent.click(increment);
    fireEvent.click(increment);
    fireEvent.click(decrement);

    expect(setpoint.textContent).toBe('23.5°');
  });
});
