import { statusColor, statusLabel } from '../../utils/statusColor';

export default function StatusBadge({ status }) {
  return <span className={`badge ${statusColor(status)}`}>{statusLabel(status)}</span>;
}
