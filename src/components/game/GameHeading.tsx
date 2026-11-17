import Reveal from "./Reveal";

export default function GameHeading({ stage, title, sub }: { stage: string; title: string; sub?: string }) {
  return (
    <Reveal className="mb-10 text-center sm:mb-14">
      <p className="font-pixel text-[10px] tracking-[0.3em] text-accent">— {stage} —</p>
      <h2 className="mt-5 font-pixel text-xl leading-snug text-foreground [text-shadow:4px_4px_0_var(--shadow-c)] sm:text-3xl">
        {title}
      </h2>
      {sub && <p className="mx-auto mt-5 max-w-xl text-muted">{sub}</p>}
    </Reveal>
  );
}
