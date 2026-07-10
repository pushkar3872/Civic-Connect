import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import useComplaints from '../../hooks/useComplaints';
import { workerApi } from '../../services';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import StatusTimeline from '../../components/common/StatusTimeline';
import Button from '../../components/common/Button';

export default function AdminComplaintDetails() {
  const { id } = useParams();
  const { detailQuery, assignMutation, verifyMutation, closeMutation } = useComplaints({ id });
  const [workerId, setWorkerId] = useState('');
  const [remarks, setRemarks] = useState('');

  const c = detailQuery.data;
  const { data: workers } = useQuery({
    queryKey: ['workers-dept', c?.department],
    queryFn: () => workerApi.getByDepartment(c.department),
    enabled: !!c?.department,
  });

  if (detailQuery.isLoading) return <LoadingSpinner />;
  if (!c) return <p>Not found</p>;

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <h1 className="text-2xl font-bold">{c.title}</h1>
        <StatusBadge status={c.status} />
        <p>{c.description}</p>
        <p className="text-sm"><strong>Department:</strong> {c.department}</p>
        {c.workerRemarks && <p className="text-sm"><strong>Worker notes:</strong> {c.workerRemarks}</p>}
        <div className="flex flex-wrap gap-2">
          {(c.images || []).concat(c.beforeImages || [], c.afterImages || []).map((img, i) => (
            <img key={i} src={img.url} alt="" className="w-24 h-24 object-cover rounded" />
          ))}
        </div>
        <div className="card bg-base-100 border border-base-300 p-4 space-y-3">
          <h3 className="font-semibold">Assign Worker</h3>
          <select className="select select-bordered w-full" value={workerId} onChange={(e) => setWorkerId(e.target.value)}>
            <option value="">Select worker</option>
            {(workers || []).map((w) => <option key={w._id} value={w._id}>{w.name} ({w.activeTasks} active)</option>)}
          </select>
          <Button onClick={() => assignMutation.mutate({ id, workerId })} disabled={!workerId} loading={assignMutation.isPending}>Assign</Button>
        </div>
        <div className="card bg-base-100 border border-base-300 p-4 space-y-3">
          <h3 className="font-semibold">Verify Work</h3>
          <textarea className="textarea textarea-bordered" placeholder="Remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
          <div className="flex gap-2">
            <Button onClick={() => verifyMutation.mutate({ id, approved: true, adminRemarks: remarks })} loading={verifyMutation.isPending}>Approve</Button>
            <Button variant="error" onClick={() => verifyMutation.mutate({ id, approved: false, adminRemarks: remarks })}>Reject (Rework)</Button>
          </div>
        </div>
        <Button variant="outline" onClick={() => closeMutation.mutate({ id, adminRemarks: remarks })} loading={closeMutation.isPending}>Close Complaint</Button>
      </div>
      <div className="card bg-base-100 border border-base-300 p-4"><StatusTimeline currentStatus={c.status} /></div>
    </div>
  );
}
