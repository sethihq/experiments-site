import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resources | WebGL & Shader Learning",
  description: "Curated resources for learning WebGL, GLSL shaders, and Three.js",
  openGraph: {
    title: "Resources | WebGL & Shader Learning",
    description: "Curated resources for learning WebGL, GLSL shaders, and Three.js",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Resources | WebGL & Shader Learning",
    description: "Curated resources for learning WebGL, GLSL shaders, and Three.js",
  },
};

export default function ResourcesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
