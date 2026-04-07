import { usePlayerStore } from "@/store/playerStore.ts";
import { useRef } from "react";
import { VolumeIcon } from "@/icons/VolumeIcons.jsx";
import { Slider } from "@/components/ui/slider.tsx";

export function VolumeControl() {
  const { volume, setVolume } = usePlayerStore();
  const previousVolume = useRef(volume);

  const handleClick = () => {
    if (volume === 0) {
      setVolume(previousVolume.current);
    } else {
      previousVolume.current = volume;
      setVolume(0);
    }
  }
  return (
    <div className='flex items-center justify-end gap-2 select-none w-full'>
      <span className='cursor-pointer text-white/80 hover:text-white transition duration-200 w-5' onClick={handleClick}>
        <VolumeIcon volume={volume} />
      </span>
      <Slider
        max={1}
        min={0}
        step={0.01}
        value={[volume]}
        className=' max-w-[95px]'
        onValueChange={(value) => {
          setVolume(value[0]);
        }}
      />
    </div>
  )
} 