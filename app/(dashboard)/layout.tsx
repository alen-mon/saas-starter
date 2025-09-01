"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import {
  Home,
  Users,
  FileText,
  CreditCard,
  Settings,
  LogOut,
} from "lucide-react";
import { Logo } from "../../assets/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "@/app/(login)/actions";
import { useRouter } from "next/navigation";
import { User } from "@/lib/db/schema";
import useSWR, { mutate } from "swr";
import Image from "next/image";
import Logoimage from "@/assets/Advenduro_Logo.png";
import SiteFooter from "@/components/site-footer";
const fetcher = (url: string) => fetch(url).then((res) => res.json());

function UserMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: user } = useSWR<User>("/api/user", fetcher);
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    mutate("/api/user");
    router.push("/");
  }

  if (!user) {
    return (
      <>
        <Link
          href="/pricing"
          className="text-sm font-medium hidden sm:flex text-gray-700 hover:text-gray-900"
        >
          Ticket
        </Link>
        <Button asChild className="rounded-full">
          <Link href="/sign-up">Sign Up</Link>
        </Button>
      </>
    );
  }

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger>
        <Avatar className="cursor-pointer size-9">
          <AvatarImage alt={user.name || ""} />
          <AvatarFallback>
            {user.email
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex flex-col gap-1">
        <DropdownMenuItem className="cursor-pointer">
          <Link href="/dashboard" className="flex w-full items-center">
            <Home className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <form action={handleSignOut} className="w-full">
          <button type="submit" className="flex w-full">
            <DropdownMenuItem className="w-full flex-1 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          {/* <Logo className="h-6 w-6 text-orange-500" /> */}
          <Image
            src={Logoimage}
            alt="Advenduro Logo"
            className="h-10 w-auto ml-2"
          />
          <span className="ml-2 text-xl font-semibold text-gray-900">
            Advenduro
          </span>
        </Link>

        {/* Dummy nav links */}
        <nav className="hidden md:flex space-x-6">
          {/* About */}
          <Link
            href="/about-us"
            className="text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-1"
          >
            <Home size={16} /> About us
          </Link>

          {/* Sponsors & Partners dropdown (Seasoned) */}
          <DropdownMenu>
            <DropdownMenuTrigger className="text-sm font-medium text-gray-700 hover:cursor-pointer hover:text-gray-900 flex items-center gap-1">
              <Users size={16} /> Sponsors & Partners
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72">
              <div className="px-3 pt-3 pb-1 text-xs uppercase tracking-wide text-gray-500">
                Browse by Season
              </div>
              {/* Example seasons; wire to a config later */}
              {[
                { slug: "2025", label: "2025 — Nagaland (Govt of Nagaland)" },
                { slug: "2024", label: "2024 — Pilot Edition (Parnter No. 0)" },
              ].map((s) => (
                <DropdownMenuItem
                  key={s.slug}
                  asChild
                  className="hover:cursor-pointer"
                >
                  <Link href={`/sponsors?season=${s.slug}`}>{s.label}</Link>
                </DropdownMenuItem>
              ))}
              <div className="border-t my-2 " />
              <DropdownMenuItem className="hover:cursor-pointer" asChild>
                <Link href="/sponsors">All Sponsors & Partners</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Rules dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="text-sm font-medium text-gray-700 hover:cursor-pointer hover:text-gray-900 flex items-center gap-1">
              <FileText size={16} /> Official Rules
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuItem className="hover:cursor-pointer" asChild>
                <Link href="/rules">Official Event Rules</Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:cursor-pointer" asChild>
                <Link href="/terms">Terms & Conditions</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Gallery */}
          <Link
            href="/gallery"
            className="text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-1"
          >
            <CreditCard size={16} /> Gallery
          </Link>
          <Link
            href="/content-creator-awards"
            className="text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-1"
          >
            <CreditCard size={16} /> Content Creator Awards
          </Link>
          {/* Contact */}
          <Link
            href="/contact"
            className="text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-1"
          >
            <FileText size={16} /> Contact Us
          </Link>

          {/* Shop */}
          <Link
            href="/shop"
            className="text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-1"
          >
            <Settings size={16} /> Shop
          </Link>
        </nav>

        {/* User menu */}
        <div className="flex items-center space-x-4">
          <Suspense fallback={<div className="h-9" />}>
            <UserMenu />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
import MobileSiteHeader from "@/components/mobile-site-header";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col min-h-screen ">
      <div className="hidden sm:block">
        <Header />
      </div>

      <div className="sm:hidden bg-indigo-100">
        <MobileSiteHeader />
      </div>

      <main className="flex-1">{children}</main>
      <SiteFooter />
    </section>
  );
}
