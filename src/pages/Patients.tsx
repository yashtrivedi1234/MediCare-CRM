import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Patient } from '../types';
import { Search, Plus, Eye, Edit2, Trash2, Phone, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const Patients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPatients((data as Patient[]) || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm) ||
      p.patient_mrn?.includes(searchTerm)
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Patients</h1>
            <p className="text-slate-600 mt-1">Manage patient records and information</p>
          </div>
          <button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition">
            <Plus className="w-5 h-5" />
            Add Patient
          </button>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, phone, or MRN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading patients...</div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-8 text-slate-500">No patients found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">Name</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">MRN</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">Contact</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">Blood Group</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {patient.first_name} {patient.last_name}
                          </p>
                          <p className="text-xs text-slate-500">DOB: {patient.date_of_birth}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-700">{patient.patient_mrn || '-'}</td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-slate-700">
                            <Phone className="w-4 h-4" />
                            {patient.phone}
                          </div>
                          {patient.email && (
                            <div className="flex items-center gap-1 text-slate-700">
                              <Mail className="w-4 h-4" />
                              {patient.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {patient.blood_group ? (
                          <span className="inline-block px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-semibold">
                            {patient.blood_group}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedPatient(patient)}
                            className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 hover:bg-yellow-50 rounded-lg text-yellow-600 transition" title="Edit">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selectedPatient && (
          <PatientDetailsModal patient={selectedPatient} onClose={() => setSelectedPatient(null)} />
        )}
      </div>
    </Layout>
  );
};

interface PatientDetailsModalProps {
  patient: Patient;
  onClose: () => void;
}

const PatientDetailsModal: React.FC<PatientDetailsModalProps> = ({ patient, onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Patient Details</h2>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-700 text-2xl font-bold"
        >
          ×
        </button>
      </div>

      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-slate-600">Full Name</label>
            <p className="text-slate-900">{patient.first_name} {patient.last_name}</p>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-600">MRN</label>
            <p className="text-slate-900">{patient.patient_mrn || '-'}</p>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-600">DOB</label>
            <p className="text-slate-900">{patient.date_of_birth}</p>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-600">Blood Group</label>
            <p className="text-slate-900">{patient.blood_group || '-'}</p>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-600">Phone</label>
            <p className="text-slate-900">{patient.phone}</p>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-600">Email</label>
            <p className="text-slate-900">{patient.email || '-'}</p>
          </div>
        </div>

        {patient.medical_history && (
          <div>
            <label className="text-sm font-semibold text-slate-600">Medical History</label>
            <p className="text-slate-900">{patient.medical_history}</p>
          </div>
        )}

        {patient.allergies && (
          <div>
            <label className="text-sm font-semibold text-slate-600">Allergies</label>
            <p className="text-red-600 font-semibold">{patient.allergies}</p>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 rounded-lg transition">
            Edit Patient
          </button>
          <button
            onClick={onClose}
            className="flex-1 border border-slate-300 hover:bg-slate-50 text-slate-900 font-semibold py-2 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
);
