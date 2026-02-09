"use client";

import { useEffect, useRef, useState } from "react";
import { Pane } from "tweakpane";

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

// Fragment shader with TouchDesigner-style effects
const fragmentShaderSource = `
  precision mediump float;

  uniform sampler2D u_texture;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform float u_pixelSize;
  uniform float u_displacement;
  uniform float u_rgbShift;
  uniform float u_scanlines;
  uniform float u_noiseAmount;
  uniform float u_waveAmount;
  uniform float u_waveFreq;
  uniform float u_contrast;
  uniform float u_brightness;
  uniform float u_saturation;
  uniform int u_effectMode;

  varying vec2 v_texCoord;

  // Noise function
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  // Pixelate effect
  vec2 pixelate(vec2 uv, float size) {
    if (size <= 1.0) return uv;
    vec2 pixelUV = floor(uv * u_resolution / size) * size / u_resolution;
    return pixelUV;
  }

  // Wave displacement
  vec2 waveDisplace(vec2 uv, float amount, float freq, float time) {
    float wave = sin(uv.y * freq + time) * amount;
    return vec2(uv.x + wave, uv.y);
  }

  // Block displacement (TouchDesigner style)
  vec2 blockDisplace(vec2 uv, float amount, float time) {
    float blockSize = 0.05;
    vec2 block = floor(uv / blockSize) * blockSize;
    float noise = random(block + floor(time * 2.0));
    float offset = (noise - 0.5) * amount;
    return vec2(uv.x + offset, uv.y);
  }

  // RGB shift effect
  vec3 rgbShift(sampler2D tex, vec2 uv, float amount) {
    float r = texture2D(tex, uv + vec2(amount, 0.0)).r;
    float g = texture2D(tex, uv).g;
    float b = texture2D(tex, uv - vec2(amount, 0.0)).b;
    return vec3(r, g, b);
  }

  // Scanline effect
  float scanline(vec2 uv, float amount) {
    return 1.0 - amount * (0.5 + 0.5 * sin(uv.y * u_resolution.y * 2.0));
  }

  // Saturation adjustment
  vec3 adjustSaturation(vec3 color, float saturation) {
    float grey = dot(color, vec3(0.299, 0.587, 0.114));
    return mix(vec3(grey), color, saturation);
  }

  void main() {
    vec2 uv = v_texCoord;

    // Flip horizontally for mirror effect (webcam)
    uv.x = 1.0 - uv.x;

    // Apply wave displacement
    if (u_waveAmount > 0.0) {
      uv = waveDisplace(uv, u_waveAmount * 0.1, u_waveFreq * 20.0, u_time);
    }

    // Apply block displacement
    if (u_displacement > 0.0) {
      uv = blockDisplace(uv, u_displacement * 0.2, u_time);
    }

    // Apply pixelation
    uv = pixelate(uv, u_pixelSize);

    // Clamp UVs
    uv = clamp(uv, 0.0, 1.0);

    // Sample texture with RGB shift
    vec3 color;
    if (u_rgbShift > 0.0) {
      color = rgbShift(u_texture, uv, u_rgbShift * 0.02);
    } else {
      color = texture2D(u_texture, uv).rgb;
    }

    // Add noise
    if (u_noiseAmount > 0.0) {
      float noise = random(uv + u_time) * u_noiseAmount;
      color += noise * 0.3;
    }

    // Apply scanlines
    if (u_scanlines > 0.0) {
      color *= scanline(v_texCoord, u_scanlines * 0.5);
    }

    // Adjust contrast and brightness
    color = (color - 0.5) * u_contrast + 0.5 + u_brightness;

    // Adjust saturation
    color = adjustSaturation(color, u_saturation);

    // Clamp final color
    color = clamp(color, 0.0, 1.0);

    gl_FragColor = vec4(color, 1.0);
  }
`;

interface ShaderParams {
  pixelSize: number;
  displacement: number;
  rgbShift: number;
  scanlines: number;
  noiseAmount: number;
  waveAmount: number;
  waveFreq: number;
  contrast: number;
  brightness: number;
  saturation: number;
}

export default function CameraShaderExperiment() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const paneRef = useRef<Pane | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const textureRef = useRef<WebGLTexture | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const paramsRef = useRef<ShaderParams>({
    pixelSize: 1,
    displacement: 0,
    rgbShift: 0,
    scanlines: 0,
    noiseAmount: 0,
    waveAmount: 0,
    waveFreq: 0.5,
    contrast: 1,
    brightness: 0,
    saturation: 1,
  });

  // Initialize WebGL
  const initWebGL = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
    if (!gl) {
      setError("WebGL not supported");
      return null;
    }

    // Create shaders
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    // Create program
    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Set up geometry (full-screen quad)
    const positions = new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1,
    ]);
    const texCoords = new Float32Array([
      0, 1, 1, 1, 0, 0,
      0, 0, 1, 1, 1, 0,
    ]);

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
  };

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 1280, height: 720 },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
        setError(null);
      }
    } catch (err) {
      setError("Camera access denied. Please allow camera permissions.");
      console.error(err);
    }
  };

  // Render loop
  const render = (time: number) => {
    const gl = glRef.current;
    const program = programRef.current;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!gl || !program || !video || !canvas) {
      animationRef.current = requestAnimationFrame(render);
      return;
    }

    // Update canvas size
    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width || canvas.height !== rect.height) {
      canvas.width = rect.width;
      canvas.height = rect.height;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    // Update texture from video
    if (video.readyState >= video.HAVE_CURRENT_DATA) {
      gl.bindTexture(gl.TEXTURE_2D, textureRef.current);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
    }

    // Set uniforms
    const params = paramsRef.current;
    gl.uniform2f(gl.getUniformLocation(program, "u_resolution"), canvas.width, canvas.height);
    gl.uniform1f(gl.getUniformLocation(program, "u_time"), time * 0.001);
    gl.uniform1f(gl.getUniformLocation(program, "u_pixelSize"), params.pixelSize);
    gl.uniform1f(gl.getUniformLocation(program, "u_displacement"), params.displacement);
    gl.uniform1f(gl.getUniformLocation(program, "u_rgbShift"), params.rgbShift);
    gl.uniform1f(gl.getUniformLocation(program, "u_scanlines"), params.scanlines);
    gl.uniform1f(gl.getUniformLocation(program, "u_noiseAmount"), params.noiseAmount);
    gl.uniform1f(gl.getUniformLocation(program, "u_waveAmount"), params.waveAmount);
    gl.uniform1f(gl.getUniformLocation(program, "u_waveFreq"), params.waveFreq);
    gl.uniform1f(gl.getUniformLocation(program, "u_contrast"), params.contrast);
    gl.uniform1f(gl.getUniformLocation(program, "u_brightness"), params.brightness);
    gl.uniform1f(gl.getUniformLocation(program, "u_saturation"), params.saturation);

    // Draw
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    animationRef.current = requestAnimationFrame(render);
  };

  // Initialize Tweakpane
  useEffect(() => {
    if (!containerRef.current) return;

    const pane = new Pane({
      container: containerRef.current,
      title: "Shader Controls",
    });

    paneRef.current = pane;

    // Pixelation folder
    const pixelFolder = pane.addFolder({ title: "Pixelation" });
    pixelFolder.addBinding(paramsRef.current, "pixelSize", {
      min: 1,
      max: 50,
      step: 1,
      label: "Block Size",
    });

    // Displacement folder
    const dispFolder = pane.addFolder({ title: "Displacement" });
    dispFolder.addBinding(paramsRef.current, "displacement", {
      min: 0,
      max: 1,
      label: "Block Glitch",
    });
    dispFolder.addBinding(paramsRef.current, "waveAmount", {
      min: 0,
      max: 1,
      label: "Wave",
    });
    dispFolder.addBinding(paramsRef.current, "waveFreq", {
      min: 0.1,
      max: 2,
      label: "Wave Freq",
    });

    // Color folder
    const colorFolder = pane.addFolder({ title: "Color" });
    colorFolder.addBinding(paramsRef.current, "rgbShift", {
      min: 0,
      max: 1,
      label: "RGB Shift",
    });
    colorFolder.addBinding(paramsRef.current, "contrast", {
      min: 0.5,
      max: 2,
      label: "Contrast",
    });
    colorFolder.addBinding(paramsRef.current, "brightness", {
      min: -0.5,
      max: 0.5,
      label: "Brightness",
    });
    colorFolder.addBinding(paramsRef.current, "saturation", {
      min: 0,
      max: 2,
      label: "Saturation",
    });

    // Effects folder
    const fxFolder = pane.addFolder({ title: "Effects" });
    fxFolder.addBinding(paramsRef.current, "scanlines", {
      min: 0,
      max: 1,
      label: "Scanlines",
    });
    fxFolder.addBinding(paramsRef.current, "noiseAmount", {
      min: 0,
      max: 1,
      label: "Noise",
    });

    // Presets
    const presetFolder = pane.addFolder({ title: "Presets" });
    presetFolder.addButton({ title: "Reset" }).on("click", () => {
      paramsRef.current.pixelSize = 1;
      paramsRef.current.displacement = 0;
      paramsRef.current.rgbShift = 0;
      paramsRef.current.scanlines = 0;
      paramsRef.current.noiseAmount = 0;
      paramsRef.current.waveAmount = 0;
      paramsRef.current.waveFreq = 0.5;
      paramsRef.current.contrast = 1;
      paramsRef.current.brightness = 0;
      paramsRef.current.saturation = 1;
      pane.refresh();
    });
    presetFolder.addButton({ title: "VHS" }).on("click", () => {
      paramsRef.current.pixelSize = 2;
      paramsRef.current.displacement = 0.3;
      paramsRef.current.rgbShift = 0.4;
      paramsRef.current.scanlines = 0.6;
      paramsRef.current.noiseAmount = 0.2;
      paramsRef.current.saturation = 0.8;
      pane.refresh();
    });
    presetFolder.addButton({ title: "Glitch" }).on("click", () => {
      paramsRef.current.pixelSize = 8;
      paramsRef.current.displacement = 0.8;
      paramsRef.current.rgbShift = 0.7;
      paramsRef.current.noiseAmount = 0.3;
      pane.refresh();
    });
    presetFolder.addButton({ title: "Pixel Art" }).on("click", () => {
      paramsRef.current.pixelSize = 20;
      paramsRef.current.contrast = 1.3;
      paramsRef.current.saturation = 1.4;
      pane.refresh();
    });

    return () => {
      pane.dispose();
    };
  }, []);

  // Initialize WebGL and start render loop
  useEffect(() => {
    initWebGL();
    animationRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div className="relative w-full h-full bg-black">
      {/* Hidden video element */}
      <video
        ref={videoRef}
        className="hidden"
        playsInline
        muted
      />

      {/* WebGL Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />

      {/* Camera button overlay */}
      {!cameraActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <button
            onClick={startCamera}
            className="px-6 py-3 bg-[var(--accent)] hover:bg-[var(--accent)]/80 text-white rounded-xl font-medium transition-colors"
          >
            Enable Camera
          </button>
          {error && (
            <p className="absolute bottom-8 text-red-400 text-sm">{error}</p>
          )}
        </div>
      )}

      {/* Tweakpane container */}
      <div
        ref={containerRef}
        className="absolute top-4 right-4 z-10"
        style={{ width: "280px" }}
      />
    </div>
  );
}
