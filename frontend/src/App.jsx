import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, Upload, MessageSquare, Mic, BarChart3, 
  History, Award, Globe, LogIn, LogOut, Settings, Cpu, ChevronDown, Lock, Mail, ArrowRight
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = ['#00f2fe', '#4facfe', '#f093fb', '#00ffcc', '#ffcc00', '#ff4d4d'];

const TRANSLATIONS = {
  en: {
    detect: "Live AI Detection",
    analytics: "Waste Analytics",
    guru: "Smart Waste Advisor",
    history: "Sorting History",
    rewards: "Eco Rewards",
    lang: "Lang",
    login: "Login",
    logout: "Logout",
    startCam: "Start Cam",
    upload: "Upload File",
    actions: "Quick Actions",
    result: "Live Result",
    ready: "SYSTEM READY",
    placeholder: "Initialize Camera Stream",
    noWaste: "No waste detected",
    guruGreet: "Hello! I am your Eco-Guru. How can I help you recycle today?",
    guruPlaceholder: "Ask disposal advice...",
    loginTitle: "EcoSegregate",
    loginSub: "AI-Powered Waste Management Platform",
    email: "Email Address",
    pass: "Password",
    signIn: "Sign In",
    forgot: "Forgot Password?",
    noAccount: "Don't have an account? Sign Up"
  },
  te: {
    detect: "లైవ్ AI గుర్తింపు",
    analytics: "చెత్త విశ్లేషణ",
    guru: "స్మార్ట్ వేస్ట్ సలహాదారు",
    history: "క్రమబద్ధీకరణ చరిత్ర",
    rewards: "Eco రివార్డులు",
    lang: "భాష",
    login: "లాగిన్",
    logout: "లాగ్ అవుట్",
    startCam: "కెమెరా ప్రారంభించు",
    upload: "ఫైల్ అప్‌లోడ్",
    actions: "త్వరిత చర్యలు",
    result: "లైవ్ ఫలితం",
    ready: "సిస్టమ్ సిద్ధంగా ఉంది",
    placeholder: "కెమెరాను ప్రారంభించండి",
    noWaste: "చెత్త గుర్తించబడలేదు",
    guruGreet: "నమస్కారం! నేను మీ ఎకో-గురువుని. నేను మీకు ఎలా సహాయపడగలను?",
    guruPlaceholder: "సలహా కోసం అడగండి...",
    loginTitle: "EcoSegregate",
    loginSub: "AI- పవర్డ్ వేస్ట్ మేనేజ్మెంట్ ప్లాట్‌ఫాం",
    email: "ఈమెయిల్ చిరునామా",
    pass: "పాస్వర్డ్",
    signIn: "సైన్ ఇన్",
    forgot: "పాస్వర్డ్ మర్చిపోయారా?",
    noAccount: "ఖాతా లేదా? సైన్ అప్ చేయండి"
  },
  hi: {
    detect: "लाइव AI पहचान",
    analytics: "कचरा विश्लेषण",
    guru: "स्मार्ट कचरा सलाहकार",
    history: "छँटाई इतिहास",
    rewards: "इको रिवार्ड्स",
    lang: "भाषा",
    login: "लॉगिन",
    logout: "लॉगआउट",
    startCam: "कैमरा शुरू करें",
    upload: "फ़ाइल अपलोड करें",
    actions: "त्वरित कार्रवाई",
    result: "लाइव परिणाम",
    ready: "सिस्टम तैयार है",
    placeholder: "कैमरा स्ट्रीम शुरू करें",
    noWaste: "कोई कचरा नहीं मिला",
    guruGreet: "नमस्ते! मैं आपका इको-गुरु हूँ। मैं आपकी कैसे मदद कर सकता हूँ?",
    guruPlaceholder: "परामर्श के लिए पूछें...",
    loginTitle: "EcoSegregate",
    loginSub: "AI-संचालित अपशिष्ट प्रबंधन मंच",
    email: "ईमेल पता",
    pass: "पासवर्ड",
    signIn: "साइन इन करें",
    forgot: "पासवर्ड भूल गए?",
    noAccount: "खाता नहीं है? साइन अप करें"
  }
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [lang, setLang] = useState('en');
  const [history, setHistory] = useState([
    { id: 1, item: "Plastic Bottle", material: "Plastic", bin: "Blue", date: "Today, 14:20", points: "+50" },
    { id: 2, item: "News Paper", material: "Paper", bin: "Blue", date: "Today, 11:05", points: "+30" }
  ]);
  const t = TRANSLATIONS[lang];

  const addHistoryItem = (newItem) => {
    setHistory(prev => [{ 
      id: Date.now(), 
      ...newItem, 
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      points: `+${Math.floor(Math.random() * 50) + 20}`
    }, ...prev].slice(0, 50));
  };

  if (!isLoggedIn) {
    return <LoginView t={t} onLogin={() => setIsLoggedIn(true)} lang={lang} setLang={setLang} />;
  }

  return (
    <DashboardView 
      t={t} 
      onLogout={() => setIsLoggedIn(false)} 
      lang={lang} 
      setLang={setLang} 
      history={history}
      addHistoryItem={addHistoryItem}
    />
  );
}

function LoginView({ t, onLogin, lang, setLang }) {
  const [showLangMenu, setShowLangMenu] = useState(false);

  return (
    <div className="login-container">
      <div className="login-visuals">
        <div className="blob b1"></div>
        <div className="blob b2"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="login-content"
      >
        <div className="logo-box">
          <Cpu size={48} color="var(--primary)" />
          <h1 className="gradient-text">{t.loginTitle}</h1>
        </div>
        <p className="login-sub">{t.loginSub}</p>
        
        <div className="login-card glass-panel">
          <div className="input-group">
            <Mail size={18} className="input-icon" />
            <input type="email" placeholder={t.email} />
          </div>
          <div className="input-group">
            <Lock size={18} className="input-icon" />
            <input type="password" placeholder={t.pass} />
          </div>
          <button className="login-btn-primary" onClick={onLogin}>
            {t.signIn} <ArrowRight size={18} />
          </button>
          <div className="login-footer">
            <a href="#">{t.forgot}</a>
            <span className="divider"></span>
            <a href="#">{t.noAccount}</a>
          </div>
        </div>
        
        <div className="login-langs">
          <button onClick={() => setLang('en')} className={lang === 'en' ? 'active' : ''}>EN</button>
          <button onClick={() => setLang('te')} className={lang === 'te' ? 'active' : ''}>TE</button>
          <button onClick={() => setLang('hi')} className={lang === 'hi' ? 'active' : ''}>HI</button>
        </div>
      </motion.div>

      <style jsx>{`
        .login-container {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-deep);
          color: var(--text-main);
          overflow: hidden;
          position: relative;
        }
        .login-visuals { 
          position: absolute; 
          inset: 0; 
          filter: blur(80px); 
          opacity: 0.3; 
          pointer-events: none;
        }
        .blob { position: absolute; border-radius: 50%; width: 600px; height: 600px; }
        .b1 { background: var(--primary); top: -200px; left: -200px; }
        .b2 { background: var(--accent); bottom: -200px; right: -200px; }

        .login-content { width: 100%; max-width: 420px; text-align: center; z-index: 10; padding: 20px; }
        .logo-box { display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 10px; }
        .logo-box h1 { font-size: 2.8rem; margin: 0; }
        .login-sub { font-size: 1.1rem; color: var(--text-muted); margin-bottom: 40px; }
        
        .login-card { padding: 40px; display: flex; flex-direction: column; gap: 20px; text-align: left; }
        .input-group { position: relative; display: flex; align-items: center; }
        .input-icon { position: absolute; left: 15px; color: var(--text-muted); }
        input { 
          width: 100%; height: 50px; background: rgba(0,0,0,0.3); border: 1px solid var(--glass-border); 
          border-radius: 12px; padding: 0 15px 0 45px; color: #fff; font-size: 1rem;
        }
        .login-btn-primary { 
          height: 50px; background: var(--primary); border: none; border-radius: 12px;
          color: #000; font-weight: 700; font-size: 1rem; display: flex; align-items: center;
          justify-content: center; gap: 10px; transition: all 0.3s;
          cursor: pointer;
        }
        .login-btn-primary:hover { filter: brightness(1.1); transform: translateY(-2px); }
        .login-footer { display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-muted); }
        .login-footer a:hover { color: var(--primary); }
        
        .login-langs { display: flex; gap: 10px; margin-top: 30px; justify-content: center; }
        .login-langs button { 
          background: transparent; border: 1px solid var(--glass-border); padding: 5px 15px; 
          border-radius: 8px; color: var(--text-muted); font-size: 0.8rem; cursor: pointer;
        }
        .login-langs button.active { border-color: var(--primary); color: var(--primary); }
      `}</style>
    </div>
  );
}

function DashboardView({ t, onLogout, lang, setLang, history, addHistoryItem }) {
  const [activeTab, setActiveTab] = useState('detect');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  const mockAnalytics = [
    { name: 'Plastic', value: 400 },
    { name: 'Paper', value: 300 },
    { name: 'Metal', value: 200 },
    { name: 'Organic', value: 500 },
    { name: 'E-Waste', value: 100 },
  ];

  const handleLangChange = (newLang) => {
    setLang(newLang);
    setShowLangMenu(false);
  };

  return (
    <div className="app-container">
      <div className="scan-line"></div>
      
      {/* Sidebar Navigation */}
      <nav className="sidebar glass-panel">
        <div>
          <div className="logo-container">
            <Cpu className="icon-glow" color="var(--primary)" size={32} />
            <h1 className="gradient-text">ECO-SEG</h1>
          </div>
          
          <div className="nav-items">
            <NavItem icon={<Camera />} label={t.detect} active={activeTab === 'detect'} onClick={() => setActiveTab('detect')} />
            <NavItem icon={<BarChart3 />} label={t.analytics} active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
            <NavItem icon={<MessageSquare />} label={t.guru} active={activeTab === 'guru'} onClick={() => setActiveTab('guru')} />
            <NavItem icon={<History />} label={t.history} active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
            <NavItem icon={<Award />} label={t.rewards} active={activeTab === 'rewards'} onClick={() => setActiveTab('rewards')} />
          </div>
        </div>

        <div className="bottom-nav">
          <div className="lang-selector-container">
            <button className="nav-item lang-btn" onClick={() => setShowLangMenu(!showLangMenu)}>
              <Globe size={20} />
              <span>{t.lang} ({lang.toUpperCase()})</span>
              <ChevronDown size={14} />
            </button>
            <AnimatePresence>
              {showLangMenu && (
                <motion.div 
                  className="lang-menu glass-panel"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <button onClick={() => handleLangChange('en')}>English</button>
                  <button onClick={() => handleLangChange('te')}>తెలుగు</button>
                  <button onClick={() => handleLangChange('hi')}>हिन्दी</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button className="nav-item" onClick={onLogout}>
            <LogOut size={20} />
            <span>{t.logout}</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="main-content">
        <header>
          <h2 className="glow-text">
            {t[activeTab]}
          </h2>
          <div className="user-status glass-panel">
            <Award size={18} color="var(--primary)" />
            <span>Lv. 4 Eco-Warrior</span>
            <div className="score-badge">2,450 XP</div>
          </div>
        </header>

        <section className="content-inner">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              style={{ height: '100%' }}
            >
              {activeTab === 'detect' && (
                <DetectView 
                  t={t} 
                  setPrediction={setPrediction} 
                  setIsScanning={setIsScanning} 
                  isScanning={isScanning} 
                  prediction={prediction} 
                  addHistoryItem={addHistoryItem}
                />
              )}
              {activeTab === 'analytics' && <AnalyticsView data={mockAnalytics} />}
              {activeTab === 'guru' && <GuruView t={t} />}
              {activeTab === 'history' && <HistoryView t={t} history={history} />}
              {activeTab === 'rewards' && <RewardsView t={t} />}
            </motion.div>
          </AnimatePresence>
        </section>
      </main>

      <style jsx>{`
        .app-container {
          display: flex;
          height: 100vh;
          padding: 20px;
          gap: 20px;
          background: var(--bg-deep);
        }

        .sidebar {
          width: 260px;
          display: flex;
          flex-direction: column;
          padding: 30px 20px;
          justify-content: space-between;
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 40px;
        }

        .nav-items {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .user-status {
          padding: 10px 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.9rem;
        }

        .score-badge {
          background: var(--primary);
          color: var(--bg-deep);
          padding: 2px 10px;
          border-radius: 10px;
          font-weight: 700;
        }

        .content-inner {
          flex: 1;
          overflow: hidden;
        }

        .lang-selector-container {
          position: relative;
        }

        .lang-menu {
          position: absolute;
          bottom: 100%;
          left: 0;
          width: 100%;
          margin-bottom: 10px;
          display: flex;
          flex-direction: column;
          padding: 10px;
          gap: 5px;
          z-index: 100;
        }

        .lang-menu button {
          background: transparent;
          border: none;
          color: var(--text-muted);
          padding: 8px;
          text-align: left;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .lang-menu button:hover {
          background: rgba(255,255,255,0.1);
          color: var(--primary);
        }

        .nav-item {
          width: 100%;
          background: transparent;
          border: none;
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 12px 15px;
          border-radius: 12px;
          transition: all 0.2s ease;
          color: var(--text-muted);
          cursor: pointer;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-main);
        }
      `}</style>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button 
      className={`nav-item ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      {React.cloneElement(icon, { size: 20 })}
      <span>{label}</span>
      <style jsx>{`
        .nav-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 12px 15px;
          border-radius: 12px;
          transition: all 0.2s ease;
          color: var(--text-muted);
          cursor: pointer;
          width: 100%;
          background: transparent;
          border: none;
        }
        .nav-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-main);
        }
        .nav-item.active {
          background: linear-gradient(90deg, var(--primary-glow), transparent);
          color: var(--primary);
          border-left: 3px solid var(--primary);
        }
      `}</style>
    </button>
  );
}

function DetectView({ t, setPrediction, setIsScanning, isScanning, prediction, addHistoryItem }) {
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const [camStream, setCamStream] = useState(null);
  const [hudObjects, setHudObjects] = useState([]);
  const [previewImg, setPreviewImg] = useState(null);
  const [model, setModel] = useState(null);
  const [isModelLoading, setIsModelLoading] = useState(false);

  const WASTE_MAP = {
    // E-WASTE
    'telephone': 'E-waste', 'cellular': 'E-waste', 'laptop': 'E-waste', 'desktop': 'E-waste', 'monitor': 'E-waste',
    'notebook': 'E-waste', 'computer': 'E-waste', 'modem': 'E-waste', 'mouse': 'E-waste', 'keyboard': 'E-waste',
    'joystick': 'E-waste', 'printer': 'E-waste', 'calculator': 'E-waste', 'screen': 'E-waste', 'camera': 'E-waste',
    'radio': 'E-waste', 'television': 'E-waste', 'battery': 'E-waste', 'charger': 'E-waste', 'wire': 'E-waste',
    'ipod': 'E-waste', 'ipad': 'E-waste', 'iphone': 'E-waste', 'remote': 'E-waste', 'light': 'E-waste',

    // PLASTIC
    'bottle': 'Plastic', 'flask': 'Plastic', 'container': 'Plastic', 'jug': 'Plastic', 'cup': 'Plastic',
    'vessel': 'Plastic', 'packet': 'Plastic', 'bag': 'Plastic', 'sac': 'Plastic', 'wrapper': 'Plastic',
    'packaging': 'Plastic', 'tub': 'Plastic', 'tray': 'Plastic', 'pipe': 'Plastic', 'hose': 'Plastic',
    'straw': 'Plastic', 'poly': 'Plastic', 'nylon': 'Plastic', 'stearin': 'Plastic', 'plate': 'Plastic',

    // PAPER
    'paper': 'Paper', 'envelope': 'Paper', 'mail': 'Paper', 'cardboard': 'Paper', 'box': 'Paper',
    'carton': 'Paper', 'ledger': 'Paper', 'magazine': 'Paper', 'news': 'Paper', 'book': 'Paper',
    'notebook': 'Paper', 'pad': 'Paper', 'sheet': 'Paper', 'brochure': 'Paper', 'flyer': 'Paper',
    'post': 'Paper', 'ticket': 'Paper', 'receipt': 'Paper', 'napkin': 'Paper', 'tissue': 'Paper',

    // METAL
    'can': 'Metal', 'tin': 'Metal', 'foil': 'Metal', 'aluminum': 'Metal', 'steel': 'Metal',
    'iron': 'Metal', 'copper': 'Metal', 'brass': 'Metal', 'wire': 'Metal', 'screw': 'Metal',
    'nail': 'Metal', 'pin': 'Metal', 'bolt': 'Metal', 'wrench': 'Metal', 'tool': 'Metal',
    'blade': 'Metal', 'knife': 'Metal', 'fork': 'Metal', 'spoon': 'Metal', 'key': 'Metal',
    'lock': 'Metal', 'chain': 'Metal', 'rod': 'Metal', 'plate': 'Metal', 'tray': 'Metal',

    // ORGANIC
    'banana': 'Organic', 'apple': 'Organic', 'orange': 'Organic', 'fruit': 'Organic', 'vegetable': 'Organic',
    'bread': 'Organic', 'food': 'Organic', 'peel': 'Organic', 'husk': 'Organic', 'shell': 'Organic',
    'leaf': 'Organic', 'plant': 'Organic', 'flower': 'Organic', 'seed': 'Organic', 'nut': 'Organic',
    'egg': 'Organic', 'meat': 'Organic', 'bone': 'Organic', 'dairy': 'Organic', 'cheese': 'Organic',
    'grain': 'Organic', 'rice': 'Organic', 'flour': 'Organic', 'spice': 'Organic', 'tea': 'Organic',
    'coffee': 'Organic', 'earth': 'Organic', 'mud': 'Organic', 'compost': 'Organic', 'twig': 'Organic',

    // GLASS
    'glass': 'Glass', 'bottle': 'Glass', 'jar': 'Glass', 'wine': 'Glass', 'beer': 'Glass',
    'cup': 'Glass', 'plate': 'Glass', 'dish': 'Glass', 'bowl': 'Glass', 'pan': 'Glass',
    'lens': 'Glass', 'mirror': 'Glass', 'bulb': 'Glass', 'tube': 'Glass', 'crystal': 'Glass'
  };

  const BIN_DATA = {
    'E-waste': { bin: 'Black Bin', color: 'Black', instr: 'Contains hazardous batteries and circuits. Dispose at e-waste centers.' },
    'Plastic': { bin: 'Blue Bin', color: 'Blue', instr: 'Wash and dry before recycling. Remove any non-plastic parts.' },
    'Paper': { bin: 'Blue Bin', color: 'Blue', instr: 'Keep dry. Remove plastic windows or spiral wires if possible.' },
    'Metal': { bin: 'Blue Bin', color: 'Blue', instr: 'Rinse thoroughly. Crush cans to save space if required.' },
    'Organic': { bin: 'Green Bin', color: 'Green', instr: 'Compostable material. Do not mix with plastic or metal.' },
    'Glass': { bin: 'Blue Bin', color: 'Blue', instr: 'Rinse and handle carefully. Recycle at glass collection points.' },
    'Identify': { bin: 'Black Bin', color: 'Black', instr: 'Unidentified waste. Please consult the disposal manual.' }
  };

  useEffect(() => {
    async function loadModel() {
      if (window.mobilenet) {
        setIsModelLoading(true);
        try {
          const net = await window.mobilenet.load();
          setModel(net);
        } catch (e) { console.error("AI Model Load Fail", e); }
        setIsModelLoading(false);
      }
    }
    loadModel();
  }, []);

  // Real-Time Loop
  useEffect(() => {
    let animationFrame;
    const predictLoop = async () => {
      if (isScanning && camStream && model && videoRef.current) {
        try {
          const predictions = await model.classify(videoRef.current);
          if (predictions && predictions.length > 0) {
            const topResult = predictions[0];
            if (topResult.probability > 0.4) {
              processResults(predictions);
            }
          }
        } catch (e) { console.error("Predict loop error", e); }
      }
      animationFrame = requestAnimationFrame(predictLoop);
    };
    if (isScanning && camStream) predictLoop();
    return () => cancelAnimationFrame(animationFrame);
  }, [isScanning, camStream, model]);

  const handleStartCam = async () => {
    setPreviewImg(null);
    if (isScanning && camStream) {
      camStream.getTracks().forEach(track => track.stop());
      setCamStream(null); setIsScanning(false); setPrediction(null); setHudObjects([]);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCamStream(stream);
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsScanning(true); setPrediction(null);
    } catch (err) { console.error("Camera error", err); }
  };

  const handleUploadClick = () => fileInputRef.current.click();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !model) return;
    setIsScanning(true); setPrediction(null); setPreviewImg(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewImg(event.target.result);
      const img = new Image();
      img.src = event.target.result;
      img.onload = async () => {
        const res = await model.classify(img);
        processResults(res);
        setIsScanning(false);
      };
    };
    reader.readAsDataURL(file);
  };

  const processResults = (res) => {
    if (!res || res.length === 0) return;
    
    // Check all predictions for a match, not just the top one
    let matchedCategory = 'Identify';
    let bestMatchLabel = res[0].className;
    let confidence = res[0].probability;

    for (const pred of res) {
      const predLabel = pred.className.toLowerCase();
      for (const keyword in WASTE_MAP) {
        if (predLabel.includes(keyword)) {
          matchedCategory = WASTE_MAP[keyword];
          bestMatchLabel = predLabel.split(',')[0];
          confidence = pred.probability;
          break;
        }
      }
      if (matchedCategory !== 'Identify') break;
    }

    const categoryData = BIN_DATA[matchedCategory];

    const finalResult = {
      label: matchedCategory,
      actualItem: bestMatchLabel.charAt(0).toUpperCase() + bestMatchLabel.slice(1),
      bin: categoryData.bin,
      instructions: categoryData.instr
    };

    setPrediction(finalResult);
    setHudObjects([{
      id: Date.now(), label: matchedCategory, x: 25, y: 25, w: 50, h: 50, confidence: confidence.toFixed(2)
    }]);

    // Throttle history saves for cam, save immediately for file
    if (!camStream || Math.random() > 0.99) {
      addHistoryItem({ 
        item: finalResult.actualItem, 
        material: matchedCategory, 
        bin: categoryData.color,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }
  };

  return (
    <div className="detect-grid">
      <div className="viewport glass-panel">
        {isModelLoading && <div className="loader">Loading AI...</div>}
        <div className="hud">
          <div className="corner tl"></div><div className="corner tr"></div>
          <div className="corner bl"></div><div className="corner br"></div>
          {hudObjects.map(obj => (
            <motion.div 
              key={obj.id}
              className="hud-box"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ left: `${obj.x}%`, top: `${obj.y}%`, width: `${obj.w}%`, height: `${obj.h}%`, position: 'absolute', border: '2px solid #00f2fe', zIndex: 10 }}
            >
              <div style={{ position: 'absolute', bottom: '100%', left: 0, background: '#00f2fe', color: '#000', padding: '2px 8px', fontSize: '10px', fontWeight: 'bold' }}>
                {obj.label} ({(obj.confidence * 100).toFixed(0)}%)
              </div>
            </motion.div>
          ))}
        </div>
        <video ref={videoRef} autoPlay playsInline muted className="cam-feed" style={{ display: camStream ? 'block' : 'none' }} />
        {previewImg && <img src={previewImg} className="cam-feed" />}
        {!camStream && !previewImg && <div className="cam-ph"><Camera size={64} opacity={0.2} /><p>{t.placeholder}</p></div>}
        <div className="system-ready">SYSTEM READY</div>
      </div>

      <div className="controls">
        <div className="card glass-panel qa-card">
          <h3 className="card-title">Quick Actions</h3>
          <div className="btn-stack">
            <button className="btn-cam" onClick={handleStartCam}>
              <Camera size={20} /> {isScanning && camStream ? 'Stop Cam' : t.startCam}
            </button>
            <button className="btn-up" onClick={handleUploadClick}>
              <Upload size={20} /> {t.upload}
            </button>
            <input type="file" ref={fileInputRef} hidden onChange={handleFileChange} />
            <div className="mic-wrapper">
              <button className="btn-mic"><Mic size={24} /></button>
            </div>
          </div>
        </div>

        <div className="card glass-panel res-card">
          <h3 className="card-title">Live Result</h3>
          {!prediction ? (
            <div className="no-res">No waste detected</div>
          ) : (
            <div className="res-box">
              <div className="res-header">
                <Cpu size={20} color="var(--primary)" />
                <div className="res-label">{prediction.actualItem || prediction.label}</div>
              </div>
              <div className={`res-badge ${prediction.bin.split(' ')[0].toLowerCase()}`}>{prediction.bin}</div>
              <div className="res-instr">
                <Settings size={14} />
                <span>{prediction.instructions}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .detect-grid { display: grid; grid-template-columns: 1fr 320px; gap: 20px; height: 100%; }
        .viewport { position: relative; background: #000; border-radius: 20px; overflow: hidden; border: 1px solid var(--glass-border); }
        .cam-feed { width: 100%; height: 100%; object-fit: cover; }
        .cam-ph { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0.5; color: var(--text-muted); }
        .loader { position: absolute; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 10; color: #00f2fe; font-weight: 800; }
        .system-ready { position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); background: #00f2fe; color: #000; padding: 5px 20px; border-radius: 4px; font-weight: 900; font-size: 0.7rem; letter-spacing: 1px; }
        
        .controls { display: flex; flex-direction: column; gap: 20px; }
        .card { padding: 25px; background: rgba(10, 15, 25, 0.95); borderRadius: 20px; }
        .card-title { color: #fff; font-size: 1.1rem; margin-bottom: 20px; font-weight: 800; }
        .btn-stack { display: flex; flex-direction: column; gap: 15px; }
        
        button { border: none; border-radius: 12px; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; transition: 0.2s; }
        .btn-cam { background: #00f2fe; color: #000; padding: 18px; font-size: 1rem; width: 100%; box-shadow: 0 4px 20px rgba(0, 242, 254, 0.3); }
        .btn-up { background: rgba(255,255,255,0.05); color: #fff; padding: 18px; border: 1px solid rgba(255,255,255,0.1); width: 100%; }
        .mic-wrapper { display: flex; justify-content: center; margin-top: 5px; }
        .btn-mic { width: 60px; height: 60px; border-radius: 50%; background: #f093fb; color: #fff; box-shadow: 0 4px 20px rgba(240, 147, 251, 0.3); }
        
        .no-res { color: #718096; font-size: 1rem; }
        .res-box { display: flex; flex-direction: column; gap: 15px; }
        .res-header { display: flex; align-items: center; gap: 10px; }
        .res-label { font-size: 1.6rem; color: #00f2fe; font-weight: 800; }
        .res-badge { padding: 6px 16px; border-radius: 20px; color: #000; font-weight: 700; width: fit-content; font-size: 0.9rem; }
        .blue { background: #4facfe; } .green { background: #00ffcc; } .black { background: #333; color: #fff; }
        .res-instr { display: flex; gap: 10px; color: #718096; font-size: 0.85rem; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 10px; align-items: center; }
        
        .hud { position: absolute; inset: 0; pointer-events: none; z-index: 5; }
        .corner { position: absolute; width: 40px; height: 40px; border: 2px solid #00f2fe; opacity: 0.5; }
        .tl { top: 20px; left: 20px; border-right: 0; border-bottom: 0; }
        .tr { top: 20px; right: 20px; border-left: 0; border-bottom: 0; }
        .bl { bottom: 20px; left: 20px; border-right: 0; border-top: 0; }
        .br { bottom: 20px; right: 20px; border-left: 0; border-top: 0; }
      `}</style>
    </div>
  );
}

function AnalyticsView({ data }) {
  return (
    <div className="analytics-grid">
      <div className="chart-card glass-panel">
        <h3>Waste Composition</h3>
        <div style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis dataKey="name" stroke="#718096" />
              <YAxis stroke="#718096" />
              <Tooltip 
                contentStyle={{ background: 'rgba(15, 25, 40, 0.9)', border: '1px solid #4a5568' }}
              />
              <Bar dataKey="value">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="stat-cards">
        <div className="stat-card glass-panel">
          <p>Total Items</p>
          <h4>1,532</h4>
        </div>
        <div className="stat-card glass-panel">
          <p>Recycle Rate</p>
          <h4>72%</h4>
        </div>
        <div className="stat-card glass-panel">
          <p>Eco Points</p>
          <h4>24,500</h4>
        </div>
      </div>
      <style jsx>{`
        .analytics-grid {
          display: grid;
          grid-template-columns: 1fr 200px;
          gap: 20px;
          height: 100%;
        }
        .chart-card { padding: 20px; }
        .stat-cards { display: flex; flex-direction: column; gap: 20px; }
        .stat-card { padding: 20px; text-align: center; }
        .stat-card h4 { font-size: 1.5rem; color: var(--primary); margin-top: 10px; }
      `}</style>
    </div>
  );
}

function GuruView({ t }) {
  return (
    <div className="guru-container glass-panel">
      <div className="chat-history">
        <div className="bubble ai">{t.guruGreet}</div>
      </div>
      <div className="chat-input-area">
        <input type="text" placeholder={t.guruPlaceholder} />
        <button className="btn-chat"><MessageSquare size={18}/></button>
      </div>
      <style jsx>{`
        .guru-container { height: 100%; display: flex; flex-direction: column; padding: 20px; }
        .chat-history { flex: 1; display: flex; flex-direction: column; gap: 15px; }
        .bubble { padding: 12px 18px; border-radius: 15px; max-width: 80%; font-size: 0.9rem; }
        .ai { background: var(--bg-card); border: 1px solid var(--glass-border); align-self: flex-start; }
        .chat-input-area { display: flex; gap: 10px; margin-top: 20px; }
        input { flex: 1; background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border); padding: 12px 20px; border-radius: 12px; color: #fff; }
        .btn-chat { background: var(--primary); border: none; padding: 0 20px; border-radius: 12px; color: #000; cursor: pointer; }
      `}</style>
    </div>
  );
}

function HistoryView({ t, history }) {
  return (
    <div className="history-container glass-panel">
      <div className="history-table">
        <div className="table-header">
          <span>Item</span>
          <span>Category</span>
          <span>Bin</span>
          <span>Credits</span>
        </div>
        <div className="table-body">
          {history.length === 0 ? (
            <div className="empty-history">No items sorted yet.</div>
          ) : (
            history.map(item => (
              <motion.div 
                key={item.id} 
                className="table-row"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ x: 5, background: 'rgba(255,255,255,0.05)' }}
              >
                <div className="item-cell">
                  <p>{item.item}</p>
                  <small>{item.date}</small>
                </div>
                <div className="badge">{item.material}</div>
                <div className={`bin-indicator ${item.bin.toLowerCase()}`}>{item.bin}</div>
                <div className="points">{item.points}</div>
              </motion.div>
            ))
          )}
        </div>
      </div>
      <style jsx>{`
        .history-container { height: 100%; padding: 25px; overflow: hidden; display: flex; flex-direction: column; }
        .history-table { flex: 1; overflow-y: auto; }
        .table-header { 
          display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; 
          padding: 10px 15px; border-bottom: 1px solid var(--glass-border);
          color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px;
        }
        .table-row { 
          display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; 
          padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); align-items: center;
          transition: all 0.2s;
        }
        .item-cell p { margin: 0; font-weight: 600; }
        .item-cell small { color: var(--text-muted); font-size: 0.75rem; }
        .badge { font-size: 0.75rem; padding: 4px 10px; background: rgba(255,255,255,0.1); border-radius: 6px; width: fit-content; }
        .bin-indicator { font-weight: 700; font-size: 0.8rem; }
        .blue { color: #4facfe; } .green { color: #00ffcc; } .black { color: #718096; }
        .points { color: var(--primary); font-weight: 800; }
        .empty-history { padding: 40px; text-align: center; color: var(--text-muted); font-style: italic; }
      `}</style>
    </div>
  );
}

function RewardsView({ t }) {
  const achievements = [
    { title: "First Sort", desc: "Successfully classified your first item", level: "Bronze", unlocked: true },
    { title: "Plastic King", desc: "Recycled 50 plastic bottles", level: "Gold", unlocked: true },
    { title: "Night Owl", desc: "Detected waste after midnight", level: "Silver", unlocked: true },
    { title: "Eco Warrior", desc: "Reach Level 5", level: "Elite", unlocked: false },
    { title: "Global Saver", desc: "Prevent 100kg of CO2 emissions", level: "Diamond", unlocked: false },
  ];

  return (
    <div className="rewards-grid">
      {achievements.map((ach, i) => (
        <motion.div 
          key={i} 
          className={`reward-card glass-panel ${!ach.unlocked ? 'locked' : ''}`}
          whileHover={ach.unlocked ? { scale: 1.02, y: -5 } : {}}
        >
          <div className="reward-icon">
            {ach.unlocked ? <Award size={32} color="var(--primary)" /> : <Lock size={32} color="#444" />}
          </div>
          <div className="reward-info">
            <div className="reward-title-row">
              <h4>{ach.title}</h4>
              <span className={`level-tag ${ach.level.toLowerCase()}`}>{ach.level}</span>
            </div>
            <p>{ach.desc}</p>
          </div>
          {!ach.unlocked && <div className="lock-overlay">LOCKED</div>}
        </motion.div>
      ))}
      <style jsx>{`
        .rewards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
        .reward-card { padding: 25px; display: flex; gap: 20px; align-items: center; position: relative; overflow: hidden; }
        .locked { opacity: 0.5; filter: grayscale(1); }
        .reward-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
        .reward-title-row h4 { margin: 0; font-size: 1.1rem; }
        .reward-info p { margin: 0; font-size: 0.85rem; color: var(--text-muted); }
        .level-tag { font-size: 0.65rem; padding: 2px 8px; border-radius: 4px; font-weight: 800; text-transform: uppercase; }
        .bronze { background: #cd7f32; color: #fff; }
        .silver { background: #c0c0c0; color: #000; }
        .gold { background: #ffd700; color: #000; }
        .elite { background: var(--primary); color: #000; }
        .diamond { background: #b9f2ff; color: #000; }
        .lock-overlay { 
          position: absolute; top: 10px; right: 10px; font-size: 0.6rem; 
          background: #444; padding: 2px 8px; border-radius: 4px; font-weight: 800;
        }
      `}</style>
    </div>
  );
}
