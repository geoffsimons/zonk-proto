import { OrbitControls, PerspectiveCamera } from '@react-three/drei/native';
import { Canvas } from '@react-three/fiber/native';
import React, { ComponentProps, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Text as RNText, StyleSheet, View } from 'react-native';
import type { PerspectiveCamera as PerspectiveCameraType } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

// Extract the onChange parameter type using TypeScript utility types
type OrbitControlsProps = ComponentProps<typeof OrbitControls>;
type OnChangeHandler = NonNullable<OrbitControlsProps['onChange']>;

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

// Helper to get dot positions for each number (standard dice pattern)
function getDotsForNumber(number: number): Array<[number, number]> {
  const positions: Array<[number, number]> = [];
  const offset = 0.25; // Distance from center for dots

  switch (number) {
    case 1:
      positions.push([0, 0]);
      break;
    case 2:
      positions.push([-offset, offset], [offset, -offset]);
      break;
    case 3:
      positions.push([-offset, offset], [0, 0], [offset, -offset]);
      break;
    case 4:
      positions.push([-offset, offset], [offset, offset], [-offset, -offset], [offset, -offset]);
      break;
    case 5:
      positions.push([-offset, offset], [offset, offset], [0, 0], [-offset, -offset], [offset, -offset]);
      break;
    case 6:
      positions.push([-offset, offset], [offset, offset], [-offset, 0], [offset, 0], [-offset, -offset], [offset, -offset]);
      break;
  }
  return positions;
}

/**
 * Standard 6-sided die with numbers 1-6 on each face
 * Standard die layout: opposite faces sum to 7
 * - 1 opposite 6
 * - 2 opposite 5
 * - 3 opposite 4
 *
 * Face indices: 0=right(+X), 1=left(-X), 2=top(+Y), 3=bottom(-Y), 4=front(+Z), 5=back(-Z)
 * Face numbers: [3, 4, 5, 2, 1, 6]
 */
function Die() {
  const dieSize = 1;
  const dotSize = 0.08;
  const dotOffset = 0.51; // Slightly outside the cube face

  // Face configurations: [number, position, rotation]
  const faces = [
    { number: 3, position: [dotOffset, 0, 0] as [number, number, number], rotation: [0, -Math.PI / 2, 0] as [number, number, number] }, // Right (+X)
    { number: 4, position: [-dotOffset, 0, 0] as [number, number, number], rotation: [0, Math.PI / 2, 0] as [number, number, number] }, // Left (-X)
    { number: 5, position: [0, dotOffset, 0] as [number, number, number], rotation: [Math.PI / 2, 0, 0] as [number, number, number] }, // Top (+Y)
    { number: 2, position: [0, -dotOffset, 0] as [number, number, number], rotation: [-Math.PI / 2, 0, 0] as [number, number, number] }, // Bottom (-Y)
    { number: 1, position: [0, 0, dotOffset] as [number, number, number], rotation: [0, 0, 0] as [number, number, number] }, // Front (+Z)
    { number: 6, position: [0, 0, -dotOffset] as [number, number, number], rotation: [0, Math.PI, 0] as [number, number, number] }, // Back (-Z)
  ];

  return (
    <group position={[0, 0.5, 0]}>
      {/* The cube itself - light cream color */}
      <mesh>
        <boxGeometry args={[dieSize, dieSize, dieSize]} />
        <meshStandardMaterial color="#FFFDD0" />
      </mesh>

      {/* Dots on each face representing the numbers */}
      {faces.map((face, faceIndex) => {
        const dots = getDotsForNumber(face.number);
        return (
          <group key={faceIndex} position={face.position} rotation={face.rotation}>
            {dots.map((dotPos, dotIndex) => (
              <mesh
                key={dotIndex}
                position={[dotPos[0], dotPos[1], 0]}
                rotation={[Math.PI / 2, 0, 0]} // Rotate cylinder from Y-axis to Z-axis (perpendicular to face)
              >
                <cylinderGeometry args={[dotSize, dotSize, 0.001]} />
                <meshStandardMaterial color="#432818" /> {/* Dark chocolate */}
              </mesh>
            ))}
          </group>
        );
      })}
    </group>
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
        <RNText style={styles.infoText}>
          Angle: [{azimuthalAngle.toFixed(3)}, {polarAngle.toFixed(3)}]
        </RNText>
        <RNText style={styles.infoText}>
          Position: [{cameraPosition[0].toFixed(3)}, {cameraPosition[1].toFixed(3)}, {cameraPosition[2].toFixed(3)}]
        </RNText>
        <Button title="Reset Camera" onPress={resetCamera} />
      </View>
      <Canvas>
        {/* Lighting is essential to see 3D depth and colors */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />

        <Suspense fallback={null}>
          <Die />
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