import { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ScatterChart,
  Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

// ── THEME ─────────────────────────────────────────────────────────────
const T = {
  bg: "#0b0f1a", surface: "#111827", surface2: "#1a2235", border: "#1f2d45",
  accent: "#3b82f6", accent2: "#06b6d4", green: "#10b981", red: "#ef4444",
  amber: "#f59e0b", text: "#f1f5f9", muted: "#64748b", subtle: "#94a3b8",
  purple: "#8b5cf6", pink: "#ec4899", teal: "#14b8a6", orange: "#f97316", indigo: "#6366f1"
};

const DIAG_COLORS = [T.accent,T.accent2,T.green,T.amber,T.red,T.purple,T.pink,T.teal,T.orange,T.indigo];
const DIAGNOSES   = ["Arthritis","Asthma","COPD","Cancer","Diabetes","Heart Disease","Hypertension","Kidney Disease","Liver Disease","Stroke"];

// ── RAW DATA ──────────────────────────────────────────────────────────
const RAW = {
  admissions: [
    {month:"Jan",count:31},{month:"Feb",count:25},{month:"Mar",count:27},
    {month:"Apr",count:36},{month:"May",count:41},{month:"Jun",count:40}
  ],
  diagOutcome: [
    {d:"Arthritis",Recovered:4,Complicated:5,Deceased:8},
    {d:"Asthma",Recovered:8,Complicated:6,Deceased:3},
    {d:"COPD",Recovered:4,Complicated:6,Deceased:10},
    {d:"Cancer",Recovered:5,Complicated:5,Deceased:8},
    {d:"Diabetes",Recovered:5,Complicated:9,Deceased:3},
    {d:"Heart Disease",Recovered:9,Complicated:9,Deceased:6},
    {d:"Hypertension",Recovered:5,Complicated:11,Deceased:12},
    {d:"Kidney Disease",Recovered:3,Complicated:3,Deceased:4},
    {d:"Liver Disease",Recovered:13,Complicated:7,Deceased:6},
    {d:"Stroke",Recovered:7,Complicated:7,Deceased:9}
  ],
  costLOS: [
    {d:"Arthritis",count:17,cost:6679,los:41.6},
    {d:"Asthma",count:17,cost:6091,los:23.6},
    {d:"COPD",count:20,cost:5533,los:29.2},
    {d:"Cancer",count:18,cost:6234,los:27.0},
    {d:"Diabetes",count:17,cost:6153,los:34.1},
    {d:"Heart Disease",count:24,cost:6237,los:25.8},
    {d:"Hypertension",count:28,cost:5855,los:27.2},
    {d:"Kidney Disease",count:10,cost:6329,los:18.0},
    {d:"Liver Disease",count:26,cost:5976,los:21.8},
    {d:"Stroke",count:23,cost:6267,los:41.1}
  ],
  labs: [
    {name:"Vitamin D",count:41},{name:"Blood Pressure",count:37},
    {name:"Blood Sugar",count:35},{name:"Cholesterol",count:33},
    {name:"Creatinine",count:28},{name:"Hemoglobin",count:26}
  ],
  gender: [
    {g:"Female",Recovered:38,Complicated:36,Deceased:32},
    {g:"Male",Recovered:25,Complicated:32,Deceased:37}
  ],
  ageGroups: [
    {g:"<40",Arthritis:4,Asthma:4,COPD:3,Cancer:5,Diabetes:2,"Heart Disease":3,Hypertension:5,"Kidney Disease":3,"Liver Disease":5,Stroke:3},
    {g:"40-60",Arthritis:6,Asthma:8,COPD:9,Cancer:4,Diabetes:7,"Heart Disease":8,Hypertension:8,"Kidney Disease":3,"Liver Disease":7,Stroke:6},
    {g:"60-75",Arthritis:6,Asthma:2,COPD:3,Cancer:2,Diabetes:3,"Heart Disease":9,Hypertension:10,"Kidney Disease":1,"Liver Disease":8,Stroke:9},
    {g:"75+",Arthritis:1,Asthma:3,COPD:5,Cancer:7,Diabetes:5,"Heart Disease":4,Hypertension:5,"Kidney Disease":3,"Liver Disease":6,Stroke:5}
  ],
  scatter: [
    {name:"Arthritis",los:41.6,cost:6679},{name:"Asthma",los:23.6,cost:6091},
    {name:"COPD",los:29.2,cost:5533},{name:"Cancer",los:27.0,cost:6234},
    {name:"Diabetes",los:34.1,cost:6153},{name:"Heart Disease",los:25.8,cost:6237},
    {name:"Hypertension",los:27.2,cost:5855},{name:"Kidney Disease",los:18.0,cost:6329},
    {name:"Liver Disease",los:21.8,cost:5976},{name:"Stroke",los:41.1,cost:6267}
  ]
};

// ── FILTER CONFIG ─────────────────────────────────────────────────────
const FILTERS = {
  all:        {patients:200,recovery:31.5,mortality:34.5,cost:6105,los:29.2,rec:63,cmp:68,dec:69},
  M:          {patients:94, recovery:26.6,mortality:39.4,cost:6031,los:27.1,rec:25,cmp:32,dec:37},
  F:          {patients:106,recovery:35.8,mortality:30.2,cost:6168,los:31.0,rec:38,cmp:36,dec:32},
  Recovered:  {patients:63, recovery:100, mortality:0,   cost:5842,los:21.3,rec:63,cmp:0, dec:0},
  Deceased:   {patients:69, recovery:0,   mortality:100, cost:6441,los:36.8,rec:0, cmp:0, dec:69},
  Complicated:{patients:68, recovery:0,   mortality:0,   cost:6031,los:29.7,rec:0, cmp:68,dec:0}
};

// ── SHARED TOOLTIP ────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:T.surface2,border:`1px solid ${T.border}`,borderRadius:8,padding:"10px 14px"}}>
      {label && <p style={{color:T.subtle,fontSize:11,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.8px"}}>{label}</p>}
      {payload.map((p,i) => (
        <p key={i} style={{color:p.color||T.text,fontSize:13,margin:"2px 0"}}>
          <span style={{color:T.muted,marginRight:6}}>{p.name}:</span>
          {typeof p.value === "number" && p.name?.toLowerCase().includes("cost")
            ? `£${p.value.toLocaleString()}`
            : p.value}
        </p>
      ))}
    </div>
  );
};

// ── KPI CARD ──────────────────────────────────────────────────────────
const KpiCard = ({ label, value, sub, color, prefix="", suffix="" }) => (
  <div style={{
    background:T.surface, border:`1px solid ${T.border}`, borderRadius:12,
    padding:"18px 20px", position:"relative", overflow:"hidden",
    transition:"border-color 0.2s, transform 0.2s", cursor:"default",
    flex:1, minWidth:0
  }}
  onMouseEnter={e=>{e.currentTarget.style.borderColor=color;e.currentTarget.style.transform="translateY(-2px)"}}
  onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.transform="translateY(0)"}}>
    <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:color,opacity:0.8}}/>
    <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:"1px",color:T.muted,marginBottom:10}}>{label}</div>
    <div style={{fontFamily:"'DM Serif Display',serif",fontSize:30,color:T.text,lineHeight:1}}>
      {prefix}{typeof value==="number"?value.toLocaleString():value}
      {suffix && <span style={{fontSize:15,color:T.muted,fontFamily:"sans-serif"}}>{suffix}</span>}
    </div>
    <div style={{fontSize:12,color:T.muted,marginTop:6}}>{sub}</div>
  </div>
);

// ── CARD WRAPPER ──────────────────────────────────────────────────────
const Card = ({ title, icon, children, style={} }) => (
  <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:20,...style}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
      <span style={{fontSize:11,textTransform:"uppercase",letterSpacing:"1px",color:T.muted}}>{title}</span>
      {icon && <span style={{background:T.surface2,borderRadius:6,width:24,height:24,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>{icon}</span>}
    </div>
    {children}
  </div>
);

// ── OUTCOME PILLS ─────────────────────────────────────────────────────
const OutcomePills = ({ rec, cmp, dec }) => (
  <div style={{display:"flex",gap:10,marginBottom:16}}>
    {[{label:"Recovered",val:rec,color:T.green},{label:"Complicated",val:cmp,color:T.amber},{label:"Deceased",val:dec,color:T.red}]
      .map(({label,val,color})=>(
      <div key={label} style={{flex:1,background:T.surface2,borderRadius:10,padding:"14px 16px",textAlign:"center"}}>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:28,color}}>{val}</div>
        <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.8px",marginTop:4}}>{label}</div>
      </div>
    ))}
  </div>
);

// ── SCATTER DOT + LABEL ───────────────────────────────────────────────
const ScatterDot = (props) => {
  const { cx, cy, payload, index } = props;
  return (
    <g>
      <circle cx={cx} cy={cy} r={7} fill={DIAG_COLORS[index % DIAG_COLORS.length]} fillOpacity={0.9} stroke={T.bg} strokeWidth={1.5}/>
      <text x={cx+10} y={cy+4} fontSize={10} fill={T.subtle}>{payload.name}</text>
    </g>
  );
};

// ── PAGE NAV ──────────────────────────────────────────────────────────
const pages = ["Executive Summary","Clinical Analysis","Cost & Operations"];

// ═══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════
export default function HealthcareDashboard() {
  const [activePage, setActivePage]   = useState(0);
  const [activeFilter, setActiveFilter] = useState("all");
  const [mounted, setMounted]         = useState(false);

  useEffect(() => { setTimeout(()=>setMounted(true), 50); }, []);

  const kpi = FILTERS[activeFilter];
  const outcomeData = [
    {name:"Recovered",value:kpi.rec},{name:"Complicated",value:kpi.cmp},{name:"Deceased",value:kpi.dec}
  ].filter(d=>d.value>0);

  const FILTER_BTNS = [
    {key:"all",label:"All Patients"},
    {key:"M",  label:"Male"},
    {key:"F",  label:"Female"},
    {key:"Recovered",  label:"Recovered"},
    {key:"Deceased",   label:"Deceased"},
    {key:"Complicated",label:"Complicated"}
  ];

  const baseStyle = {
    fontFamily:"'DM Sans',sans-serif", background:T.bg, minHeight:"100vh",
    color:T.text, opacity:mounted?1:0, transition:"opacity 0.4s ease"
  };

  // ── GRID BG ──
  const gridBg = {
    position:"fixed", inset:0, pointerEvents:"none", zIndex:0,
    backgroundImage:`linear-gradient(rgba(59,130,246,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.03) 1px,transparent 1px)`,
    backgroundSize:"40px 40px"
  };

  return (
    <div style={baseStyle}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet"/>
      <div style={gridBg}/>
      <div style={{position:"relative",zIndex:1,maxWidth:1400,margin:"0 auto",padding:"20px 24px"}}>

        {/* ── HEADER ── */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24,paddingBottom:18,borderBottom:`1px solid ${T.border}`}}>
          <div>
            <h1 style={{color: "#f1f5f9",fontFamily:"'DM Serif Display',serif",fontSize:26,letterSpacing:"-0.5px",margin:0}}>
              Healthcare <span style={{color:T.accent}}>Analytics</span> Dashboard
            </h1>
            <p style={{color:T.muted,fontSize:12,marginTop:4}}>Patient outcomes, treatment costs & clinical insights · Jan–Jun 2025</p>
          </div>
          <div style={{display:"flex",gap:8,marginTop:4,flexWrap:"wrap",justifyContent:"flex-end"}}>
            {["200 Patients","10 Diagnoses"].map(b=>(
              <span key={b} style={{background:T.surface2,border:`1px solid ${T.border}`,borderRadius:20,padding:"4px 12px",fontSize:11,color:T.subtle}}>{b}</span>
            ))}
            <span style={{background:T.surface2,border:`1px solid rgba(16,185,129,0.4)`,borderRadius:20,padding:"4px 12px",fontSize:11,color:T.green,display:"flex",alignItems:"center",gap:5}}>
              <span style={{width:6,height:6,background:T.green,borderRadius:"50%",display:"inline-block",animation:"pulse 2s infinite"}}/>Live Data
            </span>
          </div>
        </div>

        {/* ── PAGE NAV ── */}
        <div style={{display:"flex",gap:4,marginBottom:20,background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,padding:4,width:"fit-content"}}>
          {pages.map((p,i)=>(
            <button key={p} onClick={()=>setActivePage(i)} style={{
              background:activePage===i?T.accent:"transparent",
              border:"none",borderRadius:7,padding:"7px 18px",
              color:activePage===i?"white":T.subtle,
              fontSize:12,fontFamily:"'DM Sans',sans-serif",
              cursor:"pointer",transition:"all 0.15s",fontWeight:activePage===i?600:400
            }}>{p}</button>
          ))}
        </div>

        {/* ── FILTER BAR ── */}
        <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
          {FILTER_BTNS.map(({key,label})=>(
            <button key={key} onClick={()=>setActiveFilter(key)} style={{
              background:activeFilter===key?T.accent:T.surface,
              border:`1px solid ${activeFilter===key?T.accent:T.border}`,
              borderRadius:8,padding:"6px 14px",color:activeFilter===key?"white":T.subtle,
              fontSize:12,fontFamily:"'DM Sans',sans-serif",cursor:"pointer",transition:"all 0.15s"
            }}>{label}</button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════ */}
        {/* PAGE 1 — EXECUTIVE SUMMARY                            */}
        {/* ══════════════════════════════════════════════════════ */}
        {activePage === 0 && (
          <div>
            {/* KPI ROW */}
            <div style={{display:"flex",gap:12,marginBottom:16,flexWrap:"wrap"}}>
              <KpiCard label="Total Patients"      value={kpi.patients}  sub="Jan – Jun 2025"  color={T.accent}/>
              <KpiCard label="Recovery Rate"       value={kpi.recovery}  sub={`${kpi.rec} recovered`}  color={T.green}  suffix="%"/>
              <KpiCard label="Mortality Rate"      value={kpi.mortality} sub={`${kpi.dec} deceased`}   color={T.red}    suffix="%"/>
              <KpiCard label="Avg Treatment Cost"  value={kpi.cost}      sub="per patient"     color={T.amber}  prefix="£"/>
              <KpiCard label="Avg Length of Stay"  value={kpi.los}       sub="median 9 days"   color={T.accent2} suffix=" days"/>
            </div>

            {/* ROW 2 */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
              <Card title="Monthly Admissions Trend" icon="📈">
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={RAW.admissions}>
                    <defs>
                      <linearGradient id="admGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={T.accent} stopOpacity={0.25}/>
                        <stop offset="95%" stopColor={T.accent} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke={T.border} strokeDasharray="3 3"/>
                    <XAxis dataKey="month" tick={{fill:T.muted,fontSize:11}} axisLine={{stroke:T.border}} tickLine={false}/>
                    <YAxis tick={{fill:T.muted,fontSize:11}} axisLine={false} tickLine={false}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Line type="monotone" dataKey="count" name="Admissions" stroke={T.accent} strokeWidth={2.5}
                      dot={{fill:T.accent,r:4}} activeDot={{r:6}} fill="url(#admGrad)"/>
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              <Card title="Patient Outcomes Overview" icon="🎯">
                <OutcomePills rec={kpi.rec} cmp={kpi.cmp} dec={kpi.dec}/>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={outcomeData} dataKey="value" nameKey="name"
                      cx="40%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={2} startAngle={90} endAngle={-270}>
                      {outcomeData.map((entry) => (
                        <Cell key={entry.name}
                          fill={entry.name==="Recovered"?T.green:entry.name==="Complicated"?T.amber:T.red}/>
                      ))}
                    </Pie>
                    <Legend layout="vertical" align="right" verticalAlign="middle"
                      formatter={(v)=><span style={{color:T.subtle,fontSize:12}}>{v}</span>}/>
                    <Tooltip content={<CustomTooltip/>}/>
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* ROW 3 — Lab tests + Gender */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <Card title="Lab Tests Performed" icon="🧪">
                {RAW.labs.map((l,i)=>(
                  <div key={l.name} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 0",borderBottom:i<RAW.labs.length-1?`1px solid ${T.border}`:"none"}}>
                    <div style={{minWidth:110,fontSize:13,fontWeight:500}}>{l.name}</div>
                    <div style={{flex:1,height:4,background:T.surface2,borderRadius:2}}>
                      <div style={{height:"100%",borderRadius:2,width:`${(l.count/41*100).toFixed(0)}%`,
                        background:`linear-gradient(90deg,${T.accent2},${T.accent})`}}/>
                    </div>
                    <div style={{fontSize:12,color:T.muted,minWidth:24,textAlign:"right"}}>{l.count}</div>
                  </div>
                ))}
              </Card>

              <Card title="Gender vs Outcome" icon="⚥">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={RAW.gender} layout="vertical">
                    <CartesianGrid stroke={T.border} strokeDasharray="3 3" horizontal={false}/>
                    <XAxis type="number" tick={{fill:T.muted,fontSize:11}} axisLine={false} tickLine={false}/>
                    <YAxis dataKey="g" type="category" tick={{fill:T.subtle,fontSize:12}} axisLine={false} tickLine={false} width={55}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Legend formatter={(v)=><span style={{color:T.subtle,fontSize:11}}>{v}</span>}/>
                    <Bar dataKey="Recovered"  stackId="a" fill={T.green} radius={[0,0,0,0]}/>
                    <Bar dataKey="Complicated" stackId="a" fill={T.amber}/>
                    <Bar dataKey="Deceased"   stackId="a" fill={T.red} radius={[3,3,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════ */}
        {/* PAGE 2 — CLINICAL ANALYSIS                            */}
        {/* ══════════════════════════════════════════════════════ */}
        {activePage === 1 && (
          <div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
              <Card title="Outcomes by Diagnosis" icon="🏥">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={RAW.diagOutcome} layout="vertical">
                    <CartesianGrid stroke={T.border} strokeDasharray="3 3" horizontal={false}/>
                    <XAxis type="number" tick={{fill:T.muted,fontSize:10}} axisLine={false} tickLine={false}/>
                    <YAxis dataKey="d" type="category" tick={{fill:T.subtle,fontSize:10}} axisLine={false} tickLine={false} width={90}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Legend formatter={(v)=><span style={{color:T.subtle,fontSize:11}}>{v}</span>}/>
                    <Bar dataKey="Recovered"   stackId="a" fill={T.green}/>
                    <Bar dataKey="Complicated" stackId="a" fill={T.amber}/>
                    <Bar dataKey="Deceased"    stackId="a" fill={T.red} radius={[0,3,3,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card title="Patient Distribution by Age Group & Diagnosis" icon="👥">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={RAW.ageGroups}>
                    <CartesianGrid stroke={T.border} strokeDasharray="3 3"/>
                    <XAxis dataKey="g" tick={{fill:T.muted,fontSize:11}} axisLine={{stroke:T.border}} tickLine={false}/>
                    <YAxis tick={{fill:T.muted,fontSize:11}} axisLine={false} tickLine={false}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Legend formatter={(v)=><span style={{color:T.subtle,fontSize:10}}>{v}</span>}/>
                    {DIAGNOSES.map((d,i)=>(
                      <Bar key={d} dataKey={d} stackId="a" fill={DIAG_COLORS[i]}
                        radius={i===DIAGNOSES.length-1?[3,3,0,0]:[0,0,0,0]}/>
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Diagnosis detail table */}
            <Card title="Diagnosis Summary Table" icon="📋">
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead>
                    <tr>
                      {["Diagnosis","Patients","Recovered","Complicated","Deceased","Recovery %"].map(h=>(
                        <th key={h} style={{textAlign:"left",fontSize:11,textTransform:"uppercase",
                          letterSpacing:"0.8px",color:T.muted,padding:"0 0 10px",
                          borderBottom:`1px solid ${T.border}`}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {RAW.diagOutcome.map((row,i)=>{
                      const total = row.Recovered+row.Complicated+row.Deceased;
                      const pct   = ((row.Recovered/total)*100).toFixed(0);
                      return (
                        <tr key={row.d} style={{borderBottom:`1px solid rgba(31,45,69,0.5)`}}>
                          <td style={{padding:"10px 0",fontSize:13,fontWeight:500}}>{row.d}</td>
                          <td style={{padding:"10px 0",fontSize:13,color:T.subtle}}>{total}</td>
                          <td style={{padding:"10px 0",fontSize:13,color:T.green}}>{row.Recovered}</td>
                          <td style={{padding:"10px 0",fontSize:13,color:T.amber}}>{row.Complicated}</td>
                          <td style={{padding:"10px 0",fontSize:13,color:T.red}}>{row.Deceased}</td>
                          <td style={{padding:"10px 0"}}>
                            <div style={{display:"flex",alignItems:"center",gap:8}}>
                              <div style={{width:60,height:4,background:T.surface2,borderRadius:2}}>
                                <div style={{height:"100%",width:`${pct}%`,background:T.green,borderRadius:2}}/>
                              </div>
                              <span style={{fontSize:12,color:T.subtle}}>{pct}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════ */}
        {/* PAGE 3 — COST & OPERATIONS                            */}
        {/* ══════════════════════════════════════════════════════ */}
        {activePage === 2 && (
          <div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
              <Card title="Avg Treatment Cost by Diagnosis" icon="💊">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={RAW.costLOS} layout="vertical">
                    <CartesianGrid stroke={T.border} strokeDasharray="3 3" horizontal={false}/>
                    <XAxis type="number" tick={{fill:T.muted,fontSize:10}} axisLine={false} tickLine={false}
                      tickFormatter={v=>`£${(v/1000).toFixed(1)}k`}/>
                    <YAxis dataKey="d" type="category" tick={{fill:T.subtle,fontSize:10}} axisLine={false} tickLine={false} width={95}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Bar dataKey="cost" name="Avg Cost" fill={T.accent} radius={[0,4,4,0]}>
                      {RAW.costLOS.map((_,i)=><Cell key={i} fill={DIAG_COLORS[i]}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card title="Avg Length of Stay by Diagnosis (Days)" icon="🏨">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={RAW.costLOS} layout="vertical">
                    <CartesianGrid stroke={T.border} strokeDasharray="3 3" horizontal={false}/>
                    <XAxis type="number" tick={{fill:T.muted,fontSize:10}} axisLine={false} tickLine={false}/>
                    <YAxis dataKey="d" type="category" tick={{fill:T.subtle,fontSize:10}} axisLine={false} tickLine={false} width={95}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Bar dataKey="los" name="Avg LOS (days)" fill={T.accent2} radius={[0,4,4,0]}>
                      {RAW.costLOS.map((_,i)=><Cell key={i} fill={DIAG_COLORS[i]}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <Card title="Cost vs Length of Stay by Diagnosis" icon="🔵">
                <ResponsiveContainer width="100%" height={260}>
                  <ScatterChart margin={{top:10,right:30,bottom:10,left:10}}>
                    <CartesianGrid stroke={T.border} strokeDasharray="3 3"/>
                    <XAxis dataKey="los" name="Avg LOS" type="number" domain={[10,50]}
                      tick={{fill:T.muted,fontSize:10}} axisLine={false} tickLine={false}
                      label={{value:"Avg LOS (days)",position:"insideBottom",offset:-2,fill:T.muted,fontSize:10}}/>
                    <YAxis dataKey="cost" name="Avg Cost" type="number" domain={[5000,7500]}
                      tick={{fill:T.muted,fontSize:10}} axisLine={false} tickLine={false}
                      tickFormatter={v=>`£${(v/1000).toFixed(1)}k`}/>
                    <Tooltip content={<CustomTooltip/>} cursor={{stroke:T.border}}/>
                    <Scatter data={RAW.scatter} shape={<ScatterDot/>}/>
                  </ScatterChart>
                </ResponsiveContainer>
              </Card>

              <Card title="Cost & LOS Summary" icon="📊">
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead>
                      <tr>
                        {["Diagnosis","Patients","Avg Cost","Avg LOS"].map(h=>(
                          <th key={h} style={{textAlign:"left",fontSize:11,textTransform:"uppercase",
                            letterSpacing:"0.8px",color:T.muted,padding:"0 0 10px",
                            borderBottom:`1px solid ${T.border}`}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {RAW.costLOS.map((row,i)=>(
                        <tr key={row.d} style={{borderBottom:`1px solid rgba(31,45,69,0.5)`}}>
                          <td style={{padding:"8px 0",fontSize:12,fontWeight:500,display:"flex",alignItems:"center",gap:6}}>
                            <span style={{width:8,height:8,borderRadius:"50%",background:DIAG_COLORS[i],display:"inline-block",flexShrink:0}}/>
                            {row.d}
                          </td>
                          <td style={{padding:"8px 0",fontSize:12,color:T.subtle}}>{row.count}</td>
                          <td style={{padding:"8px 0",fontSize:12,color:T.amber}}>£{row.cost.toLocaleString()}</td>
                          <td style={{padding:"8px 0",fontSize:12,color:T.accent2}}>{row.los}d</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ── FOOTER ── */}
        <div style={{marginTop:24,paddingTop:14,borderTop:`1px solid ${T.border}`,
          display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <p style={{color:T.muted,fontSize:11}}>Healthcare Analytics Dashboard · Built with React & Recharts</p>
          <p style={{color:T.muted,fontSize:11}}>200 patients · Jan–Jun 2025 · 4 data sources</p>
        </div>

      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}