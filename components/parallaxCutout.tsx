import React, { useEffect, useRef } from "react";
import type { StaticImageData } from "next/image";

type BgProp = string | StaticImageData;

type Props = {
  bg?: BgProp;
  speed?: number;
  height?: string;
  className?: string;
  mode?: "parallax" | "static" | "fixed";
  /** requested mask pixels */
  maskWidth?: number; // default 1300
  maskHeight?: number; // default 500
};

export default function ParallaxCutout({
  bg = "/hero/ridge.jpg",
  speed = 0.15,
  height = "520px",
  className = "",
  mode = "parallax",
  maskWidth = 1300,
  maskHeight = 500,
}: Props) {
  const containerRef = useRef<HTMLElement | null>(null);
  const bgRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const maskRectRef = useRef<SVGRectElement | null>(null);

  const getBgUrl = (b: BgProp) => {
    if (!b) return "";
    if (typeof b === "string") return b;
    // StaticImageData has `src`
    // @ts-ignore
    return (b as StaticImageData).src ?? String(b);
  };
  const bgUrl = getBgUrl(bg);

  // main effect: parallax + keep SVG mask rect updated on resize/scroll
  useEffect(() => {
    // helper to update SVG viewBox & mask rect coords
    function updateMaskAndBgPosition() {
      const container = containerRef.current;
      const bgEl = bgRef.current;
      const svgEl = svgRef.current;
      const maskRect = maskRectRef.current;
      if (!container || !bgEl || !svgEl || !maskRect) return;

      // PARALLAX: compute translate only if mode === "parallax"
      const rect = container.getBoundingClientRect();
      if (mode === "parallax") {
        const translateY = -rect.top * speed;
        bgEl.style.transform = `translate3d(-50%, ${translateY}px, 0)`;
      } else {
        // center bg horizontally, no vertical movement
        bgEl.style.transform = `translate3d(-50%, 0px, 0)`;
      }

      // SVG viewBox & mask: we want a viewBox sized to the container in px
      const vw = Math.max(0.1, Math.round(rect.width || 0)); // avoid zero
      const vh = Math.max(0.1, Math.round(rect.height || 0));

      // if the container has no measured size yet (not in DOM), bail
      if (vw <= 0 || vh <= 0) return;

      // set SVG viewBox to container pixel size
      svgEl.setAttribute("viewBox", `0 0 ${vw} ${vh}`);

      // target mask size in px (clamp if container smaller)
      const targetW = Math.min(maskWidth, Math.round(vw * 0.96)); // leave small padding
      const targetH = Math.min(maskHeight, Math.round(vh * 0.9)); // leave small padding vertically

      // center the mask inside the container
      const x = Math.round((vw - targetW) / 2);
      const y = Math.round((vh - targetH) / 2);

      // set rect attributes (no rx -> sharp corners)
      maskRect.setAttribute("x", String(x));
      maskRect.setAttribute("y", String(y));
      maskRect.setAttribute("width", String(targetW));
      maskRect.setAttribute("height", String(targetH));
      // no rx => no rounded corners
      maskRect.setAttribute("rx", "0");
    }

    // rAF pattern for smoothness when parallax is active + resize throttling
    let ticking = false;
    let rafId: number | null = null;

    function onScrollOrResize() {
      if (!ticking) {
        ticking = true;
        rafId = requestAnimationFrame(() => {
          updateMaskAndBgPosition();
          ticking = false;
        });
      }
    }

    // initial update
    onScrollOrResize();

    // listen
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);

    // also observe container size changes (handles cases where layout changes)
    const container = containerRef.current;
    let ro: ResizeObserver | null = null;
    if (container && (window as any).ResizeObserver) {
      ro = new ResizeObserver(() => {
        onScrollOrResize();
      });
      ro.observe(container);
    }

    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      if (rafId) cancelAnimationFrame(rafId);
      if (ro && container) ro.unobserve(container);
    };
  }, [speed, mode, maskWidth, maskHeight]);

  // conditional styles depending on mode
  const backgroundStyles: React.CSSProperties =
    mode === "parallax"
      ? {
          width: "140vw", // oversized so parallax movement doesn't reveal gaps
          height: "140%",
          transform: "translate3d(-50%, 0px, 0)",
          backgroundImage: `url(${bgUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          zIndex: 0,
        }
      : {
          width: "100%",
          height: "140%",
          transform: "translate3d(-50%, 0px, 0)",
          backgroundImage: `url(${bgUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          zIndex: 0,
          ...(mode === "fixed"
            ? { backgroundAttachment: "fixed" as const }
            : {}),
        };

  return (
    <section
      ref={containerRef}
      className={`relative overflow-hidden w-full${className}`}
      style={{ height }}
      aria-hidden={false}
    >
      {/* background element */}
      <div
        ref={bgRef}
        className="absolute left-1/2 top-0 will-change-transform"
        style={backgroundStyles}
      />

      {/* SVG mask overlay -- viewBox will be set dynamically in effect */}
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <mask id="parallax-cutout-mask" maskUnits="userSpaceOnUse">
            {/* white = overlay (opaque), black = transparent hole */}
            <rect x="0" y="0" width="100%" height="100%" fill="#ffffff" />
            {/* the mask rect is updated dynamically with pixel coordinates */}
            <rect
              ref={maskRectRef}
              x="0"
              y="0"
              width="0"
              height="0"
              fill="#000000"
              rx="0"
            />
          </mask>
        </defs>

        <rect
          width="100%"
          height="100%"
          fill="rgba(248,250,252,0.98)"
          mask="url(#parallax-cutout-mask)"
        />
      </svg>

      {/* Foreground content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <div className="w-full self-center ">
          <h3 className="text-3xl text-center sm:text-8xl font-extrabold text-white">
            Ride Into the Unknown
          </h3>

          <div className="mt-6 self-center flex justify-center">
            <a
              href="/sign-up"
              className="inline-flex items-center gap-2 text-2xl font-black text-gray-900 hover:text-black bg-white  rounded-tr-3xl rounded-bl-4xl py-2 p-3"
            >
              Register Today
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
