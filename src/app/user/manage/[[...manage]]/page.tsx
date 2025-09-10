import { UserProfile } from "@clerk/nextjs";

// Force dynamic rendering for this page to avoid SSG issues with Clerk
export const dynamic = 'force-dynamic';

export default function Page() {
  const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  if (!hasClerk) {
    return (
      <div className="nb-container py-10 flex justify-center">
        <div className="brutal-card max-w-2xl">
          <div className="nb-h2">Profile</div>
          <p className="subtitle mt-1">Authentication is not configured.</p>
          <p className="mt-3 text-sm opacity-80">
            This deployment does not have Clerk configured. Please set the necessary env vars to enable the user profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="nb-container py-10 flex justify-center">
      <UserProfile />
    </div>
  );
}
