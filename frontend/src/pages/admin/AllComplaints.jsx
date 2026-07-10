import { useState } from 'react';
import { Link } from 'react-router-dom';
import useComplaints from '../../hooks/useComplaints';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import { formatDate } from '../../utils/formatDate';
import ExportReportModal from '../../components/admin/ExportReportModal';

export default function AllComplaints() {
  const [filters, setFilters] = useState({});
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const { allQuery } = useComplaints({ admin: true, ...filters });

  const complaints = allQuery.data || [];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">All Complaints</h1>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 flex-wrap">
        <div className="flex gap-2 flex-wrap flex-1 w-full md:w-auto">
          <input 
            placeholder="Search Title or Description..." 
            className="input input-bordered input-sm flex-1 min-w-[200px]"
            value={filters.search || ''}
            onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined })} 
          />
          {['status', 'category', 'priority', 'department'].map((key) => (
            <input key={key} placeholder={`Filter ${key}`} className="input input-bordered input-sm w-[calc(50%-0.25rem)] sm:w-32"
              value={filters[key] || ''}
              onChange={(e) => setFilters({ ...filters, [key]: e.target.value || undefined })} />
          ))}
        </div>
        <button 
          className="btn btn-primary btn-sm w-full md:w-auto"
          onClick={() => setIsExportModalOpen(true)}
        >
          Export Custom Report
        </button>
      </div>
      
      {allQuery.isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="overflow-x-auto card bg-base-100 shadow border border-base-300">
          <table className="table">
            <thead><tr><th>Title</th><th>Dept</th><th>Status</th><th>Priority</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c._id}>
                  <td>{c.title}</td>
                  <td>{c.department}</td>
                  <td><StatusBadge status={c.status} /></td>
                  <td><PriorityBadge priority={c.priority} /></td>
                  <td>{formatDate(c.createdAt)}</td>
                  <td><Link to={`/admin/complaints/${c._id}`} className="btn btn-primary btn-xs">Manage</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ExportReportModal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)} 
        complaints={complaints}
      />
    </div>
  );
}
