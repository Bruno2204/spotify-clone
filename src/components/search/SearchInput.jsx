import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

export function SearchInput({ value, onChange }) {
  const [local, setLocal] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (local !== value) {
        onChange(local);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [local, onChange, value]);

  return (
    <div className='relative'>
      <Search className='absolute left-3 top-1/2 -translate-y-1/2 size-5 text-zinc-400' />
      <input
        type='search'
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder='What do you want to play?'
        className='w-full bg-zinc-800/80 text-white placeholder-zinc-400 rounded-full py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-green-500/60 transition'
      />
    </div>
  );
}
