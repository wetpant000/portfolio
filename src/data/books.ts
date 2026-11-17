// ─────────────────────────────────────────────────────────────────────────────
// LIBRARY — books shown on the bookshelf.
//
// Books sync automatically from your Goodreads "read" and "currently-reading"
// shelves (via Goodreads' public bookshelf widgets) — refreshed every hour.
// Just add or finish a book on Goodreads.
//
// Optional: list extra books here, or override a book's status / rating.
// ─────────────────────────────────────────────────────────────────────────────

export const GOODREADS_USER_ID = "190059949";
export const GOODREADS_PROFILE = "https://www.goodreads.com/user/show/190059949-vijay";

export type ManualBook = {
  url: string;
  status: "read" | "reading";
  myRating?: 1 | 2 | 3 | 4 | 5;
};

export const myBooks: ManualBook[] = [
  // { url: "https://www.goodreads.com/book/show/5470.1984", status: "read", myRating: 5 },
];
