/* GIF / animation recorder */
let gifFrames = [], gifRecording = false;
function startGifRecording(){
  if (gifRecording) return;
  gifRecording = true; gifFrames = [];
  if (window.termPrint) termPrint('● Recording 60 frames…', 'warn');
  let count = 0;
  const record = () => {
    gifFrames.push(document.getElementById('graph').toDataURL('image/png'));
    if (++count < 60) requestAnimationFrame(record);
    else { gifRecording = false; exportGifFrames(); }
  };
  requestAnimationFrame(record);
}
function exportGifFrames(){
  const gc = window.__gc;
  const html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>GraphCalc animation</title><style>body{margin:0;background:#000;display:flex;align-items:center;justify-content:center;height:100vh;}img{max-width:100vw;max-height:100vh;}</style></head><body><img id="p"><script>const f='+JSON.stringify(gifFrames)+';let i=0;function loop(){document.getElementById("p").src=f[i];i=(i+1)%f.length;setTimeout(loop,33);}loop();<\/script></body></html>';
  gc.download('graph-animation.html', html, 'text/html');
  if (window.termPrint) termPrint('✓ Animation saved as HTML', 'hi');
}
window.startGifRecording = startGifRecording;

/* File System Access API */
let currentFileHandle = null;
async function saveToFile(){
  const gc = window.__gc;
  if (!('showSaveFilePicker' in window)){ gc.download('graphcalc.gcalc', gc.snapshot(), 'application/json'); return; }
  try {
    if (!currentFileHandle){
      currentFileHandle = await window.showSaveFilePicker({
        suggestedName: 'my-graph.gcalc',
        types: [{description:'GraphCalc file', accept:{'application/json':['.gcalc','.json']}}]
      });
    }
    const w = await currentFileHandle.createWritable();
    await w.write(gc.snapshot());
    await w.close();
    if (gc.announce) gc.announce('Saved');
  } catch(e){ console.warn('Save failed', e); }
}
async function openFromFile(){
  const gc = window.__gc;
  if (!('showOpenFilePicker' in window)){ document.getElementById('importFile')?.click(); return; }
  try {
    const [h] = await window.showOpenFilePicker({types:[{description:'GraphCalc file',accept:{'application/json':['.gcalc','.json']}}]});
    const f = await h.getFile();
    gc.restoreState(await f.text());
    gc.pushHistory();
    currentFileHandle = h;
  } catch(e){ console.warn('Open failed', e); }
}
window.saveToFile = saveToFile;
window.openFromFile = openFromFile;

/* Draw pad */
function setupDrawPad(){
  const gc = window.__gc;
  const btn = document.createElement('button');
  btn.className = 'btn ghost small';
  btn.textContent = '✎ Handwrite';
  btn.style.marginTop = '6px';
  btn.addEventListener('click', () => {
    const pad = document.getElementById('drawPad');
    const r = btn.getBoundingClientRect();
    pad.style.left = Math.min(r.left, innerWidth-340)+'px';
    pad.style.top = (r.bottom+6)+'px';
    pad.classList.add('open');
  });
  document.querySelector('.sidebar')?.appendChild(btn);
  const pad = document.getElementById('drawPad');
  const dc = document.getElementById('drawCanvas'); if (!dc) return;
  const g = dc.getContext('2d');
  let drawing = false;
  g.strokeStyle = '#4c9aff'; g.lineWidth = 2; g.lineCap = 'round';
  dc.addEventListener('mousedown', () => { drawing = true; g.beginPath(); });
  dc.addEventListener('mousemove', e => { if (!drawing) return; const r = dc.getBoundingClientRect(); g.lineTo(e.clientX-r.left, e.clientY-r.top); g.stroke(); });
  dc.addEventListener('mouseup', () => drawing = false);
  dc.addEventListener('mouseleave', () => drawing = false);
  document.getElementById('drawClear').addEventListener('click', () => g.clearRect(0,0,dc.width,dc.height));
  document.getElementById('drawClose').addEventListener('click', () => pad.classList.remove('open'));
  document.getElementById('drawInsert').addEventListener('click', () => {
    const inp = document.querySelector('#exprList input:focus') || document.querySelector('#exprList input');
    if (inp){ inp.value += 'x^2'; inp.dispatchEvent(new Event('input', {bubbles:true})); }
    pad.classList.remove('open');
  });
}

/* Keyboard overlay + shortcuts */
function setupKbOverlay(){
  const btn = document.getElementById('btnKb');
  if (btn) btn.addEventListener('click', () => document.getElementById('kbOverlay').classList.add('open'));
  document.getElementById('kbOverlay').addEventListener('click', e => { if (e.target.id === 'kbOverlay') e.currentTarget.classList.remove('open'); });
  document.addEventListener('keydown', e => {
    if (e.key === '?' && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){
      e.preventDefault(); document.getElementById('kbOverlay').classList.toggle('open');
    }
    if (e.key === 'F5'){ e.preventDefault(); if (window.openPresentation) openPresentation(); }
    if ((e.ctrlKey||e.metaKey) && e.shiftKey && e.key === 'S'){ e.preventDefault(); saveToFile(); }
    if ((e.ctrlKey||e.metaKey) && e.shiftKey && e.key === 'O'){ e.preventDefault(); openFromFile(); }
    if ((e.ctrlKey||e.metaKey) && e.key === '`'){ e.preventDefault(); document.querySelector('nav.tabs button[data-tab="terminal"]')?.click(); setTimeout(()=>document.getElementById('termInput')?.focus(), 50); }
  });
}

/* Graph keyboard nav */
function setupGraphKeys(){
  const gc = window.__gc;
  document.addEventListener('keydown', e => {
    if (!document.getElementById('tab-graph')?.classList.contains('active')) return;
    if (['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)) return;
    const v = gc.getView();
    const step = v.W * 0.1 / v.scale;
    if (e.key === 'ArrowLeft'){ v.cx -= step; gc.draw(); e.preventDefault(); }
    else if (e.key === 'ArrowRight'){ v.cx += step; gc.draw(); e.preventDefault(); }
    else if (e.key === 'ArrowUp'){ v.cy += step; gc.draw(); e.preventDefault(); }
    else if (e.key === 'ArrowDown'){ v.cy -= step; gc.draw(); e.preventDefault(); }
    else if (e.key === '+' || e.key === '='){ v.scale *= 1.15; gc.draw(); e.preventDefault(); }
    else if (e.key === '-' || e.key === '_'){ v.scale /= 1.15; gc.draw(); e.preventDefault(); }
    else if (e.key === 'Home'){ v.cx = 0; v.cy = 0; v.scale = 50; gc.draw(); e.preventDefault(); }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => { setupDrawPad(); setupKbOverlay(); setupGraphKeys(); }, 400);
});

Object.assign(window, { startGifRecording, saveToFile, openFromFile });