"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// ============================================
// Preview 1: Glitch/Noise Pattern (Camera Shader style)
// ============================================
function GlitchPreviewScene() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
    }),
    []
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          varying vec2 vUv;

          float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
          }

          void main() {
            vec2 uv = vUv;

            // Pixelation
            float pixelSize = 0.04;
            uv = floor(uv / pixelSize) * pixelSize;

            // Animated noise
            float n = random(uv + floor(uTime * 8.0) * 0.1);

            // Scanlines
            float scanline = sin(vUv.y * 200.0 + uTime * 2.0) * 0.03;

            // RGB shift
            float shift = sin(uTime * 2.0) * 0.01;
            float r = random(uv + vec2(shift, 0.0) + floor(uTime * 4.0) * 0.1);
            float g = random(uv + floor(uTime * 4.0) * 0.1);
            float b = random(uv - vec2(shift, 0.0) + floor(uTime * 4.0) * 0.1);

            vec3 color = vec3(r, g, b) * 0.15 + scanline;

            // Vignette
            float vignette = 1.0 - length(vUv - 0.5) * 0.8;
            color *= vignette;

            gl_FragColor = vec4(color, 1.0);
          }
        `}
      />
    </mesh>
  );
}

// ============================================
// Preview Wrapper Components
// ============================================
export function GlitchPreview() {
  return (
    <Canvas
      gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
      dpr={1}
      frameloop="demand"
      style={{ background: "#0a0a0a" }}
    >
      <GlitchPreviewSceneWithInvalidate />
    </Canvas>
  );
}

function GlitchPreviewSceneWithInvalidate() {
  const { invalidate } = useThree();
  useFrame(() => invalidate());
  return <GlitchPreviewScene />;
}

// ============================================
// Preview 4: ASCII Art style
// ============================================
function AsciiPreviewScene() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.2;
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <mesh ref={meshRef}>
        <torusKnotGeometry args={[0.8, 0.25, 64, 16]} />
        <meshStandardMaterial color="#8892b0" metalness={0.2} roughness={0.6} />
      </mesh>
    </>
  );
}

export function AsciiPreview() {
  const preRef = useRef<HTMLPreElement>(null);
  const chars = " .:-=+*#%@";

  return (
    <div className="relative w-full h-full" style={{ background: "#0a0a0f" }}>
      {/* Hidden canvas for rendering */}
      <div className="absolute opacity-0 pointer-events-none" style={{ width: 1, height: 1 }}>
        <Canvas
          camera={{ position: [0, 0, 3], fov: 50 }}
          gl={{ preserveDrawingBuffer: true }}
          onCreated={({ gl, scene, camera }) => {
            const target = new THREE.WebGLRenderTarget(50, 30);
            let frameCount = 0;

            const animate = () => {
              frameCount++;
              // Only update every 3rd frame to reduce CPU usage
              if (frameCount % 3 !== 0) {
                requestAnimationFrame(animate);
                return;
              }

              gl.setRenderTarget(target);
              gl.render(scene, camera);
              gl.setRenderTarget(null);

              const pixels = new Uint8Array(50 * 30 * 4);
              gl.readRenderTargetPixels(target, 0, 0, 50, 30, pixels);

              let str = "";
              for (let y = 29; y >= 0; y--) {
                for (let x = 0; x < 50; x++) {
                  const i = (y * 50 + x) * 4;
                  const lum = (pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114) / 255;
                  str += chars[Math.floor(lum * (chars.length - 1))];
                }
                str += "\n";
              }
              // Update DOM directly instead of using state
              if (preRef.current) {
                preRef.current.textContent = str;
              }
              requestAnimationFrame(animate);
            };
            animate();
          }}
        >
          <color attach="background" args={["#0a0a0f"]} />
          <AsciiPreviewScene />
        </Canvas>
      </div>

      {/* ASCII output */}
      <pre
        ref={preRef}
        className="absolute inset-0 flex items-center justify-center text-[5px] leading-none font-mono select-none overflow-hidden"
        style={{ color: "#8892b0", letterSpacing: "0.15em" }}
      />
    </div>
  );
}

// ============================================
// Preview 3: Eye Tracking style
// ============================================
function EyeTrackingPreviewScene() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    []
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          varying vec2 vUv;

          float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
          }

          void main() {
            vec2 uv = vUv;
            vec2 center = vec2(0.5);

            // Animated eye position
            vec2 eyePos = center + vec2(
              sin(uTime * 0.8) * 0.15,
              cos(uTime * 0.6) * 0.08
            );

            // Eye region box
            vec2 boxSize = vec2(0.35, 0.18);
            vec2 boxMin = eyePos - boxSize * 0.5;
            vec2 boxMax = eyePos + boxSize * 0.5;

            // Background - blurred grid
            float grid = 0.0;
            for (float i = 0.0; i < 20.0; i++) {
              float offset = i * 0.05;
              grid += smoothstep(0.48, 0.5, fract(uv.x * 8.0 + offset)) * 0.02;
              grid += smoothstep(0.48, 0.5, fract(uv.y * 8.0 + offset)) * 0.02;
            }

            vec3 bgColor = vec3(0.04, 0.04, 0.06) + grid * 0.3;

            // Scanline effect
            float scanline = sin(uv.y * 200.0 + uTime * 3.0) * 0.015;
            bgColor += scanline;

            // Eye region - thermal/green effect
            bool inBox = uv.x > boxMin.x && uv.x < boxMax.x && uv.y > boxMin.y && uv.y < boxMax.y;

            vec3 color = bgColor;

            if (inBox) {
              // Thermal-ish green tint
              float intensity = 1.0 - length(uv - eyePos) * 2.0;
              intensity = clamp(intensity, 0.0, 1.0);

              vec3 thermal = vec3(0.1, 0.8, 0.4) * intensity * 0.6;
              thermal += vec3(0.0, 0.3, 0.15);

              // Add noise
              float n = hash(uv * 100.0 + uTime) * 0.1;
              thermal += n;

              color = thermal;
            }

            // Box border
            float borderWidth = 0.003;
            bool onBorder = (
              (uv.x > boxMin.x - borderWidth && uv.x < boxMin.x + borderWidth && uv.y > boxMin.y && uv.y < boxMax.y) ||
              (uv.x > boxMax.x - borderWidth && uv.x < boxMax.x + borderWidth && uv.y > boxMin.y && uv.y < boxMax.y) ||
              (uv.y > boxMin.y - borderWidth && uv.y < boxMin.y + borderWidth && uv.x > boxMin.x && uv.x < boxMax.x) ||
              (uv.y > boxMax.y - borderWidth && uv.y < boxMax.y + borderWidth && uv.x > boxMin.x && uv.x < boxMax.x)
            );

            if (onBorder) {
              color = vec3(1.0, 1.0, 1.0) * 0.6;
            }

            // Vignette
            float vignette = 1.0 - length(uv - 0.5) * 0.6;
            color *= vignette;

            gl_FragColor = vec4(color, 1.0);
          }
        `}
      />
    </mesh>
  );
}

export function EyeTrackingPreview() {
  return (
    <Canvas
      gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
      dpr={1}
      frameloop="demand"
      style={{ background: "#0d0d12" }}
    >
      <EyeTrackingPreviewSceneWithInvalidate />
    </Canvas>
  );
}

function EyeTrackingPreviewSceneWithInvalidate() {
  const { invalidate } = useThree();
  useFrame(() => invalidate());
  return <EyeTrackingPreviewScene />;
}

// ============================================
// Preview 4: Digital Twin style (wireframe/hologram)
// ============================================
function DigitalTwinPreviewScene() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    []
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          varying vec2 vUv;

          float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
          }

          void main() {
            vec2 uv = vUv;
            vec2 center = vec2(0.5);

            // Create triangular grid (wireframe effect)
            float scale = 20.0;
            vec2 p = uv * scale;
            vec2 pi = floor(p);
            vec2 pf = fract(p);

            // Distance to edges
            float d1 = min(pf.x, pf.y);
            float d2 = min(1.0 - pf.x, 1.0 - pf.y);
            float d3 = abs(pf.x + pf.y - 1.0) / 1.414;
            float edge = min(min(d1, d2), d3);

            // Wire effect
            float wire = 1.0 - smoothstep(0.0, 0.05, edge);

            // Simulate face shape with simple SDF
            float faceDist = length((uv - center) * vec2(1.0, 1.3)) - 0.25;
            float faceInfluence = 1.0 - smoothstep(-0.1, 0.15, faceDist);

            // Hologram color cycling
            float hue = uTime * 0.3 + uv.y * 2.0;
            vec3 holoColor = mix(
              vec3(0.0, 0.8, 1.0),
              vec3(0.5, 0.0, 1.0),
              sin(hue) * 0.5 + 0.5
            );

            // Scan line
            float scanLine = smoothstep(0.0, 0.02, abs(fract(uv.y - uTime * 0.3) - 0.5) - 0.48);
            float scan = (1.0 - scanLine) * 0.4;

            // Background
            vec3 bgColor = vec3(0.02, 0.01, 0.04);

            // Combine
            vec3 wireColor = holoColor * wire * faceInfluence * 0.8;
            wireColor += holoColor * scan * faceInfluence * 0.3;

            // Outer glow
            float glow = (1.0 - smoothstep(0.0, 0.3, faceDist)) * 0.2;
            wireColor += holoColor * glow;

            vec3 finalColor = bgColor + wireColor;

            // Scanlines
            float scanlines = sin(uv.y * 200.0 + uTime * 5.0) * 0.02;
            finalColor += scanlines * holoColor;

            // Flicker
            float flicker = 0.95 + 0.05 * sin(uTime * 20.0);
            finalColor *= flicker;

            // Vignette
            float vignette = 1.0 - length(uv - 0.5) * 0.7;
            finalColor *= vignette;

            gl_FragColor = vec4(finalColor, 1.0);
          }
        `}
      />
    </mesh>
  );
}

export function DigitalTwinPreview() {
  return (
    <Canvas
      gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
      dpr={1}
      frameloop="demand"
      style={{ background: "#050508" }}
    >
      <DigitalTwinPreviewSceneWithInvalidate />
    </Canvas>
  );
}

function DigitalTwinPreviewSceneWithInvalidate() {
  const { invalidate } = useThree();
  useFrame(() => invalidate());
  return <DigitalTwinPreviewScene />;
}

// ============================================
// Preview 5: Gesture Masks style (kitsune/oni mask)
// ============================================
function GestureMasksPreviewScene() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    []
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          varying vec2 vUv;

          float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
          }

          // SDF for rounded rectangle
          float sdRoundBox(vec2 p, vec2 b, float r) {
            vec2 q = abs(p) - b + r;
            return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
          }

          // SDF for kitsune ear
          float sdTriangle(vec2 p, vec2 a, vec2 b, vec2 c) {
            vec2 e0 = b - a, e1 = c - b, e2 = a - c;
            vec2 v0 = p - a, v1 = p - b, v2 = p - c;
            vec2 pq0 = v0 - e0*clamp(dot(v0,e0)/dot(e0,e0), 0.0, 1.0);
            vec2 pq1 = v1 - e1*clamp(dot(v1,e1)/dot(e1,e1), 0.0, 1.0);
            vec2 pq2 = v2 - e2*clamp(dot(v2,e2)/dot(e2,e2), 0.0, 1.0);
            float s = sign(e0.x*e2.y - e0.y*e2.x);
            vec2 d = min(min(vec2(dot(pq0,pq0), s*(v0.x*e0.y-v0.y*e0.x)),
                            vec2(dot(pq1,pq1), s*(v1.x*e1.y-v1.y*e1.x))),
                            vec2(dot(pq2,pq2), s*(v2.x*e2.y-v2.y*e2.x)));
            return -sqrt(d.x)*sign(d.y);
          }

          void main() {
            vec2 uv = vUv;
            vec2 center = vec2(0.5);
            vec2 p = uv - center;

            // Background - dark with subtle noise
            float n = hash(uv * 50.0 + uTime * 0.5) * 0.03;
            vec3 bgColor = vec3(0.02, 0.02, 0.03) + n;

            // Kitsune mask base - face shape
            float faceD = sdRoundBox(p * vec2(1.0, 1.2), vec2(0.18, 0.22), 0.08);

            // Ears
            float earL = sdTriangle(p, vec2(-0.15, 0.15), vec2(-0.22, 0.35), vec2(-0.08, 0.22));
            float earR = sdTriangle(p, vec2(0.15, 0.15), vec2(0.22, 0.35), vec2(0.08, 0.22));
            float ears = min(earL, earR);

            // Combine face and ears
            float mask = min(faceD, ears);

            // Mask color - traditional red/white with glow
            float maskEdge = 1.0 - smoothstep(-0.01, 0.01, mask);
            float maskInner = 1.0 - smoothstep(-0.02, 0.0, mask);

            // Red markings
            float markings = 0.0;
            markings += 1.0 - smoothstep(0.0, 0.02, abs(length(p - vec2(-0.08, 0.02)) - 0.04));
            markings += 1.0 - smoothstep(0.0, 0.02, abs(length(p - vec2(0.08, 0.02)) - 0.04));
            // Nose mark
            markings += 1.0 - smoothstep(0.0, 0.015, length(p - vec2(0.0, -0.05)));

            // Animated glow
            float glowPulse = 0.7 + 0.3 * sin(uTime * 2.0);
            vec3 maskColor = vec3(0.95, 0.92, 0.85) * maskInner;
            vec3 redMarks = vec3(0.9, 0.15, 0.1) * markings * glowPulse;

            // Edge glow
            float edgeGlow = (1.0 - smoothstep(0.0, 0.05, mask)) * (1.0 - maskInner);
            vec3 glowColor = vec3(1.0, 0.3, 0.2) * edgeGlow * 0.5 * glowPulse;

            vec3 color = bgColor;
            color = mix(color, maskColor, maskInner * 0.9);
            color += redMarks;
            color += glowColor;

            // Scanlines
            float scanlines = sin(uv.y * 200.0 + uTime * 3.0) * 0.02;
            color += scanlines;

            // Vignette
            float vignette = 1.0 - length(uv - 0.5) * 0.7;
            color *= vignette;

            gl_FragColor = vec4(color, 1.0);
          }
        `}
      />
    </mesh>
  );
}

export function GestureMasksPreview() {
  return (
    <Canvas
      gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
      dpr={1}
      frameloop="demand"
      style={{ background: "#050505" }}
    >
      <GestureMasksPreviewSceneWithInvalidate />
    </Canvas>
  );
}

function GestureMasksPreviewSceneWithInvalidate() {
  const { invalidate } = useThree();
  useFrame(() => invalidate());
  return <GestureMasksPreviewScene />;
}

// ============================================
// Preview 6: Doctor Strange Portal style
// ============================================
function PortalPreviewScene() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    []
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          varying vec2 vUv;

          #define PI 3.14159265359
          #define TWO_PI 6.28318530718

          float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
          }

          void main() {
            vec2 uv = vUv;
            vec2 center = vec2(0.5);
            vec2 p = uv - center;
            float dist = length(p);
            float angle = atan(p.y, p.x);

            // Background
            vec3 bgColor = vec3(0.05, 0.02, 0.0);

            // Portal colors
            vec3 orange = vec3(1.0, 0.5, 0.1);
            vec3 gold = vec3(1.0, 0.8, 0.3);
            vec3 white = vec3(1.0, 0.95, 0.8);

            vec3 color = bgColor;

            // Glowing rings
            float ringRadius = 0.3;
            float ringWidth = 0.02;

            for (float i = 0.0; i < 3.0; i++) {
              float r = ringRadius - i * ringWidth * 1.5;
              float ringDist = abs(dist - r);
              float ring = smoothstep(ringWidth, 0.0, ringDist);

              // Flickering
              float flicker = 0.8 + 0.2 * sin(uTime * 10.0 + i * 2.0);
              vec3 ringColor = mix(orange, gold, i / 3.0) * flicker;

              color += ringColor * ring;
            }

            // Rotating runes (simplified)
            float runeRadius = ringRadius - ringWidth * 2.0;
            float runeAngle = angle + uTime * 0.5;
            float runePattern = sin(runeAngle * 12.0) * 0.5 + 0.5;
            float runeRing = smoothstep(0.02, 0.0, abs(dist - runeRadius));
            color += gold * runeRing * runePattern * 0.8;

            // Outer glow
            float glow = smoothstep(ringRadius + 0.1, ringRadius, dist);
            glow *= smoothstep(ringRadius - ringWidth * 4.0, ringRadius, dist);
            color += orange * glow * 0.4;

            // Sparks
            float sparkAngle = uTime * 0.3;
            for (float i = 0.0; i < 8.0; i++) {
              float a = sparkAngle + i * TWO_PI / 8.0;
              vec2 sparkDir = vec2(cos(a), sin(a));
              float sparkT = fract(uTime * 0.5 + i * 0.1);
              vec2 sparkPos = sparkDir * (ringRadius + sparkT * 0.1);
              float spark = smoothstep(0.02, 0.0, length(p - sparkPos)) * (1.0 - sparkT);
              color += gold * spark;
            }

            // Inner void
            float innerRadius = ringRadius - ringWidth * 3.5;
            float inner = smoothstep(innerRadius, innerRadius - 0.02, dist);
            color = mix(color, bgColor * 0.5, inner);

            // Vignette
            float vignette = 1.0 - length(uv - 0.5) * 0.8;
            color *= vignette;

            gl_FragColor = vec4(color, 1.0);
          }
        `}
      />
    </mesh>
  );
}

export function PortalPreview() {
  return (
    <Canvas
      gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
      dpr={1}
      frameloop="demand"
      style={{ background: "#1a0a00" }}
    >
      <PortalPreviewSceneWithInvalidate />
    </Canvas>
  );
}

function PortalPreviewSceneWithInvalidate() {
  const { invalidate } = useThree();
  useFrame(() => invalidate());
  return <PortalPreviewScene />;
}

// ============================================
// Preview 7: Polaroid Snip style
// ============================================
function PolaroidPreviewScene() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    []
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          varying vec2 vUv;

          float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
          }

          void main() {
            vec2 uv = vUv;

            // Dark background with noise
            float n = hash(uv * 50.0 + uTime * 0.1) * 0.05;
            vec3 bgColor = vec3(0.03) + n;

            // Selection rectangle (animated)
            vec2 selMin = vec2(0.2 + sin(uTime * 0.5) * 0.05, 0.25);
            vec2 selMax = vec2(0.8 - sin(uTime * 0.5) * 0.05, 0.75);

            bool inside = uv.x >= selMin.x && uv.x <= selMax.x && uv.y >= selMin.y && uv.y <= selMax.y;

            vec3 color = bgColor;

            if (inside) {
              // Inside selection - gradient
              vec3 innerColor = mix(vec3(0.2, 0.15, 0.1), vec3(0.3, 0.25, 0.2), uv.y);
              color = innerColor;
            } else {
              // Outside - dimmed
              color = bgColor * 0.5;
            }

            // Marching ants border
            float borderWidth = 0.005;
            bool onBorderX = (abs(uv.x - selMin.x) < borderWidth || abs(uv.x - selMax.x) < borderWidth) &&
                             uv.y >= selMin.y && uv.y <= selMax.y;
            bool onBorderY = (abs(uv.y - selMin.y) < borderWidth || abs(uv.y - selMax.y) < borderWidth) &&
                             uv.x >= selMin.x && uv.x <= selMax.x;

            if (onBorderX || onBorderY) {
              float dash = mod((uv.x + uv.y) * 50.0 + uTime * 3.0, 1.0);
              color = dash > 0.5 ? vec3(1.0) : vec3(0.0);
            }

            // Corner handles
            float handleSize = 0.015;
            vec2 corners[4];
            corners[0] = selMin;
            corners[1] = vec2(selMax.x, selMin.y);
            corners[2] = selMax;
            corners[3] = vec2(selMin.x, selMax.y);

            for (int i = 0; i < 4; i++) {
              if (length(uv - corners[i]) < handleSize) {
                color = vec3(1.0);
              }
            }

            // Polaroid hint in corner
            vec2 polaroidPos = vec2(0.85, 0.15);
            vec2 polaroidSize = vec2(0.1, 0.12);
            vec2 pUv = (uv - polaroidPos + polaroidSize * 0.5) / polaroidSize;

            if (pUv.x >= 0.0 && pUv.x <= 1.0 && pUv.y >= 0.0 && pUv.y <= 1.0) {
              // White polaroid frame
              color = vec3(0.95);
              // Photo area
              if (pUv.x > 0.1 && pUv.x < 0.9 && pUv.y > 0.2 && pUv.y < 0.85) {
                color = vec3(0.3, 0.25, 0.2);
              }
            }

            // Vignette
            float vignette = 1.0 - length(uv - 0.5) * 0.5;
            color *= vignette;

            gl_FragColor = vec4(color, 1.0);
          }
        `}
      />
    </mesh>
  );
}

export function PolaroidPreview() {
  return (
    <Canvas
      gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
      dpr={1}
      frameloop="demand"
      style={{ background: "#0a0a0a" }}
    >
      <PolaroidPreviewSceneWithInvalidate />
    </Canvas>
  );
}

function PolaroidPreviewSceneWithInvalidate() {
  const { invalidate } = useThree();
  useFrame(() => invalidate());
  return <PolaroidPreviewScene />;
}

// ============================================
// Export map for easy lookup
// ============================================
export const previewComponents: Record<number, React.ComponentType> = {
  1: GlitchPreview,
  2: AsciiPreview,
  3: EyeTrackingPreview,
  4: DigitalTwinPreview,
  5: GestureMasksPreview,
  6: PortalPreview,
  7: PolaroidPreview,
};
