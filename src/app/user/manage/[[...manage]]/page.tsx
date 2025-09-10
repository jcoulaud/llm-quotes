import { UserProfile } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="nb-container py-10 flex justify-center">
      <UserProfile />
    </div>
  );
}
