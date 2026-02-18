import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Activity, Loader2, ArrowLeft, Phone, AlertCircle } from 'lucide-react';
import { mockAuth } from '../utils/mockBackend';

export default function Auth({ onLogin }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const initialRole = searchParams.get('role') || 'patient';
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [role, setRole] = useState(initialRole);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    phone: '',
    gender: 'Male',
    medicalHistory: ''
  });

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam) setRole(roleParam);
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Phone & Data Validation for Patients
    if (isRegistering && role === 'patient') {
        if (!formData.phone || formData.phone.length < 10) {
            setError("Please enter a valid phone number.");
            setLoading(false);
            return;
        }
    }

    try {
      let user;
      if (isRegistering) {
        if (role !== 'patient') throw new Error("Admin accounts must be created by the System Administrator.");
        user = await mockAuth.register({ ...formData, role: 'patient' });
      } else {
        user = await mockAuth.login(formData.email, formData.password);
        
        // Strict Role Access Control
        if (role === 'admin' && user.role !== 'admin' && user.role !== 'main_admin') {
             throw new Error("Access Denied: You do not have admin privileges.");
        }
        if (role === 'patient' && user.role !== 'patient') {
             throw new Error("Please use the Admin Portal.");
        }
      }
      
      const targetPath = (user.role === 'main_admin' || user.role === 'admin') ? '/admin' : '/patient';
      
      onLogin(user);
      navigate(targetPath);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const color = role === 'admin' ? 'purple' : 'emerald';

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 bg-${color}-50`}>
      <button onClick={() => navigate('/')} className="absolute top-6 left-6 flex items-center text-gray-500 hover:text-gray-900 font-medium">
        <ArrowLeft size={20} className="mr-2"/> Back to Home
      </button>

      <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100">
        <div className={`bg-${color}-600 p-8 text-center relative overflow-hidden`}>
          <div className="absolute inset-0 bg-white/10 opacity-50 skew-y-6 scale-150"></div>
          <div className="relative z-10">
            <Link to="/" className="inline-block hover:opacity-90 transition-opacity" title="Go to Home">
              <Activity className="h-12 w-12 text-white mx-auto mb-3" />
            </Link>
            <h2 className="text-3xl font-bold text-white capitalize">
              {role === 'admin' ? 'Administrative' : 'Patient'} Access
            </h2>
            <p className="text-white/90 mt-2 text-sm">
              {isRegistering ? 'Create your secure medical profile' : 'Secure System Login'}
            </p>
          </div>
        </div>

        <div className="p-8">
          {error && <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center"><AlertCircle size={16} className="mr-2"/>{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Login Fields */}
            {!isRegistering && (
              <>
                <input required type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-opacity-50 outline-none transition bg-gray-50" style={{ '--tw-ring-color': `var(--${color}-500)` }} />
                <input required type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-opacity-50 outline-none transition bg-gray-50" style={{ '--tw-ring-color': `var(--${color}-500)` }} />
                
                {role === 'admin' && (
                    <p className="text-xs text-center text-gray-400 mt-2">
                        Demo: <span className="font-mono text-purple-600">super@admin.com</span> / <span className="font-mono text-purple-600">admin</span>
                    </p>
                )}
              </>
            )}

            {/* Registration Fields (Only for Patients) */}
            {isRegistering && (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Account Info</label>
                  <div className="grid gap-3 mt-1">
                    <input required type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-emerald-500" />
                    <input required type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-emerald-500" />
                    <input required type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-emerald-500" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Personal Details</label>
                  <div className="grid grid-cols-2 gap-3 mt-1">
                    <input required type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-emerald-500" />
                    <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-emerald-500">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="mt-3 relative">
                    <Phone className="absolute left-4 top-3.5 text-gray-400" size={18}/>
                    <input required type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-emerald-500" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Medical Profile</label>
                  <textarea name="medicalHistory" placeholder="Known Allergies, Past Skin Conditions, Medications..." value={formData.medicalHistory} onChange={handleChange} className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-emerald-500 h-24 resize-none" />
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading} 
              className={`w-full bg-${color}-600 text-white py-4 rounded-xl font-bold hover:bg-${color}-700 transition flex items-center justify-center shadow-lg shadow-${color}-200 mt-4`}
            >
              {loading ? <Loader2 className="animate-spin" /> : (isRegistering ? 'Complete Registration' : 'Access Portal')}
            </button>
          </form>

          {role === 'patient' && (
            <div className="mt-6 text-center">
              <button onClick={() => setIsRegistering(!isRegistering)} className={`text-${color}-600 font-medium text-sm hover:underline`}>
                {isRegistering ? 'Already have an account? Sign In' : 'New here? Create an Account'}
              </button>
            </div>
          )}
          
          {role === 'admin' && isRegistering && (
             <p className="mt-4 text-center text-red-500 text-xs font-semibold">
               Public Admin registration is disabled. Contact Main Admin.
             </p>
          )}
        </div>
      </div>
    </div>
  );
}