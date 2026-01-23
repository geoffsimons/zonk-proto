import Box from '@/components/Box';
import { RigidDie } from '@/components/Die';
import LoadingView from '@/components/LoadingView';
import OutOfBounds from '@/components/OutOfBounds';
import { calculateCameraPositionFromAngles, calculateInitialVelocity } from '@/lib/math';
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

    const initialVelocity = calculateInitialVelocity({ power, accuracy, origin: dieOrigin });

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
