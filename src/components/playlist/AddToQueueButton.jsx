import { useState } from 'react';
import { ListPlus, Check } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { toast } from 'sonner';

export function AddToQueueButton({ song, compact = false }) {
  const addToQueue = usePlayerStore((s) => s.addToQueue);
  const [added, setAdded] = useState(false);

  function handleClick(e) {
    e.stopPropagation();
    addToQueue(song);
    setAdded(true);
    toast.success(`Added "${song.title}" to queue`);
    setTimeout(() => setAdded(false), 1500);
  }

  if (compact) {
    return (
      <button
        type='button'
        onClick={handleClick}
        aria-label='Add to queue'
        className='p-1 text-zinc-400 hover:text-white transition'
      >
        {added ? <Check className='size-4 text-green-500' /> : <ListPlus className='size-4' />}
      </button>
    );
  }

  return (
    <button
      type='button'
      onClick={handleClick}
      className='flex items-center gap-1 text-zinc-400 hover:text-white text-xs font-semibold transition'
    >
      {added ? <Check className='size-3 text-green-500' /> : <ListPlus className='size-3' />}
    </button>
  );
}
