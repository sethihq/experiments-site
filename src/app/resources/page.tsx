"use client";

import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { NavToggle } from "@/components/nav-toggle";

const resources = [
  {
    title: "The Book of Shaders",
    description: "A gentle step-by-step guide through the abstract and complex universe of Fragment Shaders",
    url: "https://thebookofshaders.com/",
    tags: ["GLSL", "Shaders", "Fundamentals"],
  },
  {
    title: "Inigo Quilez",
    description: "The definitive resource for SDFs, ray marching, and mathematical graphics techniques",
    url: "https://iquilezles.org/",
    tags: ["SDFs", "Ray Marching", "Math"],
  },
  {
    title: "Maxime Heckel's Blog",
    description: "Deep dives into WebGL, shaders, React Three Fiber, and creative coding with interactive examples",
    url: "https://blog.maximeheckel.com/",
    tags: ["Three.js", "R3F", "Shaders"],
  },
  {
    title: "Three.js Journey",
    description: "The ultimate Three.js course by Bruno Simon",
    url: "https://threejs-journey.com/",
    tags: ["Three.js", "Course"],
  },
  {
    title: "Shadertoy",
    description: "Build and share your best shaders with the world and get inspired",
    url: "https://www.shadertoy.com/",
    tags: ["GLSL", "Community"],
  },
  {
    title: "WebGL Fundamentals",
    description: "A set of articles that teach WebGL from basic principles",
    url: "https://webglfundamentals.org/",
    tags: ["WebGL", "Fundamentals"],
  },
  {
    title: "ShaderGPT",
    description: "AI-powered shader generation tool by 14islands - describe what you want and get GLSL code",
    url: "https://shadergpt.14islands.com/",
    tags: ["AI", "GLSL", "Tool"],
  },
  {
    title: "Brad Woods' Digital Garden",
    description: "A collection of notes, experiments, and learnings on creative coding and web development",
    url: "https://garden.bradwoods.io/",
    tags: ["Creative Coding", "Notes"],
  },
  {
    title: "Visual Rambling",
    description: "A space for visual experiments and creative explorations",
    url: "https://visualrambling.space/",
    tags: ["Experiments", "Creative"],
  },
];

// Card animation variants
const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.5,
      ease: [0.23, 1, 0.32, 1],
    },
  }),
};

export default function ResourcesPage() {
  return (
    <main className="min-h-screen flex flex-col items-center">
        {/* Navigation */}
        <NavToggle />

        {/* Header */}
        <header className="mt-[20vh] mb-[10vh] flex flex-col items-center">
          <h1 className="flex items-center gap-4 text-4xl lg:text-5xl uppercase tracking-tight">
            <span className="font-serif italic text-[var(--fg-90)]">RESOURCES</span>
            <span className="w-24 lg:w-32 h-0.5 bg-[var(--foreground)] animate-line" />
            <span className="font-mono text-[var(--fg-70)]">{resources.length}</span>
          </h1>
        </header>

        {/* Resources List */}
        <section className="w-full max-w-3xl px-5">
          <div className="flex flex-col gap-4">
            {resources.map((resource, i) => (
              <motion.a
                key={resource.url}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block p-6 rounded-2xl border border-[var(--fg-06)] hover:border-[var(--fg-15)] bg-[var(--fg-02)] hover:bg-[var(--fg-03)] transition-colors"
                variants={cardVariants}
                initial="initial"
                animate="animate"
                custom={i}
                whileHover={{ scale: 1.01, y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg text-[var(--fg-90)] group-hover:text-[var(--foreground)] transition-colors flex items-center gap-2">
                      {resource.title}
                      <motion.span
                        className="inline-block"
                        whileHover={{ x: 2, y: -2 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <ArrowUpRight size={16} className="text-[var(--fg-30)] group-hover:text-[var(--fg-60)] transition-colors" />
                      </motion.span>
                    </h3>
                    <p className="text-sm text-[var(--fg-40)] mt-2 leading-relaxed">
                      {resource.description}
                    </p>
                    <div className="flex items-center gap-2 mt-4">
                      {resource.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 rounded-md text-[var(--fg-30)] bg-[var(--fg-06)] group-hover:bg-[var(--fg-10)] transition-colors"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="py-16 text-center space-y-3">
          <p className="text-[var(--fg-20)] text-xs">
            Curated resources for learning WebGL & shaders
          </p>
          <div className="flex items-center justify-center gap-6 text-xs text-[var(--fg-25)]">
            <Link href="/" className="link-hover-underline hover:text-[var(--fg-50)] transition-colors">
              Gallery
            </Link>
            <Link href="/skills" className="link-hover-underline hover:text-[var(--fg-50)] transition-colors">
              Skills
            </Link>
          </div>
        </footer>
      </main>
  );
}
