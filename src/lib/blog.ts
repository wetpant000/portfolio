import "server-only";

export const BLOG_URL = "https://kvijaykumars.blogspot.com/";

export type Post = {
  id: string;
  title: string;
  url: string;
  published: string; // ISO date
  paragraphs: string[];
  excerpt: string;
  readMins: number;
};

type FeedEntry = {
  id: { $t: string };
  title: { $t: string };
  published: { $t: string };
  link: { rel: string; href: string }[];
  content?: { $t: string };
  summary?: { $t: string };
};

const decode = (s: string) =>
  s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&amp;/g, "&");

/** Blogger HTML -> plain-text paragraphs (rendered as text, never as HTML). */
function toParagraphs(html: string) {
  const text = decode(
    html
      .replace(/<(script|style)[\s\S]*?<\/\1>/gi, "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|h[1-6]|li|blockquote)>/gi, "\n\n")
      .replace(/<li[^>]*>/gi, "• ")
      .replace(/<[^>]+>/g, ""),
  );
  return text
    .split(/\n\s*\n+/)
    .map((p) => p.replace(/[ \t]+/g, " ").replace(/\s*\n\s*/g, "\n").trim())
    .filter(Boolean);
}

/** Latest posts from the Blogger feed, newest first. Refreshed hourly. Never throws. */
export async function getPosts(): Promise<Post[]> {
  try {
    const res = await fetch(`${BLOG_URL}feeds/posts/default?alt=json&max-results=50`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { feed?: { entry?: FeedEntry[] } };
    return (data.feed?.entry ?? []).map((e) => {
      const paragraphs = toParagraphs(e.content?.$t ?? e.summary?.$t ?? "");
      const words = paragraphs.join(" ").split(/\s+/).filter(Boolean).length;
      const flat = paragraphs.join(" ");
      return {
        id: e.id.$t.split("post-").pop() ?? e.id.$t,
        title: decode(e.title.$t).trim() || "Untitled",
        url: e.link.find((l) => l.rel === "alternate")?.href ?? BLOG_URL,
        published: e.published.$t,
        paragraphs,
        excerpt: flat.length > 170 ? `${flat.slice(0, 170).replace(/\s+\S*$/, "")}…` : flat,
        readMins: Math.max(1, Math.round(words / 200)),
      };
    });
  } catch {
    return [];
  }
}
