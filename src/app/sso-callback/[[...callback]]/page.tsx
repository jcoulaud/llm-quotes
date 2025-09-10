"use client";
import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="nb-container py-12">
      <div className="brutal-card max-w-xl mx-auto">
        <h1 className="nb-h2">Finishing sign in…</h1>
        <p className="subtitle mt-2">Please wait while we complete the redirect.</p>
        <div className="mt-6">
          <AuthenticateWithRedirectCallback />
        </div>
      </div>
    </div>
  );
}

