"use client";

import { useEffect, useRef, useState, useCallback, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Environment } from "@react-three/drei";
import * as THREE from "three";

// Mask types
type MaskType = "human" | "kitsune" | "oni" | "skull" | "cyber";
const MASKS: MaskType[] = ["human", "kitsune", "oni", "skull", "cyber"];

const MASK_NAMES: Record<MaskType, string> = {
  human: "human",
  kitsune: "kitsune.fox",
  oni: "oni.demon",
  skull: "neon.skull",
  cyber: "cyber.glitch",
};

// Open source 3D mask model URLs (CC licensed from Sketchfab)
const MASK_MODELS: Record<MaskType, string | null> = {
  human: null, // No mask
  kitsune: "/models/kitsune-mask.glb",
  oni: "/models/oni-mask.glb",
  skull: "/models/skull-mask.glb",
  cyber: "/models/cyber-mask.glb",
};

// Fallback procedural mask colors for when models aren't loaded
const MASK_COLORS: Record<MaskType, string> = {
  human: "#ffffff",
  kitsune: "#f5f5f0",
  oni: "#8b0000",
  skull: "#1a1a2e",
  cyber: "#00ffff",
};

interface FaceData {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: number;
  landmarks: {
    leftEye: THREE.Vector3;
    rightEye: THREE.Vector3;
    nose: THREE.Vector3;
    mouth: THREE.Vector3;
    forehead: THREE.Vector3;
    chin: THREE.Vector3;
  };
}

interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

// Procedural Mask Component (fallback when no 3D model)
function ProceduralMask({
  type,
  faceData,
  visible
}: {
  type: MaskType;
  faceData: FaceData;
  visible: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useRef({
    uTime: { value: 0 },
    uMaskType: { value: MASKS.indexOf(type) },
    uColor: { value: new THREE.Color(MASK_COLORS[type]) },
  });

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
    if (meshRef.current && visible) {
      meshRef.current.position.copy(faceData.position);
      meshRef.current.rotation.copy(faceData.rotation);
      meshRef.current.scale.setScalar(faceData.scale * 0.15);
    }
  });

  if (type === "human" || !visible) return null;

  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      vUv = uv;
      vNormal = normalMatrix * normal;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    uniform int uMaskType;
    uniform vec3 uColor;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

    #define PI 3.14159265359

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    void main() {
      vec3 color = uColor;
      vec3 normal = normalize(vNormal);

      // Fresnel rim lighting
      vec3 viewDir = normalize(cameraPosition - vPosition);
      float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);

      // Kitsune - white with red markings
      if (uMaskType == 1) {
        float eyeMark = smoothstep(0.1, 0.0, abs(vUv.x - 0.3) + abs(vUv.y - 0.4) * 0.5);
        eyeMark += smoothstep(0.1, 0.0, abs(vUv.x - 0.7) + abs(vUv.y - 0.4) * 0.5);
        color = mix(vec3(0.95, 0.93, 0.9), vec3(0.85, 0.15, 0.15), eyeMark);
        color += fresnel * vec3(1.0, 0.8, 0.8) * 0.3;
      }
      // Oni - dark red with gold accents
      else if (uMaskType == 2) {
        float goldAccent = smoothstep(0.4, 0.5, vUv.y) * (1.0 - smoothstep(0.5, 0.6, vUv.y));
        color = mix(vec3(0.5, 0.05, 0.05), vec3(0.85, 0.7, 0.3), goldAccent * 0.5);
        color += fresnel * vec3(1.0, 0.3, 0.1) * 0.4;
        // Animated fire glow
        float fire = noise(vUv * 10.0 + uTime) * 0.2;
        color += vec3(fire, fire * 0.3, 0.0);
      }
      // Skull - neon glow
      else if (uMaskType == 3) {
        float pulse = sin(uTime * 2.0) * 0.5 + 0.5;
        vec3 neonPink = vec3(1.0, 0.2, 0.8);
        vec3 neonBlue = vec3(0.2, 0.8, 1.0);
        color = mix(neonPink, neonBlue, vUv.y);
        color *= 0.3 + pulse * 0.4;
        color += fresnel * color * 2.0;
        // Scanlines
        float scan = sin(vUv.y * 100.0 + uTime * 5.0) * 0.1;
        color += scan;
      }
      // Cyber - holographic glitch
      else if (uMaskType == 4) {
        float glitch = step(0.98, hash(vec2(floor(vUv.y * 20.0), floor(uTime * 10.0))));
        vec3 cyan = vec3(0.0, 1.0, 1.0);
        vec3 magenta = vec3(1.0, 0.0, 1.0);
        color = mix(cyan, magenta, vUv.x + sin(uTime) * 0.2);
        color += glitch * vec3(1.0);
        color += fresnel * vec3(0.5, 1.0, 1.0) * 0.5;
        // Grid pattern
        float grid = step(0.9, fract(vUv.x * 20.0)) + step(0.9, fract(vUv.y * 20.0));
        color += grid * 0.1;
      }

      gl_FragColor = vec4(color, 0.9);
    }
  `;

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 32, 32]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms.current}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// 3D Mask Model Component
function MaskModel({
  url,
  faceData,
  visible,
  type
}: {
  url: string;
  faceData: FaceData;
  visible: boolean;
  type: MaskType;
}) {
  const { scene } = useGLTF(url);
  const modelRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (modelRef.current && visible) {
      modelRef.current.position.copy(faceData.position);
      modelRef.current.rotation.copy(faceData.rotation);
      modelRef.current.scale.setScalar(faceData.scale * 0.5);
    }
  });

  if (!visible) return null;

  return (
    <primitive
      ref={modelRef}
      object={scene.clone()}
      visible={visible}
    />
  );
}

// Video Background Component
function VideoBackground({ videoRef }: { videoRef: React.RefObject<HTMLVideoElement | null> }) {
  const { viewport } = useThree();
  const meshRef = useRef<THREE.Mesh>(null);
  const textureRef = useRef<THREE.VideoTexture | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      textureRef.current = new THREE.VideoTexture(videoRef.current);
      textureRef.current.minFilter = THREE.LinearFilter;
      textureRef.current.magFilter = THREE.LinearFilter;
    }
  }, [videoRef]);

  useFrame(() => {
    if (textureRef.current) {
      textureRef.current.needsUpdate = true;
    }
    if (meshRef.current && textureRef.current) {
      (meshRef.current.material as THREE.MeshBasicMaterial).map = textureRef.current;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -5]} scale={[viewport.width * 1.2, viewport.height * 1.2, 1]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial side={THREE.FrontSide} />
    </mesh>
  );
}

// Hand Visualization Component
function HandVisualization({
  landmarks,
  visible
}: {
  landmarks: HandLandmark[];
  visible: boolean;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const pointsGeomRef = useRef<THREE.BufferGeometry>(null);
  const linesGeomRef = useRef<THREE.BufferGeometry>(null);

  const connections = [
    [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
    [0, 5], [5, 6], [6, 7], [7, 8], // Index
    [0, 9], [9, 10], [10, 11], [11, 12], // Middle
    [0, 13], [13, 14], [14, 15], [15, 16], // Ring
    [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
    [5, 9], [9, 13], [13, 17], // Palm
  ];

  // Initialize geometry attributes
  useEffect(() => {
    if (pointsGeomRef.current) {
      const positions = new Float32Array(21 * 3);
      pointsGeomRef.current.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    }
    if (linesGeomRef.current) {
      const positions = new Float32Array(connections.length * 2 * 3);
      linesGeomRef.current.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    }
  }, []);

  useFrame(() => {
    if (!visible || landmarks.length === 0) return;

    // Update points
    if (pointsGeomRef.current) {
      const positions = pointsGeomRef.current.attributes.position as THREE.BufferAttribute;
      if (positions) {
        landmarks.forEach((lm, i) => {
          const x = (1 - lm.x) * 4 - 2;
          const y = (1 - lm.y) * 3 - 1.5;
          const z = -lm.z * 2;
          positions.setXYZ(i, x, y, z);
        });
        positions.needsUpdate = true;
      }
    }

    // Update lines
    if (linesGeomRef.current) {
      const positions = linesGeomRef.current.attributes.position as THREE.BufferAttribute;
      if (positions) {
        let idx = 0;
        connections.forEach(([i, j]) => {
          if (landmarks[i] && landmarks[j]) {
            const x1 = (1 - landmarks[i].x) * 4 - 2;
            const y1 = (1 - landmarks[i].y) * 3 - 1.5;
            const z1 = -landmarks[i].z * 2;
            const x2 = (1 - landmarks[j].x) * 4 - 2;
            const y2 = (1 - landmarks[j].y) * 3 - 1.5;
            const z2 = -landmarks[j].z * 2;
            positions.setXYZ(idx++, x1, y1, z1);
            positions.setXYZ(idx++, x2, y2, z2);
          }
        });
        positions.needsUpdate = true;
      }
    }
  });

  if (!visible || landmarks.length === 0) return null;

  return (
    <group>
      {/* Hand points */}
      <points ref={pointsRef}>
        <bufferGeometry ref={pointsGeomRef} />
        <pointsMaterial size={0.08} color="#ffffff" transparent opacity={0.9} />
      </points>

      {/* Hand connections */}
      <lineSegments ref={linesRef}>
        <bufferGeometry ref={linesGeomRef} />
        <lineBasicMaterial color="#ffffff" transparent opacity={0.4} />
      </lineSegments>
    </group>
  );
}

// Main Scene Component
function Scene({
  videoRef,
  currentMask,
  faceData,
  handLandmarks,
  showHands,
  modelsLoaded
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  currentMask: MaskType;
  faceData: FaceData;
  handLandmarks: HandLandmark[];
  showHands: boolean;
  modelsLoaded: Record<MaskType, boolean>;
}) {
  const modelUrl = MASK_MODELS[currentMask];
  const hasModel = modelUrl && modelsLoaded[currentMask];

  return (
    <>
      <VideoBackground videoRef={videoRef} />

      {/* Use 3D model if available, otherwise procedural */}
      {hasModel ? (
        <Suspense fallback={null}>
          <MaskModel
            url={modelUrl}
            faceData={faceData}
            visible={currentMask !== "human"}
            type={currentMask}
          />
        </Suspense>
      ) : (
        <ProceduralMask
          type={currentMask}
          faceData={faceData}
          visible={currentMask !== "human"}
        />
      )}

      <HandVisualization landmarks={handLandmarks} visible={showHands} />

      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
    </>
  );
}

export default function GestureMasks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [currentMask, setCurrentMask] = useState<MaskType>("human");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHandLandmarks, setShowHandLandmarks] = useState(true);
  const [modelsLoaded, setModelsLoaded] = useState<Record<MaskType, boolean>>({
    human: true,
    kitsune: false,
    oni: false,
    skull: false,
    cyber: false,
  });

  // Face tracking data
  const [faceData, setFaceData] = useState<FaceData>({
    position: new THREE.Vector3(0, 0, 0),
    rotation: new THREE.Euler(0, 0, 0),
    scale: 1,
    landmarks: {
      leftEye: new THREE.Vector3(-0.1, 0, 0),
      rightEye: new THREE.Vector3(0.1, 0, 0),
      nose: new THREE.Vector3(0, -0.05, 0.1),
      mouth: new THREE.Vector3(0, -0.15, 0),
      forehead: new THREE.Vector3(0, 0.15, 0),
      chin: new THREE.Vector3(0, -0.25, 0),
    },
  });

  // Hand tracking
  const [handLandmarks, setHandLandmarks] = useState<HandLandmark[]>([]);
  const prevHandXRef = useRef<number[]>([]);
  const flickCooldownRef = useRef(0);

  // MediaPipe refs
  const handsRef = useRef<any>(null);
  const faceMeshRef = useRef<any>(null);

  const changeMask = useCallback((direction: number) => {
    setCurrentMask((prev) => {
      const currentIndex = MASKS.indexOf(prev);
      const newIndex = (currentIndex + direction + MASKS.length) % MASKS.length;
      return MASKS[newIndex];
    });
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
        setError(null);
        loadMediaPipe();
      }
    } catch {
      setError("Camera access denied");
    }
  };

  const loadMediaPipe = async () => {
    setIsLoading(true);

    try {
      const { Hands } = await import("@mediapipe/hands");
      const { FaceMesh } = await import("@mediapipe/face_mesh");
      const { Camera } = await import("@mediapipe/camera_utils");

      // Initialize Hands
      const hands = new Hands({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 0,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      hands.onResults((results: any) => {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          const landmarks = results.multiHandLandmarks[0];
          setHandLandmarks(landmarks);

          // Flick detection
          const wristX = landmarks[0].x;
          const history = prevHandXRef.current;
          history.push(wristX);
          if (history.length > 5) history.shift();

          if (history.length >= 5 && flickCooldownRef.current <= 0) {
            const velocity = history[4] - history[0];
            if (Math.abs(velocity) > 0.15) {
              const direction = velocity > 0 ? 1 : -1;
              changeMask(direction);
              flickCooldownRef.current = 30;
            }
          }
        } else {
          setHandLandmarks([]);
        }

        if (flickCooldownRef.current > 0) {
          flickCooldownRef.current--;
        }
      });

      handsRef.current = hands;

      // Initialize Face Mesh
      const faceMesh = new FaceMesh({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      faceMesh.onResults((results: any) => {
        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
          const landmarks = results.multiFaceLandmarks[0];

          // Key landmarks
          const leftEye = landmarks[33];
          const rightEye = landmarks[263];
          const nose = landmarks[1];
          const mouth = landmarks[13];
          const chin = landmarks[152];
          const forehead = landmarks[10];

          // Calculate face center and orientation
          const centerX = (leftEye.x + rightEye.x) / 2;
          const centerY = (forehead.y + chin.y) / 2;
          const centerZ = (leftEye.z + rightEye.z) / 2;

          // Convert to 3D space
          const x = (1 - centerX) * 4 - 2;
          const y = (1 - centerY) * 3 - 1.5;
          const z = -centerZ * 2 - 1;

          // Calculate rotation
          const eyeAngle = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x);
          const tiltAngle = Math.atan2(nose.z - centerZ, 0.1);

          // Scale based on eye distance
          const eyeDist = Math.sqrt(
            Math.pow(rightEye.x - leftEye.x, 2) +
            Math.pow(rightEye.y - leftEye.y, 2)
          );
          const scale = eyeDist * 8;

          setFaceData({
            position: new THREE.Vector3(x, y, z),
            rotation: new THREE.Euler(-tiltAngle * 0.5, 0, -eyeAngle),
            scale,
            landmarks: {
              leftEye: new THREE.Vector3((1 - leftEye.x) * 4 - 2, (1 - leftEye.y) * 3 - 1.5, -leftEye.z * 2),
              rightEye: new THREE.Vector3((1 - rightEye.x) * 4 - 2, (1 - rightEye.y) * 3 - 1.5, -rightEye.z * 2),
              nose: new THREE.Vector3((1 - nose.x) * 4 - 2, (1 - nose.y) * 3 - 1.5, -nose.z * 2),
              mouth: new THREE.Vector3((1 - mouth.x) * 4 - 2, (1 - mouth.y) * 3 - 1.5, -mouth.z * 2),
              forehead: new THREE.Vector3((1 - forehead.x) * 4 - 2, (1 - forehead.y) * 3 - 1.5, -forehead.z * 2),
              chin: new THREE.Vector3((1 - chin.x) * 4 - 2, (1 - chin.y) * 3 - 1.5, -chin.z * 2),
            },
          });
        }
      });

      faceMeshRef.current = faceMesh;

      // Start camera processing
      if (videoRef.current) {
        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current) {
              await hands.send({ image: videoRef.current });
              await faceMesh.send({ image: videoRef.current });
            }
          },
          width: 1280,
          height: 720,
        });
        camera.start();
      }

      setIsLoading(false);
    } catch (err) {
      console.error("MediaPipe loading failed:", err);
      setError("Failed to load tracking models");
      setIsLoading(false);
    }
  };

  // Preload 3D models
  useEffect(() => {
    MASKS.forEach((mask) => {
      const url = MASK_MODELS[mask];
      if (url) {
        // Check if model exists
        fetch(url, { method: "HEAD" })
          .then((res) => {
            if (res.ok) {
              useGLTF.preload(url);
              setModelsLoaded((prev) => ({ ...prev, [mask]: true }));
            }
          })
          .catch(() => {
            // Model doesn't exist, will use procedural fallback
          });
      }
    });
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "ArrowRight") {
        e.preventDefault();
        changeMask(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        changeMask(-1);
      } else if (e.key === "h") {
        setShowHandLandmarks((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [changeMask]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-black">
      {/* Hidden video element */}
      <video
        ref={videoRef}
        className="hidden"
        playsInline
        muted
      />

      {/* Three.js Canvas */}
      {cameraActive && (
        <Canvas
          camera={{ position: [0, 0, 2], fov: 50 }}
          className="absolute inset-0"
          gl={{ antialias: true, alpha: false }}
        >
          <Scene
            videoRef={videoRef}
            currentMask={currentMask}
            faceData={faceData}
            handLandmarks={handLandmarks}
            showHands={showHandLandmarks}
            modelsLoaded={modelsLoaded}
          />
        </Canvas>
      )}

      {/* Start Screen */}
      {!cameraActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-8">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-light text-white/90">Gesture Masks</h1>
            <p className="text-sm text-white/50 max-w-sm">
              Flick your hand left/right to change AR face masks.
              Uses MediaPipe for real-time hand & face tracking.
            </p>
          </div>

          <button
            onClick={startCamera}
            disabled={isLoading}
            className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white/80 transition-all duration-200 disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "Enable Camera"}
          </button>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <div className="text-xs text-white/30 space-y-1 text-center mt-4">
            <p>Keyboard: ←/→ or Space to change masks</p>
            <p>H to toggle hand visualization</p>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin mx-auto" />
            <p className="text-white/60 text-sm">Loading tracking models...</p>
          </div>
        </div>
      )}

      {/* Mask Name Display */}
      {cameraActive && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <div className="px-6 py-2 bg-black/50 backdrop-blur-sm border border-white/10 rounded-full">
            <span className="text-white/80 font-mono text-sm tracking-wider">
              {MASK_NAMES[currentMask]}
            </span>
          </div>
        </div>
      )}

      {/* Mask Selector */}
      {cameraActive && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {MASKS.map((mask, i) => (
            <button
              key={mask}
              onClick={() => setCurrentMask(mask)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                currentMask === mask
                  ? "bg-white scale-125"
                  : "bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`Select ${mask} mask`}
            />
          ))}
        </div>
      )}

      {/* Hand Toggle */}
      {cameraActive && (
        <button
          onClick={() => setShowHandLandmarks((prev) => !prev)}
          className={`absolute top-4 right-4 z-10 p-2 rounded-lg transition-all duration-200 ${
            showHandLandmarks
              ? "bg-white/20 text-white"
              : "bg-black/50 text-white/50"
          }`}
          aria-label="Toggle hand visualization"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
          </svg>
        </button>
      )}
    </div>
  );
}
