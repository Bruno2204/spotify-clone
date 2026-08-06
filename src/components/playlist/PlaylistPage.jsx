import { useState } from 'react';
import { Edit } from 'lucide-react';
import { PlaylistSongs } from './PlaylistSongs.jsx';
import { EditPlaylistDialog } from './EditPlaylistDialog.jsx';

export function PlaylistPage({ playlist, initialSongs, isOwner }) {
  const [showEdit, setShowEdit] = useState(false);
  const [current, setCurrent] = useState(playlist);
  const [songs, setSongs] = useState(initialSongs);

  return (
    <>
      {isOwner && (
        <div className='flex justify-end mb-4'>
          <button
            type='button'
            onClick={() => setShowEdit(true)}
            className='flex items-center gap-2 text-zinc-400 hover:text-white text-sm font-semibold transition'
          >
            <Edit className='size-4' />
            Edit
          </button>
        </div>
      )}
      <PlaylistSongs playlist={current} songs={songs} isOwner={isOwner} />
      {isOwner && (
        <EditPlaylistDialog
          open={showEdit}
          onClose={() => setShowEdit(false)}
          playlist={current}
          onUpdated={(p) => setCurrent(p)}
        />
      )}
    </>
  );
}
