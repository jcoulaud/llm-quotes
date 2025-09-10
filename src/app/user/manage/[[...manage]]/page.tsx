import { UserProfile } from "@clerk/nextjs";

// Force dynamic rendering for this page to avoid SSG issues with Clerk
export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <div className="nb-container py-10 flex justify-center">
      <UserProfile />
    </div>
  );
}
