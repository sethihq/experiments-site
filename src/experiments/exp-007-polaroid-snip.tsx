"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

interface Selection {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  active: boolean;
}

interface Polaroid {
  id: string;
  imageData: string;
  x: number;
  y: number;
  rotation: number;
  timestamp: number;
  developing: boolean;
}

// Smoothing configuration for high accuracy
const SMOOTHING_FACTOR = 0.3; // Lower = smoother but more latency
const PINCH_START_THRESHOLD = 0.035; // Tighter threshold to start pinch
const PINCH_END_THRESHOLD = 0.06; // Larger threshold to end pinch (hysteresis)
const PINCH_CONFIRM_FRAMES = 3; // Frames to confirm pinch state change
const POSITION_HISTORY_SIZE = 5; // Frames for position averaging

interface SmoothedPosition {
  x: number;
  y: number;
  history: { x: number; y: number }[];
}

// Exponential moving average for smooth position tracking
function smoothPosition(current: SmoothedPosition, newX: number, newY: number): SmoothedPosition {
  // Add to history
  const history = [...current.history, { x: newX, y: newY }].slice(-POSITION_HISTORY_SIZE);

  // Calculate weighted average (more recent = higher weight)
  let weightSum = 0;
  let xSum = 0;
  let ySum = 0;

  for (let i = 0; i < history.length; i++) {
    const weight = i + 1; // Linear increasing weights
    weightSum += weight;
    xSum += history[i].x * weight;
    ySum += history[i].y * weight;
  }

  const avgX = xSum / weightSum;
  const avgY = ySum / weightSum;

  // Apply exponential smoothing on top
  const smoothedX = current.x * (1 - SMOOTHING_FACTOR) + avgX * SMOOTHING_FACTOR;
  const smoothedY = current.y * (1 - SMOOTHING_FACTOR) + avgY * SMOOTHING_FACTOR;

  return { x: smoothedX, y: smoothedY, history };
}

// Check if finger is curled (bent) by comparing joint distances
function isFingerExtended(landmarks: HandLandmark[], fingerBase: number): boolean {
  // For a finger: MCP (base), PIP, DIP, TIP
  // fingerBase is the MCP index (5 for index, 9 for middle, etc.)
  const mcp = landmarks[fingerBase];
  const pip = landmarks[fingerBase + 1];
  const dip = landmarks[fingerBase + 2];
  const tip = landmarks[fingerBase + 3];

  // Calculate distances from MCP
  const mcpToTip = Math.sqrt(
    Math.pow(tip.x - mcp.x, 2) + Math.pow(tip.y - mcp.y, 2) + Math.pow(tip.z - mcp.z, 2)
  );
  const mcpToPip = Math.sqrt(
    Math.pow(pip.x - mcp.x, 2) + Math.pow(pip.y - mcp.y, 2) + Math.pow(pip.z - mcp.z, 2)
  );

  // If tip is closer to MCP than PIP, finger is curled
  return mcpToTip > mcpToPip * 1.5;
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

// Fragment shader with selection overlay
const fragmentShaderSource = `
  precision highp float;

  uniform sampler2D u_texture;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec4 u_selection; // startX, startY, endX, endY (normalized)
  uniform bool u_hasSelection;
  uniform float u_captureFlash;

  varying vec2 v_texCoord;

  void main() {
    vec2 uv = v_texCoord;
    uv.x = 1.0 - uv.x; // Mirror

    vec4 color = texture2D(u_texture, vec2(1.0 - v_texCoord.x, v_texCoord.y));

    if (u_hasSelection) {
      // Selection bounds
      vec2 selMin = vec2(min(u_selection.x, u_selection.z), min(u_selection.y, u_selection.w));
      vec2 selMax = vec2(max(u_selection.x, u_selection.z), max(u_selection.y, u_selection.w));

      // Check if inside selection
      bool inside = uv.x >= selMin.x && uv.x <= selMax.x && uv.y >= selMin.y && uv.y <= selMax.y;

      // Dim area outside selection
      if (!inside) {
        color.rgb *= 0.4;
      }

      // Selection border (marching ants style)
      float borderWidth = 3.0 / u_resolution.x;
      bool onBorderX = (abs(uv.x - selMin.x) < borderWidth || abs(uv.x - selMax.x) < borderWidth) &&
                       uv.y >= selMin.y && uv.y <= selMax.y;
      bool onBorderY = (abs(uv.y - selMin.y) < borderWidth || abs(uv.y - selMax.y) < borderWidth) &&
                       uv.x >= selMin.x && uv.x <= selMax.x;

      if (onBorderX || onBorderY) {
        // Marching ants animation
        float dash = mod((uv.x + uv.y) * u_resolution.x * 0.1 + u_time * 3.0, 1.0);
        vec3 borderColor = dash > 0.5 ? vec3(1.0) : vec3(0.0);
        color.rgb = borderColor;
      }

      // Corner handles
      float handleSize = 8.0 / u_resolution.x;
      vec2 corners[4];
      corners[0] = selMin;
      corners[1] = vec2(selMax.x, selMin.y);
      corners[2] = selMax;
      corners[3] = vec2(selMin.x, selMax.y);

      for (int i = 0; i < 4; i++) {
        if (length(uv - corners[i]) < handleSize) {
          color.rgb = vec3(1.0);
        }
      }
    }

    // Capture flash effect
    if (u_captureFlash > 0.0) {
      color.rgb = mix(color.rgb, vec3(1.0), u_captureFlash);
    }

    gl_FragColor = color;
  }
`;

export default function PolaroidSnip() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const animationRef = useRef<number>(0);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const textureRef = useRef<WebGLTexture | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [polaroids, setPolaroids] = useState<Polaroid[]>([]);
  const [showGallery, setShowGallery] = useState(false);

  // Selection state
  const selectionRef = useRef<Selection>({
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    active: false,
  });
  const [selection, setSelection] = useState<Selection | null>(null);
  const captureFlashRef = useRef(0);

  // Gesture tracking with enhanced accuracy
  const handPositionsRef = useRef<HandLandmark[]>([]);
  const isPinchingRef = useRef(false);
  const pinchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Enhanced tracking for accuracy
  const smoothedPositionRef = useRef<SmoothedPosition>({ x: 0.5, y: 0.5, history: [] });
  const pinchConfirmCountRef = useRef(0);
  const unpinchConfirmCountRef = useRef(0);
  const lastPinchDistRef = useRef(1);

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

  // Capture the selected area as a polaroid
  const captureSelection = useCallback(() => {
    const video = videoRef.current;
    const sel = selectionRef.current;
    if (!video || !sel.active) return;

    // Create capture canvas
    const captureCanvas = document.createElement("canvas");
    const ctx = captureCanvas.getContext("2d");
    if (!ctx) return;

    // Calculate selection bounds in video coordinates
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    const minX = Math.min(sel.startX, sel.endX);
    const maxX = Math.max(sel.startX, sel.endX);
    const minY = Math.min(sel.startY, sel.endY);
    const maxY = Math.max(sel.startY, sel.endY);

    // Mirror X coordinates for selfie view
    const srcX = (1 - maxX) * videoWidth;
    const srcY = minY * videoHeight;
    const srcWidth = (maxX - minX) * videoWidth;
    const srcHeight = (maxY - minY) * videoHeight;

    if (srcWidth < 20 || srcHeight < 20) return; // Too small

    // Set capture canvas size (with polaroid aspect ratio consideration)
    const maxSize = 400;
    const scale = Math.min(maxSize / srcWidth, maxSize / srcHeight, 1);
    captureCanvas.width = srcWidth * scale;
    captureCanvas.height = srcHeight * scale;

    // Draw the captured area
    ctx.drawImage(
      video,
      srcX,
      srcY,
      srcWidth,
      srcHeight,
      0,
      0,
      captureCanvas.width,
      captureCanvas.height
    );

    // Create polaroid
    const newPolaroid: Polaroid = {
      id: Date.now().toString(),
      imageData: captureCanvas.toDataURL("image/jpeg", 0.9),
      x: 50 + (Math.random() - 0.5) * 30,
      y: 50 + (Math.random() - 0.5) * 20,
      rotation: (Math.random() - 0.5) * 20,
      timestamp: Date.now(),
      developing: true,
    };

    setPolaroids((prev) => [...prev, newPolaroid]);

    // Trigger flash
    captureFlashRef.current = 1;

    // Mark as developed after delay
    setTimeout(() => {
      setPolaroids((prev) =>
        prev.map((p) => (p.id === newPolaroid.id ? { ...p, developing: false } : p))
      );
    }, 2000);

    // Reset selection
    selectionRef.current.active = false;
    setSelection(null);
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
        modelComplexity: 1, // Highest accuracy model
        minDetectionConfidence: 0.8, // Higher confidence for more reliable detection
        minTrackingConfidence: 0.8, // Higher tracking confidence
      });

      hands.onResults((results: any) => {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          const landmarks = results.multiHandLandmarks[0];
          handPositionsRef.current = landmarks;

          // Get key landmarks for pinch detection
          const thumbTip = landmarks[4];
          const thumbIp = landmarks[3]; // Thumb IP joint
          const indexTip = landmarks[8];
          const indexDip = landmarks[7]; // Index DIP joint
          const indexPip = landmarks[6]; // Index PIP joint

          // Calculate 3D distance between thumb and index tips for more accuracy
          const pinchDist = Math.sqrt(
            Math.pow(thumbTip.x - indexTip.x, 2) +
            Math.pow(thumbTip.y - indexTip.y, 2) +
            Math.pow((thumbTip.z || 0) - (indexTip.z || 0), 2)
          );

          // Store for smoothing
          lastPinchDistRef.current = lastPinchDistRef.current * 0.7 + pinchDist * 0.3;
          const smoothedPinchDist = lastPinchDistRef.current;

          // Check if index finger is extended (not curled)
          const indexExtended = isFingerExtended(landmarks, 5);

          // Check thumb is approaching index (thumb tip closer to index than thumb IP)
          const thumbToIndexTip = Math.sqrt(
            Math.pow(thumbTip.x - indexTip.x, 2) + Math.pow(thumbTip.y - indexTip.y, 2)
          );
          const thumbIpToIndexTip = Math.sqrt(
            Math.pow(thumbIp.x - indexTip.x, 2) + Math.pow(thumbIp.y - indexTip.y, 2)
          );
          const thumbApproaching = thumbToIndexTip < thumbIpToIndexTip;

          // Use hysteresis: different thresholds for starting vs ending pinch
          const shouldStartPinch = smoothedPinchDist < PINCH_START_THRESHOLD && indexExtended && thumbApproaching;
          const shouldEndPinch = smoothedPinchDist > PINCH_END_THRESHOLD || !indexExtended;

          // Multi-frame confirmation to avoid false positives
          if (shouldStartPinch && !isPinchingRef.current) {
            pinchConfirmCountRef.current++;
            unpinchConfirmCountRef.current = 0;
          } else if (shouldEndPinch && isPinchingRef.current) {
            unpinchConfirmCountRef.current++;
            pinchConfirmCountRef.current = 0;
          } else {
            // Reset counters if state is stable
            if (isPinchingRef.current) {
              unpinchConfirmCountRef.current = 0;
            } else {
              pinchConfirmCountRef.current = 0;
            }
          }

          // Calculate smoothed pinch center point
          const rawPinchX = 1 - (thumbTip.x + indexTip.x) / 2; // Mirror
          const rawPinchY = (thumbTip.y + indexTip.y) / 2;
          smoothedPositionRef.current = smoothPosition(smoothedPositionRef.current, rawPinchX, rawPinchY);
          const pinchX = smoothedPositionRef.current.x;
          const pinchY = smoothedPositionRef.current.y;

          // State transitions with confirmation
          if (pinchConfirmCountRef.current >= PINCH_CONFIRM_FRAMES && !isPinchingRef.current) {
            // Confirmed pinch start
            isPinchingRef.current = true;
            pinchConfirmCountRef.current = 0;
            pinchStartRef.current = { x: pinchX, y: pinchY };
            // Reset position history for fresh start
            smoothedPositionRef.current = { x: pinchX, y: pinchY, history: [{ x: pinchX, y: pinchY }] };
            selectionRef.current = {
              startX: pinchX,
              startY: pinchY,
              endX: pinchX,
              endY: pinchY,
              active: true,
            };
            setSelection({ ...selectionRef.current });
          } else if (isPinchingRef.current && unpinchConfirmCountRef.current < PINCH_CONFIRM_FRAMES) {
            // Continue pinch - update selection with smoothed position
            selectionRef.current.endX = pinchX;
            selectionRef.current.endY = pinchY;
            setSelection({ ...selectionRef.current });
          } else if (unpinchConfirmCountRef.current >= PINCH_CONFIRM_FRAMES && isPinchingRef.current) {
            // Confirmed pinch end - capture if selection is big enough
            isPinchingRef.current = false;
            unpinchConfirmCountRef.current = 0;
            const width = Math.abs(selectionRef.current.endX - selectionRef.current.startX);
            const height = Math.abs(selectionRef.current.endY - selectionRef.current.startY);

            if (width > 0.05 && height > 0.05) {
              captureSelection();
            } else {
              // Cancel small selections
              selectionRef.current.active = false;
              setSelection(null);
            }
            pinchStartRef.current = null;
          }
        } else {
          // No hand detected - cancel selection after confirmation
          if (isPinchingRef.current) {
            unpinchConfirmCountRef.current++;
            if (unpinchConfirmCountRef.current >= PINCH_CONFIRM_FRAMES * 2) {
              isPinchingRef.current = false;
              unpinchConfirmCountRef.current = 0;
              selectionRef.current.active = false;
              setSelection(null);
              pinchStartRef.current = null;
            }
          }
          pinchConfirmCountRef.current = 0;
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

      // Update texture
      if (video.readyState >= video.HAVE_CURRENT_DATA) {
        gl.bindTexture(gl.TEXTURE_2D, textureRef.current);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
      }

      // Decay flash
      if (captureFlashRef.current > 0) {
        captureFlashRef.current *= 0.85;
        if (captureFlashRef.current < 0.01) captureFlashRef.current = 0;
      }

      // Set uniforms
      gl.uniform2f(gl.getUniformLocation(program, "u_resolution"), canvas.width, canvas.height);
      gl.uniform1f(gl.getUniformLocation(program, "u_time"), time * 0.001);
      gl.uniform1f(gl.getUniformLocation(program, "u_captureFlash"), captureFlashRef.current);

      const sel = selectionRef.current;
      gl.uniform1i(gl.getUniformLocation(program, "u_hasSelection"), sel.active ? 1 : 0);
      if (sel.active) {
        gl.uniform4f(
          gl.getUniformLocation(program, "u_selection"),
          sel.startX,
          sel.startY,
          sel.endX,
          sel.endY
        );
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

  // Download polaroid
  const downloadPolaroid = (polaroid: Polaroid) => {
    const link = document.createElement("a");
    link.download = `polaroid-${polaroid.id}.jpg`;
    link.href = polaroid.imageData;
    link.click();
  };

  // Delete polaroid
  const deletePolaroid = (id: string) => {
    setPolaroids((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Hidden video element */}
      <video ref={videoRef} className="hidden" playsInline muted />

      {/* WebGL Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Start Screen */}
      {!cameraActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-8 bg-black/90">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-light text-white/90">Polaroid Snip</h1>
            <p className="text-sm text-white/50 max-w-sm">
              Pinch and drag with your thumb and index finger to select an area.
              Release to capture an instant polaroid photo.
            </p>
          </div>

          <button
            onClick={startCamera}
            disabled={isLoading}
            className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white/80 transition-all duration-200 disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "Enable Camera"}
          </button>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="text-xs text-white/30 space-y-1 text-center mt-4">
            <p>Pinch + Drag → Select area</p>
            <p>Release → Capture polaroid</p>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin mx-auto" />
            <p className="text-white/60 text-sm">Loading hand tracking...</p>
          </div>
        </div>
      )}

      {/* Floating Polaroids */}
      {polaroids.slice(-5).map((polaroid) => (
        <div
          key={polaroid.id}
          className="absolute pointer-events-auto cursor-move transition-all duration-500"
          style={{
            left: `${polaroid.x}%`,
            top: `${polaroid.y}%`,
            transform: `translate(-50%, -50%) rotate(${polaroid.rotation}deg)`,
            zIndex: polaroid.timestamp,
          }}
        >
          <div
            className={`bg-white p-2 pb-12 shadow-2xl transition-all duration-1000 ${
              polaroid.developing ? "opacity-80" : "opacity-100"
            }`}
            style={{ width: "180px" }}
          >
            <div className="relative overflow-hidden bg-gray-100">
              <img
                src={polaroid.imageData}
                alt="Polaroid capture"
                className={`w-full h-auto transition-all duration-2000 ${
                  polaroid.developing ? "brightness-200 contrast-0" : ""
                }`}
              />
              {polaroid.developing && (
                <div className="absolute inset-0 bg-gradient-to-b from-amber-100/50 to-transparent" />
              )}
            </div>
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
              <button
                onClick={() => downloadPolaroid(polaroid)}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Save
              </button>
              <span className="text-gray-300">·</span>
              <button
                onClick={() => deletePolaroid(polaroid.id)}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Gallery Button */}
      {cameraActive && polaroids.length > 0 && (
        <button
          onClick={() => setShowGallery(true)}
          className="absolute top-4 right-4 z-20 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
        >
          <div className="relative">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-white text-black text-xs rounded-full flex items-center justify-center">
              {polaroids.length}
            </span>
          </div>
        </button>
      )}

      {/* Gallery Modal */}
      {showGallery && (
        <div className="absolute inset-0 z-30 bg-black/95 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h2 className="text-white/90 font-light">Gallery ({polaroids.length})</h2>
            <button
              onClick={() => setShowGallery(false)}
              className="text-white/60 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {polaroids.map((polaroid) => (
                <div
                  key={polaroid.id}
                  className="bg-white p-2 pb-8 shadow-lg relative group"
                >
                  <img
                    src={polaroid.imageData}
                    alt="Polaroid capture"
                    className="w-full h-auto"
                  />
                  <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => downloadPolaroid(polaroid)}
                      className="text-xs text-gray-500 hover:text-gray-800"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => deletePolaroid(polaroid.id)}
                      className="text-xs text-gray-500 hover:text-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      {cameraActive && !selection && polaroids.length === 0 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
          <div className="text-center space-y-4 animate-pulse">
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 border-2 border-dashed border-white/30 rounded-full flex items-center justify-center">
                <span className="text-white/40 text-2xl">👌</span>
              </div>
              <svg className="w-8 h-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              <div className="w-16 h-12 border-2 border-dashed border-white/30 rounded flex items-center justify-center">
                <span className="text-white/40 text-xs">drag</span>
              </div>
            </div>
            <p className="text-white/50 text-sm">Pinch and drag to select</p>
          </div>
        </div>
      )}

      {/* Pinch indicator - uses smoothed position for stability */}
      {cameraActive && handPositionsRef.current.length > 0 && (
        <div
          className="absolute pointer-events-none z-10"
          style={{
            left: `${smoothedPositionRef.current.x * 100}%`,
            top: `${smoothedPositionRef.current.y * 100}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          {/* Outer ring */}
          <div
            className="w-6 h-6 rounded-full border-2 transition-all duration-100"
            style={{
              borderColor: isPinchingRef.current ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)",
              backgroundColor: isPinchingRef.current ? "rgba(255,255,255,0.2)" : "transparent",
              transform: isPinchingRef.current ? "scale(0.8)" : "scale(1)",
            }}
          />
          {/* Center dot */}
          <div
            className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-white/80 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-100"
            style={{ opacity: isPinchingRef.current ? 1 : 0.5 }}
          />
        </div>
      )}
    </div>
  );
}
