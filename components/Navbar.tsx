"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useNavbarLock } from "@/lib/context/navbar-lock-context";

type NavLink = "home" | "events" | "create";

const Navbar = () => {
    const { isNavbarDisabled } = useNavbarLock();
    const pathname = usePathname();
    const router = useRouter();
    // Controls the mobile dropdown menu.
    const [isOpen, setIsOpen] = useState(false);
    const [activeLink, setActiveLink] = useState<NavLink>("home");

    // This function determines which link should be active based on the URL.
    const getActiveLink = (currentPathname: string, hash?: string): NavLink => {
        if (currentPathname === "/events/create") return "create";
        if (currentPathname.startsWith("/events")) return "events";
        if (currentPathname === "/" && hash === "#events") return "events";
        return "home";
    };

    // It is used to sync the active navbar link with the current URL.
    useEffect(() => {
        const syncActiveLink = () => {
            const hash = window.location.hash;
            setActiveLink(getActiveLink(pathname, hash));
        };

        syncActiveLink();
        window.addEventListener("hashchange", syncActiveLink);
        return () => window.removeEventListener("hashchange", syncActiveLink);
    }, [pathname]);

    const isHome = activeLink === "home";
    const navStateClass = isOpen ? "nav-menu-open" : "nav-menu-closed";
    const getLinkClass = (linkName: NavLink) =>
        activeLink === linkName ? "nav-cta" : "nav-link";

    const guardNav = (e: React.MouseEvent<HTMLElement>) => {
        if (!isNavbarDisabled) return false;
        e.preventDefault();
        e.stopPropagation();
        return true;
    };

    const handleGoHome = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (guardNav(e)) return;
        e.preventDefault();
        setIsOpen(false);
        setActiveLink("home");

        if (pathname === "/") {
            if (window.location.hash) {
                window.history.replaceState(null, "", window.location.pathname + window.location.search);
            }
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
            router.push("/");
            // After navigation, scroll to top
            setTimeout(() => window.scrollTo({ top: 0, behavior: "instant" }), 0);
        }
    };

    return (
        <header>
            <nav aria-label="Main navigation" className="relative">
                <Link href='/' className="logo" onClick={handleGoHome}>
                    <Image src="/icons/logo.png" alt="logo" width={24} height={24} />
                    <p>DevEvent</p>
                </Link>

                <button
                    type="button"
                    className="nav-menu-btn"
                    disabled={isNavbarDisabled}
                    aria-disabled={isNavbarDisabled}
                    onClick={() => {
                        if (isNavbarDisabled) return;
                        setIsOpen((prev) => !prev);
                    }}
                    aria-expanded={isOpen}
                    aria-controls="main-nav-links"
                    aria-label="Toggle menu"
                >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <rect y="3" width="20" height="2" rx="1" fill="currentColor" />
                        <rect y="9" width="20" height="2" rx="1" fill="currentColor" />
                        <rect y="15" width="20" height="2" rx="1" fill="currentColor" />
                    </svg>
                </button>

                <ul
                    id="main-nav-links"
                    className={`${navStateClass} nav-menu`}
                >
                    <li>
                        <Link
                            href="/"
                            className={getLinkClass("home")}
                            aria-current={isHome ? "page" : undefined}
                            onClick={handleGoHome}
                        >
                            Home
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/#events"
                            className={getLinkClass("events")}
                            onClick={(e) => {
                                if (guardNav(e)) return;
                                setIsOpen(false);
                                setActiveLink("events");
                            }}
                        >
                            Events
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/events/create"
                            className={getLinkClass("create")}
                            onClick={(e) => {
                                if (guardNav(e)) return;
                                setIsOpen(false);
                                setActiveLink("create");
                            }}
                        >
                            Create Event
                        </Link>
                    </li>
                </ul>
            </nav>
        </header>
    )
}
export default Navbar
