"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export default function NewTeam() {
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function createTeam() {
    setBusy(true);
    setErr(null);
    const r = await fetch("/api/teams", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setBusy(false);
    if (!r.ok) {
      setErr(await r.text());
      return;
    }
    router.push("/dashboard"); // or /teams/:id if you add that page
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">Create your team</h1>
      <Input
        placeholder="Team name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      {err && <p className="text-sm text-red-600">{err}</p>}
      <Button onClick={createTeam} disabled={busy || name.trim().length < 3}>
        {busy ? "Creating…" : "Create & become Captain"}
      </Button>
    </div>
  );
}
