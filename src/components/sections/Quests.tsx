import { projects, profile } from "@/data/profile";
import GameHeading from "@/components/game/GameHeading";
import Reveal from "@/components/game/Reveal";

function StatusBadge({ status }: { status: "complete" | "in-progress" }) {
  return status === "complete" ? (
    <span className="bg-gold px-2 py-1.5 font-pixel text-[7px] text-background">✔ COMPLETE</span>
  ) : (
    <span className="border-2 border-rose px-2 py-1 font-pixel text-[7px] text-rose">
      <span className="blink">●</span> IN PROGRESS
    </span>
  );
}

export default function Quests() {
  const main = projects.filter((p) => p.featured);
  const side = projects.filter((p) => !p.featured);

  return (
    <section id="work" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 sm:py-28 sm:px-8">
      <GameHeading stage="STAGE 3" title="QUEST LOG" sub="Main quests shipped and in progress — each one links to its source." />

      <div className="grid gap-8 lg:grid-cols-3">
        {main.map((p, i) => (
          <Reveal key={p.name} delay={i * 120} className="flex">
            <article className="pixel-box lift flex w-full flex-col p-6">
              <div className="mb-5 flex items-center justify-between gap-2">
                <span className="font-pixel text-[8px] text-muted">MAIN QUEST 0{i + 1}</span>
                <StatusBadge status={p.status} />
              </div>
              <h3 className="text-xl font-semibold">{p.name}</h3>
              <p className="mb-6 text-sm text-muted">{p.subtitle}</p>

              <p className="mb-3 font-pixel text-[8px] text-gold">OBJECTIVES</p>
              <ul className="mb-6 space-y-2.5 text-sm leading-relaxed text-foreground/85">
                {p.points.map((pt) => (
                  <li key={pt} className="flex gap-2.5">
                    <span className={p.status === "complete" ? "text-accent" : "text-rose"} aria-hidden>
                      {p.status === "complete" ? "✔" : "▸"}
                    </span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>

              <p className="mb-3 font-pixel text-[8px] text-gold">LOOT</p>
              <ul className="mb-7 flex flex-wrap gap-2">
                {p.stack.map((s) => (
                  <li key={s} className="border-2 border-line bg-accent/10 px-2 py-0.5 text-xs text-accent">
                    {s}
                  </li>
                ))}
              </ul>

              <a href={p.repo} target="_blank" rel="noreferrer" className="pixel-btn mt-auto self-start">
                ▶ View on GitHub
              </a>
            </article>
          </Reveal>
        ))}
      </div>

      {side.length > 0 && (
        <Reveal className="mt-12">
          <p className="mb-4 font-pixel text-[10px] text-gold">SIDE QUESTS</p>
          <div className="space-y-4">
            {side.map((p) => (
              <a
                key={p.name}
                href={p.repo}
                target="_blank"
                rel="noreferrer"
                className="pixel-box lift flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-4"
              >
                <span className="font-pixel text-[8px] text-sky">SIDE</span>
                <span className="font-semibold">{p.name}</span>
                <span className="min-w-0 flex-1 text-sm text-muted">{p.points[0]}</span>
                <span className="text-xs text-accent">{p.stack.join(" · ")} ↗</span>
              </a>
            ))}
          </div>
          <a
            href={profile.links.github}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-block font-pixel text-[8px] text-muted transition-colors hover:text-accent"
          >
            ▶ BROWSE ALL REPOS @{profile.handle.toUpperCase()}
          </a>
        </Reveal>
      )}
    </section>
  );
}
