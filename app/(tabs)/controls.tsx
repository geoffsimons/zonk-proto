/**
 * This page is for prototyping the controls.
 * It will allow the user to control the die and see the results.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
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

/**
 *
 * @param onAccuracyChange - The callback to update the accuracy
 * @param timeToFull - The time it takes to go from 0 to 1 in milliseconds
 * @returns
 */
function AccuracyControl({ onAccuracyChange, timeToFull }: { onAccuracyChange: (accuracy: number) => void, timeToFull: number }) {
  const [accuracy, setAccuracy] = useState(0.0);
  const [isAccuracyRunning, setIsAccuracyRunning] = useState(false);
  const directionRef = useRef<number>(1); // 1 for increasing, -1 for decreasing
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const isRunningRef = useRef<boolean>(false); // Use ref to track running state for animation loop

  const handleAccuracyChange = useCallback((newAccuracy: number) => {
    onAccuracyChange(newAccuracy);
  }, [onAccuracyChange]);

  const stepAccuracy = useCallback((currentTime: number) => {
    // Double-check running state at the very start
    if (!isRunningRef.current) return;

    setAccuracy((prevAccuracy) => {
      // Triple-check running state before updating (in case stop was called during this frame)
      if (!isRunningRef.current) {
        return prevAccuracy; // Don't update if stopped
      }

      const deltaAccuracy = (currentTime - lastTimeRef.current) / timeToFull;
      lastTimeRef.current = currentTime;

      let newAccuracy = prevAccuracy + (directionRef.current * deltaAccuracy);
      // Clamp to bounds
      if (newAccuracy >= 1.0) {
        newAccuracy = 1.0;
        directionRef.current = -1;
      } else if (newAccuracy <= 0.0) {
        newAccuracy = 0.0;
        directionRef.current = 1;
      }

      // Update parent callback with new value
      handleAccuracyChange(newAccuracy);

      return newAccuracy;
    });

    // Only schedule next frame if still running
    if (isRunningRef.current) {
      animationFrameRef.current = requestAnimationFrame(stepAccuracy);
    }
  }, [handleAccuracyChange, timeToFull]);

  const startAccuracy = useCallback(() => {
    console.log('Starting accuracy');
    setAccuracy(0.0);
    isRunningRef.current = true;
    setIsAccuracyRunning(true);
    directionRef.current = 1;
    lastTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(stepAccuracy);
  }, [stepAccuracy]);

  const stopAccuracy = useCallback(() => {
    console.log('Stopping accuracy');
    // Set running flag FIRST to prevent any pending frames from updating
    isRunningRef.current = false;
    // Cancel any pending animation frame immediately
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    // Update UI state
    setIsAccuracyRunning(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

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
      <AccuracyControl onAccuracyChange={onAccuracyChange} timeToFull={500} />
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
    height: 20,
    backgroundColor: '#fff',
  },
  accuracyMeterBarInner: {
    width: '100%',
    height: 20,
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