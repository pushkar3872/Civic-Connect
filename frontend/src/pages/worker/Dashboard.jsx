import { useState } from 'react';
import { Link } from 'react-router-dom';
import useWorkers from '../../hooks/useWorkers';
import DashboardCard from '../../components/common/DashboardCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { ClipboardList, Loader, CheckCircle } from 'lucide-react';
import ExportReportModal from '../../components/admin/ExportReportModal';

export default function WorkerDashboard() {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const { tasksQuery } = useWorkers({ myTasks: true, listEnabled: false });

  if (tasksQuery.isLoading) return <LoadingSpinner />;
  const tasks = tasksQuery.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Worker Dashboard</h1>
        <button 
          className="btn btn-primary w-full sm:w-auto"
          onClick={() => setIsExportModalOpen(true)}
        >
          Export Custom Report
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardCard title="Assigned" value={tasks.filter((t) => t.status === 'ASSIGNED').length} icon={ClipboardList} />
        <DashboardCard title="In Progress" value={tasks.filter((t) => t.status === 'IN_PROGRESS').length} icon={Loader} color="bg-info/10 text-info" />
        <DashboardCard title="Completed" value={tasks.filter((t) => ['COMPLETED_BY_WORKER', 'VERIFIED_BY_ADMIN', 'CLOSED'].includes(t.status)).length} icon={CheckCircle} color="bg-success/10 text-success" />
      </div>
      <div className="card bg-base-100 border border-base-300 shadow">
        <div className="card-body">
          <h2 className="card-title">Recent Tasks</h2>
          {tasks.slice(0, 5).map((t) => (
            <div key={t._id} className="flex justify-between items-center py-2 border-b border-base-200 last:border-0">
              <Link to={`/worker/tasks/${t._id}`} className="link link-primary">{t.title}</Link>
              <StatusBadge status={t.status} />
            </div>
          ))}
        </div>
      </div>
      <ExportReportModal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)} 
        complaints={tasks}
      />
    </div>
  );
}
