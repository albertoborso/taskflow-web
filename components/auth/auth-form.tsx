"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { validateAuthInput, type AuthMode, type FieldErrors } from "@/lib/auth/validation";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const registering = mode === "register";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const input = Object.fromEntries(new FormData(form));
    const validated = validateAuthInput(input, mode);
    setMessage("");
    setFieldErrors(validated.errors ?? {});
    if (validated.errors) return;
    setPending(true);
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input), signal: AbortSignal.timeout(35_000),
      });
      const result = await response.json();
      if (!response.ok) {
        setMessage(result.message ?? "Unable to complete your request.");
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }
      form.reset();
      window.location.replace(registering ? "/login?registered=1" : "/dashboard");
    } catch {
      setMessage("Unable to connect. Please try again. If you were registering, try logging in before submitting again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form method="post" action={`/api/auth/${mode}`} onSubmit={submit} noValidate className="mt-8 space-y-5" aria-busy={pending}>
      <noscript><p role="alert">JavaScript is required to use TaskFlow. Enable it before submitting this form.</p></noscript>
      {message && <p role="alert" className="text-red-700 dark:text-red-400">{message}</p>}
      <fieldset disabled={pending} className="space-y-5 disabled:opacity-60">
        {(registering ? ["display_name", "email", "password"] as const : ["email", "password"] as const).map((field) => (
          <div key={field} className="space-y-2">
            <label htmlFor={field} className="block font-medium">{field === "display_name" ? "Name" : field === "email" ? "Email" : "Password"}</label>
            <input id={field} name={field} required
              type={field === "password" ? "password" : field === "email" ? "email" : "text"}
              autoComplete={field === "password" ? (registering ? "new-password" : "current-password") : field === "display_name" ? "nickname" : "email"}
              aria-invalid={Boolean(fieldErrors[field])}
              aria-describedby={fieldErrors[field] ? `${field}-error` : field === "password" && registering ? "password-hint" : undefined}
              className="w-full rounded-md border border-zinc-400 bg-transparent px-3 py-2 focus-visible:outline-2 focus-visible:outline-offset-2" />
            {field === "password" && registering && <p id="password-hint" className="text-sm text-zinc-600 dark:text-zinc-400">Use 15–128 characters.</p>}
            {fieldErrors[field] && <p id={`${field}-error`} role="alert" className="text-sm text-red-700 dark:text-red-400">{fieldErrors[field]}</p>}
          </div>
        ))}
        <button type="submit" className="rounded-md bg-foreground px-4 py-2 font-medium text-background disabled:opacity-60">
          {pending ? "Please wait…" : registering ? "Create account" : "Log in"}
        </button>
      </fieldset>
      <p><Link href={registering ? "/login" : "/register"} className="underline underline-offset-4">{registering ? "Already have an account? Log in" : "Create an account"}</Link></p>
    </form>
  );
}
