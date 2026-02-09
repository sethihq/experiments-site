"use client";

import { useRef, useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Center } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";

// ASCII characters from dark to light
const ASCII_CHARS_DARK = " .:-=+*#%@";
const ASCII_CHARS_LIGHT = "@%#*+=-:. ";

// Density presets
const DENSITY_PRESETS = {
  low: { cols: 60, fontSize: 10 },
  medium: { cols: 100, fontSize: 7 },
  high: { cols: 150, fontSize: 5 },
};

type DensityLevel = "low" | "medium" | "high";
type Theme = "dark" | "light";

// Models available
const MODELS = [
  { id: "truck", name: "Truck", type: "glb", path: "/models/cesium-milk-truck.glb", scale: 0.8 },
  { id: "torus", name: "Torus", type: "geometry" },
];

interface SceneProps {
  modelId: string;
  onRender: (renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) => void;
}

// GLB Model component
function GLBModel({ path, scale = 1 }: { path: string; scale?: number }) {
  const { scene } = useGLTF(path);
  const groupRef = useRef<THREE.Group>(null);
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    // Apply white material for better ASCII rendering
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: "#ffffff",
          metalness: 0.1,
          roughness: 0.4,
        });
      }
    });
    return clone;
  }, [scene]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <Center>
      <group ref={groupRef} scale={scale}>
        <primitive object={clonedScene} />
      </group>
    </Center>
  );
}

// 3D Scene with model
function Scene({ modelId, onRender }: SceneProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { gl, scene, camera } = useThree();
  const model = MODELS.find((m) => m.id === modelId);

  useFrame((state) => {
    if (meshRef.current && model?.type === "geometry") {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.2;
    }
    onRender(gl, scene, camera);
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <directionalLight position={[-5, -5, -5]} intensity={0.5} />

      {model?.type === "glb" && model.path ? (
        <Suspense fallback={null}>
          <GLBModel path={model.path} scale={model.scale} />
        </Suspense>
      ) : (
        <mesh ref={meshRef}>
          <torusKnotGeometry args={[1, 0.3, 128, 32]} />
          <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.4} />
        </mesh>
      )}

      <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
    </>
  );
}

// ASCII Renderer component
function AsciiRenderer({
  density,
  theme,
  modelId,
}: {
  density: DensityLevel;
  theme: Theme;
  modelId: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ascii, setAscii] = useState<string>("");
  const renderTargetRef = useRef<THREE.WebGLRenderTarget | null>(null);

  const { cols, fontSize } = DENSITY_PRESETS[density];
  const chars = theme === "dark" ? ASCII_CHARS_DARK : ASCII_CHARS_LIGHT;

  // Create render target
  useEffect(() => {
    renderTargetRef.current = new THREE.WebGLRenderTarget(cols, Math.floor(cols * 0.6), {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
    });
    return () => {
      renderTargetRef.current?.dispose();
    };
  }, [cols]);

  // Convert rendered frame to ASCII
  const handleRender = useCallback(
    (renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) => {
      if (!renderTargetRef.current) return;

      const target = renderTargetRef.current;
      const width = target.width;
      const height = target.height;

      // Render to target
      renderer.setRenderTarget(target);
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);

      // Read pixels
      const pixels = new Uint8Array(width * height * 4);
      renderer.readRenderTargetPixels(target, 0, 0, width, height, pixels);

      // Convert to ASCII
      let asciiStr = "";
      for (let y = height - 1; y >= 0; y--) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];

          // Calculate luminance
          const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

          // Map to ASCII character
          const charIndex = Math.floor(luminance * (chars.length - 1));
          asciiStr += chars[charIndex];
        }
        asciiStr += "\n";
      }
      setAscii(asciiStr);
    },
    [chars]
  );

  const bgColor = theme === "dark" ? "#0a0a0f" : "#f5f5f5";
  const textColor = theme === "dark" ? "#8892b0" : "#2d3748";

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      {/* Hidden Three.js canvas */}
      <div className="absolute opacity-0 pointer-events-none" style={{ width: 1, height: 1 }}>
        <Canvas
          ref={canvasRef}
          camera={{ position: [0, 0, 4], fov: 50 }}
          gl={{ preserveDrawingBuffer: true }}
        >
          <color attach="background" args={[bgColor]} />
          <Scene modelId={modelId} onRender={handleRender} />
        </Canvas>
      </div>

      {/* ASCII output */}
      <pre
        className="absolute inset-0 flex items-center justify-center overflow-hidden select-none"
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: "1.0",
          fontFamily: "monospace",
          color: textColor,
          letterSpacing: "0.1em",
          whiteSpace: "pre",
        }}
      >
        {ascii}
      </pre>
    </div>
  );
}

// Main component
export default function Ascii3D() {
  const [density, setDensity] = useState<DensityLevel>("medium");
  const [theme, setTheme] = useState<Theme>("dark");
  const [modelId, setModelId] = useState("truck");

  return (
    <div className="relative w-full h-full min-h-[500px]">
      <AsciiRenderer density={density} theme={theme} modelId={modelId} />

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-4 left-4 right-4 flex items-center justify-between"
      >
        {/* Model selector */}
        <div className="flex items-center gap-2">
          {MODELS.map((model) => (
            <button
              key={model.id}
              onClick={() => setModelId(model.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                modelId === model.id
                  ? theme === "dark"
                    ? "bg-white/20 text-white"
                    : "bg-black/20 text-black"
                  : theme === "dark"
                  ? "bg-white/5 text-white/50 hover:bg-white/10"
                  : "bg-black/5 text-black/50 hover:bg-black/10"
              }`}
            >
              {model.name}
            </button>
          ))}
        </div>

        {/* Density & Theme controls */}
        <div className="flex items-center gap-3">
          {/* Density toggle */}
          <div
            className={`flex rounded-lg p-0.5 ${
              theme === "dark" ? "bg-white/10" : "bg-black/10"
            }`}
          >
            {(["low", "medium", "high"] as DensityLevel[]).map((level) => (
              <button
                key={level}
                onClick={() => setDensity(level)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
                  density === level
                    ? theme === "dark"
                      ? "bg-white text-black"
                      : "bg-black text-white"
                    : theme === "dark"
                    ? "text-white/60 hover:text-white"
                    : "text-black/60 hover:text-black"
                }`}
              >
                {level}
              </button>
            ))}
          </div>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              theme === "dark"
                ? "bg-white/10 text-white hover:bg-white/20"
                : "bg-black/10 text-black hover:bg-black/20"
            }`}
          >
            {theme === "dark" ? "☀" : "☾"}
          </button>
        </div>
      </motion.div>

      {/* Model label */}
      <div
        className={`absolute bottom-4 left-4 text-xs font-mono uppercase tracking-wider ${
          theme === "dark" ? "text-white/30" : "text-black/30"
        }`}
      >
        ASCII / {MODELS.find((m) => m.id === modelId)?.name}
      </div>
    </div>
  );
}
