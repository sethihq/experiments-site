import { ImageResponse } from "next/og";
import { experiments } from "@/lib/experiments";
import { ogImageSize, ogColors } from "@/lib/og-utils";

export const runtime = "edge";
export const alt = "Gallery - WebGL and Three.js Experiments";
export const size = ogImageSize;
export const contentType = "image/png";

export default async function Image() {
  const experimentCount = experiments.length;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: ogColors.background,
          padding: "60px",
          position: "relative",
        }}
      >
        {/* Subtle grid pattern */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `linear-gradient(${ogColors.fg10} 1px, transparent 1px), linear-gradient(90deg, ${ogColors.fg10} 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
            opacity: 0.3,
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Top section */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: ogColors.fg50,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Creative Lab
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                backgroundColor: ogColors.fg10,
                borderRadius: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "16px",
                  color: ogColors.fg70,
                }}
              >
                {experimentCount} experiments
              </span>
            </div>
          </div>

          {/* Main title */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              justifyContent: "center",
              marginTop: "-40px",
            }}
          >
            <span
              style={{
                fontSize: "140px",
                fontWeight: 700,
                color: ogColors.foreground,
                letterSpacing: "-0.04em",
                lineHeight: 1,
              }}
            >
              GALLERY
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginTop: "24px",
              }}
            >
              <div
                style={{
                  width: "60px",
                  height: "2px",
                  backgroundColor: ogColors.accent,
                }}
              />
              <span
                style={{
                  fontSize: "28px",
                  color: ogColors.fg50,
                  letterSpacing: "-0.01em",
                }}
              >
                WebGL and Three.js experiments
              </span>
            </div>
          </div>

          {/* Bottom tags */}
          <div
            style={{
              display: "flex",
              gap: "12px",
            }}
          >
            {["WebGL", "Three.js", "Shaders", "Interactive"].map((tag) => (
              <div
                key={tag}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px 18px",
                  backgroundColor: ogColors.fg10,
                  borderRadius: "6px",
                  fontSize: "16px",
                  color: ogColors.fg70,
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
