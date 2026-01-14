import { OrbitControls, PerspectiveCamera } from '@react-three/drei/native';
import { Canvas } from '@react-three/fiber/native';
import React, { Suspense } from 'react';
import { StyleSheet, View } from 'react-native';

// A Cube with different colored faces
function ColoredCube() {
  return (
    <mesh position={[0, 0.5, 0]}> {/* Lifted 0.5 units so it sits ON the plane */}
      <boxGeometry args={[1, 1, 1]} />
      {[...Array(6)].map((_, i) => (
        <meshStandardMaterial key={i} attach={`material-${i}`} color={getColor(i)} />
      ))}
    </mesh>
  );
}

const getColor = (index: number): string => {
  const colors = ['red', 'green', 'blue', 'yellow', 'purple', 'orange'];
  return colors[index];
};

// The Ground Plane
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial color="#999" />
    </mesh>
  );
}

export default function Index() {
  return (
    <View style={styles.container}>
      <Canvas>
        {/* Lighting is essential to see 3D depth and colors */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        
        <Suspense fallback={null}>
          <ColoredCube />
          <Ground />
        </Suspense>

        {/* This handles the rotation (horizontal) and perspective (vertical) */}
        <OrbitControls 
          enablePan={false} // Keeps the focus on the center
          maxPolarAngle={Math.PI / 2.1} // Prevents the camera from going below the floor
        />
        
        <PerspectiveCamera makeDefault position={[3, 3, 5]} />
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
});