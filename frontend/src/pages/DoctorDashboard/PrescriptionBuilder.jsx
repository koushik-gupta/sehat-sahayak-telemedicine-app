import React, { useState } from 'react';
import { Pill, Plus, Trash2, Send, FileText } from 'lucide-react';

const PrescriptionBuilder = ({ patientId, appointmentId, onComplete }) => {
    const [medicines, setMedicines] = useState([
        { name: '', dosage: '', frequency: '1-0-1', duration: '5 days', instructions: 'After food' }
    ]);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    const addMedicine = () => {
        setMedicines([...medicines, { name: '', dosage: '', frequency: '1-0-1', duration: '5 days', instructions: 'After food' }]);
    };

    const removeMedicine = (index) => {
        const newMeds = medicines.filter((_, i) => i !== index);
        setMedicines(newMeds);
    };

    const updateMedicine = (index, field, value) => {
        const newMeds = [...medicines];
        newMeds[index][field] = value;
        setMedicines(newMeds);
    };

    const handleSubmit = async () => {
        if (!patientId) {
            alert("No patient selected!");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                patient_id: patientId,
                appointment_id: appointmentId,
                notes,
                medicines
            };

            const response = await fetch('/api/v1/doctor/prescriptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert('Prescription sent successfully!');
                if (onComplete) onComplete();
            } else {
                alert('Failed to send prescription.');
            }
        } catch (error) {
            console.error(error);
            alert('Error creating prescription.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <FileText size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-800">Write Prescription</h3>
                    <p className="text-sm text-slate-500">Create a digital prescription for the patient.</p>
                </div>
            </div>

            <div className="space-y-4">
                {medicines.map((med, index) => (
                    <div key={index} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 relative group">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Medicine Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Paracetamol"
                                    value={med.name}
                                    onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                                    className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Dosage</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 500mg"
                                    value={med.dosage}
                                    onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                                    className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Frequency</label>
                                <select
                                    value={med.frequency}
                                    onChange={(e) => updateMedicine(index, 'frequency', e.target.value)}
                                    className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                                >
                                    <option value="1-0-0">1-0-0 (Morning)</option>
                                    <option value="1-0-1">1-0-1 (Morn-Night)</option>
                                    <option value="1-1-1">1-1-1 (Morn-Aft-Night)</option>
                                    <option value="0-0-1">0-0-1 (Night)</option>
                                    <option value="SOS">SOS (As needed)</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Duration</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 5 days"
                                    value={med.duration}
                                    onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                                    className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Instructions</label>
                                <input
                                    type="text"
                                    placeholder="e.g. After food"
                                    value={med.instructions}
                                    onChange={(e) => updateMedicine(index, 'instructions', e.target.value)}
                                    className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {medicines.length > 1 && (
                            <button
                                onClick={() => removeMedicine(index)}
                                className="absolute top-2 right-2 p-2 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>
                ))}

                <button
                    onClick={addMedicine}
                    className="flex items-center gap-2 text-blue-600 font-bold hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus size={18} /> Add Medicine
                </button>
            </div>

            <div className="pt-4 border-t border-slate-100">
                <label className="text-sm font-bold text-slate-700 mb-2 block">Clinical Notes / Advice</label>
                <textarea
                    rows="3"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="General advice, diet restrictions, etc."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100"
                ></textarea>
            </div>

            <div className="flex justify-end pt-2">
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-70"
                >
                    <Send size={18} /> {loading ? 'Sending...' : 'Issue Prescription'}
                </button>
            </div>
        </div>
    );
};

export default PrescriptionBuilder;
