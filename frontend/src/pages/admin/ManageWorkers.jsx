import { useState } from 'react';
import useWorkers from '../../hooks/useWorkers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import { DEPARTMENTS } from '../../utils/departmentFromCategory';

export default function ManageWorkers() {
  const { listQuery, createMutation, updateMutation, deleteMutation } = useWorkers();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', department: DEPARTMENTS[0] });

  if (listQuery.isLoading) return <LoadingSpinner />;
  
  let workers = [];
  if (Array.isArray(listQuery.data)) {
    workers = listQuery.data;
  } else if (listQuery.data && Array.isArray(listQuery.data.workers)) {
    workers = listQuery.data.workers;
  } else if (listQuery.data && Array.isArray(listQuery.data.data)) {
    workers = listQuery.data.data;
  }

  if (listQuery.isError) {
    return <div className="p-4 bg-red-100 text-red-700 rounded">Error loading workers: {listQuery.error?.message}</div>;
  }

  const handleCreate = async (e) => {
    e.preventDefault();
    await createMutation.mutateAsync(form);
    setModalOpen(false);
    setForm({ name: '', email: '', phone: '', password: '', department: DEPARTMENTS[0] });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Manage Workers</h1>
        <Button onClick={() => setModalOpen(true)} className="w-full sm:w-auto">Add Worker</Button>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workers.map((w) => (
          <div key={w._id} className="card bg-base-100 border border-base-300 shadow hover:shadow-md transition-shadow">
            <div className="card-body">
              <h3 className="font-semibold text-lg">{w.name}</h3>
              <p className="text-sm text-neutral/70">{w.department}</p>
              <div className="flex justify-between items-center text-sm mt-2">
                <span>Active: {w.activeTasks}</span>
                <span>Done: {w.completedTasks}</span>
              </div>
              <div className="mt-2">
                <label className="flex items-center gap-2 cursor-pointer w-fit">
                  <input type="checkbox" className="toggle toggle-sm toggle-primary" checked={w.availability}
                    onChange={(e) => updateMutation.mutate({ id: w._id, availability: e.target.checked })} />
                  <span className="text-sm">Available</span>
                </label>
              </div>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" className="btn-sm flex-1" onClick={() => setSelectedWorker(w)}>Details</Button>
                <Button variant="error" className="btn-sm" onClick={() => setDeleteId(w._id)}>Delete</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Modal open={modalOpen} title="Add Worker" onClose={() => setModalOpen(false)}>
        <form onSubmit={handleCreate} className="space-y-3">
          {['name', 'email', 'phone', 'password'].map((f) => (
            <input key={f} type={f === 'password' ? 'password' : 'text'} placeholder={f} className="input input-bordered w-full" required
              value={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })} />
          ))}
          <select className="select select-bordered w-full" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <Button type="submit" loading={createMutation.isPending}>Create</Button>
        </form>
      </Modal>
      <ConfirmModal open={!!deleteId} title="Delete Worker" message="This action cannot be undone."
        onConfirm={() => { deleteMutation.mutate(deleteId); setDeleteId(null); }}
        onCancel={() => setDeleteId(null)} loading={deleteMutation.isPending} />

      <Modal open={!!selectedWorker} title="Worker Information" onClose={() => setSelectedWorker(null)}>
        {selectedWorker && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-base-content/60 font-semibold uppercase">Name</span>
                <p>{selectedWorker.name}</p>
              </div>
              <div>
                <span className="text-xs text-base-content/60 font-semibold uppercase">Department</span>
                <p>{selectedWorker.department}</p>
              </div>
              <div>
                <span className="text-xs text-base-content/60 font-semibold uppercase">Email</span>
                <p>{selectedWorker.email}</p>
              </div>
              <div>
                <span className="text-xs text-base-content/60 font-semibold uppercase">Phone</span>
                <p>{selectedWorker.phone}</p>
              </div>
              <div>
                <span className="text-xs text-base-content/60 font-semibold uppercase">Status</span>
                <p>
                  <span className={`badge ${selectedWorker.availability ? 'badge-success' : 'badge-error'} text-white badge-sm`}>
                    {selectedWorker.availability ? 'Available' : 'Unavailable'}
                  </span>
                </p>
              </div>
              <div>
                <span className="text-xs text-base-content/60 font-semibold uppercase">Rating</span>
                <p>{selectedWorker.performance?.rating ? `${selectedWorker.performance.rating.toFixed(1)} / 5.0` : 'N/A'}</p>
              </div>
              <div>
                <span className="text-xs text-base-content/60 font-semibold uppercase">Active Tasks</span>
                <p>{selectedWorker.activeTasks}</p>
              </div>
              <div>
                <span className="text-xs text-base-content/60 font-semibold uppercase">Completed Tasks</span>
                <p>{selectedWorker.completedTasks}</p>
              </div>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row justify-end gap-2">
              <Button onClick={() => setSelectedWorker(null)} className="w-full sm:w-auto">Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
