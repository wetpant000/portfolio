import AsciiFish from "@/components/AsciiFish";
import Dive from "@/components/Dive";
import ThemeToggle from "@/components/ThemeToggle";
import Hud from "@/components/game/Hud";
import Reveal from "@/components/game/Reveal";
import XpBar from "@/components/game/XpBar";
import AchievementToast from "@/components/game/AchievementToast";
import Character from "@/components/sections/Character";
import Skills from "@/components/sections/Skills";
import Quests from "@/components/sections/Quests";
import Trophies from "@/components/sections/Trophies";
import Contact from "@/components/sections/Contact";
import Library from "@/components/sections/Library";
import Arcade from "@/components/sections/Arcade";
import Blog from "@/components/sections/Blog";
import { MapPin } from "lucide-react";
import MobileMenu from "@/components/game/MobileMenu";
import { profile, degreeProgress, yearOfStudy, STAGES } from "@/data/profile";

export default function Home() {
  const xp = Math.round(degreeProgress() * 100);

  return (
    <main className="w-full bg-background">
      <Hud />

      {/* ---------- Hero: the ASCII ocean (unchanged) ---------- */}
      <section id="top" className="relative h-dvh w-full overflow-hidden">
        <AsciiFish />

        <div className="pointer-events-none relative z-10 flex h-full flex-col p-4 sm:p-10">
          <header className="flex items-center justify-between gap-4">
            <span className="pointer-events-auto bg-background/80 px-2 py-1.5 font-pixel text-[10px] text-gold">★ VKS</span>
            <nav className="pointer-events-auto flex items-center gap-3 bg-background/70 px-2 py-1.5 sm:gap-5 sm:px-3 sm:py-2">
              {STAGES.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="hidden font-pixel text-[8px] uppercase text-muted transition-colors hover:text-accent lg:inline"
                >
                  {s.label}
                </a>
              ))}
              <ThemeToggle />
              <MobileMenu className="lg:hidden" />
            </nav>
          </header>

          {/* Player card — centred on the screen */}
          <div className="flex flex-1 items-center justify-center py-4">
            <Reveal className="pointer-events-auto w-full max-w-md sm:max-w-lg">
              <div className="pixel-box bg-panel/90 px-5 py-6 text-center backdrop-blur-sm sm:px-8 sm:py-8">
                <p className="flex items-center justify-between font-pixel text-[8px]">
                  <span className="text-gold">PLAYER 1</span>
                  <span className="text-accent">
                    <span className="blink">●</span> ONLINE
                  </span>
                </p>
                <h1 className="mt-5 text-[1.7rem] leading-tight font-semibold sm:text-4xl">{profile.name}</h1>
                <p className="mt-2 text-sm text-muted">Class: Data Science · Software Dev</p>
                <p className="mt-1.5 flex items-center justify-center gap-1.5 text-sm text-muted">
                  <MapPin aria-hidden className="h-4 w-4 text-accent" />
                  {profile.location}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3 font-pixel text-[8px]">
                  <span className="border-2 border-line px-2 py-2.5">
                    LV <span className="text-gold">{yearOfStudy()}</span>
                  </span>
                  <span className="border-2 border-line px-2 py-2.5 text-accent">
                    <span className="blink">●</span> OPEN TO WORK
                  </span>
                </div>

                <div className="mt-4 text-left">
                  <div className="mb-2 flex justify-between font-pixel text-[7px] text-muted">
                    <span>B.TECH XP</span>
                    <span>{xp}%</span>
                  </div>
                  <XpBar pct={xp} />
                </div>

                <ul className="mt-5 flex flex-wrap justify-center gap-2">
                  {[
                    { label: "GitHub", href: profile.links.github },
                    { label: "LinkedIn", href: profile.links.linkedin },
                    { label: "Goodreads", href: profile.links.goodreads },
                    { label: "Blog", href: profile.links.blog },
                    { label: "Email", href: `mailto:${profile.links.email}` },
                  ].map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        target={l.href.startsWith("http") ? "_blank" : undefined}
                        rel="noreferrer"
                        className="block border-2 border-line px-2.5 py-2 font-pixel text-[7px] uppercase text-muted transition-colors hover:border-accent hover:text-accent"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>

                <a href="#about" className="pixel-btn mt-6">
                  <span className="blink">▶</span> Press Start
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Scrolling down is a dive: each section is a deeper ocean zone. */}
      <Dive zone="shallows" level={1}>
        <Character />
      </Dive>
      <Dive zone="kelp" level={2}>
        <Skills />
      </Dive>
      <Dive zone="wreck" level={3}>
        <Quests />
      </Dive>
      <Dive zone="treasure" level={4}>
        <Trophies />
      </Dive>
      <Dive zone="twilight" level={5}>
        <Library />
      </Dive>
      <Dive zone="midnight" level={6}>
        <Blog />
      </Dive>
      <Dive zone="abyss" level={7}>
        <Arcade />
      </Dive>
      <Dive zone="floor" level={8}>
        <Contact />
      </Dive>

      <AchievementToast />
    </main>
  );
}
