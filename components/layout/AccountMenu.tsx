"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";

export type AccountUser = {
    name: string | null;
    email: string | null;
};

const getInitials = ({ name, email }: AccountUser) => {
    const words = (name ?? "").trim().split(/\s+/).filter(Boolean);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return (words[0] ?? email ?? "?").slice(0, 2).toUpperCase();
};

const ITEM_CLASSES = "flex min-h-11 w-full cursor-pointer items-center rounded-[8px] px-3 text-left text-[15px]";

const AccountMenu = ({ user }: { user: AccountUser }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLSpanElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;

        const items = () => [...(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])];
        items()[0]?.focus();

        const handlePointerDown = (e: PointerEvent) => {
            if (!containerRef.current?.contains(e.target as Node)) setIsOpen(false);
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsOpen(false);
                buttonRef.current?.focus();
            }
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                e.preventDefault();
                const all = items();
                const step = e.key === "ArrowDown" ? 1 : -1;
                const current = all.indexOf(document.activeElement as HTMLElement);
                all[(current + step + all.length) % all.length]?.focus();
            }
        };

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen]);

    const close = () => setIsOpen(false);

    return (
        <span ref={containerRef} className="relative ml-2">
            <button
                ref={buttonRef}
                type="button"
                aria-expanded={isOpen}
                aria-haspopup="menu"
                aria-label="Account menu"
                onClick={() => setIsOpen((open) => !open)}
                className="size-11 cursor-pointer rounded-full border border-border bg-[#1C211E] font-mono text-[14px] font-medium text-accent"
            >
                {getInitials(user)}
            </button>
            {isOpen && (
                <div
                    ref={menuRef}
                    role="menu"
                    className="absolute right-0 top-[52px] z-20 w-60 rounded-[12px] border border-border bg-surface p-2 shadow-[0_12px_32px_rgba(0,0,0,0.5)]"
                >
                    <div className="mb-1.5 border-b border-line px-3 pb-3 pt-2.5">
                        <div className="break-words font-bold">{user.name}</div>
                        <div className="break-words text-[13px] text-muted">{user.email}</div>
                    </div>
                    <Link role="menuitem" href="/me?tab=hosting" onClick={close} className={`${ITEM_CLASSES} text-text`}>
                        Events I&apos;m hosting
                    </Link>
                    <Link role="menuitem" href="/me?tab=booked" onClick={close} className={`${ITEM_CLASSES} text-text`}>
                        My bookings
                    </Link>
                    <button
                        type="button"
                        role="menuitem"
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className={`${ITEM_CLASSES} text-muted`}
                    >
                        Sign out
                    </button>
                </div>
            )}
        </span>
    );
};

export default AccountMenu;
