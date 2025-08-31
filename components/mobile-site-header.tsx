"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ChevronDown } from "lucide-react";
import Logoimage from "@/assets/Advenduro_Logo.png";

type MenuItem = {
  label: string;
  href?: string; // if provided, tapping the heading will navigate
  children?: { label: string; href: string }[];
};

const MENU: MenuItem[] = [
  { label: "Home", href: "/" },
  {
    label: "About",
    children: [
      { label: "The Event", href: "/about-us" },
      { label: "Route & Stages", href: "/route" },
      { label: "FAQs", href: "/faqs" },
    ],
  },
  {
    label: "Race",
    children: [
      { label: "Rules", href: "/rules" },
      { label: "Categories", href: "/categories" },
      { label: "Itinerary", href: "/itinerary" },
    ],
  },
  { label: "Sponsors", href: "/sponsors" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];

export default function SiteHeaderMobile() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  // Close menu on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggle = (idx: number, item: MenuItem) => {
    // If heading has an href and no children, navigate (menu closes via onClick on Link)
    if (item.href && !item.children?.length) return;
    setExpanded((cur) => (cur === idx ? null : idx));
  };

  return (
    <header className="md:hidden sticky top-0 z-50 bg-white/90 backdrop-blur border-b">
      {/* Top bar */}
      <div className="h-16 max-w-7xl  mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src={Logoimage} alt="Advenduro" className="h-8 w-auto" />
          <span className="font-semibold">Advenduro</span>
        </Link>

        <button
          type="button"
          aria-label="Open menu"
          aria-controls="mobile-fullsheet"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Full-screen slide-in sheet */}
      <div
        id="mobile-fullsheet"
        className={`fixed inset-0 z-[60] h-screen transition-[visibility] ${
          open ? "visible" : "invisible"
        }`}
      >
        {/* Backdrop */}
        <button
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/45 transition-opacity ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Panel (slides from right and fills page) */}
        <div
          className={`absolute inset-y-0 right-0 w-full bg-white shadow-xl border-l transition-transform duration-200 ease-out ${
            open ? "translate-x-0" : "translate-x-full"
          } flex flex-col`}
          role="dialog"
          aria-modal="true"
        >
          {/* Header row inside sheet */}
          <div className="h-16 px-4 border-b flex items-center justify-between">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2"
            >
              <Image src={Logoimage} alt="Advenduro" className="h-7 w-auto" />
              <span className="font-semibold">Advenduro</span>
            </Link>
            <button
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Centered nav */}
          <nav className="flex-1 overflow-y-auto">
            <ul className="mx-auto max-w-sm px-4 py-6 space-y-2">
              {MENU.map((item, idx) => {
                const isOpen = expanded === idx;
                const hasKids = !!item.children?.length;

                const Heading = (
                  <button
                    type="button"
                    onClick={() => toggle(idx, item)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-2xl font-semibold tracking-wide text-gray-900 hover:bg-gray-50"
                  >
                    <span>{item.label}</span>
                    {hasKids && (
                      <ChevronDown
                        className={`h-5 w-5 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>
                );

                return (
                  <li key={item.label} className="text-center">
                    {/* If heading is a direct link with no children, make the whole heading a Link */}
                    {item.href && !hasKids ? (
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="block rounded-xl px-4 py-3 text-2xl font-semibold tracking-wide text-gray-900 hover:bg-gray-50"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      Heading
                    )}

                    {/* Accordion */}
                    {hasKids && (
                      <div
                        className={`overflow-hidden transition-all duration-200 ${
                          isOpen ? "max-h-80" : "max-h-0"
                        }`}
                      >
                        <div className="pt-2 pb-3 space-y-1">
                          {item.children!.map((sub) => (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              onClick={() => setOpen(false)}
                              className="block rounded-lg px-4 py-2 text-base text-gray-700 hover:bg-gray-50"
                            >
                              {sub.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer action (optional) */}
          <div className="p-4 border-t">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="block text-center rounded-full border px-4 py-3 text-base font-medium hover:border-gray-900"
            >
              Register Now
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
