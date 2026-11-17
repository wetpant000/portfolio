"use client";

import { useEffect, useRef, useState } from "react";
import { X, ExternalLink, BookOpenText } from "lucide-react";
import type { Post } from "@/lib/blog";

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();

const PAGE = 6;

export default function Journal({ posts, blogUrl }: { posts: Post[]; blogUrl: string }) {
  const [shown, setShown] = useState(PAGE);
  const [open, setOpen] = useState<Post | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  if (posts.length === 0)
    return (
      <p className="text-center text-muted">
        No entries loaded right now —{" "}
        <a className="text-accent underline" href={blogUrl} target="_blank" rel="noreferrer">
          read the blog
        </a>
        .
      </p>
    );

  const [latest, ...rest] = posts;
  const total = posts.length;

  return (
    <>
      {/* Latest entry, featured */}
      <button
        type="button"
        onClick={() => setOpen(latest)}
        className="pixel-box lift group block w-full cursor-pointer p-6 text-left sm:p-8"
      >
        <div className="mb-4 flex flex-wrap items-center gap-3 font-pixel text-[8px]">
          <span className="bg-gold px-2 py-1.5 text-background">★ LATEST</span>
          <span className="text-muted">
            ENTRY {String(total).padStart(2, "0")} · {fmt(latest.published)} · {latest.readMins} MIN READ
          </span>
        </div>
        <h3 className="text-2xl font-semibold transition-colors group-hover:text-accent sm:text-3xl">{latest.title}</h3>
        <p className="mt-3 max-w-3xl leading-relaxed text-foreground/80">{latest.excerpt}</p>
        <span className="mt-5 inline-flex items-center gap-2 font-pixel text-[9px] text-accent">
          <BookOpenText className="h-4 w-4" /> READ ENTRY ▶
        </span>
      </button>

      {/* Older entries */}
      <ol className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {rest.slice(0, shown - 1).map((p, i) => (
          <li key={p.id} className="pop-in" style={{ animationDelay: `${(i % PAGE) * 50}ms` }}>
            <button
              type="button"
              onClick={() => setOpen(p)}
              className="pixel-box lift group flex h-full w-full cursor-pointer flex-col p-5 text-left"
            >
              <span className="font-pixel text-[7px] text-muted">
                ENTRY {String(total - 1 - i).padStart(2, "0")} · {fmt(p.published)}
              </span>
              <span className="mt-3 text-lg leading-snug font-semibold transition-colors group-hover:text-accent">{p.title}</span>
              <span className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{p.excerpt}</span>
              <span className="mt-auto pt-4 font-pixel text-[7px] text-accent">{p.readMins} MIN · READ ▶</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        {shown < total && (
          <button type="button" onClick={() => setShown((n) => n + PAGE)} className="pixel-btn">
            ▼ Load more entries
          </button>
        )}
        <a href={blogUrl} target="_blank" rel="noreferrer" className="font-pixel text-[8px] text-muted transition-colors hover:text-accent">
          VISIT THE BLOG ↗
        </a>
      </div>

      {/* Reader */}
      <dialog
        ref={dialogRef}
        onClose={() => setOpen(null)}
        onClick={(e) => e.target === dialogRef.current && setOpen(null)}
        className="m-auto w-[min(44rem,calc(100vw-2rem))] max-w-none bg-transparent p-0 text-foreground backdrop:bg-black/75 backdrop:backdrop-blur-sm"
      >
        {open && (
          <article className="page-right pixel-box max-h-[85vh] overflow-y-auto p-6 sm:p-10">
            <div className="mb-6 flex items-start justify-between gap-4">
              <p className="font-pixel text-[8px] leading-relaxed text-muted">
                {fmt(open.published)} · {open.readMins} MIN READ
              </p>
              <button
                type="button"
                onClick={() => setOpen(null)}
                aria-label="Close entry"
                className="cursor-pointer border-2 border-line p-1 text-muted transition-colors hover:border-accent hover:text-accent"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <h3 className="text-2xl leading-tight font-semibold sm:text-3xl">{open.title}</h3>
            <div className="mt-6 space-y-4 leading-relaxed text-foreground/85">
              {open.paragraphs.map((para, i) => (
                <p key={i} className="whitespace-pre-line">
                  {para}
                </p>
              ))}
            </div>
            <a href={open.url} target="_blank" rel="noreferrer" className="pixel-btn mt-8">
              Open on Blogger <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </article>
        )}
      </dialog>
    </>
  );
}
