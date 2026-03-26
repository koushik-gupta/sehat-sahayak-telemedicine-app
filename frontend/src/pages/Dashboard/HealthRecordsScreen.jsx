// src/pages/Dashboard/HealthRecordsScreen.jsx
import React, { useState, useEffect } from "react";
import { FileText, Calendar, ChevronLeft, Upload, Loader2, Download, Eye, Plus, Trash2 } from "lucide-react";
import { resolveBackendAssetUrl } from "../../utils/runtime";

function HealthRecordsScreen({ t, onBack }) {
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  // Mock Data for UI visualization
  const mockRecords = [
    { id: 101, file_name: 'user_Blood_Test_Report_Jan2025.pdf', file_url: '#', uploaded_at: '2025-01-15T10:30:00Z' },
    { id: 102, file_name: 'user_X-Ray_Chest.jpg', file_url: '#', uploaded_at: '2025-02-10T14:20:00Z' },
    { id: 103, file_name: 'user_Prescription_Dr_Smith.pdf', file_url: '#', uploaded_at: '2025-02-12T09:15:00Z' },
    { id: 104, file_name: 'user_Vaccination_Certificate.pdf', file_url: '#', uploaded_at: '2024-11-20T16:45:00Z' },
  ];

  const fetchRecords = async () => {
    try {
      const response = await fetch('/api/v1/user/documents', { credentials: 'include' });
      if (!response.ok) throw new Error("Failed to fetch records");
      const data = await response.json();

      setRecords(data);
    } catch (err) {
      console.error(err);
      setError("Could not load health records.");
    } finally {
      setIsLoading(false);
    }
  };

  const fileInputRef = React.useRef(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('document', file);

    try {
      const response = await fetch('/api/v1/user/upload-documents', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }

      // Refresh list
      await fetchRecords();
      alert("Record uploaded successfully!");
    } catch (err) {
      alert(err.message);
    } finally {
      setIsUploading(false);
      // Reset input so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteRecord = async (docId, e) => {
    e.stopPropagation(); // Prevent card click
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    try {
      const response = await fetch(`/api/v1/user/delete-document/${docId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error("Failed to delete record");
      }

      // Remove from state immediately for better UX
      setRecords(prev => prev.filter(r => r.id !== docId));

    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto animation-fade-in space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{t.healthRecords || "Health Records"}</h1>
            <p className="text-slate-500 text-sm">View and download your medical history</p>
          </div>
        </div>

        <div>
          <button
            onClick={handleUploadClick}
            disabled={isUploading}
            className={`bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2 ${isUploading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isUploading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
            <span>{isUploading ? "Uploading..." : "Upload New Record"}</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileUpload}
            accept=".pdf,.png,.jpg,.jpeg"
          />
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Loader2 size={32} className="animate-spin text-blue-500 mb-4" />
            <p>Loading records...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center">
            {error}
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <FileText size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">No Records Found</h3>
            <p className="text-slate-500">Upload your prescriptions, reports, or X-rays.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {records.map((doc) => (
              <div key={doc.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group relative">

                {/* Delete Button */}
                <button
                  onClick={(e) => handleDeleteRecord(doc.id, e)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete Record"
                >
                  <Trash2 size={18} />
                </button>

                <div className="flex justify-between items-start mb-4 pr-10">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <FileText size={24} />
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={resolveBackendAssetUrl(doc.file_url)}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors"
                      title="View"
                    >
                      <Eye size={18} />
                    </a>
                    <a
                      href={resolveBackendAssetUrl(doc.file_url)}
                      download
                      className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors"
                      title="Download"
                    >
                      <Download size={18} />
                    </a>
                  </div>
                </div>

                <h3 className="font-bold text-slate-800 mb-1 truncate" title={doc.file_name}>
                  {doc.file_name.includes('user_') ? doc.file_name.split('_').slice(1).join('_') : doc.file_name}
                </h3>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-4">Medical Record</p>

                <div className="pt-4 border-t border-slate-50 flex items-center gap-2 text-slate-400 text-sm">
                  <Calendar size={14} />
                  <span>{new Date(doc.uploaded_at || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HealthRecordsScreen;
