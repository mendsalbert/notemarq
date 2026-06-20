import Link from 'next/link';

export default function PublicBoardNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center text-white">
      <p className="text-sm uppercase tracking-[0.2em] text-white/45">Public board</p>
      <h1 className="mt-3 text-3xl font-bold">This idea board is not public</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-white/60">
        It may have been unpublished, moved, or the link is incorrect.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black"
      >
        Back to notemarq
      </Link>
    </div>
  );
}
