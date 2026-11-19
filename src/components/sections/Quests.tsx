import { projects, profile } from "@/data/profile";
import GameHeading from "@/components/game/GameHeading";
import Reveal from "@/components/game/Reveal";
import LevelSelect from "@/components/game/LevelSelect";

export default function Quests() {
  // Main quests first, bonus (side) quests after.
  const ordered = [...projects.filter((p) => p.featured), ...projects.filter((p) => !p.featured)];
  return (
    <section id="work" className="relative mx-auto max-w-6xl scroll-mt-20 px-5 py-16 sm:px-8 sm:py-28">
      <GameHeading stage="STAGE 3" title="LEVEL SELECT" sub="Pick a cartridge to load a project and watch it run." />
      <Reveal>
        <LevelSelect projects={ordered} githubUrl={profile.links.github} handle={profile.handle} />
      </Reveal>
    </section>
  );
}
