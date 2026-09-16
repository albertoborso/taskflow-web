"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { mutateProject } from "@/lib/api/projects";
import { ApiError } from "@/lib/api/error";

export function DeleteProject({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [requestId, setRequestId] = useState<string>();
  async function remove() {
    if (pending) return;
    setPending(true); setMessage(""); setRequestId(undefined);
    try {
      await mutateProject("DELETE", id);
      router.replace("/dashboard"); router.refresh();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Unable to delete the project.");
      if (error instanceof ApiError) setRequestId(error.requestId);
      setPending(false);
    }
  }
  return <section className="space-y-3 border-t border-zinc-300 pt-6">
    <h2 className="text-xl font-semibold">Delete project</h2>
    {!confirming ? <button type="button" onClick={() => setConfirming(true)} className="underline underline-offset-4">Delete project</button> : <>
      <p>Delete “{name}”? This cannot be undone.</p>
      <div className="flex gap-4">
        <button type="button" disabled={pending} onClick={remove} className="rounded bg-red-700 px-4 py-2 text-white disabled:opacity-60">{pending ? "Deleting…" : "Confirm deletion"}</button>
        <button type="button" disabled={pending} onClick={() => setConfirming(false)} className="underline">Cancel</button>
      </div>
    </>}
    {message && <p role="alert">{message}</p>}
    {requestId && <p className="text-sm">Support reference: {requestId}</p>}
  </section>;
}
