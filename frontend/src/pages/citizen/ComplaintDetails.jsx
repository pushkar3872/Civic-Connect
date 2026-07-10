import { useParams } from 'react-router-dom';
import useComplaints from '../../hooks/useComplaints';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import StatusTimeline from '../../components/common/StatusTimeline';
import { formatDateTime } from '../../utils/formatDate';
import { departmentFromCategory } from '../../utils/departmentFromCategory';

export default function ComplaintDetails() {
  const { id } = useParams();
  const { detailQuery } = useComplaints({ id });

  if (detailQuery.isLoading) return <LoadingSpinner />;
  const c = detailQuery.data;
  if (!c) return <p>Complaint not found</p>;

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <h1 className="text-2xl font-bold">{c.title}</h1>
        <div className="flex gap-2"><StatusBadge status={c.status} /><PriorityBadge priority={c.priority} /></div>
        <p className="text-neutral/80">{c.description}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm break-words">
          <div><span className="font-medium">Category:</span> {c.category}</div>
          <div><span className="font-medium">Department:</span> {c.department || departmentFromCategory(c.category)}</div>
          <div><span className="font-medium">Created:</span> {formatDateTime(c.createdAt)}</div>
          {c.location?.address && <div className="col-span-1 sm:col-span-2"><span className="font-medium">Location:</span> {c.location.address}</div>}
        </div>
        {c.adminRemarks && <div className="alert alert-info"><span><strong>Admin:</strong> {c.adminRemarks}</span></div>}
        {c.workerRemarks && <div className="alert alert-warning"><span><strong>Worker:</strong> {c.workerRemarks}</span></div>}
        {[...(c.images || []), ...(c.beforeImages || []), ...(c.afterImages || [])].length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Images</h3>
            <div className="flex flex-wrap gap-2">
              {[...(c.images || []), ...(c.beforeImages || []), ...(c.afterImages || [])].map((img, i) => (
                <img key={i} src={img.url} alt="" className="w-32 h-32 object-cover rounded-lg" />
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="card bg-base-100 shadow border border-base-300">
        <div className="card-body"><h2 className="card-title text-base">Status Timeline</h2><StatusTimeline currentStatus={c.status} /></div>
      </div>
    </div>
  );
}
