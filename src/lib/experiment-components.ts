import dynamic from "next/dynamic";
import type { ComponentType } from "react";

// Dynamically import experiment components to enable code splitting
const CameraShader = dynamic(
  () => import("@/experiments/exp-001-camera-shader"),
  { ssr: false }
);

const Ascii3D = dynamic(
  () => import("@/components/experiments/ascii-3d"),
  { ssr: false }
);

const EyeTrackingShader = dynamic(
  () => import("@/experiments/exp-003-eye-tracking"),
  { ssr: false }
);

const DigitalTwin = dynamic(
  () => import("@/experiments/exp-004-digital-twin"),
  { ssr: false }
);

const GestureMasks = dynamic(
  () => import("@/experiments/exp-005-gesture-masks"),
  { ssr: false }
);

const DoctorStrangePortal = dynamic(
  () => import("@/experiments/exp-006-doctor-strange-portal"),
  { ssr: false }
);

const PolaroidSnip = dynamic(
  () => import("@/experiments/exp-007-polaroid-snip"),
  { ssr: false }
);

// Map experiment numbers to their components
export const experimentComponents: Record<number, ComponentType> = {
  1: CameraShader,
  2: Ascii3D,
  3: EyeTrackingShader,
  4: DigitalTwin,
  5: GestureMasks,
  6: DoctorStrangePortal,
  7: PolaroidSnip,
};

export function getExperimentComponent(experimentNumber: number): ComponentType | null {
  return experimentComponents[experimentNumber] || null;
}
