
import { SongButtons } from "./SongButtons.jsx";
import { SongSlider } from "./SongSlider.jsx";

export function SongControls({ audio }) {
  return (
    <div className='flex flex-col items-center justify-center select-none w-full'>
      <SongButtons audio={audio} />
      <SongSlider audio={audio} />
    </div>
  )
}