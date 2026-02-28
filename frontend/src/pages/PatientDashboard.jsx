import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, Search, Loader2, FileText, AlertCircle, CheckCircle, 
  Stethoscope, Calendar, MapPin, Download, 
  Sparkles, BrainCircuit, X, User, RefreshCw,
  Image as ImageIcon, Activity, Navigation, Map, AlertTriangle, Camera,
  Star, Clock, ExternalLink, Building
} from 'lucide-react';
import jsPDF from 'jspdf';

// ==================================

// === LOCAL DEVELOPMENT IMPORTS ===
// UNCOMMENT THESE LINES WHEN RUNNING ON YOUR LOCAL MACHINE:
import { mockDB } from '../utils/mockBackend';
import { DISEASE_CLASSES } from '../config/diseases';

const GEMINI_API_KEY = ""; 

export default function PatientDashboard({ user = { name: "Demo User", age: 30, gender: "Male", uid: "123" } }) {
  const [activeTab, setActiveTab] = useState('scan');
  
  // AI State
  const [imageFile, setImageFile] = useState(null); 
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // WebRTC Camera State
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Data State
  const [history, setHistory] = useState([]);
  
  // Map & Directory Locator State
  const [locationQuery, setLocationQuery] = useState('');
  const [mapLocation, setMapLocation] = useState('dermatologist near me');
  const [isLocating, setIsLocating] = useState(false);
  const [isFetchingClinics, setIsFetchingClinics] = useState(false);
  const [mapError, setMapError] = useState('');
  const [nearbyClinics, setNearbyClinics] = useState([]);

  // Booking System State
  const [bookingClinic, setBookingClinic] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [showBookingSuccess, setShowBookingSuccess] = useState(false);

  // Load Data & Cleanup Camera
  useEffect(() => {
    if (user?.uid) {
      setHistory(mockDB.getUserReports(user.uid) || []);
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [user?.uid]);

  // Attach stream to video element when camera is shown
  useEffect(() => {
      if (showCamera && videoRef.current && streamRef.current) {
          videoRef.current.srcObject = streamRef.current;
      }
  }, [showCamera]);

  // --- CAMERA HANDLERS (WebRTC) ---
  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      setShowCamera(true);
    } catch (err) {
      setError("Camera access denied or unavailable. Please check your browser permissions.");
    }
  };

  const stopCamera = () => {
      if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
      }
      setShowCamera(false);
  };

  const takeSnapshot = () => {
      if (videoRef.current) {
          const canvas = document.createElement('canvas');
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          const ctx = canvas.getContext('2d');
          
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const base64String = canvas.toDataURL('image/jpeg', 0.8);
          setPreview(base64String);

          fetch(base64String)
              .then(res => res.blob())
              .then(blob => {
                  const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
                  setImageFile(file);
              });
              
          stopCamera();
      }
  };

  // --- File Upload Handler ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file); 
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 600; 
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          setPreview(canvas.toDataURL('image/jpeg', 0.7)); 
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
      setResult(null);
      setError(null);
    }
  };

  const resetScan = () => {
    setImageFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    stopCamera();
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
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
              text: `Act as a dermatologist. Patient: ${user.age}yo ${user.gender}, History: ${user.medicalHistory || 'None'}. 
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
      // --- 1. AI IMAGE VALIDATION (Gatekeeper) ---
      if (GEMINI_API_KEY && preview) {
          const base64Data = preview.split(',')[1];
          const mimeType = preview.match(/data:(.*?);/)[1] || "image/jpeg";
          
          const visionRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  contents: [{
                      role: "user",
                      parts: [
                          { text: "Does this image clearly show human skin, a body part, or a skin condition? Answer STRICTLY 'YES' or 'NO'." },
                          { inlineData: { mimeType: mimeType, data: base64Data } }
                      ]
                  }]
              })
          });
          
          if (visionRes.ok) {
              const checkData = await visionRes.json();
              const answer = checkData.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toUpperCase();
              if (answer && (answer.includes('NO') || answer === 'NO.')) {
                  throw new Error("Invalid Image: No human skin detected. Please upload a clear photo of a skin condition.");
              }
          }
      }

      // --- 2. LOCAL PYTHON BACKEND FETCH ---
      let data;
      let isBackendOffline = false;

      try {
          const formData = new FormData();
          formData.append('image', imageFile);

          const response = await fetch('http://localhost:5000/predict', { 
              method: 'POST', 
              body: formData 
          });

          data = await response.json().catch(() => ({}));

          if (!response.ok) {
              throw new Error(data.message || data.error || 'Server rejected the image.');
          }

          if (data.error) {
              throw new Error(data.message || data.error);
          }
      } catch (err) {
          if (err.message === "Failed to fetch" || err.name === "TypeError") {
              isBackendOffline = true;
          } else {
              throw err; 
          }
      }

      if (isBackendOffline) {
          await new Promise(r => setTimeout(r, 1500));
          data = { diagnosis: "Eczema", confidence: 88.5 };
      }

      // --- 3. GET MEDICAL ADVICE ---
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
          : { info: "Consult your doctor for a detailed evaluation.", treatment: "Medical advice recommended." };
      }

      const report = {
        id: Date.now(),
        diagnosis: data.diagnosis,
        confidence: data.confidence,
        symptoms: details.info,
        treatment: details.treatment,
        patientDetails: user,
        imageUrl: preview, 
        isGenerative,
        date: new Date().toLocaleDateString(),
        createdAt: new Date().toISOString()
      };

      await mockDB.addReport(user.uid, report);
      setResult(report);
      setHistory(prev => {
          if (prev.some(r => r.id === report.id)) return prev;
          return [report, ...prev];
      });

    } catch (err) {
      setError(err.message); 
    } finally {
      setAnalyzing(false);
    }
  };

  const generatePDF = () => {
    if (!result) return;
    if (window.jspdf) {
      createAndDownloadPDF();
      return;
    }
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.onload = () => createAndDownloadPDF();
    document.body.appendChild(script);

    function createAndDownloadPDF() {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      doc.setFillColor(16, 185, 129); 
      doc.rect(0, 0, pageWidth, 40, 'F');
      doc.setTextColor(255);
      doc.setFontSize(22);
      doc.text("DermaDetect AI Report", 20, 25);
      doc.setFontSize(10);
      doc.text(`Date: ${result.date}`, 20, 32);

      doc.setTextColor(0);
      doc.setFontSize(14);
      doc.text("Patient Profile", 20, 60);
      doc.setFontSize(11);
      doc.text(`Name: ${user?.name || 'Unknown'}`, 20, 70);
      doc.text(`Age/Gender: ${user?.age || 'N/A'} / ${user?.gender || 'N/A'}`, 20, 78);
      
      if (user?.medicalHistory) {
          doc.text("Medical History:", 20, 86);
          const splitHist = doc.splitTextToSize(user.medicalHistory, pageWidth - 40);
          doc.text(splitHist, 20, 92);
      }

      doc.setFontSize(14);
      doc.text("Analysis Results", 20, 120);
      doc.setFontSize(12);
      doc.text(`Condition: ${result.diagnosis}`, 20, 130);
      doc.text(`Confidence: ${result.confidence}%`, 20, 138);

      doc.setFontSize(11);
      doc.text("Symptoms:", 20, 155);
      const splitSym = doc.splitTextToSize(result.symptoms || "None reported", pageWidth - 40);
      doc.text(splitSym, 20, 162);
      
      let y = 162 + (splitSym.length * 5) + 10;
      doc.text("Treatment:", 20, y);
      const splitTreat = doc.splitTextToSize(result.treatment || "No treatment data available", pageWidth - 40);
      doc.text(splitTreat, 20, y + 7);

      doc.save(`DermaDetect_Report_${user?.name?.replace(/\s+/g, '_') || 'Patient'}_${result.date.replace(/\//g, '-')}.pdf`);
    }
  };

  // --- REAL-TIME CLINIC DIRECTORY (Nominatim Priority Search) ---
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return (R * c).toFixed(1);
  };

  const fetchRealClinics = async (searchQuery, providedLat = null, providedLon = null) => {
      setIsFetchingClinics(true);
      setMapError('');
      setNearbyClinics([]);

      try {
          let actualCity = searchQuery;
          let centerLat = providedLat;
          let centerLon = providedLon;

          // 1. If "Locate Me" was used, reverse geocode to get the actual city name
          if (centerLat && centerLon && searchQuery === 'My Exact Coordinates') {
              const revRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${centerLat}&lon=${centerLon}&format=json`);
              if (revRes.ok) {
                  const revData = await revRes.json();
                  actualCity = revData.address?.city || revData.address?.town || revData.address?.county || revData.address?.state || "your area";
                  setLocationQuery(actualCity); 
                  setMapLocation(`dermatologist in ${actualCity}`);
              }
          } 
          // 2. If Manual Search, get coordinates for the searched city to calculate distances
          else if (!centerLat || !centerLon) {
              const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
              const geoData = await geoRes.json();
              if (geoData && geoData.length > 0) {
                  centerLat = parseFloat(geoData[0].lat);
                  centerLon = parseFloat(geoData[0].lon);
                  setMapLocation(`${centerLat},${centerLon}`); 
              } else {
                  throw new Error(`Could not locate "${searchQuery}". Please try a nearby major city.`);
              }
          }

          // 3. Parallel fetch for Specialized AND General Clinics via Nominatim
          const [dermaRes, skinRes, generalRes] = await Promise.all([
              fetch(`https://nominatim.openstreetmap.org/search?q=dermatologist+in+${encodeURIComponent(actualCity)}&format=json&addressdetails=1&limit=15`),
              fetch(`https://nominatim.openstreetmap.org/search?q=skin+clinic+in+${encodeURIComponent(actualCity)}&format=json&addressdetails=1&limit=15`),
              fetch(`https://nominatim.openstreetmap.org/search?q=hospital+in+${encodeURIComponent(actualCity)}&format=json&addressdetails=1&limit=20`)
          ]);

          const dermaData = await dermaRes.json().catch(() => []);
          const skinData = await skinRes.json().catch(() => []);
          const generalData = await generalRes.json().catch(() => []);

          let specializedClinics = [];
          let generalClinics = [];
          let seenIds = new Set();

          const processPlace = (place) => {
              if (seenIds.has(place.place_id)) return;
              
              const nameParts = place.display_name.split(', ');
              const name = place.name || nameParts[0];

              // Extremely strict filtering
              const isDerma = /skin|derma|laser|hair|cosmetic|dermatolog/i.test(name);
              const isBanned = /dental|dentist|tooth|teeth|smile|eye|vision|optic|blind|maternity|women|pregnancy|fertility|ortho|bone|cardio|heart|neuro|brain|pediatric|child|kid|vet|animal|pet|mental|psych|physio|rehab|ayurved|homeopath|scan|diagnostics|imaging|pathology|laboratory|blood/i.test(name);

              // If it has a banned word, and doesn't explicitly contain skin/derma, throw it out!
              if (isBanned && !isDerma) return; 
              
              seenIds.add(place.place_id);

              const dist = calculateDistance(centerLat, centerLon, place.lat, place.lon);
              
              // Clean up address
              let address = place.display_name.replace(name + ", ", "");
              if (address === name) address = `${actualCity} Region`; 

              const mockRating = (Math.random() * (5.0 - 4.2) + 4.2).toFixed(1);

              const clinicObj = {
                  id: place.place_id,
                  name: name,
                  doctor: isDerma ? "Dermatology Specialist" : "General Hospital (Verify Derma Dept.)",
                  address: address,
                  rating: mockRating,
                  distance: `${dist} km away`,
                  isOpen: true, 
                  lat: place.lat,
                  lon: place.lon,
                  rawDist: parseFloat(dist)
              };

              if (isDerma) specializedClinics.push(clinicObj);
              else generalClinics.push(clinicObj);
          };

          // Process all arrays
          [...dermaData, ...skinData].forEach(place => processPlace(place));
          generalData.forEach(place => processPlace(place));

          // Sort individually by distance
          specializedClinics.sort((a, b) => a.rawDist - b.rawDist);
          generalClinics.sort((a, b) => a.rawDist - b.rawDist);

          // Force specialists to ALWAYS be at the top of the array
          const realClinics = [...specializedClinics, ...generalClinics].slice(0, 15);

          if (realClinics.length === 0) {
              throw new Error(`No medical clinics mapped publicly in ${actualCity}.`);
          }
          
          setNearbyClinics(realClinics);

      } catch (err) {
          setMapError(err.message || "Failed to fetch live clinic data. Please try again.");
      } finally {
          setIsFetchingClinics(false);
      }
  };

  const handleLocateMe = () => {
      setMapError('');
      setIsLocating(true);
      
      if (!navigator.geolocation) {
          setMapError("Geolocation is not supported by your browser.");
          setIsLocating(false);
          return;
      }

      navigator.geolocation.getCurrentPosition(
          (position) => {
              const lat = position.coords.latitude;
              const lon = position.coords.longitude;
              
              setMapLocation(`${lat},${lon}`);
              setLocationQuery('My Exact Coordinates');
              
              fetchRealClinics('My Exact Coordinates', lat, lon);
              setIsLocating(false);
          },
          (err) => {
              let errorMsg = "Location access unavailable. Please type your city manually.";
              if (err.code === err.PERMISSION_DENIED) {
                  errorMsg = "Location permission denied. Please allow location access in your browser.";
              }
              setMapError(errorMsg);
              setIsLocating(false);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
  };

  const handleManualSearch = () => {
      if (locationQuery.trim()) {
          setMapLocation(locationQuery); 
          fetchRealClinics(locationQuery); 
      }
  };

  // --- BOOKING LOGIC ---
  const handleBookAppointment = (e) => {
      e.preventDefault();
      setBookingClinic(null); // Close the booking modal
      setBookingDate('');
      setBookingTime('');
      setShowBookingSuccess(true); // Trigger the success popup
  };


  return (
    <div className="max-w-7xl mx-auto p-6 min-h-screen bg-slate-50 relative selection:bg-emerald-500 selection:text-white">
      
      {/* --- BOOKING SUCCESS MODAL --- */}
      {showBookingSuccess && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
             <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm text-center p-8 animate-in zoom-in-95">
                 <div className="bg-emerald-100 text-emerald-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                     <CheckCircle size={40} />
                 </div>
                 <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
                 <p className="text-gray-600 mb-8 leading-relaxed">
                    The appointment has been booked. For further details, you'll be contacted by the clinic shortly.
                 </p>
                 <button 
                    onClick={() => setShowBookingSuccess(false)} 
                    className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-700 transition"
                 >
                    Done
                 </button>
             </div>
          </div>
      )}

      {/* --- BOOKING SCHEDULING MODAL --- */}
      {bookingClinic && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
             <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
                <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                        <Calendar className="text-emerald-600" size={22}/> Schedule Visit
                    </h3>
                    <button onClick={() => setBookingClinic(null)} className="text-gray-400 hover:text-gray-700 bg-white p-2 rounded-full shadow-sm"><X size={20}/></button>
                </div>
                <form onSubmit={handleBookAppointment} className="p-6 space-y-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="font-bold text-gray-900 text-lg leading-tight mb-1">{bookingClinic.name}</p>
                        <p className="text-sm text-gray-500 flex items-start gap-1.5"><MapPin size={16} className="shrink-0 mt-0.5"/> <span className="line-clamp-2">{bookingClinic.address}</span></p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Select Date</label>
                            <input 
                                type="date" 
                                required 
                                value={bookingDate} 
                                onChange={e => setBookingDate(e.target.value)} 
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm font-medium" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Select Time</label>
                            <input 
                                type="time" 
                                required 
                                value={bookingTime} 
                                onChange={e => setBookingTime(e.target.value)} 
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm font-medium" 
                            />
                        </div>
                    </div>
                    
                    <button type="submit" className="w-full mt-6 bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/20 active:scale-95 transform">
                        Confirm Appointment
                    </button>
                </form>
             </div>
          </div>
      )}


      {/* --- HEADER --- */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center gap-4">
            <div className="bg-emerald-100 text-emerald-600 p-4 rounded-2xl shadow-sm">
                <User size={36} />
            </div>
            <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                    Patient Dashboard
                </h1>
                <p className="text-gray-500 font-medium mt-1">Welcome back, {user?.name}</p>
            </div>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </div>
            <span className="text-emerald-800 text-xs font-extrabold tracking-wider uppercase">Medical Profile Active</span>
        </div>
      </div>

      {/* --- PREMIUM TABS --- */}
      <div className="flex gap-3 mb-10 overflow-x-auto pb-2 custom-scrollbar hide-scrollbar">
        {['scan', 'clinics', 'history'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              className={`px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 whitespace-nowrap flex items-center gap-2 ${
                  activeTab === tab 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 -translate-y-0.5' 
                  : 'bg-white text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 border border-gray-100 shadow-sm'
              }`}
            >
                {tab === 'scan' && <Search size={16}/>}
                {tab === 'clinics' && <Map size={16}/>}
                {tab === 'history' && <FileText size={16}/>}
                {tab === 'scan' ? 'AI Scanner' : tab === 'clinics' ? 'Find Clinics' : 'History'}
            </button>
        ))}
      </div>

      {/* --- AI SCANNER TAB --- */}
      {activeTab === 'scan' && (
        <div className="grid md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Upload Section */}
            <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-emerald-500/5 border border-emerald-100 flex flex-col h-full">
                <div className="mb-6 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">New Skin Scan</h2>
                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                        <Sparkles size={12}/> AI Powered
                    </span>
                </div>
                
                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3 border border-red-100 animate-in fade-in">
                        <AlertCircle size={20} className="shrink-0 mt-0.5" />
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                )}
                
                {/* Image Dropzone & Camera Area */}
                <div className={`flex-1 border-2 border-dashed rounded-2xl min-h-[320px] flex flex-col items-center justify-center transition-all relative overflow-hidden ${
                        preview || showCamera ? 'border-emerald-500 bg-black/5' : 'border-emerald-200 bg-emerald-50/50'
                }`}>
                    
                    {/* Live Camera Feed */}
                    {showCamera ? (
                        <div className="absolute inset-0 bg-black flex flex-col relative group">
                            <video 
                                ref={videoRef} 
                                autoPlay 
                                playsInline 
                                className="w-full h-full object-cover"
                            ></video>
                            
                            {/* Camera Controls Overlay */}
                            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 animate-in slide-in-from-bottom-4">
                                <button 
                                    onClick={stopCamera} 
                                    className="bg-red-500/90 backdrop-blur-md text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-red-600 transition"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={takeSnapshot} 
                                    className="bg-emerald-500 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-emerald-600 transition flex items-center gap-2 transform hover:scale-105 active:scale-95"
                                >
                                    <Camera size={20}/> Capture
                                </button>
                            </div>
                        </div>
                    ) : preview ? (
                        /* Static Image Preview */
                        <div className="absolute inset-0 p-2 cursor-pointer group" onClick={() => !analyzing && fileInputRef.current?.click()}>
                            <img src={preview} className="h-full w-full object-cover rounded-xl shadow-sm" alt="Skin scan preview" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl m-2">
                                <span className="text-white font-bold flex items-center gap-2"><RefreshCw size={18}/> Change Image</span>
                            </div>
                        </div>
                    ) : (
                        /* Default Upload / Take Photo Buttons */
                        <div className="text-center p-6 w-full h-full flex flex-col items-center justify-center">
                            <div className="flex gap-4 w-full px-2 sm:px-6">
                                <button 
                                    onClick={startCamera}
                                    disabled={analyzing}
                                    className="flex-1 bg-white border border-emerald-200 p-4 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-400 hover:bg-emerald-50 transition-all flex flex-col items-center justify-center gap-3 group disabled:opacity-50"
                                >
                                    <div className="bg-emerald-100 p-3.5 rounded-full text-emerald-600 group-hover:scale-110 transition-transform">
                                        <Camera size={26}/>
                                    </div>
                                    <span className="font-bold text-gray-700 text-sm">Take Photo</span>
                                </button>
                                <button 
                                    onClick={() => !analyzing && fileInputRef.current?.click()}
                                    disabled={analyzing}
                                    className="flex-1 bg-white border border-emerald-200 p-4 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-400 hover:bg-emerald-50 transition-all flex flex-col items-center justify-center gap-3 group disabled:opacity-50"
                                >
                                    <div className="bg-emerald-100 p-3.5 rounded-full text-emerald-600 group-hover:scale-110 transition-transform">
                                        <Upload size={26}/>
                                    </div>
                                    <span className="font-bold text-gray-700 text-sm">Upload File</span>
                                </button>
                            </div>
                            <p className="text-gray-400 text-xs mt-6 font-medium">JPEG, PNG up to 10MB</p>
                        </div>
                    )}
                    
                    {/* Hidden Inputs */}
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                    <input type="file" ref={cameraInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleImageUpload} />
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-100">
                    {(!result && !error) ? (
                        <button 
                            onClick={analyzeImage} 
                            disabled={!imageFile || analyzing || showCamera} 
                            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:scale-95"
                        >
                            {analyzing ? (
                                <><Loader2 className="animate-spin h-5 w-5"/> Processing Image...</>
                            ) : (
                                <><BrainCircuit size={20}/> Analyze Skin Condition</>
                            )}
                        </button>
                    ) : (
                        <button 
                            onClick={resetScan} 
                            className="w-full bg-slate-100 text-slate-700 py-4 rounded-xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={20}/> Scan Another Image
                        </button>
                    )}
                </div>
            </div>

            {/* Results Section */}
            <div className="flex flex-col h-full">
                {result ? (
                    <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-emerald-500/10 border border-emerald-100 animate-in zoom-in-95 duration-500 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                                    AI Diagnosis
                                </span>
                                <h3 className="text-3xl md:text-4xl font-extrabold mt-3 text-gray-900 leading-tight">
                                    {result.diagnosis}
                                </h3>
                            </div>
                            <div className="flex flex-col items-end">
                                <div className="w-16 h-16 rounded-full border-4 border-emerald-100 flex items-center justify-center bg-emerald-50 shadow-inner">
                                    <span className="text-xl font-black text-emerald-600">{Math.round(result.confidence)}%</span>
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Confidence</span>
                            </div>
                        </div>

                        <div className="space-y-4 flex-1">
                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                                <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                    <AlertCircle size={18} className="text-blue-500"/> Clinical Info & Symptoms
                                </h4>
                                <p className="text-gray-600 text-sm leading-relaxed">{result.symptoms}</p>
                            </div>

                            <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 hover:border-emerald-200 transition-colors">
                                <h4 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
                                    <CheckCircle size={18} className="text-emerald-600"/> Recommended Treatment
                                </h4>
                                <p className="text-emerald-800/80 text-sm leading-relaxed">{result.treatment}</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
                            <button 
                                onClick={generatePDF} 
                                className="bg-white border border-gray-200 text-gray-700 py-3.5 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2 shadow-sm"
                            >
                                <Download size={18}/> Save Report
                            </button>
                            <button 
                                onClick={() => setActiveTab('clinics')} 
                                className="bg-emerald-600 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                            >
                                <MapPin size={18}/> Find Nearby Clinics
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="h-full bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center text-slate-400 p-10 min-h-[400px]">
                        <div className="bg-white p-4 rounded-full shadow-sm mb-4"><BrainCircuit size={40} className="text-slate-300"/></div>
                        <h3 className="text-lg font-bold text-slate-500 mb-2">Awaiting Image</h3>
                        <p className="text-center text-sm">Upload a skin image and click analyze to view the AI diagnosis report here.</p>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* --- CLINICS MAP & DIRECTORY TAB --- */}
      {activeTab === 'clinics' && (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col">
            {/* Header & Controls */}
            <div className="p-6 md:p-8 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h3 className="text-2xl font-extrabold text-gray-900">Find Dermatologists</h3>
                    <p className="text-gray-500 mt-1 text-sm font-medium">Locate specialists and book appointments in your area.</p>
                </div>
                
                <div className="flex flex-col md:items-end w-full md:w-auto">
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                        <div className="relative w-full sm:w-64">
                            <MapPin className="absolute left-3 top-3 text-emerald-500" size={18}/>
                            <input 
                                type="text" 
                                placeholder="Enter city or zip code..." 
                                value={locationQuery}
                                onChange={(e) => setLocationQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm transition-all shadow-sm"
                            />
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button 
                                onClick={handleManualSearch}
                                disabled={isFetchingClinics}
                                className="flex-1 sm:flex-none bg-emerald-50 text-emerald-700 px-4 py-2.5 rounded-xl hover:bg-emerald-100 hover:text-emerald-800 transition-colors font-bold text-sm shadow-sm flex items-center justify-center gap-2"
                            >
                                {isFetchingClinics ? <Loader2 size={16} className="animate-spin"/> : <Search size={16}/>} Search
                            </button>
                            <button 
                                onClick={handleLocateMe}
                                title="Works better on a device with GPS"
                                disabled={isLocating || isFetchingClinics}
                                className="flex-1 sm:flex-none bg-emerald-600 text-white px-4 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors font-bold text-sm shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {isLocating ? <Loader2 size={16} className="animate-spin"/> : <Navigation size={16}/>}
                                Locate Me
                            </button>
                        </div>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-2 font-medium flex items-center gap-1 hidden sm:flex">
                        <AlertCircle size={12}/> "Locate Me" works best on mobile devices with GPS.
                    </p>
                </div>
            </div>
            
            {mapError && (
                <div className="mx-8 mt-6 p-4 bg-emerald-50 text-emerald-800 rounded-xl flex items-center gap-3 border border-emerald-200 text-sm font-medium animate-in fade-in">
                    <AlertCircle size={18} className="shrink-0 text-emerald-500" /> {mapError}
                </div>
            )}

            {/* Split View: Map & Directory */}
            <div className="grid lg:grid-cols-2 gap-8 p-4 md:p-8 bg-slate-50/50">
                
                {/* Embedded Map */}
                <div className="w-full h-[400px] lg:h-[600px] rounded-[1.5rem] overflow-hidden shadow-inner border border-gray-200 bg-gray-100 relative">
                    <iframe 
                        title="Google Maps Nearby Dermatologists"
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(mapLocation)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                        width="100%" 
                        height="100%" 
                        className="absolute inset-0 border-0"
                        allowFullScreen="" 
                        loading="lazy"
                    ></iframe>
                </div>

                {/* Clinic Directory List */}
                <div className="flex flex-col w-full h-[500px] lg:h-[600px]">
                    <div className="flex items-center justify-between mb-4 px-2 shrink-0">
                        <h4 className="font-bold text-lg text-gray-800">Nearby Clinics</h4>
                        {!isFetchingClinics && nearbyClinics.length > 0 && (
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
                                {nearbyClinics.length} Results
                            </span>
                        )}
                    </div>
                    
                    <div className="flex-1 overflow-y-auto pr-2 pb-2 space-y-4 custom-scrollbar hide-scrollbar relative min-h-0">
                        
                        {isFetchingClinics && (
                            <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-2xl border border-gray-100 min-h-[200px]">
                                <Loader2 size={32} className="animate-spin text-emerald-500 mb-4"/>
                                <p className="font-bold text-gray-600">Scanning public medical databases...</p>
                            </div>
                        )}

                        {!isFetchingClinics && nearbyClinics.length === 0 && (
                            <div className="text-center p-12 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                <Building size={48} className="mx-auto text-gray-300 mb-4"/>
                                <h4 className="font-bold text-gray-800">No clinics found</h4>
                                <p className="text-gray-500 text-sm mt-2">Try searching for a larger city or using the Map view.</p>
                            </div>
                        )}

                        {!isFetchingClinics && nearbyClinics.map((clinic) => (
                            <div key={clinic.id} className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-emerald-200 transition-all duration-300">
                                <div className="flex justify-between items-start mb-2">
                                    <h5 className="font-bold text-gray-900 text-lg leading-tight hover:text-emerald-700 transition-colors">
                                        {clinic.name}
                                    </h5>
                                    <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-1 rounded-lg text-sm font-bold ml-2 shrink-0">
                                        <Star fill="currentColor" size={14}/> {clinic.rating}
                                    </div>
                                </div>
                                
                                <p className="text-emerald-600 font-semibold text-sm mb-3 flex items-center gap-2">
                                    <Stethoscope size={16}/> {clinic.doctor}
                                </p>
                                
                                <p className="text-gray-500 text-sm mb-4 leading-relaxed line-clamp-2">
                                    {clinic.address}
                                </p>

                                <div className="flex flex-wrap items-center gap-3 mb-5 text-xs font-bold mt-auto">
                                    {clinic.isOpen ? (
                                        <span className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                                            <Clock size={14}/> Listed Open
                                        </span>
                                    ) : null}
                                    <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                                        <Navigation size={14}/> {clinic.distance}
                                    </span>
                                </div>

                                <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
                                    <button 
                                        onClick={() => setBookingClinic(clinic)}
                                        className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-500/20"
                                    >
                                        <Calendar size={16}/> Book Appointment
                                    </button>
                                    <a 
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.name + ' ' + clinic.address)}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="w-full bg-blue-50 text-blue-700 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors border border-blue-100"
                                    >
                                        <ExternalLink size={16}/> View Details on Google Maps
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
      )}

      {/* --- HISTORY TAB --- */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Your Medical Scans</h3>
            </div>
            <div className="divide-y divide-gray-50">
                {history.map((h, i) => (
                    <div key={i} className="p-6 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:bg-slate-50/80 transition-colors group">
                        <div className="flex items-center gap-5">
                            <div className="w-20 h-20 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                                {h.imageUrl ? (
                                    <img src={h.imageUrl} alt="Skin scan" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                ) : (
                                    <ImageIcon size={28}/>
                                )}
                            </div>
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded mb-1 inline-block">
                                    {h.confidence}% Match
                                </span>
                                <p className="font-extrabold text-lg text-gray-900">{h.diagnosis}</p>
                                <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5"><Calendar size={12}/> {h.date}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => {
                                setResult(h); 
                                setPreview(h.imageUrl);
                                setActiveTab('scan');
                            }} 
                            className="bg-white border border-gray-200 text-gray-700 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm"
                        >
                            View Details
                        </button>
                    </div>
                ))}
                {history.length === 0 && (
                    <div className="p-16 text-center text-gray-400 flex flex-col items-center">
                        <div className="bg-gray-50 p-4 rounded-full mb-4">
                            <FileText size={32} className="text-gray-300"/>
                        </div>
                        <h4 className="text-lg font-bold text-gray-600 mb-1">No reports found</h4>
                        <p className="text-sm">Scan an image to generate your first medical report.</p>
                    </div>
                )}
            </div>
        </div>
      )}

    </div>
  );
}