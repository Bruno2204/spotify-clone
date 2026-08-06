import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import Player from './Player.jsx';

vi.mock('@/store/playerStore.ts', () => ({
  usePlayerStore: vi.fn(),
}));

import { usePlayerStore } from '@/store/playerStore.ts';

describe('Player — mediaSession', () => {
  let setMediaMetadata;
  let setActionHandler;
  let metadataCall;

  beforeEach(() => {
    localStorage.clear();
    setMediaMetadata = vi.fn();
    setActionHandler = vi.fn();
    metadataCall = null;

    if (!('mediaSession' in navigator)) {
      Object.defineProperty(navigator, 'mediaSession', {
        value: {
          setActionHandler,
          metadata: null,
        },
        configurable: true,
      });
    } else {
      navigator.mediaSession.setActionHandler = setActionHandler;
    }
    Object.defineProperty(window, 'MediaMetadata', {
      value: class MediaMetadata {
        constructor(init) {
          metadataCall = init;
        }
      },
      configurable: true,
    });
  });

  function setupStore({ isPlaying = false, song = null } = {}) {
    const state = {
      isPlaying,
      currentMusic: song ? { song, playlist: null, songs: [song] } : { song: null, playlist: null, songs: [] },
      volume: 1,
      queue: [],
      shuffle: false,
      repeat: 'off',
      setIsPlaying: vi.fn(),
    };
    usePlayerStore.mockImplementation((selector) =>
      typeof selector === 'function' ? selector(state) : state,
    );
    usePlayerStore.getState = () => state;
    return state;
  }

  it('setea mediaSession.metadata cuando currentMusic.song cambia', async () => {
    setupStore({
      song: {
        deezerId: 1,
        title: 'Test Track',
        artist: 'Test Artist',
        album: 'Test Album',
        cover: 'https://example.com/cover.jpg',
        previewUrl: 'https://example.com/preview.mp3',
      },
    });
    render(<Player />);

    await new Promise((r) => setTimeout(r, 50));
    expect(navigator.mediaSession.metadata).toBeTruthy();
  });

  it('registra action handlers para play y pause', async () => {
    setupStore({});
    render(<Player />);

    await new Promise((r) => setTimeout(r, 50));
    const calls = setActionHandler.mock.calls.map((c) => c[0]);
    expect(calls).toContain('play');
    expect(calls).toContain('pause');
  });
});
