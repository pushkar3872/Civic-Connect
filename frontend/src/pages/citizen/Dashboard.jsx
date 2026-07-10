import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Clock, FileText, Loader } from 'lucide-react';
import useComplaints from '../../hooks/useComplaints';
import useNotifications from '../../hooks/useNotifications';
import DashboardCard from '../../components/common/DashboardCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/formatDate';
import ExportReportModal from '../../components/admin/ExportReportModal';

export default function CitizenDashboard() {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const { myQuery } = useComplaints({ mine: true });
  useNotifications();

  if (myQuery.isLoading) return <LoadingSpinner />;

  const complaints = myQuery.data || [];
  const stats = {
    total: complaints.length,
    pending: complaints.filter((c) => ['NEW', 'UNDER_REVIEW', 'ASSIGNED'].includes(c.status)).length,
    inProgress: complaints.filter((c) => c.status === 'IN_PROGRESS').length,
    closed: complaints.filter((c) => c.status === 'CLOSED').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Citizen Dashboard</h1>
        <button 
          className="btn btn-primary w-full sm:w-auto"
          onClick={() => setIsExportModalOpen(true)}
        >
          Export Custom Report
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard title="Total" value={stats.total} icon={FileText} />
        <DashboardCard title="Pending" value={stats.pending} icon={Clock} color="bg-warning/10 text-warning" />
        <DashboardCard title="In Progress" value={stats.inProgress} icon={Loader} color="bg-info/10 text-info" />
        <DashboardCard title="Closed" value={stats.closed} icon={CheckCircle} color="bg-success/10 text-success" />
      </div>
      <div className="card bg-base-100 shadow border border-base-300">
        <div className="card-body">
          <div className="flex justify-between items-center">
            <h2 className="card-title">Recent Complaints</h2>
            <Link to="/citizen/complaints/new" className="btn btn-primary btn-sm">New Complaint</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead><tr><th>Title</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {complaints.slice(0, 5).map((c) => (
                  <tr key={c._id}>
                    <td><Link to={`/citizen/complaints/${c._id}`} className="link link-primary">{c.title}</Link></td>
                    <td><StatusBadge status={c.status} /></td>
                    <td>{formatDate(c.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <ExportReportModal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)} 
        complaints={complaints}
      />
    </div>
  );
}
