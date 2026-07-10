import { useRef, useEffect } from 'react';
import { usePlayerStore } from '@/store/playerStore.ts';
import { CurrentSong } from './CurrentSong.jsx';
import { VolumeControl } from './VolumeControl.jsx';
import { SongControls } from './SongControls.jsx';

export default function Player() {
  const { isPlaying, currentMusic, volume } = usePlayerStore();
  const audioRef = useRef();

  useEffect(() => {
    audioRef.current?.volume = volume;
  }, [volume]);

  useEffect(() => {
    isPlaying
      ? audioRef.current?.play()
      : audioRef.current?.pause();
  }, [isPlaying])

  useEffect(() => {
    const { song, playlist } = currentMusic
    if (song && audioRef.current) {
      audioRef.current.src = `/music/${playlist.id}/0${song.id}.mp3`;
      if (isPlaying) {
        audioRef.current?.play();
      }
    }
  }, [currentMusic])

  return (
    <div className='grid grid-cols-3 gap-x-1'>
      <CurrentSong song={currentMusic.song} />

      <SongControls audio={audioRef} />

      <VolumeControl />
      <audio ref={audioRef}></audio>
    </div>
  );
}

