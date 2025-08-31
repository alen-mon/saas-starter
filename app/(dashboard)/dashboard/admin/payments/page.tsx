"use client";

import useSWR, { mutate } from "swr";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Row = {
  id: number;
  teamId: number;
  amount: string; // numeric comes as string
  method: string;
  status: string;
  txnRef: string | null;
  proofUrl: string | null;
  createdAt: string;
  teamName: string | null;
};

const fetcher = (u: string) => fetch(u).then((r) => r.json());

export default function AdminPaymentsPage() {
  const { data, isLoading } = useSWR<Row[]>("/api/admin/payments", fetcher);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  async function preview(key: string | null) {
    setPreviewUrl(null);
    if (!key) return;
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
    setPreviewUrl(url);
    window.open(url, "_blank");
  }

  async function act(id: number, action: "verify" | "reject") {
    setBusyId(id);
    const res = await fetch("/api/admin/payments", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    setBusyId(null);
    if (!res.ok) {
      alert(await res.text());
      return;
    }
    await mutate("/api/admin/payments");
  }

  return (
    <section className="flex-1 p-4 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Payments (Admin)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && <p>Loading…</p>}
          {!isLoading && (!data || data.length === 0) && (
            <p className="text-sm text-muted-foreground">No payments.</p>
          )}
          {!isLoading && data && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left">
                  <tr>
                    <th className="py-2 pr-4">Team</th>
                    <th className="py-2 pr-4">Amount</th>
                    <th className="py-2 pr-4">Method</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">TxnRef</th>
                    <th className="py-2 pr-4">Proof</th>
                    <th className="py-2 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row) => (
                    <tr key={row.id} className="border-t">
                      <td className="py-2 pr-4">
                        {row.teamName ?? `#${row.teamId}`}
                      </td>
                      <td className="py-2 pr-4">₹{row.amount}</td>
                      <td className="py-2 pr-4">{row.method}</td>
                      <td className="py-2 pr-4 capitalize">{row.status}</td>
                      <td className="py-2 pr-4">{row.txnRef ?? "-"}</td>
                      <td className="py-2 pr-4">
                        {row.proofUrl ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => preview(row.proofUrl)}
                          >
                            Preview
                          </Button>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-2 pr-4 space-x-2">
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
