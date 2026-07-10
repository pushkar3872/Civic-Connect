import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import useComplaints from '../../hooks/useComplaints';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import { formatDate } from '../../utils/formatDate';
import { CATEGORIES } from '../../utils/departmentFromCategory';

export default function MyComplaints() {
  const { myQuery } = useComplaints({ mine: true });
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = useMemo(() => {
    let list = myQuery.data || [];
    if (statusFilter) list = list.filter((c) => c.status === statusFilter);
    if (categoryFilter) list = list.filter((c) => c.category === categoryFilter);
    return list;
  }, [myQuery.data, statusFilter, categoryFilter]);

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage) || 1;

  if (myQuery.isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">My Complaints</h1>
        <Link to="/citizen/complaints/new" className="btn btn-primary btn-sm w-full sm:w-auto">New Complaint</Link>
      </div>
      <div className="flex gap-2 flex-wrap w-full md:w-auto">
        <select className="select select-bordered select-sm flex-1 min-w-[140px]" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          {['NEW', 'IN_PROGRESS', 'CLOSED'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="select select-bordered select-sm flex-1 min-w-[140px]" value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}>
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="overflow-x-auto card bg-base-100 shadow border border-base-300">
        <table className="table">
          <thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Priority</th><th>Date</th><th></th></tr></thead>
          <tbody>
            {paginated.map((c) => (
              <tr key={c._id}>
                <td>{c.title}</td>
                <td>{c.category}</td>
                <td><StatusBadge status={c.status} /></td>
                <td><PriorityBadge priority={c.priority} /></td>
                <td>{formatDate(c.createdAt)}</td>
                <td><Link to={`/citizen/complaints/${c._id}`} className="btn btn-ghost btn-xs">View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="join">
        <button className="join-item btn btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>«</button>
        <button className="join-item btn btn-sm">Page {page} / {totalPages}</button>
        <button className="join-item btn btn-sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>»</button>
      </div>
    </div>
  );
}
