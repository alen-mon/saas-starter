"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR, { mutate } from "swr";
import { Suspense } from "react";
import { Loader2, PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { TeamDataWithMembers, User } from "@/lib/db/schema";
import { customerPortalAction } from "@/lib/payments/actions";
// near other imports
import { BadgeCheck, XCircle } from "lucide-react";

type ActionState = { error?: string; success?: string };
const fetcher = (url: string) => fetch(url).then((res) => res.json());

/* -------------------- Small utils -------------------- */
function useDebounced<T>(value: T, delay = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

async function bannedNameCheck(name: string) {
  const res = await fetch("/api/banned-names/check", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) return { blocked: false };
  return res.json() as Promise<{ blocked: boolean; reason?: string }>;
}

async function presignAndUpload({
  file,
  ownerType,
  ownerId,
}: {
  file: File;
  ownerType: "team" | "team_member" | "user";
  ownerId: number;
}) {
  // 1) presign
  const presign = await fetch("/api/uploads/presign", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type,
      ownerType,
      ownerId,
    }),
  });
  if (!presign.ok) throw new Error("Failed to get upload URL");
  const { url, key } = (await presign.json()) as { url: string; key: string };

  // 2) upload direct to S3
  const putRes = await fetch(url, {
    method: "PUT",
    headers: {
      "x-amz-server-side-encryption": "AES256",
      "x-amz-server-side-encryption-bucket-key-enabled": "true",
    },
    body: file,
  });

  if (!putRes.ok) throw new Error("Failed to upload to S3");

  return { key };
}

/* -------------------- UI Skeletons -------------------- */
function SubscriptionSkeleton() {
  return (
    <Card className="mb-8 h-[140px]">
      <CardHeader>
        <CardTitle>Team Subscription</CardTitle>
      </CardHeader>
    </Card>
  );
}

function TeamMembersSkeleton() {
  return (
    <Card className="mb-8 h-[140px]">
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="animate-pulse space-y-4 mt-1">
          <div className="flex items-center space-x-4">
            <div className="size-8 rounded-full bg-gray-200" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-3 w-14 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
/* -------------------- new  TeamStatusCard  -------------------- */

function TeamStatusCard() {
  const { data: status } = useSWR<any>("/api/team/status", fetcher);
  if (!status || !status.hasTeam) return null;

  const okRiders = status.ridersCount >= status.minRequired;
  const paymentOk = status.payment?.status === "verified";

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Team Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-3 rounded-md border">
            <div className="text-sm text-muted-foreground">Riders</div>
            <div className="text-xl font-semibold">
              {status.ridersCount} / {status.maxAllowed}
            </div>
            <div className="mt-1 text-sm">
              {okRiders ? (
                <span className="text-green-600 inline-flex items-center gap-1">
                  <BadgeCheck className="h-4 w-4" /> Meets minimum (
                  {status.minRequired})
                </span>
              ) : (
                <span className="text-red-600 inline-flex items-center gap-1">
                  <XCircle className="h-4 w-4" /> Needs at least{" "}
                  {status.minRequired}
                </span>
              )}
            </div>
          </div>

          <div className="p-3 rounded-md border">
            <div className="text-sm text-muted-foreground">Payment</div>
            <div className="text-xl font-semibold capitalize">
              {status.payment?.status || "—"}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {status.payment ? `₹${status.payment.amount}` : "Not submitted"}
            </div>
          </div>

          <div className="p-3 rounded-md border">
            <div className="text-sm text-muted-foreground">Team</div>
            <div className="text-xl font-semibold capitalize">
              {status.team.status}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {status.team.name}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="text-sm font-medium mb-2">
            Documents per Rider (verified)
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left">
                <tr>
                  <th className="py-2 pr-4">Rider</th>
                  {status.requiredDocs.map((d: string) => (
                    <th key={d} className="py-2 pr-4 capitalize">
                      {d}
                    </th>
                  ))}
                  <th className="py-2 pr-4">Complete</th>
                </tr>
              </thead>
              <tbody>
                {status.riders.map((r: any) =>
                  r.role === "captain" || r.role === "owner" ? null : (
                    <tr key={r.memberId} className="border-t">
                      <td className="py-2 pr-4">{r.name}</td>
                      {status.requiredDocs.map((d: string) => (
                        <td key={d} className="py-2 pr-4">
                          {r.docs[d] ? (
                            <span className="text-green-600 inline-flex items-center gap-1">
                              <BadgeCheck className="h-4 w-4" /> Yes
                            </span>
                          ) : (
                            <span className="text-red-600 inline-flex items-center gap-1">
                              <XCircle className="h-4 w-4" /> No
                            </span>
                          )}
                        </td>
                      ))}
                      <td className="py-2 pr-4">
                        {r.completeCount}/{r.requiredCount}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* -------------------- Existing Cards -------------------- */

function ManageSubscription() {
  const { data: teamData } = useSWR<TeamDataWithMembers | null>(
    "/api/team",
    fetcher
  );

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Team Subscription</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="mb-4 sm:mb-0">
              <p className="font-medium">
                Current Registration: {teamData?.planName || "Unregistered"}
              </p>
              <p className="text-sm text-muted-foreground">
                {teamData?.subscriptionStatus === "active"
                  ? "Billed monthly"
                  : teamData?.subscriptionStatus === "trialing"
                  ? "Trial period"
                  : "No active registrations"}
              </p>
            </div>
            <form action={customerPortalAction}>
              <Button type="submit" variant="outline">
                Manage Registration
              </Button>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TeamMembers() {
  const { data: teamData } = useSWR<TeamDataWithMembers | null>(
    "/api/team",
    fetcher
  );

  const getUserDisplayName = (user: Pick<User, "id" | "name" | "email">) =>
    user.name || user.email || "Unknown User";

  if (!teamData?.teamMembers?.length) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No team members yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {teamData.teamMembers.map((member) => (
            <li key={member.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarFallback>
                    {getUserDisplayName(member.user)
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {getUserDisplayName(member.user)}
                  </p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {member.role}
                  </p>
                </div>
              </div>
              {/* Remove action omitted for MVP */}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function CreateTeamCard() {
  const { data: teamData } = useSWR<TeamDataWithMembers | null>(
    "/api/team",
    fetcher
  );
  const [name, setName] = useState("");
  const [checking, setChecking] = useState(false);
  const [blockedMsg, setBlockedMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const debouncedName = useDebounced(name, 350);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!debouncedName.trim()) {
        setBlockedMsg(null);
        return;
      }
      setChecking(true);
      const res = await bannedNameCheck(debouncedName);
      if (!active) return;
      setChecking(false);
      setBlockedMsg(res.blocked ? res.reason || "Name not allowed" : null);
    })();
    return () => {
      active = false;
    };
  }, [debouncedName]);

  if (teamData) return null; // already has a team

  const canSubmit = !!name.trim() && !blockedMsg && !saving;

  async function onCreateTeam(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    const res = await fetch("/api/team", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    setSaving(false);
    if (!res.ok) {
      const msg = await res.text();
      alert(msg || "Failed to create team");
      return;
    }
    await mutate("/api/team");
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Create Your Team</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onCreateTeam} className="space-y-4">
          <div>
            <Label htmlFor="teamName">Team name</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="teamName"
                placeholder="Enter a team name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={!!blockedMsg}
                aria-describedby="teamName-help"
                required
              />
              <Button type="submit" disabled={!canSubmit}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create"
                )}
              </Button>
            </div>
            <p
              id="teamName-help"
              className="text-sm text-muted-foreground mt-2"
            >
              Names are checked against our event policy.
            </p>
            {checking && (
              <p className="text-sm text-muted-foreground mt-1">Checking...</p>
            )}
            {blockedMsg && (
              <p className="text-sm text-red-500 mt-1">{blockedMsg}</p>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function AddRiderCard() {
  const { data: teamData } = useSWR<TeamDataWithMembers | null>(
    "/api/team",
    fetcher
  );
  const { data: user } = useSWR<User>("/api/user", fetcher);

  const isCaptain = useMemo(() => {
    if (!teamData || !user) return false;
    const me = teamData.teamMembers?.find((m) => m.user.id === user.id);
    return me?.role === "captain" || me?.role === "owner"; // allow both
  }, [teamData, user]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState(""); // optional
  const [saving, setSaving] = useState(false);
  const remainingSlots = 5 - (teamData?.teamMembers?.length || 0);

  if (!teamData) return null;
  const teamId = teamData.id; // narrowed, safe

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!isCaptain) return;
    setSaving(true);
    const res = await fetch(`/api/team/${teamId}/members`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim() || undefined,
        role: "rider",
      }),
    });

    setSaving(false);
    if (!res.ok) {
      const msg = await res.text();
      alert(msg || "Failed to add rider");
      return;
    }
    setName("");
    setEmail("");
    await mutate("/api/team");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Rider</CardTitle>
      </CardHeader>
      <CardContent>
        {!isCaptain ? (
          <p className="text-sm text-muted-foreground">
            Only the captain can add riders.
          </p>
        ) : remainingSlots <= 0 ? (
          <p className="text-sm text-muted-foreground">
            Team already has 5 members.
          </p>
        ) : (
          <form onSubmit={onAdd} className="space-y-4">
            <div>
              <Label htmlFor="riderName">Full name</Label>
              <Input
                id="riderName"
                placeholder="Rider name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="riderEmail">Email (optional)</Label>
              <Input
                id="riderEmail"
                placeholder="email@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <Button type="submit" disabled={saving || !name.trim()}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Rider
                </>
              )}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          Min 3, max 5 riders per team (we’ll enforce minimum at submission).
        </p>
      </CardFooter>
    </Card>
  );
}

/* -------------------- New: Documents Card -------------------- */

function DocumentsCard() {
  const { data: teamData } = useSWR<TeamDataWithMembers | null>(
    "/api/team",
    fetcher
  );
  const { data: user } = useSWR<User>("/api/user", fetcher);
  const [memberId, setMemberId] = useState<number | "">("");
  const [docType, setDocType] = useState("license");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const isCaptain = useMemo(() => {
    if (!teamData || !user) return false;
    const me = teamData.teamMembers?.find((m) => m.user.id === user.id);
    return me?.role === "captain" || me?.role === "owner"; // allow both
  }, [teamData, user]);

  if (!teamData) return null;
  const teamId = teamData.id; // narrowed, safe
  if (!isCaptain)
    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Only the captain can upload documents.
          </p>
        </CardContent>
      </Card>
    );

  async function onUpload(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!file || !memberId) {
      setMsg("Select rider and choose a file.");
      return;
    }
    try {
      setSaving(true);
      const { key } = await presignAndUpload({
        file,
        ownerType: "team_member",
        ownerId: Number(memberId),
      });
      // register document record
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ownerId: Number(memberId),
          ownerType: "team_member",
          docType,
          filePath: key,
          fileName: file.name,
          contentType: file.type,
          size: file.size,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setMsg("✅ Uploaded and saved.");
      setFile(null);
      (document.getElementById("doc-file") as HTMLInputElement)?.value &&
        ((document.getElementById("doc-file") as HTMLInputElement).value = "");
    } catch (err: any) {
      setMsg(`❌ ${err?.message || "Upload failed"}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Documents (per rider)</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onUpload} className="grid gap-4 md:grid-cols-2">
          <div className="col-span-1">
            <Label htmlFor="member">Rider</Label>
            <select
              id="member"
              className="mt-2 block w-full rounded-md border px-3 py-2 text-sm"
              value={memberId}
              onChange={(e) =>
                setMemberId(e.target.value ? Number(e.target.value) : "")
              }
              required
            >
              <option value="">Select rider</option>
              {teamData.teamMembers?.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.user.name || m.user.email} ({m.role})
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-1">
            <Label htmlFor="docType">Document type</Label>
            <select
              id="docType"
              className="mt-2 block w-full rounded-md border px-3 py-2 text-sm"
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
            >
              <option value="license">License</option>
              <option value="medical">Medical</option>
              <option value="rc">RC</option>
              <option value="pucc">PUCC</option>
              <option value="waiver">Waiver</option>
            </select>
          </div>

          <div className="col-span-2">
            <Label htmlFor="doc-file">File (.jpg/.png/.pdf, &lt;10MB)</Label>
            <Input
              id="doc-file"
              type="file"
              accept=".pdf,image/*"
              className="mt-2"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
            />
          </div>

          <div className="col-span-2">
            <Button type="submit" disabled={saving || !memberId || !file}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload document"
              )}
            </Button>
            {msg && <p className="text-sm mt-2">{msg}</p>}
          </div>
        </form>
        <p className="text-xs text-muted-foreground mt-4">
          Allowed types: jpeg/png/pdf. Max 10MB. Uploaded to secure storage.
        </p>
      </CardContent>
    </Card>
  );
}

/* -------------------- New: Payment Card -------------------- */

function PaymentCard() {
  const { data: teamData } = useSWR<TeamDataWithMembers | null>(
    "/api/team",
    fetcher
  );
  const { data: user } = useSWR<User>("/api/user", fetcher);
  const [amount, setAmount] = useState<string>(""); // you can pre-fill later
  const [txnRef, setTxnRef] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const isCaptain = useMemo(() => {
    if (!teamData || !user) return false;
    const me = teamData.teamMembers?.find((m) => m.user.id === user.id);
    return me?.role === "captain" || me?.role === "owner"; // allow both
  }, [teamData, user]);

  if (!teamData) return null;
  const teamId = teamData.id; // narrowed, safe

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!isCaptain) return;
    try {
      setSaving(true);
      let proofUrl: string | undefined = undefined;
      if (file) {
        const { key } = await presignAndUpload({
          file,
          ownerType: "team",
          ownerId: Number(teamId),
        });
        proofUrl = key;
      }

      const res = await fetch("/api/payments/upi", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          teamId: Number(teamId),
          amount: Number(amount),
          txnRef: txnRef || undefined,
          proofUrl,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setMsg("✅ Payment submitted for verification.");
      setTxnRef("");
      setFile(null);
      (document.getElementById("upi-proof") as HTMLInputElement)?.value &&
        ((document.getElementById("upi-proof") as HTMLInputElement).value = "");
    } catch (err: any) {
      setMsg(`❌ ${err?.message || "Failed to submit payment"}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Payment (UPI)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Scan this UPI QR to pay your entry fee. Then submit the
              transaction reference and (optionally) upload a screenshot of the
              payment.
            </p>
            {process.env.NEXT_PUBLIC_UPI_QR_URL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={process.env.NEXT_PUBLIC_UPI_QR_URL}
                alt="UPI QR"
                className="rounded-md border"
              />
            ) : (
              <p className="text-sm text-red-500">
                Set NEXT_PUBLIC_UPI_QR_URL to display your event UPI QR code.
              </p>
            )}
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount (INR)</Label>
              <Input
                id="amount"
                type="number"
                inputMode="decimal"
                placeholder="e.g. 2500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="txnRef">Transaction reference</Label>
              <Input
                id="txnRef"
                placeholder="UPI txn id / note"
                value={txnRef}
                onChange={(e) => setTxnRef(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="upi-proof">Upload proof (optional)</Label>
              <Input
                id="upi-proof"
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>

            <Button type="submit" disabled={saving || !amount}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit payment"
              )}
            </Button>
            {msg && <p className="text-sm mt-2">{msg}</p>}
          </form>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          Admins will verify your payment and update your team status.
        </p>
      </CardFooter>
    </Card>
  );
}

/* -------------------- Page -------------------- */

export default function SettingsPage() {
  const { data: teamData } = useSWR<TeamDataWithMembers | null>(
    "/api/team",
    fetcher
  );

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium mb-6">Team Settings</h1>

      {/* If no team yet -> show CreateTeam */}
      <CreateTeamCard />

      {/* If team exists -> show rest */}
      {teamData ? (
        <>
          <Suspense fallback={null}>
            <TeamStatusCard />
          </Suspense>
          <Suspense fallback={<SubscriptionSkeleton />}>
            <ManageSubscription />
          </Suspense>
          <Suspense fallback={<TeamMembersSkeleton />}>
            <TeamMembers />
          </Suspense>
          <Suspense fallback={null}>
            <AddRiderCard />
          </Suspense>
          <Suspense fallback={null}>
            <DocumentsCard />
          </Suspense>
          <Suspense fallback={null}>
            <PaymentCard />
          </Suspense>
        </>
      ) : null}
    </section>
  );
}
