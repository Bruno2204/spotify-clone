import { useState, useEffect } from 'react';
import { Headphones, Users } from 'lucide-react';

export function PodcastDetail({ podcastId }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/podcasts/${podcastId}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => setData(d.podcast))
      .catch((e) => setError(e.message));
  }, [podcastId]);

  if (error) {
    return <div className='p-6 text-red-400'>{error}</div>;
  }
  if (!data) {
    return <div className='p-6 text-zinc-400'>Loading…</div>;
  }

  return (
    <div className='p-6 overflow-y-auto h-full'>
      <header className='flex items-end gap-6 pb-6 mb-6'>
        <img
          src={data.picture}
          alt={data.title}
          className='size-48 rounded shadow-2xl object-cover'
        />
        <div className='flex-1 min-w-0'>
          <p className='text-zinc-300 text-sm font-semibold'>Podcast</p>
          <h1 className='text-white text-5xl font-extrabold mt-2 mb-4 truncate'>{data.title}</h1>
          <div className='flex items-center gap-4 text-zinc-300 text-sm'>
            <span className='flex items-center gap-1'>
              <Headphones className='size-4' />
              {data.nbEpisode} episodes
            </span>
            <span className='flex items-center gap-1'>
              <Users className='size-4' />
              {data.fans.toLocaleString()} fans
            </span>
          </div>
        </div>
      </header>

      <section className='mb-6 max-w-3xl'>
        <h2 className='text-white text-xl font-bold mb-2'>About</h2>
        <p className='text-zinc-300 text-sm leading-relaxed whitespace-pre-line'>{data.description}</p>
      </section>

      <section>
        <p className='text-zinc-400 text-sm'>
          Episodes and playback are not available in this clone. Browse the original podcast on{' '}
          <a
            href={`https://www.deezer.com/show/${data.deezerId}`}
            target='_blank'
            rel='noreferrer'
            className='text-green-500 hover:underline'
          >
            Deezer
          </a>
          .
        </p>
      </section>
    </div>
  );
}
