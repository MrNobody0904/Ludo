import React, { useRef, useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import gsap from 'gsap';
import useIsLowEnd from '../../three/useIsLowEnd';
import CanvasErrorBoundary from '../../three/CanvasErrorBoundary';

/* -------------------------------------------------------------------------- */
/*                               COLOR PALETTE                                */
/* -------------------------------------------------------------------------- */
const PALETTE = {
  bg: '#17172B',
  bgCard: '#22223A',
  ivory: '#F8F1E5',
  yellow: '#FFC857',
  red: '#FF5148',
  green: '#5DCE9B',
  blue: '#58A5EF',
  slate: '#374151',
  textSecondary: '#AAA9B8'
};

/* -------------------------------------------------------------------------- */
/*                                 DICE PIPS                                  */
/* -------------------------------------------------------------------------- */
function DicePips({ radius = 0.17, offset = 1.008 }) {
  const pipColor = PALETTE.red;

  return (
    <group>
      {/* Face 1 (+Z): Center Pip */}
      <mesh position={[0, 0, offset]}>
        <circleGeometry args={[radius * 1.35, 32]} />
        <meshBasicMaterial color={pipColor} />
      </mesh>

      {/* Face 6 (-Z): Two columns of 3 */}
      <group position={[0, 0, -offset]} rotation={[0, Math.PI, 0]}>
        {[-0.42, 0.42].map((x, xi) =>
          [-0.48, 0, 0.48].map((y, yi) => (
            <mesh key={`f6-${xi}-${yi}`} position={[x, y, 0]}>
              <circleGeometry args={[radius, 24]} />
              <meshBasicMaterial color={pipColor} />
            </mesh>
          ))
        )}
      </group>

      {/* Face 2 (+Y): Diagonal 2 */}
      <group position={[0, offset, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh position={[-0.42, -0.42, 0]}>
          <circleGeometry args={[radius, 24]} />
          <meshBasicMaterial color={pipColor} />
        </mesh>
        <mesh position={[0.42, 0.42, 0]}>
          <circleGeometry args={[radius, 24]} />
          <meshBasicMaterial color={pipColor} />
        </mesh>
      </group>

      {/* Face 5 (-Y): 4 corners + center */}
      <group position={[0, -offset, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh position={[0, 0, 0]}>
          <circleGeometry args={[radius, 24]} />
          <meshBasicMaterial color={pipColor} />
        </mesh>
        {[[-0.42, -0.42], [0.42, -0.42], [-0.42, 0.42], [0.42, 0.42]].map(([x, y], i) => (
          <mesh key={`f5-${i}`} position={[x, y, 0]}>
            <circleGeometry args={[radius, 24]} />
            <meshBasicMaterial color={pipColor} />
          </mesh>
        ))}
      </group>

      {/* Face 3 (+X): Diagonal 3 */}
      <group position={[offset, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        {[[-0.42, -0.42], [0, 0], [0.42, 0.42]].map(([x, y], i) => (
          <mesh key={`f3-${i}`} position={[x, y, 0]}>
            <circleGeometry args={[radius, 24]} />
            <meshBasicMaterial color={pipColor} />
          </mesh>
        ))}
      </group>

      {/* Face 4 (-X): 4 corners */}
      <group position={[-offset, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        {[[-0.42, -0.42], [0.42, -0.42], [-0.42, 0.42], [0.42, 0.42]].map(([x, y], i) => (
          <mesh key={`f4-${i}`} position={[x, y, 0]}>
            <circleGeometry args={[radius, 24]} />
            <meshBasicMaterial color={pipColor} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*                            FLOATING LUDO TOKEN                             */
/* -------------------------------------------------------------------------- */
function FloatingToken({ color, baseRadius, orbitSpeed, orbitOffset, mousePos }) {
  const groupRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime * orbitSpeed + orbitOffset;

    // Circular orbit around the dice
    const x = Math.cos(time) * baseRadius;
    const z = Math.sin(time) * baseRadius;

    // Small playful hop / bounce
    const hop = Math.abs(Math.sin(time * 2.5)) * 0.22;
    const y = 0.2 + hop + mousePos.y * 0.15;

    groupRef.current.position.set(x + mousePos.x * 0.15, y, z);
    groupRef.current.rotation.y = -time + Math.PI / 2;
    groupRef.current.rotation.z = Math.sin(time * 2) * 0.08;
  });

  return (
    <group ref={groupRef} scale={[0.65, 0.65, 0.65]}>
      {/* Base */}
      <mesh position={[0, -0.35, 0]}>
        <cylinderGeometry args={[0.3, 0.4, 0.16, 24]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
      </mesh>
      {/* Body */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.16, 0.28, 0.6, 24]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.58, 0]}>
        <sphereGeometry args={[0.28, 24, 24]} />
        <meshStandardMaterial color={color} roughness={0.25} metalness={0.1} />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*                            MINIATURE 3D BOARD                              */
/* -------------------------------------------------------------------------- */
function MiniatureBoard() {
  const boardRef = useRef();

  useFrame((_, delta) => {
    if (boardRef.current) {
      boardRef.current.rotation.y += delta * 0.08;
    }
  });

  return (
    <group ref={boardRef} position={[0, -1.65, 0]} rotation={[0.4, 0, 0.1]} scale={[0.7, 0.7, 0.7]}>
      {/* Base Platform */}
      <RoundedBox args={[4.2, 0.18, 4.2]} radius={0.12} smoothness={4}>
        <meshStandardMaterial color={PALETTE.bgCard} roughness={0.5} />
      </RoundedBox>

      {/* Cyber Glowing Rim */}
      <mesh position={[0, -0.06, 0]}>
        <boxGeometry args={[4.28, 0.08, 4.28]} />
        <meshBasicMaterial color={PALETTE.yellow} wireframe />
      </mesh>

      {/* 4 Corner Home Bases */}
      <mesh position={[-1.25, 0.1, -1.25]}>
        <boxGeometry args={[1.35, 0.04, 1.35]} />
        <meshBasicMaterial color={PALETTE.red} />
      </mesh>
      <mesh position={[1.25, 0.1, -1.25]}>
        <boxGeometry args={[1.35, 0.04, 1.35]} />
        <meshBasicMaterial color={PALETTE.green} />
      </mesh>
      <mesh position={[1.25, 0.1, 1.25]}>
        <boxGeometry args={[1.35, 0.04, 1.35]} />
        <meshBasicMaterial color={PALETTE.yellow} />
      </mesh>
      <mesh position={[-1.25, 0.1, 1.25]}>
        <boxGeometry args={[1.35, 0.04, 1.35]} />
        <meshBasicMaterial color={PALETTE.blue} />
      </mesh>

      {/* Center Finish */}
      <mesh position={[0, 0.11, 0]}>
        <boxGeometry args={[0.7, 0.03, 0.7]} />
        <meshBasicMaterial color={PALETTE.ivory} />
      </mesh>

      {/* Cross Paths */}
      <mesh position={[0, 0.1, -1.25]}>
        <boxGeometry args={[0.65, 0.02, 1.35]} />
        <meshBasicMaterial color="#2d2d48" />
      </mesh>
      <mesh position={[0, 0.1, 1.25]}>
        <boxGeometry args={[0.65, 0.02, 1.35]} />
        <meshBasicMaterial color="#2d2d48" />
      </mesh>
      <mesh position={[-1.25, 0.1, 0]}>
        <boxGeometry args={[1.35, 0.02, 0.65]} />
        <meshBasicMaterial color="#2d2d48" />
      </mesh>
      <mesh position={[1.25, 0.1, 0]}>
        <boxGeometry args={[1.35, 0.02, 0.65]} />
        <meshBasicMaterial color="#2d2d48" />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*                      FLOATING WIREFRAMES & PARTICLES                       */
/* -------------------------------------------------------------------------- */
function CyberDebris() {
  const debrisRef = useRef();

  useFrame((state) => {
    if (!debrisRef.current) return;
    const time = state.clock.elapsedTime;
    debrisRef.current.rotation.y = time * 0.05;
    debrisRef.current.rotation.x = Math.sin(time * 0.1) * 0.08;
  });

  const cubePositions = useMemo(() => [
    [-2.6, 1.6, -1.2],
    [2.8, 1.8, 0.8],
    [-2.2, -0.9, 1.4],
    [2.4, -1.1, -1.5],
    [0.5, 2.4, -1.8],
    [-1.8, 2.1, 1.5]
  ], []);

  // Simple particle cloud
  const particles = useMemo(() => {
    const coords = [];
    for (let i = 0; i < 60; i++) {
      coords.push(
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 8
      );
    }
    return new Float32Array(coords);
  }, []);

  return (
    <group ref={debrisRef}>
      {/* Floating Geometric Wireframe Cubes */}
      {cubePositions.map((pos, i) => (
        <group key={`debris-${i}`} position={pos}>
          <mesh rotation={[i * 0.4, i * 0.6, 0]}>
            <boxGeometry args={[0.35, 0.35, 0.35]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? PALETTE.yellow : PALETTE.blue}
              wireframe
              transparent
              opacity={0.65}
            />
          </mesh>
        </group>
      ))}

      {/* Tiny floating star dust particles */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particles.length / 3}
            array={particles}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.06} color={PALETTE.yellow} transparent opacity={0.6} />
      </points>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*                         MAIN FLOATING GIANT DICE                           */
/* -------------------------------------------------------------------------- */
function FloatingUniverseDice({ mousePos }) {
  const diceRef = useRef();
  const [isHovered, setIsHovered] = useState(false);
  const isRollingRef = useRef(false);

  const rollDice = () => {
    if (isRollingRef.current || !diceRef.current) return;
    isRollingRef.current = true;

    const tl = gsap.timeline({
      onComplete: () => {
        isRollingRef.current = false;
      }
    });

    // Jump up
    tl.to(diceRef.current.position, {
      y: 1.4,
      duration: 0.35,
      ease: 'power2.out'
    });

    // Full 3D tumbling rotation
    tl.to(
      diceRef.current.rotation,
      {
        x: '+=6.28',
        y: '+=9.42',
        z: '+=3.14',
        duration: 0.9,
        ease: 'power1.inOut'
      },
      '<'
    );

    // Land with a bounce
    tl.to(diceRef.current.position, {
      y: 0.35,
      duration: 0.45,
      ease: 'bounce.out'
    });
  };

  const handlePointerEnter = () => {
    setIsHovered(true);
    document.body.style.cursor = 'pointer';
    if (!isRollingRef.current && diceRef.current) {
      gsap.to(diceRef.current.scale, {
        x: 1.08,
        y: 1.08,
        z: 1.08,
        duration: 0.25,
        ease: 'back.out(2)'
      });
    }
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    document.body.style.cursor = 'default';
    if (!isRollingRef.current && diceRef.current) {
      gsap.to(diceRef.current.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
    }
  };

  useFrame((state, delta) => {
    if (!diceRef.current) return;

    if (!isRollingRef.current) {
      const time = state.clock.elapsedTime;

      // Gentle floating bob
      diceRef.current.position.y = 0.35 + Math.sin(time * 1.8) * 0.14;

      // Ambient rotation (speeds up slightly on hover)
      const rotSpeed = isHovered ? 0.9 : 0.35;
      diceRef.current.rotation.y += delta * rotSpeed;

      // Gentle tilt toward mouse pointer
      const targetRotX = 0.35 + mousePos.y * 0.35;
      const targetRotZ = -mousePos.x * 0.3;
      diceRef.current.rotation.x += (targetRotX - diceRef.current.rotation.x) * 0.05;
      diceRef.current.rotation.z += (targetRotZ - diceRef.current.rotation.z) * 0.05;
    }
  });

  return (
    <group
      ref={diceRef}
      position={[0, 0.35, 0]}
      rotation={[0.35, 0.55, 0]}
      onClick={rollDice}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      {/* Warm Ivory Rounded Dice */}
      <RoundedBox args={[2.0, 2.0, 2.0]} radius={0.2} smoothness={8}>
        <meshStandardMaterial
          color={PALETTE.ivory}
          roughness={0.25}
          metalness={0.06}
        />
      </RoundedBox>

      {/* Red Circular Pips */}
      <DicePips radius={0.17} offset={1.008} />
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*                         LOW-END 2D SVG FALLBACK                            */
/* -------------------------------------------------------------------------- */
function SvgCreatorFallback() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.6
      }}
    >
      <svg width="220" height="220" viewBox="0 0 200 200" fill="none">
        <polygon points="100,20 170,60 170,140 100,180 30,140 30,60" stroke="#FFC857" strokeWidth="2" strokeDasharray="4 4" />
        <rect x="70" y="70" width="60" height="60" rx="10" fill="#F8F1E5" stroke="#374151" strokeWidth="3" />
        <circle cx="100" cy="100" r="7" fill="#FF5148" />
      </svg>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                       MAIN CREATOR SCENE COMPONENT                         */
/* -------------------------------------------------------------------------- */
export default function CreatorScene() {
  const isLowEnd = useIsLowEnd();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (isLowEnd) {
    return <SvgCreatorFallback />;
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 0
      }}
      aria-hidden="true"
    >
      <CanvasErrorBoundary fallback={<SvgCreatorFallback />}>
        <Canvas
          orthographic
          camera={{
            position: [7, 7, 7.5],
            zoom: 46,
            near: 0.1,
            far: 1000
          }}
          dpr={[1, 2]}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
          }}
          style={{ width: '100%', height: '100%', pointerEvents: 'auto' }}
        >
          {/* Cyberpunk Studio Lighting */}
          <ambientLight intensity={1.1} />
          <directionalLight position={[8, 12, 6]} intensity={1.3} color={PALETTE.yellow} />
          <directionalLight position={[-8, -6, -6]} intensity={0.8} color={PALETTE.blue} />
          <directionalLight position={[0, -8, 6]} intensity={0.4} color={PALETTE.red} />

          {/* Floating Geometric Wireframes & Star Particles */}
          <CyberDebris />

          {/* Miniature 3D Ludo Board underneath */}
          <MiniatureBoard />

          {/* 4 Orbiting Colorful Player Tokens */}
          <FloatingToken color={PALETTE.red} baseRadius={2.1} orbitSpeed={0.9} orbitOffset={0} mousePos={mousePos} />
          <FloatingToken color={PALETTE.green} baseRadius={2.2} orbitSpeed={0.85} orbitOffset={Math.PI * 0.5} mousePos={mousePos} />
          <FloatingToken color={PALETTE.yellow} baseRadius={2.3} orbitSpeed={0.8} orbitOffset={Math.PI} mousePos={mousePos} />
          <FloatingToken color={PALETTE.blue} baseRadius={2.1} orbitSpeed={0.95} orbitOffset={Math.PI * 1.5} mousePos={mousePos} />

          {/* Giant Floating Dice */}
          <FloatingUniverseDice mousePos={mousePos} />
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
}
