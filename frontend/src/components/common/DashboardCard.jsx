export default function DashboardCard({ title, value, icon: Icon, color = 'bg-primary/10 text-primary' }) {
  return (
    <div className="stat bg-base-100 shadow border border-base-300 rounded-box">
      <div className={`stat-figure p-3 rounded-full ${color}`}>
        {Icon && <Icon size={24} />}
      </div>
      <div className="stat-title">{title}</div>
      <div className="stat-value text-2xl">{value}</div>
    </div>
  );
}
