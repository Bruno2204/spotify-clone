import { useState, useRef, useEffect } from 'react';
import { Play, Pause } from '@/icons/PlayerIcons.jsx';
import { usePlayerStore } from '@/store/playerStore.js';
import { Slider } from '@/components/ui/slider.tsx';

export default function Player() {
  const { isPlaying, setIsPlaying, currentMusic, setCurrentMusic } = usePlayerStore();
  const audioRef = useRef();

  useEffect(() => {
    // audioRef.current.src = `/music/1/01.mp3`;
    audioRef.current.volume = 0.3;
  }, []);

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
      <div className='flex items-center justify-end gap-2 '>
        <Slider
          defaultValue={[30]}
          max={100}
          min={0}
          className='w-[95px] h-5'
          onValueChange={(value) => {
            audioRef.current.volume = value[0] / 100;
          }}
        />
        <audio ref={audioRef}></audio>
      </div>
    </div>
  );
}

const CurrentSong = ({ song }) => {
  return (
    <div className='flex items-center gap-3 overflow-hidden relative'>
      <picture className='size-16 shrink-0'>
        {song?.image ? (
          <img
            src={song.image}
            alt={song.title}
            className='size-16 rounded-md bg-zinc-800 shadow-lg object-cover'
          />
        ) : (
          <div className='size-16 rounded-md bg-zinc-800 shadow-lg flex items-center justify-center'>
            <span className="text-zinc-600 text-xs"></span>
          </div>
        )}
      </picture>
      <div>
        <h3 className='text-white text-md font-normal truncate'>{song?.title}</h3>
        <p className='text-zinc-400 text-sm font-normal line-clamp-2'>{song?.artists.join(', ')}</p>
      </div>
    </div>
  );
}