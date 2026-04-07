import type { Playlist, Song } from '@/lib/data.ts';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface State {
  isPlaying: boolean;
  currentMusic: { playlist: Playlist | null; song: Song | null; songs: Song[] };
  volume: number;

  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentMusic: (currentMusic: {
    playlist: Playlist | null;
    song: Song | null;
    songs: Song[];
  }) => void;
  setVolume: (volume: number) => void;
}

export const usePlayerStore = create<State>()(
  persist(
    (set) => ({
      isPlaying: false,
      currentMusic: { playlist: null, song: null, songs: [] },
      volume: 0.3,

      setIsPlaying: (isPlaying) => set({ isPlaying }),
      setCurrentMusic: (currentMusic) => set({ currentMusic }),
      setVolume: (volume) => set({ volume }),
    }),
    {
      name: 'player',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentMusic: state.currentMusic,
        volume: state.volume,
      }),
    },
  ),  
);
