import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shader Reference | GLSL Shader Skill",
  description: "Complete GLSL shader reference with code examples for SDFs, noise, ray marching, post-processing, and more.",
};

export default function ReferenceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
