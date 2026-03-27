import { useState, useRef, useEffect } from 'react';
import { Play, Pause } from '@/icons/PlayerIcons.jsx';

export default function Player() {
  const [isPlaying, setIsPlaying] = useState(false);
  // const [volume, setVolume] = useState(1);
  const audioRef = useRef();

  useEffect(() => {
    audioRef.current.src = `/music/1/01.mp3`;
  }, []);


  const handleClick = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.volume = 0.1;
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className='flex flex-row justify-between items-center'>
      <div>Cancion</div>
      <button
        className='bg-white text-black cursor-pointer rounded-full p-2'
        onClick={handleClick}
      >
        {isPlaying ? <Pause /> :
          <Play />
        }
      </button>
      <div>Volumen
        <audio ref={audioRef}></audio>
      </div>
    </div>
  );
}