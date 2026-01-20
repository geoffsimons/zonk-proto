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
