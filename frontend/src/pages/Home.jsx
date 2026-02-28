import React, { useState, useEffect } from 'react';
import { 
  Activity, ArrowRight, CheckCircle2, Scan, BrainCircuit, 
  FileText, AlertTriangle, Cpu, Layers, Network, User, ShieldCheck, Zap, BookOpen,
  TrendingUp, GitMerge
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
      const navHeight = 80; // Account for the sticky navbar height
      const elementRect = element.getBoundingClientRect();
      const elementTop = elementRect.top + window.scrollY;
      const elementHeight = elementRect.height;
      const windowHeight = window.innerHeight;

      let scrollToPosition;

      if (elementHeight > (windowHeight - navHeight)) {
        // If the section is taller than the screen, align it just below the navbar
        scrollToPosition = elementTop - navHeight;
      } else {
        // Center it within the visible viewport space, but raised slightly higher (+40 offset)
        const availableSpace = windowHeight - navHeight;
        const raiseOffset = 60; // Pushes the scroll down slightly more to raise the section up
        scrollToPosition = elementTop - navHeight - ((availableSpace - elementHeight) / 2) + raiseOffset;
      }

      window.scrollTo({ top: scrollToPosition, behavior: 'smooth' });
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
          <a 
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 focus:outline-none group"
          >
            <div className={`p-2 rounded-xl transition-all duration-300 ${scrolled ? 'bg-emerald-100 group-hover:rotate-12' : 'bg-white/10 backdrop-blur-sm'}`}>
              <Activity className={`h-6 w-6 transition-colors duration-200 ${scrolled ? 'text-emerald-600' : 'text-white'}`} />
            </div>
            <span className={`font-bold text-xl tracking-tight transition-colors ${scrolled ? 'text-gray-900 group-hover:text-emerald-600' : 'text-white'}`}>
              DermaDetect AI
            </span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {['Process', 'Technology', 'Performance', 'Capabilities'].map((item) => (
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
      <div id="process" className="py-24 bg-slate-50 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-emerald-600 font-bold tracking-wider uppercase text-sm mb-2 block">Workflow</span>
            <h2 className="text-4xl font-extrabold text-gray-900">How It Works</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { icon: Scan, color: 'emerald', title: '1. Upload Image', desc: 'Take a clear photo of the skin area.' },
              { icon: BrainCircuit, color: 'emerald', title: '2. AI Analysis', desc: 'Ensemble Committee analyzes textures.' },
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
      <div id="technology" className="py-24 bg-slate-900 text-white relative overflow-hidden">
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

      {/* --- ENSEMBLE PERFORMANCE / GRAPH SECTION --- */}
      <div id="performance" className="py-24 bg-white relative z-10 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-emerald-600 font-bold tracking-wider uppercase text-sm mb-2 block">Performance Metrics</span>
            <h2 className="text-4xl font-extrabold text-gray-900">Why We Use an Ensemble</h2>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto text-lg">
              Instead of relying on a single algorithm, our system combines the strengths of three different neural networks. This collaborative approach significantly reduces false positives.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-12 items-center">
            
            {/* Static Graph/Chart */}
            <div className="w-full lg:w-1/2 bg-white p-8 md:p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
              
              <h3 className="font-bold text-2xl mb-8 text-gray-800 flex items-center gap-3 relative z-10">
                <TrendingUp className="text-emerald-500 h-7 w-7" /> Accuracy Comparison
              </h3>
              
              <div className="space-y-7 relative z-10">
                {/* Bar 1 */}
                <div className="group">
                  <div className="flex justify-between text-sm mb-2 font-bold text-gray-500 group-hover:text-gray-800 transition-colors">
                    <span>MobileNetV2 (Standalone)</span>
                    <span>85.2%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3">
                    <div className="bg-slate-300 h-3 rounded-full group-hover:bg-slate-400 transition-colors duration-500" style={{ width: '85.2%' }}></div>
                  </div>
                </div>
                {/* Bar 2 */}
                <div className="group">
                  <div className="flex justify-between text-sm mb-2 font-bold text-gray-500 group-hover:text-gray-800 transition-colors">
                    <span>ResNet50 (Standalone)</span>
                    <span>87.8%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3">
                    <div className="bg-slate-300 h-3 rounded-full group-hover:bg-slate-400 transition-colors duration-500" style={{ width: '87.8%' }}></div>
                  </div>
                </div>
                {/* Bar 3 */}
                <div className="group">
                  <div className="flex justify-between text-sm mb-2 font-bold text-gray-500 group-hover:text-gray-800 transition-colors">
                    <span>EfficientNetB0 (Standalone)</span>
                    <span>89.4%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3">
                    <div className="bg-slate-300 h-3 rounded-full group-hover:bg-slate-400 transition-colors duration-500" style={{ width: '89.4%' }}></div>
                  </div>
                </div>
                {/* Bar 4 - Ensemble (Highlighted) */}
                <div className="pt-6 mt-2 border-t border-slate-100">
                  <div className="flex justify-between text-base mb-3 font-black text-emerald-700">
                    <span className="flex items-center gap-2"><GitMerge size={20}/> Soft Voting Ensemble</span>
                    <span className="text-xl">94.6%</span>
                  </div>
                  <div className="w-full bg-emerald-100 rounded-full h-5 shadow-inner">
                    <div className="bg-gradient-to-r from-emerald-400 to-teal-500 h-5 rounded-full relative" style={{ width: '94.6%' }}>
                       <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Disclaimer Note */}
                <div className="pt-6 border-t border-slate-100/60 mt-4">
                  <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                    * Metrics displayed represent validation accuracy on a balanced subset of the Dermnet clinical dataset. Real-world predictive performance may vary based on image quality, lighting, and skin tones.
                  </p>
                </div>
              </div>
            </div>

            {/* Info Cards */}
            <div className="w-full lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-blue-50/50 p-8 rounded-3xl border border-blue-100 hover:bg-blue-50 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300">
                <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center text-blue-600 mb-6 shadow-sm border border-blue-100">
                  <BrainCircuit size={28} />
                </div>
                <h4 className="font-bold text-gray-900 text-lg mb-3">Diverse Learning</h4>
                <p className="text-gray-600 leading-relaxed text-sm">Each model learns different feature sets. EfficientNet excels at texture, while ResNet captures broad shapes perfectly.</p>
              </div>
              
              <div className="bg-purple-50/50 p-8 rounded-3xl border border-purple-100 hover:bg-purple-50 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300">
                <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center text-purple-600 mb-6 shadow-sm border border-purple-100">
                  <AlertTriangle size={28} />
                </div>
                <h4 className="font-bold text-gray-900 text-lg mb-3">Error Mitigation</h4>
                <p className="text-gray-600 leading-relaxed text-sm">If one model miscalculates due to poor lighting or blur, the other two models outvote it to maintain high accuracy.</p>
              </div>

              <div className="bg-emerald-50/50 p-8 rounded-3xl border border-emerald-100 hover:bg-emerald-50 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 sm:col-span-2">
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0 shadow-sm border border-emerald-100">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-xl mb-3">Soft Voting Mechanism</h4>
                    <p className="text-gray-600 leading-relaxed">Rather than just counting absolute votes (Hard Voting), our system mathematically averages the exact confidence percentages from all three neural networks. This continuous consensus ensures the most probabilistically sound diagnosis possible.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* --- CAPABILITIES --- */}
      <div id="capabilities" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-emerald-600 font-bold uppercase text-sm">Scope</span>
            <h2 className="text-4xl font-extrabold text-gray-900">Detectable Conditions</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {diseases.map((d, i) => (
              <div key={i} className="group bg-white p-4 rounded-xl flex items-center gap-3 border border-slate-100 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/5 hover:-translate-y-1 transition-all duration-300 cursor-default">
                <div className="bg-slate-50 p-2 rounded-full shadow-sm group-hover:scale-110 group-hover:bg-emerald-50 transition-all duration-300">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0"/>
                </div>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">{d}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- PORTALS --- */}
      <div id="portals" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-12">Choose Your Portal</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Patient Portal */}
            <a href="/auth?role=patient" className="group bg-slate-50 p-10 rounded-[2rem] shadow-sm border border-slate-100 hover:bg-white hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-2 hover:border-emerald-100 transition-all duration-300 relative overflow-hidden flex flex-col items-center">
                <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600 shadow-sm border border-emerald-50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <User size={40}/>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-900">Patient</h3>
                <p className="text-gray-500 mb-8 max-w-xs mx-auto text-sm">Scan skin, view diagnosis history, and find nearby clinics.</p>
                <span className="mt-auto w-full inline-block bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold group-hover:bg-emerald-700 transition-all duration-300 shadow-md shadow-emerald-600/20">Login as Patient</span>
            </a>
            
            {/* Student Portal (NEW) */}
            <a href="/auth?role=student" className="group bg-slate-50 p-10 rounded-[2rem] shadow-sm border border-slate-100 hover:bg-white hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 hover:border-blue-100 transition-all duration-300 relative overflow-hidden flex flex-col items-center">
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600 shadow-sm border border-blue-50 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500">
                    <BookOpen size={40}/>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-900">Medical Student</h3>
                <p className="text-gray-500 mb-8 max-w-xs mx-auto text-sm">Access clinical case studies, scan images, and read treatments.</p>
                <span className="mt-auto w-full inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-bold group-hover:bg-blue-700 transition-all duration-300 shadow-md shadow-blue-600/20">Login as Student</span>
            </a>

            {/* Admin Portal */}
            <a href="/auth?role=admin" className="group bg-slate-50 p-10 rounded-[2rem] shadow-sm border border-slate-100 hover:bg-white hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-2 hover:border-purple-100 transition-all duration-300 relative overflow-hidden flex flex-col items-center">
                <div className="absolute top-0 left-0 w-full h-1 bg-purple-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-purple-600 shadow-sm border border-purple-50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <ShieldCheck size={40}/>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-900">Admin</h3>
                <p className="text-gray-500 mb-8 max-w-xs mx-auto text-sm">System management, analytics, and performance monitoring.</p>
                <span className="mt-auto w-full inline-block bg-purple-600 text-white px-8 py-3 rounded-xl font-bold group-hover:bg-purple-700 transition-all duration-300 shadow-md shadow-purple-600/20">Login as Admin</span>
            </a>
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