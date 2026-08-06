import { describe, it, expect, beforeEach, vi } from 'vitest';

const fetchMock = vi.fn();

beforeEach(() => {
  vi.resetModules();
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

function rawTrack(overrides: Record<string, unknown> = {}) {
  return {
    id: 313555,
    title: 'Lo-Fi',
    duration: 192,
    preview: 'https://preview.example/lofi.mp3',
    artist: { id: 1, name: 'Tom Cardy' },
    album: {
      id: 1,
      title: 'The Dancefloor',
      cover_medium: 'https://img/medium.jpg',
      cover_big: 'https://img/big.jpg',
      cover_xl: 'https://img/xl.jpg',
    },
    ...overrides,
  };
}

function mockFetchOnce(body: unknown, init: { ok?: boolean; status?: number } = {}) {
  fetchMock.mockResolvedValueOnce({
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json: async () => body,
  } as unknown as Response);
}

describe('deezer wrapper', () => {
  it('searchTracks normalizes the Deezer response', async () => {
    const { searchTracks } = await import('./deezer');
    mockFetchOnce({ data: [rawTrack()] });

    const tracks = await searchTracks('lofi');

    expect(tracks).toEqual([
      {
        deezerId: 313555,
        title: 'Lo-Fi',
        artist: 'Tom Cardy',
        album: 'The Dancefloor',
        cover: 'https://img/xl.jpg',
        previewUrl: 'https://preview.example/lofi.mp3',
        durationSec: 192,
      },
    ]);
  });

  it('searchTracks caches the response (second call does not fetch)', async () => {
    const { searchTracks } = await import('./deezer');
    mockFetchOnce({ data: [rawTrack()] });

    await searchTracks('lofi');
    await searchTracks('lofi');
    await searchTracks('lofi');

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('getTrack normalizes the Deezer response', async () => {
    const { getTrack } = await import('./deezer');
    mockFetchOnce(rawTrack());

    const track = await getTrack(313555);

    expect(track).toEqual({
      deezerId: 313555,
      title: 'Lo-Fi',
      artist: 'Tom Cardy',
      album: 'The Dancefloor',
      cover: 'https://img/xl.jpg',
      previewUrl: 'https://preview.example/lofi.mp3',
      durationSec: 192,
      artistId: 1,
      albumId: 1,
    });
  });

  it('throws when Deezer returns a non-2xx response', async () => {
    const { searchTracks } = await import('./deezer');
    mockFetchOnce({}, { ok: false, status: 500 });

    await expect(searchTracks('lofi')).rejects.toThrow('Deezer 500 on /search?');
  });
});
