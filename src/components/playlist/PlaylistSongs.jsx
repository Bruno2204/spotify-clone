import { Pause, Play } from "@/icons/PlayerIcons.jsx";
import { usePlayerStore } from "@/store/playerStore.ts";

export function PlaylistSongs({ playlist, songs }) {
  return (
    <table className="table-auto text-left min-w-full divide-y divide-white/10">
      <thead>
        <tr className="text-gray-500 text-sm font-light">
          <th className="px-3 py-2">#</th>
          <th className="pr-4 py-2">Title</th>
          <th className="pr-3 py-2">Album</th>
          <th className="pr-1 py-2 truncate">Duration</th>
        </tr>
      </thead>

      <tbody>
        <tr className="h-4"><td></td></tr>
        {songs.map((song, index) => (
          <PlaylistRow key={song.id} playlist={playlist} songs={songs} song={song} index={index} />
        ))}
      </tbody>
    </table>
  );
}

function PlaylistRow({ playlist, songs, song, index }) {
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const setIsPlaying = usePlayerStore((state) => state.setIsPlaying);
  const setCurrentMusic = usePlayerStore((state) => state.setCurrentMusic);
  const isCurrentSong = usePlayerStore((state) => state.currentMusic.song?.id === song.id);
  const isCurrentPlaylist = usePlayerStore((state) => state.currentMusic.playlist?.id === playlist.id)

  const handlePausePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePlaySong = () => {
    setCurrentMusic({ playlist, songs, song });
    setIsPlaying(true);
  };

  return (
    <tr
      className="text-gray-400 hover:bg-white/10 transition-colors duration-200 ease-in-out w-full group"
    >

      <td className={`pl-3 py-2 rounded-l-lg ${isCurrentSong && isCurrentPlaylist ? "text-green-500" : "text-gray-400"}`}>
        <div className="relative flex items-center justify-center w-6 h-6">
          {isCurrentSong && isCurrentPlaylist ? (
            <button className="cursor-pointer transition-transform duration-200 ease-in-out" onClick={handlePausePlay}>{isPlaying ? <Pause /> : <Play />}</button>
          ) : (
            <>
              <button onClick={handlePlaySong} className="absolute opacity-0 group-hover:opacity-100 transition-all duration-200 z-2">
                <Play className="size-4 hover:text-white hover:opacity-100 transition-colors duration-200 ease-in-out cursor-pointer" />
              </button>
              <span className="absolute opacity-100 group-hover:opacity-0 transition-all duration-200 select-none z-1">
                {index + 1}
              </span>
            </>
          )}
        </div>
      </td>
      <td className="pr-4 py-2 flex items-center gap-2 justify-start">
        <picture className="aspect-square w-10 h-10">
          <img src={song.image} alt={song.title} className="w-full" />
        </picture>
        <div className="flex flex-col overflow-x-hidden">
          <h3
            className={`text-base font-normal line-clamp-1 ${(isCurrentSong && isCurrentPlaylist) ? "text-green-500" : "text-white"}`}
          >
            {song.title}
          </h3>
          <span className="text-zinc-400 text-sm font-normal line-clamp-1">
            {song.artists.join(", ")}
          </span>
        </div>
      </td>
      <td className="pr-3 py-2 overflow-x-hidden">
        <span className="line-clamp-1">{song.album}</span>
      </td>
      <td className="pr-1 py-2 rounded-r-lg ">
        <span className="truncate">{song.duration}</span>
      </td>
    </tr>
  );
}