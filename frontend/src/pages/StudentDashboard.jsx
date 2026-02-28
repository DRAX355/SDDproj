import React, { useState, useEffect } from 'react';
import { BookOpen, User, FileText, Image as ImageIcon, Activity, Search, X, AlertCircle } from 'lucide-react';
import { mockDB } from '../utils/mockBackend'; // Using your actual local storage backend

export default function StudentDashboard({ user }) {
  const [cases, setCases] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // Fixed naming convention
  const [selectedCase, setSelectedCase] = useState(null);

  useEffect(() => {
    // Fetch all patients and aggregate their real reports from local storage
    try {
      const allPatients = mockDB.getAllPatients() || [];
      let allCases = [];
      
      allPatients.forEach(patient => {
        const patientReports = mockDB.getUserReports(patient.uid) || [];
        patientReports.forEach(report => {
          allCases.push({
            id: report.id,
            age: patient.age,
            gender: patient.gender,
            diagnosis: report.diagnosis,
            confidence: report.confidence,
            treatment: report.treatment,
            symptoms: report.symptoms,
            imageUrl: report.imageUrl || null, 
            date: report.date
          });
        });
      });
      
      // Sort newest first
      allCases.sort((a, b) => b.id - a.id);
      setCases(allCases);
    } catch (err) {
      console.error("Error loading cases for student portal:", err);
    }
  }, []);

  // --- UPGRADED SEARCH LOGIC ---
  // Now searches across Diagnosis, Symptoms, Treatments, and Case IDs!
  const filteredCases = cases.filter(c => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    
    return (
      c.diagnosis?.toLowerCase().includes(term) ||
      c.symptoms?.toLowerCase().includes(term) ||
      c.treatment?.toLowerCase().includes(term) ||
      c.id?.toString().includes(term)
    );
  });

  return (
    <div className="max-w-7xl mx-auto p-6 min-h-screen bg-slate-50 relative">
      
      {/* Header */}
      <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-blue-200 p-4 rounded-full text-blue-800">
            <BookOpen size={28}/>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-blue-950">Medical Student Portal</h1>
            <p className="text-blue-700 text-sm">Welcome, {user?.name} • Educational Case Studies</p>
          </div>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-3.5 text-blue-400" size={18} />
          <input 
            type="text" 
            placeholder="Search condition, symptom, or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm shadow-sm transition-all"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 flex gap-4">
        <div className="bg-white px-5 py-3 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
            <Activity className="text-blue-500" size={20}/>
            <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Total Cases</p>
                <p className="text-xl font-bold text-gray-800">{cases.length}</p>
            </div>
        </div>
      </div>

      {/* Case Feed */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in">
        {filteredCases.map((c) => (
          <div 
            key={c.id} 
            onClick={() => setSelectedCase(c)}
            className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer"
          >
            
            {/* Image Section */}
            <div className="h-48 bg-gray-100 relative border-b border-gray-100 flex items-center justify-center overflow-hidden group">
              {c.imageUrl ? (
                <img 
                  src={c.imageUrl} 
                  alt="Skin condition" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    // Fallback if the blob URL expired
                    e.target.onerror = null; 
                    e.target.src = 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=400&h=400';
                  }}
                />
              ) : (
                <div className="text-gray-400 flex flex-col items-center">
                  <ImageIcon size={32} className="mb-2 opacity-50"/>
                  <span className="text-xs font-semibold">Image Anonymized/Missing</span>
                </div>
              )}
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full shadow-sm">
                <span className="text-xs font-bold text-blue-700">{c.confidence}% Match</span>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] font-bold tracking-wider text-blue-500 uppercase bg-blue-50 px-2 py-1 rounded">Diagnosis</span>
                  <h3 className="font-bold text-gray-900 text-lg leading-tight mt-1">{c.diagnosis}</h3>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <User size={16} className="text-slate-400"/>
                <span className="text-sm font-medium text-slate-700">Patient: {c.age} years old • {c.gender}</span>
              </div>

              <div className="space-y-4 flex-1">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase mb-1 flex items-center gap-1"><FileText size={12}/> Treatment Protocol</h4>
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                    {c.treatment}
                  </p>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400 font-medium">
                <span>Case ID: #{c.id.toString().slice(-6).padStart(6, '0')}</span>
                <span className="text-blue-600 font-bold hover:underline">View Details &rarr;</span>
              </div>
            </div>

          </div>
        ))}
      </div>

      {filteredCases.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <BookOpen size={48} className="mx-auto text-gray-300 mb-4"/>
            <h3 className="text-xl font-bold text-gray-800">No cases found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search terms.</p>
        </div>
      )}

      {/* --- MODAL: FULL CASE DETAILS --- */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Case Study #{selectedCase.id.toString().slice(-6).padStart(6, '0')}</h2>
                <p className="text-sm text-gray-500 mt-1">Logged on: {selectedCase.date}</p>
              </div>
              <button 
                onClick={() => setSelectedCase(null)} 
                className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-800 hover:bg-gray-100 shadow-sm transition"
              >
                <X size={24}/>
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-6 overflow-y-auto custom-scrollbar">
              
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* Image */}
                <div className="h-64 sm:h-72 bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 flex items-center justify-center">
                  {selectedCase.imageUrl ? (
                    <img 
                      src={selectedCase.imageUrl} 
                      alt="Condition Details" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=400&h=400';
                      }}
                    />
                  ) : (
                    <ImageIcon size={48} className="text-gray-300"/>
                  )}
                </div>

                {/* Primary Info */}
                <div className="flex flex-col justify-center space-y-6">
                  <div>
                    <span className="text-xs font-bold bg-blue-100 text-blue-800 px-3 py-1 rounded-full uppercase tracking-wider">AI Diagnosis</span>
                    <h3 className="text-3xl font-extrabold text-gray-900 mt-3">{selectedCase.diagnosis}</h3>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full border-4 border-blue-100 flex items-center justify-center">
                      <span className="text-lg font-bold text-blue-600">{Math.round(selectedCase.confidence)}%</span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-700">Confidence Score</p>
                      <p className="text-sm text-gray-500">Ensemble Committee Consensus</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center gap-3">
                    <User className="text-blue-500" size={24}/>
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase">Patient Profile</p>
                      <p className="font-semibold text-gray-800">{selectedCase.age} years old • {selectedCase.gender}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Text Sections */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-gray-800 uppercase flex items-center gap-2 mb-2">
                    <AlertCircle size={16} className="text-amber-500"/> Clinical Symptoms
                  </h4>
                  <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 text-gray-700 text-sm leading-relaxed">
                    {selectedCase.symptoms || "No symptom description provided."}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-800 uppercase flex items-center gap-2 mb-2">
                    <FileText size={16} className="text-blue-500"/> Recommended Treatment Protocol
                  </h4>
                  <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedCase.treatment || "No treatment protocol provided."}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}