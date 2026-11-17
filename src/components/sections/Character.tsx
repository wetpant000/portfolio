import Image from "next/image";
import photo from "@/assets/vijay.jpg";
import { profile, education, stats, attributes, perks, yearOfStudy } from "@/data/profile";
import GameHeading from "@/components/game/GameHeading";
import Reveal from "@/components/game/Reveal";
import XpBar from "@/components/game/XpBar";
import PerkIcon from "@/components/game/PerkIcon";

const Label = ({ children }: { children: React.ReactNode }) => (
  <h3 className="mb-4 font-pixel text-[10px] text-gold">{children}</h3>
);

export default function Character() {
  const lv = yearOfStudy();
  // Save points in the order they were reached.
  const saves = [...education].reverse();

  return (
    <section id="about" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 sm:py-28 sm:px-8">
      <GameHeading stage="STAGE 1" title="SELECT PLAYER" sub="The character behind the code." />

      <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* Portrait card */}
        <Reveal className="mx-auto w-full max-w-sm lg:mx-0">
          <div className="pixel-box lift p-3">
            <div className="relative overflow-hidden">
              <Image
                src={photo}
                alt={`${profile.name} playing an acoustic guitar against a sunlit wall`}
                placeholder="blur"
                sizes="(min-width: 1024px) 380px, 90vw"
                className="h-auto w-full"
              />
              <span className="absolute top-3 left-3 bg-gold px-2 py-1.5 font-pixel text-[8px] text-background">P1</span>
              <span className="absolute top-3 right-3 bg-background/85 px-2 py-1.5 font-pixel text-[8px] text-accent">
                <span className="blink">●</span> READY
              </span>
            </div>
            <div className="flex items-end justify-between gap-3 px-1 pt-4 pb-1">
              <div>
                <p className="font-semibold">{profile.name}</p>
                <p className="text-xs text-muted">Data Science · Software Dev</p>
              </div>
              <span className="shrink-0 font-pixel text-[10px] text-gold">LV {lv}</span>
            </div>
          </div>

          <div className="mt-10">
            <Label>PERKS</Label>
            <ul className="grid grid-cols-2 gap-3">
              {perks.map((p) => (
                <li key={p.label}>
                  {p.href ? (
                    <a
                      href={p.href}
                      className="pixel-box lift flex items-center gap-3 px-3 py-2.5 text-sm hover:text-accent"
                      title="See my bookshelf"
                    >
                      <PerkIcon name={p.icon} className="h-5 w-5 text-accent" />
                      {p.label} <span className="ml-auto text-xs text-muted">↓</span>
                    </a>
                  ) : (
                    <span className="pixel-box flex items-center gap-3 px-3 py-2.5 text-sm">
                      <PerkIcon name={p.icon} className="h-5 w-5 text-accent" />
                      {p.label}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <div className="space-y-12">
          <Reveal>
            <Label>LORE</Label>
            <div className="space-y-4 leading-relaxed text-foreground/85">
              {profile.about.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </Reveal>

          <Reveal>
            <Label>STATS</Label>
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {stats.map((s) => (
                <li key={s.label} className="pixel-box px-4 py-4">
                  <p className="font-pixel text-lg text-accent sm:text-xl">{s.value}</p>
                  <p className="mt-2.5 text-xs text-muted">{s.label}</p>
                </li>
              ))}
            </ul>
            <div className="mt-8 space-y-5">
              {attributes.map((a) => (
                <div key={a.label}>
                  <div className="mb-2 flex justify-between font-pixel text-[8px]">
                    <span>{a.label.toUpperCase()}</span>
                    <span className="text-muted">{a.value}</span>
                  </div>
                  <XpBar pct={a.pct} color="var(--accent)" />
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal>
            <Label>SAVE POINTS</Label>
            <ol className="relative space-y-6 border-l-4 border-dashed border-line pl-7">
              {saves.map((e, i) => {
                const current = i === saves.length - 1;
                return (
                  <li key={e.school} className="relative">
                    <span
                      aria-hidden
                      className={`absolute top-1 -left-[42px] h-5 w-5 border-4 border-line ${current ? "bg-gold" : "bg-accent"}`}
                    />
                    <p className="font-pixel text-[8px] text-muted">
                      SAVE 0{i + 1} · {e.when}
                      {current && <span className="blink ml-2 text-gold">◆ CURRENT</span>}
                    </p>
                    <p className="mt-2 font-semibold">{e.school}</p>
                    <p className="text-sm text-muted">
                      {e.detail} · {e.place}
                    </p>
                  </li>
                );
              })}
            </ol>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
