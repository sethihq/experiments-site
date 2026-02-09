"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, Mail, Sparkles, MousePointer, Play, PanelLeft, GalleryVertical, Frame, Pointer, Grab, Code } from "lucide-react";
import { useState } from "react";
import type { Experiment } from "@/lib/experiments";
import {
  DocsHeading,
  DocsParagraph,
  DocsListItem,
  DependencyBadge,
  InteractionTable,
  PropsTable,
  CodeBlock,
  Breadcrumb,
  FadeGradient,
  NavLink,
  ContactButton,
  SourceCodeButton,
  ExternalLinkText,
  SidebarToggleIcon,
} from "@/components/docs";

// Framer Motion icon SVG
function FramerMotionIcon() {
  return (
    <svg className="h-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1103 386">
      <path fill="#FFF312" d="M416.473 0 198.54 385.66H0L170.17 84.522C196.549 37.842 262.377 0 317.203 0Zm486.875 96.415c0-53.249 44.444-96.415 99.27-96.415 54.826 0 99.27 43.166 99.27 96.415 0 53.248-44.444 96.415-99.27 96.415-54.826 0-99.27-43.167-99.27-96.415ZM453.699 0h198.54L434.306 385.66h-198.54Zm234.492 0h198.542L716.56 301.138c-26.378 46.68-92.207 84.522-147.032 84.522h-99.27Z"></path>
    </svg>
  );
}

// NPM icon SVG
function NpmIcon() {
  return (
    <svg className="size-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
      <path fill="#C12127" d="M0 256V0h256v256z"></path>
      <path fill="#FFF" d="M48 48h160v160h-32V80h-48v128H48z"></path>
    </svg>
  );
}

interface ExperimentInfoProps {
  experiment: Experiment;
  prevExperiment: Experiment | null;
  nextExperiment: Experiment | null;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export function ExperimentInfo({ experiment, prevExperiment, nextExperiment, onToggleSidebar, isSidebarOpen }: ExperimentInfoProps) {
  const [showSourceCode, setShowSourceCode] = useState(false);

  const importCode = `import { Experiment${experiment.number.toString().padStart(3, "0")} } from "@/experiments/exp-${experiment.number.toString().padStart(3, "0")}";`;

  const usageCode = `const Demo = () => {
  return (
    <div className="h-screen w-full">
      <Experiment${experiment.number.toString().padStart(3, "0")} />
    </div>
  );
};`;

  // Interaction types based on experiment tags
  const interactionRows = [
    { icon: <GalleryVertical size={20} />, description: "Interactive canvas visualization" },
    { icon: <Frame size={20} />, description: "Responsive to viewport changes" },
    { icon: <Pointer size={20} />, description: "Try hovering and clicking" },
    { icon: <Grab size={20} />, description: "Try dragging to interact" },
  ];

  // Props - can be customized per experiment
  const propsData = [
    { name: "className", description: "Optional CSS classes to apply to the container" },
    { name: "style", description: "Optional inline styles for customization" },
  ];

  return (
    <div className="relative h-full w-full lg:overflow-x-hidden lg:overflow-y-scroll" data-lenis-prevent="true">
      {/* Fade gradients - Skiper UI pattern */}
      <div className="sticky top-0 z-10 w-full">
        <FadeGradient side="top" height="h-32" />
      </div>

      {/* Sticky header with breadcrumb */}
      <header className="sticky top-0 z-10 pt-10 lg:pl-8">
        <div className="relative z-10 flex items-center gap-2">
          {/* Sidebar Toggle Button - Animated Skiper UI style */}
          {onToggleSidebar && (
            <div className="mr-2" onClick={(e) => e.stopPropagation()}>
              <SidebarToggleIcon
                isOpen={isSidebarOpen || false}
                onClick={onToggleSidebar}
              />
            </div>
          )}
          <Breadcrumb
            items={[
              { label: "Experiments", href: "/" },
              { label: experiment.isNew ? "New" : "Explore", href: "/" },
              { label: experiment.title },
            ]}
          />
        </div>
      </header>

      {/* Main content */}
      <div className="my-[9vh] lg:p-5 lg:pl-8">
        {/* Title */}
        <DocsHeading>{experiment.title}</DocsHeading>

        {/* Description */}
        <DocsParagraph>
          {experiment.description}
        </DocsParagraph>

        {/* Dependencies */}
        <DocsHeading>
          Dependencies
        </DocsHeading>
        <div className="flex flex-wrap items-center gap-2">
          {experiment.tags.includes("WebGL") && (
            <DependencyBadge
              name="three.js"
              href="https://threejs.org/"
            />
          )}
          {experiment.tags.includes("Three.js") && (
            <DependencyBadge
              name="@react-three/fiber"
              href="https://docs.pmnd.rs/react-three-fiber"
            />
          )}
          <DependencyBadge
            name="framer-motion"
            href="https://motion.dev/"
            icon={<FramerMotionIcon />}
          />
          <DependencyBadge
            name="react"
            href="https://react.dev/"
          />
        </div>

        {/* Interaction Type */}
        <DocsHeading>Interaction Type</DocsHeading>
        <InteractionTable rows={interactionRows} />

        {/* How to use */}
        <DocsHeading>How to use</DocsHeading>
        <CodeBlock code={importCode} language="tsx" />
        <div className="mt-4" />
        <CodeBlock code={usageCode} language="tsx" />

        {/* Props */}
        <PropsTable props={propsData} />

        {/* Attribution */}
        <DocsHeading>Attribution</DocsHeading>
        <DocsParagraph>
          Inspired by creative coding explorations and shader experiments.
          Check out{" "}
          <ExternalLinkText href="https://www.shadertoy.com/">
            Shadertoy
          </ExternalLinkText>
          {" "}for more inspiration.
        </DocsParagraph>

        {/* Source code */}
        <DocsHeading>Source code</DocsHeading>
        <SourceCodeButton onClick={() => setShowSourceCode(true)} />

        {/* Keep in mind */}
        <DocsHeading>Keep in mind</DocsHeading>
        <DocsParagraph>
          Most experiments here are explorations of creative coding techniques.
          Feel free to use and modify them in your projects. Performance may vary
          based on device capabilities.
        </DocsParagraph>

        {/* Contact */}
        <DocsHeading>Contact</DocsHeading>
        <ContactButton email="hello@example.com" />

        {/* License & Usage */}
        <DocsHeading>License & Usage</DocsHeading>
        <ul className="space-y-1">
          <DocsListItem>Free to use and modify in both personal and commercial projects.</DocsListItem>
          <DocsListItem>Attribution appreciated but not required.</DocsListItem>
          <DocsListItem>No warranty provided - use at your own risk.</DocsListItem>
        </ul>

        {/* Prev/Next Navigation */}
        <div className="relative z-10 mt-[15vh] mb-[5vh] flex flex-col">
          <hr className="border-[var(--fg-10)] mb-10" />
          <div className="flex justify-between">
            {prevExperiment ? (
              <NavLink
                direction="prev"
                href={prevExperiment.href}
                label="Previous"
                description={prevExperiment.title}
              />
            ) : (
              <div />
            )}
            {nextExperiment ? (
              <NavLink
                direction="next"
                href={nextExperiment.href}
                label="Next"
                description={nextExperiment.title}
              />
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>

      {/* Bottom fade gradient */}
      <div className="sticky bottom-0 z-10 w-full pointer-events-none">
        <FadeGradient side="bottom" height="h-32" />
      </div>
    </div>
  );
}
