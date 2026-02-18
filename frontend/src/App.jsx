import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, LogOut } from 'lucide-react';
import { mockAuth } from './utils/mockBackend';

import Header from './components/Header';
import Home from './pages/Home';
import Auth from './pages/Auth';
import PatientDashboard from './pages/PatientDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Split into a separate component to use 'useLocation' and 'useNavigate' hooks
function AppContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false); // State for custom modal
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const loggedInUser = mockAuth.getCurrentUser();
    setUser(loggedInUser);
    setLoading(false);
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  // Trigger the custom modal instead of window.confirm
  const requestLogout = () => {
    setShowLogoutModal(true);
  };

  // Actual logout logic
  const confirmLogout = () => {
    mockAuth.logout();
    setShowLogoutModal(false);
    
    // 1. Navigate to Home Page FIRST
    navigate('/'); 
    
    // 2. Clear user state after a tiny delay.
    // This prevents the current protected route (e.g., /patient) from detecting 
    // "no user" and redirecting to /auth before the URL has successfully changed to /.
    setTimeout(() => {
        setUser(null);
    }, 50);
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin h-10 w-10 text-emerald-600"/></div>;

  // Only show the main app Header if we are NOT on the home page
  const showHeader = location.pathname !== '/';

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900">
      {showHeader && <Header user={user} onLogout={requestLogout} />}
      
      <Routes>
        <Route path="/" element={<Home />} />
        
        <Route 
          path="/auth" 
          element={!user ? <Auth onLogin={handleLoginSuccess} /> : <Navigate to={user.role.includes('admin') ? "/admin" : "/patient"} />} 
        />
        
        {/* Protected Routes */}
        <Route 
          path="/patient" 
          element={user && user.role === 'patient' ? <PatientDashboard user={user} /> : <Navigate to="/auth" />} 
        />
        
        {/* Admin Route: allows both 'admin' and 'main_admin' */}
        <Route 
          path="/admin" 
          element={user && (user.role === 'admin' || user.role === 'main_admin') ? <AdminDashboard /> : <Navigate to="/auth" />} 
        />
        
        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* --- CUSTOM LOGOUT MODAL --- */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center transform transition-all scale-100">
            <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
              <LogOut size={40} />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Log Out?</h3>
            <p className="text-gray-500 mb-8 text-lg">Are you sure you want to end your session?</p>
            
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="py-3.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmLogout}
                className="py-3.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200 transition-all transform hover:scale-105"
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}