import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import useComplaints from '../../hooks/useComplaints';
import { fileApi } from '../../services';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import ImageUpload from '../../components/common/ImageUpload';
import Button from '../../components/common/Button';

export default function TaskDetails() {
  const { id } = useParams();
  const { detailQuery, statusMutation } = useComplaints({ id });
  const [beforeFiles, setBeforeFiles] = useState([]);
  const [afterFiles, setAfterFiles] = useState([]);
  const [workerRemarks, setWorkerRemarks] = useState('');
  const [uploading, setUploading] = useState(false);

  if (detailQuery.isLoading) return <LoadingSpinner />;
  const c = detailQuery.data;
  if (!c) return <p>Task not found</p>;

  const handleComplete = async () => {
    setUploading(true);
    try {
      let beforeImages = c.beforeImages || [];
      let afterImages = c.afterImages || [];
      if (beforeFiles.length) {
        beforeImages = [...beforeImages, ...(await fileApi.upload(beforeFiles, 'before'))];
      }
      if (afterFiles.length) {
        afterImages = [...afterImages, ...(await fileApi.upload(afterFiles, 'after'))];
      }
      await statusMutation.mutateAsync({
        id,
        status: 'COMPLETED_BY_WORKER',
        beforeImages,
        afterImages,
        workerRemarks,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">{c.title}</h1>
      <StatusBadge status={c.status} />
      <p>{c.description}</p>
      <p className="text-sm"><strong>Department:</strong> {c.department}</p>
      <ImageUpload label="Before work images" onUpload={setBeforeFiles} maxFiles={5} />
      <ImageUpload label="After work images" onUpload={setAfterFiles} maxFiles={5} />
      <textarea className="textarea textarea-bordered w-full" placeholder="Completion notes" value={workerRemarks} onChange={(e) => setWorkerRemarks(e.target.value)} />
      <div className="flex flex-col sm:flex-row gap-2">
        {['ASSIGNED', 'REWORK_REQUIRED'].includes(c.status) && (
          <Button onClick={() => statusMutation.mutate({ id, status: 'IN_PROGRESS' })} loading={statusMutation.isPending} className="w-full sm:w-auto">
            {c.status === 'REWORK_REQUIRED' ? 'Restart Work' : 'Start Work'}
          </Button>
        )}
        {c.status === 'IN_PROGRESS' && (
          <Button onClick={handleComplete} loading={uploading || statusMutation.isPending} className="w-full sm:w-auto">
            Mark Completed
          </Button>
        )}
        <Link to={`/worker/upload/${id}`} className="btn btn-outline w-full sm:w-auto">Upload Progress</Link>
      </div>
    </div>
  );
}
