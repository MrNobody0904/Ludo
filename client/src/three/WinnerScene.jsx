import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import confetti from 'canvas-confetti';
import useIsLowEnd from './useIsLowEnd';
import CanvasErrorBoundary from './CanvasErrorBoundary';

/**
 * 3D Flat-Shaded Low-Poly Trophy Mesh
 */
function TrophyMesh() {
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 1.2;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.3, 0]}>
      {/* Cup bowl */}
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.7, 0.35, 0.9, 8]} />
        <meshBasicMaterial color="#ffc737" />
      </mesh>
      {/* Cup stem */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.4, 8]} />
        <meshBasicMaterial color="#e0ad22" />
      </mesh>
      {/* Cup base */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.6, 0.65, 0.25, 8]} />
        <meshBasicMaterial color="#374151" />
      </mesh>
      {/* Handles */}
      <mesh position={[-0.75, 0.7, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.12, 0.5, 0.1]} />
        <meshBasicMaterial color="#ffc737" />
      </mesh>
      <mesh position={[0.75, 0.7, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <boxGeometry args={[0.12, 0.5, 0.1]} />
        <meshBasicMaterial color="#ffc737" />
      </mesh>
    </group>
  );
}

export default function WinnerScene({ winnerName, winnerColor }) {
  const isLowEnd = useIsLowEnd();

  useEffect(() => {
    // Launch celebratory confetti burst
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#eb3322', '#ffc737', '#f7f2e5', '#10b981', '#3b82f6']
      });
    } catch {
      // Ignored if canvas-confetti is not available
    }
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        textAlign: 'center',
        width: '100%'
      }}
    >
      <div style={{ width: '220px', height: '200px' }} aria-hidden="true">
        {!isLowEnd && (
          <CanvasErrorBoundary
            fallback={
              <div style={{ fontSize: '80px', lineHeight: 1 }}>🏆</div>
            }
          >
            <Canvas
              camera={{ position: [0, 0.4, 3.2], fov: 45 }}
              dpr={[1, 2]}
              gl={{ antialias: true, alpha: true }}
              style={{ width: '100%', height: '100%' }}
            >
              <TrophyMesh />
            </Canvas>
          </CanvasErrorBoundary>
        )}
        {isLowEnd && <div style={{ fontSize: '80px', lineHeight: 1 }}>🏆</div>}
      </div>
    </div>
  );
}
