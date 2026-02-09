"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavToggle } from "@/components/nav-toggle";
import { Copy, Check, ExternalLink, Sparkles, Download } from "lucide-react";

// Animated copy button with spring morphing
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.button
      onClick={handleCopy}
      className="relative p-2 rounded-lg hover:bg-white/5 transition-colors"
      title="Copy to clipboard"
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.div
            key="check"
            initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
          >
            <Check size={14} className="text-emerald-400" />
          </motion.div>
        ) : (
          <motion.div
            key="copy"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
          >
            <Copy size={14} className="text-[var(--fg-40)]" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// Animated line that draws in with spring physics
function AnimatedLine() {
  return (
    <motion.span
      className="flex-1 h-px bg-[var(--fg-10)] origin-left"
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 20,
        delay: 0.3,
      }}
    />
  );
}

// macOS-style terminal window with hover glow
function Terminal({ children, filename }: { children: React.ReactNode; filename: string }) {
  return (
    <motion.div
      className="rounded-xl overflow-hidden border border-[var(--fg-10)] bg-[#0a0a0a] group"
      whileHover={{ borderColor: "rgba(237, 237, 237, 0.15)" }}
      transition={{ duration: 0.3 }}
      style={{
        boxShadow: "0 0 0 1px rgba(255,255,255,0.02)",
      }}
    >
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-[var(--fg-06)] bg-[#0f0f0f]">
        <motion.div
          className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]/80"
          whileHover={{ scale: 1.2, backgroundColor: "#ff5f57" }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        />
        <motion.div
          className="w-2.5 h-2.5 rounded-full bg-[#febc2e]/80"
          whileHover={{ scale: 1.2, backgroundColor: "#febc2e" }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        />
        <motion.div
          className="w-2.5 h-2.5 rounded-full bg-[#28c840]/80"
          whileHover={{ scale: 1.2, backgroundColor: "#28c840" }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        />
        <span className="ml-2 text-[11px] text-[var(--fg-30)] font-mono">{filename}</span>
      </div>
      {/* Content */}
      <div className="p-4 font-mono text-[13px] leading-relaxed">
        {children}
      </div>
    </motion.div>
  );
}

export default function SkillsPage() {
  return (
    <>
      <main className="min-h-screen">
        <NavToggle />

        {/* Content - Ally-style narrow article */}
        <article className="max-w-[32rem] mx-auto px-6 pt-32 pb-24">

          {/* Hero */}
          <header className="mb-12">
            <h1 className="text-[1.35rem] font-medium text-[var(--foreground)] tracking-tight leading-snug mb-4">
              <span className="relative inline-block">
                Teach Claude
                {/* Sketchy underline */}
                <span
                  className="absolute -bottom-0.5 left-0 right-0 h-[0.35em] -z-10 rounded-sm"
                  style={{
                    background: "linear-gradient(104deg, rgba(255,107,0,0) 0.9%, rgba(255,107,0,0.3) 2.4%, rgba(255,107,0,0.25) 5.8%, rgba(255,107,0,0.15) 93%, rgba(255,107,0,0.3) 96%, rgba(255,107,0,0) 98%)",
                  }}
                />
              </span>
              {" "}new domains.
            </h1>
            <p className="text-[15px] text-[var(--fg-50)] leading-relaxed">
              Skills are markdown files with patterns and examples. Drop one in your project,
              and Claude will use it automatically when working in that domain.
            </p>
          </header>

          {/* How it works */}
          <section className="mb-14">
            <h2 className="flex items-center gap-3 text-sm font-semibold text-[var(--foreground)] tracking-tight mb-5">
              How it works
              <AnimatedLine />
            </h2>

            <ol className="space-y-4">
              {[
                { num: "1", text: "Download a skill file", code: ".md" },
                { num: "2", text: "Put it in", code: ".claude/skills/" },
                { num: "3", text: "Ask Claude about that domain" },
              ].map((step, i) => (
                <li
                  key={i}
                  className="flex items-baseline gap-3 text-[14px]"
                  style={{
                    opacity: 0,
                    animation: `fadeUp 0.5s cubic-bezier(0.23, 1, 0.32, 1) ${0.4 + i * 0.1}s forwards`,
                  }}
                >
                  <span className="text-[var(--fg-30)] tabular-nums font-mono text-xs">{step.num}.</span>
                  <span className="text-[var(--fg-60)]">
                    {step.text}
                    {step.code && (
                      <code className="ml-1 px-1.5 py-0.5 bg-[var(--fg-06)] rounded text-[12px] text-[var(--fg-50)] font-mono">
                        {step.code}
                      </code>
                    )}
                  </span>
                </li>
              ))}
            </ol>
          </section>

          {/* Available Skills */}
          <section className="mb-14">
            <h2 className="flex items-center gap-3 text-sm font-semibold text-[var(--foreground)] tracking-tight mb-5">
              Available
              <AnimatedLine />
            </h2>

            {/* Shader Skill Card */}
            <div
              className="p-5 rounded-xl bg-[var(--fg-02)] border border-[var(--fg-06)] hover:border-[var(--fg-10)] transition-colors"
              style={{
                boxShadow: "0 0 0 1px rgba(255,255,255,0.02)",
              }}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="text-sm font-semibold text-[var(--foreground)] tracking-tight">
                      GLSL Shader Skill
                    </h3>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[var(--accent)]/10 text-[10px] text-[var(--accent)]">
                      <Sparkles size={10} />
                      New
                    </span>
                  </div>
                  <p className="text-[13px] text-[var(--fg-45)] leading-relaxed">
                    1500+ line reference covering SDFs, noise functions, ray marching,
                    fBM, post-processing, and React Three Fiber patterns.
                  </p>
                </div>
              </div>

              {/* Terminal with install command */}
              <Terminal filename="Terminal">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[var(--fg-30)]">$</span>{" "}
                    <span className="text-[var(--fg-70)]">curl -o .claude/skills/shader.md</span>{" "}
                    <span className="text-emerald-400/70">https://exp.site/shader.md</span>
                  </div>
                  <CopyButton text="curl -o .claude/skills/shader.md https://experiments.site/shader.md" />
                </div>
              </Terminal>

              {/* Actions */}
              <div className="flex items-center gap-5 mt-4 pt-4 border-t border-[var(--fg-06)]">
                <a
                  href="/shader.md"
                  download="shader.md"
                  className="text-[13px] text-[var(--fg-50)] hover:text-[var(--foreground)] transition-colors flex items-center gap-1.5"
                >
                  <Download size={13} />
                  Download shader.md
                </a>
              </div>
            </div>
          </section>

          {/* Create your own */}
          <section className="mb-14">
            <h2 className="flex items-center gap-3 text-sm font-semibold text-[var(--foreground)] tracking-tight mb-5">
              Create your own
              <AnimatedLine />
            </h2>

            <div className="space-y-3 text-[14px] text-[var(--fg-50)] leading-relaxed">
              <p>
                A skill is just a markdown file with domain knowledge. Write patterns,
                code examples, and best practices.
              </p>
              <p className="text-[var(--fg-40)]">
                Claude reads skills from <code className="px-1.5 py-0.5 bg-[var(--fg-06)] rounded text-[12px] font-mono">.claude/skills/</code> and
                uses them when relevant to your questions.
              </p>
            </div>

            <a
              href="https://docs.anthropic.com/en/docs/claude-code"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-4 text-[13px] text-[var(--fg-40)] hover:text-[var(--fg-60)] transition-colors"
            >
              Read the documentation
              <ExternalLink size={12} />
            </a>
          </section>

          {/* Footer */}
          <footer className="pt-8 border-t border-[var(--fg-06)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5 text-[12px] text-[var(--fg-30)]">
                <Link href="/" className="hover:text-[var(--fg-50)] transition-colors">
                  Gallery
                </Link>
                <Link href="/resources" className="hover:text-[var(--fg-50)] transition-colors">
                  Resources
                </Link>
              </div>
              <span className="text-[11px] text-[var(--fg-20)]">
                Free & open source
              </span>
            </div>
          </footer>
        </article>
      </main>

      <style jsx>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
