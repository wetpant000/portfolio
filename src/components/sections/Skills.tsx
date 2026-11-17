import { skills } from "@/data/profile";
import GameHeading from "@/components/game/GameHeading";
import Reveal from "@/components/game/Reveal";
import SkillInventory from "@/components/game/SkillInventory";

export default function Skills() {
  return (
    <section id="skills" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 sm:py-28 sm:px-8">
      <GameHeading stage="STAGE 2" title="INVENTORY" sub="Every tool collected so far, all in one bag." />
      <Reveal>
        <SkillInventory groups={skills} />
      </Reveal>
    </section>
  );
}
