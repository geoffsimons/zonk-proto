import React, { useCallback, useEffect, useRef, useState } from "react";

import { Button, StyleSheet, Text, View } from "react-native";

import AccuracyMeter from "@/components/AccuracyMeter";

/**
 *
 * @param onAccuracyChange - The callback to update the accuracy
 * @param timeToFull - The time it takes to go from 0 to 1 in milliseconds
 * @returns
 */
export default function AccuracyControl({ onAccuracyChange, timeToFull }: { onAccuracyChange: (accuracy: number) => void, timeToFull: number }) {
  console.log('timeToFull', timeToFull);
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

const styles = StyleSheet.create({
  accuracyControl: {
    flex: 1,
    backgroundColor: '#25292e',
    width: '100%',
    alignSelf: 'center',
    padding: 10,
    gap: 10,
  },
  accuracyLabel: {
    color: '#fff',
  },
});