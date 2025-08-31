"use client";

import Image, { type StaticImageData } from "next/image";

export type LogoItem = {
  src: string | StaticImageData;
  alt: string;
  href?: string;
  width?: number;
  height?: number;
};

type LogoGridProps = {
  items: LogoItem[];
  /** Height for the image element (keeps aspect with w-auto) */
  imgHeight?: number; // default 40 (≈ h-10)
  /** Container classes for the whole grid */
  className?: string;
  /** Classes for each logo cell wrapper */
  itemClassName?: string;
  /** If provided, completely control how each item renders */
  renderItem?: (item: LogoItem) => React.ReactNode;
};

export function LogoGrid({
  items,
  imgHeight = 40,
  className = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 items-center",
  itemClassName = "flex items-center justify-center h-auto p-4 rounded-xl border hover:shadow-sm transition bg-white",
  renderItem,
}: LogoGridProps) {
  if (!items?.length)
    return <p className="text-sm text-gray-500">No logos added yet.</p>;

  return (
    <div className={className}>
      {items.map((logo, idx) => {
        if (renderItem) return <div key={idx}>{renderItem(logo)}</div>;

        const h = logo.height ?? imgHeight - 20;
        const w = logo.width ?? Math.round(h * 4.0); // loose default ratio

        const image = (
          <Image
            src={logo.src}
            alt={logo.alt}
            width={w}
            height={h}
            className=" w-auto object-contain opacity-80 group-hover:opacity-100"
          />
        );

        return logo.href ? (
          <a key={idx} href={logo.href} className={`group ${itemClassName}`}>
            {image}
          </a>
        ) : (
          <div key={idx} className={`group ${itemClassName}`}>
            {image}
          </div>
        );
      })}
    </div>
  );
}
