# 🎵 Spotify Clone

A pixel-faithful, full-featured **Spotify UI clone** built with **Astro**, **React**, and **TypeScript**. Features a fully functional music player with real audio playback, playlist navigation, volume control, and reactive state management — deployed on Vercel.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://spotify-clone-seven-rho-55.vercel.app/)

---

## ✨ Features

- 🎧 **Real Audio Playback** — Plays actual `.mp3` files from the server, synced with the current playlist
- ⏭️ **Full Player Controls** — Play, pause, skip to next/previous song with circular playlist logic
- 🔊 **Volume Control** — Smooth slider with real-time audio adjustment
- 📋 **Playlist Pages** — Dynamic per-playlist pages (`/playlist/[id]`) with song listings
- 🟢 **Active Song Highlighting** — Currently playing song is highlighted in green across the UI
- 🃏 **Playlist Cards** — Hover-to-reveal play buttons on playlist cards in the main view
- 📚 **Sidebar Library** — Scrollable sidebar showing all user playlists with cover art
- ⚡ **Optimized Rendering** — Astro's island architecture ensures minimal JS is shipped to the client
- 🔄 **Reactive State** — Global state with Zustand keeps the player and playlist views in sync

---

## 🛠️ Tech Stack

| Technology                                    | Purpose                                        |
| --------------------------------------------- | ---------------------------------------------- |
| [Astro 5](https://astro.build/)               | SSR framework & page routing                   |
| [React 19](https://react.dev/)                | Interactive UI islands (player, playlist rows) |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe data models and store                |
| [Zustand](https://github.com/pmndrs/zustand)  | Lightweight global state for the music player  |
| [Tailwind CSS v4](https://tailwindcss.com/)   | Utility-first styling                          |
| [shadcn/ui](https://ui.shadcn.com/)           | Accessible UI primitives (Slider, etc.)        |
| [Vercel](https://vercel.com/)                 | Deployment & serverless hosting                |

---

## 🏗️ Architecture Overview

This project uses **Astro's Island Architecture** to ship zero JavaScript by default, only hydrating interactive React components where needed.

```
src/
├── components/
│   ├── footer/          # Music player (Player, SongControls, VolumeControl, CurrentSong, SongSlider)
│   ├── main/            # Home page cards & greeting (MainCard, CardPlayButton, Greeting)
│   ├── playlist/        # Playlist song table (PlaylistSongs)
│   ├── side-menu/       # Sidebar navigation & library
│   └── ui/              # Shared UI primitives
├── pages/
│   ├── index.astro      # Home page
│   ├── playlist/
│   │   └── [id].astro   # Dynamic playlist page
│   └── api/             # API routes (e.g. serving song data)
├── store/
│   └── playerStore.ts   # Zustand global state (isPlaying, currentMusic, volume)
├── lib/
│   └── data.ts          # Typed playlist & song data
└── icons/               # Custom SVG icon components
```

**Key architectural decisions:**

- The **footer player** is a single hydrated React island (`client:load`) maintaining audio state across all page navigations
- **PlaylistSongs** uses granular Zustand selectors per row to avoid unnecessary re-renders
- Pages are server-rendered by Astro, with React components hydrated only for interactivity

---

## 🚀 Getting Started

### Prerequisites

- Node.js `>= 22.12.0`

### Installation

```bash
# Clone the repository
git clone https://github.com/Bruno2204/spotify-clone.git
cd spotify-clone

# Install pnpm if you don't have it
npm install -g pnpm

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

The app will be running at `http://localhost:4321`.

### Build for Production

```bash
npm run build
npm run preview
```

---

## 📁 Music Files

Audio files should be placed in the `public/music/` directory following this structure:

```
public/
└── music/
    └── {playlistId}/
        ├── 01.mp3
        ├── 02.mp3
        └── ...
```

---

## 🧠 What I Learned

Building this project deepened my understanding of:

- **Astro's hybrid rendering model** — combining SSR pages with client-side React islands
- **Zustand for cross-component state** — sharing player state between the footer player and playlist rows without prop drilling
- **React hydration pitfalls** — solving mismatches between server-rendered HTML and client-side state
- **Audio API in the browser** — controlling `HTMLAudioElement` with React refs and `useEffect`
- **Component-level reactivity** — using fine-grained Zustand selectors to minimize re-renders in song table rows

---

