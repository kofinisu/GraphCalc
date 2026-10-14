const ELEMENTS = {
  H:{name:'Hydrogen',mass:1.008},He:{name:'Helium',mass:4.0026},Li:{name:'Lithium',mass:6.94},Be:{name:'Beryllium',mass:9.0122},
  B:{name:'Boron',mass:10.81},C:{name:'Carbon',mass:12.011},N:{name:'Nitrogen',mass:14.007},O:{name:'Oxygen',mass:15.999},
  F:{name:'Fluorine',mass:18.998},Ne:{name:'Neon',mass:20.180},Na:{name:'Sodium',mass:22.990},Mg:{name:'Magnesium',mass:24.305},
  Al:{name:'Aluminium',mass:26.982},Si:{name:'Silicon',mass:28.085},P:{name:'Phosphorus',mass:30.974},S:{name:'Sulfur',mass:32.06},
  Cl:{name:'Chlorine',mass:35.45},Ar:{name:'Argon',mass:39.948},K:{name:'Potassium',mass:39.098},Ca:{name:'Calcium',mass:40.078},
  Sc:{name:'Scandium',mass:44.956},Ti:{name:'Titanium',mass:47.867},V:{name:'Vanadium',mass:50.942},Cr:{name:'Chromium',mass:51.996},
  Mn:{name:'Manganese',mass:54.938},Fe:{name:'Iron',mass:55.845},Co:{name:'Cobalt',mass:58.933},Ni:{name:'Nickel',mass:58.693},
  Cu:{name:'Copper',mass:63.546},Zn:{name:'Zinc',mass:65.38},Ga:{name:'Gallium',mass:69.723},Ge:{name:'Germanium',mass:72.630},
  As:{name:'Arsenic',mass:74.922},Se:{name:'Selenium',mass:78.971},Br:{name:'Bromine',mass:79.904},Kr:{name:'Krypton',mass:83.798},
  Rb:{name:'Rubidium',mass:85.468},Sr:{name:'Strontium',mass:87.62},Y:{name:'Yttrium',mass:88.906},Zr:{name:'Zirconium',mass:91.224},
  Nb:{name:'Niobium',mass:92.906},Mo:{name:'Molybdenum',mass:95.95},Ag:{name:'Silver',mass:107.87},Cd:{name:'Cadmium',mass:112.41},
  Sn:{name:'Tin',mass:118.71},Sb:{name:'Antimony',mass:121.76},I:{name:'Iodine',mass:126.90},Xe:{name:'Xenon',mass:131.29},
  Cs:{name:'Caesium',mass:132.91},Ba:{name:'Barium',mass:137.33},La:{name:'Lanthanum',mass:138.91},Ce:{name:'Cerium',mass:140.12},
  Pt:{name:'Platinum',mass:195.08},Au:{name:'Gold',mass:196.97},Hg:{name:'Mercury',mass:200.59},Pb:{name:'Lead',mass:207.2},
  Bi:{name:'Bismuth',mass:208.98},U:{name:'Uranium',mass:238.03},W:{name:'Tungsten',mass:183.84}
};
function parseFormula(str){
  str = str.replace(/\s+/g,'');
  function parseG(s,i){
    const c = {};
    while (i < s.length){
      if (s[i]==='('){ const [sub,ni]=parseG(s,i+1); i=ni; let j=i; while(j<s.length&&/\d/.test(s[j])) j++; const m = j>i?parseInt(s.slice(i,j)):1; for(const k in sub) c[k]=(c[k]||0)+sub[k]*m; i=j; }
      else if (s[i]===')'){ return [c,i+1]; }
      else if (/[A-Z]/.test(s[i])){
        let j=i+1; if(j<s.length && /[a-z]/.test(s[j])) j++;
        const sym = s.slice(i,j);
        if (!ELEMENTS[sym]) throw new Error('Unknown element: '+sym);
        let k=j; while(k<s.length && /\d/.test(s[k])) k++;
        const num = k>j ? parseInt(s.slice(j,k)) : 1;
        c[sym] = (c[sym]||0)+num;
        i = k;
      } else i++;
    }
    return [c,i];
  }
  const [counts] = parseG(str,0);
  let total = 0; const detail = [];
  for(const sym in counts){ const m = ELEMENTS[sym].mass*counts[sym]; total += m; detail.push({sym,count:counts[sym],mass:m,name:ELEMENTS[sym].name}); }
  return {mass:total, detail, counts};
}
function balanceEquation(eq){
  const parts = eq.split(/-?>|→|=+/).map(s=>s.trim()).filter(s=>s);
  if (parts.length!==2) throw new Error('Need: Reactants -> Products');
  const L = parts[0].split('+').map(s=>s.trim()).filter(s=>s);
  const R = parts[1].split('+').map(s=>s.trim()).filter(s=>s);
  const all = [...L, ...R];
  const elems = new Set();
  all.forEach(f => Object.keys(parseFormula(f).counts).forEach(k => elems.add(k)));
  const ea = [...elems];
  const n = all.length;
  const ok = coefs => {
    for(const c of coefs) if(c<1||c>40) return false;
    for(const el of ea){
      let s = 0;
      all.forEach((f,p) => { const cnt = parseFormula(f).counts[el]||0; const sgn = p<L.length?1:-1; s += sgn*cnt*coefs[p]; });
      if (s !== 0) return false;
    }
    return true;
  };
  const coefs = new Array(n).fill(1);
  function rec(i){ if(i===n) return ok(coefs); for(let v=1;v<=30;v++){ coefs[i]=v; if(rec(i+1)) return true; } return false; }
  if (!rec(0)) return {error:'Cannot balance.'};
  const g = coefs.reduce((a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b){const t=a%b;a=b;b=t;}return a;});
  const f = coefs.map(c=>c/g);
  return {left:L.map((x,i)=>(f[i]===1?'':f[i])+x).join(' + '), right:R.map((x,i)=>(f[L.length+i]===1?'':f[L.length+i])+x).join(' + '), coefs:f};
}
function pHfromConc(h, oh){
  let pH, pOH, hPlus, ohMinus;
  if (h !== undefined && h > 0){ hPlus=h; pH=-Math.log10(hPlus); pOH=14-pH; ohMinus=Math.pow(10,-pOH); }
  else if (oh !== undefined && oh > 0){ ohMinus=oh; pOH=-Math.log10(ohMinus); pH=14-pOH; hPlus=Math.pow(10,-pH); }
  else return null;
  return {pH, pOH, hPlus, ohMinus, type: pH<7?'acidic':pH>7?'basic':'neutral'};
}

document.addEventListener('DOMContentLoaded', () => {
  const gc = window.__gc;
  const row = (k,v,c) => '<div class="row"><span class="k">'+k+'</span><span class="v '+(c||'')+'">'+v+'</span></div>';

  const mmIn = document.getElementById('chemMM');
  const mmOut = document.getElementById('chemMMOut');
  function updateMM(){
    const f = mmIn.value.trim(); if (!f){ mmOut.textContent=''; return; }
    try {
      const r = parseFormula(f);
      let html = '<b>'+f+'</b> → '+gc.fmt(r.mass,4)+' g/mol<div style="font-size:11px;color:var(--muted);margin-top:6px;">';
      r.detail.forEach(d => html += d.sym+'×'+d.count+' = '+gc.fmt(d.mass,4)+' ('+d.name+')<br>');
      mmOut.innerHTML = html + '</div>';
    } catch(e){ mmOut.innerHTML = '<span style="color:var(--red)">'+e.message+'</span>'; }
  }
  if (mmIn){ mmIn.addEventListener('input', updateMM); updateMM(); }

  const balIn = document.getElementById('chemBal');
  const balOut = document.getElementById('chemBalOut');
  function updateBal(){
    const eq = balIn.value;
    try {
      const r = balanceEquation(eq);
      if (r.error){ balOut.innerHTML = row('Error', r.error, 'bad'); return; }
      balOut.innerHTML = '<div style="font-family:ui-monospace;font-size:14px;color:var(--green);text-align:center;padding:8px;">'+r.left+' → '+r.right+'</div>';
    } catch(e){ balOut.innerHTML = '<span style="color:var(--red)">'+e.message+'</span>'; }
  }
  if (balIn){ balIn.addEventListener('input', updateBal); updateBal(); }

  const hIn = document.getElementById('chemH'), ohIn = document.getElementById('chemOH'), phOut = document.getElementById('chemPHOut');
  function updatePH(){
    const h = parseFloat(hIn.value), oh = parseFloat(ohIn.value);
    try {
      const r = pHfromConc(isFinite(h)&&h>0?h:undefined, isFinite(oh)&&oh>0?oh:undefined);
      if (!r){ phOut.innerHTML=''; return; }
      phOut.innerHTML = row('pH', gc.fmt(r.pH,4),'hi') + row('pOH', gc.fmt(r.pOH,4)) + row('[H⁺]', gc.fmt(r.hPlus,4)+' M') + row('[OH⁻]', gc.fmt(r.ohMinus,4)+' M') + row('Type', r.type, r.type==='neutral'?'':r.type==='acidic'?'warn':'hi');
    } catch(e){ phOut.innerHTML = '<span style="color:var(--red)">'+e.message+'</span>'; }
  }
  if (hIn){ hIn.addEventListener('input', updatePH); ohIn.addEventListener('input', updatePH); updatePH(); }

  const ptOut = document.getElementById('ptOut');
  if (ptOut){
    const layout = [
      ['H','','','','','','','','','','','','','','','','','He'],
      ['Li','Be','','','','','','','','','','','B','C','N','O','F','Ne'],
      ['Na','Mg','','','','','','','','','','','Al','Si','P','S','Cl','Ar'],
      ['K','Ca','Sc','Ti','V','Cr','Mn','Fe','Co','Ni','Cu','Zn','Ga','Ge','As','Se','Br','Kr'],
      ['Rb','Sr','Y','Zr','Nb','Mo','Tc','Ru','Rh','Pd','Ag','Cd','In','Sn','Sb','Te','I','Xe'],
      ['Cs','Ba','La','','','','','','','','','','','','','','','']
    ];
    let html = '<div class="ptGrid">';
    layout.forEach(row => row.forEach(sym => {
      if (!sym){ html += '<div></div>'; return; }
      const el = ELEMENTS[sym];
      if (!el){ html += '<div style="opacity:.4">'+sym+'</div>'; return; }
      html += '<div title="'+el.name+' ('+sym+') — '+el.mass+' g/mol" onclick="document.getElementById(\'chemMM\').value=\''+sym+'\';document.getElementById(\'chemMM\').dispatchEvent(new Event(\'input\'))">'+sym+'</div>';
    }));
    ptOut.innerHTML = html + '</div>';
  }
});
Object.assign(window, { ELEMENTS, parseFormula, balanceEquation, pHfromConc });