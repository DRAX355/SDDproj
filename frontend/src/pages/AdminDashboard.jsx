import React, { useState, useEffect } from 'react';
import { 
  Users, Shield, Activity, UserPlus, X, AlertTriangle, 
  ShieldCheck, CheckCircle, Database, BookOpen, User, Trash2, Calendar
} from 'lucide-react';

// === LOCAL DEVELOPMENT IMPORT ===
// UNCOMMENT THIS LINE WHEN RUNNING ON YOUR LOCAL MACHINE:
// import { mockDB, mockAuth } from '../utils/mockBackend';

// === CANVAS PREVIEW MOCKS ===
// DELETE THIS ENTIRE BLOCK WHEN RUNNING LOCALLY
const mockAuth = {
  getCurrentUser: () => ({ role: 'main_admin', name: 'Demo Super Admin' }),
  createSubAdmin: () => {},
  deleteSubAdmin: () => {}
};

const mockDB = {
  getAllUsers: () => [
    { uid: 'p1', name: 'Alice Smith', age: 28, gender: 'Female', email: 'alice@email.com', phone: '555-0101', role: 'patient' },
    { uid: 's1', name: 'James Carter', age: 24, gender: 'Male', email: 'j.carter@medschool.edu', phone: '555-0999', role: 'student' },
    { uid: 'p2', name: 'Bob Jones', age: 45, gender: 'Male', email: 'bob@email.com', phone: '555-0102', role: 'patient' }
  ],
  getAllAdmins: () => [
    { uid: 'a1', name: 'John Admin', email: 'admin@clinic.com', createdAt: new Date().toISOString() }
  ],
  getSystemLogs: () => [
    { id: 1, timestamp: new Date().toLocaleString(), actorName: 'Alice Smith', actorRole: 'patient', action: 'AI Scan', details: 'Scanned image for Melanoma check (94.2%).' },
    { id: 2, timestamp: new Date().toLocaleString(), actorName: 'James Carter', actorRole: 'student', action: 'Case Study View', details: 'Accessed Case ID #100234 details.' },
    { id: 3, timestamp: new Date().toLocaleString(), actorName: 'Demo Super Admin', actorRole: 'main_admin', action: 'System Login', details: 'Authenticated successfully via secure portal.' }
  ]
};
// ==================================

export default function AdminDashboard() {
  const [user, setUser] = useState(mockAuth.getCurrentUser());
  const isMainAdmin = user?.role === 'main_admin';

  const [activeTab, setActiveTab] = useState('overview');
  
  // Data State
  const [systemUsers, setSystemUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [logs, setLogs] = useState([]);
  
  // UI State
  const [notification, setNotification] = useState(null); 
  const [confirmModal, setConfirmModal] = useState(null); 

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
    // If your local mockDB doesn't have getAllUsers yet, fallback to getAllPatients to prevent crashes
    const users = mockDB.getAllUsers ? mockDB.getAllUsers() : (mockDB.getAllPatients ? mockDB.getAllPatients() : []);
    setSystemUsers(users);
    
    if (isMainAdmin) {
        setAdmins(mockDB.getAllAdmins ? mockDB.getAllAdmins() : []);
        setLogs(mockDB.getSystemLogs ? mockDB.getSystemLogs(user) : []);
    }
  };

  const showToast = (type, message) => {
    setNotification({ type, message });
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
      message: 'This will permanently delete this Sub-Admin account and revoke all their privileges.'
    });
  };

  // --- CONFIRMATION HANDLER ---
  const executeConfirmation = () => {
    if (!confirmModal) return;

    if (confirmModal.type === 'admin') {
      if (mockAuth.deleteSubAdmin) {
        mockAuth.deleteSubAdmin(confirmModal.id, user);
        showToast('success', 'Sub-Admin access revoked');
      }
    }
    
    setConfirmModal(null);
    refreshData();
  };

  // --- UI COMPONENTS ---
  const StatCard = ({ title, count, color, icon: Icon, glow }) => (
    <div className={`group bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-${glow}-500/10 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex items-center justify-between`}>
      <div className={`absolute top-0 left-0 w-full h-1 bg-${color}-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></div>
      <div>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">{title}</p>
        <h3 className={`text-4xl font-extrabold text-gray-900 group-hover:text-${color}-600 transition-colors`}>{count}</h3>
      </div>
      <div className={`bg-${color}-50 p-5 rounded-2xl text-${color}-600 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
        <Icon size={32} />
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 min-h-screen bg-slate-50 relative selection:bg-purple-500 selection:text-white">

      {/* --- NOTIFICATION TOAST --- */}
      {notification && (
        <div className={`fixed top-8 right-8 z-[100] px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 animate-in slide-in-from-top-4 fade-in duration-300 ${notification.type === 'success' ? 'bg-emerald-600/95 text-white' : 'bg-red-600/95 text-white'}`}>
          {notification.type === 'success' ? <CheckCircle size={20}/> : <AlertTriangle size={20}/>}
          <span className="font-bold tracking-wide text-sm">{notification.message}</span>
        </div>
      )}

      {/* --- CONFIRMATION MODAL --- */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl p-10 max-w-sm w-full text-center transform transition-all scale-100 animate-in zoom-in-95">
            <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
              <Trash2 size={36} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{confirmModal.title}</h3>
            <p className="text-gray-500 mb-8 leading-relaxed">{confirmModal.message}</p>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setConfirmModal(null)}
                className="py-3.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={executeConfirmation}
                className="py-3.5 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-200 transition-all hover:scale-105 active:scale-95"
              >
                Yes, Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center gap-4">
            <div className="bg-purple-100 text-purple-600 p-4 rounded-2xl shadow-sm">
                <ShieldCheck size={36} />
            </div>
            <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                    {isMainAdmin ? 'Super Admin' : 'Admin'} Dashboard
                </h1>
                <p className="text-gray-500 font-medium mt-1">Welcome back, {user?.name}</p>
            </div>
        </div>
        {isMainAdmin && (
            <div className="bg-purple-50 border border-purple-200 px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                </div>
                <span className="text-purple-800 text-xs font-extrabold tracking-wider uppercase">Super Privileges</span>
            </div>
        )}
      </div>

      {/* --- PREMIUM TABS --- */}
      <div className="flex gap-3 mb-10 overflow-x-auto pb-2 custom-scrollbar hide-scrollbar">
        {['overview', 'accounts'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 whitespace-nowrap ${
                activeTab === tab 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30 -translate-y-0.5' 
                : 'bg-white text-gray-500 hover:text-purple-600 hover:bg-purple-50 border border-gray-100 shadow-sm'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
        {isMainAdmin && (
            <>
                <button 
                  onClick={() => setActiveTab('staff')} 
                  className={`px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 whitespace-nowrap flex items-center gap-2 ${activeTab === 'staff' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30 -translate-y-0.5' : 'bg-white text-gray-500 hover:text-purple-600 hover:bg-purple-50 border border-gray-100 shadow-sm'}`}
                >
                  <UserPlus size={16}/> Manage Staff
                </button>
                <button 
                  onClick={() => setActiveTab('logs')} 
                  className={`px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 whitespace-nowrap flex items-center gap-2 ${activeTab === 'logs' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30 -translate-y-0.5' : 'bg-white text-gray-500 hover:text-purple-600 hover:bg-purple-50 border border-gray-100 shadow-sm'}`}
                >
                  <Activity size={16}/> Audit Logs
                </button>
            </>
        )}
      </div>

      {/* --- OVERVIEW TAB --- */}
      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <StatCard title="Total Accounts" count={systemUsers.length} color="blue" glow="blue" icon={Users} />
          <StatCard title="System Logs" count={logs.length} color="emerald" glow="emerald" icon={Database} />
          <StatCard title="Active Admins" count={admins.length} color="purple" glow="purple" icon={ShieldCheck} />
          
          <div className="md:col-span-3 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm mt-4 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:shadow-xl transition-all duration-300">
            <div>
                <h3 className="font-bold text-2xl text-gray-900 mb-2">System Status</h3>
                <p className="text-gray-500">All services, databases, and deep learning models are operational.</p>
            </div>
            <div className="flex flex-wrap gap-4">
               <div className="bg-emerald-50 text-emerald-700 px-5 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 border border-emerald-100">
                   <Activity size={18}/> Engine Online
               </div>
               <div className="bg-slate-50 text-slate-700 px-5 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 border border-slate-200">
                   <Shield size={18}/> {isMainAdmin ? 'Main Admin Mode' : 'Restricted Mode'}
               </div>
            </div>
          </div>
        </div>
      )}

      {/* --- ACCOUNTS TAB --- */}
      {activeTab === 'accounts' && (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
             <h3 className="text-xl font-bold text-gray-900">Registered Accounts</h3>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white border-b border-gray-100">
                  <tr>
                    <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-wider">User Profile</th>
                    <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Account Type</th>
                    <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Contact Info</th>
                    <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Activity Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {systemUsers.length === 0 ? (
                       <tr><td colSpan="4" className="p-16 text-center text-gray-400 font-medium">No accounts registered yet.</td></tr>
                  ) : systemUsers.map(u => (
                    <tr key={u.uid} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-6">
                          <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${u.role === 'student' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                  {u.role === 'student' ? <BookOpen size={18}/> : <User size={18}/>}
                              </div>
                              <div>
                                  <span className="font-bold text-gray-900 block">{u.name}</span>
                                  <span className="text-xs text-gray-500">{u.age} yrs • {u.gender}</span>
                              </div>
                          </div>
                      </td>
                      <td className="p-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${u.role === 'student' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                              {u.role || 'Patient'}
                          </span>
                      </td>
                      <td className="p-6 font-medium text-gray-700">
                          {u.email}<br/>
                          <span className="text-xs text-gray-400 font-mono mt-1 block">{u.phone || 'No phone provided'}</span>
                      </td>
                      <td className="p-6 text-gray-500 text-sm">
                          <span className="flex items-center gap-1.5"><Activity size={14} className="text-emerald-500"/> Active in system</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>
        </div>
      )}

      {/* --- STAFF MANAGEMENT (SUPER ADMIN ONLY) --- */}
      {isMainAdmin && activeTab === 'staff' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900">Sub-Admin Accounts</h3>
                    <p className="text-gray-500 mt-1">Manage system administrators and elevated access.</p>
                </div>
                <button 
                    onClick={() => setShowAddAdmin(!showAddAdmin)} 
                    className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 active:scale-95"
                >
                    {showAddAdmin ? <X size={18}/> : <UserPlus size={18}/>} 
                    {showAddAdmin ? 'Cancel' : 'Create Sub-Admin'}
                </button>
            </div>

            {showAddAdmin && (
                <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-blue-500/5 border border-blue-100 mb-10 relative overflow-hidden animate-in zoom-in-95 duration-300">
                    <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
                    <h4 className="font-bold text-xl text-gray-900 mb-6">New Administrator Credentials</h4>
                    <form onSubmit={handleAddAdmin} className="grid md:grid-cols-3 gap-5">
                        <input required placeholder="Staff Full Name" value={newAdmin.name} onChange={e => setNewAdmin({...newAdmin, name: e.target.value})} className="bg-slate-50 px-5 py-3.5 border border-transparent rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"/>
                        <input required type="email" placeholder="Corporate Email" value={newAdmin.email} onChange={e => setNewAdmin({...newAdmin, email: e.target.value})} className="bg-slate-50 px-5 py-3.5 border border-transparent rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"/>
                        <input required type="password" placeholder="Secure Password" value={newAdmin.password} onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} className="bg-slate-50 px-5 py-3.5 border border-transparent rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"/>
                        <button type="submit" className="md:col-span-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all hover:-translate-y-0.5">Authorize & Create Account</button>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Administrator</th>
                            <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Email Route</th>
                            <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Date Granted</th>
                            <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Access Control</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {admins.length === 0 ? <tr><td colSpan="4" className="p-16 text-center text-gray-400 font-medium">No sub-admins found in directory.</td></tr> : 
                        admins.map(a => (
                            <tr key={a.uid} className="hover:bg-slate-50/80 transition-colors group">
                                <td className="p-6 font-bold text-gray-900 flex items-center gap-3">
                                    <div className="bg-blue-100 text-blue-600 p-2 rounded-lg"><Shield size={16}/></div>
                                    {a.name}
                                </td>
                                <td className="p-6 font-medium text-gray-600">{a.email}</td>
                                <td className="p-6 text-gray-500 font-medium text-sm"><Calendar size={14} className="inline mr-2 text-gray-400"/>{new Date(a.createdAt).toLocaleDateString()}</td>
                                <td className="p-6 text-right">
                                    <button 
                                        onClick={() => requestRemoveAdmin(a.uid)} 
                                        className="text-red-500 bg-white border border-gray-200 hover:border-red-200 hover:bg-red-50 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold ml-auto transition-all shadow-sm hover:shadow"
                                    >
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
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 bg-slate-900 text-white border-b border-slate-800 flex items-center gap-3 relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                <Activity size={20} className="text-emerald-400 relative z-10"/> 
                <h3 className="font-bold tracking-wide relative z-10">Live System Audit Trail</h3>
                <span className="ml-auto relative z-10 bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-2 py-1 rounded border border-emerald-500/30 uppercase tracking-widest animate-pulse">Recording</span>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-gray-100">
                        <tr>
                            <th className="p-5 font-bold text-gray-400 uppercase tracking-wider text-xs">Timestamp</th>
                            <th className="p-5 font-bold text-gray-400 uppercase tracking-wider text-xs">Actor Identity</th>
                            <th className="p-5 font-bold text-gray-400 uppercase tracking-wider text-xs">Action Type</th>
                            <th className="p-5 font-bold text-gray-400 uppercase tracking-wider text-xs">Encrypted Payload Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {logs.map(log => (
                            <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="p-5 text-gray-500 font-mono text-xs whitespace-nowrap">{log.timestamp}</td>
                                <td className="p-5 font-bold text-gray-800 flex items-center gap-3">
                                    <span className={`w-2.5 h-2.5 rounded-full shadow-sm ${log.actorRole === 'main_admin' ? 'bg-purple-500 shadow-purple-500/50' : log.actorRole === 'admin' ? 'bg-blue-500 shadow-blue-500/50' : log.actorRole === 'student' ? 'bg-indigo-500 shadow-indigo-500/50' : 'bg-emerald-500 shadow-emerald-500/50'}`}></span>
                                    {log.actorName} 
                                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                                        {log.actorRole?.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="p-5">
                                    <span className="font-bold text-gray-700 bg-white border border-gray-200 shadow-sm px-3 py-1 rounded-lg text-xs tracking-wide">
                                        {log.action}
                                    </span>
                                </td>
                                <td className="p-5 text-gray-600 font-medium">{log.details}</td>
                            </tr>
                        ))}
                        {logs.length === 0 && <tr><td colSpan="4" className="p-16 text-center text-gray-400 font-medium">No system actions recorded yet.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
      )}

    </div>
  );
}