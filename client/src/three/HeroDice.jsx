import React, { useRef, useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox, OrbitControls } from '@react-three/drei';
import gsap from 'gsap';
import useIsLowEnd from './useIsLowEnd';
import CanvasErrorBoundary from './CanvasErrorBoundary';

/* -------------------------------------------------------------------------- */
/*                               COLOR PALETTE                                */
/* -------------------------------------------------------------------------- */
const PALETTE = {
  red: '#eb3322',
  ivory: '#f7f2e5',
  yellow: '#ffc737',
  slate: '#374151',
  green: '#22a447',
  blue: '#2878d0'
};

/* -------------------------------------------------------------------------- */
/*                             DICE PIPS GEOMETRY                             */
/* -------------------------------------------------------------------------- */
function DicePips({ radius = 0.16, offset = 0.98 }) {
  const pipColor = PALETTE.red;

  return (
    <group>
      {/* Face 1 (+Z): Center Pip */}
      <mesh position={[0, 0, offset]} rotation={[0, 0, 0]}>
        <circleGeometry args={[radius * 1.35, 32]} />
        <meshBasicMaterial color={pipColor} />
      </mesh>

      {/* Face 6 (-Z): Two columns of three pips */}
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

      {/* Face 2 (+Y): Diagonal 2 pips */}
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

      {/* Face 3 (+X): Diagonal 3 pips */}
      <group position={[offset, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        {[[-0.42, -0.42], [0, 0], [0.42, 0.42]].map(([x, y], i) => (
          <mesh key={`f3-${i}`} position={[x, y, 0]}>
            <circleGeometry args={[radius, 24]} />
            <meshBasicMaterial color={pipColor} />
          </mesh>
        ))}
      </group>

      {/* Face 4 (-X): 4 corner pips */}
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
/*                           CLASSIC LUDO TOKEN PAWN                          */
/* -------------------------------------------------------------------------- */
function LudoToken({ color, position = [0, 0, 0], orbitIndex = 0, mousePos }) {
  const tokenRef = useRef();
  const basePos = useMemo(() => position, [position]);

  useFrame((state) => {
    if (!tokenRef.current) return;
    const time = state.clock.elapsedTime;
    const phaseOffset = orbitIndex * (Math.PI / 2);

    // Idle Bobbing
    const floatY = Math.sin(time * 2.2 + phaseOffset) * 0.12;
    // Micro Orbit drift
    const orbitX = Math.cos(time * 0.8 + phaseOffset) * 0.08;
    const orbitZ = Math.sin(time * 0.8 + phaseOffset) * 0.08;

    // Mouse Parallax reaction
    const mouseOffsetX = mousePos.x * 0.15;
    const mouseOffsetY = mousePos.y * 0.15;

    tokenRef.current.position.set(
      basePos[0] + orbitX + mouseOffsetX,
      basePos[1] + floatY + mouseOffsetY,
      basePos[2] + orbitZ
    );

    // Subtle playful tilt
    tokenRef.current.rotation.z = Math.sin(time * 1.5 + phaseOffset) * 0.06;
    tokenRef.current.rotation.x = Math.cos(time * 1.5 + phaseOffset) * 0.06;
  });

  return (
    <group ref={tokenRef} position={position} scale={[0.72, 0.72, 0.72]}>
      {/* 1. Base Foot (flared cylinder) */}
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.34, 0.44, 0.18, 28]} />
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.05} />
      </mesh>

      {/* 2. Lower Ring Rim */}
      <mesh position={[0, -0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.36, 0.045, 14, 28]} />
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.05} />
      </mesh>

      {/* 3. Tapered Neck/Body */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.18, 0.32, 0.62, 28]} />
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.05} />
      </mesh>

      {/* 4. Collar Ring */}
      <mesh position={[0, 0.38, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.2, 0.038, 14, 28]} />
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.05} />
      </mesh>

      {/* 5. Spherical Head */}
      <mesh position={[0, 0.64, 0]}>
        <sphereGeometry args={[0.32, 28, 28]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.05} />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*                         MINIATURE 3D LUDO BOARD                            */
/* -------------------------------------------------------------------------- */
function MiniatureBoard({ mousePos }) {
  const boardRef = useRef();

  useFrame((state, delta) => {
    if (!boardRef.current) return;
    // Slow continuous ambient rotation
    boardRef.current.rotation.y += delta * 0.05;

    // Gentle reaction to pointer tilt
    const targetRotX = 0.35 + mousePos.y * 0.08;
    const targetRotZ = 0.1 + mousePos.x * 0.08;
    boardRef.current.rotation.x += (targetRotX - boardRef.current.rotation.x) * 0.05;
    boardRef.current.rotation.z += (targetRotZ - boardRef.current.rotation.z) * 0.05;
  });

  return (
    <group
      ref={boardRef}
      position={[0, -1.35, 0]}
      rotation={[0.35, -0.38, 0.1]}
      scale={[0.74, 0.74, 0.74]}
    >
      {/* 1. Main Base Slab */}
      <RoundedBox args={[4.4, 0.2, 4.4]} radius={0.14} smoothness={4}>
        <meshStandardMaterial color={PALETTE.ivory} roughness={0.4} />
      </RoundedBox>

      {/* Dark Slate Rim Edge */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[4.48, 0.08, 4.48]} />
        <meshBasicMaterial color={PALETTE.slate} />
      </mesh>

      {/* 2. Four Colored Corner Home Bases */}
      {/* Red Home (Top-Left) */}
      <group position={[-1.3, 0.11, -1.3]}>
        <mesh>
          <boxGeometry args={[1.5, 0.03, 1.5]} />
          <meshBasicMaterial color={PALETTE.red} />
        </mesh>
        <mesh position={[0, 0.02, 0]}>
          <boxGeometry args={[1.05, 0.02, 1.05]} />
          <meshBasicMaterial color={PALETTE.ivory} />
        </mesh>
        {[[-0.26, -0.26], [0.26, -0.26], [-0.26, 0.26], [0.26, 0.26]].map(([x, z], i) => (
          <mesh key={`rd-${i}`} position={[x, 0.035, z]}>
            <cylinderGeometry args={[0.08, 0.08, 0.02, 16]} />
            <meshBasicMaterial color={PALETTE.red} />
          </mesh>
        ))}
      </group>

      {/* Green Home (Top-Right) */}
      <group position={[1.3, 0.11, -1.3]}>
        <mesh>
          <boxGeometry args={[1.5, 0.03, 1.5]} />
          <meshBasicMaterial color={PALETTE.green} />
        </mesh>
        <mesh position={[0, 0.02, 0]}>
          <boxGeometry args={[1.05, 0.02, 1.05]} />
          <meshBasicMaterial color={PALETTE.ivory} />
        </mesh>
        {[[-0.26, -0.26], [0.26, -0.26], [-0.26, 0.26], [0.26, 0.26]].map(([x, z], i) => (
          <mesh key={`gd-${i}`} position={[x, 0.035, z]}>
            <cylinderGeometry args={[0.08, 0.08, 0.02, 16]} />
            <meshBasicMaterial color={PALETTE.green} />
          </mesh>
        ))}
      </group>

      {/* Yellow Home (Bottom-Right) */}
      <group position={[1.3, 0.11, 1.3]}>
        <mesh>
          <boxGeometry args={[1.5, 0.03, 1.5]} />
          <meshBasicMaterial color={PALETTE.yellow} />
        </mesh>
        <mesh position={[0, 0.02, 0]}>
          <boxGeometry args={[1.05, 0.02, 1.05]} />
          <meshBasicMaterial color={PALETTE.ivory} />
        </mesh>
        {[[-0.26, -0.26], [0.26, -0.26], [-0.26, 0.26], [0.26, 0.26]].map(([x, z], i) => (
          <mesh key={`yd-${i}`} position={[x, 0.035, z]}>
            <cylinderGeometry args={[0.08, 0.08, 0.02, 16]} />
            <meshBasicMaterial color={PALETTE.yellow} />
          </mesh>
        ))}
      </group>

      {/* Blue Home (Bottom-Left) */}
      <group position={[-1.3, 0.11, 1.3]}>
        <mesh>
          <boxGeometry args={[1.5, 0.03, 1.5]} />
          <meshBasicMaterial color={PALETTE.blue} />
        </mesh>
        <mesh position={[0, 0.02, 0]}>
          <boxGeometry args={[1.05, 0.02, 1.05]} />
          <meshBasicMaterial color={PALETTE.ivory} />
        </mesh>
        {[[-0.26, -0.26], [0.26, -0.26], [-0.26, 0.26], [0.26, 0.26]].map(([x, z], i) => (
          <mesh key={`bd-${i}`} position={[x, 0.035, z]}>
            <cylinderGeometry args={[0.08, 0.08, 0.02, 16]} />
            <meshBasicMaterial color={PALETTE.blue} />
          </mesh>
        ))}
      </group>

      {/* 3. Center Finishing Cross */}
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[0.8, 0.02, 0.8]} />
        <meshBasicMaterial color={PALETTE.yellow} />
      </mesh>
      <mesh position={[-0.2, 0.125, 0]}>
        <boxGeometry args={[0.4, 0.02, 0.4]} />
        <meshBasicMaterial color={PALETTE.red} />
      </mesh>
      <mesh position={[0, 0.125, -0.2]}>
        <boxGeometry args={[0.4, 0.02, 0.4]} />
        <meshBasicMaterial color={PALETTE.green} />
      </mesh>
      <mesh position={[0, 0.125, 0.2]}>
        <boxGeometry args={[0.4, 0.02, 0.4]} />
        <meshBasicMaterial color={PALETTE.blue} />
      </mesh>

      {/* 4. Cross Arms (Track corridors) */}
      <mesh position={[0, 0.115, -1.3]}>
        <boxGeometry args={[0.8, 0.02, 1.5]} />
        <meshBasicMaterial color={PALETTE.ivory} />
      </mesh>
      <mesh position={[0, 0.115, 1.3]}>
        <boxGeometry args={[0.8, 0.02, 1.5]} />
        <meshBasicMaterial color={PALETTE.ivory} />
      </mesh>
      <mesh position={[-1.3, 0.115, 0]}>
        <boxGeometry args={[1.5, 0.02, 0.8]} />
        <meshBasicMaterial color={PALETTE.ivory} />
      </mesh>
      <mesh position={[1.3, 0.115, 0]}>
        <boxGeometry args={[1.5, 0.02, 0.8]} />
        <meshBasicMaterial color={PALETTE.ivory} />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*                         MAIN GIANT 3D HERO DICE                            */
/* -------------------------------------------------------------------------- */
function GiantHeroDice({ mousePos, onDiceClick }) {
  const diceGroupRef = useRef();
  const [isHovered, setIsHovered] = useState(false);
  const isRollingRef = useRef(false);

  // Animation A: Initial Entrance on Mount
  useEffect(() => {
    if (!diceGroupRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Start above screen and drop down with a playful bounce
    gsap.fromTo(
      diceGroupRef.current.position,
      { y: 5 },
      { y: 0.35, duration: 1.3, ease: 'bounce.out', delay: 0.1 }
    );

    // Initial landing spin
    gsap.fromTo(
      diceGroupRef.current.rotation,
      { x: -Math.PI * 1.5, y: Math.PI * 2, z: 0.4 },
      { x: 0.35, y: 0.55, z: 0, duration: 1.2, ease: 'power2.out', delay: 0.1 }
    );
  }, []);

  // Animation B: Playful Tumbling Dice Roll
  const triggerDiceRoll = () => {
    if (isRollingRef.current || !diceGroupRef.current) return;
    isRollingRef.current = true;

    if (onDiceClick) onDiceClick();

    const tl = gsap.timeline({
      onComplete: () => {
        isRollingRef.current = false;
      }
    });

    // Squash & jump up
    tl.to(diceGroupRef.current.position, {
      y: 1.2,
      duration: 0.3,
      ease: 'power2.out'
    });

    // Fast tumble rotation across multiple axes
    tl.to(
      diceGroupRef.current.rotation,
      {
        x: '+=6.28',
        y: '+=9.42',
        z: '+=3.14',
        duration: 0.85,
        ease: 'power1.inOut'
      },
      '<'
    );

    // Land down with a bounce
    tl.to(diceGroupRef.current.position, {
      y: 0.35,
      duration: 0.4,
      ease: 'bounce.out'
    });
  };

  // Animation E: Hover Bounce & Spin
  const handlePointerEnter = () => {
    setIsHovered(true);
    document.body.style.cursor = 'pointer';
    if (!isRollingRef.current && diceGroupRef.current) {
      gsap.to(diceGroupRef.current.scale, {
        x: 1.08,
        y: 1.08,
        z: 1.08,
        duration: 0.2,
        ease: 'back.out(2)'
      });
    }
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    document.body.style.cursor = 'default';
    if (!isRollingRef.current && diceGroupRef.current) {
      gsap.to(diceGroupRef.current.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.25,
        ease: 'power2.out'
      });
    }
  };

  // Animation C & D: Continuous Idle Float + Mouse Tracking in useFrame
  useFrame((state, delta) => {
    if (!diceGroupRef.current) return;

    if (!isRollingRef.current) {
      const time = state.clock.elapsedTime;

      // Idle vertical float
      const idleFloatY = Math.sin(time * 1.8) * 0.12;
      diceGroupRef.current.position.y = 0.35 + idleFloatY;

      // Slow ambient vertical rotation
      const rotSpeed = isHovered ? 0.8 : 0.3;
      diceGroupRef.current.rotation.y += delta * rotSpeed;

      // Gentle tilt toward mouse pointer
      const targetTiltX = 0.35 + mousePos.y * 0.3;
      const targetTiltZ = -mousePos.x * 0.25;
      diceGroupRef.current.rotation.x += (targetTiltX - diceGroupRef.current.rotation.x) * 0.05;
      diceGroupRef.current.rotation.z += (targetTiltZ - diceGroupRef.current.rotation.z) * 0.05;
    }
  });

  return (
    <group
      ref={diceGroupRef}
      position={[0, 0.35, 0]}
      rotation={[0.35, 0.55, 0]}
      onClick={triggerDiceRoll}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      {/* High Quality Rounded Ivory Dice Body (Size 1.94, radius 0.2) */}
      <RoundedBox args={[1.94, 1.94, 1.94]} radius={0.2} smoothness={8}>
        <meshStandardMaterial
          color={PALETTE.ivory}
          roughness={0.3}
          metalness={0.04}
        />
      </RoundedBox>

      {/* Six Faces of Red Circular Pips perfectly inset and flush */}
      <DicePips radius={0.16} offset={0.98} />
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*                         LOW-END 2D SVG FALLBACK                            */
/* -------------------------------------------------------------------------- */
function SvgHeroSceneFallback() {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: '440px',
        height: '340px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}
    >
      <svg width="260" height="260" viewBox="0 0 300 300" fill="none">
        <ellipse cx="150" cy="240" rx="85" ry="18" fill="#374151" opacity="0.3" />
        <polygon points="150,180 250,220 150,260 50,220" fill="#f7f2e5" stroke="#374151" strokeWidth="4" />
        <polygon points="150,180 200,200 150,220 100,200" fill="#ffc737" opacity="0.85" />
        <g transform="translate(150, 130)">
          <polygon points="0,-55 58,-22 0,10 -58,-22" fill="#ffffff" stroke="#374151" strokeWidth="4" />
          <polygon points="-58,-22 0,10 0,68 -58,36" fill="#f7f2e5" stroke="#374151" strokeWidth="4" />
          <polygon points="0,10 58,-22 58,36 0,68" fill="#ebe4d3" stroke="#374151" strokeWidth="4" />
          <circle cx="0" cy="-22" r="8" fill="#eb3322" />
          <circle cx="-28" cy="16" r="6" fill="#eb3322" />
          <circle cx="-28" cy="44" r="6" fill="#eb3322" />
          <circle cx="28" cy="16" r="6" fill="#eb3322" />
          <circle cx="28" cy="44" r="6" fill="#eb3322" />
        </g>
        <circle cx="60" cy="120" r="14" fill="#eb3322" stroke="#f7f2e5" strokeWidth="2.5" />
        <circle cx="240" cy="100" r="14" fill="#22a447" stroke="#f7f2e5" strokeWidth="2.5" />
        <circle cx="245" cy="190" r="14" fill="#ffc737" stroke="#f7f2e5" strokeWidth="2.5" />
        <circle cx="55" cy="195" r="14" fill="#2878d0" stroke="#f7f2e5" strokeWidth="2.5" />
      </svg>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                     MAIN 3D HERO SCENE COMPONENT                           */
/* -------------------------------------------------------------------------- */
export default function HeroDice({ onDiceClick }) {
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
    return <SvgHeroSceneFallback />;
  }

  // Token positions snuggly framing the central dice
  const tokenConfigs = [
    { color: PALETTE.red, position: [-1.65, 0.28, 0.85], orbitIndex: 0 },
    { color: PALETTE.green, position: [1.55, 0.85, -0.85], orbitIndex: 1 },
    { color: PALETTE.yellow, position: [1.65, -0.2, 0.85], orbitIndex: 2 },
    { color: PALETTE.blue, position: [-1.45, -0.45, -0.85], orbitIndex: 3 }
  ];

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '560px',
        height: '420px',
        margin: '0 auto',
        position: 'relative',
        userSelect: 'none'
      }}
      aria-label="Interactive 3D Ludo game scene with giant dice and floating player tokens"
    >
      <CanvasErrorBoundary fallback={<SvgHeroSceneFallback />}>
        <Canvas
          orthographic
          camera={{
            position: [6.5, 7.5, 7.5],
            zoom: 50,
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
          {/* User Interactive OrbitControls (Website Controller interaction) */}
          <OrbitControls
            target={[0, -0.2, 0]}
            enableZoom={false}
            enablePan={false}
            enableDamping={true}
            dampingFactor={0.06}
            rotateSpeed={0.85}
            maxPolarAngle={Math.PI / 2.05}
            minPolarAngle={Math.PI / 6}
          />

          {/* Soft Studio Lighting */}
          <ambientLight intensity={1.3} />
          <directionalLight position={[8, 14, 8]} intensity={1.4} />
          <directionalLight position={[-8, -4, -6]} intensity={0.45} />
          <directionalLight position={[0, 10, -8]} intensity={0.5} />

          {/* Miniature 3D Ludo Board below */}
          <MiniatureBoard mousePos={mousePos} />

          {/* Four Floating Classic Ludo Pawns */}
          {tokenConfigs.map((cfg, i) => (
            <LudoToken
              key={`token-${i}`}
              color={cfg.color}
              position={cfg.position}
              orbitIndex={cfg.orbitIndex}
              mousePos={mousePos}
            />
          ))}

          {/* Giant 3D Rounded Hero Dice */}
          <GiantHeroDice mousePos={mousePos} onDiceClick={onDiceClick} />
        </Canvas>
      </CanvasErrorBoundary>

      {/* Interactive Controller Hint Badge */}
      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(55, 65, 81, 0.88)',
          color: 'var(--color-secondary)',
          padding: '6px 16px',
          borderRadius: '999px',
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '0.03em',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          border: '1px solid rgba(247, 242, 229, 0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <span>🕹️</span>
        <span>Drag to rotate • Click dice to roll</span>
      </div>
    </div>
  );
}
