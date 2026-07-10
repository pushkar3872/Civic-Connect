import { useParams, Link } from 'react-router-dom';
import useComplaints from '../../hooks/useComplaints';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ImageUpload from '../../components/common/ImageUpload';
import { useState } from 'react';
import { fileApi } from '../../services';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

export default function UploadProgress() {
  const { id } = useParams();
  const { detailQuery, statusMutation } = useComplaints({ id });
  const [files, setFiles] = useState([]);
  const [type, setType] = useState('before');

  if (detailQuery.isLoading) return <LoadingSpinner />;
  const c = detailQuery.data;

  const handleUpload = async () => {
    const uploaded = await fileApi.upload(files, type);
    const field = type === 'before' ? 'beforeImages' : 'afterImages';
    await statusMutation.mutateAsync({
      id,
      [field]: [...(c[field] || []), ...uploaded],
    });
    toast.success('Images uploaded');
    setFiles([]);
  };

  return (
    <div className="max-w-lg space-y-4">
      <h1 className="text-2xl font-bold">Upload Progress</h1>
      <p className="text-neutral/70">{c?.title}</p>
      <select className="select select-bordered" value={type} onChange={(e) => setType(e.target.value)}>
        <option value="before">Before images</option>
        <option value="after">After images</option>
      </select>
      <ImageUpload onUpload={setFiles} maxFiles={5} />
      <Button onClick={handleUpload} disabled={!files.length} loading={statusMutation.isPending}>Upload</Button>
      <Link to={`/worker/tasks/${id}`} className="btn btn-ghost">Back to task</Link>
    </div>
  );
}
