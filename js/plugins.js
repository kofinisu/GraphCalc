const PLUGINS = {};
function loadPluginFromString(source, name){
  const gc = window.__gc;
  try {
    const fn = new Function('api', source);
    const api = {
      version: '1.0',
      registerCommand: cmd => { if (window.__gc && window.COMMANDS) COMMANDS.push(cmd); },
      addExpression: gc.addExpression,
      getScope: gc.getScope,
      evaluate: src => gc.evaluate(gc.parseExpression(gc.tokenize(src)), gc.getScope()),
      compile: gc.compile,
      parseExpression: gc.parseExpression,
      tokenize: gc.tokenize,
      showToast: msg => window.termPrint ? termPrint(msg,'hi') : alert(msg),
      addUnit: (n,d) => { if (window.UNITS) UNITS[n] = d; },
      addFunction: (n,f) => { /* user can extend FUNCS if exposed */ },
      graph: () => document.querySelector('nav.tabs button[data-tab="graph"]').click(),
      setExpression: (i,src) => { const ex = gc.expressions(); if (ex[i]){ ex[i].src = src; gc.analyze(ex[i]); gc.renderExprList(); gc.draw(); } }
    };
    fn(api);
    PLUGINS[name] = true;
    if (window.termPrint) termPrint('✓ Loaded plugin: '+name, 'hi');
  } catch(e){
    if (window.termPrint) termPrint('✗ Plugin failed: '+e.message, 'err');
    console.warn(e);
  }
}
function loadPluginFromURL(url){
  fetch(url).then(r=>r.text()).then(src=>loadPluginFromString(src, url.split('/').pop())).catch(e=>termPrint('✗ '+e.message,'err'));
}
Object.assign(window, { PLUGINS, loadPluginFromString, loadPluginFromURL });