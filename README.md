# K Vijay Kumar Swamy — Portfolio

**Live:** https://kvijaykumar.vercel.app

A gamified developer portfolio built with **Next.js**. It opens on an animated, dithered ASCII ocean and then plays out like a retro game: character select, inventory, quest log, trophy room and a mini-game.

## Highlights

- **ASCII ocean hero**: an animated scene drawn in characters with ordered (Bayer) dithering. Fish follow the cursor, jellyfish pulse, a turtle glides and a crab scuttles across the seabed.
- **Player card and XP HUD**: a centred player card with a level, guild and degree-progress XP bar. A sticky HUD fills with XP as you scroll.
- **Stage 1 · Select Player**: portrait, lore, stats, attribute bars, perks and education "save points".
- **Stage 2 · Inventory**: every skill in one bag, with real brand logos and colour-coded categories.
- **Stage 3 · Quest Log**: projects as main and side quests, with objectives, loot (tech stack) and status.
- **Stage 4 · Trophy Room**: achievements as badges, with an "achievement unlocked" toast.
- **Stage 5 · Library**: an animated bookshelf synced from Goodreads. Click a spine to open the book.
- **Stage 6 · Journal**: blog posts synced from Blogger, with an in-site reader.
- **Bonus Stage · Bug Hunt**: squash bugs, spare the features, beat your high score.
- **Light and dark themes**, a pause-menu style mobile navigation, and reduced-motion support.

## Tech stack

| Area | Tools |
| --- | --- |
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4, Press Start 2P and Geist fonts |
| Icons | Simple Icons (brand logos), Lucide |
| Data | Goodreads bookshelf widgets and the Blogger JSON feed, revalidated hourly (ISR) |

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build && npm start   # production build
```

## Editing content

| What | Where |
| --- | --- |
| Name, bio, links, stats, skills, projects, education, achievements | `src/data/profile.ts` |
| Extra books, or status/rating overrides | `src/data/books.ts` |
| Portrait photo | `src/assets/vijay.jpg` |
| Favicon and app icons | `src/app/icon.png`, `src/app/apple-icon.png`, `src/app/favicon.ico` |
| Theme colours | `src/app/globals.css` |

Books come from the Goodreads **read** and **currently-reading** shelves. Posts come from [kvijaykumars.blogspot.com](https://kvijaykumars.blogspot.com/). Both refresh on the live site about once an hour.

## Project structure

```
src/
├─ app/                 # layout, page, global styles, icons
├─ components/
│  ├─ AsciiFish.tsx     # the dithered ASCII ocean
│  ├─ game/             # HUD, inventory, bookshelf, journal, Bug Hunt…
│  └─ sections/         # page sections (Character, Skills, Quests…)
├─ data/                # editable content
└─ lib/                 # Goodreads and Blogger fetchers
```

## Links

- Live site: https://kvijaykumar.vercel.app
- GitHub: [@wetpant000](https://github.com/wetpant000)
- LinkedIn: [k-vijay-kumar](https://www.linkedin.com/in/k-vijay-kumar-56391b278/)
- Blog: [kvijaykumars.blogspot.com](https://kvijaykumars.blogspot.com/)
- Goodreads: [Vijay](https://www.goodreads.com/user/show/190059949-vijay)
