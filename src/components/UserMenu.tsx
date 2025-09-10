"use client";
import { useEffect, useRef, useState } from "react";
import { useUser, SignOutButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";

export function UserMenu() {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const name = user?.fullName || user?.username || "Account";
  const avatar = user?.imageUrl;

  return (
    <div className="relative z-[1000]" ref={ref}>
      <button
        className="nb-avatar-btn flex items-center"
        onClick={() => setOpen(v => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {avatar ? (
          <Image
            src={avatar}
            alt="Avatar"
            width={36}
            height={36}
            className="rounded-full nb-border-strong nb-shadow-yellow-sm"
          />
        ) : (
          <span className="badge">{name[0]?.toUpperCase()}</span>
        )}
      </button>
      {open && (
        <div className="nb-dropdown" role="menu" aria-label="User menu">
          <div className="nb-dropdown-header">
            {avatar && (
              <Image
                src={avatar}
                alt="Avatar"
                width={44}
                height={44}
                className="rounded-full nb-border-strong nb-shadow-yellow-sm"
              />
            )}
            <div className="min-w-0">
              <div className="font-extrabold truncate">{name}</div>
            </div>
          </div>
          <Link href="/favorites" className="nb-dropdown-item" onClick={() => setOpen(false)}>
            Favorites
          </Link>
          <Link href="/user" className="nb-dropdown-item" onClick={() => setOpen(false)}>
            Manage account
          </Link>
          <SignOutButton>
            <button className="nb-dropdown-item w-full text-left" onClick={() => setOpen(false)}>
              Sign out
            </button>
          </SignOutButton>
        </div>
      )}
    </div>
  );
}
