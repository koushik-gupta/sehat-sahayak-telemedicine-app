// frontend/src/pages/Admin/ManagePatients.jsx
import React, { useState, useEffect } from "react";

function ManagePatients() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/v1/admin/users?role=patient', {
                credentials: 'include',
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to load patients");
            setPatients(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading patients...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

    return (
        <div className="space-y-6 animation-fade-in">
            <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-slate-800">Patient Management</h2>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                                <th className="p-6">Name</th>
                                <th className="p-6">Contact</th>
                                <th className="p-6">Status</th>
                                <th className="p-6">Joined</th>
                                <th className="p-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {patients.length === 0 ? (
                                <tr><td colSpan="5" className="p-8 text-center text-slate-500">No patients found.</td></tr>
                            ) : (
                                patients.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-6 font-medium text-slate-800">{user.full_name}</td>
                                        <td className="p-6 text-slate-600">
                                            <div className="flex flex-col">
                                                <span>{user.email}</span>
                                                <span className="text-xs text-slate-400">{user.mobile}</span>
                                            </div>
                                        </td>
                                        <td className="p-6"><span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase">{user.status}</span></td>
                                        <td className="p-6 text-slate-500">{new Date(user.created_at).toLocaleDateString()}</td>
                                        <td className="p-6">
                                            <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">View Details</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default ManagePatients;
