export default function ConfirmModal({ open, title, message, onConfirm, onCancel, loading }) {
  if (!open) return null;
  return (
    <dialog className="modal modal-open">
      <div className="modal-box w-11/12 max-w-md">
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="py-4">{message}</p>
        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onCancel} disabled={loading}>Cancel</button>
          <button className="btn btn-error" onClick={onConfirm} disabled={loading}>
            {loading ? <span className="loading loading-spinner loading-sm" /> : 'Confirm'}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop"><button onClick={onCancel}>close</button></form>
    </dialog>
  );
}
