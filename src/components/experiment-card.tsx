import { cn } from "@/lib/cn";
import type { Experiment } from "@/lib/experiments";

interface ExperimentCardProps {
  experiment: Experiment;
}

export function ExperimentCard({ experiment }: ExperimentCardProps) {
  return (
    <a
      href={experiment.href}
      className={cn(
        "group block py-4 -mx-3 px-3 rounded-lg",
        "hover:bg-white/[0.03]",
        "transition-colors duration-150"
      )}
    >
      <div className="flex items-baseline justify-between gap-4">
        <div className="flex items-baseline gap-3 min-w-0">
          <span className="font-mono text-[11px] text-white/25 tabular-nums">
            {experiment.number}
          </span>
          <h3 className="text-[15px] text-white/80 group-hover:text-white transition-colors truncate">
            {experiment.title}
          </h3>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {experiment.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="font-mono text-[10px] text-white/25"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      <p className="text-[13px] text-white/40 mt-1 ml-[38px] leading-relaxed">
        {experiment.description}
      </p>
    </a>
  );
}
