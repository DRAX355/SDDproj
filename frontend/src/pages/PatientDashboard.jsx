import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, Search, Loader2, FileText, AlertCircle, CheckCircle, 
  Stethoscope, Calendar, MapPin, Mail, Download, 
  AlertTriangle, Sparkles, BrainCircuit, ArrowRight, X, User 
} from 'lucide-react';
import { mockDB } from '../utils/mockBackend';
import { DISEASE_CLASSES } from '../config/diseases';
import jsPDF from 'jspdf';

const GEMINI_API_KEY = ""; 

export default function PatientDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('scan');
  
  // AI State
  const [imageFile, setImageFile] = useState(null); 
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Data State
  const [history, setHistory] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [bookingDate, setBookingDate] = useState('');

  // Load Data
  useEffect(() => {
    if (user?.uid) {
      setHistory(mockDB.getUserReports(user.uid));
      setDoctors(mockDB.getDoctors()); // Load dynamic doctor list from Admin
    }
  }, [user]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const fetchGeminiAdvice = async (diagnosis, confidence) => {
    if (!GEMINI_API_KEY) return null;
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Act as a dermatologist. Patient: ${user.age}yo ${user.gender}, History: ${user.medicalHistory}. 
              Diagnosis: "${diagnosis}" (${confidence}%). 
              Return JSON: { "symptoms": "...", "treatment": "..." }`
            }]
          }]
        })
      });
      const data = await response.json();
      const text = data.candidates[0].content.parts[0].text;
      return JSON.parse(text.replace(/```json|```/g, '').trim());
    } catch (err) {
      return null;
    }
  };

  const analyzeImage = async () => {
    if (!imageFile) return;
    setAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('AI Server Offline');
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      // Get Advice
      let details = { info: "", treatment: "" };
      let isGenerative = false;
      const aiAdvice = await fetchGeminiAdvice(data.diagnosis, data.confidence);
      
      if (aiAdvice) {
        details = { info: aiAdvice.symptoms, treatment: aiAdvice.treatment };
        isGenerative = true;
      } else {
        const staticData = DISEASE_CLASSES.find(d => 
          d.name.toLowerCase() === data.diagnosis.toLowerCase() || 
          data.diagnosis.toLowerCase().includes(d.name.toLowerCase())
        );
        details = staticData 
          ? { info: staticData.info, treatment: staticData.treatment }
          : { info: "Consult doctor.", treatment: "Medical advice recommended." };
      }

      const report = {
        id: Date.now(),
        diagnosis: data.diagnosis,
        confidence: data.confidence,
        symptoms: details.info,
        treatment: details.treatment,
        patientDetails: user, // Attach full user profile
        isGenerative,
        date: new Date().toLocaleDateString(),
        createdAt: new Date().toISOString()
      };

      await mockDB.addReport(user.uid, report);
      setResult(report);
      setHistory(prev => [report, ...prev]);

    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const generatePDF = () => {
    if (!result) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFillColor(16, 185, 129);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255);
    doc.setFontSize(22);
    doc.text("DermaDetect AI Report", 20, 20);
    doc.setFontSize(10);
    doc.text(`Date: ${result.date}`, 20, 30);

    // Patient Info
    doc.setTextColor(0);
    doc.setFontSize(14);
    doc.text("Patient Profile", 20, 60);
    doc.setFontSize(11);
    doc.text(`Name: ${user.name}`, 20, 70);
    doc.text(`Age/Gender: ${user.age} / ${user.gender}`, 20, 78);
    doc.text(`Contact: ${user.email} | ${user.phone}`, 20, 86);
    
    if (user.medicalHistory) {
        doc.text("Medical History:", 20, 96);
        const splitHist = doc.splitTextToSize(user.medicalHistory, pageWidth - 40);
        doc.text(splitHist, 20, 102);
    }

    // Results
    doc.setFontSize(14);
    doc.text("Analysis Results", 20, 130);
    doc.setFontSize(12);
    doc.text(`Condition: ${result.diagnosis}`, 20, 140);
    doc.text(`Confidence: ${result.confidence}%`, 20, 148);

    // Details
    doc.setFontSize(11);
    doc.text("Symptoms:", 20, 165);
    const splitSym = doc.splitTextToSize(result.symptoms, pageWidth - 40);
    doc.text(splitSym, 20, 172);
    
    let y = 172 + (splitSym.length * 5) + 10;
    doc.text("Treatment:", 20, y);
    const splitTreat = doc.splitTextToSize(result.treatment, pageWidth - 40);
    doc.text(splitTreat, 20, y + 7);

    doc.save(`Report_${user.name}_${result.date}.pdf`);
  };

  const confirmBooking = () => {
    if (bookingDate) {
        mockDB.bookAppointment({
            patientId: user.uid,
            patientName: user.name,
            doctorId: bookingDoctor.id,
            doctorName: bookingDoctor.name,
            date: bookingDate
        });
        alert("Appointment Request Sent to Admin!");
        setBookingDoctor(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Tabs */}
      <div className="flex space-x-6 mb-8 border-b border-gray-200 pb-1">
        {['scan', 'doctors', 'history'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 px-2 font-semibold capitalize flex items-center gap-2 transition border-b-2 ${activeTab === tab ? 'text-emerald-600 border-emerald-600' : 'text-gray-500 border-transparent'}`}>
                {tab === 'scan' && <Search size={18}/>}
                {tab === 'doctors' && <Stethoscope size={18}/>}
                {tab === 'history' && <FileText size={18}/>}
                {tab === 'scan' ? 'AI Scanner' : tab}
            </button>
        ))}
      </div>

      {/* Profile Header */}
      <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl mb-8 flex items-center gap-4">
        <div className="bg-emerald-200 p-3 rounded-full text-emerald-800"><User size={24}/></div>
        <div>
            <h3 className="font-bold text-emerald-900">Welcome, {user.name}</h3>
            <p className="text-emerald-700 text-sm">Medical Profile Active • {user.age} yrs • {user.gender}</p>
        </div>
      </div>

      {/* SCANNER */}
      {activeTab === 'scan' && (
        <div className="grid md:grid-cols-2 gap-10 animate-in fade-in">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">New Scan</h2>
                {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-2"><AlertCircle size={20} />{error}</div>}
                
                <div onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-2xl h-64 flex flex-col items-center justify-center cursor-pointer transition ${preview ? 'border-emerald-500' : 'border-gray-300 hover:bg-gray-50'}`}>
                    {preview ? <img src={preview} className="h-full w-full object-contain" /> : <div className="text-center text-gray-400"><Upload className="mx-auto mb-2"/>Upload Image</div>}
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                </div>
                <button onClick={analyzeImage} disabled={!imageFile || analyzing} className="w-full mt-6 bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 disabled:bg-gray-200">
                    {analyzing ? <Loader2 className="animate-spin mx-auto"/> : 'Analyze Now'}
                </button>
            </div>

            <div className="space-y-6">
                {result ? (
                    <div className="bg-white p-8 rounded-3xl shadow-lg border border-emerald-100">
                        <div className="flex justify-between items-start mb-6">
                            <div><span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-1 rounded">DIAGNOSIS</span><h3 className="text-3xl font-bold mt-2">{result.diagnosis}</h3></div>
                            <div className="text-right"><span className="text-4xl font-bold text-emerald-600">{result.confidence}%</span></div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl mb-4"><h4 className="font-bold mb-2">Info</h4><p className="text-gray-600 text-sm">{result.symptoms}</p></div>
                        <div className="bg-emerald-50 p-4 rounded-xl mb-6"><h4 className="font-bold mb-2">Treatment</h4><p className="text-gray-600 text-sm">{result.treatment}</p></div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={generatePDF} className="border border-gray-300 py-3 rounded-xl font-bold hover:bg-gray-50 flex justify-center gap-2"><Download size={18}/> Report</button>
                            <button onClick={() => setActiveTab('doctors')} className="bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 flex justify-center gap-2"><Stethoscope size={18}/> Doctor</button>
                        </div>
                    </div>
                ) : (
                    <div className="h-full border-2 border-dashed border-gray-200 rounded-3xl flex items-center justify-center text-gray-400">Result Area</div>
                )}
            </div>
        </div>
      )}

      {/* DOCTORS */}
      {activeTab === 'doctors' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in">
            {doctors.map(doc => (
                <div key={doc.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-blue-100 text-blue-600 p-3 rounded-xl font-bold">Dr</div>
                        <div><h3 className="font-bold">{doc.name}</h3><p className="text-sm text-gray-500">{doc.spec}</p></div>
                    </div>
                    <p className="text-sm text-gray-500 mb-4 flex items-center gap-2"><MapPin size={16}/> {doc.loc}</p>
                    <button onClick={() => setBookingDoctor(doc)} className="w-full bg-emerald-600 text-white py-2 rounded-lg font-bold hover:bg-emerald-700">Book Appointment</button>
                </div>
            ))}
        </div>
      )}

      {/* HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
            {history.map((h, i) => (
                <div key={i} className="p-6 border-b border-gray-100 flex justify-between items-center hover:bg-gray-50">
                    <div>
                        <p className="font-bold">{h.diagnosis}</p>
                        <p className="text-sm text-gray-500">{h.date}</p>
                    </div>
                    <button onClick={() => {setResult(h); setActiveTab('scan');}} className="text-emerald-600 font-bold text-sm">View</button>
                </div>
            ))}
            {history.length === 0 && <div className="p-10 text-center text-gray-400">No reports found.</div>}
        </div>
      )}

      {/* BOOKING MODAL */}
      {bookingDoctor && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-3xl max-w-sm w-full relative">
                <button onClick={() => setBookingDoctor(null)} className="absolute top-4 right-4"><X size={20}/></button>
                <h3 className="text-xl font-bold mb-6 text-center">Book Appointment</h3>
                <p className="text-center text-gray-500 mb-6">with {bookingDoctor.name}</p>
                <input type="date" className="w-full px-4 py-3 rounded-xl border border-gray-300 mb-4" onChange={e => setBookingDate(e.target.value)} />
                <button onClick={confirmBooking} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold">Confirm</button>
            </div>
        </div>
      )}
    </div>
  );
}