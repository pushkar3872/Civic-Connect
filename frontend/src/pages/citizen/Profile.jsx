import useAuthStore from '../../store/authStore';

export default function Profile() {
  const { user } = useAuthStore();
  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      <div className="card bg-base-100 shadow border border-base-300">
        <div className="card-body space-y-2">
          <p><strong>Name:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Phone:</strong> {user?.phone || '—'}</p>
          <p><strong>Role:</strong> {user?.role}</p>
        </div>
      </div>
    </div>
  );
}
