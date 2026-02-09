"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { experiments } from "@/lib/experiments";
import { getExperimentComponent } from "@/lib/experiment-components";
import { Maximize, CircleArrowOutUpRight, Code, Grid3X3, Menu, X, Info, Command, ChevronDown } from "lucide-react";
import { SidebarIcon } from "@/components/icons";
import { ExperimentInfo } from "@/components/experiment-info";
import { SidebarToggleIcon } from "@/components/docs";
import { useEffect, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings, useHydrated } from "@/components/settings-panel";

// Tooltip component - skiper-ui style
function Tooltip({ children, label, position = "bottom" }: { children: React.ReactNode; label: string; position?: "bottom" | "bottom-right" | "left" }) {
  const positionClasses = {
    bottom: "top-full left-1/2 -translate-x-1/2 mt-3",
    "bottom-right": "top-full right-0 mt-3",
    left: "right-full top-1/2 -translate-y-1/2 mr-3",
  };

  return (
    <div className="relative group/tooltip">
      {children}
      <div className={`absolute ${positionClasses[position]} px-4 py-2 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-sm text-[var(--fg-80)] whitespace-nowrap opacity-0 scale-95 group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 transition-all duration-200 pointer-events-none z-50 shadow-lg`}>
        {label}
      </div>
    </div>
  );
}

// Toolbar button - skiper-ui style (size-8 = 32px, rounded-[16px])
function ToolbarButton({
  children,
  onClick,
  href,
  badge,
  className = ""
}: {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  badge?: React.ReactNode;
  className?: string;
}) {
  const buttonClass = `
    relative flex items-center justify-center
    w-8 h-8 rounded-[16px] bg-[var(--muted3)]
    text-[var(--fg-50)] hover:text-[var(--fg-80)]
    transition-all duration-200 active:scale-95
    ${className}
  `;

  const content = (
    <>
      {children}
      {badge && (
        <span className="absolute -right-1 -top-1.5 flex items-center justify-center w-4 h-4 rounded-full bg-[var(--accent-muted)] text-[var(--accent)]">
          {badge}
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <a href={href} target="_blank" className={buttonClass}>
        {content}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={buttonClass}>
      {content}
    </button>
  );
}

export default function ExperimentPage() {
  const params = useParams();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(true);
  const [hoveredExp, setHoveredExp] = useState<typeof experiments[0] | null>(null);
  const [hoverPosition, setHoverPosition] = useState({ top: 0 });
  const { sidebarOpen, toggleSidebar, showLabels } = useSettings();
  const hydrated = useHydrated();
  const currentId = Number(params.id);

  // Use default values until hydrated to prevent SSR mismatch
  const isSidebarOpen = hydrated ? sidebarOpen : true;
  const areLabelsVisible = hydrated ? showLabels : true;
  const currentIndex = experiments.findIndex((e) => e.number === currentId);
  const currentExperiment = experiments[currentIndex];
  const prevExperiment = currentIndex > 0 ? experiments[currentIndex - 1] : null;
  const nextExperiment = currentIndex < experiments.length - 1 ? experiments[currentIndex + 1] : null;

  const goToPrev = useCallback(() => {
    if (prevExperiment) router.push(prevExperiment.href);
  }, [prevExperiment, router]);

  const goToNext = useCallback(() => {
    if (nextExperiment) router.push(nextExperiment.href);
  }, [nextExperiment, router]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentId]);

  // Arrow key navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goToNext();
      } else if (e.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      } else if (e.key === "\\" || e.key === "s") {
        // Toggle sidebar with \ or S key
        toggleSidebar();
      } else if (e.key === "i") {
        // Toggle info panel with I key
        setShowInfoPanel((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToPrev, goToNext, isMobileMenuOpen, toggleSidebar]);

  if (!currentExperiment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--fg-50)]">Experiment not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed left-4 top-4 z-40 lg:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-[var(--fg-50)] hover:text-[var(--fg-80)] transition-colors"
      >
        {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
      </button>


      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 z-40 h-[100dvh] w-[280px] p-4 lg:hidden"
          >
            <div className="relative flex h-full w-full overflow-y-auto overflow-x-clip rounded-3xl bg-[var(--muted)] pl-3 text-[15px] tracking-tight">
              <nav className="relative flex h-fit flex-col gap-1 pb-8 pt-16 w-full pr-3">
                <Link
                  href="/"
                  className="flex items-center gap-3 py-3 px-2 rounded-lg text-[var(--fg-50)] hover:text-[var(--fg-80)] hover:bg-[var(--fg-02)] transition-all mb-4"
                >
                  <Grid3X3 size={16} />
                  <span>Back to Gallery</span>
                </Link>
                <div className="h-px bg-[var(--fg-10)] mb-4" />
                {experiments.map((exp) => {
                  const isActive = exp.number === currentId;
                  return (
                    <Link
                      key={exp.id}
                      href={exp.href}
                      className="group relative flex cursor-pointer items-center gap-3 py-3 px-2 rounded-lg transition-all duration-200 hover:bg-[var(--fg-02)]"
                    >
                      <span
                        className={`inline-block h-[1px] transition-all duration-300 ${
                          isActive ? "w-6 bg-[var(--accent)]" : "w-4 bg-[var(--fg-10)] group-hover:w-6 group-hover:bg-[var(--accent)]/70"
                        }`}
                      />
                      <span
                        className={`whitespace-nowrap transition-all duration-200 text-sm ${
                          isActive ? "text-[var(--accent)] opacity-100" : "opacity-35 group-hover:text-[var(--accent)] group-hover:opacity-90"
                        }`}
                      >
                        <span className="font-mono text-xs opacity-60 mr-1.5">{exp.number.toString().padStart(2, "0")}</span>
                        {exp.title}
                      </span>
                      {exp.isNew && (
                        <span className="text-[10px] text-[var(--accent)] ml-auto px-1.5 py-0.5 rounded-full bg-[var(--accent-muted)]">New</span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isSidebarOpen ? 0 : -340,
          opacity: isSidebarOpen ? 1 : 0,
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed left-2 z-20 h-[100dvh] w-[320px] p-4 pl-2 pr-2 hidden lg:block"
      >
        <div className="relative flex flex-col h-full w-full overflow-y-auto overflow-x-clip rounded-3xl bg-[var(--muted)] text-[15px] tracking-tight">
          {/* Fade gradients */}
          <div className="sidebar-fade-top absolute left-0 top-0 right-0 h-40 pointer-events-none z-20 rounded-t-3xl" />
          <div className="sidebar-fade-bottom absolute left-0 bottom-0 right-0 h-40 pointer-events-none z-20 rounded-b-3xl" />

          {/* Sidebar Header with Toggle Icon */}
          <div className="sticky top-0 z-30 pt-6 pl-4 pb-4">
            <SidebarToggleIcon
              isOpen={isSidebarOpen}
              onClick={toggleSidebar}
              size={36}
            />
          </div>

          {/* Sort Dropdown - Skiper UI style */}
          <div className="px-4 pt-16">
            <button className="flex items-center gap-2 text-sm text-[var(--fg-50)] hover:text-[var(--fg-70)] transition-colors">
              Sorted by Id
              <ChevronDown size={14} />
            </button>
          </div>

          {/* All Experiments Header */}
          <div className="flex items-center gap-3 px-4 pt-8 pb-4">
            <span className="inline-block w-12 h-[1px] bg-[var(--fg-30)]" />
            <span className="text-sm text-[var(--fg-80)] font-medium">All Experiments</span>
          </div>

          {/* Experiments List */}
          <nav className="relative flex h-fit flex-col gap-0.5 pb-[15vh] px-2 w-full">
            {experiments.map((exp) => {
              const isActive = exp.number === currentId;
              return (
                <Link
                  key={exp.id}
                  href={exp.href}
                  className="group relative flex cursor-pointer items-center gap-3 py-2.5 px-2 rounded-lg transition-all duration-200 hover:bg-[var(--fg-02)]"
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredExp(exp);
                    setHoverPosition({ top: rect.top });
                  }}
                  onMouseLeave={() => setHoveredExp(null)}
                >
                  {/* Line indicator */}
                  <span
                    className={`inline-block h-[1px] transition-all duration-300 ${
                      isActive
                        ? "w-10 bg-[var(--accent)]"
                        : "w-6 bg-[var(--fg-10)] group-hover:w-10 group-hover:bg-[var(--accent)]/70"
                    }`}
                  />

                  {/* Title */}
                  {areLabelsVisible && (
                    <span
                      className={`whitespace-nowrap transition-all duration-200 text-sm ${
                        isActive
                          ? "text-[var(--accent)] opacity-100"
                          : "opacity-40 group-hover:text-[var(--accent)] group-hover:opacity-90"
                      }`}
                    >
                      <span className={`font-mono text-xs mr-2 ${isActive ? "opacity-100" : "opacity-60"}`}>
                        {exp.number.toString().padStart(2, "0")}
                      </span>
                      {exp.title}
                    </span>
                  )}

                  {/* New badge */}
                  {exp.isNew && areLabelsVisible && (
                    <span className="text-[10px] text-[var(--accent)] ml-auto px-1.5 py-0.5 rounded-full bg-[var(--accent-muted)]">New</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Hover Preview Card */}
          <AnimatePresence>
            {hoveredExp && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                className="fixed left-[340px] z-30 w-[240px] aspect-video rounded-xl overflow-hidden shadow-2xl pointer-events-none border border-[var(--fg-10)]"
                style={{ top: Math.min(Math.max(hoverPosition.top - 40, 20), window.innerHeight - 180) }}
              >
                {/* Preview - render actual experiment or colored bg */}
                <div
                  className="w-full h-full flex items-center justify-center relative"
                  style={{ backgroundColor: hoveredExp.previewColor || "#0a0a0a" }}
                >
                  {/* Number watermark */}
                  <span className="text-6xl font-mono font-bold text-white/[0.03] select-none">
                    {hoveredExp.number.toString().padStart(2, "0")}
                  </span>
                  {/* Title overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                    <p className="text-xs text-white/80 font-medium">{hoveredExp.title}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      {/* Info Panel - Fixed position, sidebar overlays it */}
      <motion.aside
        initial={false}
        animate={{
          x: showInfoPanel ? 0 : -420,
          opacity: showInfoPanel ? 1 : 0,
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 z-10 h-[100dvh] w-[420px] border-r border-[var(--border)] bg-[var(--background)] hidden lg:block"
        onClick={() => {
          // Close sidebar when clicking info panel
          if (isSidebarOpen) {
            toggleSidebar();
          }
        }}
      >
        <ExperimentInfo
          experiment={currentExperiment}
          prevExperiment={prevExperiment}
          nextExperiment={nextExperiment}
          onToggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />
      </motion.aside>

      {/* Main Content - Preview Area */}
      <motion.main
        initial={false}
        animate={{
          marginLeft: showInfoPanel ? 420 : 0
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="min-h-screen flex flex-col lg:ml-0"
        onClick={() => {
          // Close sidebar when clicking main content
          if (isSidebarOpen) {
            toggleSidebar();
          }
        }}
      >
          {/* Top Bar - skiper-ui style */}
          <header className="fixed top-6 right-6 z-[99] flex items-center gap-1.5 bg-[var(--muted)] rounded-2xl p-1.5 border border-[var(--border)]">
            <Tooltip label="Maximize View">
              <ToolbarButton>
                <Maximize size={16} />
              </ToolbarButton>
            </Tooltip>
            <Tooltip label="Full Page Preview">
              <ToolbarButton href={`/preview/${currentExperiment.number}`}>
                <CircleArrowOutUpRight size={16} />
              </ToolbarButton>
            </Tooltip>
            <Tooltip label="View Source" position="bottom-right">
              <ToolbarButton href={`https://github.com/your-repo/experiments-site/blob/main/src/experiments/exp-${currentExperiment.number.toString().padStart(3, "0")}.tsx`}>
                <Code size={16} />
              </ToolbarButton>
            </Tooltip>
            <Tooltip label="Command + K" position="bottom-right">
              <ToolbarButton
                onClick={() => {
                  const event = new KeyboardEvent("keydown", {
                    key: "k",
                    metaKey: true,
                    bubbles: true,
                  });
                  document.dispatchEvent(event);
                }}
              >
                <Command size={16} />
              </ToolbarButton>
            </Tooltip>
          </header>


          {/* Canvas Area */}
          <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
            {(() => {
              const ExperimentComponent = getExperimentComponent(currentExperiment.number);
              if (ExperimentComponent) {
                return (
                  <div
                    className="w-full max-w-5xl aspect-video rounded-2xl overflow-hidden border border-[var(--border)] relative"
                    style={{ backgroundColor: currentExperiment.previewColor || "var(--muted)" }}
                  >
                    <ExperimentComponent />
                  </div>
                );
              }
              return (
                <div
                  className="w-full max-w-5xl aspect-video rounded-2xl flex items-center justify-center border border-[var(--border)]"
                  style={{ backgroundColor: currentExperiment.previewColor || "var(--muted)" }}
                >
                  <div className="text-center">
                    <div className="text-[var(--fg-03)] font-mono text-9xl font-bold mb-6 select-none">
                      {currentExperiment.number.toString().padStart(2, "0")}
                    </div>
                    <h1 className="text-2xl text-[var(--fg-60)] mb-3">{currentExperiment.title}</h1>
                    <p className="text-sm text-[var(--fg-30)] max-w-md mx-auto">
                      {currentExperiment.description}
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-6">
                      {currentExperiment.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs text-[var(--fg-20)] px-3 py-1.5 rounded-lg bg-[var(--fg-03)] border border-[var(--border)]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

      </motion.main>

    </div>
  );
}
