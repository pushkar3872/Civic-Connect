import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { formatDate } from '../../utils/formatDate';

const AVAILABLE_FIELDS = [
  { key: 'title', label: 'Title' },
  { key: 'category', label: 'Category' },
  { key: 'department', label: 'Department' },
  { key: 'priority', label: 'Priority' },
  { key: 'status', label: 'Status' },
  { key: 'citizenId', label: 'Citizen ID' },
  { key: 'assignedWorker', label: 'Worker ID' },
  { key: 'createdAt', label: 'Date Created' },
];

export default function ExportReportModal({ isOpen, onClose, complaints }) {
  const [selectedFields, setSelectedFields] = useState(
    AVAILABLE_FIELDS.reduce((acc, field) => ({ ...acc, [field.key]: true }), {})
  );

  const handleToggle = (key) => {
    setSelectedFields((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getFilteredData = () => {
    const activeKeys = AVAILABLE_FIELDS.filter((f) => selectedFields[f.key]);

    return complaints.map((c) => {
      const row = {};
      activeKeys.forEach((f) => {
        let val = c[f.key];
        if (f.key === 'createdAt') val = formatDate(val);
        if (typeof val === 'object' && val !== null) {
          // Flatten objects if needed (e.g., worker or citizen populated objects)
          val = val._id || val.name || JSON.stringify(val);
        }
        row[f.label] = val || 'N/A';
      });
      return row;
    });
  };

  const downloadXLSX = () => {
    const data = getFilteredData();
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    XLSX.writeFile(workbook, 'civic-connect-report.xlsx');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-base-100 p-6 rounded-lg w-full max-w-xl shadow-xl">
        <h2 className="text-xl font-bold mb-4">Export Custom Report</h2>
        <p className="text-sm text-base-content/70 mb-4">
          Select the fields you want to include in your exported report.
        </p>

        <div className="grid grid-cols-2 gap-2 mb-6 max-h-60 overflow-y-auto p-4 border border-base-300 rounded">
          {AVAILABLE_FIELDS.map((field) => (
            <label key={field.key} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                className="checkbox checkbox-primary checkbox-sm"
                checked={selectedFields[field.key]}
                onChange={() => handleToggle(field.key)}
              />
              <span className="label-text">{field.label}</span>
            </label>
          ))}
        </div>

        <div className="flex justify-between items-center mt-6">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <div className="flex gap-2">
            <button className="btn btn-success text-white" onClick={downloadXLSX}>
              Download Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
