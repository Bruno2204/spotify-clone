import { useEffect, useState } from "react";
import { usePlayerStore } from "@/store/playerStore.js";
import { Play, Pause } from "@/icons/PlayerIcons.jsx";
import { Slider } from "@/components/ui/slider.js";

export function SongControls({ audio }) {
  const [currentTime, setCurrentTime] = useState(0)
  const { isPlaying, setIsPlaying } = usePlayerStore();

  useEffect(() => {
    audio.current.addEventListener('timeupdate', handleTimeUpdate)

    return () => {
      audio.current.removeEventListener('timeupdate', handleTimeUpdate)
    }
  }, [])

  const handleTimeUpdate = () => {
    setCurrentTime(audio.current.currentTime)
  }

  const formatTime = time => {
    if (!time) return `0:00`

    const seconds = Math.floor(time % 60)
    const minutes = Math.floor(time / 60)

    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
  const handleClick = () => {
    setIsPlaying(!isPlaying);
  };

  const duration = audio?.current?.duration ?? 0
  return (
    <div className='flex flex-col items-center justify-center select-none w-full'>
      <button
        className='bg-white text-black cursor-pointer rounded-full p-2.5'
        onClick={handleClick}
      >
        {isPlaying ? <Pause /> :
          <Play />
        }
      </button>

      <div className='flex items-center gap-3 w-full pt-2'>
        <span className='text-xs text-zinc-400 w-8 text-right'>{formatTime(currentTime)}</span>
        <Slider
          value={[currentTime]}
          max={duration}
          min={0}
          onValueChange={(value) => {
            audio.current.currentTime = value[0];
          }}
        />
        <span className='text-xs text-zinc-400'>{formatTime(duration)}</span>

      </div>
    </div>
  )
}

