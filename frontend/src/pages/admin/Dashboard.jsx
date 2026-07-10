import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { analyticsApi } from '../../services';
import DashboardCard from '../../components/common/DashboardCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';
import ExportReportModal from '../../components/admin/ExportReportModal';
import useComplaints from '../../hooks/useComplaints';

const COLORS = ['#1e40af', '#0891b2', '#f59e0b', '#ef4444'];

export default function AdminDashboard() {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const { data, isLoading } = useQuery({ queryKey: ['analytics-dashboard'], queryFn: analyticsApi.dashboard });
  const { allQuery } = useComplaints({ admin: true });

  if (isLoading || allQuery.isLoading) return <LoadingSpinner />;

  const categoryData = Object.entries(data?.byCategory || {}).map(([name, value]) => ({ name, value }));
  const trendData = data?.monthlyTrends || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button 
          className="btn btn-primary w-full sm:w-auto"
          onClick={() => setIsExportModalOpen(true)}
        >
          Export Custom Report
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard title="Total" value={data?.totalComplaints || 0} icon={FileText} />
        <DashboardCard title="Pending" value={data?.pendingComplaints || 0} icon={Clock} color="bg-warning/10 text-warning" />
        <DashboardCard title="Resolved" value={data?.resolvedComplaints || 0} icon={CheckCircle} color="bg-success/10 text-success" />
        <DashboardCard title="Closed" value={data?.closedComplaints || 0} icon={XCircle} />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow border border-base-300 p-4">
          <h2 className="font-semibold mb-4">By Category</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card bg-base-100 shadow border border-base-300 p-4">
          <h2 className="font-semibold mb-4">Monthly Trends</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={trendData}>
              <XAxis dataKey="month" /><YAxis /><Tooltip />
              <Bar dataKey="count" fill="#1e40af" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <ExportReportModal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)} 
        complaints={allQuery.data || []}
      />
    </div>
  );
}
