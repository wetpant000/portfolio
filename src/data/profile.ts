// All portfolio content lives here — edit this file to update the site.
// Source: resume (vijaysresume_updated.pdf) + public GitHub repos (github.com/wetpant000).

export const profile = {
  name: "K Vijay Kumar Swamy",
  shortName: "Vijay",
  handle: "wetpant000",
  role: "Data Science undergrad · Software Developer",
  tagline: "building ML & AI software that solves real-world problems",
  location: "Bengaluru, India",
  about: [
    "I'm a builder at heart. Nothing makes me happier than taking a half-formed idea and shaping it into working software. I love the creative messy middle: sketching the system, breaking things and tinkering until it finally clicks. Data Science, Machine Learning and AI are my favourite playground, and I'm always chasing the next tool, model or framework to build something better with.",
  ],
  facts: [
    { k: "studying", v: "B.Tech in Data Science @ VTU" },
    { k: "minor", v: "Economics & Finance" },
    { k: "cgpa", v: "8.1" },
    { k: "based in", v: "Bengaluru" },
  ],
  hobbies: ["guitar", "flute", "skateboarding", "reading"],
  links: {
    email: "kvijaykumar9743@gmail.com",
    github: "https://github.com/wetpant000",
    linkedin: "https://www.linkedin.com/in/k-vijay-kumar-56391b278/",
    goodreads: "https://www.goodreads.com/user/show/190059949-vijay",
    blog: "https://kvijaykumars.blogspot.com/",
  },
};

export const skills: { group: string; items: string[] }[] = [
  { group: "languages", items: ["C++", "Python", "Java"] },
  { group: "frontend", items: ["HTML", "Tailwind CSS", "JavaScript", "TypeScript", "React", "Next.js"] },
  { group: "backend", items: ["FastAPI", "Node.js", "Express.js", "MySQL", "SQLite", "MongoDB", "PostgreSQL"] },
  { group: "devops", items: ["Docker", "Kubernetes", "Redis"] },
  { group: "familiar", items: ["Git / GitHub", "Machine Learning", "AI Agents", "Postman", "Figma"] },
  {
    group: "coursework",
    items: ["OOP", "DBMS", "Computer Networks", "DSA", "Deep Learning", "Cyber Security"],
  },
];

export type Project = {
  name: string;
  status: "complete" | "in-progress";
  subtitle: string;
  repo: string;
  stack: string[];
  points: string[];
  featured?: boolean;
};

export const projects: Project[] = [
  {
    name: "Blu Visual Teacher",
    status: "complete",
    subtitle: "Offline video generation",
    repo: "https://github.com/wetpant000/blu-visual-teacher",
    stack: ["Python", "FastAPI", "React", "Ollama"],
    featured: true,
    points: [
      "Turns a topic or PDF into a narrated, animated video lesson — fully offline on a CPU.",
      "Local LLM (Qwen2.5 via Ollama) plans scenes, with AI voice-over and word-by-word captions.",
      "7 languages (English, Hindi, Kannada, Tamil, Telugu…) with MP4 and .srt export.",
      "PDF study packs: audiobook, video lessons and exam mode with flashcards and practice questions.",
    ],
  },
  {
    name: "Campus Saathi",
    status: "complete",
    subtitle: "Voice campus assistant",
    repo: "https://github.com/wetpant000/campus-shaathi",
    stack: ["Python", "FastAPI", "Gemma", "RAG", "ESP32"],
    featured: true,
    points: [
      "Voice-based campus kiosk on ESP32 that answers visitor questions about the college.",
      "Speech-to-text with faster-whisper and RAG retrieval over a college knowledge base.",
      "Gemma answers grounded only in retrieved pages; unrelated questions get a polite refusal.",
      "Answers shown on a TFT display and spoken via edge-tts; plus a web kiosk version.",
    ],
  },
  {
    name: "GrowthLens",
    status: "in-progress", // resume: "Building a platform…"
    subtitle: "Stock insight & prediction",
    repo: "https://github.com/wetpant000/growthlens",
    stack: ["Python", "Streamlit", "LightGBM", "FinBERT"],
    featured: true,
    points: [
      "Turns NSE and BSE market data and news into clear, explainable stock insights.",
      "Predicts 5-day price direction with LightGBM, LSTM and Prophet, explained with SHAP.",
      "FinBERT news sentiment + nine checks combined into a Stock Health Score out of 100.",
      "Flags pump-and-dump patterns and grades every saved prediction automatically.",
    ],
  },
  {
    name: "asci",
    status: "complete",
    subtitle: "Words → ASCII pictures",
    repo: "https://github.com/wetpant000/asci",
    stack: ["Python", "CLI"],
    points: ["Type a word, get an ASCII picture in your terminal. Works offline."],
  },
];

export const education = [
  {
    school: "Visvesvaraya Technological University",
    place: "Bengaluru",
    when: "Oct 2024 – 2028",
    detail: "B.Tech in Data Science · Minor in Economics & Finance · CGPA 8.1",
  },
  {
    school: "Smt. Y.J.R. Pre-University College",
    place: "Gangavathi",
    when: "Apr 2022 – 2024",
    detail: "Computer Science · 81.4%",
  },
];

export const achievements = [
  { icon: "🏆", tier: "legendary", title: "Champion", desc: "Won a hackathon" },
  { icon: "⚔️", tier: "epic", title: "Veteran", desc: "Participated in 8 hackathons" },
  { icon: "🧠", tier: "rare", title: "Problem Solver", desc: "" },
  { icon: "🌱", tier: "rare", title: "Open Sourcerer", desc: "Active open-source contributor" },
] as const;

// Headline numbers for the character sheet (all from the resume / GitHub).
export const stats = [
  { value: "8.1", label: "CGPA" },
  { value: "8", label: "Hackathons" },
  { value: "1", label: "Hackathon win" },
  { value: "4", label: "Public repos" },
  { value: "3", label: "Prog. languages" },
  { value: "3", label: "Main quests" },
];

export const attributes = [
  { label: "CGPA", value: "8.1 / 10", pct: 81 },
  { label: "Pre-university", value: "81.4%", pct: 81.4 },
];

export const perks: { icon: "guitar" | "flute" | "skateboard" | "book"; label: string; href?: string }[] = [
  { icon: "guitar", label: "Guitar" },
  { icon: "flute", label: "Flute" },
  { icon: "skateboard", label: "Skateboarding" },
  { icon: "book", label: "Reading", href: "#library" },
];

// Degree progress drives the "LV" and XP bar. B.Tech runs Oct 2024 – 2028
// (end month assumed: July 2028). Computed at build time.
const DEGREE_START = new Date("2024-10-01").getTime();
const DEGREE_END = new Date("2028-07-31").getTime();
export function degreeProgress(now = Date.now()) {
  return Math.min(1, Math.max(0, (now - DEGREE_START) / (DEGREE_END - DEGREE_START)));
}
export function yearOfStudy(now = Date.now()) {
  const y = Math.floor((now - DEGREE_START) / (365.25 * 24 * 3600 * 1000)) + 1;
  return Math.min(4, Math.max(1, y));
}

// Page sections, used by the hero nav and the sticky HUD.
export const STAGES = [
  { id: "about", label: "Player" },
  { id: "skills", label: "Skills" },
  { id: "work", label: "Quests" },
  { id: "trophies", label: "Trophies" },
  { id: "library", label: "Library" },
  { id: "blog", label: "Blog" },
  { id: "arcade", label: "Arcade" },
  { id: "contact", label: "Party" },
];
