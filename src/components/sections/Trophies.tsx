import { achievements } from "@/data/profile";
import GameHeading from "@/components/game/GameHeading";
import Reveal from "@/components/game/Reveal";
import PixelArt, { SPRITES, tintPalette } from "@/components/game/PixelArt";

const TIER: Record<string, string> = {
  legendary: "var(--gold)",
  epic: "var(--rose)",
  rare: "var(--sky)",
};

export default function Trophies() {
  return (
    <section id="trophies" className="relative mx-auto max-w-6xl scroll-mt-20 px-5 py-16 sm:px-8 sm:py-28">
      <GameHeading stage="STAGE 4" title="TROPHY ROOM" sub="Achievements unlocked along the way." />

      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-5">
        {achievements.map((a, i) => {
          const color = TIER[a.tier];
          return (
            <Reveal key={a.title} delay={i * 100}>
              <div className="trophy-card pixel-box lift group flex h-full flex-col items-center px-3 py-6 text-center sm:px-5 sm:py-8">
                {/* Glow + pedestal */}
                <div className="relative mb-5 flex h-20 w-20 items-end justify-center">
                  <span
                    aria-hidden
                    className="trophy-glow absolute inset-0"
                    style={{ background: `radial-gradient(circle, color-mix(in srgb, ${color} 35%, transparent) 0%, transparent 65%)` }}
                  />
                  <PixelArt
                    rows={SPRITES[a.sprite]}
                    palette={tintPalette(color)}
                    className="trophy-bob relative h-14 w-14"
                    title={`${a.title} badge`}
                  />
                  {a.tier === "legendary" && (
                    <>
                      <span aria-hidden className="sparkle absolute top-1 left-1 h-1.5 w-1.5 bg-gold" />
                      <span aria-hidden className="sparkle absolute top-5 right-0 h-1 w-1 bg-gold [animation-delay:0.7s]" />
                    </>
                  )}
                </div>
                <span className="font-pixel text-[7px] uppercase" style={{ color }}>
                  ★ {a.tier}
                </span>
                <h3 className="mt-3 font-pixel text-[10px] leading-relaxed">{a.title}</h3>
                {a.desc && <p className="mt-3 text-sm text-muted">{a.desc}</p>}
              </div>
            </Reveal>
          );
        })}
        <Reveal delay={achievements.length * 100} className="col-span-2 lg:col-span-1">
          <div className="flex h-full flex-col items-center border-4 border-dashed border-line px-3 py-6 text-center sm:px-5 sm:py-8">
            <div className="mb-5 flex h-20 w-20 items-end justify-center opacity-60">
              <PixelArt rows={SPRITES.lock} palette={tintPalette("var(--muted)")} className="h-14 w-14" title="Locked badge" />
            </div>
            <span className="font-pixel text-[7px] text-muted">LOCKED</span>
            <h3 className="mt-3 font-pixel text-[10px]">???</h3>
            <p className="mt-3 text-sm text-muted">Team up with me to unlock</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
