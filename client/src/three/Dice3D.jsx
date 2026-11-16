import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import useIsLowEnd from './useIsLowEnd';
import CanvasErrorBoundary from './CanvasErrorBoundary';

const TARGET_ROTATIONS = {
  1: [0, 0, 0],
  6: [0, Math.PI, 0],
  2: [Math.PI / 2, 0, 0],
  5: [-Math.PI / 2, 0, 0],
  3: [0, -Math.PI / 2, 0],
  4: [0, Math.PI / 2, 0]
};

function DiceMesh({ currentDice, isRolling }) {
  const meshRef = useRef();

  useEffect(() => {
    if (!meshRef.current) return;

    if (isRolling) {
      // Rapid tumbling spin
      gsap.to(meshRef.current.rotation, {
        x: '+=6.28',
        y: '+=9.42',
        z: '+=3.14',
        duration: 0.8,
        ease: 'power2.in'
      });
    } else if (currentDice && TARGET_ROTATIONS[currentDice]) {
      // Land deterministically on the target face
      const [targetX, targetY, targetZ] = TARGET_ROTATIONS[currentDice];
      gsap.to(meshRef.current.rotation, {
        x: targetX + Math.PI * 4,
        y: targetY + Math.PI * 4,
        z: targetZ,
        duration: 0.7,
        ease: 'back.out(1.8)'
      });
    }
  }, [isRolling, currentDice]);

  const pipColor = '#eb3322';
  const pipR = 0.16;
  const off = 1.01;

  return (
    <group ref={meshRef}>
      {/* Off-white body */}
      <mesh>
        <boxGeometry args={[2, 2, 2]} />
        <meshBasicMaterial color="#f7f2e5" />
      </mesh>
      {/* Border */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(2, 2, 2)]} />
        <lineBasicMaterial color="#374151" linewidth={2} />
      </lineSegments>

      {/* Face 1 (+Z) */}
      <mesh position={[0, 0, off]}>
        <circleGeometry args={[pipR * 1.5, 24]} />
        <meshBasicMaterial color={pipColor} />
      </mesh>

      {/* Face 6 (-Z) */}
      <group position={[0, 0, -off]} rotation={[0, Math.PI, 0]}>
        {[-0.45, 0.45].map((x, xi) =>
          [-0.5, 0, 0.5].map((y, yi) => (
            <mesh key={`6-${xi}-${yi}`} position={[x, y, 0]}>
              <circleGeometry args={[pipR, 20]} />
              <meshBasicMaterial color={pipColor} />
            </mesh>
          ))
        )}
      </group>

      {/* Face 2 (+Y) */}
      <group position={[0, off, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh position={[-0.45, -0.45, 0]}>
          <circleGeometry args={[pipR, 20]} />
          <meshBasicMaterial color={pipColor} />
        </mesh>
        <mesh position={[0.45, 0.45, 0]}>
          <circleGeometry args={[pipR, 20]} />
          <meshBasicMaterial color={pipColor} />
        </mesh>
      </group>

      {/* Face 5 (-Y) */}
      <group position={[0, -off, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh position={[0, 0, 0]}>
          <circleGeometry args={[pipR, 20]} />
          <meshBasicMaterial color={pipColor} />
        </mesh>
        {[[-0.45, -0.45], [0.45, -0.45], [-0.45, 0.45], [0.45, 0.45]].map(([x, y], i) => (
          <mesh key={`5-${i}`} position={[x, y, 0]}>
            <circleGeometry args={[pipR, 20]} />
            <meshBasicMaterial color={pipColor} />
          </mesh>
        ))}
      </group>

      {/* Face 3 (+X) */}
      <group position={[off, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        {[[-0.45, -0.45], [0, 0], [0.45, 0.45]].map(([x, y], i) => (
          <mesh key={`3-${i}`} position={[x, y, 0]}>
            <circleGeometry args={[pipR, 20]} />
            <meshBasicMaterial color={pipColor} />
          </mesh>
        ))}
      </group>

      {/* Face 4 (-X) */}
      <group position={[-off, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        {[[-0.45, -0.45], [0.45, -0.45], [-0.45, 0.45], [0.45, 0.45]].map(([x, y], i) => (
          <mesh key={`4-${i}`} position={[x, y, 0]}>
            <circleGeometry args={[pipR, 20]} />
            <meshBasicMaterial color={pipColor} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function SvgDice2D({ value, isRolling }) {
  const pipsMap = {
    1: [[50, 50]],
    2: [[30, 30], [70, 70]],
    3: [[30, 30], [50, 50], [70, 70]],
    4: [[30, 30], [70, 30], [30, 70], [70, 70]],
    5: [[30, 30], [70, 30], [50, 50], [30, 70], [70, 70]],
    6: [[30, 25], [70, 25], [30, 50], [70, 50], [30, 75], [70, 75]]
  };

  const pips = pipsMap[value || 1] || pipsMap[1];

  return (
    <div
      style={{
        width: '74px',
        height: '74px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.15s ease',
        transform: isRolling ? 'rotate(18deg) scale(0.92)' : 'none'
      }}
    >
      <svg width="70" height="70" viewBox="0 0 100 100">
        <rect x="5" y="5" width="90" height="90" rx="12" fill="#f7f2e5" stroke="#374151" strokeWidth="4" />
        {pips.map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="8" fill="#eb3322" />
        ))}
      </svg>
    </div>
  );
}

export default function Dice3D({ currentDice, isRolling, disable3D = false }) {
  const isLowEnd = useIsLowEnd();

  if (disable3D || isLowEnd) {
    return <SvgDice2D value={currentDice} isRolling={isRolling} />;
  }

  return (
    <div
      style={{ width: '84px', height: '84px', pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <CanvasErrorBoundary fallback={<SvgDice2D value={currentDice} isRolling={isRolling} />}>
        <Canvas
          camera={{ position: [0, 0, 4.4], fov: 40 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
          style={{ width: '100%', height: '100%' }}
        >
          <DiceMesh currentDice={currentDice} isRolling={isRolling} />
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
}
