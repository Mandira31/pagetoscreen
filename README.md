# Page to Screen

A portfolio-ready React + Vite application for a community platform where readers vote for books they want adapted into films.

## Features

- Supabase-powered book ballot, voting, comments, and realtime updates
- Seeded fallback ballot and first-load seed insertion when Supabase is empty
- Nomination form that submits new books and builds adaptation metadata via Groq
- Cinematic monthly vision with Pollinations.ai poster generation, screenplay generation, and PDF download with jsPDF
- Lightweight editorial magazine UI with responsive design

## Environment variables

Create a `.env` file from `.env.example` and set the following values:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GROQ_API_KEY`

## Run locally

```bash
npm install
npm run dev
```

Open the local dev server URL shown in the terminal.

## Build

```bash
npm run build
```

## Notes

- All Supabase credentials are loaded from Vite environment variables.
- `jsPDF` runs through the `window.jspdf.jsPDF` global provided by the CDN script in `index.html`.
- The app falls back to seeded books if Supabase is unavailable.
