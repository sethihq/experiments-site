"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Copy, Check, ChevronDown, ChevronRight, ArrowLeft } from "lucide-react";

interface CodeBlockProps {
  code: string;
}

function CodeBlock({ code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="bg-[#0a0a0a] border border-[#ededed]/10 rounded-lg p-4 overflow-x-auto text-sm">
        <code className="text-[#ededed]/80 font-mono whitespace-pre">{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 p-2 rounded-md bg-[#ededed]/5 hover:bg-[#ededed]/10 opacity-0 group-hover:opacity-100 transition-all"
      >
        {copied ? (
          <Check size={14} className="text-green-400" />
        ) : (
          <Copy size={14} className="text-[#ededed]/50" />
        )}
      </button>
    </div>
  );
}

interface SectionProps {
  title: string;
  id: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({ title, id, children, defaultOpen = false }: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-[#ededed]/10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 flex items-center gap-3 text-left hover:bg-[#ededed]/[0.02] transition-colors"
        id={id}
      >
        {isOpen ? (
          <ChevronDown size={18} className="text-[#ededed]/40" />
        ) : (
          <ChevronRight size={18} className="text-[#ededed]/40" />
        )}
        <h2 className="text-lg font-medium text-[#ededed]/90">{title}</h2>
      </button>
      {isOpen && <div className="pb-6 pl-8 pr-4 space-y-4">{children}</div>}
    </div>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-[#ededed]/70 uppercase tracking-wide">{title}</h3>
      {children}
    </div>
  );
}

function FunctionTable({ functions }: { functions: { name: string; desc: string }[] }) {
  return (
    <div className="grid gap-1 text-sm">
      {functions.map((fn) => (
        <div key={fn.name} className="flex gap-4 py-1.5 border-b border-[#ededed]/5">
          <code className="text-[#4ecdc4] font-mono min-w-[180px]">{fn.name}</code>
          <span className="text-[#ededed]/50">{fn.desc}</span>
        </div>
      ))}
    </div>
  );
}

const sections = [
  { id: "fundamentals", title: "GLSL Fundamentals" },
  { id: "functions", title: "Essential Functions" },
  { id: "shaping", title: "Shaping Techniques" },
  { id: "colors", title: "Color Techniques" },
  { id: "shapes", title: "Drawing Shapes" },
  { id: "sdf2d", title: "2D Signed Distance Functions" },
  { id: "sdf-ops", title: "SDF Operations" },
  { id: "transforms", title: "2D Transformations" },
  { id: "patterns", title: "Pattern Generation" },
  { id: "noise", title: "Randomness & Noise" },
  { id: "fbm", title: "Fractional Brownian Motion" },
  { id: "voronoi", title: "Cellular Noise (Voronoi)" },
  { id: "sdf3d", title: "3D Signed Distance Functions" },
  { id: "raymarching", title: "Ray Marching" },
  { id: "r3f", title: "React Three Fiber Patterns" },
  { id: "rendertargets", title: "Render Targets & FBO" },
  { id: "postprocessing", title: "Post-Processing Effects" },
  { id: "edges", title: "Edge Detection & Outlines" },
  { id: "dithering", title: "Dithering & Retro Effects" },
  { id: "painterly", title: "Painterly & Artistic Effects" },
  { id: "refraction", title: "Refraction & Dispersion" },
  { id: "caustics", title: "Caustics" },
  { id: "volumetric", title: "Volumetric Lighting" },
  { id: "clouds", title: "Volumetric Clouds" },
  { id: "particles", title: "Particle Systems" },
  { id: "displacement", title: "Vertex Displacement" },
  { id: "animation", title: "Animation Techniques" },
  { id: "recipes", title: "Common Recipes" },
];

export default function ShaderReferencePage() {
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

        <div className="flex">
          {/* Sidebar */}
          <aside className="hidden lg:block fixed left-0 top-0 h-screen w-64 pt-24 pb-8 px-4 overflow-y-auto border-r border-[#ededed]/10">
            <Link href="/shader" className="flex items-center gap-2 text-sm text-[#4ecdc4] hover:underline mb-6">
              <ArrowLeft size={14} />
              Back to Skill
            </Link>
            <nav className="space-y-1">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="block py-2 px-3 text-sm text-[#ededed]/50 hover:text-[#ededed]/90 hover:bg-[#ededed]/[0.03] rounded-md transition-colors"
                >
                  {section.title}
                </a>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <div className="flex-1 lg:ml-64 px-5 lg:px-12 pt-28 pb-20 max-w-4xl mx-auto">
            {/* Header */}
            <header className="mb-12">
              <Link href="/shader" className="lg:hidden flex items-center gap-2 text-sm text-[#4ecdc4] hover:underline mb-4">
                <ArrowLeft size={14} />
                Back to Skill
              </Link>
              <h1 className="text-4xl lg:text-5xl font-bold text-[#ededed]/90 mb-4">
                Shader Reference
              </h1>
              <p className="text-[#ededed]/50 text-lg leading-relaxed">
                Complete GLSL shader reference with code examples. Click sections to expand.
              </p>
            </header>

            {/* Sections */}
            <div className="space-y-0">
              <Section title="GLSL Fundamentals" id="fundamentals" defaultOpen={true}>
                <SubSection title="Basic Shader Structure">
                  <CodeBlock code={`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;  // Canvas size (width, height)
uniform vec2 u_mouse;       // Mouse position in pixels
uniform float u_time;       // Time in seconds since load

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;  // Normalize 0-1
    vec3 color = vec3(0.0);

    // Shader logic here

    gl_FragColor = vec4(color, 1.0);
}`} />
                </SubSection>

                <SubSection title="Data Types">
                  <div className="text-sm text-[#ededed]/60 space-y-1">
                    <p><code className="text-[#4ecdc4]">float</code> - Single value (ALWAYS use decimal: <code>1.0</code> not <code>1</code>)</p>
                    <p><code className="text-[#4ecdc4]">vec2</code> - 2D vector (x,y or s,t or r,g)</p>
                    <p><code className="text-[#4ecdc4]">vec3</code> - 3D vector (x,y,z or r,g,b)</p>
                    <p><code className="text-[#4ecdc4]">vec4</code> - 4D vector (x,y,z,w or r,g,b,a)</p>
                    <p><code className="text-[#4ecdc4]">mat2, mat3, mat4</code> - Matrices</p>
                    <p><code className="text-[#4ecdc4]">sampler2D</code> - 2D texture sampler</p>
                  </div>
                </SubSection>

                <SubSection title="Swizzling">
                  <CodeBlock code={`vec4 color = vec4(1.0, 0.5, 0.0, 1.0);
vec3 rgb = color.rgb;      // Get first 3 components
vec2 rg = color.xy;        // Same as color.rg
vec3 bgr = color.bgr;      // Swapped order
color.rg = vec2(0.5);      // Assign to specific components`} />
                </SubSection>
              </Section>

              <Section title="Essential Functions" id="functions">
                <SubSection title="Shaping Functions">
                  <FunctionTable functions={[
                    { name: "step(edge, x)", desc: "Returns 0.0 if x < edge, else 1.0" },
                    { name: "smoothstep(e0, e1, x)", desc: "Smooth interpolation between edges" },
                    { name: "mix(a, b, t)", desc: "Linear interpolation: a*(1-t) + b*t" },
                    { name: "clamp(x, min, max)", desc: "Constrain x between min and max" },
                    { name: "fract(x)", desc: "Fractional part of x" },
                    { name: "mod(x, y)", desc: "Modulo operation" },
                    { name: "floor(x)", desc: "Round down to integer" },
                    { name: "ceil(x)", desc: "Round up to integer" },
                    { name: "abs(x)", desc: "Absolute value" },
                    { name: "sign(x)", desc: "Returns -1, 0, or 1" },
                    { name: "min(a, b)", desc: "Minimum of a and b" },
                    { name: "max(a, b)", desc: "Maximum of a and b" },
                  ]} />
                </SubSection>

                <SubSection title="Math Functions">
                  <FunctionTable functions={[
                    { name: "pow(x, y)", desc: "x raised to power y" },
                    { name: "exp(x)", desc: "e^x" },
                    { name: "log(x)", desc: "Natural logarithm" },
                    { name: "sqrt(x)", desc: "Square root" },
                    { name: "inversesqrt(x)", desc: "1/sqrt(x) - faster than dividing" },
                  ]} />
                </SubSection>

                <SubSection title="Vector Functions">
                  <FunctionTable functions={[
                    { name: "length(v)", desc: "Vector magnitude" },
                    { name: "distance(p1, p2)", desc: "Distance between points" },
                    { name: "dot(a, b)", desc: "Dot product" },
                    { name: "cross(a, b)", desc: "Cross product (vec3 only)" },
                    { name: "normalize(v)", desc: "Unit vector" },
                    { name: "reflect(I, N)", desc: "Reflection vector" },
                    { name: "refract(I, N, eta)", desc: "Refraction vector" },
                  ]} />
                </SubSection>
              </Section>

              <Section title="2D Signed Distance Functions" id="sdf2d">
                <SubSection title="Circle">
                  <CodeBlock code={`float sdCircle(vec2 p, float r) {
    return length(p) - r;
}`} />
                </SubSection>

                <SubSection title="Box">
                  <CodeBlock code={`float sdBox(vec2 p, vec2 b) {
    vec2 d = abs(p) - b;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}`} />
                </SubSection>

                <SubSection title="Rounded Box">
                  <CodeBlock code={`float sdRoundedBox(vec2 p, vec2 b, vec4 r) {
    r.xy = (p.x > 0.0) ? r.xy : r.zw;
    r.x = (p.y > 0.0) ? r.x : r.y;
    vec2 q = abs(p) - b + r.x;
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r.x;
}`} />
                </SubSection>

                <SubSection title="Hexagon">
                  <CodeBlock code={`float sdHexagon(vec2 p, float r) {
    const vec3 k = vec3(-0.866025404, 0.5, 0.577350269);
    p = abs(p);
    p -= 2.0 * min(dot(k.xy, p), 0.0) * k.xy;
    p -= vec2(clamp(p.x, -k.z * r, k.z * r), r);
    return length(p) * sign(p.y);
}`} />
                </SubSection>

                <SubSection title="Star">
                  <CodeBlock code={`float sdStar(vec2 p, float r, int n, float m) {
    float an = 3.141593 / float(n);
    float en = 3.141593 / m;
    vec2 acs = vec2(cos(an), sin(an));
    vec2 ecs = vec2(cos(en), sin(en));
    float bn = mod(atan(p.x, p.y), 2.0 * an) - an;
    p = length(p) * vec2(cos(bn), abs(sin(bn)));
    p -= r * acs;
    p += ecs * clamp(-dot(p, ecs), 0.0, r * acs.y / ecs.y);
    return length(p) * sign(p.x);
}`} />
                </SubSection>

                <SubSection title="Heart">
                  <CodeBlock code={`float sdHeart(vec2 p) {
    p.x = abs(p.x);
    if (p.y + p.x > 1.0)
        return sqrt(dot(p - vec2(0.25, 0.75), p - vec2(0.25, 0.75))) - sqrt(2.0) / 4.0;
    return sqrt(min(dot(p - vec2(0.0, 1.0), p - vec2(0.0, 1.0)),
                    dot(p - 0.5 * max(p.x + p.y, 0.0), p - 0.5 * max(p.x + p.y, 0.0)))) * sign(p.x - p.y);
}`} />
                </SubSection>
              </Section>

              <Section title="SDF Operations" id="sdf-ops">
                <CodeBlock code={`// Union (combine shapes)
float opUnion(float d1, float d2) {
    return min(d1, d2);
}

// Subtraction (cut out)
float opSubtraction(float d1, float d2) {
    return max(-d1, d2);
}

// Intersection
float opIntersection(float d1, float d2) {
    return max(d1, d2);
}

// Smooth Union
float opSmoothUnion(float d1, float d2, float k) {
    float h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
    return mix(d2, d1, h) - k * h * (1.0 - h);
}

// Rounding
float opRound(float d, float r) {
    return d - r;
}

// Annular (ring/outline)
float opOnion(float d, float r) {
    return abs(d) - r;
}`} />
              </Section>

              <Section title="Noise Functions" id="noise">
                <SubSection title="Random">
                  <CodeBlock code={`float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

vec2 random2(vec2 st) {
    st = vec2(dot(st, vec2(127.1, 311.7)),
              dot(st, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(st) * 43758.5453123);
}`} />
                </SubSection>

                <SubSection title="Value Noise">
                  <CodeBlock code={`float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    vec2 u = f * f * (3.0 - 2.0 * f);

    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}`} />
                </SubSection>
              </Section>

              <Section title="Fractional Brownian Motion" id="fbm">
                <CodeBlock code={`#define OCTAVES 6

float fbm(vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;

    for (int i = 0; i < OCTAVES; i++) {
        value += amplitude * noise(st * frequency);
        frequency *= 2.0;      // Lacunarity
        amplitude *= 0.5;      // Gain/Persistence
    }
    return value;
}

// Domain Warping
float warpedFbm(vec2 st) {
    vec2 q = vec2(fbm(st + vec2(0.0, 0.0)),
                  fbm(st + vec2(5.2, 1.3)));
    return fbm(st + 4.0 * q);
}`} />
              </Section>

              <Section title="Ray Marching" id="raymarching">
                <CodeBlock code={`#define MAX_STEPS 100
#define MAX_DIST 100.0
#define SURF_DIST 0.001

float sceneSDF(vec3 p) {
    float sphere = length(p - vec3(0.0, 1.0, 6.0)) - 1.0;
    float plane = p.y;
    return min(sphere, plane);
}

float rayMarch(vec3 ro, vec3 rd) {
    float dO = 0.0;
    for (int i = 0; i < MAX_STEPS; i++) {
        vec3 p = ro + rd * dO;
        float dS = sceneSDF(p);
        dO += dS;
        if (dO > MAX_DIST || dS < SURF_DIST) break;
    }
    return dO;
}

vec3 getNormal(vec3 p) {
    float d = sceneSDF(p);
    vec2 e = vec2(0.001, 0.0);
    vec3 n = d - vec3(
        sceneSDF(p - e.xyy),
        sceneSDF(p - e.yxy),
        sceneSDF(p - e.yyx)
    );
    return normalize(n);
}`} />
              </Section>

              <Section title="Post-Processing Effects" id="postprocessing">
                <SubSection title="Chromatic Aberration">
                  <CodeBlock code={`uniform sampler2D tDiffuse;
uniform float uIntensity;
varying vec2 vUv;

void main() {
    vec2 direction = vUv - 0.5;
    float dist = length(direction);

    float rOffset = uIntensity * dist;
    float bOffset = -uIntensity * dist;

    float r = texture2D(tDiffuse, vUv + direction * rOffset).r;
    float g = texture2D(tDiffuse, vUv).g;
    float b = texture2D(tDiffuse, vUv + direction * bOffset).b;

    gl_FragColor = vec4(r, g, b, 1.0);
}`} />
                </SubSection>

                <SubSection title="Vignette">
                  <CodeBlock code={`float dist = distance(vUv, vec2(0.5));
float vignette = smoothstep(0.5, 0.5 - uSmoothness, dist * (1.0 + uIntensity));
color.rgb *= vignette;`} />
                </SubSection>
              </Section>

              <Section title="Dithering" id="dithering">
                <CodeBlock code={`// 4x4 Bayer matrix dithering
const mat4 bayerMatrix = mat4(
   0.0/16.0,  8.0/16.0,  2.0/16.0, 10.0/16.0,
  12.0/16.0,  4.0/16.0, 14.0/16.0,  6.0/16.0,
   3.0/16.0, 11.0/16.0,  1.0/16.0,  9.0/16.0,
  15.0/16.0,  7.0/16.0, 13.0/16.0,  5.0/16.0
);

float getBayer(vec2 uv) {
    ivec2 pos = ivec2(mod(uv, 4.0));
    return bayerMatrix[pos.x][pos.y];
}

vec3 dither(vec3 color, vec2 fragCoord) {
    float threshold = getBayer(fragCoord);
    float levels = uColorDepth;
    return floor(color * levels + threshold) / levels;
}`} />
              </Section>

              <Section title="Common Recipes" id="recipes">
                <SubSection title="Plasma">
                  <CodeBlock code={`float plasma = sin(st.x * 10.0 + u_time) +
               sin(st.y * 10.0 + u_time) +
               sin((st.x + st.y) * 10.0 + u_time) +
               sin(length(st - 0.5) * 10.0 - u_time);
vec3 color = vec3(sin(plasma), sin(plasma + 2.094), sin(plasma + 4.188)) * 0.5 + 0.5;`} />
                </SubSection>

                <SubSection title="Fire">
                  <CodeBlock code={`float fire = fbm(vec2(st.x * 3.0, st.y * 2.0 - u_time * 2.0));
fire = fire * (1.0 - st.y);
vec3 color = mix(vec3(1.0, 0.0, 0.0), vec3(1.0, 1.0, 0.0), fire);`} />
                </SubSection>

                <SubSection title="Metaballs">
                  <CodeBlock code={`float metaballs(vec2 st) {
    float d = 0.0;
    for (int i = 0; i < 5; i++) {
        vec2 pos = vec2(
            0.5 + 0.3 * sin(u_time + float(i)),
            0.5 + 0.3 * cos(u_time * 1.3 + float(i) * 2.0)
        );
        d += 0.05 / length(st - pos);
    }
    return d;
}`} />
                </SubSection>
              </Section>
            </div>

            {/* Footer */}
            <footer className="mt-20 pt-8 border-t border-[#ededed]/10 text-center">
              <p className="text-[#ededed]/30 text-sm mb-4">
                This is a condensed reference. Download the full skill for complete code examples.
              </p>
              <a
                href="/shader.md"
                download="shader.md"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#4ecdc4] text-black font-medium hover:bg-[#4ecdc4]/90 transition-all text-sm"
              >
                Download Full Skill (2100+ lines)
              </a>
            </footer>
          </div>
        </div>
      </main>
  );
}
