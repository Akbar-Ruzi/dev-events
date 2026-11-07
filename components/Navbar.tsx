"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AccountMenu, { type AccountUser } from "@/components/AccountMenu";
import { useNavbarLock } from "@/lib/context/navbar-lock-context";

const getActiveHref = (pathname: string) => {
    if (pathname.startsWith("/auth")) return "/auth/sign-in";
    if (pathname.startsWith("/calendar")) return "/calendar";
    if (pathname.startsWith("/me")) return "/me";
    if (pathname === "/events/create" || pathname.endsWith("/edit")) return null;
    if (pathname === "/" || pathname.startsWith("/events")) return "/";
    return null;
};

const Navbar = ({ user }: { user: AccountUser | null }) => {
    const { isNavbarDisabled } = useNavbarLock();
    const activeHref = getActiveHref(usePathname());

    const links = [
        { href: "/", label: "Events" },
        { href: "/calendar", label: "Calendar" },
        user ? { href: "/me", label: "My events" } : { href: "/auth/sign-in", label: "Sign in" },
    ];

    // Stops every header link and button while a form is submitting.
    const blockWhileLocked = (e: React.MouseEvent) => {
        if (!isNavbarDisabled) return;
        e.preventDefault();
        e.stopPropagation();
    };

    return (
        <header className="border-b border-line" onClickCapture={blockWhileLocked}>
            <div className="mx-auto flex max-w-[1248px] [body:has([data-not-found]:not([style*=none]))_&]:max-w-[1200px] flex-wrap items-center justify-between gap-4 px-6 py-4 max-[641px]:gap-x-2 max-[641px]:gap-y-1.5 max-[641px]:px-4 max-[641px]:py-3 max-[641px]:after:order-1 max-[641px]:after:basis-full max-[641px]:after:content-['']">
                <Link href="/" className="flex min-h-11 items-center gap-2.5 text-xl font-bold">
                    <span aria-hidden="true" className="flex size-8 items-center justify-center rounded-[8px] bg-accent text-[16px] tracking-[-0.02em] text-on-accent">
                        SM
                    </span>
                    {/* The avatar needs this room on narrow phones. Screen readers still get the name. */}
                    <span className={user ? "max-[368px]:sr-only" : undefined}>StackMeet</span>
                </Link>
                <nav aria-label="Main" className="flex flex-wrap items-center gap-1 text-[15px] max-[641px]:contents">
                    {links.map(({ href, label }) => {
                        const isActive = activeHref === href;
                        return (
                            <Link
                                key={href}
                                href={href}
                                aria-current={isActive ? "page" : undefined}
                                className={`px-3.5 py-3 max-[641px]:order-2 max-[641px]:flex max-[641px]:min-h-11 max-[641px]:flex-[1_1_0] max-[641px]:items-center max-[641px]:justify-center max-[641px]:px-2 max-[641px]:py-2.5 max-[641px]:whitespace-nowrap ${isActive ? "font-bold text-accent" : "text-text"}`}
                            >
                                {label}
                            </Link>
                        );
                    })}
                    <Link
                        href="/events/create"
                        className="ml-1.5 rounded-[8px] bg-accent px-[18px] py-3 font-bold text-on-accent max-[641px]:ml-auto max-[641px]:px-3.5 max-[641px]:py-2.5"
                    >
                        Create event
                    </Link>
                    {user && <AccountMenu user={user} />}
                </nav>
            </div>
        </header>
    );
};

export default Navbar;
