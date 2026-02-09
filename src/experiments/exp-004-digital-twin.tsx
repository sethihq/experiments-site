"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// Visual modes
type VisualMode = "wireframe" | "hologram" | "void" | "glitch" | "neon";
const MODES: VisualMode[] = ["wireframe", "hologram", "void", "glitch", "neon"];

// Vertex shader - passes through position and texture coords
const vertexShaderSource = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;

  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = a_texCoord;
  }
`;

// Fragment shader with multiple effects
const fragmentShaderSource = `
  precision highp float;

  uniform sampler2D u_texture;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform int u_mode;
  uniform float u_audioLevel;
  uniform float u_movementDelta;
  uniform vec2 u_faceCenter;
  uniform float u_faceSize;

  varying vec2 v_texCoord;

  // Hash function for noise
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  // 2D noise
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

  // Edge detection (Sobel)
  float detectEdge(vec2 uv) {
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
    return sqrt(gx*gx + gy*gy);
  }

  // Wireframe effect - triangulated mesh look
  vec4 effectWireframe(vec2 uv) {
    vec4 color = texture2D(u_texture, uv);
    float lum = dot(color.rgb, vec3(0.299, 0.587, 0.114));

    // Create triangular grid
    float scale = 30.0;
    vec2 p = uv * scale;
    vec2 pi = floor(p);
    vec2 pf = fract(p);

    // Determine which triangle we're in
    float tri = step(pf.x + pf.y, 1.0);

    // Distance to edges
    float d1 = min(pf.x, pf.y);
    float d2 = min(1.0 - pf.x, 1.0 - pf.y);
    float d3 = abs(pf.x + pf.y - 1.0) / 1.414;
    float edge = min(min(d1, d2), d3);

    // Wire thickness based on luminance
    float wireThickness = 0.02 + lum * 0.03;
    float wire = 1.0 - smoothstep(0.0, wireThickness, edge);

    // Voice reactivity - pulse the wireframe
    wire *= 1.0 + u_audioLevel * 0.5;

    // Color based on depth/luminance
    vec3 wireColor = mix(
      vec3(0.0, 0.4, 0.8),  // Dark blue
      vec3(0.0, 0.9, 1.0),  // Cyan
      lum
    );

    // Add edge glow
    float edgeGlow = detectEdge(uv);
    wireColor += vec3(0.2, 0.6, 1.0) * edgeGlow * 2.0;

    vec3 bgColor = vec3(0.02, 0.02, 0.05);
    vec3 finalColor = mix(bgColor, wireColor, wire * 0.8 + edgeGlow * 0.3);

    // Scanlines
    float scanline = sin(uv.y * u_resolution.y * 0.5) * 0.03;
    finalColor += scanline;

    return vec4(finalColor, 1.0);
  }

  // Hologram effect - scan lines + chromatic aberration + flicker
  vec4 effectHologram(vec2 uv) {
    // Chromatic aberration
    float aberration = 0.003 + u_audioLevel * 0.005;
    float r = texture2D(u_texture, uv + vec2(aberration, 0.0)).r;
    float g = texture2D(u_texture, uv).g;
    float b = texture2D(u_texture, uv - vec2(aberration, 0.0)).b;
    vec3 color = vec3(r, g, b);

    float lum = dot(color, vec3(0.299, 0.587, 0.114));

    // Hologram tint
    vec3 holoColor = mix(
      vec3(0.0, 0.8, 1.0),  // Cyan
      vec3(0.5, 0.0, 1.0),  // Purple
      uv.y + sin(u_time * 2.0) * 0.1
    );

    color = holoColor * lum;

    // Horizontal scan lines
    float scanline = sin(uv.y * 400.0 + u_time * 10.0) * 0.5 + 0.5;
    scanline = pow(scanline, 1.5) * 0.15;
    color += scanline * holoColor;

    // Vertical scan bar
    float scanBar = smoothstep(0.0, 0.02, abs(fract(uv.y - u_time * 0.2) - 0.5) - 0.48);
    color += (1.0 - scanBar) * holoColor * 0.3;

    // Flicker
    float flicker = 0.95 + 0.05 * sin(u_time * 30.0) * sin(u_time * 17.0);
    color *= flicker;

    // Edge glow
    float edge = detectEdge(uv);
    color += holoColor * edge * 1.5;

    // Voice pulse
    float pulse = 1.0 + u_audioLevel * 0.3;
    color *= pulse;

    // Transparency at edges (fresnel-like)
    float alpha = 0.7 + lum * 0.3;

    return vec4(color, alpha);
  }

  // Void effect - face dissolves into particles/void
  vec4 effectVoid(vec2 uv) {
    vec4 color = texture2D(u_texture, uv);
    float lum = dot(color.rgb, vec3(0.299, 0.587, 0.114));

    // Distance from face center
    float distFromFace = length(uv - u_faceCenter);
    float faceInfluence = 1.0 - smoothstep(0.0, u_faceSize * 1.5, distFromFace);

    // Noise-based dissolution
    float n = noise(uv * 50.0 + u_time * 0.5);
    float dissolve = smoothstep(0.3, 0.7, n + (1.0 - faceInfluence) - u_audioLevel * 0.3);

    // Particle effect at dissolution edge
    float particleNoise = noise(uv * 200.0 + u_time * 2.0);
    float particles = smoothstep(0.48, 0.52, dissolve) * particleNoise;

    // Dark void color
    vec3 voidColor = vec3(0.0, 0.0, 0.02);

    // Face rendered as contours
    float edge = detectEdge(uv);
    vec3 faceColor = vec3(0.8, 0.2, 0.4) * edge * 2.0;
    faceColor += vec3(0.1, 0.05, 0.15) * lum;

    // Particle glow
    vec3 particleColor = vec3(1.0, 0.3, 0.5) * particles * 3.0;

    vec3 finalColor = mix(faceColor, voidColor, dissolve);
    finalColor += particleColor;

    // Vignette
    float vignette = 1.0 - length(uv - 0.5) * 0.8;
    finalColor *= vignette;

    return vec4(finalColor, 1.0);
  }

  // Glitch effect - RGB split, block displacement, noise
  vec4 effectGlitch(vec2 uv) {
    vec2 originalUV = uv;

    // Movement-based glitch intensity
    float glitchIntensity = u_movementDelta * 3.0 + u_audioLevel * 0.5;
    glitchIntensity = clamp(glitchIntensity, 0.0, 1.0);

    // Block displacement
    float blockSize = 0.05;
    vec2 block = floor(uv / blockSize) * blockSize;
    float blockNoise = hash(block + floor(u_time * 10.0));

    if (blockNoise > 1.0 - glitchIntensity * 0.3) {
      uv.x += (hash(block + 0.1) - 0.5) * 0.1 * glitchIntensity;
    }

    // Horizontal tear
    float tearLine = floor(u_time * 20.0 + uv.y * 10.0);
    if (hash(vec2(tearLine, 0.0)) > 0.97) {
      uv.x += (hash(vec2(tearLine, 1.0)) - 0.5) * 0.2 * glitchIntensity;
    }

    // RGB split
    float rgbSplit = 0.01 + glitchIntensity * 0.03;
    float r = texture2D(u_texture, uv + vec2(rgbSplit, 0.0)).r;
    float g = texture2D(u_texture, uv).g;
    float b = texture2D(u_texture, uv - vec2(rgbSplit, 0.0)).b;
    vec3 color = vec3(r, g, b);

    // Static noise overlay
    float staticNoise = hash(originalUV * u_resolution + u_time * 1000.0);
    color = mix(color, vec3(staticNoise), glitchIntensity * 0.15);

    // Color corruption
    if (hash(vec2(floor(u_time * 5.0), 0.0)) > 0.9) {
      color.rb = color.br;
    }

    // Scanlines
    float scanline = sin(originalUV.y * 300.0) * 0.04;
    color -= scanline;

    // Edge detection for digital look
    float edge = detectEdge(uv);
    color += vec3(0.0, 1.0, 0.5) * edge * glitchIntensity;

    return vec4(color, 1.0);
  }

  // Neon effect - dark background with bright neon edges
  vec4 effectNeon(vec2 uv) {
    vec4 color = texture2D(u_texture, uv);
    float lum = dot(color.rgb, vec3(0.299, 0.587, 0.114));

    // Edge detection with multiple passes for glow
    float edge1 = detectEdge(uv);
    float edge2 = detectEdge(uv + vec2(0.002, 0.0));
    float edge3 = detectEdge(uv - vec2(0.002, 0.0));
    float edge = (edge1 + edge2 + edge3) / 3.0;

    // Threshold for neon lines
    edge = smoothstep(0.1, 0.4, edge);

    // Animated color cycling
    float hue = u_time * 0.1 + uv.y * 0.5;
    vec3 neonColor1 = vec3(
      sin(hue) * 0.5 + 0.5,
      sin(hue + 2.094) * 0.5 + 0.5,
      sin(hue + 4.189) * 0.5 + 0.5
    );
    vec3 neonColor2 = vec3(
      sin(hue + 3.14) * 0.5 + 0.5,
      sin(hue + 5.236) * 0.5 + 0.5,
      sin(hue + 1.047) * 0.5 + 0.5
    );

    vec3 neonColor = mix(neonColor1, neonColor2, sin(u_time + uv.x * 5.0) * 0.5 + 0.5);

    // Glow effect
    float glow = edge * 2.0;
    glow += edge * edge * 3.0; // Bloom

    // Voice reactivity - intensify glow
    glow *= 1.0 + u_audioLevel * 2.0;

    // Dark background with subtle face visibility
    vec3 bgColor = vec3(0.02, 0.01, 0.03);
    vec3 faceHint = color.rgb * 0.1;

    vec3 finalColor = bgColor + faceHint;
    finalColor += neonColor * glow;

    // Add some sparkle
    float sparkle = pow(hash(uv * 500.0 + u_time), 20.0) * edge;
    finalColor += vec3(1.0) * sparkle * 2.0;

    return vec4(finalColor, 1.0);
  }

  void main() {
    vec2 uv = v_texCoord;
    uv.x = 1.0 - uv.x; // Mirror

    vec4 color;

    if (u_mode == 0) {
      color = effectWireframe(uv);
    } else if (u_mode == 1) {
      color = effectHologram(uv);
    } else if (u_mode == 2) {
      color = effectVoid(uv);
    } else if (u_mode == 3) {
      color = effectGlitch(uv);
    } else {
      color = effectNeon(uv);
    }

    gl_FragColor = color;
  }
`;

interface FaceData {
  center: { x: number; y: number };
  size: number;
}

export default function DigitalTwin() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const animationRef = useRef<number>(0);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const textureRef = useRef<WebGLTexture | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [currentMode, setCurrentMode] = useState<VisualMode>("wireframe");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);

  // Audio analysis refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioLevelRef = useRef(0);

  // Face detection refs
  const faceApiLoadedRef = useRef(false);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const faceDataRef = useRef<FaceData>({ center: { x: 0.5, y: 0.5 }, size: 0.3 });
  const prevFaceDataRef = useRef<FaceData>({ center: { x: 0.5, y: 0.5 }, size: 0.3 });
  const movementDeltaRef = useRef(0);

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

    // Compile shaders
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

    // Set up geometry
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

    // Create texture
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

  const enableAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      setAudioEnabled(true);
    } catch {
      console.error("Microphone access denied");
    }
  };

  const updateAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate average level
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    const avg = sum / dataArray.length / 255;

    // Smooth the audio level
    audioLevelRef.current = audioLevelRef.current * 0.8 + avg * 0.2;
  }, []);

  const loadFaceDetection = async () => {
    if (faceApiLoadedRef.current) return;

    try {
      setIsLoading(true);
      const faceapi = await import("face-api.js");
      const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model";

      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);

      faceApiLoadedRef.current = true;
      setIsLoading(false);

      // Detection loop
      const detectFace = async () => {
        if (!videoRef.current || videoRef.current.readyState !== 4) {
          detectionIntervalRef.current = setTimeout(detectFace, 50);
          return;
        }

        try {
          const detection = await faceapi.detectSingleFace(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.4 })
          );

          if (detection) {
            const box = detection.box;
            const videoWidth = videoRef.current.videoWidth;
            const videoHeight = videoRef.current.videoHeight;

            // Store previous position for movement detection
            prevFaceDataRef.current = { ...faceDataRef.current };

            // Update face data
            faceDataRef.current = {
              center: {
                x: (box.x + box.width / 2) / videoWidth,
                y: (box.y + box.height / 2) / videoHeight,
              },
              size: Math.max(box.width / videoWidth, box.height / videoHeight),
            };

            // Calculate movement delta
            const dx = faceDataRef.current.center.x - prevFaceDataRef.current.center.x;
            const dy = faceDataRef.current.center.y - prevFaceDataRef.current.center.y;
            const movement = Math.sqrt(dx * dx + dy * dy);

            // Smooth the movement delta
            movementDeltaRef.current = movementDeltaRef.current * 0.7 + movement * 0.3;
          }
        } catch (err) {
          console.error("Detection error:", err);
        }

        detectionIntervalRef.current = setTimeout(detectFace, 50);
      };

      detectFace();
    } catch (err) {
      console.error("Face detection failed:", err);
      setIsLoading(false);
    }
  };

  const getModeIndex = useCallback((mode: VisualMode): number => {
    return MODES.indexOf(mode);
  }, []);

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

      // Update audio level
      updateAudioLevel();

      // Handle canvas sizing
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.floor(rect.width * dpr);
      const height = Math.floor(rect.height * dpr);

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }

      // Update texture from video
      if (video.readyState >= video.HAVE_CURRENT_DATA) {
        gl.bindTexture(gl.TEXTURE_2D, textureRef.current);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
      }

      // Set uniforms
      gl.uniform2f(gl.getUniformLocation(program, "u_resolution"), canvas.width, canvas.height);
      gl.uniform1f(gl.getUniformLocation(program, "u_time"), time * 0.001);
      gl.uniform1i(gl.getUniformLocation(program, "u_mode"), getModeIndex(currentMode));
      gl.uniform1f(gl.getUniformLocation(program, "u_audioLevel"), audioLevelRef.current);
      gl.uniform1f(gl.getUniformLocation(program, "u_movementDelta"), movementDeltaRef.current);
      gl.uniform2f(
        gl.getUniformLocation(program, "u_faceCenter"),
        faceDataRef.current.center.x,
        faceDataRef.current.center.y
      );
      gl.uniform1f(gl.getUniformLocation(program, "u_faceSize"), faceDataRef.current.size);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationRef.current = requestAnimationFrame(render);
    },
    [currentMode, getModeIndex, updateAudioLevel]
  );

  const nextMode = useCallback(() => {
    setCurrentMode((prev) => MODES[(MODES.indexOf(prev) + 1) % MODES.length]);
  }, []);

  const prevMode = useCallback(() => {
    setCurrentMode((prev) => MODES[(MODES.indexOf(prev) - 1 + MODES.length) % MODES.length]);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "ArrowRight") {
        e.preventDefault();
        nextMode();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevMode();
      } else if (e.key === "m" || e.key === "M") {
        if (!audioEnabled) enableAudio();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextMode, prevMode, audioEnabled]);

  // Initialize WebGL and start render loop
  useEffect(() => {
    initWebGL();
    animationRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationRef.current);
      if (detectionIntervalRef.current) clearTimeout(detectionIntervalRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [initWebGL, render]);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden select-none font-mono">
      <video ref={videoRef} className="hidden" playsInline muted />

      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-pointer"
        onClick={cameraActive ? nextMode : undefined}
      />

      {/* UI Overlay */}
      {cameraActive && (
        <>
          {/* Mode name */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 text-white/60 text-[11px] tracking-[0.3em] uppercase">
            {currentMode}
          </div>

          {/* Audio toggle */}
          <button
            onClick={() => !audioEnabled && enableAudio()}
            className={`absolute top-6 right-6 px-3 py-1.5 rounded-lg text-[10px] tracking-wider transition-all ${
              audioEnabled
                ? "bg-white/10 text-white/60"
                : "bg-white/5 text-white/30 hover:bg-white/10 hover:text-white/50"
            }`}
          >
            {audioEnabled ? "🎤 AUDIO ON" : "🎤 ENABLE AUDIO"}
          </button>

          {/* Mode indicator dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {MODES.map((mode) => (
              <button
                key={mode}
                onClick={() => setCurrentMode(mode)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                  mode === currentMode
                    ? "bg-white/80 scale-125"
                    : "bg-white/20 hover:bg-white/40"
                }`}
                aria-label={mode}
              />
            ))}
          </div>

          {/* Instructions */}
          <div className="absolute bottom-6 right-6 text-white/30 text-[10px] tracking-wide">
            SPACE/ARROWS to switch • M for mic
          </div>
        </>
      )}

      {/* Start overlay */}
      {!cameraActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050508]">
          <div className="relative mb-8">
            {/* Animated rings */}
            <div className="absolute inset-0 -m-8 border border-white/5 rounded-full animate-pulse" />
            <div
              className="absolute inset-0 -m-16 border border-white/3 rounded-full animate-pulse"
              style={{ animationDelay: "0.5s" }}
            />
            <div
              className="absolute inset-0 -m-24 border border-white/2 rounded-full animate-pulse"
              style={{ animationDelay: "1s" }}
            />

            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="text-white/50"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          </div>

          <p className="text-white/30 text-[10px] mb-1 tracking-[0.4em] uppercase">experiment 004</p>
          <h1 className="text-white/80 text-xl mb-2 tracking-wide">Digital Twin</h1>
          <p className="text-white/40 text-[12px] mb-10 tracking-wide max-w-xs text-center">
            Transform into your digital self with real-time face tracking and audio reactivity
          </p>

          <button
            onClick={startCamera}
            className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 hover:from-cyan-500/20 hover:to-purple-500/20 border border-white/10 hover:border-white/20 rounded-xl transition-all duration-300 active:scale-95"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-white/60"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <span className="text-white/70 text-[12px] tracking-wide">Initialize</span>
          </button>

          {error && <p className="mt-6 text-red-400/60 text-[11px] tracking-wide">{error}</p>}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="absolute top-4 right-4 text-cyan-400/60 text-[10px] tracking-wider animate-pulse">
          loading face detection...
        </div>
      )}
    </div>
  );
}
