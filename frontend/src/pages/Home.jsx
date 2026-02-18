import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, ArrowRight, CheckCircle2, Scan, BrainCircuit, 
  FileText, AlertTriangle, Cpu, Layers, Network, User, ShieldCheck, Zap 
} from 'lucide-react';

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const diseases = [
    "Acne and Rosacea", "Actinic Keratosis", "Atopic Dermatitis", "Bullous Disease",
    "Cellulitis", "Eczema", "Exanthems", "Hair Loss (Alopecia)",
    "Herpes & HPV", "Melanoma & Moles", "Nail Fungus", "Psoriasis", "Urticaria Hives"
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col selection:bg-emerald-500 selection:text-white">
      
      {/* --- NAVIGATION BAR --- */}
      <nav className={`fixed top-0 left-0 right-0 z-50 py-4 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-lg py-3' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link 
            to="/"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 focus:outline-none group"
          >
            <div className={`p-2 rounded-xl transition-all duration-300 ${scrolled ? 'bg-emerald-100 group-hover:rotate-12' : 'bg-white/10 backdrop-blur-sm'}`}>
              <Activity className={`h-6 w-6 transition-colors duration-200 ${scrolled ? 'text-emerald-600' : 'text-white'}`} />
            </div>
            <span className={`font-bold text-xl tracking-tight transition-colors ${scrolled ? 'text-gray-900 group-hover:text-emerald-600' : 'text-white'}`}>
              DermaDetect AI
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {['Process', 'Technology', 'Capabilities'].map((item) => (
              <button 
                key={item}
                onClick={() => scrollToSection(item.toLowerCase())}
                className={`text-sm font-semibold relative group transition-colors ${scrolled ? 'text-gray-600 hover:text-emerald-600' : 'text-emerald-50 hover:text-white'}`}
              >
                {item}
                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${scrolled ? 'bg-emerald-600' : 'bg-white'}`}></span>
              </button>
            ))}
            
            <button 
              onClick={() => scrollToSection('portals')}
              className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg ${scrolled ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/20' : 'bg-white text-emerald-900 hover:bg-emerald-50 shadow-black/10'}`}
            >
              Login Portal
            </button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <div id="home" className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white relative flex items-center justify-center min-h-screen pt-20 overflow-hidden">
        {/* Animated Background blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
           <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
           <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/medical-icons.png')] opacity-5"></div>
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10 -mt-16 md:-mt-24">
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md mb-8 inline-block shadow-2xl border border-white/20 hover:scale-105 transition-transform duration-500 cursor-default">
            <Activity className="h-12 w-12 text-emerald-300 animate-pulse" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight leading-tight drop-shadow-lg">
            Clinical-Grade Skin <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-teal-200">Disease Detection</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-emerald-100/90 mb-12 leading-relaxed font-light max-w-2xl mx-auto">
            Advanced diagnostic tool powered by a <strong>Multi-Model Ensemble Committee</strong> for higher accuracy.
          </p>
          
          <button 
            onClick={() => scrollToSection('portals')}
            className="group relative px-10 py-5 bg-white text-emerald-900 rounded-full font-bold text-lg shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:-translate-y-1 active:scale-95 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-emerald-100/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
            <span className="relative flex items-center gap-3">
              Start Diagnosis <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>
        
        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="fill-slate-50"><path fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>
        </div>
      </div>

      {/* --- HOW IT WORKS (Process) --- */}
      <div id="process" className="py-24 bg-slate-50 relative z-10 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-emerald-600 font-bold tracking-wider uppercase text-sm mb-2 block">Workflow</span>
            <h2 className="text-4xl font-extrabold text-gray-900">How It Works</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { icon: Scan, color: 'blue', title: '1. Upload Image', desc: 'Take a clear photo of the skin area.' },
              { icon: BrainCircuit, color: 'purple', title: '2. AI Analysis', desc: 'Ensemble Committee analyzes textures.' },
              { icon: FileText, color: 'emerald', title: '3. Instant Report', desc: 'Receive diagnosis & treatment advice.' }
            ].map((step, idx) => (
              <div key={idx} className="group bg-white p-10 rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-2 transition-all duration-300 h-full flex flex-col items-center">
                <div className={`bg-${step.color}-50 w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-8 text-${step.color}-600 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                  <step.icon size={48} className="drop-shadow-sm" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900 group-hover:text-emerald-600 transition-colors">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- TECHNOLOGY --- */}
      <div id="technology" className="py-24 bg-slate-900 text-white relative scroll-mt-18 overflow-hidden">
        {/* Tech Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-start gap-16">
            <div className="md:w-1/2 pt-4">
              <span className="text-emerald-400 font-bold tracking-wider uppercase text-sm mb-2 block">Technology</span>
              <h2 className="text-4xl font-extrabold mb-6">Powered by Ensemble AI</h2>
              <p className="text-gray-400 text-lg mb-10 leading-relaxed">
                DermaDetect uses a "Committee of Doctors" approach. Three state-of-the-art models vote on every image to ensure maximum accuracy and reduce false positives.
              </p>
              
              <div className="space-y-4">
                {[
                    { icon: Cpu, color: "text-emerald-400", title: "EfficientNet B0", sub: "Texture Analysis" },
                    { icon: Layers, color: "text-blue-400", title: "ResNet 50", sub: "Shape & Structure" },
                    { icon: Network, color: "text-purple-400", title: "MobileNet V2", sub: "General Features" }
                ].map((item, i) => (
                    <div key={i} className="group flex items-center gap-5 bg-white/5 p-5 rounded-2xl border border-white/5 hover:bg-white/10 hover:border-emerald-500/30 hover:translate-x-2 transition-all duration-300 cursor-default">
                        <div className={`p-3 rounded-lg bg-white/5 group-hover:scale-110 transition-transform duration-300`}>
                            <item.icon className={item.color} size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-lg text-white group-hover:text-emerald-300 transition-colors">{item.title}</h4>
                            <p className="text-sm text-gray-400">{item.sub}</p>
                        </div>
                    </div>
                ))}
              </div>
            </div>
            
            <div className="md:w-1/2 w-full">
               <div className="bg-slate-800/80 p-8 rounded-3xl border border-slate-700 backdrop-blur-xl shadow-2xl hover:shadow-emerald-500/10 transition-shadow duration-500">
                <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
                  <h3 className="font-bold text-xl flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400 fill-current" /> System Architecture
                  </h3>
                  <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30 animate-pulse">Live</span>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors">
                    <span className="text-gray-300 flex items-center gap-3"><Scan size={18} className="text-emerald-400"/> Input Image</span>
                    <ArrowRight size={16} className="text-gray-600"/>
                    <span className="text-emerald-400 font-mono text-sm bg-emerald-400/10 px-2 py-1 rounded">Preprocessing</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {['EfficientNet', 'ResNet50', 'MobileNet'].map(m => (
                        <div key={m} className="bg-slate-700/50 h-16 rounded-xl flex items-center justify-center text-[10px] md:text-xs font-mono text-gray-300 border border-slate-600 hover:border-emerald-500/50 hover:bg-slate-700 transition-all duration-300 cursor-default">
                            {m}
                        </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-center text-gray-600 -my-2"><ArrowRight className="rotate-90" size={20}/></div>
                  
                  <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5 rounded-xl text-center shadow-lg transform hover:scale-[1.02] transition-transform duration-300">
                    <span className="font-bold text-lg block text-white">Soft Voting Ensemble</span>
                    <span className="text-emerald-100 text-xs opacity-80">Weighted Average Calculation</span>
                  </div>
                  
                  <div className="flex justify-center text-gray-600 -my-2"><ArrowRight className="rotate-90" size={20}/></div>
                  
                  <div className="bg-white text-slate-900 p-4 rounded-xl text-center font-bold flex items-center justify-center gap-3 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                    <CheckCircle2 className="text-emerald-600" size={22}/> Final Diagnosis
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- CAPABILITIES --- */}
      <div id="capabilities" className="py-24 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-emerald-600 font-bold uppercase text-sm">Scope</span>
            <h2 className="text-4xl font-extrabold text-gray-900">Detectable Conditions</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {diseases.map((d, i) => (
              <div key={i} className="group bg-slate-50 p-4 rounded-xl flex items-center gap-3 border border-slate-100 hover:border-emerald-400 hover:bg-white hover:shadow-lg hover:shadow-emerald-500/5 hover:-translate-y-1 transition-all duration-300 cursor-default">
                <div className="bg-white p-2 rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0"/>
                </div>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">{d}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- PORTALS --- */}
      <div id="portals" className="py-24 bg-slate-50 scroll-mt-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-12">Choose Your Portal</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Link to="/auth?role=patient" className="group bg-white p-12 rounded-[2rem] shadow-sm border border-slate-200 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-2 hover:border-emerald-100 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                <div className="bg-emerald-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 text-emerald-600 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <User size={48}/>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900">Patient</h3>
                <p className="text-gray-500 mb-8 max-w-xs mx-auto">Scan skin, view diagnosis history, and book appointments with specialists.</p>
                <span className="inline-block bg-emerald-600 text-white px-10 py-3 rounded-xl font-bold group-hover:bg-emerald-700 group-hover:shadow-lg group-hover:shadow-emerald-500/30 transition-all duration-300">Login as Patient</span>
            </Link>
            
            <Link to="/auth?role=admin" className="group bg-white p-12 rounded-[2rem] shadow-sm border border-slate-200 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-2 hover:border-purple-100 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-purple-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                <div className="bg-purple-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 text-purple-600 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <ShieldCheck size={48}/>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900">Admin</h3>
                <p className="text-gray-500 mb-8 max-w-xs mx-auto">System management, user analytics, and model performance monitoring.</p>
                <span className="inline-block bg-purple-600 text-white px-10 py-3 rounded-xl font-bold group-hover:bg-purple-700 group-hover:shadow-lg group-hover:shadow-purple-500/30 transition-all duration-300">Login as Admin</span>
            </Link>
          </div>
        </div>
      </div>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-950 text-slate-400 py-12 text-center border-t border-slate-900">
        <div className="flex items-center justify-center gap-2 mb-4 opacity-50 hover:opacity-100 transition-opacity duration-300">
            <Activity className="h-5 w-5"/>
            <span className="font-bold text-lg text-slate-200">DermaDetect AI</span>
        </div>
        <p className="text-sm">&copy; 2026 DermaDetect AI. All rights reserved.</p>
      </footer>

    </div>
  );
}