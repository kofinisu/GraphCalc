function casSteps(kind, src, opts){
  opts = opts||{};
  const steps = [];
  const gc = window.__gc;

  if (kind === 'derivative'){
    if (window.algebriteReady){
      try {
        steps.push({title:'Original', body:src});
        const terms = src.split(/(?=[+-])/).map(s=>s.trim()).filter(s=>s);
        if (terms.length > 1){
          terms.forEach((t,i) => steps.push({title:'Term '+(i+1), body:'d/dx['+t+'] = '+Algebrite.derivative(t,'x').toString()}));
          steps.push({title:'Combine', body:Algebrite.derivative(src,'x').toString()});
        } else steps.push({title:'Apply rule', body:Algebrite.derivative(src,'x').toString()});
        return {steps, result: Algebrite.derivative(src,'x').toString(), source:'algebrite'};
      } catch(e){}
    }
    try {
      const ast = gc.parseExpression(gc.tokenize(src));
      const d = gc.simplify(gc.symbolize(ast, 'x'));
      steps.push({title:'Parse', body:src});
      steps.push({title:'Differentiate', body:gc.astToString(d)});
      return {steps, result: gc.astToString(d), source:'internal'};
    } catch(e){ return {error:e.message}; }
  }

  if (kind === 'integral'){
    if (!window.algebriteReady) return {error:'Algebrite required'};
    try {
      const i = Algebrite.integral(src,'x').toString();
      const s = Algebrite.simplify(i).toString();
      steps.push({title:'∫ '+src+' dx'});
      steps.push({title:'Antiderivative', body:'= '+i});
      steps.push({title:'Simplified', body:'= '+s+' + C'});
      return {steps, result:s+' + C', source:'algebrite'};
    } catch(e){ return {error:e.message}; }
  }

  if (kind === 'solve'){
    const split = gc.splitComparison(src);
    if (!split) return {error:'Need an equation with ='};
    const v = opts.variable || 'x';
    const fL = gc.parseExpression(gc.tokenize(split.lhs));
    const fR = gc.parseExpression(gc.tokenize(split.rhs));
    const diff = x => gc.evaluate(fL,{[v]:x}) - gc.evaluate(fR,{[v]:x});
    const det = gc.detectDegree(diff);
    steps.push({title:'Original', body:split.lhs+' = '+split.rhs});
    if (!det) return {error:'Not a polynomial up to degree 5.'};
    steps.push({title:'Move to one side', body:gc.polyStr(det.coeffs,v)+' = 0'});
    const c = det.coeffs, d = det.degree;
    if (d===1){ steps.push({title:'Isolate', body:gc.fmt(c[1])+v+' = '+gc.fmt(-c[0])}); steps.push({title:'Divide', body:v+' = '+gc.frac(-c[0],c[1])}); return {steps, result:[-c[0]/c[1]], variable:v}; }
    if (d===2){
      const disc = c[1]*c[1]-4*c[2]*c[0];
      steps.push({title:'Identify', body:'a='+gc.fmt(c[2])+', b='+gc.fmt(c[1])+', c='+gc.fmt(c[0])});
      steps.push({title:'Discriminant', body:'Δ = '+gc.fmt(disc)});
      if (disc>=0){ const r1=(-c[1]+Math.sqrt(disc))/(2*c[2]), r2=(-c[1]-Math.sqrt(disc))/(2*c[2]); steps.push({title:'Quadratic', body:v+' = ('+gc.fmt(-c[1])+' ± √'+gc.fmt(disc)+') / '+gc.fmt(2*c[2])}); steps.push({title:'Solutions', body:v+' = '+gc.fmt(r1,8)+' or '+v+' = '+gc.fmt(r2,8)}); return {steps, result:[r1,r2], variable:v}; }
      const re=-c[1]/(2*c[2]), im=Math.sqrt(-disc)/(2*c[2]);
      steps.push({title:'Complex', body:v+' = '+gc.fmt(re)+' ± '+gc.fmt(im)+'i'});
      return {steps, result:[], complex:[re,im], variable:v};
    }
    const roots = gc.rootsOn(diff, -100, 100, 5000);
    const uniq = []; roots.forEach(r=>{ if(!uniq.some(q=>Math.abs(q-r)<1e-6)) uniq.push(r); });
    steps.push({title:'Numeric roots', body:uniq.map(r=>gc.fmt(r,8)).join(', ')});
    return {steps, result:uniq, variable:v};
  }

  if (kind === 'simplify'){
    if (!window.algebriteReady) return {error:'Algebrite required'};
    try { const s = Algebrite.simplify(src).toString(); return {steps:[{title:'Input',body:src},{title:'Simplified',body:s}], result:s, source:'algebrite'}; }
    catch(e){ return {error:e.message}; }
  }
  if (kind === 'factor'){
    const r = gc.factorFull(src);
    if (r.error) return {error:r.error};
    const steps = (r.steps||[]).map(s=>({title:'Step', body:s}));
    if (r.factStr) steps.push({title:'Factored', body:r.factStr});
    return {steps, result: r.factStr || r.fact || ''};
  }
  return {error:'Unknown operation'};
}
Object.assign(window, { casSteps });