 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/src/App.jsx b/src/App.jsx
index dcd87c74cc8ae798eebf2449a43e5dbe6faaed0b..1a35bc0f273792e2ce85a441b1f63f4dbd803030 100644
--- a/src/App.jsx
+++ b/src/App.jsx
@@ -29,109 +29,114 @@ const GLOBAL_CSS = `
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
-  { id:"T1", name:"Tank 1 HSD",      type:"shore", capacity:5000, product:"HSD",
+  { id:"T1", name:"Tank 1 HSD",      type:"shore", capacity:5000000, product:"HSD",
     calibration:[{cm:0,kl:0},{cm:100,kl:500},{cm:200,kl:1000},{cm:300,kl:1500},{cm:400,kl:2000},{cm:500,kl:2500},{cm:600,kl:3000},{cm:700,kl:3500},{cm:800,kl:4000},{cm:900,kl:4500},{cm:1000,kl:5000}] },
-  { id:"T2", name:"Tank 2 FAME",     type:"shore", capacity:1000, product:"FAME",
+  { id:"T2", name:"Tank 2 FAME",     type:"shore", capacity:1000000, product:"FAME",
     calibration:[{cm:0,kl:0},{cm:100,kl:100},{cm:200,kl:200},{cm:300,kl:300},{cm:400,kl:400},{cm:500,kl:500},{cm:600,kl:600},{cm:700,kl:700},{cm:800,kl:800},{cm:900,kl:900},{cm:1000,kl:1000}] },
-  { id:"T3", name:"Tank 3",          type:"shore", capacity:850,  product:"HSD",
+  { id:"T3", name:"Tank 3",          type:"shore", capacity:850000,  product:"HSD",
     calibration:[{cm:0,kl:0},{cm:100,kl:94},{cm:200,kl:189},{cm:300,kl:283},{cm:400,kl:378},{cm:500,kl:472},{cm:600,kl:567},{cm:700,kl:661},{cm:800,kl:756},{cm:900,kl:850}] },
-  { id:"T4", name:"Tank 4 Biosolar", type:"shore", capacity:110,  product:"Biosolar",
+  { id:"T4", name:"Tank 4 Biosolar", type:"shore", capacity:110000,  product:"Biosolar",
     calibration:[{cm:0,kl:0},{cm:50,kl:15.7},{cm:100,kl:31.4},{cm:150,kl:47.1},{cm:200,kl:62.9},{cm:250,kl:78.6},{cm:300,kl:94.3},{cm:350,kl:110}] },
 ];
 
 // Dead level thresholds (same for all tanks per work instruction)
-const DEAD_LEVEL  = { cm:30, volume:150 };  // warning — dead stock level
-const ALERT_LEVEL = { cm:10, volume:54  };  // critical alert level
+const DEAD_LEVEL  = { cm:30, volume:150000 };  // warning — dead stock level
+const ALERT_LEVEL = { cm:10, volume:54000  };  // critical alert level
 
-// ─── CALIBRATION LOOKUP (level cm → volume KL via linear interpolation) ───────
+// ─── CALIBRATION LOOKUP (level cm → volume L via linear interpolation) ────────
 function getVolumeFromLevel(tankId, levelCm) {
   const tank = TANKS_DB.find(t => t.id === tankId);
   if (!tank?.calibration || levelCm === "" || levelCm === null || levelCm === undefined) return null;
   const cm = parseFloat(levelCm);
   if (isNaN(cm) || cm < 0) return null;
   const cal = tank.calibration;
-  if (cm <= cal[0].cm) return cal[0].kl;
-  if (cm >= cal[cal.length-1].cm) return cal[cal.length-1].kl;
+  if (cm <= cal[0].cm) return cal[0].kl * 1000;
+  if (cm >= cal[cal.length-1].cm) return cal[cal.length-1].kl * 1000;
   for (let i = 0; i < cal.length - 1; i++) {
     if (cm >= cal[i].cm && cm <= cal[i+1].cm) {
       const ratio = (cm - cal[i].cm) / (cal[i+1].cm - cal[i].cm);
-      return parseFloat((cal[i].kl + ratio * (cal[i+1].kl - cal[i].kl)).toFixed(3));
+      return Math.round((cal[i].kl + ratio * (cal[i+1].kl - cal[i].kl)) * 1000);
     }
   }
   return null;
 }
 
 const today = () => new Date().toISOString().split("T")[0];
+const STORAGE_KEYS = { soundings:"dailysound:soundings", cargo:"dailysound:cargo", distributions:"dailysound:distributions", stockLevels:"dailysound:stockLevels", closingStock:"dailysound:closingStock" };
+
+const readStorage = (key, fallback) => {
+  try {
+    const raw = localStorage.getItem(key);
+    return raw ? JSON.parse(raw) : fallback;
+  } catch {
+    return fallback;
+  }
+};
+
 const fmt = n => new Intl.NumberFormat("id-ID",{maximumFractionDigits:2}).format(n);
 const fmtTime = () => new Date().toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"});
 const fmtDate = d => new Date(d).toLocaleDateString("id-ID",{day:"2-digit",month:"short",year:"numeric"});
 
 function genId(prefix) { return prefix + "_" + Date.now() + "_" + Math.floor(Math.random()*1000); }
 
 // ─── SEED DATA ────────────────────────────────────────────────────────────────
 // level is stored in cm (dip from tank bottom); volume auto-calculated from calibration table
 const SEED_SOUNDINGS = [
-  { id:"S001", tankId:"T1", date:"2026-03-07", session:"morning", time:"07:15", noSounding:false, reason:"", level:331, volume:1655, temp:30, density:0.850, status:"approved_manager", submittedBy:"nikco",  supervisorApproval:"approved", managerApproval:"approved", note:"Opening stock" },
-  { id:"S002", tankId:"T2", date:"2026-03-07", session:"morning", time:"07:30", noSounding:false, reason:"", level:925, volume:925,  temp:30, density:0.880, status:"approved_manager", submittedBy:"nota",   supervisorApproval:"approved", managerApproval:"approved", note:"Opening stock" },
-  { id:"S003", tankId:"T3", date:"2026-03-07", session:"morning", time:"07:45", noSounding:false, reason:"", level:827, volume:781,  temp:30, density:0.880, status:"approved_manager", submittedBy:"nicko",  supervisorApproval:"approved", managerApproval:"approved", note:"Opening stock" },
-  { id:"S004", tankId:"T4", date:"2026-03-07", session:"morning", time:"08:00", noSounding:false, reason:"", level:57,  volume:17.9, temp:31, density:0.890, status:"approved_manager", submittedBy:"nota",   supervisorApproval:"approved", managerApproval:"approved", note:"Opening stock" },
+  { id:"S001", tankId:"T1", date:"2026-03-07", session:"morning", time:"07:15", noSounding:false, reason:"", level:331, volume:1655000, temp:30, operatorName:"Nikco", status:"approved_manager", submittedBy:"nikco",  supervisorApproval:"approved", managerApproval:"approved", note:"Opening stock" },
+  { id:"S002", tankId:"T2", date:"2026-03-07", session:"morning", time:"07:30", noSounding:false, reason:"", level:925, volume:925000,  temp:30, operatorName:"Nota", status:"approved_manager", submittedBy:"nota",   supervisorApproval:"approved", managerApproval:"approved", note:"Opening stock" },
+  { id:"S003", tankId:"T3", date:"2026-03-07", session:"morning", time:"07:45", noSounding:false, reason:"", level:827, volume:781000,  temp:30, operatorName:"Nicko", status:"approved_manager", submittedBy:"nicko",  supervisorApproval:"approved", managerApproval:"approved", note:"Opening stock" },
+  { id:"S004", tankId:"T4", date:"2026-03-07", session:"morning", time:"08:00", noSounding:false, reason:"", level:57,  volume:17900, temp:31, operatorName:"Nota", status:"approved_manager", submittedBy:"nota",   supervisorApproval:"approved", managerApproval:"approved", note:"Opening stock" },
 ];
 
 // ─── SEED DISTRIBUTIONS ───────────────────────────────────────────────────────
 // Distribution OUT = fuel issued to end consumers / vehicles / vessels
-const SEED_DISTRIBUTIONS = [
-  { id:"D001", tankId:"T4", date:"2026-03-07", time:"09:15", volume:5.0,  recipient:"Koperasi Tani Makmur", vehicleRef:"B 1122 CD", product:"Biosolar B35", status:"approved_manager", submittedBy:"kim", supervisorApproval:"approved", managerApproval:"approved", note:"Subsidi kuota harian" },
-];
+const SEED_DISTRIBUTIONS = [];
 
-const SEED_CARGO = [
-  { id:"C001", tankId:"T1", type:"in",  date:"2026-03-05", volume:3000, vesselRef:"MT Pertiwi", bL:"BL-2026-001", status:"approved_manager",  submittedBy:"kim",     supervisorApproval:"approved", managerApproval:"approved", note:"Loading HSD from refinery" },
-  { id:"C002", tankId:"T2", type:"out", date:"2026-03-05", volume:1500, vesselRef:"MT Merdeka", bL:"BL-2026-002", status:"pending_supervisor", submittedBy:"kim",     supervisorApproval:"pending",  managerApproval:"pending",  note:"FAME discharge to vessel" },
-  { id:"C003", tankId:"T1", type:"in",  date:"2026-03-06", volume:800,  vesselRef:"MT Nusantara", bL:"BL-2026-003", status:"approved_supervisor", submittedBy:"subandi", supervisorApproval:"approved", managerApproval:"pending", note:"HSD loading" },
-];
+const SEED_CARGO = [];
 
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
@@ -198,72 +203,78 @@ function Login({ onLogin }) {
 
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
-  const [soundings, setSoundings] = useState(SEED_SOUNDINGS);
-  const [cargo, setCargo] = useState(SEED_CARGO);
-  const [distributions, setDistributions] = useState(SEED_DISTRIBUTIONS);
-  const [stockLevels, setStockLevels] = useState(computeStockFromSoundings());
-  const [closingStock, setClosingStock] = useState({});
+  const [soundings, setSoundings] = useState(() => readStorage(STORAGE_KEYS.soundings, SEED_SOUNDINGS));
+  const [cargo, setCargo] = useState(() => readStorage(STORAGE_KEYS.cargo, SEED_CARGO));
+  const [distributions, setDistributions] = useState(() => readStorage(STORAGE_KEYS.distributions, SEED_DISTRIBUTIONS));
+  const [stockLevels, setStockLevels] = useState(() => readStorage(STORAGE_KEYS.stockLevels, computeStockFromSoundings()));
+  const [closingStock, setClosingStock] = useState(() => readStorage(STORAGE_KEYS.closingStock, {}));
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
 
+  useEffect(() => { localStorage.setItem(STORAGE_KEYS.soundings, JSON.stringify(soundings)); }, [soundings]);
+  useEffect(() => { localStorage.setItem(STORAGE_KEYS.cargo, JSON.stringify(cargo)); }, [cargo]);
+  useEffect(() => { localStorage.setItem(STORAGE_KEYS.distributions, JSON.stringify(distributions)); }, [distributions]);
+  useEffect(() => { localStorage.setItem(STORAGE_KEYS.stockLevels, JSON.stringify(stockLevels)); }, [stockLevels]);
+  useEffect(() => { localStorage.setItem(STORAGE_KEYS.closingStock, JSON.stringify(closingStock)); }, [closingStock]);
+
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
@@ -596,198 +607,198 @@ export default function App() {
   );
 }
 
 // ─── DASHBOARD ────────────────────────────────────────────────────────────────
 function DashboardTab({ tanks, soundings, cargo, stockLevels, getControlStock, filterDate, setFilterDate, pendingCount, isMobile, t3Product, setT3Product }) {
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
-          { label:"Total Volume",     val:fmt(totalValue)+" KL", sub:"combined stock", color:"#34d399" },
+          { label:"Total Volume",     val:fmt(totalValue)+" L", sub:"combined stock", color:"#34d399" },
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
             const cur = ctrl.morning ?? stockLevels[tank.id] ?? 0;
             const pct = Math.min(100, Math.round((cur/tank.capacity)*100));
             const barColor = pct > 70 ? "#34d399" : pct > 30 ? "#00c8ff" : pct > 10 ? "#fbbf24" : "#ef4444";
             const typeIcon = { ship:"🚢", shore:"🏭", depot:"⛽" }[tank.type] || "▦";
             const isCritical = cur <= ALERT_LEVEL.volume;
             const isWarning  = !isCritical && cur <= DEAD_LEVEL.volume;
             return (
               <div key={tank.id} style={{ background: isCritical?"rgba(239,68,68,0.06)":isWarning?"rgba(251,191,36,0.06)":"rgba(255,255,255,0.03)", border:`1px solid ${isCritical?"rgba(239,68,68,0.35)":isWarning?"rgba(251,191,36,0.25)":"rgba(255,255,255,0.07)"}`, borderRadius:12, padding:"16px 18px" }}>
                 {(isCritical||isWarning) && (
                   <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10, padding:"6px 10px", borderRadius:7, background:isCritical?"rgba(239,68,68,0.12)":"rgba(251,191,36,0.1)", border:`1px solid ${isCritical?"rgba(239,68,68,0.3)":"rgba(251,191,36,0.25)"}` }}>
                     <span className={isCritical?"blink":""} style={{ fontSize:13 }}>{isCritical?"🚨":"⚠️"}</span>
                     <span style={{ fontSize:10, fontWeight:800, color:isCritical?"#ef4444":"#fbbf24", letterSpacing:0.5 }}>
-                      {isCritical?`CRITICAL — Below ${ALERT_LEVEL.cm}cm / ${ALERT_LEVEL.volume} KL alert level`:`WARNING — Below ${DEAD_LEVEL.cm}cm / ${DEAD_LEVEL.volume} KL dead level`}
+                      {isCritical?`CRITICAL — Below ${ALERT_LEVEL.cm}cm / ${ALERT_LEVEL.volume} L alert level`:`WARNING — Below ${DEAD_LEVEL.cm}cm / ${DEAD_LEVEL.volume} L dead level`}
                     </span>
                   </div>
                 )}
                 <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                   <div>
                     <div style={{ fontSize:11, fontWeight:600, color:"#fff" }}>{typeIcon} {tank.name}</div>
                     {tank.id === "T3" ? (
                       <select value={t3Product} onChange={e=>setT3Product(e.target.value)}
                         onClick={e=>e.stopPropagation()}
                         style={{ marginTop:3, background:"rgba(0,200,255,0.08)", border:"1px solid rgba(0,200,255,0.25)", borderRadius:5, padding:"2px 6px", color:"#00c8ff", fontSize:10, cursor:"pointer", fontFamily:"inherit" }}>
                         <option value="HSD" style={{background:"#0a0f1e"}}>HSD</option>
                         <option value="FAME" style={{background:"#0a0f1e"}}>FAME</option>
                       </select>
                     ) : (
                       <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)", marginTop:2 }}>{tank.product}</div>
                     )}
                   </div>
                   <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", textAlign:"right" }}>
-                    <div>{fmt(cur)} KL</div>
-                    <div>/ {fmt(tank.capacity)} KL</div>
+                    <div>{fmt(cur)} L</div>
+                    <div>/ {fmt(tank.capacity)} L</div>
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
 
       {/* Volume Chart */}
       <div style={{ marginBottom:28, background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:"20px 24px" }}>
-        <div style={{ fontSize:10, letterSpacing:2, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", marginBottom:16 }}>Volume Chart — Current Stock vs Capacity (KL)</div>
+        <div style={{ fontSize:10, letterSpacing:2, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", marginBottom:16 }}>Volume Chart — Current Stock vs Capacity (L)</div>
         <TankBarChart tanks={tanks} stockLevels={stockLevels} />
       </div>
 
       {/* Recent activity */}
       <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:16, marginBottom:28 }}>
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
-                    <div style={{ fontSize:11, color:"#00c8ff" }}>{fmt(s.volume)} KL</div>
+                    <div style={{ fontSize:11, color:"#00c8ff" }}>{fmt(s.volume)} L</div>
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
-                    <div style={{ fontSize:11, color: c.type==="in"?"#34d399":"#f87171" }}>{c.type==="in"?"+":"-"}{fmt(c.volume)} KL</div>
+                    <div style={{ fontSize:11, color: c.type==="in"?"#34d399":"#f87171" }}>{c.type==="in"?"+":"-"}{fmt(c.volume)} L</div>
                     <StatusBadge status={c.status} />
                   </div>
                 </div>
               );
             })}
           </div>
         </div>
       </div>
 
       {/* Variance Inventory */}
       <div>
         <div style={{ fontSize:10, letterSpacing:2, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", marginBottom:12 }}>Daily Inventory Report — {fmtDate(filterDate)}</div>
         <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, overflow:"hidden" }}>
           <div style={{ display:"grid", gridTemplateColumns:"1fr 90px 80px 90px 95px 100px 90px 100px", padding:"10px 16px", borderBottom:"1px solid rgba(255,255,255,0.07)", fontSize:9, letterSpacing:1.5, color:"rgba(0,200,255,0.5)", textTransform:"uppercase" }}>
             <div>Tank</div><div>Opening</div><div>IN</div><div>Cargo OUT</div><div>Dist. OUT</div><div>Calc. Stock</div><div>Afternoon</div><div>Variance</div>
           </div>
           {tanks.map((tank,i)=>{
             const ctrl = getControlStock(tank.id, filterDate);
             const opening = ctrl.opening;
             const actual  = opening + ctrl.cargoIn - ctrl.cargoOut - ctrl.distOut;
             const variance = ctrl.afternoon!==null ? ctrl.afternoon-actual : null;
             const varColor = variance===null?"rgba(255,255,255,0.25)":Math.abs(variance)<5?"#34d399":Math.abs(variance)<50?"#fbbf24":"#ef4444";
             return (
               <div key={tank.id} className="row" style={{ display:"grid", gridTemplateColumns:"1fr 90px 80px 90px 95px 100px 90px 100px", padding:"11px 16px", borderBottom:i<tanks.length-1?"1px solid rgba(255,255,255,0.04)":"none", alignItems:"center", fontSize:11, background: ctrl.noMorningSounding?"rgba(245,158,11,0.03)":"transparent" }}>
                 <div>
                   <div style={{ color:"#fff" }}>{tank.name}</div>
                   <div style={{ fontSize:9, color:"rgba(255,255,255,0.3)", marginTop:1 }}>
                     {ctrl.noMorningSounding
                       ? <span style={{ color:"#f59e0b" }}>⚠ {ctrl.morningRec?.noSounding ? "No Sounding — "+ctrl.morningReason : "No morning sounding"}</span>
                       : (ctrl.morningRec?.time ? `Cut-off ${ctrl.morningRec.time}` : tank.product)}
                   </div>
                 </div>
                 <div style={{ color: ctrl.noMorningSounding?"rgba(255,255,255,0.2)":"rgba(255,255,255,0.5)", fontSize:10 }}>{ctrl.noMorningSounding?"—":fmt(opening)}</div>
                 <div style={{ color:"#34d399", fontSize:10 }}>{ctrl.cargoIn>0?"+"+fmt(ctrl.cargoIn):"—"}</div>
                 <div style={{ color:"#f87171", fontSize:10 }}>{ctrl.cargoOut>0?"-"+fmt(ctrl.cargoOut):"—"}</div>
                 <div style={{ color:"#fb923c", fontSize:10 }}>{ctrl.distOut>0?"-"+fmt(ctrl.distOut):"—"}</div>
                 <div style={{ color: ctrl.noMorningSounding?"rgba(255,255,255,0.2)":"#00c8ff", fontWeight:600, fontSize:10 }}>{ctrl.noMorningSounding?"—":fmt(actual)}</div>
                 <div style={{ color: ctrl.afternoon!==null?"#60a5fa":"rgba(255,255,255,0.25)", fontSize:10 }}>{ctrl.afternoon!==null?fmt(ctrl.afternoon):"—"}</div>
-                <div style={{ color:varColor, fontWeight:700, fontSize:10 }}>{variance!==null?`${variance>=0?"+":""}${fmt(variance)} KL`:"—"}</div>
+                <div style={{ color:varColor, fontWeight:700, fontSize:10 }}>{variance!==null?`${variance>=0?"+":""}${fmt(variance)} L`:"—"}</div>
               </div>
             );
           })}
         </div>
       </div>
     </div>
   );
 }
 
 // ─── SOUNDING TAB ─────────────────────────────────────────────────────────────
 function SoundingTab({ user, perm, soundings, filterDate, setFilterDate, onNew, onApprove, onReject, onDelete, currentSession }) {
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
@@ -797,77 +808,77 @@ function SoundingTab({ user, perm, soundings, filterDate, setFilterDate, onNew,
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
         <div style={{ display:"grid", gridTemplateColumns:"80px 1fr 110px 70px 80px 80px 80px 1fr 130px", padding:"10px 16px", borderBottom:"1px solid rgba(255,255,255,0.07)", fontSize:9, letterSpacing:1.5, color:"rgba(0,200,255,0.5)", textTransform:"uppercase" }}>
-          <div>ID</div><div>Tank</div><div>Session · Time</div><div>Dip(cm)</div><div>Vol(KL)</div><div>Temp(°C)</div><div>Density</div><div>Status</div><div>Actions</div>
+          <div>ID</div><div>Tank</div><div>Session · Time</div><div>Dip(cm)</div><div>Vol(L)</div><div>Temp(°C)</div><div>Operator</div><div>Status</div><div>Actions</div>
         </div>
         {filtered.length===0 && <div style={{ padding:"36px", textAlign:"center", color:"rgba(255,255,255,0.2)", fontSize:12 }}>No sounding records for this date</div>}
         {filtered.map((s,i)=>{
           const tank = TANKS_DB.find(t=>t.id===s.tankId);
           return (
             <div key={s.id} className="row" style={{ display:"grid", gridTemplateColumns:"80px 1fr 110px 70px 80px 80px 80px 1fr 130px", padding:"12px 16px", borderBottom: i<filtered.length-1?"1px solid rgba(255,255,255,0.04)":"none", alignItems:"center", fontSize:12, background: s.noSounding?"rgba(245,158,11,0.04)":"transparent" }}>
               <div style={{ color:"rgba(255,255,255,0.3)", fontSize:10 }}>{s.id}</div>
               <div>
                 <div style={{ color:"#fff" }}>{tank?.name}</div>
                 <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)" }}>{s.date}</div>
               </div>
               <div>
                 <div style={{ color: s.session==="morning"?"#fbbf24":"#60a5fa", fontSize:10, textTransform:"uppercase", letterSpacing:1 }}>{s.session}</div>
                 <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)" }}>{s.time||"—"}</div>
               </div>
               {s.noSounding ? (
                 <div style={{ gridColumn:"span 4", display:"flex", alignItems:"center", gap:8 }}>
                   <span style={{ fontSize:10, padding:"3px 9px", borderRadius:4, background:"rgba(245,158,11,0.12)", border:"1px solid rgba(245,158,11,0.3)", color:"#f59e0b", fontWeight:800, letterSpacing:0.5 }}>NO SOUNDING</span>
                   <span style={{ fontSize:10, color:"rgba(255,255,255,0.4)" }}>{s.reason}</span>
                 </div>
               ) : (
                 <>
                   <div style={{ color:"#00c8ff" }}>{s.level}</div>
                   <div style={{ fontWeight:600 }}>{fmt(s.volume)}</div>
                   <div style={{ color:"rgba(255,255,255,0.5)" }}>{s.temp}</div>
-                  <div style={{ color:"rgba(255,255,255,0.5)" }}>{s.density}</div>
+                  <div style={{ color:"rgba(255,255,255,0.5)" }}>{s.operatorName||"-"}</div>
                 </>
               )}
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
                 {perm.deleteRecord && (
                   <button className="btn-act" onClick={()=>{ if(window.confirm("Delete this sounding record?")) onDelete(s.id); }}
                     style={{ padding:"4px 8px", background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:5, color:"#ef4444", fontSize:10, cursor:"pointer", fontFamily:"inherit" }}>🗑</button>
                 )}
               </div>
             </div>
           );
         })}
       </div>
     </div>
   );
@@ -891,62 +902,62 @@ function CargoTab({ user, perm, cargo, filterDate, setFilterDate, onNew, onAppro
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
-                {fmt(total)} KL
+                {fmt(total)} L
               </div>
               <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", marginTop:2 }}>{rows.length} approved transactions</div>
             </div>
           );
         })}
       </div>
 
       {/* Table */}
       <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, overflow:"hidden" }}>
         <div style={{ display:"grid", gridTemplateColumns:"80px 1fr 70px 90px 1fr 80px 1fr 130px", padding:"10px 16px", borderBottom:"1px solid rgba(255,255,255,0.07)", fontSize:9, letterSpacing:1.5, color:"rgba(0,200,255,0.5)", textTransform:"uppercase" }}>
-          <div>ID</div><div>Tank</div><div>Type</div><div>Vol(KL)</div><div>Vessel/Ref</div><div>B/L</div><div>Status</div><div>Actions</div>
+          <div>ID</div><div>Tank</div><div>Type</div><div>Vol(L)</div><div>Vessel/Ref</div><div>B/L</div><div>Status</div><div>Actions</div>
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
@@ -983,59 +994,59 @@ function DistribTab({ user, perm, distributions, filterDate, setFilterDate, onNe
   const totalApproved = filtered.filter(d=>d.status==="approved_manager").reduce((a,d)=>a+d.volume,0);
 
   return (
     <div>
       <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:24 }}>
         <div>
           <div style={{ fontSize:10, letterSpacing:3, color:"rgba(251,146,60,0.7)", textTransform:"uppercase", marginBottom:4 }}>Fuel Issued to Consumers</div>
           <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:38, letterSpacing:3 }}>DISTRIBUTION OUT</div>
         </div>
         <div style={{ display:"flex", gap:10 }}>
           <input type="date" value={filterDate} onChange={e=>setFilterDate(e.target.value)}
             style={{ background:"rgba(0,200,255,0.05)", border:"1px solid rgba(0,200,255,0.2)", borderRadius:8, padding:"8px 12px", color:"#00c8ff", fontSize:12 }} />
           {perm.createDistrib && (
             <button className="btn-act" onClick={onNew}
               style={{ background:"linear-gradient(135deg,#7a3800,#fb923c)", border:"none", borderRadius:8, padding:"9px 18px", color:"#fff", fontSize:11, letterSpacing:1, fontWeight:800, cursor:"pointer", fontFamily:"inherit" }}>
               + NEW DISTRIBUTION
             </button>
           )}
         </div>
       </div>
 
       {/* Summary */}
       <div style={{ background:"rgba(251,146,60,0.06)", border:"1px solid rgba(251,146,60,0.2)", borderRadius:12, padding:"16px 20px", marginBottom:24, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
         <div>
           <div style={{ fontSize:9, letterSpacing:2, color:"rgba(251,146,60,0.7)", textTransform:"uppercase", marginBottom:4 }}>Total Distributed (approved) — {filterDate}</div>
-          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:30, color:"#fb923c" }}>{fmt(totalApproved)} KL</div>
+          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:30, color:"#fb923c" }}>{fmt(totalApproved)} L</div>
         </div>
         <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)" }}>{filtered.filter(d=>d.status==="approved_manager").length} transactions</div>
       </div>
 
       {/* Table */}
       <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, overflow:"hidden" }}>
         <div style={{ display:"grid", gridTemplateColumns:"80px 1fr 75px 85px 1fr 1fr 1fr 130px", padding:"10px 16px", borderBottom:"1px solid rgba(255,255,255,0.07)", fontSize:9, letterSpacing:1.5, color:"rgba(251,146,60,0.6)", textTransform:"uppercase" }}>
-          <div>ID</div><div>Tank</div><div>Time</div><div>Vol(KL)</div><div>Recipient</div><div>Vehicle/Ref</div><div>Status</div><div>Actions</div>
+          <div>ID</div><div>Tank</div><div>Time</div><div>Vol(L)</div><div>Recipient</div><div>Vehicle/Ref</div><div>Status</div><div>Actions</div>
         </div>
         {filtered.length===0 && <div style={{ padding:"36px", textAlign:"center", color:"rgba(255,255,255,0.2)", fontSize:12 }}>No distribution records for this date</div>}
         {filtered.map((d,i)=>{
           const tank = TANKS_DB.find(t=>t.id===d.tankId);
           return (
             <div key={d.id} className="row" style={{ display:"grid", gridTemplateColumns:"80px 1fr 75px 85px 1fr 1fr 1fr 130px", padding:"12px 16px", borderBottom:i<filtered.length-1?"1px solid rgba(255,255,255,0.04)":"none", alignItems:"center", fontSize:12 }}>
               <div style={{ color:"rgba(255,255,255,0.3)", fontSize:10 }}>{d.id}</div>
               <div>
                 <div style={{ color:"#fff" }}>{tank?.name}</div>
                 <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)" }}>{d.date} · {d.product}</div>
               </div>
               <div style={{ color:"rgba(255,255,255,0.5)", fontSize:10 }}>{d.time||"—"}</div>
               <div style={{ fontWeight:700, color:"#fb923c" }}>-{fmt(d.volume)}</div>
               <div style={{ color:"rgba(255,255,255,0.6)", fontSize:11 }}>{d.recipient}</div>
               <div style={{ color:"rgba(255,255,255,0.4)", fontSize:10 }}>{d.vehicleRef||"—"}</div>
               <div><StatusBadge status={d.status} /></div>
               <div style={{ display:"flex", gap:6 }}>
                 {canApprove(d) && (
                   <>
                     <button className="btn-act" onClick={()=>onApprove(d.id, user.role==="supervisor"?"supervisor":"manager")}
                       style={{ padding:"4px 10px", background:"rgba(52,211,153,0.15)", border:"1px solid rgba(52,211,153,0.3)", borderRadius:5, color:"#34d399", fontSize:10, cursor:"pointer", fontFamily:"inherit" }}>✓ Approve</button>
                     <button className="btn-act" onClick={()=>onReject(d.id)}
                       style={{ padding:"4px 8px", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:5, color:"#ef4444", fontSize:10, cursor:"pointer", fontFamily:"inherit" }}>✗</button>
                   </>
                 )}
@@ -1078,88 +1089,88 @@ function StockControlTab({ tanks, getControlStock, filterDate, setFilterDate, pe
 
       {/* Per-tank stock control table */}
       <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
         {tanks.map(tank=>{
           const ctrl = getControlStock(tank.id, filterDate);
           const opening = ctrl.opening;
           const actual  = opening + ctrl.cargoIn - ctrl.cargoOut - ctrl.distOut;
           const diff    = ctrl.afternoon !== null ? (ctrl.afternoon - actual) : null;
           const hasClosing = closingStock[`${tank.id}_${filterDate}`];
           const typeIcon = { ship:"🚢", shore:"🏭", depot:"⛽" }[tank.type];
           const isCritical = actual <= ALERT_LEVEL.volume;
           const isWarning  = !isCritical && actual <= DEAD_LEVEL.volume;
 
           return (
             <div key={tank.id} style={{ background:"rgba(255,255,255,0.02)", border:`1px solid ${isCritical?"rgba(239,68,68,0.35)":isWarning?"rgba(251,191,36,0.25)":"rgba(255,255,255,0.07)"}`, borderRadius:12, overflow:"hidden" }}>
               {/* Tank header */}
               <div style={{ padding:"14px 20px", background: isCritical?"rgba(239,68,68,0.06)":isWarning?"rgba(251,191,36,0.05)":"rgba(0,200,255,0.04)", borderBottom:"1px solid rgba(255,255,255,0.07)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                 <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                   <span style={{ fontSize:18 }}>{typeIcon}</span>
                   <div>
                     <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                       <div style={{ fontSize:14, fontWeight:600, color:"#fff" }}>{tank.name}</div>
                       {isCritical && <span className="blink" style={{ fontSize:9, fontWeight:800, padding:"2px 7px", borderRadius:4, background:"rgba(239,68,68,0.15)", border:"1px solid rgba(239,68,68,0.4)", color:"#ef4444", letterSpacing:0.5 }}>🚨 CRITICAL</span>}
                       {isWarning  && <span style={{ fontSize:9, fontWeight:800, padding:"2px 7px", borderRadius:4, background:"rgba(251,191,36,0.12)", border:"1px solid rgba(251,191,36,0.3)", color:"#fbbf24", letterSpacing:0.5 }}>⚠ DEAD LEVEL</span>}
                     </div>
-                    <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)" }}>{tank.id==="T3" ? t3Product : tank.product} · Cap: {fmt(tank.capacity)} KL</div>
+                    <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)" }}>{tank.id==="T3" ? t3Product : tank.product} · Cap: {fmt(tank.capacity)} L</div>
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
 
               {/* No-sounding notification */}
               {ctrl.noMorningSounding && (
                 <div style={{ padding:"10px 20px", background:"rgba(245,158,11,0.07)", borderBottom:"1px solid rgba(245,158,11,0.15)", display:"flex", alignItems:"center", gap:8 }}>
                   <span style={{ fontSize:14 }}>⚠️</span>
                   <span style={{ fontSize:11, color:"#f59e0b", fontWeight:700 }}>
                     {ctrl.morningRec?.noSounding
                       ? `NO SOUNDING — ${ctrl.morningReason}`
                       : "NO MORNING SOUNDING — Inventory cut-off not recorded for this date"}
                   </span>
                   <span style={{ fontSize:10, color:"rgba(255,255,255,0.3)", marginLeft:4 }}>· Stock report is incomplete</span>
                 </div>
               )}
 
               {/* Control grid */}
               <div style={{ display:"grid", gridTemplateColumns:"repeat(8,1fr)", padding:"0" }}>
                 {[
-                  { label:"Opening (Morning)", val: ctrl.noMorningSounding?"— No Data":fmt(opening)+" KL", color: ctrl.noMorningSounding?"rgba(255,255,255,0.2)":"#fff", sub:"Morning cut-off snapshot" },
-                  { label:"Discharge IN", val: ctrl.cargoIn>0?"+"+fmt(ctrl.cargoIn)+" KL":"—", color:"#34d399", sub:"Cargo received" },
-                  { label:"Cargo OUT", val: ctrl.cargoOut>0?"-"+fmt(ctrl.cargoOut)+" KL":"—", color:"#f87171", sub:"Transfer / cargo out" },
-                  { label:"Distribution OUT", val: ctrl.distOut>0?"-"+fmt(ctrl.distOut)+" KL":"—", color:"#fb923c", sub:"Fuel issued to consumers" },
-                  { label:"Calculated Stock", val: ctrl.noMorningSounding?"— No Data":fmt(actual)+" KL", color: ctrl.noMorningSounding?"rgba(255,255,255,0.2)":"#00c8ff", sub:"Open+IN−CargoOut−DistOut", highlight:true },
-                  { label:"Morning Time", val: ctrl.morningRec&&!ctrl.noMorningSounding?(ctrl.morningRec.time||"—"):"—", color:"#fbbf24", sub: ctrl.morningRec&&!ctrl.noMorningSounding?fmt(ctrl.morning)+" KL cut-off":"No reading" },
-                  { label:"Afternoon Reading", val: ctrl.afternoon!==null?fmt(ctrl.afternoon)+" KL":"No data", color: ctrl.afternoon!==null?"#60a5fa":"rgba(255,255,255,0.2)", sub: ctrl.afternoonRec?.time||"19:00 verify" },
-                  { label:"Variance", val: diff!==null?`${diff>=0?"+":""}${fmt(diff)} KL`:"—", color: diff===null?"rgba(255,255,255,0.2)":Math.abs(diff)<5?"#34d399":Math.abs(diff)<50?"#fbbf24":"#ef4444", sub:"Afternoon vs Calculated" },
+                  { label:"Opening (Morning)", val: ctrl.noMorningSounding?"— No Data":fmt(opening)+" L", color: ctrl.noMorningSounding?"rgba(255,255,255,0.2)":"#fff", sub:"Morning cut-off snapshot" },
+                  { label:"Discharge IN", val: ctrl.cargoIn>0?"+"+fmt(ctrl.cargoIn)+" L":"—", color:"#34d399", sub:"Cargo received" },
+                  { label:"Cargo OUT", val: ctrl.cargoOut>0?"-"+fmt(ctrl.cargoOut)+" L":"—", color:"#f87171", sub:"Transfer / cargo out" },
+                  { label:"Distribution OUT", val: ctrl.distOut>0?"-"+fmt(ctrl.distOut)+" L":"—", color:"#fb923c", sub:"Fuel issued to consumers" },
+                  { label:"Calculated Stock", val: ctrl.noMorningSounding?"— No Data":fmt(actual)+" L", color: ctrl.noMorningSounding?"rgba(255,255,255,0.2)":"#00c8ff", sub:"Open+IN−CargoOut−DistOut", highlight:true },
+                  { label:"Morning Time", val: ctrl.morningRec&&!ctrl.noMorningSounding?(ctrl.morningRec.time||"—"):"—", color:"#fbbf24", sub: ctrl.morningRec&&!ctrl.noMorningSounding?fmt(ctrl.morning)+" L cut-off":"No reading" },
+                  { label:"Afternoon Reading", val: ctrl.afternoon!==null?fmt(ctrl.afternoon)+" L":"No data", color: ctrl.afternoon!==null?"#60a5fa":"rgba(255,255,255,0.2)", sub: ctrl.afternoonRec?.time||"19:00 verify" },
+                  { label:"Variance", val: diff!==null?`${diff>=0?"+":""}${fmt(diff)} L`:"—", color: diff===null?"rgba(255,255,255,0.2)":Math.abs(diff)<5?"#34d399":Math.abs(diff)<50?"#fbbf24":"#ef4444", sub:"Afternoon vs Calculated" },
                 ].map((col,ci)=>(
                   <div key={ci} style={{ padding:"14px 16px", borderRight: ci<7?"1px solid rgba(255,255,255,0.05)":"none", background: col.highlight?"rgba(0,200,255,0.04)":"transparent" }}>
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
 function ApprovalTab({ user, perm, soundings, cargo, distributions, onApproveSounding, onRejectSounding, onApproveCargo, onRejectCargo, onApproveDistrib, onRejectDistrib }) {
   const [activeType, setActiveType] = useState("sounding");
 
   const awaitingMe = (item) =>
     (user.role==="supervisor" && item.status==="pending_supervisor") ||
     (user.role==="manager" && (item.status==="approved_supervisor"||item.status==="pending_supervisor")) ||
     (user.role==="admin" && item.status!=="approved_manager" && item.status!=="rejected");
 
@@ -1200,110 +1211,110 @@ function ApprovalTab({ user, perm, soundings, cargo, distributions, onApproveSou
       <div style={{ display:"flex", gap:10, marginBottom:20 }}>
         {[["sounding","Daily Sounding",pendingSoundings.length],["cargo","Cargo",pendingCargo.length],["distrib","Distribution",pendingDistrib.length]].map(([id,label,cnt])=>(
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
-                    <span style={{ color:"rgba(255,255,255,0.4)", marginLeft:12 }}>Vol: </span><span style={{ color:"#fff" }}>{fmt(s.volume)} KL</span>
+                    <span style={{ color:"rgba(255,255,255,0.4)", marginLeft:12 }}>Vol: </span><span style={{ color:"#fff" }}>{fmt(s.volume)} L</span>
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
-                    {c.type==="in"?"+":"-"}{fmt(c.volume)} KL
+                    {c.type==="in"?"+":"-"}{fmt(c.volume)} L
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
 
       {activeType==="distrib" && (
         <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, overflow:"hidden" }}>
           {pendingDistrib.length===0 && <div style={{ padding:"40px", textAlign:"center", color:"rgba(255,255,255,0.2)", fontSize:12 }}>No pending distribution approvals</div>}
           {pendingDistrib.map((d,i)=>{
             const tank = TANKS_DB.find(t=>t.id===d.tankId);
             return (
               <div key={d.id} className="row" style={{ padding:"16px 20px", borderBottom: i<pendingDistrib.length-1?"1px solid rgba(255,255,255,0.05)":"none", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                 <div style={{ display:"flex", gap:20, alignItems:"center" }}>
                   <div>
                     <div style={{ fontSize:13, color:"#fff", fontWeight:600 }}>{tank?.name} · <span style={{ color:"#fb923c" }}>DISTRIBUTION OUT</span></div>
                     <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)", marginTop:2 }}>{d.date} {d.time||""} · {d.recipient} · {d.product} · by {d.submittedBy}</div>
                   </div>
                   <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:22, color:"#fb923c" }}>
-                    -{fmt(d.volume)} KL
+                    -{fmt(d.volume)} L
                   </div>
                 </div>
                 <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                   <StatusBadge status={d.status} />
                   <button className="btn-act" onClick={()=>onApproveDistrib(d.id,approveLevel)}
                     style={{ padding:"7px 16px", background:"rgba(52,211,153,0.12)", border:"1px solid rgba(52,211,153,0.3)", borderRadius:7, color:"#34d399", fontSize:11, cursor:"pointer", fontFamily:"inherit", fontWeight:800 }}>✓ APPROVE</button>
                   <button className="btn-act" onClick={()=>onRejectDistrib(d.id)}
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
 function ReportTab({ tanks, soundings, cargo, distributions, stockLevels, t3Product, user }) {
   const approvedSoundings = soundings.filter(s=>s.status==="approved_manager");
   const approvedCargo = cargo.filter(c=>c.status==="approved_manager");
   const tankColors = ["#00c8ff","#34d399","#fbbf24","#a78bfa"];
 
   // Period-based inventory (manager/admin only)
@@ -1373,155 +1384,155 @@ function ReportTab({ tanks, soundings, cargo, distributions, stockLevels, t3Prod
                   <input type="datetime-local" value={periodStart} onChange={e=>setPeriodStart(e.target.value)}
                     style={{ ...{width:"100%", background:"rgba(167,139,250,0.05)", border:"1px solid rgba(167,139,250,0.2)", borderRadius:8, padding:"9px 12px", color:"#a78bfa", fontSize:12, fontFamily:"'Share Tech Mono',monospace"} }} />
                 </div>
                 <div>
                   <div style={{ fontSize:9, letterSpacing:2, color:"rgba(167,139,250,0.6)", textTransform:"uppercase", marginBottom:6 }}>Period End</div>
                   <input type="datetime-local" value={periodEnd} onChange={e=>setPeriodEnd(e.target.value)}
                     style={{ ...{width:"100%", background:"rgba(167,139,250,0.05)", border:"1px solid rgba(167,139,250,0.2)", borderRadius:8, padding:"9px 12px", color:"#a78bfa", fontSize:12, fontFamily:"'Share Tech Mono',monospace"} }} />
                 </div>
                 <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", paddingBottom:4 }}>
                   {periodStart.split("T")[0]} → {periodEnd.split("T")[0]}
                 </div>
               </div>
               {/* Period inventory table */}
               <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, overflow:"hidden" }}>
                 <div style={{ display:"grid", gridTemplateColumns:"1fr 95px 85px 90px 95px 110px 110px 100px", padding:"10px 16px", borderBottom:"1px solid rgba(255,255,255,0.07)", fontSize:9, letterSpacing:1.5, color:"rgba(167,139,250,0.6)", textTransform:"uppercase" }}>
                   <div>Tank</div><div>Opening</div><div>IN</div><div>Cargo OUT</div><div>Dist. OUT</div><div>Calc. Closing</div><div>Actual Closing</div><div>Variance</div>
                 </div>
                 {periodInventory.map(({tank, opening, cargoIn, cargoOut, distOut, calcClosing, actualClosing, variance, openingSnap},i)=>{
                   const varColor = variance===null?"rgba(255,255,255,0.25)":Math.abs(variance)<5?"#34d399":Math.abs(variance)<50?"#fbbf24":"#ef4444";
                   return (
                     <div key={tank.id} className="row" style={{ display:"grid", gridTemplateColumns:"1fr 95px 85px 90px 95px 110px 110px 100px", padding:"11px 16px", borderBottom:i<tanks.length-1?"1px solid rgba(255,255,255,0.04)":"none", alignItems:"center", fontSize:11 }}>
                       <div>
                         <div style={{ color:"#fff" }}>{tank.name}</div>
                         <div style={{ fontSize:9, color:"rgba(255,255,255,0.3)", marginTop:1 }}>{openingSnap?.date||"no snap"} cut-off</div>
                       </div>
-                      <div style={{ color:"rgba(255,255,255,0.6)", fontSize:10 }}>{fmt(opening)} KL</div>
+                      <div style={{ color:"rgba(255,255,255,0.6)", fontSize:10 }}>{fmt(opening)} L</div>
                       <div style={{ color:"#34d399", fontSize:10 }}>{cargoIn>0?"+"+fmt(cargoIn):"—"}</div>
                       <div style={{ color:"#f87171", fontSize:10 }}>{cargoOut>0?"-"+fmt(cargoOut):"—"}</div>
                       <div style={{ color:"#fb923c", fontSize:10 }}>{distOut>0?"-"+fmt(distOut):"—"}</div>
-                      <div style={{ color:"#00c8ff", fontWeight:700, fontSize:10 }}>{fmt(calcClosing)} KL</div>
-                      <div style={{ color:actualClosing!==null?"#60a5fa":"rgba(255,255,255,0.25)", fontSize:10 }}>{actualClosing!==null?fmt(actualClosing)+" KL":"— no sounding"}</div>
-                      <div style={{ color:varColor, fontWeight:700, fontSize:10 }}>{variance!==null?`${variance>=0?"+":""}${fmt(variance)} KL`:"—"}</div>
+                      <div style={{ color:"#00c8ff", fontWeight:700, fontSize:10 }}>{fmt(calcClosing)} L</div>
+                      <div style={{ color:actualClosing!==null?"#60a5fa":"rgba(255,255,255,0.25)", fontSize:10 }}>{actualClosing!==null?fmt(actualClosing)+" L":"— no sounding"}</div>
+                      <div style={{ color:varColor, fontWeight:700, fontSize:10 }}>{variance!==null?`${variance>=0?"+":""}${fmt(variance)} L`:"—"}</div>
                     </div>
                   );
                 })}
               </div>
             </div>
           )}
         </div>
       )}
 
       {/* Stats grid */}
       <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
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
-                  <span style={{ color }}>{fmt(vol)} / {fmt(t.capacity)} KL ({pct}%)</span>
+                  <span style={{ color }}>{fmt(vol)} / {fmt(t.capacity)} L ({pct}%)</span>
                 </div>
                 <div style={{ height:5, background:"rgba(255,255,255,0.06)", borderRadius:2 }}>
                   <div style={{ height:"100%", width:`${pct}%`, background:color, borderRadius:2, transition:"width 0.4s" }} />
                 </div>
               </div>
             );
           })}
         </div>
 
         {/* Approval stats */}
         <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:20 }}>
           <div style={{ fontSize:10, letterSpacing:2, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", marginBottom:16 }}>Approval Statistics</div>
           {[
             { label:"Soundings Approved", val: soundings.filter(s=>s.status==="approved_manager").length, color:"#34d399" },
             { label:"Soundings Pending",  val: soundings.filter(s=>s.status!=="approved_manager"&&s.status!=="rejected").length, color:"#fbbf24" },
             { label:"Soundings Rejected", val: soundings.filter(s=>s.status==="rejected").length, color:"#ef4444" },
             { label:"Cargo Approved",     val: cargo.filter(c=>c.status==="approved_manager").length, color:"#34d399" },
             { label:"Cargo Pending",      val: cargo.filter(c=>c.status!=="approved_manager"&&c.status!=="rejected").length, color:"#fbbf24" },
-            { label:"Total Stock (KL)",   val: fmt(tanks.reduce((a,t)=>(stockLevels[t.id]||0)+a,0)), color:"#00c8ff" },
+            { label:"Total Stock (L)",   val: fmt(tanks.reduce((a,t)=>(stockLevels[t.id]||0)+a,0)), color:"#00c8ff" },
           ].map(item=>(
             <div key={item.label} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.04)", fontSize:11 }}>
               <span style={{ color:"rgba(255,255,255,0.5)" }}>{item.label}</span>
               <span style={{ color:item.color, fontWeight:700 }}>{item.val}</span>
             </div>
           ))}
         </div>
 
         {/* Sounding summary */}
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
-                  <span style={{ color:"#34d399" }}>+{fmt(tIn)} KL</span>
-                  <span style={{ color:"#f87171" }}>-{fmt(tOut)} KL</span>
+                  <span style={{ color:"#34d399" }}>+{fmt(tIn)} L</span>
+                  <span style={{ color:"#f87171" }}>-{fmt(tOut)} L</span>
                 </div>
               </div>
             );
           }).filter(Boolean)}
         </div>
       </div>
 
       {/* Per-tank sounding history line charts */}
       <div style={{ marginBottom:20 }}>
         <div style={{ fontSize:10, letterSpacing:2, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", marginBottom:14 }}>Sounding History — Morning Readings (Last 8 Days)</div>
         <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
           {tanks.map((t,ti)=>(
             <div key={t.id} style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:"14px 16px" }}>
               <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                 <div style={{ fontSize:11, color:"#fff", fontWeight:600 }}>{t.name}</div>
-                <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)" }}>{t.id==="T3"?t3Product:t.product} · cap {fmt(t.capacity)} KL</div>
+                <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)" }}>{t.id==="T3"?t3Product:t.product} · cap {fmt(t.capacity)} L</div>
               </div>
               <SoundingLineChart soundings={soundings} tankId={t.id} color={tankColors[ti%4]} />
             </div>
           ))}
         </div>
       </div>
 
       {/* Full Variance Inventory Table */}
       <div>
         <div style={{ fontSize:10, letterSpacing:2, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", marginBottom:14 }}>Full Variance Inventory</div>
         <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, overflow:"hidden" }}>
           <div style={{ display:"grid", gridTemplateColumns:"1fr 90px 80px 80px 90px 90px 100px", padding:"10px 16px", borderBottom:"1px solid rgba(255,255,255,0.07)", fontSize:9, letterSpacing:1.5, color:"rgba(0,200,255,0.5)", textTransform:"uppercase" }}>
             <div>Tank / Product</div><div>Capacity</div><div>Stock</div><div>Fill %</div><div>Total In</div><div>Total Out</div><div>Net</div>
           </div>
           {tanks.map((t,i)=>{
             const vol = stockLevels[t.id]||0;
             const pct = Math.min(100,Math.round((vol/t.capacity)*100));
             const tIn  = approvedCargo.filter(c=>c.tankId===t.id&&c.type==="in").reduce((a,c)=>a+c.volume,0);
             const tOut = approvedCargo.filter(c=>c.tankId===t.id&&c.type==="out").reduce((a,c)=>a+c.volume,0);
             const net = tIn-tOut;
             const fillColor = pct>60?"#34d399":pct>30?"#00c8ff":pct>10?"#fbbf24":"#ef4444";
             return (
               <div key={t.id} className="row" style={{ display:"grid", gridTemplateColumns:"1fr 90px 80px 80px 90px 90px 100px", padding:"12px 16px", borderBottom:i<tanks.length-1?"1px solid rgba(255,255,255,0.04)":"none", alignItems:"center", fontSize:11 }}>
                 <div>
                   <div style={{ color:"#fff" }}>{t.name}</div>
@@ -1543,175 +1554,175 @@ function ReportTab({ tanks, soundings, cargo, distributions, stockLevels, t3Prod
     </div>
   );
 }
 
 // ─── BLENDING CALCULATOR ─────────────────────────────────────────────────────
 const BLEND_GRADES = [
   { label:"B30", fame:30 }, { label:"B35", fame:35 }, { label:"B40", fame:40 },
   { label:"B50", fame:50 }, { label:"B100", fame:100 },
 ];
 
 function BlendingTab({ tanks, stockLevels, t3Product }) {
   const [targetVol, setTargetVol] = useState("");
   const [grade, setGrade]         = useState("B40");
   const [result, setResult]       = useState(null);
 
   const hsdTank  = tanks.find(t => t.id === "T1");
   const fameTank = tanks.find(t => t.id === "T2");
   const t3Tank   = tanks.find(t => t.id === "T3");
 
   const hsdStock  = stockLevels["T1"] || 0;
   const fameStock = (stockLevels["T2"] || 0) + (t3Product === "FAME" ? (stockLevels["T3"] || 0) : 0);
   const t3Contributes = t3Product === "FAME";
 
   const calculate = () => {
     const vol = parseFloat(targetVol);
-    if (!vol || vol <= 0) return alert("Enter a valid target volume (KL)");
+    if (!vol || vol <= 0) return alert("Enter a valid target volume (L)");
     const sel = BLEND_GRADES.find(b => b.label === grade);
     const famePct = sel.fame / 100;
     const hsdPct  = 1 - famePct;
     const fameNeeded = parseFloat((vol * famePct).toFixed(3));
     const hsdNeeded  = parseFloat((vol * hsdPct).toFixed(3));
     const fameOk  = fameStock >= fameNeeded;
     const hsdOk   = hsdStock  >= hsdNeeded;
     const feasible = fameOk && hsdOk;
     setResult({
       vol, grade, famePct: sel.fame, hsdPct: sel.fame < 100 ? 100 - sel.fame : 0,
       fameNeeded, hsdNeeded,
       fameRemaining: parseFloat((fameStock - fameNeeded).toFixed(3)),
       hsdRemaining:  parseFloat((hsdStock  - hsdNeeded).toFixed(3)),
       fameOk, hsdOk, feasible,
     });
   };
 
   const reset = () => { setResult(null); setTargetVol(""); };
 
   return (
     <div>
       <div style={{ marginBottom:28 }}>
         <div style={{ fontSize:10, letterSpacing:3, color:"rgba(0,200,255,0.5)", textTransform:"uppercase", marginBottom:4 }}>Government Regulation Formula</div>
         <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:38, letterSpacing:3 }}>BLENDING CALC</div>
       </div>
 
       {/* Grade reference cards */}
       <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10, marginBottom:28 }}>
         {BLEND_GRADES.map(b => (
           <div key={b.label} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, padding:"12px 14px", textAlign:"center" }}>
             <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:20, color:"#a78bfa", letterSpacing:2 }}>{b.label}</div>
             <div style={{ fontSize:10, color:"#34d399", marginTop:4 }}>FAME {b.fame}%</div>
             {b.fame < 100 && <div style={{ fontSize:10, color:"#60a5fa" }}>HSD {100-b.fame}%</div>}
           </div>
         ))}
       </div>
 
       {/* Available stock */}
       <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:28 }}>
         <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:"16px 20px" }}>
           <div style={{ fontSize:9, letterSpacing:2, color:"rgba(0,200,255,0.5)", textTransform:"uppercase", marginBottom:12 }}>Available HSD Stock</div>
-          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:28, color:"#60a5fa" }}>{fmt(hsdStock)} KL</div>
+          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:28, color:"#60a5fa" }}>{fmt(hsdStock)} L</div>
           <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)", marginTop:4 }}>{hsdTank?.name}</div>
         </div>
         <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:"16px 20px" }}>
           <div style={{ fontSize:9, letterSpacing:2, color:"rgba(0,200,255,0.5)", textTransform:"uppercase", marginBottom:12 }}>Available FAME Stock</div>
-          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:28, color:"#34d399" }}>{fmt(fameStock)} KL</div>
+          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:28, color:"#34d399" }}>{fmt(fameStock)} L</div>
           <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)", marginTop:4 }}>
             {fameTank?.name}{t3Contributes ? ` + ${t3Tank?.name} (FAME)` : ""}
           </div>
         </div>
       </div>
 
       {/* Calculator form */}
       <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:"24px 28px", marginBottom:24 }}>
         <div style={{ fontSize:10, letterSpacing:2, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", marginBottom:20 }}>Blend Request</div>
         <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr auto", gap:14, alignItems:"flex-end" }}>
           <div>
-            <Label>Target Biosolar Volume (KL)</Label>
+            <Label>Target Biosolar Volume (L)</Label>
             <input type="number" min="0" step="0.001" placeholder="e.g. 100" value={targetVol} onChange={e=>{setTargetVol(e.target.value);setResult(null);}}
               style={inputStyle} />
           </div>
           <div>
             <Label>Blend Grade</Label>
             <select value={grade} onChange={e=>{setGrade(e.target.value);setResult(null);}} style={inputStyle}>
               {BLEND_GRADES.map(b=><option key={b.label} value={b.label} style={{background:"#0a0f1e"}}>{b.label} — FAME {b.fame}% {b.fame<100?`/ HSD ${100-b.fame}%`:""}</option>)}
             </select>
           </div>
           <button onClick={calculate} className="btn-act"
             style={{ ...btnBase, background:"linear-gradient(135deg,#4a00a8,#a78bfa)", color:"#fff", padding:"10px 24px", whiteSpace:"nowrap" }}>
             CALCULATE
           </button>
         </div>
 
         {/* Formula preview */}
         {targetVol && parseFloat(targetVol) > 0 && (
           <div style={{ marginTop:16, padding:"12px 16px", background:"rgba(167,139,250,0.06)", border:"1px solid rgba(167,139,250,0.15)", borderRadius:8, fontSize:11, color:"rgba(255,255,255,0.55)" }}>
             {(() => {
               const vol = parseFloat(targetVol)||0;
               const sel = BLEND_GRADES.find(b=>b.label===grade);
               const fN = v => fmt(parseFloat((v).toFixed(3)));
-              return `${grade} formula: ${fN(vol * sel.fame/100)} KL FAME (${sel.fame}%) + ${sel.fame<100?fN(vol*(100-sel.fame)/100)+" KL HSD ("+( 100-sel.fame)+"%)":"—"} = ${fN(vol)} KL Biosolar`;
+              return `${grade} formula: ${fN(vol * sel.fame/100)} L FAME (${sel.fame}%) + ${sel.fame<100?fN(vol*(100-sel.fame)/100)+" L HSD ("+( 100-sel.fame)+"%)":"—"} = ${fN(vol)} L Biosolar`;
             })()}
           </div>
         )}
       </div>
 
       {/* Result */}
       {result && (
         <div style={{ background: result.feasible?"rgba(52,211,153,0.05)":"rgba(239,68,68,0.05)", border:`1px solid ${result.feasible?"rgba(52,211,153,0.25)":"rgba(239,68,68,0.25)"}`, borderRadius:12, padding:"24px 28px" }}>
           <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
             <span style={{ fontSize:24 }}>{result.feasible?"✅":"❌"}</span>
             <div>
               <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:22, color: result.feasible?"#34d399":"#ef4444" }}>
                 {result.feasible ? "BLEND FEASIBLE" : "INSUFFICIENT STOCK"}
               </div>
               <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginTop:2 }}>
-                {result.grade} · {fmt(result.vol)} KL Biosolar target
+                {result.grade} · {fmt(result.vol)} L Biosolar target
               </div>
             </div>
           </div>
 
           <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
             {/* FAME */}
             <div style={{ background: result.fameOk?"rgba(52,211,153,0.07)":"rgba(239,68,68,0.07)", border:`1px solid ${result.fameOk?"rgba(52,211,153,0.2)":"rgba(239,68,68,0.2)"}`, borderRadius:10, padding:"16px 20px" }}>
               <div style={{ fontSize:9, letterSpacing:2, color:"#34d399", textTransform:"uppercase", marginBottom:8 }}>FAME Required ({result.famePct}%)</div>
-              <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:26, color: result.fameOk?"#34d399":"#ef4444" }}>{fmt(result.fameNeeded)} KL</div>
-              <div style={{ marginTop:8, fontSize:10, color:"rgba(255,255,255,0.45)" }}>Available: <span style={{ color: result.fameOk?"#34d399":"#ef4444" }}>{fmt(fameStock)} KL</span></div>
+              <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:26, color: result.fameOk?"#34d399":"#ef4444" }}>{fmt(result.fameNeeded)} L</div>
+              <div style={{ marginTop:8, fontSize:10, color:"rgba(255,255,255,0.45)" }}>Available: <span style={{ color: result.fameOk?"#34d399":"#ef4444" }}>{fmt(fameStock)} L</span></div>
               <div style={{ fontSize:10, color:"rgba(255,255,255,0.45)", marginTop:2 }}>
                 {result.fameOk
-                  ? <>Remaining after blend: <span style={{ color:"#34d399" }}>{fmt(result.fameRemaining)} KL</span></>
-                  : <span style={{ color:"#ef4444" }}>Deficit: {fmt(Math.abs(result.fameRemaining))} KL</span>}
+                  ? <>Remaining after blend: <span style={{ color:"#34d399" }}>{fmt(result.fameRemaining)} L</span></>
+                  : <span style={{ color:"#ef4444" }}>Deficit: {fmt(Math.abs(result.fameRemaining))} L</span>}
               </div>
             </div>
             {/* HSD */}
             {result.hsdPct > 0 && (
               <div style={{ background: result.hsdOk?"rgba(96,165,250,0.07)":"rgba(239,68,68,0.07)", border:`1px solid ${result.hsdOk?"rgba(96,165,250,0.2)":"rgba(239,68,68,0.2)"}`, borderRadius:10, padding:"16px 20px" }}>
                 <div style={{ fontSize:9, letterSpacing:2, color:"#60a5fa", textTransform:"uppercase", marginBottom:8 }}>HSD Required ({result.hsdPct}%)</div>
-                <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:26, color: result.hsdOk?"#60a5fa":"#ef4444" }}>{fmt(result.hsdNeeded)} KL</div>
-                <div style={{ marginTop:8, fontSize:10, color:"rgba(255,255,255,0.45)" }}>Available: <span style={{ color: result.hsdOk?"#60a5fa":"#ef4444" }}>{fmt(hsdStock)} KL</span></div>
+                <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:26, color: result.hsdOk?"#60a5fa":"#ef4444" }}>{fmt(result.hsdNeeded)} L</div>
+                <div style={{ marginTop:8, fontSize:10, color:"rgba(255,255,255,0.45)" }}>Available: <span style={{ color: result.hsdOk?"#60a5fa":"#ef4444" }}>{fmt(hsdStock)} L</span></div>
                 <div style={{ fontSize:10, color:"rgba(255,255,255,0.45)", marginTop:2 }}>
                   {result.hsdOk
-                    ? <>Remaining after blend: <span style={{ color:"#60a5fa" }}>{fmt(result.hsdRemaining)} KL</span></>
-                    : <span style={{ color:"#ef4444" }}>Deficit: {fmt(Math.abs(result.hsdRemaining))} KL</span>}
+                    ? <>Remaining after blend: <span style={{ color:"#60a5fa" }}>{fmt(result.hsdRemaining)} L</span></>
+                    : <span style={{ color:"#ef4444" }}>Deficit: {fmt(Math.abs(result.hsdRemaining))} L</span>}
                 </div>
               </div>
             )}
           </div>
 
           <button onClick={reset} className="btn-act"
             style={{ marginTop:18, padding:"8px 20px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:7, color:"rgba(255,255,255,0.5)", fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>
             Reset
           </button>
         </div>
       )}
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
@@ -1765,80 +1776,80 @@ function UsersTab() {
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
 const NO_SOUNDING_REASONS = [
   "Weather — Heavy Rain",
   "Weather — Strong Wind / Wave",
   "Equipment Fault — Sounding Tape",
   "Tank Under Operation",
   "Safety — Hot Work in Progress",
   "Other",
 ];
 
 function SoundingForm({ user, onSubmit, onCancel, currentSession, t3Product }) {
   const defaultTime = currentSession === "morning" ? "07:00" : "19:00";
   const [f, setF] = useState({
     tankId:"T1", date:today(), session:currentSession, time:defaultTime,
     noSounding:false, reason:"", customReason:"",
-    level:"", volume:"", volumeFromCal:false, temp:"", density:"", note:"",
+    level:"", volume:"", volumeFromCal:false, temp:"", operatorName:user?.username==="kim"?"Kim":"", note:"",
   });
   const set = (k,v) => setF(p=>({...p,[k]:v}));
 
   const handleTankChange = (tankId) => {
     const calcVol = getVolumeFromLevel(tankId, f.level);
     setF(p=>({...p, tankId, volume: calcVol!==null ? calcVol : p.volume, volumeFromCal: calcVol!==null }));
   };
 
   const handleLevelChange = (val) => {
     const calcVol = getVolumeFromLevel(f.tankId, val);
     setF(p=>({...p, level:val, volume: calcVol!==null ? String(calcVol) : p.volume, volumeFromCal: calcVol!==null }));
   };
 
   const handleSessionChange = (ses) => {
     set("session", ses);
     if(ses === "morning" && f.time === "19:00") set("time","07:00");
     if(ses === "afternoon" && f.time === "07:00") set("time","19:00");
   };
 
   const handle = () => {
     if(!f.noSounding) {
-      if(!f.level||!f.volume||!f.temp||!f.density) return alert("Fill all sounding fields");
-      onSubmit({ ...f, level:+f.level, volume:+f.volume, temp:+f.temp, density:+f.density,
+      if(!f.level||!f.volume||!f.temp||!f.operatorName) return alert("Fill all sounding fields");
+      onSubmit({ ...f, level:+f.level, volume:+f.volume, temp:+f.temp,
         reason:"", customReason:"", volumeFromCal:undefined });
     } else {
       const finalReason = f.reason === "Other" ? (f.customReason||"Other") : f.reason;
       if(!finalReason) return alert("Enter a reason for no sounding");
       onSubmit({ ...f, noSounding:true, reason:finalReason,
-        level:null, volume:null, temp:null, density:null, volumeFromCal:undefined });
+        level:null, volume:null, temp:null, operatorName:"", volumeFromCal:undefined });
     }
   };
 
   return (
     <div>
       <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:28, letterSpacing:3, marginBottom:8, color:"#fff" }}>NEW SOUNDING</div>
       <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)", marginBottom:20 }}>Submit daily tank sounding for approval</div>
 
       {/* No-Sounding toggle */}
       <div style={{ display:"flex", gap:10, marginBottom:20 }}>
         <button onClick={()=>set("noSounding",false)} className="btn-act"
           style={{ flex:1, padding:"10px", borderRadius:8, border:`2px solid ${!f.noSounding?"#00c8ff":"rgba(255,255,255,0.1)"}`, background:!f.noSounding?"rgba(0,200,255,0.1)":"transparent", color:!f.noSounding?"#00c8ff":"rgba(255,255,255,0.4)", fontSize:11, cursor:"pointer", fontFamily:"inherit", fontWeight:800, letterSpacing:1 }}>
           ◈ NORMAL SOUNDING
         </button>
         <button onClick={()=>set("noSounding",true)} className="btn-act"
           style={{ flex:1, padding:"10px", borderRadius:8, border:`2px solid ${f.noSounding?"#f59e0b":"rgba(255,255,255,0.1)"}`, background:f.noSounding?"rgba(245,158,11,0.1)":"transparent", color:f.noSounding?"#f59e0b":"rgba(255,255,255,0.4)", fontSize:11, cursor:"pointer", fontFamily:"inherit", fontWeight:800, letterSpacing:1 }}>
           ✕ NO SOUNDING (REMARK)
         </button>
       </div>
 
       <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
         <div>
           <Label>Tank</Label>
           <select value={f.tankId} onChange={e=>handleTankChange(e.target.value)} style={inputStyle}>
             {TANKS_DB.map(t=><option key={t.id} value={t.id} style={{background:"#0a0f1e"}}>{t.name} ({t.id==="T3" ? t3Product : t.product})</option>)}
@@ -1862,66 +1873,66 @@ function SoundingForm({ user, onSubmit, onCancel, currentSession, t3Product }) {
 
         {f.noSounding ? (
           /* No-Sounding reason */
           <div style={{ gridColumn:"1/-1" }}>
             <Label>Reason — Cannot Perform Sounding</Label>
             <select value={f.reason} onChange={e=>set("reason",e.target.value)} style={{...inputStyle, marginBottom:10}}>
               <option value="" style={{background:"#0a0f1e"}}>— Select reason —</option>
               {NO_SOUNDING_REASONS.map(r=><option key={r} value={r} style={{background:"#0a0f1e"}}>{r}</option>)}
             </select>
             {f.reason === "Other" && (
               <input placeholder="Describe reason..." value={f.customReason} onChange={e=>set("customReason",e.target.value)} style={inputStyle} />
             )}
             <div style={{ marginTop:10, padding:"10px 14px", background:"rgba(245,158,11,0.07)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:8, fontSize:10, color:"rgba(245,158,11,0.8)" }}>
               ⚠ This entry will be logged as "No Sounding" in the inventory report. The day's stock report will show blank for this session and notify supervisors.
             </div>
           </div>
         ) : (
           /* Normal sounding fields */
           <>
             <div>
               <Label>Dip Level (cm)</Label>
               <input type="number" step="0.1" min="0" placeholder="e.g. 331" value={f.level} onChange={e=>handleLevelChange(e.target.value)} style={inputStyle} />
             </div>
             <div>
               <div style={{ fontSize:9, letterSpacing:2, textTransform:"uppercase", marginBottom:6, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
-                <span style={{ color:"rgba(0,200,255,0.5)" }}>Volume (KL)</span>
+                <span style={{ color:"rgba(0,200,255,0.5)" }}>Volume (L)</span>
                 {f.volumeFromCal
                   ? <span style={{ color:"#34d399", fontSize:8 }}>◈ AUTO — calibration table</span>
                   : <span style={{ color:"rgba(255,255,255,0.25)", fontSize:8 }}>manual input</span>}
               </div>
               <input type="number" step="0.001" min="0" placeholder="auto from calibration" value={f.volume}
                 onChange={e=>{set("volume",e.target.value);set("volumeFromCal",false);}}
                 style={{ ...inputStyle, borderColor: f.volumeFromCal?"rgba(52,211,153,0.4)":"rgba(0,200,255,0.15)" }} />
             </div>
             <div>
               <Label>Temperature (°C)</Label>
               <input type="number" step="0.1" placeholder="e.g. 30.0" value={f.temp} onChange={e=>set("temp",e.target.value)} style={inputStyle} />
             </div>
             <div>
-              <Label>Density (kg/L)</Label>
-              <input type="number" step="0.001" placeholder="e.g. 0.850" value={f.density} onChange={e=>set("density",e.target.value)} style={inputStyle} />
+              <Label>Operator Name</Label>
+              <input placeholder="e.g. Kim" value={f.operatorName} onChange={e=>set("operatorName",e.target.value)} style={inputStyle} />
             </div>
             <div style={{ gridColumn:"1/-1" }}>
               <Label>Note (optional)</Label>
               <input value={f.note} onChange={e=>set("note",e.target.value)} style={inputStyle} />
             </div>
           </>
         )}
       </div>
 
       <div style={{ display:"flex", gap:10, marginTop:24 }}>
         <button onClick={onCancel} style={{ ...btnBase, flex:1, background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.6)" }}>Cancel</button>
         <button onClick={handle} style={{ ...btnBase, flex:2, background: f.noSounding?"linear-gradient(135deg,#7a5200,#f59e0b)":"linear-gradient(135deg,#0070a8,#00c8ff)", color:"#fff" }}>
           {f.noSounding ? "SUBMIT NO-SOUNDING REMARK" : "SUBMIT SOUNDING"}
         </button>
       </div>
     </div>
   );
 }
 
 const CARGO_TANKS = TANKS_DB.filter(t => t.id === "T1" || t.id === "T2");
 
 function CargoForm({ user, onSubmit, onCancel }) {
   const [f, setF] = useState({ tankId:"T1", date:today(), type:"in", volume:"", vesselRef:"", bL:"", note:"" });
   const set = (k,v) => setF(p=>({...p,[k]:v}));
   const handle = () => {
@@ -1934,51 +1945,51 @@ function CargoForm({ user, onSubmit, onCancel }) {
       <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)", marginBottom:20 }}>Record cargo in/out activity for approval</div>
       <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
         <div>
           <Label>Tank</Label>
           <select value={f.tankId} onChange={e=>set("tankId",e.target.value)} style={inputStyle}>
             {CARGO_TANKS.map(t=><option key={t.id} value={t.id} style={{background:"#0a0f1e"}}>{t.name} ({t.product})</option>)}
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
-          <Label>Volume (KL) *</Label>
+          <Label>Volume (L) *</Label>
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
 
@@ -1994,51 +2005,51 @@ function DistribForm({ onSubmit, onCancel }) {
     <div>
       <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:28, letterSpacing:3, marginBottom:8, color:"#fb923c" }}>NEW DISTRIBUTION</div>
       <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)", marginBottom:20 }}>Record fuel issued to consumer / vehicle for approval</div>
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
           <Label>Delivery Time</Label>
           <input type="time" value={f.time} onChange={e=>set("time",e.target.value)} style={inputStyle} />
         </div>
         <div>
           <Label>Product</Label>
           <select value={f.product} onChange={e=>set("product",e.target.value)} style={inputStyle}>
             {productOptions.map(p=><option key={p} value={p} style={{background:"#0a0f1e"}}>{p}</option>)}
           </select>
         </div>
         <div>
-          <Label>Volume (KL) *</Label>
+          <Label>Volume (L) *</Label>
           <input type="number" step="0.001" min="0" placeholder="e.g. 5.0" value={f.volume} onChange={e=>set("volume",e.target.value)} style={inputStyle} />
         </div>
         <div>
           <Label>Recipient / Consumer *</Label>
           <input placeholder="e.g. PT Maju Jaya / Koperasi Tani" value={f.recipient} onChange={e=>set("recipient",e.target.value)} style={inputStyle} />
         </div>
         <div>
           <Label>Vehicle / Vessel Ref</Label>
           <input placeholder="e.g. B 1234 XY" value={f.vehicleRef} onChange={e=>set("vehicleRef",e.target.value)} style={inputStyle} />
         </div>
         <div>
           <Label>Note</Label>
           <input value={f.note} onChange={e=>set("note",e.target.value)} style={inputStyle} />
         </div>
       </div>
       <div style={{ display:"flex", gap:10, marginTop:24 }}>
         <button onClick={onCancel} style={{ ...btnBase, flex:1, background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.6)" }}>Cancel</button>
         <button onClick={handle} style={{ ...btnBase, flex:2, background:"linear-gradient(135deg,#7a3800,#fb923c)", color:"#fff" }}>
           SUBMIT DISTRIBUTION
         </button>
       </div>
     </div>
   );
 }
 
@@ -2105,81 +2116,81 @@ function SoundingLineChart({ soundings, tankId, color="#00c8ff" }) {
       <defs>
         <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
           <stop offset="0%" stopColor={color} stopOpacity="0.28"/>
           <stop offset="100%" stopColor={color} stopOpacity="0"/>
         </linearGradient>
       </defs>
       <path d={areaD} fill={`url(#${uid})`}/>
       <path d={pathD} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
       {pts.map((p, i) => (
         <g key={i}>
           <circle cx={p.x} cy={p.y} r={2.5} fill={color}/>
           <text x={p.x} y={H+14} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={7} fontFamily="monospace">{p.label}</text>
         </g>
       ))}
     </svg>
   );
 }
 
 // ─── CSV EXPORT ───────────────────────────────────────────────────────────────
 function downloadCSV(soundings, cargo) {
   const q = v => `"${String(v??'').replace(/"/g,'""')}"`;
   const rows = [
     [`DAILYSOUND EXPORT`, new Date().toLocaleString("id-ID")],
     [],
     [`SOUNDINGS`],
-    [`ID`,`Tank`,`Date`,`Session`,`Level(m)`,`Volume(KL)`,`Temp(°C)`,`Density`,`Status`,`By`,`Note`],
-    ...soundings.map(s => { const t=TANKS_DB.find(x=>x.id===s.tankId); return [s.id,t?.name||s.tankId,s.date,s.session,s.level,s.volume,s.temp,s.density,s.status,s.submittedBy,s.note]; }),
+    [`ID`,`Tank`,`Date`,`Session`,`Level(m)`,`Volume(L)`,`Temp(°C)`,`Operator`,`Status`,`By`,`Note`],
+    ...soundings.map(s => { const t=TANKS_DB.find(x=>x.id===s.tankId); return [s.id,t?.name||s.tankId,s.date,s.session,s.level,s.volume,s.temp,s.operatorName||"",s.status,s.submittedBy,s.note]; }),
     [],
     [`CARGO`],
-    [`ID`,`Tank`,`Date`,`Type`,`Volume(KL)`,`Vessel/Ref`,`B/L`,`Status`,`By`,`Note`],
+    [`ID`,`Tank`,`Date`,`Type`,`Volume(L)`,`Vessel/Ref`,`B/L`,`Status`,`By`,`Note`],
     ...cargo.map(c => { const t=TANKS_DB.find(x=>x.id===c.tankId); return [c.id,t?.name||c.tankId,c.date,c.type,c.volume,c.vesselRef,c.bL,c.status,c.submittedBy,c.note]; }),
   ];
   const csv = rows.map(r => Array.isArray(r) ? r.map(q).join(",") : "").join("\n");
   const blob = new Blob(["\uFEFF"+csv], {type:"text/csv;charset=utf-8;"});
   const url = URL.createObjectURL(blob);
   const a = document.createElement("a");
   a.href=url; a.download=`dailysound_${new Date().toISOString().split("T")[0]}.csv`;
   document.body.appendChild(a); a.click(); document.body.removeChild(a);
   setTimeout(()=>URL.revokeObjectURL(url), 1000);
 }
 
 // ─── PDF EXPORT ───────────────────────────────────────────────────────────────
 function printReport(tanks, soundings, cargo, stockLevels) {
   const fN = n => new Intl.NumberFormat("id-ID",{maximumFractionDigits:2}).format(n);
   const approved = soundings.filter(s=>s.status==="approved_manager");
   const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>DailySound Report</title>
   <style>
     *{box-sizing:border-box;margin:0;padding:0}
     body{font-family:'Courier New',monospace;font-size:11px;color:#000;padding:28px;background:#fff}
     h1{font-size:24px;letter-spacing:4px;font-weight:900}
     h2{font-size:11px;letter-spacing:2px;margin:20px 0 8px;padding-bottom:4px;border-bottom:2px solid #000;text-transform:uppercase}
     p{font-size:10px;color:#555;margin-top:3px}
     table{width:100%;border-collapse:collapse;margin-bottom:8px;font-size:10px}
     th{background:#111;color:#fff;padding:5px 8px;text-align:left;font-size:9px;letter-spacing:1px}
     td{padding:5px 8px;border-bottom:1px solid #eee}
     tr:nth-child(even) td{background:#f8f8f8}
     .hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;padding-bottom:14px;border-bottom:3px solid #000}
     .pbtn{position:fixed;top:16px;right:16px;padding:10px 22px;background:#111;color:#fff;border:none;cursor:pointer;font-family:inherit;letter-spacing:1px;font-weight:bold;font-size:11px}
     @media print{.pbtn{display:none}}
   </style></head><body>
   <button class="pbtn" onclick="window.print()">PRINT / SAVE PDF</button>
   <div class="hdr">
     <div><h1>DAILYSOUND</h1><p>Oil Inventory &amp; Sounding Control System</p></div>
     <div style="text-align:right"><p>Generated: ${new Date().toLocaleString("id-ID")}</p><p>${soundings.length} soundings &nbsp;·&nbsp; ${cargo.length} cargo records</p></div>
   </div>
   <h2>Tank Summary</h2>
-  <table><thead><tr><th>Tank</th><th>Product</th><th>Capacity (KL)</th><th>Stock (KL)</th><th>Fill %</th></tr></thead><tbody>
+  <table><thead><tr><th>Tank</th><th>Product</th><th>Capacity (L)</th><th>Stock (L)</th><th>Fill %</th></tr></thead><tbody>
   ${tanks.map(t=>{const v=stockLevels[t.id]||0;const p=Math.round(v/t.capacity*100);return`<tr><td>${t.name}</td><td>${t.product}</td><td>${fN(t.capacity)}</td><td>${fN(v)}</td><td>${p}%</td></tr>`;}).join("")}
   </tbody></table>
   <h2>Approved Soundings</h2>
-  <table><thead><tr><th>ID</th><th>Tank</th><th>Date</th><th>Session</th><th>Level(m)</th><th>Volume(KL)</th><th>Temp(°C)</th><th>Density</th><th>By</th></tr></thead><tbody>
-  ${approved.map(s=>{const t=TANKS_DB.find(x=>x.id===s.tankId);return`<tr><td>${s.id}</td><td>${t?.name||s.tankId}</td><td>${s.date}</td><td>${s.session}</td><td>${s.level}</td><td>${fN(s.volume)}</td><td>${s.temp}</td><td>${s.density}</td><td>${s.submittedBy}</td></tr>`;}).join("")}
+  <table><thead><tr><th>ID</th><th>Tank</th><th>Date</th><th>Session</th><th>Level(m)</th><th>Volume(L)</th><th>Temp(°C)</th><th>Operator</th><th>By</th></tr></thead><tbody>
+  ${approved.map(s=>{const t=TANKS_DB.find(x=>x.id===s.tankId);return`<tr><td>${s.id}</td><td>${t?.name||s.tankId}</td><td>${s.date}</td><td>${s.session}</td><td>${s.level}</td><td>${fN(s.volume)}</td><td>${s.temp}</td><td>${s.operatorName||""}</td><td>${s.submittedBy}</td></tr>`;}).join("")}
   </tbody></table>
   <h2>Approved Cargo</h2>
-  <table><thead><tr><th>ID</th><th>Tank</th><th>Date</th><th>Type</th><th>Volume(KL)</th><th>Vessel</th><th>B/L</th><th>By</th></tr></thead><tbody>
+  <table><thead><tr><th>ID</th><th>Tank</th><th>Date</th><th>Type</th><th>Volume(L)</th><th>Vessel</th><th>B/L</th><th>By</th></tr></thead><tbody>
   ${cargo.filter(c=>c.status==="approved_manager").map(c=>{const t=TANKS_DB.find(x=>x.id===c.tankId);return`<tr><td>${c.id}</td><td>${t?.name||c.tankId}</td><td>${c.date}</td><td>${c.type.toUpperCase()}</td><td>${fN(c.volume)}</td><td>${c.vesselRef}</td><td>${c.bL}</td><td>${c.submittedBy}</td></tr>`;}).join("")}
   </tbody></table>
   </body></html>`;
   const w = window.open("","_blank","width=960,height=720");
   if(w){ w.document.write(html); w.document.close(); }
 }
 
EOF
)
