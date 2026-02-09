import { experiments } from "@/lib/experiments";
import { siteConfig, formatExperimentNumber } from "@/lib/og-utils";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const experiment = experiments.find((e) => e.number === Number(id));

  if (!experiment) {
    return {
      title: "Experiment Not Found",
    };
  }

  const title = `${experiment.title} | Experiment ${formatExperimentNumber(experiment.number)}`;
  const url = `${siteConfig.url}/exp/${experiment.number}`;

  return {
    title,
    description: experiment.description,
    keywords: [...experiment.tags, "experiment", "creative coding", "WebGL"],
    openGraph: {
      title,
      description: experiment.description,
      type: "article",
      url,
      siteName: siteConfig.name,
      tags: experiment.tags,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: experiment.description,
    },
    alternates: {
      canonical: url,
    },
  };
}

// Generate static params for all experiments
export async function generateStaticParams() {
  return experiments.map((exp) => ({
    id: String(exp.number),
  }));
}

export default function ExperimentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
