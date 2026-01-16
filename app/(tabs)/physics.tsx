import Box from '@/components/Box';
import LoadingView from '@/components/LoadingView';
import OutOfBounds from '@/components/OutOfBounds';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei/native';
import { Canvas } from '@react-three/fiber/native';
import type { RapierRigidBody } from '@react-three/rapier';
import { Physics, RigidBody } from '@react-three/rapier';
import React, { Suspense, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

const GRAVITY = -9.81;

function Playfield() {
  const ballRef = useRef<RapierRigidBody>(null);

  const handleRest = () => {
    console.log('Rest');
  };

  const handleOutOfBounds = () => {
    console.log('Spaz!');
    ballRef.current?.sleep();
  };

  return (
    <Physics gravity={[0, GRAVITY, 0]}>
      <RigidBody
        ref={ballRef}
        colliders="ball"
        position={[0, 10, 0]}
        linearVelocity={[5, 0, 0]}
        restitution={0.9}
        onSleep={handleRest}
      >
        <mesh castShadow>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color="orange" />
        </mesh>
      </RigidBody>

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
