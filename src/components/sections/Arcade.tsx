import GameHeading from "@/components/game/GameHeading";
import Reveal from "@/components/game/Reveal";
import BugHunt from "@/components/game/BugHunt";

export default function Arcade() {
  return (
    <section id="arcade" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 sm:py-28 sm:px-8">
      <GameHeading stage="BONUS STAGE" title="ARCADE" sub="Take a break. Squash some bugs. Try not to squash the features." />
      <Reveal>
        <BugHunt />
      </Reveal>
    </section>
  );
}
