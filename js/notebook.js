let nbCells = [];
const NB_KEY = 'graphcalc_notebook_v1';
try { const r = localStorage.getItem(NB_KEY); if (r) nbCells = JSON.parse(r); } catch(e){}
const saveNB = () => { try { localStorage.setItem(NB_KEY, JSON.stringify(nbCells.map(c=>({type:c.type,source:c.source,output:c.output})))); } catch(e){} };

function renderNotebook(){
  const gc = window.__gc;
  const box = document.getElementById('nbCells'); if (!box) return;
  box.innerHTML = '';
  if (!nbCells.length){ box.innerHTML = '<div style="color:var(--muted);text-align:center;padding:40px;">Empty notebook. Click <b>+ Math</b>, <b>+ Text</b>, or <b>+ Plot</b>.</div>'; return; }
  nbCells.forEach((cell, i) => {
    const div = document.createElement('div');
    div.className = 'nbCell' + (cell.type==='md' ? ' md' : '');
    const type = document.createElement('div'); type.className = 'nbType'; type.textContent = cell.type==='md'?'text':cell.type==='plot'?'plot':'math';
    const ta = document.createElement('textarea'); ta.value = cell.source || '';
    ta.placeholder = cell.type==='md'?'Write markdown / text…':cell.type==='plot'?'Enter y = f(x)':"Enter an expression…";
    ta.addEventListener('input', () => { cell.source = ta.value; saveNB(); });
    ta.addEventListener('keydown', e => { if ((e.ctrlKey||e.metaKey) && e.key==='Enter'){ e.preventDefault(); runCell(i); } });
    const out = document.createElement('div'); out.className = 'nbOut'; out.innerHTML = cell.output || '';
    const bar = document.createElement('div'); bar.className = 'nbBar';
    const run = document.createElement('button'); run.className = 'run'; run.textContent = '▶ Run';
    run.addEventListener('click', () => runCell(i));
    const up = document.createElement('button'); up.textContent = '↑';
    up.addEventListener('click', () => { if (!i) return; [nbCells[i-1],nbCells[i]]=[nbCells[i],nbCells[i-1]]; saveNB(); renderNotebook(); });
    const dn = document.createElement('button'); dn.textContent = '↓';
    dn.addEventListener('click', () => { if (i===nbCells.length-1) return; [nbCells[i+1],nbCells[i]]=[nbCells[i],nbCells[i+1]]; saveNB(); renderNotebook(); });
    const del = document.createElement('button'); del.textContent = '🗑';
    del.addEventListener('click', () => { nbCells.splice(i,1); saveNB(); renderNotebook(); });
    bar.append(run, up, dn, del);
    div.append(type, ta, out, bar);
    box.appendChild(div);
  });
  if (window.katexReady) document.querySelectorAll('.nbOut').forEach(el => window.__gc.katexRender(el));
}
function runCell(i){
  const gc = window.__gc;
  const cell = nbCells[i];
  const out = document.querySelectorAll('.nbCell .nbOut')[i];
  if (!out) return;
  try {
    if (cell.type === 'md'){
      cell.output = String(cell.source||'')
        .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
        .replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/\*(.+?)\*/g,'<i>$1</i>')
        .replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\n/g,'<br>');
      out.innerHTML = cell.output;
      if (window.katexReady) gc.katexRender(out);
    } else if (cell.type === 'plot'){
      const src = (cell.source||'').replace(/^y\s*=\s*/,'');
      const ast = gc.parseExpression(gc.tokenize(src));
      const w=400, h=160;
      const canvas = document.createElement('canvas'); canvas.width=w; canvas.height=h;
      canvas.style.cssText = 'background:#0b0d13;border:1px solid var(--line);border-radius:6px;width:100%;';
      out.innerHTML = ''; out.appendChild(canvas);
      const c = canvas.getContext('2d');
      c.fillStyle='#0b0d13'; c.fillRect(0,0,w,h);
      c.strokeStyle='#2a3142'; c.beginPath();
      for(let gx=0;gx<=20;gx++){ c.moveTo(gx*w/20,0); c.lineTo(gx*w/20,h); }
      for(let gy=0;gy<=8;gy++){ c.moveTo(0,gy*h/8); c.lineTo(w,gy*h/8); }
      c.stroke();
      c.strokeStyle='#4c9aff'; c.lineWidth=1.8; c.beginPath();
      let started=false;
      for(let px=0;px<=w;px++){
        const x=(px-w/2)/(w/20);
        let y; try { y=gc.evaluate(ast,{x}); } catch(e){ y=NaN; }
        if(!isFinite(y)){ started=false; continue; }
        const py=h/2-y*(h/8);
        if(!started){ c.moveTo(px,py); started=true; } else c.lineTo(px,py);
      }
      c.stroke();
    } else {
      const src = (cell.source||'').trim();
      if (!src){ out.innerHTML=''; return; }
      const split = gc.splitComparison(src);
      if (split && (split.op==='=' || split.op==='==')){
        const r = window.casSteps('solve', src);
        if (r.error){ out.innerHTML = '<span style="color:var(--red)">'+r.error+'</span>'; return; }
        let html = '';
        r.steps.forEach((s,k) => html += '<div style="color:var(--muted);font-size:11px;">'+(k+1)+'. '+s.title+'</div><div>$'+s.body+'$</div>');
        out.innerHTML = html;
        if (window.katexReady) gc.katexRender(out);
      } else {
        const ast = gc.parseExpression(gc.tokenize(src));
        const v = gc.evaluate(ast, gc.getScope());
        out.innerHTML = '<div>$'+src+' = '+gc.fmt(v,10)+'$</div>';
        if (window.katexReady) gc.katexRender(out);
      }
    }
    saveNB();
  } catch(e){ out.innerHTML = '<span style="color:var(--red)">'+e.message+'</span>'; }
}
document.addEventListener('DOMContentLoaded', () => {
  const gc = window.__gc;
  const addMath = document.getElementById('nbAddMath');
  if (!addMath) return;
  addMath.addEventListener('click', () => { nbCells.push({type:'math',source:'',output:''}); saveNB(); renderNotebook(); });
  document.getElementById('nbAddText').addEventListener('click', () => { nbCells.push({type:'md',source:'## Heading\nSome **bold** text.',output:''}); saveNB(); renderNotebook(); });
  document.getElementById('nbAddPlot').addEventListener('click', () => { nbCells.push({type:'plot',source:'y = x^2 - 3',output:''}); saveNB(); renderNotebook(); });
  document.getElementById('nbRunAll').addEventListener('click', () => nbCells.forEach((_,i) => runCell(i)));
  document.getElementById('nbClear').addEventListener('click', () => { if (!confirm('Clear notebook?')) return; nbCells=[]; saveNB(); renderNotebook(); });
  document.getElementById('nbExport').addEventListener('click', () => {
    let html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Notebook</title>';
    html += '<link rel="stylesheet" href="vendor/katex.min.css">';
    html += '<script defer src="vendor/katex.min.js"><\/script>';
    html += '<script defer src="vendor/auto-render.min.js" onload="renderMathInElement(document.body,{delimiters:[{left:\'$$\',right:\'$$\',display:true},{left:\'$\',right:\'$\',display:false}]})"><\/script>';
    html += '</head><body style="font-family:system-ui;max-width:820px;margin:24px auto;padding:16px;line-height:1.65;">';
    nbCells.forEach(c => {
      if (c.type==='md') html += '<div>'+(c.output||c.source||'')+'</div>';
      else html += '<div style="background:#f5f7fb;border-radius:8px;padding:12px;margin:8px 0;"><code>'+(c.source||'')+'</code><br><br>'+(c.output||'')+'</div>';
    });
    html += '</body></html>';
    gc.download('notebook.html', html, 'text/html');
  });
  document.querySelector('nav.tabs button[data-tab="notebook"]').addEventListener('click', renderNotebook);
  renderNotebook();
});
Object.assign(window, { renderNotebook, runCell });