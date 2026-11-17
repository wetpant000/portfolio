import { profile } from "@/data/profile";
import GameHeading from "@/components/game/GameHeading";
import Reveal from "@/components/game/Reveal";

const buttons = [
  { key: "A", color: "var(--accent)", label: "Email", value: profile.links.email, href: `mailto:${profile.links.email}` },
  { key: "B", color: "var(--rose)", label: "GitHub", value: `@${profile.handle}`, href: profile.links.github },
  { key: "X", color: "var(--sky)", label: "LinkedIn", value: "k-vijay-kumar", href: profile.links.linkedin },
  { key: "Y", color: "var(--gold)", label: "Goodreads", value: "vijay · bookshelf", href: profile.links.goodreads },
];

export default function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-6xl scroll-mt-20 px-5 pt-16 sm:pt-28 pb-14 sm:px-8">
      <GameHeading
        stage="FINAL STAGE"
        title="JOIN MY PARTY"
        sub="Open to internships, collaborations and hackathon teams. Email is the fastest way to reach me."
      />

      <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2 [&>*]:min-w-0">
        {buttons.map((b, i) => (
          <Reveal key={b.key} delay={i * 90}>
            <a
              href={b.href}
              target={b.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className="pixel-box lift group flex items-center gap-4 px-5 py-4"
            >
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-pixel text-xs text-background transition-transform group-hover:scale-110 group-active:scale-95"
                style={{ background: b.color, boxShadow: "inset -3px -3px 0 rgb(0 0 0 / 0.25)" }}
                aria-hidden
              >
                {b.key}
              </span>
              <span className="min-w-0">
                <span className="block font-pixel text-[8px] text-muted">PRESS {b.key} · {b.label.toUpperCase()}</span>
                <span className="mt-1.5 block truncate text-sm font-medium group-hover:text-accent">{b.value}</span>
              </span>
            </a>
          </Reveal>
        ))}
      </div>

      <footer className="mt-20 flex sm:mt-32 flex-col items-center gap-6 border-t-4 border-line pt-12 text-center">
        <p className="font-pixel text-sm text-accent sm:text-base">THANKS FOR PLAYING</p>
        <a href="#top" className="pixel-btn">
          ▲ Continue?
        </a>
        <p className="text-xs text-muted">
          © {new Date().getFullYear()} {profile.name} · built with Next.js · ocean rendered in ASCII
        </p>
      </footer>
    </section>
  );
}
