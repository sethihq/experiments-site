"use client";

import Link from "next/link";
import { useState } from "react";
import { Copy, Check, Download, Book, Zap, Palette, Box, Waves, Sun, Code2, Terminal, type LucideIcon } from "lucide-react";

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#ededed]/10 hover:bg-[#ededed]/20 border border-[#ededed]/20 transition-all group"
    >
      {copied ? (
        <Check size={16} className="text-green-400" />
      ) : (
        <Copy size={16} className="text-[#ededed]/60 group-hover:text-[#ededed]" />
      )}
      <span className="text-sm text-[#ededed]/80">{label || "Copy"}</span>
    </button>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: typeof Copy; title: string; description: string }) {
  return (
    <div className="p-5 rounded-xl border border-[#ededed]/10 bg-[#ededed]/[0.02] hover:border-[#ededed]/20 transition-all">
      <div className="w-10 h-10 rounded-lg bg-[#4ecdc4]/10 flex items-center justify-center mb-4">
        <Icon size={20} className="text-[#4ecdc4]" />
      </div>
      <h3 className="text-[#ededed]/90 font-medium mb-2">{title}</h3>
      <p className="text-sm text-[#ededed]/50 leading-relaxed">{description}</p>
    </div>
  );
}

const SKILL_URL = "https://raw.githubusercontent.com/experiments-site/main/.claude/skills/shader.md";
const SKILL_CONTENT_PREVIEW = `# GLSL Shader Development Skill

This skill provides comprehensive guidance for creating GLSL fragment shaders.

## What's Included

- GLSL Fundamentals & Data Types
- 50+ Essential Functions
- 30+ 2D Signed Distance Functions
- 15+ 3D Primitives
- Noise (Perlin, Simplex, Voronoi)
- Fractional Brownian Motion
- Ray Marching with Lighting
- Post-Processing Effects
- React Three Fiber Patterns
- And much more...`;

const INSTALL_COMMAND = `# Add to your project's .claude/skills/ directory
mkdir -p .claude/skills
curl -o .claude/skills/shader.md https://experiments.site/shader.md`;

export default function ShaderSkillPage() {
  const [showFullSkill, setShowFullSkill] = useState(false);

  return (
    <main className="min-h-screen">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-8">
          <div className="flex items-center gap-1 text-sm bg-[#ededed]/[0.02] rounded-full px-1.5 py-1.5 border border-[#ededed]/[0.06]">
            <Link href="/" className="px-4 py-1.5 rounded-full text-[#ededed]/40 hover:text-[#ededed]/70 hover:bg-[#ededed]/[0.03] transition-all">
              Gallery
            </Link>
            <Link href="/resources" className="px-4 py-1.5 rounded-full text-[#ededed]/40 hover:text-[#ededed]/70 hover:bg-[#ededed]/[0.03] transition-all">
              Resources
            </Link>
            <Link href="/shader" className="px-4 py-1.5 rounded-full bg-[#ededed]/[0.08] text-[#ededed]/90 font-medium transition-all">
              Shader Skill
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-32 pb-16 px-5">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#4ecdc4]/10 border border-[#4ecdc4]/20 mb-6">
              <Terminal size={14} className="text-[#4ecdc4]" />
              <span className="text-xs font-medium text-[#4ecdc4]">Claude Code Skill</span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold text-[#ededed] mb-6 tracking-tight">
              GLSL Shader Skill
            </h1>

            <p className="text-lg text-[#ededed]/60 mb-8 max-w-2xl mx-auto leading-relaxed">
              A comprehensive 1500+ line reference for creating GLSL shaders. Based on The Book of Shaders,
              Inigo Quilez&apos;s techniques, and Maxime Heckel&apos;s React Three Fiber patterns.
            </p>

            {/* Install Command */}
            <div className="bg-[#0a0a0a] border border-[#ededed]/10 rounded-xl p-4 mb-8 max-w-xl mx-auto">
              <div className="flex items-center justify-between gap-4 mb-3">
                <span className="text-xs text-[#ededed]/40 uppercase tracking-wider">Install</span>
                <CopyButton text={INSTALL_COMMAND} label="Copy command" />
              </div>
              <pre className="text-left text-sm text-[#ededed]/70 font-mono overflow-x-auto">
                <code>{INSTALL_COMMAND}</code>
              </pre>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="/shader.md"
                download="shader.md"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#4ecdc4] text-black font-medium hover:bg-[#4ecdc4]/90 transition-all"
              >
                <Download size={18} />
                Download Skill
              </a>
              <Link
                href="/shader/reference"
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-[#ededed]/20 text-[#ededed]/80 hover:bg-[#ededed]/5 transition-all"
              >
                <Book size={18} />
                View Reference
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 px-5 border-t border-[#ededed]/10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-[#ededed]/90 text-center mb-12">What&apos;s Included</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FeatureCard
                icon={Code2}
                title="GLSL Fundamentals"
                description="Data types, uniforms, varyings, swizzling, and the complete function reference."
              />
              <FeatureCard
                icon={Box}
                title="2D & 3D SDFs"
                description="30+ 2D shapes and 15+ 3D primitives with boolean operations and smooth blending."
              />
              <FeatureCard
                icon={Waves}
                title="Noise Functions"
                description="Random, Value, Perlin, Simplex, and Voronoi noise with fBM and domain warping."
              />
              <FeatureCard
                icon={Sun}
                title="Ray Marching"
                description="Complete ray marcher with lighting, shadows, and normal calculation."
              />
              <FeatureCard
                icon={Palette}
                title="Post-Processing"
                description="Chromatic aberration, vignette, film grain, dithering, and artistic effects."
              />
              <FeatureCard
                icon={Zap}
                title="R3F Patterns"
                description="React Three Fiber setup, render targets, FBO techniques, and particle systems."
              />
            </div>
          </div>
        </section>

        {/* Topics Covered */}
        <section className="py-16 px-5 border-t border-[#ededed]/10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-[#ededed]/90 text-center mb-12">Topics Covered</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {[
                "Shader Structure",
                "Data Types",
                "Swizzling",
                "Shaping Functions",
                "Trigonometry",
                "Vector Math",
                "Color Mixing",
                "HSB/RGB Conversion",
                "Rectangles",
                "Circles",
                "Polygons",
                "Distance Fields",
                "SDF Operations",
                "Smooth Blending",
                "Transformations",
                "Rotation",
                "Scaling",
                "Patterns",
                "Tiling",
                "Truchet Tiles",
                "Random Functions",
                "Value Noise",
                "Gradient Noise",
                "Simplex Noise",
                "Voronoi",
                "fBM",
                "Turbulence",
                "Domain Warping",
                "3D Primitives",
                "Ray Marching",
                "Normals",
                "Lighting",
                "Shadows",
                "Render Targets",
                "FBO Techniques",
                "Post-Processing",
                "Edge Detection",
                "Sobel Filter",
                "Dithering",
                "Bayer Matrix",
                "Kuwahara Filter",
                "Refraction",
                "Dispersion",
                "Fresnel",
                "Caustics",
                "God Rays",
                "Volumetric Clouds",
                "Particles",
              ].map((topic) => (
                <div
                  key={topic}
                  className="px-3 py-2 rounded-lg bg-[#ededed]/[0.03] border border-[#ededed]/10 text-sm text-[#ededed]/60"
                >
                  {topic}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How to Use */}
        <section className="py-16 px-5 border-t border-[#ededed]/10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-[#ededed]/90 text-center mb-12">How to Use</h2>

            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#4ecdc4]/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-[#4ecdc4]">1</span>
                </div>
                <div>
                  <h3 className="text-[#ededed]/90 font-medium mb-2">Download the skill file</h3>
                  <p className="text-sm text-[#ededed]/50">
                    Download <code className="px-1.5 py-0.5 rounded bg-[#ededed]/10 text-[#4ecdc4]">shader.md</code> and
                    place it in your project&apos;s <code className="px-1.5 py-0.5 rounded bg-[#ededed]/10 text-[#4ecdc4]">.claude/skills/</code> directory.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#4ecdc4]/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-[#4ecdc4]">2</span>
                </div>
                <div>
                  <h3 className="text-[#ededed]/90 font-medium mb-2">Ask for shader help</h3>
                  <p className="text-sm text-[#ededed]/50">
                    Claude will automatically reference the skill when you ask shader-related questions like
                    &ldquo;Create a plasma effect&rdquo; or &ldquo;Help me with ray marching&rdquo;.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#4ecdc4]/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-[#4ecdc4]">3</span>
                </div>
                <div>
                  <h3 className="text-[#ededed]/90 font-medium mb-2">Get production-ready code</h3>
                  <p className="text-sm text-[#ededed]/50">
                    Claude will generate complete, working shader code using the techniques and patterns from the skill.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Skill Preview */}
        <section className="py-16 px-5 border-t border-[#ededed]/10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-[#ededed]/90 text-center mb-8">Skill Preview</h2>

            <div className="bg-[#0a0a0a] border border-[#ededed]/10 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#ededed]/10">
                <span className="text-sm text-[#ededed]/50 font-mono">shader.md</span>
                <CopyButton text={SKILL_CONTENT_PREVIEW} label="Copy" />
              </div>
              <pre className="p-4 text-sm text-[#ededed]/70 font-mono overflow-x-auto max-h-80">
                <code>{SKILL_CONTENT_PREVIEW}</code>
              </pre>
            </div>

            <div className="text-center mt-6">
              <Link
                href="/shader/reference"
                className="text-[#4ecdc4] hover:underline text-sm"
              >
                View full reference →
              </Link>
            </div>
          </div>
        </section>

        {/* Sources */}
        <section className="py-16 px-5 border-t border-[#ededed]/10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-[#ededed]/90 mb-8">Sources</h2>

            <div className="flex flex-wrap justify-center gap-4">
              {[
                { name: "The Book of Shaders", url: "https://thebookofshaders.com/" },
                { name: "Inigo Quilez", url: "https://iquilezles.org/" },
                { name: "Maxime Heckel", url: "https://blog.maximeheckel.com/" },
                { name: "Shadertoy", url: "https://shadertoy.com/" },
              ].map((source) => (
                <a
                  key={source.name}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg border border-[#ededed]/10 text-sm text-[#ededed]/60 hover:text-[#ededed] hover:border-[#ededed]/30 transition-all"
                >
                  {source.name}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-5 border-t border-[#ededed]/10 text-center">
          <p className="text-[#ededed]/30 text-sm">
            Free and open source. Made for the creative coding community.
          </p>
        </footer>
      </main>
  );
}
