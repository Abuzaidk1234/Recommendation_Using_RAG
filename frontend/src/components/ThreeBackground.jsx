import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';

function AbstractShape({ position, color, speed, speedXY, factor }) {
  const meshRef = useRef();

  useFrame((state, delta) => {
    meshRef.current.rotation.x += delta * speedXY;
    meshRef.current.rotation.y += delta * speedXY;
  });

  return (
    <Float speed={speed} rotationIntensity={2} floatIntensity={2} position={position}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1, 1]} />
        <MeshDistortMaterial
          color={color}
          envMapIntensity={1}
          clearcoat={1}
          clearcoatRoughness={0.1}
          metalness={0.1}
          roughness={0.4}
          distort={factor}
          speed={speed}
        />
      </mesh>
    </Float>
  );
}

export default function ThreeBackground() {
  return (
    <div className="three-bg-container">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={1} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
        <directionalLight position={[-10, -10, -5]} intensity={0.8} color="#ffffff" />
        
        <AbstractShape position={[-3, 2, -2]} color="#ff6b6b" speed={1.5} speedXY={0.2} factor={0.4} />
        <AbstractShape position={[3, -2, -1]} color="#fca311" speed={2} speedXY={0.1} factor={0.6} />
        <AbstractShape position={[0, 0, -3]} color="#8ac926" speed={1} speedXY={0.15} factor={0.3} />
        <AbstractShape position={[-4, -3, -4]} color="#ffca3a" speed={2.5} speedXY={0.3} factor={0.5} />
        <AbstractShape position={[4, 3, -5]} color="#1982c4" speed={1.8} speedXY={0.25} factor={0.7} />
      </Canvas>
    </div>
  );
}