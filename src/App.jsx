import { useState, useEffect } from "react";
import ReactDOM from "react-dom/client"; // Add this import

// ─── FONTS & GLOBAL STYLES ────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Barlow+Condensed:wght@300;400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #050810; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(0,200,255,0.2); border-radius: 2px; }
  input, select, textarea { outline: none; font-family: 'Share Tech Mono', monospace; }
  input:focus, select:focus, textarea:focus { border-color: #00c8ff !important; box-shadow: 0 0 0 2px rgba(0,200,255,0.1); }
  .nav-btn { transition: all 0.15s ease; cursor: pointer; }
  .nav-btn:hover { background: rgba(0,200,255,0.08) !important; }
  .nav-btn.active { background: rgba(0,200,255,0.12) !important; border-left: 2px solid #00c8ff !important; }
  .row:hover { background: rgba(0,200,255,0.03) !important; }
  .btn-act { transition: all 0.15s; cursor: pointer; }
  .btn-act:hover { filter: brightness(1.2); transform: translateY(-1px); }
  .btn-act:active { transform: scale(0.97); }
  .modal-bg { animation: fIn 0.15s ease; }
  .modal-card { animation: sUp 0.2s ease; }
  @keyframes fIn { from{opacity:0} to{opacity:1} }
  @keyframes sUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
  .toast-anim { animation: tIn 0.3s ease; }
  @keyframes tIn { from{transform:translateX(60px);opacity:0} to{transform:translateX(0);opacity:1} }
  .pulse { animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
  .tank-bar { transition: height 0.6s cubic-bezier(.4,0,.2,1); }
  .blink { animation: blink 1s step-end infinite; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
  .sidebar-slide { transition: transform 0.25s cubic-bezier(.4,0,.2,1), opacity 0.25s; }
  .sidebar-overlay { animation: fIn 0.2s ease; }
  .bottom-nav-item { transition: all 0.15s; cursor: pointer; display:flex; flex-direction:column; align-items:center; gap:3px; padding:8px 4px; border-radius:10px; flex:1; }
  .bottom-nav-item:active { transform: scale(0.92); }
`;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const ROLES = { ADMIN: "admin", MANAGER: "manager", SUPERVISOR: "supervisor", USER: "user" };
const PERMS = {
  admin:      { createSounding:true, approveSounding:true, createCargo:true, approveCargo:true, createDistrib:true, approveDistrib:true, viewAll:true, manageUsers:true, closeStock:true, deleteRecord:true },
  manager:    { createSounding:true, approveSounding:true, createCargo:true, approveCargo:true, createDistrib:true, approveDistrib:true, viewAll:true, manageUsers:false, closeStock:true, deleteRecord:true },
  supervisor: { createSounding:true, approveSounding:true, createCargo:true, approveCargo:false, createDistrib:true, approveDistrib:true, viewAll:true, manageUsers:false, closeStock:false, deleteRecord:false },
  user:       { createSounding:true, approveSounding:false, createCargo:true, approveCargo:false, createDistrib:true, approveDistrib:false, viewAll:false, manageUsers:false, closeStock:false, deleteRecord:false },
};

const USERS_DB = [
  { id:1, name:"Takim",   username:"takim",    password:"takim123",    role:"admin",      avatar:"TK", dept:"Management" },
  { id:2, name:"Manager", username:"manager",  password:"manager123",  role:"manager",    avatar:"MG", dept:"Operations" },
  { id:3, name:"Subandi", username:"subandi",  password:"subandi123",  role:"supervisor", avatar:"SB", dept:"Deck" },
  { id:4, name:"Kim",     username:"kim",      password:"kim123",      role:"user",       avatar:"KM", dept:"Crew" },
];

const TANKS_DB = [
  { id:"T1", name:"Tank 1 HSD",      type:"shore", capacity:5000, product:"HSD",
    calibration:[{cm:0,kl:0},{cm:100,kl:500},{cm:200,kl:1000},{cm:300,kl:1500},{cm:400,kl:2000},{cm:500,kl:2500},{cm:600,kl:3000},{cm:700,kl:3500},{cm:800,kl:4000},{cm:900,kl:4500},{cm:1000,kl:5000}] },
  { id:"T2", name:"Tank 2 FAME",     type:"shore", capacity:1000, product:"FAME",
    calibration:[{cm:0,kl:0},{cm:100,kl:100},{cm:200,kl:200},{cm:300,kl:300},{cm:400,kl:400},{cm:500,kl:500},{cm:600,kl:600},{cm:700,kl:700},{cm:800,kl:800},{cm:900,kl:900},{cm:1000,kl:1000}] },
  { id:"T3", name:"Tank 3",          type:"shore", capacity:850,  product:"HSD",
    calibration:[{cm:0,kl:0},{cm:100,kl:94},{cm:200,kl:189},{cm:300,kl:283},{cm:400,kl:378},{cm:500,kl:472},{cm:600,kl:567},{cm:700,kl:661},{cm:800,kl:756},{cm:900,kl:850}] },
  { id:"T4", name:"Tank 4 Biosolar", type:"shore", capacity:110,  product:"Biosolar",
    calibration:[{cm:0,kl:0},{cm:50,kl:15.7},{cm:100,kl:31.4},{cm:150,kl:47.1},{cm:200,kl:62.9},{cm:250,kl:78.6},{cm:300,kl:94.3},{cm:350,kl:110}] },
];

// Dead level thresholds (same for all tanks per work instruction)
const DEAD_LEVEL  = { cm:30, volume:150 };  // warning — dead stock level
const ALERT_LEVEL = { cm:10, volume:54  };  // critical alert level

// ─── CALIBRATION LOOKUP (level cm → volume KL via linear interpolation) ───────
function getVolumeFromLevel(tankId, levelCm) {
  const tank = TANKS_DB.find(t => t.id === tankId);
  if (!tank?.calibration || levelCm === "" || levelCm === null || levelCm === undefined) return null;
  const cm = parseFloat(levelCm);
  if (isNaN(cm) || cm < 0) return null;
  const cal = tank.calibration;
  if (cm <= cal[0].cm) return cal[0].kl;
  if (cm >= cal[cal.length-1].cm) return cal[cal.length-1].kl;
  for (let i = 0; i < cal.length - 1; i++) {
    if (cm >= cal[i].cm && cm <= cal[i+1].cm) {
      const ratio = (cm - cal[i].cm) / (cal[i+1].cm - cal[i].cm);
      return parseFloat((cal[i].kl + ratio * (cal[i+1].kl - cal[i].kl)).toFixed(3));
    }
  }
  return null;
}

const today = () => new Date().toISOString().split("T")[0];
const fmt = n => new Intl.NumberFormat("id-ID",{maximumFractionDigits:2}).format(n);
const fmtTime = () => new Date().toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"});
const fmtDate = d => new Date(d).toLocaleDateString("id-ID",{day:"2-digit",month:"short",year:"numeric"});

function genId(prefix) { return prefix + "_" + Date.now() + "_" + Math.floor(Math.random()*1000); }

// ─── SEED DATA ────────────────────────────────────────────────────────────────
// level is stored in cm (dip from tank bottom); volume auto-calculated from calibration table
const SEED_SOUNDINGS = [
  { id:"S001", tankId:"T1", date:"2026-03-07", session:"morning", time:"07:15", noSounding:false, reason:"", level:331, volume:1655, temp:30, status:"approved_manager", submittedBy:"nikco",  supervisorApproval:"approved", managerApproval:"approved", note:"Opening stock" },
  { id:"S002", tankId:"T2", date:"2026-03-07", session:"morning", time:"07:30", noSounding:false, reason:"", level:925, volume:925,  temp:30, status:"approved_manager", submittedBy:"nota",   supervisorApproval:"approved", managerApproval:"approved", note:"Opening stock" },
  { id:"S003", tankId:"T3", date:"2026-03-07", session:"morning", time:"07:45", noSounding:false, reason:"", level:827, volume:781,  temp:30, status:"approved_manager", submittedBy:"nicko",  supervisorApproval:"approved", managerApproval:"approved", note:"Opening stock" },
  { id:"S004", tankId:"T4", date:"2026-03-07", session:"morning", time:"08:00", noSounding:false, reason:"", level:57,  volume:17.9, temp:31, status:"approved_manager", submittedBy:"nota",   supervisorApproval:"approved", managerApproval:"approved", note:"Opening stock" },
];

// ─── SEED DISTRIBUTIONS ───────────────────────────────────────────────────────
// Distribution OUT = fuel issued to end consumers / vehicles / vessels
const SEED_DISTRIBUTIONS = [
  { id:"D001", tankId:"T4", date:"2026-03-07", time:"09:15", volume:5.0,  recipient:"Koperasi Tani Makmur", vehicleRef:"B 1122 CD", product:"Biosolar B35", status:"approved_manager", submittedBy:"kim", supervisorApproval:"approved", managerApproval:"approved", note:"Subsidi kuota harian" },
];

const SEED_CARGO = [
  { id:"C001", tankId:"T1", type:"in",  date:"2026-03-05", volume:3000, vesselRef:"MT Pertiwi", bL:"BL-2026-001", status:"approved_manager",  submittedBy:"kim",     supervisorApproval:"approved", managerApproval:"approved", note:"Loading HSD from refinery" },
  { id:"C002", tankId:"T2", type:"out", date:"2026-03-05", volume:1500, vesselRef:"MT Merdeka", bL:"BL-2026-002", status:"pending_supervisor", submittedBy:"kim",     supervisorApproval:"pending",  managerApproval:"pending",  note:"FAME discharge to vessel" },
  { id:"C003", tankId:"T1", type:"in",  date:"2026-03-06", volume:800,  vesselRef:"MT Nusantara", bL:"BL-2026-003", status:"approved_supervisor", submittedBy:"subandi", supervisorApproval:"approved", managerApproval:"pending", note:"HSD loading" },
];

// Compute actual stock per tank from seed
const computeStockFromSoundings = () => {
  const stock = {};
  TANKS_DB.forEach(t => {
    const latest = SEED_SOUNDINGS.filter(s => s.tankId === t.id && s.status === "approved_manager")
      .sort((a,b) => b.date.localeCompare(a.date) || (b.session === "afternoon" ? 1 : -1));
    stock[t.id] = latest[0]?.volume || Math.round(t.capacity * 0.6);
  });
  return stock;
};

// ─── BADGE ────────────────────────────────────────────────────────────────────
const STATUS_STYLE = {
  pending_supervisor: { bg:"rgba(251,191,36,0.12)", border:"rgba(251,191,36,0.3)", color:"#fbbf24", label:"Pending Supervisor" },
  approved_supervisor:{ bg:"rgba(96,165,250,0.12)", border:"rgba(96,165,250,0.3)", color:"#60a5fa", label:"Pending Manager" },
  approved_manager:   { bg:"rgba(52,211,153,0.12)", border:"rgba(52,211,153,0.3)", color:"#34d399", label:"Approved" },
  rejected:           { bg:"rgba(239,68,68,0.12)",  border:"rgba(239,68,68,0.3)",  color:"#ef4444", label:"Rejected" },
  closed:             { bg:"rgba(139,92,246,0.12)", border:"rgba(139,92,246,0.3)", color:"#a78bfa", label:"Closed" },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.pending_supervisor;
  return (
    <span style={{ fontSize:10, padding:"3px 8px", borderRadius:4, background:s.bg, border:`1px solid ${s.border}`, color:s.color, fontWeight:700, letterSpacing:0.5 }}>
      {s.label}
    </span>
  );
}

function RoleBadge({ role }) {
  const c = { admin:"#ef4444", manager:"#60a5fa", supervisor:"#a78bfa", user:"#34d399" }[role] || "#fff";
  return (
    <span style={{ fontSize:9, padding:"2px 7px", borderRadius:3, border:`1px solid ${c}40`, color:c, background:`${c}15`, fontWeight:800, letterSpacing:1, textTransform:"uppercase" }}>
      {role}
    </span>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [un, setUn] = useState(""); const [pw, setPw] = useState(""); const [err, setErr] = useState(""); const [loading, setLoading] = useState(false);
  const handle = () => {
    setLoading(true);
    setTimeout(() => {
      const u = USERS_DB.find(x => x.username===un && x.password===pw);
      if(u) onLogin(u); else { setErr("Invalid credentials"); setLoading(false); }
    }, 500);
  };
  return (
    <div style={{ minHeight:"100vh", background:"#050810", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Share Tech Mono', monospace", position:"relative", overflow:"hidden" }}>
      <style>{GLOBAL_CSS}</style>
      {/* Grid bg */}
      <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(0,200,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,255,0.04) 1px, transparent 1px)", backgroundSize:"40px 40px", pointerEvents:"none" }} />
      <div style={{ position:"absolute", top:"20%", left:"50%", transform:"translateX(-50%)", width:600, height:600, background:"radial-gradient(circle, rgba(0,200,255,0.06) 0%, transparent 70%)", pointerEvents:"none" }} />

      <div style={{ width:420, position:"relative" }}>
        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:10, marginBottom:12 }}>
            <div style={{ width:40, height:40, borderRadius:8, background:"rgba(0,200,255,0.1)", border:"1px solid rgba(0,200,255,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>⛽</div>
          </div>
          <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800, fontSize:40, letterSpacing:4, color:"#fff", lineHeight:1 }}>
            DAILY<span style={{ color:"#00c8ff" }}>SOUND</span>
          </div>
          <div style={{ fontSize:10, letterSpacing:3, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", marginTop:6 }}>Oil Inventory & Sounding Control System</div>
        </div>

        <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, padding:32, backdropFilter:"blur(10px)" }}>
          <div style={{ marginBottom:18 }}>
            <label style={{ display:"block", fontSize:10, letterSpacing:2, color:"rgba(0,200,255,0.6)", marginBottom:8, textTransform:"uppercase" }}>Username</label>
            <input value={un} onChange={e=>{setUn(e.target.value);setErr("")}} onKeyDown={e=>e.key==="Enter"&&handle()}
              style={{ width:"100%", background:"rgba(0,200,255,0.05)", border:"1px solid rgba(0,200,255,0.15)", borderRadius:8, padding:"11px 14px", color:"#fff", fontSize:13 }} />
          </div>
          <div style={{ marginBottom:6 }}>
            <label style={{ display:"block", fontSize:10, letterSpacing:2, color:"rgba(0,200,255,0.6)", marginBottom:8, textTransform:"uppercase" }}>Password</label>
            <input type="password" value={pw} onChange={e=>{setPw(e.target.value);setErr("")}} onKeyDown={e=>e.key==="Enter"&&handle()}
              style={{ width:"100%", background:"rgba(0,200,255,0.05)", border:"1px solid rgba(0,200,255,0.15)", borderRadius:8, padding:"11px 14px", color:"#fff", fontSize:13 }} />
          </div>
          {err && <div style={{ color:"#ef4444", fontSize:11, marginBottom:10 }}>{err}</div>}
          <button onClick={handle} disabled={loading} className="btn-act"
            style={{ width:"100%", marginTop:20, background:"linear-gradient(135deg,#0070a8,#00c8ff)", border:"none", borderRadius:8, padding:"13px", color:"#fff", fontSize:12, letterSpacing:2, textTransform:"uppercase", fontWeight:800, cursor:"pointer", fontFamily:"inherit" }}>
            {loading ? "AUTHENTICATING..." : "SIGN IN"}
          </button>
        </div>

        {/* Demo accounts */}
        <div style={{ marginTop:20 }}>
          <div style={{ fontSize:10, letterSpacing:2, color:"rgba(255,255,255,0.2)", textAlign:"center", marginBottom:10, textTransform:"uppercase" }}>Quick Login</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            {USERS_DB.map(u => (
              <div key={u.id} onClick={()=>{setUn(u.username);setPw(u.password);setErr("")}}
                style={{ padding:"10px 12px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:8, cursor:"pointer", transition:"all 0.15s" }}
                onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(0,200,255,0.3)"}
                onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.06)"}>
                <div style={{ fontSize:12, color:"#fff" }}>{u.username}</div>
                <div style={{ marginTop:3 }}><RoleBadge role={u.role} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [soundings, setSoundings] = useState(SEED_SOUNDINGS);
  const [cargo, setCargo] = useState(SEED_CARGO);
  const [distributions, setDistributions] = useState(SEED_DISTRIBUTIONS);
  const [stockLevels, setStockLevels] = useState(computeStockFromSoundings());
  const [closingStock, setClosingStock] = useState({});
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [clock, setClock] = useState(new Date());
  const [filterDate, setFilterDate] = useState(today());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [t3Product, setT3Product] = useState("FAME");
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => { const t = setInterval(()=>setClock(new Date()),1000); return ()=>clearInterval(t); },[]);

  const showToast = (msg, type="ok") => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  const perm = user ? PERMS[user.role] : {};
  const currentSession = clock.getHours() < 13 ? "morning" : "afternoon";
  const sessionTime = clock.getHours() < 13 ? "07:00" : "19:00";

  // ─ helpers ─
  const getTank = id => TANKS_DB.find(t=>t.id===id);
  const getLatestApprovedSounding = (tankId) => {
    return soundings.filter(s=>s.tankId===tankId && s.status==="approved_manager")
      .sort((a,b)=>b.date.localeCompare(a.date)||b.session.localeCompare(a.session))[0];
  };

  // Compute control stock per tank
  const getControlStock = (tankId, date) => {
    const approved = soundings.filter(s=>s.tankId===tankId && s.status==="approved_manager" && s.date===date);
    const morningRec   = approved.find(s=>s.session==="morning");
    const afternoonRec = approved.find(s=>s.session==="afternoon");

    // A record exists but was flagged as noSounding → treat as no reading
    const morningVol   = (morningRec   && !morningRec.noSounding)   ? morningRec.volume   : null;
    const afternoonVol = (afternoonRec && !afternoonRec.noSounding) ? afternoonRec.volume : null;

    const cargoIn  = cargo.filter(c=>c.tankId===tankId && c.date===date && c.type==="in"  && c.status==="approved_manager").reduce((a,c)=>a+c.volume,0);
    const cargoOut = cargo.filter(c=>c.tankId===tankId && c.date===date && c.type==="out" && c.status==="approved_manager").reduce((a,c)=>a+c.volume,0);
    const distOut  = distributions.filter(d=>d.tankId===tankId && d.date===date && d.status==="approved_manager").reduce((a,d)=>a+d.volume,0);

    // Opening = morning sounding of this date (morning is the cutoff / opening snapshot)
    // If no approved morning sounding, fall back to stockLevels (for first-day data)
    const opening = morningVol ?? closingStock[`${tankId}_${date}`] ?? stockLevels[tankId] ?? 0;

    return {
      morning: morningVol, afternoon: afternoonVol,
      morningRec, afternoonRec,
      cargoIn, cargoOut, distOut, opening,
      closing: morningVol ?? closingStock[`${tankId}_${date}`] ?? null,
      noMorningSounding: !morningRec || morningRec.noSounding,
      morningReason: morningRec?.noSounding ? (morningRec.reason || "No reason given") : null,
    };
  };

  // SOUNDING actions
  const submitSounding = (data) => {
    const newS = { id:genId("S"), ...data, status:"pending_supervisor", submittedBy:user.username, supervisorApproval:"pending", managerApproval:"pending" };
    setSoundings(p=>[newS,...p]); setModal(null); showToast("Sounding submitted for approval");
  };

  const approveSounding = (id, level) => {
    setSoundings(p=>p.map(s=>{
      if(s.id!==id) return s;
      if(level==="supervisor") {
        const ns = {...s, supervisorApproval:"approved", status: user.role==="manager"?"approved_manager":"approved_supervisor"};
        if(user.role==="manager") ns.managerApproval="approved";
        return ns;
      }
      if(level==="manager") return {...s, managerApproval:"approved", status:"approved_manager"};
      return s;
    }));
    // update stock levels
    const s = soundings.find(x=>x.id===id);
    if(s) setStockLevels(p=>({...p,[s.tankId]:s.volume}));
    showToast("Sounding approved ✓");
  };

  const rejectSounding = (id) => {
    setSoundings(p=>p.map(s=>s.id===id?{...s,status:"rejected"}:s));
    showToast("Sounding rejected","warn");
  };

  // CARGO actions
  const submitCargo = (data) => {
    const newC = { id:genId("C"), ...data, status:"pending_supervisor", submittedBy:user.username, supervisorApproval:"pending", managerApproval:"pending" };
    setCargo(p=>[newC,...p]); setModal(null); showToast("Cargo activity submitted for approval");
  };

  const approveCargo = (id, level) => {
    setCargo(p=>p.map(c=>{
      if(c.id!==id) return c;
      if(level==="supervisor") {
        const nc = {...c, supervisorApproval:"approved", status: user.role==="manager"?"approved_manager":"approved_supervisor"};
        if(user.role==="manager") nc.managerApproval="approved";
        return nc;
      }
      if(level==="manager") {
        const nc = {...c, managerApproval:"approved", status:"approved_manager"};
        // update stock
        setStockLevels(prev=>{
          const cur = prev[c.tankId]||0;
          return {...prev, [c.tankId]: c.type==="in" ? cur+c.volume : Math.max(0,cur-c.volume)};
        });
        return nc;
      }
      return c;
    }));
    showToast("Cargo approved ✓");
  };

  const rejectCargo = (id) => { setCargo(p=>p.map(c=>c.id===id?{...c,status:"rejected"}:c)); showToast("Cargo rejected","warn"); };

  // DISTRIBUTION actions
  const submitDistribution = (data) => {
    const newD = { id:genId("D"), ...data, status:"pending_supervisor", submittedBy:user.username, supervisorApproval:"pending", managerApproval:"pending" };
    setDistributions(p=>[newD,...p]); setModal(null); showToast("Distribution submitted for approval");
  };

  const approveDistribution = (id, level) => {
    setDistributions(p=>p.map(d=>{
      if(d.id!==id) return d;
      if(level==="supervisor") {
        const nd = {...d, supervisorApproval:"approved", status: user.role==="manager"?"approved_manager":"approved_supervisor"};
        if(user.role==="manager") nd.managerApproval="approved";
        return nd;
      }
      if(level==="manager") return {...d, managerApproval:"approved", status:"approved_manager"};
      return d;
    }));
    showToast("Distribution approved ✓");
  };

  const rejectDistribution = (id) => { setDistributions(p=>p.map(d=>d.id===id?{...d,status:"rejected"}:d)); showToast("Distribution rejected","warn"); };

  // DELETE actions (admin / manager only)
  const deleteSounding     = (id) => { setSoundings(p=>p.filter(s=>s.id!==id)); showToast("Sounding record deleted","warn"); };
  const deleteCargo        = (id) => { setCargo(p=>p.filter(c=>c.id!==id)); showToast("Cargo record deleted","warn"); };
  const deleteDistribution = (id) => { setDistributions(p=>p.filter(d=>d.id!==id)); showToast("Distribution record deleted","warn"); };

  // CLOSING STOCK
  const closeStockForDay = (tankId, date) => {
    const ctrl = getControlStock(tankId, date);
    const closing = ctrl.afternoon || ctrl.morning || stockLevels[tankId];
    setClosingStock(p=>({...p,[`${tankId}_${date}`]:closing}));
    showToast(`Closing stock set for ${getTank(tankId)?.name}`);
  };

  if(!user) return <Login onLogin={setUser} />;

  const isAwaitingMe = (item) =>
    (user.role==="supervisor"&&item.status==="pending_supervisor") ||
    (user.role==="manager"&&(item.status==="approved_supervisor"||item.status==="pending_supervisor")) ||
    (user.role==="admin"&&(item.status==="pending_supervisor"||item.status==="approved_supervisor"));

  const pendingCount = soundings.filter(isAwaitingMe).length
    + cargo.filter(isAwaitingMe).length
    + distributions.filter(isAwaitingMe).length;

  // ─── RENDER ─────────────────────────────────────────────────────────────────
  const navItems = [
    { id:"dashboard", icon:"◈", label:"Dashboard" },
    { id:"sounding",  icon:"▾", label:"Sounding" },
    { id:"cargo",     icon:"⇄", label:"Cargo" },
    { id:"distrib",   icon:"▲", label:"Distribution" },
    { id:"stock",     icon:"▦", label:"Stock" },
    { id:"approval",  icon:"✓", label:"Approvals", badge: pendingCount },
    { id:"blend",     icon:"⚗", label:"Blending" },
    ...(perm.viewAll ? [{ id:"report", icon:"◉", label:"Reports" }] : []),
    ...(perm.manageUsers ? [{ id:"users", icon:"⊕", label:"Users" }] : []),
  ];

  const handleTabChange = (id) => { setTab(id); setSidebarOpen(false); };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{ marginBottom:28 }}>
        <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:26, letterSpacing:3, lineHeight:1 }}>
          DAILY<span style={{ color:"#00c8ff" }}>SOUND</span>
        </div>
        <div style={{ fontSize:9, letterSpacing:2, color:"rgba(0,200,255,0.4)", textTransform:"uppercase", marginTop:2 }}>Stock Control System</div>
      </div>

      {/* Clock & Session */}
      <div style={{ background:"rgba(0,200,255,0.05)", border:"1px solid rgba(0,200,255,0.12)", borderRadius:10, padding:"12px 14px", marginBottom:20 }}>
        <div style={{ fontSize:22, fontWeight:700, color:"#00c8ff", letterSpacing:2 }}>
          {clock.toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}
        </div>
        <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", marginTop:2 }}>
          {clock.toLocaleDateString("id-ID",{weekday:"short",day:"2-digit",month:"short",year:"numeric"})}
        </div>
        <div style={{ marginTop:8, display:"flex", alignItems:"center", gap:6 }}>
          <span className="pulse" style={{ width:6, height:6, borderRadius:"50%", background: currentSession==="morning"?"#fbbf24":"#60a5fa", display:"inline-block" }} />
          <span style={{ fontSize:10, color:"rgba(255,255,255,0.5)", textTransform:"uppercase", letterSpacing:1 }}>
            {currentSession==="morning"?"Morning":"Afternoon"} · {sessionTime}
          </span>
