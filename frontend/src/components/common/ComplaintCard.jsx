import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { formatDate } from '../../utils/formatDate';

export default function ComplaintCard({ complaint, to }) {
  return (
    <Link to={to || `/citizen/complaints/${complaint._id}`} className="card bg-base-100 shadow border border-base-300 hover:shadow-md transition">
      <div className="card-body p-4">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-semibold">{complaint.title}</h3>
          <StatusBadge status={complaint.status} />
        </div>
        <p className="text-sm text-neutral/70 line-clamp-2">{complaint.description}</p>
        <div className="flex gap-2 mt-2">
          <PriorityBadge priority={complaint.priority} />
          <span className="badge badge-outline">{complaint.category}</span>
        </div>
        <p className="text-xs text-neutral/50 mt-2">{formatDate(complaint.createdAt)}</p>
      </div>
    </Link>
  );
}
