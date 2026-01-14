import { OrbitControls, PerspectiveCamera } from '@react-three/drei/native';
import { Canvas } from '@react-three/fiber/native';
import React, { ComponentProps, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import type { PerspectiveCamera as PerspectiveCameraType } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

// Extract the onChange parameter type using TypeScript utility types
type OrbitControlsProps = ComponentProps<typeof OrbitControls>;
type OnChangeHandler = NonNullable<OrbitControlsProps['onChange']>;
type OrbitControlsChangeEvent = Parameters<OnChangeHandler>[0];

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

// Helper function to calculate initial angles from camera position
// This converts Cartesian coordinates [x, y, z] to spherical coordinates
// matching OrbitControls' convention
function calculateAnglesFromPosition([x, y, z]: [number, number, number]): {
  azimuthal: number;
  polar: number;
} {
  // Calculate distance from origin
  const radius = Math.sqrt(x * x + y * y + z * z);

  // Azimuthal angle: horizontal rotation in XZ plane (atan2(x, z))
  const azimuthal = Math.atan2(x, z);

  // Polar angle: vertical angle from Y axis (acos(y / radius))
  const polar = Math.acos(y / radius);

  return { azimuthal, polar };
}

/**
 *
 * @param initialCameraPosition [x, y, z]
 * @param azimuthal
 * @param polar
 * @returns
 */
function calculateCameraPositionFromAngles([x, y, z]: [number, number, number], azimuthal: number, polar: number): [number, number, number] {
  const radius = Math.sqrt(x * x + y * y + z * z);
  const newX = radius * Math.sin(polar) * Math.cos(azimuthal);
  const newY = radius * Math.sin(polar) * Math.sin(azimuthal);
  const newZ = radius * Math.cos(polar);
  return [newX, newY, newZ];
}

export default function Index() {
  const initialCameraPosition: [number, number, number] = [3, 3, 5];

  // Calculate initial angles from position
  const initialAngles = calculateAnglesFromPosition(initialCameraPosition);

  // Track where the camera is positioned
  const [azimuthalAngle, setAzimuthalAngle] = useState(initialAngles.azimuthal);
  const [polarAngle, setPolarAngle] = useState(initialAngles.polar);

  const cameraPosition = useMemo(() => calculateCameraPositionFromAngles(initialCameraPosition, azimuthalAngle, polarAngle), [azimuthalAngle, polarAngle]);

  const controlsRef = useRef<OrbitControlsImpl>(null);
  const cameraRef = useRef<PerspectiveCameraType>(null);

  // Method to update camera angles from the controls ref
  const updateCameraAngles = useCallback(() => {
    if (controlsRef.current) {
      setAzimuthalAngle(controlsRef.current.getAzimuthalAngle());
      setPolarAngle(controlsRef.current.getPolarAngle());
    }
  }, []);

  // Method to reset camera to initial position
  const resetCamera = useCallback(() => {
    if (controlsRef.current) {
      // Reset OrbitControls (this will restore saved state)
      controlsRef.current.reset();

      // Update angles after reset
      // Use a small delay to ensure the reset has completed
      setTimeout(() => {
        updateCameraAngles();
      }, 50);
    }
  }, [updateCameraAngles]);

  // Capture initial angles from OrbitControls after it initializes
  useEffect(() => {
    // Small delay to ensure OrbitControls has initialized
    const timeout = setTimeout(() => {
      if (controlsRef.current) {
        // Save the initial state so reset() works correctly
        controlsRef.current.saveState();
        updateCameraAngles();
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [updateCameraAngles]);

  const handleCameraChange: OnChangeHandler = () => {
    updateCameraAngles();
  };

  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Angle: [{azimuthalAngle.toFixed(3)}, {polarAngle.toFixed(3)}]
        </Text>
        <Text style={styles.infoText}>
          Position: [{cameraPosition[0].toFixed(3)}, {cameraPosition[1].toFixed(3)}, {cameraPosition[2].toFixed(3)}]
        </Text>
        <Button title="Reset Camera" onPress={resetCamera} />
      </View>
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
          ref={controlsRef}
          enablePan={false} // Keeps the focus on the center
          maxPolarAngle={Math.PI / 2.1} // Prevents the camera from going below the floor
          onChange={handleCameraChange}
        />

        <PerspectiveCamera
          ref={cameraRef}
          makeDefault
          position={initialCameraPosition}
        />
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  infoContainer: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 5,
  },
  infoText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'monospace',
  },
});