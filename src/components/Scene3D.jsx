import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Float, MeshDistortMaterial, Sphere, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { Heart, Hospital, Cpu, MapPin, Mic } from 'lucide-react'
import { motion } from 'framer-motion'

// Floating Icon Component
const FloatingIcon = ({ position, icon: Icon, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay }}
      className="absolute"
      style={{
        left: `${position[0]}%`,
        top: `${position[1]}%`,
      }}
    >
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="w-16 h-16 bg-white rounded-2xl shadow-2xl flex items-center justify-center backdrop-blur-md"
      >
        <Icon className="w-8 h-8 text-[#0F6FFF]" strokeWidth={2} />
      </motion.div>
    </motion.div>
  )
}

// Capsule with Cross
const Capsule = () => {
  const meshRef = useRef()
  const ringRef = useRef()

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    // Floating animation
    meshRef.current.position.y = Math.sin(time * 0.5) * 0.3
    meshRef.current.rotation.y = time * 0.2
    
    // Ring rotation
    if (ringRef.current) {
      ringRef.current.rotation.z = time * 0.5
      ringRef.current.rotation.x = Math.sin(time * 0.3) * 0.3
    }
  })

  return (
    <group ref={meshRef}>
      {/* Main Capsule */}
      <mesh castShadow>
        <capsuleGeometry args={[1, 2, 32, 64]} />
        <MeshDistortMaterial
          color="#0F6FFF"
          attach="material"
          distort={0.3}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Medical Cross */}
      <group>
        {/* Vertical bar */}
        <mesh position={[0, 0, 1.1]}>
          <boxGeometry args={[0.3, 1.2, 0.1]} />
          <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.5} />
        </mesh>
        {/* Horizontal bar */}
        <mesh position={[0, 0.2, 1.1]}>
          <boxGeometry args={[1.0, 0.3, 0.1]} />
          <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.5} />
        </mesh>
      </group>

      {/* Orbit Ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[2.5, 0.05, 16, 100]} />
        <meshStandardMaterial
          color="#14C8A8"
          emissive="#14C8A8"
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </group>
  )
}

// Particles
const Particles = () => {
  const particlesRef = useRef()
  
  const particles = useMemo(() => {
    const positions = []
    const colors = []
    
    for (let i = 0; i < 100; i++) {
      positions.push(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
      )
      
      const color = new THREE.Color()
      color.setHSL(Math.random() * 0.2 + 0.5, 0.7, 0.6)
      colors.push(color.r, color.g, color.b)
    }
    
    return { positions: new Float32Array(positions), colors: new Float32Array(colors) }
  }, [])

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.getElapsedTime() * 0.05
    }
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.positions.length / 3}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particles.colors.length / 3}
          array={particles.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  )
}

// Background Sphere
const BackgroundSphere = () => {
  return (
    <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
      <Sphere args={[1.5, 64, 64]} position={[4, -2, -5]}>
        <MeshDistortMaterial
          color="#14C8A8"
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.4}
          metalness={0.5}
          transparent
          opacity={0.3}
        />
      </Sphere>
    </Float>
  )
}

// Main Scene Component
const Scene3D = () => {
  const icons = [
    { icon: Heart, position: [10, 15] },
    { icon: Hospital, position: [85, 20] },
    { icon: Cpu, position: [15, 75] },
    { icon: MapPin, position: [80, 70] },
    { icon: Mic, position: [50, 5] },
  ]

  return (
    <div className="relative w-full h-full">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        className="cursor-grab active:cursor-grabbing"
      >
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#14C8A8" />
        <spotLight
          position={[0, 10, 0]}
          angle={0.3}
          penumbra={1}
          intensity={1}
          castShadow
          color="#0F6FFF"
        />

        {/* 3D Objects */}
        <Capsule />
        <BackgroundSphere />
        <Particles />

        {/* Controls */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
      </Canvas>

      {/* Floating Icons Overlay */}
      {icons.map((item, index) => (
        <FloatingIcon
          key={index}
          position={item.position}
          icon={item.icon}
          delay={0.8 + index * 0.15}
        />
      ))}

      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-radial from-[#0F6FFF]/20 via-transparent to-transparent pointer-events-none"></div>
    </div>
  )
}

export default Scene3D
