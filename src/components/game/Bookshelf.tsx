"use client";

import { useEffect, useRef, useState } from "react";
import { X, Star, ExternalLink } from "lucide-react";
import type { Book } from "@/lib/goodreads";

const SPINE_COLORS = ["#b45309", "#0f766e", "#7c3aed", "#be123c", "#1d4ed8", "#4d7c0f", "#a16207", "#0e7490", "#9d174d"];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function spineStyle(b: Book) {
  const h = hash(b.title);
  return {
    color: SPINE_COLORS[h % SPINE_COLORS.length],
    height: 190 + (h % 5) * 12, // px
    width: Math.max(44, Math.min(72, Math.round((b.pages ?? 300) / 7))), // thicker books = wider spines
  };
}

function Stars({ value, outOf = 5 }: { value: number; outOf?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of ${outOf}`}>
      {Array.from({ length: outOf }, (_, i) => (
        <Star key={i} className="h-3.5 w-3.5" fill={i < Math.round(value) ? "currentColor" : "none"} />
      ))}
    </span>
  );
}

export default function Bookshelf({ books, profileUrl }: { books: Book[]; profileUrl: string }) {
  const shelfRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [shown, setShown] = useState(false);
  const [open, setOpen] = useState<Book | null>(null);

  // Books drop onto the shelf when it scrolls into view.
  useEffect(() => {
    const el = shelfRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <>
      <div ref={shelfRef} className="pixel-box overflow-hidden px-4 sm:px-8">
        <div className="flex min-h-[290px] items-end gap-1.5 overflow-x-auto pt-12 pb-0 [scrollbar-width:thin]">
          {/* Left bookend */}
          <span aria-hidden className="mr-2 h-24 w-5 shrink-0 bg-line" style={{ clipPath: "polygon(0 0, 100% 30%, 100% 100%, 0 100%)" }} />

          {books.map((b, i) => {
            const s = spineStyle(b);
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => setOpen(b)}
                aria-label={`Open ${b.title} by ${b.author}`}
                className={`book-spine group relative shrink-0 cursor-pointer ${shown ? "book-drop" : "opacity-0"}`}
                style={{ height: s.height, width: s.width, background: s.color, animationDelay: `${i * 140}ms` }}
              >
                {/* Decorative bands */}
                <span aria-hidden className="absolute inset-x-1 top-3 h-1 bg-white/35" />
                <span aria-hidden className="absolute inset-x-1 top-5 h-px bg-white/25" />
                <span aria-hidden className="absolute inset-x-1 bottom-8 h-px bg-white/25" />
                <span aria-hidden className="absolute inset-x-1 bottom-6 h-1 bg-white/35" />
                {/* Title running down the spine */}
                <span className="absolute inset-x-0 top-8 bottom-10 flex items-center justify-center overflow-hidden">
                  <span className="max-h-full truncate font-pixel text-[9px] leading-none text-white [writing-mode:vertical-rl]">
                    {b.title}
                  </span>
                </span>
                <span className="absolute inset-x-0 bottom-1.5 truncate px-1 text-center text-[8px] text-white/80">
                  {b.author.split(" ").slice(-1)[0]}
                </span>
                {b.status === "reading" && (
                  <>
                    <span aria-hidden className="absolute -top-0 right-2 h-10 w-2.5 bg-rose" style={{ clipPath: "polygon(0 0,100% 0,100% 100%,50% 80%,0 100%)" }} />
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-rose px-1.5 py-1 font-pixel text-[6px] whitespace-nowrap text-white">
                      READING
                    </span>
                  </>
                )}
              </button>
            );
          })}

          {/* Ghost spine: add more on Goodreads */}
          <a
            href={profileUrl}
            target="_blank"
            rel="noreferrer"
            className={`flex h-[190px] w-12 shrink-0 items-center justify-center border-2 border-dashed border-line text-muted transition-colors hover:border-accent hover:text-accent ${shown ? "book-drop" : "opacity-0"}`}
            style={{ animationDelay: `${books.length * 140}ms` }}
            title="See my Goodreads profile"
          >
            <span className="font-pixel text-[7px] [writing-mode:vertical-rl]">+ MORE ON GOODREADS</span>
          </a>

          <span className="flex-1" />
          {/* Right bookend */}
          <span aria-hidden className="ml-2 h-24 w-5 shrink-0 bg-line" style={{ clipPath: "polygon(0 30%, 100% 0, 100% 100%, 0 100%)" }} />
        </div>
        {/* Wooden plank */}
        <div aria-hidden className="-mx-4 h-5 border-t-4 border-wood-dark bg-wood sm:-mx-8" />
        <div aria-hidden className="-mx-4 h-3 bg-wood-dark sm:-mx-8" />
      </div>

      {books.length === 0 && (
        <p className="mt-6 text-center text-sm text-muted">The shelf is empty for now — books will appear here from Goodreads.</p>
      )}

      {/* Open book */}
      <dialog
        ref={dialogRef}
        onClose={() => setOpen(null)}
        onClick={(e) => e.target === dialogRef.current && setOpen(null)}
        className="m-auto w-[min(56rem,calc(100vw-2rem))] max-w-none bg-transparent p-0 text-foreground backdrop:bg-black/75 backdrop:backdrop-blur-sm"
      >
        {open && (
          <div className="book-open relative grid max-h-[90vh] overflow-y-auto [perspective:1600px] md:max-h-none md:grid-cols-2 md:overflow-visible">
            <button
              type="button"
              onClick={() => setOpen(null)}
              aria-label="Close book"
              className="absolute top-3 right-3 z-10 cursor-pointer border-2 border-line bg-panel p-1 text-muted hover:text-accent md:hidden"
            >
              <X className="h-4 w-4" />
            </button>
            {/* Left page: cover */}
            <div className="page-left flex items-center justify-center border-4 border-line bg-panel p-6 md:border-r-2">
              {open.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={open.cover}
                  alt={`Cover of ${open.title}`}
                  className="max-h-[34vh] w-auto shadow-[8px_8px_0_var(--shadow-c)] md:max-h-[52vh]"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex aspect-[2/3] w-48 items-center justify-center p-4 text-center font-pixel text-xs text-white" style={{ background: spineStyle(open).color }}>
                  {open.title}
                </div>
              )}
            </div>

            {/* Right page: details */}
            <div className="page-right flex flex-col md:max-h-[80vh] md:overflow-y-auto border-4 border-t-0 border-line bg-panel p-6 md:border-t-4 md:border-l-2 sm:p-8">
              <div className="mb-4 flex items-center justify-between gap-3">
                <span
                  className={`px-2 py-1.5 font-pixel text-[7px] ${open.status === "reading" ? "bg-rose text-white" : "bg-gold text-background"}`}
                >
                  {open.status === "reading" ? "CURRENTLY READING" : "✔ READ"}
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(null)}
                  aria-label="Close book"
                  className="hidden cursor-pointer border-2 border-line p-1 text-muted transition-colors hover:border-accent hover:text-accent md:block"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <h3 className="text-2xl leading-tight font-semibold">{open.title}</h3>
              <p className="mt-1 text-muted">by {open.author}</p>

              <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                {open.pages && (
                  <div className="border-2 border-line px-3 py-2">
                    <dt className="font-pixel text-[7px] text-muted">PAGES</dt>
                    <dd className="mt-1">{open.pages}</dd>
                  </div>
                )}
                {open.avgRating && (
                  <div className="border-2 border-line px-3 py-2">
                    <dt className="font-pixel text-[7px] text-muted">GOODREADS</dt>
                    <dd className="mt-1 flex items-center gap-2 text-gold">
                      <Stars value={open.avgRating} /> <span className="text-foreground">{open.avgRating.toFixed(2)}</span>
                    </dd>
                  </div>
                )}
                {open.myRating && (
                  <div className="border-2 border-line px-3 py-2">
                    <dt className="font-pixel text-[7px] text-muted">MY RATING</dt>
                    <dd className="mt-1 text-accent">
                      <Stars value={open.myRating} />
                    </dd>
                  </div>
                )}
                {open.published && (
                  <div className="border-2 border-line px-3 py-2">
                    <dt className="font-pixel text-[7px] text-muted">PUBLISHED</dt>
                    <dd className="mt-1">{open.published}</dd>
                  </div>
                )}
              </dl>

              {open.description && (
                <p className="mt-6 text-sm leading-relaxed whitespace-pre-line text-foreground/85">{open.description}</p>
              )}

              <a href={open.url} target="_blank" rel="noreferrer" className="pixel-btn mt-7 self-start">
                View on Goodreads <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
