"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// Shader effect types
type ShaderEffect = "base" | "ascii" | "thermal" | "edge" | "oil" | "dither" | "halftone";

const EFFECTS: ShaderEffect[] = ["base", "ascii", "thermal", "edge", "oil", "dither", "halftone"];

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

// Fragment shader
const fragmentShaderSource = `
  precision highp float;

  uniform sampler2D u_texture;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform int u_effect;
  uniform vec4 u_eyeRegion;

  varying vec2 v_texCoord;

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

  vec4 blur9(sampler2D tex, vec2 uv, vec2 texelSize, float strength) {
    vec4 color = vec4(0.0);
    vec2 off = texelSize * strength;
    color += texture2D(tex, uv + vec2(-off.x, -off.y)) * 0.0625;
    color += texture2D(tex, uv + vec2(0.0, -off.y)) * 0.125;
    color += texture2D(tex, uv + vec2(off.x, -off.y)) * 0.0625;
    color += texture2D(tex, uv + vec2(-off.x, 0.0)) * 0.125;
    color += texture2D(tex, uv) * 0.25;
    color += texture2D(tex, uv + vec2(off.x, 0.0)) * 0.125;
    color += texture2D(tex, uv + vec2(-off.x, off.y)) * 0.0625;
    color += texture2D(tex, uv + vec2(0.0, off.y)) * 0.125;
    color += texture2D(tex, uv + vec2(off.x, off.y)) * 0.0625;
    return color;
  }

  vec4 blurMulti(sampler2D tex, vec2 uv, vec2 resolution) {
    vec2 texelSize = 1.0 / resolution;
    vec4 color = vec4(0.0);
    for (float i = 1.0; i <= 4.0; i++) {
      color += blur9(tex, uv, texelSize, i * 5.0);
    }
    return color / 4.0;
  }

  bool inEyeRegion(vec2 uv) {
    return uv.x >= u_eyeRegion.x &&
           uv.x <= u_eyeRegion.x + u_eyeRegion.z &&
           uv.y >= u_eyeRegion.y &&
           uv.y <= u_eyeRegion.y + u_eyeRegion.w;
  }

  vec4 effectBase(vec2 uv) {
    return texture2D(u_texture, uv);
  }

  vec4 effectAscii(vec2 uv) {
    float cellSize = 6.0;
    vec2 cell = floor(uv * u_resolution / cellSize);
    vec2 cellUV = fract(uv * u_resolution / cellSize);
    vec2 sampleUV = (cell + 0.5) * cellSize / u_resolution;
    vec4 color = texture2D(u_texture, sampleUV);
    float brightness = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    float dotSize = 0.15 + brightness * 0.35;
    vec2 dotPos = cellUV - 0.5;
    float dot = 1.0 - smoothstep(dotSize - 0.05, dotSize + 0.05, length(dotPos));
    vec3 terminalGreen = vec3(0.1, 0.9, 0.35);
    vec3 darkBg = vec3(0.02, 0.06, 0.03);
    float scanline = 0.92 + 0.08 * sin(uv.y * u_resolution.y * 1.5);
    float flicker = 0.97 + 0.03 * sin(u_time * 15.0 + uv.y * 10.0);
    vec3 finalColor = mix(darkBg, terminalGreen, dot * brightness) * scanline * flicker;
    return vec4(finalColor, 1.0);
  }

  vec4 effectThermal(vec2 uv) {
    vec4 color = texture2D(u_texture, uv);
    float temp = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    vec3 thermal;
    if (temp < 0.15) {
      thermal = mix(vec3(0.0, 0.0, 0.2), vec3(0.0, 0.0, 0.8), temp / 0.15);
    } else if (temp < 0.3) {
      thermal = mix(vec3(0.0, 0.0, 0.8), vec3(0.0, 0.6, 0.8), (temp - 0.15) / 0.15);
    } else if (temp < 0.45) {
      thermal = mix(vec3(0.0, 0.6, 0.8), vec3(0.0, 0.9, 0.2), (temp - 0.3) / 0.15);
    } else if (temp < 0.6) {
      thermal = mix(vec3(0.0, 0.9, 0.2), vec3(1.0, 1.0, 0.0), (temp - 0.45) / 0.15);
    } else if (temp < 0.75) {
      thermal = mix(vec3(1.0, 1.0, 0.0), vec3(1.0, 0.5, 0.0), (temp - 0.6) / 0.15);
    } else if (temp < 0.9) {
      thermal = mix(vec3(1.0, 0.5, 0.0), vec3(1.0, 0.0, 0.0), (temp - 0.75) / 0.15);
    } else {
      thermal = mix(vec3(1.0, 0.0, 0.0), vec3(1.0, 0.9, 0.9), (temp - 0.9) / 0.1);
    }
    float n = noise(uv * 150.0 + u_time * 0.5) * 0.05;
    thermal += n;
    return vec4(thermal, 1.0);
  }

  vec4 effectEdge(vec2 uv) {
    vec2 texel = 1.0 / u_resolution;
    float tl = dot(texture2D(u_texture, uv + texel * vec2(-1, -1)).rgb, vec3(0.299, 0.587, 0.114));
    float t  = dot(texture2D(u_texture, uv + texel * vec2( 0, -1)).rgb, vec3(0.299, 0.587, 0.114));
    float tr = dot(texture2D(u_texture, uv + texel * vec2( 1, -1)).rgb, vec3(0.299, 0.587, 0.114));
    float l  = dot(texture2D(u_texture, uv + texel * vec2(-1,  0)).rgb, vec3(0.299, 0.587, 0.114));
    float r  = dot(texture2D(u_texture, uv + texel * vec2( 1,  0)).rgb, vec3(0.299, 0.587, 0.114));
    float bl = dot(texture2D(u_texture, uv + texel * vec2(-1,  1)).rgb, vec3(0.299, 0.587, 0.114));
    float b  = dot(texture2D(u_texture, uv + texel * vec2( 0,  1)).rgb, vec3(0.299, 0.587, 0.114));
    float br = dot(texture2D(u_texture, uv + texel * vec2( 1,  1)).rgb, vec3(0.299, 0.587, 0.114));
    float gx = -tl - 2.0*l - bl + tr + 2.0*r + br;
    float gy = -tl - 2.0*t - tr + bl + 2.0*b + br;
    float edge = sqrt(gx*gx + gy*gy);
    edge = smoothstep(0.05, 0.3, edge);
    vec3 neonColor = vec3(0.3, 0.85, 1.0);
    vec3 bgColor = vec3(0.02, 0.02, 0.05);
    vec3 finalColor = mix(bgColor, neonColor, edge);
    finalColor += neonColor * edge * 0.3;
    return vec4(finalColor, 1.0);
  }

  // Oil Painting - Kuwahara filter (simplified for WebGL 1.0)
  vec4 effectOil(vec2 uv) {
    vec2 texel = 1.0 / u_resolution * 2.0;

    // Sample 4 quadrants with fixed radius of 3
    vec3 m0 = vec3(0.0), m1 = vec3(0.0), m2 = vec3(0.0), m3 = vec3(0.0);
    vec3 s0 = vec3(0.0), s1 = vec3(0.0), s2 = vec3(0.0), s3 = vec3(0.0);

    // Quadrant 0: top-left
    for (int j = -3; j <= 0; j++) {
      for (int i = -3; i <= 0; i++) {
        vec3 c = texture2D(u_texture, uv + vec2(float(i), float(j)) * texel).rgb;
        m0 += c; s0 += c * c;
      }
    }
    // Quadrant 1: top-right
    for (int j = -3; j <= 0; j++) {
      for (int i = 0; i <= 3; i++) {
        vec3 c = texture2D(u_texture, uv + vec2(float(i), float(j)) * texel).rgb;
        m1 += c; s1 += c * c;
      }
    }
    // Quadrant 2: bottom-right
    for (int j = 0; j <= 3; j++) {
      for (int i = 0; i <= 3; i++) {
        vec3 c = texture2D(u_texture, uv + vec2(float(i), float(j)) * texel).rgb;
        m2 += c; s2 += c * c;
      }
    }
    // Quadrant 3: bottom-left
    for (int j = 0; j <= 3; j++) {
      for (int i = -3; i <= 0; i++) {
        vec3 c = texture2D(u_texture, uv + vec2(float(i), float(j)) * texel).rgb;
        m3 += c; s3 += c * c;
      }
    }

    float n = 16.0; // (3+1)^2
    m0 /= n; m1 /= n; m2 /= n; m3 /= n;
    s0 = abs(s0 / n - m0 * m0);
    s1 = abs(s1 / n - m1 * m1);
    s2 = abs(s2 / n - m2 * m2);
    s3 = abs(s3 / n - m3 * m3);

    float sig0 = s0.r + s0.g + s0.b;
    float sig1 = s1.r + s1.g + s1.b;
    float sig2 = s2.r + s2.g + s2.b;
    float sig3 = s3.r + s3.g + s3.b;

    float minSig = min(min(sig0, sig1), min(sig2, sig3));
    vec3 result = m0;
    if (sig1 < minSig + 0.001) result = m1;
    if (sig2 < minSig + 0.001) result = m2;
    if (sig3 < minSig + 0.001) result = m3;

    return vec4(result, 1.0);
  }

  // Bayer 8x8 dither matrix value (stronger dithering pattern)
  float bayerDither8(vec2 pos) {
    vec2 p = floor(mod(pos, 8.0));
    float x = p.x;
    float y = p.y;

    // 8x8 Bayer matrix approximation for stronger visible pattern
    float v = mod(x, 2.0) * 32.0;
    v += mod(y, 2.0) * 16.0;
    v += mod(floor(x / 2.0), 2.0) * 8.0;
    v += mod(floor(y / 2.0), 2.0) * 4.0;
    v += mod(floor(x / 4.0), 2.0) * 2.0;
    v += mod(floor(y / 4.0), 2.0) * 1.0;

    return v / 64.0;
  }

  // Strong Ordered Dithering - classic retro/1-bit style
  vec4 effectDither(vec2 uv) {
    vec4 color = texture2D(u_texture, uv);

    // Scale down for visible pixel grid
    float pixelScale = 3.0;
    vec2 pixelPos = floor(uv * u_resolution / pixelScale);
    vec2 blockUV = pixelPos * pixelScale / u_resolution;

    // Sample at block center
    vec4 blockColor = texture2D(u_texture, blockUV + (pixelScale * 0.5) / u_resolution);

    // Convert to grayscale for classic 1-bit dithering
    float lum = dot(blockColor.rgb, vec3(0.299, 0.587, 0.114));

    // Apply strong Bayer dithering
    float threshold = bayerDither8(pixelPos);

    // 1-bit output: pure black or white
    float dithered = step(threshold, lum);

    // Classic green phosphor monitor look
    vec3 darkColor = vec3(0.02, 0.05, 0.02);
    vec3 brightColor = vec3(0.2, 0.9, 0.3);

    vec3 finalColor = mix(darkColor, brightColor, dithered);

    // Add subtle scanlines
    float scanline = 0.9 + 0.1 * sin(uv.y * u_resolution.y * 0.5);
    finalColor *= scanline;

    return vec4(finalColor, 1.0);
  }

  // Halftone / Ben-Day dots (Comic book style)
  vec4 effectHalftone(vec2 uv) {
    vec4 color = texture2D(u_texture, uv);

    float dotSize = 6.0;
    vec2 pixelPos = uv * u_resolution;
    vec2 cell = floor(pixelPos / dotSize);
    vec2 cellUV = fract(pixelPos / dotSize);
    vec2 samplePos = (cell + 0.5) * dotSize / u_resolution;

    vec4 sampleColor = texture2D(u_texture, samplePos);

    // CMYK-style separation with offset dots
    float c = 1.0 - sampleColor.r;
    float m = 1.0 - sampleColor.g;
    float y = 1.0 - sampleColor.b;
    float k = min(min(c, m), y);

    // Different angle offsets for each channel (Ben-Day style)
    float angleC = 0.261799; // 15 degrees
    float angleM = 1.309; // 75 degrees
    float angleY = 0.0;
    float angleK = 0.785398; // 45 degrees

    vec2 centerC = vec2(0.5) + vec2(cos(angleC), sin(angleC)) * 0.1;
    vec2 centerM = vec2(0.5) + vec2(cos(angleM), sin(angleM)) * 0.1;
    vec2 centerY = vec2(0.5) + vec2(cos(angleY), sin(angleY)) * 0.1;
    vec2 centerK = vec2(0.5) + vec2(cos(angleK), sin(angleK)) * 0.1;

    float dotC = 1.0 - smoothstep(c * 0.4 - 0.02, c * 0.4 + 0.02, length(cellUV - centerC));
    float dotM = 1.0 - smoothstep(m * 0.4 - 0.02, m * 0.4 + 0.02, length(cellUV - centerM));
    float dotY = 1.0 - smoothstep(y * 0.4 - 0.02, y * 0.4 + 0.02, length(cellUV - centerY));
    float dotK = 1.0 - smoothstep(k * 0.4 - 0.02, k * 0.4 + 0.02, length(cellUV - centerK));

    // Combine CMYK
    vec3 result = vec3(1.0);
    result -= vec3(0.0, dotC * 0.7, dotC * 0.7); // Cyan
    result -= vec3(dotM * 0.7, 0.0, dotM * 0.7); // Magenta
    result -= vec3(dotY * 0.7, dotY * 0.7, 0.0); // Yellow
    result -= vec3(dotK * 0.9); // Black

    result = clamp(result, 0.0, 1.0);

    // Slightly off-white paper background
    vec3 paper = vec3(0.98, 0.96, 0.92);
    result *= paper;

    return vec4(result, 1.0);
  }

  void main() {
    vec2 uv = v_texCoord;
    uv.x = 1.0 - uv.x;

    vec4 bgColor = blurMulti(u_texture, uv, u_resolution);
    bgColor.rgb *= 0.85;

    if (inEyeRegion(uv)) {
      vec4 eyeColor;
      if (u_effect == 0) {
        eyeColor = effectBase(uv);
      } else if (u_effect == 1) {
        eyeColor = effectAscii(uv);
      } else if (u_effect == 2) {
        eyeColor = effectThermal(uv);
      } else if (u_effect == 3) {
        eyeColor = effectEdge(uv);
      } else if (u_effect == 4) {
        eyeColor = effectOil(uv);
      } else if (u_effect == 5) {
        eyeColor = effectDither(uv);
      } else {
        eyeColor = effectHalftone(uv);
      }
      gl_FragColor = eyeColor;
    } else {
      gl_FragColor = bgColor;
    }
  }
`;

interface EyeRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function EyeTrackingShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const borderRef = useRef<HTMLDivElement>(null);
  const topTextRef = useRef<HTMLDivElement>(null);
  const bottomTextRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const textureRef = useRef<WebGLTexture | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [currentEffect, setCurrentEffect] = useState<ShaderEffect>("base");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const faceApiLoadedRef = useRef(false);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const defaultRegion: EyeRegion = { x: 0.3, y: 0.35, width: 0.4, height: 0.2 };
  const eyeRegionRef = useRef<EyeRegion>(defaultRegion);
  const targetRegionRef = useRef<EyeRegion>(defaultRegion);

  const initWebGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const gl = canvas.getContext("webgl", {
      preserveDrawingBuffer: true,
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
    });

    if (!gl) {
      setError("WebGL not supported");
      return null;
    }

    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      console.error("Vertex shader error:", gl.getShaderInfoLog(vertexShader));
      return null;
    }

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fragmentShader, fragmentShaderSource);
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

    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
    const texCoords = new Float32Array([0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0]);

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

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    glRef.current = gl;
    programRef.current = program;
    textureRef.current = texture;

    return gl;
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
        loadFaceDetection();
      }
    } catch {
      setError("Camera access denied");
    }
  };

  const loadFaceDetection = async () => {
    if (faceApiLoadedRef.current) return;

    try {
      setIsLoading(true);
      const faceapi = await import("face-api.js");
      const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model";

      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
      ]);

      faceApiLoadedRef.current = true;
      setIsLoading(false);

      // Detection loop - runs frequently for responsive tracking
      const detectFace = async () => {
        if (!videoRef.current || videoRef.current.readyState !== 4) {
          detectionIntervalRef.current = setTimeout(detectFace, 30);
          return;
        }

        try {
          const detections = await faceapi
            .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({
              inputSize: 416,
              scoreThreshold: 0.4
            }))
            .withFaceLandmarks(true);

          if (detections) {
            const landmarks = detections.landmarks;
            const leftEye = landmarks.getLeftEye();
            const rightEye = landmarks.getRightEye();

            const allPoints = [...leftEye, ...rightEye];
            const minX = Math.min(...allPoints.map(p => p.x));
            const maxX = Math.max(...allPoints.map(p => p.x));
            const minY = Math.min(...allPoints.map(p => p.y));
            const maxY = Math.max(...allPoints.map(p => p.y));

            const videoWidth = videoRef.current.videoWidth;
            const videoHeight = videoRef.current.videoHeight;

            // Calculate eye region with tight padding (eyes only, not full face)
            const padX = (maxX - minX) * 0.3;
            const padY = (maxY - minY) * 0.5;

            const regionWidth = (maxX - minX + padX * 2) / videoWidth;
            const regionHeight = (maxY - minY + padY * 2) / videoHeight;
            const regionX = (minX - padX) / videoWidth;
            const regionY = (minY - padY) / videoHeight;

            // Set target region (coordinates match shader UV space)
            targetRegionRef.current = {
              x: Math.max(0, Math.min(1 - regionWidth, regionX)),
              y: Math.max(0, Math.min(1 - regionHeight, regionY)),
              width: Math.min(1, regionWidth),
              height: Math.min(1, regionHeight),
            };
          }
        } catch (err) {
          console.error("Detection error:", err);
        }

        detectionIntervalRef.current = setTimeout(detectFace, 30);
      };

      detectFace();
    } catch (err) {
      console.error("Face detection failed:", err);
      setIsLoading(false);
    }
  };

  const getEffectIndex = useCallback((effect: ShaderEffect): number => {
    return EFFECTS.indexOf(effect);
  }, []);

  const render = useCallback((time: number) => {
    const gl = glRef.current;
    const program = programRef.current;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!gl || !program || !video || !canvas) {
      animationRef.current = requestAnimationFrame(render);
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.floor(rect.width * dpr);
    const height = Math.floor(rect.height * dpr);

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }

    if (video.readyState >= video.HAVE_CURRENT_DATA) {
      gl.bindTexture(gl.TEXTURE_2D, textureRef.current);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
    }

    // Smooth interpolation towards target region (using refs only - no state updates)
    const current = eyeRegionRef.current;
    const target = targetRegionRef.current;
    const smoothing = 0.2;

    eyeRegionRef.current = {
      x: current.x + (target.x - current.x) * smoothing,
      y: current.y + (target.y - current.y) * smoothing,
      width: current.width + (target.width - current.width) * smoothing,
      height: current.height + (target.height - current.height) * smoothing,
    };

    const r = eyeRegionRef.current;

    // Update border and text elements directly (no React state)
    const boxLeft = (1 - r.x - r.width) * 100;
    const boxTop = r.y * 100;
    const boxHeight = r.height * 100;

    if (borderRef.current) {
      borderRef.current.style.left = `${boxLeft}%`;
      borderRef.current.style.top = `${boxTop}%`;
      borderRef.current.style.width = `${r.width * 100}%`;
      borderRef.current.style.height = `${boxHeight}%`;
    }
    // Calculate box center for text positioning
    const boxCenterX = boxLeft + (r.width * 100) / 2;

    if (topTextRef.current) {
      topTextRef.current.style.left = `${boxCenterX}%`;
      topTextRef.current.style.top = `calc(${boxTop}% - 28px)`;
    }
    if (bottomTextRef.current) {
      bottomTextRef.current.style.left = `${boxCenterX}%`;
      bottomTextRef.current.style.top = `calc(${boxTop + boxHeight}% + 10px)`;
    }

    gl.uniform2f(gl.getUniformLocation(program, "u_resolution"), canvas.width, canvas.height);
    gl.uniform1f(gl.getUniformLocation(program, "u_time"), time * 0.001);
    gl.uniform1i(gl.getUniformLocation(program, "u_effect"), getEffectIndex(currentEffect));
    gl.uniform4f(gl.getUniformLocation(program, "u_eyeRegion"), r.x, r.y, r.width, r.height);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    animationRef.current = requestAnimationFrame(render);
  }, [currentEffect, getEffectIndex]);

  const nextEffect = useCallback(() => {
    setCurrentEffect(prev => EFFECTS[(EFFECTS.indexOf(prev) + 1) % EFFECTS.length]);
  }, []);

  const prevEffect = useCallback(() => {
    setCurrentEffect(prev => EFFECTS[(EFFECTS.indexOf(prev) - 1 + EFFECTS.length) % EFFECTS.length]);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "ArrowRight") {
        e.preventDefault();
        nextEffect();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevEffect();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextEffect, prevEffect]);

  useEffect(() => {
    initWebGL();
    animationRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationRef.current);
      if (detectionIntervalRef.current) clearTimeout(detectionIntervalRef.current);
    };
  }, [initWebGL, render]);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden select-none font-mono">
      <video ref={videoRef} className="hidden" playsInline muted />

      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-pointer"
        onClick={cameraActive ? nextEffect : undefined}
      />

      {/* Eye region border - positioned via ref in render loop */}
      {cameraActive && (
        <div
          ref={borderRef}
          className="absolute pointer-events-none border border-white/40"
          style={{ left: '30%', top: '35%', width: '40%', height: '20%' }}
        />
      )}

      {/* UI Overlay */}
      {cameraActive && (
        <>
          {/* Top label - follows box */}
          <div
            ref={topTextRef}
            className="absolute -translate-x-1/2 text-white/70 text-[11px] tracking-[0.2em] pointer-events-none whitespace-nowrap"
            style={{ left: '50%', top: 'calc(35% - 28px)' }}
          >
            :: it&apos;s all in the eyes
          </div>

          {/* Effect name - follows box */}
          <div
            ref={bottomTextRef}
            className="absolute -translate-x-1/2 text-white/50 text-[11px] tracking-[0.25em] pointer-events-none whitespace-nowrap"
            style={{ left: '50%', top: 'calc(55% + 10px)' }}
          >
            :: :: {currentEffect} :: ::
          </div>

          {/* Effect indicator dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {EFFECTS.map((effect) => (
              <button
                key={effect}
                onClick={() => setCurrentEffect(effect)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                  effect === currentEffect
                    ? "bg-white/80 scale-125"
                    : "bg-white/20 hover:bg-white/40"
                }`}
                aria-label={effect}
              />
            ))}
          </div>
        </>
      )}

      {/* Start overlay */}
      {!cameraActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#080808]">
          <p className="text-white/40 text-[10px] mb-1 tracking-[0.3em] uppercase">
            eye tracking
          </p>
          <p className="text-white/70 text-[13px] mb-12 tracking-[0.15em]">
            :: it&apos;s all in the eyes
          </p>

          <button
            onClick={startCamera}
            className="group flex items-center gap-3 px-6 py-3 bg-white/10 hover:bg-white/15 rounded-xl transition-all duration-200 active:scale-95"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/70">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <span className="text-white/80 text-[12px] tracking-wide">Enable Camera</span>
          </button>

          {error && (
            <p className="mt-8 text-red-400/70 text-[11px] tracking-wide">
              {error}
            </p>
          )}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="absolute top-4 right-4 text-white/40 text-[10px] tracking-wider animate-pulse ">
          detecting...
        </div>
      )}
    </div>
  );
}
