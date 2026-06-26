export default function Badge({ label }) {
  const isPrivate = label === 'PRIVATE';

  return (
    <span
      className={`inline-block text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
        isPrivate
          ? 'bg-tw-yellow/20 text-tw-yellow'
          : 'bg-tw-green/20 text-tw-green'
      }`}
    >
      {label}
    </span>
  );
}
