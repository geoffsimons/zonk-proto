import { RigidBody } from "@react-three/rapier";

export default function Box() {
  return (
    <RigidBody
      type="fixed"
      restitution={0.9}
      friction={0.5}
    >
      <group>
        {/* Ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="green" side={2} />
        </mesh>
        {/* Wall */}
        <mesh rotation={[0, Math.PI / 2, 0]} position={[10, 1.25, 0]} receiveShadow>
          <planeGeometry args={[20, 2.5]} />
          <meshStandardMaterial color="blue" side={2} />
        </mesh>
        <mesh rotation={[0, -Math.PI / 2, 0]} position={[-10, 1.25, 0]} receiveShadow>
          <planeGeometry args={[20, 2.5]} />
          <meshStandardMaterial color="blue" side={2} />
        </mesh>
        <mesh rotation={[0, 0, 0]} position={[0, 1.25, 10]} receiveShadow>
          <planeGeometry args={[20, 2.5]} />
          <meshStandardMaterial color="blue" side={2} />
        </mesh>
        <mesh rotation={[0, 0, 0]} position={[0, 1.25, -10]} receiveShadow>
          <planeGeometry args={[20, 2.5]} />
          <meshStandardMaterial color="blue" side={2} />
        </mesh>

      </group>
    </RigidBody>
  );
}
