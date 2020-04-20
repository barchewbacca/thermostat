import React from 'react';
import styles from './App.module.scss';
import Thermostat from './../Thermostat/Thermostat';

const App = () => (
  <div className={styles.App}>
    <Thermostat />
  </div>
);

export default App;
