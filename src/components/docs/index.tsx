"use client";

import { Copy, ChevronRight, Mail, Code, ExternalLink, Check } from "lucide-react";
import { useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// Animated sidebar toggle icon - Skiper UI style
interface SidebarToggleIconProps {
  isOpen: boolean;
  onClick?: () => void;
  size?: number;
}

export function SidebarToggleIcon({ isOpen, onClick, size = 32 }: SidebarToggleIconProps) {
  return (
    <span
      className="z-21 fc bg-[var(--background)] rounded-xl cursor-pointer"
      style={{ width: size, height: size }}
    >
      <button type="button" onClick={onClick} className="w-full h-full">
        <div className="text-[var(--fg-50)] hover:text-[var(--fg-80)] flex size-full cursor-pointer items-center justify-center transition-colors">
          <div className="relative grid cursor-pointer items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M0.32698 2.63803C0 3.27976 0 4.11984 0 5.8V10.2C0 11.8802 0 12.7202 0.32698 13.362C0.614601 13.9265 1.07354 14.3854 1.63803 14.673C2.27976 15 3.11984 15 4.8 15H11.2C12.8802 15 13.7202 15 14.362 14.673C14.9265 14.3854 15.3854 13.9265 15.673 13.362C16 12.7202 16 11.8802 16 10.2V5.8C16 4.11984 16 3.27976 15.673 2.63803C15.3854 2.07354 14.9265 1.6146 14.362 1.32698C13.7202 1 12.8802 1 11.2 1H4.8C3.11984 1 2.27976 1 1.63803 1.32698C1.07354 1.6146 0.614601 2.07354 0.32698 2.63803Z"
                fill="currentColor"
              />
            </svg>
            <motion.div
              className="bg-[var(--background)] absolute left-[3px] h-[10px] rounded-[1px]"
              initial={false}
              animate={{
                width: isOpen ? 4.5 : 1.5,
              }}
              transition={{
                duration: 0.2,
                ease: [0.23, 1, 0.32, 1],
              }}
            />
          </div>
        </div>
        <span className="sr-only">Toggle Sidebar</span>
      </button>
    </span>
  );
}

// Docs heading - matches Skiper UI .docs-h3 style
export function DocsHeading({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-sm font-medium tracking-tight text-[var(--foreground)] mt-[9vh] mb-4 first:mt-0">
      {children}
    </h3>
  );
}

// Docs paragraph - matches Skiper UI .docs-p style
export function DocsParagraph({ children }: { children: ReactNode }) {
  return (
    <p className="text-sm text-[var(--fg-50)] leading-relaxed">
      {children}
    </p>
  );
}

// Docs list item - matches Skiper UI .docs-li style
export function DocsListItem({ children }: { children: ReactNode }) {
  return (
    <li className="text-sm text-[var(--fg-50)] leading-relaxed list-disc ml-4">
      {children}
    </li>
  );
}

// Dependency badge with icon and link - Skiper UI style
interface DependencyBadgeProps {
  name: string;
  href?: string;
  icon?: ReactNode;
}

export function DependencyBadge({ name, href, icon }: DependencyBadgeProps) {
  const content = (
    <span className="inline-flex items-center gap-2 px-3 h-8 rounded-xl bg-[var(--muted)] hover:bg-[var(--muted3)] text-xs text-[var(--fg-70)] transition-all duration-300 cursor-pointer">
      {name}
      {icon}
    </span>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return content;
}

// Interaction type table row
interface InteractionRowProps {
  icon: ReactNode;
  description: string;
}

export function InteractionRow({ icon, description }: InteractionRowProps) {
  return (
    <tr className="h-14 border-t border-[var(--fg-10)] last:border-b tracking-tight">
      <td className="w-1/4">
        <span className="text-[var(--fg-50)]">{icon}</span>
      </td>
      <td className="text-sm text-[var(--fg-70)]">{description}</td>
    </tr>
  );
}

// Interaction type table
interface InteractionTableProps {
  rows: { icon: ReactNode; description: string }[];
}

export function InteractionTable({ rows }: InteractionTableProps) {
  return (
    <table className="w-full">
      <tbody>
        {rows.map((row, index) => (
          <InteractionRow key={index} icon={row.icon} description={row.description} />
        ))}
      </tbody>
    </table>
  );
}

// Props table
interface PropsTableProps {
  props: { name: string; description: string }[];
}

export function PropsTable({ props }: PropsTableProps) {
  return (
    <table className="w-full mb-4 mt-[15vh]">
      <thead className="w-full text-left">
        <tr className="h-14">
          <th className="text-sm font-normal text-[var(--fg-70)]">Props</th>
          <th className="text-sm font-normal text-[var(--fg-70)]">Description</th>
        </tr>
      </thead>
      <tbody>
        {props.map((prop, index) => (
          <tr key={index} className="h-14 border-t border-[var(--fg-10)] last:border-b tracking-tight">
            <td>
              <span className="inline-block px-2 py-1 rounded-md bg-[var(--muted)] text-xs text-[var(--fg-40)]">
                {prop.name}
              </span>
            </td>
            <td className="text-sm text-[var(--fg-70)]">{prop.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Copy button with morphing animation - exported for use in overlays
export function CopyButton({ text, size = 14 }: { text: string; size?: number }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center justify-center size-full cursor-pointer relative"
      title="Copy to clipboard"
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.div
            key="check"
            initial={{ scale: 0, rotate: -90, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0, rotate: 90, opacity: 0 }}
            transition={{
              type: "spring",
              damping: 15,
              stiffness: 400,
              duration: 0.2
            }}
          >
            <Check size={size} className="text-emerald-400" />
          </motion.div>
        ) : (
          <motion.div
            key="copy"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              type: "spring",
              damping: 15,
              stiffness: 400,
              duration: 0.2
            }}
          >
            <Copy size={size} className="text-[var(--fg-40)] group-hover:text-[var(--fg-60)] transition-colors" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}

// Code block - Skiper UI style with syntax highlighting placeholder
interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = "tsx" }: CodeBlockProps) {
  return (
    <div className="docs-code-wrapper relative rounded-xl bg-[var(--background)] border border-[var(--border)] overflow-hidden">
      <pre className="text-sm p-4 overflow-x-auto" tabIndex={0}>
        <code className="language-tsx text-[var(--fg-70)] font-mono whitespace-pre">
          {code}
        </code>
      </pre>
      <div className="docs-copy-button absolute top-3 right-3">
        <span className="flex size-8 cursor-pointer items-center justify-center rounded-lg hover:bg-[var(--fg-06)] transition-colors">
          <CopyButton text={code} />
        </span>
      </div>
    </div>
  );
}

// Icon button - Skiper UI style (size-8 = 32px, rounded-[16px])
interface IconButtonProps {
  icon: ReactNode;
  onClick?: () => void;
  href?: string;
  label?: string;
}

export function IconButton({ icon, onClick, href, label }: IconButtonProps) {
  const className = "flex items-center justify-center size-8 rounded-[16px] bg-[var(--muted3)] text-[var(--fg-50)] hover:text-[var(--fg-80)] transition-all duration-200";

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} title={label}>
        {icon}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={className} title={label}>
      {icon}
    </button>
  );
}

// Source code button
export function SourceCodeButton({ onClick }: { onClick?: () => void }) {
  return (
    <div className="flex items-center gap-2 text-sm text-[var(--fg-50)]">
      Click on the top right
      <div className="relative size-8 rounded-[16px] bg-[var(--muted3)] flex items-center justify-center">
        <button onClick={onClick} className="flex size-full items-center justify-center">
          <Code size={16} className="text-[var(--fg-50)]" />
        </button>
      </div>
      to view the source code
    </div>
  );
}

// Breadcrumb navigation - Skiper UI style
interface BreadcrumbProps {
  items: { label: string; href?: string }[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <div className="flex items-center gap-2 text-sm font-medium capitalize tracking-tighter">
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-2">
          {index > 0 && <span className="size-[3px] rounded-full bg-[var(--fg-50)]" />}
          {item.href ? (
            <Link href={item.href} className="text-[var(--fg-50)] hover:text-[var(--foreground)] transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-[var(--fg-50)]">{item.label}</span>
          )}
        </span>
      ))}
    </div>
  );
}

// Fade gradient - Skiper UI pattern
interface FadeGradientProps {
  side: "top" | "bottom";
  height?: string;
}

export function FadeGradient({ side, height = "h-30" }: FadeGradientProps) {
  const style = side === "top"
    ? { background: "linear-gradient(to bottom, var(--background) 0%, var(--background) 25%, transparent 100%)" }
    : { background: "linear-gradient(to top, var(--background) 0%, var(--background) 25%, transparent 100%)" };

  return (
    <div
      aria-hidden="true"
      className={`absolute ${side === "top" ? "top-0" : "bottom-0"} w-full ${height} pointer-events-none`}
      style={style}
    />
  );
}

// Next/Previous navigation - Skiper UI style
interface NavLinkProps {
  direction: "prev" | "next";
  href: string;
  label: string;
  description?: string;
}

export function NavLink({ direction, href, label, description }: NavLinkProps) {
  return (
    <Link href={href} className={`flex flex-col ${direction === "next" ? "items-end" : "items-start"}`}>
      <span className="group flex items-center gap-2 text-xs font-medium uppercase tracking-tight text-[var(--fg-50)] hover:text-[var(--fg-30)] mb-2">
        {direction === "next" && label}
        <ChevronRight size={16} className={`transition-all group-hover:translate-x-px ${direction === "prev" ? "rotate-180" : ""}`} />
        {direction === "prev" && label}
      </span>
      {description && (
        <p className="hidden text-base tracking-tight text-[var(--fg-70)] xl:block">
          {description}
        </p>
      )}
    </Link>
  );
}

// Contact button
export function ContactButton({ email }: { email: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--fg-50)]">
      Additionally, if you find any bug or issue, feel free to
      <div className="relative size-8 rounded-[16px] bg-[var(--muted3)] flex items-center justify-center">
        <a href={`mailto:${email}`} className="flex size-full items-center justify-center cursor-pointer">
          <Mail size={16} className="text-[var(--fg-50)]" />
        </a>
      </div>
      Drop a dm.
    </div>
  );
}

// External link with icon
export function ExternalLinkText({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-[var(--fg-50)] hover:text-[var(--foreground)] underline-offset-2 hover:underline transition-colors"
    >
      {children}
      <ExternalLink size={12} />
    </a>
  );
}
