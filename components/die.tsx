import React from 'react';

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
export function Die() {
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
    <group position={[0, 0, 0]}>
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
