import React, { useState, useEffect } from 'react';
import { 
  Users, Stethoscope, Calendar, Trash2, Plus, 
  CheckCircle, XCircle, Shield, Activity, UserPlus, X, AlertTriangle 
} from 'lucide-react';
import { mockDB, mockAuth } from '../utils/mockBackend';

export default function AdminDashboard() {
  const [user, setUser] = useState(mockAuth.getCurrentUser());
  const isMainAdmin = user?.role === 'main_admin';

  const [activeTab, setActiveTab] = useState('overview');
  
  // Data State
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [logs, setLogs] = useState([]);
  
  // UI State
  const [notification, setNotification] = useState(null); // For success/error toasts
  const [confirmModal, setConfirmModal] = useState(null); // For delete confirmations
  
  // Forms
  const [showAddDoc, setShowAddDoc] = useState(false);
  const [newDoc, setNewDoc] = useState({ name: '', spec: '', exp: '', loc: '' });

  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    refreshData();
  }, []);

  // Auto-dismiss notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const refreshData = () => {
    setDoctors(mockDB.getDoctors());
    setAppointments(mockDB.getAppointments());
    setPatients(mockDB.getAllPatients());
    if (isMainAdmin) {
        setAdmins(mockDB.getAllAdmins ? mockDB.getAllAdmins() : []);
        setLogs(mockDB.getSystemLogs ? mockDB.getSystemLogs(user) : []);
    }
  };

  const showToast = (type, message) => {
    setNotification({ type, message });
  };

  // --- DOCTOR ACTIONS ---
  const handleAddDoctor = (e) => {
    e.preventDefault();
    mockDB.addDoctor(newDoc, user);
    setShowAddDoc(false);
    setNewDoc({ name: '', spec: '', exp: '', loc: '' });
    refreshData();
    showToast('success', 'Doctor added successfully');
  };

  const requestRemoveDoctor = (id) => {
    setConfirmModal({
      type: 'doctor',
      id: id,
      title: 'Remove Doctor?',
      message: 'This action cannot be undone. The doctor will be removed from the system.'
    });
  };

  // --- SUB-ADMIN ACTIONS ---
  const handleAddAdmin = (e) => {
    e.preventDefault();
    try {
        if (mockAuth.createSubAdmin) {
            mockAuth.createSubAdmin(newAdmin, user);
            setShowAddAdmin(false);
            setNewAdmin({ name: '', email: '', password: '' });
            refreshData();
            showToast('success', 'Sub-Admin created successfully');
        }
    } catch (err) {
        showToast('error', err.message);
    }
  };

  const requestRemoveAdmin = (uid) => {
    setConfirmModal({
      type: 'admin',
      id: uid,
      title: 'Revoke Access?',
      message: 'This will permanently delete this Sub-Admin account.'
    });
  };

  // --- CONFIRMATION HANDLER ---
  const executeConfirmation = () => {
    if (!confirmModal) return;

    if (confirmModal.type === 'doctor') {
      mockDB.removeDoctor(confirmModal.id, user);
      showToast('success', 'Doctor removed');
    } else if (confirmModal.type === 'admin') {
      if (mockAuth.deleteSubAdmin) {
        mockAuth.deleteSubAdmin(confirmModal.id, user);
        showToast('success', 'Sub-Admin access revoked');
      }
    }
    
    setConfirmModal(null);
    refreshData();
  };

  const handleApptStatus = (id, status) => {
    mockDB.updateAppointmentStatus(id, status, user);
    refreshData();
    showToast('success', `Appointment ${status}`);
  };

  const StatCard = ({ title, count, color, icon: Icon }) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">{title}</p>
        <h3 className={`text-3xl font-bold text-${color}-600 mt-1`}>{count}</h3>
      </div>
      <div className={`bg-${color}-50 p-4 rounded-xl text-${color}-600`}>
        <Icon size={28} />
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 min-h-screen bg-slate-50 relative">
      
      {/* --- NOTIFICATION TOAST --- */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 animate-in slide-in-from-top-2 ${notification.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {notification.type === 'success' ? <CheckCircle size={20}/> : <AlertTriangle size={20}/>}
          <span className="font-semibold">{notification.message}</span>
        </div>
      )}

      {/* --- CONFIRMATION MODAL --- */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{confirmModal.title}</h3>
            <p className="text-gray-500 mb-6">{confirmModal.message}</p>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setConfirmModal(null)}
                className="py-3 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button 
                onClick={executeConfirmation}
                className="py-3 rounded-xl font-semibold bg-red-600 text-white hover:bg-red-700 transition shadow-lg shadow-red-200"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">{isMainAdmin ? 'Super Admin' : 'Admin'} Control Panel</h1>
            <p className="text-gray-500">Welcome back, {user?.name}</p>
        </div>
        {isMainAdmin && <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-bold border border-purple-200">SUPER USER</span>}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-200 pb-1 overflow-x-auto">
        {['overview', 'doctors', 'appointments', 'patients'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-4 font-semibold capitalize transition whitespace-nowrap ${activeTab === tab ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-800'}`}
          >
            {tab}
          </button>
        ))}
        {isMainAdmin && (
            <>
                <button onClick={() => setActiveTab('staff')} className={`pb-3 px-4 font-semibold transition whitespace-nowrap ${activeTab === 'staff' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-800'}`}>Manage Staff</button>
                <button onClick={() => setActiveTab('logs')} className={`pb-3 px-4 font-semibold transition whitespace-nowrap ${activeTab === 'logs' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-800'}`}>Audit Logs</button>
            </>
        )}
      </div>

      {/* --- OVERVIEW --- */}
      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-3 gap-6 animate-in fade-in">
          <StatCard title="Total Patients" count={patients.length} color="blue" icon={Users} />
          <StatCard title="Active Doctors" count={doctors.length} color="emerald" icon={Stethoscope} />
          <StatCard title="Appointments" count={appointments.length} color="purple" icon={Calendar} />
          
          <div className="md:col-span-3 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm mt-6">
            <h3 className="font-bold text-xl text-gray-800 mb-4">System Status</h3>
            <div className="flex gap-4">
               <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"><Activity size={16}/> System Online</div>
               <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"><Shield size={16}/> {isMainAdmin ? 'Super Privileges Active' : 'Restricted Mode'}</div>
            </div>
          </div>
        </div>
      )}

      {/* --- DOCTORS --- */}
      {activeTab === 'doctors' && (
        <div className="animate-in fade-in">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">Medical Staff</h3>
            <button onClick={() => setShowAddDoc(true)} className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-purple-700 transition">
              <Plus size={18}/> Add Doctor
            </button>
          </div>

          {showAddDoc && (
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-purple-100 mb-8 relative">
              <button onClick={() => setShowAddDoc(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20}/></button>
              <h4 className="font-bold text-gray-800 mb-4">Register New Doctor</h4>
              <form onSubmit={handleAddDoctor} className="grid md:grid-cols-2 gap-4">
                <input required placeholder="Dr. Name" value={newDoc.name} onChange={e => setNewDoc({...newDoc, name: e.target.value})} className="px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-200"/>
                <input required placeholder="Specialization" value={newDoc.spec} onChange={e => setNewDoc({...newDoc, spec: e.target.value})} className="px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-200"/>
                <input required placeholder="Experience" value={newDoc.exp} onChange={e => setNewDoc({...newDoc, exp: e.target.value})} className="px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-200"/>
                <input required placeholder="Location" value={newDoc.loc} onChange={e => setNewDoc({...newDoc, loc: e.target.value})} className="px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-200"/>
                <button type="submit" className="md:col-span-2 bg-purple-600 text-white py-2 rounded-lg font-bold hover:bg-purple-700">Save Doctor</button>
              </form>
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map(doc => (
              <div key={doc.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative group">
                <button onClick={() => requestRemoveDoctor(doc.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition">
                  <Trash2 size={20}/>
                </button>
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center font-bold text-lg">Dr</div>
                  <div>
                    <h4 className="font-bold text-gray-800">{doc.name}</h4>
                    <p className="text-purple-600 text-sm">{doc.spec}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>{doc.loc}</p>
                  <p>{doc.exp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- APPOINTMENTS --- */}
      {activeTab === 'appointments' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-6 font-semibold text-gray-600">Patient</th>
                <th className="p-6 font-semibold text-gray-600">Doctor</th>
                <th className="p-6 font-semibold text-gray-600">Date</th>
                <th className="p-6 font-semibold text-gray-600">Status</th>
                <th className="p-6 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {appointments.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-400">No appointments scheduled.</td></tr>
              ) : appointments.map(appt => (
                <tr key={appt.id} className="hover:bg-gray-50">
                  <td className="p-6 font-medium text-gray-900">{appt.patientName}</td>
                  <td className="p-6 text-gray-600">{appt.doctorName}</td>
                  <td className="p-6 text-gray-600">{appt.date}</td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      appt.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 
                      appt.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {appt.status}
                    </span>
                  </td>
                  <td className="p-6 flex gap-2">
                    {appt.status === 'Pending' && (
                      <>
                        <button onClick={() => handleApptStatus(appt.id, 'Confirmed')} className="text-green-600 hover:bg-green-50 p-2 rounded-lg transition"><CheckCircle size={20}/></button>
                        <button onClick={() => handleApptStatus(appt.id, 'Cancelled')} className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition"><XCircle size={20}/></button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- PATIENTS --- */}
      {activeTab === 'patients' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-6 font-semibold text-gray-600">Name</th>
                <th className="p-6 font-semibold text-gray-600">Age/Gender</th>
                <th className="p-6 font-semibold text-gray-600">Contact</th>
                <th className="p-6 font-semibold text-gray-600">Medical Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {patients.map(p => (
                <tr key={p.uid} className="hover:bg-gray-50">
                  <td className="p-6 font-medium text-gray-900">{p.name}</td>
                  <td className="p-6 text-gray-600">{p.age} yrs / {p.gender}</td>
                  <td className="p-6 text-gray-600">{p.email}<br/><span className="text-xs text-gray-400">{p.phone}</span></td>
                  <td className="p-6 text-gray-500 text-sm max-w-xs truncate">{p.medicalHistory || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- STAFF MANAGEMENT (SUPER ADMIN ONLY) --- */}
      {isMainAdmin && activeTab === 'staff' && (
        <div className="animate-in fade-in">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Sub-Admin Accounts</h3>
                <button onClick={() => setShowAddAdmin(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700 transition">
                    <UserPlus size={18}/> Create Sub-Admin
                </button>
            </div>

            {showAddAdmin && (
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100 mb-8 relative">
                    <button onClick={() => setShowAddAdmin(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20}/></button>
                    <h4 className="font-bold text-gray-800 mb-4">New Sub-Admin Credentials</h4>
                    <form onSubmit={handleAddAdmin} className="grid md:grid-cols-3 gap-4">
                        <input required placeholder="Staff Name" value={newAdmin.name} onChange={e => setNewAdmin({...newAdmin, name: e.target.value})} className="px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-200"/>
                        <input required type="email" placeholder="Email" value={newAdmin.email} onChange={e => setNewAdmin({...newAdmin, email: e.target.value})} className="px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-200"/>
                        <input required type="password" placeholder="Password" value={newAdmin.password} onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} className="px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-200"/>
                        <button type="submit" className="md:col-span-3 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700">Create Account</button>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="p-6">Name</th>
                            <th className="p-6">Email</th>
                            <th className="p-6">Created At</th>
                            <th className="p-6">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {admins.length === 0 ? <tr><td colSpan="4" className="p-8 text-center text-gray-400">No sub-admins found.</td></tr> : 
                        admins.map(a => (
                            <tr key={a.uid} className="hover:bg-gray-50">
                                <td className="p-6 font-medium">{a.name}</td>
                                <td className="p-6 text-gray-600">{a.email}</td>
                                <td className="p-6 text-gray-400 text-sm">{new Date(a.createdAt).toLocaleDateString()}</td>
                                <td className="p-6">
                                    <button onClick={() => requestRemoveAdmin(a.uid)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg flex items-center gap-1 text-sm font-medium">
                                        <Trash2 size={16}/> Revoke
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {/* --- AUDIT LOGS (SUPER ADMIN ONLY) --- */}
      {isMainAdmin && activeTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in">
            <div className="p-4 bg-gray-50 border-b border-gray-100 text-sm text-gray-500 flex items-center gap-2">
                <Activity size={16}/> Live System Audit Trail
            </div>
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th className="p-4 font-semibold text-gray-600">Timestamp</th>
                        <th className="p-4 font-semibold text-gray-600">Actor</th>
                        <th className="p-4 font-semibold text-gray-600">Action</th>
                        <th className="p-4 font-semibold text-gray-600">Details</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {logs.map(log => (
                        <tr key={log.id} className="hover:bg-gray-50">
                            <td className="p-4 text-gray-500 font-mono text-xs">{log.timestamp}</td>
                            <td className="p-4 font-medium flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${log.actorRole === 'main_admin' ? 'bg-purple-500' : log.actorRole === 'admin' ? 'bg-blue-500' : 'bg-emerald-500'}`}></span>
                                {log.actorName} <span className="text-xs text-gray-400">({log.actorRole})</span>
                            </td>
                            <td className="p-4 font-semibold text-gray-700">{log.action}</td>
                            <td className="p-4 text-gray-600">{log.details}</td>
                        </tr>
                    ))}
                    {logs.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-gray-400">No actions recorded yet.</td></tr>}
                </tbody>
            </table>
        </div>
      )}

    </div>
  );
}