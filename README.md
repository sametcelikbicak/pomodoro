<div align="center">
 <img src="./public/pomodoro.svg" alt="Logo" width="256" height="256">

# Pomodoro | Focus time

A simple Pomodoro timer application to help you manage your time effectively using the Pomodoro Technique.

This configurable Pomodoro timer built with React + TypeScript and Vite.

This app provides a focused-timer experience with configurable work/short-break/long-break durations, an auto-break option, and lightweight statistics persisted to the browser's localStorage.

</div>

## Key features

- Configurable durations for: Work, Short Break, Long Break
- Configurable number of cycles before a long break
- Start / Pause / Reset controls
- Auto-start break option
- Visual progress bar and remaining time in the document title
- Rounds counter and simple statistics (work sessions, focus time, breaks, rounds, long breaks)
- Statistics persisted in `localStorage` so they remain between sessions

## How it works (user-facing)

1. Set the minutes for Work, Short Break and Long Break fields.
2. Set how many cycles (work sessions) you want before a Long Break.
3. Use the "Auto-break" switch to automatically start a break when a work session ends.
4. Click Start to begin a work session. Click Pause to pause the timer, Reset to stop and reset the state.
5. When the timer runs out, the app records elapsed time into the statistics and switches to the next mode (short or long break depending on cycles).
6. Statistics are automatically saved to `localStorage` so closing the tab won't lose your totals.

The app also updates the browser tab title to show the remaining time and current mode (e.g. "24:12 — Focus").

## Where stats are stored

Statistics are managed by `src/context/StatsContext.tsx` and saved to the browser's `localStorage` key `pomodoro_stats`.

The tracked metrics include:

- workSessions — number of completed work sessions (increments each finished or partially recorded work period)
- totalFocusSeconds — sum of all focused seconds recorded
- totalBreakSeconds — sum of all break seconds recorded
- roundsCompleted — number of full rounds/cycles completed
- longBreaksTaken — how many long breaks were taken

## Tech stack

- React 19 + TypeScript
- Vite (dev server + build)
- Tailwind CSS + utility components
- Radix UI components and small UI primitives in `src/components/ui`
- `lucide-react` for icons

## Getting started (development)

Prerequisites: Node.js (>= 18 recommended) and npm.

1. Clone the repo

```bash
git clone https://github.com/sametcelikbicak/pomodoro.git
cd pomodoro
```

2. Install dependencies

```bash
npm install
```

3. Run the dev server

```bash
npm run dev
```

Open http://localhost:5173 (or the address printed by Vite) to view the app.

## Important npm scripts

- `npm run dev` — start Vite dev server
- `npm run build` — run TypeScript build and produce a production-ready `dist` via Vite
- `npm run preview` — preview a production build locally
- `npm run deploy` — run `predeploy` (build) then publish the `dist` folder to GitHub Pages (uses `gh-pages`)
- `npm run lint` / `npm run lint-fix` — run ESLint
- `npm run format` — run Prettier

## Deployment

The project includes a `deploy` script which publishes the `dist` folder to GitHub Pages using the `gh-pages` package. Ensure your repository settings / `homepage` (if needed) are configured for GitHub Pages.

To deploy:

```bash
npm run deploy
```

## Developer notes

- The main app entry is `src/main.tsx` and the top-level UI lives in `src/App.tsx`.
- The Pomodoro logic is implemented in `src/components/Pomodoro/Pomodoro.tsx`.
- Lightweight UI primitives are under `src/components/ui` (tailwind + Radix patterns).
- Statistics are provided by `src/context/StatsContext.tsx`.

If you change timers or how sessions are recorded, make sure to update `StatsContext` so stored metrics remain consistent.

## Contributing

Contributions are welcome. Please open an issue for bigger changes or a PR with a clear description of the change and why it's needed.

Suggested workflow:

1. Fork the repository and create a feature branch
2. Run and test locally (`npm install && npm run dev`)
3. Keep code formatted with `npm run format` and linted with `npm run lint` before submitting a PR

## License

This project does not include a license file. Add one to make your intended reuse policy explicit (e.g. MIT).

## Contact

If you have questions or want help extending the project, open an issue or get in touch via the GitHub repository.

---

If you'd like, I can also:

- Add a usage screenshot to `public/` and reference it from the README
- Add a contributor guide or a short CHANGELOG template
- Add a simple test for the `formatTime` helper from `src/components/Pomodoro/Pomodoro.tsx`

Let me know which (if any) you'd like and I'll add them.
