"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import useSWR from "swr";

const fetcher = (u: string) => fetch(u).then((r) => r.json());

export default function BannedNamesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [count, setCount] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function parseAndSend() {
    if (!file) return;
    setBusy(true);
    setMsg(null);
    try {
      const buf = await file.arrayBuffer();
      let words: string[] = [];

      if (file.name.toLowerCase().endsWith(".csv")) {
        const text = new TextDecoder().decode(new Uint8Array(buf));
        words = text
          .split(/\r?\n/)
          .map((l) => l.split(",")[0])
          .map((s) => s?.trim())
          .filter(Boolean);
      } else {
        const wb = XLSX.read(buf, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const arr = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
        words = arr
          .map((row) => String(row?.[0] ?? ""))
          .map((s) => s.trim())
          .filter(Boolean);
      }

      const res = await fetch("/api/admin/banned-names/import", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ words, sourceFile: file.name }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setCount(data.inserted);
      setMsg(`✅ Imported ${data.inserted} entries.`);
    } catch (e: any) {
      setMsg(`❌ ${e?.message || "Import failed"}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="flex-1 p-4 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Banned Names Import</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Upload a CSV or XLSX file (first column = word). Existing entries
            with the same normalized value will be replaced.
          </p>
          <Input
            type="file"
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <Button onClick={parseAndSend} disabled={!file || busy}>
            {busy ? "Importing…" : "Import"}
          </Button>
          {msg && <p className="text-sm mt-2">{msg}</p>}
        </CardContent>
      </Card>
    </section>
  );
}
