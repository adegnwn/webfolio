"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useEditor } from "@/stores/editor";

type Status = "idle" | "copied" | "failed";

/** PRD 3.3 toolbar: copies the current ShowreelConfig for backup or for developers. */
export function CopyJsonButton() {
  const config = useEditor((s) => s.config);
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    if (status === "idle") return;
    const t = setTimeout(() => setStatus("idle"), 2000);
    return () => clearTimeout(t);
  }, [status]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(config, null, 2));
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
  }

  return (
    <>
      <Button size="sm" onClick={copy}>
        {status === "copied" ? "JSON tersalin" : status === "failed" ? "Gagal menyalin" : "Salin JSON"}
      </Button>
      <span role="status" className="sr-only">
        {status === "copied" ? "Konfigurasi tersalin ke clipboard" : status === "failed" ? "Browser menolak akses clipboard" : ""}
      </span>
    </>
  );
}
