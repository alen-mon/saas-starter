"use client";

import { useSearchParams } from "next/navigation";
import { SponsorsSection } from "@/components/sponsors/SponsorsSection";
import { LogoGrid } from "@/components/sponsors/LogoGrid";
import { getSeason, SEASONS } from "@/lib/site/seasons"; // <- from the seasons.ts we set up

export default function SponsorsPage() {
  const sp = useSearchParams();
  const seasonCode = sp.get("season") || "2025";
  const season = getSeason(seasonCode);

  // normalize to LogoItem[] from seasons data
  const titleItems = season.sponsors.title;
  const goldItems = season.sponsors.gold;
  const partnerItems = season.sponsors.partners;

  return (
    <main className="max-w-6xl mx-auto px-4 h-[85vh] sm:px-6 lg:px-8 py-12">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="text-3xl font-bold">Sponsors & Partners</h1>

        <select
          defaultValue={seasonCode}
          onChange={(e) => {
            const s = e.target.value;
            // simple client-side update without router
            const q = new URLSearchParams(window.location.search);
            q.set("season", s);
            window.location.search = q.toString();
          }}
          className="rounded-md border px-3 py-2 text-sm"
        >
          {SEASONS.map((s) => (
            <option key={s.code} value={s.code}>
              {s.code}
            </option>
          ))}
        </select>
      </div>

      <p className="mt-2 text-gray-600">
        {season.label}
        {season.highlight ? <> · {season.highlight}</> : null}
      </p>

      {/* Row 1: Title Sponsor — example of per-row style overrides */}
      <SponsorsSection
        label="Title Sponsor"
        items={titleItems}
        imgHeight={40} // ≈ h-10
        gridClassName="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 items-center"
        itemClassName="flex items-center justify-center p-4 rounded-xl border hover:shadow-sm transition bg-white"
      />

      {/* Row 2: Gold Sponsors */}
      <SponsorsSection
        label="Gold Sponsors"
        items={goldItems}
        imgHeight={100}
      />

      {/* Row 3: Partners — show how you could change cell styling here */}
      <SponsorsSection
        label="Partners"
        items={partnerItems}
        imgHeight={100}
        itemClassName="flex items-center justify-center p-3 rounded-lg border bg-white"
      />
    </main>
  );
}
