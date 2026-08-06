import { logger } from './logger';

const DEEZER_BASE = 'https://api.deezer.com';

export type DeezerTrack = {
  deezerId: number;
  title: string;
  artist: string;
  album: string;
  cover: string;
  previewUrl: string;
  durationSec: number;
};

export type DeezerGenre = {
  id: number;
  name: string;
  picture: string;
};

export type DeezerArtist = {
  deezerId: number;
  name: string;
  picture: string;
};

export type DeezerPodcast = {
  deezerId: number;
  title: string;
  description: string;
  picture: string;
};

type RawTrack = {
  id: number;
  title: string;
  duration: number;
  preview: string;
  artist: { id: number; name: string };
  album: {
    id: number;
    title: string;
    cover_medium: string;
    cover_big: string;
    cover_xl: string;
  };
};

type RawArtist = {
  id: number;
  name: string;
  picture_medium: string;
  picture_big: string;
  picture_xl: string;
};

type RawPodcast = {
  id: number;
  title: string;
  description: string;
  picture_medium: string;
  picture_big: string;
  picture_xl: string;
};

type RawListResponse<T> = {
  data: T[];
  total?: number;
  next?: string;
};

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const TTL = {
  search: 60 * 1000,
  track: 5 * 60 * 1000,
  charts: 5 * 60 * 1000,
  artistTop: 5 * 60 * 1000,
  genres: 60 * 60 * 1000,
  topArtists: 5 * 60 * 1000,
  topPodcasts: 5 * 60 * 1000,
} as const;

const cache = new Map<string, CacheEntry<unknown>>();

async function getCached<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  const now = Date.now();
  const hit = cache.get(key);
  if (hit && hit.expiresAt > now) {
    return hit.value as T;
  }
  const value = await fetcher();
  cache.set(key, { value, expiresAt: now + ttlMs });
  return value;
}

function normalizeTrack(raw: RawTrack): DeezerTrack {
  return {
    deezerId: raw.id,
    title: raw.title,
    artist: raw.artist.name,
    album: raw.album.title,
    cover: raw.album.cover_xl || raw.album.cover_big || raw.album.cover_medium,
    previewUrl: raw.preview,
    durationSec: raw.duration,
  };
}

async function deezerFetch<T>(path: string): Promise<T> {
  const url = `${DEEZER_BASE}${path}`;
  logger.debug('deezer fetch', { url });
  const res = await fetch(url);
  if (!res.ok) {
    logger.error('Deezer API returned non-2xx status', {
      url,
      status: res.status,
    });
    throw new Error(`Deezer ${res.status} on ${path}`);
  }
  return (await res.json()) as T;
}

export function searchTracks(
  q: string,
  limit = 25,
  index = 0,
): Promise<DeezerTrack[]> {
  const params = new URLSearchParams({
    q,
    limit: String(limit),
    index: String(index),
  });
  return getCached(
    `deezer:search:${q}:${index}:${limit}`,
    TTL.search,
    async () => {
      const raw = await deezerFetch<RawListResponse<RawTrack>>(
        `/search?${params.toString()}`,
      );
      return raw.data.map(normalizeTrack);
    },
  );
}

export function searchArtists(
  q: string,
  limit = 20,
): Promise<DeezerArtist[]> {
  return getCached(`deezer:search:artist:${q}:${limit}`, TTL.search, async () => {
    const params = new URLSearchParams({ q, limit: String(limit) });
    const raw = await deezerFetch<RawListResponse<RawArtist>>(`/search/artist?${params.toString()}`);
    return raw.data.map(normalizeArtist);
  });
}

export function searchAlbums(
  q: string,
  limit = 20,
): Promise<{
  deezerId: number;
  title: string;
  cover: string;
  artist: { deezerId: number; name: string };
}[]> {
  return getCached(`deezer:search:album:${q}:${limit}`, TTL.search, async () => {
    const params = new URLSearchParams({ q, limit: String(limit) });
    const raw = await deezerFetch<RawListResponse<{
      id: number;
      title: string;
      cover_medium: string;
      cover_big: string;
      cover_xl: string;
      artist: { id: number; name: string };
    }>>(`/search/album?${params.toString()}`);
    return raw.data.map((a) => ({
      deezerId: a.id,
      title: a.title,
      cover: a.cover_xl || a.cover_big || a.cover_medium,
      artist: { deezerId: a.artist.id, name: a.artist.name },
    }));
  });
}

export function searchPlaylists(
  q: string,
  limit = 20,
): Promise<{
  deezerId: number;
  title: string;
  cover: string;
  user: { name: string };
  nbTracks: number;
}[]> {
  return getCached(`deezer:search:playlist:${q}:${limit}`, TTL.search, async () => {
    const params = new URLSearchParams({ q, limit: String(limit) });
    const raw = await deezerFetch<RawListResponse<{
      id: number;
      title: string;
      picture_medium: string;
      picture_big: string;
      picture_xl: string;
      nb_tracks: number;
      user: { name: string };
    }>>(`/search/playlist?${params.toString()}`);
    return raw.data.map((p) => ({
      deezerId: p.id,
      title: p.title,
      cover: p.picture_xl || p.picture_big || p.picture_medium,
      user: { name: p.user.name },
      nbTracks: p.nb_tracks,
    }));
  });
}

export function getTrack(id: number | string): Promise<DeezerTrack & {
  artistId: number;
  albumId: number;
}> {
  return getCached(`deezer:track:${id}`, TTL.track, async () => {
    const raw = await deezerFetch<RawTrack>(`/track/${id}`);
    return { ...normalizeTrack(raw), artistId: raw.artist.id, albumId: raw.album.id };
  });
}

export function getCharts(): Promise<DeezerTrack[]> {
  return getCached('deezer:charts:0:25', TTL.charts, async () => {
    const raw = await deezerFetch<RawListResponse<RawTrack>>(
      '/chart/0/tracks?limit=25',
    );
    return raw.data.map(normalizeTrack);
  });
}

export function getArtistTop(artistId: number | string): Promise<DeezerTrack[]> {
  return getCached(
    `deezer:artist:${artistId}:top:25`,
    TTL.artistTop,
    async () => {
      const raw = await deezerFetch<RawListResponse<RawTrack>>(
        `/artist/${artistId}/top?limit=25`,
      );
      return raw.data.map(normalizeTrack);
    },
  );
}

type RawArtistDetail = {
  id: number;
  name: string;
  picture_medium: string;
  picture_big: string;
  picture_xl: string;
  nb_fan: number;
  nb_album: number;
};

type RawPodcastDetail = {
  id: number;
  title: string;
  description: string;
  picture_medium: string;
  picture_big: string;
  picture_xl: string;
  nb_episode: number;
  fans: number;
};

export function getArtist(id: number | string): Promise<{
  deezerId: number;
  name: string;
  picture: string;
  nbFan: number;
  nbAlbum: number;
}> {
  return getCached(`deezer:artist:${id}:detail`, TTL.track, async () => {
    const raw = await deezerFetch<RawArtistDetail>(`/artist/${id}`);
    return {
      deezerId: raw.id,
      name: raw.name,
      picture: raw.picture_xl || raw.picture_big || raw.picture_medium,
      nbFan: raw.nb_fan,
      nbAlbum: raw.nb_album,
    };
  });
}

export function getPodcast(id: number | string): Promise<DeezerPodcast & {
  nbEpisode: number;
  fans: number;
}> {
  return getCached(`deezer:podcast:${id}:detail`, TTL.track, async () => {
    const raw = await deezerFetch<RawPodcastDetail>(`/podcast/${id}`);
    return {
      deezerId: raw.id,
      title: raw.title,
      description: raw.description,
      picture: raw.picture_xl || raw.picture_big || raw.picture_medium,
      nbEpisode: raw.nb_episode,
      fans: raw.fans,
    };
  });
}

type RawAlbum = {
  id: number;
  title: string;
  cover_medium: string;
  cover_big: string;
  cover_xl: string;
  release_date: string;
  nb_tracks: number;
  duration: number;
  artist: { id: number; name: string; picture: string };
  tracks: { data: RawTrack[] };
};

export function getAlbum(id: number | string): Promise<{
  deezerId: number;
  title: string;
  cover: string;
  releaseDate: string;
  nbTracks: number;
  duration: number;
  artist: { deezerId: number; name: string; picture: string };
  tracks: DeezerTrack[];
}> {
  return getCached(`deezer:album:${id}:detail`, TTL.track, async () => {
    const raw = await deezerFetch<RawAlbum>(`/album/${id}`);
    return {
      deezerId: raw.id,
      title: raw.title,
      cover: raw.cover_xl || raw.cover_big || raw.cover_medium,
      releaseDate: raw.release_date,
      nbTracks: raw.nb_tracks,
      duration: raw.duration,
      artist: { deezerId: raw.artist.id, name: raw.artist.name, picture: raw.artist.picture },
      tracks: raw.tracks.data.map(normalizeTrack),
    };
  });
}

function normalizeArtist(raw: RawArtist): DeezerArtist {
  return {
    deezerId: raw.id,
    name: raw.name,
    picture: raw.picture_xl || raw.picture_big || raw.picture_medium,
  };
}

function normalizePodcast(raw: RawPodcast): DeezerPodcast {
  return {
    deezerId: raw.id,
    title: raw.title,
    description: raw.description,
    picture: raw.picture_xl || raw.picture_big || raw.picture_medium,
  };
}

export function getTopArtists(limit = 25): Promise<DeezerArtist[]> {
  return getCached(`deezer:chart:artists:${limit}`, TTL.topArtists, async () => {
    const raw = await deezerFetch<RawListResponse<RawArtist>>(
      `/chart/116/artists?limit=${limit}`,
    );
    return raw.data.map(normalizeArtist);
  });
}

export function getTopPodcasts(limit = 25): Promise<DeezerPodcast[]> {
  return getCached(`deezer:chart:podcasts:${limit}`, TTL.topPodcasts, async () => {
    const raw = await deezerFetch<{ podcasts: RawListResponse<RawPodcast> }>(
      `/chart/podcasts?limit=${limit}`,
    );
    return raw.podcasts.data.map(normalizePodcast);
  });
}

export function getGenres(): Promise<DeezerGenre[]> {
  return getCached('deezer:genres', TTL.genres, async () => {
    const raw = await deezerFetch<RawListResponse<DeezerGenre>>('/genre');
    return raw.data;
  });
}
