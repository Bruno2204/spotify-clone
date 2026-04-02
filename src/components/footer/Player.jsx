import { useRef, useEffect } from 'react';
import { Play, Pause } from '@/icons/PlayerIcons.jsx';
import { usePlayerStore } from '@/store/playerStore.js';
import { CurrentSong } from './CurrentSong.jsx';
import { VolumeControl } from './VolumeControl.jsx';

export default function Player() {
  const { isPlaying, setIsPlaying, currentMusic, setCurrentMusic, volume } = usePlayerStore();
  const audioRef = useRef();

  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    isPlaying
      ? audioRef.current.play()
      : audioRef.current.pause();
  }, [isPlaying])

  useEffect(() => {
    const { song, playlist, songs } = currentMusic
    if (song) {
      audioRef.current.src = `/music/${playlist.id}/0${song.id}.mp3`;
      audioRef.current.play();
    }

  }, [currentMusic])


  const handleClick = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className='grid grid-cols-3  '>
      <CurrentSong song={currentMusic.song} />

      <div className='flex items-center justify-center'>
        <button
          className='bg-white text-black cursor-pointer rounded-full p-2.5'
          onClick={handleClick}
        >
          {isPlaying ? <Pause /> :
            <Play />
          }
        </button>
      </div>

      <VolumeControl />
      <audio ref={audioRef}></audio>
    </div>
  );
}

