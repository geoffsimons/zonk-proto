/**
 * This page is for prototyping the controls.
 * It will allow the user to control the die and see the results.
 */

import React, { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import AccuracyControl from '@/components/AccuracyControl';
import PowerControl from '@/components/PowerControl';

function InfoPanel({ accuracy, power }: { accuracy: number, power: number }) {
  return (
    <View style={styles.infoPanel}>
      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>Power</Text>
        <Text style={styles.infoValue}>{power}</Text>
      </View>
      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>Accuracy</Text>
        <Text style={styles.infoValue}>{accuracy.toFixed(2)}</Text>
      </View>
    </View>
  );
}

const MIN_TIME_TO_FULL = 250;
const MAX_TIME_TO_FULL = 2000;

const TIME_TO_FULL_RANGE = MAX_TIME_TO_FULL - MIN_TIME_TO_FULL;

function ControlPanel({ initialPower, onPowerChange, onAccuracyChange, enabled = true }: { initialPower: number, onPowerChange: (power: number) => void, onAccuracyChange: (accuracy: number) => void, enabled?: boolean }) {

  const [timeToFull, setTimeToFull] = useState(MIN_TIME_TO_FULL);

  const handlePowerChange = (value: number) => {
    if (!enabled) return; // Prevent changes when disabled
    onPowerChange(value);
    setTimeToFull(MAX_TIME_TO_FULL - (TIME_TO_FULL_RANGE * value / 100));
  };

  const handleAccuracyChange = (value: number) => {
    if (!enabled) return; // Prevent changes when disabled
    onAccuracyChange(value);
  };

  return (
    <View style={styles.controlPanel}>
      <View style={[styles.controlsWrapper, !enabled && styles.controlsWrapperDisabled]} pointerEvents={enabled ? 'auto' : 'none'}>
        <PowerControl initialPower={initialPower} onPowerChange={handlePowerChange} />
        <AccuracyControl onAccuracyChange={handleAccuracyChange} timeToFull={timeToFull} />
      </View>
    </View>
  );
}

export default function ControlsPage() {
  const [accuracy, setAccuracy] = useState(0.0);
  const [power, setPower] = useState(50);
  const [enabled, setEnabled] = useState(true);

  return (
    <View style={styles.container}>
      <InfoPanel accuracy={accuracy} power={power} />
      <ControlPanel initialPower={power} onPowerChange={setPower} onAccuracyChange={setAccuracy} enabled={enabled} />
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>Enabled</Text>
        <Switch value={enabled} onValueChange={setEnabled} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    gap: 10,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    gap: 10,
  },
  toggleLabel: {
    color: '#fff',
  },
  infoLabel: {
    color: '#fff',
  },
  infoPanel: {
    flex: 1,
    flexDirection: 'column',
    width: '100%',
    backgroundColor: '#25292e',
    justifyContent: 'center',
    padding: 10,
    paddingHorizontal: 20,
    alignItems: 'flex-start',
    gap: 20,
    borderWidth: 1,
    borderColor: '#ffd33d',
    borderRadius: 10,
  },
  controlPanel: {
    flex: 1,
    backgroundColor: '#25292e',
    height: 50,
  },
  controlsWrapper: {
    flex: 1,
  },
  controlsWrapperDisabled: {
    opacity: 0.5,
  },
  infoValue: {
    color: '#ffd33d',
    fontSize: 20,
    fontWeight: 'bold',
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
});