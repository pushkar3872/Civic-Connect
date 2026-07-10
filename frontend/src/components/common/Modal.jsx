export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <dialog className="modal modal-open">
      <div className="modal-box w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">{title}</h3>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
      <form method="dialog" className="modal-backdrop"><button onClick={onClose}>close</button></form>
    </dialog>
  );
}
