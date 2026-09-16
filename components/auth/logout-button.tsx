"use client";
import { useState } from "react";

export function LogoutButton() {
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  async function logout() {
    setPending(true);
    setFailed(false);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: "{}",
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) throw new Error("Logout failed");
      window.location.replace("/login");
    } catch {
      setFailed(true);
      setPending(false);
    }
  }
  return <div>
    <button type="button" disabled={pending} onClick={logout} className="underline underline-offset-4 disabled:opacity-60">{pending ? "Logging out…" : "Log out"}</button>
    {failed && <p role="alert">Unable to log out. Please try again.</p>}
  </div>;
}
