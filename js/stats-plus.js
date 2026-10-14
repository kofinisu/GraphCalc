function normalPDF(x,mu,s){ const z=(x-mu)/s; return Math.exp(-0.5*z*z)/(s*Math.sqrt(2*Math.PI)); }
function erf(x){
  const s = x<0?-1:1; x=Math.abs(x);
  const a1=0.254829592,a2=-0.284496736,a3=1.421413741,a4=-1.453152027,a5=1.061405429,p=0.3275911;
  const t=1/(1+p*x);
  return s*(1-(((((a5*t+a4)*t)+a3)*t+a2)*t+a1)*t*Math.exp(-x*x));
}
function normalCDF(x,mu,s){ return 0.5*(1+erf((x-mu)/(s*Math.sqrt(2)))); }
function gammaLn(x){
  const cof=[76.18009172947146,-86.50532032941677,24.01409824083091,-1.231739572450155,0.1208650973866179e-2,-0.5395239384953e-5];
  let y=x,tmp=x+5.5; tmp-=(x+0.5)*Math.log(tmp); let ser=1.000000000190015;
  for(let j=0;j<6;j++){ y+=1; ser+=cof[j]/y; }
  return -tmp+Math.log(2.5066282746310005*ser/x);
}
function tPDF(t,df){ const c=gammaLn((df+1)/2)-gammaLn(df/2)-0.5*Math.log(df*Math.PI); return Math.exp(c)*Math.pow(1+t*t/df,-(df+1)/2); }
function tCDF(t,df){ const N=400; const h=(t-(-10))/N; let s=0; for(let i=0;i<=N;i++){ const x=-10+i*h; const w=(i===0||i===N)?1:(i%2===1?4:2); s+=w*tPDF(x,df); } return Math.max(0,Math.min(1,s*h/3)); }
function invTCDF(p,df){ let lo=-100,hi=100; for(let i=0;i<80;i++){ const m=(lo+hi)/2; if(tCDF(m,df)<p) lo=m; else hi=m; } return (lo+hi)/2; }

function fullLinReg(x,y){
  const n=x.length;
  const xm=x.reduce((a,b)=>a+b,0)/n, ym=y.reduce((a,b)=>a+b,0)/n;
  let sxx=0,sxy=0,syy=0;
  for(let i=0;i<n;i++){ const dx=x[i]-xm,dy=y[i]-ym; sxx+=dx*dx; sxy+=dx*dy; syy+=dy*dy; }
  const slope=sxy/sxx, intercept=ym-slope*xm;
  let ssRes=0; for(let i=0;i<n;i++){ const p=slope*x[i]+intercept; ssRes+=(y[i]-p)**2; }
  const dfRes=n-2, mse=dfRes>0?ssRes/dfRes:NaN;
  const seSlope=Math.sqrt(mse/sxx), seIntercept=Math.sqrt(mse*(1/n+xm*xm/sxx));
  const tSlope=slope/seSlope, tIntercept=intercept/seIntercept;
  const pSlope=dfRes>0?2*(1-tCDF(Math.abs(tSlope),dfRes)):NaN;
  const pIntercept=dfRes>0?2*(1-tCDF(Math.abs(tIntercept),dfRes)):NaN;
  const tCrit=dfRes>0?invTCDF(0.975,dfRes):NaN;
  const r2=sxx*syy!==0?(sxy*sxy)/(sxx*syy):0;
  const adjR2=dfRes>0?1-(1-r2)*(n-1)/dfRes:NaN;
  return {slope,intercept,seSlope,seIntercept,tSlope,tIntercept,pSlope,pIntercept,
    slopeCI:[slope-tCrit*seSlope,slope+tCrit*seSlope],
    interceptCI:[intercept-tCrit*seIntercept,intercept+tCrit*seIntercept],
    r2,adjR2,mse,dfRes,n};
}
function renderDistPanel(){
  const gc = window.__gc;
  const out = document.getElementById('st_out');
  if (!out || !gc) return;
  const raw = document.getElementById('st_data').value;
  const nums = raw.split(/[,\s]+/).map(s=>parseFloat(s)).filter(x=>isFinite(x));
  if (nums.length < 2) return;
  const mean = nums.reduce((a,b)=>a+b,0)/nums.length;
  const sd = Math.sqrt(nums.reduce((s,v)=>s+(v-mean)**2,0)/(nums.length-1));
  const sorted = nums.slice().sort((a,b)=>a-b);
  const q1=sorted[Math.floor(sorted.length*0.25)], q3=sorted[Math.floor(sorted.length*0.75)];
  const iqr=q3-q1;
  const outliers=nums.filter(v=>v<q1-1.5*iqr||v>q3+1.5*iqr);
  const row = (k,v,c) => '<div class="row"><span class="k">'+k+'</span><span class="v '+(c||'')+'">'+v+'</span></div>';
  let extra = row('z-range', `$\\bar{x} \\pm s = ${gc.fmt(mean-sd,4)}$ to $${gc.fmt(mean+sd,4)}$`);
  extra += outliers.length ? row('Outliers (IQR)', outliers.map(v=>gc.fmt(v,4)).join(', '), 'warn') : row('Outliers (IQR)','none','hi');
  if (nums.length > 2){ const se=sd/Math.sqrt(nums.length), tc=invTCDF(0.975,nums.length-1); extra += row('95% CI for μ', `$[${gc.fmt(mean-tc*se,4)}, ${gc.fmt(mean+tc*se,4)}]$`,'hi'); }
  const lv = gc.listVars();
  if (lv.x && Array.isArray(lv.x) && lv.x.length === nums.length){
    const r = fullLinReg(lv.x, nums);
    extra += '<div style="margin-top:8px;border-top:1px dashed #1f2633;padding-top:6px;font-size:11px;">';
    extra += '<b>Linear regression</b> y = ' + gc.fmt(r.slope,4) + 'x + ' + gc.fmt(r.intercept,4);
    extra += '<br>SE(slope) = ' + gc.fmt(r.seSlope,4) + '  t = ' + gc.fmt(r.tSlope,3) + '  p = ' + gc.fmt(r.pSlope,4);
    extra += '<br>95% CI slope: [' + gc.fmt(r.slopeCI[0],4) + ', ' + gc.fmt(r.slopeCI[1],4) + ']';
    extra += '<br>R² = ' + gc.fmt(r.r2,4) + '   adj R² = ' + gc.fmt(r.adjR2,4) + '</div>';
  }
  out.innerHTML += extra;
  if (gc.katexRender) gc.katexRender(out);
}
document.addEventListener('DOMContentLoaded', () => {
  const st = document.getElementById('st_data');
  if (st) st.addEventListener('input', () => setTimeout(renderDistPanel, 120));
});
Object.assign(window, { normalPDF, normalCDF, tPDF, tCDF, invTCDF, fullLinReg, renderDistPanel });