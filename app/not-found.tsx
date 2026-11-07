import Link from "next/link";

export default function NotFound() {
    return (
        <div data-full-width data-not-found className="flex flex-1 items-center justify-center px-6 pb-24 pt-[72px]">
            <div className="flex max-w-[480px] flex-col items-center text-center">
                <p className="font-mono text-[14px] text-accent">{"// error 404"}</p>
                <p aria-hidden="true" className="mt-3 font-mono text-[128px] font-medium leading-none tracking-[-0.04em] text-border max-[641px]:text-[96px]">
                    404
                </p>
                <h1 className="mt-5 bg-none text-[28px] font-bold leading-[1.2] tracking-[-0.02em] text-text">
                    This page could not be found.
                </h1>
                <p className="mt-3 text-base leading-normal text-muted">
                    The link may be broken, or the event may have been removed.
                </p>
                <Link href="/" className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-[10px] bg-accent px-[22px] text-base font-bold text-on-accent">
                    ← Back to events
                </Link>
            </div>
        </div>
    );
}
