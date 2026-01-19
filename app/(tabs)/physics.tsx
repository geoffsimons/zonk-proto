import Box from '@/components/Box';
import { RigidDie } from '@/components/Die';
import LoadingView from '@/components/LoadingView';
import OutOfBounds from '@/components/OutOfBounds';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei/native';
import { Canvas } from '@react-three/fiber/native';
import type { RapierRigidBody } from '@react-three/rapier';
import { Physics } from '@react-three/rapier';
import React, { Suspense, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

const GRAVITY = -9.81;

function Playfield() {
  const ballRef = useRef<RapierRigidBody>(null);

  const handleOutOfBounds = () => {
    console.log('Spaz!');
    ballRef.current?.sleep();
  };

  const handleDieRest = (result: number) => {
    console.log('Rest', result);
  };

  return (
    <Physics gravity={[0, GRAVITY, 0]}>
      {/* <Ball id="ball" ref={ballRef} handleRest={handleRest} /> */}
      <RigidDie onRest={handleDieRest} />
      <Box />
      <OutOfBounds onOutOfBounds={handleOutOfBounds} />
    </Physics>
  )
}

function SceneView() {
  const [isCanvasReady, setIsCanvasReady] = useState(false);

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
          <Playfield />
        </Suspense>

        <OrbitControls enablePan={false} />
        <PerspectiveCamera makeDefault position={[0, 20, 20]} />
      </Canvas>
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
