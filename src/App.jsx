import { useState, useEffect } from "react";

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
  admin:      { createSounding:true, approveSounding:true, createCargo:true, approveCargo:true, viewAll:true, manageUsers:true, closeStock:true },
  manager:    { createSounding:true, approveSounding:true, createCargo:true, approveCargo:true, viewAll:true, manageUsers:false, closeStock:true },
  supervisor: { createSounding:true, approveSounding:true, createCargo:true, approveCargo:false, viewAll:true, manageUsers:false, closeStock:false },
  user:       { createSounding:true, approveSounding:false, createCargo:true, approveCargo:false, viewAll:false, manageUsers:false, closeStock:false },
};

const USERS_DB = [
  { id:1, name:"Rahmat Hidayat",  username:"admin",      password:"admin123",      role:"admin",      avatar:"RH", dept:"Management" },
  { id:2, name:"Sari Budiarto",   username:"manager",    password:"manager123",    role:"manager",    avatar:"SB", dept:"Operations" },
  { id:3, name:"Eko Priyanto",    username:"supervisor", password:"supervisor123", role:"supervisor", avatar:"EP", dept:"Deck" },
  { id:4, name:"Wulan Sari",      username:"user",       password:"user123",       role:"user",       avatar:"WS", dept:"Crew" },
];

const TANKS_DB = [
  { id:"T1", name:"No.1 Center",    type:"ship",     capacity:3500, product:"HFO 380" },
  { id:"T2", name:"No.2 Port",      type:"ship",     capacity:2800, product:"HFO 380" },
  { id:"T3", name:"No.3 Stbd",      type:"ship",     capacity:2800, product:"MGO" },
  { id:"T4", name:"Shore Tank A",   type:"shore",    capacity:10000,product:"HFO 380" },
  { id:"T5", name:"Shore Tank B",   type:"shore",    capacity:8000, product:"MGO" },
  { id:"T6", name:"Depot Tank 1",   type:"depot",    capacity:5000, product:"Avtur" },
];

const today = () => new Date().toISOString().split("T")[0];
const fmt = n => new Intl.NumberFormat("id-ID",{maximumFractionDigits:2}).format(n);
const fmtTime = () => new Date().toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"});
const fmtDate = d => new Date(d).toLocaleDateString("id-ID",{day:"2-digit",month:"short",year:"numeric"});

function genId(prefix) { return prefix + "_" + Date.now() + "_" + Math.floor(Math.random()*1000); }

// ─── SEED DATA ────────────────────────────────────────────────────────────────
const SEED_SOUNDINGS = [
  { id:"S001", tankId:"T1", date:"2026-03-05", session:"morning", level:4.25, volume:2980, temp:42.5, density:0.985, status:"approved_manager", submittedBy:"user", supervisorApproval:"approved", managerApproval:"approved", note:"Normal reading" },
  { id:"S002", tankId:"T1", date:"2026-03-05", session:"afternoon", level:3.92, volume:2740, temp:44.1, density:0.986, status:"approved_manager", submittedBy:"user", supervisorApproval:"approved", managerApproval:"approved", note:"" },
  { id:"S003", tankId:"T2", date:"2026-03-05", session:"morning", level:3.10, volume:1850, temp:41.0, density:0.984, status:"pending_supervisor", submittedBy:"user", supervisorApproval:"pending", managerApproval:"pending", note:"" },
  { id:"S004", tankId:"T4", date:"2026-03-06", session:"morning", level:8.50, volume:7200, temp:38.5, density:0.987, status:"pending_supervisor", submittedBy:"user", supervisorApproval:"pending", managerApproval:"pending", note:"" },
  { id:"S005", tankId:"T3", date:"2026-03-06", session:"morning", level:2.80, volume:1960, temp:35.2, density:0.832, status:"approved_supervisor", submittedBy:"user", supervisorApproval:"approved", managerApproval:"pending", note:"" },
];

const SEED_CARGO = [
  { id:"C001", tankId:"T4", type:"in",  date:"2026-03-05", volume:3000, vesselRef:"MT Pertiwi", bL:"BL-2026-001", status:"approved_manager", submittedBy:"user", supervisorApproval:"approved", managerApproval:"approved", note:"Loading from refinery" },
  { id:"C002", tankId:"T5", type:"out", date:"2026-03-05", volume:1500, vesselRef:"MT Merdeka", bL:"BL-2026-002", status:"pending_supervisor", submittedBy:"user", supervisorApproval:"pending", managerApproval:"pending", note:"Discharge to vessel" },
  { id:"C003", tankId:"T1", type:"in",  date:"2026-03-06", volume:800,  vesselRef:"Bunkering",  bL:"BL-2026-003", status:"approved_supervisor", submittedBy:"supervisor", supervisorApproval:"approved", managerApproval:"pending", note:"Bunker loading" },
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
  const [stockLevels, setStockLevels] = useState(computeStockFromSoundings());
  const [closingStock, setClosingStock] = useState({});
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [clock, setClock] = useState(new Date());
  const [filterDate, setFilterDate] = useState(today());
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    const morning = approved.find(s=>s.session==="morning");
    const afternoon = approved.find(s=>s.session==="afternoon");
    const cargoIn = cargo.filter(c=>c.tankId===tankId && c.date===date && c.type==="in" && c.status==="approved_manager").reduce((a,c)=>a+c.volume,0);
    const cargoOut = cargo.filter(c=>c.tankId===tankId && c.date===date && c.type==="out" && c.status==="approved_manager").reduce((a,c)=>a+c.volume,0);
    return { morning: morning?.volume||null, afternoon: afternoon?.volume||null, cargoIn, cargoOut,
      closing: closingStock[`${tankId}_${date}`] || morning?.volume || null };
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

  // CLOSING STOCK
  const closeStockForDay = (tankId, date) => {
    const ctrl = getControlStock(tankId, date);
    const closing = ctrl.afternoon || ctrl.morning || stockLevels[tankId];
    setClosingStock(p=>({...p,[`${tankId}_${date}`]:closing}));
    showToast(`Closing stock set for ${getTank(tankId)?.name}`);
  };

  if(!user) return <Login onLogin={setUser} />;

  const pendingCount = soundings.filter(s=>
    (user.role==="supervisor"&&s.status==="pending_supervisor") ||
    (user.role==="manager"&&s.status==="approved_supervisor") ||
    (user.role==="admin"&&(s.status==="pending_supervisor"||s.status==="approved_supervisor"))
  ).length + cargo.filter(c=>
    (user.role==="supervisor"&&c.status==="pending_supervisor") ||
    (user.role==="manager"&&c.status==="approved_supervisor") ||
    (user.role==="admin"&&(c.status==="pending_supervisor"||c.status==="approved_supervisor"))
  ).length;

  // ─── RENDER ─────────────────────────────────────────────────────────────────
  const navItems = [
    { id:"dashboard", icon:"◈", label:"Dashboard" },
    { id:"sounding",  icon:"▾", label:"Sounding" },
    { id:"cargo",     icon:"⇄", label:"Cargo" },
    { id:"stock",     icon:"▦", label:"Stock" },
    { id:"approval",  icon:"✓", label:"Approvals", badge: pendingCount },
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
        </div>
      </div>

      {/* User */}
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", background:"rgba(255,255,255,0.03)", borderRadius:10, marginBottom:20 }}>
        <div style={{ width:34, height:34, borderRadius:"50%", background:"linear-gradient(135deg,#0070a8,#00c8ff)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, flexShrink:0 }}>
          {user.avatar}
        </div>
        <div>
          <div style={{ fontSize:12, fontWeight:600, color:"#fff" }}>{user.name}</div>
          <RoleBadge role={user.role} />
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex:1 }}>
        {navItems.map(item=>(
          <div key={item.id}
            className={`nav-btn ${tab===item.id?"active":""}`}
            onClick={()=>handleTabChange(item.id)}
            style={{ padding:"9px 12px", marginBottom:3, display:"flex", alignItems:"center", gap:10, fontSize:12, color: tab===item.id?"#00c8ff":"rgba(255,255,255,0.45)", borderLeft:"2px solid transparent", borderRadius:8 }}>
            <span style={{ fontSize:14 }}>{item.icon}</span>
            <span style={{ flex:1 }}>{item.label}</span>
            {item.badge>0 && <span style={{ background:"#ef4444", color:"#fff", fontSize:10, fontWeight:800, padding:"1px 6px", borderRadius:10 }}>{item.badge}</span>}
          </div>
        ))}
      </nav>

      <button className="btn-act" onClick={()=>setUser(null)}
        style={{ border:"1px solid rgba(0,200,255,0.2)", borderRadius:8, padding:"9px", color:"rgba(0,200,255,0.6)", fontSize:11, background:"transparent", cursor:"pointer", fontFamily:"inherit", letterSpacing:1 }}>
        SIGN OUT
      </button>
    </>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#050810", color:"#e2e8f0", fontFamily:"'Share Tech Mono', monospace", display:"flex", flexDirection:"column" }}>
      <style>{GLOBAL_CSS}</style>

      <div style={{ display:"flex", flex:1, position:"relative" }}>

        {/* ── DESKTOP SIDEBAR ── */}
        {!isMobile && (
          <div style={{ width:230, background:"rgba(0,0,0,0.4)", borderRight:"1px solid rgba(0,200,255,0.08)", padding:"24px 14px", display:"flex", flexDirection:"column", flexShrink:0, backdropFilter:"blur(10px)" }}>
            <SidebarContent />
          </div>
        )}

        {/* ── MOBILE OVERLAY SIDEBAR ── */}
        {isMobile && sidebarOpen && (
          <>
            {/* Backdrop */}
            <div className="sidebar-overlay" onClick={()=>setSidebarOpen(false)}
              style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:200, backdropFilter:"blur(4px)" }} />
            {/* Drawer */}
            <div className="sidebar-slide"
              style={{ position:"fixed", top:0, left:0, bottom:0, width:260, background:"#080d1a", borderRight:"1px solid rgba(0,200,255,0.15)", padding:"24px 16px", display:"flex", flexDirection:"column", zIndex:201, overflowY:"auto" }}>
              {/* Close btn */}
              <button onClick={()=>setSidebarOpen(false)}
                style={{ position:"absolute", top:16, right:16, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"50%", width:32, height:32, color:"rgba(255,255,255,0.6)", fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                ✕
              </button>
              <SidebarContent />
            </div>
          </>
        )}

        {/* ── MAIN CONTENT ── */}
        <div style={{ flex:1, overflow:"auto", padding: isMobile ? "16px 16px 80px" : "28px 32px" }}>

          {/* Mobile top bar */}
          {isMobile && (
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, padding:"10px 14px", background:"rgba(0,0,0,0.4)", borderRadius:12, border:"1px solid rgba(0,200,255,0.08)" }}>
              <div>
                <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:20, letterSpacing:3 }}>
                  DAILY<span style={{ color:"#00c8ff" }}>SOUND</span>
                </div>
                <div style={{ fontSize:9, color:"rgba(0,200,255,0.4)", letterSpacing:2 }}>
                  {clock.toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"})} ·{" "}
                  <span className="pulse" style={{ display:"inline-block", width:5, height:5, borderRadius:"50%", background: currentSession==="morning"?"#fbbf24":"#60a5fa", verticalAlign:"middle", marginRight:3 }} />
                  {currentSession==="morning"?"Morning":"Afternoon"}
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                {pendingCount > 0 && (
                  <div style={{ background:"#ef4444", color:"#fff", fontSize:10, fontWeight:800, padding:"2px 7px", borderRadius:10 }}>{pendingCount}</div>
                )}
                <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#0070a8,#00c8ff)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800 }}>
                  {user.avatar}
                </div>
                <button onClick={()=>setSidebarOpen(true)}
                  style={{ background:"rgba(0,200,255,0.08)", border:"1px solid rgba(0,200,255,0.2)", borderRadius:8, width:36, height:36, color:"#00c8ff", fontSize:18, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  ☰
                </button>
              </div>
            </div>
          )}

          {tab==="dashboard" && <DashboardTab tanks={TANKS_DB} soundings={soundings} cargo={cargo} stockLevels={stockLevels} getControlStock={getControlStock} filterDate={filterDate} setFilterDate={setFilterDate} pendingCount={pendingCount} isMobile={isMobile} />}
          {tab==="sounding" && <SoundingTab user={user} perm={perm} soundings={soundings} filterDate={filterDate} setFilterDate={setFilterDate} onNew={()=>setModal({type:"sounding"})} onApprove={approveSounding} onReject={rejectSounding} currentSession={currentSession} isMobile={isMobile} />}
          {tab==="cargo" && <CargoTab user={user} perm={perm} cargo={cargo} filterDate={filterDate} setFilterDate={setFilterDate} onNew={()=>setModal({type:"cargo"})} onApprove={approveCargo} onReject={rejectCargo} isMobile={isMobile} />}
          {tab==="stock" && <StockControlTab tanks={TANKS_DB} soundings={soundings} cargo={cargo} stockLevels={stockLevels} getControlStock={getControlStock} filterDate={filterDate} setFilterDate={setFilterDate} perm={perm} onClose={closeStockForDay} closingStock={closingStock} isMobile={isMobile} />}
          {tab==="approval" && <ApprovalTab user={user} perm={perm} soundings={soundings} cargo={cargo} onApproveSounding={approveSounding} onRejectSounding={rejectSounding} onApproveCargo={approveCargo} onRejectCargo={rejectCargo} isMobile={isMobile} />}
          {tab==="report" && perm.viewAll && <ReportTab tanks={TANKS_DB} soundings={soundings} cargo={cargo} stockLevels={stockLevels} isMobile={isMobile} />}
          {tab==="users" && perm.manageUsers && <UsersTab />}
        </div>
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      {isMobile && (
        <div style={{ position:"fixed", bottom:0, left:0, right:0, background:"rgba(5,8,16,0.97)", borderTop:"1px solid rgba(0,200,255,0.12)", padding:"6px 8px 10px", display:"flex", zIndex:150, backdropFilter:"blur(16px)" }}>
          {navItems.slice(0,5).map(item=>(
            <div key={item.id}
              className="bottom-nav-item"
              onClick={()=>handleTabChange(item.id)}
              style={{ background: tab===item.id?"rgba(0,200,255,0.1)":"transparent", color: tab===item.id?"#00c8ff":"rgba(255,255,255,0.35)", position:"relative" }}>
              <span style={{ fontSize:18, lineHeight:1 }}>{item.icon}</span>
              <span style={{ fontSize:9, letterSpacing:0.5, textTransform:"uppercase" }}>{item.label}</span>
              {item.badge>0 && (
                <span style={{ position:"absolute", top:4, right:"50%", transform:"translateX(10px)", background:"#ef4444", color:"#fff", fontSize:8, fontWeight:800, padding:"1px 4px", borderRadius:8, minWidth:14, textAlign:"center" }}>
                  {item.badge}
                </span>
              )}
            </div>
          ))}
          {/* More button for extra tabs */}
          {navItems.length > 5 && (
            <div className="bottom-nav-item" onClick={()=>setSidebarOpen(true)}
              style={{ color:"rgba(255,255,255,0.35)" }}>
              <span style={{ fontSize:18 }}>⋯</span>
              <span style={{ fontSize:9, letterSpacing:0.5, textTransform:"uppercase" }}>More</span>
            </div>
          )}
        </div>
      )}

      {/* ── MODALS ── */}
      {modal && (
        <div className="modal-bg" onClick={()=>setModal(null)}
          style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:300 }}>
          <div className="modal-card" onClick={e=>e.stopPropagation()}
            style={{ background:"#0a0f1e", border:"1px solid rgba(0,200,255,0.15)", borderRadius:16, padding: isMobile ? 20 : 32, width:"94%", maxWidth:520, maxHeight:"92vh", overflowY:"auto" }}>
            {modal.type==="sounding" && <SoundingForm user={user} onSubmit={submitSounding} onCancel={()=>setModal(null)} currentSession={currentSession} />}
            {modal.type==="cargo"    && <CargoForm    user={user} onSubmit={submitCargo}    onCancel={()=>setModal(null)} />}
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      {toast && (
        <div className="toast-anim" style={{ position:"fixed", bottom: isMobile ? 80 : 24, right:16, background: toast.type==="warn"?"#f59e0b":toast.type==="err"?"#ef4444":"#00c8ff", color:"#000", padding:"12px 20px", borderRadius:10, fontSize:12, fontWeight:800, zIndex:400, letterSpacing:0.5 }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
      )}
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function DashboardTab({ tanks, soundings, cargo, stockLevels, getControlStock, filterDate, setFilterDate, pendingCount, isMobile }) {
  const totalValue = tanks.reduce((a,t)=>{
    const vol = stockLevels[t.id]||0;
    return a + vol;
  },0);

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:28 }}>
        <div>
          <div style={{ fontSize:10, letterSpacing:3, color:"rgba(0,200,255,0.5)", textTransform:"uppercase", marginBottom:4 }}>Overview</div>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:38, letterSpacing:3, color:"#fff" }}>DASHBOARD</div>
        </div>
        <input type="date" value={filterDate} onChange={e=>setFilterDate(e.target.value)}
          style={{ background:"rgba(0,200,255,0.05)", border:"1px solid rgba(0,200,255,0.2)", borderRadius:8, padding:"8px 12px", color:"#00c8ff", fontSize:12 }} />
      </div>

      {/* Stats row */}
      <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap:16, marginBottom:28 }}>
        {[
          { label:"Total Tanks",      val:tanks.length,    sub:"active tanks",         color:"#00c8ff" },
          { label:"Total Volume",     val:fmt(totalValue)+" KL", sub:"combined stock", color:"#34d399" },
          { label:"Pending Approvals",val:pendingCount,    sub:"awaiting review",       color:"#fbbf24" },
          { label:"Today's Soundings",val:soundings.filter(s=>s.date===filterDate).length, sub:"entries recorded", color:"#a78bfa" },
        ].map(c=>(
          <div key={c.label} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:"18px 20px" }}>
            <div style={{ fontSize:9, letterSpacing:2, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", marginBottom:6 }}>{c.label}</div>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:30, color:c.color, letterSpacing:1 }}>{c.val}</div>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", marginTop:2 }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Tank Visual Overview */}
      <div style={{ marginBottom:28 }}>
        <div style={{ fontSize:10, letterSpacing:2, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", marginBottom:14 }}>Tank Status — {fmtDate(filterDate)}</div>
        <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3,1fr)", gap:12 }}>
          {tanks.map(tank=>{
            const ctrl = getControlStock(tank.id, filterDate);
            const cur = stockLevels[tank.id] || ctrl.morning || 0;
            const pct = Math.min(100, Math.round((cur/tank.capacity)*100));
            const barColor = pct > 70 ? "#34d399" : pct > 30 ? "#00c8ff" : pct > 10 ? "#fbbf24" : "#ef4444";
            const typeIcon = { ship:"🚢", shore:"🏭", depot:"⛽" }[tank.type] || "▦";
            return (
              <div key={tank.id} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:"16px 18px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                  <div>
                    <div style={{ fontSize:11, fontWeight:600, color:"#fff" }}>{typeIcon} {tank.name}</div>
                    <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)", marginTop:2 }}>{tank.product}</div>
                  </div>
                  <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", textAlign:"right" }}>
                    <div>{fmt(cur)} KL</div>
                    <div>/ {fmt(tank.capacity)} KL</div>
                  </div>
                </div>
                {/* Bar */}
                <div style={{ height:6, background:"rgba(255,255,255,0.06)", borderRadius:3, overflow:"hidden" }}>
                  <div className="tank-bar" style={{ height:"100%", width:`${pct}%`, background:barColor, borderRadius:3 }} />
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:6, fontSize:10 }}>
                  <span style={{ color:barColor }}>{pct}% full</span>
                  {ctrl.morning!==null && <span style={{ color:"rgba(255,255,255,0.3)" }}>M:{fmt(ctrl.morning)}</span>}
                  {ctrl.afternoon!==null && <span style={{ color:"rgba(255,255,255,0.3)" }}>A:{fmt(ctrl.afternoon)}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent activity */}
      <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:16 }}>
        <div>
          <div style={{ fontSize:10, letterSpacing:2, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", marginBottom:12 }}>Recent Soundings</div>
          <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:10, overflow:"hidden" }}>
            {soundings.slice(0,4).map((s,i)=>{
              const t = TANKS_DB.find(x=>x.id===s.tankId);
              return (
                <div key={s.id} className="row" style={{ padding:"11px 16px", borderBottom: i<3?"1px solid rgba(255,255,255,0.04)":"none", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <div style={{ fontSize:11, color:"#fff" }}>{t?.name}</div>
                    <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)" }}>{s.date} · {s.session}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:11, color:"#00c8ff" }}>{fmt(s.volume)} KL</div>
                    <StatusBadge status={s.status} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <div style={{ fontSize:10, letterSpacing:2, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", marginBottom:12 }}>Recent Cargo</div>
          <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:10, overflow:"hidden" }}>
            {cargo.slice(0,4).map((c,i)=>{
              const t = TANKS_DB.find(x=>x.id===c.tankId);
              return (
                <div key={c.id} className="row" style={{ padding:"11px 16px", borderBottom: i<3?"1px solid rgba(255,255,255,0.04)":"none", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <div style={{ fontSize:11, color:"#fff" }}>{t?.name}</div>
                    <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)" }}>{c.date} · {c.vesselRef}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:11, color: c.type==="in"?"#34d399":"#f87171" }}>{c.type==="in"?"+":"-"}{fmt(c.volume)} KL</div>
                    <StatusBadge status={c.status} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SOUNDING TAB ─────────────────────────────────────────────────────────────
function SoundingTab({ user, perm, soundings, filterDate, setFilterDate, onNew, onApprove, onReject, currentSession }) {
  const filtered = soundings.filter(s => !filterDate || s.date === filterDate);
  const canApprove = (s) => {
    if(user.role==="supervisor" && s.status==="pending_supervisor") return true;
    if(user.role==="manager" && (s.status==="approved_supervisor"||s.status==="pending_supervisor")) return true;
    if(user.role==="admin") return s.status!=="approved_manager"&&s.status!=="rejected";
    return false;
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:24 }}>
        <div>
          <div style={{ fontSize:10, letterSpacing:3, color:"rgba(0,200,255,0.5)", textTransform:"uppercase", marginBottom:4 }}>07:00 · 19:00</div>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:38, letterSpacing:3 }}>DAILY SOUNDING</div>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <input type="date" value={filterDate} onChange={e=>setFilterDate(e.target.value)}
            style={{ background:"rgba(0,200,255,0.05)", border:"1px solid rgba(0,200,255,0.2)", borderRadius:8, padding:"8px 12px", color:"#00c8ff", fontSize:12 }} />
          {perm.createSounding && (
            <button className="btn-act" onClick={onNew}
              style={{ background:"linear-gradient(135deg,#0070a8,#00c8ff)", border:"none", borderRadius:8, padding:"9px 18px", color:"#fff", fontSize:11, letterSpacing:1, fontWeight:800, cursor:"pointer", fontFamily:"inherit" }}>
              + NEW SOUNDING
            </button>
          )}
        </div>
      </div>

      {/* Session indicator */}
      <div style={{ display:"flex", gap:12, marginBottom:20 }}>
        {["morning","afternoon"].map(ses=>(
          <div key={ses} style={{ padding:"10px 18px", borderRadius:10, background: currentSession===ses?"rgba(0,200,255,0.1)":"rgba(255,255,255,0.03)", border:`1px solid ${currentSession===ses?"rgba(0,200,255,0.3)":"rgba(255,255,255,0.07)"}`, display:"flex", alignItems:"center", gap:8 }}>
            {currentSession===ses && <span className="pulse" style={{ width:6,height:6,borderRadius:"50%",background:"#00c8ff",display:"inline-block" }} />}
            <span style={{ fontSize:11, color: currentSession===ses?"#00c8ff":"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:1 }}>
              {ses==="morning"?"Morning — 07:00":"Afternoon — 19:00"}
            </span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, overflow:"hidden" }}>
        <div style={{ display:"grid", gridTemplateColumns:"80px 1fr 90px 80px 80px 80px 80px 1fr 130px", padding:"10px 16px", borderBottom:"1px solid rgba(255,255,255,0.07)", fontSize:9, letterSpacing:1.5, color:"rgba(0,200,255,0.5)", textTransform:"uppercase" }}>
          <div>ID</div><div>Tank</div><div>Session</div><div>Level(m)</div><div>Vol(KL)</div><div>Temp(°C)</div><div>Density</div><div>Status</div><div>Actions</div>
        </div>
        {filtered.length===0 && <div style={{ padding:"36px", textAlign:"center", color:"rgba(255,255,255,0.2)", fontSize:12 }}>No sounding records for this date</div>}
        {filtered.map((s,i)=>{
          const tank = TANKS_DB.find(t=>t.id===s.tankId);
          return (
            <div key={s.id} className="row" style={{ display:"grid", gridTemplateColumns:"80px 1fr 90px 80px 80px 80px 80px 1fr 130px", padding:"12px 16px", borderBottom: i<filtered.length-1?"1px solid rgba(255,255,255,0.04)":"none", alignItems:"center", fontSize:12 }}>
              <div style={{ color:"rgba(255,255,255,0.3)", fontSize:10 }}>{s.id}</div>
              <div>
                <div style={{ color:"#fff" }}>{tank?.name}</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)" }}>{s.date}</div>
              </div>
              <div style={{ color: s.session==="morning"?"#fbbf24":"#60a5fa", fontSize:10, textTransform:"uppercase", letterSpacing:1 }}>{s.session}</div>
              <div style={{ color:"#00c8ff" }}>{s.level}</div>
              <div style={{ fontWeight:600 }}>{fmt(s.volume)}</div>
              <div style={{ color:"rgba(255,255,255,0.5)" }}>{s.temp}</div>
              <div style={{ color:"rgba(255,255,255,0.5)" }}>{s.density}</div>
              <div><StatusBadge status={s.status} /></div>
              <div style={{ display:"flex", gap:6 }}>
                {canApprove(s) && (
                  <>
                    <button className="btn-act" onClick={()=>onApprove(s.id, user.role==="supervisor"?"supervisor":"manager")}
                      style={{ padding:"4px 10px", background:"rgba(52,211,153,0.15)", border:"1px solid rgba(52,211,153,0.3)", borderRadius:5, color:"#34d399", fontSize:10, cursor:"pointer", fontFamily:"inherit" }}>✓ Approve</button>
                    <button className="btn-act" onClick={()=>onReject(s.id)}
                      style={{ padding:"4px 8px", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:5, color:"#ef4444", fontSize:10, cursor:"pointer", fontFamily:"inherit" }}>✗</button>
                  </>
                )}
                {s.status==="approved_manager" && <span style={{ fontSize:10, color:"#34d399" }}>✓ Final</span>}
                {s.status==="rejected" && <span style={{ fontSize:10, color:"#ef4444" }}>Rejected</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── CARGO TAB ────────────────────────────────────────────────────────────────
function CargoTab({ user, perm, cargo, filterDate, setFilterDate, onNew, onApprove, onReject }) {
  const filtered = cargo.filter(c=> !filterDate || c.date===filterDate);
  const canApprove = (c) => {
    if(user.role==="supervisor" && c.status==="pending_supervisor") return true;
    if(user.role==="manager" && (c.status==="approved_supervisor"||c.status==="pending_supervisor")) return true;
    if(user.role==="admin") return c.status!=="approved_manager"&&c.status!=="rejected";
    return false;
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:24 }}>
        <div>
          <div style={{ fontSize:10, letterSpacing:3, color:"rgba(0,200,255,0.5)", textTransform:"uppercase", marginBottom:4 }}>Cargo Operations</div>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:38, letterSpacing:3 }}>CARGO IN / OUT</div>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <input type="date" value={filterDate} onChange={e=>setFilterDate(e.target.value)}
            style={{ background:"rgba(0,200,255,0.05)", border:"1px solid rgba(0,200,255,0.2)", borderRadius:8, padding:"8px 12px", color:"#00c8ff", fontSize:12 }} />
          {perm.createCargo && (
            <button className="btn-act" onClick={onNew}
              style={{ background:"linear-gradient(135deg,#1a6b00,#34d399)", border:"none", borderRadius:8, padding:"9px 18px", color:"#fff", fontSize:11, letterSpacing:1, fontWeight:800, cursor:"pointer", fontFamily:"inherit" }}>
              + NEW CARGO
            </button>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:24 }}>
        {["in","out"].map(type=>{
          const rows = filtered.filter(c=>c.type===type && c.status==="approved_manager");
          const total = rows.reduce((a,c)=>a+c.volume,0);
          return (
            <div key={type} style={{ background: type==="in"?"rgba(52,211,153,0.06)":"rgba(239,68,68,0.06)", border:`1px solid ${type==="in"?"rgba(52,211,153,0.2)":"rgba(239,68,68,0.2)"}`, borderRadius:12, padding:"16px 20px" }}>
              <div style={{ fontSize:10, letterSpacing:2, color: type==="in"?"#34d399":"#f87171", textTransform:"uppercase", marginBottom:6 }}>
                {type==="in"?"▼ CARGO IN":"▲ CARGO OUT"}
              </div>
              <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:28, color: type==="in"?"#34d399":"#f87171" }}>
                {fmt(total)} KL
              </div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", marginTop:2 }}>{rows.length} approved transactions</div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, overflow:"hidden" }}>
        <div style={{ display:"grid", gridTemplateColumns:"80px 1fr 70px 90px 1fr 80px 1fr 130px", padding:"10px 16px", borderBottom:"1px solid rgba(255,255,255,0.07)", fontSize:9, letterSpacing:1.5, color:"rgba(0,200,255,0.5)", textTransform:"uppercase" }}>
          <div>ID</div><div>Tank</div><div>Type</div><div>Vol(KL)</div><div>Vessel/Ref</div><div>B/L</div><div>Status</div><div>Actions</div>
        </div>
        {filtered.length===0 && <div style={{ padding:"36px", textAlign:"center", color:"rgba(255,255,255,0.2)", fontSize:12 }}>No cargo records for this date</div>}
        {filtered.map((c,i)=>{
          const tank = TANKS_DB.find(t=>t.id===c.tankId);
          return (
            <div key={c.id} className="row" style={{ display:"grid", gridTemplateColumns:"80px 1fr 70px 90px 1fr 80px 1fr 130px", padding:"12px 16px", borderBottom: i<filtered.length-1?"1px solid rgba(255,255,255,0.04)":"none", alignItems:"center", fontSize:12 }}>
              <div style={{ color:"rgba(255,255,255,0.3)", fontSize:10 }}>{c.id}</div>
              <div>
                <div style={{ color:"#fff" }}>{tank?.name}</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)" }}>{c.date}</div>
              </div>
              <div>
                <span style={{ fontSize:10, fontWeight:800, padding:"2px 8px", borderRadius:4, background: c.type==="in"?"rgba(52,211,153,0.12)":"rgba(239,68,68,0.12)", color: c.type==="in"?"#34d399":"#f87171", border:`1px solid ${c.type==="in"?"rgba(52,211,153,0.3)":"rgba(239,68,68,0.3)"}` }}>
                  {c.type.toUpperCase()}
                </span>
              </div>
              <div style={{ fontWeight:700, color: c.type==="in"?"#34d399":"#f87171" }}>
                {c.type==="in"?"+":"-"}{fmt(c.volume)}
              </div>
              <div style={{ color:"rgba(255,255,255,0.6)", fontSize:11 }}>{c.vesselRef}</div>
              <div style={{ color:"rgba(255,255,255,0.4)", fontSize:10 }}>{c.bL}</div>
              <div><StatusBadge status={c.status} /></div>
              <div style={{ display:"flex", gap:6 }}>
                {canApprove(c) && (
                  <>
                    <button className="btn-act" onClick={()=>onApprove(c.id, user.role==="supervisor"?"supervisor":"manager")}
                      style={{ padding:"4px 10px", background:"rgba(52,211,153,0.15)", border:"1px solid rgba(52,211,153,0.3)", borderRadius:5, color:"#34d399", fontSize:10, cursor:"pointer", fontFamily:"inherit" }}>✓ Approve</button>
                    <button className="btn-act" onClick={()=>onReject(c.id)}
                      style={{ padding:"4px 8px", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:5, color:"#ef4444", fontSize:10, cursor:"pointer", fontFamily:"inherit" }}>✗</button>
                  </>
                )}
                {c.status==="approved_manager" && <span style={{ fontSize:10, color:"#34d399" }}>✓ Final</span>}
                {c.status==="rejected" && <span style={{ fontSize:10, color:"#ef4444" }}>Rejected</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── STOCK CONTROL ────────────────────────────────────────────────────────────
function StockControlTab({ tanks, soundings, cargo, stockLevels, getControlStock, filterDate, setFilterDate, perm, onClose, closingStock }) {
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:24 }}>
        <div>
          <div style={{ fontSize:10, letterSpacing:3, color:"rgba(0,200,255,0.5)", textTransform:"uppercase", marginBottom:4 }}>Daily</div>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:38, letterSpacing:3 }}>STOCK CONTROL</div>
        </div>
        <input type="date" value={filterDate} onChange={e=>setFilterDate(e.target.value)}
          style={{ background:"rgba(0,200,255,0.05)", border:"1px solid rgba(0,200,255,0.2)", borderRadius:8, padding:"8px 12px", color:"#00c8ff", fontSize:12 }} />
      </div>

      {/* Legend */}
      <div style={{ display:"flex", gap:16, marginBottom:20, fontSize:10, color:"rgba(255,255,255,0.4)" }}>
        <span>Formula: <span style={{ color:"#00c8ff" }}>Actual Stock = Opening + Cargo IN − Cargo OUT</span></span>
        <span>|</span>
        <span>Opening from morning 07:00 sounding</span>
      </div>

      {/* Per-tank stock control table */}
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {tanks.map(tank=>{
          const ctrl = getControlStock(tank.id, filterDate);
          const opening = ctrl.closing || ctrl.morning || stockLevels[tank.id] || 0;
          const actual = opening + ctrl.cargoIn - ctrl.cargoOut;
          const diff = ctrl.afternoon !== null ? (ctrl.afternoon - actual) : null;
          const hasClosing = closingStock[`${tank.id}_${filterDate}`];
          const typeIcon = { ship:"🚢", shore:"🏭", depot:"⛽" }[tank.type];

          return (
            <div key={tank.id} style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, overflow:"hidden" }}>
              {/* Tank header */}
              <div style={{ padding:"14px 20px", background:"rgba(0,200,255,0.04)", borderBottom:"1px solid rgba(255,255,255,0.07)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:18 }}>{typeIcon}</span>
                  <div>
                    <div style={{ fontSize:14, fontWeight:600, color:"#fff" }}>{tank.name}</div>
                    <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)" }}>{tank.product} · Cap: {fmt(tank.capacity)} KL</div>
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  {hasClosing && <span style={{ fontSize:10, color:"#a78bfa", border:"1px solid rgba(167,139,250,0.3)", padding:"2px 8px", borderRadius:4 }}>✓ CLOSED</span>}
                  {perm.closeStock && !hasClosing && (
                    <button className="btn-act" onClick={()=>onClose(tank.id, filterDate)}
                      style={{ padding:"6px 14px", background:"rgba(167,139,250,0.1)", border:"1px solid rgba(167,139,250,0.3)", borderRadius:6, color:"#a78bfa", fontSize:10, cursor:"pointer", fontFamily:"inherit", fontWeight:800 }}>
                      CLOSE STOCK
                    </button>
                  )}
                </div>
              </div>

              {/* Control grid */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", padding:"0" }}>
                {[
                  { label:"Opening Stock", val: fmt(opening)+" KL", color:"#fff", sub:"From closing/morning" },
                  { label:"Cargo IN", val: ctrl.cargoIn>0?"+"+fmt(ctrl.cargoIn)+" KL":"— KL", color:"#34d399", sub:"Approved cargo in" },
                  { label:"Cargo OUT", val: ctrl.cargoOut>0?"-"+fmt(ctrl.cargoOut)+" KL":"— KL", color:"#f87171", sub:"Approved cargo out" },
                  { label:"Actual Stock", val: fmt(actual)+" KL", color:"#00c8ff", sub:"Opening+IN−OUT", highlight:true },
                  { label:"Morning Sound", val: ctrl.morning!==null?fmt(ctrl.morning)+" KL":"No data", color: ctrl.morning!==null?"#fbbf24":"rgba(255,255,255,0.2)", sub:"07:00 reading" },
                  { label:"Afternoon Sound", val: ctrl.afternoon!==null?fmt(ctrl.afternoon)+" KL":"No data", color: ctrl.afternoon!==null?"#60a5fa":"rgba(255,255,255,0.2)", sub:"19:00 reading" },
                  { label:"Difference", val: diff!==null?`${diff>=0?"+":""}${fmt(diff)} KL`:"—", color: diff===null?"rgba(255,255,255,0.2)":Math.abs(diff)<50?"#34d399":"#ef4444", sub:"Afternoon vs Actual" },
                ].map((col,ci)=>(
                  <div key={ci} style={{ padding:"14px 16px", borderRight: ci<6?"1px solid rgba(255,255,255,0.05)":"none", background: col.highlight?"rgba(0,200,255,0.04)":"transparent" }}>
                    <div style={{ fontSize:9, letterSpacing:1.5, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", marginBottom:6 }}>{col.label}</div>
                    <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:18, color:col.color }}>{col.val}</div>
                    <div style={{ fontSize:9, color:"rgba(255,255,255,0.25)", marginTop:3 }}>{col.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── APPROVALS ────────────────────────────────────────────────────────────────
function ApprovalTab({ user, perm, soundings, cargo, onApproveSounding, onRejectSounding, onApproveCargo, onRejectCargo }) {
  const [activeType, setActiveType] = useState("sounding");

  const pendingSoundings = soundings.filter(s=> {
    if(user.role==="supervisor") return s.status==="pending_supervisor";
    if(user.role==="manager") return s.status==="approved_supervisor"||s.status==="pending_supervisor";
    if(user.role==="admin") return s.status!=="approved_manager"&&s.status!=="rejected";
    return false;
  });

  const pendingCargo = cargo.filter(c=> {
    if(user.role==="supervisor") return c.status==="pending_supervisor";
    if(user.role==="manager") return c.status==="approved_supervisor"||c.status==="pending_supervisor";
    if(user.role==="admin") return c.status!=="approved_manager"&&c.status!=="rejected";
    return false;
  });

  const approveLevel = user.role==="supervisor"?"supervisor":"manager";

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:10, letterSpacing:3, color:"rgba(0,200,255,0.5)", textTransform:"uppercase", marginBottom:4 }}>Workflow</div>
        <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:38, letterSpacing:3 }}>APPROVALS</div>
      </div>

      {/* Approval flow diagram */}
      <div style={{ display:"flex", alignItems:"center", gap:0, marginBottom:24, background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:"16px 24px" }}>
        {[
          { role:"USER", action:"Submits entry", color:"#34d399" },
          { arrow:true },
          { role:"SUPERVISOR", action:"1st Approval", color:"#a78bfa" },
          { arrow:true },
          { role:"MANAGER", action:"Final Approval", color:"#60a5fa" },
          { arrow:true },
          { role:"SYSTEM", action:"Stock Updated", color:"#00c8ff" },
        ].map((item,i)=>(
          item.arrow
            ? <div key={i} style={{ fontSize:18, color:"rgba(255,255,255,0.2)", margin:"0 12px" }}>→</div>
            : <div key={i} style={{ textAlign:"center" }}>
                <div style={{ fontSize:9, fontWeight:800, letterSpacing:2, color:item.color, textTransform:"uppercase", marginBottom:4 }}>{item.role}</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)" }}>{item.action}</div>
              </div>
        ))}
      </div>

      {/* Tab switch */}
      <div style={{ display:"flex", gap:10, marginBottom:20 }}>
        {[["sounding","Daily Sounding",pendingSoundings.length],["cargo","Cargo",pendingCargo.length]].map(([id,label,cnt])=>(
          <button key={id} onClick={()=>setActiveType(id)}
            style={{ padding:"8px 18px", background: activeType===id?"rgba(0,200,255,0.12)":"rgba(255,255,255,0.03)", border:`1px solid ${activeType===id?"rgba(0,200,255,0.3)":"rgba(255,255,255,0.07)"}`, borderRadius:8, color: activeType===id?"#00c8ff":"rgba(255,255,255,0.4)", fontSize:11, cursor:"pointer", fontFamily:"inherit", letterSpacing:1, display:"flex", alignItems:"center", gap:8 }}>
            {label}
            {cnt>0 && <span style={{ background:"#ef4444", color:"#fff", fontSize:9, fontWeight:800, padding:"1px 5px", borderRadius:8 }}>{cnt}</span>}
          </button>
        ))}
      </div>

      {/* Pending list */}
      {activeType==="sounding" && (
        <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, overflow:"hidden" }}>
          {pendingSoundings.length===0 && <div style={{ padding:"40px", textAlign:"center", color:"rgba(255,255,255,0.2)", fontSize:12 }}>No pending sounding approvals</div>}
          {pendingSoundings.map((s,i)=>{
            const tank = TANKS_DB.find(t=>t.id===s.tankId);
            return (
              <div key={s.id} className="row" style={{ padding:"16px 20px", borderBottom: i<pendingSoundings.length-1?"1px solid rgba(255,255,255,0.05)":"none", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ display:"flex", gap:20, alignItems:"center" }}>
                  <div>
                    <div style={{ fontSize:13, color:"#fff", fontWeight:600 }}>{tank?.name}</div>
                    <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)", marginTop:2 }}>{s.date} · {s.session} session · by {s.submittedBy}</div>
                  </div>
                  <div style={{ fontSize:12 }}>
                    <span style={{ color:"rgba(255,255,255,0.4)" }}>Level: </span><span style={{ color:"#00c8ff" }}>{s.level}m</span>
                    <span style={{ color:"rgba(255,255,255,0.4)", marginLeft:12 }}>Vol: </span><span style={{ color:"#fff" }}>{fmt(s.volume)} KL</span>
                    <span style={{ color:"rgba(255,255,255,0.4)", marginLeft:12 }}>Temp: </span><span>{s.temp}°C</span>
                  </div>
                </div>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <StatusBadge status={s.status} />
                  <button className="btn-act" onClick={()=>onApproveSounding(s.id,approveLevel)}
                    style={{ padding:"7px 16px", background:"rgba(52,211,153,0.12)", border:"1px solid rgba(52,211,153,0.3)", borderRadius:7, color:"#34d399", fontSize:11, cursor:"pointer", fontFamily:"inherit", fontWeight:800 }}>✓ APPROVE</button>
                  <button className="btn-act" onClick={()=>onRejectSounding(s.id)}
                    style={{ padding:"7px 12px", background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:7, color:"#ef4444", fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>✗ REJECT</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeType==="cargo" && (
        <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, overflow:"hidden" }}>
          {pendingCargo.length===0 && <div style={{ padding:"40px", textAlign:"center", color:"rgba(255,255,255,0.2)", fontSize:12 }}>No pending cargo approvals</div>}
          {pendingCargo.map((c,i)=>{
            const tank = TANKS_DB.find(t=>t.id===c.tankId);
            return (
              <div key={c.id} className="row" style={{ padding:"16px 20px", borderBottom: i<pendingCargo.length-1?"1px solid rgba(255,255,255,0.05)":"none", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ display:"flex", gap:20, alignItems:"center" }}>
                  <div>
                    <div style={{ fontSize:13, color:"#fff", fontWeight:600 }}>{tank?.name} · <span style={{ color: c.type==="in"?"#34d399":"#f87171" }}>{c.type.toUpperCase()}</span></div>
                    <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)", marginTop:2 }}>{c.date} · {c.vesselRef} · {c.bL} · by {c.submittedBy}</div>
                  </div>
                  <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:22, color: c.type==="in"?"#34d399":"#f87171" }}>
                    {c.type==="in"?"+":"-"}{fmt(c.volume)} KL
                  </div>
                </div>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <StatusBadge status={c.status} />
                  <button className="btn-act" onClick={()=>onApproveCargo(c.id,approveLevel)}
                    style={{ padding:"7px 16px", background:"rgba(52,211,153,0.12)", border:"1px solid rgba(52,211,153,0.3)", borderRadius:7, color:"#34d399", fontSize:11, cursor:"pointer", fontFamily:"inherit", fontWeight:800 }}>✓ APPROVE</button>
                  <button className="btn-act" onClick={()=>onRejectCargo(c.id)}
                    style={{ padding:"7px 12px", background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:7, color:"#ef4444", fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>✗ REJECT</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── REPORTS ─────────────────────────────────────────────────────────────────
function ReportTab({ tanks, soundings, cargo, stockLevels }) {
  const approvedSoundings = soundings.filter(s=>s.status==="approved_manager");
  const approvedCargo = cargo.filter(c=>c.status==="approved_manager");

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:10, letterSpacing:3, color:"rgba(0,200,255,0.5)", textTransform:"uppercase", marginBottom:4 }}>Analytics</div>
        <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:38, letterSpacing:3 }}>REPORTS</div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
        {/* Stock levels */}
        <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:20 }}>
          <div style={{ fontSize:10, letterSpacing:2, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", marginBottom:16 }}>Current Stock Levels</div>
          {tanks.map(t=>{
            const vol = stockLevels[t.id]||0;
            const pct = Math.min(100,Math.round((vol/t.capacity)*100));
            const color = pct>60?"#34d399":pct>30?"#00c8ff":"#ef4444";
            return (
              <div key={t.id} style={{ marginBottom:14 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4, fontSize:11 }}>
                  <span style={{ color:"rgba(255,255,255,0.7)" }}>{t.name}</span>
                  <span style={{ color }}>{fmt(vol)} / {fmt(t.capacity)} KL ({pct}%)</span>
                </div>
                <div style={{ height:5, background:"rgba(255,255,255,0.06)", borderRadius:2 }}>
                  <div style={{ height:"100%", width:`${pct}%`, background:color, borderRadius:2, transition:"width 0.4s" }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Sounding history summary */}
        <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:20 }}>
          <div style={{ fontSize:10, letterSpacing:2, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", marginBottom:16 }}>Sounding Summary</div>
          {[...new Set(approvedSoundings.map(s=>s.date))].sort((a,b)=>b.localeCompare(a)).slice(0,6).map(date=>{
            const dayRecs = approvedSoundings.filter(s=>s.date===date);
            return (
              <div key={date} style={{ padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:11 }}>
                  <span style={{ color:"rgba(255,255,255,0.6)" }}>{fmtDate(date)}</span>
                  <span style={{ color:"rgba(255,255,255,0.4)" }}>{dayRecs.length} readings</span>
                </div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", marginTop:3 }}>
                  {dayRecs.filter(s=>s.session==="morning").length} morning · {dayRecs.filter(s=>s.session==="afternoon").length} afternoon
                </div>
              </div>
            );
          })}
        </div>

        {/* Cargo volume by tank */}
        <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:20 }}>
          <div style={{ fontSize:10, letterSpacing:2, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", marginBottom:16 }}>Cargo Volume by Tank</div>
          {tanks.map(t=>{
            const tIn  = approvedCargo.filter(c=>c.tankId===t.id&&c.type==="in").reduce((a,c)=>a+c.volume,0);
            const tOut = approvedCargo.filter(c=>c.tankId===t.id&&c.type==="out").reduce((a,c)=>a+c.volume,0);
            if(!tIn&&!tOut) return null;
            return (
              <div key={t.id} style={{ padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,0.05)", display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:11, color:"rgba(255,255,255,0.7)" }}>{t.name}</span>
                <div style={{ display:"flex", gap:14, fontSize:11 }}>
                  <span style={{ color:"#34d399" }}>+{fmt(tIn)} KL</span>
                  <span style={{ color:"#f87171" }}>-{fmt(tOut)} KL</span>
                </div>
              </div>
            );
          }).filter(Boolean)}
        </div>

        {/* Approval stats */}
        <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:20 }}>
          <div style={{ fontSize:10, letterSpacing:2, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", marginBottom:16 }}>Approval Statistics</div>
          {[
            { label:"Soundings Approved",    val: soundings.filter(s=>s.status==="approved_manager").length, color:"#34d399" },
            { label:"Soundings Pending",     val: soundings.filter(s=>s.status!=="approved_manager"&&s.status!=="rejected").length, color:"#fbbf24" },
            { label:"Soundings Rejected",    val: soundings.filter(s=>s.status==="rejected").length, color:"#ef4444" },
            { label:"Cargo Approved",        val: cargo.filter(c=>c.status==="approved_manager").length, color:"#34d399" },
            { label:"Cargo Pending",         val: cargo.filter(c=>c.status!=="approved_manager"&&c.status!=="rejected").length, color:"#fbbf24" },
          ].map(item=>(
            <div key={item.label} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.04)", fontSize:11 }}>
              <span style={{ color:"rgba(255,255,255,0.5)" }}>{item.label}</span>
              <span style={{ color:item.color, fontWeight:700 }}>{item.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── USERS TAB ────────────────────────────────────────────────────────────────
function UsersTab() {
  const permMatrix = [
    ["Create Sounding",    true,  true,  true,  true ],
    ["Approve (Sounding)", true,  true,  true,  false],
    ["Final Approve",      true,  true,  false, false],
    ["Create Cargo",       true,  true,  true,  true ],
    ["Approve (Cargo)",    true,  true,  false, false],
    ["Close Stock",        true,  true,  false, false],
    ["View Reports",       true,  true,  true,  false],
    ["Manage Users",       true,  false, false, false],
  ];
  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:10, letterSpacing:3, color:"rgba(0,200,255,0.5)", textTransform:"uppercase", marginBottom:4 }}>Access Control</div>
        <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:38, letterSpacing:3 }}>USERS & ROLES</div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:20 }}>
        {/* Permission Matrix */}
        <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, overflow:"hidden" }}>
          <div style={{ padding:"14px 20px", borderBottom:"1px solid rgba(255,255,255,0.07)", fontSize:10, letterSpacing:2, color:"rgba(0,200,255,0.5)", textTransform:"uppercase" }}>Permission Matrix</div>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
                <th style={{ padding:"10px 20px", textAlign:"left", fontSize:10, color:"rgba(255,255,255,0.3)", fontWeight:400 }}>Permission</th>
                {["Admin","Manager","Supervisor","User"].map(r=>(
                  <th key={r} style={{ padding:"10px 14px", textAlign:"center" }}><RoleBadge role={r.toLowerCase()} /></th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permMatrix.map(([label,...vals])=>(
                <tr key={label} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding:"10px 20px", fontSize:11, color:"rgba(255,255,255,0.55)" }}>{label}</td>
                  {vals.map((v,i)=>(
                    <td key={i} style={{ padding:"10px 14px", textAlign:"center", fontSize:14 }}>
                      {v ? <span style={{ color:"#34d399" }}>✓</span> : <span style={{ color:"rgba(255,255,255,0.1)" }}>✗</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* User list */}
        <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, overflow:"hidden" }}>
          <div style={{ padding:"14px 20px", borderBottom:"1px solid rgba(255,255,255,0.07)", fontSize:10, letterSpacing:2, color:"rgba(0,200,255,0.5)", textTransform:"uppercase" }}>Users</div>
          {USERS_DB.map((u,i)=>(
            <div key={u.id} className="row" style={{ padding:"14px 20px", borderBottom: i<USERS_DB.length-1?"1px solid rgba(255,255,255,0.05)":"none", display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#0070a8,#00c8ff)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, flexShrink:0 }}>
                {u.avatar}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, color:"#fff" }}>{u.name}</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)", marginTop:2 }}>@{u.username} · {u.dept}</div>
              </div>
              <RoleBadge role={u.role} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── FORMS ────────────────────────────────────────────────────────────────────
function SoundingForm({ user, onSubmit, onCancel, currentSession }) {
  const [f, setF] = useState({ tankId:"T1", date:today(), session:currentSession, level:"", volume:"", temp:"", density:"", note:"" });
  const set = (k,v) => setF(p=>({...p,[k]:v}));
  const handle = () => {
    if(!f.level||!f.volume||!f.temp||!f.density) return alert("Fill all sounding fields");
    onSubmit({ ...f, level:+f.level, volume:+f.volume, temp:+f.temp, density:+f.density });
  };
  return (
    <div>
      <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:28, letterSpacing:3, marginBottom:8, color:"#fff" }}>NEW SOUNDING</div>
      <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)", marginBottom:24 }}>Submit daily tank sounding for approval</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <div>
          <Label>Tank</Label>
          <select value={f.tankId} onChange={e=>set("tankId",e.target.value)} style={inputStyle}>
            {TANKS_DB.map(t=><option key={t.id} value={t.id} style={{background:"#0a0f1e"}}>{t.name} ({t.product})</option>)}
          </select>
        </div>
        <div>
          <Label>Date</Label>
          <input type="date" value={f.date} onChange={e=>set("date",e.target.value)} style={inputStyle} />
        </div>
        <div>
          <Label>Session</Label>
          <select value={f.session} onChange={e=>set("session",e.target.value)} style={inputStyle}>
            <option value="morning" style={{background:"#0a0f1e"}}>Morning — 07:00</option>
            <option value="afternoon" style={{background:"#0a0f1e"}}>Afternoon — 19:00</option>
          </select>
        </div>
        <div>
          <Label>Tank Level (meters)</Label>
          <input type="number" step="0.01" placeholder="e.g. 4.25" value={f.level} onChange={e=>set("level",e.target.value)} style={inputStyle} />
        </div>
        <div>
          <Label>Volume (KL)</Label>
          <input type="number" step="0.01" placeholder="e.g. 2980" value={f.volume} onChange={e=>set("volume",e.target.value)} style={inputStyle} />
        </div>
        <div>
          <Label>Temperature (°C)</Label>
          <input type="number" step="0.1" placeholder="e.g. 42.5" value={f.temp} onChange={e=>set("temp",e.target.value)} style={inputStyle} />
        </div>
        <div>
          <Label>Density (kg/L)</Label>
          <input type="number" step="0.001" placeholder="e.g. 0.985" value={f.density} onChange={e=>set("density",e.target.value)} style={inputStyle} />
        </div>
        <div>
          <Label>Note (optional)</Label>
          <input value={f.note} onChange={e=>set("note",e.target.value)} style={inputStyle} />
        </div>
      </div>
      <div style={{ display:"flex", gap:10, marginTop:24 }}>
        <button onClick={onCancel} style={{ ...btnBase, flex:1, background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.6)" }}>Cancel</button>
        <button onClick={handle}   style={{ ...btnBase, flex:2, background:"linear-gradient(135deg,#0070a8,#00c8ff)", color:"#fff" }}>SUBMIT SOUNDING</button>
      </div>
    </div>
  );
}

function CargoForm({ user, onSubmit, onCancel }) {
  const [f, setF] = useState({ tankId:"T1", date:today(), type:"in", volume:"", vesselRef:"", bL:"", note:"" });
  const set = (k,v) => setF(p=>({...p,[k]:v}));
  const handle = () => {
    if(!f.volume||!f.vesselRef) return alert("Fill all required fields");
    onSubmit({ ...f, volume:+f.volume });
  };
  return (
    <div>
      <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:28, letterSpacing:3, marginBottom:8, color:"#fff" }}>NEW CARGO</div>
      <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)", marginBottom:20 }}>Record cargo in/out activity for approval</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <div>
          <Label>Tank</Label>
          <select value={f.tankId} onChange={e=>set("tankId",e.target.value)} style={inputStyle}>
            {TANKS_DB.map(t=><option key={t.id} value={t.id} style={{background:"#0a0f1e"}}>{t.name}</option>)}
          </select>
        </div>
        <div>
          <Label>Date</Label>
          <input type="date" value={f.date} onChange={e=>set("date",e.target.value)} style={inputStyle} />
        </div>
        <div style={{ gridColumn:"1/-1" }}>
          <Label>Type</Label>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {["in","out"].map(t=>(
              <div key={t} onClick={()=>set("type",t)}
                style={{ padding:"14px", borderRadius:10, border:`2px solid ${f.type===t?(t==="in"?"#34d399":"#f87171"):"rgba(255,255,255,0.1)"}`, background: f.type===t?(t==="in"?"rgba(52,211,153,0.08)":"rgba(239,68,68,0.08)"):"transparent", cursor:"pointer", textAlign:"center", transition:"all 0.15s" }}>
                <div style={{ fontSize:20 }}>{t==="in"?"▼":"▲"}</div>
                <div style={{ fontSize:12, fontWeight:800, color: t==="in"?"#34d399":"#f87171", letterSpacing:1 }}>CARGO {t.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <Label>Volume (KL) *</Label>
          <input type="number" placeholder="e.g. 1500" value={f.volume} onChange={e=>set("volume",e.target.value)} style={inputStyle} />
        </div>
        <div>
          <Label>Vessel / Reference *</Label>
          <input placeholder="e.g. MT Pertiwi" value={f.vesselRef} onChange={e=>set("vesselRef",e.target.value)} style={inputStyle} />
        </div>
        <div>
          <Label>B/L Number</Label>
          <input placeholder="e.g. BL-2026-010" value={f.bL} onChange={e=>set("bL",e.target.value)} style={inputStyle} />
        </div>
        <div>
          <Label>Note</Label>
          <input value={f.note} onChange={e=>set("note",e.target.value)} style={inputStyle} />
        </div>
      </div>
      <div style={{ display:"flex", gap:10, marginTop:24 }}>
        <button onClick={onCancel} style={{ ...btnBase, flex:1, background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.6)" }}>Cancel</button>
        <button onClick={handle}   style={{ ...btnBase, flex:2, background:`linear-gradient(135deg,${f.type==="in"?"#1a6b00,#34d399":"#7a0000,#ef4444"})`, color:"#fff" }}>
          SUBMIT CARGO {f.type.toUpperCase()}
        </button>
      </div>
    </div>
  );
}

const inputStyle = { width:"100%", background:"rgba(0,200,255,0.05)", border:"1px solid rgba(0,200,255,0.15)", borderRadius:8, padding:"10px 12px", color:"#fff", fontSize:12 };
const btnBase = { border:"none", borderRadius:8, padding:"12px", fontSize:11, letterSpacing:1.5, fontWeight:800, cursor:"pointer", fontFamily:"'Share Tech Mono',monospace", textTransform:"uppercase", transition:"all 0.15s" };
const Label = ({children}) => <div style={{ fontSize:9, letterSpacing:2, color:"rgba(0,200,255,0.5)", textTransform:"uppercase", marginBottom:6 }}>{children}</div>;
