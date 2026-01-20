/**
 * This page is for prototyping the controls.
 * It will allow the user to control the die and see the results.
 */

import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import AccuracyControl from '@/components/AccuracyControl';
import PowerControl from '@/components/PowerControl';

function InfoPanel({ accuracy, power }: { accuracy: number, power: number }) {
  return (
    <View style={styles.infoPanel}>
      <View>
        <Text>Power</Text>
        <Text>{power}</Text>
      </View>
      <View>
        <Text>Accuracy</Text>
        <Text>{accuracy.toFixed(2)}</Text>
      </View>
    </View>
  );
}

const MIN_TIME_TO_FULL = 250;
const MAX_TIME_TO_FULL = 2000;

const TIME_TO_FULL_RANGE = MAX_TIME_TO_FULL - MIN_TIME_TO_FULL;

function ControlPanel({ initialPower, onPowerChange, onAccuracyChange }: { initialPower: number, onPowerChange: (power: number) => void, onAccuracyChange: (accuracy: number) => void }) {

  const [timeToFull, setTimeToFull] = useState(MIN_TIME_TO_FULL);

  const handlePowerChange = (value: number) => {
    onPowerChange(value);
    setTimeToFull(MAX_TIME_TO_FULL - (TIME_TO_FULL_RANGE * value / 100));
  };

  return (
    <View style={styles.controlPanel}>
      <PowerControl initialPower={initialPower} onPowerChange={handlePowerChange} />
      <AccuracyControl onAccuracyChange={onAccuracyChange} timeToFull={timeToFull} />
    </View>
  );
}

export default function ControlsPage() {
  const [accuracy, setAccuracy] = useState(0.0);
  const [power, setPower] = useState(50);

  return (
    <View style={styles.container}>
      <InfoPanel accuracy={accuracy} power={power} />
      <ControlPanel initialPower={power} onPowerChange={setPower} onAccuracyChange={setAccuracy} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  infoPanel: {
    flex: 1,
    backgroundColor: '#fff',
  },
  controlPanel: {
    flex: 1,
    backgroundColor: '#25292e',
    height: 50,
  },
});