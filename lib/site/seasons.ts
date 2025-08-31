// seasons.ts
import type { StaticImageData } from "next/image";

// If you want to keep using imported images:
import AdvenLogo from "@/assets/Advenduro_Logo.png";
import NacLogo from "@/assets/NacLogo.png";
import NagaTourismLogo from "@/assets/NagalandTourismLogo.png";

export type LogoRef = {
  /** Can be a /public path or a StaticImageData import */
  src: string | StaticImageData;
  alt: string;
  /** Optional click-through */
  href?: string;
  /** Optional sizing hints for <Image> */
  width?: number;
  height?: number;
  /** Optional note like "Official Tourism Partner" */
  tag?: string;
};

export type Season = {
  code: string; // "2025"
  label: string; // "2025 — Nagaland"
  highlight?: string; // "Tourism & Adventure Partner..."
  organisers: LogoRef[]; // Gorilla Moto, NAC, etc.
  tourismPartner: LogoRef[];
  sponsors: {
    title: LogoRef[];
    gold: LogoRef[];
    partners: LogoRef[];
  };
};

export const SEASONS: Season[] = [
  {
    code: "2025",
    label: "2025 — Nagaland",
    highlight: "Dept. of Tourism, Govt of Nagaland",
    organisers: [
      { src: AdvenLogo, alt: "Gorilla Moto", width: 120, height: 100 },
      { src: NacLogo, alt: "Nagaland Adventure Club", width: 100, height: 100 },
    ],
    tourismPartner: [
      {
        src: NagaTourismLogo,
        alt: "Department of Tourism, Govt of Nagaland",
        tag: "Tourism & Adventure Partner",
        width: 120,
        height: 100,
      },
    ],
    sponsors: {
      // You can keep these as /public paths or import real files later
      title: [
        {
          src: "/sponsors/title-sponsor.png",
          alt: "Title Sponsor",
          width: 180,
          height: 64,
        },
      ],
      gold: [
        {
          src: "/sponsors/gold-1.png",
          alt: "Gold Sponsor 1",
          width: 160,
          height: 56,
        },
        {
          src: "/sponsors/gold-2.png",
          alt: "Gold Sponsor 2",
          width: 160,
          height: 56,
        },
        // add more as needed
      ],
      partners: [
        {
          src: NagaTourismLogo,
          alt: "Partner 1",
          width: 140,
          height: 52,
        },
        {
          src: NacLogo,
          alt: "Partner 2",
          width: 140,
          height: 52,
        },
        // ...
      ],
    },
  },
  {
    code: "2024",
    label: "2024 — Pilot Edition (Parnter No. 0)",
    highlight: "Pilot partner lineup",
    organisers: [],
    tourismPartner: [],
    sponsors: { title: [], gold: [], partners: [] },
  },
];

export const getSeason = (code?: string) =>
  SEASONS.find((s) => s.code === code) ?? SEASONS[0];
