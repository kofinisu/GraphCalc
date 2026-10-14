let presSlides = [];
let presIndex = 0;
const PRES_KEY = 'graphcalc_presentation_v1';
try { const r = localStorage.getItem(PRES_KEY); if (r) presSlides = JSON.parse(r); } catch(e){}
if (!presSlides.length) presSlides = [{title:'Welcome'}];
const savePres = () => { try { localStorage.setItem(PRES_KEY, JSON.stringify(presSlides)); } catch(e){} };

function showSlide(){
  const slide = presSlides[presIndex]; if (!slide) return;
  document.getElementById('presCounter').textContent = (presIndex+1)+' / '+presSlides.length;
  const c = document.getElementById('presentCanvas');
  const W = c.clientWidth, H = c.clientHeight;
  c.width = W*devicePixelRatio; c.height = H*devicePixelRatio;
  const g = c.getContext('2d');
  g.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
  g.fillStyle = '#0f1117'; g.fillRect(0,0,W,H);
  try { g.drawImage(document.getElementById('graph'), 0, 0, W, H); } catch(e){}
  g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(0,0,W,48);
  g.fillStyle = '#fff'; g.font = '600 18px system-ui'; g.textBaseline = 'middle';
  g.fillText(slide.title || '', 18, 24);
}
function openPresentation(){
  if (!presSlides.length) presSlides = [{title:'Slide 1'}];
  presIndex = 0;
  document.getElementById('presentMode').classList.add('open');
  showSlide();
}
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('btnPresent'); if (!btn) return;
  btn.addEventListener('click', openPresentation);
  document.getElementById('presExit').addEventListener('click', () => document.getElementById('presentMode').classList.remove('open'));
  document.getElementById('presNext').addEventListener('click', () => { if (presIndex < presSlides.length-1){ presIndex++; showSlide(); } });
  document.getElementById('presPrev').addEventListener('click', () => { if (presIndex > 0){ presIndex--; showSlide(); } });
  document.getElementById('presAdd').addEventListener('click', () => {
    const t = prompt('Slide title:', 'Slide '+(presSlides.length+1));
    if (t === null) return;
    presSlides.push({title:t||'Untitled'});
    savePres();
    presIndex = presSlides.length-1;
    showSlide();
  });
  document.addEventListener('keydown', e => {
    if (!document.getElementById('presentMode').classList.contains('open')) return;
    if (e.key === 'ArrowRight' || e.key === ' '){ e.preventDefault(); document.getElementById('presNext').click(); }
    else if (e.key === 'ArrowLeft'){ e.preventDefault(); document.getElementById('presPrev').click(); }
    else if (e.key === 'Escape'){ document.getElementById('presentMode').classList.remove('open'); }
  });
});
Object.assign(window, { openPresentation });