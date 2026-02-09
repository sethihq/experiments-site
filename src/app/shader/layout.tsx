import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GLSL Shader Skill | Experiments",
  description: "A comprehensive reference for creating GLSL fragment shaders. Covers SDFs, noise, ray marching, fBM, and more.",
  openGraph: {
    title: "GLSL Shader Skill",
    description: "A comprehensive reference for creating GLSL fragment shaders. Based on The Book of Shaders and Inigo Quilez.",
  },
};

export default function ShaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
