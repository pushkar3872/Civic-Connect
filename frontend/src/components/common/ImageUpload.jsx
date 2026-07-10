import { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';

export default function ImageUpload({ onUpload, maxFiles = 5, label = 'Upload images' }) {
  const [previews, setPreviews] = useState([]);
  const [files, setFiles] = useState([]);

  const handleChange = useCallback((e) => {
    const selected = Array.from(e.target.files || []).slice(0, maxFiles);
    setFiles(selected);
    setPreviews(selected.map((f) => URL.createObjectURL(f)));
    onUpload?.(selected);
  }, [maxFiles, onUpload]);

  return (
    <div className="form-control w-full">
      <label className="label"><span className="label-text">{label} (max {maxFiles})</span></label>
      <label className="border-2 border-dashed border-base-300 rounded-box p-8 flex flex-col items-center cursor-pointer hover:border-primary">
        <Upload className="mb-2 text-neutral/50" />
        <span className="text-sm text-neutral/60">Click or drag files here</span>
        <input type="file" className="hidden" accept="image/*" multiple onChange={handleChange} />
      </label>
      {previews.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {previews.map((src, i) => (
            <img key={src} src={src} alt={`preview-${i}`} className="w-20 h-20 object-cover rounded-lg" />
          ))}
        </div>
      )}
      {files.length > 0 && <p className="text-xs mt-2">{files.length} file(s) selected</p>}
    </div>
  );
}

export { ImageUpload };
