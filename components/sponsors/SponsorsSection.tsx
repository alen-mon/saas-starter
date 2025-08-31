"use client";

import { LogoGrid, type LogoItem } from "./LogoGrid";

type SponsorsSectionProps = {
  label: string;
  items: LogoItem[];
  /** Pass through customization */
  imgHeight?: number;
  gridClassName?: string;
  itemClassName?: string;
  renderItem?: (item: LogoItem) => React.ReactNode;
  /** Optional label class override */
  labelClassName?: string;
};

export function SponsorsSection({
  label,
  items,
  imgHeight,
  gridClassName,
  itemClassName,
  renderItem,
  labelClassName = "text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4",
}: SponsorsSectionProps) {
  return (
    <section className="mt-10">
      <h2 className={labelClassName}>{label}</h2>
      <LogoGrid
        items={items}
        imgHeight={imgHeight}
        className={gridClassName}
        itemClassName={itemClassName}
        renderItem={renderItem}
      />
    </section>
  );
}
