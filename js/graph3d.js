let running3d = false;
function render3D(){
  const gc = window.__gc;
  const c = document.getElementById('canvas3d'); if (!c) return;
  const W = c.clientWidth, H = c.clientHeight; if (!W||!H) return;
  c.width = W*devicePixelRatio; c.height = H*devicePixelRatio;
  const g = c.getContext('2d'); g.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
  g.fillStyle = '#0a0d13'; g.fillRect(0,0,W,H);
  const src = document.getElementById('threeDFn').value;
  const range = parseFloat(document.getElementById('threeDRange').value)||5;
  const res = Math.max(6, Math.min(80, parseInt(document.getElementById('threeDRes').value)||36));
  const mode = document.getElementById('threeDMode').value;
  let ast; try { ast = gc.parseExpression(gc.tokenize(src)); } catch(e){ g.fillStyle='#ff5c8a'; g.font='13px system-ui'; g.fillText('Parse error: '+e.message, 20, 30); return; }
  const f = (x,y) => { try { return gc.evaluate(ast,{x,y}); } catch(e){ return NaN; } };
  const t = performance.now()/4000;
  const yaw = t, pitch = 0.5 + 0.15*Math.sin(t*0.7);
  const cosY=Math.cos(yaw), sinY=Math.sin(yaw), cosP=Math.cos(pitch), sinP=Math.sin(pitch);
  const project = (x,y,z) => {
    const x1=x*cosY-y*sinY, y1=x*sinY+y*cosY, z1=z;
    const y2=y1*cosP-z1*sinP, z2=y1*sinP+z1*cosP;
    const fov=600, zCam=5;
    const sc = fov/(fov+z2+zCam*Math.max(range,1));
    return [W/2+x1*sc*40, H/2-y2*sc*40];
  };
  const step = (2*range)/res;
  const pts = []; let zMin=Infinity, zMax=-Infinity;
  for(let i=0;i<=res;i++){ const row=[];
    for(let j=0;j<=res;j++){ const x=-range+i*step, y=-range+j*step; const z=f(x,y); row.push({x,y,z:isFinite(z)?z:null}); if(isFinite(z)){ if(z<zMin) zMin=z; if(z>zMax) zMax=z; } }
    pts.push(row);
  }
  if (!isFinite(zMin)){ zMin=0; zMax=0; }
  const zR = Math.max(0.1, zMax-zMin);
  const norm = z => (z-zMin)/zR;
  const hue = z => 200 - 200*norm(z);
  g.lineWidth = 1;
  for(let i=0;i<=res;i++) for(let j=0;j<=res;j++){
    const p = pts[i][j]; if (p.z===null) continue;
    const [sx,sy] = project(p.x, p.y, norm(p.z)*1.5-0.75);
    if (mode==='dots'){ g.fillStyle = 'hsl('+hue(p.z)+',70%,60%)'; g.beginPath(); g.arc(sx,sy,1.5,0,Math.PI*2); g.fill(); }
    else if (i<res && j<res && pts[i+1][j].z!==null && pts[i][j+1].z!==null){
      const [sx2,sy2] = project(pts[i+1][j].x, pts[i+1][j].y, norm(pts[i+1][j].z)*1.5-0.75);
      const [sx3,sy3] = project(pts[i][j+1].x, pts[i][j+1].y, norm(pts[i][j+1].z)*1.5-0.75);
      if (mode==='surface'){ g.fillStyle = 'hsla('+hue((p.z+pts[i+1][j].z+pts[i][j+1].z)/3)+',65%,55%,0.7)'; g.beginPath(); g.moveTo(sx,sy); g.lineTo(sx2,sy2); g.lineTo(sx3,sy3); g.closePath(); g.fill(); }
      g.strokeStyle = 'hsla('+hue(p.z)+',70%,70%,0.4)';
      g.beginPath(); g.moveTo(sx,sy); g.lineTo(sx2,sy2); g.lineTo(sx3,sy3); g.stroke();
    }
  }
  g.fillStyle='#8b93a7'; g.font='11px ui-monospace, monospace';
  g.fillText('z ∈ ['+zMin.toFixed(3)+', '+zMax.toFixed(3)+']', 12, H-12);
}
function loop3D(){
  if (document.getElementById('tab-threeD').classList.contains('active')){ render3D(); requestAnimationFrame(loop3D); }
  else running3d = false;
}
document.addEventListener('DOMContentLoaded', () => {
  const tab = document.querySelector('nav.tabs button[data-tab="threeD"]'); if (!tab) return;
  tab.addEventListener('click', () => { if (!running3d){ running3d = true; requestAnimationFrame(loop3D); } });
  document.getElementById('threeDFn').addEventListener('input', render3D);
  document.getElementById('threeDRange').addEventListener('input', render3D);
  document.getElementById('threeDRes').addEventListener('input', render3D);
  document.getElementById('threeDMode').addEventListener('change', render3D);
});