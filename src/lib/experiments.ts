export interface Experiment {
  id: string;
  number: number;
  title: string;
  description: string;
  tags: string[];
  href: string;
  year: string;
  isNew?: boolean;
  previewColor?: string;
}

export const experiments: Experiment[] = [
  {
    id: "001",
    number: 1,
    title: "Camera Shader",
    description: "TouchDesigner-style webcam effects with real-time Tweakpane controls - pixelation, glitch, RGB shift",
    tags: ["WebGL", "Camera", "Tweakpane"],
    href: "/exp/1",
    year: "2026",
    isNew: true,
    previewColor: "#0a0a0a",
  },
  {
    id: "002",
    number: 2,
    title: "ASCII 3D",
    description: "Render 3D models as ASCII art with adjustable density and dark/light themes",
    tags: ["Three.js", "ASCII", "Retro"],
    href: "/exp/2",
    year: "2026",
    isNew: true,
    previewColor: "#0a0a0f",
  },
  {
    id: "003",
    number: 3,
    title: "Eye Tracking Shader",
    description: "Real-time eye detection with multiple shader effects - base, tracking, ASCII, thermal, edge, pixelate",
    tags: ["WebGL", "Camera", "AI", "Face Detection"],
    href: "/exp/3",
    year: "2026",
    isNew: true,
    previewColor: "#0d0d12",
  },
  {
    id: "004",
    number: 4,
    title: "Digital Twin",
    description: "Transform into your digital self - wireframe, hologram, void, glitch effects with face tracking and audio reactivity",
    tags: ["WebGL", "Camera", "AI", "Audio", "Face Detection"],
    href: "/exp/4",
    year: "2026",
    isNew: true,
    previewColor: "#050508",
  },
  {
    id: "005",
    number: 5,
    title: "Gesture Masks",
    description: "Flick your hand to change AR face masks - kitsune fox, oni demon, neon skull, cyber glitch with Three.js + MediaPipe",
    tags: ["Three.js", "Camera", "AI", "Hand Tracking", "AR", "3D"],
    href: "/exp/5",
    year: "2026",
    isNew: true,
    previewColor: "#050505",
  },
  {
    id: "006",
    number: 6,
    title: "Sling Ring Portal",
    description: "Draw a circle with your finger to open a Doctor Strange portal to random locations around the world",
    tags: ["WebGL", "Camera", "AI", "Hand Tracking", "Shader"],
    href: "/exp/6",
    year: "2026",
    isNew: true,
    previewColor: "#1a0a00",
  },
  {
    id: "007",
    number: 7,
    title: "Polaroid Snip",
    description: "Drag with two fingers to select an area, release to capture a polaroid-style instant photo",
    tags: ["WebGL", "Camera", "AI", "Hand Tracking", "Photo"],
    href: "/exp/7",
    year: "2026",
    isNew: true,
    previewColor: "#0a0a0a",
  },
];

export function getExperimentsByYear() {
  const grouped: Record<string, Experiment[]> = {};
  experiments.forEach((exp) => {
    if (!grouped[exp.year]) {
      grouped[exp.year] = [];
    }
    grouped[exp.year].push(exp);
  });
  return grouped;
}
