import { OrbitControls, PerspectiveCamera } from '@react-three/drei/native';
import { Canvas } from '@react-three/fiber/native';
import type { RapierRigidBody } from '@react-three/rapier';
import { Physics, RigidBody } from '@react-three/rapier';
import React, { Suspense, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

function LoadingView() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#fff" />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  )
}

const GRAVITY = -9.81;

function ThrownBall() {
  const ballRef = useRef<RapierRigidBody>(null);

  const handleRest = () => {
    console.log('Rest');
  };

  return (
    <Physics gravity={[0, GRAVITY, 0]}>
      <RigidBody
        ref={ballRef}
        colliders="ball"
        position={[0, 10, 0]}
        // linearVelocity={[1, 0, 0]}
        restitution={0.8}
        onSleep={handleRest}
      >
        <mesh castShadow>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color="orange" />
        </mesh>
      </RigidBody>

      <RigidBody
        type="fixed"
        restitution={1}
      >
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="green" side={2} />
        </mesh>
      </RigidBody>
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
          <ThrownBall />
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
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#25292e',
    zIndex: 10,
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
  },
  text: {
    color: '#fff',
    padding: 10,
  },
});
