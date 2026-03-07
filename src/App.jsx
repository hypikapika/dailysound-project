import { useState, useEffect, useMemo } from "react";

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Barlow+Condensed:wght@300;400;500;600;700;800&display=swap');

  :root{
    --bg:#050810;
    --bg2:#071126;
    --card:#0a1324;
    --card2:#0d1830;
    --line:rgba(255,255,255,0.07);
    --line2:rgba(0,200,255,0.16);
    --text:#ffffff;
    --muted:rgba(255,255,255,0.58);
    --cyan:#00c8ff;
    --cyan2:#4fd9ff;
    --green:#34d399;
    --yellow:#fbbf24;
    --red:#ef4444;
    --blue:#60a5fa;
    --purple:#a78bfa;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { min-height: 100%; }
  body {
    background:
      radial-gradient(circle at 15% 10%, rgba(0,200,255,0.08), transparent 24%),
      radial-gradient(circle at 85% 20%, rgba(96,165,250,0.07), transparent 22%),
      linear-gradient(180deg,#04070d 0%, #050810 100%);
    color: var(--text);
    font-family: 'Share Tech Mono', monospace;
  }

  ::-webkit-scrollbar { width: 7px; height: 7px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(0,200,255,0.18); border-radius: 999px; }

  input, select, textarea, button {
    outline: none;
    font-family: 'Share Tech Mono', monospace;
  }

  input, select, textarea { color-scheme: dark; }

  input:focus, select:focus, textarea:focus {
    border-color: var(--cyan) !important;
    box-shadow: 0 0 0 2px rgba(0,200,255,0.12);
  }

  input[type="date"]::-webkit-calendar-picker-indicator {
    filter: invert(1);
    opacity: 0.85;
    cursor: pointer;
  }

  .nav-btn { transition: all .18s ease; cursor:pointer; }
  .nav-btn:hover {
    background: linear-gradient(90deg, rgba(0,200,255,0.10), rgba(0,200,255,0.03)) !important;
    border-color: rgba(0,200,255,0.22) !important;
  }
  .nav-btn.active {
    background: linear-gradient(90deg, rgba(0,200,255,0.15), rgba(0,200,255,0.04)) !important;
    border-left: 2px solid var(--cyan) !important;
    box-shadow: inset 0 0 0 1px rgba(0,200,255,0.08);
  }

  .row:hover {
    background: linear-gradient(90deg, rgba(0,200,255,0.035), rgba(255,255,255,0.01)) !important;
  }

  .btn-act { transition: all .16s; cursor:pointer; }
  .btn-act:hover { filter: brightness(1.08); transform: translateY(-1px); }
  .btn-act:active { transform: scale(.98); }

  .modal-bg { animation: fIn .15s ease; }
  .modal-card { animation: sUp .22s ease; }

  @keyframes fIn { from{opacity:0} to{opacity:1} }
  @keyframes sUp { from{transform:translateY(18px);opacity:0} to{transform:translateY(0);opacity:1} }

  .toast-anim { animation: tIn .3s ease; }
  @keyframes tIn { from{transform:translateX(60px);opacity:0} to{transform:translateX(0);opacity:1} }

  .pulse { animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.45} }

  .tank-bar {
    transition: width .65s cubic-bezier(.4,0,.2,1), height .65s cubic-bezier(.4,0,.2,1);
  }

  .glass {
    background: linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.02));
    backdrop-filter: blur(10px);
  }

  .grid-bg{
    background-image:
      linear-gradient(rgba(0,200,255,0.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,200,255,0.035) 1px, transparent 1px);
    background-size: 34px 34px;
  }

  .sidebar-slide { transition: transform .25s cubic-bezier(.4,0,.2,1), opacity .25s; }
  .sidebar-overlay { animation: fIn .2s ease; }

  .bottom-nav-item {
    transition: all .15s;
    cursor: pointer;
    display:flex;
    flex-direction:column;
    align-items:center;
    gap:3px;
    padding:8px 4px;
    border-radius:10px;
    flex:1;
  }
  .bottom-nav-item:active { transform: scale(.94); }

  .kpi-accent {
    position:absolute;
    inset:auto auto 0 0;
    height:2px;
    width:100%;
    background: linear-gradient(90deg, rgba(0,200,255,.8), rgba(52,211,153,.7), transparent 88%);
    opacity:.75;
  }
`;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  SUPERVISOR: "supervisor",
  USER: "user",
};

const PERMS = {
  admin: {
    createSounding: true,
    approveSounding: true,
    createCargo: true,
    approveCargo: true,
    createDistrib: true,
    approveDistrib: true,
    viewAll: true,
    manageUsers: true,
    closeStock: true,
    deleteRecord: true,
  },
  manager: {
    createSounding: true,
    approveSounding: true,
    createCargo: true,
    approveCargo: true,
    createDistrib: true,
    approveDistrib: true,
    viewAll: true,
    manageUsers: false,
    closeStock: true,
    deleteRecord: true,
  },
  supervisor: {
    createSounding: true,
    approveSounding: true,
    createCargo: true,
    approveCargo: false,
    createDistrib: true,
    approveDistrib: true,
    viewAll: true,
    manageUsers: false,
    closeStock: false,
    deleteRecord: false,
  },
  user: {
    createSounding: true,
    approveSounding: false,
    createCargo: true,
    approveCargo: false,
    createDistrib: true,
    approveDistrib: false,
    viewAll: false,
    manageUsers: false,
    closeStock: false,
    deleteRecord: false,
  },
};

const USERS_DB = [
  { id: 1, name: "Takim", username: "takim", password: "takim123", role: "admin", avatar: "TK", dept: "Management" },
  { id: 2, name: "Manager", username: "manager", password: "manager123", role: "manager", avatar: "MG", dept: "Operations" },
  { id: 3, name: "Subandi", username: "subandi", password: "subandi123", role: "supervisor", avatar: "SB", dept: "Deck" },
  { id: 4, name: "Kim", username: "kim", password: "kim123", role: "user", avatar: "KM", dept: "Crew" },
];

const TANKS_DB = [
  {
    id: "T1",
    name: "Tank 1 HSD",
    type: "shore",
    capacity: 5000,
    product: "HSD",
    calibration: [
      { cm: 0, kl: 0 }, { cm: 100, kl: 500 }, { cm: 200, kl: 1000 }, { cm: 300, kl: 1500 },
      { cm: 400, kl: 2000 }, { cm: 500, kl: 2500 }, { cm: 600, kl: 3000 }, { cm: 700, kl: 3500 },
      { cm: 800, kl: 4000 }, { cm: 900, kl: 4500 }, { cm: 1000, kl: 5000 }
    ]
  },
  {
    id: "T2",
    name: "Tank 2 FAME",
    type: "shore",
    capacity: 1000,
    product: "FAME",
    calibration: [
      { cm: 0, kl: 0 }, { cm: 100, kl: 100 }, { cm: 200, kl: 200 }, { cm: 300, kl: 300 },
      { cm: 400, kl: 400 }, { cm: 500, kl: 500 }, { cm: 600, kl: 600 }, { cm: 700, kl: 700 },
      { cm: 800, kl: 800 }, { cm: 900, kl: 900 }, { cm: 1000, kl: 1000 }
    ]
  },
  {
    id: "T3",
    name: "Tank 3",
    type: "shore",
    capacity: 850,
    product: "HSD",
    calibration: [
      { cm: 0, kl: 0 }, { cm: 100, kl: 94 }, { cm: 200, kl: 189 }, { cm: 300, kl: 283 },
      { cm: 400, kl: 378 }, { cm: 500, kl: 472 }, { cm: 600, kl: 567 }, { cm: 700, kl: 661 },
      { cm: 800, kl: 756 }, { cm: 900, kl: 850 }
    ]
  },
  {
    id: "T4",
    name: "Tank 4 Biosolar",
    type: "shore",
    capacity: 110,
    product: "Biosolar",
    calibration: [
      { cm: 0, kl: 0 }, { cm: 50, kl: 15.7 }, { cm: 100, kl: 31.4 }, { cm: 150, kl: 47.1 },
      { cm: 200, kl: 62.9 }, { cm: 250, kl: 78.6 }, { cm: 300, kl: 94.3 }, { cm: 350, kl: 110 }
    ]
  },
];

const DEAD_LEVEL = { cm: 30, volume: 150 };
const ALERT_LEVEL = { cm: 10, volume: 54 };

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function getVolumeFromLevel(tankId, levelCm) {
  const tank = TANKS_DB.find((t) => t.id === tankId);
  if (!tank?.calibration || levelCm === "" || levelCm === null || levelCm === undefined) return null;

  const cm = parseFloat(levelCm);
  if (isNaN(cm) || cm < 0) return null;

  const cal = tank.calibration;
  if (cm <= cal[0].cm) return cal[0].kl;
  if (cm >= cal[cal.length - 1].cm) return cal[cal.length - 1].kl;

  for (let i = 0; i < cal.length - 1; i++) {
    if (cm >= cal[i].cm && cm <= cal[i + 1].cm) {
      const ratio = (cm - cal[i].cm) / (cal[i + 1].cm - cal[i].cm);
      return parseFloat((cal[i].kl + ratio * (cal[i + 1].kl - cal[i].kl)).toFixed(3));
    }
  }
  return null;
}

const today = () => new Date().toISOString().split("T")[0];
const fmt = (n) => new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(n ?? 0);
const fmt1 = (n) => new Intl.NumberFormat("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n ?? 0);
const fmtLiter = (n) => new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(n ?? 0);
const fmtPct = (n) => `${Number(n ?? 0).toFixed(1)}%`;
const fmtDate = (d) =>
  new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
const fmtTime = () =>
  new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

function genId(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

function cardStyle(extra = {}) {
  return {
    background: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.02))",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 18,
    padding: 16,
    boxShadow: "0 10px 26px rgba(0,0,0,0.18)",
    ...extra,
  };
}

function btnPrimaryStyle() {
  return {
    background: "linear-gradient(135deg,#0070a8,#00c8ff)",
    border: "none",
    borderRadius: 10,
    padding: "10px 14px",
    color: "#fff",
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: 800,
    cursor: "pointer",
  };
}

function btnGhostStyle() {
  return {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    padding: "10px 14px",
    color: "#fff",
    fontSize: 12,
    cursor: "pointer",
  };
}

function inputStyle() {
  return {
    width: "100%",
    background: "rgba(0,200,255,0.05)",
    border: "1px solid rgba(0,200,255,0.15)",
    borderRadius: 10,
    padding: "11px 14px",
    color: "#fff",
    fontSize: 13,
  };
}

function getProductColor(product) {
  if (product === "HSD") return "#34d399";
  if (product === "FAME") return "#60a5fa";
  if (product === "Biosolar") return "#fbbf24";
  return "#00c8ff";
}

// ─── SEED DATA ────────────────────────────────────────────────────────────────
const SEED_SOUNDINGS = [
  {
    id: "S001",
    tankId: "T1",
    date: "2026-03-07",
    session: "morning",
    time: "07:15",
    noSounding: false,
    reason: "",
    level: 331,
    volume: 1655,
    volumeLiter: 1655000,
    temp: 30,
    operatorName: "Nikco",
    status: "approved_manager",
    submittedBy: "nikco",
    supervisorApproval: "approved",
    managerApproval: "approved",
    note: "Opening stock",
  },
  {
    id: "S002",
    tankId: "T2",
    date: "2026-03-07",
    session: "morning",
    time: "07:30",
    noSounding: false,
    reason: "",
    level: 925,
    volume: 925,
    volumeLiter: 925000,
    temp: 30,
    operatorName: "Nota",
    status: "approved_manager",
    submittedBy: "nota",
    supervisorApproval: "approved",
    managerApproval: "approved",
    note: "Opening stock",
  },
  {
    id: "S003",
    tankId: "T3",
    date: "2026-03-07",
    session: "morning",
    time: "07:45",
    noSounding: false,
    reason: "",
    level: 827,
    volume: 781,
    volumeLiter: 781000,
    temp: 30,
    operatorName: "Nicko",
    status: "approved_manager",
    submittedBy: "nicko",
    supervisorApproval: "approved",
    managerApproval: "approved",
    note: "Opening stock",
  },
  {
    id: "S004",
    tankId: "T4",
    date: "2026-03-07",
    session: "morning",
    time: "08:00",
    noSounding: false,
    reason: "",
    level: 57,
    volume: 17.9,
    volumeLiter: 17900,
    temp: 31,
    operatorName: "Nota",
    status: "approved_manager",
    submittedBy: "nota",
    supervisorApproval: "approved",
    managerApproval: "approved",
    note: "Opening stock",
  },
];

const SEED_DISTRIBUTIONS = [
  {
    id: "D001",
    tankId: "T4",
    date: "2026-03-07",
    time: "09:15",
    volume: 5.0,
    recipient: "Koperasi Tani Makmur",
    vehicleRef: "B 1122 CD",
    product: "Biosolar B35",
    status: "approved_manager",
    submittedBy: "kim",
    supervisorApproval: "approved",
    managerApproval: "approved",
    note: "Subsidi kuota harian",
  },
];

const SEED_CARGO = [
  {
    id: "C001",
    tankId: "T1",
    type: "in",
    date: "2026-03-05",
    volume: 3000,
    vesselRef: "MT Pertiwi",
    bL: "BL-2026-001",
    status: "approved_manager",
    submittedBy: "kim",
    supervisorApproval: "approved",
    managerApproval: "approved",
    note: "Loading HSD from refinery",
  },
  {
    id: "C002",
    tankId: "T2",
    type: "out",
    date: "2026-03-05",
    volume: 1500,
    vesselRef: "MT Merdeka",
    bL: "BL-2026-002",
    status: "pending_supervisor",
    submittedBy: "kim",
    supervisorApproval: "pending",
    managerApproval: "pending",
    note: "FAME discharge to vessel",
  },
  {
    id: "C003",
    tankId: "T1",
    type: "in",
    date: "2026-03-06",
    volume: 800,
    vesselRef: "MT Nusantara",
    bL: "BL-2026-003",
    status: "approved_supervisor",
    submittedBy: "subandi",
    supervisorApproval: "approved",
    managerApproval: "pending",
    note: "HSD loading",
  },
];

const computeStockFromSoundings = () => {
  const stock = {};
  TANKS_DB.forEach((t) => {
    const latest = SEED_SOUNDINGS.filter((s) => s.tankId === t.id && s.status === "approved_manager")
      .sort((a, b) => b.date.localeCompare(a.date) || (b.session === "afternoon" ? 1 : -1));
    stock[t.id] = latest[0]?.volume || Math.round(t.capacity * 0.6);
  });
  return stock;
};

// ─── BADGES ───────────────────────────────────────────────────────────────────
const STATUS_STYLE = {
  pending_supervisor: { bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.3)", color: "#fbbf24", label: "Pending Supervisor" },
  approved_supervisor: { bg: "rgba(96,165,250,0.12)", border: "rgba(96,165,250,0.3)", color: "#60a5fa", label: "Pending Manager" },
  approved_manager: { bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.3)", color: "#34d399", label: "Approved" },
  rejected: { bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.3)", color: "#ef4444", label: "Rejected" },
  closed: { bg: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.3)", color: "#a78bfa", label: "Closed" },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.pending_supervisor;
  return (
    <span
      style={{
        fontSize: 10,
        padding: "4px 8px",
        borderRadius: 999,
        background: s.bg,
        border: `1px solid ${s.border}`,
        color: s.color,
        fontWeight: 700,
        letterSpacing: 0.4,
      }}
    >
      {s.label}
    </span>
  );
}

function RoleBadge({ role }) {
  const c = { admin: "#ef4444", manager: "#60a5fa", supervisor: "#a78bfa", user: "#34d399" }[role] || "#fff";
  return (
    <span
      style={{
        fontSize: 9,
        padding: "3px 8px",
        borderRadius: 999,
        border: `1px solid ${c}40`,
        color: c,
        background: `${c}15`,
        fontWeight: 800,
        letterSpacing: 1,
        textTransform: "uppercase",
      }}
    >
      {role}
    </span>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [un, setUn] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = () => {
    setLoading(true);
    setTimeout(() => {
      const u = USERS_DB.find((x) => x.username === un && x.password === pw);
      if (u) onLogin(u);
      else {
        setErr("Invalid credentials");
        setLoading(false);
      }
    }, 350);
  };

  return (
    <div
      className="grid-bg"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        padding: 20,
      }}
    >
      <style>{GLOBAL_CSS}</style>

      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 700,
          height: 700,
          background: "radial-gradient(circle, rgba(0,200,255,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ width: 430, maxWidth: "100%", position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: 34 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 12,
                background: "rgba(0,200,255,0.1)",
                border: "1px solid rgba(0,200,255,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                boxShadow: "0 0 28px rgba(0,200,255,0.18)",
              }}
            >
              ⛽
            </div>
          </div>
          <div
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800,
              fontSize: 44,
              letterSpacing: 4,
              color: "#fff",
              lineHeight: 1,
            }}
          >
            DAILY<span style={{ color: "#00c8ff" }}>SOUND</span>
          </div>
          <div
            style={{
              fontSize: 10,
              letterSpacing: 3,
              color: "rgba(255,255,255,0.34)",
              textTransform: "uppercase",
              marginTop: 8,
            }}
          >
            Oil Inventory & Sounding Control System
          </div>
        </div>

        <div
          className="glass"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 20,
            padding: 30,
            boxShadow: "0 24px 70px rgba(0,0,0,0.28)",
          }}
        >
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 10, letterSpacing: 2, color: "rgba(0,200,255,0.65)", marginBottom: 8, textTransform: "uppercase" }}>
              Username
            </label>
            <input
              value={un}
              onChange={(e) => {
                setUn(e.target.value);
                setErr("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handle()}
              style={inputStyle()}
            />
          </div>

          <div style={{ marginBottom: 6 }}>
            <label style={{ display: "block", fontSize: 10, letterSpacing: 2, color: "rgba(0,200,255,0.65)", marginBottom: 8, textTransform: "uppercase" }}>
              Password
            </label>
            <input
              type="password"
              value={pw}
              onChange={(e) => {
                setPw(e.target.value);
                setErr("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handle()}
              style={inputStyle()}
            />
          </div>

          {err && <div style={{ color: "#ef4444", fontSize: 11, marginBottom: 10 }}>{err}</div>}

          <button onClick={handle} disabled={loading} className="btn-act" style={{ ...btnPrimaryStyle(), width: "100%", marginTop: 20, padding: "13px" }}>
            {loading ? "AUTHENTICATING..." : "SIGN IN"}
          </button>
        </div>

        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 10, letterSpacing: 2, color: "rgba(255,255,255,0.22)", textAlign: "center", marginBottom: 10, textTransform: "uppercase" }}>
            Quick Login
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {USERS_DB.map((u) => (
              <div
                key={u.id}
                onClick={() => {
                  setUn(u.username);
                  setPw(u.password);
                  setErr("");
                }}
                style={{
                  padding: "12px 12px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 12,
                  cursor: "pointer",
                  transition: "all .15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(0,200,255,0.3)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)")}
              >
                <div style={{ fontSize: 12, color: "#fff" }}>{u.username}</div>
                <div style={{ marginTop: 5 }}>
                  <RoleBadge role={u.role} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL ────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div
      className="modal-bg"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.52)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        className="modal-card"
        style={{
          width: 700,
          maxWidth: "100%",
          background: "#071126",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 24,
          padding: 24,
          boxShadow: "0 24px 80px rgba(0,0,0,0.36)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{title}</div>
          <button onClick={onClose} style={{ ...btnGhostStyle(), padding: "12px 18px" }}>
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── FORMS ────────────────────────────────────────────────────────────────────
function NewSoundingForm({ onSubmit, onCancel, currentUser }) {
  const [tankId, setTankId] = useState("T1");
  const [date, setDate] = useState(today());
  const [session, setSession] = useState("morning");
  const [time, setTime] = useState(fmtTime());
  const [level, setLevel] = useState("");
  const [temp, setTemp] = useState(30);
  const [note, setNote] = useState("");
  const [noSounding, setNoSounding] = useState(false);
  const [reason, setReason] = useState("");
  const [operatorName, setOperatorName] = useState(currentUser?.name || "");

  const volume = noSounding ? null : getVolumeFromLevel(tankId, level);
  const volumeLiter = volume !== null ? Math.round(volume * 1000) : null;

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <select value={tankId} onChange={(e) => setTankId(e.target.value)} style={inputStyle()}>
        {TANKS_DB.map((t) => (
          <option key={t.id} value={t.id} style={{ color: "#000" }}>
            {t.id} - {t.name}
          </option>
        ))}
      </select>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle()} />
        <select value={session} onChange={(e) => setSession(e.target.value)} style={inputStyle()}>
          <option value="morning" style={{ color: "#000" }}>Morning</option>
          <option value="afternoon" style={{ color: "#000" }}>Afternoon</option>
        </select>
      </div>

      <input value={time} onChange={(e) => setTime(e.target.value)} placeholder="HH:MM" style={inputStyle()} />

      <input
        placeholder="Operator Name"
        value={operatorName}
        onChange={(e) => setOperatorName(e.target.value)}
        style={inputStyle()}
      />

      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
        <input type="checkbox" checked={noSounding} onChange={(e) => setNoSounding(e.target.checked)} />
        No Sounding
      </label>

      {!noSounding ? (
        <>
          <input
            type="number"
            placeholder="Level (cm)"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            style={inputStyle()}
          />

          <input
            type="number"
            placeholder="Temperature"
            value={temp}
            onChange={(e) => setTemp(e.target.value)}
            style={inputStyle()}
          />

          <input
            type="number"
            placeholder="Volume (Liter)"
            value={volumeLiter ?? ""}
            readOnly
            style={{
              ...inputStyle(),
              background: "rgba(255,255,255,0.04)",
              color: "#9fe8ff",
            }}
          />

          <div style={{ ...cardStyle(), padding: 14 }}>
            <div>Calculated volume (KL): <b>{volume !== null ? `${fmt(volume)} KL` : "-"}</b></div>
            <div style={{ marginTop: 6 }}>Calculated volume (Liter): <b>{volumeLiter !== null ? `${fmtLiter(volumeLiter)} L` : "-"}</b></div>
          </div>
        </>
      ) : (
        <input
          placeholder="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          style={inputStyle()}
        />
      )}

      <textarea
        rows={4}
        placeholder="Note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        style={inputStyle()}
      />

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button onClick={onCancel} style={btnGhostStyle()}>Cancel</button>
        <button
          onClick={() =>
            onSubmit({
              tankId,
              date,
              session,
              time,
              operatorName,
              noSounding,
              reason,
              level: noSounding ? null : Number(level),
              volume: noSounding ? null : volume,
              volumeLiter: noSounding ? null : volumeLiter,
              temp: noSounding ? null : Number(temp),
              note,
            })
          }
          style={btnPrimaryStyle()}
        >
          Submit
        </button>
      </div>
    </div>
  );
}

function NewCargoForm({ onSubmit, onCancel }) {
  const [tankId, setTankId] = useState("T1");
  const [type, setType] = useState("in");
  const [date, setDate] = useState(today());
  const [volume, setVolume] = useState("");
  const [vesselRef, setVesselRef] = useState("");
  const [bL, setBL] = useState("");
  const [note, setNote] = useState("");

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <select value={tankId} onChange={(e) => setTankId(e.target.value)} style={inputStyle()}>
        {TANKS_DB.map((t) => (
          <option key={t.id} value={t.id} style={{ color: "#000" }}>
            {t.id} - {t.name}
          </option>
        ))}
      </select>

      <select value={type} onChange={(e) => setType(e.target.value)} style={inputStyle()}>
        <option value="in" style={{ color: "#000" }}>Cargo In</option>
        <option value="out" style={{ color: "#000" }}>Cargo Out</option>
      </select>

      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle()} />
      <input type="number" placeholder="Volume (KL)" value={volume} onChange={(e) => setVolume(e.target.value)} style={inputStyle()} />
      <input placeholder="Vessel Ref" value={vesselRef} onChange={(e) => setVesselRef(e.target.value)} style={inputStyle()} />
      <input placeholder="B/L Number" value={bL} onChange={(e) => setBL(e.target.value)} style={inputStyle()} />
      <textarea rows={3} placeholder="Note" value={note} onChange={(e) => setNote(e.target.value)} style={inputStyle()} />

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button onClick={onCancel} style={btnGhostStyle()}>Cancel</button>
        <button
          onClick={() => onSubmit({ tankId, type, date, volume: Number(volume), vesselRef, bL, note })}
          style={btnPrimaryStyle()}
        >
          Submit
        </button>
      </div>
    </div>
  );
}

function NewDistributionForm({ onSubmit, onCancel }) {
  const [tankId, setTankId] = useState("T4");
  const [date, setDate] = useState(today());
  const [time, setTime] = useState(fmtTime());
  const [volume, setVolume] = useState("");
  const [recipient, setRecipient] = useState("");
  const [vehicleRef, setVehicleRef] = useState("");
  const [product, setProduct] = useState("Biosolar B35");
  const [note, setNote] = useState("");

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <select value={tankId} onChange={(e) => setTankId(e.target.value)} style={inputStyle()}>
        {TANKS_DB.map((t) => (
          <option key={t.id} value={t.id} style={{ color: "#000" }}>
            {t.id} - {t.name}
          </option>
        ))}
      </select>

      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle()} />
      <input value={time} onChange={(e) => setTime(e.target.value)} placeholder="HH:MM" style={inputStyle()} />
      <input type="number" placeholder="Volume (KL)" value={volume} onChange={(e) => setVolume(e.target.value)} style={inputStyle()} />
      <input placeholder="Recipient" value={recipient} onChange={(e) => setRecipient(e.target.value)} style={inputStyle()} />
      <input placeholder="Vehicle Ref" value={vehicleRef} onChange={(e) => setVehicleRef(e.target.value)} style={inputStyle()} />
      <input placeholder="Product" value={product} onChange={(e) => setProduct(e.target.value)} style={inputStyle()} />
      <textarea rows={3} placeholder="Note" value={note} onChange={(e) => setNote(e.target.value)} style={inputStyle()} />

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button onClick={onCancel} style={btnGhostStyle()}>Cancel</button>
        <button
          onClick={() => onSubmit({ tankId, date, time, volume: Number(volume), recipient, vehicleRef, product, note })}
          style={btnPrimaryStyle()}
        >
          Submit
        </button>
      </div>
    </div>
  );
}

// ─── SMALL UI COMPONENTS ──────────────────────────────────────────────────────
function KPI({ title, value, sub, accent = "cyan", icon = "◈" }) {
  const accentColor =
    accent === "green" ? "#34d399" :
    accent === "yellow" ? "#fbbf24" :
    accent === "red" ? "#ef4444" :
    accent === "blue" ? "#60a5fa" :
    "#00c8ff";

  return (
    <div
      style={{
        ...cardStyle(),
        position: "relative",
        minHeight: 116,
        overflow: "hidden",
        background: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.52)", letterSpacing: 0.5 }}>{title}</div>
          <div style={{ marginTop: 10, fontSize: 26, fontWeight: 800, lineHeight: 1.1 }}>{value}</div>
          {sub ? <div style={{ marginTop: 8, fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{sub}</div> : null}
        </div>
        <div
          style={{
            minWidth: 40,
            height: 40,
            borderRadius: 12,
            border: `1px solid ${accentColor}35`,
            background: `${accentColor}12`,
            color: accentColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 18px ${accentColor}15`,
          }}
        >
          {icon}
        </div>
      </div>
      <div className="kpi-accent" />
    </div>
  );
}

function SectionTitle({ title, sub, right }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      <div>
        <div style={{ fontSize: 16, fontWeight: 800 }}>{title}</div>
        {sub ? <div style={{ marginTop: 4, fontSize: 11, color: "rgba(255,255,255,0.48)" }}>{sub}</div> : null}
      </div>
      {right}
    </div>
  );
}

function MiniStat({ label, value, sub, color = "#00c8ff" }) {
  return (
    <div
      style={{
        ...cardStyle({ padding: 14 }),
        background: "linear-gradient(180deg, rgba(255,255,255,0.028), rgba(255,255,255,0.018))",
      }}
    >
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.48)" }}>{label}</div>
      <div style={{ marginTop: 8, fontSize: 23, fontWeight: 800, color }}>{value}</div>
      {sub ? <div style={{ marginTop: 6, fontSize: 11, color: "rgba(255,255,255,0.42)" }}>{sub}</div> : null}
    </div>
  );
}

function ProgressBar({ value, color, height = 12, bg = "rgba(255,255,255,0.06)" }) {
  const safe = Math.max(0, Math.min(100, value || 0));
  return (
    <div style={{ height, background: bg, borderRadius: 999, overflow: "hidden" }}>
      <div
        className="tank-bar"
        style={{
          height: "100%",
          width: `${safe}%`,
          background: color,
          borderRadius: 999,
          boxShadow: "0 0 16px rgba(0,200,255,0.10)",
        }}
      />
    </div>
  );
}

function DonutRing({ value = 0, label = "", sub = "", color = "#00c8ff", size = 156 }) {
  const safe = Math.max(0, Math.min(100, value));
  const angle = safe * 3.6;
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: `conic-gradient(${color} ${angle}deg, rgba(255,255,255,0.08) ${angle}deg 360deg)`,
          display: "grid",
          placeItems: "center",
          boxShadow: `0 0 26px ${color}10 inset`,
        }}
      >
        <div
          style={{
            width: size * 0.72,
            height: size * 0.72,
            borderRadius: "50%",
            background: "#0a1324",
            border: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: 8,
          }}
        >
          <div style={{ fontSize: 24, fontWeight: 800 }}>{safe.toFixed(1)}%</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>{label}</div>
          {sub ? <div style={{ fontSize: 10, color: "rgba(255,255,255,0.36)", marginTop: 2 }}>{sub}</div> : null}
        </div>
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
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

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const perm = user ? PERMS[user.role] : {};
  const currentSession = clock.getHours() < 13 ? "morning" : "afternoon";
  const sessionTime = clock.getHours() < 13 ? "07:00" : "19:00";

  const getTank = (id) => TANKS_DB.find((t) => t.id === id);

  const getLatestApprovedSounding = (tankId) => {
    return soundings
      .filter((s) => s.tankId === tankId && s.status === "approved_manager")
      .sort((a, b) => b.date.localeCompare(a.date) || b.session.localeCompare(a.session))[0];
  };

  const getControlStock = (tankId, date) => {
    const approved = soundings.filter((s) => s.tankId === tankId && s.status === "approved_manager" && s.date === date);
    const morningRec = approved.find((s) => s.session === "morning");
    const afternoonRec = approved.find((s) => s.session === "afternoon");

    const morningVol = morningRec && !morningRec.noSounding ? morningRec.volume : null;
    const afternoonVol = afternoonRec && !afternoonRec.noSounding ? afternoonRec.volume : null;

    const cargoIn = cargo
      .filter((c) => c.tankId === tankId && c.date === date && c.type === "in" && c.status === "approved_manager")
      .reduce((a, c) => a + c.volume, 0);

    const cargoOut = cargo
      .filter((c) => c.tankId === tankId && c.date === date && c.type === "out" && c.status === "approved_manager")
      .reduce((a, c) => a + c.volume, 0);

    const distOut = distributions
      .filter((d) => d.tankId === tankId && d.date === date && d.status === "approved_manager")
      .reduce((a, d) => a + d.volume, 0);

    const opening = morningVol ?? closingStock[`${tankId}_${date}`] ?? stockLevels[tankId] ?? 0;

    return {
      morning: morningVol,
      afternoon: afternoonVol,
      morningRec,
      afternoonRec,
      cargoIn,
      cargoOut,
      distOut,
      opening,
      closing: afternoonVol ?? morningVol ?? closingStock[`${tankId}_${date}`] ?? null,
      noMorningSounding: !morningRec || morningRec.noSounding,
      morningReason: morningRec?.noSounding ? morningRec.reason || "No reason given" : null,
    };
  };

  const submitSounding = (data) => {
    const newS = {
      id: genId("S"),
      ...data,
      status: "pending_supervisor",
      submittedBy: user.username,
      supervisorApproval: "pending",
      managerApproval: "pending",
    };
    setSoundings((p) => [newS, ...p]);
    setModal(null);
    showToast("Sounding submitted for approval");
  };

  const approveSounding = (id, level) => {
    const item = soundings.find((x) => x.id === id);

    setSoundings((p) =>
      p.map((s) => {
        if (s.id !== id) return s;
        if (level === "supervisor") {
          const ns = {
            ...s,
            supervisorApproval: "approved",
            status: user.role === "manager" || user.role === "admin" ? "approved_manager" : "approved_supervisor",
          };
          if (user.role === "manager" || user.role === "admin") ns.managerApproval = "approved";
          return ns;
        }
        if (level === "manager") return { ...s, managerApproval: "approved", status: "approved_manager" };
        return s;
      })
    );

    if (item && !item.noSounding && item.volume != null && (level === "manager" || user.role === "manager" || user.role === "admin")) {
      setStockLevels((p) => ({ ...p, [item.tankId]: item.volume }));
    }

    showToast("Sounding approved ✓");
  };

  const rejectSounding = (id) => {
    setSoundings((p) => p.map((s) => (s.id === id ? { ...s, status: "rejected" } : s)));
    showToast("Sounding rejected", "warn");
  };

  const submitCargo = (data) => {
    const newC = {
      id: genId("C"),
      ...data,
      status: "pending_supervisor",
      submittedBy: user.username,
      supervisorApproval: "pending",
      managerApproval: "pending",
    };
    setCargo((p) => [newC, ...p]);
    setModal(null);
    showToast("Cargo activity submitted for approval");
  };

  const approveCargo = (id, level) => {
    const item = cargo.find((x) => x.id === id);

    setCargo((p) =>
      p.map((c) => {
        if (c.id !== id) return c;
        if (level === "supervisor") {
          const nc = {
            ...c,
            supervisorApproval: "approved",
            status: user.role === "manager" || user.role === "admin" ? "approved_manager" : "approved_supervisor",
          };
          if (user.role === "manager" || user.role === "admin") nc.managerApproval = "approved";
          return nc;
        }
        if (level === "manager") return { ...c, managerApproval: "approved", status: "approved_manager" };
        return c;
      })
    );

    if (item && (level === "manager" || user.role === "manager" || user.role === "admin")) {
      setStockLevels((prev) => {
        const cur = prev[item.tankId] || 0;
        return {
          ...prev,
          [item.tankId]: item.type === "in" ? cur + item.volume : Math.max(0, cur - item.volume),
        };
      });
    }

    showToast("Cargo approved ✓");
  };

  const rejectCargo = (id) => {
    setCargo((p) => p.map((c) => (c.id === id ? { ...c, status: "rejected" } : c)));
    showToast("Cargo rejected", "warn");
  };

  const submitDistribution = (data) => {
    const newD = {
      id: genId("D"),
      ...data,
      status: "pending_supervisor",
      submittedBy: user.username,
      supervisorApproval: "pending",
      managerApproval: "pending",
    };
    setDistributions((p) => [newD, ...p]);
    setModal(null);
    showToast("Distribution submitted for approval");
  };

  const approveDistribution = (id, level) => {
    const item = distributions.find((x) => x.id === id);

    setDistributions((p) =>
      p.map((d) => {
        if (d.id !== id) return d;
        if (level === "supervisor") {
          const nd = {
            ...d,
            supervisorApproval: "approved",
            status: user.role === "manager" || user.role === "admin" ? "approved_manager" : "approved_supervisor",
          };
          if (user.role === "manager" || user.role === "admin") nd.managerApproval = "approved";
          return nd;
        }
        if (level === "manager") return { ...d, managerApproval: "approved", status: "approved_manager" };
        return d;
      })
    );

    if (item && (level === "manager" || user.role === "manager" || user.role === "admin")) {
      setStockLevels((prev) => {
        const cur = prev[item.tankId] || 0;
        return { ...prev, [item.tankId]: Math.max(0, cur - item.volume) };
      });
    }

    showToast("Distribution approved ✓");
  };

  const rejectDistribution = (id) => {
    setDistributions((p) => p.map((d) => (d.id === id ? { ...d, status: "rejected" } : d)));
    showToast("Distribution rejected", "warn");
  };

  const deleteSounding = (id) => {
    setSoundings((p) => p.filter((s) => s.id !== id));
    showToast("Sounding record deleted", "warn");
  };

  const deleteCargo = (id) => {
    setCargo((p) => p.filter((c) => c.id !== id));
    showToast("Cargo record deleted", "warn");
  };

  const deleteDistribution = (id) => {
    setDistributions((p) => p.filter((d) => d.id !== id));
    showToast("Distribution record deleted", "warn");
  };

  const closeStockForDay = (tankId, date) => {
    const ctrl = getControlStock(tankId, date);
    const closing = ctrl.afternoon || ctrl.morning || stockLevels[tankId];
    setClosingStock((p) => ({ ...p, [`${tankId}_${date}`]: closing }));
    showToast(`Closing stock set for ${getTank(tankId)?.name}`);
  };

  if (!user) return <Login onLogin={setUser} />;

  const isAwaitingMe = (item) =>
    (user.role === "supervisor" && item.status === "pending_supervisor") ||
    (user.role === "manager" && (item.status === "approved_supervisor" || item.status === "pending_supervisor")) ||
    (user.role === "admin" && (item.status === "pending_supervisor" || item.status === "approved_supervisor"));

  const pendingCount =
    soundings.filter(isAwaitingMe).length +
    cargo.filter(isAwaitingMe).length +
    distributions.filter(isAwaitingMe).length;

  const navItems = [
    { id: "dashboard", icon: "◈", label: "Dashboard" },
    { id: "sounding", icon: "▾", label: "Sounding" },
    { id: "cargo", icon: "⇄", label: "Cargo" },
    { id: "distrib", icon: "▲", label: "Distribution" },
    { id: "stock", icon: "▦", label: "Stock" },
    { id: "approval", icon: "✓", label: "Approvals", badge: pendingCount },
    { id: "blend", icon: "⚗", label: "Blending" },
    ...(perm.viewAll ? [{ id: "report", icon: "◉", label: "Reports" }] : []),
    ...(perm.manageUsers ? [{ id: "users", icon: "⊕", label: "Users" }] : []),
  ];

  const handleTabChange = (id) => {
    setTab(id);
    setSidebarOpen(false);
  };

  const dashboardStats = useMemo(() => {
    const totalStock = Object.values(stockLevels).reduce((a, b) => a + b, 0);
    const totalCapacity = TANKS_DB.reduce((a, b) => a + b.capacity, 0);
    const totalStockLiter = Math.round(totalStock * 1000);
    const fillPct = totalCapacity ? (totalStock / totalCapacity) * 100 : 0;

    const tanksState = TANKS_DB.map((tank) => {
      const stock = stockLevels[tank.id] ?? 0;
      const pct = tank.capacity ? (stock / tank.capacity) * 100 : 0;
      let severity = "normal";
      if (stock <= ALERT_LEVEL.volume) severity = "critical";
      else if (stock <= DEAD_LEVEL.volume) severity = "warning";
      return {
        ...tank,
        stock,
        pct,
        severity,
      };
    });

    const criticalCount = tanksState.filter((t) => t.severity === "critical").length;
    const warningCount = tanksState.filter((t) => t.severity === "warning").length;
    const healthyCount = tanksState.filter((t) => t.severity === "normal").length;

    const approvedTodaySoundings = soundings.filter(
      (s) => s.date === filterDate && s.status === "approved_manager" && !s.noSounding
    );

    const dashboardVolumeKL = approvedTodaySoundings.reduce((a, s) => a + (s.volume || 0), 0);
    const dashboardVolumeLiter = approvedTodaySoundings.reduce((a, s) => a + (s.volumeLiter || 0), 0);

    const operatorMap = {};
    approvedTodaySoundings.forEach((s) => {
      const key = s.operatorName || "Unknown";
      operatorMap[key] = (operatorMap[key] || 0) + 1;
    });
    const operatorStats = Object.entries(operatorMap).map(([name, count]) => ({ name, count }));
    const maxOperatorCount = Math.max(...operatorStats.map((x) => x.count), 1);

    const byProduct = {};
    tanksState.forEach((t) => {
      byProduct[t.product] = (byProduct[t.product] || 0) + t.stock;
    });
    const productStats = Object.entries(byProduct).map(([product, stock]) => ({
      product,
      stock,
      pct: totalStock ? (stock / totalStock) * 100 : 0,
      color: getProductColor(product),
    }));

    const deadStockReserve = TANKS_DB.reduce((a) => a + DEAD_LEVEL.volume, 0);
    const usableStock = Math.max(totalStock - deadStockReserve, 0);
    const usablePct = totalStock ? (usableStock / totalStock) * 100 : 0;
    const reservePct = totalStock ? Math.min((deadStockReserve / totalStock) * 100, 100) : 0;

    return {
      totalStock,
      totalCapacity,
      totalStockLiter,
      fillPct,
      tanksState,
      criticalCount,
      warningCount,
      healthyCount,
      approvedTodaySoundings,
      dashboardVolumeKL,
      dashboardVolumeLiter,
      operatorStats,
      maxOperatorCount,
      productStats,
      deadStockReserve,
      usableStock,
      usablePct,
      reservePct,
    };
  }, [stockLevels, soundings, filterDate]);

  const SidebarContent = () => (
    <>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 28, letterSpacing: 3, lineHeight: 1 }}>
          DAILY<span style={{ color: "#00c8ff" }}>SOUND</span>
        </div>
        <div style={{ fontSize: 9, letterSpacing: 3, color: "rgba(0,200,255,0.42)", textTransform: "uppercase", marginTop: 3 }}>
          Stock Control System
        </div>
      </div>

      <div
        style={{
          background: "linear-gradient(180deg, rgba(0,200,255,0.06), rgba(0,200,255,0.03))",
          border: "1px solid rgba(0,200,255,0.14)",
          borderRadius: 16,
          padding: "14px 15px",
          marginBottom: 20,
          boxShadow: "0 0 28px rgba(0,200,255,0.06) inset",
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 700, color: "#00c8ff", letterSpacing: 2 }}>
          {clock.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.42)", marginTop: 4 }}>
          {clock.toLocaleDateString("id-ID", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
        </div>
        <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}>
          <span className="pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: currentSession === "morning" ? "#fbbf24" : "#60a5fa", display: "inline-block" }} />
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: 1 }}>
            {currentSession === "morning" ? "Morning" : "Afternoon"} · {sessionTime}
          </span>
        </div>
      </div>

      <div style={{ ...cardStyle(), marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>Logged in as</div>
        <div style={{ fontWeight: 800, fontSize: 15 }}>{user.name}</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>{user.dept}</div>
        <div style={{ marginTop: 10 }}>
          <RoleBadge role={user.role} />
        </div>
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        {navItems.map((item) => (
          <div
            key={item.id}
            className={`nav-btn ${tab === item.id ? "active" : ""}`}
            onClick={() => handleTabChange(item.id)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              padding: "13px 12px",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 18, textAlign: "center", color: "#00c8ff" }}>{item.icon}</span>
              {!sidebarCollapsed && <span style={{ fontSize: 12 }}>{item.label}</span>}
            </div>
            {!sidebarCollapsed && item.badge > 0 && (
              <span
                style={{
                  minWidth: 20,
                  height: 20,
                  borderRadius: 999,
                  background: "#ef4444",
                  color: "#fff",
                  fontSize: 10,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 6px",
                }}
              >
                {item.badge}
              </span>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 18, display: "flex", gap: 8 }}>
        {!isMobile && (
          <button onClick={() => setSidebarCollapsed((p) => !p)} style={{ ...btnGhostStyle(), flex: 1 }}>
            {sidebarCollapsed ? "Expand" : "Collapse"}
          </button>
        )}
        <button onClick={() => setUser(null)} style={{ ...btnGhostStyle(), flex: 1 }}>
          Logout
        </button>
      </div>
    </>
  );

  const renderDashboard = () => {
    const {
      totalStock,
      totalCapacity,
      totalStockLiter,
      fillPct,
      tanksState,
      criticalCount,
      warningCount,
      healthyCount,
      approvedTodaySoundings,
      dashboardVolumeKL,
      dashboardVolumeLiter,
      operatorStats,
      maxOperatorCount,
      productStats,
      deadStockReserve,
      usableStock,
      usablePct,
      reservePct,
    } = dashboardStats;

    return (
      <div style={{ display: "grid", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)", gap: 16 }}>
          <KPI title="Total Tanks" value={TANKS_DB.length} sub={`${healthyCount} normal · ${warningCount} warning · ${criticalCount} critical`} accent="blue" icon="▦" />
          <KPI title="Current Stock" value={`${fmt(totalStock)} KL`} sub={`${fmtLiter(totalStockLiter)} L`} accent="cyan" icon="◉" />
          <KPI title="Total Capacity" value={`${fmt(totalCapacity)} KL`} sub={`Filled ${fmtPct(fillPct)}`} accent="green" icon="⬒" />
          <KPI title="Pending Approvals" value={pendingCount} sub="Records waiting action" accent={pendingCount > 0 ? "yellow" : "green"} icon="✓" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.25fr .95fr", gap: 16 }}>
          <div style={cardStyle()}>
            <SectionTitle
              title="Inventory Stock Overview"
              sub={`Live inventory composition and stock health for ${fmtDate(filterDate)}`}
              right={
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  style={{ ...inputStyle(), width: 170 }}
                />
              }
            />

            <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 12 }}>
              <MiniStat label="Approved Soundings" value={approvedTodaySoundings.length} sub="Approved manager status" color="#ffffff" />
              <MiniStat label="Daily Volume (KL)" value={fmt(dashboardVolumeKL)} sub="Approved sounding total" color="#00c8ff" />
              <MiniStat label="Daily Volume (Liter)" value={fmtLiter(dashboardVolumeLiter)} sub="Converted from KL" color="#34d399" />
            </div>

            <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
              <div style={{ ...cardStyle(), padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 14 }}>Overall Fill Rate</div>
                <DonutRing
                  value={fillPct}
                  label="Inventory Fill"
                  sub={`${fmt(totalStock)} / ${fmt(totalCapacity)} KL`}
                  color="#00c8ff"
                  size={isMobile ? 150 : 172}
                />
                <div style={{ marginTop: 14, fontSize: 11, color: "rgba(255,255,255,0.45)", textAlign: "center" }}>
                  Percentage of total tank capacity currently occupied by stock.
                </div>
              </div>

              <div style={{ ...cardStyle(), padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 12 }}>Stock Health Summary</div>

                <div style={{ display: "grid", gap: 12 }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                      <span>Healthy Tanks</span>
                      <span>{healthyCount}</span>
                    </div>
                    <ProgressBar
                      value={TANKS_DB.length ? (healthyCount / TANKS_DB.length) * 100 : 0}
                      color="linear-gradient(90deg,#34d399,#4ade80)"
                    />
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                      <span>Warning Tanks</span>
                      <span>{warningCount}</span>
                    </div>
                    <ProgressBar
                      value={TANKS_DB.length ? (warningCount / TANKS_DB.length) * 100 : 0}
                      color="linear-gradient(90deg,#f59e0b,#fbbf24)"
                    />
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                      <span>Critical Tanks</span>
                      <span>{criticalCount}</span>
                    </div>
                    <ProgressBar
                      value={TANKS_DB.length ? (criticalCount / TANKS_DB.length) * 100 : 0}
                      color="linear-gradient(90deg,#ef4444,#fb7185)"
                    />
                  </div>
                </div>

                <div style={{ marginTop: 16, padding: 12, borderRadius: 12, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.46)" }}>Dead Stock Reserve Benchmark</div>
                  <div style={{ marginTop: 6, fontSize: 20, fontWeight: 800 }}>{fmt(deadStockReserve)} KL</div>
                  <div style={{ marginTop: 4, fontSize: 11, color: "rgba(255,255,255,0.42)" }}>
                    Based on {TANKS_DB.length} tanks × {DEAD_LEVEL.volume} KL reserve threshold.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={cardStyle()}>
            <SectionTitle title="Product Composition" sub="Inventory share by product type" />

            <div style={{ marginTop: 16, display: "grid", gap: 14 }}>
              {productStats.map((p) => (
                <div key={p.product}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 7 }}>
                    <span>{p.product}</span>
                    <span>{fmt(p.stock)} KL · {fmtPct(p.pct)}</span>
                  </div>
                  <ProgressBar
                    value={p.pct}
                    color={`linear-gradient(90deg, ${p.color}, ${p.color}aa)`}
                    height={13}
                  />
                </div>
              ))}
            </div>

            <div style={{ marginTop: 18, ...cardStyle({ padding: 14 }) }}>
              <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 12 }}>Usable vs Reserve Stock</div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                  <span>Usable Stock</span>
                  <span>{fmt(usableStock)} KL · {fmtPct(usablePct)}</span>
                </div>
                <ProgressBar
                  value={usablePct}
                  color="linear-gradient(90deg,#00c8ff,#34d399)"
                  height={14}
                />
              </div>

              <div style={{ marginTop: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                  <span>Reserve / Dead Stock</span>
                  <span>{fmt(deadStockReserve)} KL · {fmtPct(reservePct)}</span>
                </div>
                <ProgressBar
                  value={reservePct}
                  color="linear-gradient(90deg,#f59e0b,#fbbf24)"
                  height={14}
                />
              </div>

              <div style={{ marginTop: 12, fontSize: 11, color: "rgba(255,255,255,0.42)" }}>
                This helps distinguish operationally usable stock from protected reserve/dead stock threshold.
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.2fr 1fr", gap: 16 }}>
          <div style={cardStyle()}>
            <SectionTitle title="Tank Fill Graphic" sub="Per-tank inventory level against capacity" />

            <div style={{ marginTop: 16, display: "grid", gap: 14 }}>
              {tanksState.map((tank) => {
                const productColor = getProductColor(tank.product);

                return (
                  <div
                    key={tank.id}
                    style={{
                      padding: 14,
                      borderRadius: 14,
                      border: "1px solid rgba(255,255,255,0.05)",
                      background: "linear-gradient(180deg, rgba(255,255,255,0.022), rgba(255,255,255,0.01))",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                      <div>
                        <div style={{ fontWeight: 800 }}>{tank.name}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>
                          {tank.product} · Capacity {fmt(tank.capacity)} KL
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 800 }}>{fmt(tank.stock)} KL</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>
                          {fmtLiter(Math.round(tank.stock * 1000))} L
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <ProgressBar
                        value={tank.pct}
                        color={`linear-gradient(90deg, ${productColor}, ${productColor}cc)`}
                        height={14}
                      />
                    </div>

                    <div style={{ marginTop: 9, display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                      <span>Fill Ratio</span>
                      <span>{fmtPct(tank.pct)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={cardStyle()}>
            <SectionTitle title="Operator Activity Graphic" sub={`Approved sounding activity on ${fmtDate(filterDate)}`} />

            {operatorStats.length === 0 ? (
              <div style={{ marginTop: 16, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                No approved sounding data for selected date.
              </div>
            ) : (
              <div style={{ marginTop: 16, display: "grid", gap: 14 }}>
                {operatorStats.map((op) => {
                  const width = (op.count / maxOperatorCount) * 100;
                  return (
                    <div key={op.name}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 7 }}>
                        <span>{op.name}</span>
                        <span>{op.count} sounding</span>
                      </div>
                      <ProgressBar
                        value={width}
                        color="linear-gradient(90deg,#60a5fa,#00c8ff)"
                        height={14}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ marginTop: 18, ...cardStyle({ padding: 14 }) }}>
              <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10 }}>Daily Sounding Summary</div>
              <div style={{ display: "grid", gap: 10 }}>
                {approvedTodaySoundings.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: "1px solid rgba(255,255,255,0.05)",
                      background: "rgba(255,255,255,0.018)",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{getTank(s.tankId)?.name}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.42)", marginTop: 3 }}>
                        {s.operatorName} · {s.session}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{fmt(s.volume)} KL</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.42)", marginTop: 3 }}>
                        {fmtLiter(s.volumeLiter)} L
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={cardStyle()}>
          <SectionTitle title="Tank Status Panel" sub="Live tank stock, alert threshold, and latest sounding reference" />

          <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: 16 }}>
            {TANKS_DB.map((tank) => {
              const latest = getLatestApprovedSounding(tank.id);
              const volume = stockLevels[tank.id] ?? 0;
              const pct = Math.max(0, Math.min(100, (volume / tank.capacity) * 100));

              let flag = "NORMAL";
              let color = "#34d399";
              if (volume <= ALERT_LEVEL.volume) {
                flag = "CRITICAL";
                color = "#ef4444";
              } else if (volume <= DEAD_LEVEL.volume) {
                flag = "WARNING";
                color = "#fbbf24";
              }

              return (
                <div key={tank.id} style={{ ...cardStyle(), padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 15 }}>{tank.name}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
                        Product: {tank.product}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 10,
                        color,
                        border: `1px solid ${color}40`,
                        background: `${color}15`,
                        padding: "4px 9px",
                        borderRadius: 999,
                        height: "fit-content",
                        fontWeight: 800,
                      }}
                    >
                      {flag}
                    </span>
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <ProgressBar value={pct} color={`linear-gradient(90deg, ${color}, ${color}cc)`} height={13} />
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 12 }}>
                    <span>{fmt(volume)} KL</span>
                    <span>{fmtPct(pct)}</span>
                  </div>

                  <div style={{ marginTop: 6, fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                    {fmtLiter(Math.round(volume * 1000))} L
                  </div>

                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)", display: "grid", gap: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(255,255,255,0.48)" }}>
                      <span>Dead Level Threshold</span>
                      <span>{fmt(DEAD_LEVEL.volume)} KL</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(255,255,255,0.48)" }}>
                      <span>Critical Alert Threshold</span>
                      <span>{fmt(ALERT_LEVEL.volume)} KL</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(255,255,255,0.48)" }}>
                      <span>Latest Sounding</span>
                      <span>{latest ? `${fmtDate(latest.date)} ${latest.session}` : "-"}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderSounding = () => (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ ...cardStyle(), display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <SectionTitle
          title="Sounding Records"
          sub="Daily tank sounding submissions"
          right={
            <div style={{ display: "flex", gap: 10 }}>
              <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} style={{ ...inputStyle(), width: 170 }} />
              {perm.createSounding && (
                <button onClick={() => setModal("new_sounding")} style={btnPrimaryStyle()}>
                  + New Sounding
                </button>
              )}
            </div>
          }
        />
      </div>

      <div style={cardStyle()}>
        <div style={{ display: "grid", gap: 10 }}>
          {soundings.filter((s) => s.date === filterDate).length === 0 && (
            <div style={{ color: "rgba(255,255,255,0.5)" }}>No sounding records for selected date.</div>
          )}

          {soundings
            .filter((s) => s.date === filterDate)
            .map((s) => (
              <div key={s.id} className="row" style={{ padding: 14, borderRadius: 14, border: "1px solid rgba(255,255,255,0.05)", display: "grid", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontWeight: 800 }}>{getTank(s.tankId)?.name}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
                      {fmtDate(s.date)} · {s.session} · {s.time}
                    </div>
                  </div>
                  <StatusBadge status={s.status} />
                </div>

                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.88)" }}>
                  {s.noSounding ? (
                    <>No sounding — {s.reason || "-"}</>
                  ) : (
                    <>
                      Level: {s.level} cm · Volume: {fmt(s.volume)} KL · {fmtLiter(s.volumeLiter)} L · Temp: {s.temp} °C
                    </>
                  )}
                </div>

                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                  Operator: {s.operatorName || "-"} · Submitted by: {s.submittedBy} {s.note ? `· ${s.note}` : ""}
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {isAwaitingMe(s) && perm.approveSounding && (
                    <>
                      {user.role === "supervisor" && (
                        <button onClick={() => approveSounding(s.id, "supervisor")} style={btnPrimaryStyle()}>Approve</button>
                      )}
                      {(user.role === "manager" || user.role === "admin") && (
                        <button
                          onClick={() => approveSounding(s.id, s.status === "pending_supervisor" ? "supervisor" : "manager")}
                          style={btnPrimaryStyle()}
                        >
                          Approve
                        </button>
                      )}
                      <button onClick={() => rejectSounding(s.id)} style={btnGhostStyle()}>Reject</button>
                    </>
                  )}

                  {perm.deleteRecord && (
                    <button onClick={() => deleteSounding(s.id)} style={btnGhostStyle()}>
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  const renderCargo = () => (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ ...cardStyle(), display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <SectionTitle
          title="Cargo Activity"
          sub="Loading and discharge records"
          right={
            perm.createCargo ? (
              <button onClick={() => setModal("new_cargo")} style={btnPrimaryStyle()}>
                + New Cargo
              </button>
            ) : null
          }
        />
      </div>

      <div style={cardStyle()}>
        <div style={{ display: "grid", gap: 10 }}>
          {cargo.map((c) => (
            <div key={c.id} className="row" style={{ padding: 14, borderRadius: 14, border: "1px solid rgba(255,255,255,0.05)", display: "grid", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontWeight: 800 }}>{getTank(c.tankId)?.name}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
                    {fmtDate(c.date)} · {c.type === "in" ? "Cargo In" : "Cargo Out"}
                  </div>
                </div>
                <StatusBadge status={c.status} />
              </div>

              <div style={{ fontSize: 12 }}>
                Volume: {fmt(c.volume)} KL · Vessel: {c.vesselRef || "-"} · B/L: {c.bL || "-"}
              </div>

              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                Submitted by: {c.submittedBy} {c.note ? `· ${c.note}` : ""}
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {isAwaitingMe(c) && (
                  <>
                    {user.role === "supervisor" && (
                      <button onClick={() => approveCargo(c.id, "supervisor")} style={btnPrimaryStyle()}>Approve</button>
                    )}
                    {(user.role === "manager" || user.role === "admin") && (
                      <button
                        onClick={() => approveCargo(c.id, c.status === "pending_supervisor" ? "supervisor" : "manager")}
                        style={btnPrimaryStyle()}
                      >
                        Approve
                      </button>
                    )}
                    <button onClick={() => rejectCargo(c.id)} style={btnGhostStyle()}>Reject</button>
                  </>
                )}

                {perm.deleteRecord && (
                  <button onClick={() => deleteCargo(c.id)} style={btnGhostStyle()}>
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDistribution = () => (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ ...cardStyle(), display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <SectionTitle
          title="Distribution Activity"
          sub="Fuel issued to recipient / vehicle"
          right={
            perm.createDistrib ? (
              <button onClick={() => setModal("new_distribution")} style={btnPrimaryStyle()}>
                + New Distribution
              </button>
            ) : null
          }
        />
      </div>

      <div style={cardStyle()}>
        <div style={{ display: "grid", gap: 10 }}>
          {distributions.map((d) => (
            <div key={d.id} className="row" style={{ padding: 14, borderRadius: 14, border: "1px solid rgba(255,255,255,0.05)", display: "grid", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontWeight: 800 }}>{getTank(d.tankId)?.name}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
                    {fmtDate(d.date)} · {d.time}
                  </div>
                </div>
                <StatusBadge status={d.status} />
              </div>

              <div style={{ fontSize: 12 }}>
                Volume: {fmt(d.volume)} KL · Recipient: {d.recipient || "-"} · Vehicle: {d.vehicleRef || "-"} · Product: {d.product}
              </div>

              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                Submitted by: {d.submittedBy} {d.note ? `· ${d.note}` : ""}
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {isAwaitingMe(d) && (
                  <>
                    {user.role === "supervisor" && (
                      <button onClick={() => approveDistribution(d.id, "supervisor")} style={btnPrimaryStyle()}>
                        Approve
                      </button>
                    )}
                    {(user.role === "manager" || user.role === "admin") && (
                      <button
                        onClick={() => approveDistribution(d.id, d.status === "pending_supervisor" ? "supervisor" : "manager")}
                        style={btnPrimaryStyle()}
                      >
                        Approve
                      </button>
                    )}
                    <button onClick={() => rejectDistribution(d.id)} style={btnGhostStyle()}>
                      Reject
                    </button>
                  </>
                )}

                {perm.deleteRecord && (
                  <button onClick={() => deleteDistribution(d.id)} style={btnGhostStyle()}>
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStock = () => (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ ...cardStyle(), display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <SectionTitle
          title="Stock Control"
          sub="Opening, movement, and closing control by date"
          right={<input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} style={{ ...inputStyle(), width: 170 }} />}
        />
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {TANKS_DB.map((tank) => {
          const ctrl = getControlStock(tank.id, filterDate);
          return (
            <div key={tank.id} style={cardStyle()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 800 }}>{tank.name}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
                    Product: {tank.product}
                  </div>
                </div>
                {perm.closeStock && (
                  <button onClick={() => closeStockForDay(tank.id, filterDate)} style={btnPrimaryStyle()}>
                    Close Day
                  </button>
                )}
              </div>

              <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(6, 1fr)", gap: 10 }}>
                <MiniStat label="Opening" value={`${fmt(ctrl.opening)} KL`} color="#ffffff" />
                <MiniStat label="Morning" value={ctrl.morning != null ? `${fmt(ctrl.morning)} KL` : "-"} color="#00c8ff" />
                <MiniStat label="Cargo In" value={`${fmt(ctrl.cargoIn)} KL`} color="#34d399" />
                <MiniStat label="Cargo Out" value={`${fmt(ctrl.cargoOut)} KL`} color="#fbbf24" />
                <MiniStat label="Distrib Out" value={`${fmt(ctrl.distOut)} KL`} color="#60a5fa" />
                <MiniStat label="Closing" value={ctrl.closing != null ? `${fmt(ctrl.closing)} KL` : "-"} color="#a78bfa" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderApproval = () => (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={cardStyle()}>
        <SectionTitle
          title="Pending Approvals"
          sub="Records waiting for your role approval"
        />
      </div>

      <div style={cardStyle()}>
        <div style={{ display: "grid", gap: 10 }}>
          {[...soundings, ...cargo, ...distributions]
            .filter(isAwaitingMe)
            .map((item) => (
              <div key={item.id} style={{ padding: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontWeight: 800 }}>{item.id}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
                      Submitted by {item.submittedBy}
                    </div>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              </div>
            ))}

          {[...soundings, ...cargo, ...distributions].filter(isAwaitingMe).length === 0 && (
            <div style={{ color: "rgba(255,255,255,0.5)" }}>No pending approvals.</div>
          )}
        </div>
      </div>
    </div>
  );

  const renderBlend = () => (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={cardStyle()}>
        <SectionTitle title="Blending Setup" sub="Basic placeholder for product blend setup" />

        <div style={{ marginTop: 14, display: "grid", gap: 12, maxWidth: 420 }}>
          <label style={{ fontSize: 12 }}>T3 Product</label>
          <select value={t3Product} onChange={(e) => setT3Product(e.target.value)} style={inputStyle()}>
            <option value="FAME" style={{ color: "#000" }}>FAME</option>
            <option value="HSD" style={{ color: "#000" }}>HSD</option>
            <option value="Biosolar" style={{ color: "#000" }}>Biosolar</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderReport = () => (
    <div style={cardStyle()}>
      <SectionTitle title="Reports" sub="Quick overview of stored records" />
      <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
        <div style={{ color: "rgba(255,255,255,0.62)" }}>Total sounding records: {soundings.length}</div>
        <div style={{ color: "rgba(255,255,255,0.62)" }}>Total cargo records: {cargo.length}</div>
        <div style={{ color: "rgba(255,255,255,0.62)" }}>Total distribution records: {distributions.length}</div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div style={cardStyle()}>
      <SectionTitle title="Users" sub="Registered demo accounts" />
      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        {USERS_DB.map((u) => (
          <div key={u.id} style={{ padding: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontWeight: 800 }}>{u.name}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
              {u.username} · {u.dept}
            </div>
            <div style={{ marginTop: 8 }}>
              <RoleBadge role={u.role} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (tab) {
      case "dashboard":
        return renderDashboard();
      case "sounding":
        return renderSounding();
      case "cargo":
        return renderCargo();
      case "distrib":
        return renderDistribution();
      case "stock":
        return renderStock();
      case "approval":
        return renderApproval();
      case "blend":
        return renderBlend();
      case "report":
        return renderReport();
      case "users":
        return renderUsers();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="grid-bg" style={{ minHeight: "100vh", color: "#fff", fontFamily: "'Share Tech Mono', monospace" }}>
      <style>{GLOBAL_CSS}</style>

      <div style={{ display: "flex", minHeight: "100vh" }}>
        {!isMobile && (
          <aside
            style={{
              width: sidebarCollapsed ? 88 : 300,
              transition: "width 0.2s ease",
              padding: 18,
              borderRight: "1px solid rgba(255,255,255,0.06)",
              background: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))",
              backdropFilter: "blur(10px)",
            }}
          >
            <SidebarContent />
          </aside>
        )}

        <main style={{ flex: 1, padding: isMobile ? "16px 16px 90px" : 20 }}>
          {isMobile && (
            <div style={{ ...cardStyle(), marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 24, letterSpacing: 2 }}>
                  DAILY<span style={{ color: "#00c8ff" }}>SOUND</span>
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>{user.name}</div>
              </div>
              <button onClick={() => setSidebarOpen(true)} style={btnGhostStyle()}>
                Menu
              </button>
            </div>
          )}

          {renderContent()}
        </main>
      </div>

      {isMobile && sidebarOpen && (
        <div
          className="sidebar-overlay"
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40 }}
          onClick={() => setSidebarOpen(false)}
        >
          <div
            className="sidebar-slide"
            style={{
              width: 290,
              maxWidth: "86vw",
              height: "100%",
              background: "#0b1220",
              borderRight: "1px solid rgba(255,255,255,0.08)",
              padding: 18,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent />
          </div>
        </div>
      )}

      {isMobile && (
        <div
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            padding: 10,
            borderTop: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(5,8,16,0.94)",
            backdropFilter: "blur(10px)",
            display: "flex",
            gap: 6,
            zIndex: 30,
          }}
        >
          {navItems.slice(0, 5).map((item) => (
            <div
              key={item.id}
              className="bottom-nav-item"
              onClick={() => handleTabChange(item.id)}
              style={{
                background: tab === item.id ? "rgba(0,200,255,0.12)" : "transparent",
                color: tab === item.id ? "#00c8ff" : "#fff",
              }}
            >
              <span>{item.icon}</span>
              <span style={{ fontSize: 10 }}>{item.label}</span>
            </div>
          ))}
        </div>
      )}

      {modal === "new_sounding" && (
        <Modal title="New Sounding" onClose={() => setModal(null)}>
          <NewSoundingForm onSubmit={submitSounding} onCancel={() => setModal(null)} currentUser={user} />
        </Modal>
      )}

      {modal === "new_cargo" && (
        <Modal title="New Cargo" onClose={() => setModal(null)}>
          <NewCargoForm onSubmit={submitCargo} onCancel={() => setModal(null)} />
        </Modal>
      )}

      {modal === "new_distribution" && (
        <Modal title="New Distribution" onClose={() => setModal(null)}>
          <NewDistributionForm onSubmit={submitDistribution} onCancel={() => setModal(null)} />
        </Modal>
      )}

      {toast && (
        <div
          className="toast-anim"
          style={{
            position: "fixed",
            right: 16,
            bottom: isMobile ? 86 : 16,
            background: toast.type === "warn" ? "rgba(239,68,68,0.14)" : "rgba(52,211,153,0.14)",
            border: `1px solid ${toast.type === "warn" ? "rgba(239,68,68,0.3)" : "rgba(52,211,153,0.3)"}`,
            color: toast.type === "warn" ? "#ef4444" : "#34d399",
            padding: "12px 14px",
            borderRadius: 12,
            zIndex: 60,
          }}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
