// frontend/src/pages/Admin/ManageDoctors.jsx
import React, { useState, useEffect } from "react";

function ManageDoctors() {
  const [activeTab, setActiveTab] = useState("pending"); // 'pending', 'all'
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDoctors();
  }, [activeTab]);

  const fetchDoctors = async () => {
    setLoading(true);
    setError(null);
    try {
      const statusParam = activeTab === 'pending' ? '&status=pending' : '';
      const response = await fetch(`/api/v1/admin/users/details?role=doctor${statusParam}`, {
        credentials: 'include',
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch doctors");

      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalAction = async (userId, action) => {
    if (action === 'reject' && !window.confirm("Are you sure? This will delete the user's data.")) return;

    try {
      const endpoint = action === 'approve'
        ? `/api/v1/admin/users/${userId}/approve`
        : `/api/v1/admin/users/${userId}/reject`;

      const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      alert(`User ${action}d successfully`);
      fetchDoctors();

    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 animation-fade-in relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Doctor Management</h2>

        {/* Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "pending"
              ? "bg-white text-slate-800 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
              }`}
          >
            Pending Approvals
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "all"
              ? "bg-white text-slate-800 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
              }`}
          >
            All Doctors
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-purple-600"></div>
          <p className="mt-4 text-slate-500">Loading...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-red-500 bg-red-50 rounded-2xl border border-red-100">
          Error: {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {users.length === 0 ? (
            <div className="col-span-full text-center p-12 bg-white rounded-3xl border border-slate-100 text-slate-500">
              {activeTab === 'pending' ? "No pending applications." : "No doctors found."}
            </div>
          ) : (
            users.map((user) => (
              <div key={user.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 line-clamp-1" title={user.full_name}>{user.full_name}</h3>
                    <p className="text-sm text-slate-500">{user.email || 'N/A'}</p>
                  </div>
                  <Badge status={user.status} />
                </div>

                <div className="space-y-3 mb-6 flex-1">
                  <div className="text-sm">
                    <span className="block text-xs font-semibold text-slate-400 uppercase">Registration #</span>
                    <span className="text-slate-700 truncate block">{user.registration_number || 'N/A'}</span>
                  </div>
                  <div className="text-sm">
                    <span className="block text-xs font-semibold text-slate-400 uppercase">Qualification</span>
                    <span className="text-slate-700 truncate block" title={user.qualification}>{user.qualification || 'Not provided'}</span>
                  </div>
                  <div className="text-sm">
                    <span className="block text-xs font-semibold text-slate-400 uppercase">Specialization</span>
                    <span className="text-slate-700 truncate block">{user.specialization || 'Not provided'}</span>
                  </div>
                  <div className="text-sm">
                    <span className="block text-xs font-semibold text-slate-400 uppercase">Joined</span>
                    <span className="text-slate-700">{new Date(user.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Documents Section */}
                {activeTab === 'pending' && (
                  <div className="mb-6 bg-slate-50 p-3 rounded-xl">
                    <strong className="text-xs font-semibold text-slate-400 uppercase block mb-2">Documents</strong>
                    {user.document_urls ? (
                      <ul className="space-y-1">
                        {user.document_urls.split('|||').map((url, index) => (
                          <li key={index}>
                            <a
                              href={`${url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-xs font-bold hover:underline flex items-center gap-1"
                            >
                              📄 Document {index + 1}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No files.</p>
                    )}
                  </div>
                )}

                {/* Actions */}
                {activeTab === 'pending' ? (
                  <div className="flex gap-3 pt-4 border-t border-slate-50 mt-auto">
                    <button
                      onClick={() => handleApprovalAction(user.id, 'approve')}
                      className="flex-1 bg-green-50 text-green-700 hover:bg-green-100 py-2 rounded-xl font-bold text-sm transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleApprovalAction(user.id, 'reject')}
                      className="flex-1 bg-red-50 text-red-700 hover:bg-red-100 py-2 rounded-xl font-bold text-sm transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-slate-50 mt-auto">
                    <button className="w-full bg-slate-100 text-slate-600 hover:bg-slate-200 py-2 rounded-xl font-bold text-sm transition-colors">
                      View Full Profile
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

const Badge = ({ status }) => {
  let colorClass = "bg-slate-100 text-slate-600";
  if (status === 'active') colorClass = "bg-green-100 text-green-700";
  else if (status.includes('pending')) colorClass = "bg-amber-100 text-amber-700";
  else if (status === 'rejected') colorClass = "bg-red-100 text-red-700";

  return (
    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${colorClass}`}>
      {status.replace('pending_', 'Pending ')}
    </span>
  );
};

export default ManageDoctors;
