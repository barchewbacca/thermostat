import React, { useEffect, useRef, useState } from 'react';
import styles from './Thermostat.module.scss';
import { empty, iif, Observable, timer } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';
import { expand, filter, switchMap } from 'rxjs/operators';

interface State {
  currentSetpoint: number;
  currentTemp: number;
  timestamp: number | null;
}

const initialState: State = {
  currentSetpoint: 0,
  currentTemp: 0,
  timestamp: null,
};

const URL = 'http://localhost:9090/';

const INTERVAL_IN_MS = 2000;

const RESPONSE_STATUS_CODE_ACCEPTED = 202;

let abortController = new AbortController();

const Thermostat: React.FC = () => {
  /**
   * State Hook which declares new state variables.
   */
  const [{ currentSetpoint, currentTemp, timestamp }, setState] = useState(initialState);

  /**
   * Instance variable that indicates whether there is a pending update request.
   */
  const isUpdatePending = useRef(false);

  /**
   * Effect Hook which sets up an interval for fetching data and updates the state.
   */
  useEffect(() => {
    timer(0, INTERVAL_IN_MS)
      .pipe(
        switchMap(() => fromFetch(URL)),
        expand((res) => iif(() => isValidResponse(res), fromFetch(URL), empty())),
        filter((res) => !isValidResponse(res)),
        switchMap((res) => res.json()),
      )
      .subscribe((res) => {
        setState((prevState) => ({
          ...res,
          ...(isUpdatePending.current && { currentSetpoint: prevState.currentSetpoint }),
        }));
      });
  }, []);

  /**
   * Validates the response from the server.
   * @param res A response that needs to be validated.
   */
  const isValidResponse = (res: Response): boolean => res.status === RESPONSE_STATUS_CODE_ACCEPTED;

  /**
   * Updates the state with a new setpoint value, cancels previous pending api requests
   * and sends api request with the updated value.
   * @param newSetpoint A new setpoint that needs to be set.
   */
  const updateSetpoint = (newSetpoint: number) => {
    if (isUpdatePending.current) {
      abortController.abort();
      abortController = new AbortController();
    }

    isUpdatePending.current = true;

    setState((prevState) => ({
      ...prevState,
      currentSetpoint: newSetpoint,
    }));

    sendUpdate(newSetpoint).subscribe(
      () => (isUpdatePending.current = false),
      (error) => {
        console.info(`${error.name}: ${error.message}`);
      },
    );
  };

  /**
   * Does a fetch api request in order to update the setpoint and returns an Observable with a response.
   * @param newSetpoint A new setpoint that needs to be set.
   */
  const sendUpdate = (newSetpoint: number): Observable<Response> =>
    fromFetch(URL, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentSetpoint: newSetpoint }),
      signal: abortController.signal,
    });

  /**
   * Formats timestamp and returns a string in a format of "hh:mm:ss".
   * @param value A timestamp that needs to be formatted.
   */
  const formatTimestamp = (value: number): string => {
    const date = new Date(value);
    const hours = formatTimeUnits(date.getHours());
    const minutes = formatTimeUnits(date.getMinutes());
    const seconds = formatTimeUnits(date.getSeconds());
    return `${hours}:${minutes}:${seconds}`;
  };

  /**
   * Formats time units converting number to string and filling empty decimal place with "0".
   * @param value A time unit value that needs to be formatted.
   */
  const formatTimeUnits = (value: number): string => value.toString().padStart(2, '0');

  return (
    <div className={styles.thermostat} data-testid="thermostat">
      <div className={styles.content}>
        <span className={styles.current} data-testid="current-temp">
          {currentTemp}°
        </span>
        <span className={styles.setpoint} data-testid="setpoint">
          {currentSetpoint.toFixed(1)}°
        </span>
        <span className={styles.timestamp}>
          Last update: {timestamp && <strong>{formatTimestamp(timestamp)}</strong>}
        </span>
        <button
          className={`${styles.btn} ${styles.left}`}
          onClick={() => updateSetpoint(currentSetpoint - 0.5)}
          data-testid="decrement-btn"
        >
          -
        </button>
        <button
          className={`${styles.btn} ${styles.right}`}
          onClick={() => updateSetpoint(currentSetpoint + 0.5)}
          data-testid="increment-btn"
        >
          +
        </button>
      </div>
    </div>
  );
};

export default Thermostat;
