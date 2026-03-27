import { Play } from "@/icons/PlayerIcons.jsx";

export function CardPlayButton({ id }) {
  return (
    <div
      class='absolute right-5 bottom-28 z-10 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0 bg-green-500 rounded-full p-3 ease-in-out text-black cursor-pointer hover:bg-green-400 hover:scale-105
      hover:shadow-2xl hover:shadow-black shadow-black shadow-7xl'
    >
      <Play />
    </div>
  );
}