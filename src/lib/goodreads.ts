import "server-only";
import { GOODREADS_USER_ID, GOODREADS_PROFILE, myBooks } from "@/data/books";

export type Book = {
  id: string;
  url: string;
  title: string;
  author: string;
  cover?: string;
  description?: string;
  pages?: number;
  avgRating?: number;
  published?: string;
  status: "read" | "reading";
  myRating?: number;
};

/*
 * Where the books come from
 * ─────────────────────────
 * Your Goodreads shelves are private, so the shelf pages and RSS feed are
 * blocked. Goodreads' official *bookshelf widgets* still publish them, so we read:
 *   1. grid_widget   → every book on "read" and "currently-reading" (title + cover)
 *   2. custom_widget → authors and your star ratings for the "read" shelf
 *   3. book pages    → description, pages, rating (best effort; skipped if Goodreads rate-limits)
 * Add/finish a book on Goodreads and it shows up here within an hour.
 */

const REVALIDATE = 60 * 60; // refresh hourly
const HEADERS = { "User-Agent": "portfolio-bookshelf (+https://github.com/wetpant000)" };

async function get(url: string): Promise<{ status: number; text: string } | null> {
  try {
    const res = await fetch(url, { headers: HEADERS, next: { revalidate: REVALIDATE }, signal: AbortSignal.timeout(10_000) });
    return { status: res.status, text: await res.text() };
  } catch {
    return null;
  }
}

const decode = (s: string) =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");

const toText = (html: string) =>
  decode(
    decode(html)
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<[^>]+>/g, ""),
  )
    .replace(/^.*(alternate cover edition|librarian'?s note).*$/gim, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

/** The widget returns `var widget_code = '…'` — unescape the JS string into HTML. */
const unwrapWidget = (js: string) =>
  js.replace(/\\"/g, '"').replace(/\\\//g, "/").replace(/\\n/g, "\n").replace(/\\'/g, "'");

/** Cover file names carry the book id: …/books/1646444605l/485894._SY75_.jpg */
const idFromCover = (src: string) => src.match(/\/(\d+)\.(?:_[A-Z0-9]+_\.)?(?:jpg|png)/i)?.[1];
const bigCover = (src: string) => src.replace(/\._S[XY]\d+_\./, ".");
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");

type WidgetBook = { title: string; reviewUrl: string; cover?: string; id?: string; author?: string; myRating?: number };

async function gridWidget(shelf: "read" | "currently-reading"): Promise<WidgetBook[]> {
  const res = await get(`https://www.goodreads.com/review/grid_widget/${GOODREADS_USER_ID}?shelf=${shelf}&num_books=100&order=d&sort=date_read`);
  if (!res || res.status !== 200) return [];
  const html = unwrapWidget(res.text);
  return [...html.matchAll(/<a title="([^"]*)" rel="nofollow" href="([^"]*)"><img alt="[^"]*" border="0" src="([^"]*)"/g)].map(
    ([, title, href, src]) => ({
      title: decode(title),
      reviewUrl: decode(href).replace(/\?.*$/, ""),
      cover: bigCover(src),
      id: idFromCover(src),
    }),
  );
}

/** Authors + your ratings (the custom widget shows the "read" shelf). */
async function customWidget(): Promise<Map<string, { author?: string; myRating?: number }>> {
  const out = new Map<string, { author?: string; myRating?: number }>();
  const res = await get(`https://www.goodreads.com/review/custom_widget/${GOODREADS_USER_ID}.read?shelf=read&num_books=100&widget_id=1`);
  if (!res || res.status !== 200) return out;
  const html = unwrapWidget(res.text);
  for (const block of html.split('class="gr_custom_each_container_1"').slice(1)) {
    const href = block.match(/href="(https:\/\/www\.goodreads\.com\/review\/show\/\d+)/)?.[1];
    const author = block.match(/gr_custom_author_1">\s*by <a[^>]*>([^<]*)<\/a>/)?.[1];
    const stars = (block.match(/star_active/g) ?? []).length;
    if (href) out.set(href, { author: author ? decode(author) : undefined, myRating: stars || undefined });
  }
  return out;
}

/** Authors of "currently reading" books, from the public profile page (book id -> author). */
async function profileAuthors(): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  const res = await get(GOODREADS_PROFILE);
  if (!res || res.status !== 200) return out;
  for (const m of res.text.matchAll(/class="bookTitle" href="\/book\/show\/(\d+)[^"]*">[\s\S]{0,300}?class="authorName"[^>]*>([^<]*)</g)) {
    out.set(m[1], decode(m[2]));
  }
  return out;
}

/** Extra details from the public book page. Returns null if unavailable (e.g. rate-limited). */
async function bookPage(id: string) {
  const res = await get(`https://www.goodreads.com/book/show/${id}`);
  if (!res || res.status !== 200) return null;
  const html = res.text;
  const ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  let data: {
    name?: string;
    image?: string;
    numberOfPages?: number;
    author?: { name: string }[] | { name: string };
    aggregateRating?: { ratingValue?: number };
  } = {};
  try {
    data = ld ? JSON.parse(ld[1]) : {};
  } catch {}
  if (!data.name) return null;
  const desc = html.match(/data-testid="description"[\s\S]*?<span class="Formatted">([\s\S]*?)<\/span>/);
  const pub = html.match(/data-testid="publicationInfo">([^<]*)</);
  const author = Array.isArray(data.author) ? data.author[0]?.name : data.author?.name;
  return {
    title: decode(data.name),
    author: author ? decode(author) : undefined,
    cover: data.image,
    description: desc ? toText(desc[1]) : undefined,
    pages: data.numberOfPages,
    avgRating: data.aggregateRating?.ratingValue,
    published: pub ? decode(pub[1]).replace(/^First published\s*/i, "") : undefined,
  };
}

async function enrich(w: WidgetBook, status: Book["status"]): Promise<Book> {
  const book: Book = {
    id: w.id ?? w.reviewUrl,
    url: w.id ? `https://www.goodreads.com/book/show/${w.id}` : w.reviewUrl,
    title: w.title,
    author: w.author ?? "",
    cover: w.cover,
    status,
    myRating: w.myRating,
  };
  if (!w.id) return book;
  const page = await bookPage(w.id);
  // Only trust the page if it is really the same book.
  if (page && (norm(page.title).includes(norm(w.title)) || norm(w.title).includes(norm(page.title)))) {
    book.author ||= page.author ?? "";
    book.cover = page.cover ?? book.cover;
    book.description = page.description;
    book.pages = page.pages;
    book.avgRating = page.avgRating;
    book.published = page.published;
  } else if (!page) {
    book.url = w.reviewUrl; // book id unconfirmed — link to your Goodreads entry instead
  }
  return book;
}

/** All books for the shelf: currently reading first, then read. Never throws. */
export async function getBooks(): Promise<Book[]> {
  const [reading, read, meta, authors] = await Promise.all([
    gridWidget("currently-reading"),
    gridWidget("read"),
    customWidget(),
    profileAuthors(),
  ]);
  for (const b of read) Object.assign(b, meta.get(b.reviewUrl) ?? {});
  for (const b of reading) if (b.id && authors.has(b.id)) b.author = authors.get(b.id);

  // Fetch details one at a time to stay gentle on Goodreads.
  const books: Book[] = [];
  for (const w of reading) books.push(await enrich(w, "reading"));
  for (const w of read) books.push(await enrich(w, "read"));

  // Manual extras from src/data/books.ts.
  for (const m of myBooks) {
    const id = m.url.match(/book\/show\/(\d+)/)?.[1];
    const existing = books.find((b) => b.id === id);
    if (existing) {
      existing.status = m.status;
      if (m.myRating) existing.myRating = m.myRating;
    } else if (id) {
      const page = await bookPage(id);
      if (page) books.push({ ...page, id, url: m.url, author: page.author ?? "", status: m.status, myRating: m.myRating });
    }
  }

  const seen = new Set<string>();
  return books
    .filter((b) => (seen.has(b.id) ? false : (seen.add(b.id), true)))
    .sort((a, b) => (a.status === b.status ? 0 : a.status === "reading" ? -1 : 1));
}
