import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import useComplaints from '../../hooks/useComplaints';
import { fileApi } from '../../services';
import { CATEGORIES } from '../../utils/departmentFromCategory';
import ImageUpload from '../../components/common/ImageUpload';
import Button from '../../components/common/Button';

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export default function CreateComplaint() {
  const navigate = useNavigate();
  const { createMutation } = useComplaints({});
  const [files, setFiles] = useState([]);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [form, setForm] = useState({ title: '', description: '', category: 'ROAD', priority: 'MEDIUM' });

  const captureLocation = () => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      setLocation({ latitude, longitude });
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (apiKey) {
        try {
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
          );
          const data = await res.json();
          setAddress(data.results?.[0]?.formatted_address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } catch {
          setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
      } else {
        setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let images = [];
    if (files.length) {
      images = await fileApi.upload(files, 'complaints');
    }
    await createMutation.mutateAsync({
      ...form,
      images,
      location: location ? { ...location, address } : undefined,
    });
    navigate('/citizen/complaints');
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Submit Complaint</h1>
      <form onSubmit={handleSubmit} className="card bg-base-100 shadow border border-base-300">
        <div className="card-body space-y-4">
          <label className="form-control"><span className="label-text">Title</span>
            <input className="input input-bordered" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </label>
          <label className="form-control"><span className="label-text">Description</span>
            <textarea className="textarea textarea-bordered" required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="form-control"><span className="label-text">Category</span>
              <select className="select select-bordered" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
              </select>
            </label>
            <label className="form-control"><span className="label-text">Priority</span>
              <select className="select select-bordered" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </label>
          </div>
          <ImageUpload onUpload={setFiles} maxFiles={5} />
          <div>
            <Button type="button" variant="outline" onClick={captureLocation}><MapPin size={16} /> Use My Location</Button>
            {address && <p className="text-sm mt-2 text-neutral/70">{address}</p>}
          </div>
          <Button type="submit" loading={createMutation.isPending} className="w-full">Submit Complaint</Button>
        </div>
      </form>
    </div>
  );
}
