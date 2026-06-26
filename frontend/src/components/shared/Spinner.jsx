export default function Spinner({ size = 'md' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };

  return (
    <div className="flex justify-center items-center py-12">
      <div
        className={`${sizes[size] || sizes.md} border-2 border-tw-border border-t-tw-red rounded-full animate-spin`}
      />
    </div>
  );
}
