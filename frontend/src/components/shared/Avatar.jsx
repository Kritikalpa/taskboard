export default function Avatar({ name, stacked = false }) {
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <div className="relative group">
      <div
        className={`w-7 h-7 rounded-full bg-tw-red flex items-center justify-center text-xs font-bold text-white ${stacked ? '-ml-2 border-2 border-tw-bg-surface' : ''}`}
      >
        {initials}
      </div>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-50 pointer-events-none">
        <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
          {name}
        </div>
      </div>
    </div>
  );
}
