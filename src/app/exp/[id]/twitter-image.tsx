import { ImageResponse } from "next/og";
import { experiments } from "@/lib/experiments";
import { ogImageSize, ogColors, formatExperimentNumber } from "@/lib/og-utils";

export const runtime = "edge";
export const alt = "Experiment Preview";
export const size = ogImageSize;
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const experiment = experiments.find((e) => e.number === Number(id));

  if (!experiment) {
    // Fallback for unknown experiments
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            backgroundColor: ogColors.background,
          }}
        >
          <span
            style={{
              fontSize: "48px",
              color: ogColors.fg50,
            }}
          >
            Experiment Not Found
          </span>
        </div>
      ),
      { ...size }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          backgroundColor: ogColors.background,
          position: "relative",
        }}
      >
        {/* Left section - Experiment number */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "40%",
            height: "100%",
            backgroundColor: ogColors.muted,
            borderRight: `1px solid ${ogColors.fg10}`,
          }}
        >
          <span
            style={{
              fontSize: "200px",
              fontWeight: 800,
              color: ogColors.accent,
              letterSpacing: "-0.06em",
              lineHeight: 1,
            }}
          >
            {formatExperimentNumber(experiment.number)}
          </span>
          <span
            style={{
              fontSize: "18px",
              fontWeight: 500,
              color: ogColors.fg30,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginTop: "16px",
            }}
          >
            Experiment
          </span>
        </div>

        {/* Right section - Details */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: "60%",
            height: "100%",
            padding: "60px",
          }}
        >
          {/* Title */}
          <span
            style={{
              fontSize: "64px",
              fontWeight: 700,
              color: ogColors.foreground,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              marginBottom: "24px",
            }}
          >
            {experiment.title}
          </span>

          {/* Description */}
          <span
            style={{
              fontSize: "24px",
              color: ogColors.fg50,
              lineHeight: 1.5,
              marginBottom: "40px",
              maxWidth: "500px",
            }}
          >
            {experiment.description}
          </span>

          {/* Tags */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            {experiment.tags.map((tag) => (
              <div
                key={tag}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px 18px",
                  backgroundColor: ogColors.fg10,
                  borderRadius: "6px",
                  fontSize: "18px",
                  color: ogColors.fg70,
                }}
              >
                {tag}
              </div>
            ))}
          </div>

          {/* Year badge */}
          <div
            style={{
              display: "flex",
              position: "absolute",
              bottom: "60px",
              right: "60px",
            }}
          >
            <span
              style={{
                fontSize: "14px",
                color: ogColors.fg30,
                letterSpacing: "0.1em",
              }}
            >
              {experiment.year}
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}

