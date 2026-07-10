import useNotifications from '../../hooks/useNotifications';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import { formatDateTime } from '../../utils/formatDate';

export default function Notifications() {
  const { listQuery, markReadMutation, markAllReadMutation } = useNotifications();

  if (listQuery.isLoading) return <LoadingSpinner />;

  const items = Array.isArray(listQuery.data) ? listQuery.data : listQuery.data?.notifications || [];

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <Button variant="outline" onClick={() => markAllReadMutation.mutate()} loading={markAllReadMutation.isPending}>Mark all read</Button>
      </div>
      <div className="space-y-2">
        {items.map((n) => (
          <div key={n._id} className={`card bg-base-100 border ${n.read ? 'border-base-300 opacity-70' : 'border-primary'}`}>
            <div className="card-body p-4 flex-row justify-between items-center">
              <div>
                <h3 className="font-medium">{n.title}</h3>
                <p className="text-sm text-neutral/70">{n.message}</p>
                <p className="text-xs text-neutral/50 mt-1">{formatDateTime(n.createdAt)}</p>
              </div>
              {!n.read && (
                <Button variant="ghost" className="btn-xs" onClick={() => markReadMutation.mutate(n._id)}>Mark read</Button>
              )}
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-neutral/60">No notifications yet.</p>}
      </div>
    </div>
  );
}
