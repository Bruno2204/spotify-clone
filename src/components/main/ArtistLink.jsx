export function ArtistLink({
  id,
  name,
  className = 'hover:underline hover:text-white',
  stopPropagation = false,
}) {
  if (!id || !name) return <>{name ?? ''}</>;
  return (
    <a
      href={`/artist/${id}`}
      className={className}
      onClick={stopPropagation ? (e) => e.stopPropagation() : undefined}
    >
      {name}
    </a>
  );
}
