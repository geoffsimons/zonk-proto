export function calculateCameraPositionFromAngles([x, y, z]: [number, number, number], azimuth: number, polar: number): [number, number, number] {
  // Calculate the radius (distance from origin) from the initial position
  const radius = Math.sqrt(x * x + y * y + z * z);

  const newX = radius * Math.sin(polar) * Math.sin(azimuth);
  const newY = radius * Math.cos(polar);
  const newZ = radius * Math.sin(polar) * Math.cos(azimuth);

  return [newX, newY, newZ];
}

// Helper function to calculate initial angles from camera position
// This converts Cartesian coordinates [x, y, z] to spherical coordinates
// matching OrbitControls' convention
export function calculateAnglesFromPosition([x, y, z]: [number, number, number]): {
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

export function calculateDieValue(quat: { x: number, y: number, z: number, w: number }): number {
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

  return resultNumber;
}

export interface CalculateVelocityOptions {
  power: number;
  accuracy: number;
  origin: [number, number, number];
  target?: [number, number, number];
  minVelocity?: number;
  maxVelocity?: number;
  maxDeviation?: number;
}

export function calculateInitialVelocity({
  power,
  accuracy,
  origin,
  target = [0, 0, 0],
  minVelocity = 5,
  maxVelocity = 25,
  maxDeviation = 5
}: CalculateVelocityOptions): [number, number, number] {
  console.log('Calculating initial velocity with power:', power, 'and accuracy:', accuracy, 'and origin:', origin);
  // The perfect initial velocity has x and z components that point from the origin to 0,0. The y component is 0.
  // Power maps to the magnitude of the velocity. Power of 100 yields MAX_VELOCITY. Power of 0 yields MIN_VELOCITY.
  const magnitude = minVelocity + (maxVelocity - minVelocity) * power / 100;
  console.log('Magnitude', magnitude);

  // Calculate the direction of the velocity with some randomness based on the accuracy.

  const deviation = maxDeviation * accuracy;
  console.log('Deviation magnitude', deviation);

  const [x, y, z] = origin;

  const deviatedTarget = [
    target[0] + (-0.5 + Math.random()) * deviation,
    target[1] + (-0.5 + Math.random()) * deviation,
    target[2] + (-0.5 + Math.random()) * deviation,
  ];

  console.log('Deviated target', deviatedTarget);

  const direction = [
    deviatedTarget[0] - x,
    deviatedTarget[1] - y,
    deviatedTarget[2] - z,
  ];

  console.log('Direction', direction);

  const directionLength = Math.sqrt(direction[0]**2 + direction[1]**2 + direction[2]**2);

  const normalizedDirection = [direction[0] / directionLength, direction[1] / directionLength, direction[2] / directionLength];
  console.log('Normalized direction', normalizedDirection);

  const velocityX = magnitude * (normalizedDirection[0]);
  const velocityY = magnitude * (normalizedDirection[1]);
  const velocityZ = magnitude * (normalizedDirection[2]);

  const velocity = [velocityX, velocityY, velocityZ];
  console.log('Velocity', velocity);
  return velocity as [number, number, number];
}

export function getDotsForNumber(number: number): Array<[number, number]> {
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