export default function Button({ children, className = '', variant = 'primary', loading, ...props }) {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    error: 'btn-error',
    outline: 'btn-outline',
  };
  return (
    <button className={`btn ${variants[variant] || ''} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading && <span className="loading loading-spinner loading-sm" />}
      {children}
    </button>
  );
}
