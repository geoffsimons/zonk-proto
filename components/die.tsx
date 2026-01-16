import { RapierRigidBody, RigidBody } from '@react-three/rapier';
import React, { useCallback, useRef } from 'react';

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

export function RigidDie({ onRest }: { onRest: (result: number) => void }) {
  const dieRef = useRef<RapierRigidBody>(null);

  const handleSleep = useCallback(() => {
    // Determine the result using the ref.
    // We need to figure out which face is up.
    // To determine which face is up, get the die's world quaternion,
    // transform each face's normal, and check which is closest to world up.

    const die = dieRef.current;
    if (!die) return;

    // Map die faces to normal vectors (in local space) and associated numbers.
    // Order: +Z, -Z, +Y, -Y, +X, -X
    // [normal vector, die number]
    const faceNormals: [number[], number][] = [
      [[0, 0, 1], 1],   // Front (+Z)
      [[0, 0, -1], 6],  // Back (-Z)
      [[0, 1, 0], 5],   // Top (+Y)
      [[0, -1, 0], 2],  // Bottom (-Y)
      [[1, 0, 0], 3],   // Right (+X)
      [[-1, 0, 0], 4],  // Left (-X)
    ];

    // Get the world quaternion of the rigid body
    const quat = die.rotation(); // {x, y, z, w}

    // Convert quaternion to THREE.Quaternion and world up to vector
    // create a helper so we don't depend on THREE at insertion
    function applyQuat(q: { x: number, y: number, z: number, w: number }, v: [number, number, number]): [number, number, number] {
      // Quaternion * vector math
      const x = v[0], y = v[1], z = v[2];
      const qx = q.x, qy = q.y, qz = q.z, qw = q.w;

      // t = 2 * cross(q.xyz, v)
      const tx = 2 * (qy * z - qz * y);
      const ty = 2 * (qz * x - qx * z);
      const tz = 2 * (qx * y - qy * x);

      // v' = v + qw * t + cross(q.xyz, t)
      const rx = x + qw * tx + (qy * tz - qz * ty);
      const ry = y + qw * ty + (qz * tx - qx * tz);
      const rz = z + qw * tz + (qx * ty - qy * tx);

      return [rx, ry, rz];
    }

    // Compare each face's transformed normal against world up ([0, 1, 0])
    let maxDot = -Infinity;
    let resultNumber = 1;
    for (const [normal, number] of faceNormals) {
      const worldNormal = applyQuat(quat, normal as [number, number, number]);
      // Normalize (not needed as all are 1, but do it for generality)
      const len = Math.sqrt(worldNormal[0]**2 + worldNormal[1]**2 + worldNormal[2]**2);
      const unitNormal = [worldNormal[0]/len, worldNormal[1]/len, worldNormal[2]/len];
      // Dot with world up
      const dot = unitNormal[1]; // world up = [0,1,0]
      if (dot > maxDot) {
        maxDot = dot;
        resultNumber = number;
      }
    }

    onRest(resultNumber);
  }, [onRest, dieRef]);

  // For testing, use random rotation.
  // const randomRotation = useMemo((): [number, number, number] => {
  //   return [
  //     Math.random() * 2 * Math.PI,
  //     Math.random() * 2 * Math.PI,
  //     Math.random() * 2 * Math.PI,
  //   ] as [number, number, number];
  // }, []);

  // const randomAngularVelocity = useMemo((): [number, number, number] => {
  //   return [
  //     Math.random() * 2 * Math.PI,
  //     Math.random() * 2 * Math.PI,
  //     Math.random() * 2 * Math.PI,
  //   ] as [number, number, number];
  // }, []);

  return (
    <RigidBody
      ref={dieRef}
      colliders="cuboid"
      restitution={0.8}
      linearDamping={0.5}
      angularDamping={0.5}
      // rotation={randomRotation}
      position={[-9, 10, 0]}
      linearVelocity={[5, 0, 0]}
      // angularVelocity={randomAngularVelocity}
      onSleep={handleSleep}
    >
      <Die />
    </RigidBody>
  );
}