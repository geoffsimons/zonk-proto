import Box from '@/components/Box';
import { RigidDie } from '@/components/Die';
import LoadingView from '@/components/LoadingView';
import OutOfBounds from '@/components/OutOfBounds';
import { calculateCameraPositionFromAngles } from '@/lib/math';
import type { OrbitControlsChangeEvent } from '@react-three/drei/core';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei/native';
import { Canvas } from '@react-three/fiber/native';
import { Physics } from '@react-three/rapier';
import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { Button, StyleSheet, View } from 'react-native';

const GRAVITY = -9.81;

interface DieState {
  id: string;
  origin: [number, number, number];
  initialVelocity: [number, number, number];
  isResting: boolean;
  result: number;
  isSpaz: boolean;
}

interface PlayfieldState {
  isSpaz: boolean;
  isResting: boolean;
  dice: DieState[];
}

interface PlayfieldProps {
  onPlayfieldStateChange: (state: PlayfieldState) => void;
  playfieldState: PlayfieldState;
}

function Playfield({ onPlayfieldStateChange, playfieldState }: PlayfieldProps) {
  const handleOutOfBounds = () => {
    console.log('Spaz!');
    onPlayfieldStateChange({
      ...playfieldState,
      dice: playfieldState.dice.map((die) => ({ ...die, isSpaz: true })),
      isSpaz: true,
    });
  };

  const handleDieRest = (id: string, result: number) => {
    console.log('Rest', result);
    const allResting = playfieldState.dice.every((die) => die.isResting);
    onPlayfieldStateChange({
      ...playfieldState,
      dice: playfieldState.dice.map((die) => die.id === id ? { ...die, isResting: true, result } : die),
      isResting: allResting,
    });
  };

  return (
    <Physics gravity={[0, GRAVITY, 0]}>
      {playfieldState.dice.map((die) => (
        <RigidDie
          key={die.id}
          id={die.id}
          origin={die.origin}
          initialVelocity={die.initialVelocity}
          onRest={handleDieRest}
        />
      ))}
      <Box />
      <OutOfBounds onOutOfBounds={handleOutOfBounds} />
    </Physics>
  )
}

// The minimum magnitude of the initial velocity.
const MIN_VELOCITY = 5;
// The maximum magnitude of the initial velocity.
const MAX_VELOCITY = 25;

// TODO: Use angular deviation instead of linear deviation.
const MAX_DEVIATION = 5;

function calculateInitialVelocity(power: number, accuracy: number, origin: [number, number, number]): [number, number, number] {
  console.log('Calculating initial velocity with power:', power, 'and accuracy:', accuracy, 'and origin:', origin);
  // The perfect initial velocity has x and z components that point from the origin to 0,0. The y component is 0.
  // Power maps to the magnitude of the velocity. Power of 100 yields MAX_VELOCITY. Power of 0 yields MIN_VELOCITY.
  const magnitude = MIN_VELOCITY + (MAX_VELOCITY - MIN_VELOCITY) * power / 100;
  console.log('Magnitude', magnitude);

  // Calculate the direction of the velocity with some randomness based on the accuracy.

  const deviation = MAX_DEVIATION * accuracy;
  console.log('Deviation magnitude', deviation);

  const [x, y, z] = origin;

  const target = [0, 0, 0];
  const deviatedTarget = [
    target[0] + (-0.5 + Math.random()) * deviation,
    target[1] + (-0.5 + Math.random()) * deviation,
    target[2] + (-0.5 + Math.random()) * deviation,
  ];

  console.log('Deviated target', deviatedTarget);

  const direction = [
    deviatedTarget[0] - x,
    deviatedTarget[1] - y,
    deviatedTarget[2] - z,
  ];

  console.log('Direction', direction);

  const directionLength = Math.sqrt(direction[0]**2 + direction[1]**2 + direction[2]**2);

  const normalizedDirection = [direction[0] / directionLength, direction[1] / directionLength, direction[2] / directionLength];
  console.log('Normalized direction', normalizedDirection);

  const velocityX = magnitude * (normalizedDirection[0]);
  const velocityY = magnitude * (normalizedDirection[1]);
  const velocityZ = magnitude * (normalizedDirection[2]);

  const velocity = [velocityX, velocityY, velocityZ];
  console.log('Velocity', velocity);
  return velocity as [number, number, number];
}

const INITIAL_CAMERA_POSITION = [0, 20, 20] as [number, number, number];

function SceneView() {
  const [origin, setOrigin] = useState<[number, number, number]>(INITIAL_CAMERA_POSITION);
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const [playfieldState, setPlayfieldState] = useState<PlayfieldState>({
    isSpaz: false,
    isResting: false,
    dice: [],
  });

  // When the camera is moved, update the origin
  const handleOrbitControlsChange = useCallback((event?: OrbitControlsChangeEvent) => {
    if (event?.target?.position0) {
      const azimuth = event.target.getAzimuthalAngle();
      const polar = event.target.getPolarAngle();
      // console.log('Azimuth', azimuth);
      // console.log('Polar', polar);
      const newPosition = calculateCameraPositionFromAngles(origin, azimuth, polar);
      // console.log('New position', newPosition);
      setOrigin(newPosition);
    }
  }, [setOrigin]);

  const handlePlayfieldStateChange = (state: PlayfieldState) => {
    setPlayfieldState(state);
  };

  const throwDie = useCallback(() => {
    const nextId = playfieldState.dice.length + 1;
    const id = `die-${nextId}`;
    // Clone the origin
    const dieOrigin = origin.slice() as [number, number, number];
    const power = 80;
    const accuracy = 0.6;

    const initialVelocity = calculateInitialVelocity(power, accuracy, origin);

    const newDie: DieState = { id, origin: dieOrigin, initialVelocity, isResting: false, result: 0, isSpaz: false };

    console.log('Throwing die', newDie);

    setPlayfieldState({
      ...playfieldState,
      dice: [...playfieldState.dice, newDie],
    });
  }, [playfieldState, origin]);

  useEffect(() => {
    // Give Canvas a moment to initialize and render
    const timer = setTimeout(() => {
      setIsCanvasReady(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.canvasContainer}>
      {!isCanvasReady && <LoadingView />}
      <Canvas style={styles.canvas}>
        <ambientLight intensity={0.1} />
        <pointLight position={[10, 15, 10]} intensity={50}/>
        <pointLight position={[-10, 15, 10]} intensity={50}/>
        <pointLight position={[-10, 15, -10]} intensity={50}/>

        <Suspense fallback={null}>
          <Playfield onPlayfieldStateChange={handlePlayfieldStateChange} playfieldState={playfieldState} />
        </Suspense>

        <OrbitControls
          makeDefault
          enablePan={false}
          maxPolarAngle={Math.PI / 2.1}
          onChange={handleOrbitControlsChange}
        />
        <PerspectiveCamera makeDefault position={INITIAL_CAMERA_POSITION} />
      </Canvas>
      <View style={styles.buttonContainer}>
        <Button title="Throw Die" onPress={throwDie} />
      </View>
    </View>
  )
}

export default function PhysicsPage() {
  return (
    <View style={styles.container}>
      <SceneView />
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    zIndex: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  canvasContainer: {
    flex: 1,
    position: 'relative',
  },
  canvas: {
    flex: 1,
  },
});
