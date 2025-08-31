"use client";

import useSWR, { mutate } from "swr";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Row = {
  id: number;
  ownerId: number;
  ownerType: "team" | "team_member" | "user";
  docType: string;
  filePath: string;
  fileName: string | null;
  contentType: string | null;
  size: number | null;
  uploadedAt: string;
  verifiedAt: string | null;
  teamId: number | null;
  teamName: string | null;
  riderName: string | null;
  riderEmail: string | null;
};

const fetcher = (u: string) => fetch(u).then((r) => r.json());

export default function AdminDocumentsPage() {
  const { data, isLoading } = useSWR<Row[]>("/api/admin/documents", fetcher);
  const [busyId, setBusyId] = useState<number | null>(null);

  async function preview(key: string) {
    const res = await fetch("/api/admin/s3/get-url", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ key }),
    });
    if (!res.ok) {
      alert("Failed to get preview URL");
      return;
    }
    const { url } = await res.json();
    window.open(url, "_blank");
  }

  async function act(id: number, action: "verify" | "reject") {
    const note =
      action === "reject"
        ? window.prompt("Rejection note (optional):") ?? undefined
        : undefined;

    setBusyId(id);
    const res = await fetch("/api/admin/documents", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, action, note }),
    });
    setBusyId(null);
    if (!res.ok) {
      alert(await res.text());
      return;
    }
    await mutate("/api/admin/documents");
  }

  return (
    <section className="flex-1 p-4 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Documents (Admin)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && <p>Loading…</p>}
          {!isLoading && (!data || data.length === 0) && (
            <p className="text-sm text-muted-foreground">
              No documents uploaded.
            </p>
          )}
          {!isLoading && data && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left">
                  <tr>
                    <th className="py-2 pr-4">Type</th>
                    <th className="py-2 pr-4">Rider / Team</th>
                    <th className="py-2 pr-4">Team</th>
                    <th className="py-2 pr-4">Uploaded</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row) => (
                    <tr key={row.id} className="border-t">
                      <td className="py-2 pr-4 capitalize">{row.docType}</td>
                      <td className="py-2 pr-4">
                        {row.ownerType === "team_member"
                          ? row.riderName || row.riderEmail || `#${row.ownerId}`
                          : row.ownerType}
                      </td>
                      <td className="py-2 pr-4">{row.teamName ?? "-"}</td>
                      <td className="py-2 pr-4">
                        {new Date(row.uploadedAt).toLocaleString()}
                      </td>
                      <td className="py-2 pr-4">
                        {row.verifiedAt ? "Verified" : "Pending"}
                      </td>
                      <td className="py-2 pr-4 space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => preview(row.filePath)}
                        >
                          Preview
                        </Button>
                        {!row.verifiedAt && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => act(row.id, "verify")}
                              disabled={busyId === row.id}
                            >
                              Verify
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => act(row.id, "reject")}
                              disabled={busyId === row.id}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
