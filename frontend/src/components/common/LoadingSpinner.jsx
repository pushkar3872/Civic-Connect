export default function LoadingSpinner({ size = 'md' }) {
  const sizes = { sm: 'loading-sm', md: 'loading-md', lg: 'loading-lg' };
  return (
    <div className="flex justify-center items-center p-8">
      <span className={`loading loading-spinner loading-${size === 'md' ? 'md' : size} text-primary`} />
    </div>
  );
}
