import { OrbitControls, PerspectiveCamera } from '@react-three/drei/native';
import { Canvas } from '@react-three/fiber/native';
import React, { Suspense, useEffect, useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native';

function LoadingView() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#fff" />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  )
}

interface Ball {
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  radius: number;
  mass: number;
}

function BallView({ ball }: { ball: Ball }) {
  return (
    <mesh position={[ball.position.x, ball.position.y, ball.position.z]}>
      <sphereGeometry args={[ball.radius, 32, 32]} />
      <meshStandardMaterial color="red" />
    </mesh>
  )
}

// The Ground Plane
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="green" side={2} />
    </mesh>
  );
}

function SceneView({ ball }: { ball: Ball }) {
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
          <BallView ball={ball} />
          <Ground />
        </Suspense>

        <OrbitControls enablePan={false} />
        <PerspectiveCamera makeDefault position={[0, 20, 20]} />
      </Canvas>
    </View>
  )
}

const createInitialBall = (): Ball => {
  return {
    position: { x: 0, y: 10, z: 0 },
    velocity: { x: 0, y: 0, z: 0 },
    radius: 1,
    mass: 1,
  };
};

export default function PhysicsPage() {
  const [isRunning, setIsRunning] = useState(false);

  const [ball, setBall] = useState<Ball>(createInitialBall());

  const resetBall = () => {
    setBall(createInitialBall());
  };

  const startSimulation = () => {
    setIsRunning(true);
  };

  const stopSimulation = () => {
    setIsRunning(false);
  };

  return (
    <View style={styles.container}>
      <SceneView ball={ball} />
      <View style={styles.controls}>
        <Button title="Reset" onPress={resetBall} />
        <Button title="Start" onPress={startSimulation} />
        <Button title="Stop" onPress={stopSimulation} />
      </View>
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
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
