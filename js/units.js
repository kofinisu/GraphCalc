const UNITS = {
  m:{dim:{L:1},f:1},cm:{dim:{L:1},f:0.01},mm:{dim:{L:1},f:0.001},km:{dim:{L:1},f:1000},nm:{dim:{L:1},f:1e-9},um:{dim:{L:1},f:1e-6},'µm':{dim:{L:1},f:1e-6},
  in:{dim:{L:1},f:0.0254},ft:{dim:{L:1},f:0.3048},yd:{dim:{L:1},f:0.9144},mi:{dim:{L:1},f:1609.344},
  kg:{dim:{M:1},f:1},g:{dim:{M:1},f:0.001},mg:{dim:{M:1},f:1e-6},lb:{dim:{M:1},f:0.453592},oz:{dim:{M:1},f:0.0283495},
  s:{dim:{T:1},f:1},ms:{dim:{T:1},f:0.001},min:{dim:{T:1},f:60},h:{dim:{T:1},f:3600},hr:{dim:{T:1},f:3600},day:{dim:{T:1},f:86400},yr:{dim:{T:1},f:31557600},
  A:{dim:{I:1},f:1},mA:{dim:{I:1},f:0.001},
  K:{dim:{Th:1},f:1},mol:{dim:{N:1},f:1},mmol:{dim:{N:1},f:0.001},
  N:{dim:{M:1,L:1,T:-2},f:1},J:{dim:{M:1,L:2,T:-2},f:1},W:{dim:{M:1,L:2,T:-3},f:1},Pa:{dim:{M:1,L:-1,T:-2},f:1},Hz:{dim:{T:-1},f:1},
  V:{dim:{M:1,L:2,T:-3,I:-1},f:1},'Ω':{dim:{M:1,L:2,T:-3,I:-2},f:1},
  L:{dim:{L:3},f:0.001},mL:{dim:{L:3},f:1e-6},
  mph:{dim:{L:1,T:-1},f:0.44704},kph:{dim:{L:1,T:-1},f:1/3.6},
  kN:{dim:{M:1,L:1,T:-2},f:1000},kJ:{dim:{M:1,L:2,T:-2},f:1000},kWh:{dim:{M:1,L:2,T:-2},f:3600000},
  bar:{dim:{M:1,L:-1,T:-2},f:100000},atm:{dim:{M:1,L:-1,T:-2},f:101325}
};
const dimAdd = (a,b) => { const d={...a}; for(const k in b){ d[k]=(d[k]||0)+b[k]; if(!d[k]) delete d[k]; } return d; };
const dimMul = (a,n) => { const d={}; for(const k in a) d[k]=a[k]*n; return d; };
const dimsEq = (a,b) => { const ka=Object.keys(a).filter(k=>a[k]).sort(); const kb=Object.keys(b).filter(k=>b[k]).sort(); if(ka.length!==kb.length) return false; return ka.every((k,i)=>k===kb[i]&&a[k]===b[k]); };
const dimStr = d => { const p=[]; for(const k in d) if(d[k]) p.push(k+(d[k]!==1?'^'+d[k]:'')); return p.join('·')||'—'; };

function parseUnit(str){
  str = String(str||'').trim(); if(!str) return null;
  const toks=[]; let i=0;
  while(i<str.length){
    const c = str[i];
    if(/\s/.test(c)){ i++; continue; }
    if(c==='*'||c==='/'){ toks.push({op:c}); i++; continue; }
    if(c==='^'){ i++; let j=i; while(j<str.length && /[-+\d.]/.test(str[j])) j++; toks.push({op:'^',val:parseFloat(str.slice(i,j))}); i=j; continue; }
    if(/[A-Za-zΩµμ]/.test(c)){
      let j=i; while(j<str.length && /[A-Za-zΩµμ0-9_]/.test(str[j])) j++;
      let match=null;
      for(let k=j;k>i;k--){ const cd=str.slice(i,k); if(UNITS[cd]){ match=cd; i=k; break; } }
      if(!match){ if(UNITS[c]){ match=c; i++; } else throw new Error('Unknown unit: '+c); }
      toks.push({op:'unit',name:match});
      continue;
    }
    throw new Error('Bad unit char: '+c);
  }
  let dim={}, f=1, sgn=1, pending=null;
  for(const tk of toks){
    if(tk.op==='*'||tk.op==='/'){ sgn=tk.op==='*'?1:-1; continue; }
    if(tk.op==='^'){ if(pending){ dim=dimAdd(dim,dimMul(pending.dim,tk.val)); f*=Math.pow(pending.f,tk.val); pending=null; } continue; }
    if(tk.op==='unit'){ const u=UNITS[tk.name]; dim=dimAdd(dim,dimMul(u.dim,sgn)); f*=Math.pow(u.f,sgn); sgn=1; }
  }
  return {dim,f};
}
class Quantity {
  constructor(v, us){ if(us){ const p=parseUnit(us); this.dim=p.dim; this.f=p.f; this.si=v*p.f; this.display=us; } else { this.dim={}; this.f=1; this.si=v; this.display=''; } }
  to(us){ const p=parseUnit(us); if(!dimsEq(this.dim,p.dim)) throw new Error('Cannot convert '+dimStr(this.dim)+' to '+dimStr(p.dim)); const r=new Quantity(0,us); r.si=this.si; r.dim=p.dim; r.f=p.f; return r; }
  value(){ return this.si/this.f; }
  add(o){ if(!dimsEq(this.dim,o.dim)) throw new Error('Unit mismatch'); const r=new Quantity(0,this.display); r.dim=this.dim; r.f=this.f; r.si=this.si+o.si; return r; }
  sub(o){ if(!dimsEq(this.dim,o.dim)) throw new Error('Unit mismatch'); const r=new Quantity(0,this.display); r.dim=this.dim; r.f=this.f; r.si=this.si-o.si; return r; }
  mul(o){ const r=new Quantity(0); r.dim=dimAdd(this.dim,o.dim); r.f=this.f*o.f; r.si=this.si*o.si; r.display=this.display&&o.display?this.display+'·'+o.display:(this.display||o.display); return r; }
  div(o){ const r=new Quantity(0); r.dim=dimAdd(this.dim,dimMul(o.dim,-1)); r.f=this.f/o.f; r.si=this.si/o.si; r.display=this.display&&o.display?this.display+'/'+o.display:(this.display||(o.display?'1/'+o.display:'')); return r; }
  pow(n){ const r=new Quantity(0); r.dim=dimMul(this.dim,n); r.f=Math.pow(this.f,n); r.si=Math.pow(this.si,n); r.display=n===1?this.display:(this.display?this.display+'^'+n:''); return r; }
  toString(){ return this.display ? (this.value().toPrecision(8)+' '+this.display) : this.value().toPrecision(8); }
}
function parseQuantityInput(str){
  const m = String(str).trim().match(/^([-+]?[\d.eE+]+)\s*([A-Za-zΩµμ*/^0-9]*)\s*$/);
  if(!m) return null;
  const n=parseFloat(m[1]); if(!isFinite(n)) return null;
  try { return new Quantity(n, m[2].trim()); } catch(e){ return null; }
}
Object.assign(window, { UNITS, Quantity, parseUnit, parseQuantityInput, dimStr, dimsEq });