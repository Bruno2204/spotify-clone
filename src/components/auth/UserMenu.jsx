import { useState, useRef, useEffect } from 'react';
import { authClient } from '@/lib/authClient';

export function UserMenu({ user }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  if (!user) {
    return (
      <a
        href='/login'
        className='block w-full text-center bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-full py-2 transition'
      >
        Log in
      </a>
    );
  }

  const displayName = user.name || user.email;
  const initial = displayName.charAt(0).toUpperCase();

  async function handleSignOut() {
    await authClient.signOut();
    window.location.assign('/');
  }

  return (
    <div ref={ref} className='relative w-full'>
      <button
        type='button'
        onClick={() => setOpen((v) => !v)}
        aria-haspopup='menu'
        aria-expanded={open}
        className='flex items-center gap-2 w-full bg-zinc-800/60 hover:bg-zinc-800 rounded-full py-1.5 pl-1.5 pr-3 transition'
      >
        {user.image ? (
          <img
            src={user.image}
            alt=''
            className='size-7 rounded-full object-cover'
          />
        ) : (
          <span className='size-7 rounded-full bg-green-500 text-black font-bold flex items-center justify-center text-sm'>
            {initial}
          </span>
        )}
        <span className='text-white text-sm font-semibold truncate'>
          {displayName}
        </span>
      </button>
      {open && (
        <div
          role='menu'
          className='absolute right-0 top-full mt-2 w-44 bg-zinc-900 border border-zinc-700 rounded-md shadow-lg py-1 z-50'
        >
          <a
            href='/settings'
            role='menuitem'
            className='block w-full text-left px-3 py-2 text-sm text-white hover:bg-zinc-800'
          >
            Settings
          </a>
          <button
            type='button'
            role='menuitem'
            onClick={handleSignOut}
            className='block w-full text-left px-3 py-2 text-sm text-white hover:bg-zinc-800'
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
