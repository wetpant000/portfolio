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

// Blurbs shown when a book is opened on the shelf. Keyed by the book title in
// lowercase with only letters and digits ("The Stranger" -> "thestranger").
// Add an entry when you add a new book on Goodreads; books without one show
// a "no blurb yet" note instead.
export const bookDetails: Record<string, { blurb: string; published: string; genres: string[]; author?: string }> = {
  "1984": {
    published: "1949",
    genres: ["Dystopian", "Classic", "Political fiction"],
    blurb:
      "Winston Smith works at the Ministry of Truth, rewriting history so it always agrees with the Party. In a world of constant surveillance, Newspeak and Big Brother, his quiet act of keeping a diary, and a forbidden love affair, becomes a rebellion against a state that wants to own every thought.",
  },
  thestranger: {
    published: "1942",
    genres: ["Philosophical fiction", "Absurdism", "Classic"],
    blurb:
      "Meursault, a detached clerk in French Algeria, attends his mother's funeral without tears and, days later, kills a man on a sun-blinded beach. His trial becomes less about the crime than about his refusal to pretend to feel what society expects. Camus's short, sharp introduction to the absurd.",
  },
  animalfarm: {
    published: "1945",
    genres: ["Political satire", "Allegory", "Classic"],
    blurb:
      "The animals of Manor Farm overthrow their human farmer and set out to build a society of equals. Slowly, the pigs who lead them rewrite the rules until \"all animals are equal, but some animals are more equal than others.\" A fable about how revolutions get betrayed.",
  },
  themetamorphosis: {
    published: "1915",
    genres: ["Novella", "Absurdist fiction", "Classic"],
    blurb:
      "Gregor Samsa, a travelling salesman who supports his whole family, wakes one morning transformed into a giant insect. Unable to work, he watches how quickly the people who depended on him turn away. A strange, unsettling story about duty, alienation and what makes us human.",
  },
  themonk: {
    published: "1796",
    genres: ["Gothic", "Horror", "Classic"],
    blurb:
      "Ambrosio, the most admired monk in Madrid, is famous for his virtue until temptation arrives in disguise. One compromise leads to another in a spiral of desire, cruelty and the supernatural. One of the wildest and most scandalous Gothic novels ever written.",
  },
};
