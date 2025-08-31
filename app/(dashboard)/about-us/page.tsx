"use client";

import Image from "next/image";

// OPTIONAL: if you wired seasons.ts with getSeason/SEASONS, uncomment these lines.
// import { getSeason } from "@/data/seasons";

import AdvenLogo from "@/assets/Advenduro_Logo.png";
import NacLogo from "@/assets/NacLogo.png";
import NagaTourismLogo from "@/assets/NagalandTourismLogo.png";

export default function AboutUsPage() {
  // const season = getSeason("2025");
  // const tourismHighlight = season?.highlight ?? "Tourism & Adventure Partner: Dept. of Tourism, Govt of Nagaland";

  const tourismHighlight =
    "Tourism & Adventure Partner: Department of Tourism, Govt of Nagaland";

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <header className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight">About Advenduro</h1>
        <p className="mt-4 text-gray-600">
          Advenduro is an adventure motorsport initiative crafting endurance
          experiences in the wild heart of Northeast India. We bring riders into
          remote, culturally rich landscapes where grit meets discovery.
        </p>
      </header>

      {/* Organisers + Co-Partner */}
      <section className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border p-6 bg-white">
          <div className="flex items-center gap-4">
            <Image src={AdvenLogo} alt="Gorilla Moto" className="h-12 w-auto" />
            <h2 className="text-lg font-semibold">Gorilla Moto</h2>
          </div>
          <p className="mt-3 text-gray-700 leading-relaxed">
            This motorcycle group stands out in the moto-adventure scene as a
            one-of-a-kind breed of riders who dare to go anywhere, on any
            terrain, to discover hidden natural wonders. For Gorilla Moto, rides
            mean reaching the remotest mountains, chasing waterfalls and wild
            landscapes, taking the road less travelled to find new routes and
            trails, and immersing with locals in the barrios.
          </p>
        </div>

        <div className="rounded-2xl border p-6 bg-white">
          <div className="flex items-center gap-4">
            <Image
              src={NacLogo}
              alt="Nagaland Adventure Club (NAC)"
              className="h-12 w-auto"
            />
            <h2 className="text-lg font-semibold">
              Co-Partner (2025): NAC — Nagaland Adventure Club
            </h2>
          </div>
          <p className="mt-3 text-gray-700 leading-relaxed">
            Established in 2009 and based in Kohima, NAC promotes adventure and
            motorsports across Nagaland. Over the years, NAC has become a key
            organizer of motorsports events, notably the annual{" "}
            <span className="font-medium">Horsepower Challenge</span>, which
            features motocross, autocross, supercross and draws participants
            from across the state and country.
          </p>
        </div>
      </section>

      {/* Key Motorsports Events */}
      <section className="mt-10 rounded-2xl border p-6 bg-white">
        <h3 className="text-lg font-semibold">Key Motorsports Events</h3>
        <ul className="mt-3 space-y-2 text-gray-700">
          <li className="leading-relaxed">
            <span className="font-medium">Horsepower Challenge</span> — NAC’s
            flagship event (now in its 10th edition), with categories including
            SUV, Open, Rookie, Autorickshaw Rally, Stock, and Ladies.
          </li>
          <li className="leading-relaxed">
            In <span className="font-medium">2023</span>, NAC successfully
            hosted the final round of the{" "}
            <span className="font-medium">
              Indian National Rally Championship (INRC)
            </span>
            in Nagaland for the first time — a milestone for motorsports in the
            region.
          </li>
        </ul>
      </section>

      {/* Rural Adventure & Eco-Tourism */}
      <section className="mt-6 rounded-2xl border p-6 bg-white">
        <h3 className="text-lg font-semibold">Rural Adventure & Eco-Tourism</h3>
        <p className="mt-3 text-gray-700 leading-relaxed">
          NAC organizes off-road expeditions such as{" "}
          <span className="font-medium">Expedition Naga Hills</span>, promoting
          rural adventure tourism while showcasing the region’s landscapes and
          tribal culture. The club collaborates closely with the state tourism
          department to position Nagaland as a leading destination for rural
          adventure tourism.
        </p>
      </section>

      {/* Community & Social Initiatives */}
      <section className="mt-6 rounded-2xl border p-6 bg-white">
        <h3 className="text-lg font-semibold">
          Community & Social Initiatives
        </h3>
        <p className="mt-3 text-gray-700 leading-relaxed">
          Beyond events, NAC contributes to community-focused activities —
          fostering motorsports culture in Nagaland and across the Northeast,
          building community spirit, and supporting social causes. NAC continues
          to grow as a hub for adventure, motorsports, and community engagement
          in the state.
        </p>
      </section>

      {/* Tourism & Adventure Partner (2025) */}
      <section className="mt-10 rounded-2xl border p-6 bg-white">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h3 className="text-lg font-semibold">
              2025 Tourism & Adventure Partner
            </h3>
            <p className="mt-1 text-gray-700">{tourismHighlight}</p>
          </div>
          <Image
            src={NagaTourismLogo}
            alt="Department of Tourism, Govt of Nagaland"
            className="h-12 w-auto"
          />
        </div>
      </section>

      {/* Sponsors pointer */}
      <section className="mt-10">
        <h3 className="text-lg font-semibold">Sponsors</h3>
        <p className="mt-2 text-gray-600">
          Sponsor rosters change every season—thank you to all who power the
          mission. Visit the{" "}
          <a href="/sponsors" className="underline underline-offset-2">
            Sponsors
          </a>{" "}
          page to explore current lineups.
        </p>
      </section>
    </main>
  );
}
