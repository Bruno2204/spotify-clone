import { useRef, useEffect, useState } from 'react';
import { usePlayerStore } from '@/store/playerStore.ts';
import { CurrentSong } from './CurrentSong.jsx';
import { VolumeControl } from './VolumeControl.jsx';
import { SongControls } from './SongControls.jsx';
import { QueuePanel } from './QueuePanel.jsx';
import { ListMusic } from 'lucide-react';

export default function Player() {
  const { isPlaying, setIsPlaying, currentMusic, volume } = usePlayerStore();
  const audioRef = useRef();
  const [queueOpen, setQueueOpen] = useState(false);
  const queue = usePlayerStore((s) => s.queue);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    isPlaying ? audioRef.current?.play() : audioRef.current?.pause();
  }, [isPlaying]);

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    const { song } = currentMusic;
    if (song && audioRef.current) {
      audioRef.current.src = song.previewUrl;
      if (isPlaying) audioRef.current?.play();
    }
  }, [currentMusic]);

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    const { song } = currentMusic;
    if (!song) {
      navigator.mediaSession.metadata = null;
      return;
    }
    navigator.mediaSession.metadata = new MediaMetadata({
      title: song.title,
      artist: song.artist ?? song.artistName,
      album: song.album ?? song.albumTitle,
      artwork: song.cover ? [{ src: song.cover, sizes: '512x512', type: 'image/jpeg' }] : [],
    });
  }, [currentMusic]);

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.setActionHandler('play', () => {
      usePlayerStore.getState().setIsPlaying(true);
    });
    navigator.mediaSession.setActionHandler('pause', () => {
      usePlayerStore.getState().setIsPlaying(false);
    });
    return () => {
      if (!('mediaSession' in navigator)) return;
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
    };
  }, []);

  useEffect(() => {
    const { song } = currentMusic;
    if (song && audioRef.current) {
      audioRef.current.src = song.previewUrl;
      if (isPlaying) audioRef.current?.play();
    }
  }, [currentMusic]);

  return (
    <div className='grid grid-cols-3 gap-x-1 relative'>
      <CurrentSong song={currentMusic.song} />

      <SongControls audio={audioRef} />

      <div className='flex items-center justify-end gap-2 select-none'>
        <button
          type='button'
          onClick={() => setQueueOpen((v) => !v)}
          aria-label='Queue'
          className={`hover:scale-110 transition-transform cursor-pointer duration-300 ${
            queue.length > 0 ? 'text-green-500' : 'opacity-50 hover:opacity-100'
          }`}
        >
          <div className='relative'>
            <ListMusic className='size-4' />
            {queue.length > 0 && (
              <span className='absolute -top-1 -right-2 bg-green-500 text-black text-[9px] font-bold rounded-full size-3.5 flex items-center justify-center'>
                {queue.length}
              </span>
            )}
          </div>
        </button>
        <VolumeControl />
      </div>
      <audio ref={audioRef}></audio>

      {queueOpen && <QueuePanel onClose={() => setQueueOpen(false)} />}
    </div>
  );
}
