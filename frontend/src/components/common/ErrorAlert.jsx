export default function ErrorAlert({ message }) {
  if (!message) return null;
  return <div className="alert alert-error"><span>{message}</span></div>;
}
