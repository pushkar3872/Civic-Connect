import { priorityColor } from '../../utils/priorityColor';

export default function PriorityBadge({ priority }) {
  return <span className={`badge ${priorityColor(priority)}`}>{priority}</span>;
}
