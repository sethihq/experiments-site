"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// Public webcam feeds from around the world
const WORLD_LOCATIONS = [
  { name: "Tokyo, Japan", url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80" },
  { name: "New York, USA", url: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80" },
  { name: "Paris, France", url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80" },
  { name: "London, UK", url: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80" },
  { name: "Sydney, Australia", url: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&q=80" },
  { name: "Dubai, UAE", url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80" },
  { name: "Hong Kong", url: "https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=800&q=80" },
  { name: "Singapore", url: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80" },
  { name: "Rio de Janeiro", url: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80" },
  { name: "Rome, Italy", url: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80" },
];

interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

interface Portal {
  x: number;
  y: number;
  radius: number;
  progress: number;
  locationIndex: number;
  closing: boolean;
}

interface PathPoint {
  x: number;
  y: number;
  time: number;
}

// Position smoothing for accurate finger tracking
const SMOOTHING_FACTOR = 0.4;
const POSITION_HISTORY_SIZE = 8;

interface SmoothedPosition {
  x: number;
  y: number;
  history: { x: number; y: number }[];
}

function smoothPosition(current: SmoothedPosition, newX: number, newY: number): SmoothedPosition {
  const history = [...current.history, { x: newX, y: newY }].slice(-POSITION_HISTORY_SIZE);

  // Weighted average (recent points have higher weight)
  let weightSum = 0;
  let xSum = 0;
  let ySum = 0;

  for (let i = 0; i < history.length; i++) {
    const weight = (i + 1) * (i + 1); // Quadratic weights for responsiveness
    weightSum += weight;
    xSum += history[i].x * weight;
    ySum += history[i].y * weight;
  }

  const avgX = xSum / weightSum;
  const avgY = ySum / weightSum;

  // Exponential smoothing
  const smoothedX = current.x * (1 - SMOOTHING_FACTOR) + avgX * SMOOTHING_FACTOR;
  const smoothedY = current.y * (1 - SMOOTHING_FACTOR) + avgY * SMOOTHING_FACTOR;

  return { x: smoothedX, y: smoothedY, history };
}

// Vertex shader
const vertexShaderSource = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;

  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = a_texCoord;
  }
`;

// Doctor Strange Portal Fragment Shader - Movie-accurate version
const portalFragmentShader = `
  precision highp float;

  uniform sampler2D u_cameraTexture;
  uniform sampler2D u_portalTexture;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec2 u_portalCenter;
  uniform float u_portalRadius;
  uniform float u_progress;
  uniform bool u_hasPortal;

  // Drawing path (up to 64 points)
  uniform vec2 u_pathPoints[64];
  uniform int u_pathLength;
  uniform bool u_isDrawing;

  varying vec2 v_texCoord;

  #define PI 3.14159265359
  #define TWO_PI 6.28318530718

  // Better hash function
  float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  float hash1(float p) {
    return fract(sin(p * 127.1) * 43758.5453);
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

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p);
      p *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }

  vec2 rotate(vec2 p, float a) {
    float c = cos(a);
    float s = sin(a);
    return vec2(c * p.x - s * p.y, s * p.x + c * p.y);
  }

  // Sanskrit/mystical rune shapes - more variety
  float runeSymbol(vec2 p, float seed) {
    float d = 1.0;
    int type = int(mod(seed * 11.0, 8.0));

    if (type == 0) {
      // Om-like symbol
      d = min(d, abs(length(p) - 0.2) - 0.02);
      d = min(d, abs(length(p - vec2(0.15, 0.1)) - 0.08) - 0.015);
      d = min(d, max(abs(p.x + 0.1) - 0.015, abs(p.y - 0.15) - 0.1));
    } else if (type == 1) {
      // Triangle with dot
      vec2 q = abs(p);
      d = min(d, max(q.x * 0.866 + p.y * 0.5, -p.y) - 0.18);
      d = min(d, length(p + vec2(0.0, 0.08)) - 0.03);
    } else if (type == 2) {
      // Cross with circles
      d = min(d, max(abs(p.x) - 0.02, abs(p.y) - 0.2));
      d = min(d, max(abs(p.y) - 0.02, abs(p.x) - 0.2));
      d = min(d, abs(length(p) - 0.12) - 0.02);
    } else if (type == 3) {
      // Spiral
      float a = atan(p.y, p.x);
      float r = length(p);
      d = min(d, abs(r - 0.08 - a * 0.025) - 0.015);
    } else if (type == 4) {
      // Three dots in triangle
      d = min(d, length(p - vec2(0.0, 0.12)) - 0.04);
      d = min(d, length(p - vec2(-0.1, -0.06)) - 0.04);
      d = min(d, length(p - vec2(0.1, -0.06)) - 0.04);
    } else if (type == 5) {
      // Crescent
      d = min(d, max(length(p) - 0.15, -(length(p - vec2(0.06, 0.0)) - 0.12)));
    } else if (type == 6) {
      // Star
      float a = atan(p.y, p.x);
      float r = length(p);
      float star = 0.15 + 0.08 * cos(a * 5.0);
      d = min(d, abs(r - star) - 0.02);
    } else {
      // Eye symbol
      d = min(d, max(abs(p.x) - 0.18, abs(p.y * 2.0) - 0.1));
      d = min(d, length(p) - 0.05);
    }
    return d;
  }

  // Spark particle with trail
  float sparkParticle(vec2 p, vec2 origin, vec2 dir, float seed, float time) {
    float t = fract(time * 0.8 + seed);
    float speed = 0.15 + hash1(seed * 123.0) * 0.15;
    vec2 pos = origin + dir * t * speed;

    // Spark with slight curve
    float curve = sin(t * PI) * 0.02;
    pos += vec2(-dir.y, dir.x) * curve * hash1(seed * 456.0);

    float fade = pow(1.0 - t, 1.5) * pow(t * 4.0, 0.3);
    float size = 0.008 + 0.004 * (1.0 - t);

    // Core + glow
    float spark = smoothstep(size, 0.0, length(p - pos)) * fade;
    spark += smoothstep(size * 3.0, 0.0, length(p - pos)) * fade * 0.3;

    return spark;
  }

  // Rotating spark on ring edge
  float ringSparkle(vec2 p, float radius, float angle, float seed, float time) {
    float sparkAngle = angle + time * (1.0 + hash1(seed) * 0.5);
    vec2 pos = vec2(cos(sparkAngle), sin(sparkAngle)) * radius;

    float flicker = 0.5 + 0.5 * sin(time * 30.0 + seed * 100.0);
    float size = 0.006 + 0.003 * flicker;

    return smoothstep(size, 0.0, length(p - pos)) * flicker;
  }

  // Distance to line segment
  float sdSegment(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
  }

  void main() {
    vec2 uv = v_texCoord;
    vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
    uv.x = 1.0 - uv.x; // Mirror

    vec4 camera = texture2D(u_cameraTexture, vec2(1.0 - v_texCoord.x, v_texCoord.y));
    vec3 color = camera.rgb;

    // Doctor Strange portal colors - warm orange/gold palette
    vec3 deepOrange = vec3(1.0, 0.3, 0.0);
    vec3 brightOrange = vec3(1.0, 0.5, 0.1);
    vec3 gold = vec3(1.0, 0.8, 0.2);
    vec3 hotWhite = vec3(1.0, 0.95, 0.85);
    vec3 emberRed = vec3(1.0, 0.2, 0.05);

    // === DRAWING TRAIL (fire spark effect) ===
    if (u_isDrawing && u_pathLength > 1) {
      float trailGlow = 0.0;
      float trailCore = 0.0;

      // Draw trail segments
      for (int i = 1; i < 64; i++) {
        if (i >= u_pathLength) break;

        vec2 p1 = u_pathPoints[i - 1];
        vec2 p2 = u_pathPoints[i];
        float d = sdSegment(uv, p1, p2);

        // Age-based intensity (recent = brighter)
        float age = float(u_pathLength - i) / float(u_pathLength);
        float intensity = pow(1.0 - age, 0.5);

        // Hot core
        trailCore += smoothstep(0.008, 0.0, d) * intensity;
        // Orange glow
        trailGlow += smoothstep(0.025, 0.0, d) * intensity * 0.8;
        // Outer glow
        trailGlow += smoothstep(0.06, 0.0, d) * intensity * 0.3;
      }

      // Flying sparks from trail
      for (int i = 0; i < 64; i++) {
        if (i >= u_pathLength) break;

        vec2 p = u_pathPoints[i];
        float seed = float(i) * 0.157;

        // Multiple sparks per point
        for (int j = 0; j < 3; j++) {
          float sparkSeed = seed + float(j) * 0.33;
          float sparkT = fract(u_time * 2.0 + sparkSeed);
          vec2 sparkDir = vec2(
            cos(sparkSeed * TWO_PI * 3.0 + u_time),
            sin(sparkSeed * TWO_PI * 3.0 + u_time) - 0.5 // Slight upward bias
          );
          sparkDir = normalize(sparkDir);

          vec2 sparkPos = p + sparkDir * sparkT * 0.08;
          float sparkFade = (1.0 - sparkT) * sparkT * 4.0;
          float sparkDist = length(uv - sparkPos);

          trailGlow += smoothstep(0.012, 0.0, sparkDist) * sparkFade * 0.5;
        }

        // Sparkle at point
        float sparkle = smoothstep(0.015, 0.0, length(uv - p));
        sparkle *= 0.6 + 0.4 * sin(u_time * 25.0 + float(i) * 0.7);
        trailCore += sparkle * 0.4;
      }

      // Compose trail colors
      color += hotWhite * trailCore;
      color += brightOrange * trailGlow;
      color += deepOrange * trailGlow * 0.5;
    }

    // === PORTAL (when formed) ===
    if (u_hasPortal && u_progress > 0.01) {
      vec2 portalUV = (uv - u_portalCenter) * aspect;
      float dist = length(portalUV);
      float angle = atan(portalUV.y, portalUV.x);

      // Smooth easing for opening
      float easedProgress = u_progress * u_progress * (3.0 - 2.0 * u_progress);
      float currentRadius = u_portalRadius * easedProgress;
      float ringThickness = 0.04;
      float outerEdge = currentRadius;
      float innerEdge = currentRadius - ringThickness * 2.5;

      // === PORTAL INTERIOR ===
      if (dist < innerEdge * 0.98) {
        // Distortion effect
        float distortAmount = 0.025;
        vec2 distortion = vec2(
          fbm(portalUV * 4.0 + u_time * 0.2),
          fbm(portalUV * 4.0 + u_time * 0.2 + 100.0)
        ) * distortAmount;

        // Ripple from center
        float ripple = sin(dist * 40.0 - u_time * 4.0) * 0.008 * (1.0 - dist / innerEdge);
        vec2 rippleOffset = normalize(portalUV + 0.0001) * ripple;

        vec2 sampleUV = v_texCoord + distortion + rippleOffset;
        vec4 portalView = texture2D(u_portalTexture, sampleUV);

        // Vignette inside portal
        float vignette = 1.0 - smoothstep(innerEdge * 0.3, innerEdge * 0.95, dist);
        color = portalView.rgb * (0.85 + vignette * 0.15);
      }

      // === GLOWING RING STRUCTURE ===
      float ringGlow = 0.0;
      float ringCore = 0.0;

      // Multiple concentric rings with noise
      for (float i = 0.0; i < 4.0; i++) {
        float ringRadius = outerEdge - i * ringThickness * 0.6;
        float ringDist = abs(dist - ringRadius);

        // Add noise to ring edge
        float noiseFreq = 8.0 + i * 2.0;
        float edgeNoise = fbm(vec2(angle * noiseFreq, u_time * 0.3 + i)) * 0.008;
        ringDist -= edgeNoise;

        // Ring intensity
        float coreWidth = 0.004 + 0.002 * (3.0 - i);
        float glowWidth = 0.02 + 0.01 * (3.0 - i);

        ringCore += smoothstep(coreWidth, 0.0, ringDist) * (1.0 - i * 0.2);
        ringGlow += smoothstep(glowWidth, 0.0, ringDist) * (1.0 - i * 0.15);
      }

      // Flickering energy
      float energyFlicker = 0.85 + 0.15 * sin(u_time * 15.0) * sin(u_time * 23.0 + angle * 3.0);

      color = mix(color, hotWhite, ringCore * easedProgress * energyFlicker);
      color += gold * ringGlow * 0.7 * easedProgress * energyFlicker;
      color += brightOrange * ringGlow * 0.4 * easedProgress;

      // === ROTATING RUNES ===
      float runeRingRadius = outerEdge - ringThickness;
      float runeCount = 16.0;

      for (int i = 0; i < 16; i++) {
        float baseAngle = float(i) * TWO_PI / runeCount;
        // Runes rotate around the ring
        float runeAngle = baseAngle + u_time * 0.4;
        vec2 runePos = vec2(cos(runeAngle), sin(runeAngle)) * runeRingRadius;

        // Scale and rotate the rune to face outward
        vec2 runeUV = (portalUV - runePos) * 18.0;
        runeUV = rotate(runeUV, -runeAngle - PI * 0.5);

        float runeDist = runeSymbol(runeUV, float(i) * 0.137);
        float runeIntensity = smoothstep(0.025, 0.0, runeDist);

        // Pulsing glow
        float pulse = 0.6 + 0.4 * sin(u_time * 3.0 + float(i) * 0.5);
        vec3 runeColor = mix(brightOrange, hotWhite, pulse * runeIntensity);

        color = mix(color, runeColor, runeIntensity * easedProgress * 0.9);
      }

      // === SPARKS ON RING EDGE ===
      float sparkles = 0.0;
      for (int i = 0; i < 60; i++) {
        float seed = float(i) * 0.0167;
        sparkles += ringSparkle(portalUV, outerEdge, seed * TWO_PI * 5.0, seed, u_time);
      }
      color += hotWhite * sparkles * easedProgress * 0.8;

      // === FLYING SPARKS (emanating outward) ===
      float flyingSparks = 0.0;
      for (int i = 0; i < 40; i++) {
        float seed = float(i) * 0.025;
        float sparkAngle = seed * TWO_PI * 7.0 + sin(u_time * 0.5 + seed * 10.0) * 0.3;
        vec2 sparkDir = vec2(cos(sparkAngle), sin(sparkAngle));
        vec2 sparkOrigin = sparkDir * outerEdge;

        flyingSparks += sparkParticle(portalUV, sparkOrigin, sparkDir, seed, u_time);
      }
      color += gold * flyingSparks * easedProgress;
      color += emberRed * flyingSparks * 0.3 * easedProgress;

      // === OUTER GLOW ===
      float outerGlow = smoothstep(outerEdge + 0.12, outerEdge, dist);
      outerGlow *= smoothstep(innerEdge, outerEdge, dist);
      outerGlow *= 0.6 + 0.4 * fbm(vec2(angle * 3.0, u_time * 0.5));
      color += deepOrange * outerGlow * 0.4 * easedProgress;
      color += brightOrange * outerGlow * 0.2 * easedProgress;

      // === INNER EDGE GLOW ===
      float innerGlow = smoothstep(innerEdge, innerEdge - 0.025, dist);
      innerGlow *= smoothstep(innerEdge - 0.06, innerEdge - 0.02, dist);
      color += hotWhite * innerGlow * 0.7 * easedProgress;
      color += gold * innerGlow * 0.4 * easedProgress;
    }

    // Slight HDR bloom simulation
    color = pow(color, vec3(0.95));

    gl_FragColor = vec4(color, 1.0);
  }
`;

export default function DoctorStrangePortal() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const animationRef = useRef<number>(0);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const cameraTextureRef = useRef<WebGLTexture | null>(null);
  const portalTextureRef = useRef<WebGLTexture | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<string>("");
  const [showInstructions, setShowInstructions] = useState(true);

  // Gesture tracking refs
  const handPositionsRef = useRef<HandLandmark[]>([]);
  const fingerPathRef = useRef<PathPoint[]>([]);
  const portalRef = useRef<Portal | null>(null);
  const isDrawingRef = useRef(false);
  const lastLocationIndexRef = useRef(-1);

  // Smoothed finger tracking for accuracy
  const smoothedFingerRef = useRef<SmoothedPosition>({ x: 0.5, y: 0.5, history: [] });
  const drawingConfirmFramesRef = useRef(0);
  const notDrawingConfirmFramesRef = useRef(0);

  const initWebGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const gl = canvas.getContext("webgl", {
      preserveDrawingBuffer: true,
      alpha: false,
      antialias: false,
    });

    if (!gl) {
      setError("WebGL not supported");
      return null;
    }

    // Compile shaders
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      console.error("Vertex shader error:", gl.getShaderInfoLog(vertexShader));
      return null;
    }

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fragmentShader, portalFragmentShader);
    gl.compileShader(fragmentShader);

    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      console.error("Fragment shader error:", gl.getShaderInfoLog(fragmentShader));
      return null;
    }

    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
      return null;
    }

    gl.useProgram(program);

    // Set up geometry
    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const texCoords = new Float32Array([0, 1, 1, 1, 0, 0, 1, 0]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    const positionLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
    const texCoordLoc = gl.getAttribLocation(program, "a_texCoord");
    gl.enableVertexAttribArray(texCoordLoc);
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);

    // Create textures
    const cameraTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, cameraTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const portalTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, portalTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.uniform1i(gl.getUniformLocation(program, "u_cameraTexture"), 0);
    gl.uniform1i(gl.getUniformLocation(program, "u_portalTexture"), 1);

    glRef.current = gl;
    programRef.current = program;
    cameraTextureRef.current = cameraTexture;
    portalTextureRef.current = portalTexture;

    return gl;
  }, []);

  // Check if finger path forms a circle - very lenient detection
  const detectCircularGesture = useCallback((path: PathPoint[]) => {
    if (path.length < 15) return null; // Reduced from 20

    let centerX = 0, centerY = 0;
    path.forEach(p => {
      centerX += p.x;
      centerY += p.y;
    });
    centerX /= path.length;
    centerY /= path.length;

    let avgRadius = 0;
    path.forEach(p => {
      avgRadius += Math.sqrt(Math.pow(p.x - centerX, 2) + Math.pow(p.y - centerY, 2));
    });
    avgRadius /= path.length;

    let radiusVariance = 0;
    path.forEach(p => {
      const r = Math.sqrt(Math.pow(p.x - centerX, 2) + Math.pow(p.y - centerY, 2));
      radiusVariance += Math.pow(r - avgRadius, 2);
    });
    radiusVariance /= path.length;

    const startEnd = Math.sqrt(
      Math.pow(path[0].x - path[path.length - 1].x, 2) +
      Math.pow(path[0].y - path[path.length - 1].y, 2)
    );

    // Very lenient circle detection
    const isCircular = radiusVariance < 0.025 && startEnd < avgRadius * 0.8 && avgRadius > 0.03;

    if (isCircular) {
      return { x: centerX, y: centerY, radius: avgRadius };
    }
    return null;
  }, []);

  // Get random location (avoiding repeats)
  const getRandomLocation = useCallback(() => {
    let index;
    do {
      index = Math.floor(Math.random() * WORLD_LOCATIONS.length);
    } while (index === lastLocationIndexRef.current && WORLD_LOCATIONS.length > 1);
    lastLocationIndexRef.current = index;
    return index;
  }, []);

  // Load portal image
  const loadPortalImage = useCallback((locationIndex: number) => {
    const location = WORLD_LOCATIONS[locationIndex];
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setCurrentLocation(location.name);
      const gl = glRef.current;
      if (gl && portalTextureRef.current) {
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, portalTextureRef.current);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      }
    };
    img.onerror = () => {
      console.error("Failed to load image:", location.url);
    };
    img.src = location.url;
  }, []);

  // Open portal
  const openPortal = useCallback((x: number, y: number, radius: number) => {
    const locationIndex = getRandomLocation();
    loadPortalImage(locationIndex);

    const newPortal: Portal = {
      x,
      y,
      radius: Math.max(radius * 1.5, 0.15),
      progress: 0,
      locationIndex,
      closing: false,
    };

    portalRef.current = newPortal;
    setShowInstructions(false);
    fingerPathRef.current = [];
    isDrawingRef.current = false;
  }, [loadPortalImage, getRandomLocation]);

  // Close portal
  const closePortal = useCallback(() => {
    if (portalRef.current) {
      portalRef.current.closing = true;
    }
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
        initWebGL();
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
      const { Camera } = await import("@mediapipe/camera_utils");

      const hands = new Hands({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1, // Highest accuracy
        minDetectionConfidence: 0.8, // Higher confidence
        minTrackingConfidence: 0.8,
      });

      hands.onResults((results: any) => {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          const landmarks = results.multiHandLandmarks[0];
          handPositionsRef.current = landmarks;

          // Get finger landmarks for gesture detection
          const indexTip = landmarks[8];
          const middleTip = landmarks[12];

          // Simple gesture detection - just check if index finger is extended
          // Index finger extended = tip is far from palm (wrist)
          const wrist = landmarks[0];
          const indexLength = Math.sqrt(
            Math.pow(indexTip.x - wrist.x, 2) +
            Math.pow(indexTip.y - wrist.y, 2)
          );
          const middleLength = Math.sqrt(
            Math.pow(middleTip.x - wrist.x, 2) +
            Math.pow(middleTip.y - wrist.y, 2)
          );

          // Pointing = index finger is the furthest from wrist (or close to it)
          const isPointingGesture = indexLength > 0.15 && indexLength >= middleLength * 0.85;

          // Multi-frame confirmation to avoid false positives
          if (isPointingGesture && !portalRef.current) {
            drawingConfirmFramesRef.current++;
            notDrawingConfirmFramesRef.current = 0;

            // Start drawing after 2 frames of confirmed gesture
            if (drawingConfirmFramesRef.current >= 2) {
              isDrawingRef.current = true;

              // Smooth the finger position for accurate tracking
              const rawX = 1 - indexTip.x; // Mirrored
              const rawY = indexTip.y;
              smoothedFingerRef.current = smoothPosition(smoothedFingerRef.current, rawX, rawY);

              const smoothX = smoothedFingerRef.current.x;
              const smoothY = smoothedFingerRef.current.y;

              const now = Date.now();

              // Add smoothed position to path
              fingerPathRef.current.push({
                x: smoothX,
                y: smoothY,
                time: now,
              });

              // Keep last 5 seconds of path (more time to complete circle)
              fingerPathRef.current = fingerPathRef.current.filter(
                (p) => now - p.time < 5000
              );

              // Limit path length for shader (increased for larger circles)
              if (fingerPathRef.current.length > 80) {
                fingerPathRef.current = fingerPathRef.current.slice(-80);
              }

              // Check for circle when enough points collected
              if (fingerPathRef.current.length >= 25) {
                const circle = detectCircularGesture(fingerPathRef.current);
                if (circle) {
                  openPortal(circle.x, circle.y, circle.radius);
                }
              }
            }
          } else if (!isPointingGesture) {
            notDrawingConfirmFramesRef.current++;
            drawingConfirmFramesRef.current = 0;

            // Stop drawing after 10 frames of not pointing (more tolerance for hand rotation)
            if (notDrawingConfirmFramesRef.current >= 10) {
              // Fade out path gradually
              if (fingerPathRef.current.length > 0) {
                fingerPathRef.current = fingerPathRef.current.slice(1);
              }
              if (fingerPathRef.current.length === 0) {
                isDrawingRef.current = false;
                // Reset smoothing when starting fresh
                smoothedFingerRef.current = { x: 0.5, y: 0.5, history: [] };
              }
            }
          }

          // Check for closing gesture (fist near portal)
          if (portalRef.current && !portalRef.current.closing) {
            const palmBase = landmarks[0];
            const middleTipPoint = landmarks[12];
            const fistDist = Math.sqrt(
              Math.pow(palmBase.x - middleTipPoint.x, 2) +
              Math.pow(palmBase.y - middleTipPoint.y, 2)
            );

            const portalDist = Math.sqrt(
              Math.pow(1 - palmBase.x - portalRef.current.x, 2) +
              Math.pow(palmBase.y - portalRef.current.y, 2)
            );

            if (fistDist < 0.1 && portalDist < portalRef.current.radius) {
              closePortal();
            }
          }
        } else {
          // No hand detected - fade out path
          notDrawingConfirmFramesRef.current++;
          drawingConfirmFramesRef.current = 0;

          if (notDrawingConfirmFramesRef.current >= 5) {
            if (fingerPathRef.current.length > 0) {
              fingerPathRef.current = fingerPathRef.current.slice(2);
            }
            if (fingerPathRef.current.length === 0) {
              isDrawingRef.current = false;
              smoothedFingerRef.current = { x: 0.5, y: 0.5, history: [] };
            }
          }
        }
      });

      if (videoRef.current) {
        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current) {
              await hands.send({ image: videoRef.current });
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
      setError("Failed to load hand tracking");
      setIsLoading(false);
    }
  };

  const render = useCallback(
    (time: number) => {
      const gl = glRef.current;
      const program = programRef.current;
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!gl || !program || !video || !canvas) {
        animationRef.current = requestAnimationFrame(render);
        return;
      }

      // Canvas sizing
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.floor(rect.width * dpr);
      const height = Math.floor(rect.height * dpr);

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }

      // Update camera texture
      if (video.readyState >= video.HAVE_CURRENT_DATA) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, cameraTextureRef.current);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
      }

      // Update portal progress
      if (portalRef.current) {
        if (portalRef.current.closing) {
          portalRef.current.progress -= 0.03;
          if (portalRef.current.progress <= 0) {
            portalRef.current = null;
            setCurrentLocation("");
          }
        } else {
          portalRef.current.progress = Math.min(portalRef.current.progress + 0.02, 1);
        }
      }

      // Set uniforms
      gl.uniform2f(gl.getUniformLocation(program, "u_resolution"), canvas.width, canvas.height);
      gl.uniform1f(gl.getUniformLocation(program, "u_time"), time * 0.001);

      // Drawing path uniforms
      gl.uniform1i(gl.getUniformLocation(program, "u_isDrawing"), isDrawingRef.current ? 1 : 0);
      gl.uniform1i(gl.getUniformLocation(program, "u_pathLength"), fingerPathRef.current.length);

      // Pass path points to shader
      const pathData = new Float32Array(64 * 2);
      fingerPathRef.current.forEach((p, i) => {
        if (i < 64) {
          pathData[i * 2] = p.x;
          pathData[i * 2 + 1] = p.y;
        }
      });
      gl.uniform2fv(gl.getUniformLocation(program, "u_pathPoints"), pathData);

      // Portal uniforms
      if (portalRef.current) {
        gl.uniform1i(gl.getUniformLocation(program, "u_hasPortal"), 1);
        gl.uniform2f(
          gl.getUniformLocation(program, "u_portalCenter"),
          portalRef.current.x,
          portalRef.current.y
        );
        gl.uniform1f(gl.getUniformLocation(program, "u_portalRadius"), portalRef.current.radius);
        gl.uniform1f(gl.getUniformLocation(program, "u_progress"), portalRef.current.progress);
      } else {
        gl.uniform1i(gl.getUniformLocation(program, "u_hasPortal"), 0);
        gl.uniform1f(gl.getUniformLocation(program, "u_progress"), 0);
      }

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      animationRef.current = requestAnimationFrame(render);
    },
    []
  );

  // Start render loop
  useEffect(() => {
    if (cameraActive) {
      animationRef.current = requestAnimationFrame(render);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [cameraActive, render]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " && cameraActive) {
        e.preventDefault();
        if (!portalRef.current) {
          openPortal(0.5, 0.5, 0.2);
        } else {
          closePortal();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cameraActive, openPortal, closePortal]);

  return (
    <div className="relative w-full h-full bg-black">
      <video ref={videoRef} className="hidden" playsInline muted />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Start Screen */}
      {!cameraActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-8 bg-black/90">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-light text-orange-400">Sling Ring Portal</h1>
            <p className="text-sm text-white/50 max-w-sm">
              Point your index finger and draw a circle in the air
              to open a portal to a random location around the world.
            </p>
          </div>

          <button
            onClick={startCamera}
            disabled={isLoading}
            className="px-8 py-3 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 rounded-lg text-orange-300 transition-all duration-200 disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "Enable Camera"}
          </button>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="text-xs text-white/30 space-y-1 text-center mt-4">
            <p>☝️ Point index finger → Draw circle</p>
            <p>✊ Make fist in portal → Close it</p>
            <p>Spacebar → Quick toggle</p>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mx-auto" />
            <p className="text-orange-300/60 text-sm">Loading hand tracking...</p>
          </div>
        </div>
      )}

      {/* Instructions */}
      {cameraActive && showInstructions && !portalRef.current && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
          <div className="text-center space-y-4 animate-pulse">
            <div className="w-24 h-24 mx-auto border-2 border-dashed border-orange-500/40 rounded-full flex items-center justify-center">
              <span className="text-4xl">☝️</span>
            </div>
            <p className="text-orange-400/80 text-sm">Draw a circle to open portal</p>
          </div>
        </div>
      )}

      {/* Location Display */}
      {currentLocation && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <div className="px-6 py-2 bg-black/50 backdrop-blur-sm border border-orange-500/20 rounded-full">
            <span className="text-orange-300 font-mono text-sm tracking-wider">
              📍 {currentLocation}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
