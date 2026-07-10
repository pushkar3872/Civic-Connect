import { Link } from 'react-router-dom';
import useWorkers from '../../hooks/useWorkers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import useComplaints from '../../hooks/useComplaints';

export default function AssignedTasks() {
  const { tasksQuery } = useWorkers({ myTasks: true, listEnabled: false });
  const { statusMutation } = useComplaints({});

  if (tasksQuery.isLoading) return <LoadingSpinner />;
  const tasks = tasksQuery.data || [];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Assigned Tasks</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {tasks.map((t) => (
          <div key={t._id} className="card bg-base-100 border border-base-300 shadow">
            <div className="card-body">
              <div className="flex justify-between"><h3 className="font-semibold">{t.title}</h3><StatusBadge status={t.status} /></div>
              <p className="text-sm text-neutral/70 line-clamp-2">{t.description}</p>
              <div className="card-actions justify-end gap-2">
                {t.status === 'ASSIGNED' && (
                  <Button className="btn-sm" onClick={() => statusMutation.mutate({ id: t._id, status: 'IN_PROGRESS' })}>Start Task</Button>
                )}
                <Link to={`/worker/tasks/${t._id}`} className="btn btn-primary btn-sm">Details</Link>
              </div>
            </div>
          </div>
        ))}
        {tasks.length === 0 && <p className="text-neutral/60">No assigned tasks.</p>}
      </div>
    </div>
  );
}
