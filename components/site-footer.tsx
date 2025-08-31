"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Instagram,
  Youtube,
  Facebook,
  Twitter,
  ArrowUpRight,
} from "lucide-react";
import Logoimage from "@/assets/Advenduro_Logo.png";

const socials = [
  {
    name: "Instagram",
    href: "https://instagram.com/advenduro",
    Icon: Instagram,
  },
  { name: "YouTube", href: "https://youtube.com/@advenduro", Icon: Youtube },
  { name: "Facebook", href: "https://facebook.com/advenduro", Icon: Facebook },
  { name: "X (Twitter)", href: "https://x.com/advenduro", Icon: Twitter },
];

const quickLinks = [
  { label: "About us", href: "/about-us" },
  { label: "Sponsors & Partners", href: "/sponsors" },
  { label: "Rules", href: "/rules" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
  { label: "Shop", href: "/shop" },
];

const partnerLogos = [
  { src: "/partners/govt-nagaland.png", alt: "Govt of Nagaland" },
  { src: "/partners/gorilla-moto.png", alt: "Gorilla Moto" },
  {
    src: "/partners/nagaland-adventure-club.png",
    alt: "Nagaland Adventure Club",
  },
  { src: "/partners/department-tourism.png", alt: "Department of Tourism" },
  // add/remove freely
];

export default function SiteFooter() {
  return (
    <footer className="border-t bg-white">
      {/* Top: brand + links + socials */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-10 md:grid-cols-12">
          {/* Brand + pitch */}
          <div className="md:col-span-5">
            <Link href="/" className="inline-flex items-center">
              <Image
                src={Logoimage}
                alt="Advenduro Logo"
                className="h-10 w-auto"
              />
              <span className="ml-2 text-lg font-semibold text-gray-900">
                Advenduro
              </span>
            </Link>
            <p className="mt-4 text-sm text-gray-600 max-w-sm">
              India’s first multi-day endurance epic in the wild heart of
              Northeast India. Beyond roads. Beyond limits.
            </p>

            {/* Socials */}
            <div className="mt-5 flex items-center gap-3">
              {socials.map(({ name, href, Icon }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={name}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border text-gray-600 hover:text-gray-900 hover:border-gray-900 transition"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="md:col-span-3">
            <h3 className="text-sm font-semibold text-gray-900">Explore</h3>
            <ul className="mt-4 space-y-2">
              {quickLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-gray-600 hover:text-gray-900 inline-flex items-center gap-1"
                  >
                    {l.label}
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-60" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Partners strip (compact logos) */}
          <div className="md:col-span-4">
            <h3 className="text-sm font-semibold text-gray-900">
              Partners & Affiliations
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              In proud partnership with regional bodies and adventure
              communities.
            </p>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {partnerLogos.map((p) => (
                <div
                  key={p.alt}
                  className="flex items-center justify-center rounded-xl border p-3 bg-white hover:shadow-sm transition"
                >
                  <Image
                    src={p.src}
                    alt={p.alt}
                    width={160}
                    height={64}
                    className="h-10 w-auto object-contain opacity-80 hover:opacity-100 transition"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Advenduro. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <Link href="/privacy" className="hover:text-gray-900">
              Privacy
            </Link>
            <span aria-hidden>•</span>
            <Link href="/terms" className="hover:text-gray-900">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
