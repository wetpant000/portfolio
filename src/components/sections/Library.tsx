import { getBooks } from "@/lib/goodreads";
import { GOODREADS_PROFILE } from "@/data/books";
import GameHeading from "@/components/game/GameHeading";
import Reveal from "@/components/game/Reveal";
import Bookshelf from "@/components/game/Bookshelf";

export default async function Library() {
  const books = await getBooks();
  const read = books.filter((b) => b.status === "read").length;
  const reading = books.length - read;

  return (
    <section id="library" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 sm:py-28 sm:px-8">
      <GameHeading stage="STAGE 5" title="LIBRARY" sub="Books from my Goodreads shelf. Pull one out to open it." />
      <Reveal>
        <div className="mb-4 flex flex-wrap justify-between gap-2 font-pixel text-[8px] text-muted">
          <span>
            READ: <span className="text-gold">{read}</span> · READING: <span className="text-rose">{reading}</span>
          </span>
          <a href={GOODREADS_PROFILE} target="_blank" rel="noreferrer" className="transition-colors hover:text-accent">
            GOODREADS ↗
          </a>
        </div>
        <Bookshelf books={books} profileUrl={GOODREADS_PROFILE} />
      </Reveal>
    </section>
  );
}
