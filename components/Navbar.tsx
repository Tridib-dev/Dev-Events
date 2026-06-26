// components/Navbar.tsx

'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

interface NavLink {
    label: string;
    href: string;
}

const NAV_LINKS: NavLink[] = [
    { label: "Home", href: "/" },
    { label: "Discover", href: "/events/discover" },
    { label: "Create Event", href: "/create_event" },
];

const Navbar = () => {
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);
    const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false });

    const containerRef = useRef<HTMLDivElement>(null);
    const linkRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
    const [mobileOpen, setMobileOpen] = useState(false);

    const activeHref =
        NAV_LINKS.find((link) => link.href === pathname)?.href ??
        NAV_LINKS.find((link) => link.href !== "/" && pathname?.startsWith(link.href))?.href ??
        "";

    const measureIndicator = () => {
        const activeEl = linkRefs.current.get(activeHref);
        const container = containerRef.current;
        if (!activeEl || !container) {
            setIndicator((prev) => ({ ...prev, ready: false }));
            return;
        }
        setIndicator({
            left: activeEl.offsetLeft,
            width: activeEl.offsetWidth,
            ready: true,
        });
    };

    useLayoutEffect(() => {
        measureIndicator();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeHref]);

    useEffect(() => {
        const handleResize = () => measureIndicator();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeHref]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 8);
        handleScroll();
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header className="navbar-wrapper">
            <nav className={`navbar-floating ${scrolled ? "navbar-scrolled" : ""}`}>
              <Link href="/" className="logo">
                  <Image src="/icons/logo.png" alt="Logo" width={24} height={24}/>
                  <p>DevEvent</p>
              </Link>
                <div className="navbar-links-desktop" ref={containerRef}>
                    {indicator.ready && (
                        <div
                            className="navbar-pill-indicator"
                            style={{ transform: `translateX(${indicator.left}px)`, width: indicator.width }}
                        />
                    )}
                    {NAV_LINKS.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          ref={(el) => {
                            if (el) linkRefs.current.set(link.href, el);
                          }}
                            className={`navbar-link ${activeHref === link.href ? "navbar-link-active" : ""}`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                <button
                    type="button"
                    className="navbar-mobile-toggle"
                    onClick={() => setMobileOpen((prev) => !prev)}
                    aria-label="Toggle navigation menu"
                >
                    {mobileOpen ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M4 7H20M4 12H20M4 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    )}
                </button>
            </nav>

            {mobileOpen && (
                <>
                    {/* Backdrop - Click anywhere to close */}
                    <div
                        className="fixed inset-0 bg-black/60 z-40 md:hidden"
                        onClick={() => setMobileOpen(false)}
                    />

                    {/* Mobile Menu */}
                    <div className="navbar-mobile-menu z-50">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className={`navbar-mobile-link ${activeHref === link.href ? "navbar-mobile-link-active" : ""}`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </>
            )}
        </header>
    );
};

export default Navbar;