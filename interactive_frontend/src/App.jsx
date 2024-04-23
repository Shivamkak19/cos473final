import { Vector3 } from 'three'
import { useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, PresentationControls, Float, SpotLight, useDepthBuffer, Environment, OrbitControls } from '@react-three/drei'


export default function App() {

  console.log("in the app")

  return (
    <Canvas shadows dpr={[1, 2]} camera={{ position: [-2, 2, 6], fov: 50, near: 1, far: 20 }}>
      <color attach="background" args={['#0a192f']} />
      <fog attach="fog" args={['#0a192f', 5, 20]} />
      <ambientLight intensity={0.055} />

      <Scene />
    </Canvas>
  )
}

// Loads the 3D model
function modelLoad(props) {
  const { scene } = useGLTF('/rusty_lock_free.glb')
  return (
      <primitive object={scene} {...props} />

  )
  
}

function Scene() {

    // Model transformation parameters
    const rotation = [0, - Math.PI / 4, 0];
    const position = [-2.2, 0.25, 1];
    const scale = [1.5, 1.5, 1.5];



  console.log("in scene")

  // This is a super cheap depth buffer that only renders once (frames: 1 is optional!), which works well for static scenes
  // Spots can optionally use that for realism, learn about soft particles here: http://john-chapman-graphics.blogspot.com/2013/01/good-enough-volumetrics-for-spotlights.html
  const depthBuffer = useDepthBuffer({ frames: 1 })
  return (
    <>
      <MovingSpot depthBuffer={depthBuffer} color="#FFFFFF" position={[3, 3, 2]} />
      <MovingSpot depthBuffer={depthBuffer} color="#b00c3f" position={[1, 3, 0]} />
      {modelLoad({rotation, position, scale})}
      <mesh receiveShadow position={[0, -1, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[50, 50]} />
        <meshPhongMaterial />
      </mesh>
    </>
  )
}

function MovingSpot({ vec = new Vector3(), ...props }) {

  console.log("in spot")

  const light = useRef()
  const viewport = useThree((state) => state.viewport)
  useFrame((state) => {
    light.current.target.position.lerp(vec.set((state.mouse.x * viewport.width) / 2, (state.mouse.y * viewport.height) / 2, 0), 0.1)
    light.current.target.updateMatrixWorld()
  })
  return <SpotLight castShadow ref={light} penumbra={1} distance={6} angle={0.35} attenuation={5} anglePower={4} intensity={2} {...props} />
}
