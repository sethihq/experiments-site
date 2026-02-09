"use client";

import { useEffect, useState, useCallback } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { experiments } from "@/lib/experiments";
import { Search, ArrowRight, CornerDownLeft, Sparkles, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  // Toggle the menu when Cmd+K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  // Filter experiments based on search
  const filteredExperiments = experiments.filter((exp) =>
    exp.title.toLowerCase().includes(search.toLowerCase()) ||
    exp.description.toLowerCase().includes(search.toLowerCase()) ||
    exp.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Command Menu - Centered */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", damping: 25, stiffness: 400 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-[560px] pointer-events-auto">
            <Command
              className="rounded-2xl border border-[var(--fg-10)] bg-[var(--muted)] shadow-2xl overflow-hidden"
              loop
            >
              {/* Search Input */}
              <div className="flex items-center gap-3 border-b border-[var(--fg-10)] px-5 py-4">
                <Search size={18} className="text-[var(--fg-30)]" />
                <Command.Input
                  value={search}
                  onValueChange={setSearch}
                  placeholder="Search Anything"
                  className="flex-1 bg-transparent text-[var(--foreground)] placeholder:text-[var(--fg-30)] outline-none text-base"
                  autoFocus
                />
              </div>

              {/* Results */}
              <Command.List className="max-h-[360px] overflow-y-auto py-3 px-3">
                <Command.Empty className="py-12 text-center text-[var(--fg-40)] text-sm">
                  No results found.
                </Command.Empty>

                {/* Pages Group */}
                <Command.Group className="mb-3">
                  <div className="px-2 py-2 text-xs text-[var(--fg-30)]">Pages</div>
                  <Command.Item
                    value="home gallery"
                    onSelect={() => runCommand(() => router.push("/"))}
                    className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--fg-70)] cursor-pointer data-[selected=true]:bg-[var(--fg-06)] data-[selected=true]:text-[var(--foreground)]"
                  >
                    <ArrowRight size={14} className="text-[var(--fg-30)] group-data-[selected=true]:text-[var(--fg-50)]" />
                    <span>Home</span>
                  </Command.Item>
                  <Command.Item
                    value="skills claude"
                    onSelect={() => runCommand(() => router.push("/skills"))}
                    className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--fg-70)] cursor-pointer data-[selected=true]:bg-[var(--fg-06)] data-[selected=true]:text-[var(--foreground)]"
                  >
                    <ArrowRight size={14} className="text-[var(--fg-30)] group-data-[selected=true]:text-[var(--fg-50)]" />
                    <span>Skills</span>
                  </Command.Item>
                  <Command.Item
                    value="resources links"
                    onSelect={() => runCommand(() => router.push("/resources"))}
                    className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--fg-70)] cursor-pointer data-[selected=true]:bg-[var(--fg-06)] data-[selected=true]:text-[var(--foreground)]"
                  >
                    <ArrowRight size={14} className="text-[var(--fg-30)] group-data-[selected=true]:text-[var(--fg-50)]" />
                    <span>Resources</span>
                  </Command.Item>
                  <Command.Item
                    value="shader skill glsl webgl"
                    onSelect={() => runCommand(() => router.push("/shader"))}
                    className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--fg-70)] cursor-pointer data-[selected=true]:bg-[var(--fg-06)] data-[selected=true]:text-[var(--foreground)]"
                  >
                    <ArrowRight size={14} className="text-[var(--fg-30)] group-data-[selected=true]:text-[var(--fg-50)]" />
                    <span>Shader Skill</span>
                  </Command.Item>
                </Command.Group>

                {/* Experiments Group */}
                <Command.Group className="mb-2">
                  <div className="px-2 py-2 text-xs text-[var(--fg-30)]">Experiments</div>
                  {filteredExperiments.map((exp) => (
                    <Command.Item
                      key={exp.id}
                      value={`${exp.title} ${exp.description} ${exp.tags.join(" ")}`}
                      onSelect={() => runCommand(() => router.push(exp.href))}
                      className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--fg-70)] cursor-pointer data-[selected=true]:bg-[var(--fg-06)] data-[selected=true]:text-[var(--foreground)]"
                    >
                      <ArrowRight size={14} className="text-[var(--fg-30)] group-data-[selected=true]:text-[var(--fg-50)]" />
                      <span className="flex-1">{exp.title}</span>
                      {exp.isNew && (
                        <span className="text-[10px] text-[var(--accent)] flex items-center gap-1">
                          New <Sparkles size={10} />
                        </span>
                      )}
                    </Command.Item>
                  ))}
                </Command.Group>
              </Command.List>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-[var(--fg-10)] px-5 py-3 text-xs text-[var(--fg-30)]">
                <div className="flex items-center gap-2">
                  <CornerDownLeft size={12} />
                  <span>Go To Page</span>
                </div>
                <div className="flex items-center gap-2">
                  <ExternalLink size={12} />
                </div>
              </div>
            </Command>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Keyboard hint component to show Cmd+K
export function CommandMenuTrigger() {
  return (
    <button
      onClick={() => {
        const event = new KeyboardEvent("keydown", {
          key: "k",
          metaKey: true,
          bubbles: true,
        });
        document.dispatchEvent(event);
      }}
      className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--fg-03)] border border-[var(--border)] text-[var(--fg-40)] hover:text-[var(--fg-60)] hover:bg-[var(--fg-06)] transition-all text-xs"
    >
      <Search size={12} />
      <span>Search</span>
      <kbd className="ml-2 px-1.5 py-0.5 rounded bg-[var(--fg-10)] text-[10px]">⌘K</kbd>
    </button>
  );
}
