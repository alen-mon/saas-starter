"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { signIn, signUp } from "./actions";
import { ActionState } from "@/lib/auth/middleware";
import Image from "next/image";
import Logoimage from "@/assets/Advenduro_Logo.png";

export function Login({ mode = "signin" }: { mode?: "signin" | "signup" }) {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const priceId = searchParams.get("priceId");
  const inviteId = searchParams.get("inviteId");

  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    mode === "signin" ? signIn : signUp,
    { error: "" }
  );

// inside the Login component
const [acceptTerms, setAcceptTerms] = useState(false);
const [isTermsOpen, setIsTermsOpen] = useState(false);

// NEW: track creator choice (default "no")
const [isCreator, setIsCreator] = useState<"yes" | "no">("no");


  // disable signup until terms accepted
  const isSignupButNoAccept = mode === "signup" && !acceptTerms;

  return (
    <>
      <div className="min-h-[100dvh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <Image
              src={Logoimage}
              alt="Advenduro Logo"
              className="h-30 w-auto ml-2 hover:cursor-pointer"
              onClick={() => {
                window.location.href = "/";
              }}
            />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {mode === "signin" ? "Sign in to your account" : "Create your account"}
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <form className="space-y-6" action={formAction}>
            <input type="hidden" name="redirect" value={redirect || ""} />
            <input type="hidden" name="priceId" value={priceId || ""} />
            <input type="hidden" name="inviteId" value={inviteId || ""} />

            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </Label>
              <div className="mt-1">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  defaultValue={state.email}
                  required
                  maxLength={50}
                  className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="mt-1">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  defaultValue={state.password}
                  required
                  minLength={8}
                  maxLength={100}
                  className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your password"
                />
              </div>
            </div>

{/* Terms (only for signup) - checkbox */}
{mode === "signup" && (
  <div className="mt-2 space-y-4">
        {/* NEW: Are you a content creator? radio group */}
    <fieldset className="mt-4">
      <legend className="text-sm font-medium text-gray-700">Are you a content creator?</legend>
      <div className="mt-2 flex items-center space-x-6 text-sm">
        <label className="inline-flex items-center space-x-2">
          <input
            type="radio"
            name="isCreator"
            value="yes"
            checked={isCreator === "yes"}
            onChange={() => setIsCreator("yes")}
            className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
          />
          <span className="text-gray-700">Yes</span>
        </label>

        <label className="inline-flex items-center space-x-2">
          <input
            type="radio"
            name="isCreator"
            value="no"
            checked={isCreator === "no"}
            onChange={() => setIsCreator("no")}
            className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
          />
          <span className="text-gray-700">No</span>
        </label>
      </div>
      <p className="mt-2 text-sm text-gray-500">
        Selecting "Yes" lets us show you creator resources and onboarding after signup.
      </p>
    </fieldset>
    <div className="flex items-start space-x-3">
      <div className="flex h-5 items-center">
        <input
          id="acceptTerms"
          name="acceptTerms"
          type="checkbox"
          value="true"
          checked={acceptTerms}
          onChange={(e) => setAcceptTerms(e.target.checked)}
          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
          required
        />
      </div>
      <div className="min-w-0 flex-1 text-sm">
        <label htmlFor="acceptTerms" className="font-medium text-gray-700">
          I accept the{" "}
          <button
            type="button"
            onClick={() => setIsTermsOpen(true)}
            className="underline text-orange-600 hover:text-orange-800"
          >
            Terms & Conditions
          </button>
        </label>
        <div className="text-gray-500">
          <Link href="/terms" className="underline hover:text-gray-700">
            Or view the full Terms & Conditions page
          </Link>
        </div>
        {isSignupButNoAccept && (
          <p className="mt-2 text-sm text-red-600">
            You must accept the Terms & Conditions to create an account.
          </p>
        )}
      </div>
    </div>


  </div>
)}


            {state?.error && <div className="text-red-500 text-sm">{state.error}</div>}

            <div>
              <Button
                type="submit"
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                disabled={pending || isSignupButNoAccept}
              >
                {pending ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Loading...
                  </>
                ) : mode === "signin" ? (
                  "Sign in"
                ) : (
                  "Sign up"
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">
                  {mode === "signin" ? "New to our platform?" : "Already have an account?"}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href={`${mode === "signin" ? "/sign-up" : "/sign-in"}${redirect ? `?redirect=${redirect}` : ""}${priceId ? `&priceId=${priceId}` : ""}`}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                {mode === "signin" ? "Create an account" : "Sign in to existing account"}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Terms modal */}
      {isTermsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
          <div className="max-w-3xl w-full bg-white rounded-lg shadow-lg overflow-auto max-h-[80vh]">
            <div className="flex justify-between items-start p-4 border-b">
              <h3 className="text-lg font-semibold">Terms & Conditions</h3>
              <button aria-label="Close terms" onClick={() => setIsTermsOpen(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>

            <div className="p-6 text-sm text-gray-700 space-y-4">
              {/* Replace with real terms or fetch them */}
              <p>
                <strong>Welcome to Advenduro</strong>. These terms and conditions explain how...
              </p>
              <p>Full legal copy goes here — replace with actual T&amp;Cs.</p>

              <div className="flex justify-end">
                <button onClick={() => setIsTermsOpen(false)} className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
