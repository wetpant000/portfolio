import { getPosts, BLOG_URL } from "@/lib/blog";
import GameHeading from "@/components/game/GameHeading";
import Reveal from "@/components/game/Reveal";
import Journal from "@/components/game/Journal";

export default async function Blog() {
  const posts = await getPosts();
  return (
    <section id="blog" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 sm:px-8 sm:py-28">
      <GameHeading stage="STAGE 6" title="JOURNAL" sub="Entries from my blog — thoughts, college life and things I'm learning." />
      <Reveal>
        <Journal posts={posts} blogUrl={BLOG_URL} />
      </Reveal>
    </section>
  );
}
