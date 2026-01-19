/**
 * This page is for prototyping the controls.
 * It will allow the user to control the die and see the results.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

import Slider from '@react-native-community/slider';

function PowerControl({ initialPower, onPowerChange }: { initialPower: number, onPowerChange: (power: number) => void }) {
  const handlePowerChange = (value: number) => {
    onPowerChange(value);
  };

  useEffect(() => {
    onPowerChange(initialPower);
  }, [initialPower]);

  return (
    <View style={styles.powerControl}>
      <Text style={styles.powerLabel}>Power</Text>
      <Slider
        style={styles.powerSlider}
        value={initialPower}
        onValueChange={handlePowerChange}
        minimumValue={0}
        maximumValue={100}
        step={1}
      />
    </View>
  );
}

function AccuracyMeter({ accuracy }: { accuracy: number }) {
  return (
    <View style={styles.accuracyMeterBar}>
      <View style={[styles.accuracyMeterBarInner, { width: `${accuracy * 100}%` }]} />
    </View>
  );
}

function AccuracyControl({ onAccuracyChange }: { onAccuracyChange: (accuracy: number) => void }) {
  const [accuracy, setAccuracy] = useState(0.0);
  const [isAccuracyRunning, setIsAccuracyRunning] = useState(false);
  const [isAccuracyIncreasing, setIsAccuracyIncreasing] = useState(true);

  const handleAccuracyChange = useCallback((accuracy: number) => {
    onAccuracyChange(accuracy);
  }, [onAccuracyChange]);

  const stepAccuracy = useCallback(() => {
    setAccuracy(isAccuracyIncreasing ? accuracy + 0.1 : accuracy - 0.1);
    handleAccuracyChange(accuracy);
    if (accuracy >= 1.0) {
      setIsAccuracyIncreasing(false);
    } else if (accuracy <= 0.0) {
      setIsAccuracyIncreasing(true);
    }
  }, [accuracy, isAccuracyIncreasing]);

  const startAccuracy = useCallback(() => {
    setAccuracy(0.0);
    setIsAccuracyRunning(true);
  }, []);

  const stopAccuracy = useCallback(() => {
    setIsAccuracyRunning(false);
  }, []);

  useEffect(() => {
    if (isAccuracyRunning) {
      const interval = setInterval(stepAccuracy, 50);
      return () => clearInterval(interval);
    }
  }, [isAccuracyRunning, stepAccuracy]);

  return (
    <View style={styles.accuracyControl}>
      <Text style={styles.accuracyLabel}>Accuracy</Text>
      <AccuracyMeter accuracy={accuracy} />
      {isAccuracyRunning ? <Button title="Stop" onPress={stopAccuracy} /> : <Button title="Start" onPress={startAccuracy} />}
    </View>
  );
}

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

function ControlPanel({ initialPower, onPowerChange, onAccuracyChange }: { initialPower: number, onPowerChange: (power: number) => void, onAccuracyChange: (accuracy: number) => void }) {

  return (
    <View style={styles.controlPanel}>
      <PowerControl initialPower={initialPower} onPowerChange={onPowerChange} />
      <AccuracyControl onAccuracyChange={onAccuracyChange} />
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
  accuracyControl: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  accuracyLabel: {
    color: '#fff',
  },
  accuracyMeterBar: {
    width: '100%',
    height: 10,
    backgroundColor: '#fff',
  },
  accuracyMeterBarInner: {
    width: '100%',
    height: 10,
    backgroundColor: 'red',
  },
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
  },
  powerControl: {
    flex: 1,
    backgroundColor: '#25292e',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    gap: 10,
  },
  powerLabel: {
    color: '#fff',
  },
  powerSlider: {
    width: 200,
    height: 40,
  },
});