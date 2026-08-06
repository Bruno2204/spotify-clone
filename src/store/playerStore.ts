import type { Playlist, Song } from '@/lib/types';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const HISTORY_LIMIT = 20;

function pushUnique(history: Song[], song: Song): Song[] {
  const filtered = history.filter((s: Song) => String(s.deezerId) !== String(song.deezerId));
  return [song, ...filtered].slice(0, HISTORY_LIMIT);
}

interface State {
  isPlaying: boolean;
  currentMusic: { playlist: Playlist | null; song: Song | null; songs: Song[] };
  volume: number;
  playHistory: Song[];
  queue: Song[];
  shuffle: boolean;
  repeat: 'off' | 'all' | 'one';

  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentMusic: (currentMusic: {
    playlist: Playlist | null;
    song: Song | null;
    songs: Song[];
  }) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrev: () => void;
  setVolume: (volume: number) => void;
  clearHistory: () => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  toggleShuffle: () => void;
  setRepeat: (mode: 'off' | 'all' | 'one') => void;
}

const initialCurrentMusic = { playlist: null, song: null, songs: [] };
const initialVolume = 0.3;

const persistedShape = {
  currentMusic: initialCurrentMusic,
  volume: initialVolume,
  playHistory: [] as Song[],
};

export const usePlayerStore = create<State>()(
  persist(
    (set, get) => ({
      isPlaying: false,
      currentMusic: initialCurrentMusic,
      volume: initialVolume,
      playHistory: [],
      queue: [],
      shuffle: false,
      repeat: 'off',

      setIsPlaying: (isPlaying) => set({ isPlaying }),
      setCurrentMusic: (currentMusic) =>
        set((state) => ({
          currentMusic,
          playHistory: currentMusic.song
            ? pushUnique(state.playHistory, currentMusic.song)
            : state.playHistory,
        })),
      togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
      playNext: () => {
        const { currentMusic, queue, shuffle, repeat } = get();
        if (repeat === 'one') {
          set({ isPlaying: true });
          return;
        }
        const pool = queue.length > 0 ? queue : currentMusic.songs;
        const cur = currentMusic.song;
        if (pool.length === 0 || !cur) return;
        const idx = pool.findIndex((s) => s.deezerId === cur.deezerId);
        let nextIdx;
        if (shuffle) {
          nextIdx = Math.floor(Math.random() * pool.length);
        } else {
          nextIdx = (idx + 1) % pool.length;
        }
        set({
          currentMusic: { ...currentMusic, song: pool[nextIdx] },
          isPlaying: true,
          queue: queue.filter((_, i) => i !== (idx >= 0 && queue.length > 0 ? idx : -1)),
        });
      },
      playPrev: () => {
        const { currentMusic, queue, shuffle } = get();
        const cur = currentMusic.song;
        const pool = queue.length > 0 ? queue : currentMusic.songs;
        if (pool.length === 0 || !cur) return;
        const idx = pool.findIndex((s) => s.deezerId === cur.deezerId);
        let prevIdx;
        if (shuffle) {
          prevIdx = Math.floor(Math.random() * pool.length);
        } else {
          prevIdx = (idx - 1 + pool.length) % pool.length;
        }
        set({
          currentMusic: { ...currentMusic, song: pool[prevIdx] },
          isPlaying: true,
        });
      },
      setVolume: (volume) => set({ volume }),
      clearHistory: () => set({ playHistory: [] }),
      addToQueue: (song) => set((s) => ({ queue: [...s.queue, song] })),
      removeFromQueue: (index) =>
        set((s) => ({ queue: s.queue.filter((_, i) => i !== index) })),
      toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),
      setRepeat: (mode) => set({ repeat: mode }),
    }),
    {
      name: 'player',
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentMusic: state.currentMusic,
        volume: state.volume,
        playHistory: state.playHistory,
        shuffle: state.shuffle,
        repeat: state.repeat,
      }),
      migrate: (state, version) => {
        if (version < 2) return persistedShape;
        return state as typeof persistedShape;
      },
    },
  ),
);
