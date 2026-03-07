// In the SoundingForm component, remove density field
function SoundingForm({ user, onSubmit, onCancel, currentSession, t3Product }) {
  const defaultTime = currentSession === "morning" ? "07:00" : "19:00";
  const [f, setF] = useState({
    tankId:"T1", date:today(), session:currentSession, time:defaultTime,
    noSounding:false, reason:"", customReason:"",
    level:"", volume:"", volumeFromCal:false, temp:"", note:"", // removed density
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
      if(!f.level||!f.volume||!f.temp) return alert("Fill all sounding fields (level, volume, temperature)");
      onSubmit({ ...f, level:+f.level, volume:+f.volume, temp:+f.temp,
        reason:"", customReason:"", volumeFromCal:undefined });
    } else {
      const finalReason = f.reason === "Other" ? (f.customReason||"Other") : f.reason;
      if(!finalReason) return alert("Enter a reason for no sounding");
      onSubmit({ ...f, noSounding:true, reason:finalReason,
        level:null, volume:null, temp:null, volumeFromCal:undefined });
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
          </select>
        </div>
        <div>
          <Label>Date</Label>
          <input type="date" value={f.date} onChange={e=>set("date",e.target.value)} style={inputStyle} />
        </div>
        <div>
          <Label>Session (Shift)</Label>
          <select value={f.session} onChange={e=>handleSessionChange(e.target.value)} style={inputStyle}>
            <option value="morning" style={{background:"#0a0f1e"}}>Morning — Closing / Cut-off</option>
            <option value="afternoon" style={{background:"#0a0f1e"}}>Afternoon — Mid-shift Check</option>
          </select>
        </div>
        <div>
          <Label>Sounding Time</Label>
          <input type="time" value={f.time} onChange={e=>set("time",e.target.value)} style={inputStyle} />
        </div>

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
          /* Normal sounding fields - density removed */
          <>
            <div>
              <Label>Dip Level (cm)</Label>
              <input type="number" step="0.1" min="0" placeholder="e.g. 331" value={f.level} onChange={e=>handleLevelChange(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <div style={{ fontSize:9, letterSpacing:2, textTransform:"uppercase", marginBottom:6, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ color:"rgba(0,200,255,0.5)" }}>Volume (KL)</span>
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
