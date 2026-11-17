import { achievements } from "@/data/profile";
import GameHeading from "@/components/game/GameHeading";
import Reveal from "@/components/game/Reveal";

const TIER: Record<string, string> = {
  legendary: "var(--gold)",
  epic: "var(--rose)",
  rare: "var(--sky)",
};

export default function Trophies() {
  return (
    <section id="trophies" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 sm:py-28 sm:px-8">
      <GameHeading stage="STAGE 4" title="TROPHY ROOM" sub="Achievements unlocked along the way." />

      <ul className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-5">
        {achievements.map((a, i) => (
          <Reveal key={a.title} delay={i * 100}>
            <li className="pixel-box lift flex h-full flex-col items-center px-3 py-5 text-center sm:px-5 sm:py-7">
              <span
                className="mb-5 flex h-16 w-16 items-center justify-center text-3xl"
                style={{ background: `color-mix(in srgb, ${TIER[a.tier]} 18%, transparent)`, boxShadow: `inset 0 0 0 3px ${TIER[a.tier]}` }}
                aria-hidden
              >
                {a.icon}
              </span>
              <span className="font-pixel text-[7px] uppercase" style={{ color: TIER[a.tier] }}>
                {a.tier}
              </span>
              <h3 className="mt-3 font-pixel text-[10px] leading-relaxed">{a.title}</h3>
              {a.desc && <p className="mt-3 text-sm text-muted">{a.desc}</p>}
            </li>
          </Reveal>
        ))}
        <Reveal delay={achievements.length * 100} className="col-span-2 lg:col-span-1">
          <li className="flex h-full flex-col items-center border-4 border-dashed border-line px-3 py-5 text-center opacity-70 sm:px-5 sm:py-7">
            <span className="mb-5 flex h-16 w-16 items-center justify-center text-3xl grayscale" aria-hidden>
              🔒
            </span>
            <span className="font-pixel text-[7px] text-muted">LOCKED</span>
            <h3 className="mt-3 font-pixel text-[10px]">???</h3>
            <p className="mt-3 text-sm text-muted">Team up with me to unlock</p>
          </li>
        </Reveal>
      </ul>
    </section>
  );
}
