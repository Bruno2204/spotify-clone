import { useEffect, useState } from 'react';
import { Slider } from '@/components/ui/slider.js';

export function SongSlider({ audio }) {
  // const { isPlaying, setIsPlaying } = usePlayerStore();
  // const wasPlayingRef = useRef(false)
  const [currentTime, setCurrentTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const duration = audio?.current?.duration ?? 0;

  useEffect(() => {
    const handleTimeUpdate = () => {
      if (!isDragging) {
        setCurrentTime(audio.current.currentTime);
      }
    };

    const audioEl = audio.current;
    if (!audioEl) return;

    audioEl.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      audioEl.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [isDragging]);

  const formatTime = (time) => {
    if (!time) return `0:00`;

    const seconds = Math.floor(time % 60);
    const minutes = Math.floor(time / 60);

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  return (
    <div className='flex items-center gap-3 w-full pt-2'>
      <span className='text-xs text-zinc-400 w-8 text-right'>
        {formatTime(currentTime)}
      </span>
      <Slider
        value={[currentTime]}
        max={duration}
        min={0}
        onPointerDown={() => {
          // wasPlayingRef.current = isPlaying;
          setIsDragging(true);
        }}
        onValueChange={(value) => {
          setCurrentTime(value[0]);
        }}
        onValueCommit={(value) => {
          audio.current.currentTime = value[0];
          setIsDragging(false);
          // if (wasPlayingRef.current) {
          //   audio.current.play();
          //   setIsPlaying(true);
          // }
        }}
      />
      <span className='text-xs text-zinc-400'>{formatTime(duration)}</span>
    </div>
  );
}
