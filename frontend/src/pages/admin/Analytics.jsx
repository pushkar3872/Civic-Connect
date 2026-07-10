import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { analyticsApi } from '../../services';
import DashboardCard from '../../components/common/DashboardCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FileText, Users, Clock, TrendingUp } from 'lucide-react';

const COLORS = ['#1e40af', '#0891b2', '#f59e0b', '#22c55e', '#ef4444'];

export default function Analytics() {
  const { data, isLoading } = useQuery({ queryKey: ['analytics-full'], queryFn: analyticsApi.dashboard });
  const { data: trends } = useQuery({ queryKey: ['analytics-trends'], queryFn: analyticsApi.trends });

  if (isLoading) return <LoadingSpinner />;

  const deptData = Object.entries(data?.byDepartment || {}).map(([name, value]) => ({ name, value }));
  const statusData = Object.entries(data?.byStatus || {}).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard title="Total Complaints" value={data?.totalComplaints || 0} icon={FileText} />
        <DashboardCard title="Avg Resolution (hrs)" value={Math.round(data?.avgResolutionTimeHours || 0)} icon={Clock} />
        <DashboardCard title="Workers Tracked" value={data?.workerPerformance?.length || 0} icon={Users} />
        <DashboardCard title="Monthly Avg" value={trends?.length || 0} icon={TrendingUp} />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-4 border border-base-300">
          <h2 className="font-semibold mb-4">By Department</h2>
          <ResponsiveContainer width="100%" height={280}><BarChart data={deptData}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill="#1e40af" /></BarChart></ResponsiveContainer>
        </div>
        <div className="card p-4 border border-base-300">
          <h2 className="font-semibold mb-4">By Status</h2>
          <ResponsiveContainer width="100%" height={280}><PieChart><Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>{statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
        </div>
        <div className="card p-4 border border-base-300 lg:col-span-2">
          <h2 className="font-semibold mb-4">Monthly Trends</h2>
          <ResponsiveContainer width="100%" height={280}><LineChart data={trends || data?.monthlyTrends || []}><XAxis dataKey="month" /><YAxis /><Tooltip /><Line type="monotone" dataKey="count" stroke="#0891b2" /></LineChart></ResponsiveContainer>
        </div>
      </div>
      <div className="overflow-x-auto card border border-base-300">
        <table className="table"><thead><tr><th>Name</th><th>Completed</th><th>Active</th><th>Rating</th></tr></thead>
          <tbody>{(data?.workerPerformance || []).map((w) => (
            <tr key={w.workerId || w._id}><td>{w.name}</td><td>{w.completedTasks}</td><td>{w.activeTasks}</td><td>{w.rating}</td></tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
