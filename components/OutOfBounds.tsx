import { RigidBody } from "@react-three/rapier";
import { useCallback } from "react";

export default function OutOfBounds({ onOutOfBounds }: { onOutOfBounds: () => void }) {
  const handleOutOfBounds = useCallback(() => {
    onOutOfBounds();
  }, [onOutOfBounds]);

  return (
    <RigidBody
      type="fixed"
      onCollisionEnter={handleOutOfBounds}
    >
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="red" side={2} />
      </mesh>
    </RigidBody>
  );
}

