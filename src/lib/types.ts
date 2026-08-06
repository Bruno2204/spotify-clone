import { colors } from './colors';
import type { DeezerTrack } from './deezer';

export type Song = DeezerTrack;

export interface Playlist {
  id: string;
  albumId: number;
  title: string;
  color: (typeof colors)[keyof typeof colors];
  cover: string;
  artists: string[];
}
