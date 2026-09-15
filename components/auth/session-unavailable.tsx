import { LogoutButton } from "./logout-button";

export function SessionUnavailable({ requestId }: { requestId?: string }) {
  return <section className="space-y-4" aria-labelledby="session-unavailable">
    <h1 id="session-unavailable" className="text-2xl font-semibold">Account services unavailable</h1>
    <p role="alert">We could not verify your session. Your session has been kept. Please try again.</p>
    {requestId && <p className="text-sm">Support reference: {requestId}</p>}
    <a href="" className="inline-block underline underline-offset-4">Try again</a>
    <LogoutButton />
  </section>;
}
